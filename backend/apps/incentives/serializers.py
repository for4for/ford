from rest_framework import serializers
from .models import IncentiveRequest


class IncentiveRequestSerializer(serializers.ModelSerializer):
    """Serializer for IncentiveRequest (List view)"""
    dealer_name = serializers.CharField(source='dealer.dealer_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = IncentiveRequest
        fields = [
            'id', 'dealer', 'dealer_name', 'incentive_title', 'incentive_amount',
            'event_time', 'event_venue', 'status', 'status_display',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class IncentiveRequestDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for IncentiveRequest"""
    dealer_name = serializers.CharField(source='dealer.dealer_name', read_only=True)
    dealer_code = serializers.CharField(source='dealer.dealer_code', read_only=True)
    dealer_contact_person = serializers.CharField(source='dealer.contact_person', read_only=True)
    dealer_email = serializers.CharField(source='dealer.email', read_only=True)
    dealer_phone = serializers.CharField(source='dealer.phone', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = IncentiveRequest
        fields = [
            'id', 'dealer', 'dealer_name', 'dealer_code', 'dealer_contact_person',
            'dealer_email', 'dealer_phone', 'incentive_title', 'incentive_details',
            'purpose', 'target_audience', 'incentive_amount', 'proposal_document',
            'event_time', 'event_location', 'event_venue',
            'map_link', 'performance_metrics', 'reference_image',
            'notes', 'status', 'status_display', 'admin_notes',
            'approved_amount', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class IncentiveRequestCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating IncentiveRequest"""
    
    class Meta:
        model = IncentiveRequest
        fields = [
            'id', 'dealer', 'incentive_title', 'incentive_details',
            'purpose', 'target_audience', 'incentive_amount', 'proposal_document',
            'event_time', 'event_location', 'event_venue',
            'map_link', 'performance_metrics', 'reference_image',
            'notes', 'status', 'admin_notes', 'approved_amount'
        ]
        read_only_fields = ['id']
        extra_kwargs = {
            'dealer': {'required': False, 'allow_null': True},
            'proposal_document': {'required': False},
            'reference_image': {'required': False},
            'incentive_title': {'required': False},
            'incentive_details': {'required': False},
            'purpose': {'required': False},
            'target_audience': {'required': False},
            'incentive_amount': {'required': False},
            'event_time': {'required': False},
            'event_location': {'required': False},
            'event_venue': {'required': False},
            'performance_metrics': {'required': False},
        }
    
    def validate_incentive_amount(self, value):
        """Validate that incentive_amount is positive when provided"""
        if value is not None and value < 0:
            raise serializers.ValidationError("Incentive amount cannot be negative.")
        return value
    
    def validate(self, attrs):
        """Validate the request data"""
        status = attrs.get('status', IncentiveRequest.Status.ONAY_BEKLIYOR)
        
        # Skip validation for draft status
        if status == IncentiveRequest.Status.TASLAK:
            return attrs
        
        # For non-draft status, validate required fields
        required_fields = [
            ('incentive_title', 'Teşvik başlığı zorunludur.'),
            ('incentive_details', 'Teşvik detayları zorunludur.'),
            ('purpose', 'Talebin amacı zorunludur.'),
            ('target_audience', 'Hedef kitle zorunludur.'),
            ('event_time', 'Etkinlik zamanı zorunludur.'),
            ('event_location', 'Etkinlik konumu zorunludur.'),
            ('event_venue', 'Etkinlik yeri zorunludur.'),
            ('performance_metrics', 'Performans metrikleri zorunludur.'),
        ]
        
        errors = {}
        for field, error_msg in required_fields:
            value = attrs.get(field)
            if not value or (isinstance(value, str) and not value.strip()):
                errors[field] = error_msg
        
        # Validate incentive_amount for non-draft
        incentive_amount = attrs.get('incentive_amount')
        if incentive_amount is None or incentive_amount <= 0:
            errors['incentive_amount'] = 'Teşvik tutarı sıfırdan büyük olmalıdır.'
        
        if errors:
            raise serializers.ValidationError(errors)
        
        # If status is onaylandi, approved_amount should be set
        if status == IncentiveRequest.Status.ONAYLANDI:
            if not attrs.get('approved_amount') and not self.instance:
                raise serializers.ValidationError({
                    'approved_amount': 'Onaylanan tutar belirtilmelidir.'
                })
        
        return attrs
