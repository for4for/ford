import uuid
import os
from django.db import models
from apps.dealers.models import Dealer


def incentive_document_upload_path(instance, filename):
    """Incentive document için UUID tabanlı dosya yolu"""
    ext = os.path.splitext(filename)[1].lower()
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    return os.path.join('incentives/documents', unique_filename)


def incentive_reference_upload_path(instance, filename):
    """Incentive reference için UUID tabanlı dosya yolu"""
    ext = os.path.splitext(filename)[1].lower()
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    return os.path.join('incentives/references', unique_filename)


class IncentiveRequest(models.Model):
    """Teşvik Talebi (Incentive Request) model"""
    
    class Status(models.TextChoices):
        TASLAK = 'taslak', 'Taslak'
        ONAY_BEKLIYOR = 'onay_bekliyor', 'Onay Bekliyor'
        DEGERLENDIRME = 'degerlendirme', 'Değerlendirme'
        ONAYLANDI = 'onaylandi', 'Onaylandı'
        REDDEDILDI = 'reddedildi', 'Reddedildi'
        TAMAMLANDI = 'tamamlandi', 'Tamamlandı'
    
    dealer = models.ForeignKey(
        Dealer,
        on_delete=models.CASCADE,
        related_name='incentive_requests',
        verbose_name='Dealer'
    )
    
    incentive_title = models.TextField(
        blank=True,
        default='',
        verbose_name='Incentive Title'
    )
    
    incentive_details = models.TextField(
        blank=True,
        default='',
        verbose_name='Incentive Details'
    )
    
    purpose = models.TextField(
        blank=True,
        default='',
        verbose_name='Purpose'
    )
    
    target_audience = models.TextField(
        blank=True,
        default='',
        verbose_name='Target Audience'
    )
    
    incentive_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        verbose_name='Incentive Amount (TL)'
    )
    
    proposal_document = models.FileField(
        upload_to=incentive_document_upload_path,
        blank=True,
        null=True,
        verbose_name='Proposal Document'
    )
    
    event_time = models.CharField(
        max_length=200,
        blank=True,
        default='',
        verbose_name='Event Time'
    )
    
    event_location = models.CharField(
        max_length=200,
        blank=True,
        default='',
        verbose_name='Event Location (City/District)'
    )
    
    event_venue = models.CharField(
        max_length=200,
        blank=True,
        default='',
        verbose_name='Event Venue Name'
    )
    
    map_link = models.URLField(
        blank=True,
        verbose_name='Map Link'
    )
    
    performance_metrics = models.TextField(
        blank=True,
        default='',
        verbose_name='Performance Metrics'
    )
    
    reference_image = models.FileField(
        upload_to=incentive_reference_upload_path,
        blank=True,
        null=True,
        verbose_name='Reference Image'
    )
    
    notes = models.TextField(
        blank=True,
        verbose_name='Notes'
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
    
    approved_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name='Approved Amount (TL)'
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
        verbose_name = 'Teşvik Talebi'
        verbose_name_plural = 'Teşvik Talepleri'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.dealer.dealer_name} - {self.incentive_title[:50]}"

