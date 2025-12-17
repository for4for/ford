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
  DeleteButton,
  PasswordInput,
} from 'react-admin';
import { Box, Grid, Typography, Card, CardContent, useTheme } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SecurityIcon from '@mui/icons-material/Security';
import StoreIcon from '@mui/icons-material/Store';
import { BackToListButton } from '../../components';

const CustomToolbar = () => {
  const theme = useTheme();
  return (
    <Toolbar
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        backgroundColor: 'transparent',
        padding: '16px 0',
      }}
    >
      <Box sx={{ display: 'flex', gap: 2 }}>
        <BackToListButton />
        <DeleteButton
          label="Sil"
          sx={{
            color: '#d32f2f',
            borderColor: '#d32f2f',
          }}
        />
      </Box>
      <SaveButton
        label="Kaydet"
        variant="contained"
        sx={{
          backgroundColor: theme.palette.primary.main,
          '&:hover': {
            backgroundColor: theme.palette.primary.light,
          },
        }}
      />
    </Toolbar>
  );
};

const SectionCard = ({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) => (
  <Card
    sx={{
      mb: 2,
      boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
      borderRadius: 1,
      border: '1px solid #e0e0e0',
    }}
  >
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 3,
        py: 2,
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #e0e0e0',
      }}
    >
      <Box sx={{ color: 'primary.main', display: 'flex', alignItems: 'center' }}>{icon}</Box>
      <Typography
        variant="h6"
        sx={{
          fontWeight: 600,
          color: 'primary.main',
          fontSize: '15px',
          letterSpacing: '0.02em',
        }}
      >
        {title}
      </Typography>
    </Box>
    <CardContent sx={{ p: 3 }}>{children}</CardContent>
  </Card>
);

export const UserEdit = () => (
  <Edit mutationMode="pessimistic">
    <Box sx={{ maxWidth: 1000, margin: '0 auto', p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <BackToListButton label="Geri" variant="text" />
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: 'primary.main',
          }}
        >
          Kullanıcı Düzenle
        </Typography>
      </Box>
    </Box>
      <SimpleForm
        toolbar={<CustomToolbar />}
        sx={{
          '& .RaSimpleForm-content': {
            maxWidth: 1000,
            margin: '0 auto',
            p: 3,
            pt: 0,
          },
        }}
      >
        {/* User Information */}
        <SectionCard icon={<PersonIcon />} title="Kullanıcı Bilgileri">
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextInput
                source="username"
                label="Kullanıcı Adı"
                validate={required()}
                fullWidth
                helperText="Benzersiz kullanıcı adı"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextInput
                source="email"
                label="E-posta"
                validate={email()}
                fullWidth
                helperText="Geçerli e-posta adresi"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextInput source="first_name" label="Ad" fullWidth />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextInput source="last_name" label="Soyad" fullWidth />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextInput source="phone" label="Telefon" fullWidth helperText="(5xx) xxx xx xx" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <BooleanInput source="is_active" label="Aktif" />
            </Grid>
          </Grid>
        </SectionCard>

        {/* Role & Permissions */}
        <SectionCard icon={<SecurityIcon />} title="Rol ve Yetkiler">
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
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
                helperText="Kullanıcı yetki seviyesi"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <PasswordInput
                source="password"
                label="Yeni Şifre"
                fullWidth
                helperText="Değiştirmek için yeni şifre girin (min. 8 karakter)"
              />
            </Grid>
          </Grid>
        </SectionCard>

        {/* Dealer Association */}
        <SectionCard icon={<StoreIcon />} title="Bayi Bağlantısı">
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12 }}>
              <ReferenceInput source="dealer" reference="dealers" fullWidth>
                <AutocompleteInput
                  label="Bağlı Bayi"
                  optionText="dealer_name"
                  optionValue="dealer_code"
                  fullWidth
                  helperText="Kullanıcının bağlı olduğu bayi (opsiyonel)"
                />
              </ReferenceInput>
            </Grid>
          </Grid>
        </SectionCard>
      </SimpleForm>
    </Edit>
);
