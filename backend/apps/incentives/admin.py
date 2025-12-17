from django.contrib import admin
from .models import IncentiveRequest


@admin.register(IncentiveRequest)
class IncentiveRequestAdmin(admin.ModelAdmin):
    """Admin configuration for IncentiveRequest model"""
    
    list_display = [
        'id', 'dealer', 'incentive_title_short', 'incentive_amount',
        'event_time', 'status', 'created_at'
    ]
    
    list_filter = ['status', 'event_time', 'created_at', 'dealer']
    
    search_fields = [
        'incentive_title', 'incentive_details',
        'dealer__dealer_name', 'dealer__dealer_code',
        'event_venue'
    ]
    
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Dealer Information', {
            'fields': ('dealer', 'status')
        }),
        ('Request Details', {
            'fields': (
                'incentive_title', 'incentive_details',
                'purpose', 'target_audience', 'incentive_amount',
                'proposal_document'
            )
        }),
        ('Event Information', {
            'fields': (
                'event_time', 'event_location',
                'event_venue', 'map_link'
            )
        }),
        ('Performance and Attachments', {
            'fields': (
                'performance_metrics', 'reference_image', 'notes'
            )
        }),
        ('Admin', {
            'fields': ('admin_notes', 'approved_amount', 'created_at', 'updated_at')
        }),
    )
    
    def incentive_title_short(self, obj):
        return obj.incentive_title[:50] + '...' if len(obj.incentive_title) > 50 else obj.incentive_title
    incentive_title_short.short_description = 'Incentive Title'
