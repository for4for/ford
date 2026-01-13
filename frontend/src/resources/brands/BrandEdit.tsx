import {
  Edit,
  SimpleForm,
  TextInput,
  BooleanInput,
  required,
  Toolbar,
  SaveButton,
  useRedirect,
  useRecordContext,
} from 'react-admin';
import { Box, Typography, Paper, Button, Divider, Chip } from '@mui/material';
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
        onClick={() => redirect('list', 'brands')}
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

const BrandHeader = () => {
  const record = useRecordContext();
  const redirect = useRedirect();
  
  return (
    <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <ArrowBackIcon
          onClick={() => redirect('list', 'brands')}
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
          {record?.name || 'Marka Düzenle'}
        </Typography>
      </Box>
      {record?.dealer_count > 0 && (
        <Chip 
          label={`${record.dealer_count} Bayi`} 
          size="small" 
          color="primary"
          variant="outlined"
        />
      )}
    </Box>
  );
};

export const BrandEdit = () => {
  return (
    <Edit
      actions={false}
      redirect="list"
      mutationMode="pessimistic"
      sx={{
        marginTop: 4,
        '& .RaEdit-main': {
          marginTop: 0,
        },
      }}
    >
      <Box sx={{ maxWidth: 600, margin: '0 auto', px: 3, py: 3 }}>
        {/* Header */}
        <BrandHeader />

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
            <SectionTitle>Marka Bilgileri</SectionTitle>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 2fr' }, gap: 2, mb: 1 }}>
              <TextInput
                source="code"
                label="Marka Kodu"
                validate={required()}
                fullWidth
                sx={inputStyles}
                helperText="Örn: FORD, TOFAS"
              />
              <TextInput
                source="name"
                label="Marka Adı"
                validate={required()}
                fullWidth
                sx={inputStyles}
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <BooleanInput source="is_active" label="Aktif" />
            </Box>

            <Divider sx={{ my: 3, borderColor: '#eee' }} />

            {/* Reklam Hesabı */}
            <SectionTitle>Reklam Hesabı</SectionTitle>

            <TextInput
              source="fb_ad_account_id"
              label="Facebook Reklam Hesabı ID"
              fullWidth
              sx={inputStyles}
              helperText="Örn: act_123456789"
            />
          </SimpleForm>
        </Paper>
      </Box>
    </Edit>
  );
};
