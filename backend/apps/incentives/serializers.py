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
        }
    
    def validate_incentive_amount(self, value):
        """Validate that incentive_amount is positive"""
        if value <= 0:
            raise serializers.ValidationError("Incentive amount must be greater than zero.")
        return value
    
    def validate(self, attrs):
        """Validate the request data"""
        # If status is onaylandi, approved_amount should be set
        if attrs.get('status') == IncentiveRequest.Status.ONAYLANDI:
            if not attrs.get('approved_amount') and not self.instance:
                raise serializers.ValidationError({
                    'approved_amount': 'Approved amount must be specified for approved requests.'
                })
        
        return attrs
