import uuid
import os
from django.conf import settings
from django.db import models
from django.core.exceptions import ValidationError
from apps.dealers.models import Dealer, Brand


def campaign_creative_upload_path(instance, filename):
    """Kampanya kreatif dosyaları için UUID tabanlı dosya yolu"""
    ext = os.path.splitext(filename)[1].lower()
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    return os.path.join('campaigns/creatives', unique_filename)


class MetaAdsConfig(models.Model):
    """Meta (Facebook) Ads API konfigürasyon modeli - Singleton"""
    
    class DefaultObjective(models.TextChoices):
        OUTCOME_TRAFFIC = 'OUTCOME_TRAFFIC', 'Trafik'
        OUTCOME_ENGAGEMENT = 'OUTCOME_ENGAGEMENT', 'Etkileşim'
        OUTCOME_LEADS = 'OUTCOME_LEADS', 'Potansiyel Müşteri'
        OUTCOME_AWARENESS = 'OUTCOME_AWARENESS', 'Farkındalık'
        OUTCOME_SALES = 'OUTCOME_SALES', 'Satış'
    
    class DefaultBillingEvent(models.TextChoices):
        IMPRESSIONS = 'IMPRESSIONS', 'Gösterim'
        LINK_CLICKS = 'LINK_CLICKS', 'Tıklama'
    
    class DefaultOptimizationGoal(models.TextChoices):
        REACH = 'REACH', 'Erişim'
        LINK_CLICKS = 'LINK_CLICKS', 'Bağlantı Tıklamaları'
        IMPRESSIONS = 'IMPRESSIONS', 'Gösterim'
        LANDING_PAGE_VIEWS = 'LANDING_PAGE_VIEWS', 'Sayfa Görüntüleme'
        LEAD_GENERATION = 'LEAD_GENERATION', 'Potansiyel Müşteri'
    
    app_id = models.CharField(
        max_length=100,
        verbose_name='App ID'
    )
    
    app_secret = models.CharField(
        max_length=200,
        verbose_name='App Secret'
    )
    
    access_token = models.TextField(
        verbose_name='Access Token'
    )
    
    ad_account_id = models.CharField(
        max_length=100,
        verbose_name='Reklam Hesabı ID',
        help_text='act_ prefixi ile birlikte, örn: act_123456789'
    )
    
    default_objective = models.CharField(
        max_length=50,
        choices=DefaultObjective.choices,
        default=DefaultObjective.OUTCOME_TRAFFIC,
        verbose_name='Varsayılan Hedef'
    )
    
    default_billing_event = models.CharField(
        max_length=50,
        choices=DefaultBillingEvent.choices,
        default=DefaultBillingEvent.IMPRESSIONS,
        verbose_name='Varsayılan Faturalandırma'
    )
    
    default_optimization_goal = models.CharField(
        max_length=50,
        choices=DefaultOptimizationGoal.choices,
        default=DefaultOptimizationGoal.REACH,
        verbose_name='Varsayılan Optimizasyon Hedefi'
    )
    
    is_active = models.BooleanField(
        default=True,
        verbose_name='Aktif'
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Oluşturulma Tarihi'
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Güncellenme Tarihi'
    )
    
    class Meta:
        verbose_name = 'Meta Ads Konfigürasyon'
        verbose_name_plural = 'Meta Ads Konfigürasyon'
    
    def __str__(self):
        return f"Meta Ads Config (Account: {self.ad_account_id})"
    
    def save(self, *args, **kwargs):
        """Singleton: sadece bir kayıt olabilir"""
        if not self.pk and MetaAdsConfig.objects.exists():
            raise ValidationError('Sadece bir Meta Ads konfigürasyonu olabilir.')
        super().save(*args, **kwargs)
    
    @classmethod
    def get_config(cls):
        """Aktif konfigürasyonu getir"""
        return cls.objects.filter(is_active=True).first()


