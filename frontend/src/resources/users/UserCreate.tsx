import {
  Create,
  SimpleForm,
  BooleanInput,
  ReferenceInput,
  AutocompleteInput,
  Toolbar,
  SaveButton,
  useRedirect,
  useNotify,
} from 'react-admin';
import { Box, Button } from '@mui/material';
import { useSmartBack } from '../../hooks/useSmartBack';

import {
  FormContainer,
  FormCard,
  FormHeader,
  Section,
  Field,
  PhoneInputField,
  PasswordInputField,
  TextInputField,
  SelectInputField,
  inputStyles,
  formToolbarStyles,
  cancelButtonStyles,
  saveButtonStyles,
} from '../../components/FormFields';
import { requiredValidator, emailValidator } from '../../utils/validation';

// Custom Toolbar
const UserFormToolbar = ({ onCancel }: { onCancel: () => void }) => (
  <Toolbar sx={formToolbarStyles}>
    <Button onClick={onCancel} sx={cancelButtonStyles}>
      Vazgeç
    </Button>
    <SaveButton label="Kaydet" sx={saveButtonStyles} />
  </Toolbar>
);

export const UserCreate = () => {
  const redirect = useRedirect();
  const notify = useNotify();

  const params = new URLSearchParams(window.location.search);
  const dealerId = params.get('dealer');

  const transform = (data: any) => {
    const { password_confirm, ...rest } = data;
    return { ...rest, username: data.email };
  };

  const onSuccess = () => {
    notify('Kullanıcı oluşturuldu', { type: 'success' });
    if (dealerId) {
      redirect('show', 'dealers', dealerId);
    } else {
      redirect('list', 'users');
    }
  };

  const onError = (error: any) => {
    const msg = error?.body
      ? Object.values(error.body).flat().join(' ')
      : 'Hata oluştu';
    notify(msg, { type: 'error' });
  };

  const smartGoBack = useSmartBack({ fallbackResource: 'users' });
  const handleBack = () => smartGoBack();

  return (
    <Create
      transform={transform}
      mutationOptions={{ onSuccess, onError }}
      actions={false}
      sx={{ '& .RaCreate-main': { mt: 0 } }}
    >
      <FormContainer>
        <FormHeader
          title="Yeni Kullanıcı"
          subtitle="Sisteme yeni kullanıcı ekleyin"
          onBack={handleBack}
        />

        <FormCard>
          <SimpleForm
            toolbar={<UserFormToolbar onCancel={handleBack} />}
            defaultValues={{
              dealer: dealerId ? parseInt(dealerId) : undefined,
              role: 'bayi',
              is_active: true,
            }}
            sx={{ p: 0 }}
          >
            {/* Hesap Bilgileri */}
            <Section title="Hesap Bilgileri" first />

            <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 3 }}>
              <TextInputField
                source="email"
                label="E-posta Adresi"
                required
                type="email"
                hint="Giriş için kullanılacak"
                validate={[requiredValidator(), emailValidator()]}
              />
              <SelectInputField
                source="role"
                label="Rol"
                required
                choices={[
                  { id: 'admin', name: 'Admin' },
                  { id: 'moderator', name: 'Moderatör' },
                  { id: 'bayi', name: 'Bayi' },
                  { id: 'creative_agency', name: 'Ajans' },
                ]}
                validate={[requiredValidator()]}
              />
            </Box>

            {/* Kişisel Bilgiler */}
            <Section title="Kişisel Bilgiler" />

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
              <TextInputField
                source="first_name"
                label="Ad"
                required
                validate={[requiredValidator('Ad zorunludur')]}
              />
              <TextInputField
                source="last_name"
                label="Soyad"
                required
                validate={[requiredValidator('Soyad zorunludur')]}
              />
            </Box>

            <PhoneInputField source="phone" label="Telefon" hint="Opsiyonel" />

            {/* Şifre */}
            <Section title="Şifre" />

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
              <PasswordInputField
                source="password"
                label="Şifre"
                required
                hint="En az 6 karakter"
              />
              <PasswordInputField
                source="password_confirm"
                label="Şifre Tekrar"
                required
                confirmOf="password"
              />
            </Box>

            {/* Bayi Bağlantısı */}
            <Section title="Bayi Bağlantısı" />

            <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 3, alignItems: 'start' }}>
              <Field label="Bağlı Bayi" hint="Opsiyonel - bayi kullanıcılar için">
                <ReferenceInput source="dealer" reference="dealers">
                  <AutocompleteInput optionText="dealer_name" fullWidth sx={inputStyles} />
                </ReferenceInput>
              </Field>
              <Box sx={{ pt: 3.5 }}>
                <BooleanInput source="is_active" label="Hesap Aktif" />
              </Box>
            </Box>
          </SimpleForm>
        </FormCard>
      </FormContainer>
    </Create>
  );
};
