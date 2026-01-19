import {
  Show,
  useShowContext,
  useRedirect,
  useDelete,
  useNotify,
} from 'react-admin';
import { Box, Typography, Paper, Chip, Button, Divider } from '@mui/material';
import { DeleteUserDialog } from '../../components/DeleteUserDialog';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import { useState } from 'react';
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
      color: '#9ca3af',
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
  <Box sx={{ display: 'flex', py: 1.5, borderBottom: '1px solid #f3f4f6' }}>
    <Typography sx={{ width: 180, color: '#6b7280', fontSize: 14, flexShrink: 0 }}>
      {label}
    </Typography>
    <Box sx={{ flex: 1, color: '#111827', fontSize: 14, fontWeight: 500 }}>
      {value || '-'}
    </Box>
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
  const notify = useNotify();
  const [deleteOne] = useDelete();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleDelete = (reason: string) => {
    deleteOne(
      'users',
      { id: record.id, meta: { reason } },
      {
        onSuccess: () => {
          notify('Kullanıcı silindi', { type: 'success' });
          redirect('list', 'users');
        },
        onError: (error: any) => {
          notify(`Hata: ${error.message || 'Silme işlemi başarısız'}`, { type: 'error' });
        },
      }
    );
    setConfirmOpen(false);
  };

  if (isLoading || !record) return null;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('tr-TR');
  };

  return (
    <Box sx={{ backgroundColor: '#f9fafb', minHeight: 'calc(100vh - 64px)', py: 5, px: 4 }}>
      <Box sx={{ maxWidth: 700, margin: '0 auto' }}>
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              onClick={() => redirect('list', 'users')}
              sx={{
                minWidth: 40,
                height: 40,
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                color: '#6b7280',
                '&:hover': {
                  backgroundColor: '#f3f4f6',
                  borderColor: '#d1d5db',
                },
              }}
            >
              <ArrowBackIcon sx={{ fontSize: 20 }} />
            </Button>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827', fontSize: 24 }}>
                {record.first_name} {record.last_name}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280', mt: 0.5 }}>
                Kullanıcı Detayları
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              variant="outlined"
              startIcon={<EditIcon sx={{ fontSize: 18 }} />}
              onClick={() => redirect('edit', 'users', record.id)}
              sx={{
                textTransform: 'none',
                borderColor: '#1a1a2e',
                color: '#1a1a2e',
                borderRadius: '8px',
                '&:hover': {
                  borderColor: '#1a1a2e',
                  backgroundColor: '#f5f5f5',
                },
              }}
            >
              Düzenle
            </Button>
            <Button
              variant="outlined"
              startIcon={<DeleteIcon sx={{ fontSize: 18 }} />}
              onClick={() => setConfirmOpen(true)}
              sx={{
                textTransform: 'none',
                borderColor: '#dc2626',
                color: '#dc2626',
                borderRadius: '8px',
                '&:hover': {
                  borderColor: '#dc2626',
                  backgroundColor: '#fef2f2',
                },
              }}
            >
              Sil
            </Button>
          </Box>
        </Box>
        
        <DeleteUserDialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={handleDelete}
          user={record}
        />

        <Paper
          elevation={0}
          sx={{
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            p: 4,
            backgroundColor: '#fff',
          }}
        >
          {/* Hesap Bilgileri */}
          <SectionTitle>Hesap Bilgileri</SectionTitle>
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

          <Divider sx={{ my: 3, borderColor: '#f3f4f6' }} />

          {/* Kişisel Bilgiler */}
          <SectionTitle>Kişisel Bilgiler</SectionTitle>
          <SummaryRow label="Ad" value={record.first_name} />
          <SummaryRow label="Soyad" value={record.last_name} />
          <SummaryRow label="Telefon" value={record.phone} />

          <Divider sx={{ my: 3, borderColor: '#f3f4f6' }} />

          {/* Bayi Bilgileri */}
          <SectionTitle>Bayi Bilgileri</SectionTitle>
          <SummaryRow label="Bağlı Bayi" value={record.dealer_name || 'Bayi atanmamış'} />

          <Divider sx={{ my: 3, borderColor: '#f3f4f6' }} />

          {/* Meta Bilgiler */}
          <SectionTitle>Meta Bilgiler</SectionTitle>
          <SummaryRow label="Kayıt Tarihi" value={formatDate(record.date_joined)} />
          <SummaryRow label="Son Giriş" value={formatDate(record.last_login)} />
        </Paper>
      </Box>
    </Box>
  );
};

export const UserShow = () => (
  <Show
    component="div"
    actions={false}
    sx={{
      '& .RaShow-main': { marginTop: 0 },
    }}
  >
    <UserShowContent />
  </Show>
);
