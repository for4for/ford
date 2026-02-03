"""
Django settings for Ford Bayi Otomasyonu project.
"""
import os
from pathlib import Path
from datetime import timedelta
from decouple import config
import dj_database_url

# Build paths inside the project
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config('SECRET_KEY', default='django-insecure-change-this-in-production')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = config('DEBUG', default=True, cast=bool)

ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1', cast=lambda v: [s.strip() for s in v.split(',')])

# Railway provides RAILWAY_PUBLIC_DOMAIN
RAILWAY_PUBLIC_DOMAIN = config('RAILWAY_PUBLIC_DOMAIN', default=None)
if RAILWAY_PUBLIC_DOMAIN:
    ALLOWED_HOSTS.append(RAILWAY_PUBLIC_DOMAIN)

# Azure Container Apps domain support
AZURE_CONTAINER_APP_DOMAIN = config('CONTAINER_APP_ENV_DNS_SUFFIX', default=None)
if AZURE_CONTAINER_APP_DOMAIN:
    ALLOWED_HOSTS.append(f"*.{AZURE_CONTAINER_APP_DOMAIN}")

# Azure Container Apps provides specific hostname
AZURE_CONTAINER_APP_NAME = config('CONTAINER_APP_NAME', default=None)
if AZURE_CONTAINER_APP_NAME and AZURE_CONTAINER_APP_DOMAIN:
    ALLOWED_HOSTS.append(f"{AZURE_CONTAINER_APP_NAME}.{AZURE_CONTAINER_APP_DOMAIN}")
    
# CSRF settings for production
CSRF_TRUSTED_ORIGINS = config(
    'CSRF_TRUSTED_ORIGINS',
    default='http://localhost:3084,http://127.0.0.1:3084',
    cast=lambda v: [s.strip() for s in v.split(',')]
)

# Proxy/Load Balancer SSL settings (for Azure Container Apps, Railway, etc.)
# Bu ayarlar reverse proxy arkasında HTTPS kullanıldığında gerekli
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
USE_X_FORWARDED_HOST = True
USE_X_FORWARDED_PORT = True

# Production'da HTTPS zorunlu
if not DEBUG:
    SECURE_SSL_REDIRECT = config('SECURE_SSL_REDIRECT', default=True, cast=bool)
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party apps
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_filters',
    'drf_spectacular',
    'storages',  # Cloud storage (Azure, S3, etc.)
    
    # Local apps
    'apps.users',
    'apps.dealers',
    'apps.visuals',
    'apps.incentives',
    'apps.campaigns',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Static files in production
    'corsheaders.middleware.CorsMiddleware',
    'config.brand_middleware.BrandMiddleware',  # Multi-tenant brand detection
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# Database - Multi-tenant setup
# Her brand için ayrı veritabanı kullanılır
# DATABASE_ROUTERS brand'e göre doğru DB'ye yönlendirir

# Production: DATABASE_URL_FORD ve DATABASE_URL_TOFAS kullanılır
DATABASE_URL_FORD = config('DATABASE_URL_FORD', default=None)
DATABASE_URL_TOFAS = config('DATABASE_URL_TOFAS', default=None)

if DATABASE_URL_FORD and DATABASE_URL_TOFAS:
    # Production: Ayrı URL'lerden konfigüre et
    DATABASES = {
        'default': {},  # Boş - router yönlendirecek
        'ford': dj_database_url.config(default=DATABASE_URL_FORD, conn_max_age=600),
        'tofas': dj_database_url.config(default=DATABASE_URL_TOFAS, conn_max_age=600),
    }
