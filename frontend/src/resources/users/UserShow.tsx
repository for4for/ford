import {
  Show,
  useShowContext,
  useRedirect,
  useDelete,
  useNotify,
} from 'react-admin';
import { Box, Chip, Button, Divider } from '@mui/material';
import { DeleteUserDialog } from '../../components/DeleteUserDialog';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import { useState } from 'react';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import StoreIcon from '@mui/icons-material/Store';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { FormContainer, FormHeader } from '../../components/FormFields';
import { SectionTitle, SummaryRow, ShowCard, MetaInfo } from '../../components/ShowFields';

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
    <FormContainer maxWidth={800}>
      {/* Header */}
      <FormHeader
        title={`${record.first_name} ${record.last_name}`}
        subtitle="Kullanıcı Detayları"
        onBack={() => redirect('list', 'users')}
      >
        <Button
          variant="outlined"
          size="small"
          startIcon={<EditIcon sx={{ fontSize: 16 }} />}
          onClick={() => redirect('edit', 'users', record.id)}
          sx={{
            textTransform: 'none',
            fontSize: 13,
            borderColor: '#1a1a2e',
            color: '#1a1a2e',
            borderRadius: '8px',
            '&:hover': { borderColor: '#1a1a2e', bgcolor: '#f5f5f5' },
          }}
        >
          Düzenle
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<DeleteIcon sx={{ fontSize: 16 }} />}
          onClick={() => setConfirmOpen(true)}
          sx={{
            textTransform: 'none',
            fontSize: 13,
            borderColor: '#dc2626',
            color: '#dc2626',
            borderRadius: '8px',
            '&:hover': { borderColor: '#dc2626', bgcolor: '#fef2f2' },
          }}
        >
          Sil
        </Button>
      </FormHeader>
      
      <DeleteUserDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        user={record}
      />

      <ShowCard>
        {/* Hesap Bilgileri */}
        <SectionTitle>Hesap Bilgileri</SectionTitle>
        <SummaryRow label="E-posta">{record.email}</SummaryRow>
        <SummaryRow label="Rol">
          <RoleChip role={record.role} />
        </SummaryRow>
        <SummaryRow label="Durum">
          {record.is_active ? (
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
          )}
        </SummaryRow>

        <Divider sx={{ my: 3, borderColor: '#f3f4f6' }} />

        {/* Kişisel Bilgiler */}
        <SectionTitle>Kişisel Bilgiler</SectionTitle>
        <SummaryRow label="Ad">{record.first_name || '-'}</SummaryRow>
        <SummaryRow label="Soyad">{record.last_name || '-'}</SummaryRow>
        <SummaryRow label="Telefon">{record.phone || '-'}</SummaryRow>

        <Divider sx={{ my: 3, borderColor: '#f3f4f6' }} />

        {/* Bayi Bilgileri */}
        <SectionTitle>Bayi Bilgileri</SectionTitle>
        <SummaryRow label="Bağlı Bayi">{record.dealer_name || 'Bayi atanmamış'}</SummaryRow>

        <Divider sx={{ my: 3, borderColor: '#f3f4f6' }} />

        {/* Meta Bilgiler */}
        <SectionTitle>Meta Bilgiler</SectionTitle>
        <SummaryRow label="Kayıt Tarihi">{formatDate(record.date_joined)}</SummaryRow>
        <SummaryRow label="Son Giriş">{formatDate(record.last_login)}</SummaryRow>
      </ShowCard>
    </FormContainer>
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
