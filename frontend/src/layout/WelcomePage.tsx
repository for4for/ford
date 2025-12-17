import { Box, Card, CardContent, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import StorefrontIcon from '@mui/icons-material/Storefront';

export const WelcomePage = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
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
      <Container maxWidth="sm">
        <Box
          sx={{
            textAlign: 'center',
            marginBottom: 4,
          }}
        >
          <img
            src="/assets/images/ford-logo.svg"
            alt="Ford"
            style={{
              height: '60px',
              marginBottom: '24px',
              filter: 'brightness(0) invert(1)',
            }}
          />
          <Typography
            variant="h4"
            sx={{
              color: 'white',
              fontWeight: 700,
              marginBottom: 1,
            }}
          >
            Ford Bayi Otomasyonu
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'rgba(255,255,255,0.8)',
            }}
          >
            Giriş yapmak için bir seçenek belirleyin
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {/* Admin Login Card */}
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 32px rgba(0,0,0,0.3)',
              },
            }}
          >
            <CardContent
              sx={{
                padding: 4,
                textAlign: 'center',
              }}
            >
              <Box
                sx={{
                  backgroundColor: '#00095B15',
                  borderRadius: '50%',
                  width: 80,
                  height: 80,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <AdminPanelSettingsIcon
                  sx={{
                    fontSize: 40,
                    color: '#00095B',
                  }}
                />
              </Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  marginBottom: 1,
                  color: '#333',
                }}
              >
                Backoffice Girişi
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: '#666',
                  marginBottom: 3,
                }}
              >
                Sistem yöneticileri ve moderatörler için
              </Typography>
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={() => navigate('/backoffice-login')}
                sx={{
                  backgroundColor: '#00095B',
                  height: '48px',
                  fontSize: '16px',
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: '#000740',
                  },
                }}
              >
                Backoffice Girişi Yap
              </Button>
            </CardContent>
          </Card>

          {/* Bayi Login Card */}
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 32px rgba(0,0,0,0.3)',
              },
            }}
          >
            <CardContent
              sx={{
                padding: 4,
                textAlign: 'center',
              }}
            >
              <Box
                sx={{
                  backgroundColor: '#56d48115',
                  borderRadius: '50%',
                  width: 80,
                  height: 80,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <StorefrontIcon
                  sx={{
                    fontSize: 40,
                    color: '#56d481',
                  }}
                />
              </Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  marginBottom: 1,
                  color: '#333',
                }}
              >
                Bayi Girişi
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: '#666',
                  marginBottom: 3,
                }}
              >
                Ford bayileri için özel portal
              </Typography>
              <Button
                variant="outlined"
                fullWidth
                size="large"
                onClick={() => navigate('/dealer-login')}
                sx={{
                  borderColor: '#56d481',
                  color: '#56d481',
                  height: '48px',
                  fontSize: '16px',
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#56d481',
                    backgroundColor: '#56d48110',
                  },
                }}
              >
                Bayi Girişi Yap
              </Button>
            </CardContent>
          </Card>
        </Box>

        <Typography
          variant="caption"
          sx={{
            display: 'block',
            textAlign: 'center',
            marginTop: 4,
            color: 'rgba(255,255,255,0.6)',
          }}
        >
          © 2025 Ford Otosan. Tüm hakları saklıdır.
        </Typography>
      </Container>
    </Box>
  );
};

