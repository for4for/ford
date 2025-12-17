from django.contrib import admin
from .models import VisualRequest, VisualRequestSize, VisualRequestCreative


class VisualRequestSizeInline(admin.TabularInline):
    """Inline admin for VisualRequestSize"""
    model = VisualRequestSize
    extra = 1


class VisualRequestCreativeInline(admin.TabularInline):
    """Inline admin for VisualRequestCreative"""
    model = VisualRequestCreative
    extra = 1


@admin.register(VisualRequest)
class VisualRequestAdmin(admin.ModelAdmin):
    """Admin configuration for VisualRequest model"""
    
    list_display = [
        'id', 'dealer', 'creative_work_request_short',
        'quantity_request', 'deadline', 'status', 'created_at'
    ]
    
    list_filter = ['status', 'deadline', 'created_at', 'dealer']
    
    search_fields = [
        'creative_work_request', 'work_details',
        'dealer__dealer_name', 'dealer__dealer_code'
    ]
    
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Dealer Information', {
            'fields': ('dealer', 'status')
        }),
        ('Request Details', {
            'fields': (
                'creative_work_request', 'quantity_request',
                'work_details', 'intended_message',
                'legal_text', 'deadline', 'reference_image'
            )
        }),
        ('Admin', {
            'fields': ('admin_notes', 'created_at', 'updated_at')
        }),
    )
    
    inlines = [VisualRequestSizeInline, VisualRequestCreativeInline]
    
    def creative_work_request_short(self, obj):
        return obj.creative_work_request[:50] + '...' if len(obj.creative_work_request) > 50 else obj.creative_work_request
    creative_work_request_short.short_description = 'Creative Work Request'


@admin.register(VisualRequestSize)
class VisualRequestSizeAdmin(admin.ModelAdmin):
    """Admin configuration for VisualRequestSize model"""
    
    list_display = ['id', 'visual_request', 'size', 'quantity']
    list_filter = ['visual_request']
    search_fields = ['size', 'visual_request__creative_work_request']


@admin.register(VisualRequestCreative)
class VisualRequestCreativeAdmin(admin.ModelAdmin):
    """Admin configuration for VisualRequestCreative model"""
    
    list_display = ['id', 'visual_request', 'creative_type', 'description_short']
    list_filter = ['creative_type', 'visual_request']
    search_fields = ['description', 'visual_request__creative_work_request']
    
    def description_short(self, obj):
        if not obj.description:
            return '-'
        return obj.description[:50] + '...' if len(obj.description) > 50 else obj.description
    description_short.short_description = 'Description'
