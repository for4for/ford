import {
  List,
  Datagrid,
  TextField,
  DateField,
  TextInput,
  SelectInput,
  useRecordContext,
} from 'react-admin';
import { Box, Typography, Chip, Tooltip, IconButton } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
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
  filterInputStyles,
  filterSelectStyles,
  statusColors,
  getChipStyles,
  iconButtonPrimary,
  iconButtonSecondary,
} from '../../styles/listStyles';

// Durum Chip
const StatusChipField = ({ label: _label }: { label?: string }) => {
  const record = useRecordContext();
  if (!record) return null;
  
  const status = record.status as string;
  const config = statusColors[status] || statusColors.gorsel_bekliyor;
  
  return <Chip label={config.label} size="small" sx={getChipStyles(config)} />;
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
          to={`/backoffice/creatives/requests/${record.id}/show`}
          size="small"
          sx={iconButtonPrimary}
        >
          <VisibilityIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Düzenle" arrow>
        <IconButton
          component={Link}
          to={`/backoffice/creatives/requests/${record.id}`}
          size="small"
          sx={iconButtonSecondary}
        >
          <EditIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

const creativeFilters = [
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
      { id: 'gorsel_bekliyor', name: 'Kreatif Bekliyor' },
      { id: 'bayi_onayi_bekliyor', name: 'Bayi Onayı Bekliyor' },
      { id: 'onay_bekliyor', name: 'Onay Bekliyor' },
      { id: 'onaylandi', name: 'Onaylandı' },
      { id: 'reddedildi', name: 'Reddedildi' },
    ]}
    sx={{ ...filterSelectStyles, minWidth: 180 }}
  />,
];

export const CreativeRequestList = () => (
  <Box sx={listPageContainer}>
    {/* Header */}
    <Box sx={listHeader}>
      <Typography sx={listHeaderTitle}>Kreatif Talepler</Typography>
      <Typography sx={listHeaderSubtitle}>
        Kreatif tasarım taleplerini görüntüleyin ve yönetin
      </Typography>
    </Box>

    {/* Liste */}
    <List filters={creativeFilters} perPage={25} sx={listStyles}>
      <Datagrid rowClick="show" bulkActionButtons={false} sx={datagridStyles}>
        <TextField source="id" label="ID" sx={textFieldPrimary} />
        <TextField source="dealer_name" label="Bayi" sx={textFieldDefault} />
        <TextField source="creative_work_request" label="Talep" sx={textFieldDefault} />
        <TextField source="quantity_request" label="Adet" sx={textFieldDefault} />
        <DateField source="deadline" label="Termin" />
        <StatusChipField label="Durum" />
        <DateField source="created_at" label="Oluşturulma" showTime />
        <ActionButtons label="" />
      </Datagrid>
    </List>
  </Box>
);
