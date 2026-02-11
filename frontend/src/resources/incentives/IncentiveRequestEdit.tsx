import {
  Edit,
  SimpleForm,
  TextInput,
  NumberInput,
  SelectInput,
  required,
  Toolbar,
  SaveButton,
  useRedirect,
} from 'react-admin';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useBrand } from '../../context/BrandContext';
import { useSmartBack } from '../../hooks/useSmartBack';
import { Box, Button, Divider } from '@mui/material';

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

const IncentiveFormToolbar = ({ onCancel }: { onCancel: () => void }) => (
  <Toolbar sx={formToolbarStyles}>
    <Button onClick={onCancel} sx={cancelButtonStyles}>
      Vazgeç
    </Button>
    <SaveButton label="Kaydet" sx={saveButtonStyles} />
  </Toolbar>
);

export const IncentiveRequestEdit = () => {
  const redirect = useRedirect();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { buildUrl } = useBrand();
  const isDealer = location.pathname.includes('/dealer/');
  const smartGoBack = useSmartBack({ fallbackResource: 'incentives/requests' });

  const handleGoBack = () => {
    if (isDealer) {
      navigate(buildUrl(`/dealer/incentive-requests/${id}`));
    } else {
      smartGoBack();
    }
  };

  return (
    <Edit
      resource="incentives/requests"
      id={id}
      mutationMode="pessimistic"
      actions={false}
      component="div"
      sx={{
        '& .RaEdit-main': {
          marginTop: 0,
        },
      }}
    >
      <FormContainer maxWidth={800}>
        <FormHeader
          title="Teşvik Talebi Düzenle"
          subtitle="Teşvik talebini güncelleyin"
          onBack={handleGoBack}
        />

        <FormCard>
          <SimpleForm
            toolbar={<IncentiveFormToolbar onCancel={handleGoBack} />}
            sx={{ p: 0 }}
          >
            {/* Talep Bilgileri */}
            <Section title="Talep Bilgileri" first />
            
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
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
              <Field label="Talep Edilen Tutar (₺)" required>
                <NumberInput
                  source="incentive_amount"
                  label=""
                  validate={required()}
                  fullWidth
                  sx={inputStyles}
                />
              </Field>
              <Field label="Durum">
                <SelectInput
                  source="status"
                  label=""
                  choices={[
                    { id: 'taslak', name: 'Taslak' },
                    { id: 'onay_bekliyor', name: 'Onay Bekliyor' },
                    { id: 'degerlendirme', name: 'Değerlendirme' },
                    { id: 'onaylandi', name: 'Onaylandı' },
                    { id: 'reddedildi', name: 'Reddedildi' },
                    { id: 'tamamlandi', name: 'Tamamlandı' },
                  ]}
                  fullWidth
                  sx={inputStyles}
                />
              </Field>
            </Box>
            
            <Field label="Onaylanan Tutar (₺)">
              <NumberInput
                source="approved_amount"
                label=""
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
            
            <Field label="Admin Notları">
              <TextInput
                source="admin_notes"
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
    </Edit>
  );
};
