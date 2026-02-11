import {
  Show,
  useShowContext,
  useRedirect,
} from 'react-admin';
import { Chip, Divider, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { FormContainer, FormHeader } from '../../components/FormFields';
import { SectionTitle, SummaryRow, ShowCard, MetaInfo } from '../../components/ShowFields';

const BrandShowContent = () => {
  const { record, isLoading } = useShowContext();
  const redirect = useRedirect();

  if (isLoading || !record) return null;

  return (
    <FormContainer maxWidth={800}>
        {/* Header */}
      <FormHeader
        title={record.name}
        subtitle="Marka Detayları"
        onBack={() => redirect('list', 'brands')}
      >
          <Button
            variant="outlined"
          size="small"
          startIcon={<EditIcon sx={{ fontSize: 16 }} />}
            onClick={() => redirect('edit', 'brands', record.id)}
            sx={{
              textTransform: 'none',
            fontSize: 13,
              borderColor: '#1a1a2e',
              color: '#1a1a2e',
              borderRadius: '8px',
            '&:hover': { borderColor: '#1a1a2e', bgcolor: '#f5f5f5' },
            }}
          >
            Düzenle
          </Button>
      </FormHeader>

      <ShowCard>
          {/* Marka Bilgileri */}
          <SectionTitle>Marka Bilgileri</SectionTitle>
        <SummaryRow label="Marka Kodu">{record.code || '-'}</SummaryRow>
        <SummaryRow label="Marka Adı">{record.name || '-'}</SummaryRow>
        <SummaryRow label="Durum">
          {record.is_active ? (
                <Chip
                  icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
                  label="Aktif"
                  size="small"
                  sx={{
                    backgroundColor: '#dcfce7',
                    color: '#166534',
                    fontWeight: 600,
                    '& .MuiChip-icon': { color: '#166534' },
                  }}
                />
              ) : (
                <Chip
                  icon={<CancelIcon sx={{ fontSize: 16 }} />}
                  label="Pasif"
                  size="small"
                  sx={{
                    backgroundColor: '#fee2e2',
                    color: '#991b1b',
                    fontWeight: 600,
                    '& .MuiChip-icon': { color: '#991b1b' },
                  }}
                />
          )}
        </SummaryRow>
        <SummaryRow label="Bağlı Bayi Sayısı">
              <Chip
                label={`${record.dealer_count || 0} Bayi`}
                size="small"
                sx={{
                  bgcolor: '#e0f2fe',
                  color: '#0369a1',
                  fontWeight: 500,
                }}
              />
        </SummaryRow>

          <Divider sx={{ my: 3, borderColor: '#f3f4f6' }} />

          {/* Reklam Hesabı */}
          <SectionTitle>Reklam Hesabı</SectionTitle>
        <SummaryRow label="Facebook Reklam Hesabı ID">{record.fb_ad_account_id || '-'}</SummaryRow>

          <Divider sx={{ my: 3, borderColor: '#f3f4f6' }} />

          {/* Meta Bilgiler */}
          <SectionTitle>Meta Bilgiler</SectionTitle>
        <SummaryRow label="Oluşturulma Tarihi">
          {record.created_at ? new Date(record.created_at).toLocaleString('tr-TR') : '-'}
        </SummaryRow>
        <SummaryRow label="Son Güncelleme">
          {record.updated_at ? new Date(record.updated_at).toLocaleString('tr-TR') : '-'}
        </SummaryRow>
      </ShowCard>
    </FormContainer>
  );
};

export const BrandShow = () => (
  <Show
    component="div"
    actions={false}
    sx={{
      '& .RaShow-main': { marginTop: 0 },
    }}
  >
    <BrandShowContent />
  </Show>
);
