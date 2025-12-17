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
  Avatar,
  Alert,
  IconButton,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const notify = useNotify();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('[AdminLogin] calling authProvider.login with type: admin');
      // useLogin yerine doğrudan authProvider.login kullan
      const redirectTo = await authProvider.login({ username, password, loginType: 'admin' });
      console.log('[AdminLogin] login success, redirecting to:', redirectTo);
      // Hard redirect - react-admin'in hook'larını bypass et
      window.location.href = redirectTo || '/backoffice';
    } catch (error: any) {
      console.log('[AdminLogin] login error:', error);
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
        background: 'linear-gradient(135deg, #00095B 0%, #1a2a7a 50%, #000640 100%)',
        padding: 3,
        position: 'fixed',
        top: 0,
        left: 0,
        margin: 0,
        boxSizing: 'border-box',
      }}
    >
      <Notification />
      
      {/* Back Button */}
      <Box
        sx={{
          position: 'absolute',
          top: 20,
          left: 20,
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

      {/* Logo and Title */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: 4,
        }}
      >
        <Box
          component="img"
          src="/assets/images/ford-logo.svg"
          alt="Ford Logo"
          sx={{
            height: 48,
            width: 'auto',
            marginBottom: 2,
            filter: 'brightness(0) invert(1) drop-shadow(0 4px 12px rgba(0,0,0,0.2))',
          }}
        />
        <Typography
          variant="h4"
          sx={{
            color: '#fff',
            fontWeight: 700,
            textAlign: 'center',
            textShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }}
        >
          Backoffice Girişi
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{
            color: 'rgba(255,255,255,0.9)',
            textAlign: 'center',
            marginTop: 1,
          }}
        >
          Yönetim Paneli
        </Typography>
      </Box>

      {/* Login Card */}
      <Card
        sx={{
          width: '100%',
          maxWidth: 440,
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        }}
      >
        <CardContent sx={{ padding: 4 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: 3,
            }}
          >
            <Avatar
              sx={{
                backgroundColor: '#00095B',
                width: 56,
                height: 56,
                marginBottom: 2,
              }}
            >
              <LockOutlinedIcon fontSize="large" />
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Giriş Yap
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ marginTop: 1 }}>
              Yönetici hesabınızla giriş yapın
            </Typography>
          </Box>

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
                marginTop: 2,
                padding: '12px',
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
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </Button>
          </Box>

          {/* Demo Credentials */}
          <Box
            sx={{
              marginTop: 3,
              padding: 2,
              backgroundColor: 'rgba(0, 9, 91, 0.05)',
              borderRadius: 2,
              border: '1px solid rgba(0, 9, 91, 0.1)',
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', marginBottom: 1 }}>
              Demo Hesap:
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', fontFamily: 'monospace' }}>
              Kullanıcı Adı: <strong>admin</strong>
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', fontFamily: 'monospace' }}>
              Şifre: <strong>admin123</strong>
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Footer */}
      <Typography
        variant="caption"
        sx={{
          color: 'rgba(255,255,255,0.7)',
          marginTop: 4,
          textAlign: 'center',
        }}
      >
        © 2025 Ford Otosan. Tüm hakları saklıdır.
      </Typography>
    </Box>
  );
};

