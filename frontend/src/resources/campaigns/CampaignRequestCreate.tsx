import {
  Create,
  SimpleForm,
  TextInput,
  NumberInput,
  DateInput,
  ReferenceInput,
  SelectInput,
  required,
  SaveButton,
  useRedirect,
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
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import { useState } from 'react';

// Feature flag: Kampanya Türü Seçimi (Link vs Görsel Yükleme)
// Ford için true, Tofaş için false
const ENABLE_CAMPAIGN_TYPE_SELECTION = false;

// Toolbar kaldırıldı - butonlar form içinde manuel eklendi

// Section Title - kompakt
const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <Typography
    sx={{
      fontSize: 11,
      fontWeight: 600,
      color: '#9ca3af',
      textTransform: 'uppercase',
      letterSpacing: '0.8px',
      mb: 1.5,
    }}
  >
    {children}
  </Typography>
);

// Form input ortak stilleri - kompakt
const inputStyles = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#fff',
    fontSize: 14,
    '& fieldset': {
      borderColor: '#e5e7eb',
    },
    '&:hover fieldset': {
      borderColor: '#d1d5db',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#6b7280',
      borderWidth: 1,
    },
  },
  '& .MuiInputLabel-root': {
    fontSize: 14,
    color: '#6b7280',
    '&.Mui-focused': {
      color: '#374151',
    },
  },
  '& .MuiFormHelperText-root': {
    marginLeft: 0,
    fontSize: 11,
    color: '#9ca3af',
  },
  marginBottom: '12px',
};

// Kompakt input stilleri (grid içinde)
const compactInputStyles = {
  ...inputStyles,
  marginBottom: 0,
};

// Senaryo seçim kutusu stilleri
const scenarioOptionStyles = (selected: boolean) => ({
  border: `1.5px solid ${selected ? '#374151' : '#e5e7eb'}`,
  borderRadius: '8px',
  padding: '12px 14px',
  marginBottom: '10px',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  backgroundColor: selected ? '#f9fafb' : '#fff',
  '&:hover': {
    borderColor: selected ? '#374151' : '#d1d5db',
    backgroundColor: selected ? '#f9fafb' : '#fafafa',
  },
});

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

