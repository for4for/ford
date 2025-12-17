from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
import random

from apps.campaigns.models import CampaignRequest
from apps.dealers.models import Dealer


class Command(BaseCommand):
    help = 'Kampanya talepleri için dummy kayıtlar oluşturur'

    def add_arguments(self, parser):
        parser.add_argument(
            '--count',
            type=int,
            default=10,
            help='Oluşturulacak kayıt sayısı (varsayılan: 10)'
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Önce mevcut kayıtları sil'
        )

    def handle(self, *args, **options):
        count = options['count']
        clear = options['clear']

        # Mevcut bayileri al
        dealers = list(Dealer.objects.all())
        if not dealers:
            self.stdout.write(self.style.ERROR('Hiç bayi bulunamadı! Önce bayi oluşturun.'))
            return

        if clear:
            deleted_count = CampaignRequest.objects.all().delete()[0]
            self.stdout.write(self.style.WARNING(f'{deleted_count} mevcut kayıt silindi.'))

        # Tofaş/Fiat/Jeep/Alfa Romeo Kampanya İsimleri
        campaign_names = [
            "Fiat Egea Lansman Kampanyası",
            "Bahar Servis Kampanyası",
            "Fiat 500 Elektrik Tanıtım",
            "Yıl Sonu Satış Kampanyası",
            "Fiat Tipo Özel Fiyat",
            "Test Sürüşü Günleri",
            "Jeep Compass Lead Gen",
            "Jeep Renegade Awareness",
            "Servis İndirim Kampanyası",
            "Fiat Ducato Filo Kampanyası",
            "Alfa Romeo Stelvio Kampanyası",
            "Elektrikli Araç Tanıtımı",
            "Fiat Doblo Ticari Lansman",
            "Yazlık Lastik Kampanyası",
            "Fiat Panda Stok Eritme",
            "Kurban Bayramı Kampanyası",
            "Ramazan Kampanyası",
            "Okula Dönüş Kampanyası",
            "Alfa Romeo Giulia Türkiye Lansmanı",
            "Kış Bakım Paketi Kampanyası",
            "Jeep Avenger Elektrik Kampanyası",
            "Fiat Egea Cross Tanıtım",
        ]

        notes_options = [
            "Bölgemizde yoğun talep var, kampanya süresini uzatmayı düşünebiliriz.",
            "Rakip markaların benzer kampanyalarına karşı oluşturduk.",
            "Geçen ay yaptığımız kampanyadan %30 daha fazla lead bekliyoruz.",
            "Bu kampanya ile 50 yeni müşteri hedefliyoruz.",
            "İlk defa dijital kampanya deniyoruz, sonuçları takip edeceğiz.",
            "Showroom ziyaretlerini artırmayı hedefliyoruz.",
            "Kurumsal müşterilere yönelik kampanya.",
            "Gençlere yönelik sosyal medya ağırlıklı kampanya.",
            "",
            "",
        ]

        statuses = [
            CampaignRequest.Status.TASLAK,
            CampaignRequest.Status.ONAY_BEKLIYOR,
            CampaignRequest.Status.ONAYLANDI,
            CampaignRequest.Status.YAYINDA,
            CampaignRequest.Status.TAMAMLANDI,
            CampaignRequest.Status.REDDEDILDI,
        ]

        status_weights = [1, 3, 2, 3, 2, 1]

        platforms_options = [
            ["instagram"],
            ["facebook"],
            ["instagram", "facebook"],
            ["instagram", "facebook"],
            ["instagram", "facebook"],
        ]

        redirect_types = [
            CampaignRequest.RedirectType.SATIS,
            CampaignRequest.RedirectType.SERVIS,
            CampaignRequest.RedirectType.DIGER,
        ]

        redirect_weights = [5, 3, 1]

        ad_models = [
            CampaignRequest.AdModel.BAYI_SAYFASI,
            CampaignRequest.AdModel.FORM_YONLENDIRME,
        ]

        ad_model_weights = [3, 7]

        created_count = 0

        for i in range(count):
            dealer = random.choice(dealers)
            status = random.choices(statuses, weights=status_weights)[0]
            
            # Tarihler
            created_days_ago = random.randint(1, 90)
            campaign_duration = random.randint(7, 30)
            start_offset = random.randint(-30, 30)  # Geçmiş veya gelecek
            
            start_date = (timezone.now() + timedelta(days=start_offset)).date()
            end_date = start_date + timedelta(days=campaign_duration)
            
            # Bütçe
            budget = Decimal(random.choice([500, 1000, 1500, 2000, 2500, 3000, 5000, 7500, 10000, 15000, 20000]))
            
            campaign_name = random.choice(campaign_names)
            platforms = random.choice(platforms_options)
            redirect_type = random.choices(redirect_types, weights=redirect_weights)[0]
            ad_model = random.choices(ad_models, weights=ad_model_weights)[0]
            notes = random.choice(notes_options)

            # Admin notes
            admin_notes = ""
            if status != CampaignRequest.Status.TASLAK and status != CampaignRequest.Status.ONAY_BEKLIYOR:
                notes_list = []
                base_date = timezone.now() - timedelta(days=created_days_ago)
                
                if status in [CampaignRequest.Status.ONAYLANDI, CampaignRequest.Status.YAYINDA, 
                             CampaignRequest.Status.TAMAMLANDI]:
                    notes_list.append(f"[Onaylandı - {(base_date + timedelta(days=2)).strftime('%d.%m.%Y %H:%M')}]: Kampanya onaylandı, yayına alınabilir.")
                
                if status in [CampaignRequest.Status.YAYINDA, CampaignRequest.Status.TAMAMLANDI]:
                    notes_list.append(f"[Yayına Alındı - {(base_date + timedelta(days=3)).strftime('%d.%m.%Y %H:%M')}]: Kampanya Meta Ads Manager'da yayına alındı.")
                
                if status == CampaignRequest.Status.TAMAMLANDI:
                    notes_list.append(f"[Tamamlandı - {(base_date + timedelta(days=campaign_duration + 5)).strftime('%d.%m.%Y %H:%M')}]: Kampanya süresi doldu, rapor hazırlandı.")
                
                if status == CampaignRequest.Status.REDDEDILDI:
                    reject_reasons = [
                        "Bütçe yetersiz, minimum 1000 TL gerekiyor.",
                        "Görsel kalitesi uygun değil, lütfen yeniden yükleyin.",
                        "Kampanya metni marka kurallarına uygun değil.",
                        "Seçilen tarih aralığı uygun değil."
                    ]
                    notes_list.append(f"[Reddedildi - {(base_date + timedelta(days=2)).strftime('%d.%m.%Y %H:%M')}]: {random.choice(reject_reasons)}")
                
                admin_notes = "\n".join(notes_list)

            # Create campaign request
            campaign = CampaignRequest.objects.create(
                dealer=dealer,
                campaign_name=campaign_name,
                budget=budget,
                start_date=start_date,
                end_date=end_date,
                platforms=platforms,
                campaign_type=CampaignRequest.CampaignType.LINK,  # Default
                fb_post_link="",
                ig_post_link="",
                post_images=[],
                story_images=[],
                redirect_type=redirect_type,
                ad_model=ad_model,
                notes=notes,
                status=status,
                admin_notes=admin_notes,
            )

            # Manually set created_at
            CampaignRequest.objects.filter(pk=campaign.pk).update(
                created_at=timezone.now() - timedelta(days=created_days_ago)
            )

            created_count += 1
            self.stdout.write(f'  [{created_count}/{count}] {campaign_name[:50]}...')

        self.stdout.write(self.style.SUCCESS(f'\n✓ {created_count} kampanya talebi başarıyla oluşturuldu!'))
