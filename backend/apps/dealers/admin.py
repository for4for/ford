from django.contrib import admin
from .models import Dealer, DealerBudget


class DealerBudgetInline(admin.TabularInline):
    """Inline admin for DealerBudget"""
    model = DealerBudget
    extra = 1
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Dealer)
class DealerAdmin(admin.ModelAdmin):
    """Admin configuration for Dealer model"""
    
    list_display = [
        'dealer_code', 'dealer_name', 'city', 'district', 
        'dealer_type', 'status', 'membership_date'
    ]
    
    list_filter = ['status', 'dealer_type', 'city', 'region', 'membership_date']
    
    search_fields = [
        'dealer_code', 'dealer_name', 'contact_first_name', 'contact_last_name',
        'regional_manager', 'email', 'phone'
    ]
    
    readonly_fields = ['membership_date', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('dealer_code', 'dealer_name', 'dealer_type', 'status')
        }),
        ('Contact Information', {
            'fields': ('city', 'district', 'address', 'phone', 'email', 'additional_emails')
        }),
        ('Responsible Persons', {
            'fields': ('contact_first_name', 'contact_last_name', 'regional_manager')
        }),
        ('Other Information', {
            'fields': ('tax_number', 'region', 'membership_date', 'updated_at')
        }),
    )
    
    inlines = [DealerBudgetInline]


@admin.register(DealerBudget)
class DealerBudgetAdmin(admin.ModelAdmin):
    """Admin configuration for DealerBudget model"""
    
    list_display = [
        'dealer', 'year', 'total_budget', 'used_budget', 
        'remaining_budget_display', 'usage_percentage_display'
    ]
    
    list_filter = ['year']
    
    search_fields = ['dealer__dealer_code', 'dealer__dealer_name']
    
    readonly_fields = ['created_at', 'updated_at', 'remaining_budget', 'usage_percentage']
    
    def remaining_budget_display(self, obj):
        return f"{obj.remaining_budget:,.2f} ₺"
    remaining_budget_display.short_description = 'Remaining Budget'
    
    def usage_percentage_display(self, obj):
        return f"{obj.usage_percentage:.1f}%"
    usage_percentage_display.short_description = 'Usage %'
