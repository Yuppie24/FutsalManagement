# futsalApp/services.py
from .models import User, EmailVerificationToken, OAuthProvider, LoginDevice, PasswordResetToken
from rest_framework.exceptions import ValidationError, AuthenticationFailed, PermissionDenied
from .exceptions import CustomAPIException
from rest_framework import status
from .utils import generate_otp, send_registration_mail, send_welcome_mail, send_new_device_detected_mail, send_password_changed_mail, send_password_reset_mail, generate_file_url, delete_file
import bcrypt
from django.utils import timezone
import uuid
import jwt
from django.conf import settings
from django.contrib.auth import authenticate
from knox.models import AuthToken

class AuthService:
    @staticmethod
    def check_existing_user(email, phone):
        if User.objects.filter(email=email).exists():
            raise ValidationError("User already exists with this email")
        if phone and User.objects.filter(phone=phone).exists():
            raise ValidationError("User already exists with this phone number")

    @staticmethod
    def register_oauth_user(data):
        email = data['email']
        user = User.objects.filter(email=email).first()
        provider_data = {
            'provider': data['provider'],
            'access_token': data['access_token'],
            'refresh_token': data.get('refresh_token'),
            'id_token': data.get('id_token'),
            'email': email,
            'expiry_date': data.get('expiry_date'),
            'scope': data.get('scope'),
            'token_type': data.get('token_type')
        }

        if user:
            existing_provider = OAuthProvider.objects.filter(user=user, provider=data['provider']).first()
            if existing_provider:
                for key, value in provider_data.items():
                    if value is not None:
                        setattr(existing_provider, key, value)
                existing_provider.save()
            else:
                OAuthProvider.objects.create(user=user, **provider_data)
        else:
            user = User.objects.create_user(
                email=email, 
                name=data['name'], 
                password=None, 
                auth_type='oauth',
                role=data.get('role', 'USER')
            )
            OAuthProvider.objects.create(user=user, **provider_data)
        return user

    @staticmethod
    def register_basic_auth_user(data):
        AuthService.check_existing_user(data['email'], data['phone'])
        user = User.objects.create_user(
            email=data['email'],
            name=data['name'],
            phone=data['phone'],
            password=data['password'],
            role=data.get('role', 'USER')
        )
        otp = generate_otp()
        salt = bcrypt.gensalt()
        hashed_otp = bcrypt.hashpw(otp.encode('utf-8'), salt).decode('utf-8')
        EmailVerificationToken.objects.update_or_create(
            email=data['email'],
            defaults={
                'token': hashed_otp,
                'expires_at': timezone.now() + timezone.timedelta(minutes=15)
            }
        )
        send_registration_mail(user.name, user.email, otp)
        return user

    @staticmethod
    def verify_email(data):
        email, otp = data['email'], data['otp']
        user = User.objects.filter(email=email).first()
        if not user:
            raise CustomAPIException("User does not exist with this email", status.HTTP_404_NOT_FOUND)
        if user.is_email_verified:
            raise CustomAPIException("Email already verified, you can proceed to login", status.HTTP_400_BAD_REQUEST)
        token = EmailVerificationToken.objects.filter(email=email).first()
        if not token:
            raise CustomAPIException("Token not found, please request a new one", status.HTTP_404_NOT_FOUND)
        if not bcrypt.checkpw(otp.encode('utf-8'), token.token.encode('utf-8')):
            raise CustomAPIException("Invalid OTP, please submit the correct OTP", status.HTTP_400_BAD_REQUEST)
        user.is_email_verified = True
        user.save()
        token.delete()
        send_welcome_mail(user.name, user.email)
        return user

    @staticmethod
    def resend_otp(data):
        email = data['email']
        user = User.objects.filter(email=email).first()
        if not user:
            raise CustomAPIException("User does not exist with this email", status.HTTP_404_NOT_FOUND)
        if user.is_email_verified:
            raise CustomAPIException("Email already verified, you can proceed to login", status.HTTP_400_BAD_REQUEST)
        if EmailVerificationToken.objects.filter(email=email).exists():
            raise CustomAPIException("Too many requests, try again later in 15 minutes", status.HTTP_429_TOO_MANY_REQUESTS)
        otp = generate_otp()
        salt = bcrypt.gensalt()
        hashed_otp = bcrypt.hashpw(otp.encode('utf-8'), salt).decode('utf-8')
        EmailVerificationToken.objects.create(
            email=email,
            token=hashed_otp,
            expires_at=timezone.now() + timezone.timedelta(minutes=15)
        )
        send_registration_mail(user.name, user.email, otp)
        return

    @staticmethod
    def login(data, device_name, location):
        email, password = data['email'], data['password']
        user = User.objects.filter(email=email).first()
        if not user:
            raise CustomAPIException("User does not exist with this email", status.HTTP_404_NOT_FOUND, error_code='USER_NOT_FOUND')
        if not user.is_email_verified:
            raise AuthenticationFailed("Email not verified, please verify your email to proceed")
        if user.disabled_by_admin:
            raise PermissionDenied("User account has been disabled by admin, please contact support")
        if user.lock_until and user.lock_until > timezone.now():
            raise PermissionDenied("User account is locked due to multiple failed login attempts, please try again later")
        else:
            user.lock_until = None
        authenticated_user = authenticate(email=email, password=password)
        if not authenticated_user:
            user.login_attempts += 1
            if user.login_attempts >= 5:
                user.lock_until = timezone.now() + timezone.timedelta(minutes=15)
            user.save()
            raise AuthenticationFailed("Invalid email or password")
        user.login_attempts = 0
        device_id = uuid.uuid4()

        # Create Knox tokens for both access and refresh
        knox_access_instance, access_token = AuthToken.objects.create(user, expiry=timezone.timedelta(days=7))
        knox_refresh_instance, refresh_token = AuthToken.objects.create(user, expiry=timezone.timedelta(days=7))

        # Store the device information
        is_new_device = not user.login_devices.filter(device_name__iexact=device_name, location__iexact=location).exists()
        user.login_devices.create(
            device_id=device_id,
            device_name=device_name,
            location=location,
            hashed_rt=refresh_token  # Store the Knox refresh token
        )
        if user.login_devices.count() > 5:
            user.login_devices.order_by('last_login_at').first().delete()
        user.save()
        if is_new_device:
            send_new_device_detected_mail(user.name, user.email, device_name, location, timezone.now(), f"http://localhost:8000/api/auth/reset-password?rt={refresh_token}")
        return {
        'access_token': access_token,
        'refresh_token': refresh_token,
        'role': user.role
    }

    @staticmethod
    def fetch_me(user_id, request):
        user = User.objects.filter(id=user_id).first()
        if not user:
            raise CustomAPIException("User not found", status.HTTP_404_NOT_FOUND, error_code='USER_NOT_FOUND')
        print("user avatar", user.avatar)
        return user

    @staticmethod
    def refresh_token(refresh_token):
        try:
            # Validate the refresh token using Knox (assuming refresh_token is a Knox token)
            refresh_token_instance = AuthToken.objects.get(token_key=refresh_token[:8])  # Get by token_key (first 8 chars)
            user = refresh_token_instance.user
            if refresh_token_instance.expiry < timezone.now():
                raise AuthenticationFailed("Refresh token has expired")
        # Generate a new access token
            knox_token_instance, new_access_token = AuthToken.objects.create(user, expiry=timezone.timedelta    (minutes=15))
            return new_access_token, refresh_token
        except AuthToken.DoesNotExist:
            raise AuthenticationFailed("Invalid refresh token")
   
    @staticmethod
    def update_profile(user_id, data, file, request):
        user = User.objects.filter(id=user_id).first()
        if not user:
            raise CustomAPIException("User not found", status.HTTP_404_NOT_FOUND)
        
        if file:
            if user.avatar:
                delete_file(user.avatar.name)  # Use .name for the relative path
            user.avatar = file  # Assign the uploaded file directly to the FileField
        
        for key, value in data.items():
            if value is not None:
                setattr(user, key, value)
        user.save()
        return user

    @staticmethod
    def remove_avatar(user_id):
        user = User.objects.filter(id=user_id).first()
        if not user:
            raise CustomAPIException("User not found", status.HTTP_404_NOT_FOUND)
        if not user.avatar:
            raise CustomAPIException("Avatar not found", status.HTTP_404_NOT_FOUND)
        delete_file(user.avatar.name)  # Use .name for the relative path
        user.avatar = None
        user.save()
        return user
   
    @staticmethod
    def change_password(user_id, data):
        user = User.objects.filter(id=user_id).first()
        if not user:
            raise CustomAPIException("User not found", status.HTTP_404_NOT_FOUND)
        if not user.check_password(data['old_password']):
            raise AuthenticationFailed("Invalid old password")
        if data['old_password'] == data['new_password']:
            raise ValidationError("New password cannot be the same as old password")
        user.set_password(data['new_password'])
        user.last_password_change = timezone.now()
        user.login_devices.all().delete()
        user.save()
        send_password_changed_mail(user.name, "http://localhost:8000/api/auth/login", user.email)
        return user

    @staticmethod
    def request_password_reset(data):
        email = data['email']
        user = User.objects.filter(email=email).first()
        if not user:
            raise CustomAPIException("User not found with this email", status.HTTP_404_NOT_FOUND)
        if not user.password:
            raise ValidationError("This user is OAuth user")
        if PasswordResetToken.objects.filter(email=email).exists():
            raise CustomAPIException("Too many requests, try again later in 15 minutes", status.HTTP_429_TOO_MANY_REQUESTS)
        otp = generate_otp()
        salt = bcrypt.gensalt()
        hashed_otp = bcrypt.hashpw(otp.encode('utf-8'), salt).decode('utf-8')
        PasswordResetToken.objects.create(
            email=email,
            token=hashed_otp,
            expires_at=timezone.now() + timezone.timedelta(minutes=15)
        )
        send_password_reset_mail(user.name, user.email, otp)
        user.last_password_reset_request = timezone.now()
        user.save()
        return

    @staticmethod
    def verify_reset_otp(data):
        email, otp = data['email'], data['otp']
        user = User.objects.filter(email=email).first()
        if not user:
            raise CustomAPIException("User not found with this email", status.HTTP_404_NOT_FOUND)
        token = PasswordResetToken.objects.filter(email=email).first()
        if not token:
            raise CustomAPIException("Token not found, please request a new one", status.HTTP_404_NOT_FOUND)
        if not bcrypt.checkpw(otp.encode('utf-8'), token.token.encode('utf-8')):
            raise CustomAPIException("Invalid OTP, please submit the correct OTP", status.HTTP_400_BAD_REQUEST)
        token.is_verified = True
        token.save()
        return

    @staticmethod
    def reset_password(data):
        email, new_password = data['email'], data['new_password']
        user = User.objects.filter(email=email).first()
        if not user:
            raise CustomAPIException("User not found with this email", status.HTTP_404_NOT_FOUND)
        token = PasswordResetToken.objects.filter(email=email).first()
        if not token:
            raise CustomAPIException("Token not found, please request a new one", status.HTTP_404_NOT_FOUND)
        if not token.is_verified:
            raise ValidationError("OTP not verified, please verify OTP first")
        if not user.password:
            raise ValidationError("This user is OAuth user")
        if user.check_password(new_password):
            raise ValidationError("New password cannot be the same as old password")
        user.set_password(new_password)
        user.last_password_reset = timezone.now()
        user.login_devices.all().delete()
        user.save()
        token.delete()
        send_password_changed_mail(user.name, "http://localhost:8000/api/auth/login", user.email)
        return

    @staticmethod
    def logout(user_id):
        user = User.objects.filter(id=user_id).first()
        if not user:
            raise CustomAPIException("User not found", status.HTTP_404_NOT_FOUND)
        user.login_devices.all().delete()
        return