from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    CustomTokenObtainPairView,
    AdminTokenObtainPairView,
    DealerTokenObtainPairView,
    RegisterView,
    UserViewSet,
    PasswordResetRequestView,
    PasswordResetConfirmView
)

router = DefaultRouter()
router.register('users', UserViewSet, basename='user')

urlpatterns = [
    # JWT Authentication - General
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # JWT Authentication - Role-specific
    path('admin/token/', AdminTokenObtainPairView.as_view(), name='admin_token'),
    path('dealer/token/', DealerTokenObtainPairView.as_view(), name='dealer_token'),
    
    # Registration
    path('register/', RegisterView.as_view(), name='register'),
    
    # Password Reset - Dealer
    path('dealer/password-reset/', PasswordResetRequestView.as_view(), name='dealer_password_reset_request'),
    path('dealer/password-reset-confirm/', PasswordResetConfirmView.as_view(), name='dealer_password_reset_confirm'),
    
    # User management
    path('', include(router.urls)),
]

