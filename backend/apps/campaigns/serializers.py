from rest_framework import serializers
from .models import CampaignRequest, CampaignCreativeFile, CampaignActivityLog


class CampaignCreativeFileSerializer(serializers.ModelSerializer):
    """Serializer for CampaignCreativeFile"""
    
    class Meta:
        model = CampaignCreativeFile
        fields = ['id', 'file', 'file_name', 'file_size', 'file_type', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']


class CampaignActivityLogSerializer(serializers.ModelSerializer):
    """Serializer for CampaignActivityLog"""
    action_display = serializers.CharField(source='get_action_display', read_only=True)
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = CampaignActivityLog
        fields = ['id', 'action', 'action_display', 'message', 'details', 'user', 'user_name', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_user_name(self, obj):
        if obj.user:
            full = f"{obj.user.first_name} {obj.user.last_name}".strip()
            return full or obj.user.email
        return 'Sistem'


class CampaignRequestSerializer(serializers.ModelSerializer):
    """Serializer for CampaignRequest (List view)"""
    dealer_name = serializers.CharField(source='dealer.dealer_name', read_only=True)
    brand_name = serializers.CharField(source='brand.name', read_only=True, allow_null=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    campaign_type_display = serializers.CharField(source='get_campaign_type_display', read_only=True)
    fb_push_status_display = serializers.CharField(source='get_fb_push_status_display', read_only=True)
    platforms_display = serializers.CharField(read_only=True)
    
    class Meta:
        model = CampaignRequest
        fields = [
            'id', 'dealer', 'dealer_name', 'brand', 'brand_name', 'campaign_name', 'budget',
            'start_date', 'end_date', 'platforms', 'platforms_display',
            'campaign_type', 'campaign_type_display', 'status', 'status_display',
            'fb_push_status', 'fb_push_status_display',
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
    dealer_sales_url = serializers.CharField(source='dealer.sales_url', read_only=True)
    dealer_service_url = serializers.CharField(source='dealer.service_url', read_only=True)
    brand_name = serializers.CharField(source='brand.name', read_only=True, allow_null=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    campaign_type_display = serializers.CharField(source='get_campaign_type_display', read_only=True)
    redirect_type_display = serializers.CharField(source='get_redirect_type_display', read_only=True)
    ad_model_display = serializers.CharField(source='get_ad_model_display', read_only=True)
    cta_type_display = serializers.CharField(source='get_cta_type_display', read_only=True)
    fb_push_status_display = serializers.CharField(source='get_fb_push_status_display', read_only=True)
    platforms_display = serializers.CharField(read_only=True)
    creative_files = CampaignCreativeFileSerializer(many=True, read_only=True)
    activity_logs = CampaignActivityLogSerializer(many=True, read_only=True)
    
    class Meta:
        model = CampaignRequest
        fields = [
            'id', 'dealer', 'dealer_name', 'dealer_code', 'dealer_contact_first_name', 'dealer_contact_last_name',
            'dealer_email', 'dealer_phone', 'dealer_sales_url', 'dealer_service_url',
            'brand', 'brand_name', 'campaign_name', 'budget',
            'start_date', 'end_date', 'platforms', 'platforms_display',
            'campaign_type', 'campaign_type_display',
            'fb_post_link', 'ig_post_link', 'post_images', 'story_images',
            'redirect_type', 'redirect_type_display',
            'ad_model', 'ad_model_display',
            # Kreatif dosyaları
            'creative_files',
            # Facebook kampanya alanları
            'ad_message', 'website_url', 'cta_type', 'cta_type_display',
            # Facebook API yanıt bilgileri
            'fb_campaign_id', 'fb_adset_id', 'fb_creative_id', 'fb_ad_id',
            'fb_push_status', 'fb_push_status_display', 'fb_push_error', 'fb_pushed_at',
            'notes', 'status', 'status_display', 'admin_notes',
            # Aktivite logları
            'activity_logs',
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
            # Facebook kampanya alanları (admin-only)
            'ad_message', 'website_url', 'cta_type',
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
            'ad_message': {'required': False, 'allow_blank': True},
            'website_url': {'required': False, 'allow_blank': True, 'allow_null': True},
            'cta_type': {'required': False},
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




