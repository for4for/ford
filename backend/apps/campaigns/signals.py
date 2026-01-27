"""
Django signals for Campaign model
Handles email notifications on campaign creation and status changes
"""
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.conf import settings
from .models import CampaignRequest
from apps.users.email_utils import send_templated_email


@receiver(post_save, sender=CampaignRequest)
def campaign_created_notification(sender, instance, created, **kwargs):
    """Yeni kampanya talebi oluşturulduğunda admin kullanıcılara mail gönder"""
    if created:
        # Admin kullanıcılara bildirim maili gönder
        from apps.users.models import User
        admin_emails = User.objects.filter(
            role='admin',
            is_active=True
        ).values_list('email', flat=True)
        
        if admin_emails:
            # Bayi adı
            dealer_name = instance.dealer.dealer_name
            
            # Bütçe formatı
            budget = f"₺{instance.budget:,.2f}"
            
            # Tarih formatı
            start_date = instance.start_date.strftime('%d.%m.%Y')
            end_date = instance.end_date.strftime('%d.%m.%Y')
            
            # Link
            campaign_link = f"{settings.FRONTEND_URL}/backoffice/campaigns/requests/{instance.id}/show"
            
            send_templated_email(
                subject='Yeni kampanya talebi',
                template_name='emails/base_email.html',
                context={
                    'content': f"""
                        <strong>{dealer_name}</strong> yeni bir kampanya talebi oluşturuldu.<br><br>
                        Kampanya bütçesi: <strong>{budget}</strong>, kampanya periyodu: <strong>{start_date} - {end_date}</strong>.<br><br>
                        Talebi güncellemek için link: <a href="{campaign_link}">{campaign_link}</a>
                    """
                },
                recipient_list=list(admin_emails),
            )


@receiver(pre_save, sender=CampaignRequest)
def campaign_status_changed(sender, instance, **kwargs):
    """Kampanya durumu değiştiğinde bayiye mail gönder"""
    if instance.pk:  # Sadece güncelleme için
        try:
            old_instance = CampaignRequest.objects.get(pk=instance.pk)
            
            # Kampanya bilgileri
            campaign_name = instance.campaign_name
            campaign_id = instance.id
            
            # Dealer email kontrolü
            if not instance.dealer or not instance.dealer.email:
                return
                
            dealer_email = instance.dealer.email
            
            # 1. Kampanya ONAYLANDI
            if old_instance.status != 'onaylandi' and instance.status == 'onaylandi':
                detail_link = f"{settings.FRONTEND_URL}/dealer/campaign-requests/{campaign_id}"
                
                send_templated_email(
                    subject='Kampanya talebiniz onaylandı.',
                    template_name='emails/base_email.html',
                    context={
                        'content': f"""
                            <strong>{campaign_name}</strong> için ilettiğiniz talep onaylandı.<br><br>
                            Kampanyanız yayına alındığında tarafınıza bilgilendirme geçilecektir.<br><br>
                            Detaylar için bu sayfayı ziyaret ediniz: <a href="{detail_link}">{detail_link}</a>
                        """
                    },
                    recipient_list=[dealer_email],
                )
            
            # 2. Kampanya YAYINDA
            elif old_instance.status != 'yayinda' and instance.status == 'yayinda':
                report_link = f"{settings.FRONTEND_URL}/backoffice/campaigns/requests/{campaign_id}/report"
                
                send_templated_email(
                    subject='Kampanyanız yayında!',
                    template_name='emails/base_email.html',
                    context={
                        'content': f"""
                            <strong>{campaign_name}</strong> yayına alındı.<br><br>
                            Kampanyanıza dair istatistiklere raporlama sayfasından ulaşabilirsiniz:<br><br>
                            Raporlama sayfası için link: <a href="{report_link}">{report_link}</a>
                        """
                    },
                    recipient_list=[dealer_email],
                )
            
            # 3. Kampanya REDDEDİLDİ
            elif old_instance.status != 'reddedildi' and instance.status == 'reddedildi':
                detail_link = f"{settings.FRONTEND_URL}/dealer/campaign-requests/{campaign_id}"
                
                send_templated_email(
                    subject='Kampanya talebiniz güncellendi',
                    template_name='emails/base_email.html',
                    context={
                        'content': f"""
                            Kampanya talebiniz yönetici tarafından güncellendi.<br><br>
                            Detayları görmek için bu sayfayı ziyaret ediniz: <a href="{detail_link}">{detail_link}</a>
                        """
                    },
                    recipient_list=[dealer_email],
                )
            
            # 4. Kampanya TAMAMLANDI
            elif old_instance.status != 'tamamlandi' and instance.status == 'tamamlandi':
                detail_link = f"{settings.FRONTEND_URL}/dealer/campaign-requests/{campaign_id}"
                
                send_templated_email(
                    subject='Kampanya talebiniz güncellendi',
                    template_name='emails/base_email.html',
                    context={
                        'content': f"""
                            Kampanya talebiniz yönetici tarafından güncellendi.<br><br>
                            Detayları görmek için bu sayfayı ziyaret ediniz: <a href="{detail_link}">{detail_link}</a>
                        """
                    },
                    recipient_list=[dealer_email],
                )
                    
        except CampaignRequest.DoesNotExist:
            pass
