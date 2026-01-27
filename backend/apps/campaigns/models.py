from django.db import models
from apps.dealers.models import Dealer, Brand


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





