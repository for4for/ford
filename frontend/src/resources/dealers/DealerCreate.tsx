import {
  Create,
  SimpleForm,
  ArrayInput,
  SimpleFormIterator,
  BooleanInput,
  Toolbar,
  SaveButton,
  useRedirect,
  useNotify,
} from 'react-admin';
import { Box, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

import {
  FormContainer,
  FormCard,
  FormHeader,
  Section,
  Field,
  TextInputField,
  SelectInputField,
  PhoneInputField,
  inputStyles,
  formToolbarStyles,
  cancelButtonStyles,
  saveButtonStyles,
} from '../../components/FormFields';
import { requiredValidator, emailValidator } from '../../utils/validation';

// Custom Toolbar
const DealerFormToolbar = ({ onCancel }: { onCancel: () => void }) => (
  <Toolbar sx={formToolbarStyles}>
    <Button onClick={onCancel} sx={cancelButtonStyles}>
      Vazgeç
      </Button>
    <SaveButton label="Kaydet" sx={saveButtonStyles} />
  </Toolbar>
);

// Email Ekle Butonu
const AddEmailButton = () => (
  <Button
    size="small"
    startIcon={<AddIcon sx={{ fontSize: 16 }} />}
    sx={{
      color: '#6b7280',
      textTransform: 'none',
      fontSize: 13,
      mt: 1,
      '&:hover': { bgcolor: '#f3f4f6' },
    }}
  >
    E-posta Ekle
  </Button>
);

export const DealerCreate = () => {
  const redirect = useRedirect();
  const notify = useNotify();

  const onSuccess = () => {
    notify('Bayi oluşturuldu', { type: 'success' });
    redirect('list', 'dealers');
  };

  const onError = (error: any) => {
    const msg = error?.body
      ? Object.values(error.body).flat().join(' ')
      : 'Hata oluştu';
    notify(msg, { type: 'error' });
  };

  const handleBack = () => redirect('list', 'dealers');

  return (
    <Create
      mutationOptions={{ onSuccess, onError }}
      actions={false}
      sx={{ '& .RaCreate-main': { mt: 0 } }}
    >
      <FormContainer maxWidth={700}>
        <FormHeader
          title="Yeni Bayi"
          subtitle="Sisteme yeni bayi ekleyin"
          onBack={handleBack}
        />

        <FormCard>
    <SimpleForm
            toolbar={<DealerFormToolbar onCancel={handleBack} />}
            defaultValues={{
              status: 'aktif',
              dealer_type: 'yetkili',
      }}
            sx={{ p: 0 }}
    >
          {/* Temel Bilgiler */}
            <Section title="Temel Bilgiler" first />
          
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
              <TextInputField
                source="dealer_code"
                label="Bayi Kodu"
                required
                validate={[requiredValidator()]}
              />
              <SelectInputField
                source="status"
                label="Durum"
                required
                choices={[
                  { id: 'aktif', name: 'Aktif' },
                  { id: 'pasif', name: 'Onay Bekliyor' },
                  { id: 'askida', name: 'Askıda' },
                ]}
                validate={[requiredValidator()]}
              />
          </Box>
          
            <TextInputField
                source="dealer_name"
                label="Bayi Ünvanı"
              required
              validate={[requiredValidator()]}
              />
          
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
              <SelectInputField
                source="dealer_type"
                label="Bayi Tipi"
                required
                choices={[
                  { id: 'yetkili', name: 'Yetkili Bayi' },
                  { id: 'anlasmali', name: 'Anlaşmalı Bayi' },
                  { id: 'satis', name: 'Satış Bayisi' },
                ]}
                validate={[requiredValidator()]}
              />
              <TextInputField
                source="tax_number"
                label="Vergi Numarası"
                hint="Opsiyonel"
              />
          </Box>

            {/* Adres */}
            <Section title="Adres" />
          
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
              <TextInputField
                source="city"
                label="İl"
                required
                validate={[requiredValidator()]}
              />
              <TextInputField
                source="district"
                label="İlçe"
                required
                validate={[requiredValidator()]}
              />
          </Box>
          
            <Box sx={{ gridColumn: 'span 2' }}>
              <TextInputField
                source="address"
                label="Adres"
                required
                validate={[requiredValidator()]}
                multiline
                rows={3}
              />
            </Box>

            <TextInputField
            source="region"
            label="Bölge"
              hint="Opsiyonel"
          />

            {/* İletişim */}
            <Section title="İletişim" />
          
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
              <TextInputField
                source="email"
                label="E-posta"
                type="email"
                required
                validate={[requiredValidator(), emailValidator()]}
            />
              <PhoneInputField
              source="phone"
              label="Telefon"
                required
              />
          </Box>
          
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 3 }}>
              <TextInputField
                source="contact_first_name"
                label="Sorumlu Adı"
                required
                validate={[requiredValidator()]}
              />
              <TextInputField
                source="contact_last_name"
                label="Sorumlu Soyadı"
                required
                validate={[requiredValidator()]}
              />
              <TextInputField
                source="regional_manager"
                label="Bölge Müdürü"
                required
                validate={[requiredValidator()]}
              />
          </Box>
          
            {/* Ek E-postalar */}
            <Field label="Ek E-postalar" hint="Opsiyonel">
            <ArrayInput source="additional_emails" label="">
                <SimpleFormIterator
                  inline
                disableReordering
                  addButton={<AddEmailButton />}
                  sx={{
                    '& .RaSimpleFormIterator-line': {
                    borderBottom: 'none',
                    pb: 0,
                      mb: 1,
                    },
                  '& .RaSimpleFormIterator-action': {
                    visibility: 'visible',
                  },
                }}
                >
                  <TextInputField
                    source=""
                    label="E-posta"
                    type="email"
                    validate={[emailValidator()]}
                  />
                </SimpleFormIterator>
              </ArrayInput>
            </Field>
    </SimpleForm>
        </FormCard>
      </FormContainer>
  </Create>
);
};
