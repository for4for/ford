from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.contrib.auth import get_user_model

from .models import Dealer, DealerBudget
from .serializers import (
    DealerSerializer,
    DealerDetailSerializer,
    DealerCreateUpdateSerializer,
    DealerBudgetSerializer
)
from apps.users.permissions import IsAdminOrModerator, IsOwnerOrAdmin

User = get_user_model()


class DealerViewSet(viewsets.ModelViewSet):
    """ViewSet for Dealer CRUD operations"""
    queryset = Dealer.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'dealer_type', 'city', 'district', 'region']
    search_fields = ['dealer_code', 'dealer_name', 'contact_person', 'regional_manager']
    ordering_fields = ['dealer_name', 'membership_date', 'city']
    ordering = ['dealer_name']
    
    def get_serializer_class(self):
        """Return appropriate serializer class"""
        if self.action == 'retrieve':
            return DealerDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return DealerCreateUpdateSerializer
        return DealerSerializer
    
    def get_permissions(self):
        """Set permissions based on action"""
        if self.action == 'register':
            return [AllowAny()]
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminOrModerator()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        """Filter queryset based on user role"""
        user = self.request.user
        
        # Admin and moderator can see all dealers
        if user.is_admin or user.is_moderator:
            return self.queryset
        
        # Bayi can only see their own dealer
        if user.is_bayi and user.dealer:
            return self.queryset.filter(dealer_code=user.dealer.dealer_code)
        
        return self.queryset.none()
    
    @action(detail=True, methods=['get'])
    def budgets(self, request, pk=None):
        """Get all budgets for a dealer"""
        dealer = self.get_object()
        budgets = dealer.budgets.all()
        serializer = DealerBudgetSerializer(budgets, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def statistics(self, request, pk=None):
        """Get statistics for a dealer"""
        dealer = self.get_object()
        
        # Get current year budget
        from datetime import datetime
        current_year = datetime.now().year
        
        try:
            current_budget = dealer.budgets.get(year=current_year)
            budget_data = DealerBudgetSerializer(current_budget).data
        except DealerBudget.DoesNotExist:
            budget_data = None
        
        # Get request counts by status
        visual_requests = dealer.visual_requests.all()
        incentive_requests = dealer.incentive_requests.all()
        
        statistics = {
            'dealer': DealerSerializer(dealer).data,
            'current_budget': budget_data,
            'visual_requests': {
                'total': visual_requests.count(),
                'by_status': {}
            },
            'incentive_requests': {
                'total': incentive_requests.count(),
                'by_status': {}
            }
        }
        
        # Count by status for visual requests
        for status_choice in visual_requests.model.Status.choices:
            status_code = status_choice[0]
            count = visual_requests.filter(status=status_code).count()
            statistics['visual_requests']['by_status'][status_code] = count
        
        # Count by status for incentive requests
        for status_choice in incentive_requests.model.Status.choices:
            status_code = status_choice[0]
            count = incentive_requests.filter(status=status_code).count()
            statistics['incentive_requests']['by_status'][status_code] = count
        
        return Response(statistics)
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def register(self, request):
        """Public endpoint for dealer registration"""
        data = request.data
        
        # Check if dealer_code already exists
        if Dealer.objects.filter(dealer_code=data.get('dealer_code')).exists():
            return Response(
                {'detail': 'Bu bayi kodu zaten kayıtlı.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if email already exists
        if Dealer.objects.filter(email=data.get('email')).exists():
            return Response(
                {'detail': 'Bu e-posta adresi zaten kayıtlı.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user with this email exists
        if User.objects.filter(email=data.get('email')).exists():
            return Response(
                {'detail': 'Bu e-posta adresi zaten kullanılıyor.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Create dealer (status will be 'pasif' until admin approval)
            dealer = Dealer.objects.create(
                dealer_code=data.get('dealer_code'),
                dealer_name=data.get('dealer_name'),
                dealer_type=data.get('dealer_type', 'yetkili'),
                status='pasif',  # Requires admin approval
                city=data.get('city'),
                district=data.get('district'),
                address=data.get('address'),
                phone=data.get('phone'),
                email=data.get('email'),
                contact_person=data.get('contact_person'),
                regional_manager=data.get('regional_manager', ''),
                additional_emails=data.get('additional_emails', [])
            )
            
            # Create user account (inactive until admin approval)
            user = User.objects.create_user(
                username=data.get('dealer_code'),  # Use dealer_code as username
                email=data.get('email'),
                password=data.get('password'),
                first_name=data.get('contact_person', '').split()[0] if data.get('contact_person') else '',
                last_name=' '.join(data.get('contact_person', '').split()[1:]) if data.get('contact_person') else '',
                role='bayi',
                is_active=False,  # Inactive until admin approval
                dealer=dealer
            )
            
            return Response(
                {
                    'detail': 'Kayıt başarılı! Hesabınız admin onayına gönderildi.',
                    'dealer_code': dealer.dealer_code,
                    'email': dealer.email
                },
                status=status.HTTP_201_CREATED
            )
            
        except Exception as e:
            return Response(
                {'detail': f'Kayıt sırasında bir hata oluştu: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )


class DealerBudgetViewSet(viewsets.ModelViewSet):
    """ViewSet for DealerBudget CRUD operations"""
    queryset = DealerBudget.objects.all()
    serializer_class = DealerBudgetSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['dealer', 'year']
    ordering = ['-year']
    
    def get_permissions(self):
        """Set permissions based on action"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminOrModerator()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        """Filter queryset based on user role"""
        user = self.request.user
        
        # Admin and moderator can see all budgets
        if user.is_admin or user.is_moderator:
            return self.queryset
        
        # Bayi can only see their own budgets
        if user.is_bayi and user.dealer:
            return self.queryset.filter(dealer=user.dealer)
        
        return self.queryset.none()