class CampaignRequest(models.Model):
    """Kampanya Talebi (Campaign Request) model"""
    
    class Status(models.TextChoices):
        TASLAK = 'taslak', 'Taslak'
        ONAY_BEKLIYOR = 'onay_bekliyor', 'Onay Bekliyor'
        ONAYLANDI = 'onaylandi', 'Onaylandı'
        REDDEDILDI = 'reddedildi', 'Reddedildi'
        YAYINDA = 'yayinda', 'Yayında'
        TAMAMLANDI = 'tamamlandi', 'Tamamlandı'
    
    class CampaignType(models.TextChoices):
        LINK = 'link', 'Link ile Kampanya'
        UPLOAD = 'upload', 'Görsel Yükleyerek Kampanya'
    
    class RedirectType(models.TextChoices):
        SATIS = 'satis', 'Satış'
        SERVIS = 'servis', 'Servis'
        DIGER = 'diger', 'Diğer'
    
    class AdModel(models.TextChoices):
        BAYI_SAYFASI = 'bayi_sayfasi', 'Bayi Sayfası'
        FORM_YONLENDIRME = 'form_yonlendirme', 'Form Doldurma Sayfasına Yönlendirme'
        LEASING = 'leasing', 'Leasing'
    
    class CTAType(models.TextChoices):
        LEARN_MORE = 'LEARN_MORE', 'Daha Fazla Bilgi'
        CONTACT_US = 'CONTACT_US', 'İletişime Geç'
        SHOP_NOW = 'SHOP_NOW', 'Hemen Al'
        SIGN_UP = 'SIGN_UP', 'Kaydol'
        GET_QUOTE = 'GET_QUOTE', 'Teklif Al'
        BOOK_NOW = 'BOOK_NOW', 'Randevu Al'
        APPLY_NOW = 'APPLY_NOW', 'Başvur'
        CALL_NOW = 'CALL_NOW', 'Şimdi Ara'
        SEND_MESSAGE = 'SEND_MESSAGE', 'Mesaj Gönder'
        WHATSAPP_MESSAGE = 'WHATSAPP_MESSAGE', 'WhatsApp Mesajı'
        GET_OFFER = 'GET_OFFER', 'Teklifi Al'
        ORDER_NOW = 'ORDER_NOW', 'Sipariş Ver'
        WATCH_MORE = 'WATCH_MORE', 'Daha Fazla İzle'
        SUBSCRIBE = 'SUBSCRIBE', 'Abone Ol'
        DOWNLOAD = 'DOWNLOAD', 'İndir'
        NO_BUTTON = 'NO_BUTTON', 'Buton Yok'
    
    class FBPushStatus(models.TextChoices):
        PENDING = 'pending', 'Bekliyor'
        PUSHING = 'pushing', 'Gönderiliyor'
        SUCCESS = 'success', 'Başarılı'
        FAILED = 'failed', 'Başarısız'
    
    dealer = models.ForeignKey(
        Dealer,
        on_delete=models.CASCADE,
        related_name='campaign_requests',
        verbose_name='Dealer'
    )
    
    brand = models.ForeignKey(
        Brand,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='campaign_requests',
        verbose_name='Marka'
    )
    
    campaign_name = models.CharField(
        max_length=200,
        verbose_name='Kampanya Adı'
    )
    
    budget = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name='Bütçe (TL)'
    )
    
    start_date = models.DateField(
        verbose_name='Başlangıç Tarihi'
    )
    
    end_date = models.DateField(
        verbose_name='Bitiş Tarihi'
    )
    
    # Platform seçimi - JSON array olarak ["instagram", "facebook"]
    platforms = models.JSONField(
        default=list,
        verbose_name='Platformlar'
    )
    
    campaign_type = models.CharField(
        max_length=20,
        choices=CampaignType.choices,
        default=CampaignType.LINK,
        verbose_name='Kampanya Türü'
    )
    
    # Senaryo 1: Link ile kampanya
    fb_post_link = models.URLField(
        blank=True,
        null=True,
        verbose_name='Facebook Post Linki'
    )
    
    ig_post_link = models.URLField(
        blank=True,
        null=True,
        verbose_name='Instagram Post Linki'
    )
    
    # Senaryo 2: Görsel yükleme - JSON array olarak dosya yolları
    post_images = models.JSONField(
        default=list,
        blank=True,
        verbose_name='Post Görselleri'
    )
    
    story_images = models.JSONField(
        default=list,
        blank=True,
        verbose_name='Story Görselleri'
    )
    
    redirect_type = models.CharField(
        max_length=20,
        choices=RedirectType.choices,
        default=RedirectType.SATIS,
        verbose_name='Yönlendirme'
    )
    
    ad_model = models.CharField(
        max_length=30,
        choices=AdModel.choices,
        default=AdModel.BAYI_SAYFASI,
        verbose_name='Reklam Modeli'
    )
    
    notes = models.TextField(
        blank=True,
        verbose_name='Notlar'
    )
    
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ONAY_BEKLIYOR,
        verbose_name='Durum'
    )
    
    # ===== Facebook Kampanya Alanları (Admin-only) =====
    ad_message = models.TextField(
        blank=True,
        verbose_name='Reklam Metni',
        help_text='Facebook reklamında gösterilecek metin'
    )
    
    website_url = models.URLField(
        blank=True,
        null=True,
        verbose_name='Yönlendirme URL',
        help_text='Redirect type\'a göre otomatik doldurulur veya manuel girilebilir'
    )
    
    cta_type = models.CharField(
        max_length=30,
        choices=CTAType.choices,
        default=CTAType.LEARN_MORE,
        verbose_name='Aksiyon Butonu'
    )
    
    # ===== Facebook API Yanıt Bilgileri =====
    fb_campaign_id = models.CharField(
        max_length=100,
        blank=True,
        verbose_name='FB Campaign ID'
    )
    
    fb_adset_id = models.CharField(
        max_length=100,
        blank=True,
        verbose_name='FB AdSet ID'
    )
    
    fb_creative_id = models.CharField(
        max_length=100,
        blank=True,
        verbose_name='FB Creative ID'
    )
    
    fb_ad_id = models.CharField(
        max_length=100,
        blank=True,
        verbose_name='FB Ad ID'
    )
    
    fb_push_status = models.CharField(
        max_length=20,
        choices=FBPushStatus.choices,
        blank=True,
        verbose_name='FB Gönderim Durumu'
    )
    
    fb_push_error = models.TextField(
        blank=True,
        verbose_name='FB Hata Mesajı'
    )
    
    fb_pushed_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='FB Gönderim Tarihi'
    )
    
    # Admin fields
    admin_notes = models.TextField(
        blank=True,
        verbose_name='Admin Notları'
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Oluşturulma Tarihi'
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Güncellenme Tarihi'
    )
    
    class Meta:
        verbose_name = 'Kampanya Talebi'
        verbose_name_plural = 'Kampanya Talepleri'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.dealer.dealer_name} - {self.campaign_name}"
    
    @property
    def platforms_display(self):
        """Return platforms as comma-separated string"""
        platform_names = {
            'instagram': 'Instagram',
            'facebook': 'Facebook'
        }
        return ', '.join([platform_names.get(p, p) for p in self.platforms])


