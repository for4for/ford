from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
import random

from apps.incentives.models import IncentiveRequest
from apps.dealers.models import Dealer


class Command(BaseCommand):
    help = 'Teşvik talepleri için dummy kayıtlar oluşturur'

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
            deleted_count = IncentiveRequest.objects.all().delete()[0]
            self.stdout.write(self.style.WARNING(f'{deleted_count} mevcut kayıt silindi.'))

        # Tofaş/Fiat/Jeep/Alfa Romeo Teşvik Başlıkları
        incentive_titles = [
            "Yeni Fiat Egea Lansman Etkinliği Sponsorluğu",
            "Bölgesel Test Sürüşü Organizasyonu",
            "AVM Araç Sergisi Katılım Talebi",
            "Yerel Futbol Turnuvası Ana Sponsorluğu",
            "Fiat 500 Elektrik Tanıtım Etkinliği",
            "Yıl Sonu Müşteri Buluşması",
            "Outdoor Festival Stand Alanı",
            "Kurumsal Filo Tanıtım Toplantısı",
            "Bahar Kampanyası Lansmanı",
            "Jeep Compass Off-Road Deneyim Günü",
            "Üniversite Kariyer Günleri Katılımı",
            "Yerel Basın Tanıtım Etkinliği",
            "Fiat Ducato Filo Günleri",
            "Elektrikli Araç Farkındalık Etkinliği",
            "Alfa Romeo Stelvio Exclusive Launch Party",
            "Jeep Renegade Adventure Day",
            "Fiat Tipo Aile Günü Etkinliği",
        ]

        purposes = [
            "Yeni model lansmanı ile marka bilinirliğini artırmak ve potansiyel müşteri portföyü oluşturmak",
            "Bölgedeki hedef kitleye ulaşarak satış potansiyelini artırmak",
            "Mevcut müşteri sadakatini güçlendirmek ve referans müşteri kazanmak",
            "Kurumsal müşteri segmentinde pazar payını artırmak",
            "Elektrikli araç segmentinde marka konumlandırması yapmak",
            "Yerel basın ve influencer'lar aracılığıyla organik tanıtım sağlamak",
            "Genç ve dinamik hedef kitleye ulaşmak",
            "Premium segment müşterilere özel deneyim sunmak",
        ]

        target_audiences = [
            "25-45 yaş arası orta-üst gelir grubu, araç değişikliği düşünen profesyoneller",
            "Aileler ve SUV segmentine ilgi duyan müşteriler",
            "KOBİ sahipleri ve filo yöneticileri",
            "Outdoor ve macera tutkunları, aktif yaşam tarzına sahip bireyler",
            "Çevre bilinci yüksek, elektrikli araç meraklıları",
            "Premium segment, lüks araç kullanıcıları",
            "Genç profesyoneller ve startup çalışanları",
            "Mevcut Fiat/Jeep/Alfa Romeo sahipleri ve sadık müşteriler",
        ]

        event_times = [
            "15-17 Ocak 2025",
            "22-24 Şubat 2025",
            "8-10 Mart 2025",
            "5-7 Nisan 2025",
            "20-22 Mayıs 2025",
            "10-12 Haziran 2025",
            "1-3 Temmuz 2025",
            "15-17 Ağustos 2025",
        ]

        venues = [
            ("İstanbul - Kadıköy", "Caddebostan Kültür Merkezi", "https://maps.google.com/?q=caddebostan"),
            ("İstanbul - Beşiktaş", "Zorlu Center AVM", "https://maps.google.com/?q=zorlu+center"),
            ("Ankara - Çankaya", "Armada AVM", "https://maps.google.com/?q=armada+avm"),
            ("İzmir - Karşıyaka", "Mavibahçe AVM", "https://maps.google.com/?q=mavibahce"),
            ("Bursa - Nilüfer", "Anatolium AVM", "https://maps.google.com/?q=anatolium+bursa"),
            ("Antalya - Muratpaşa", "MarkAntalya AVM", "https://maps.google.com/?q=markantalya"),
            ("Kocaeli - İzmit", "Symbol AVM", "https://maps.google.com/?q=symbol+izmit"),
            ("Eskişehir - Tepebaşı", "Espark AVM", "https://maps.google.com/?q=espark"),
        ]

        performance_metrics = [
            "Minimum 500 ziyaretçi, 100 test sürüşü, 50 sıcak müşteri adayı, 10 satış",
            "300+ etkinlik katılımcısı, 80 form doldurma, 30 randevu, 15 satış hedefi",
            "1000+ AVM ziyaretçisi ile temas, 200 broşür dağıtımı, 50 test sürüşü",
            "Sosyal medyada 50.000+ erişim, 500+ etkileşim, 100 yeni takipçi",
            "Kurumsal 20+ firma ile görüşme, 10 filo teklifi, 5 anlaşma",
            "Basın bülteni 10+ yayın, 3 röportaj, TV haberi potansiyeli",
            "150 mevcut müşteri katılımı, %90 memnuniyet, 30 referans",
            "200+ üniversite öğrencisi ile temas, 50 staj başvurusu potansiyeli",
        ]

        detail_templates = [
            "{} etkinliği kapsamında stand alanı kirası, dekorasyon, personel ve ikram masrafları için teşvik talep edilmektedir. Etkinlik {} gün sürecek olup, günlük ortalama {} ziyaretçi beklenmektedir.",
            "Bayimiz {} bölgesinde {} organizasyonu düzenleyecektir. Etkinlik süresince Tofaş markası ana sponsor olarak yer alacak ve tüm iletişim materyallerinde logomuz kullanılacaktır.",
            "{} kapsamında araç sergisi düzenlenecektir. Sergi alanı {} m² olup, {} adet araç sergilenecektir. Profesyonel tanıtım ekibi ve hostesler görev yapacaktır.",
            "{} etkinliği için alan kirası, ses sistemi, sahne, catering ve güvenlik hizmetleri için bütçe talep edilmektedir. Tahmini katılımcı sayısı: {} kişi.",
        ]

        notes_templates = [
            "Geçen yıl benzer etkinlikte {} satış gerçekleştirdik. Bu yıl hedefimiz %{} artış.",
            "Bölgemizde rakip marka {} benzer etkinlik düzenledi, biz de pazar payımızı korumak istiyoruz.",
            "Belediye ile işbirliği yapıldı, ek tanıtım desteği sağlanacak.",
            "Yerel basın desteği alındı, etkinlik haberleri yayınlanacak.",
            "",
        ]

        statuses = [
            IncentiveRequest.Status.ONAY_BEKLIYOR,
            IncentiveRequest.Status.DEGERLENDIRME,
            IncentiveRequest.Status.ONAYLANDI,
            IncentiveRequest.Status.TAMAMLANDI,
            IncentiveRequest.Status.REDDEDILDI,
        ]

        status_weights = [3, 2, 2, 2, 1]

        created_count = 0

        for i in range(count):
            dealer = random.choice(dealers)
            status = random.choices(statuses, weights=status_weights)[0]
            venue = random.choice(venues)
            
            # Tutarlar
            base_amount = random.choice([15000, 25000, 35000, 50000, 75000, 100000, 150000])
            amount = Decimal(base_amount + random.randint(-5000, 10000))
            
            # Onaylanan tutar (onaylı veya tamamlanan için)
            approved_amount = None
            if status in [IncentiveRequest.Status.ONAYLANDI, IncentiveRequest.Status.TAMAMLANDI]:
                approved_amount = amount * Decimal(random.uniform(0.7, 1.0))
                approved_amount = approved_amount.quantize(Decimal('0.01'))
            
            # Tarihler
            created_days_ago = random.randint(1, 90)
            
            title = random.choice(incentive_titles)
            
            detail_template = random.choice(detail_templates)
            details = detail_template.format(
                title.split()[0:3],
                random.randint(2, 5),
                random.randint(200, 800),
                random.randint(100, 500)
            )

            # Admin notes
            admin_notes = ""
            if status != IncentiveRequest.Status.ONAY_BEKLIYOR:
                notes_list = []
                base_date = timezone.now() - timedelta(days=created_days_ago)
                
                if status == IncentiveRequest.Status.DEGERLENDIRME:
                    notes_list.append(f"[Değerlendirmeye Alındı - {(base_date + timedelta(days=2)).strftime('%d.%m.%Y')}]: Bütçe komitesi incelemesine sunuldu.")
                
                if status in [IncentiveRequest.Status.ONAYLANDI, IncentiveRequest.Status.TAMAMLANDI]:
                    notes_list.append(f"[Değerlendirmeye Alındı - {(base_date + timedelta(days=2)).strftime('%d.%m.%Y')}]: Bütçe komitesi incelemesine sunuldu.")
                    notes_list.append(f"[Onaylandı - {(base_date + timedelta(days=5)).strftime('%d.%m.%Y')}]: Talep onaylandı. Onaylanan tutar: ₺{approved_amount:,.2f}")
                
                if status == IncentiveRequest.Status.TAMAMLANDI:
                    notes_list.append(f"[Tamamlandı - {(base_date + timedelta(days=15)).strftime('%d.%m.%Y')}]: Etkinlik başarıyla gerçekleştirildi.")
                
                if status == IncentiveRequest.Status.REDDEDILDI:
                    notes_list.append(f"[Reddedildi - {(base_date + timedelta(days=3)).strftime('%d.%m.%Y')}]: Bütçe yetersizliği nedeniyle talep reddedildi.")
                
                admin_notes = "\n".join(notes_list)

            note = random.choice(notes_templates).format(
                random.randint(5, 20),
                random.randint(10, 30)
            )

            # Create incentive request
            incentive = IncentiveRequest.objects.create(
                dealer=dealer,
                incentive_title=title,
                incentive_details=details,
                purpose=random.choice(purposes),
                target_audience=random.choice(target_audiences),
                incentive_amount=amount,
                event_time=random.choice(event_times),
                event_location=venue[0],
                event_venue=venue[1],
                map_link=venue[2] if random.random() > 0.3 else "",
                performance_metrics=random.choice(performance_metrics),
                notes=note,
                status=status,
                admin_notes=admin_notes,
                approved_amount=approved_amount,
            )

            # Manually set created_at
            IncentiveRequest.objects.filter(pk=incentive.pk).update(
                created_at=timezone.now() - timedelta(days=created_days_ago)
            )

            created_count += 1
            self.stdout.write(f'  [{created_count}/{count}] {title[:50]}...')

        self.stdout.write(self.style.SUCCESS(f'\n✓ {created_count} teşvik talebi başarıyla oluşturuldu!'))
