import random
import string
from django.core.mail import send_mail
from django.conf import settings
from django.core.files.storage import default_storage
from rest_framework.response import Response

def generate_otp(length=6):
    return ''.join(random.choices(string.digits, k=length))

def send_registration_mail(name, email, otp):
    subject = 'Verify Your Email'
    message = f'Hi {name},\n\nYour OTP for email verification is {otp}. It is valid for 15 minutes.'
    send_mail(subject, message, settings.EMAIL_HOST_USER, [email])

def send_welcome_mail(name, email):
    subject = 'Welcome to Our Platform'
    message = f'Hi {name},\n\nWelcome to our platform! Your email has been verified.'
    send_mail(subject, message, settings.EMAIL_HOST_USER, [email])

def send_new_device_detected_mail(name, email, device_name, location, login_time, reset_link):
    subject = 'New Device Detected'
    message = f'Hi {name},\n\nA new device ({device_name}) was detected at {location} on {login_time}. If this was not you, please reset your password using this link: {reset_link}.'
    send_mail(subject, message, settings.EMAIL_HOST_USER, [email])

def send_password_changed_mail(name, login_link, email):
    subject = 'Password Changed'
    message = f'Hi {name},\n\nYour password has been changed. Please login using this link: {login_link}.'
    send_mail(subject, message, settings.EMAIL_HOST_USER, [email])

def send_password_reset_mail(name, email, otp):
    subject = 'Password Reset OTP'
    message = f'Hi {name},\n\nYour OTP for password reset is {otp}. It is valid for 15 minutes.'
    send_mail(subject, message, settings.EMAIL_HOST_USER, [email])

def generate_file_url(request, file_path):
    return request.build_absolute_uri(f'/media/{file_path}')

def delete_file(file_path):
    if default_storage.exists(file_path):
        default_storage.delete(file_path)

# futsalApp/utils.py
def get_response(status, message, data=None, status_code=None):
    response_data = {
        "status": status,
        "message": message,
        "data": data or {}
    }
    return Response(response_data, status=status_code or 200)