from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.utils import timezone
from decimal import Decimal
import random
import logging

from .models import CampaignRequest, CampaignCreativeFile, CampaignActivityLog
from .serializers import (
    CampaignRequestSerializer,
    CampaignRequestDetailSerializer,
    CampaignRequestCreateUpdateSerializer,
    CampaignReportSerializer,
    CampaignCreativeFileSerializer,
)
from apps.users.permissions import IsAdminOrModerator, IsOwnerOrAdmin

logger = logging.getLogger(__name__)


class CampaignRequestViewSet(viewsets.ModelViewSet):
    """ViewSet for CampaignRequest CRUD operations"""
    queryset = CampaignRequest.objects.select_related('dealer')
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'dealer', 'campaign_type', 'redirect_type', 'fb_push_status']
    search_fields = ['campaign_name', 'dealer__dealer_name', 'notes']
    ordering_fields = ['created_at', 'budget', 'start_date', 'end_date', 'updated_at', 'id', 'status', 'campaign_name', 'dealer__dealer_name']
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
        if self.action in ['push_to_facebook', 'check_fb_status']:
            return [IsAdminOrModerator()]
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
            instance = serializer.save(dealer=user.dealer)
        else:
            instance = serializer.save()

        CampaignActivityLog.log(
            campaign_request=instance,
            action=CampaignActivityLog.ActionType.CREATED,
            message=f'Kampanya talebi oluşturuldu: {instance.campaign_name}',
            user=user,
        )
    
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
        
        old_status = campaign_request.status
        campaign_request.status = new_status
        campaign_request.save()

        # Durum değişikliğini logla
        status_labels = dict(CampaignRequest.Status.choices)
        CampaignActivityLog.log(
            campaign_request=campaign_request,
            action=CampaignActivityLog.ActionType.STATUS_CHANGE,
            message=f'Durum değiştirildi: {status_labels.get(old_status, old_status)} → {status_labels.get(new_status, new_status)}',
            user=request.user,
            details={
                'old_status': old_status,
                'new_status': new_status,
                'admin_notes': request.data.get('admin_notes', ''),
            },
        )
        
        serializer = CampaignRequestDetailSerializer(campaign_request)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], url_path='push-to-facebook')
    def push_to_facebook(self, request, pk=None):
        """
        Kampanya talebini Facebook'a gönder.
        Sadece admin/moderator kullanabilir.
        Kampanya durumu 'onaylandi' olmalıdır.
        """
        campaign_request = self.get_object()

        # Durum kontrolü
        if campaign_request.status != CampaignRequest.Status.ONAYLANDI:
            return Response(
                {'error': 'Sadece onaylanmış kampanyalar Facebook\'a gönderilebilir.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Zaten gönderilmiş mi kontrolü
        if campaign_request.fb_push_status == 'success':
            return Response(
                {'error': 'Bu kampanya zaten Facebook\'a gönderilmiş.',
                 'fb_campaign_id': campaign_request.fb_campaign_id},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Push durumunu güncelle
        campaign_request.fb_push_status = 'pushing'
        campaign_request.fb_push_error = ''
        campaign_request.save(update_fields=['fb_push_status', 'fb_push_error'])

        # Deneme logu
        CampaignActivityLog.log(
            campaign_request=campaign_request,
            action=CampaignActivityLog.ActionType.FB_PUSH_ATTEMPT,
            message='Facebook kampanya oluşturma başlatıldı',
            user=request.user,
        )

        try:
            from .services.meta_ads_service import MetaAdsService, MetaAdsServiceError

            service = MetaAdsService()
            result = service.create_full_campaign(campaign_request)

            if result.get('success'):
                campaign_request.fb_campaign_id = result['campaign_id']
                campaign_request.fb_adset_id = result['adset_id']
                campaign_request.fb_creative_id = result['creative_id']
                campaign_request.fb_ad_id = result['ad_id']
                campaign_request.fb_push_status = 'success'
                campaign_request.fb_push_error = ''
                campaign_request.fb_pushed_at = timezone.now()
                campaign_request.status = CampaignRequest.Status.YAYINDA
                campaign_request.save()

                logger.info(f'[PushToFB] Kampanya #{campaign_request.id} başarıyla gönderildi. FB ID: {result["campaign_id"]}')

                # Başarı logu
                CampaignActivityLog.log(
                    campaign_request=campaign_request,
                    action=CampaignActivityLog.ActionType.FB_PUSH_SUCCESS,
                    message=f'Facebook kampanya başarıyla oluşturuldu (Campaign: {result["campaign_id"]})',
                    user=request.user,
                    details={
                        'campaign_id': result['campaign_id'],
                        'adset_id': result['adset_id'],
                        'creative_id': result['creative_id'],
                        'ad_id': result['ad_id'],
                    },
                )

                serializer = CampaignRequestDetailSerializer(campaign_request)
                return Response({
                    'success': True,
                    'message': 'Kampanya başarıyla Facebook\'a gönderildi.',
                    'data': serializer.data,
                })
            else:
                error_msg = result.get('error', 'Bilinmeyen hata')
                campaign_request.fb_push_status = 'failed'
                campaign_request.fb_push_error = error_msg
                campaign_request.save(update_fields=['fb_push_status', 'fb_push_error'])

                logger.error(f'[PushToFB] Kampanya #{campaign_request.id} gönderilemedi: {error_msg}')

                # Hata logu
                CampaignActivityLog.log(
                    campaign_request=campaign_request,
                    action=CampaignActivityLog.ActionType.FB_PUSH_FAILED,
                    message=f'Facebook gönderim başarısız: {error_msg[:200]}',
                    user=request.user,
                    details={'error': error_msg, 'result': result},
                )

                return Response(
                    {'error': error_msg,
                     'fb_push_status': 'failed'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        except MetaAdsServiceError as e:
            error_msg = str(e)
            campaign_request.fb_push_status = 'failed'
            campaign_request.fb_push_error = error_msg
            campaign_request.save(update_fields=['fb_push_status', 'fb_push_error'])

            CampaignActivityLog.log(
                campaign_request=campaign_request,
                action=CampaignActivityLog.ActionType.FB_PUSH_FAILED,
                message=f'Facebook gönderim hatası: {error_msg[:200]}',
                user=request.user,
                details={'error': error_msg, 'error_type': 'MetaAdsServiceError'},
            )

            return Response(
                {'error': error_msg, 'fb_push_status': 'failed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            error_msg = str(e)
            campaign_request.fb_push_status = 'failed'
            campaign_request.fb_push_error = error_msg
            campaign_request.save(update_fields=['fb_push_status', 'fb_push_error'])

            logger.error(f'[PushToFB] Beklenmeyen hata: {e}', exc_info=True)

            CampaignActivityLog.log(
                campaign_request=campaign_request,
                action=CampaignActivityLog.ActionType.FB_PUSH_FAILED,
                message=f'Beklenmeyen hata: {error_msg[:200]}',
                user=request.user,
                details={'error': error_msg, 'error_type': type(e).__name__},
            )

            return Response(
                {'error': f'Beklenmeyen bir hata oluştu: {error_msg}',
                 'fb_push_status': 'failed'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['get'], url_path='check-fb-status')
    def check_fb_status(self, request, pk=None):
        """
        Facebook kampanyasının güncel durumunu sorgula.
        Sadece admin/moderator kullanabilir.
        """
        campaign_request = self.get_object()

        if not campaign_request.fb_campaign_id:
            return Response(
                {'error': 'Bu kampanya henüz Facebook\'a gönderilmemiş.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            from .services.meta_ads_service import MetaAdsService

            service = MetaAdsService()
            result = service.check_campaign_status(campaign_request.fb_campaign_id)

            if result.get('success'):
                return Response({
                    'success': True,
                    'fb_campaign_id': campaign_request.fb_campaign_id,
                    'campaign_status': result,
                })
            else:
                return Response(
                    {'error': result.get('error', 'Durum sorgulanamadı.')},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'], url_path='upload-file')
    def upload_file(self, request, pk=None):
        """Kampanya için kreatif dosya yükle (Admin/Moderator only)"""
        campaign_request = self.get_object()
        
        if not (request.user.is_admin or request.user.is_moderator):
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
        
        # Dosya tipi validasyonu
        allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime']
        if file.content_type not in allowed_types:
            return Response(
                {'error': f'Desteklenmeyen dosya türü: {file.content_type}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 50MB limit
        if file.size > 50 * 1024 * 1024:
            return Response(
                {'error': 'Dosya boyutu 50MB\'dan büyük olamaz.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        file_type = request.data.get('file_type', 'post')
        
        creative_file = CampaignCreativeFile.objects.create(
            campaign_request=campaign_request,
            file=file,
            file_name=file.name,
            file_size=file.size,
            file_type=file_type,
        )

        CampaignActivityLog.log(
            campaign_request=campaign_request,
            action=CampaignActivityLog.ActionType.FILE_UPLOAD,
            message=f'Dosya yüklendi: {file.name} ({file_type})',
            user=request.user,
            details={'file_name': file.name, 'file_size': file.size, 'file_type': file_type},
        )
        
        serializer = CampaignCreativeFileSerializer(creative_file)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['delete'], url_path='delete-file/(?P<file_id>[^/.]+)')
    def delete_file(self, request, pk=None, file_id=None):
        """Kampanya kreatif dosyasını sil (Admin/Moderator only)"""
        campaign_request = self.get_object()
        
        if not (request.user.is_admin or request.user.is_moderator):
            return Response(
                {'error': 'Bu işlem için yetkiniz yok.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            creative_file = campaign_request.creative_files.get(id=file_id)
            file_name = creative_file.file_name
            creative_file.file.delete()  # Fiziksel dosyayı sil
            creative_file.delete()

            CampaignActivityLog.log(
                campaign_request=campaign_request,
                action=CampaignActivityLog.ActionType.FILE_DELETE,
                message=f'Dosya silindi: {file_name}',
                user=request.user,
                details={'file_name': file_name, 'file_id': int(file_id)},
            )

            return Response(status=status.HTTP_204_NO_CONTENT)
        except CampaignCreativeFile.DoesNotExist:
            return Response(
                {'error': 'Dosya bulunamadı.'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['get'])
    def report(self, request, pk=None):
        """Get campaign report with dummy data (will be replaced with real API later)"""
        campaign = self.get_object()
        
        # Generate dummy report data
        total_budget = float(campaign.budget)
        spent_percentage = random.uniform(0.3, 0.7)
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
