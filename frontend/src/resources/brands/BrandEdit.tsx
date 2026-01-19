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

import {
  FormContainer,
  FormCard,
  Section,
  Field,
  TextInputField,
  formToolbarStyles,
  cancelButtonStyles,
  saveButtonStyles,
} from '../../components/FormFields';
import { requiredValidator } from '../../utils/validation';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Typography } from '@mui/material';

// Custom Toolbar
const BrandFormToolbar = ({ onCancel }: { onCancel: () => void }) => (
  <Toolbar sx={formToolbarStyles}>
    <Button onClick={onCancel} sx={cancelButtonStyles}>
      Vazgeç
    </Button>
    <SaveButton label="Güncelle" sx={saveButtonStyles} />
  </Toolbar>
);

// Custom Header with dealer count
const BrandHeader = () => {
  const record = useRecordContext();
  const redirect = useRedirect();

  return (
    <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
      <Button
        onClick={() => redirect('list', 'brands')}
        sx={{
          minWidth: 40,
          height: 40,
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          color: '#6b7280',
          '&:hover': {
            backgroundColor: '#f3f4f6',
            borderColor: '#d1d5db',
          },
        }}
      >
        <ArrowBackIcon sx={{ fontSize: 20 }} />
      </Button>
      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827', fontSize: 24 }}>
            {record?.name || 'Marka Düzenle'}
          </Typography>
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
        </Box>
        <Typography variant="body2" sx={{ color: '#6b7280', mt: 0.5 }}>
          Marka bilgilerini güncelleyin
        </Typography>
      </Box>
    </Box>
  );
};

export const BrandEdit = () => {
  const redirect = useRedirect();
  const notify = useNotify();

  const handleBack = () => redirect('list', 'brands');

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
      sx={{ '& .RaEdit-main': { mt: 0 } }}
    >
      <FormContainer maxWidth={600}>
        <BrandHeader />

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
