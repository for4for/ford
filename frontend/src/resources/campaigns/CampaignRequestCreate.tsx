import { useState } from 'react';
import {
  Create,
  SimpleForm,
  TextInput,
  NumberInput,
  DateInput,
  ReferenceInput,
  SelectInput,
  required,
  Toolbar,
  SaveButton,
  useRedirect,
  useNotify,
} from 'react-admin';
import {
  Box,
  Typography,
  Button,
  Checkbox,
  Radio,
  Alert,
  InputAdornment,
} from '@mui/material';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';

import {
  FormContainer,
  FormCard,
  FormHeader,
  Section,
  Field,
  inputStyles,
  formToolbarStyles,
  cancelButtonStyles,
  saveButtonStyles,
} from '../../components/FormFields';

// Feature flag: Kampanya Türü Seçimi (Link vs Görsel Yükleme)
const ENABLE_CAMPAIGN_TYPE_SELECTION = false;

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
      py: 1.5,
      borderRadius: '8px',
      border: `1px solid ${checked ? '#1a1a2e' : '#e5e7eb'}`,
      backgroundColor: checked ? '#f8f9fa' : '#fff',
      cursor: 'pointer',
      transition: 'all 0.15s ease',
      '&:hover': {
        borderColor: checked ? '#1a1a2e' : '#d1d5db',
        backgroundColor: '#f9fafb',
      },
    }}
  >
    <Checkbox
      checked={checked}
      size="small"
      sx={{ 
        p: 0,
        color: '#d1d5db',
        '&.Mui-checked': { color: '#1a1a2e' },
      }}
    />
    {icon}
    <Typography sx={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>
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
      border: `1px solid ${selected ? '#1a1a2e' : '#e5e7eb'}`,
      borderRadius: '8px',
      p: 2,
      cursor: 'pointer',
      backgroundColor: selected ? '#f8f9fa' : '#fff',
      transition: 'all 0.15s ease',
      '&:hover': {
        borderColor: selected ? '#1a1a2e' : '#d1d5db',
        backgroundColor: '#f9fafb',
      },
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
      <Radio
        checked={selected}
        size="small"
        sx={{ 
          p: 0, 
          mt: 0.25,
          color: '#d1d5db',
          '&.Mui-checked': { color: '#1a1a2e' },
        }}
      />
      <Box>
        <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>
          {title}
        </Typography>
        <Typography sx={{ fontSize: 12, color: '#6b7280', mt: 0.25 }}>
          {description}
        </Typography>
      </Box>
    </Box>
  </Box>
);

// Senaryo seçim kutusu stilleri
const scenarioOptionStyles = (selected: boolean) => ({
  border: `1px solid ${selected ? '#1a1a2e' : '#e5e7eb'}`,
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '12px',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  backgroundColor: selected ? '#f8f9fa' : '#fff',
  '&:hover': {
    borderColor: selected ? '#1a1a2e' : '#d1d5db',
    backgroundColor: '#f9fafb',
  },
});

// Custom Toolbar
const CampaignFormToolbar = ({ onCancel }: { onCancel: () => void }) => (
  <Toolbar sx={formToolbarStyles}>
    <Button onClick={onCancel} sx={cancelButtonStyles}>
      Vazgeç
    </Button>
    <SaveButton label="Kampanya Oluştur" sx={saveButtonStyles} />
  </Toolbar>
);

