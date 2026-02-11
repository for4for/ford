from django.contrib import admin
from .models import CampaignRequest, MetaAdsConfig, CampaignCreativeFile, CampaignActivityLog


class CampaignCreativeFileInline(admin.TabularInline):
    model = CampaignCreativeFile
    extra = 0
    readonly_fields = ['file_name', 'file_size', 'uploaded_at']


class CampaignActivityLogInline(admin.TabularInline):
    model = CampaignActivityLog
    extra = 0
    readonly_fields = ['action', 'message', 'details', 'user', 'created_at']
    ordering = ['-created_at']
    can_delete = False

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(CampaignRequest)
class CampaignRequestAdmin(admin.ModelAdmin):
    """Admin configuration for CampaignRequest model"""
    
    inlines = [CampaignCreativeFileInline, CampaignActivityLogInline]
    
    list_display = [
        'id', 'dealer', 'campaign_name', 'budget',
        'start_date', 'end_date', 'campaign_type', 'status',
        'fb_push_status', 'created_at'
    ]
    
    list_filter = ['status', 'campaign_type', 'redirect_type', 'ad_model', 'fb_push_status', 'created_at', 'dealer']
    
    search_fields = [
        'campaign_name', 'notes',
        'dealer__dealer_name', 'dealer__dealer_code'
    ]
    
    readonly_fields = ['created_at', 'updated_at', 'fb_pushed_at']
    
    fieldsets = (
        ('Bayi Bilgileri', {
            'fields': ('dealer', 'status')
        }),
        ('Kampanya Bilgileri', {
            'fields': (
                'campaign_name', 'budget',
                'start_date', 'end_date', 'platforms'
            )
        }),
        ('Kampanya Türü', {
            'fields': (
                'campaign_type', 'fb_post_link', 'ig_post_link',
                'post_images', 'story_images'
            )
        }),
        ('Reklam Ayarları', {
            'fields': (
                'redirect_type', 'ad_model'
            )
        }),
        ('Facebook Kampanyası', {
            'fields': (
                'ad_message', 'website_url', 'cta_type',
            ),
            'description': 'Facebook\'a gönderilecek kampanya detayları'
        }),
        ('Facebook Gönderim Bilgileri', {
            'fields': (
                'fb_push_status', 'fb_push_error', 'fb_pushed_at',
                'fb_campaign_id', 'fb_adset_id', 'fb_creative_id', 'fb_ad_id',
            ),
            'classes': ('collapse',),
            'description': 'Facebook API yanıt bilgileri (otomatik doldurulur)'
        }),
        ('Notlar', {
            'fields': ('notes', 'admin_notes')
        }),
        ('Tarihler', {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(MetaAdsConfig)
class MetaAdsConfigAdmin(admin.ModelAdmin):
    """Admin configuration for MetaAdsConfig (Singleton)"""
    
    list_display = ['app_id', 'ad_account_id', 'default_objective', 'updated_at']
    
    fieldsets = (
        ('API Kimlik Bilgileri', {
            'fields': ('app_id', 'app_secret', 'access_token', 'ad_account_id')
        }),
        ('Varsayılan Ayarlar', {
            'fields': ('default_objective', 'default_optimization_goal', 'default_billing_event')
        }),
        ('Tarihler', {
            'fields': ('created_at', 'updated_at'),
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']
    
    def has_add_permission(self, request):
        """Singleton pattern - sadece 1 kayıt olabilir"""
        if MetaAdsConfig.objects.exists():
            return False
        return super().has_add_permission(request)


@admin.register(CampaignActivityLog)
class CampaignActivityLogAdmin(admin.ModelAdmin):
    """Kampanya aktivite logları - salt okunur"""

    list_display = ['id', 'campaign_request', 'action', 'message_short', 'user', 'created_at']
    list_filter = ['action', 'created_at']
    search_fields = ['message', 'campaign_request__campaign_name']
    readonly_fields = ['campaign_request', 'action', 'message', 'details', 'user', 'created_at']
    ordering = ['-created_at']

    def message_short(self, obj):
        return obj.message[:80] + '...' if len(obj.message) > 80 else obj.message
    message_short.short_description = 'Mesaj'

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
