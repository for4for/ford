import {
  Edit,
  SimpleForm,
  TextInput,
  NumberInput,
  DateInput,
  ReferenceInput,
  SelectInput,
  required,
  SaveButton,
  useRedirect,
  Toolbar,
} from 'react-admin';
import {
  Box,
  Typography,
  Button,
  Paper,
  Checkbox,
  Radio,
  Alert,
  InputAdornment,
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

// Feature flag: Kampanya Türü Seçimi (Link vs Görsel Yükleme)
// Ford için true, Tofaş için false
const ENABLE_CAMPAIGN_TYPE_SELECTION = false;

// Status seçenekleri
const statusChoices = [
  { id: 'taslak', name: 'Taslak' },
  { id: 'onay_bekliyor', name: 'Onay Bekliyor' },
  { id: 'onaylandi', name: 'Onaylandı' },
  { id: 'reddedildi', name: 'Reddedildi' },
  { id: 'yayinda', name: 'Yayında' },
  { id: 'tamamlandi', name: 'Tamamlandı' },
];

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
};

// Kompakt input stilleri (grid içinde)
const compactInputStyles = {
  ...inputStyles,
  marginBottom: 0,
};

// Platform Checkbox Stili
const PlatformCheckbox = ({ 
  checked, 
  onChange, 
  icon, 
  label 
}: { 
  checked: boolean; 
  onChange: (checked: boolean) => void;
  icon: React.ReactNode;
  label: string;
}) => (
  <Box
    onClick={() => onChange(!checked)}
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      px: 2,
      py: 1,
      borderRadius: '6px',
      border: `1.5px solid ${checked ? '#374151' : '#e5e7eb'}`,
      backgroundColor: checked ? '#f9fafb' : '#fff',
      cursor: 'pointer',
      transition: 'all 0.15s ease',
      '&:hover': {
        borderColor: checked ? '#374151' : '#d1d5db',
      },
    }}
  >
    <Checkbox
      checked={checked}
      size="small"
      sx={{ 
        p: 0,
        color: '#d1d5db',
        '&.Mui-checked': { color: '#374151' },
      }}
    />
    {icon}
    <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>
      {label}
    </Typography>
  </Box>
);

