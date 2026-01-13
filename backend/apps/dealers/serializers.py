from rest_framework import serializers
from .models import Dealer, DealerBudget, DealerBudgetPlan, Brand


class BrandSerializer(serializers.ModelSerializer):
    """Serializer for Brand model"""
    dealer_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Brand
        fields = [
            'id', 'name', 'code', 'logo', 
            'fb_ad_account_id', 'ig_ad_account_id', 'google_ad_account_id',
            'is_active', 'dealer_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_dealer_count(self, obj):
        """Markaya bağlı bayi sayısı"""
        return obj.dealers.count()
    
    def validate_code(self, value):
        if value:
            return value.upper()
        return value


class DealerBudgetPlanSerializer(serializers.ModelSerializer):
    """Serializer for DealerBudgetPlan model - Baremli Bütçe Planlaması"""
    remaining_amount = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        read_only=True
    )
    usage_percentage = serializers.FloatField(read_only=True)
    
    class Meta:
        model = DealerBudgetPlan
        fields = [
            'id', 'dealer', 'start_date', 'end_date', 'budget_amount',
            'used_amount', 'remaining_amount', 'usage_percentage',
            'description', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate(self, attrs):
        """Tarih aralığı validasyonu"""
        start_date = attrs.get('start_date')
        end_date = attrs.get('end_date')
        
        if start_date and end_date and start_date > end_date:
            raise serializers.ValidationError({
                'end_date': 'Bitiş tarihi başlangıç tarihinden önce olamaz.'
            })
        return attrs


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
    brand_name = serializers.CharField(source='brand.name', read_only=True)
    
    class Meta:
        model = Dealer
        fields = [
            'id', 'dealer_code', 'dealer_name', 'city', 'district', 'address',
            'phone', 'email', 'contact_first_name', 'contact_last_name', 'regional_manager',
            'additional_emails', 'tax_number', 'dealer_type', 'region',
            'status', 'membership_date', 'updated_at', 'is_active',
            'current_budget', 'brand', 'brand_name'
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
    budget_plans = DealerBudgetPlanSerializer(many=True, read_only=True)
    
    # Statistics
    total_visual_requests = serializers.SerializerMethodField()
    total_incentive_requests = serializers.SerializerMethodField()
    
    class Meta(DealerSerializer.Meta):
        fields = DealerSerializer.Meta.fields + [
            'budgets', 'budget_plans', 'total_visual_requests', 'total_incentive_requests'
        ]
    
    def get_total_visual_requests(self, obj):
        """Get total visual requests count"""
        return obj.visual_requests.count()
    
    def get_total_incentive_requests(self, obj):
        """Get total incentive requests count"""
        return obj.incentive_requests.count()


class DealerBudgetPlanWriteSerializer(serializers.ModelSerializer):
    """Nested write serializer for budget plans"""
    id = serializers.IntegerField(required=False)
    
    class Meta:
        model = DealerBudgetPlan
        fields = ['id', 'start_date', 'end_date', 'budget_amount', 'description', 'is_active']
    
    def validate(self, attrs):
        start_date = attrs.get('start_date')
        end_date = attrs.get('end_date')
        if start_date and end_date and start_date > end_date:
            raise serializers.ValidationError({
                'end_date': 'Bitiş tarihi başlangıç tarihinden önce olamaz.'
            })
        return attrs


class DealerCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating dealers"""
    budget_plans = DealerBudgetPlanWriteSerializer(many=True, required=False)
    
    class Meta:
        model = Dealer
        fields = [
            'id', 'dealer_code', 'dealer_name', 'city', 'district', 'address',
            'phone', 'email', 'contact_first_name', 'contact_last_name', 'regional_manager',
            'additional_emails', 'tax_number', 'dealer_type', 'region', 'status',
            'brand', 'budget_plans'
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
    
    def create(self, validated_data):
        budget_plans_data = validated_data.pop('budget_plans', [])
        dealer = super().create(validated_data)
        
        for plan_data in budget_plans_data:
            plan_data.pop('id', None)  # Remove id for new records
            DealerBudgetPlan.objects.create(dealer=dealer, **plan_data)
        
        return dealer
    
    def update(self, instance, validated_data):
        budget_plans_data = validated_data.pop('budget_plans', None)
        dealer = super().update(instance, validated_data)
        
        if budget_plans_data is not None:
            # Get existing plan IDs
            existing_ids = set(instance.budget_plans.values_list('id', flat=True))
            incoming_ids = set()
            
            for plan_data in budget_plans_data:
                plan_id = plan_data.pop('id', None)
                
                if plan_id and plan_id in existing_ids:
                    # Update existing plan
                    DealerBudgetPlan.objects.filter(id=plan_id).update(**plan_data)
                    incoming_ids.add(plan_id)
                else:
                    # Create new plan
                    new_plan = DealerBudgetPlan.objects.create(dealer=dealer, **plan_data)
                    incoming_ids.add(new_plan.id)
            
            # Delete removed plans
            plans_to_delete = existing_ids - incoming_ids
            DealerBudgetPlan.objects.filter(id__in=plans_to_delete).delete()
        
        return dealer
