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

export const DealerRegister = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const notify = useNotify();
  const navigate = useNavigate();
  const theme = useTheme();

  const [formData, setFormData] = useState({
    user_email: '',  // Login için kullanılacak e-posta
    dealer_code: '',
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
    
    // E-posta alanları için anlık validasyon
    if (field === 'user_email' || field === 'contact_email') {
      if (value && !validateEmail(value)) {
        setFieldErrors((prev) => ({ ...prev, [field]: 'Geçerli bir e-posta adresi giriniz' }));
      } else {
        setFieldErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // E-posta validasyonu
    if (!validateEmail(formData.user_email)) {
      setError('Geçerli bir e-posta adresi giriniz');
      setFieldErrors((prev) => ({ ...prev, user_email: 'Geçerli bir e-posta adresi giriniz' }));
      setLoading(false);
      return;
    }

    if (!validateEmail(formData.contact_email)) {
      setError('Geçerli bir iletişim e-posta adresi giriniz');
      setFieldErrors((prev) => ({ ...prev, contact_email: 'Geçerli bir e-posta adresi giriniz' }));
      setLoading(false);
      return;
    }

    // Validation
    if (formData.password !== formData.password_confirm) {
      setError('Şifreler eşleşmiyor');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      setLoading(false);
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
          dealer_code: formData.dealer_code,
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
        notify('Kayıt başarılı! Hesabınız onay bekliyor.', { type: 'success' });
        navigate('/dealer-login');
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
            {error && (
              <Alert severity="error" sx={{ marginBottom: 2 }}>
                {error}
              </Alert>
            )}

            <Box
              component="form"
              onSubmit={handleSubmit}
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
                label="Bayi Kodu"
                value={formData.dealer_code}
                onChange={(e) => handleInputChange('dealer_code', e.target.value)}
                required
                fullWidth
                disabled={loading}
                placeholder="Örn: IST-KDK-001"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />

              <TextField
                label="Bayi Ünvanı"
                value={formData.dealer_name}
                onChange={(e) => handleInputChange('dealer_name', e.target.value)}
                required
                fullWidth
                disabled={loading}
                placeholder="Örn: ABC Tofaş Yetkili Bayi"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />

              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="İl"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  required
                  fullWidth
                  disabled={loading}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                <TextField
                  label="İlçe"
                  value={formData.district}
                  onChange={(e) => handleInputChange('district', e.target.value)}
                  required
                  fullWidth
                  disabled={loading}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Box>

              <TextField
                label="Adres"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                required
                fullWidth
                multiline
                rows={2}
                disabled={loading}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />

              <Divider sx={{ marginY: 1 }} />

              {/* İletişim Bilgileri */}
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                İletişim Bilgileri
              </Typography>

              <TextField
                label="Telefon"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                required
                fullWidth
                disabled={loading}
                placeholder="0(5XX) XXX XX XX"
                helperText="Örn: 0(532) 123 45 67"
                inputProps={{ inputMode: 'tel' }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />

              <TextField
                label="İletişim E-postası"
                type="text"
                value={formData.contact_email}
                onChange={(e) => handleInputChange('contact_email', e.target.value)}
                required
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
                  label="İsim"
                  value={formData.contact_first_name}
                  onChange={(e) => handleInputChange('contact_first_name', e.target.value)}
                  required
                  fullWidth
                  disabled={loading}
                  placeholder="Ahmet"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              <TextField
                  label="Soyisim"
                  value={formData.contact_last_name}
                  onChange={(e) => handleInputChange('contact_last_name', e.target.value)}
                required
                fullWidth
                disabled={loading}
                  placeholder="Yılmaz"
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
                label="E-posta"
                type="text"
                value={formData.user_email}
                onChange={(e) => handleInputChange('user_email', e.target.value)}
                required
                fullWidth
                disabled={loading}
                placeholder="ornek@email.com"
                error={!!fieldErrors.user_email}
                helperText={fieldErrors.user_email || "Giriş yaparken bu e-posta adresini kullanacaksınız"}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />

              <TextField
                label="Şifre"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
                fullWidth
                disabled={loading}
                placeholder="••••••••"
                helperText="En az 6 karakter olmalıdır"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />

              <TextField
                label="Şifre Doğrulama"
                type="password"
                value={formData.password_confirm}
                onChange={(e) => handleInputChange('password_confirm', e.target.value)}
                required
                fullWidth
                disabled={loading}
                placeholder="••••••••"
                helperText="Şifrenizi tekrar girin"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />

              {/* Info Alert */}
              <Alert severity="info" sx={{ fontSize: '12px' }}>
                Kayıt sonrası hesabınız admin onayına gönderilecektir. Onaylandığında size bilgi
                verilecektir.
              </Alert>

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
