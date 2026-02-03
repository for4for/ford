import { Card, CardContent, Box, Grid, Typography, Avatar, useTheme } from '@mui/material';
import { Title, usePermissions, useGetIdentity } from 'react-admin';
import { Link } from 'react-router-dom';
import StoreIcon from '@mui/icons-material/Store';
import ImageIcon from '@mui/icons-material/Image';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CampaignIcon from '@mui/icons-material/Campaign';
import PeopleIcon from '@mui/icons-material/People';
import { useBrand } from '../context/BrandContext';

const StatCard = ({ title, value, icon, color, subtitle }: any) => (
  <Card
    sx={{
      height: '100%',
      borderRadius: 2,
      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
      },
    }}
  >
    <CardContent>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 2,
        }}
      >
        <Box>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={{ fontWeight: 600, marginBottom: 0.5 }}
          >
            {title}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: color }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Avatar
          sx={{
            backgroundColor: `${color}15`,
            color: color,
            width: 56,
            height: 56,
          }}
        >
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

const WelcomeCard = ({ user, permissions, primaryColor, primaryLight, brand }: any) => {
  const getRoleName = () => {
    if (permissions === 'admin') return 'Yönetici';
    if (permissions === 'moderator') return 'Moderatör';
    if (permissions === 'dealer') return 'Bayi';
    return 'Kullanıcı';
  };

  return (
    <Card
      sx={{
        background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryLight} 100%)`,
        color: '#fff',
        borderRadius: 2,
        marginBottom: 3,
      }}
    >
      <CardContent sx={{ padding: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid size={{ xs: 12, md: 8 }}>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, marginBottom: 1, color: '#ffffff' }}
            >
              Hoş geldiniz, {user?.fullName || 'Kullanıcı'}! 
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, marginBottom: 2, color: '#ffffff' }}>
              <strong>{getRoleName()}</strong> olarak giriş yaptınız
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, color: 'rgba(255,255,255,0.9)' }}>
              {brand.name} Bayi Otomasyonu - Bayi operasyonlarını, görsel taleplerinizi ve 
              teşvik programlarınızı yönetmek için merkezi hub'ınız.
            </Typography>
          </Grid>
          <Grid
            size={{ xs: 12, md: 4 }}
            sx={{
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Box
              component="img"
              src={brand.whiteLogo}
              alt={`${brand.name} Logo`}
              sx={{
                height: 60,
                width: 'auto',
                opacity: 0.9,
              }}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

const QuickActionsCard = ({ permissions, primaryColor, buildUrl }: any) => {
  // Kurumsal profesyonel renk paleti
  const corporateColors = {
    creative: primaryColor || '#7B2D42',    // Tofaş bordo
    incentive: '#1E3A5F',                    // Koyu lacivert
    dealers: '#2D4A3E',                      // Koyu yeşil
    users: '#4A3728',                        // Koyu kahve
  };

  const actions = [
    {
      title: 'Kreatif Talepleri',
      description: 'Kreatif talep oluştur ve yönet',
      to: buildUrl('/backoffice/creatives/requests'),
      icon: <ImageIcon />,
      color: corporateColors.creative,
      show: permissions !== 'bayi',
    },
    {
      title: 'Teşvik Talepleri',
      description: 'Teşvik teklifleri gönder',
      to: buildUrl('/backoffice/incentives/requests'),
      icon: <CardGiftcardIcon />,
      color: corporateColors.incentive,
      show: permissions === 'admin' || permissions === 'moderator',
    },
    {
      title: 'Kampanya Talepleri',
      description: 'Kampanya taleplerini yönet',
      to: buildUrl('/backoffice/campaigns/requests'),
      icon: <CampaignIcon />,
      color: '#166534',
      show: permissions === 'admin' || permissions === 'moderator',
    },
    {
      title: 'Bayileri Görüntüle',
      description: 'Bayi hesaplarını yönet',
      to: buildUrl('/backoffice/dealers'),
      icon: <StoreIcon />,
      color: corporateColors.dealers,
      show: permissions === 'admin' || permissions === 'moderator',
    },
    {
      title: 'Kullanıcılar',
      description: 'Kullanıcı hesaplarını yönet',
      to: buildUrl('/backoffice/users'),
      icon: <PeopleIcon />,
      color: corporateColors.users,
      show: permissions === 'admin',
    }
  ].filter((action) => action.show);

  return (
    <Card sx={{ borderRadius: 2 }}>
      <CardContent>
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, marginBottom: 2 }}
        >
          Hızlı Erişim
        </Typography>
        <Grid container spacing={2}>
          {actions.map((action, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
              <Link
                to={action.to}
                style={{ textDecoration: 'none' }}
              >
                <Box
                  sx={{
                    display: 'block',
                    padding: 2,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: action.color,
                      backgroundColor: `${action.color}08`,
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      backgroundColor: `${action.color}15`,
                      color: action.color,
                      marginBottom: 1,
                    }}
                  >
                    {action.icon}
                  </Avatar>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, color: 'text.primary' }}
                  >
                    {action.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {action.description}
                  </Typography>
                </Box>
              </Link>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export const Dashboard = () => {
  const { permissions } = usePermissions();
  const { data: identity } = useGetIdentity();
  const theme = useTheme();
  const { brand, buildUrl } = useBrand();
  const isAdmin = permissions === 'admin';
  const isModerator = permissions === 'moderator';

  return (
    <Box sx={{ padding: 3 }}>
      <Title title="Dashboard" />

      <WelcomeCard 
        user={identity} 
        permissions={permissions} 
        primaryColor={theme.palette.primary.main}
        primaryLight={theme.palette.primary.light}
        brand={brand}
      />

      <Grid container spacing={3} sx={{ marginBottom: 3 }}>
        {(isAdmin || isModerator) && (
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Toplam Bayi"
              value="0"
              icon={<StoreIcon />}
              color="#2D4A3E"
              subtitle="Aktif bayi hesapları"
            />
          </Grid>
        )}
 
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Kreatif Talepler"
            value="0"
            icon={<ImageIcon />}
            color={theme.palette.primary.main}
            subtitle="Bekleyen ve tamamlanan"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Teşvik Talepleri"
            value="0"
            icon={<CardGiftcardIcon />}
            color="#1E3A5F"
            subtitle="Toplam talepler"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Başarı Oranı"
            value="100%"
            icon={<TrendingUpIcon />}
            color="#166534"
            subtitle="Talep onay oranı"
          />
        </Grid>
      </Grid>

      <QuickActionsCard permissions={permissions} primaryColor={theme.palette.primary.main} buildUrl={buildUrl} />
    </Box>
  );
};
