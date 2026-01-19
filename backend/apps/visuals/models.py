import uuid
import os
from django.db import models
from apps.dealers.models import Dealer


def visual_reference_upload_path(instance, filename):
    """Visual reference için UUID tabanlı dosya yolu"""
    ext = os.path.splitext(filename)[1].lower()
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    return os.path.join('visuals/references', unique_filename)


def visual_creative_upload_path(instance, filename):
    """Visual creative için UUID tabanlı dosya yolu"""
    ext = os.path.splitext(filename)[1].lower()
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    return os.path.join('visuals/creatives', unique_filename)


def visual_delivered_upload_path(instance, filename):
    """Visual delivered için UUID tabanlı dosya yolu"""
    ext = os.path.splitext(filename)[1].lower()
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    return os.path.join('visuals/delivered', unique_filename)


class VisualRequest(models.Model):
    """Görsel İsteği (Visual Request) model"""
    
    class Status(models.TextChoices):
        TASLAK = 'taslak', 'Taslak'
        GORSEL_BEKLIYOR = 'gorsel_bekliyor', 'Görsel Bekliyor'
        BAYI_ONAYI_BEKLIYOR = 'bayi_onayi_bekliyor', 'Bayi Onayı Bekliyor'
        ONAY_BEKLIYOR = 'onay_bekliyor', 'Onay Bekliyor'
        ONAYLANDI = 'onaylandi', 'Onaylandı'
        REDDEDILDI = 'reddedildi', 'Reddedildi'
        TAMAMLANDI = 'tamamlandi', 'Tamamlandı'
    
    class AssignedTo(models.TextChoices):
        CREATIVE_AGENCY = 'creative_agency', 'Creative Agency'
        DEALER = 'dealer', 'Bayi'
        BRAND = 'brand', 'Marka'
    
    dealer = models.ForeignKey(
        Dealer,
        on_delete=models.CASCADE,
        related_name='visual_requests',
        verbose_name='Dealer'
    )
    
    creative_work_request = models.TextField(
        verbose_name='Creative Work Request'
    )
    
    quantity_request = models.IntegerField(
        verbose_name='Quantity Request'
    )
    
    work_details = models.TextField(
        verbose_name='Work Details'
    )
    
    intended_message = models.TextField(
        blank=True,
        verbose_name='Intended Message'
    )
    
    legal_text = models.TextField(
        blank=True,
        verbose_name='Legal Text'
    )
    
    deadline = models.DateField(
        verbose_name='Deadline'
    )
    
    reference_image = models.FileField(
        upload_to=visual_reference_upload_path,
        blank=True,
        null=True,
        verbose_name='Reference Image'
    )
    
    # Creative Agency tarafından yüklenen teslim görseli
    creative_image = models.FileField(
        upload_to=visual_creative_upload_path,
        blank=True,
        null=True,
        verbose_name='Creative Image'
    )
    
    status = models.CharField(
        max_length=30,
        choices=Status.choices,
        default=Status.ONAY_BEKLIYOR,
        verbose_name='Durum'
    )
    
    # Assigned to - tracks which department is assigned
    assigned_to = models.CharField(
        max_length=20,
        choices=AssignedTo.choices,
        null=True,
        blank=True,
        verbose_name='Atanan Birim'
    )
    
    # Admin notes
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
        verbose_name = 'Görsel İsteği'
        verbose_name_plural = 'Görsel İstekleri'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.dealer.dealer_name} - {self.creative_work_request[:50]}"


class VisualRequestSize(models.Model):
    """Boyut/Ölçü for Visual Request"""
    
    visual_request = models.ForeignKey(
        VisualRequest,
        on_delete=models.CASCADE,
        related_name='sizes',
        verbose_name='Görsel İsteği'
    )
    
    size = models.CharField(
        max_length=100,
        verbose_name='Size/Dimension'
    )
    
    quantity = models.IntegerField(
        verbose_name='Quantity'
    )
    
    class Meta:
        verbose_name = 'Size'
        verbose_name_plural = 'Sizes'
    
    def __str__(self):
        return f"{self.size} - {self.quantity} pcs"


class VisualRequestCreative(models.Model):
    """İstenilen Kreatif types for Visual Request"""
    
    class KreatifTipi(models.TextChoices):
        POSTER = 'poster', 'Poster / Afiş'
        CADIR = 'cadir', 'Çadır'
        TENTE = 'tente', 'Tente'
        STAND = 'stand', 'Stand'
        ORUMCEK = 'orumcek', 'Örümcek Stand'
        MEGALIGHT = 'megalight', 'Megalight'
        DIJITAL = 'dijital', 'Dijital Ekran'
        LED = 'led', 'Led Saha Kenarı'
        ROLLUP = 'rollup', 'Roll-up'
        EL_ILANI = 'el_ilani', 'El İlanı'
        BRANDA = 'branda', 'Branda'
        TOTEM = 'totem', 'Totem'
        STICKER = 'sticker', 'Sticker'
        DIGER = 'diger', 'Diğer'
    
    visual_request = models.ForeignKey(
        VisualRequest,
        on_delete=models.CASCADE,
        related_name='creatives',
        verbose_name='Görsel İsteği'
    )
    
    creative_type = models.CharField(
        max_length=20,
        choices=KreatifTipi.choices,
        verbose_name='Creative Type'
    )
    
    description = models.TextField(
        blank=True,
        verbose_name='Description'
    )
    
    class Meta:
        verbose_name = 'Creative Type'
        verbose_name_plural = 'Creative Types'
    
    def __str__(self):
        return f"{self.get_creative_type_display()}"


class VisualRequestReferenceFile(models.Model):
    """Bayi tarafından yüklenen referans görseller"""
    
    visual_request = models.ForeignKey(
        VisualRequest,
        on_delete=models.CASCADE,
        related_name='reference_files',
        verbose_name='Görsel İsteği'
    )
    
    file = models.FileField(
        upload_to=visual_reference_upload_path,
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
    
    uploaded_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Yüklenme Tarihi'
    )
    
    class Meta:
        verbose_name = 'Referans Dosya'
        verbose_name_plural = 'Referans Dosyalar'
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return f"{self.file_name}"


class VisualRequestDeliveredFile(models.Model):
    """Creative Agency tarafından teslim edilen görseller"""
    
    visual_request = models.ForeignKey(
        VisualRequest,
        on_delete=models.CASCADE,
        related_name='delivered_files',
        verbose_name='Görsel İsteği'
    )
    
    file = models.FileField(
        upload_to=visual_delivered_upload_path,
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
    
    note = models.TextField(
        blank=True,
        verbose_name='Not'
    )
    
    uploaded_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Yüklenme Tarihi'
    )
    
    class Meta:
        verbose_name = 'Teslim Edilen Dosya'
        verbose_name_plural = 'Teslim Edilen Dosyalar'
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return f"{self.file_name}"

