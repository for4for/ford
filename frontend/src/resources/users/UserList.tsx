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
} from '@mui/material';
import { DeleteUserDialog } from '../../components/DeleteUserDialog';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
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
  statusColors,
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

// Aktif/Pasif/Silindi Durumu - Merkezi badge stili
const StatusField = ({ label: _label }: { label?: string }) => {
  const record = useRecordContext();
  if (!record) return null;
  
  // Silindi durumu
  if (record.is_deleted) {
    const config = statusColors.silindi;
    return <Chip label={config.label} size="small" sx={getChipStyles(config)} />;
  }
  
  // Aktif/Onay Bekliyor durumu
  const statusKey = record.is_active ? 'aktif' : 'onay_bekliyor';
  const config = statusColors[statusKey];
  return <Chip label={config.label} size="small" sx={getChipStyles(config)} />;
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

// Icon Aksiyon Butonları
const ActionButtons = ({ 
  label: _label, 
  onDelete 
}: { 
  label?: string;
  onDelete: (record: any) => void;
}) => {
  const record = useRecordContext();
  if (!record) return null;
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(record);
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
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; user: any }>({
    open: false,
    user: null,
  });
  const [deleteOne] = useDelete();
  const notify = useNotify();
  const refresh = useRefresh();

  const handleOpenDelete = (record: any) => {
    setDeleteDialog({ open: true, user: record });
  };

  const handleCloseDelete = () => {
    setDeleteDialog({ open: false, user: null });
  };

  const handleDeleteConfirm = async (reason: string) => {
    if (deleteDialog.user) {
      try {
        await deleteOne('users', { id: deleteDialog.user.id, meta: { reason } });
        notify('Kullanıcı silindi', { type: 'success' });
        refresh();
      } catch (error) {
        notify('Silme işlemi başarısız', { type: 'error' });
      }
    }
    handleCloseDelete();
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
      <List filters={userFilters} perPage={25} storeKey={false} sx={listStyles}>
        <Datagrid rowClick="show" bulkActionButtons={false} sx={datagridStyles}>
          <TextField source="username" label="E-posta" sx={textFieldPrimary} />
          <TextField source="first_name" label="Ad" sx={textFieldDefault} />
          <TextField source="last_name" label="Soyad" sx={textFieldDefault} />
          <RoleChipField label="Rol" />
          <TextField source="dealer_name" label="Bayi" sortBy="dealer__dealer_name" emptyText="-" sx={textFieldDefault} />
          <TextField source="phone" label="Telefon" emptyText="-" sx={textFieldDefault} />
          <DealerContactField label="Bayi Sorumlusu" sortBy="dealer__contact_first_name" />
          <StatusField label="Durum" />
          <DateField source="date_joined" label="Kayıt Tarihi" />
          <ActionButtons label="" onDelete={handleOpenDelete} />
        </Datagrid>
      </List>

      {/* Silme Dialog */}
      <DeleteUserDialog
        open={deleteDialog.open}
        onClose={handleCloseDelete}
        onConfirm={handleDeleteConfirm}
        user={deleteDialog.user}
      />
    </Box>
  );
};
