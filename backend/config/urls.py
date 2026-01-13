"""
URL configuration for Ford Bayi Otomasyonu project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView
from rest_framework.routers import DefaultRouter
from apps.users.views import UserViewSet

# Health check view
def health_check(request):
    return JsonResponse({"status": "OK"})

# Users router
users_router = DefaultRouter()
users_router.register('', UserViewSet, basename='user')

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # Health check
    path('api/health/', health_check, name='health_check'),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    
    # API endpoints
    path('api/auth/', include('apps.users.urls')),
    path('api/users/', include(users_router.urls)),  # User management
    path('api/dealers/', include('apps.dealers.urls')),
    path('api/brands/', include('apps.dealers.urls_brands')),  # Brand management
    path('api/visuals/', include('apps.visuals.urls')),
    path('api/creatives/', include('apps.visuals.urls')),  # Alias for visuals
    path('api/incentives/', include('apps.incentives.urls')),
    path('api/campaigns/', include('apps.campaigns.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

