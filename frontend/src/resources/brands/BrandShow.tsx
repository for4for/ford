import {
  Show,
  useShowContext,
  useRedirect,
} from 'react-admin';
import { Box, Typography, Paper, Chip, Button, Divider } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

// Section Title
const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <Typography
    sx={{
      fontSize: 13,
      fontWeight: 600,
      color: '#9ca3af',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      mb: 2,
      mt: 1,
    }}
  >
    {children}
  </Typography>
);

// Summary Row
const SummaryRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <Box sx={{ display: 'flex', py: 1.5, borderBottom: '1px solid #f3f4f6' }}>
    <Typography sx={{ width: 200, color: '#6b7280', fontSize: 14, flexShrink: 0 }}>
      {label}
    </Typography>
    <Typography sx={{ flex: 1, color: '#111827', fontSize: 14, fontWeight: 500 }}>
      {value || '-'}
    </Typography>
  </Box>
);

const BrandShowContent = () => {
  const { record, isLoading } = useShowContext();
  const redirect = useRedirect();

  if (isLoading || !record) return null;

  return (
    <Box sx={{ backgroundColor: '#f9fafb', minHeight: 'calc(100vh - 64px)', py: 5, px: 4 }}>
      <Box sx={{ maxWidth: 600, margin: '0 auto' }}>
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              onClick={() => redirect('list', 'brands')}
              sx={{
                minWidth: 40,
                height: 40,
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                color: '#6b7280',
                '&:hover': {
                  backgroundColor: '#f3f4f6',
                  borderColor: '#d1d5db',
                },
              }}
            >
              <ArrowBackIcon sx={{ fontSize: 20 }} />
            </Button>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827', fontSize: 24 }}>
                {record.name}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280', mt: 0.5 }}>
                Marka Detayları
              </Typography>
            </Box>
          </Box>
          <Button
            variant="outlined"
            startIcon={<EditIcon sx={{ fontSize: 18 }} />}
            onClick={() => redirect('edit', 'brands', record.id)}
            sx={{
              textTransform: 'none',
              borderColor: '#1a1a2e',
              color: '#1a1a2e',
              borderRadius: '8px',
              '&:hover': {
                borderColor: '#1a1a2e',
                backgroundColor: '#f5f5f5',
              },
            }}
          >
            Düzenle
          </Button>
        </Box>

        <Paper
          elevation={0}
          sx={{
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            p: 4,
            backgroundColor: '#fff',
          }}
        >
          {/* Marka Bilgileri */}
          <SectionTitle>Marka Bilgileri</SectionTitle>
          <SummaryRow label="Marka Kodu" value={record.code} />
          <SummaryRow label="Marka Adı" value={record.name} />
          <SummaryRow
            label="Durum"
            value={
              record.is_active ? (
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
              )
            }
          />
          <SummaryRow
            label="Bağlı Bayi Sayısı"
            value={
              <Chip
                label={`${record.dealer_count || 0} Bayi`}
                size="small"
                sx={{
                  bgcolor: '#e0f2fe',
                  color: '#0369a1',
                  fontWeight: 500,
                }}
              />
            }
          />

          <Divider sx={{ my: 3, borderColor: '#f3f4f6' }} />

          {/* Reklam Hesabı */}
          <SectionTitle>Reklam Hesabı</SectionTitle>
          <SummaryRow label="Facebook Reklam Hesabı ID" value={record.fb_ad_account_id} />

          <Divider sx={{ my: 3, borderColor: '#f3f4f6' }} />

          {/* Meta Bilgiler */}
          <SectionTitle>Meta Bilgiler</SectionTitle>
          <SummaryRow
            label="Oluşturulma Tarihi"
            value={
              record.created_at
                ? new Date(record.created_at).toLocaleString('tr-TR')
                : '-'
            }
          />
          <SummaryRow
            label="Son Güncelleme"
            value={
              record.updated_at
                ? new Date(record.updated_at).toLocaleString('tr-TR')
                : '-'
            }
          />
        </Paper>
      </Box>
    </Box>
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

