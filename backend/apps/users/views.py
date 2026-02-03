from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.conf import settings

from .serializers import (
    UserSerializer,
    UserRegisterSerializer,
    CustomTokenObtainPairSerializer,
    AdminTokenObtainPairSerializer,
    DealerTokenObtainPairSerializer,
    ChangePasswordSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer
)
from .permissions import IsAdmin
from .email_utils import send_password_reset_email

User = get_user_model()


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom JWT token obtain view"""
    serializer_class = CustomTokenObtainPairSerializer


class AdminTokenObtainPairView(TokenObtainPairView):
    """Admin/Moderator only JWT token obtain view"""
    serializer_class = AdminTokenObtainPairSerializer


class DealerTokenObtainPairView(TokenObtainPairView):
    """Dealer only JWT token obtain view"""
    serializer_class = DealerTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    """User registration endpoint"""
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        return Response({
            'user': UserSerializer(user).data,
            'message': 'Kullanıcı başarıyla oluşturuldu.'
        }, status=status.HTTP_201_CREATED)


class UserViewSet(viewsets.ModelViewSet):
    """ViewSet for User CRUD operations"""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['role', 'is_active', 'is_deleted']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering_fields = ['date_joined', 'username', 'email', 'first_name', 'last_name', 'role', 'phone', 'dealer__dealer_name', 'dealer__contact_first_name']
    ordering = ['-date_joined']
    
    def get_queryset(self):
        """Silinenleri dahil edip etmemeyi query param ile kontrol et"""
        include_deleted = self.request.query_params.get('include_deleted', 'false').lower() == 'true'
        
        if include_deleted:
            return User.all_objects.all()
        return User.objects.all()
    
    def get_permissions(self):
        """Admin only for create, update, delete"""
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'soft_delete', 'restore']:
            return [IsAdmin()]
        return super().get_permissions()
    
    def destroy(self, request, *args, **kwargs):
        """Override destroy to use soft delete"""
        instance = self.get_object()
        reason = request.data.get('reason', '')
        instance.soft_delete(reason=reason)
        return Response({'message': 'Kullanıcı silindi.'}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def soft_delete(self, request, pk=None):
        """Soft delete a user"""
        user = self.get_object()
        reason = request.data.get('reason', '')
        user.soft_delete(reason=reason)
        return Response({
            'message': 'Kullanıcı silindi.',
            'user': UserSerializer(user).data
        })
    
    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        """Restore a soft-deleted user"""
        # Silinen kullanıcıyı bulmak için all_objects kullan
        try:
            user = User.all_objects.get(pk=pk)
        except User.DoesNotExist:
            return Response(
                {'error': 'Kullanıcı bulunamadı.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if not user.is_deleted:
            return Response(
                {'error': 'Bu kullanıcı zaten aktif.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.restore()
        return Response({
            'message': 'Kullanıcı geri yüklendi.',
            'user': UserSerializer(user).data
        })
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user info"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def change_password(self, request):
        """Change password for current user"""
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        
        # Check old password
        if not user.check_password(serializer.validated_data['old_password']):
            return Response(
                {'error': 'Eski şifre hatalı.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Set new password
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        return Response({
            'message': 'Şifre başarıyla değiştirildi.'
        })


class PasswordResetRequestView(generics.GenericAPIView):
    """Request password reset - sends email with reset token"""
    serializer_class = PasswordResetRequestSerializer
    permission_classes = [AllowAny]
    authentication_classes = []  # No authentication required
    
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        user = User.objects.filter(email=email).first()
        
        if user:
            # Generate password reset token
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            brand = serializer.validated_data['brand']
            
            # Create reset URL (frontend URL with brand)
            reset_url = f"{settings.FRONTEND_URL}/{brand}/dealer-reset-password?uid={uid}&token={token}"
            
            # Send password reset email
            send_password_reset_email(user, reset_url)
        
        # Always return success to prevent email enumeration
        return Response({
            'message': 'Eğer bu e-posta adresi sistemde kayıtlıysa, şifre sıfırlama bağlantısı gönderildi.'
        })


class PasswordResetConfirmView(generics.GenericAPIView):
    """Confirm password reset with token"""
    serializer_class = PasswordResetConfirmSerializer
    permission_classes = [AllowAny]
    authentication_classes = []  # No authentication required
    
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            uid = request.data.get('uid')
            token = serializer.validated_data['token']
            new_password = serializer.validated_data['new_password']
            
            # Decode user ID
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)
            
            # Verify token
            if not default_token_generator.check_token(user, token):
                return Response(
                    {'error': 'Geçersiz veya süresi dolmuş token.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Set new password
            user.set_password(new_password)
            user.save()
            
            return Response({
                'message': 'Şifreniz başarıyla değiştirildi. Şimdi giriş yapabilirsiniz.'
            })
            
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response(
                {'error': 'Geçersiz token.'},
                status=status.HTTP_400_BAD_REQUEST
            )

