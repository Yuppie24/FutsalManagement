# futsalApp/exceptions.py
from rest_framework.views import exception_handler
from rest_framework.exceptions import APIException
from django.http import JsonResponse
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import status
from django.apps import AppConfig
from django.core.management import call_command
import logging

logger = logging.getLogger(__name__)

def custom_exception_handler(exc, context):
    """
    Custom exception handler to return consistent JSON error responses.
    """
    # Log the exception for debugging purposes
    logger.error(f"Exception occurred: {str(exc)}", exc_info=True)

    # Call DRF's default exception handler first to get the standard error response
    response = exception_handler(exc, context)

    # If DRF didn't handle the exception, create a custom response
    if response is None:
        # Handle Django-specific exceptions (e.g., 404, 500)
        if isinstance(exc, DjangoValidationError):
            return JsonResponse({
                'status': 'error',
                'message': 'Validation error',
                'data': {'errors': exc.message_dict if hasattr(exc, 'message_dict') else str(exc)},
            }, status=status.HTTP_400_BAD_REQUEST)
        elif hasattr(exc, 'status_code'):  # Handle Django's Http404, Http500, etc.
            return JsonResponse({
                'status': 'error',
                'message': exc.__class__.__name__,
                'data': {'detail': str(exc)},
            }, status=exc.status_code)
        else:
            # Handle uncaught exceptions (e.g., server errors)
            return JsonResponse({
                'status': 'error',
                'message': 'Internal server error',
                'data': {'detail': str(exc)},
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # If DRF handled the exception, customize the response format
    if isinstance(exc, APIException):
        # Standardize the error response format
        response.data = {
            'status': 'error',
            'message': exc.__class__.__name__,
            'data': {'detail': response.data.get('detail', str(exc))},
        }
        response.status_code = exc.status_code

    return response

# Custom exception classes for specific error types
class CustomAPIException(APIException):
    def __init__(self, detail, status_code):
        self.detail = detail
        self.status_code = status_code
        super().__init__(detail)
        
class FutsalAppConfig(AppConfig):
    name = 'futsalApp'

    def ready(self):
        # Run the seed_owner command when the app is ready
        call_command('seed_owner')