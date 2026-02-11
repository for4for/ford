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
  useRecordContext,
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
  Button,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useState, useEffect } from 'react';
import { FileUploadSection } from '../../components/FileUploadSection';

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

const CreativeFormToolbar = ({ onCancel }: { onCancel: () => void }) => (
  <Toolbar sx={formToolbarStyles}>
    <Button onClick={onCancel} sx={cancelButtonStyles}>
      Vazgeç
    </Button>
    <SaveButton label="Kaydet" sx={saveButtonStyles} />
  </Toolbar>
);

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

// Referans dosyalar upload wrapper (SimpleForm içinde record context kullanır)
const ReferenceFilesSection = () => {
  const record = useRecordContext();
  if (!record) return null;

  return (
    <Box sx={{ mt: 2, width: '100%' }}>
      <FileUploadSection
        files={record.reference_files || []}
        uploadUrl={`/creatives/requests/${record.id}/upload_file/`}
        deleteUrl={`/creatives/requests/${record.id}/delete_file/`}
        helperText="JPEG, PNG, GIF, WebP veya MP4 (max 50MB)"
        extraFormData={{ file_type: 'reference' }}
        title="Referans Görseller"
      />
    </Box>
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
      component="div"
      sx={{
        '& .RaEdit-main': {
          marginTop: 0,
        },
      }}
    >
      <FormContainer maxWidth={800}>
        <FormHeader
          title="Kreatif Talebi Düzenle"
          subtitle="Kreatif talebini güncelleyin"
          onBack={handleGoBack}
        />

        <FormCard>
          <SimpleForm
            toolbar={<CreativeFormToolbar onCancel={handleGoBack} />}
            sx={{ p: 0 }}
          >
            {/* Genel Bilgiler */}
            <Section title="Genel Bilgiler" first />
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
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

            {/* Talep Detayları */}
            <Section title="Talep Detayları" />
            
            <Field label="Kreatif Çalışma İsteği" required>
              <TextInput 
                source="creative_work_request" 
                label="" 
                multiline 
                rows={2} 
                fullWidth 
                validate={required()}
                sx={inputStyles}
              />
            </Field>
            
            <Field label="Çalışma Detayları" required>
              <TextInput 
                source="work_details" 
                label="" 
                multiline 
                rows={3} 
                fullWidth 
                validate={required()}
                sx={inputStyles}
              />
            </Field>
            
            <Field label="Adet Talebi" required>
              <NumberInput 
                source="quantity_request" 
                label="" 
                validate={required()}
                fullWidth
                sx={{ ...inputStyles, maxWidth: 300 }}
              />
            </Field>
            
            <Field label="Verilmek İstenen Mesaj">
              <TextInput 
                source="intended_message" 
                label="" 
                multiline 
                rows={2} 
                fullWidth
                sx={inputStyles}
              />
            </Field>
            
            <Field label="Legal Metin">
              <TextInput 
                source="legal_text" 
                label="" 
                multiline 
                rows={2} 
                fullWidth
                sx={inputStyles}
              />
            </Field>

            {/* Boyut ve Kreatif Türleri */}
            <Section title="Boyut ve Kreatif Türleri" />
            
            <Field label="Boyutlar">
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
            </Field>
            
            <Field label="İstenilen Kreatif">
              <CreativeTypesInput />
            </Field>

            {/* Tarih */}
            <Section title="Tarih" />
            
            <Field label="Deadline" required>
              <DateInput 
                source="deadline" 
                label="" 
                validate={required()}
                sx={{ ...inputStyles, maxWidth: 300 }}
              />
            </Field>

            {/* Referans Görseller */}
            <Section title="Referans Görseller" />
            <ReferenceFilesSection />

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
        </FormCard>
      </FormContainer>
    </Edit>
  );
};
