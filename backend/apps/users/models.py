from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Custom User model with role-based access"""
    
    class Role(models.TextChoices):
        ADMIN = 'admin', 'Admin'
        MODERATOR = 'moderator', 'Moderator'
        BAYI = 'bayi', 'Bayi'
        CREATIVE_AGENCY = 'creative_agency', 'Creative Agency'
    
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.BAYI,
        verbose_name='Rol'
    )
    
    # Link to dealer if user is a dealer
    dealer = models.OneToOneField(
        'dealers.Dealer',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='user_account',
        verbose_name='Bayi'
    )
    
    phone = models.CharField(
        max_length=20,
        blank=True,
        verbose_name='Telefon'
    )
    
    class Meta:
        verbose_name = 'Kullanıcı'
        verbose_name_plural = 'Kullanıcılar'
    
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
    
    @property
    def is_admin(self):
        return self.role == self.Role.ADMIN
    
    @property
    def is_moderator(self):
        return self.role == self.Role.MODERATOR
    
    @property
    def is_bayi(self):
        return self.role == self.Role.BAYI
    
    @property
    def is_creative_agency(self):
        return self.role == self.Role.CREATIVE_AGENCY

