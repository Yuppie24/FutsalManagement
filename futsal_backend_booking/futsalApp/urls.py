from django.urls import path
from .views import (
    RegisterOAuthView, RegisterBasicAuthView, VerifyEmailView, ResendOTPView,
    LoginView, FetchMeView, RefreshTokenView, UpdateProfileView, RemoveAvatarView,
    ChangePasswordView, RequestPasswordResetView, VerifyPasswordResetView,
    ResetPasswordView, LogoutView
)

urlpatterns = [
    path('register/', RegisterOAuthView.as_view(), name='register_oauth'),
    path('signup/', RegisterBasicAuthView.as_view(), name='signup'),
    path('verify-email/', VerifyEmailView.as_view(), name='verify_email'),
    path('resend-otp/', ResendOTPView.as_view(), name='resend_otp'),
    path('login/', LoginView.as_view(), name='login'),
    path('me/', FetchMeView.as_view(), name='fetch_me'),
    path('refresh-token/', RefreshTokenView.as_view(), name='refresh_token'),
    path('update/', UpdateProfileView.as_view(), name='update_profile'),
    path('avatar/', RemoveAvatarView.as_view(), name='remove_avatar'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('forgot-password/', RequestPasswordResetView.as_view(), name='request_password_reset'),
    path('verify-password-reset/', VerifyPasswordResetView.as_view(), name='verify_password_reset'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset_password'),
    path('logout/', LogoutView.as_view(), name='logout'),
]