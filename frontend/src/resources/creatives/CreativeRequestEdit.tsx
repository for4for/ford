import {
  Edit,
  SimpleForm,
  TextInput,
  NumberInput,
  DateInput,
  ArrayInput,
  SimpleFormIterator,
  ReferenceInput,
  SelectInput,
  required,
  useInput,
  Toolbar,
  SaveButton,
  useRedirect,
} from 'react-admin';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useBrand } from '../../context/BrandContext';
import { useSmartBack } from '../../hooks/useSmartBack';
import { 
  Box, 
  Alert, 
  Typography, 
  FormControlLabel, 
  Checkbox, 
  TextField as MuiTextField,
  FormControl,
  Paper,
  Divider,
  Button,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useState, useEffect } from 'react';

const creativeTypeLabels: Record<string, string> = {
  poster: 'Poster / Afiş',
  cadir: 'Çadır',
  tente: 'Tente',
  stand: 'Stand',
  orumcek: 'Örümcek Stand',
  megalight: 'Megalight',
  dijital: 'Dijital Ekran',
  led: 'Led Saha Kenarı',
  rollup: 'Roll-up',
  el_ilani: 'El İlanı',
  branda: 'Branda',
  totem: 'Totem',
  sticker: 'Sticker',
  diger: 'Diğer',
};

const statusChoices = [
  { id: 'taslak', name: 'Taslak' },
  { id: 'gorsel_bekliyor', name: 'Görsel Bekliyor' },
  { id: 'bayi_onayi_bekliyor', name: 'Bayi Onayı Bekliyor' },
  { id: 'onay_bekliyor', name: 'Onay Bekliyor' },
  { id: 'onaylandi', name: 'Onaylandı' },
  { id: 'reddedildi', name: 'Reddedildi' },
  { id: 'tamamlandi', name: 'Tamamlandı' },
];

const CustomToolbar = ({ onCancel }: { onCancel?: () => void }) => {
  const redirect = useRedirect();
  
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      redirect('list', 'creatives/requests');
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
};

// Custom checkbox input component for creative types
const CreativeTypesInput = () => {
  const {
    field,
    fieldState: { error },
  } = useInput({ source: 'creatives' });

  const [creativeTypes, setCreativeTypes] = useState<Record<string, { checked: boolean; description: string }>>({});
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized && field.value) {
      const initialValue: Record<string, { checked: boolean; description: string }> = {};
      const fieldArray = Array.isArray(field.value) ? field.value : [];
      
      Object.keys(creativeTypeLabels).forEach((key) => {
        const existing = fieldArray.find((c: any) => c.creative_type === key);
        initialValue[key] = {
          checked: !!existing,
          description: existing?.description || '',
        };
      });
      setCreativeTypes(initialValue);
      setInitialized(true);
    }
  }, [field.value, initialized]);

  const handleCreativeTypeChange = (key: string, checked: boolean) => {
    const newTypes = {
      ...creativeTypes,
      [key]: { ...creativeTypes[key], checked, description: checked ? creativeTypes[key]?.description || '' : '' },
    };
    setCreativeTypes(newTypes);
    
    const selectedCreatives = Object.entries(newTypes)
      .filter(([, value]) => value.checked)
      .map(([k, value]) => ({
        creative_type: k,
        description: value.description,
      }));
    field.onChange(selectedCreatives);
  };

  const handleDescriptionChange = (key: string, description: string) => {
    const newTypes = {
      ...creativeTypes,
      [key]: { ...creativeTypes[key], description },
    };
    setCreativeTypes(newTypes);
    
    const selectedCreatives = Object.entries(newTypes)
      .filter(([, value]) => value.checked)
      .map(([k, value]) => ({
        creative_type: k,
        description: value.description,
      }));
    field.onChange(selectedCreatives);
  };

  return (
    <FormControl fullWidth error={!!error} sx={{ mt: 1 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {Object.entries(creativeTypeLabels).map(([key, label]) => (
          <Box key={key}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={creativeTypes[key]?.checked || false}
                  onChange={(e) => handleCreativeTypeChange(key, e.target.checked)}
                  size="small"
                />
              }
              label={<Typography sx={{ fontSize: 14 }}>{label}</Typography>}
            />
            {creativeTypes[key]?.checked && (
              <MuiTextField
                fullWidth
                multiline
                rows={2}
                placeholder={`${label} açıklaması...`}
                value={creativeTypes[key]?.description || ''}
                onChange={(e) => handleDescriptionChange(key, e.target.value)}
                size="small"
                sx={{
                  ml: 4,
                  mt: 0.5,
                  mb: 1,
                  ...inputStyles,
                }}
              />
            )}
          </Box>
        ))}
      </Box>
      {error && (
        <Typography variant="caption" color="error" sx={{ mt: 1 }}>
          {error.message}
        </Typography>
      )}
    </FormControl>
  );
};

