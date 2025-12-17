from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
import random

from apps.visuals.models import (
    VisualRequest, 
    VisualRequestSize, 
    VisualRequestCreative
)
from apps.dealers.models import Dealer


class Command(BaseCommand):
    help = 'Görsel talepleri için dummy kayıtlar oluşturur'

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
            deleted_count = VisualRequest.objects.all().delete()[0]
            self.stdout.write(self.style.WARNING(f'{deleted_count} mevcut kayıt silindi.'))

        # Tofaş/Fiat/Jeep/Alfa Romeo İş Talepleri
        work_requests = [
            "Yeni Fiat Egea lansmanı için showroom roll-up tasarımı",
            "Fiat 500 Elektrik tanıtım afişleri",
            "Yıl sonu kampanyası için dijital ekran görselleri",
            "Jeep Compass test sürüşü etkinliği için çadır ve branda tasarımı",
            "Bahar kampanyası el ilanı ve poster tasarımı",
            "Jeep Renegade outdoor etkinlik stand tasarımı",
            "Servis kampanyası için megalight görseli",
            "Fiat Ducato tanıtımı için totem ve sticker",
            "Alfa Romeo Stelvio showroom tente tasarımı",
            "Fiat Tipo lansman etkinliği için tüm materyaller",
            "Finansman kampanyası dijital ve basılı görseller",
            "Fiat Doblo filo satış sunumu materyalleri",
            "Yaz lastiği kampanyası için görsel set",
            "Fiat Panda aile konsepti görselleri",
            "Kurumsal araç filosu tanıtım materyalleri",
            "Alfa Romeo Giulia premium lansman materyalleri",
            "Jeep Avenger elektrik tanıtım görselleri",
        ]

        work_details_templates = [
            "Yeni {} modeli için {} adet {} tasarımı gerekiyor. Tofaş kurumsal kimliğine uygun, modern ve dikkat çekici bir tasarım bekliyoruz. Kampanya {} tarihinde başlayacak.",
            "{} model gamımız için {} farklı boyutta materyal hazırlanması gerekiyor. Hedef kitle: {}. Mesaj: {}",
            "Bayimiz {} etkinliği düzenliyor. Bu etkinlik için {} adet kreatif materyal ihtiyacımız var. Etkinlik tarihi: {}",
            "{} kampanyamız için görsel destek talep ediyoruz. Toplam {} parça materyal gerekiyor. Özellikle {} vurgulanmalı.",
        ]

        messages = [
            "Şimdi Fiat'ınız olsun, ödemeye sonra başlayın!",
            "Test sürüşüne davetlisiniz",
            "Yeni nesil sürüş deneyimi",
            "Aile boyu konfor ve güvenlik",
            "Elektrikli geleceğe hazır mısınız?",
            "İtalyan tasarımı, uygun fiyat avantajı",
            "Sınırsız yol, sınırsız özgürlük",
            "İş ortağınız Fiat",
            "Jeep ile maceraya hazır mısın?",
            "Alfa Romeo - Tutku ile tasarlandı",
        ]

        audiences = [
            "Genç profesyoneller (25-40 yaş)",
            "Aileler",
            "KOBİ sahipleri ve filo yöneticileri",
            "Outdoor ve macera tutkunları",
            "Çevre bilinci yüksek tüketiciler",
            "Premium segment müşteriler",
        ]

        statuses = [
            VisualRequest.Status.TASLAK,
            VisualRequest.Status.GORSEL_BEKLIYOR,
            VisualRequest.Status.BAYI_ONAYI_BEKLIYOR,
            VisualRequest.Status.ONAY_BEKLIYOR,
            VisualRequest.Status.ONAYLANDI,
            VisualRequest.Status.TAMAMLANDI,
        ]

        status_weights = [1, 3, 2, 3, 2, 2]  # Ağırlıklı dağılım

        sizes_options = [
            ("85cm x 200cm", "Roll-up"),
            ("50cm x 70cm", "Poster"),
            ("100cm x 150cm", "Afiş"),
            ("3m x 2m", "Branda"),
            ("6m x 3m", "Çadır"),
            ("1920x1080px", "Dijital Ekran"),
            ("A4", "El İlanı"),
            ("A5", "Broşür"),
            ("2m x 3m", "Totem"),
            ("30cm x 50cm", "Sticker"),
        ]

        creative_types = [
            VisualRequestCreative.KreatifTipi.POSTER,
            VisualRequestCreative.KreatifTipi.ROLLUP,
            VisualRequestCreative.KreatifTipi.BRANDA,
            VisualRequestCreative.KreatifTipi.DIJITAL,
            VisualRequestCreative.KreatifTipi.EL_ILANI,
            VisualRequestCreative.KreatifTipi.CADIR,
            VisualRequestCreative.KreatifTipi.TENTE,
            VisualRequestCreative.KreatifTipi.STAND,
            VisualRequestCreative.KreatifTipi.TOTEM,
            VisualRequestCreative.KreatifTipi.STICKER,
        ]

        # Tofaş araç modelleri
        car_models = [
            "Fiat Egea", "Fiat 500", "Fiat Tipo", "Fiat Panda", 
            "Fiat Doblo", "Fiat Ducato", "Jeep Compass", "Jeep Renegade",
            "Jeep Avenger", "Alfa Romeo Giulia", "Alfa Romeo Stelvio"
        ]

        created_count = 0

        for i in range(count):
            dealer = random.choice(dealers)
            status = random.choices(statuses, weights=status_weights)[0]
            
            # Tarihler
            created_days_ago = random.randint(1, 60)
            deadline_days_from_now = random.randint(7, 45)
            
            work_request = random.choice(work_requests)
            audience = random.choice(audiences)
            message = random.choice(messages)
            
            details_template = random.choice(work_details_templates)
            work_details = details_template.format(
                random.choice(car_models),
                random.randint(2, 8),
                random.choice(["roll-up", "poster", "branda", "dijital görsel"]),
                (timezone.now() + timedelta(days=deadline_days_from_now)).strftime("%d.%m.%Y")
            )

            # Admin notes for non-draft items
            admin_notes = ""
            if status != VisualRequest.Status.TASLAK:
                notes_list = []
                base_date = timezone.now() - timedelta(days=created_days_ago)
                
                if status in [VisualRequest.Status.GORSEL_BEKLIYOR, VisualRequest.Status.BAYI_ONAYI_BEKLIYOR, 
                             VisualRequest.Status.ONAY_BEKLIYOR, VisualRequest.Status.ONAYLANDI, 
                             VisualRequest.Status.TAMAMLANDI]:
                    notes_list.append(f"[Creative Ajans'a Gönderildi - {(base_date + timedelta(days=1)).strftime('%d.%m.%Y %H:%M')}]")
                
                if status in [VisualRequest.Status.BAYI_ONAYI_BEKLIYOR, VisualRequest.Status.ONAY_BEKLIYOR,
                             VisualRequest.Status.ONAYLANDI, VisualRequest.Status.TAMAMLANDI]:
                    notes_list.append(f"[Bayi Onayına Gönderildi - {(base_date + timedelta(days=3)).strftime('%d.%m.%Y %H:%M')}]")
                
                if status in [VisualRequest.Status.ONAY_BEKLIYOR, VisualRequest.Status.ONAYLANDI, 
                             VisualRequest.Status.TAMAMLANDI]:
                    notes_list.append(f"[Marka Onayına Gönderildi - {(base_date + timedelta(days=5)).strftime('%d.%m.%Y %H:%M')}]")
                
                if status in [VisualRequest.Status.ONAYLANDI, VisualRequest.Status.TAMAMLANDI]:
                    notes_list.append(f"[Onaylandı - {(base_date + timedelta(days=7)).strftime('%d.%m.%Y %H:%M')}]")
                
                admin_notes = "\n".join(notes_list)

            # Assigned to
            assigned_to = None
            if status == VisualRequest.Status.GORSEL_BEKLIYOR:
                assigned_to = VisualRequest.AssignedTo.CREATIVE_AGENCY
            elif status == VisualRequest.Status.BAYI_ONAYI_BEKLIYOR:
                assigned_to = VisualRequest.AssignedTo.DEALER
            elif status == VisualRequest.Status.ONAY_BEKLIYOR:
                assigned_to = VisualRequest.AssignedTo.BRAND

            # Create visual request
            visual_request = VisualRequest.objects.create(
                dealer=dealer,
                creative_work_request=work_request,
                quantity_request=random.randint(1, 10),
                work_details=work_details,
                intended_message=message,
                legal_text="*Görsel temsilidir. Detaylı bilgi için bayinize danışınız." if random.random() > 0.5 else "",
                deadline=timezone.now().date() + timedelta(days=deadline_days_from_now),
                status=status,
                assigned_to=assigned_to,
                admin_notes=admin_notes,
            )

            # Manually set created_at
            VisualRequest.objects.filter(pk=visual_request.pk).update(
                created_at=timezone.now() - timedelta(days=created_days_ago)
            )

            # Add sizes (1-3 random sizes)
            num_sizes = random.randint(1, 3)
            selected_sizes = random.sample(sizes_options, min(num_sizes, len(sizes_options)))
            for size, _ in selected_sizes:
                VisualRequestSize.objects.create(
                    visual_request=visual_request,
                    size=size,
                    quantity=random.randint(1, 5)
                )

            # Add creative types (1-4 random types)
            num_creatives = random.randint(1, 4)
            selected_creatives = random.sample(creative_types, min(num_creatives, len(creative_types)))
            for creative_type in selected_creatives:
                VisualRequestCreative.objects.create(
                    visual_request=visual_request,
                    creative_type=creative_type,
                    description=f"{creative_type} için özel tasarım" if random.random() > 0.6 else ""
                )

            created_count += 1
            self.stdout.write(f'  [{created_count}/{count}] {work_request[:50]}...')

        self.stdout.write(self.style.SUCCESS(f'\n✓ {created_count} görsel talebi başarıyla oluşturuldu!'))
