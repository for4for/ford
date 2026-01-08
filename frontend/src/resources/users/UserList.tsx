import {
  List,
  Datagrid,
  TextField,
  EmailField,
  DateField,
  TextInput,
  SelectInput,
  useRecordContext,
} from 'react-admin';
import { Box, Typography, Chip, Tooltip, IconButton } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
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
  emailFieldStyles,
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

// Aktif/Pasif Durumu
const ActiveStatusField = ({ label: _label }: { label?: string }) => {
  const record = useRecordContext();
  if (!record) return null;
  
  const isActive = record.is_active;
  
  return isActive ? (
    <CheckCircleIcon sx={{ color: '#2e7d32', fontSize: 20 }} />
  ) : (
    <CancelIcon sx={{ color: '#757575', fontSize: 20 }} />
  );
};

// Icon Aksiyon Butonları
const ActionButtons = ({ label: _label }: { label?: string }) => {
  const record = useRecordContext();
  if (!record) return null;
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  
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
];

export const UserList = () => (
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
        <TextField source="username" label="Bayi Kodu" sx={textFieldPrimary} />
        <TextField source="first_name" label="Ad" sx={textFieldDefault} />
        <TextField source="last_name" label="Soyad" sx={textFieldDefault} />
        <EmailField source="email" label="E-posta" sx={emailFieldStyles} />
        <RoleChipField label="Rol" />
        <TextField source="dealer_name" label="Bayi" emptyText="-" sx={textFieldDefault} />
        <ActiveStatusField label="Aktif" />
        <DateField source="date_joined" label="Kayıt Tarihi" />
        <ActionButtons label="" />
      </Datagrid>
    </List>
  </Box>
);
