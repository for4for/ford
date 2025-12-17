import {
  Show,
  TextField,
  EmailField,
  DateField,
  ChipField,
  ArrayField,
  Datagrid,
  NumberField,
  FunctionField,
  TabbedShowLayout,
  Tab,
} from 'react-admin';
import { Card, CardContent, Typography, Grid, Box } from '@mui/material';

export const DealerShow = () => (
  <Show>
    <TabbedShowLayout>
      <Tab label="Genel Bilgiler">
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField source="dealer_code" label="Bayi Kodu" />
            <TextField source="dealer_name" label="Bayi Ünvanı" />
            <ChipField source="dealer_type" label="Bayi Tipi" />
            <ChipField source="status" label="Durum" />
            <TextField source="tax_number" label="Vergi Numarası" />
            <DateField source="membership_date" label="Üyelik Tarihi" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField source="city" label="İl" />
            <TextField source="district" label="İlçe" />
            <TextField source="address" label="Adres" />
            <EmailField source="email" label="E-posta" />
            <TextField source="phone" label="Telefon" />
            <TextField source="region" label="Bölge" />
          </Grid>
        </Grid>
      </Tab>
      
      <Tab label="İletişim">
        <TextField source="contact_person" label="İletişim Kişisi" />
        <TextField source="regional_manager" label="Bölge Müdürü" />
        <ArrayField source="additional_emails" label="Ek E-posta Adresleri">
          <Datagrid bulkActionButtons={false}>
            <TextField source="*" label="E-posta" />
          </Datagrid>
        </ArrayField>
      </Tab>
      
      <Tab label="Bütçe" path="budget">
        <FunctionField
          label="Güncel Bütçe"
          render={(record: any) => {
            const budget = record.current_budget;
            if (!budget) return <Typography>Bütçe bilgisi bulunamadı</Typography>;
            
            return (
              <Card>
                <CardContent>
                  <Typography variant="h6">{budget.year} Bütçesi</Typography>
                  <Box mt={2}>
                    <Typography>Toplam Bütçe: ₺{budget.total_budget}</Typography>
                    <Typography>Kullanılan: ₺{budget.used_budget}</Typography>
                    <Typography>Kalan: ₺{budget.remaining_budget}</Typography>
                    <Typography>Kullanım: %{budget.usage_percentage?.toFixed(1)}</Typography>
                  </Box>
                </CardContent>
              </Card>
            );
          }}
        />
      </Tab>
      
      <Tab label="İstatistikler" path="statistics">
        <NumberField source="total_creative_requests" label="Toplam Kreatif Talep" />
        <NumberField source="total_incentive_requests" label="Toplam Teşvik Talep" />
      </Tab>
    </TabbedShowLayout>
  </Show>
);
