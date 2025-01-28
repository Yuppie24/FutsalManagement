from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .serializers import (
    CreateUserSerializer, VerifyEmailSerializer, ResendOTPSerializer, SignInSerializer,
    RefreshTokenSerializer, UpdateProfileSerializer, ChangePasswordSerializer,
    RequestPasswordResetSerializer, VerifyPasswordResetSerializer, ResetPasswordSerializer,
    UserSerializer,
    FacilitySerializer, TimeSlotSerializer, AmenitySerializer, BusinessInfoSerializer,FacilityImageSerializer,ReviewSerializer,PaymentSerializer,BookingSerializer
)
from rest_framework.decorators import action
from .services import AuthService
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Facility, TimeSlot, Amenity, BusinessInfo, FacilityImage, Review, User, Booking, Payment
from rest_framework import generics, permissions
from .utils import get_response
import logging
import calendar
import json
import hmac
import hashlib
import base64
import uuid
import requests
from datetime import timedelta
from django.utils import timezone
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Sum, Avg, Q, Count
from rest_framework.decorators import api_view, permission_classes
from django.conf import settings
from django.http import HttpResponse
from django.urls import reverse

logger = logging.getLogger(__name__)

class RegisterOAuthView(APIView):
    def post(self, request):
        user = AuthService.register_oauth_user(request.data)
        return Response({
            'status': 'success',
            'message': 'User registered successfully',
            'data': {'user': {'name': user.name, 'email': user.email, 'providers': list(user.oauth_providers.values())}},
        }, status=status.HTTP_201_CREATED)

class RegisterBasicAuthView(APIView):
    def post(self, request):
        serializer = CreateUserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        AuthService.register_basic_auth_user(serializer.validated_data)
        return Response({
            'status': 'success',
            'message': 'Please verify your email. OTP has been sent to your email account.',
            'data': {},
        }, status=status.HTTP_201_CREATED)

class VerifyEmailView(APIView):
    def post(self, request):
        serializer = VerifyEmailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        AuthService.verify_email(serializer.validated_data)
        return Response({
            'status': 'success',
            'message': 'Email verified successfully, please proceed to login',
            'data': {},
        }, status=status.HTTP_200_OK)

class ResendOTPView(APIView):
    def post(self, request):
        serializer = ResendOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        AuthService.resend_otp(serializer.validated_data)
        return Response({
            'status': 'success',
            'message': 'OTP has been resent to your email account',
            'data': {},
        }, status=status.HTTP_200_OK)

class LoginView(APIView):
    def post(self, request):
        serializer = SignInSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        device_name = request.headers.get('Sec-Ch-Ua-Platform', 'Unknown')
        location = 'Unknown'  # Implement logic to get location if needed
        tokens = AuthService.login(serializer.validated_data, device_name, location)
        return Response({
            'status': 'success',
            'message': 'Login successful',
            'data': {
                'access_token': tokens['access_token'],
                'refresh_token': tokens['refresh_token'],
                'role': tokens['role']
            },
        }, status=status.HTTP_200_OK)

class FetchMeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user and request.user.is_authenticated:
            logger.info(f"Authenticated user: {request.user.email}")
        else:
            logger.info("User not authenticated")
        user = AuthService.fetch_me(request.user.id, request)
        return Response({
            'status': 'success',
            'message': 'User details fetched successfully',
            'data': {'user': UserSerializer(user, context={'request': request}).data},
        }, status=status.HTTP_200_OK)

class RefreshTokenView(APIView):
    def post(self, request):
        serializer = RefreshTokenSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        access_token, refresh_token = AuthService.refresh_token(serializer.validated_data['refresh_token'])
        return Response({
            'status': 'success',
            'message': 'Token refreshed successfully',
            'data': {'access_token': access_token, 'refresh_token': refresh_token},
        }, status=status.HTTP_200_OK)

class UpdateProfileView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def patch(self, request):
        serializer = UpdateProfileSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        file = request.FILES.get('avatar')
        user = AuthService.update_profile(request.user.id, serializer.validated_data, file, request)
        return Response({
            'status': 'success',
            'message': 'Profile updated successfully',
            'data': {'user': UserSerializer(user, context={'request': request}).data},
        }, status=status.HTTP_200_OK)

class RemoveAvatarView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        user = AuthService.remove_avatar(request.user.id)
        return Response({
            'status': 'success',
            'message': 'Avatar deleted successfully',
            'data': {'user': UserSerializer(user, context={'request': request}).data},
        }, status=status.HTTP_200_OK)

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        AuthService.change_password(request.user.id, serializer.validated_data)
        return Response({
            'status': 'success',
            'message': 'Password changed successfully, please login with new password',
            'data': {},
        }, status=status.HTTP_200_OK)

