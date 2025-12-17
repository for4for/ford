# Ford Bayi Otomasyonu - Kurulum Kılavuzu

## Hızlı Başlangıç

### 1. Environment Dosyasını Oluşturun

```bash
cp env.example .env
```

Not: `.env.example` dosyası `.gitignore` tarafından engellendi, bu yüzden `env.example` kullanın.

### 2. Docker Container'ları Başlatın

```bash
docker-compose up -d
```

Bu komut tüm servisleri başlatacak:
- PostgreSQL (port 5432)
- Redis (port 6379)
- ClickHouse (port 8123)
- Django Backend (port 8000)
- React Frontend (port 3000)

### 3. Database Migration

İlk çalıştırmada migration'ları çalıştırın:

```bash
docker-compose exec backend python manage.py migrate
```

### 4. Superuser Oluşturun

Admin panel için superuser oluşturun:

```bash
docker-compose exec backend python manage.py createsuperuser
```

### 5. Uygulamaya Erişim

- Frontend: http://localhost:3084
- Backend API: http://localhost:8084/api
- Django Admin: http://localhost:8084/admin
- API Documentation: http://localhost:8084/api/schema/swagger-ui/

**Not**: Özel portlar kullanılıyor (çakışma önleme):
- PostgreSQL: 5484 (varsayılan 5432 yerine)
- Django Backend: 8084 (varsayılan 8000 yerine)
- React Frontend: 3084 (varsayılan 3000 yerine)

## Geliştirme

### Backend Log'ları

```bash
docker-compose logs -f backend
```

### Frontend Log'ları

```bash
docker-compose logs -f frontend
```

### Django Shell

```bash
docker-compose exec backend python manage.py shell
```

### Test Verisi Oluşturma

Django shell'de test verileri oluşturabilirsiniz:

```python
from apps.dealers.models import Dealer, BayiBudget
from apps.users.models import User

# Bayi oluştur
dealer = Dealer.objects.create(
    bayi_kodu='TEST001',
    bayi_unvani='Test Bayi',
    il='İstanbul',
    ilce='Kadıköy',
    adres='Test Adres',
    telefon='0212 123 4567',
    email='test@test.com',
    bayi_sorumlusu='Test Sorumlu',
    bolge_muduru='Test Müdür',
    durum='aktif'
)

# Bütçe oluştur
BayiBudget.objects.create(
    bayi=dealer,
    yil=2024,
    toplam_butce=100000,
    kullanilan_butce=0
)

# Kullanıcı oluştur
user = User.objects.create_user(
    username='bayi1',
    password='test1234',
    email='bayi1@test.com',
    role='bayi',
    dealer=dealer
)
```

## Container'ları Durdurma

```bash
docker-compose down
```

Volume'ları da silmek için:

```bash
docker-compose down -v
```

## Production Deployment

Production için:
1. `.env` dosyasında `DEBUG=0` yapın
2. `SECRET_KEY` değiştirin
3. `ALLOWED_HOSTS` ve `CORS_ALLOWED_ORIGINS` ayarlayın
4. Static dosyaları collect edin:

```bash
docker-compose exec backend python manage.py collectstatic --noinput
```

## Troubleshooting

### Port çakışması
Eğer portlar kullanılıyorsa, `docker-compose.yml` dosyasında port'ları değiştirin.

### Database bağlantı hatası
PostgreSQL container'ın hazır olmasını bekleyin:

```bash
docker-compose logs postgres
```

### Frontend build hatası
Node modules'leri yeniden yükleyin:

```bash
docker-compose exec frontend npm install
```