export const CreativeRequestEdit = () => {
  const redirect = useRedirect();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { buildUrl } = useBrand();
  const isDealer = location.pathname.includes('/dealer/');
  const smartGoBack = useSmartBack({ fallbackResource: 'creatives/requests' });

  const handleGoBack = () => {
    if (isDealer) {
      navigate(buildUrl(`/dealer/creative-requests/${id}`));
    } else {
      smartGoBack();
    }
  };

  return (
    <Edit
      resource="creatives/requests"
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
            Kreatif Talebi Düzenle
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

            {/* Talep Detayları */}
            <SectionTitle>Talep Detayları</SectionTitle>
            
            <TextInput 
              source="creative_work_request" 
              label="Kreatif Çalışma İsteği" 
              multiline 
              rows={2} 
              fullWidth 
              validate={required()}
              sx={inputStyles}
            />
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr' }, gap: 2, mb: 1 }}>
              <TextInput 
                source="work_details" 
                label="Çalışma Detayları" 
                multiline 
                rows={3} 
                fullWidth 
                validate={required()}
                sx={inputStyles}
              />
              <NumberInput 
                source="quantity_request" 
                label="Adet Talebi" 
                validate={required()}
                fullWidth
                sx={inputStyles}
              />
            </Box>
            
            <TextInput 
              source="intended_message" 
              label="Verilmek İstenen Mesaj" 
              multiline 
              rows={2} 
              fullWidth
              sx={inputStyles}
            />
            
            <TextInput 
              source="legal_text" 
              label="Legal Metin" 
              multiline 
              rows={2} 
              fullWidth
              sx={inputStyles}
            />

            <Divider sx={{ my: 3, borderColor: '#eee' }} />

            {/* Boyut ve Kreatif Türleri */}
            <SectionTitle>Boyut ve Kreatif Türleri</SectionTitle>
            
            <ArrayInput source="sizes" label="">
              <SimpleFormIterator 
                inline 
                disableReordering
                sx={{
                  '& .RaSimpleFormIterator-line': {
                    borderBottom: 'none',
                    pb: 0,
                    mb: 1,
                  },
                }}
              >
                <TextInput source="size" label="Boyut/Ölçü" sx={inputStyles} />
                <NumberInput source="quantity" label="Adet" sx={inputStyles} />
              </SimpleFormIterator>
            </ArrayInput>
            
            <Typography sx={{ fontSize: 14, fontWeight: 500, color: '#666', mt: 2, mb: 1 }}>
              İstenilen Kreatif
            </Typography>
            <CreativeTypesInput />

            <Divider sx={{ my: 3, borderColor: '#eee' }} />

            {/* Deadline */}
            <SectionTitle>Tarih</SectionTitle>
            
            <DateInput 
              source="deadline" 
              label="Deadline" 
              validate={required()}
              sx={{ ...inputStyles, maxWidth: 300 }}
            />

            {/* Dikkat Edilecek Hususlar */}
            <Box sx={{ mt: 3 }}>
              <Alert
                icon={<WarningAmberIcon />}
                severity="warning"
                sx={{
                  backgroundColor: '#fffbeb',
                  color: '#92400e',
                  border: '1px solid #fde68a',
                  fontSize: 13,
                  '& .MuiAlert-icon': {
                    color: '#f59e0b',
                  },
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, fontSize: 13 }}>
                  Dikkat:
                </Typography>
                <Typography variant="body2" sx={{ fontSize: 12, lineHeight: 1.5 }}>
                  Görsel taleplerinin iletişim yapılacağı tarihten 15 gün önce yapılması gerekmektedir.
                </Typography>
              </Alert>
            </Box>
          </SimpleForm>
        </Paper>
      </Box>
    </Edit>
  );
};
