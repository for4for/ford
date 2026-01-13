from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
import random

from apps.dealers.models import Dealer, DealerBudget


class Command(BaseCommand):
    help = 'Tofaş bayileri için dummy kayıtlar oluşturur'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Önce mevcut kayıtları sil'
        )

    def handle(self, *args, **options):
        clear = options['clear']

        if clear:
            deleted_count = Dealer.objects.all().delete()[0]
            self.stdout.write(self.style.WARNING(f'{deleted_count} mevcut bayi kaydı silindi.'))

        # Tofaş Bayileri
        dealers_data = [
            {
                "dealer_code": "ANK-CNK-001",
                "dealer_name": "Başkent Tofaş Yetkili Bayi",
                "city": "Ankara",
                "district": "Çankaya",
                "address": "Turan Güneş Bulvarı No: 45, Çankaya/Ankara",
                "phone": "0312 440 50 60",
                "email": "info@baskenttofas.com.tr",
                "contact_first_name": "Ahmet",
                "contact_last_name": "Yılmaz",
                "regional_manager": "Murat Demir",
                "region": "İç Anadolu",
            },
            {
                "dealer_code": "IST-KDK-002",
                "dealer_name": "Anadolu Yakası Tofaş Yetkili Bayi",
                "city": "İstanbul",
                "district": "Kadıköy",
                "address": "E-5 Yan Yol Caddesi No: 120, Kadıköy/İstanbul",
                "phone": "0216 340 20 30",
                "email": "satis@anadolutofas.com.tr",
                "contact_first_name": "Mehmet",
                "contact_last_name": "Kaya",
                "regional_manager": "Ali Öztürk",
                "region": "Marmara",
            },
            {
                "dealer_code": "IST-BSK-003",
                "dealer_name": "Avrupa Yakası Tofaş Yetkili Bayi",
                "city": "İstanbul",
                "district": "Beşiktaş",
                "address": "Barbaros Bulvarı No: 78, Beşiktaş/İstanbul",
                "phone": "0212 260 70 80",
                "email": "info@avrupatofas.com.tr",
                "contact_first_name": "Fatma",
                "contact_last_name": "Şahin",
                "regional_manager": "Ali Öztürk",
                "region": "Marmara",
            },
            {
                "dealer_code": "IZM-KRS-004",
                "dealer_name": "Ege Tofaş Yetkili Bayi",
                "city": "İzmir",
                "district": "Karşıyaka",
                "address": "Cemal Gürsel Caddesi No: 200, Karşıyaka/İzmir",
                "phone": "0232 360 40 50",
                "email": "satis@egetofas.com.tr",
                "contact_first_name": "Can",
                "contact_last_name": "Özdemir",
                "regional_manager": "Zeynep Yıldız",
                "region": "Ege",
            },
            {
                "dealer_code": "BRS-NLF-005",
                "dealer_name": "Bursa Tofaş Yetkili Bayi",
                "city": "Bursa",
                "district": "Nilüfer",
                "address": "Mudanya Yolu No: 55, Nilüfer/Bursa",
                "phone": "0224 240 30 40",
                "email": "info@bursatofas.com.tr",
                "contact_first_name": "Emre",
                "contact_last_name": "Aksoy",
                "regional_manager": "Hakan Korkmaz",
                "region": "Marmara",
            },
            {
                "dealer_code": "ANT-MRT-006",
                "dealer_name": "Akdeniz Tofaş Yetkili Bayi",
                "city": "Antalya",
                "district": "Muratpaşa",
                "address": "Aspendos Bulvarı No: 90, Muratpaşa/Antalya",
                "phone": "0242 320 10 20",
                "email": "satis@akdeniztofas.com.tr",
                "contact_first_name": "Deniz",
                "contact_last_name": "Yılmaz",
                "regional_manager": "Selin Aydın",
                "region": "Akdeniz",
            },
            {
                "dealer_code": "KCL-IZM-007",
                "dealer_name": "Körfez Tofaş Yetkili Bayi",
                "city": "Kocaeli",
                "district": "İzmit",
                "address": "D-100 Karayolu No: 150, İzmit/Kocaeli",
                "phone": "0262 330 50 60",
                "email": "info@korfeztofas.com.tr",
                "contact_first_name": "Burak",
                "contact_last_name": "Çelik",
                "regional_manager": "Hakan Korkmaz",
                "region": "Marmara",
            },
            {
                "dealer_code": "ESK-TPB-008",
                "dealer_name": "Eskişehir Tofaş Yetkili Bayi",
                "city": "Eskişehir",
                "district": "Tepebaşı",
                "address": "İsmet İnönü Caddesi No: 80, Tepebaşı/Eskişehir",
                "phone": "0222 220 40 50",
                "email": "satis@eskisehirtofas.com.tr",
                "contact_first_name": "Seda",
                "contact_last_name": "Koç",
                "regional_manager": "Murat Demir",
                "region": "İç Anadolu",
            },
            {
                "dealer_code": "ADN-SYH-009",
                "dealer_name": "Çukurova Tofaş Yetkili Bayi",
                "city": "Adana",
                "district": "Seyhan",
                "address": "Turhan Cemal Beriker Bulvarı No: 120, Seyhan/Adana",
                "phone": "0322 430 60 70",
                "email": "info@cukurovatofas.com.tr",
                "contact_first_name": "Gökhan",
                "contact_last_name": "Arslan",
                "regional_manager": "Selin Aydın",
                "region": "Akdeniz",
            },
            {
                "dealer_code": "GZT-SHN-010",
                "dealer_name": "Güneydoğu Tofaş Yetkili Bayi",
                "city": "Gaziantep",
                "district": "Şahinbey",
                "address": "İnönü Bulvarı No: 200, Şahinbey/Gaziantep",
                "phone": "0342 230 20 30",
                "email": "satis@guneydogutofas.com.tr",
                "contact_first_name": "Kemal",
                "contact_last_name": "Polat",
                "regional_manager": "Oğuz Kara",
                "region": "Güneydoğu Anadolu",
            },
        ]

        created_count = 0

        for dealer_data in dealers_data:
            # Check if dealer already exists
            if Dealer.objects.filter(dealer_code=dealer_data["dealer_code"]).exists():
                self.stdout.write(f'  [SKIP] {dealer_data["dealer_name"]} zaten mevcut')
                continue

            dealer = Dealer.objects.create(
                dealer_code=dealer_data["dealer_code"],
                dealer_name=dealer_data["dealer_name"],
                city=dealer_data["city"],
                district=dealer_data["district"],
                address=dealer_data["address"],
                phone=dealer_data["phone"],
                email=dealer_data["email"],
                contact_first_name=dealer_data["contact_first_name"],
                contact_last_name=dealer_data["contact_last_name"],
                regional_manager=dealer_data["regional_manager"],
                region=dealer_data["region"],
                dealer_type=random.choice([Dealer.BayiTuru.YETKILI, Dealer.BayiTuru.ANLASMALI]),
                status=Dealer.Durum.AKTIF,
                tax_number=f"{random.randint(1000000000, 9999999999)}",
            )

            # Create budget for current year
            current_year = timezone.now().year
            DealerBudget.objects.create(
                dealer=dealer,
                year=current_year,
                total_budget=Decimal(random.choice([50000, 75000, 100000, 150000, 200000])),
                used_budget=Decimal(random.randint(5000, 30000)),
            )

            created_count += 1
            self.stdout.write(f'  [{created_count}] {dealer_data["dealer_name"]}')

        self.stdout.write(self.style.SUCCESS(f'\n✓ {created_count} Tofaş bayisi başarıyla oluşturuldu!'))
