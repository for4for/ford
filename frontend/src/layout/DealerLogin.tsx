import { useState } from 'react';
import { useNotify, Notification } from 'react-admin';
import { useNavigate } from 'react-router-dom';
import { authProvider } from '../authProvider';
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

// Dealer Login Component
export const DealerLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const notify = useNotify();
  const navigate = useNavigate();
  const theme = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('[DealerLogin] calling authProvider.login with type: dealer');
      // useLogin yerine doğrudan authProvider.login kullan
      const redirectTo = await authProvider.login({ username, password, loginType: 'dealer' });
      console.log('[DealerLogin] login success, redirecting to:', redirectTo);
      // Hard redirect - react-admin'in hook'larını bypass et
      window.location.href = redirectTo || '/dealer';
    } catch (error: any) {
      console.log('[DealerLogin] login error:', error);
      setError(error.message || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
      notify('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.', { type: 'error' });
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
        background: `linear-gradient(to right, ${theme.palette.primary.light} 0%, ${theme.palette.primary.dark} 100%)`,
        padding: 2,
        position: 'fixed',
        top: 0,
        left: 0,
        margin: 0,
        boxSizing: 'border-box',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `radial-gradient(circle at 20% 80%, ${alpha(theme.palette.common.white, 0.05)} 0%, transparent 50%),
                           radial-gradient(circle at 80% 20%, ${alpha(theme.palette.common.white, 0.08)} 0%, transparent 40%)`,
          pointerEvents: 'none',
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
          onClick={() => navigate('/login')}
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

      {/* Login Container */}
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
            Bayi Portalı
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255,255,255,0.85)',
              textAlign: 'center',
            }}
          >
            Bayi hesabınızla giriş yapın
          </Typography>
        </Box>

        {/* Login Card */}
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
              <TextField
                label="Kullanıcı Adı"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                fullWidth
                autoFocus
                disabled={loading}
                variant="outlined"
                placeholder="Örn: tofas01"
                autoComplete="username"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />

              <TextField
                label="Şifre"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
                disabled={loading}
                variant="outlined"
                autoComplete="current-password"
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
                {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
              </Button>
            </Box>

            {/* Demo Credentials */}
            <Box
              sx={{
                marginTop: 3,
                padding: 2,
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', marginBottom: 1 }}>
                Demo Hesap:
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', fontFamily: 'monospace' }}>
                Kullanıcı Adı: <strong>tofas01</strong>
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', fontFamily: 'monospace' }}>
                Şifre: <strong>bayi123</strong>
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Register Link */}
        <Box sx={{ marginTop: 2, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: 'white' }}>
            Hesabınız yok mu?{' '}
            <Button
              onClick={() => navigate('/dealer-register')}
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
              Kayıt Ol
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
        © 2025 Tofaş. Tüm hakları saklıdır.
      </Typography>
    </Box>
  );
};