else:
    # Development: Local PostgreSQL (tek user, iki database)
    DATABASES = {
        'default': {},  # Boş - router yönlendirecek
        'ford': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': config('FORD_DB_NAME', default='ford_db'),
            'USER': config('FORD_DB_USER', default='postgres'),
            'PASSWORD': config('FORD_DB_PASSWORD', default='postgres'),
            'HOST': config('FORD_DB_HOST', default='postgres'),
            'PORT': config('FORD_DB_PORT', default='5432'),
        },
        'tofas': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': config('TOFAS_DB_NAME', default='tofas_db'),
            'USER': config('TOFAS_DB_USER', default='postgres'),
            'PASSWORD': config('TOFAS_DB_PASSWORD', default='postgres'),
            'HOST': config('TOFAS_DB_HOST', default='postgres'),
            'PORT': config('TOFAS_DB_PORT', default='5432'),
        },
    }

# Database Router - Brand'e göre DB seçimi
DATABASE_ROUTERS = ['config.db_router.BrandDatabaseRouter']

# Cache (Simple in-memory cache for development)
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'ford-cache',
    }
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Custom User Model
AUTH_USER_MODEL = 'users.User'

# Internationalization
LANGUAGE_CODE = 'tr-tr'
TIME_ZONE = 'Europe/Istanbul'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# WhiteNoise for static files in production
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Media files (User uploads)
# Azure Blob Storage kullanılıyorsa (Production)
AZURE_STORAGE_ACCOUNT_NAME = config('AZURE_STORAGE_ACCOUNT_NAME', default=None)
AZURE_STORAGE_ACCOUNT_KEY = config('AZURE_STORAGE_ACCOUNT_KEY', default=None)
AZURE_STORAGE_CONTAINER = config('AZURE_STORAGE_CONTAINER', default='media')

if AZURE_STORAGE_ACCOUNT_NAME and AZURE_STORAGE_ACCOUNT_KEY:
    # Azure Blob Storage kullan (Django 4.2+ STORAGES syntax)
    AZURE_CUSTOM_DOMAIN = f'{AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net'
    MEDIA_URL = f'https://{AZURE_CUSTOM_DOMAIN}/{AZURE_STORAGE_CONTAINER}/'
    
    STORAGES = {
        "default": {
            "BACKEND": "storages.backends.azure_storage.AzureStorage",
            "OPTIONS": {
                "account_name": AZURE_STORAGE_ACCOUNT_NAME,
                "account_key": AZURE_STORAGE_ACCOUNT_KEY,
                "azure_container": AZURE_STORAGE_CONTAINER,
                "azure_ssl": True,
            },
        },
        "staticfiles": {
            "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
        },
    }
else:
    # Local storage (development)
    MEDIA_URL = '/media/'
    MEDIA_ROOT = BASE_DIR / 'media'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_PAGINATION_CLASS': 'config.pagination.CustomPageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

# JWT Configuration
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=12),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'HS256',
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# CORS Configuration
CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='http://localhost:3000,http://127.0.0.1:3000',
    cast=lambda v: [s.strip() for s in v.split(',')]
)

CORS_ALLOW_CREDENTIALS = True

# DRF Spectacular (API Documentation)
SPECTACULAR_SETTINGS = {
    'TITLE': 'Ford Bayi Otomasyonu API',
    'DESCRIPTION': 'API documentation for Ford Bayi Otomasyonu System',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'COMPONENT_SPLIT_REQUEST': True,
}

# File Upload Settings
DATA_UPLOAD_MAX_MEMORY_SIZE = 10485760  # 10MB
FILE_UPLOAD_MAX_MEMORY_SIZE = 10485760  # 10MB

# Frontend URL for password reset links
FRONTEND_URL = config('FRONTEND_URL', default='http://localhost:3084')

# Email Configuration
EMAIL_BACKEND = config('EMAIL_BACKEND', default='django.core.mail.backends.console.EmailBackend')
EMAIL_HOST = config('EMAIL_HOST', default='smtp.gmail.com')
EMAIL_PORT = config('EMAIL_PORT', default=587, cast=int)
EMAIL_USE_TLS = config('EMAIL_USE_TLS', default=True, cast=bool)
EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')
DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL', default='noreply@tofas.com.tr')
