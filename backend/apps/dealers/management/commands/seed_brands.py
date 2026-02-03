from django.core.management.base import BaseCommand

from apps.dealers.models import Brand, Dealer
from config.db_router import set_current_brand


class Command(BaseCommand):
    help = 'Markalar için seed oluşturur ve bayilere bağlar (--brand ford|tofas)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--brand',
            type=str,
            default='ford',
            choices=['ford', 'tofas'],
            help='Marka seçimi (ford veya tofas)'
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Önce mevcut kayıtları sil'
        )

    def handle(self, *args, **options):
        brand = options['brand']
        clear = options['clear']

        # Set database context for brand
        set_current_brand(brand)

        if clear:
            deleted_count = Brand.objects.all().delete()[0]
            self.stdout.write(self.style.WARNING(f'{deleted_count} mevcut marka kaydı silindi.'))

        # Marka bazlı içerik
        if brand == 'ford':
            brands_data = self.get_ford_brands()
            brand_name = "Ford"
        else:
            brands_data = self.get_tofas_brands()
            brand_name = "Tofaş"

        self.stdout.write(f'\n{brand_name} markaları oluşturuluyor...\n')

        created_count = 0
        brand_objects = {}

        for brand_data in brands_data:
            # Check if brand already exists
            existing = Brand.objects.filter(code=brand_data["code"]).first()
            if existing:
                self.stdout.write(f'  [SKIP] {brand_data["name"]} zaten mevcut')
                brand_objects[brand_data["code"]] = existing
                continue

            brand_obj = Brand.objects.create(
                name=brand_data["name"],
                code=brand_data["code"],
                fb_ad_account_id=brand_data.get("fb_ad_account_id", ""),
                ig_ad_account_id=brand_data.get("ig_ad_account_id", ""),
                google_ad_account_id=brand_data.get("google_ad_account_id", ""),
                is_active=True,
            )
            brand_objects[brand_data["code"]] = brand_obj
            created_count += 1
            self.stdout.write(f'  [{created_count}] {brand_data["name"]}')

        self.stdout.write(self.style.SUCCESS(f'\n✓ {created_count} marka oluşturuldu!'))

        # Bayilere marka bağla
        self.stdout.write(f'\nBayilere marka bağlanıyor...\n')
        
        if brand == 'ford':
            # Tüm Ford bayilerine Ford markasını bağla
            ford_brand = brand_objects.get("FORD")
            if ford_brand:
                updated = Dealer.objects.filter(brand__isnull=True).update(brand=ford_brand)
                self.stdout.write(self.style.SUCCESS(f'✓ {updated} bayi Ford markasına bağlandı!'))
        else:
            # Tofaş için birden fazla marka var, bayi ismine göre eşleştir
            for dealer in Dealer.objects.filter(brand__isnull=True):
                dealer_name_lower = dealer.dealer_name.lower()
                
                if 'fiat' in dealer_name_lower or 'egea' in dealer_name_lower:
                    dealer.brand = brand_objects.get("FIAT")
                elif 'jeep' in dealer_name_lower:
                    dealer.brand = brand_objects.get("JEEP")
                elif 'alfa' in dealer_name_lower:
                    dealer.brand = brand_objects.get("ALFA")
                else:
                    # Default: Fiat
                    dealer.brand = brand_objects.get("FIAT")
                
                if dealer.brand:
                    dealer.save()
                    self.stdout.write(f'  {dealer.dealer_name} → {dealer.brand.name}')

        self.stdout.write(self.style.SUCCESS(f'\n✓ Marka eşleştirme tamamlandı!'))

    def get_ford_brands(self):
        """Ford markaları"""
        return [
            {
                "name": "Ford",
                "code": "FORD",
                "fb_ad_account_id": "act_ford_turkey",
                "ig_ad_account_id": "act_ford_turkey_ig",
                "google_ad_account_id": "ford_turkey_ads",
            },
        ]

    def get_tofas_brands(self):
        """Tofaş markaları (Fiat, Jeep, Alfa Romeo)"""
        return [
            {
                "name": "Fiat",
                "code": "FIAT",
                "fb_ad_account_id": "act_fiat_turkey",
                "ig_ad_account_id": "act_fiat_turkey_ig",
                "google_ad_account_id": "fiat_turkey_ads",
            },
            {
                "name": "Jeep",
                "code": "JEEP",
                "fb_ad_account_id": "act_jeep_turkey",
                "ig_ad_account_id": "act_jeep_turkey_ig",
                "google_ad_account_id": "jeep_turkey_ads",
            },
            {
                "name": "Alfa Romeo",
                "code": "ALFA",
                "fb_ad_account_id": "act_alfa_turkey",
                "ig_ad_account_id": "act_alfa_turkey_ig",
                "google_ad_account_id": "alfa_turkey_ads",
            },
        ]

