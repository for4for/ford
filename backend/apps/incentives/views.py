from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import IncentiveRequest
from .serializers import (
    IncentiveRequestSerializer,
    IncentiveRequestDetailSerializer,
    IncentiveRequestCreateUpdateSerializer
)
from apps.users.permissions import IsAdminOrModerator, IsOwnerOrAdmin


class IncentiveRequestViewSet(viewsets.ModelViewSet):
    """ViewSet for IncentiveRequest CRUD operations"""
    queryset = IncentiveRequest.objects.select_related('dealer')
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'dealer', 'event_time']
    search_fields = ['incentive_title', 'incentive_details', 'dealer__dealer_name', 'event_venue']
    ordering_fields = ['created_at', 'incentive_amount', 'updated_at']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        """Return appropriate serializer class"""
        if self.action == 'retrieve':
            return IncentiveRequestDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return IncentiveRequestCreateUpdateSerializer
        return IncentiveRequestSerializer
    
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
        """Change status of incentive request (admin/moderator only)"""
        incentive_request = self.get_object()
        new_status = request.data.get('status')
        approved_amount = request.data.get('approved_amount')
        
        if not new_status:
            return Response(
                {'error': 'Status field is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if new_status not in dict(IncentiveRequest.Status.choices):
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
        
        incentive_request.status = new_status
        
        # Set approved_amount if provided
        if approved_amount:
            try:
                incentive_request.approved_amount = float(approved_amount)
            except (ValueError, TypeError):
                return Response(
                    {'error': 'Invalid approved amount.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        incentive_request.save()
        
        serializer = IncentiveRequestDetailSerializer(incentive_request)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_status(self, request):
        """Get requests grouped by status"""
        queryset = self.filter_queryset(self.get_queryset())
        
        result = {}
        for status_choice in IncentiveRequest.Status.choices:
            status_code = status_choice[0]
            status_label = status_choice[1]
            requests = queryset.filter(status=status_code)
            result[status_code] = {
                'label': status_label,
                'count': requests.count(),
                'requests': IncentiveRequestSerializer(requests[:10], many=True).data
            }
        
        return Response(result)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get statistics for incentive requests"""
        queryset = self.filter_queryset(self.get_queryset())
        
        from django.db.models import Sum, Count, Avg
        
        stats = queryset.aggregate(
            total_count=Count('id'),
            total_requested=Sum('incentive_amount'),
            total_approved=Sum('approved_amount'),
            avg_requested=Avg('incentive_amount'),
            avg_approved=Avg('approved_amount')
        )
        
        # Count by status
        status_counts = {}
        for status_choice in IncentiveRequest.Status.choices:
            status_code = status_choice[0]
            status_label = status_choice[1]
            count = queryset.filter(status=status_code).count()
            status_counts[status_code] = {
                'label': status_label,
                'count': count
            }
        
        stats['by_status'] = status_counts
        
        return Response(stats)

