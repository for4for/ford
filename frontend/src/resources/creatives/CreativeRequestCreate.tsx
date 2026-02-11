import {
  Create,
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
import { useState } from 'react';

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

const CreativeCreateToolbar = ({ onCancel }: { onCancel: () => void }) => (
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

  const [creativeTypes, setCreativeTypes] = useState<Record<string, { checked: boolean; description: string }>>(() => {
    const initialValue: Record<string, { checked: boolean; description: string }> = {};
    const fieldArray = Array.isArray(field.value) ? field.value : [];
    
    Object.keys(creativeTypeLabels).forEach((key) => {
      const existing = fieldArray.find((c: any) => c.creative_type === key);
      initialValue[key] = {
        checked: !!existing,
        description: existing?.description || '',
      };
    });
    return initialValue;
  });

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

export const CreativeRequestCreate = () => {
  const redirect = useRedirect();

  const handleGoBack = () => {
    redirect('list', 'creatives/requests');
  };

  return (
    <Create
      component="div"
      sx={{
        '& .RaCreate-main': {
          marginTop: 0,
        },
      }}
    >
      <FormContainer maxWidth={800}>
        <FormHeader
          title="Yeni Kreatif Talebi"
          subtitle="Yeni bir kreatif talebi oluşturun"
          onBack={handleGoBack}
        />

        <FormCard>
          <SimpleForm
            toolbar={<CreativeCreateToolbar onCancel={handleGoBack} />}
            sx={{ p: 0 }}
          >
            {/* Bayi Seçimi */}
            <Section title="Bayi" first />
            
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
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr' }, gap: 3 }}>
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
                  sx={inputStyles}
                />
              </Field>
            </Box>
            
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
    </Create>
  );
};
