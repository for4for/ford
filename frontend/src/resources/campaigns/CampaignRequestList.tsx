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
import BarChartIcon from '@mui/icons-material/BarChart';
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
  iconButtonPrimary,
  iconButtonSecondary,
} from '../../styles/listStyles';

// Durum renk konfigürasyonu
type ChipColorConfig = {
  bg: string;
  color: string;
  label: string;
};

const statusColors: Record<string, ChipColorConfig> = {
  taslak: { bg: '#4b5563', color: '#ffffff', label: 'Taslak' },
  onay_bekliyor: { bg: '#b45309', color: '#ffffff', label: 'Onay Bekliyor' },
  onaylandi: { bg: '#166534', color: '#ffffff', label: 'Onaylandı' },
  reddedildi: { bg: '#991b1b', color: '#ffffff', label: 'Reddedildi' },
  yayinda: { bg: '#1d4ed8', color: '#ffffff', label: 'Yayında' },
  tamamlandi: { bg: '#166534', color: '#ffffff', label: 'Tamamlandı' },
};

// Durum Chip
const StatusChipField = ({ label: _label }: { label?: string }) => {
  const record = useRecordContext();
  if (!record) return null;
  
  const status = record.status as string;
  const config = statusColors[status] || statusColors.onay_bekliyor;
  
  return (
    <Chip 
      label={config.label} 
      size="small" 
      sx={{
        backgroundColor: config.bg,
        color: config.color,
        fontFamily: 'inherit',
        fontWeight: 600,
        fontSize: '0.75rem',
        height: 26,
        borderRadius: '6px',
        '& .MuiChip-label': {
          px: 1.5,
        },
      }} 
    />
  );
};

// Platform Chip
const PlatformsField = ({ label: _label }: { label?: string }) => {
  const record = useRecordContext();
  if (!record) return null;
  
  return (
    <Typography sx={{ fontSize: '0.875rem', color: '#1a1a2e' }}>
      {record.platforms_display}
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
  
  const showReport = record.status === 'yayinda' || record.status === 'tamamlandi';
  
  return (
    <Box sx={{ display: 'flex', gap: 0.5 }} onClick={handleClick}>
      <Tooltip title="Görüntüle" arrow>
        <IconButton
          component={Link}
          to={`/backoffice/campaigns/requests/${record.id}/show`}
          size="small"
          sx={iconButtonPrimary}
        >
          <VisibilityIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
      {showReport && (
        <Tooltip title="Rapor" arrow>
          <IconButton
            component={Link}
            to={`/backoffice/campaigns/requests/${record.id}/report`}
            size="small"
            sx={{
              color: '#1d4ed8',
              width: 32,
              height: 32,
              '&:hover': {
                backgroundColor: 'rgba(29, 78, 216, 0.08)',
              },
            }}
          >
            <BarChartIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      )}
      <Tooltip title="Düzenle" arrow>
        <IconButton
          component={Link}
          to={`/backoffice/campaigns/requests/${record.id}`}
          size="small"
          sx={iconButtonSecondary}
        >
          <EditIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

const campaignFilters = [
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
      { id: 'onaylandi', name: 'Onaylandı' },
      { id: 'reddedildi', name: 'Reddedildi' },
      { id: 'yayinda', name: 'Yayında' },
      { id: 'tamamlandi', name: 'Tamamlandı' },
    ]}
    sx={{ ...filterSelectStyles, minWidth: 160 }}
  />,
  <SelectInput
    key="campaign_type"
    source="campaign_type"
    label="Kampanya Türü"
    choices={[
      { id: 'link', name: 'Link ile' },
      { id: 'upload', name: 'Görsel ile' },
    ]}
    sx={{ ...filterSelectStyles, minWidth: 140 }}
  />,
];

export const CampaignRequestList = () => (
  <Box sx={listPageContainer}>
    {/* Header */}
    <Box sx={listHeader}>
      <Typography sx={listHeaderTitle}>Kampanya Talepleri</Typography>
      <Typography sx={listHeaderSubtitle}>
        Sosyal medya kampanya taleplerini görüntüleyin ve yönetin
      </Typography>
    </Box>

    {/* Liste */}
    <List filters={campaignFilters} perPage={25} storeKey={false} sx={listStyles}>
      <Datagrid rowClick="show" bulkActionButtons={false} sx={datagridStyles}>
        <TextField source="id" label="ID" sx={textFieldPrimary} />
        <TextField source="dealer_name" label="Bayi" sortBy="dealer__dealer_name" sx={textFieldDefault} />
        <TextField source="campaign_name" label="Kampanya Adı" sx={textFieldDefault} />
        <NumberField 
          source="budget" 
          label="Bütçe (₺)" 
          options={{ style: 'currency', currency: 'TRY' }}
        />
        <PlatformsField label="Platform" />
        <DateField source="start_date" label="Başlangıç" />
        <DateField source="end_date" label="Bitiş" />
        <StatusChipField label="Durum" />
        <DateField source="created_at" label="Oluşturulma" showTime />
        <ActionButtons label="" />
      </Datagrid>
    </List>
  </Box>
);





