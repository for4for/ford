import uuid
import os
from django.db import models
from django.core.validators import EmailValidator


def uuid_upload_path(base_path):
    """UUID tabanlı dosya yolu oluşturur"""
    def wrapper(instance, filename):
        ext = os.path.splitext(filename)[1].lower()
        unique_filename = f"{uuid.uuid4().hex}{ext}"
        return os.path.join(base_path, unique_filename)
    return wrapper


class Brand(models.Model):
    """Marka modeli"""
    
    name = models.CharField(
        max_length=100,
        unique=True,
        verbose_name='Marka Adı'
    )
    
    code = models.CharField(
        max_length=20,
        unique=True,
        verbose_name='Marka Kodu'
    )
    
    logo = models.ImageField(
        upload_to=uuid_upload_path('brands'),
        blank=True,
        null=True,
        verbose_name='Logo'
    )
    
    # Reklam Hesabı Bilgileri
    fb_ad_account_id = models.CharField(
        max_length=100,
        blank=True,
        verbose_name='Facebook Reklam Hesabı ID'
    )
    
    ig_ad_account_id = models.CharField(
        max_length=100,
        blank=True,
        verbose_name='Instagram Reklam Hesabı ID'
    )
    
    google_ad_account_id = models.CharField(
        max_length=100,
        blank=True,
        verbose_name='Google Ads Hesabı ID'
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
        verbose_name = 'Marka'
        verbose_name_plural = 'Markalar'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Dealer(models.Model):
    """Bayi (Dealer) model"""
    
    class BayiTuru(models.TextChoices):
        YETKILI = 'yetkili', 'Yetkili Bayi'
        ANLASMALI = 'anlasmali', 'Anlaşmalı Bayi'
        SATIŞ = 'satis', 'Satış Bayisi'
    
    class Durum(models.TextChoices):
        AKTIF = 'aktif', 'Aktif'
        PASIF = 'pasif', 'Pasif'
        ASKIDA = 'askida', 'Askıda'
    
    # Marka ilişkisi
    brand = models.ForeignKey(
        Brand,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='dealers',
        verbose_name='Marka'
    )
    
    # Primary fields
    dealer_code = models.CharField(
        max_length=50,
        unique=True,
        verbose_name='Dealer Code'
    )
    
    dealer_name = models.CharField(
        max_length=200,
        verbose_name='Dealer Name'
    )
    
    # Contact information
    city = models.CharField(max_length=100, verbose_name='City')
    district = models.CharField(max_length=100, verbose_name='District')
    address = models.TextField(verbose_name='Address')
    phone = models.CharField(max_length=20, verbose_name='Phone')
    email = models.EmailField(
        validators=[EmailValidator()],
        verbose_name='Email'
    )
    
    # Responsible persons
    contact_first_name = models.CharField(
        max_length=100,
        verbose_name='Sorumlu Adı',
        blank=True,
        default=''
    )
    
    contact_last_name = models.CharField(
        max_length=100,
        verbose_name='Sorumlu Soyadı',
        blank=True,
        default=''
    )
    
    regional_manager = models.CharField(
        max_length=200,
        verbose_name='Regional Manager'
    )
    
    # Additional emails (stored as JSON)
    additional_emails = models.JSONField(
        default=list,
        blank=True,
        verbose_name='Additional Emails'
    )
    
    # Business information
    tax_number = models.CharField(
        max_length=50,
        blank=True,
        verbose_name='Tax Number'
    )
    
    dealer_type = models.CharField(
        max_length=20,
        choices=BayiTuru.choices,
        default=BayiTuru.YETKILI,
        verbose_name='Dealer Type'
    )
    
    region = models.CharField(
        max_length=100,
        blank=True,
        verbose_name='Region'
    )
    
    status = models.CharField(
        max_length=20,
        choices=Durum.choices,
        default=Durum.AKTIF,
        verbose_name='Status'
    )
    
    # Dates
    membership_date = models.DateField(
        auto_now_add=True,
        verbose_name='Membership Date'
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Güncellenme Tarihi'
    )
    
    class Meta:
        verbose_name = 'Dealer'
        verbose_name_plural = 'Dealers'
        ordering = ['dealer_name']
    
    def save(self, *args, **kwargs):
        """Override save to activate user when dealer is activated"""
        # Check if status changed to 'aktif'
        if self.pk:  # Only for existing dealers
            old_dealer = Dealer.objects.filter(pk=self.pk).first()
            if old_dealer and old_dealer.status != 'aktif' and self.status == 'aktif':
                # Activate the related user account
                try:
                    from apps.users.models import User
                    user = User.objects.get(dealer=self)
                    user.is_active = True
                    user.save()
                except User.DoesNotExist:
                    pass
        
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.dealer_code} - {self.dealer_name}"
    
    @property
    def is_active(self):
        return self.status == self.Durum.AKTIF


class DealerBudget(models.Model):
    """Dealer Budget tracking model"""
    
    dealer = models.ForeignKey(
        Dealer,
        on_delete=models.CASCADE,
        related_name='budgets',
        verbose_name='Dealer'
    )
    
    year = models.IntegerField(verbose_name='Year')
    
    total_budget = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        verbose_name='Total Budget'
    )
    
    used_budget = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        verbose_name='Used Budget'
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
        verbose_name = 'Dealer Budget'
        verbose_name_plural = 'Dealer Budgets'
        unique_together = ['dealer', 'year']
        ordering = ['-year']
    
    def __str__(self):
        return f"{self.dealer.dealer_name} - {self.year}"
    
    @property
    def remaining_budget(self):
        """Calculate remaining budget"""
        return self.total_budget - self.used_budget
    
    @property
    def usage_percentage(self):
        """Calculate budget usage percentage"""
        if self.total_budget == 0:
            return 0
        return (self.used_budget / self.total_budget) * 100


class DealerBudgetPlan(models.Model):
    """Baremli Bütçe Planlaması - Tarih aralığına göre bütçe tanımlama"""
    
    dealer = models.ForeignKey(
        Dealer,
        on_delete=models.CASCADE,
        related_name='budget_plans',
        verbose_name='Bayi'
    )
    
    start_date = models.DateField(verbose_name='Başlangıç Tarihi')
    end_date = models.DateField(verbose_name='Bitiş Tarihi')
    
    budget_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        verbose_name='Bütçe Tutarı'
    )
    
    used_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        verbose_name='Kullanılan Tutar'
    )
    
    description = models.CharField(
        max_length=255,
        blank=True,
        verbose_name='Açıklama'
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
        verbose_name = 'Bütçe Planı'
        verbose_name_plural = 'Bütçe Planları'
        ordering = ['start_date']
    
    def __str__(self):
        return f"{self.dealer.dealer_name} - {self.start_date} / {self.end_date}"
    
    @property
    def remaining_amount(self):
        """Kalan bütçe"""
        return self.budget_amount - self.used_amount
    
    @property
    def usage_percentage(self):
        """Kullanım yüzdesi"""
        if self.budget_amount == 0:
            return 0
        return (self.used_amount / self.budget_amount) * 100
    
    def clean(self):
        """Tarih validasyonu"""
        from django.core.exceptions import ValidationError
        if self.start_date and self.end_date:
            if self.start_date > self.end_date:
                raise ValidationError('Başlangıç tarihi bitiş tarihinden sonra olamaz.')

