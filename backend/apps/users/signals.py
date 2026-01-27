"""
Django signals for User model
Handles email notifications on user activation
"""
from django.db.models.signals import pre_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from django.conf import settings
from .email_utils import send_templated_email

User = get_user_model()


@receiver(pre_save, sender=User)
def user_activated_notification(sender, instance, **kwargs):
    """Kullanıcı aktif edildiğinde mail gönder (sadece bayi rolü için)"""
    if instance.pk:  # Sadece güncelleme için
        try:
            old_instance = User.objects.get(pk=instance.pk)
            
            # is_active False'dan True'ya değişti mi ve rolü bayi mi?
            if not old_instance.is_active and instance.is_active and instance.role == 'bayi':
                # Kullanıcı aktif edildi! Mail gönder
                if instance.email:
                    # Bayi adını al
                    dealer_name = "Bayiniz"
                    if instance.dealer:
                        dealer_name = instance.dealer.dealer_name
                    
                    send_templated_email(
                        subject='Kayıt talebiniz onaylandı.',
                        template_name='emails/base_email.html',
                        context={
                            'content': f"""
                                <strong>{dealer_name}</strong> için oluşturduğunuz talep yönetici tarafından onaylandı.<br><br>
                                Kullanıcı adı ve şifreniz ile bu linkten giriş yapabilirsiniz: <a href="{settings.FRONTEND_URL}/dealer-login">{settings.FRONTEND_URL}/dealer-login</a>
                            """
                        },
                        recipient_list=[instance.email],
                    )
                    
        except User.DoesNotExist:
            pass
