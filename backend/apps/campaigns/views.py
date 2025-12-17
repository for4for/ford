from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from decimal import Decimal
import random

from .models import CampaignRequest
from .serializers import (
    CampaignRequestSerializer,
    CampaignRequestDetailSerializer,
    CampaignRequestCreateUpdateSerializer,
    CampaignReportSerializer
)
from apps.users.permissions import IsAdminOrModerator, IsOwnerOrAdmin


class CampaignRequestViewSet(viewsets.ModelViewSet):
    """ViewSet for CampaignRequest CRUD operations"""
    queryset = CampaignRequest.objects.select_related('dealer')
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'dealer', 'campaign_type', 'redirect_type']
    search_fields = ['campaign_name', 'dealer__dealer_name', 'notes']
    ordering_fields = ['created_at', 'budget', 'start_date', 'updated_at']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        """Return appropriate serializer class"""
        if self.action == 'retrieve':
            return CampaignRequestDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return CampaignRequestCreateUpdateSerializer
        return CampaignRequestSerializer
    
    def get_permissions(self):
        """Admin/Moderator for status changes, Bayi can create own requests"""
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsOwnerOrAdmin()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        """Filter queryset based on user role"""
        user = self.request.user
        
        # Admin and moderator can see all requests
        if user.is_admin or user.is_moderator:
            return self.queryset
        
        # Bayi can only see their own requests
        if user.is_bayi and user.dealer:
            return self.queryset.filter(dealer=user.dealer)
        
        return self.queryset.none()
    
    def perform_create(self, serializer):
        """Set dealer automatically for dealer users"""
        user = self.request.user
        
        # If dealer user, automatically set their dealer
        if user.is_bayi and user.dealer:
            serializer.save(dealer=user.dealer)
        else:
            serializer.save()
    
    @action(detail=True, methods=['post'])
    def change_status(self, request, pk=None):
        """Change status of campaign request (admin/moderator only)"""
        campaign_request = self.get_object()
        new_status = request.data.get('status')
        
        if not new_status:
            return Response(
                {'error': 'Status field is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if new_status not in dict(CampaignRequest.Status.choices):
            return Response(
                {'error': 'Invalid status value.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Only admin/moderator can change status
        if not (request.user.is_admin or request.user.is_moderator):
            return Response(
                {'error': 'You do not have permission to perform this action.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        campaign_request.status = new_status
        campaign_request.save()
        
        serializer = CampaignRequestDetailSerializer(campaign_request)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def report(self, request, pk=None):
        """Get campaign report with dummy data (will be replaced with real API later)"""
        campaign = self.get_object()
        
        # Generate dummy report data
        # In the future, this will be replaced with real Meta API data
        total_budget = float(campaign.budget)
        spent_percentage = random.uniform(0.3, 0.7)  # Random 30-70% spent
        spent_budget = round(total_budget * spent_percentage, 2)
        remaining_budget = round(total_budget - spent_budget, 2)
        
        impressions = random.randint(30000, 80000)
        clicks = random.randint(1500, 5000)
        reach = int(impressions * random.uniform(0.7, 0.95))
        
        report_data = {
            'campaign_id': campaign.id,
            'campaign_name': campaign.campaign_name,
            'status': campaign.status,
            'status_display': campaign.get_status_display(),
            'platforms': campaign.platforms,
            'platforms_display': campaign.platforms_display,
            'start_date': campaign.start_date,
            'end_date': campaign.end_date,
            
            # Budget info
            'total_budget': Decimal(str(total_budget)),
            'spent_budget': Decimal(str(spent_budget)),
            'remaining_budget': Decimal(str(remaining_budget)),
            'budget_percentage': round(spent_percentage * 100, 1),
            
            # Performance metrics
            'impressions': impressions,
            'clicks': clicks,
            'ctr': round((clicks / impressions) * 100, 2),
            'cpm': Decimal(str(round((spent_budget / impressions) * 1000, 2))),
            'cpc': Decimal(str(round(spent_budget / clicks, 2))),
            'reach': reach,
            
            # Engagement metrics
            'likes': random.randint(800, 2000),
            'comments': random.randint(100, 400),
            'shares': random.randint(50, 200),
            'saves': random.randint(200, 600),
            
            # Conversion metrics
            'form_submissions': random.randint(80, 250),
            'website_visits': random.randint(1000, 3000),
            'phone_calls': random.randint(20, 80),
        }
        
        serializer = CampaignReportSerializer(data=report_data)
        serializer.is_valid(raise_exception=True)
        
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_status(self, request):
        """Get requests grouped by status"""
        queryset = self.filter_queryset(self.get_queryset())
        
        result = {}
        for status_choice in CampaignRequest.Status.choices:
            status_code = status_choice[0]
            status_label = status_choice[1]
            requests = queryset.filter(status=status_code)
            result[status_code] = {
                'label': status_label,
                'count': requests.count(),
                'requests': CampaignRequestSerializer(requests[:10], many=True).data
            }
        
        return Response(result)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get statistics for campaign requests"""
        queryset = self.filter_queryset(self.get_queryset())
        
        from django.db.models import Sum, Count, Avg
        
        stats = queryset.aggregate(
            total_count=Count('id'),
            total_budget=Sum('budget'),
            avg_budget=Avg('budget')
        )
        
        # Count by status
        status_counts = {}
        for status_choice in CampaignRequest.Status.choices:
            status_code = status_choice[0]
            status_label = status_choice[1]
            count = queryset.filter(status=status_code).count()
            status_counts[status_code] = {
                'label': status_label,
                'count': count
            }
        
        stats['by_status'] = status_counts
        
        return Response(stats)

