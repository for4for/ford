import {
  Edit,
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
    <SaveButton label="Güncelle" sx={saveButtonStyles} />
  </Toolbar>
);

export const UserEdit = () => {
  const redirect = useRedirect();
  const notify = useNotify();

  // Transform: password_confirm'i gönderme, boş şifreyi gönderme
  const transform = (data: any) => {
    const { password_confirm, ...rest } = data;
    if (!rest.password) {
      delete rest.password;
    }
    return { ...rest, username: data.email };
  };

  const onSuccess = () => {
    notify('Kullanıcı güncellendi', { type: 'success' });
    redirect('list', 'users');
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
    <Edit
      mutationMode="pessimistic"
      transform={transform}
      mutationOptions={{ onSuccess, onError }}
      actions={false}
      component="div"
      sx={{ '& .RaEdit-main': { mt: 0 } }}
    >
      <FormContainer maxWidth={800}>
        <FormHeader
          title="Kullanıcı Düzenle"
          subtitle="Kullanıcı bilgilerini güncelleyin"
          onBack={handleBack}
        />

        <FormCard>
          <SimpleForm toolbar={<UserFormToolbar onCancel={handleBack} />} sx={{ p: 0 }}>
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

            {/* Şifre Değiştir */}
            <Section title="Şifre Değiştir" />

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
              <PasswordInputField
                source="password"
                label="Yeni Şifre"
                hint="Değiştirmek istemiyorsanız boş bırakın"
              />
              <PasswordInputField
                source="password_confirm"
                label="Şifre Tekrar"
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
    </Edit>
  );
};
