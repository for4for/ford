from django.contrib import admin
from .models import CampaignRequest


@admin.register(CampaignRequest)
class CampaignRequestAdmin(admin.ModelAdmin):
    """Admin configuration for CampaignRequest model"""
    
    list_display = [
        'id', 'dealer', 'campaign_name', 'budget',
        'start_date', 'end_date', 'campaign_type', 'status', 'created_at'
    ]
    
    list_filter = ['status', 'campaign_type', 'redirect_type', 'ad_model', 'created_at', 'dealer']
    
    search_fields = [
        'campaign_name', 'notes',
        'dealer__dealer_name', 'dealer__dealer_code'
    ]
    
    readonly_fields = ['created_at', 'updated_at']
    
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
        ('Notlar', {
            'fields': ('notes', 'admin_notes')
        }),
        ('Tarihler', {
            'fields': ('created_at', 'updated_at')
        }),
    )






