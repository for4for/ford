import { useState } from 'react';
import {
  List,
  Datagrid,
  TextField,
  EmailField,
  TextInput,
  SelectInput,
  useRecordContext,
  useDelete,
  useNotify,
  useRefresh,
} from 'react-admin';
import { Box, Typography, Chip, Tooltip, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Link } from 'react-router-dom';
import { DeleteDealerDialog } from '../../components/DeleteDealerDialog';
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
  iconButtonSecondary,
} from '../../styles/listStyles';

// Özel Durum Chip Komponenti - Merkezi badge stili
const StatusChipField = ({ label: _label }: { label?: string }) => {
  const record = useRecordContext();
  if (!record) return null;
  
  // Silindi durumu
  if (record.is_deleted) {
    const config = statusColors.silindi;
    return <Chip label={config.label} size="small" sx={getChipStyles(config)} />;
  }
  
  // Normal durum (aktif/pasif/askida)
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

  // Silinen bayiler için sadece görüntüleme
  if (record.is_deleted) {
    return (
      <Box sx={{ display: 'flex', gap: 0.5 }} onClick={handleClick}>
        <Tooltip title="Görüntüle" arrow>
          <IconButton
            component={Link}
            to={`/backoffice/dealers/${record.id}`}
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
      { id: 'pasif', name: 'Onay Bekliyor' },
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

export const DealerList = () => {
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; dealer: any }>({
    open: false,
    dealer: null,
  });
  const [deleteOne] = useDelete();
  const notify = useNotify();
  const refresh = useRefresh();

  const handleOpenDelete = (record: any) => {
    setDeleteDialog({ open: true, dealer: record });
  };

  const handleCloseDelete = () => {
    setDeleteDialog({ open: false, dealer: null });
  };

  const handleDeleteConfirm = async (reason: string) => {
    if (deleteDialog.dealer) {
      try {
        await deleteOne('dealers', { id: deleteDialog.dealer.id, meta: { reason } });
        notify('Bayi silindi', { type: 'success' });
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
        <Typography sx={listHeaderTitle}>Bayiler</Typography>
        <Typography sx={listHeaderSubtitle}>
          Tüm bayi kayıtlarını görüntüleyin ve yönetin
        </Typography>
      </Box>

      {/* Liste */}
      <List filters={dealerFilters} perPage={25} storeKey={false} sx={listStyles}>
        <Datagrid rowClick="edit" bulkActionButtons={false} sx={datagridStyles}>
          <TextField source="id" label="ID" sx={textFieldDefault} />
          <TextField source="dealer_code" label="Bayi Kodu" sx={textFieldPrimary} />
          <TextField source="dealer_name" label="Bayi Ünvanı" sx={textFieldDefault} />
          <TextField source="brand_name" label="Marka" sx={textFieldDefault} emptyText="-" />
          <LocationField label="Konum" />
          <EmailField source="email" label="E-posta" sx={emailFieldStyles} />
          <DealerTypeChipField label="Bayi Tipi" />
          <StatusChipField label="Durum" />
          <ActionButtons label="" onDelete={handleOpenDelete} />
        </Datagrid>
      </List>

      {/* Silme Dialog */}
      <DeleteDealerDialog
        open={deleteDialog.open}
        onClose={handleCloseDelete}
        onConfirm={handleDeleteConfirm}
        dealer={deleteDialog.dealer}
      />
    </Box>
  );
};