// Reklam Modeli Seçim Kutusu
const AdModelOption = ({ 
  selected, 
  title, 
  description,
  onChange 
}: { 
  selected: boolean;
  title: string;
  description: string;
  onChange: () => void;
}) => (
  <Box
    onClick={onChange}
    sx={{
      flex: 1,
      border: `1.5px solid ${selected ? '#374151' : '#e5e7eb'}`,
      borderRadius: '8px',
      p: 1.5,
      cursor: 'pointer',
      backgroundColor: selected ? '#f9fafb' : '#fff',
      transition: 'all 0.15s ease',
      '&:hover': {
        borderColor: selected ? '#374151' : '#d1d5db',
      },
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
      <Radio
        checked={selected}
        size="small"
        sx={{ 
          p: 0, 
          mt: 0.3,
          color: '#d1d5db',
          '&.Mui-checked': { color: '#374151' },
        }}
      />
      <Box>
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
          {title}
        </Typography>
        <Typography sx={{ fontSize: 11, color: '#9ca3af', mt: 0.25 }}>
          {description}
        </Typography>
      </Box>
    </Box>
  </Box>
);

// Custom Toolbar
const CustomToolbar = ({ onCancel }: { onCancel?: () => void }) => {
  const redirect = useRedirect();
  
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      redirect('list', 'campaigns/requests');
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

// Form validasyonu - bitiş tarihi başlangıçtan önce olamaz
const validateForm = (values: any) => {
  const errors: any = {};
  if (values.start_date && values.end_date && values.end_date < values.start_date) {
    errors.end_date = 'Bitiş tarihi, başlangıç tarihinden önce olamaz';
  }
  return errors;
};

export const CampaignRequestEdit = () => {
  const redirect = useRedirect();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isDealer = location.pathname.startsWith('/dealer');

  // State for conditional form fields
  const [platforms, setPlatforms] = useState<string[]>(['instagram', 'facebook']);
  const [adModel, setAdModel] = useState<'bayi_sayfasi' | 'form_yonlendirme'>('bayi_sayfasi');
  const [showBudgetWarning, setShowBudgetWarning] = useState(false);

  const handlePlatformChange = (platform: string, checked: boolean) => {
    if (checked) {
      setPlatforms([...platforms, platform]);
    } else {
      setPlatforms(platforms.filter(p => p !== platform));
    }
  };

  const handleGoBack = () => {
    if (isDealer) {
      navigate('/dealer/requests');
    } else {
      redirect('list', 'campaigns/requests');
    }
  };

  // Transform data before save
  const transform = (data: any) => ({
    ...data,
    platforms: Array.isArray(data.platforms) ? data.platforms : 
               typeof data.platforms === 'string' ? JSON.parse(data.platforms) : 
               ['instagram', 'facebook'],
  });

  return (
    <Edit
      resource="campaigns/requests"
      id={id}
      transform={transform}
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
            Kampanya Düzenle
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
            validate={validateForm}
            sx={{
              padding: 0,
              '& .RaSimpleForm-content': {
                padding: 0,
              },
            }}
          >
            {/* Bayi ve Durum */}
            <SectionTitle>Genel Bilgiler</SectionTitle>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 1 }}>
              <ReferenceInput source="dealer" reference="dealers">
                <SelectInput 
                  optionText="dealer_name" 
                  label="Bayi"
                  validate={required()} 
                  fullWidth
                  sx={inputStyles}
                  disabled={isDealer}
                />
              </ReferenceInput>
              <SelectInput 
                source="status" 
                label="Durum" 
                choices={statusChoices}
                validate={required()}
                fullWidth
                sx={inputStyles}
              />
            </Box>

            <Divider sx={{ my: 3, borderColor: '#eee' }} />

            {/* Kampanya Bilgileri */}
            <SectionTitle>Kampanya Bilgileri</SectionTitle>
            
            <TextInput
              source="campaign_name"
              label="Kampanya Adı"
              validate={required()}
              fullWidth
              sx={inputStyles}
            />
            
            <NumberInput
              source="budget"
              label="Bütçe"
              validate={required()}
              fullWidth
              sx={inputStyles}
              InputProps={{
                endAdornment: <InputAdornment position="end">₺</InputAdornment>,
              }}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                setShowBudgetWarning(value > 50000);
              }}
            />
            
            {showBudgetWarning && (
              <Alert 
                severity="warning" 
                sx={{ 
                  mb: 1.5,
                  py: 0.5,
                  '& .MuiAlert-message': { fontSize: 12 }
                }}
              >
                Yüksek bütçe uyarısı
              </Alert>
            )}
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 1 }}>
              <DateInput
                source="start_date"
                label="Başlangıç"
                validate={required()}
                fullWidth
                sx={compactInputStyles}
              />
              <DateInput
                source="end_date"
                label="Bitiş"
                validate={required()}
                fullWidth
                sx={compactInputStyles}
              />
            </Box>

            <Divider sx={{ my: 3, borderColor: '#eee' }} />

            {/* Platform Seçimi */}
            <SectionTitle>Platform</SectionTitle>
            
            <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
              <PlatformCheckbox
                checked={platforms.includes('instagram')}
                onChange={(checked) => handlePlatformChange('instagram', checked)}
                icon={<InstagramIcon sx={{ fontSize: 18, color: '#E4405F' }} />}
                label="Instagram"
              />
              <PlatformCheckbox
                checked={platforms.includes('facebook')}
                onChange={(checked) => handlePlatformChange('facebook', checked)}
                icon={<FacebookIcon sx={{ fontSize: 18, color: '#1877F2' }} />}
                label="Facebook"
              />
            </Box>

            {/* Hidden inputs for form state */}
            <input type="hidden" name="platforms" value={JSON.stringify(platforms)} />
            <input type="hidden" name="ad_model" value={adModel} />

            <Divider sx={{ my: 3, borderColor: '#eee' }} />

            {/* Yönlendirme */}
            <SectionTitle>Yönlendirme</SectionTitle>
            
            <SelectInput
              source="redirect_type"
              label="Hedef Sayfa"
              choices={[
                { id: 'satis', name: 'Satış Sayfası' },
                { id: 'servis', name: 'Servis Sayfası' },
                { id: 'diger', name: 'Diğer' },
              ]}
              fullWidth
              sx={inputStyles}
            />

            <Divider sx={{ my: 3, borderColor: '#eee' }} />

            {/* Reklam Modeli */}
            <SectionTitle>Reklam Modeli</SectionTitle>
            
            <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
              <AdModelOption
                selected={adModel === 'bayi_sayfasi'}
                title="Bayi Sayfası"
                description="Beğeni ve yorum odaklı"
                onChange={() => setAdModel('bayi_sayfasi')}
              />
              <AdModelOption
                selected={adModel === 'form_yonlendirme'}
                title="Form Yönlendirme"
                description="Lead toplama odaklı"
                onChange={() => setAdModel('form_yonlendirme')}
              />
            </Box>

            <Divider sx={{ my: 3, borderColor: '#eee' }} />

            {/* Not Alanı */}
            <SectionTitle>Notlar</SectionTitle>
            
            <TextInput
              source="notes"
              label="Kampanya Notları"
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
