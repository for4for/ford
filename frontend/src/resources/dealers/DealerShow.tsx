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
  BooleanField,
} from 'react-admin';
import { Card, CardContent, Typography, Grid, Box, Chip, LinearProgress } from '@mui/material';

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
        <TextField source="contact_first_name" label="Sorumlu Adı" />
        <TextField source="contact_last_name" label="Sorumlu Soyadı" />
        <TextField source="regional_manager" label="Bölge Müdürü" />
        <ArrayField source="additional_emails" label="Ek E-posta Adresleri">
          <Datagrid bulkActionButtons={false}>
            <TextField source="*" label="E-posta" />
          </Datagrid>
        </ArrayField>
      </Tab>

      <Tab label="URL & Facebook">
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>URL Yönlendirmeleri</Typography>
            <TextField source="sales_url" label="Satış Formu URL" emptyText="-" />
            <TextField source="service_url" label="Servis Formu URL" emptyText="-" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Facebook Entegrasyon</Typography>
            <TextField source="fb_page_id" label="Facebook Sayfa ID" emptyText="-" />
            <TextField source="instagram_account_id" label="Instagram Hesap ID" emptyText="-" />
            <TextField source="fb_ad_account_id" label="FB Reklam Hesap ID" emptyText="-" />
          </Grid>
        </Grid>
      </Tab>
      
      <Tab label="Bütçe" path="budget">
        <FunctionField
          label="Güncel Bütçe"
          render={(record: any) => {
            const budget = record.current_budget;
            const budgetPlans = record.budget_plans || [];
            
            return (
              <Box>
                {/* Güncel Yıllık Bütçe */}
                {budget && (
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                        {budget.year} Yıllık Bütçe Özeti
                      </Typography>
                      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Toplam Bütçe</Typography>
                          <Typography variant="h6">₺{Number(budget.total_budget).toLocaleString('tr-TR')}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Kullanılan</Typography>
                          <Typography variant="h6" color="warning.main">₺{Number(budget.used_budget).toLocaleString('tr-TR')}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Kalan</Typography>
                          <Typography variant="h6" color="success.main">₺{Number(budget.remaining_budget).toLocaleString('tr-TR')}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Kullanım</Typography>
                          <Typography variant="h6">%{budget.usage_percentage?.toFixed(1)}</Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                )}
                
                {/* Baremli Bütçe Planları */}
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Bütçe Planları (Tarih Aralıklı)
                </Typography>
                
                {budgetPlans.length === 0 ? (
                  <Typography color="text.secondary">Henüz bütçe planı tanımlanmamış.</Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {budgetPlans.map((plan: any) => (
                      <Card key={plan.id} sx={{ border: plan.is_active ? '1px solid #4caf50' : '1px solid #e0e0e0' }}>
                <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle1" fontWeight={600}>
                                {new Date(plan.start_date).toLocaleDateString('tr-TR')} - {new Date(plan.end_date).toLocaleDateString('tr-TR')}
                              </Typography>
                              <Chip 
                                label={plan.is_active ? 'Aktif' : 'Pasif'} 
                                size="small" 
                                color={plan.is_active ? 'success' : 'default'}
                              />
                            </Box>
                            <Typography variant="h6" fontWeight={700}>
                              ₺{Number(plan.budget_amount).toLocaleString('tr-TR')}
                            </Typography>
                          </Box>
                          
                          {plan.description && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {plan.description}
                            </Typography>
                          )}
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ flex: 1 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={plan.usage_percentage || 0} 
                                sx={{ height: 8, borderRadius: 4 }}
                              />
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              ₺{Number(plan.used_amount || 0).toLocaleString('tr-TR')} / ₺{Number(plan.budget_amount).toLocaleString('tr-TR')}
                            </Typography>
                  </Box>
                </CardContent>
              </Card>
                    ))}
                  </Box>
                )}
              </Box>
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
