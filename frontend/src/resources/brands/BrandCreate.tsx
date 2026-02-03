import {
  Create,
  SimpleForm,
  TextInput,
  BooleanInput,
  Toolbar,
  SaveButton,
  useRedirect,
  useNotify,
} from 'react-admin';
import { Box, Button } from '@mui/material';

import {
  FormContainer,
  FormCard,
  FormHeader,
  Section,
  Field,
  TextInputField,
  inputStyles,
  formToolbarStyles,
  cancelButtonStyles,
  saveButtonStyles,
} from '../../components/FormFields';
import { requiredValidator } from '../../utils/validation';

// Custom Toolbar
const BrandFormToolbar = ({ onCancel }: { onCancel: () => void }) => (
  <Toolbar sx={formToolbarStyles}>
    <Button onClick={onCancel} sx={cancelButtonStyles}>
      Vazgeç
    </Button>
    <SaveButton label="Marka Oluştur" sx={saveButtonStyles} />
  </Toolbar>
);

export const BrandCreate = () => {
  const redirect = useRedirect();
  const notify = useNotify();

  const handleBack = () => redirect('list', 'brands');

  const onSuccess = () => {
    notify('Marka oluşturuldu', { type: 'success' });
    redirect('list', 'brands');
  };

  const onError = (error: any) => {
    const msg = error?.body
      ? Object.values(error.body).flat().join(' ')
      : 'Hata oluştu';
    notify(msg, { type: 'error' });
  };

  return (
    <Create
      mutationOptions={{ onSuccess, onError }}
      actions={false}
      sx={{ '& .RaCreate-main': { mt: 0 } }}
    >
      <FormContainer maxWidth={600}>
        <FormHeader
          title="Yeni Marka"
          subtitle="Sisteme yeni marka ekleyin"
          onBack={handleBack}
        />

        <FormCard>
          <SimpleForm
            toolbar={<BrandFormToolbar onCancel={handleBack} />}
            defaultValues={{ is_active: true }}
            sx={{ p: 0 }}
          >
            <Section title="Marka Bilgileri" first />

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 3 }}>
              <TextInputField
                source="code"
                label="Marka Kodu"
                required
                validate={[requiredValidator()]}
                hint="Örn: FORD, TOFAS"
              />
              <TextInputField
                source="name"
                label="Marka Adı"
                required
                validate={[requiredValidator()]}
              />
            </Box>

            <Field label="Durum">
              <BooleanInput source="is_active" label="Aktif" />
            </Field>

            <Section title="Reklam Hesabı" />

            <TextInputField
              source="fb_ad_account_id"
              label="Facebook Reklam Hesabı ID"
              hint="Örn: act_123456789"
            />
          </SimpleForm>
        </FormCard>
      </FormContainer>
    </Create>
  );
};
