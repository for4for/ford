from rest_framework import serializers
from .models import VisualRequest, VisualRequestSize, VisualRequestCreative, VisualRequestReferenceFile, VisualRequestDeliveredFile


class VisualRequestReferenceFileSerializer(serializers.ModelSerializer):
    """Serializer for VisualRequestReferenceFile"""
    
    class Meta:
        model = VisualRequestReferenceFile
        fields = ['id', 'file', 'file_name', 'file_size', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']


class VisualRequestDeliveredFileSerializer(serializers.ModelSerializer):
    """Serializer for VisualRequestDeliveredFile"""
    
    class Meta:
        model = VisualRequestDeliveredFile
        fields = ['id', 'file', 'file_name', 'file_size', 'note', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']


class VisualRequestSizeSerializer(serializers.ModelSerializer):
    """Serializer for VisualRequestSize"""
    
    class Meta:
        model = VisualRequestSize
        fields = ['id', 'size', 'quantity']


class VisualRequestCreativeSerializer(serializers.ModelSerializer):
    """Serializer for VisualRequestCreative"""
    creative_type_display = serializers.CharField(
        source='get_creative_type_display',
        read_only=True
    )
    
    class Meta:
        model = VisualRequestCreative
        fields = ['id', 'creative_type', 'creative_type_display', 'description']


class VisualRequestSerializer(serializers.ModelSerializer):
    """Serializer for VisualRequest (List view)"""
    dealer_name = serializers.CharField(source='dealer.dealer_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    assigned_to_display = serializers.CharField(source='get_assigned_to_display', read_only=True)
    
    class Meta:
        model = VisualRequest
        fields = [
            'id', 'dealer', 'dealer_name', 'creative_work_request',
            'quantity_request', 'deadline', 'status', 'status_display',
            'assigned_to', 'assigned_to_display',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class VisualRequestDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for VisualRequest"""
    dealer_name = serializers.CharField(source='dealer.dealer_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    assigned_to_display = serializers.CharField(source='get_assigned_to_display', read_only=True)
    sizes = VisualRequestSizeSerializer(many=True, read_only=True)
    creatives = VisualRequestCreativeSerializer(many=True, read_only=True)
    reference_files = VisualRequestReferenceFileSerializer(many=True, read_only=True)
    delivered_files = VisualRequestDeliveredFileSerializer(many=True, read_only=True)
    
    class Meta:
        model = VisualRequest
        fields = [
            'id', 'dealer', 'dealer_name', 'creative_work_request',
            'quantity_request', 'work_details', 'intended_message',
            'legal_text', 'deadline', 'reference_image', 'creative_image',
            'status', 'status_display', 'assigned_to', 'assigned_to_display',
            'admin_notes', 'sizes', 'creatives', 'reference_files', 'delivered_files',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class VisualRequestCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating VisualRequest"""
    sizes = VisualRequestSizeSerializer(many=True)
    creatives = VisualRequestCreativeSerializer(many=True)
    
    class Meta:
        model = VisualRequest
        fields = [
            'id', 'dealer', 'creative_work_request', 'quantity_request',
            'work_details', 'intended_message', 'legal_text',
            'deadline', 'reference_image', 'creative_image', 'status',
            'assigned_to', 'admin_notes', 'sizes', 'creatives'
        ]
        read_only_fields = ['id']
        extra_kwargs = {
            'dealer': {'required': False, 'allow_null': True},
            'assigned_to': {'required': False, 'allow_null': True},
            'creative_image': {'required': False, 'allow_null': True}
        }
    
    def create(self, validated_data):
        sizes_data = validated_data.pop('sizes')
        creatives_data = validated_data.pop('creatives')
        
        visual_request = VisualRequest.objects.create(**validated_data)
        
        # Create sizes
        for size_data in sizes_data:
            VisualRequestSize.objects.create(
                visual_request=visual_request,
                **size_data
            )
        
        # Create creatives
        for creative_data in creatives_data:
            VisualRequestCreative.objects.create(
                visual_request=visual_request,
                **creative_data
            )
        
        return visual_request
    
    def update(self, instance, validated_data):
        sizes_data = validated_data.pop('sizes', None)
        creatives_data = validated_data.pop('creatives', None)
        
        # Update main fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update sizes if provided
        if sizes_data is not None:
            # Delete existing sizes
            instance.sizes.all().delete()
            # Create new sizes
            for size_data in sizes_data:
                VisualRequestSize.objects.create(
                    visual_request=instance,
                    **size_data
                )
        
        # Update creatives if provided
        if creatives_data is not None:
            # Delete existing creatives
            instance.creatives.all().delete()
            # Create new creatives
            for creative_data in creatives_data:
                VisualRequestCreative.objects.create(
                    visual_request=instance,
                    **creative_data
                )
        
        return instance
    
    def validate(self, attrs):
        """Validate the request data"""
        if 'sizes' in attrs and len(attrs['sizes']) == 0:
            raise serializers.ValidationError({
                'sizes': 'At least one size must be specified.'
            })
        
        if 'creatives' in attrs and len(attrs['creatives']) == 0:
            raise serializers.ValidationError({
                'creatives': 'At least one creative type must be selected.'
            })
        
        return attrs
