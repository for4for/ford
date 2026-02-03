import {
  Edit,
  SimpleForm,
  TextInput,
  NumberInput,
  SelectInput,
  required,
  Toolbar,
  SaveButton,
  useRedirect,
} from 'react-admin';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useBrand } from '../../context/BrandContext';
import { Box, Typography, Button, Divider, Paper } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const CustomToolbar = ({ onCancel }: { onCancel?: () => void }) => {
  const redirect = useRedirect();
  
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      redirect('list', 'incentives/requests');
    }
  };
  
  return (
    <Toolbar
      sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        backgroundColor: 'transparent',
        padding: '24px 0 0 0',
        gap: 2,
      }}
    >
      <Button
        onClick={handleCancel}
        sx={{
          color: '#666',
          textTransform: 'none',
          fontWeight: 500,
          px: 3,
          '&:hover': { bgcolor: '#f5f5f5' },
        }}
      >
        İptal
      </Button>
      <SaveButton
        label="Kaydet"
        variant="contained"
        sx={{
          backgroundColor: '#1a1a2e',
          textTransform: 'none',
          fontWeight: 500,
          px: 4,
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: '#2d2d44',
            boxShadow: 'none',
          },
        }}
      />
    </Toolbar>
  );
};

// Section Title
const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <Typography
    sx={{
      fontSize: 13,
      fontWeight: 600,
      color: '#999',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      mb: 2,
      mt: 1,
    }}
  >
    {children}
  </Typography>
);

// Form input ortak stilleri
const inputStyles = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#fff',
    '& fieldset': {
      borderColor: '#e0e0e0',
    },
    '&:hover fieldset': {
      borderColor: '#bdbdbd',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#1a1a2e',
      borderWidth: 1,
    },
  },
  '& .MuiInputLabel-root': {
    color: '#666',
    '&.Mui-focused': {
      color: '#1a1a2e',
    },
  },
  '& .MuiFormHelperText-root': {
    marginLeft: 0,
    fontSize: 11,
    color: '#999',
  },
};

export const IncentiveRequestEdit = () => {
  const redirect = useRedirect();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { buildUrl } = useBrand();
  const isDealer = location.pathname.includes('/dealer/');

  const handleGoBack = () => {
    if (isDealer) {
      navigate(buildUrl(`/dealer/incentive-requests/${id}`));
    } else {
      redirect('list', 'incentives/requests');
    }
  };

  return (
    <Edit
      resource="incentives/requests"
      id={id}
      mutationMode="pessimistic"
      actions={false}
      sx={{
        marginTop: 4,
        '& .RaEdit-main': {
          marginTop: 0,
        },
      }}
    >
      <Box sx={{ maxWidth: 800, margin: '0 auto', px: 3, py: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <ArrowBackIcon 
            onClick={handleGoBack}
            sx={{ 
              fontSize: 22, 
              color: '#666', 
              cursor: 'pointer',
              '&:hover': { color: '#333' },
            }} 
          />
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: '#1a1a2e',
              fontSize: 22,
            }}
          >
            Teşvik Talebi Düzenle
          </Typography>
        </Box>

        <Paper 
          elevation={0} 
          sx={{ 
            border: '1px solid #e5e7eb',
            borderRadius: 2,
            p: 3,
          }}
        >
          <SimpleForm
            toolbar={<CustomToolbar onCancel={handleGoBack} />}
            sx={{
              padding: 0,
              '& .RaSimpleForm-content': {
                padding: 0,
              },
            }}
          >
          {/* Talep Bilgileri */}
          <SectionTitle>Talep Bilgileri</SectionTitle>
          
          <TextInput
            source="incentive_title"
            label="Teşvik Başlığı"
            validate={required()}
            fullWidth
            sx={inputStyles}
          />
          
          <TextInput
            source="incentive_details"
            label="Teşvik Detayları"
            multiline
            rows={3}
            validate={required()}
            fullWidth
            sx={inputStyles}
          />
          
          <TextInput
            source="purpose"
            label="Talebin Amacı"
            multiline
            rows={2}
            validate={required()}
            fullWidth
            sx={inputStyles}
          />
          
          <TextInput
            source="target_audience"
            label="Hedef Kitle"
            multiline
            rows={2}
            validate={required()}
            fullWidth
            sx={inputStyles}
          />

          <Divider sx={{ my: 3, borderColor: '#eee' }} />

          {/* Finansal Bilgiler */}
          <SectionTitle>Finansal Bilgiler</SectionTitle>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 1 }}>
            <NumberInput
              source="incentive_amount"
              label="Talep Edilen Tutar (₺)"
              validate={required()}
              fullWidth
              sx={inputStyles}
            />
            <SelectInput
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
              fullWidth
              sx={inputStyles}
            />
          </Box>
          
          <NumberInput
            source="approved_amount"
            label="Onaylanan Tutar (₺)"
            fullWidth
            sx={inputStyles}
          />

          <Divider sx={{ my: 3, borderColor: '#eee' }} />

          {/* Etkinlik Bilgileri */}
          <SectionTitle>Etkinlik Bilgileri</SectionTitle>
          
          <TextInput
            source="event_time"
            label="Etkinlik Zamanı"
            validate={required()}
            fullWidth
            sx={inputStyles}
          />
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 1 }}>
            <TextInput
              source="event_location"
              label="Konum (İl/İlçe)"
              validate={required()}
              fullWidth
              sx={inputStyles}
            />
            <TextInput
              source="event_venue"
              label="Mekan Adı"
              validate={required()}
              fullWidth
              sx={inputStyles}
            />
          </Box>
          
          <TextInput
            source="map_link"
            label="Harita Linki"
            fullWidth
            sx={inputStyles}
          />

          <Divider sx={{ my: 3, borderColor: '#eee' }} />

          {/* Performans */}
          <SectionTitle>Performans</SectionTitle>
          
          <TextInput
            source="performance_metrics"
            label="Performans Metrikleri"
            multiline
            rows={3}
            validate={required()}
            fullWidth
            sx={inputStyles}
          />

          <Divider sx={{ my: 3, borderColor: '#eee' }} />

          {/* Notlar */}
          <SectionTitle>Notlar</SectionTitle>
          
          <TextInput
            source="notes"
            label="Notlar"
            multiline
            rows={2}
            fullWidth
            sx={inputStyles}
          />
          
          <TextInput
            source="admin_notes"
            label="Admin Notları"
            multiline
            rows={2}
            fullWidth
            sx={inputStyles}
          />
          </SimpleForm>
        </Paper>
      </Box>
    </Edit>
  );
};
