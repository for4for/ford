import { useState } from 'react';
import {
  List,
  Datagrid,
  TextField,
  DateField,
  TextInput,
  SelectInput,
  useRecordContext,
  useDelete,
  useNotify,
  useRefresh,
} from 'react-admin';
import {
  Box,
  Typography,
  Chip,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField as MuiTextField,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { Link } from 'react-router-dom';
import {
  listPageContainer,
  listHeader,
  listHeaderTitle,
  listHeaderSubtitle,
  listStyles,
  datagridStyles,
  textFieldPrimary,
  textFieldDefault,
  filterInputStyles,
  filterSelectStyles,
  roleColors,
  getChipStyles,
  iconButtonPrimary,
  iconButtonSecondary,
} from '../../styles/listStyles';

// Rol Chip
const RoleChipField = ({ label: _label }: { label?: string }) => {
  const record = useRecordContext();
  if (!record) return null;
  
  const role = record.role as string;
  const config = roleColors[role] || roleColors.bayi;
  
  return <Chip label={config.label} size="small" sx={getChipStyles(config)} />;
};

// Aktif/Pasif/Silindi Durumu
const StatusField = ({ label: _label }: { label?: string }) => {
  const record = useRecordContext();
  if (!record) return null;
  
  if (record.is_deleted) {
    return (
      <Chip 
        label="Silindi" 
        size="small" 
        sx={{ 
          backgroundColor: '#ffebee', 
          color: '#c62828',
          fontWeight: 500,
        }} 
      />
    );
  }
  
  return record.is_active ? (
    <CheckCircleIcon sx={{ color: '#2e7d32', fontSize: 20 }} />
  ) : (
    <CancelIcon sx={{ color: '#757575', fontSize: 20 }} />
  );
};

// Bayi Sorumlusu Alanı
const DealerContactField = ({ label: _label }: { label?: string }) => {
  const record = useRecordContext();
  if (!record) return null;
  
  const firstName = record.dealer_contact_first_name;
  const lastName = record.dealer_contact_last_name;
  
  if (!firstName && !lastName) {
    return <Typography variant="body2" sx={{ color: '#9e9e9e' }}>-</Typography>;
  }
  
  return (
    <Typography variant="body2" sx={{ color: '#1a1a2e', fontSize: '0.875rem' }}>
      {firstName} {lastName}
    </Typography>
  );
};

// Silme Dialog Bileşeni
const DeleteUserDialog = ({ 
  open, 
  onClose, 
  userId, 
  userName 
}: { 
  open: boolean; 
  onClose: () => void; 
  userId: number | null; 
  userName: string;
}) => {
  const [reason, setReason] = useState('');
  const [deleteOne, { isPending }] = useDelete();
  const notify = useNotify();
  const refresh = useRefresh();

  const handleDelete = () => {
    if (!userId) return;
    
    deleteOne(
      'users',
      { id: userId, previousData: { id: userId }, meta: { reason } },
      {
        onSuccess: () => {
          notify('Kullanıcı silindi', { type: 'success' });
          refresh();
          onClose();
          setReason('');
        },
        onError: () => {
          notify('Silme işlemi başarısız', { type: 'error' });
        },
      }
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>Kullanıcı Sil</DialogTitle>
      <DialogContent>
        <Typography sx={{ mb: 2 }}>
          <strong>{userName}</strong> kullanıcısını silmek istediğinize emin misiniz?
        </Typography>
        <MuiTextField
          label="Silme Nedeni (Opsiyonel)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          fullWidth
          multiline
          rows={2}
          placeholder="Örn: İşten ayrıldı, Hatalı kayıt..."
          sx={{ mt: 1 }}
        />
        <Typography variant="caption" sx={{ color: '#666', mt: 1, display: 'block' }}>
          Not: Bu işlem geri alınabilir. Kullanıcı tamamen silinmez, pasif duruma geçer.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          İptal
        </Button>
        <Button 
          onClick={handleDelete} 
          variant="contained" 
          color="error"
          disabled={isPending}
        >
          {isPending ? 'Siliniyor...' : 'Sil'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Icon Aksiyon Butonları
const ActionButtons = ({ 
  label: _label, 
  onDelete 
}: { 
  label?: string;
  onDelete: (id: number, name: string) => void;
}) => {
  const record = useRecordContext();
  if (!record) return null;
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(Number(record.id), `${record.first_name} ${record.last_name} (${record.username})`);
  };

  // Silinen kullanıcılar için sadece görüntüleme
  if (record.is_deleted) {
    return (
      <Box sx={{ display: 'flex', gap: 0.5 }} onClick={handleClick}>
        <Tooltip title="Görüntüle" arrow>
          <IconButton
            component={Link}
            to={`/backoffice/users/${record.id}/show`}
            size="small"
            sx={iconButtonPrimary}
          >
            <VisibilityIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Box>
    );
  }
  
  return (
    <Box sx={{ display: 'flex', gap: 0.5 }} onClick={handleClick}>
      <Tooltip title="Görüntüle" arrow>
        <IconButton
          component={Link}
          to={`/backoffice/users/${record.id}/show`}
          size="small"
          sx={iconButtonPrimary}
        >
          <VisibilityIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Düzenle" arrow>
        <IconButton
          component={Link}
          to={`/backoffice/users/${record.id}`}
          size="small"
          sx={iconButtonSecondary}
        >
          <EditIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Sil" arrow>
        <IconButton
          size="small"
          onClick={handleDeleteClick}
          sx={{
            color: '#757575',
            '&:hover': {
              backgroundColor: '#ffebee',
              color: '#c62828',
            },
          }}
        >
          <DeleteIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

const userFilters = [
  <TextInput 
    key="search" 
    label="Ara" 
    source="q" 
    alwaysOn 
    variant="outlined"
    size="small"
    sx={filterInputStyles} 
  />,
  <SelectInput
    key="role"
    source="role"
    label="Rol"
    choices={[
      { id: 'admin', name: 'Admin' },
      { id: 'moderator', name: 'Moderatör' },
      { id: 'bayi', name: 'Bayi' },
      { id: 'creative_agency', name: 'Creative Agency' },
    ]}
    sx={filterSelectStyles}
  />,
  <SelectInput
    key="is_active"
    source="is_active"
    label="Durum"
    choices={[
      { id: 'true', name: 'Aktif' },
      { id: 'false', name: 'Pasif' },
    ]}
    sx={filterSelectStyles}
  />,
  <SelectInput
    key="is_deleted"
    source="is_deleted"
    label="Silinmiş"
    choices={[
      { id: 'false', name: 'Hayır' },
      { id: 'true', name: 'Evet' },
    ]}
    sx={filterSelectStyles}
  />,
];

export const UserList = () => {
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; userId: number | null; userName: string }>({
    open: false,
    userId: null,
    userName: '',
  });

  const handleOpenDelete = (id: number, name: string) => {
    setDeleteDialog({ open: true, userId: id, userName: name });
  };

  const handleCloseDelete = () => {
    setDeleteDialog({ open: false, userId: null, userName: '' });
  };

  return (
    <Box sx={listPageContainer}>
      {/* Header */}
      <Box sx={listHeader}>
        <Typography sx={listHeaderTitle}>Kullanıcılar</Typography>
        <Typography sx={listHeaderSubtitle}>
          Sistem kullanıcılarını görüntüleyin ve yönetin
        </Typography>
      </Box>

      {/* Liste */}
      <List filters={userFilters} perPage={25} sx={listStyles}>
        <Datagrid rowClick="show" bulkActionButtons={false} sx={datagridStyles}>
          <TextField source="username" label="E-posta" sx={textFieldPrimary} />
          <TextField source="first_name" label="Ad" sx={textFieldDefault} />
          <TextField source="last_name" label="Soyad" sx={textFieldDefault} />
          <RoleChipField label="Rol" />
          <TextField source="dealer_name" label="Bayi" emptyText="-" sx={textFieldDefault} />
          <TextField source="dealer_phone" label="Telefon" emptyText="-" sx={textFieldDefault} />
          <DealerContactField label="Bayi Sorumlusu" />
          <StatusField label="Durum" />
          <DateField source="date_joined" label="Kayıt Tarihi" />
          <ActionButtons label="" onDelete={handleOpenDelete} />
        </Datagrid>
      </List>

      {/* Silme Dialog */}
      <DeleteUserDialog
        open={deleteDialog.open}
        onClose={handleCloseDelete}
        userId={deleteDialog.userId}
        userName={deleteDialog.userName}
      />
    </Box>
  );
};
