# Email Template'leri

Bu klasör, projedeki tüm email template'lerini içerir.

## Yapı

### `base_email.html`
Tüm email'ler için temel (base) template. Tofaş logosunu, renk şemasını ve genel yapıyı içerir.

**Özellikler:**
- Tofaş marka renkleri (#952539)
- Responsive tasarım
- Logo otomatik olarak eklenir
- Footer'da yıl otomatik güncellenir

**Kullanım:**
```django
{% extends "emails/base_email.html" %}

{% block content %}
    <!-- Email içeriğiniz buraya -->
{% endblock %}
```

### `password_reset_email.html`
Şifre sıfırlama için özel template.

**Değişkenler:**
- `user_name`: Kullanıcının adı
- `reset_url`: Şifre sıfırlama linki

## Yeni Email Template Ekleme

### 1. Template Dosyası Oluşturun

```html
{% extends "emails/base_email.html" %}

{% block content %}
<p style='margin-top: 20px;'>
    Merhaba <strong>{{ user_name }}</strong>,
</p>

<p>
    Email içeriğiniz buraya...
</p>

<p style='text-align: center;'>
    <a href='{{ action_url }}' class='button' style='color: white !important;'>
        Aksiyon Butonu
    </a>
</p>
{% endblock %}
```

### 2. Email Utility Fonksiyonu Oluşturun

`backend/apps/users/email_utils.py` dosyasına yeni fonksiyon ekleyin:

```python
def send_your_custom_email(user, custom_data):
    """
    Send custom email to user
    
    Args:
        user: User object
        custom_data: Your custom data
        
    Returns:
        bool: True if email was sent successfully
    """
    context = {
        'user_name': user.get_full_name() or user.username,
        'action_url': custom_data.get('url'),
    }
    
    plain_text = f'''
Merhaba {context['user_name']},

Plain text içeriğiniz buraya...

İyi günler dileriz,
Tofaş Bayi Portalı Ekibi
    '''
    
    return send_templated_email(
        subject='Konu - Tofaş Bayi Portalı',
        template_name='emails/your_template.html',
        context=context,
        recipient_list=[user.email],
        plain_text_message=plain_text
    )
```

### 3. View'den Kullanın

```python
from apps.users.email_utils import send_your_custom_email

# Email gönder
send_your_custom_email(user, {'url': 'https://example.com'})
```

## Mevcut Email Fonksiyonları

### `send_templated_email(subject, template_name, context, recipient_list, ...)`
Genel amaçlı email gönderme fonksiyonu.

**Parametreler:**
- `subject`: Email konusu
- `template_name`: Template dosya yolu (örn: 'emails/my_template.html')
- `context`: Template değişkenleri (dict)
- `recipient_list`: Alıcı email listesi
- `from_email`: (Opsiyonel) Gönderen email
- `plain_text_message`: (Opsiyonel) Plain text alternatifi

### `send_password_reset_email(user, reset_url)`
Şifre sıfırlama email'i gönderir.

### `send_welcome_email(user)`
Hoş geldiniz email'i gönderir (base template kullanır).

## Tasarım Kuralları

1. **Renkler:**
   - Ana renk: `#952539` (Tofaş kırmızısı)
   - Hover renk: `#7a1e2e`
   - Text renk: `#303030`
   - İkincil text: `#666666`
   - Arka plan: `#f2f2f2`

2. **Butonlar:**
   - `.button` class'ını kullanın
   - `style='color: white !important;'` eklemeyi unutmayın (email client'ları için)

3. **Paragraflar:**
   - `margin-top: 20px` kullanın
   - Font: Verdana
   - Font size: 15px

4. **Responsive:**
   - Table width: 599px (mobil uyumlu)
   - Tüm içerik table içinde olmalı

## Test Etme

Development modunda email'ler console'a yazdırılır:

```bash
docker-compose logs -f backend
```

Email içeriğini terminal loglarında görebilirsiniz.

## Production Ayarları

Production'da SMTP kullanmak için `.env` dosyasını güncelleyin:

```env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@tofas.com.tr
FRONTEND_URL=https://your-domain.com
```
