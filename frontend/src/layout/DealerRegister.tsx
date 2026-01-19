import { useState } from 'react';
import { useNotify, Notification } from 'react-admin';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  IconButton,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// E-posta validasyon fonksiyonu
const validateEmail = (email: string): boolean => {
  if (!email) return true; // Boşsa validasyon yapma
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Telefon numarası formatla: 0(5XX) XXX XX XX
const formatPhoneNumber = (value: string): string => {
  // Sadece rakamları al
  const numbers = value.replace(/\D/g, '');
  
  // Maksimum 11 rakam (0 dahil)
  const limited = numbers.slice(0, 11);
  
  // Formatlama
  if (limited.length === 0) return '';
  if (limited.length <= 1) return limited;
  if (limited.length <= 4) return `${limited.slice(0, 1)}(${limited.slice(1)}`;
  if (limited.length <= 7) return `${limited.slice(0, 1)}(${limited.slice(1, 4)}) ${limited.slice(4)}`;
  if (limited.length <= 9) return `${limited.slice(0, 1)}(${limited.slice(1, 4)}) ${limited.slice(4, 7)} ${limited.slice(7)}`;
  return `${limited.slice(0, 1)}(${limited.slice(1, 4)}) ${limited.slice(4, 7)} ${limited.slice(7, 9)} ${limited.slice(9, 11)}`;
};

// Telefon numarası validasyonu - tam 11 rakam olmalı
const validatePhone = (value: string): boolean => {
  const numbers = value.replace(/\D/g, '');
  return numbers.length === 11;
};

export const DealerRegister = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const notify = useNotify();
  const navigate = useNavigate();
  const theme = useTheme();

  const [formData, setFormData] = useState({
    user_email: '',  // Login için kullanılacak e-posta
    dealer_name: '',
    city: '',
    district: '',
    address: '',
    phone: '',
    contact_email: '',  // İletişim e-postası (kurumsal)
    contact_first_name: '',  // Bayi sorumlusu adı
    contact_last_name: '',   // Bayi sorumlusu soyadı
    regional_manager: '',
    password: '',
    password_confirm: '',
  });

  const handleInputChange = (field: string, value: string) => {
    // Telefon numarası için maske uygula
    if (field === 'phone') {
      const formattedPhone = formatPhoneNumber(value);
      setFormData((prev) => ({ ...prev, [field]: formattedPhone }));
      return;
    }
    
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Blur (odak kaybı) validasyonu
  const handleBlur = (field: string, value: string) => {
    const trimmedValue = value.trim();
    
    // Zorunlu alan kontrolü
    const requiredFields: Record<string, string> = {
      dealer_name: 'Bayi ünvanı zorunludur',
      city: 'İl zorunludur',
      district: 'İlçe zorunludur',
      address: 'Adres zorunludur',
      phone: 'Telefon zorunludur',
      contact_email: 'İletişim e-postası zorunludur',
      contact_first_name: 'Ad zorunludur',
      contact_last_name: 'Soyad zorunludur',
      user_email: 'E-posta zorunludur',
      password: 'Şifre zorunludur',
      password_confirm: 'Şifre doğrulama zorunludur',
    };
    
    // Boş alan kontrolü
    if (requiredFields[field] && !trimmedValue) {
      setFieldErrors((prev) => ({ ...prev, [field]: requiredFields[field] }));
      return;
    }
    
    // Telefon validasyonu
    if (field === 'phone') {
      if (trimmedValue && !validatePhone(trimmedValue)) {
        setFieldErrors((prev) => ({ ...prev, phone: 'Geçerli bir telefon numarası giriniz (11 haneli)' }));
      } else {
        setFieldErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.phone;
          return newErrors;
        });
      }
      return;
    }
    
    // E-posta validasyonu
    if (field === 'user_email' || field === 'contact_email') {
      if (trimmedValue && !validateEmail(trimmedValue)) {
        setFieldErrors((prev) => ({ ...prev, [field]: 'Geçerli bir e-posta adresi giriniz' }));
      } else {
        setFieldErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
      return;
    }
    
    // Şifre uzunluk validasyonu
    if (field === 'password') {
      if (trimmedValue && trimmedValue.length < 6) {
        setFieldErrors((prev) => ({ ...prev, password: 'Şifre en az 6 karakter olmalıdır' }));
      } else {
        setFieldErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.password;
          return newErrors;
        });
      }
      // Şifre tekrarı varsa eşleşme kontrolü
      if (formData.password_confirm && trimmedValue !== formData.password_confirm) {
        setFieldErrors((prev) => ({ ...prev, password_confirm: 'Şifreler eşleşmiyor' }));
      } else if (formData.password_confirm) {
        setFieldErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.password_confirm;
          return newErrors;
        });
      }
      return;
    }
    
    // Şifre tekrar validasyonu
    if (field === 'password_confirm') {
      if (trimmedValue && trimmedValue !== formData.password) {
        setFieldErrors((prev) => ({ ...prev, password_confirm: 'Şifreler eşleşmiyor' }));
      } else {
        setFieldErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.password_confirm;
          return newErrors;
        });
      }
      return;
    }
    
    // Diğer zorunlu alanlar için hata temizle
    if (requiredFields[field] && trimmedValue) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Tüm validasyonları kontrol et
    const errors: Record<string, string> = {};
    
    // Zorunlu alan kontrolleri
    if (!formData.dealer_name.trim()) {
      errors.dealer_name = 'Bayi ünvanı zorunludur';
    }
    if (!formData.city.trim()) {
      errors.city = 'İl zorunludur';
    }
    if (!formData.district.trim()) {
      errors.district = 'İlçe zorunludur';
    }
    if (!formData.address.trim()) {
      errors.address = 'Adres zorunludur';
    }
    if (!formData.contact_first_name.trim()) {
      errors.contact_first_name = 'Ad zorunludur';
    }
    if (!formData.contact_last_name.trim()) {
      errors.contact_last_name = 'Soyad zorunludur';
    }
    
    // Format kontrolleri
    if (!formData.user_email.trim()) {
      errors.user_email = 'E-posta zorunludur';
    } else if (!validateEmail(formData.user_email)) {
      errors.user_email = 'Geçerli bir e-posta adresi giriniz';
    }
    if (!formData.contact_email.trim()) {
      errors.contact_email = 'İletişim e-postası zorunludur';
    } else if (!validateEmail(formData.contact_email)) {
      errors.contact_email = 'Geçerli bir e-posta adresi giriniz';
    }
    if (!formData.phone.trim()) {
      errors.phone = 'Telefon zorunludur';
    } else if (!validatePhone(formData.phone)) {
      errors.phone = 'Geçerli bir telefon numarası giriniz (11 haneli)';
    }
    if (!formData.password) {
      errors.password = 'Şifre zorunludur';
    } else if (formData.password.length < 6) {
      errors.password = 'Şifre en az 6 karakter olmalıdır';
    }
    if (!formData.password_confirm) {
      errors.password_confirm = 'Şifre doğrulama zorunludur';
    } else if (formData.password !== formData.password_confirm) {
      errors.password_confirm = 'Şifreler eşleşmiyor';
    }
    
    // Hata varsa göster ve dur
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Lütfen formdaki hataları düzeltin');
      setLoading(false);
      
      // İlk hatalı alana focus yap
      const fieldOrder = [
        'dealer_name', 'city', 'district', 'address', 'phone', 'contact_email',
        'contact_first_name', 'contact_last_name', 'user_email', 'password', 'password_confirm'
      ];
      const firstErrorField = fieldOrder.find(field => errors[field]);
      if (firstErrorField) {
        const element = document.querySelector(`[name="${firstErrorField}"]`) as HTMLInputElement;
        if (element) {
          element.focus();
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      return;
    }

    try {
      const response = await fetch(`${API_URL}/dealers/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_email: formData.user_email,  // Login için e-posta (username olarak kaydedilecek)
          dealer_name: formData.dealer_name,
          dealer_type: 'yetkili',
          status: 'pasif', // Admin onayına kadar pasif
          city: formData.city,
          district: formData.district,
          address: formData.address,
          phone: formData.phone,
          email: formData.contact_email,  // İletişim e-postası (kurumsal)
          contact_first_name: formData.contact_first_name,
          contact_last_name: formData.contact_last_name,
          regional_manager: formData.regional_manager,
          password: formData.password,
        }),
      });

      if (response.ok) {
        navigate('/dealer-register-success');
      } else {
        const data = await response.json();
        setError(data.detail || 'Kayıt başarısız. Lütfen bilgilerinizi kontrol edin.');
      }
    } catch (err) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'flex-start',
        background: `linear-gradient(to right, ${theme.palette.primary.light} 0%, ${theme.palette.primary.dark} 100%)`,
        padding: 2,
        paddingTop: 6,
        boxSizing: 'border-box',
        overflowY: 'auto',
        '&::before': {
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `radial-gradient(circle at 20% 80%, ${alpha(theme.palette.common.white, 0.05)} 0%, transparent 50%),
                           radial-gradient(circle at 80% 20%, ${alpha(theme.palette.common.white, 0.08)} 0%, transparent 40%)`,
          pointerEvents: 'none',
          zIndex: -1,
        },
      }}
    >
      <Notification />

      {/* Back Button */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
        }}
      >
        <IconButton
          onClick={() => navigate('/dealer-login')}
          sx={{
            color: 'white',
            backgroundColor: 'rgba(255,255,255,0.1)',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.2)',
            },
          }}
        >
          <ArrowBackIcon />
        </IconButton>
      </Box>

      {/* Register Container */}
      <Box
        sx={{
          width: '100%',
          maxWidth: '480px',
          padding: 2,
          marginTop: 2,
          marginBottom: 4,
        }}
      >
        {/* Logo and Title */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: 3,
          }}
        >
          <Box
            component="img"
            src="/assets/images/tofas-logo.png"
            alt="Tofaş Logo"
            sx={{
              height: 44,
              width: 'auto',
              marginBottom: 2,
              filter: 'brightness(0) invert(1)',
            }}
          />
          <Typography
            variant="h5"
            sx={{
              color: '#fff',
              fontWeight: 700,
              textAlign: 'center',
              marginBottom: 0.5,
            }}
          >
            Bayi Kayıt
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255,255,255,0.85)',
              textAlign: 'center',
            }}
          >
            Yeni bayi hesabı oluşturun
          </Typography>
        </Box>

        {/* Register Card */}
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          }}
        >
          <CardContent sx={{ padding: 3 }}>

            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              {/* Bayi Bilgileri */}
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                Bayi Bilgileri
              </Typography>

              <TextField
                name="dealer_name"
                label="Bayi Ünvanı"
                value={formData.dealer_name}
                onChange={(e) => handleInputChange('dealer_name', e.target.value)}
                onBlur={(e) => handleBlur('dealer_name', e.target.value)}
                fullWidth
                disabled={loading}
                placeholder="Örn: ABC Tofaş Yetkili Bayi"
                error={!!fieldErrors.dealer_name}
                helperText={fieldErrors.dealer_name}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />

              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  name="city"
                  label="İl"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  onBlur={(e) => handleBlur('city', e.target.value)}
                  fullWidth
                  disabled={loading}
                  error={!!fieldErrors.city}
                  helperText={fieldErrors.city}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                <TextField
                  name="district"
                  label="İlçe"
                  value={formData.district}
                  onChange={(e) => handleInputChange('district', e.target.value)}
                  onBlur={(e) => handleBlur('district', e.target.value)}
                  fullWidth
                  disabled={loading}
                  error={!!fieldErrors.district}
                  helperText={fieldErrors.district}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Box>

              <TextField
                name="address"
                label="Adres"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                onBlur={(e) => handleBlur('address', e.target.value)}
                fullWidth
                multiline
                rows={2}
                disabled={loading}
                error={!!fieldErrors.address}
                helperText={fieldErrors.address}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />

              <Divider sx={{ marginY: 1 }} />

              {/* İletişim Bilgileri */}
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                İletişim Bilgileri
              </Typography>

              <TextField
                name="phone"
                label="Telefon"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                onBlur={(e) => handleBlur('phone', e.target.value)}
                fullWidth
                disabled={loading}
                placeholder="0(5XX) XXX XX XX"
                helperText={fieldErrors.phone || "Örn: 0(532) 123 45 67"}
                error={!!fieldErrors.phone}
                inputProps={{ inputMode: 'tel' }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />

              <TextField
                name="contact_email"
                label="İletişim E-postası"
                type="text"
                value={formData.contact_email}
                onChange={(e) => handleInputChange('contact_email', e.target.value)}
                onBlur={(e) => handleBlur('contact_email', e.target.value)}
                fullWidth
                disabled={loading}
                placeholder="bayi@kurumsal.com"
                error={!!fieldErrors.contact_email}
                helperText={fieldErrors.contact_email || "Kurumsal iletişim e-postası"}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />

              <Typography variant="caption" sx={{ color: '#666', mt: 1 }}>
                Bayi Sorumlusu
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  name="contact_first_name"
                  label="İsim"
                  value={formData.contact_first_name}
                  onChange={(e) => handleInputChange('contact_first_name', e.target.value)}
                  onBlur={(e) => handleBlur('contact_first_name', e.target.value)}
                  fullWidth
                  disabled={loading}
                  placeholder="Ahmet"
                  error={!!fieldErrors.contact_first_name}
                  helperText={fieldErrors.contact_first_name}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                <TextField
                  name="contact_last_name"
                  label="Soyisim"
                  value={formData.contact_last_name}
                  onChange={(e) => handleInputChange('contact_last_name', e.target.value)}
                  onBlur={(e) => handleBlur('contact_last_name', e.target.value)}
                  fullWidth
                  disabled={loading}
                  placeholder="Yılmaz"
                  error={!!fieldErrors.contact_last_name}
                  helperText={fieldErrors.contact_last_name}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Box>

              <TextField
                label="Bölge Müdürü"
                value={formData.regional_manager}
                onChange={(e) => handleInputChange('regional_manager', e.target.value)}
                fullWidth
                disabled={loading}
                placeholder="Mehmet Demir"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />

              <Divider sx={{ marginY: 1 }} />

              {/* Hesap Bilgileri */}
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                Hesap Bilgileri
              </Typography>

              <TextField
                name="user_email"
                label="E-posta"
                type="text"
                value={formData.user_email}
                onChange={(e) => handleInputChange('user_email', e.target.value)}
                onBlur={(e) => handleBlur('user_email', e.target.value)}
                fullWidth
                disabled={loading}
                placeholder="ornek@email.com"
                error={!!fieldErrors.user_email}
                helperText={fieldErrors.user_email || "Giriş yaparken bu e-posta adresini kullanacaksınız"}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />

              <TextField
                name="password"
                label="Şifre"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                onBlur={(e) => handleBlur('password', e.target.value)}
                fullWidth
                disabled={loading}
                placeholder="••••••••"
                error={!!fieldErrors.password}
                helperText={fieldErrors.password || "En az 6 karakter olmalıdır"}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />

              <TextField
                name="password_confirm"
                label="Şifre Doğrulama"
                type="password"
                value={formData.password_confirm}
                onChange={(e) => handleInputChange('password_confirm', e.target.value)}
                onBlur={(e) => handleBlur('password_confirm', e.target.value)}
                fullWidth
                disabled={loading}
                placeholder="••••••••"
                error={!!fieldErrors.password_confirm}
                helperText={fieldErrors.password_confirm || "Şifrenizi tekrar girin"}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />

              {/* Info Alert */}
              <Alert severity="info" sx={{ fontSize: '12px' }}>
                Kayıt sonrası hesabınız admin onayına gönderilecektir. Onaylandığında size bilgi
                verilecektir.
              </Alert>

              {/* Hata Mesajı */}
              {error && (
                <Alert severity="error" sx={{ marginTop: 2 }}>
                  {error}
                </Alert>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  marginTop: 1,
                  padding: '14px',
                  borderRadius: 2,
                  fontSize: '1rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  backgroundColor: theme.palette.primary.main,
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                    boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                  },
                }}
              >
                {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
              </Button>
            </Box>

            {/* Login Link */}
            <Box sx={{ marginTop: 2, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#666' }}>
                Zaten hesabınız var mı?{' '}
                <Button
                  onClick={() => navigate('/dealer-login')}
                  sx={{
                    color: theme.palette.primary.main,
                    textTransform: 'none',
                    fontWeight: 600,
                    padding: 0,
                    minWidth: 'auto',
                    '&:hover': {
                      backgroundColor: 'transparent',
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Giriş Yap
                </Button>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Footer */}
      <Typography
        variant="caption"
        sx={{
          color: 'rgba(255,255,255,0.7)',
          marginBottom: 2,
          textAlign: 'center',
        }}
      >
        © 2025 Tofaş. Tüm hakları saklıdır.
      </Typography>
    </Box>
  );
};
