import { useState } from 'react';
import {
  Edit,
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
  useUpdate,
  useNotify,
  useEditContext,
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
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import SaveIcon from '@mui/icons-material/Save';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useBrand } from '../../context/BrandContext';

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

// Feature flag
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

// Custom Toolbar for Admin/Moderator
const CampaignFormToolbar = ({ onCancel }: { onCancel: () => void }) => (
  <Toolbar sx={formToolbarStyles}>
    <Button onClick={onCancel} sx={cancelButtonStyles}>
      Vazgeç
    </Button>
    <SaveButton label="Kaydet" sx={saveButtonStyles} />
  </Toolbar>
);

// Form validasyonu
const validateForm = (values: any) => {
  const errors: any = {};
  if (values.start_date && values.end_date && values.end_date < values.start_date) {
    errors.end_date = 'Bitiş tarihi, başlangıç tarihinden önce olamaz';
  }
  return errors;
};

export const CampaignRequestEdit = () => {
  const redirect = useRedirect();
  const notify = useNotify();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { buildUrl } = useBrand();
  const isDealer = location.pathname.includes('/dealer/');
  
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

  const handleBack = () => {
    if (isDealer) {
      navigate(buildUrl('/dealer/requests'));
    } else {
      redirect('list', 'campaigns/requests');
    }
  };

  const transform = (data: any) => ({
    ...data,
    platforms: Array.isArray(data.platforms) ? data.platforms : 
               typeof data.platforms === 'string' ? JSON.parse(data.platforms) : 
               platforms,
    ad_model: adModel,
  });

  const onSuccess = () => {
    notify('Kampanya güncellendi', { type: 'success' });
    if (isDealer) {
      navigate(buildUrl('/dealer/requests'));
    } else {
      redirect('list', 'campaigns/requests');
    }
  };

  const onError = (error: any) => {
    const msg = error?.body
      ? Object.values(error.body).flat().join(' ')
      : 'Hata oluştu';
    notify(msg, { type: 'error' });
  };

  return (
    <Edit
      resource="campaigns/requests"
      id={id}
      transform={transform}
      mutationMode="pessimistic"
      mutationOptions={{ onSuccess, onError }}
      actions={false}
      sx={{ '& .RaEdit-main': { mt: 0 } }}
    >
      <FormContainer maxWidth={700}>
        <FormHeader
          title="Kampanya Düzenle"
          subtitle="Kampanya talebini güncelleyin"
          onBack={handleBack}
        />

        <FormCard>
          <SimpleForm
            toolbar={isDealer ? false : <CampaignFormToolbar onCancel={handleBack} />}
            validate={validateForm}
            sx={{ p: 0 }}
          >
            {/* Bayi ve Durum - Admin için */}
            {!isDealer && (
              <>
                <Section title="Genel Bilgiler" first />
                
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 3 }}>
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
                  <Field label="Marka">
                    <ReferenceInput source="brand" reference="brands">
                      <SelectInput 
                        optionText="name" 
                        label=""
                        fullWidth
                        sx={inputStyles}
                        emptyText="Marka seçin"
                      />
                    </ReferenceInput>
                  </Field>
                  <Field label="Durum" required>
                    <SelectInput 
                      source="status" 
                      label="" 
                      choices={statusChoices}
                      validate={required()}
                      fullWidth
                      sx={inputStyles}
                    />
                  </Field>
                </Box>
              </>
            )}

            {/* Kampanya Bilgileri */}
            <Section title="Kampanya Bilgileri" first={isDealer} />
            
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
              <Field label="Kampanya Adı" required>
                <TextInput
                  source="campaign_name"
                  label=""
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
                sx={{ mb: 2, '& .MuiAlert-message': { fontSize: 13 } }}
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

            {/* Hidden inputs for form state */}
            <input type="hidden" name="platforms" value={JSON.stringify(platforms)} />

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

            {/* Dealer için Taslak/İleri butonları */}
            {isDealer && <DealerFormButtons platforms={platforms} adModel={adModel} />}
          </SimpleForm>
        </FormCard>
      </FormContainer>
    </Edit>
  );
};

// Dealer Form Buttons Component
const DealerFormButtons = ({ platforms, adModel }: { platforms: string[]; adModel: string }) => {
  const { record } = useEditContext();
  const [update] = useUpdate();
  const notify = useNotify();
  const navigate = useNavigate();

  const handleSave = async (saveAsDraft: boolean) => {
    if (!record) return;

    const formElement = document.querySelector('form');
    if (!formElement) return;

    const formData = new FormData(formElement);
    const data: any = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });

    data.platforms = platforms;
    data.ad_model = adModel;
    data.status = saveAsDraft ? 'taslak' : 'onay_bekliyor';

    try {
      await update(
        'campaigns/requests',
        { id: record.id, data },
        {
          onSuccess: () => {
            notify(saveAsDraft ? 'Taslak kaydedildi' : 'Talep gönderildi', { type: 'success' });
            navigate(buildUrl('/dealer/requests'));
          },
          onError: (error: any) => {
            notify(error.message || 'Bir hata oluştu', { type: 'error' });
          },
        }
      );
    } catch (error) {
      notify('Bir hata oluştu', { type: 'error' });
    }
  };

  return (
    <>
      <Alert
        icon={<WarningAmberIcon sx={{ fontSize: 18 }} />}
        severity="warning"
        sx={{
          mt: 3,
          mb: 2,
          py: 1,
          bgcolor: '#fffbeb',
          border: '1px solid #fcd34d',
          '& .MuiAlert-icon': { color: '#d97706' },
        }}
      >
        <Typography sx={{ fontWeight: 600, fontSize: 12, mb: 0.5, color: '#92400e' }}>
          Dikkat:
        </Typography>
        <Typography sx={{ fontSize: 11, lineHeight: 1.5, color: '#78350f' }}>
          • Görsel taleplerinizi en az 15 gün önceden iletiniz.<br />
          • Detaylı bilgi: oyilma61@ford.com.tr
        </Typography>
      </Alert>

      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
        <Button
          variant="outlined"
          fullWidth
          startIcon={<SaveIcon sx={{ fontSize: 18 }} />}
          onClick={() => handleSave(true)}
          sx={{ 
            py: 1.5, 
            textTransform: 'none',
            borderColor: '#d1d5db',
            color: '#666',
            borderRadius: '8px',
            '&:hover': { borderColor: '#999', bgcolor: '#f9fafb' },
          }}
        >
          Taslak Kaydet
        </Button>
        <Button
          variant="contained"
          fullWidth
          onClick={() => handleSave(false)}
          sx={{
            py: 1.5,
            bgcolor: '#1a1a2e',
            textTransform: 'none',
            borderRadius: '8px',
            boxShadow: 'none',
            '&:hover': { bgcolor: '#2d2d44', boxShadow: 'none' },
          }}
        >
          Onaya Gönder
        </Button>
      </Box>
    </>
  );
};
