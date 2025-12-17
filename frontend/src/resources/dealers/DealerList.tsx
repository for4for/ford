import {
  List,
  Datagrid,
  TextField,
  EmailField,
  TextInput,
  SelectInput,
  useRecordContext,
} from 'react-admin';
import { Box, Typography, Chip, Tooltip, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
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
  statusColors,
  dealerTypeColors,
  getChipStyles,
  iconButtonPrimary,
} from '../../styles/listStyles';

// Özel Durum Chip Komponenti
const StatusChipField = ({ label: _label }: { label?: string }) => {
  const record = useRecordContext();
  if (!record) return null;
  
  const status = record.status as string;
  const config = statusColors[status] || statusColors.aktif;
  
  return <Chip label={config.label} size="small" sx={getChipStyles(config)} />;
};

// Özel Bayi Tipi Chip Komponenti
const DealerTypeChipField = ({ label: _label }: { label?: string }) => {
  const record = useRecordContext();
  if (!record) return null;
  
  const dealerType = record.dealer_type as string;
  const config = dealerTypeColors[dealerType] || dealerTypeColors.yetkili;
  
  return <Chip label={config.label} size="small" sx={getChipStyles(config)} />;
};

// Konum (İl/İlçe) Birleşik Alan
const LocationField = ({ label: _label }: { label?: string }) => {
  const record = useRecordContext();
  if (!record) return null;
  
  return (
    <Typography 
      variant="body2" 
      sx={{ color: '#1a1a2e', fontSize: '0.875rem', fontFamily: 'inherit' }}
    >
      {record.city}, {record.district}
    </Typography>
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
      <Tooltip title="Düzenle" arrow>
        <IconButton
          component={Link}
          to={`/backoffice/dealers/${record.id}`}
          size="small"
          sx={iconButtonPrimary}
        >
          <EditIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

const dealerFilters = [
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
    key="status"
    source="status"
    label="Durum"
    choices={[
      { id: 'aktif', name: 'Aktif' },
      { id: 'pasif', name: 'Pasif' },
      { id: 'askida', name: 'Askıda' },
    ]}
    sx={filterSelectStyles}
  />,
  <SelectInput
    key="dealer_type"
    source="dealer_type"
    label="Bayi Tipi"
    choices={[
      { id: 'yetkili', name: 'Yetkili Bayi' },
      { id: 'anlasmali', name: 'Anlaşmalı Bayi' },
      { id: 'satis', name: 'Satış Bayisi' },
    ]}
    sx={{ ...filterSelectStyles, minWidth: 150 }}
  />,
  <TextInput 
    key="city" 
    source="city" 
    label="İl" 
    sx={{ ...filterSelectStyles, minWidth: 130 }} 
  />,
];

export const DealerList = () => (
  <Box sx={listPageContainer}>
    {/* Header */}
    <Box sx={listHeader}>
      <Typography sx={listHeaderTitle}>Bayiler</Typography>
      <Typography sx={listHeaderSubtitle}>
        Tüm bayi kayıtlarını görüntüleyin ve yönetin
      </Typography>
    </Box>

    {/* Liste */}
    <List filters={dealerFilters} perPage={25} sx={listStyles}>
      <Datagrid rowClick="edit" bulkActionButtons={false} sx={datagridStyles}>
        <TextField source="dealer_code" label="Bayi Kodu" sx={textFieldPrimary} />
        <TextField source="dealer_name" label="Bayi Ünvanı" sx={textFieldDefault} />
        <LocationField label="Konum" />
        <EmailField source="email" label="E-posta" sx={emailFieldStyles} />
        <TextField source="phone" label="Telefon" sx={textFieldDefault} />
        <DealerTypeChipField label="Bayi Tipi" />
        <StatusChipField label="Durum" />
        <ActionButtons label="" />
      </Datagrid>
    </List>
  </Box>
);
