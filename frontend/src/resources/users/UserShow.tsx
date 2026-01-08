import {
  Show,
  useShowContext,
  useRedirect,
} from 'react-admin';
import { Box, Typography, Paper, Chip, Button, Divider } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import StoreIcon from '@mui/icons-material/Store';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

// Section Title
const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <Typography
    sx={{
      fontSize: 13,
      fontWeight: 600,
      color: '#999',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      mb: 2,
      mt: 1,
    }}
  >
    {children}
  </Typography>
);

// Summary Row
const SummaryRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <Box sx={{ display: 'flex', py: 1.5, borderBottom: '1px solid #f0f0f0' }}>
    <Typography sx={{ width: 180, color: '#666', fontSize: 14, flexShrink: 0 }}>
      {label}
    </Typography>
    <Typography sx={{ flex: 1, color: '#333', fontSize: 14, fontWeight: 500 }}>
      {value || '-'}
    </Typography>
  </Box>
);

const RoleChip = ({ role }: { role: string }) => {
  const roleConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    admin: { label: 'Admin', color: '#991b1b', icon: <AdminPanelSettingsIcon sx={{ fontSize: 16 }} /> },
    moderator: { label: 'Moderatör', color: '#1E3A5F', icon: <SupervisorAccountIcon sx={{ fontSize: 16 }} /> },
    bayi: { label: 'Bayi', color: '#166534', icon: <StoreIcon sx={{ fontSize: 16 }} /> },
    creative_agency: { label: 'Creative Agency', color: '#92400e', icon: <PersonIcon sx={{ fontSize: 16 }} /> },
  };

  const config = roleConfig[role] || { label: role, color: '#757575', icon: <PersonIcon sx={{ fontSize: 16 }} /> };

  return (
    <Chip
      icon={config.icon as React.ReactElement}
      label={config.label}
      size="small"
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

const UserShowContent = () => {
  const { record, isLoading } = useShowContext();
  const redirect = useRedirect();

  if (isLoading || !record) return null;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Box sx={{ maxWidth: 800, margin: '0 auto', px: 3, py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <ArrowBackIcon
            onClick={() => redirect('list', 'users')}
            sx={{
              fontSize: 22,
              color: '#666',
              cursor: 'pointer',
              '&:hover': { color: '#333' },
            }}
          />
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: '#1a1a2e',
              fontSize: 22,
            }}
          >
            Kullanıcı Detayı
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={() => redirect('edit', 'users', record.id)}
          sx={{
            textTransform: 'none',
            borderColor: '#1a1a2e',
            color: '#1a1a2e',
            '&:hover': {
              borderColor: '#1a1a2e',
              backgroundColor: '#f5f5f5',
            },
          }}
        >
          Düzenle
        </Button>
      </Box>

      <Paper
        elevation={0}
        sx={{
          border: '1px solid #e5e7eb',
          borderRadius: 2,
          p: 3,
        }}
      >
        {/* Hesap Bilgileri */}
        <SectionTitle>Hesap Bilgileri</SectionTitle>
        <SummaryRow label="E-posta (Giriş)" value={record.username} />
        <SummaryRow label="E-posta" value={record.email} />
        <SummaryRow
          label="Rol"
          value={<RoleChip role={record.role} />}
        />
        <SummaryRow
          label="Durum"
          value={
            record.is_active ? (
              <Chip
                icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
                label="Aktif"
                size="small"
                sx={{
                  backgroundColor: '#dcfce7',
                  color: '#166534',
                  fontWeight: 600,
                  '& .MuiChip-icon': { color: '#166534' },
                }}
              />
            ) : (
              <Chip
                icon={<CancelIcon sx={{ fontSize: 16 }} />}
                label="Pasif"
                size="small"
                sx={{
                  backgroundColor: '#fee2e2',
                  color: '#991b1b',
                  fontWeight: 600,
                  '& .MuiChip-icon': { color: '#991b1b' },
                }}
              />
            )
          }
        />

        <Divider sx={{ my: 3, borderColor: '#eee' }} />

        {/* Kişisel Bilgiler */}
        <SectionTitle>Kişisel Bilgiler</SectionTitle>
        <SummaryRow label="Ad" value={record.first_name} />
        <SummaryRow label="Soyad" value={record.last_name} />
        <SummaryRow label="Telefon" value={record.phone} />

        <Divider sx={{ my: 3, borderColor: '#eee' }} />

        {/* Bayi Bilgileri */}
        <SectionTitle>Bayi Bilgileri</SectionTitle>
        <SummaryRow label="Bağlı Bayi" value={record.dealer_name || 'Bayi atanmamış'} />
        <SummaryRow label="Bayi Kodu" value={record.dealer} />

        <Divider sx={{ my: 3, borderColor: '#eee' }} />

        {/* Meta Bilgiler */}
        <SectionTitle>Meta Bilgiler</SectionTitle>
        <SummaryRow label="Kayıt Tarihi" value={formatDate(record.date_joined)} />
        <SummaryRow label="Son Giriş" value={formatDate(record.last_login)} />
      </Paper>
    </Box>
  );
};

export const UserShow = () => (
  <Show
    component="div"
    actions={false}
    sx={{
      marginTop: 4,
      '& .RaShow-main': {
        marginTop: 0,
      },
    }}
  >
    <UserShowContent />
  </Show>
);
