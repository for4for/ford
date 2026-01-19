import { useState } from 'react';
import { useLogin, useNotify, Notification } from 'react-admin';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Avatar,
  Alert,
  useTheme,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const login = useLogin();
  const notify = useNotify();
  const theme = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login({ username, password });
    } catch (error: any) {
      setError(error.message || 'Email veya şifre hatalı');
      notify('Email veya şifre hatalı', { type: 'error' });
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
        justifyContent: 'center',
        background: `linear-gradient(to right, ${theme.palette.primary.light} 0%, ${theme.palette.primary.dark} 100%)`,
        padding: 3,
        boxSizing: 'border-box',
        overflowY: 'auto',
        '&::before': {
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `radial-gradient(circle at 20% 80%, rgba(255,255,255,0.05) 0%, transparent 50%),
                           radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 40%)`,
          pointerEvents: 'none',
          zIndex: -1,
        },
      }}
    >
      <Notification />
      
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
          src="/assets/images/tofas-logo.png"
          alt="Tofaş Logo"
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
          Tofaş Bayi Otomasyonu
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{
            color: 'rgba(255,255,255,0.9)',
            textAlign: 'center',
            marginTop: 1,
          }}
        >
          Dealer Portal System
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
                backgroundColor: 'primary.main',
                width: 56,
                height: 56,
                marginBottom: 2,
              }}
            >
              <LockOutlinedIcon fontSize="large" />
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Sign In
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ marginTop: 1 }}>
              Enter your credentials to access your account
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
              label="Username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              fullWidth
              autoFocus
              disabled={loading}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />

            <TextField
              label="Password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              disabled={loading}
              variant="outlined"
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
                boxShadow: '0 4px 12px rgba(41, 98, 255, 0.3)',
                '&:hover': {
                  boxShadow: '0 6px 20px rgba(41, 98, 255, 0.4)',
                },
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </Box>

          {/* Demo Credentials */}
          <Box
            sx={{
              marginTop: 3,
              padding: 2,
              backgroundColor: 'rgba(41, 98, 255, 0.05)',
              borderRadius: 2,
              border: '1px solid rgba(41, 98, 255, 0.1)',
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', marginBottom: 1 }}>
              Demo Credentials:
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', fontFamily: 'monospace' }}>
              Username: <strong>admin</strong>
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', fontFamily: 'monospace' }}>
              Password: <strong>admin123</strong>
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
        © 2024 Tofaş Bayi Otomasyonu. Tüm hakları saklıdır.
      </Typography>
    </Box>
  );
};

