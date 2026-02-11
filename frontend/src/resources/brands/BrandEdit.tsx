import {
  Edit,
  SimpleForm,
  BooleanInput,
  Toolbar,
  SaveButton,
  useRedirect,
  useNotify,
  useRecordContext,
} from 'react-admin';
import { Box, Button, Chip } from '@mui/material';

import { useSmartBack } from '../../hooks/useSmartBack';

import {
  FormContainer,
  FormCard,
  FormHeader,
  Section,
  Field,
  TextInputField,
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
    <SaveButton label="Güncelle" sx={saveButtonStyles} />
  </Toolbar>
);

// Dynamic header wrapper - record'dan marka adını ve bayi sayısını alır
const BrandEditHeader = ({ onBack }: { onBack: () => void }) => {
  const record = useRecordContext();

  return (
    <FormHeader
      title={record?.name || 'Marka Düzenle'}
      subtitle="Marka bilgilerini güncelleyin"
      onBack={onBack}
    >
      {record?.dealer_count > 0 && (
        <Chip
          label={`${record.dealer_count} Bayi`}
          size="small"
          sx={{
            bgcolor: '#e0f2fe',
            color: '#0369a1',
            fontWeight: 500,
            fontSize: 12,
          }}
        />
      )}
    </FormHeader>
  );
};

export const BrandEdit = () => {
  const redirect = useRedirect();
  const notify = useNotify();

  const smartGoBack = useSmartBack({ fallbackResource: 'brands' });
  const handleBack = () => smartGoBack();

  const onSuccess = () => {
    notify('Marka güncellendi', { type: 'success' });
    redirect('list', 'brands');
  };

  const onError = (error: any) => {
    const msg = error?.body
      ? Object.values(error.body).flat().join(' ')
      : 'Hata oluştu';
    notify(msg, { type: 'error' });
  };

  return (
    <Edit
      mutationMode="pessimistic"
      mutationOptions={{ onSuccess, onError }}
      actions={false}
      component="div"
      sx={{ '& .RaEdit-main': { mt: 0 } }}
    >
      <FormContainer maxWidth={800}>
        <BrandEditHeader onBack={handleBack} />

        <FormCard>
          <SimpleForm
            toolbar={<BrandFormToolbar onCancel={handleBack} />}
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
    </Edit>
  );
};
