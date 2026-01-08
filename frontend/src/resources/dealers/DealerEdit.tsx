import {
  Edit,
  SimpleForm,
  TextInput,
  SelectInput,
  ArrayInput,
  SimpleFormIterator,
  required,
  email,
  Toolbar,
  SaveButton,
  useRedirect,
  useSimpleFormIterator,
} from 'react-admin';
import { Box, Typography, Button, Divider, Paper } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';

// Custom Add Button that properly connects to SimpleFormIterator
const AddEmailButton = () => {
  const { add } = useSimpleFormIterator();
  
  return (
    <Button
      size="small"
      onClick={() => add()}
      startIcon={<AddIcon sx={{ fontSize: 16 }} />}
      sx={{
        color: '#666',
        textTransform: 'none',
        fontSize: 13,
        mt: 1,
        '&:hover': { bgcolor: '#f5f5f5' },
      }}
    >
      E-posta Ekle
    </Button>
  );
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
        onClick={() => redirect('list', 'dealers')}
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

export const DealerEdit = () => {
  const redirect = useRedirect();

  return (
    <Edit
      mutationMode="pessimistic"
      actions={false}
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
            onClick={() => redirect('list', 'dealers')}
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
          Bayi Düzenle
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
          {/* Temel Bilgiler */}
          <SectionTitle>Temel Bilgiler</SectionTitle>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 1 }}>
              <TextInput
                source="dealer_code"
                label="Bayi Kodu"
                validate={required()}
                fullWidth
                disabled
              sx={inputStyles}
              />
              <SelectInput
                source="status"
                label="Durum"
                choices={[
                  { id: 'aktif', name: 'Aktif' },
                  { id: 'pasif', name: 'Pasif' },
                  { id: 'askida', name: 'Askıda' },
                ]}
                validate={required()}
                fullWidth
              sx={inputStyles}
              />
          </Box>
          
              <TextInput
                source="dealer_name"
                label="Bayi Ünvanı"
                validate={required()}
                fullWidth
            sx={{ ...inputStyles, mb: 1 }}
              />
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <SelectInput
                source="dealer_type"
                label="Bayi Tipi"
                choices={[
                  { id: 'yetkili', name: 'Yetkili Bayi' },
                  { id: 'anlasmali', name: 'Anlaşmalı Bayi' },
                  { id: 'satis', name: 'Satış Bayisi' },
                ]}
                validate={required()}
                fullWidth
              sx={inputStyles}
              />
              <TextInput
                source="tax_number"
                label="Vergi Numarası"
                fullWidth
              sx={inputStyles}
              />
          </Box>

          <Divider sx={{ my: 3, borderColor: '#eee' }} />

          {/* Adres Bilgileri */}
          <SectionTitle>Adres</SectionTitle>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 1 }}>
              <TextInput
                source="city"
                label="İl"
                validate={required()}
                fullWidth
              sx={inputStyles}
              />
              <TextInput
                source="district"
                label="İlçe"
                validate={required()}
                fullWidth
              sx={inputStyles}
              />
          </Box>
          
              <TextInput
                source="address"
                label="Adres"
                multiline
            rows={2}
                fullWidth
                validate={required()}
            sx={inputStyles}
              />

              <TextInput
            source="region"
            label="Bölge"
                fullWidth
            sx={inputStyles}
          />

          <Divider sx={{ my: 3, borderColor: '#eee' }} />

          {/* İletişim Bilgileri */}
          <SectionTitle>İletişim</SectionTitle>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 1 }}>
              <TextInput
                source="email"
                label="E-posta"
                validate={[required(), email()]}
                fullWidth
              sx={inputStyles}
            />
            <TextInput
              source="phone"
              label="Telefon"
              validate={required()}
              fullWidth
              sx={inputStyles}
              />
          </Box>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextInput
                source="contact_person"
                label="İletişim Kişisi"
                fullWidth
                validate={required()}
              sx={inputStyles}
              />
              <TextInput
                source="regional_manager"
                label="Bölge Müdürü"
                fullWidth
                validate={required()}
              sx={inputStyles}
              />
          </Box>
          
          <Box sx={{ mt: 2 }}>
            <Typography sx={{ fontSize: 13, color: '#666', mb: 1 }}>Ek E-postalar</Typography>
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
                <TextInput
                  source=""
                  label="Ek E-posta"
                  validate={email()}
                  fullWidth
                  sx={inputStyles}
                />
              </SimpleFormIterator>
            </ArrayInput>
          </Box>
    </SimpleForm>
        </Paper>
      </Box>
  </Edit>
);
};
