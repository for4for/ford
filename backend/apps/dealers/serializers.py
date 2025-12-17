from rest_framework import serializers
from .models import Dealer, DealerBudget


class DealerBudgetSerializer(serializers.ModelSerializer):
    """Serializer for DealerBudget model"""
    remaining_budget = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        read_only=True
    )
    usage_percentage = serializers.FloatField(read_only=True)
    
    class Meta:
        model = DealerBudget
        fields = [
            'id', 'dealer', 'year', 'total_budget', 'used_budget',
            'remaining_budget', 'usage_percentage', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class DealerSerializer(serializers.ModelSerializer):
    """Serializer for Dealer model"""
    is_active = serializers.BooleanField(read_only=True)
    current_budget = serializers.SerializerMethodField()
    
    class Meta:
        model = Dealer
        fields = [
            'id', 'dealer_code', 'dealer_name', 'city', 'district', 'address',
            'phone', 'email', 'contact_person', 'regional_manager',
            'additional_emails', 'tax_number', 'dealer_type', 'region',
            'status', 'membership_date', 'updated_at', 'is_active',
            'current_budget'
        ]
        read_only_fields = ['id', 'membership_date', 'updated_at']
    
    def get_current_budget(self, obj):
        """Get current year budget"""
        from datetime import datetime
        current_year = datetime.now().year
        
        try:
            budget = obj.budgets.get(year=current_year)
            return DealerBudgetSerializer(budget).data
        except DealerBudget.DoesNotExist:
            return None
    
    def validate_dealer_code(self, value):
        """Validate dealer_code format"""
        # Can add custom validation rules here
        if not value:
            raise serializers.ValidationError("Dealer code cannot be empty.")
        return value.upper()
    
    def validate_additional_emails(self, value):
        """Validate email list"""
        if not isinstance(value, list):
            raise serializers.ValidationError("Email list must be an array.")
        
        # Validate each email
        from django.core.validators import EmailValidator
        validator = EmailValidator()
        
        for email in value:
            try:
                validator(email)
            except Exception:
                raise serializers.ValidationError(f"Invalid email: {email}")
        
        return value


class DealerDetailSerializer(DealerSerializer):
    """Detailed serializer for Dealer with all budgets"""
    budgets = DealerBudgetSerializer(many=True, read_only=True)
    
    # Statistics
    total_visual_requests = serializers.SerializerMethodField()
    total_incentive_requests = serializers.SerializerMethodField()
    
    class Meta(DealerSerializer.Meta):
        fields = DealerSerializer.Meta.fields + [
            'budgets', 'total_visual_requests', 'total_incentive_requests'
        ]
    
    def get_total_visual_requests(self, obj):
        """Get total visual requests count"""
        return obj.visual_requests.count()
    
    def get_total_incentive_requests(self, obj):
        """Get total incentive requests count"""
        return obj.incentive_requests.count()


class DealerCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating dealers"""
    
    class Meta:
        model = Dealer
        fields = [
            'id', 'dealer_code', 'dealer_name', 'city', 'district', 'address',
            'phone', 'email', 'contact_person', 'regional_manager',
            'additional_emails', 'tax_number', 'dealer_type', 'region', 'status'
        ]
        read_only_fields = ['id']
        extra_kwargs = {
            'dealer_code': {'required': False}  # Not required for updates, required for create
        }
    
    def validate_dealer_code(self, value):
        if value:
            return value.upper()
        return value
    
    def validate(self, attrs):
        """Ensure dealer_code is present for create operations"""
        if not self.instance and not attrs.get('dealer_code'):
            raise serializers.ValidationError({
                'dealer_code': 'Yeni bayi oluştururken bayi kodu zorunludur.'
            })
        return attrs
