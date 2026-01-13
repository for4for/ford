import {
  Edit,
  SimpleForm,
  TextInput,
  SelectInput,
  BooleanInput,
  ReferenceInput,
  AutocompleteInput,
  required,
  email,
  Toolbar,
  SaveButton,
  useRedirect,
  PasswordInput,
  useNotify,
} from 'react-admin';
import { Box, Typography, Paper, Button, Divider } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Section Title
const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <Typography
    sx={{
      fontSize: 13,
      fontWeight: 600,
      color: '#999',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      mb: 2,
      mt: 1,
    }}
  >
    {children}
  </Typography>
);

// Form input ortak stilleri
const inputStyles = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#fff',
    '& fieldset': {
      borderColor: '#e0e0e0',
    },
    '&:hover fieldset': {
      borderColor: '#bdbdbd',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#1a1a2e',
      borderWidth: 1,
    },
  },
  '& .MuiInputLabel-root': {
    color: '#666',
    '&.Mui-focused': {
      color: '#1a1a2e',
    },
  },
  '& .MuiFormHelperText-root': {
    marginLeft: 0,
    fontSize: 11,
    color: '#999',
  },
};

const CustomToolbar = () => {
  const redirect = useRedirect();

  return (
    <Toolbar
      sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        backgroundColor: 'transparent',
        padding: '24px 0 0 0',
        gap: 2,
      }}
    >
      <Button
        onClick={() => redirect('list', 'users')}
        sx={{
          color: '#666',
          textTransform: 'none',
          fontWeight: 500,
          px: 3,
          '&:hover': { bgcolor: '#f5f5f5' },
        }}
      >
        İptal
      </Button>
      <SaveButton
        label="Kaydet"
        variant="contained"
        sx={{
          backgroundColor: '#1a1a2e',
          textTransform: 'none',
          fontWeight: 500,
          px: 4,
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: '#2d2d44',
            boxShadow: 'none',
          },
        }}
      />
    </Toolbar>
  );
};

export const UserEdit = () => {
  const redirect = useRedirect();
  const notify = useNotify();

  // password_confirm alanını backend'e göndermemek için transform
  const transform = (data: any) => {
    const { password_confirm, ...rest } = data;
    // Şifre boşsa hiç gönderme
    if (!rest.password) {
      delete rest.password;
    }
    return rest;
  };

  // Backend hatalarını kullanıcıya göster
  const onError = (error: any) => {
    if (error?.body) {
      const errors = error.body;
      const messages: string[] = [];
      
      if (errors.username) {
        messages.push(`E-posta: ${errors.username.join(', ')}`);
      }
      if (errors.email) {
        messages.push(`E-posta: ${errors.email.join(', ')}`);
      }
      if (errors.dealer) {
        messages.push(`Bayi: ${errors.dealer.join(', ')}`);
      }
      if (errors.password) {
        messages.push(`Şifre: ${errors.password.join(', ')}`);
      }
      
      // Diğer hatalar için
      Object.keys(errors).forEach(key => {
        if (!['username', 'email', 'dealer', 'password'].includes(key)) {
          const value = errors[key];
          if (Array.isArray(value)) {
            messages.push(`${key}: ${value.join(', ')}`);
          }
        }
      });

      if (messages.length > 0) {
        notify(messages.join('\n'), { type: 'error', multiLine: true });
      } else {
        notify('Bir hata oluştu', { type: 'error' });
      }
    } else {
      notify(error?.message || 'Bir hata oluştu', { type: 'error' });
    }
  };

  return (
    <Edit
      mutationMode="pessimistic"
      actions={false}
      transform={transform}
      mutationOptions={{ onError }}
      sx={{
        marginTop: 4,
        '& .RaEdit-main': {
          marginTop: 0,
        },
      }}
    >
      <Box sx={{ maxWidth: 800, margin: '0 auto', px: 3, py: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <ArrowBackIcon
            onClick={() => redirect('list', 'users')}
            sx={{
              fontSize: 22,
              color: '#666',
              cursor: 'pointer',
              '&:hover': { color: '#333' },
            }}
          />
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: '#1a1a2e',
              fontSize: 22,
            }}
          >
            Kullanıcı Düzenle
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            border: '1px solid #e5e7eb',
            borderRadius: 2,
            p: 3,
          }}
        >
          <SimpleForm
            toolbar={<CustomToolbar />}
            sx={{
              padding: 0,
              '& .RaSimpleForm-content': {
                padding: 0,
              },
            }}
          >
            {/* Hesap Bilgileri */}
            <SectionTitle>Hesap Bilgileri</SectionTitle>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 1 }}>
              <TextInput
                source="username"
                label="E-posta (Giriş)"
                validate={required()}
                fullWidth
                sx={inputStyles}
              />
              <TextInput
                source="email"
                label="E-posta"
                validate={email()}
                fullWidth
                sx={inputStyles}
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <SelectInput
                source="role"
                label="Rol"
                choices={[
                  { id: 'admin', name: 'Admin' },
                  { id: 'moderator', name: 'Moderatör' },
                  { id: 'bayi', name: 'Bayi' },
                  { id: 'creative_agency', name: 'Creative Agency' },
                ]}
                validate={required()}
                fullWidth
                sx={inputStyles}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', pt: 1 }}>
                <BooleanInput source="is_active" label="Aktif" />
              </Box>
            </Box>

            <Divider sx={{ my: 3, borderColor: '#eee' }} />

            {/* Kişisel Bilgiler */}
            <SectionTitle>Kişisel Bilgiler</SectionTitle>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 1 }}>
              <TextInput
                source="first_name"
                label="Ad"
                fullWidth
                sx={inputStyles}
              />
              <TextInput
                source="last_name"
                label="Soyad"
                fullWidth
                sx={inputStyles}
              />
            </Box>

            <TextInput
              source="phone"
              label="Telefon"
              fullWidth
              sx={inputStyles}
            />

            <Divider sx={{ my: 3, borderColor: '#eee' }} />

            {/* Şifre */}
            <SectionTitle>Şifre Değiştir</SectionTitle>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <PasswordInput
                source="password"
                label="Yeni Şifre"
                fullWidth
                helperText="En az 6 karakter olmalıdır"
                sx={inputStyles}
              />
              <PasswordInput
                source="password_confirm"
                label="Yeni Şifre (Tekrar)"
                fullWidth
                helperText="Şifreyi tekrar girin"
                sx={inputStyles}
                validate={(value, allValues) => {
                  if (allValues.password && value !== allValues.password) {
                    return 'Şifreler eşleşmiyor';
                  }
                  return undefined;
                }}
              />
            </Box>

            <Divider sx={{ my: 3, borderColor: '#eee' }} />

            {/* Bayi Bağlantısı */}
            <SectionTitle>Bayi Bağlantısı</SectionTitle>

            <ReferenceInput source="dealer" reference="dealers">
              <AutocompleteInput
                label="Bağlı Bayi"
                optionText="dealer_name"
                fullWidth
                sx={inputStyles}
              />
            </ReferenceInput>
          </SimpleForm>
        </Paper>
      </Box>
    </Edit>
  );
};
