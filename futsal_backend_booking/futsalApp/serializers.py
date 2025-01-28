from rest_framework import serializers
from .models import User, Facility, TimeSlot, Amenity, BusinessInfo, FacilityImage, Review, Booking, Payment
import re
from django.core.exceptions import ValidationError
from .utils import generate_file_url 

class CreateUserSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['name', 'email', 'phone', 'password', 'confirm_password']
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def validate_name(self, value):
        if not value or len(value) < 4 or len(value) > 100:
            raise serializers.ValidationError("Name must be between 4 and 100 characters")
        if not re.match(r'^[A-Za-z ]+$', value):
            raise serializers.ValidationError("Name can only contain letters and spaces")
        return value

    def validate_email(self, value):
        if not value or not re.match(r'^[\w\.-]+@[\w\.-]+\.\w+$', value):
            raise serializers.ValidationError("Invalid email address")
        return value

    def validate_phone(self, value):
        if not value or not re.match(r'^\+?\d{8,15}$', value):
            raise serializers.ValidationError("Phone number must be 8-15 digits and can include a leading +")
        return value

    def validate_password(self, value):
        if not value or len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long")
        if not re.match(r'^(?=.*[0-9])(?=.*[A-Z])(?=.*[!@#$%^&*])', value):
            raise serializers.ValidationError(
                "Password must contain at least one digit, one uppercase letter, and one symbol"
            )
        return value
    
    def validate_role(self, value):
        valid_roles = [choice[0] for choice in User.ROLE_CHOICES]
        if value not in valid_roles:
            raise serializers.ValidationError(f"Role must be one of {valid_roles}")
        return value

    def validate(self, data):
        if data['password'].startswith(data['name']):
            raise serializers.ValidationError("Password cannot start with your username")
        if data['password'].endswith(data['name']):
            raise serializers.ValidationError("Password cannot end with your username")
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match")
        return data

class VerifyEmailSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField()

class ResendOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()

class SignInSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

class RefreshTokenSerializer(serializers.Serializer):
    refresh_token = serializers.CharField()

class UpdateProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['name', 'phone', 'avatar']

    def validate_name(self, value):
        if value and (len(value) < 4 or len(value) > 100):
            raise serializers.ValidationError("Name must be between 4 and 100 characters")
        if value and not re.match(r'^[A-Za-z ]+$', value):
            raise serializers.ValidationError("Name can only contain letters and spaces")
        return value

    def validate_phone(self, value):
        if not value or not re.match(r'^\+?\d{8,15}$', value):
            raise serializers.ValidationError("Phone number must be 8-15 digits and can include a leading +")
        return value
    
    avatar = serializers.ImageField(required=False)

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField()
    new_password = serializers.CharField()
    confirm_password = serializers.CharField()

    def validate_new_password(self, value):
        if not value or len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long")
        if not re.match(r'^(?=.*[0-9])(?=.*[A-Z])(?=.*[!@#$%^&*])', value):
            raise serializers.ValidationError(
                "Password must contain at least one digit, one uppercase letter, and one symbol"
            )
        return value

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match")
        return data

class RequestPasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()

class VerifyPasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField()

class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    new_password = serializers.CharField()
    confirm_password = serializers.CharField()

    def validate_new_password(self, value):
        if not value or len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long")
        if not re.match(r'^(?=.*[0-9])(?=.*[A-Z])(?=.*[!@#$%^&*])', value):
            raise serializers.ValidationError(
                "Password must contain at least one digit, one uppercase letter, and one symbol"
            )
        return value

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match")
        return data
    
class UserSerializer(serializers.ModelSerializer):
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'phone', 'avatar', 'is_email_verified', 'is_phone_verified', 'role', 'is_active', 'is_staff', 'created_at', 'updated_at']
        read_only_fields = ['id', 'email', 'is_email_verified', 'is_phone_verified', 'role', 'is_active', 'is_staff', 'created_at', 'updated_at']

    def get_avatar(self, obj):
        request = self.context.get('request')
        if request and obj.avatar:
            return generate_file_url(request, obj.avatar.name)
        return None
    
class FacilityImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = FacilityImage
        fields = '__all__'
 
class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = '__all__'
        read_only_fields = ['created_by', 'created_at', 'updated_at', 'facility', 'user']
        
class FacilitySerializer(serializers.ModelSerializer):
    images = FacilityImageSerializer(many=True, read_only=True)
    class Meta:
        model = Facility
        fields = '__all__'
        read_only_fields = ['created_by', 'created_at', 'updated_at']

class TimeSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeSlot
        fields = '__all__'
        read_only_fields = ['created_by', 'created_at', 'updated_at']

class AmenitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Amenity
        fields = '__all__'
        read_only_fields = ['created_by', 'created_at', 'updated_at']

class BusinessInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusinessInfo
        fields = '__all__'
        read_only_fields = ['created_by', 'created_at', 'updated_at']

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'amount', 'tax_amount', 'service_charge', 'delivery_charge', 'total_amount', 'transaction_uuid', 'payment_status', 'transaction_code', 'ref_id', 'payment_type', 'created_at', 'updated_at']

class BookingSerializer(serializers.ModelSerializer):
    facility = FacilitySerializer(read_only=True)
    customer = UserSerializer(read_only=True)
    slot = TimeSlotSerializer(read_only=True)
    payment = PaymentSerializer(read_only=True)

    class Meta:
        model = Booking
        fields = ['id', 'email', 'phone', 'slot', 'facility', 'customer', 'date', 'time', 'price', 'status', 'payment', 'created_at', 'updated_at']
        
    def get_customer_avatar(self, obj):
        request = self.context.get('request')
        if request and obj.customer.avatar:
            return generate_file_url(request, obj.customer.avatar.name)
        return None