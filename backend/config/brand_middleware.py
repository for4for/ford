"""
Brand Detection Middleware

Basit yaklaşım:
- Authenticated requests: JWT token'daki brand claim'i kullan
- Login/Register: Request body'deki brand'i serializer'da alınır

Bu middleware sadece authenticated request'ler için brand set eder.
Login sırasında serializer brand'i body'den alıp DB router'a set eder.
"""
import logging
from django.http import HttpRequest, HttpResponse
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from .db_router import set_current_brand, clear_current_brand

logger = logging.getLogger(__name__)


def detect_brand_from_token(request: HttpRequest) -> str | None:
    """
    JWT token'dan brand claim'i oku.
    
    Args:
        request: Django HttpRequest
    
    Returns:
        Brand string veya None (token yoksa/geçersizse)
    """
    auth_header = request.headers.get('Authorization', '')
    
    if not auth_header.startswith('Bearer '):
        return None
    
    try:
        jwt_auth = JWTAuthentication()
        raw_token = auth_header.split(' ')[1]
        validated_token = jwt_auth.get_validated_token(raw_token)
        
        # Token'dan brand claim'i al
        brand = validated_token.get('brand')
        
        if brand in ('ford', 'tofas'):
            return brand
        
        return None
        
    except (InvalidToken, TokenError, Exception) as e:
        logger.debug(f"Token validation failed: {e}")
        return None


class BrandMiddleware:
    """
    Middleware that detects and sets the current brand for each request.
    
    - Authenticated requests: JWT token'dan brand oku
    - Unauthenticated requests (login/register): Default tofas, ama serializer body'den alacak
    
    Usage:
        settings.py MIDDLEWARE'e ekle:
        'config.brand_middleware.BrandMiddleware',
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request: HttpRequest) -> HttpResponse:
        # JWT token varsa brand'i al
        token_brand = detect_brand_from_token(request)
        
        if token_brand:
            # Authenticated request - token'daki brand'i kullan
            set_current_brand(token_brand)
            request.brand = token_brand
            logger.debug(f"Brand from JWT token: {token_brand}")
        else:
            # Unauthenticated request - default tofas
            # Login/register için serializer body'den alacak ve override edecek
            set_current_brand('tofas')
            request.brand = 'tofas'
            logger.debug("No JWT token, defaulting to tofas (login will override from body)")
        
        try:
            response = self.get_response(request)
        finally:
            # Request sonrası temizlik
            clear_current_brand()
        
        return response