export const CampaignRequestCreate = () => {
  const redirect = useRedirect();
  
  // State for conditional form fields
  const [campaignType, setCampaignType] = useState<'link' | 'upload'>('link');
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

  // Transform data before save
  const transform = (data: any) => ({
    ...data,
    platforms,
    campaign_type: campaignType,
    ad_model: adModel,
    fb_post_link: campaignType === 'link' ? data.fb_post_link : null,
    ig_post_link: campaignType === 'link' ? data.ig_post_link : null,
    post_images: campaignType === 'upload' ? data.post_images || [] : [],
    story_images: campaignType === 'upload' ? data.story_images || [] : [],
  });

  return (
    <Create
      transform={transform}
      sx={{
        marginTop: 2,
        '& .RaCreate-main': {
          marginTop: 0,
        },
      }}
    >
      <Box sx={{ maxWidth: 560, margin: '0 auto', px: 2, py: 2 }}>
        {/* Header */}
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <ArrowBackIcon 
            onClick={() => redirect('list', 'campaigns/requests')}
            sx={{ 
              fontSize: 20, 
              color: '#6b7280', 
              cursor: 'pointer',
              '&:hover': { color: '#374151' },
            }} 
          />
          <Typography
            sx={{
              fontWeight: 600,
              color: '#1f2937',
              fontSize: 18,
            }}
          >
            Kampanya Oluştur
          </Typography>
        </Box>

        <Paper 
          elevation={0} 
          sx={{ 
            border: '1px solid #e5e7eb',
            borderRadius: '10px',
            p: 2.5,
            backgroundColor: '#fff',
          }}
        >
          <SimpleForm
            toolbar={false}
            sx={{
              padding: 0,
              '& .RaSimpleForm-content': {
                padding: 0,
              },
            }}
          >
            {/* Bayi Seçimi */}
            <SectionTitle>Bayi</SectionTitle>
            
            <ReferenceInput source="dealer" reference="dealers">
              <SelectInput 
                optionText="dealer_name" 
                label="Bayi Seçin"
                validate={required()} 
                fullWidth
                sx={inputStyles}
              />
            </ReferenceInput>

            {/* Kampanya Bilgileri */}
            <SectionTitle>Kampanya Bilgileri</SectionTitle>
            
            <TextInput
              source="campaign_name"
              label="Kampanya Adı"
              placeholder="Örn: Bahar Kampanyası"
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
            
            <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
              <DateInput
                source="start_date"
                label="Başlangıç"
                validate={required()}
                fullWidth
                sx={{ ...compactInputStyles, flex: 1 }}
              />
              <DateInput
                source="end_date"
                label="Bitiş"
                validate={required()}
                fullWidth
                sx={{ ...compactInputStyles, flex: 1 }}
              />
            </Box>

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

            {/* 
              =====================================================
              KAMPANYA TÜRÜ SEÇİMİ - FORD İÇİN AKTİF EDİLECEK
              =====================================================
            */}
            {ENABLE_CAMPAIGN_TYPE_SELECTION && (
              <>
                <SectionTitle>Kampanya Türü</SectionTitle>
                
                <Box 
                  sx={scenarioOptionStyles(campaignType === 'link')}
                  onClick={() => setCampaignType('link')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <Radio 
                      checked={campaignType === 'link'} 
                      size="small"
                      sx={{ p: 0, mt: 0.3, color: '#d1d5db', '&.Mui-checked': { color: '#374151' } }}
                    />
                    <Box>
                      <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
                        Link ile kampanya
                      </Typography>
                      <Typography sx={{ fontSize: 11, color: '#9ca3af' }}>
                        Facebook/Instagram post linkini paylaşın
                      </Typography>
                    </Box>
                  </Box>
                  
                  {campaignType === 'link' && (
                    <Box sx={{ mt: 1.5, ml: 3 }}>
                      <TextInput
                        source="fb_post_link"
                        label="Facebook Post Linki"
                        placeholder="https://facebook.com/..."
                        fullWidth
                        sx={inputStyles}
                      />
                      <TextInput
                        source="ig_post_link"
                        label="Instagram Post Linki"
                        placeholder="https://instagram.com/..."
                        fullWidth
                        sx={{ ...inputStyles, mb: 0 }}
                      />
                    </Box>
                  )}
                </Box>

                <Box 
                  sx={scenarioOptionStyles(campaignType === 'upload')}
                  onClick={() => setCampaignType('upload')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <Radio 
                      checked={campaignType === 'upload'} 
                      size="small"
                      sx={{ p: 0, mt: 0.3, color: '#d1d5db', '&.Mui-checked': { color: '#374151' } }}
                    />
                    <Box>
                      <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
                        Görsel yükle
                      </Typography>
                      <Typography sx={{ fontSize: 11, color: '#9ca3af' }}>
                        Kendi görsellerinizi yükleyin
                      </Typography>
                    </Box>
                  </Box>
                  
                  {campaignType === 'upload' && (
                    <Box sx={{ mt: 1.5, ml: 3 }}>
                      <Box
                        sx={{
                          border: '1.5px dashed #d1d5db',
                          borderRadius: '6px',
                          p: 2,
                          textAlign: 'center',
                          backgroundColor: '#fafafa',
                          mb: 1,
                        }}
                      >
                        <Typography sx={{ fontSize: 12, color: '#6b7280' }}>
                          Post görseli yükle
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          border: '1.5px dashed #d1d5db',
                          borderRadius: '6px',
                          p: 2,
                          textAlign: 'center',
                          backgroundColor: '#fafafa',
                        }}
                      >
                        <Typography sx={{ fontSize: 12, color: '#6b7280' }}>
                          Story görseli yükle
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
              </>
            )}

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
              defaultValue="satis"
              fullWidth
              sx={inputStyles}
            />

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

            {/* Not Alanı */}
            <SectionTitle>Notlar (Opsiyonel)</SectionTitle>
            
            <TextInput
              source="notes"
              label="Kampanya Notları"
              placeholder="Ek bilgiler..."
              multiline
              rows={2}
              fullWidth
              sx={{ ...inputStyles, mb: 0 }}
            />

            {/* Butonlar */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                mt: 3,
                pt: 2,
                borderTop: '1px solid #e5e7eb',
              }}
            >
              <Button
                onClick={() => redirect('list', 'campaigns/requests')}
                variant="outlined"
                sx={{
                  color: '#6b7280',
                  borderColor: '#d1d5db',
                  textTransform: 'none',
                  fontWeight: 500,
                  px: 3,
                  py: 1,
                  '&:hover': { 
                    bgcolor: '#f9fafb',
                    borderColor: '#9ca3af',
                  },
                }}
              >
                İptal
              </Button>
              <SaveButton
                label="Kampanya Oluştur"
                variant="contained"
                icon={<></>}
                sx={{
                  backgroundColor: '#1a1a2e',
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 4,
                  py: 1,
                  boxShadow: 'none',
                  '&:hover': {
                    backgroundColor: '#2d2d44',
                    boxShadow: 'none',
                  },
                }}
              />
            </Box>
          </SimpleForm>
        </Paper>
      </Box>
    </Create>
  );
};

