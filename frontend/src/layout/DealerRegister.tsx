import { useState } from 'react';
import { useNotify, Notification } from 'react-admin';
import { useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

export const DealerRegister = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const notify = useNotify();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    dealer_code: '',
    dealer_name: '',
    city: '',
    district: '',
    address: '',
    phone: '',
    email: '',
    contact_person: '',
    regional_manager: '',
    password: '',
    password_confirm: '',
  });

  const [additionalEmails, setAdditionalEmails] = useState<string[]>(['']);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddEmail = () => {
    setAdditionalEmails([...additionalEmails, '']);
  };

  const handleRemoveEmail = (index: number) => {
    if (additionalEmails.length > 1) {
      setAdditionalEmails(additionalEmails.filter((_, i) => i !== index));
    }
  };

  const handleEmailChange = (index: number, value: string) => {
    const newEmails = [...additionalEmails];
    newEmails[index] = value;
    setAdditionalEmails(newEmails);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

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
      const response = await fetch('http://localhost:8084/api/dealers/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dealer_code: formData.dealer_code,
          dealer_name: formData.dealer_name,
          dealer_type: 'yetkili',
          status: 'pasif', // Admin onayına kadar pasif
          city: formData.city,
          district: formData.district,
          address: formData.address,
          phone: formData.phone,
          email: formData.email,
          contact_person: formData.contact_person,
          regional_manager: formData.regional_manager,
          additional_emails: additionalEmails.filter((e) => e.trim() !== ''),
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
        width: '100vw',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #00095B 0%, #001a8a 100%)',
        padding: 2,
        position: 'fixed',
        top: 0,
        left: 0,
        margin: 0,
        boxSizing: 'border-box',
        overflow: 'auto',
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
          marginTop: 8,
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
            src="/assets/images/ford-logo.svg"
            alt="Ford Logo"
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
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#00095B' }}>
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
                placeholder="Örn: ABC Ford Yetkili Bayi"
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
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#00095B' }}>
                İletişim Bilgileri
              </Typography>

              <TextField
                label="Telefon"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                required
                fullWidth
                disabled={loading}
                placeholder="0555 123 45 67"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />

              <TextField
                label="E-posta"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                fullWidth
                disabled={loading}
                placeholder="bayi@example.com"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />

              <TextField
                label="Bayi Sorumlusu"
                value={formData.contact_person}
                onChange={(e) => handleInputChange('contact_person', e.target.value)}
                required
                fullWidth
                disabled={loading}
                placeholder="Ahmet Yılmaz"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />

              <TextField
                label="Bölge Müdürü"
                value={formData.regional_manager}
                onChange={(e) => handleInputChange('regional_manager', e.target.value)}
                fullWidth
                disabled={loading}
                placeholder="Mehmet Demir"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />

              {/* Additional Emails */}
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, marginBottom: 1 }}>
                  İlgili E-postalar
                </Typography>
                {additionalEmails.map((email, index) => (
                  <Box
                    key={index}
                    sx={{ display: 'flex', gap: 1, marginBottom: 1, alignItems: 'center' }}
                  >
                    <TextField
                      value={email}
                      onChange={(e) => handleEmailChange(index, e.target.value)}
                      placeholder="email@example.com"
                      fullWidth
                      size="small"
                      disabled={loading}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                    {additionalEmails.length > 1 && (
                      <IconButton
                        onClick={() => handleRemoveEmail(index)}
                        disabled={loading}
                        size="small"
                        sx={{ border: '1px solid #ddd' }}
                      >
                        <RemoveIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                ))}
                <Button
                  startIcon={<AddIcon />}
                  onClick={handleAddEmail}
                  disabled={loading}
                  size="small"
                  sx={{ marginTop: 0.5 }}
                >
                  E-posta Ekle
                </Button>
              </Box>

              <Divider sx={{ marginY: 1 }} />

              {/* Şifre */}
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#00095B' }}>
                Şifre Belirleyin
              </Typography>

              <TextField
                label="Şifre"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
                fullWidth
                disabled={loading}
                placeholder="En az 6 karakter"
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
                placeholder="Şifrenizi tekrar girin"
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
                  backgroundColor: '#00095B',
                  boxShadow: '0 4px 12px rgba(0, 9, 91, 0.3)',
                  '&:hover': {
                    backgroundColor: '#000740',
                    boxShadow: '0 6px 20px rgba(0, 9, 91, 0.4)',
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
                    color: '#00095B',
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
        © 2025 Ford Otosan. Tüm hakları saklıdır.
      </Typography>
    </Box>
  );
};
