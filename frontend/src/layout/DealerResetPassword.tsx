import { useState, useEffect } from 'react';
import { useNotify, Notification } from 'react-admin';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  IconButton,
  useTheme,
  alpha,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { API_URL } from '../config';
import { useBrand } from '../context/BrandContext';

// Dealer Reset Password Component
export const DealerResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const notify = useNotify();
  const navigate = useNavigate();
  const theme = useTheme();
  const { brand, buildUrl } = useBrand();

  const uid = searchParams.get('uid');
  const token = searchParams.get('token');

  useEffect(() => {
    if (!uid || !token) {
      setError('Geçersiz şifre sıfırlama bağlantısı.');
    }
  }, [uid, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== passwordConfirm) {
      setError('Şifreler eşleşmiyor.');
      return;
    }

    if (password.length < 8) {
      setError('Şifre en az 8 karakter olmalıdır.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch(`${API_URL}/auth/dealer/password-reset-confirm/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid,
          token,
          new_password: password,
          new_password_confirm: passwordConfirm,
          brand: brand.key,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        notify('Şifreniz başarıyla değiştirildi. Giriş yapabilirsiniz.', { type: 'success' });
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate(buildUrl('/dealer-login'));
        }, 2000);
      } else {
        setError(data.error || data.new_password?.[0] || 'Bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } catch (error: any) {
      console.error('Password reset confirm error:', error);
      setError('Bağlantı hatası. Lütfen tekrar deneyin.');
      notify('Bağlantı hatası. Lütfen tekrar deneyin.', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!uid || !token) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          width: '100vw',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(to right, ${theme.palette.primary.light} 0%, ${theme.palette.primary.dark} 100%)`,
          padding: 2,
        }}
      >
        <Card sx={{ maxWidth: '420px', padding: 3 }}>
          <Alert severity="error">
            Geçersiz veya eksik şifre sıfırlama bağlantısı. Lütfen e-postanızdaki bağlantıyı kullanın.
          </Alert>
          <Button
            fullWidth
            variant="contained"
            onClick={() => navigate(buildUrl('/dealer-login'))}
            sx={{ marginTop: 2 }}
          >
            Giriş Sayfasına Dön
          </Button>
        </Card>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(to right, ${theme.palette.primary.light} 0%, ${theme.palette.primary.dark} 100%)`,
        padding: 2,
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
          onClick={() => navigate(buildUrl('/dealer-login'))}
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

      {/* Reset Password Container */}
      <Box
        sx={{
          width: '100%',
          maxWidth: '420px',
          padding: 2,
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
            src={brand.whiteLogo}
            alt={`${brand.name} Logo`}
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
            Yeni Şifre Belirleyin
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255,255,255,0.85)',
              textAlign: 'center',
            }}
          >
            Hesabınız için yeni bir şifre oluşturun
          </Typography>
        </Box>

        {/* Card */}
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

            {success && (
              <Alert severity="success" sx={{ marginBottom: 2 }}>
                Şifreniz başarıyla değiştirildi! Giriş sayfasına yönlendiriliyorsunuz...
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
              <TextField
                label="Yeni Şifre"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
                autoFocus
                disabled={loading || success}
                variant="outlined"
                autoComplete="new-password"
                helperText="En az 8 karakter olmalıdır"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />

              <TextField
                label="Yeni Şifre (Tekrar)"
                name="passwordConfirm"
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
                fullWidth
                disabled={loading || success}
                variant="outlined"
                autoComplete="new-password"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading || success}
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
                {loading ? 'Şifre Değiştiriliyor...' : success ? 'Başarılı' : 'Şifreyi Değiştir'}
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Back to Login Link */}
        <Box sx={{ marginTop: 2, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: 'white' }}>
            <Button
              onClick={() => navigate(buildUrl('/dealer-login'))}
              sx={{
                color: 'white',
                textTransform: 'none',
                fontWeight: 600,
                padding: 0,
                minWidth: 'auto',
                textDecoration: 'underline',
                '&:hover': {
                  backgroundColor: 'transparent',
                  textDecoration: 'underline',
                },
              }}
            >
              Giriş Sayfasına Dön
            </Button>
          </Typography>
        </Box>
      </Box>

      {/* Footer */}
      <Typography
        variant="caption"
        sx={{
          color: 'rgba(255,255,255,0.7)',
          marginTop: 4,
          textAlign: 'center',
        }}
      >
        © 2025 {brand.name}. Tüm hakları saklıdır.
      </Typography>
    </Box>
  );
};
