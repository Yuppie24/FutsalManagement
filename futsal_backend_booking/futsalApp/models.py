from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
import uuid
import bcrypt
from django.conf import settings
from cryptography.fernet import Fernet
from django.contrib.postgres.fields import ArrayField

# Custom User Manager
class UserManager(BaseUserManager):
    def create_user(self, email, name, role='USER', password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, name=name, role=role, **extra_fields)
        if password:
            user.set_password(password)  # Handles password hashing
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_email_verified', True)
        extra_fields.setdefault('role', 'OWNER')  # Superusers are typically OWNERS
        return self.create_user(email, name, password=password, **extra_fields)

# Custom User Model
class User(AbstractBaseUser, PermissionsMixin):
    # Role choices (enum-like behavior)
    ROLE_CHOICES = (
        ('OWNER', 'Owner'),
        ('USER', 'User'),
    )

    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True, db_index=True)
    phone = models.CharField(max_length=15, blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    is_email_verified = models.BooleanField(default=False)
    is_phone_verified = models.BooleanField(default=False)
    password = models.CharField(max_length=128, blank=True, null=True)  # Only for basic auth users
    auth_type = models.CharField(
        max_length=10, choices=[('basic', 'Basic'), ('oauth', 'OAuth')], default='basic'
    )
    role = models.CharField(
        max_length=10, choices=ROLE_CHOICES, default='USER'
    )  # New role field
    login_attempts = models.IntegerField(default=0)
    lock_until = models.DateTimeField(blank=True, null=True)
    disabled_by_admin = models.BooleanField(default=False)
    disabled_on = models.DateTimeField(blank=True, null=True)
    last_password_change = models.DateTimeField(blank=True, null=True)
    last_password_reset_request = models.DateTimeField(blank=True, null=True)
    last_password_reset = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name', 'role']  # Add role to required fields for superuser creation

    # Fix reverse accessor clashes
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='futsal_users',
        blank=True,
        help_text='The groups this user belongs to.'
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='futsal_users',
        blank=True,
        help_text='Specific permissions for this user.'
    )

    def __str__(self):
        return self.email

    def set_password(self, raw_password):
        if raw_password:
            salt = bcrypt.gensalt(12)
            self.password = bcrypt.hashpw(raw_password.encode('utf-8'), salt).decode('utf-8')

    def check_password(self, raw_password):
        if not self.password:
            return False
        return bcrypt.checkpw(raw_password.encode('utf-8'), self.password.encode('utf-8'))

    class Meta:
        db_table = 'users'

# OAuth Provider Model
class OAuthProvider(models.Model):
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='oauth_providers')
    provider = models.CharField(max_length=50)
    access_token = models.TextField()
    refresh_token = models.TextField(blank=True, null=True)
    expiry_date = models.DateTimeField(blank=True, null=True)
    scope = models.TextField(blank=True, null=True)
    id_token = models.TextField(blank=True, null=True)
    token_type = models.CharField(max_length=50, blank=True, null=True)
    email = models.EmailField()

    def __str__(self):
        return f"{self.provider} - {self.email}"

    def encrypt_token(self, token):
        if not token:
            return None
        cipher_suite = Fernet(settings.ENCRYPTION_KEY)
        return cipher_suite.encrypt(token.encode()).decode()

    def decrypt_token(self, encrypted_token):
        if not encrypted_token:
            return None
        cipher_suite = Fernet(settings.ENCRYPTION_KEY)
        return cipher_suite.decrypt(encrypted_token.encode()).decode()

    def save(self, *args, **kwargs):
        if self.access_token:
            self.access_token = self.encrypt_token(self.access_token)
        if self.refresh_token:
            self.refresh_token = self.encrypt_token(self.refresh_token)
        if self.id_token:
            self.id_token = self.encrypt_token(self.id_token)
        super().save(*args, **kwargs)

# Login Device Model
class LoginDevice(models.Model):
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='login_devices')
    device_id = models.UUIDField(default=uuid.uuid4, editable=False)
    device_name = models.CharField(max_length=100)
    location = models.CharField(max_length=100, blank=True, null=True)
    last_login_at = models.DateTimeField(default=timezone.now)
    hashed_rt = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.device_name} - {self.location}"

# Email Verification Token Model
class EmailVerificationToken(models.Model):
    email = models.EmailField(unique=True)
    token = models.CharField(max_length=255)
    expires_at = models.DateTimeField()

    def __str__(self):
        return self.email

