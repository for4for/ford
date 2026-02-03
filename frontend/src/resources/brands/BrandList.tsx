import {
  List,
  Datagrid,
  TextField,
  TextInput,
  SelectInput,
  useRecordContext,
  useCreatePath,
} from 'react-admin';
import { Box, Typography, Chip, Tooltip, IconButton } from '@mui/material';
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
  statusColors,
  getChipStyles,
  iconButtonPrimary,
} from '../../styles/listStyles';

// Özel Durum Chip Komponenti
const StatusChipField = ({ label: _label }: { label?: string }) => {
  const record = useRecordContext();
  if (!record) return null;
  
  const isActive = record.is_active as boolean;
  const config = isActive ? statusColors.aktif : statusColors.pasif;
  
  return <Chip label={isActive ? 'Aktif' : 'Pasif'} size="small" sx={getChipStyles(config)} />;
};

// Reklam Hesabı Alanı
const AdAccountField = ({ label: _label }: { label?: string }) => {
  const record = useRecordContext();
  if (!record) return null;
  
  const fbAccount = record.fb_ad_account_id;
  
  return (
    <Typography 
      variant="body2" 
      sx={{ color: fbAccount ? '#1a1a2e' : '#9e9e9e', fontSize: '0.875rem', fontFamily: 'inherit' }}
    >
      {fbAccount || '-'}
    </Typography>
  );
};

// Bayi Sayısı Alanı
const DealerCountField = ({ label: _label }: { label?: string }) => {
  const record = useRecordContext();
  if (!record) return null;
  
  const count = record.dealer_count || 0;
  
  return (
    <Chip 
      label={count} 
      size="small" 
      sx={{
        backgroundColor: count > 0 ? '#e3f2fd' : '#f5f5f5',
        color: count > 0 ? '#1565c0' : '#9e9e9e',
        fontWeight: 600,
        minWidth: 40,
      }} 
    />
  );
};

// Icon Aksiyon Butonları
const ActionButtons = ({ label: _label }: { label?: string }) => {
  const record = useRecordContext();
  const createPath = useCreatePath();
  if (!record) return null;
  
  const editPath = createPath({ resource: 'brands', type: 'edit', id: record.id });
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  
  return (
    <Box sx={{ display: 'flex', gap: 0.5 }} onClick={handleClick}>
      <Tooltip title="Düzenle" arrow>
        <IconButton
          component={Link}
          to={editPath}
          size="small"
          sx={iconButtonPrimary}
        >
          <EditIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Sil" arrow>
        <IconButton
          component={Link}
          to={editPath}
          size="small"
          sx={{
            ...iconButtonPrimary,
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

const brandFilters = [
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
    key="is_active"
    source="is_active"
    label="Durum"
    choices={[
      { id: true, name: 'Aktif' },
      { id: false, name: 'Pasif' },
    ]}
    sx={filterSelectStyles}
  />,
];

export const BrandList = () => (
  <Box sx={listPageContainer}>
    {/* Header */}
    <Box sx={listHeader}>
      <Typography sx={listHeaderTitle}>Markalar</Typography>
      <Typography sx={listHeaderSubtitle}>
        Tüm marka kayıtlarını görüntüleyin ve yönetin
      </Typography>
    </Box>

    {/* Liste */}
    <List filters={brandFilters} perPage={25} sx={listStyles} sort={{ field: 'name', order: 'ASC' }}>
      <Datagrid rowClick="edit" bulkActionButtons={false} sx={datagridStyles}>
        <TextField source="code" label="Kod" sx={textFieldPrimary} />
        <TextField source="name" label="Marka Adı" sx={textFieldDefault} />
        <AdAccountField label="FB Reklam Hesabı" />
        <DealerCountField label="Bayi Sayısı" />
        <StatusChipField label="Durum" />
        <ActionButtons label="" />
      </Datagrid>
    </List>
  </Box>
);
