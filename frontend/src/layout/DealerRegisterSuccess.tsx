import { Box, Card, CardContent, Typography, Button, alpha, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export const DealerRegisterSuccess = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const darkColor = '#1a1a2e';

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
      }}
    >
      <Card
        sx={{
          maxWidth: 420,
          width: '100%',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
          textAlign: 'center',
        }}
      >
        <CardContent sx={{ padding: 4 }}>
          {/* Başarı İkonu */}
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              backgroundColor: alpha('#22c55e', 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 42, color: '#22c55e' }} />
          </Box>

          {/* Başlık */}
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: darkColor,
              mb: 1.5,
            }}
          >
            Kayıt Başarılı
          </Typography>

          {/* Açıklama */}
          <Typography
            sx={{
              color: '#666',
              fontSize: '0.95rem',
              lineHeight: 1.7,
              mb: 3,
            }}
          >
            Başvurunuz alındı. Hesabınız onaylandığında e-posta ile bilgilendirileceksiniz.
            <br />
            <Typography component="span" sx={{ color: '#888', fontSize: '0.9rem' }}>
              Onay süreci genellikle 1-2 iş günü içinde tamamlanır.
            </Typography>
          </Typography>

          {/* Butonlar */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => navigate('/')}
              sx={{
                padding: '12px',
                borderRadius: 2,
                fontWeight: 600,
                textTransform: 'none',
                borderColor: '#ddd',
                color: '#555',
                backgroundColor: '#fff',
                '&:hover': {
                  borderColor: '#bbb',
                  backgroundColor: '#f5f5f5',
                },
              }}
            >
              Ana Sayfa
            </Button>
            <Button
              variant="contained"
              fullWidth
              onClick={() => navigate('/dealer-login')}
              sx={{
                padding: '12px',
                borderRadius: 2,
                fontWeight: 600,
                textTransform: 'none',
                backgroundColor: theme.palette.primary.main,
                boxShadow: 'none',
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                  boxShadow: 'none',
                },
              }}
            >
              Giriş Yap
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DealerRegisterSuccess;
