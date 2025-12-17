import {
  Show,
  TextField,
  EmailField,
  DateField,
  BooleanField,
  TabbedShowLayout,
  Tab,
  ReferenceField,
} from 'react-admin';
import { Grid, Box, Typography, Card, CardContent, Avatar, Chip } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import StoreIcon from '@mui/icons-material/Store';

const RoleChip = ({ role }: { role: string }) => {
  // Kurumsal rol renkleri
  const roleConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    admin: { label: 'Admin', color: '#991b1b', icon: <AdminPanelSettingsIcon /> },
    moderator: { label: 'Moderatör', color: '#1E3A5F', icon: <SupervisorAccountIcon /> },
    bayi: { label: 'Bayi', color: '#166534', icon: <StoreIcon /> },
    creative_agency: { label: 'Creative Agency', color: '#92400e', icon: <PersonIcon /> },
  };

  const config = roleConfig[role] || { label: role, color: '#757575', icon: <PersonIcon /> };

  return (
    <Chip
      icon={config.icon as React.ReactElement}
      label={config.label}
      sx={{
        backgroundColor: `${config.color}15`,
        color: config.color,
        fontWeight: 600,
        '& .MuiChip-icon': {
          color: config.color,
        },
      }}
    />
  );
};

const UserHeader = () => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      mb: 3,
      p: 3,
      backgroundColor: '#f8f9fa',
      borderRadius: 2,
    }}
  >
    <Avatar
      sx={{
        width: 64,
        height: 64,
        backgroundColor: 'primary.main',
      }}
    >
      <PersonIcon sx={{ fontSize: 32 }} />
    </Avatar>
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
        Kullanıcı Detayı
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Kullanıcı hesap bilgileri ve detayları
      </Typography>
    </Box>
  </Box>
);

export const UserShow = () => (
  <Show>
    <UserHeader />
    <TabbedShowLayout>
      <Tab label="Genel Bilgiler">
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Kullanıcı Adı
                  </Typography>
                  <TextField source="username" />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Ad
                  </Typography>
                  <TextField source="first_name" emptyText="-" />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Soyad
                  </Typography>
                  <TextField source="last_name" emptyText="-" />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    E-posta
                  </Typography>
                  <EmailField source="email" emptyText="-" />
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Rol
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <TextField source="role" />
                  </Box>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Telefon
                  </Typography>
                  <TextField source="phone" emptyText="-" />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Durum
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <BooleanField source="is_active" valueLabelTrue="Aktif" valueLabelFalse="Pasif" />
                  </Box>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Kayıt Tarihi
                  </Typography>
                  <DateField source="date_joined" showTime />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Tab>

      <Tab label="Bayi Bilgileri">
        <Card>
          <CardContent>
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Bağlı Bayi
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                <TextField source="dealer_name" emptyText="Bayi atanmamış" />
              </Box>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Bayi Kodu
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                <TextField source="dealer" emptyText="-" />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Tab>
    </TabbedShowLayout>
  </Show>
);
