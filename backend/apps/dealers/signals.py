"""
Django signals for Dealer model
Handles email notifications on dealer creation and status changes
"""
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.conf import settings
from .models import Dealer
from apps.users.email_utils import send_templated_email


@receiver(post_save, sender=Dealer)
def dealer_created_notification(sender, instance, created, **kwargs):
    """Yeni bayi oluşturulduğunda admin kullanıcılara mail gönder"""
    if created:
        # Admin kullanıcılara bildirim maili gönder
        from apps.users.models import User
        admin_emails = User.objects.filter(
            role='admin', 
            is_active=True
        ).values_list('email', flat=True)
        
        if admin_emails:
            send_templated_email(
                subject='Yeni Bayi Kaydı Talebi',
                template_name='emails/base_email.html',
                context={
                    'content': f"""
                        <strong>{instance.dealer_name}</strong> için yeni bir kayıt talebi oluşturuldu.<br><br>
                        Oluşturan e-posta adresi: <strong>{instance.email}</strong><br><br>
                        Platform üzerinden onaylamak için link: <a href="{settings.FRONTEND_URL}/backoffice/dealers">{settings.FRONTEND_URL}/backoffice/dealers</a>
                    """
                },
                recipient_list=list(admin_emails),
            )


@receiver(pre_save, sender=Dealer)
def dealer_status_changed(sender, instance, **kwargs):
    """Bayi durumu değiştiğinde (onaylandığında) mail gönder"""
    if instance.pk:  # Sadece güncelleme için
        try:
            old_instance = Dealer.objects.get(pk=instance.pk)
            
            # Durum 'pasif'ten 'aktif'e değişti mi?
            if old_instance.status != 'aktif' and instance.status == 'aktif':
                # Bayi onaylandı! Mail gönder
                if instance.email:
                    send_templated_email(
                        subject='Başvurunuz Onaylandı - Tofaş Bayi Portalı',
                        template_name='emails/base_email.html',
                        context={
                            'content': f"""
                                Sayın {instance.dealer_name},<br><br>
                                Tofaş Bayi Portalı başvurunuz <strong>onaylanmıştır</strong>! 🎉<br><br>
                                Artık sistemimize giriş yaparak kampanya taleplerinizi oluşturabilirsiniz.<br><br>
                                <strong>Giriş Linki:</strong> <a href="{settings.FRONTEND_URL}/dealer-login">Giriş Yap</a><br><br>
                                İyi çalışmalar dileriz,<br>
                                Tofaş Bayi Portalı Ekibi
                            """
                        },
                        recipient_list=[instance.email],
                    )
                
                # İlgili kullanıcıya da mail gönder (eğer varsa)
                from apps.users.models import User
                try:
                    user = User.objects.get(dealer=instance)
                    if user.email:
                        send_templated_email(
                            subject='Hesabınız Aktifleştirildi - Tofaş Bayi Portalı',
                            template_name='emails/base_email.html',
                            context={
                                'content': f"""
                                    Merhaba,<br><br>
                                    <strong>{instance.dealer_name}</strong> bayisi için hesabınız aktifleştirildi.<br><br>
                                    <strong>Giriş için:</strong> <a href="{settings.FRONTEND_URL}/dealer-login">Giriş Yap</a><br><br>
                                    İyi çalışmalar dileriz!
                                """
                            },
                            recipient_list=[user.email],
                        )
                except User.DoesNotExist:
                    pass
                    
        except Dealer.DoesNotExist:
            pass