# Password Reset Token Model
class PasswordResetToken(models.Model):
    email = models.EmailField(unique=True)
    token = models.CharField(max_length=255)
    expires_at = models.DateTimeField()
    is_verified = models.BooleanField(default=False)

    def __str__(self):
        return self.email

# Facility Model
class Facility(models.Model):
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=20, choices=[('Indoor', 'Indoor'), ('Outdoor', 'Outdoor'), ('Covered Outdoor', 'Covered Outdoor')], default='Indoor')
    surface = models.CharField(max_length=50)
    size = models.CharField(max_length=20)
    capacity = models.PositiveIntegerField()
    status = models.CharField(max_length=20, choices=[('active', 'Active'), ('maintenance', 'Maintenance'), ('inactive', 'Inactive')], default='active')
    features = ArrayField(models.CharField(max_length=50), default=list, blank=True)
    thumbnail = models.ImageField(upload_to='facility-thumbnail/', null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='facilities')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Review(models.Model):
    facility = models.ForeignKey('Facility', on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews')
    rating = models.PositiveIntegerField()
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.facility.name} - {self.user.email}"
    
class FacilityImage(models.Model):
    facility = models.ForeignKey('Facility', on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='facility-images/', blank=True)

    def __str__(self):
        return f"{self.facility.name} - {self.image.name}"

# TimeSlot Model
class TimeSlot(models.Model):
    field = models.ForeignKey(Facility, on_delete=models.CASCADE, related_name='time_slots')
    day = models.CharField(max_length=20, choices=[('Weekdays', 'Weekdays'), ('Weekends', 'Weekends'), ('Holidays', 'Holidays')], default='Weekdays')
    start_time = models.TimeField()
    end_time = models.TimeField()
    price = models.DecimalField(max_digits=6, decimal_places=2)
    discounted_price = models.DecimalField(max_digits=6, decimal_places=2)
    status = models.CharField(max_length=20, choices=[('available', 'Available'), ('unavailable', 'Unavailable')], default='available')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='time_slots')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.field.name} - {self.start_time} to {self.end_time}"

# Amenity Model
class Amenity(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    status = models.BooleanField(default=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='amenities')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

# BusinessInfo Model
class BusinessInfo(models.Model):
    name = models.CharField(max_length=100)
    address = models.TextField()
    phone = models.CharField(max_length=15)
    email = models.EmailField()
    website = models.URLField(blank=True, null=True)
    opening_time = models.TimeField()
    closing_time = models.TimeField()
    description = models.TextField()
    booking_notice = models.CharField(max_length=20, choices=[('1 hour', '1 hour'), ('2 hours', '2 hours'), ('4 hours', '4 hours'), ('12 hours', '12 hours'), ('24 hours', '24 hours'), ('48 hours', '48 hours')], default='2 hours')
    cancellation_policy = models.TextField()
    payment_options = models.JSONField(default=list)  # Store as JSON array
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='business_info')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Booking(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('canceled', 'Canceled'),
    )

    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    facility = models.ForeignKey(Facility, on_delete=models.CASCADE, related_name='bookings')
    slot = models.ForeignKey(TimeSlot, on_delete=models.CASCADE, related_name='bookings',blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=15,blank=True, null=True)
    date = models.DateField(blank=True, null=True)
    time = models.CharField(max_length=50)  # e.g., "18:00 - 19:00"
    price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Booking {self.id} - {self.customer.username} at {self.facility.name}"

class Payment(models.Model):
    PAYMENT_STATUS_CHOICES = (
        ('Pending Payment', 'Pending Payment'),
        ('Fully Paid', 'Fully Paid'),
        ('Partially Paid', 'Partially Paid'),
        ('Refunded', 'Refunded'),
    )

    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='payment')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    service_charge = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    delivery_charge = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_uuid = models.CharField(max_length=50, unique=True)
    payment_status = models.CharField(max_length=50, choices=PAYMENT_STATUS_CHOICES, default='Pending Payment')
    transaction_code = models.CharField(max_length=50, null=True, blank=True)
    ref_id = models.CharField(max_length=50, null=True, blank=True)
    payment_type = models.CharField(max_length=20, choices=(('full', 'Full'), ('partial', 'Partial')), default='full')  # New field
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Payment for Booking {self.booking.id} - {self.payment_status}"