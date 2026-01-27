from rest_framework import serializers
from .models import CampaignRequest


class CampaignRequestSerializer(serializers.ModelSerializer):
    """Serializer for CampaignRequest (List view)"""
    dealer_name = serializers.CharField(source='dealer.dealer_name', read_only=True)
    brand_name = serializers.CharField(source='brand.name', read_only=True, allow_null=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    campaign_type_display = serializers.CharField(source='get_campaign_type_display', read_only=True)
    platforms_display = serializers.CharField(read_only=True)
    
    class Meta:
        model = CampaignRequest
        fields = [
            'id', 'dealer', 'dealer_name', 'brand', 'brand_name', 'campaign_name', 'budget',
            'start_date', 'end_date', 'platforms', 'platforms_display',
            'campaign_type', 'campaign_type_display', 'status', 'status_display',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CampaignRequestDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for CampaignRequest"""
    dealer_name = serializers.CharField(source='dealer.dealer_name', read_only=True)
    dealer_code = serializers.CharField(source='dealer.dealer_code', read_only=True)
    dealer_contact_first_name = serializers.CharField(source='dealer.contact_first_name', read_only=True)
    dealer_contact_last_name = serializers.CharField(source='dealer.contact_last_name', read_only=True)
    dealer_email = serializers.CharField(source='dealer.email', read_only=True)
    dealer_phone = serializers.CharField(source='dealer.phone', read_only=True)
    brand_name = serializers.CharField(source='brand.name', read_only=True, allow_null=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    campaign_type_display = serializers.CharField(source='get_campaign_type_display', read_only=True)
    redirect_type_display = serializers.CharField(source='get_redirect_type_display', read_only=True)
    ad_model_display = serializers.CharField(source='get_ad_model_display', read_only=True)
    platforms_display = serializers.CharField(read_only=True)
    
    class Meta:
        model = CampaignRequest
        fields = [
            'id', 'dealer', 'dealer_name', 'dealer_code', 'dealer_contact_first_name', 'dealer_contact_last_name',
            'dealer_email', 'dealer_phone', 'brand', 'brand_name', 'campaign_name', 'budget',
            'start_date', 'end_date', 'platforms', 'platforms_display',
            'campaign_type', 'campaign_type_display',
            'fb_post_link', 'ig_post_link', 'post_images', 'story_images',
            'redirect_type', 'redirect_type_display',
            'ad_model', 'ad_model_display',
            'notes', 'status', 'status_display', 'admin_notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CampaignRequestCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating CampaignRequest"""
    
    class Meta:
        model = CampaignRequest
        fields = [
            'id', 'dealer', 'brand', 'campaign_name', 'budget',
            'start_date', 'end_date', 'platforms',
            'campaign_type', 'fb_post_link', 'ig_post_link',
            'post_images', 'story_images',
            'redirect_type', 'ad_model',
            'notes', 'status', 'admin_notes'
        ]
        read_only_fields = ['id']
        extra_kwargs = {
            'dealer': {'required': False, 'allow_null': True},
            'brand': {'required': False, 'allow_null': True},
            'fb_post_link': {'required': False, 'allow_blank': True, 'allow_null': True},
            'ig_post_link': {'required': False, 'allow_blank': True, 'allow_null': True},
            'post_images': {'required': False},
            'story_images': {'required': False},
        }
    
    def validate_budget(self, value):
        """Validate that budget is positive"""
        if value <= 0:
            raise serializers.ValidationError("Bütçe sıfırdan büyük olmalıdır.")
        return value
    
    def validate(self, attrs):
        """Validate the request data"""
        # Check date range
        start_date = attrs.get('start_date')
        end_date = attrs.get('end_date')
        
        if start_date and end_date and start_date > end_date:
            raise serializers.ValidationError({
                'end_date': 'Bitiş tarihi başlangıç tarihinden sonra olmalıdır.'
            })
        
        # Check platforms
        platforms = attrs.get('platforms', [])
        if not platforms:
            raise serializers.ValidationError({
                'platforms': 'En az bir platform seçilmelidir.'
            })
        
        # Validate campaign type specific fields
        # NOT: Kampanya türü seçimi Tofaş için devre dışı (ENABLE_CAMPAIGN_TYPE_SELECTION = false)
        # Ford için aktif edildiğinde bu validasyon açılabilir
        # campaign_type = attrs.get('campaign_type')
        # 
        # if campaign_type == CampaignRequest.CampaignType.LINK:
        #     # Link type requires at least one post link
        #     fb_link = attrs.get('fb_post_link')
        #     ig_link = attrs.get('ig_post_link')
        #     if not fb_link and not ig_link:
        #         raise serializers.ValidationError({
        #             'fb_post_link': 'Link kampanyası için en az bir post linki gereklidir.'
        #         })
        
        return attrs


class CampaignReportSerializer(serializers.Serializer):
    """Serializer for Campaign Report (dummy data)"""
    campaign_id = serializers.IntegerField()
    campaign_name = serializers.CharField()
    status = serializers.CharField()
    status_display = serializers.CharField()
    platforms = serializers.ListField()
    platforms_display = serializers.CharField()
    start_date = serializers.DateField()
    end_date = serializers.DateField()
    
    # Budget info
    total_budget = serializers.DecimalField(max_digits=12, decimal_places=2)
    spent_budget = serializers.DecimalField(max_digits=12, decimal_places=2)
    remaining_budget = serializers.DecimalField(max_digits=12, decimal_places=2)
    budget_percentage = serializers.FloatField()
    
    # Performance metrics
    impressions = serializers.IntegerField()
    clicks = serializers.IntegerField()
    ctr = serializers.FloatField()
    cpm = serializers.DecimalField(max_digits=10, decimal_places=2)
    cpc = serializers.DecimalField(max_digits=10, decimal_places=2)
    reach = serializers.IntegerField()
    
    # Engagement metrics
    likes = serializers.IntegerField()
    comments = serializers.IntegerField()
    shares = serializers.IntegerField()
    saves = serializers.IntegerField()
    
    # Conversion metrics
    form_submissions = serializers.IntegerField()
    website_visits = serializers.IntegerField()
    phone_calls = serializers.IntegerField()




