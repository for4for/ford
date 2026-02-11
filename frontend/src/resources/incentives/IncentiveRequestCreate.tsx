import {
  Create,
  SimpleForm,
  TextInput,
  NumberInput,
  ReferenceInput,
  SelectInput,
  required,
  Toolbar,
  SaveButton,
  useRedirect,
} from 'react-admin';
import { Box, Button } from '@mui/material';

import {
  FormContainer,
  FormCard,
  FormHeader,
  Section,
  Field,
  inputStyles,
  formToolbarStyles,
  cancelButtonStyles,
  saveButtonStyles,
} from '../../components/FormFields';

const IncentiveCreateToolbar = ({ onCancel }: { onCancel: () => void }) => (
  <Toolbar sx={formToolbarStyles}>
    <Button onClick={onCancel} sx={cancelButtonStyles}>
      Vazgeç
    </Button>
    <SaveButton label="Kaydet" sx={saveButtonStyles} />
  </Toolbar>
);

export const IncentiveRequestCreate = () => {
  const redirect = useRedirect();

  const handleGoBack = () => {
    redirect('list', 'incentives/requests');
  };

  return (
    <Create
      component="div"
      sx={{
        '& .RaCreate-main': {
          marginTop: 0,
        },
      }}
    >
      <FormContainer maxWidth={800}>
        <FormHeader
          title="Yeni Teşvik Talebi"
          subtitle="Yeni bir teşvik talebi oluşturun"
          onBack={handleGoBack}
        />

        <FormCard>
          <SimpleForm
            toolbar={<IncentiveCreateToolbar onCancel={handleGoBack} />}
            sx={{ p: 0 }}
          >
            {/* Bayi Seçimi */}
            <Section title="Bayi" first />
            
            <Field label="Bayi" required>
              <ReferenceInput source="dealer" reference="dealers">
                <SelectInput 
                  optionText="dealer_name" 
                  label=""
                  validate={required()} 
                  fullWidth
                  sx={inputStyles}
                />
              </ReferenceInput>
            </Field>

            {/* Talep Bilgileri */}
            <Section title="Talep Bilgileri" />
            
            <Field label="Teşvik Başlığı" required>
              <TextInput
                source="incentive_title"
                label=""
                validate={required()}
                fullWidth
                sx={inputStyles}
              />
            </Field>
            
            <Field label="Teşvik Detayları" required>
              <TextInput
                source="incentive_details"
                label=""
                multiline
                rows={3}
                validate={required()}
                fullWidth
                sx={inputStyles}
              />
            </Field>
            
            <Field label="Talebin Amacı" required>
              <TextInput
                source="purpose"
                label=""
                multiline
                rows={2}
                validate={required()}
                fullWidth
                sx={inputStyles}
              />
            </Field>
            
            <Field label="Hedef Kitle" required>
              <TextInput
                source="target_audience"
                label=""
                multiline
                rows={2}
                validate={required()}
                fullWidth
                sx={inputStyles}
              />
            </Field>

            {/* Finansal Bilgiler */}
            <Section title="Finansal Bilgiler" />
            
            <Field label="Talep Edilen Tutar (₺)" required>
              <NumberInput
                source="incentive_amount"
                label=""
                validate={required()}
                fullWidth
                sx={inputStyles}
              />
            </Field>

            {/* Etkinlik Bilgileri */}
            <Section title="Etkinlik Bilgileri" />
            
            <Field label="Etkinlik Zamanı" required>
              <TextInput
                source="event_time"
                label=""
                validate={required()}
                fullWidth
                sx={inputStyles}
              />
            </Field>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
              <Field label="Konum (İl/İlçe)" required>
                <TextInput
                  source="event_location"
                  label=""
                  validate={required()}
                  fullWidth
                  sx={inputStyles}
                />
              </Field>
              <Field label="Mekan Adı" required>
                <TextInput
                  source="event_venue"
                  label=""
                  validate={required()}
                  fullWidth
                  sx={inputStyles}
                />
              </Field>
            </Box>
            
            <Field label="Harita Linki">
              <TextInput
                source="map_link"
                label=""
                fullWidth
                sx={inputStyles}
              />
            </Field>

            {/* Performans */}
            <Section title="Performans" />
            
            <Field label="Performans Metrikleri" required>
              <TextInput
                source="performance_metrics"
                label=""
                multiline
                rows={3}
                validate={required()}
                fullWidth
                sx={inputStyles}
              />
            </Field>

            {/* Notlar */}
            <Section title="Notlar" />
            
            <Field label="Notlar">
              <TextInput
                source="notes"
                label=""
                multiline
                rows={2}
                fullWidth
                sx={inputStyles}
              />
            </Field>
          </SimpleForm>
        </FormCard>
      </FormContainer>
    </Create>
  );
};
