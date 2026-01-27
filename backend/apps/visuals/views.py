from rest_framework import viewsets, status, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import VisualRequest, VisualRequestReferenceFile, VisualRequestDeliveredFile
from .serializers import (
    VisualRequestSerializer,
    VisualRequestDetailSerializer,
    VisualRequestCreateUpdateSerializer,
    VisualRequestReferenceFileSerializer,
    VisualRequestDeliveredFileSerializer
)
from apps.users.permissions import IsAdminOrModerator, IsOwnerOrAdmin


class VisualRequestViewSet(viewsets.ModelViewSet):
    """ViewSet for VisualRequest CRUD operations"""
    queryset = VisualRequest.objects.select_related('dealer').prefetch_related('sizes', 'creatives', 'reference_files', 'delivered_files')
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'dealer', 'deadline', 'assigned_to']
    search_fields = ['creative_work_request', 'work_details', 'dealer__dealer_name']
    ordering_fields = ['created_at', 'deadline', 'updated_at', 'id', 'status', 'quantity_request', 'dealer__dealer_name', 'creative_work_request']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        """Return appropriate serializer class"""
        if self.action == 'retrieve':
            return VisualRequestDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return VisualRequestCreateUpdateSerializer
        return VisualRequestSerializer
    
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
        
        # Creative Agency can only see requests assigned to them
        if user.is_creative_agency:
            return self.queryset.filter(assigned_to='creative_agency')
        
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
        elif user.is_admin or user.is_moderator:
            # Admin/moderator must provide dealer
            if not serializer.validated_data.get('dealer'):
                raise serializers.ValidationError({
                    'dealer': 'Admin/moderatör için dealer alanı zorunludur.'
                })
            serializer.save()
        else:
            serializer.save()
    
    @action(detail=True, methods=['post'])
    def change_status(self, request, pk=None):
        """Change status of visual request (admin/moderator only)"""
        visual_request = self.get_object()
        new_status = request.data.get('status')
        
        if not new_status:
            return Response(
                {'error': 'Status alanı gereklidir.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if new_status not in dict(VisualRequest.Status.choices):
            return Response(
                {'error': 'Geçersiz status değeri.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Only admin/moderator can change status
        if not (request.user.is_admin or request.user.is_moderator):
            return Response(
                {'error': 'Bu işlem için yetkiniz yok.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        visual_request.status = new_status
        visual_request.save()
        
        serializer = VisualRequestDetailSerializer(visual_request)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_status(self, request):
        """Get requests grouped by status"""
        queryset = self.filter_queryset(self.get_queryset())
        
        result = {}
        for status_choice in VisualRequest.Status.choices:
            status_code = status_choice[0]
            status_label = status_choice[1]
            requests = queryset.filter(status=status_code)
            result[status_code] = {
                'label': status_label,
                'count': requests.count(),
                'requests': VisualRequestSerializer(requests[:10], many=True).data
            }
        
        return Response(result)
    
    @action(detail=True, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def upload_file(self, request, pk=None):
        """Upload a delivered file (Creative Agency)"""
        visual_request = self.get_object()
        
        # Only creative agency or admin/moderator can upload files
        if not (request.user.is_creative_agency or request.user.is_admin or request.user.is_moderator):
            return Response(
                {'error': 'Bu işlem için yetkiniz yok.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        file = request.FILES.get('file')
        if not file:
            return Response(
                {'error': 'Dosya gereklidir.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        note = request.data.get('note', '')
        
        delivered_file = VisualRequestDeliveredFile.objects.create(
            visual_request=visual_request,
            file=file,
            file_name=file.name,
            file_size=file.size,
            note=note
        )
        
        serializer = VisualRequestDeliveredFileSerializer(delivered_file)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['delete'], url_path='delete_file/(?P<file_id>[^/.]+)')
    def delete_file(self, request, pk=None, file_id=None):
        """Delete a delivered file"""
        visual_request = self.get_object()
        
        # Only creative agency or admin/moderator can delete files
        if not (request.user.is_creative_agency or request.user.is_admin or request.user.is_moderator):
            return Response(
                {'error': 'Bu işlem için yetkiniz yok.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            delivered_file = visual_request.delivered_files.get(id=file_id)
            delivered_file.file.delete()  # Delete actual file
            delivered_file.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except VisualRequestDeliveredFile.DoesNotExist:
            return Response(
                {'error': 'Dosya bulunamadı.'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'])
    def send_to_dealer(self, request, pk=None):
        """Send the request to dealer after uploading files (Creative Agency or Admin)"""
        visual_request = self.get_object()
        
        # Creative agency, admin or moderator can send to dealer
        if not (request.user.is_creative_agency or request.user.is_admin or request.user.is_moderator):
            return Response(
                {'error': 'Bu işlem için yetkiniz yok.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if there are uploaded files
        if not visual_request.delivered_files.exists():
            return Response(
                {'error': 'En az bir dosya yüklenmelidir.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        note = request.data.get('note', '')
        timestamp = __import__('datetime').datetime.now().strftime('%d.%m.%Y %H:%M')
        
        new_note = f"[Görseller Yüklendi ve Bayiye Gönderildi - {timestamp}]"
        if note:
            new_note += f": {note}"
        
        visual_request.status = 'bayi_onayi_bekliyor'
        visual_request.assigned_to = 'dealer'
        visual_request.admin_notes = (
            f"{visual_request.admin_notes}\n{new_note}".strip() 
            if visual_request.admin_notes else new_note
        )
        visual_request.save()
        
        serializer = VisualRequestDetailSerializer(visual_request)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def upload_reference(self, request, pk=None):
        """Upload a reference file (Bayi or Admin/Moderator)"""
        visual_request = self.get_object()
        
        # Only bayi (owner), admin or moderator can upload reference files
        user = request.user
        is_owner = user.is_bayi and user.dealer and visual_request.dealer == user.dealer
        if not (is_owner or user.is_admin or user.is_moderator):
            return Response(
                {'error': 'Bu işlem için yetkiniz yok.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        file = request.FILES.get('file')
        if not file:
            return Response(
                {'error': 'Dosya gereklidir.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        reference_file = VisualRequestReferenceFile.objects.create(
            visual_request=visual_request,
            file=file,
            file_name=file.name,
            file_size=file.size
        )
        
        serializer = VisualRequestReferenceFileSerializer(reference_file)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['delete'], url_path='delete_reference/(?P<file_id>[^/.]+)')
    def delete_reference(self, request, pk=None, file_id=None):
        """Delete a reference file"""
        visual_request = self.get_object()
        
        # Only bayi (owner), admin or moderator can delete reference files
        user = request.user
        is_owner = user.is_bayi and user.dealer and visual_request.dealer == user.dealer
        if not (is_owner or user.is_admin or user.is_moderator):
            return Response(
                {'error': 'Bu işlem için yetkiniz yok.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            reference_file = visual_request.reference_files.get(id=file_id)
            reference_file.file.delete()  # Delete actual file
            reference_file.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except VisualRequestReferenceFile.DoesNotExist:
            return Response(
                {'error': 'Dosya bulunamadı.'},
                status=status.HTTP_404_NOT_FOUND
            )

