# 🚂 Railway Deployment Rehberi

Bu döküman Ford Bayi Otomasyonu projesinin Railway'e tek repo üzerinden deploy edilmesini açıklar.

## 📋 Ön Gereksinimler

1. [Railway](https://railway.app) hesabı
2. GitHub hesabı (repo bağlantısı için)
3. Git ile proje GitHub'a push edilmiş olmalı

## 🏗️ Mimari

Railway'de 3 servis oluşturulacak:

```
┌─────────────────────────────────────────────────────────────┐
│                      Railway Project                         │
├─────────────────┬─────────────────┬─────────────────────────┤
│   PostgreSQL    │    Backend      │       Frontend          │
│   (Database)    │    (Django)     │       (React)           │
│                 │                 │                         │
│   Managed DB    │  ford/backend/  │    ford/frontend/       │
└─────────────────┴─────────────────┴─────────────────────────┘
```

## 🚀 Deployment Adımları

### 1. GitHub'a Push

```bash
cd ford
git init
git add .
git commit -m "Initial commit - Ford Bayi Otomasyonu"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ford-bayi-otomasyonu.git
git push -u origin main
```

### 2. Railway Project Oluşturma

1. [Railway Dashboard](https://railway.app/dashboard)'a git
2. **"New Project"** → **"Empty Project"** seç
3. Proje adını gir: `ford-bayi-otomasyonu`

### 3. PostgreSQL Database Ekleme

1. Proje içinde **"+ New"** → **"Database"** → **"PostgreSQL"**
2. Database otomatik oluşturulacak
3. **Variables** sekmesinden `DATABASE_URL` kopyala (Backend için lazım olacak)

### 4. Backend Servisi Ekleme

1. **"+ New"** → **"GitHub Repo"** → Repoyu seç
2. **Settings** sekmesine git:

   | Ayar | Değer |
   |------|-------|
   | **Root Directory** | `ford/backend` |
   | **Watch Paths** | `ford/backend/**` |

3. **Variables** sekmesine git ve şunları ekle:

   ```env
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   SECRET_KEY=your-super-secret-key-change-this-in-production
   DEBUG=False
   ALLOWED_HOSTS=.railway.app
   CORS_ALLOWED_ORIGINS=https://YOUR_FRONTEND_URL.railway.app
   CSRF_TRUSTED_ORIGINS=https://YOUR_FRONTEND_URL.railway.app
   ```

   > ⚠️ `YOUR_FRONTEND_URL` değerini frontend deploy edildikten sonra güncelleyin!

4. **Deploy** butonuna tıkla

### 5. Frontend Servisi Ekleme

1. **"+ New"** → **"GitHub Repo"** → Aynı repoyu seç
2. **Settings** sekmesine git:

   | Ayar | Değer |
   |------|-------|
   | **Root Directory** | `ford/frontend` |
   | **Watch Paths** | `ford/frontend/**` |

3. **Variables** sekmesine git ve şunları ekle:

   ```env
   VITE_API_URL=https://YOUR_BACKEND_URL.railway.app/api
   PORT=3000
   ```

   > ⚠️ `YOUR_BACKEND_URL` değerini backend'in Railway URL'si ile değiştirin!

4. **Deploy** butonuna tıkla

### 6. Domain Ayarları

Her servis için **Settings** → **Networking** → **Generate Domain** ile public URL oluştur.

### 7. CORS & Environment Güncelleme

Deploy sonrası URL'ler belli olduktan sonra:

**Backend Variables'da güncelle:**
```env
CORS_ALLOWED_ORIGINS=https://ford-frontend-production.up.railway.app
CSRF_TRUSTED_ORIGINS=https://ford-frontend-production.up.railway.app
```

**Frontend Variables'da güncelle:**
```env
VITE_API_URL=https://ford-backend-production.up.railway.app/api
```

### 8. Database Migration

Backend deploy olduktan sonra, Railway shell üzerinden migration çalıştır:

1. Backend servisine tıkla
2. Sağ üstten **"..."** → **"Open Railway Shell"**
3. Şu komutları çalıştır:

```bash
python manage.py migrate
python manage.py createsuperuser
```

### 9. Seed Data (Opsiyonel)

Demo veriler için:

```bash
python manage.py seed_dealers
python manage.py seed_visuals
python manage.py seed_incentives
python manage.py seed_campaigns
```

## 🔧 Environment Variables Özeti

### Backend

| Değişken | Açıklama | Örnek |
|----------|----------|-------|
| `DATABASE_URL` | PostgreSQL bağlantısı | `${{Postgres.DATABASE_URL}}` |
| `SECRET_KEY` | Django secret key | `super-secret-key-123` |
| `DEBUG` | Debug modu | `False` |
| `ALLOWED_HOSTS` | İzin verilen hostlar | `.railway.app` |
| `CORS_ALLOWED_ORIGINS` | CORS izinleri | `https://frontend.railway.app` |
| `CSRF_TRUSTED_ORIGINS` | CSRF güvenli originler | `https://frontend.railway.app` |

### Frontend

| Değişken | Açıklama | Örnek |
|----------|----------|-------|
| `VITE_API_URL` | Backend API URL | `https://backend.railway.app/api` |
| `PORT` | Nginx port | `3000` |

## 🔍 Troubleshooting

### Build Hatası

```bash
# Backend logs
railway logs -s backend

# Frontend logs  
railway logs -s frontend
```

### Database Bağlantı Hatası

1. `DATABASE_URL` değişkeninin doğru ayarlandığından emin ol
2. PostgreSQL servisinin çalıştığını kontrol et

### CORS Hatası

Frontend'den API çağrısı yaparken CORS hatası alıyorsanız:
1. Backend'de `CORS_ALLOWED_ORIGINS` değerini kontrol et
2. Frontend URL'sinin doğru olduğundan emin ol (https dahil)

### Static Files 404

Backend'de static dosyalar yüklenemiyorsa:
```bash
python manage.py collectstatic --noinput
```

## 📊 Monitoring

Railway dashboard üzerinden:
- **Metrics**: CPU, Memory, Network kullanımı
- **Logs**: Gerçek zamanlı loglar
- **Deployments**: Deploy geçmişi

## 💰 Maliyet

Railway'in ücretsiz tier'ı:
- $5/ay kredi (hobby plan)
- Ücretsiz PostgreSQL (500MB)
- Sleep after 7 days of inactivity (hobby)

Production için **Pro plan** ($20/ay) önerilir.

## 🔗 Faydalı Linkler

- [Railway Docs](https://docs.railway.app)
- [Railway Monorepo Guide](https://docs.railway.app/guides/monorepo)
- [Railway CLI](https://docs.railway.app/develop/cli)

---

**Not:** Bu rehber demo deployment içindir. Production için ek güvenlik önlemleri alınmalıdır.
