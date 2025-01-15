"""
URL configuration for futsalBooking project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from futsalApp import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('futsalApp.urls')),
    path('api/facilities/', views.FacilityListCreateView.as_view(), name='facility-list'),
    path('api/facilities/images/', views.FacilityImageListView.as_view(), name='facility-image-list'),
    path('api/facilities/reviews/', views.ReviewListView.as_view(), name='facility-review-list'),
    path('api/facilities/<int:pk>/reviews/', views.ReviewCreateView.as_view(), name='facility-review-create'),
    path('api/facilities/<int:pk>/reviews/retrieve/', views.FacilityReviewListView.as_view(), name='facility-review-retrieve'),
    path('api/facilities/images/<int:pk>/', views.FacilityImageDeleteView.as_view(), name='facility-image-delete'),
    path('api/facilities/<int:pk>/', views.FacilityDetailView.as_view(), name='facility-detail'),
    path('api/facilities/<int:pk>/images/', views.FacilityImageCreateView.as_view(), name='facility-image-create'),
    path('api/facilities/<int:id>/features/', views.update_facility_features, name='update_facility_features'),
    path('api/time-slots/', views.TimeSlotListCreateView.as_view(), name='time-slot-list'),
    path('api/time-slots/<int:pk>/', views.TimeSlotDetailView.as_view(), name='time-slot-detail'),
    path('api/amenities/', views.AmenityListCreateView.as_view(), name='amenity-list'),
    path('api/amenities/<int:pk>/', views.AmenityDetailView.as_view(), name='amenity-detail'),
    path('api/business-info/', views.BusinessInfoListCreateView.as_view(), name='business-info-list'),
    path('api/business-info/<int:pk>/', views.BusinessInfoDetailView.as_view(), name='business-info-detail'),
    path('api/users/<int:pk>/', views.FetchUserView.as_view(), name='user-detail'),
    path('api/bookings/', views.BookingListView.as_view(), name='booking_list'),
    path('api/bookings/<int:booking_id>/', views.BookingDetailViewSingle.as_view(), name='booking-single-detail'),
    path('api/bookings/<int:booking_id>/initiate-payment/', views.InitiatePaymentView.as_view(), name='initiate_payment'),
    path('api/bookings/esewa/success/', views.EsewaSuccessView.as_view(), name='esewa_success'),
    path('api/bookings/esewa/failure/', views.EsewaFailureView.as_view(), name='esewa_failure'),
    path('api/bookings/<int:booking_id>/update-status/', views.UpdateBookingStatusView.as_view(), name='update_booking_status'),
    path('api/bookings/my/', views.MyBookingListView.as_view(), name='my_booking_list'),
    path('api/bookings/my/<int:booking_id>/', views.BookingDetailView.as_view(), name='booking_detail'),
    path('api/dashboard/', views.DashboardView.as_view(), name='dashboard'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)