export const CampaignRequestCreate = () => {
  const redirect = useRedirect();
  const notify = useNotify();
  
  // State for conditional form fields
  const [campaignType, setCampaignType] = useState<'link' | 'upload'>('link');
  const [platforms, setPlatforms] = useState<string[]>(['instagram', 'facebook']);
  const [adModel, setAdModel] = useState<'bayi_sayfasi' | 'form_yonlendirme' | 'leasing'>('form_yonlendirme');
  const [showBudgetWarning, setShowBudgetWarning] = useState(false);

  const handlePlatformChange = (platform: string, checked: boolean) => {
    if (checked) {
      setPlatforms([...platforms, platform]);
    } else {
      setPlatforms(platforms.filter(p => p !== platform));
    }
  };

  const backUrl = '/backoffice/campaigns/requests';
  const handleBack = () => redirect(backUrl);

  // Form validasyonu
  const validateForm = (values: any) => {
    const errors: any = {};
    if (values.start_date && values.end_date && values.end_date < values.start_date) {
      errors.end_date = 'Bitiş tarihi, başlangıç tarihinden önce olamaz';
    }
    return errors;
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

  const onSuccess = () => {
    notify('Kampanya talebi oluşturuldu', { type: 'success' });
    redirect(backUrl);
  };

  const onError = (error: any) => {
    const msg = error?.body
      ? Object.values(error.body).flat().join(' ')
      : 'Hata oluştu';
    notify(msg, { type: 'error' });
  };

  return (
    <Create
      transform={transform}
      mutationOptions={{ onSuccess, onError }}
      actions={false}
      sx={{ '& .RaCreate-main': { mt: 0 } }}
    >
      <FormContainer maxWidth={700}>
        <FormHeader
          title="Yeni Kampanya Talebi"
          subtitle="Dijital reklam kampanyası oluşturun"
          onBack={handleBack}
        />

        <FormCard>
          <SimpleForm
            toolbar={<CampaignFormToolbar onCancel={handleBack} />}
            validate={validateForm}
            sx={{ p: 0 }}
          >
            {/* Bayi Seçimi */}
            <Section title="Bayi Bilgisi" first />
            
            <Field label="Bayi" required>
              <ReferenceInput source="dealer" reference="dealers">
                <SelectInput 
                  optionText="dealer_name" 
                  label=""
                  validate={required()} 
                  fullWidth
                  sx={inputStyles}
                />
              </ReferenceInput>
            </Field>

            {/* Kampanya Bilgileri */}
            <Section title="Kampanya Bilgileri" />
            
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
              <Field label="Kampanya Adı" required>
                <TextInput
                  source="campaign_name"
                  label=""
                  placeholder="Örn: Bahar Kampanyası"
                  validate={required()}
                  fullWidth
                  sx={inputStyles}
                />
              </Field>
              
              <Field label="Bütçe" required>
                <NumberInput
                  source="budget"
                  label=""
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
              </Field>
            </Box>
            
            {showBudgetWarning && (
              <Alert 
                severity="warning" 
                sx={{ 
                  mb: 2,
                  '& .MuiAlert-message': { fontSize: 13 }
                }}
              >
                Yüksek bütçe uyarısı: 50.000₺ üzeri bütçe girdiniz.
              </Alert>
            )}
            
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
              <Field label="Başlangıç Tarihi" required>
                <DateInput
                  source="start_date"
                  label=""
                  validate={required()}
                  fullWidth
                  sx={inputStyles}
                />
              </Field>
              <Field label="Bitiş Tarihi" required>
                <DateInput
                  source="end_date"
                  label=""
                  validate={required()}
                  fullWidth
                  sx={inputStyles}
                />
              </Field>
            </Box>

            {/* Platform Seçimi */}
            <Section title="Platform Seçimi" />
            
            <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
              <PlatformCheckbox
                checked={platforms.includes('instagram')}
                onChange={(checked) => handlePlatformChange('instagram', checked)}
                icon={<InstagramIcon sx={{ fontSize: 20, color: '#E4405F' }} />}
                label="Instagram"
              />
              <PlatformCheckbox
                checked={platforms.includes('facebook')}
                onChange={(checked) => handlePlatformChange('facebook', checked)}
                icon={<FacebookIcon sx={{ fontSize: 20, color: '#1877F2' }} />}
                label="Facebook"
              />
            </Box>

            {/* Reklam Modeli */}
            <Section title="Reklam Modeli" />
            
            <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
              <AdModelOption
                selected={adModel === 'form_yonlendirme'}
                title="Form Yönlendirme"
                description="Lead toplama odaklı"
                onChange={() => setAdModel('form_yonlendirme')}
              />
              <AdModelOption
                selected={adModel === 'leasing'}
                title="Leasing"
                description="Leasing kampanyaları"
                onChange={() => setAdModel('leasing')}
              />
            </Box>

            {/* Kampanya Türü - Feature Flag */}
            {ENABLE_CAMPAIGN_TYPE_SELECTION && (
              <>
                <Section title="Kampanya Türü" />
                
                <Box 
                  sx={scenarioOptionStyles(campaignType === 'link')}
                  onClick={() => setCampaignType('link')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <Radio 
                      checked={campaignType === 'link'} 
                      size="small"
                      sx={{ p: 0, mt: 0.25, color: '#d1d5db', '&.Mui-checked': { color: '#1a1a2e' } }}
                    />
                    <Box>
                      <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>
                        Link ile kampanya
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: '#6b7280' }}>
                        Facebook/Instagram post linkini paylaşın
                      </Typography>
                    </Box>
                  </Box>
                  
                  {campaignType === 'link' && (
                    <Box sx={{ mt: 2, ml: 4 }}>
                      <Field label="Facebook Post Linki">
                        <TextInput
                          source="fb_post_link"
                          label=""
                          placeholder="https://facebook.com/..."
                          fullWidth
                          sx={inputStyles}
                        />
                      </Field>
                      <Field label="Instagram Post Linki">
                        <TextInput
                          source="ig_post_link"
                          label=""
                          placeholder="https://instagram.com/..."
                          fullWidth
                          sx={inputStyles}
                        />
                      </Field>
                    </Box>
                  )}
                </Box>

                <Box 
                  sx={scenarioOptionStyles(campaignType === 'upload')}
                  onClick={() => setCampaignType('upload')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <Radio 
                      checked={campaignType === 'upload'} 
                      size="small"
                      sx={{ p: 0, mt: 0.25, color: '#d1d5db', '&.Mui-checked': { color: '#1a1a2e' } }}
                    />
                    <Box>
                      <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>
                        Görsel yükle
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: '#6b7280' }}>
                        Kendi görsellerinizi yükleyin
                      </Typography>
                    </Box>
                  </Box>
                  
                  {campaignType === 'upload' && (
                    <Box sx={{ mt: 2, ml: 4 }}>
                      <Box
                        sx={{
                          border: '2px dashed #e5e7eb',
                          borderRadius: '8px',
                          p: 3,
                          textAlign: 'center',
                          backgroundColor: '#f9fafb',
                          mb: 2,
                        }}
                      >
                        <Typography sx={{ fontSize: 13, color: '#6b7280' }}>
                          Post görseli yükle
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          border: '2px dashed #e5e7eb',
                          borderRadius: '8px',
                          p: 3,
                          textAlign: 'center',
                          backgroundColor: '#f9fafb',
                        }}
                      >
                        <Typography sx={{ fontSize: 13, color: '#6b7280' }}>
                          Story görseli yükle
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
              </>
            )}

            {/* Not Alanı */}
            <Section title="Notlar" />
            
            <Field label="Kampanya Notları" hint="Opsiyonel">
              <TextInput
                source="notes"
                label=""
                placeholder="Ek bilgiler..."
                multiline
                rows={3}
                fullWidth
                sx={inputStyles}
              />
            </Field>
          </SimpleForm>
        </FormCard>
      </FormContainer>
    </Create>
  );
};
