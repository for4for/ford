from django.contrib.auth.models import AbstractUser, UserManager
from django.db import models
from django.utils import timezone


class ActiveUserManager(UserManager):
    """Custom manager that excludes soft-deleted users"""
    
    def get_queryset(self):
        return super().get_queryset().filter(is_deleted=False)


class AllUsersManager(UserManager):
    """Manager that includes all users (including deleted)"""
    pass


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
    
    # Soft delete alanları
    is_deleted = models.BooleanField(
        default=False,
        verbose_name='Silindi'
    )
    
    deleted_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Silinme Tarihi'
    )
    
    deleted_reason = models.CharField(
        max_length=255,
        blank=True,
        verbose_name='Silinme Nedeni'
    )
    
    # Managers
    objects = ActiveUserManager()  # Varsayılan: sadece aktif kullanıcılar
    all_objects = AllUsersManager()  # Tüm kullanıcılar (silinen dahil)
    
    class Meta:
        verbose_name = 'Kullanıcı'
        verbose_name_plural = 'Kullanıcılar'
    
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
    
    def soft_delete(self, reason=''):
        """Kullanıcıyı soft delete yap"""
        self.is_deleted = True
        self.is_active = False
        self.deleted_at = timezone.now()
        self.deleted_reason = reason
        self.save()
    
    def restore(self):
        """Silinen kullanıcıyı geri getir"""
        self.is_deleted = False
        self.is_active = True
        self.deleted_at = None
        self.deleted_reason = ''
        self.save()
    
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