class CampaignCreativeFile(models.Model):
    """Kampanya için yüklenen kreatif dosyalar (görsel/video)"""
    
    class FileType(models.TextChoices):
        POST = 'post', 'Post Görseli'
        STORY = 'story', 'Story Görseli'
        VIDEO = 'video', 'Video'
    
    campaign_request = models.ForeignKey(
        CampaignRequest,
        on_delete=models.CASCADE,
        related_name='creative_files',
        verbose_name='Kampanya Talebi'
    )
    
    file = models.FileField(
        upload_to=campaign_creative_upload_path,
        verbose_name='Dosya'
    )
    
    file_name = models.CharField(
        max_length=255,
        verbose_name='Dosya Adı'
    )
    
    file_size = models.IntegerField(
        default=0,
        verbose_name='Dosya Boyutu (bytes)'
    )
    
    file_type = models.CharField(
        max_length=10,
        choices=FileType.choices,
        default=FileType.POST,
        verbose_name='Dosya Tipi'
    )
    
    uploaded_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Yüklenme Tarihi'
    )
    
    class Meta:
        verbose_name = 'Kampanya Kreatif Dosyası'
        verbose_name_plural = 'Kampanya Kreatif Dosyaları'
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return f"{self.file_name} ({self.get_file_type_display()})"


class CampaignActivityLog(models.Model):
    """
    Kampanya talebi için genel amaçlı aktivite logu.
    Tüm önemli olaylar burada kayıt altına alınır:
    - Oluşturma / Düzenleme
    - Durum değişiklikleri
    - Facebook push denemeleri (başarılı/başarısız)
    - Dosya yükleme/silme
    - Admin notları
    """

    class ActionType(models.TextChoices):
        # Genel
        CREATED = 'created', 'Oluşturuldu'
        UPDATED = 'updated', 'Güncellendi'
        # Durum
        STATUS_CHANGE = 'status_change', 'Durum Değişikliği'
        # Facebook
        FB_PUSH_ATTEMPT = 'fb_push_attempt', 'Facebook Gönderim Denemesi'
        FB_PUSH_SUCCESS = 'fb_push_success', 'Facebook Gönderim Başarılı'
        FB_PUSH_FAILED = 'fb_push_failed', 'Facebook Gönderim Başarısız'
        FB_STATUS_CHECK = 'fb_status_check', 'Facebook Durum Sorgusu'
        # Dosya
        FILE_UPLOAD = 'file_upload', 'Dosya Yüklendi'
        FILE_DELETE = 'file_delete', 'Dosya Silindi'
        # Not
        NOTE = 'note', 'Not Eklendi'

    campaign_request = models.ForeignKey(
        CampaignRequest,
        on_delete=models.CASCADE,
        related_name='activity_logs',
        verbose_name='Kampanya Talebi'
    )

    action = models.CharField(
        max_length=30,
        choices=ActionType.choices,
        verbose_name='İşlem Tipi'
    )

    message = models.TextField(
        verbose_name='Mesaj',
        help_text='Kullanıcıya gösterilecek açıklama'
    )

    details = models.JSONField(
        default=dict,
        blank=True,
        verbose_name='Detaylar',
        help_text='Ek bilgiler (JSON): hata kodları, API yanıtları, eski/yeni değerler vb.'
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='campaign_activity_logs',
        verbose_name='İşlemi Yapan'
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Tarih'
    )

    class Meta:
        verbose_name = 'Kampanya Aktivite Logu'
        verbose_name_plural = 'Kampanya Aktivite Logları'
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['campaign_request', 'created_at']),
            models.Index(fields=['action']),
        ]

    def __str__(self):
        return f"[{self.get_action_display()}] {self.message[:80]}"

    @classmethod
    def log(cls, campaign_request, action, message, user=None, details=None):
        """
        Kısayol metod: Hızlı log oluşturma.

        Kullanım:
            CampaignActivityLog.log(
                campaign_request=cr,
                action=CampaignActivityLog.ActionType.STATUS_CHANGE,
                message='Kampanya onaylandı',
                user=request.user,
                details={'old_status': 'onay_bekliyor', 'new_status': 'onaylandi'}
            )
        """
        return cls.objects.create(
            campaign_request=campaign_request,
            action=action,
            message=message,
            user=user,
            details=details or {},
        )

