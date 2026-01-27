import {
  List,
  Datagrid,
  TextField,
  NumberField,
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
  const config = statusColors[status] || statusColors.onay_bekliyor;
  
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
          to={`/backoffice/incentives/requests/${record.id}/show`}
          size="small"
          sx={iconButtonPrimary}
        >
          <VisibilityIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Düzenle" arrow>
        <IconButton
          component={Link}
          to={`/backoffice/incentives/requests/${record.id}`}
          size="small"
          sx={iconButtonSecondary}
        >
          <EditIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

const incentiveFilters = [
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
      { id: 'taslak', name: 'Taslak' },
      { id: 'onay_bekliyor', name: 'Onay Bekliyor' },
      { id: 'degerlendirme', name: 'Değerlendirme' },
      { id: 'onaylandi', name: 'Onaylandı' },
      { id: 'reddedildi', name: 'Reddedildi' },
      { id: 'tamamlandi', name: 'Tamamlandı' },
    ]}
    sx={{ ...filterSelectStyles, minWidth: 160 }}
  />,
];

export const IncentiveRequestList = () => (
  <Box sx={listPageContainer}>
    {/* Header */}
    <Box sx={listHeader}>
      <Typography sx={listHeaderTitle}>Teşvik Talepleri</Typography>
      <Typography sx={listHeaderSubtitle}>
        Teşvik ve etkinlik taleplerini görüntüleyin ve yönetin
      </Typography>
    </Box>

    {/* Liste */}
    <List filters={incentiveFilters} perPage={25} sx={listStyles}>
      <Datagrid rowClick="show" bulkActionButtons={false} sx={datagridStyles}>
        <TextField source="id" label="ID" sx={textFieldPrimary} />
        <TextField source="dealer_name" label="Bayi" sortBy="dealer__dealer_name" sx={textFieldDefault} />
        <TextField source="incentive_title" label="Başlık" sortBy="incentive_title" sx={textFieldDefault} />
        <NumberField 
          source="incentive_amount" 
          label="Tutar (₺)" 
          options={{ style: 'currency', currency: 'TRY' }}
        />
        <TextField source="event_time" label="Tarih" sortBy="event_time" sx={textFieldDefault} />
        <TextField source="event_venue" label="Mekan" sortBy="event_venue" sx={textFieldDefault} />
        <StatusChipField label="Durum" />
        <DateField source="created_at" label="Oluşturulma" showTime />
        <ActionButtons label="" />
      </Datagrid>
    </List>
  </Box>
);
