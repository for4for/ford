from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.contrib.auth import get_user_model

from .models import Dealer, DealerBudget, DealerBudgetPlan, Brand
from .serializers import (
    DealerSerializer,
    DealerDetailSerializer,
    DealerCreateUpdateSerializer,
    DealerBudgetSerializer,
    BrandSerializer
)
from .filters import DealerFilter, BrandFilter
from apps.users.permissions import IsAdminOrModerator, IsOwnerOrAdmin

User = get_user_model()


class DealerViewSet(viewsets.ModelViewSet):
    """ViewSet for Dealer CRUD operations"""
    queryset = Dealer.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = DealerFilter  # Custom filter with icontains for city, district, etc.
    # icontains ile partial search (Türkçe karakterler dahil)
    search_fields = ['dealer_code', 'dealer_name', 'contact_first_name', 'contact_last_name', 'regional_manager', 'city', 'district', 'email']
    ordering_fields = ['dealer_name', 'membership_date', 'city', 'dealer_code', 'status', 'updated_at', 'email', 'phone', 'district', 'region', 'id']
    ordering = ['-id']
    
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
        queryset = self.queryset
        
        # Filter by is_deleted parameter
        is_deleted = self.request.query_params.get('is_deleted')
        if is_deleted == 'true':
            queryset = queryset.filter(is_deleted=True)
        elif is_deleted == 'false' or is_deleted is None:
            # Default: show only non-deleted dealers
            queryset = queryset.filter(is_deleted=False)
        # If is_deleted == 'all', show all dealers
        
        # Admin and moderator can see all dealers
        if user.is_admin or user.is_moderator:
            return queryset
        
        # Bayi can only see their own dealer
        if user.is_bayi and user.dealer:
            return queryset.filter(dealer_code=user.dealer.dealer_code)
        
        return queryset.none()
    
    def destroy(self, request, *args, **kwargs):
        """Soft delete dealer instead of hard delete"""
        instance = self.get_object()
        reason = request.data.get('reason', '')
        instance.soft_delete(reason=reason)
        return Response(status=status.HTTP_204_NO_CONTENT)
    
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
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def check_budget(self, request):
        """
        Anlık bütçe kontrolü - Kampanya formu doldurulurken bütçe yeterliliğini kontrol eder.
        POST: { start_date, end_date, budget_amount }
        """
        user = request.user
        
        # Sadece bayi kullanıcılar için
        if not user.is_bayi or not user.dealer:
            return Response(
                {'detail': 'Bu işlem sadece bayi kullanıcılar içindir.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        dealer = user.dealer
        start_date = request.data.get('start_date')
        end_date = request.data.get('end_date')
        requested_budget = request.data.get('budget_amount')
        
        # Validation
        if not all([start_date, end_date, requested_budget]):
            return Response({
                'valid': False,
                'error': 'Tarih ve bütçe bilgileri eksik.',
                'has_plan': False,
                'available_budget': 0,
                'requested_budget': 0,
            })
        
        try:
            from datetime import datetime
            start = datetime.strptime(start_date, '%Y-%m-%d').date()
            end = datetime.strptime(end_date, '%Y-%m-%d').date()
            requested = float(requested_budget)
        except (ValueError, TypeError):
            return Response({
                'valid': False,
                'error': 'Geçersiz tarih veya bütçe formatı.',
                'has_plan': False,
                'available_budget': 0,
                'requested_budget': 0,
            })
        
        # Tarih aralığını kapsayan aktif bütçe planı bul
        # Plan: start_date <= kampanya başlangıç VE end_date >= kampanya bitiş
        matching_plans = DealerBudgetPlan.objects.filter(
            dealer=dealer,
            is_active=True,
            start_date__lte=start,
            end_date__gte=end
        )
        
        if not matching_plans.exists():
            # Tarih aralığında plan yok - ama belki kısmen kapsıyor?
            partial_plans = DealerBudgetPlan.objects.filter(
                dealer=dealer,
                is_active=True,
                start_date__lte=end,
                end_date__gte=start
            )
            
            if partial_plans.exists():
                # Kısmen kapsayan planlar var
                plan = partial_plans.first()
                available = float(plan.budget_amount) - float(plan.used_amount)
                return Response({
                    'valid': False,
                    'error': f'Seçilen tarih aralığı bütçe planını tam kapsamıyor. Mevcut plan: {plan.start_date.strftime("%d.%m.%Y")} - {plan.end_date.strftime("%d.%m.%Y")}',
                    'warning': True,
                    'has_plan': True,
                    'plan_start': plan.start_date.strftime('%d.%m.%Y'),
                    'plan_end': plan.end_date.strftime('%d.%m.%Y'),
                    'available_budget': available,
                    'requested_budget': requested,
                })
            
            return Response({
                'valid': False,
                'error': 'Bu tarih aralığında tanımlı bir bütçe planınız bulunmuyor.',
                'has_plan': False,
                'available_budget': 0,
                'requested_budget': requested,
            })
        
        # En uygun planı seç (en dar tarih aralığı)
        plan = matching_plans.order_by('start_date', '-end_date').first()
        available = float(plan.budget_amount) - float(plan.used_amount)
        
        if requested > available:
            return Response({
                'valid': False,
                'error': f'Yetersiz bütçe. Kullanılabilir: ₺{available:,.0f}, Talep edilen: ₺{requested:,.0f}',
                'has_plan': True,
                'plan_start': plan.start_date.strftime('%d.%m.%Y'),
                'plan_end': plan.end_date.strftime('%d.%m.%Y'),
                'total_budget': float(plan.budget_amount),
                'used_budget': float(plan.used_amount),
                'available_budget': available,
                'requested_budget': requested,
            })
        
        return Response({
            'valid': True,
            'message': f'Bütçe uygun. Kullanılabilir: ₺{available:,.0f}',
            'has_plan': True,
            'plan_start': plan.start_date.strftime('%d.%m.%Y'),
            'plan_end': plan.end_date.strftime('%d.%m.%Y'),
            'total_budget': float(plan.budget_amount),
            'used_budget': float(plan.used_amount),
            'available_budget': available,
            'requested_budget': requested,
            'remaining_after': available - requested,
        })
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def register(self, request):
        """Public endpoint for dealer registration"""
        data = request.data
        
        # user_email is used for login (stored as username)
        user_email = data.get('user_email')
        if not user_email:
            return Response(
                {'detail': 'Giriş e-postası zorunludur.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user_email (username) already exists (only active users)
        if User.objects.filter(username=user_email).exists():
            return Response(
                {'detail': 'Bu e-posta adresi zaten kayıtlı.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user with this email exists (only active users)
        if User.objects.filter(email=user_email).exists():
            return Response(
                {'detail': 'Bu e-posta adresi zaten kullanılıyor.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if contact email already exists (optional - for dealer contact)
        # is_deleted=False filtresi eklendi - silinmiş bayilerin e-postaları tekrar kullanılabilir
        contact_email = data.get('email')
        if contact_email and Dealer.objects.filter(email=contact_email, is_deleted=False).exists():
            return Response(
                {'detail': 'Bu iletişim e-postası zaten kayıtlı.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Create dealer (status will be 'pasif' until admin approval)
            # dealer_code boş bırakılır - admin sonradan atayacak
            dealer = Dealer.objects.create(
                dealer_name=data.get('dealer_name'),
                dealer_type=data.get('dealer_type', 'yetkili'),
                status='pasif',  # Requires admin approval
                city=data.get('city'),
                district=data.get('district'),
                address=data.get('address'),
                phone=data.get('phone'),
                email=data.get('email'),
                contact_first_name=data.get('contact_first_name', ''),
                contact_last_name=data.get('contact_last_name', ''),
                regional_manager=data.get('regional_manager', ''),
                additional_emails=data.get('additional_emails', [])
            )
            
            # Create user account (inactive until admin approval)
            # username = user_email (for login with email)
            user = User.objects.create_user(
                username=user_email,  # Email as username for login
                email=user_email,     # Same email
                password=data.get('password'),
                first_name=data.get('contact_first_name', ''),
                last_name=data.get('contact_last_name', ''),
                role='bayi',
                is_active=False,  # Inactive until admin approval
                dealer=dealer
            )
            
            return Response(
                {
                    'detail': 'Kayıt başarılı! Hesabınız admin onayına gönderildi.',
                    'dealer_id': dealer.id,
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


class BrandViewSet(viewsets.ModelViewSet):
    """ViewSet for Brand CRUD operations"""
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = BrandFilter  # Custom filter with icontains
    search_fields = ['name', 'code']
    ordering_fields = ['name', 'code', 'created_at']
    ordering = ['name']
    
    def get_permissions(self):
        """Set permissions based on action"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminOrModerator()]
        return [IsAuthenticated()]

