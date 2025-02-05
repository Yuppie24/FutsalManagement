# futsalApp/middleware.py
from django.http import JsonResponse
from django.core.exceptions import PermissionDenied as DjangoPermissionDenied
from django.http import Http404
import logging

logger = logging.getLogger(__name__)

class JSONErrorMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        return response

    def process_exception(self, request, exception):
        if isinstance(exception, Http404):
            return JsonResponse({
                'status': 'error',
                'message': 'NotFound',
                'data': {'detail': str(exception)},
            }, status=404)
        elif isinstance(exception, DjangoPermissionDenied):
            return JsonResponse({
                'status': 'error',
                'message': 'PermissionDenied',
                'data': {'detail': str(exception)},
            }, status=403)
        elif not isinstance(exception, Exception):  # Skip DRF exceptions
            logger.error(f"Unhandled exception: {str(exception)}", exc_info=True)
            return JsonResponse({
                'status': 'error',
                'message': 'InternalServerError',
                'data': {'detail': 'An unexpected error occurred'},
            }, status=500)
        return None