class RequestPasswordResetView(APIView):
    def post(self, request):
        serializer = RequestPasswordResetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        AuthService.request_password_reset(serializer.validated_data)
        return Response({
            'status': 'success',
            'message': 'Password reset OTP sent successfully',
            'data': {},
        }, status=status.HTTP_200_OK)

class VerifyPasswordResetView(APIView):
    def post(self, request):
        serializer = VerifyPasswordResetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        AuthService.verify_reset_otp(serializer.validated_data)
        return Response({
            'status': 'success',
            'message': 'OTP verified successfully',
            'data': {},
        }, status=status.HTTP_200_OK)

class ResetPasswordView(APIView):
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        AuthService.reset_password(serializer.validated_data)
        return Response({
            'status': 'success',
            'message': 'Password reset successfully, please proceed to login',
            'data': {},
        }, status=status.HTTP_200_OK)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        AuthService.logout(request.user.id)
        return Response({
            'status': 'success',
            'message': 'Logout successful',
            'data': {},
        }, status=status.HTTP_200_OK)

class FetchUserView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return get_response("success", "User retrieved successfully", serializer.data)

# Facility Views
class FacilityListCreateView(generics.ListCreateAPIView):
    permission_classes = []
    queryset = Facility.objects.all()
    serializer_class = FacilitySerializer

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return get_response("success", "Facilities retrieved successfully", serializer.data)
    
    pagination_class = [permissions.IsAuthenticated]
    def create(self, request, *args, **kwargs):
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                thumbnail = request.FILES.get('thumbnail')
                images = request.FILES.getlist('images')
                self.perform_create(serializer)
                facility = serializer.instance
                if thumbnail:
                    facility.thumbnail = thumbnail
                facility.save()
                if images:
                    for image in images:
                        FacilityImage.objects.create(facility=facility, image=image)
                return get_response("success", "Facility created successfully", serializer.data, status.HTTP_201_CREATED)
            return get_response("error", "ValidationError", {"detail": serializer.errors}, status.HTTP_400_BAD_REQUEST)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
        
class ReviewCreateView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ReviewSerializer

    def create(self, request, *args, **kwargs):
        facility_id = kwargs.get('pk')
        try:
            facility = Facility.objects.get(id=facility_id)
        except Facility.DoesNotExist:
            return get_response("error", "Facility not found", {}, status.HTTP_404_NOT_FOUND)

        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save(facility=facility, user=request.user)
            return get_response("success", "Review created successfully", serializer.data, status.HTTP_201_CREATED)
        return get_response("error", "ValidationError", {"detail": serializer.errors}, status.HTTP_400_BAD_REQUEST)
    
class ReviewListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return get_response("success", "Reviews retrieved successfully", serializer.data)

class FacilityReviewListView(generics.ListAPIView):
    serializer_class = ReviewSerializer

    def get_queryset(self):
        facility_id = self.kwargs.get('pk')
        return Review.objects.filter(facility_id=facility_id)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return get_response("success", "Reviews retrieved successfully", serializer.data)

class FacilityDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Facility.objects.all()
    serializer_class = FacilitySerializer

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        facility_images = FacilityImage.objects.filter(facility=instance)
        images_serializer = FacilityImageSerializer(facility_images, many=True)
        data = serializer.data
        data['images'] = images_serializer.data
        return get_response("success", "Facility retrieved successfully", data)

    permission_classes = [permissions.IsAuthenticated]
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        thumbnail = request.FILES.get('thumbnail')
        if thumbnail:
            instance.thumbnail = thumbnail
            instance.save()
        if serializer.is_valid():
            self.perform_update(serializer)
            return get_response("success", "Facility updated successfully", serializer.data)
        return get_response("error", "ValidationError", {"detail": serializer.errors}, status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return get_response("success", "Facility deleted successfully", {}, status.HTTP_204_NO_CONTENT)

    def perform_update(self, serializer):
        serializer.save()

class FacilityImageListView(generics.ListAPIView):
    queryset = FacilityImage.objects.all()
    serializer_class = FacilityImageSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return get_response("success", "Facility images retrieved successfully", serializer.data)

class FacilityImageCreateView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = FacilityImageSerializer

    def create(self, request, *args, **kwargs):
        facility_id = kwargs.get('pk')
        try:
            facility = Facility.objects.get(id=facility_id)
        except Facility.DoesNotExist:
            return get_response("error", "Facility not found", {}, status.HTTP_404_NOT_FOUND)

        images = request.FILES.getlist('images')
        if not images:
            return get_response("error", "No images provided", {}, status.HTTP_400_BAD_REQUEST)

        for image in images:
            FacilityImage.objects.create(facility=facility, image=image)

        facility_images = FacilityImage.objects.filter(facility=facility)
        serializer = FacilityImageSerializer(facility_images, many=True)
        return get_response("success", "Images added successfully", serializer.data, status.HTTP_201_CREATED)
    
class FacilityImageDeleteView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = FacilityImage.objects.all()
    serializer_class = FacilityImageSerializer

    def delete(self, request, *args, **kwargs):
        try:
            image_id = kwargs.get('pk')
            image = FacilityImage.objects.get(id=image_id)
            image.delete()
            return get_response("success", "Image deleted successfully", {}, status.HTTP_204_NO_CONTENT)
        except FacilityImage.DoesNotExist:
            return get_response("error", "Image not found", {}, status.HTTP_404_NOT_FOUND)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_facility_features(request, id):
    try:
        # Retrieve the facility by ID
        facility = Facility.objects.get(id=id)
    except Facility.DoesNotExist:
        return Response(
            {'status': 'error', 'message': 'Facility not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    try:
        # Get the features from the request body
        data = request.data
        features = data.get('features', [])

        # Validate features (optional: ensure they are valid feature names)
        valid_features = [
            "goals", "scoreboard", "lights", "benches",
            "referee", "ac", "recording", "spectator"
        ]
        if not all(feature in valid_features for feature in features):
            return Response(
                {'status': 'error', 'message': 'Invalid feature name provided'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Update the features field
        facility.features = features
        facility.save()

        # Serialize and return the updated facility
        serializer = FacilitySerializer(facility)
        return Response(
            {'status': 'success', 'data': serializer.data},
            status=status.HTTP_200_OK
        )
    except Exception as e:
        return Response(
            {'status': 'error', 'message': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# TimeSlot Views
class TimeSlotListCreateView(generics.ListCreateAPIView):
    queryset = TimeSlot.objects.all()
    serializer_class = TimeSlotSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return get_response("success", "Time slots retrieved successfully", serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return get_response("success", "Time slot created successfully", serializer.data, status.HTTP_201_CREATED)
        return get_response("error", "ValidationError", {"detail": serializer.errors}, status.HTTP_400_BAD_REQUEST)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
        
class TimeSlotDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = TimeSlot.objects.all()
    serializer_class = TimeSlotSerializer

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return get_response("success", "Time slot retrieved successfully", serializer.data)

    permission_classes = [permissions.IsAuthenticated]
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            self.perform_update(serializer)
            return get_response("success", "Time slot updated successfully", serializer.data)
        return get_response("error", "ValidationError", {"detail": serializer.errors}, status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return get_response("success", "Time slot deleted successfully", {}, status.HTTP_204_NO_CONTENT)

    def perform_update(self, serializer):
        serializer.save()

# Amenity Views
class AmenityListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Amenity.objects.all()
    serializer_class = AmenitySerializer

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return get_response("success", "Amenities retrieved successfully", serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return get_response("success", "Amenity created successfully", serializer.data, status.HTTP_201_CREATED)
        return get_response("error", "ValidationError", {"detail": serializer.errors}, status.HTTP_400_BAD_REQUEST)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class AmenityDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Amenity.objects.all()
    serializer_class = AmenitySerializer

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return get_response("success", "Amenity retrieved successfully", serializer.data)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            self.perform_update(serializer)
            return get_response("success", "Amenity updated successfully", serializer.data)
        return get_response("error", "ValidationError", {"detail": serializer.errors}, status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return get_response("success", "Amenity deleted successfully", {}, status.HTTP_204_NO_CONTENT)

    def perform_update(self, serializer):
        serializer.save()

# BusinessInfo Views
class BusinessInfoListCreateView(generics.ListCreateAPIView):
    queryset = BusinessInfo.objects.all()
    serializer_class = BusinessInfoSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return get_response("success", "Business info retrieved successfully", serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return get_response("success", "Business info created successfully", serializer.data, status.HTTP_201_CREATED)
        return get_response("error", "ValidationError", {"detail": serializer.errors}, status.HTTP_400_BAD_REQUEST)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class BusinessInfoDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = BusinessInfo.objects.all()
    serializer_class = BusinessInfoSerializer

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return get_response("success", "Business info retrieved successfully", serializer.data)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            self.perform_update(serializer)
            return get_response("success", "Business info updated successfully", serializer.data)
        return get_response("error", "ValidationError", {"detail": serializer.errors}, status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return get_response("success", "Business info deleted successfully", {}, status.HTTP_204_NO_CONTENT)

    def perform_update(self, serializer):
        serializer.save()

class BookingListView(APIView):
    def get(self, request):
        bookings = Booking.objects.all()
        # Pass the request context to the serializer
        serializer = BookingSerializer(bookings, many=True, context={'request': request})
        return Response({"status": "success", "data": serializer.data}, status=status.HTTP_200_OK)

    def post(self, request):
        facility_id = request.data.get('facility_id')
        date = request.data.get('date')
        email = request.data.get('email')
        phone = request.data.get('phone')
        slot_id = request.data.get('slot_id')
        time = request.data.get('time')
        price = request.data.get('price')
        payment_type = request.data.get('payment_type', 'full')  # Default to full payment

        if not all([facility_id, date, time, price, email, phone, slot_id]):    
            return Response({"status": "error", "message": "All fields are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            facility = Facility.objects.get(id=facility_id)
        except Facility.DoesNotExist:
            return Response({"status": "error", "message": "Facility not found"}, status=status.HTTP_404_NOT_FOUND)
        
        try:
            slot = TimeSlot.objects.get(id=slot_id)
        except TimeSlot.DoesNotExist:
            return Response({"status": "error", "message": "Time slot not found"}, status=status.HTTP_404_NOT_FOUND)

        # Adjust price based on payment type
        price = float(price)
        if payment_type == 'partial':
            price = price * 0.25  # 25% for partial payment

        booking = Booking.objects.create(
            customer=request.user,
            facility=facility,
            slot=slot,
            email=email,
            phone=phone,
            date=date,
            time=time,
            price=price,
            status='pending'
        )

        # Create a payment record
        transaction_uuid = str(uuid.uuid4())
        total_amount = price  # For simplicity, no tax/service/delivery charges
        payment = Payment.objects.create(
            booking=booking,
            amount=price,
            tax_amount=0,
            service_charge=0,
            delivery_charge=0,
            total_amount=total_amount,
            transaction_uuid=transaction_uuid,
            payment_status='Pending Payment',
            payment_type=payment_type
        )

        serializer = BookingSerializer(booking)
        return Response({"status": "success", "data": serializer.data}, status=status.HTTP_201_CREATED)
    
class MyBookingListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        bookings = Booking.objects.filter(customer=request.user)
        serializer = BookingSerializer(bookings, many=True)
        return Response({"status": "success", "data": serializer.data}, status=status.HTTP_200_OK)

# Utility function to generate HMAC-SHA256 signature
def generate_signature(total_amount, transaction_uuid, product_code):
    try:
        # Ensure settings.ESEWA_SECRET_KEY is a string
        if not isinstance(settings.ESEWA_SECRET_KEY, str):
            raise ValueError("ESEWA_SECRET_KEY must be a string")

        message = f"total_amount={total_amount},transaction_uuid={transaction_uuid},product_code={product_code}"
        secret = settings.ESEWA_SECRET_KEY.encode('utf-8')
        hmac_sha256 = hmac.new(secret, message.encode('utf-8'), hashlib.sha256)
        digest = hmac_sha256.digest()
        signature = base64.b64encode(digest).decode('utf-8')
        return signature
    except Exception as e:
        raise ValueError(f"Failed to generate signature: {str(e)}")

class InitiatePaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, booking_id):
        try:
            # Fetch the booking and payment
            booking = Booking.objects.get(id=booking_id, customer=request.user)
            payment = booking.payment
        except Booking.DoesNotExist:
            return Response(
                {"status": "error", "message": "Booking not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Payment.DoesNotExist:
            return Response(
                {"status": "error", "message": "Payment record not found for this booking"},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            # Prepare data for eSewa
            total_amount = str(payment.total_amount)
            transaction_uuid = payment.transaction_uuid
            product_code = settings.ESEWA_PRODUCT_CODE

            # Generate HMAC-SHA256 signature
            signature = generate_signature(total_amount, transaction_uuid, product_code)

            # eSewa form data
            form_data = {
                "amount": str(payment.amount),
                "tax_amount": str(payment.tax_amount),
                "total_amount": total_amount,
                "transaction_uuid": transaction_uuid,
                "product_code": product_code,
                "product_service_charge": str(payment.service_charge),
                "product_delivery_charge": str(payment.delivery_charge),
                "success_url": "http://localhost:5173/success",  # Update to frontend success handler
                "failure_url": request.build_absolute_uri(reverse('esewa_failure')),
                "signed_field_names": "total_amount,transaction_uuid,product_code",
                "signature": signature,
            }

            return Response(
                {
                    "status": "success",
                    "message": "Payment initiation successful",
                    "data": form_data
                },
                status=status.HTTP_200_OK
            )
        except ValueError as e:
            return Response(
                {"status": "error", "message": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except Exception as e:
            return Response(
                {"status": "error", "message": f"Internal server error: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class BookingDetailView(APIView):
    def get(self, request, booking_id):
        try:
            booking = Booking.objects.get(id=booking_id, customer=request.user)
            serializer = BookingSerializer(booking)
            return Response(
                {"status": "success", "data": [serializer.data]},
                status=status.HTTP_200_OK
            )
        except ObjectDoesNotExist:
            return Response(
                {"status": "error", "message": "Booking not found"},
                status=status.HTTP_404_NOT_FOUND
            )
                       
# eSewa Success Callback
class EsewaSuccessView(APIView):
    def get(self, request):
        encoded_data = request.GET.get('data')
        if not encoded_data:
            return Response({"status": "error", "message": "No data provided"}, status=status.HTTP_400_BAD_REQUEST)

        # Decode the Base64 response
        try:
            decoded_data = base64.b64decode(encoded_data).decode('utf-8')
            response_data = json.loads(decoded_data)  # Use json.loads instead of eval for safety
        except (base64.binascii.Error, json.JSONDecodeError) as e:
            return Response({"status": "error", "message": f"Invalid data format: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        transaction_uuid = response_data.get('transaction_uuid')
        status_response = response_data.get('status')
        total_amount = response_data.get('total_amount')
        transaction_code = response_data.get('transaction_code')

        try:
            payment = Payment.objects.get(transaction_uuid=transaction_uuid)
            booking = payment.booking
            time_slot = booking.slot  # Get the associated TimeSlot
        except Payment.DoesNotExist:
            return Response({"status": "error", "message": "Payment not found"}, status=status.HTTP_404_NOT_FOUND)
        except Booking.DoesNotExist:
            return Response({"status": "error", "message": "Booking not found"}, status=status.HTTP_404_NOT_FOUND)
        except TimeSlot.DoesNotExist:
            return Response({"status": "error", "message": "Time slot not found"}, status=status.HTTP_404_NOT_FOUND)

        # Verify the signature
        signed_field_names = response_data.get('signed_field_names').split(',')
        # Construct the message for HMAC-SHA256
        message = ",".join([f"{field}={response_data[field]}" for field in signed_field_names])
        secret = settings.ESEWA_SECRET_KEY.encode('utf-8')
        hmac_sha256 = hmac.new(secret, message.encode('utf-8'), hashlib.sha256)
        digest = hmac_sha256.digest()
        computed_signature = base64.b64encode(digest).decode('utf-8')

        # Debugging: Log the message and signatures
        print("Message for HMAC:", message)
        print("Computed Signature:", computed_signature)
        print("Provided Signature:", response_data.get('signature'))

        if computed_signature != response_data.get('signature'):
            return Response({"status": "error", "message": "Invalid signature"}, status=status.HTTP_400_BAD_REQUEST)

        if status_response == "COMPLETE":
            # Update payment and booking status
            payment.payment_status = "Fully Paid"
            payment.transaction_code = transaction_code
            payment.save()

            booking.status = "confirmed"
            booking.save()

            # Update TimeSlot status to 'booked'
            time_slot.status = "booked"
            time_slot.save()

            # Verify payment status with eSewa
            status_check_url = (
                f"{settings.ESEWA_STATUS_CHECK_URL}"
                f"?product_code={settings.ESEWA_PRODUCT_CODE}"
                f"&total_amount={total_amount}"
                f"&transaction_uuid={transaction_uuid}"
            )
            try:
                response = requests.get(status_check_url)
                status_data = response.json()

                if status_data.get('status') == "COMPLETE":
                    payment.ref_id = status_data.get('ref_id')
                    payment.save()
                    # Prepare redirect URL with facilityId and slotId
                    redirect_url = f"{booking.facility.id}/{booking.slot.id}/{booking.id}"
                    return Response(
                        {
                            "status": "success",
                            "message": "Payment successful",
                            "redirect_url": redirect_url
                        },
                        status=status.HTTP_200_OK
                    )
                else:
                    payment.payment_status = "Pending Payment"
                    booking.status = "pending"
                    time_slot.status = "available"  # Revert TimeSlot status if verification fails
                    payment.save()
                    booking.save()
                    time_slot.save()
                    return Response({"status": "error", "message": "Payment verification failed"}, status=status.HTTP_400_BAD_REQUEST)
            except requests.RequestException as e:
                return Response({"status": "error", "message": f"Failed to verify payment status: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({"status": "error", "message": "Payment not completed"}, status=status.HTTP_400_BAD_REQUEST)
# eSewa Failure Callback
class EsewaFailureView(APIView):
    def get(self, request):
        encoded_data = request.GET.get('data')
        if not encoded_data:
            return Response({"status": "error", "message": "No data provided"}, status=status.HTTP_400_BAD_REQUEST)

        decoded_data = base64.b64decode(encoded_data).decode('utf-8')
        response_data = eval(decoded_data)  # Convert string to dict (use json.loads in production)

        transaction_uuid = response_data.get('transaction_uuid')
        status_response = response_data.get('status')

        try:
            payment = Payment.objects.get(transaction_uuid=transaction_uuid)
            booking = payment.booking
        except Payment.DoesNotExist:
            return Response({"status": "error", "message": "Payment not found"}, status=status.HTTP_404_NOT_FOUND)

        if status_response != "COMPLETE":
            payment.payment_status = "Pending Payment"
            booking.status = "pending"
            payment.save()
            booking.save()

        return Response({"status": "error", "message": "Payment failed or pending"}, status=status.HTTP_400_BAD_REQUEST)

# Update Booking Status
class UpdateBookingStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, booking_id):
        try:
            booking = Booking.objects.get(id=booking_id)
        except Booking.DoesNotExist:
            return Response({"status": "error", "message": "Booking not found"}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('status')
        if new_status not in dict(Booking.STATUS_CHOICES):
            return Response({"status": "error", "message": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST)

        booking.status = new_status
        if new_status == "canceled" and booking.payment.payment_status == "Fully Paid":
            booking.payment.payment_status = "Refunded"
            booking.payment.save()
        booking.save()

        serializer = BookingSerializer(booking)
        return Response({"status": "success", "data": serializer.data}, status=status.HTTP_200_OK)
 
class BookingDetailViewSingle(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, booking_id):
        try:
            booking = Booking.objects.get(id=booking_id, customer=request.user)
            serializer = BookingSerializer(booking)
            return Response(
                {"status": "success", "data": serializer.data},
                status=status.HTTP_200_OK
            )
        except Booking.DoesNotExist:
            return Response(
                {"status": "error", "message": "Booking not found or unauthorized"},
                status=status.HTTP_404_NOT_FOUND
            )  
    
class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get the authenticated user
        user = request.user

        # Determine the time period filter (default to last 30 days)
        period = request.query_params.get('period', '30days')
        if period == '7days':
            start_date = timezone.now() - timedelta(days=7)
        elif period == '90days':
            start_date = timezone.now() - timedelta(days=90)
        elif period == 'year':
            start_date = timezone.now().replace(month=1, day=1)
        else:  # Default to 30 days
            start_date = timezone.now() - timedelta(days=30)

        # Filter facilities created by the user
        facilities = Facility.objects.filter(created_by=user)

        # 1. Futsal Stats (Total Bookings, Revenue, Occupancy Rate, Customer Rating)
        bookings = Booking.objects.filter(
            facility__in=facilities,
            created_at__gte=start_date,
            status__in=['confirmed', 'completed']
        )

        # Total Bookings
        total_bookings = bookings.count()
        previous_bookings = Booking.objects.filter(
            facility__in=facilities,
            created_at__lt=start_date,
            created_at__gte=start_date - (timezone.now() - start_date),
            status__in=['confirmed', 'completed']
        ).count()
        booking_change = (
            ((total_bookings - previous_bookings) / previous_bookings * 100)
            if previous_bookings > 0 else 0
        )

        # Revenue
        revenue = bookings.aggregate(total_revenue=Sum('price'))['total_revenue'] or 0
        previous_revenue = Booking.objects.filter(
            facility__in=facilities,
            created_at__lt=start_date,
            created_at__gte=start_date - (timezone.now() - start_date),
            status__in=['confirmed', 'completed']
        ).aggregate(total_revenue=Sum('price'))['total_revenue'] or 0
        revenue_change = (
            ((revenue - previous_revenue) / previous_revenue * 100)
            if previous_revenue > 0 else 0
        )

        # Occupancy Rate
        time_slots = TimeSlot.objects.filter(field__in=facilities)
        total_slots = time_slots.count()
        booked_slots = time_slots.filter(status='booked').count()
        occupancy_rate = (booked_slots / total_slots * 100) if total_slots > 0 else 0
        previous_booked_slots = TimeSlot.objects.filter(
            field__in=facilities,
            updated_at__lt=start_date,
            updated_at__gte=start_date - (timezone.now() - start_date),
            status='booked'
        ).count()
        previous_occupancy = (previous_booked_slots / total_slots * 100) if total_slots > 0 else 0
        occupancy_change = occupancy_rate - previous_occupancy

        # Customer Rating
        reviews = Review.objects.filter(facility__in=facilities)
        average_rating = reviews.aggregate(avg_rating=Avg('rating'))['avg_rating'] or 0
        previous_reviews = Review.objects.filter(
            facility__in=facilities,
            created_at__lt=start_date,
            created_at__gte=start_date - (timezone.now() - start_date)
        )
        previous_rating = previous_reviews.aggregate(avg_rating=Avg('rating'))['avg_rating'] or 0
        rating_change = average_rating - previous_rating if previous_rating else 0

        futsal_stats = [
            {
                "title": "Total Bookings",
                "value": str(total_bookings),
                "change": f"{booking_change:+.1f}%" if booking_change != 0 else "0%",
                "trend": "up" if booking_change > 0 else "down" if booking_change < 0 else "neutral",
                "description": f"Last {period.replace('days', ' days') if 'days' in period else 'year'}",
            },
            {
                "title": "Revenue",
                "value": f"NRS {int(revenue)}",
                "change": f"{revenue_change:+.1f}%" if revenue_change != 0 else "0%",
                "trend": "up" if revenue_change > 0 else "down" if revenue_change < 0 else "neutral",
                "description": f"Last {period.replace('days', ' days') if 'days' in period else 'year'}",
            },
            {
                "title": "Occupancy Rate",
                "value": f"{occupancy_rate:.1f}%",
                "change": f"{occupancy_change:+.1f}%" if occupancy_change != 0 else "0%",
                "trend": "up" if occupancy_change > 0 else "down" if occupancy_change < 0 else "neutral",
                "description": "Fields utilization",
            },
            {
                "title": "Customer Rating",
                "value": f"{average_rating:.1f}",
                "change": f"{rating_change:+.1f}" if rating_change != 0 else "0",
                "trend": "up" if rating_change > 0 else "down" if rating_change < 0 else "neutral",
                "description": f"Based on {reviews.count()} reviews",
            },
        ]

        # 2. Weekly Bookings Pattern
        weekly_bookings_data = []
        days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        for i, day in enumerate(days):
            day_start = (timezone.now() - timedelta(days=(6 - i))).date()
            day_bookings = bookings.filter(date=day_start)
            morning_bookings = day_bookings.filter(
                Q(time__gte="06:00:00", time__lt="12:00:00")
            ).count()
            afternoon_bookings = day_bookings.filter(
                Q(time__gte="12:00:00", time__lt="18:00:00")
            ).count()
            evening_bookings = day_bookings.filter(
                Q(time__gte="18:00:00") | Q(time__lt="06:00:00")
            ).count()
            weekly_bookings_data.append({
                "name": day,
                "morningBookings": morning_bookings,
                "afternoonBookings": afternoon_bookings,
                "eveningBookings": evening_bookings,
            })

        # 3. Field Utilization
        field_utilization = []
        for facility in facilities:
            facility_bookings = bookings.filter(facility=facility)
            facility_slots = TimeSlot.objects.filter(field=facility)
            facility_booked_slots = facility_slots.filter(status='booked').count()
            facility_total_slots = facility_slots.count()
            field_occupancy = (facility_booked_slots / facility_total_slots * 100) if facility_total_slots > 0 else 0
            field_revenue = facility_bookings.aggregate(total=Sum('price'))['total'] or 0
            field_utilization.append({
                "name": facility.name,
                "bookings": facility_bookings.count(),
                "revenue": float(field_revenue),
                "occupancyRate": field_occupancy,
            })

        # 4. Upcoming Bookings (Next 48 hours)
        upcoming_bookings = Booking.objects.filter(
            facility__in=facilities,
            date__gte=timezone.now().date(),
            date__lte=(timezone.now() + timedelta(hours=48)).date(),
            status__in=['pending', 'confirmed']
        ).order_by('date', 'time')
        upcoming_bookings_data = []
        for booking in upcoming_bookings:
            date_str = "Today" if booking.date == timezone.now().date() else "Tomorrow"
            upcoming_bookings_data.append({
                "id": str(booking.id),
                "date": date_str,
                "time": booking.time,
                "field": booking.facility.name,
                "customer": booking.customer.name,
                "contact": booking.customer.name,
                "phone": booking.customer.phone,
                "status": booking.status.capitalize(),
                "payment": "Paid" if booking.payment.payment_status == "Fully Paid" else "Unpaid",
            })

        # 5. Customer Segmentation
        customer_groups = bookings.values('customer__name').annotate(
            total_bookings=Count('id')
        ).order_by('-total_bookings')
        total_customers = customer_groups.count()
        regular_teams = customer_groups.filter(total_bookings__gte=5).count()
        corporate_events = bookings.filter(customer__name__icontains='corporate').count()
        casual_players = customer_groups.filter(total_bookings__lt=5).exclude(customer__name__icontains='corporate').count()
        tournaments = bookings.filter(customer__name__icontains='tournament').count()

        customer_segmentation = [
            {"name": "Regular Teams", "value": (regular_teams / total_customers * 100) if total_customers > 0 else 0},
            {"name": "Corporate Events", "value": (corporate_events / total_bookings * 100) if total_bookings > 0 else 0},
            {"name": "Casual Players", "value": (casual_players / total_customers * 100) if total_customers > 0 else 0},
            {"name": "Tournaments", "value": (tournaments / total_bookings * 100) if total_bookings > 0 else 0},
        ]

        # 6. Monthly Trend
        monthly_trend = []
        if period == 'year':
            start_month = timezone.now().replace(day=1, month=1)
        else:
            start_month = (timezone.now() - timedelta(days=150)).replace(day=1)  # Approx 5 months
        current_month = timezone.now().replace(day=1)
        while start_month <= current_month:
            month_end = start_month.replace(day=calendar.monthrange(start_month.year, start_month.month)[1])
            month_bookings = bookings.filter(
                created_at__gte=start_month,
                created_at__lte=month_end
            )
            month_revenue = month_bookings.aggregate(total=Sum('price'))['total'] or 0
            monthly_trend.append({
                "month": start_month.strftime("%b"),
                "bookings": month_bookings.count(),
                "revenue": float(month_revenue),
            })
            start_month = (start_month + timedelta(days=32)).replace(day=1)

        # 7. Recent Reviews
        recent_reviews = Review.objects.filter(facility__in=facilities).order_by('-created_at')[:3]
        recent_reviews_data = [
            {
                "customer": review.user.name,
                "rating": review.rating,
                "comment": review.comment,
                "date": review.created_at.strftime("%b %d, %Y"),
            }
            for review in recent_reviews
        ]

        # 8. Repeat Customer Analytics
        regular_teams_count = regular_teams
        retention_rate = (regular_teams / total_customers * 100) if total_customers > 0 else 0
        avg_bookings_per_month = (
            customer_groups.aggregate(avg=Avg('total_bookings'))['avg'] or 0
        ) / 5  # Assuming 5 months of data

        repeat_customers = customer_groups[:3]  # Top 3 repeat customers
        repeat_customers_data = []
        for customer in repeat_customers:
            customer_name = customer['customer__name']
            customer_bookings = bookings.filter(customer__name=customer_name)
            total_bookings = customer['total_bookings']
            last_booking = customer_bookings.order_by('-date').first()
            favorite_field = customer_bookings.values('facility__name').annotate(
                count=Count('facility')
            ).order_by('-count').first()
            loyalty_status = "Platinum" if total_bookings >= 30 else "Gold" if total_bookings >= 15 else "Silver"
            repeat_customers_data.append({
                "customerGroup": customer_name,
                "totalBookings": total_bookings,
                "lastBooking": last_booking.date.strftime("%Y-%m-%d") if last_booking else "N/A",
                "favoriteField": favorite_field['facility__name'] if favorite_field else "N/A",
                "loyaltyStatus": loyalty_status,
            })

        return Response({
            "status": "success",
            "data": {
                "futsalStats": futsal_stats,
                "weeklyBookings": weekly_bookings_data,
                "fieldUtilization": field_utilization,
                "upcomingBookings": upcoming_bookings_data,
                "customerSegmentation": customer_segmentation,
                "monthlyTrend": monthly_trend,
                "recentReviews": recent_reviews_data,
                "repeatCustomerAnalytics": {
                    "regularTeams": regular_teams_count,
                    "retentionRate": retention_rate,
                    "avgBookingsPerMonth": avg_bookings_per_month,
                    "topCustomers": repeat_customers_data,
                }
            }
        }, status=status.HTTP_200_OK)