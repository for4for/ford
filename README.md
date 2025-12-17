# Ford Bayi Otomasyonu

Ford bayileri için görsel talep, teşvik talep ve bayi yönetim sistemi.

## Teknoloji Stack

### Backend
- Django 5.2.6
- Django REST Framework 3.16.0
- PostgreSQL 16

### Frontend
- React 19.2.0
- React Admin 5.12.0
- Material-UI 7.3.4
- TypeScript 5.9.3
- Vite 7.1.9

## Kurulum

### Gereksinimler
- Docker 20.10+
- Docker Compose 2.0+

### Hızlı Başlangıç

**Detaylı kurulum için `SETUP.md` dosyasına bakın.**

1. Environment dosyasını oluşturun:
```bash
cp env.example .env
```

2. Docker container'ları başlatın:
```bash
docker-compose up -d
```

3. Backend migration'ları çalıştırın:
```bash
docker-compose exec backend python manage.py migrate
```

4. Superuser oluşturun:
```bash
docker-compose exec backend python manage.py createsuperuser
```

5. Uygulamaya erişin:
- Frontend: http://localhost:3084
- Backend API: http://localhost:8084/api
- Admin Panel: http://localhost:8084/admin
- API Docs: http://localhost:8084/api/schema/swagger-ui/

## Geliştirme

### Backend Geliştirme

Backend kodları `backend/` klasöründedir. Hot reload aktif olduğu için değişiklikler otomatik yansır.

```bash
# Log'ları takip et
docker-compose logs -f backend

# Django shell
docker-compose exec backend python manage.py shell

# Test çalıştır
docker-compose exec backend python manage.py test
```

### Frontend Geliştirme

Frontend kodları `frontend/` klasöründedir. Vite dev server ile hot reload aktiftir.

```bash
# Log'ları takip et
docker-compose logs -f frontend

# Dependency yükle
docker-compose exec frontend npm install <package-name>
```

## Proje Yapısı

```
ford/
├── backend/              # Django backend
│   ├── apps/
│   │   ├── users/       # Authentication
│   │   ├── dealers/     # Bayi modülü
│   │   ├── visuals/     # Görsel talepleri
│   │   └── incentives/  # Teşvik talepleri
│   └── config/          # Django settings
└── frontend/            # React Admin frontend
    └── src/
        ├── resources/   # Resource components
        ├── components/  # Reusable components
        └── layout/      # Layout components
```

## Modüller

### 1. Bayi Yönetimi
- Bayi kayıt ve profil yönetimi
- Bütçe takibi
- İstatistikler

### 2. Görsel İsteği
- Kreatif çalışma talepleri
- Çoklu boyut/ölçü girişi
- Dosya yükleme
- Onay süreci

### 3. Teşvik Talebi
- Etkinlik ve sponsorluk talepleri
- Bütçe yönetimi
- Performans metrik takibi
- Onay workflow'u

## Kullanıcı Rolleri

- **Admin**: Tüm yetkilere sahip
- **Moderator**: Talepleri görüntüleme ve onaylama
- **Bayi**: Kendi taleplerini oluşturma ve görüntüleme

## Lisans

Proprietary - Ford Otosan

