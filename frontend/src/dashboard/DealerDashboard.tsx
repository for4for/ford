import { Paper, Typography, Box, Grid, Chip, useTheme } from '@mui/material';
import { useGetIdentity, useGetOne, useGetList } from 'react-admin';
import { useNavigate } from 'react-router-dom';

// Kurumsal durum renkleri
const getStatusColor = (status: string) => {
  switch (status) {
    case 'onaylandi':
    case 'tamamlandi':
      return '#166534';  // Kurumsal yeşil
    case 'bekliyor':
    case 'onay_bekliyor':
    case 'gorsel_bekliyor':
    case 'bayi_onayi_bekliyor':
      return '#b45309';  // Kurumsal amber
    case 'yayinda':
      return '#1d4ed8';  // Mavi
    case 'reddedildi':
      return '#991b1b';  // Kurumsal kırmızı
    case 'taslak':
      return '#4b5563';  // Kurumsal gri
    default:
      return '#4b5563';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'onaylandi':
      return 'Onaylı';
    case 'tamamlandi':
      return 'Tamamlandı';
    case 'bekliyor':
    case 'onay_bekliyor':
      return 'Bekliyor';
    case 'gorsel_bekliyor':
      return 'Görsel Bekleniyor';
    case 'bayi_onayi_bekliyor':
      return 'Bayi Onayı';
    case 'yayinda':
      return 'Yayında';
    case 'reddedildi':
      return 'Reddedildi';
    case 'taslak':
      return 'Taslak';
    default:
      return status;
  }
};

const StatCard = ({ title, value, color }: { title: string; value: number; color: string }) => (
  <Paper
    elevation={0}
    sx={{
      p: 1.5,
      border: '1px solid #e5e7eb',
      borderRadius: 1.5,
      textAlign: 'center',
    }}
  >
    <Typography sx={{ fontWeight: 600, fontSize: 20, color }}>
      {value}
    </Typography>
    <Typography sx={{ fontSize: 11, color: '#999' }}>
      {title}
    </Typography>
  </Paper>
);

const BudgetCard = ({ budget, primaryColor }: any) => (
  <Paper
    elevation={0}
    sx={{
      p: 2,
      border: '1px solid #e5e7eb',
      borderRadius: 1.5,
      background: `linear-gradient(135deg, ${primaryColor} 0%, #621623 100%)`,
    }}
  >
    <Typography sx={{ fontWeight: 600, fontSize: 13, mb: 1.5, color: '#fff' }}>
      {budget?.year || new Date().getFullYear()} Bütçe
    </Typography>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
      <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Toplam</Typography>
      <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#fff' }}>
        ₺{budget?.total_budget?.toLocaleString() || '0'}
      </Typography>
    </Box>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
      <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Kullanılan</Typography>
      <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#fff' }}>
        ₺{budget?.used_budget?.toLocaleString() || '0'}
      </Typography>
    </Box>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
      <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Kalan</Typography>
      <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#a7f3d0' }}>
        ₺{budget?.remaining_budget?.toLocaleString() || '0'}
      </Typography>
    </Box>
    <Box
      sx={{
        height: 4,
        bgcolor: 'rgba(255,255,255,0.2)',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          height: '100%',
          width: `${budget?.usage_percentage || 0}%`,
          bgcolor: '#a7f3d0',
        }}
      />
    </Box>
    <Typography sx={{ fontSize: 10, mt: 0.75, color: 'rgba(255,255,255,0.6)' }}>
      %{budget?.usage_percentage?.toFixed(0) || '0'} kullanıldı
    </Typography>
  </Paper>
);

const getTypeColor = (type: string, primaryColor: string) => {
  switch (type) {
    case 'creative':
      return primaryColor;
    case 'incentive':
      return '#1E3A5F';
    case 'campaign':
      return '#0f766e'; // Koyu Teal - Kurumsal
    default:
      return '#4b5563';
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'creative':
      return 'Kreatif';
    case 'incentive':
      return 'Teşvik';
    case 'campaign':
      return 'Kampanya';
    default:
      return type;
  }
};

// Sol Kenarda Renkli Çizgi + Sağda Her İki Etiket
const RequestCard = ({ request, type, primaryColor, onClick }: any) => {
  const typeColor = getTypeColor(type, primaryColor);
  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        mb: 1,
        p: 1.5,
        pl: 2,
        border: '1px solid #e5e7eb',
        borderLeft: `4px solid ${typeColor}`,
        borderRadius: 1.5,
        cursor: 'pointer',
        transition: 'all 0.15s',
        '&:hover': { borderColor: '#d1d5db', bgcolor: '#fafafa' },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 11, color: '#999', mb: 0.25 }}>
            {new Date(request.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
          </Typography>
          <Typography sx={{ fontWeight: 500, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {type === 'creative' ? request.creative_work_request : 
             type === 'campaign' ? request.campaign_name :
             request.incentive_title}
          </Typography>
          <Typography sx={{ fontSize: 11, color: '#999', mt: 0.25 }}>
            {type === 'incentive' && request.incentive_amount ? `₺${request.incentive_amount?.toLocaleString()}` : ''}
            {type === 'creative' && request.quantity_request ? `${request.quantity_request} adet` : ''}
            {type === 'campaign' && request.budget ? `₺${request.budget?.toLocaleString()}` : ''}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1 }}>
          <Chip
            label={getTypeLabel(type)}
            size="small"
            sx={{ bgcolor: typeColor, color: 'white', fontWeight: 600, fontSize: 10, height: 20, '& .MuiChip-label': { px: 1 } }}
          />
          <Chip
            label={getStatusLabel(request.status)}
            size="small"
            sx={{ bgcolor: getStatusColor(request.status), color: 'white', fontWeight: 500, fontSize: 10, height: 20, '& .MuiChip-label': { px: 1 } }}
          />
        </Box>
      </Box>
    </Paper>
  );
};

export const DealerDashboard = () => {
  const { data: identity } = useGetIdentity();
  const theme = useTheme();
  const navigate = useNavigate();

  const handleRequestClick = (request: any) => {
    if (request.type === 'creative') {
      navigate(`/dealer/creative-requests/${request.id}`);
    } else if (request.type === 'campaign') {
      navigate(`/dealer/campaign-requests/${request.id}`);
    } else {
      navigate(`/dealer/incentive-requests/${request.id}`);
    }
  };

  const { data: dealer } = useGetOne(
    'dealers',
    { id: identity?.dealer_id },
    { enabled: !!identity?.dealer_id }
  );

  const { data: creativeRequests } = useGetList('creatives/requests', {
    pagination: { page: 1, perPage: 5 },
    sort: { field: 'created_at', order: 'DESC' },
  });

  const { data: incentiveRequests } = useGetList('incentives/requests', {
    pagination: { page: 1, perPage: 5 },
    sort: { field: 'created_at', order: 'DESC' },
  });

  const { data: campaignRequests } = useGetList('campaigns/requests', {
    pagination: { page: 1, perPage: 5 },
    sort: { field: 'created_at', order: 'DESC' },
  });

  const totalCreative = creativeRequests?.length || 0;
  const totalIncentive = incentiveRequests?.length || 0;
  const totalCampaign = campaignRequests?.length || 0;
  
  const pendingStatuses = ['bekliyor', 'onay_bekliyor', 'gorsel_bekliyor', 'bayi_onayi_bekliyor'];
  const pendingCreative = creativeRequests?.filter((r: any) => pendingStatuses.includes(r.status)).length || 0;
  const pendingIncentive = incentiveRequests?.filter((r: any) => pendingStatuses.includes(r.status)).length || 0;
  const pendingCampaign = campaignRequests?.filter((r: any) => pendingStatuses.includes(r.status)).length || 0;
  
  const approvedStatuses = ['onaylandi', 'tamamlandi', 'yayinda'];
  const approvedTotal =
    (creativeRequests?.filter((r: any) => approvedStatuses.includes(r.status)).length || 0) +
    (incentiveRequests?.filter((r: any) => approvedStatuses.includes(r.status)).length || 0) +
    (campaignRequests?.filter((r: any) => approvedStatuses.includes(r.status)).length || 0);

  const allRequests = [
    ...(creativeRequests?.map((r: any) => ({ ...r, type: 'creative' })) || []),
    ...(incentiveRequests?.map((r: any) => ({ ...r, type: 'incentive' })) || []),
    ...(campaignRequests?.map((r: any) => ({ ...r, type: 'campaign' })) || []),
  ]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <Box sx={{ p: 2 }}>
      {/* Welcome */}
      <Paper
        elevation={0}
        sx={{
          mb: 2,
          p: 2,
          border: '1px solid #e5e7eb',
          borderRadius: 1.5,
          background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.dark} 100%)`,
        }}
      >
        <Typography sx={{ fontWeight: 600, fontSize: 16, mb: 0.5, color: '#fff' }}>
          Hoş geldiniz
        </Typography>
        <Typography sx={{ fontSize: 14, color: '#fff' }}>
          {dealer?.dealer_name || identity?.fullName}
        </Typography>
        {dealer?.city && dealer?.district && (
          <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', mt: 0.25 }}>
            {dealer.city} / {dealer.district}
          </Typography>
        )}
      </Paper>

      {/* Budget */}
      {dealer?.current_budget && (
        <Box sx={{ mb: 2 }}>
          <BudgetCard budget={dealer.current_budget} primaryColor={theme.palette.primary.main} />
        </Box>
      )}

      {/* Stats */}
      <Typography sx={{ fontWeight: 600, fontSize: 13, color: theme.palette.primary.main, mb: 1 }}>
        Özet
      </Typography>
      <Grid container spacing={1} sx={{ mb: 2 }}>
        <Grid size={{ xs: 3 }}>
          <StatCard title="Kreatif" value={totalCreative} color={theme.palette.primary.main} />
        </Grid>
        <Grid size={{ xs: 3 }}>
          <StatCard title="Teşvik" value={totalIncentive} color="#1E3A5F" />
        </Grid>
        <Grid size={{ xs: 3 }}>
          <StatCard title="Kampanya" value={totalCampaign} color="#0f766e" />
        </Grid>
        <Grid size={{ xs: 3 }}>
          <StatCard title="Bekleyen" value={pendingCreative + pendingIncentive + pendingCampaign} color="#b45309" />
        </Grid>
      </Grid>

      {/* Recent Requests */}
      <Typography sx={{ fontWeight: 600, fontSize: 13, color: theme.palette.primary.main, mb: 1 }}>
        Son Talepler
      </Typography>
      {allRequests.length > 0 ? (
        allRequests.map((request: any) => (
          <RequestCard 
            key={`${request.type}-${request.id}`} 
            request={request} 
            type={request.type} 
            primaryColor={theme.palette.primary.main}
            onClick={() => handleRequestClick(request)}
          />
        ))
      ) : (
        <Paper
          elevation={0}
          sx={{
            border: '1px solid #e5e7eb',
            borderRadius: 1.5,
            textAlign: 'center',
            py: 3,
            px: 2,
          }}
        >
          <Typography sx={{ fontSize: 13, color: '#999' }}>
            Henüz talep yok
          </Typography>
          <Typography sx={{ fontSize: 11, color: '#ccc', mt: 0.5 }}>
            Alt menüden yeni talep oluşturun
          </Typography>
        </Paper>
      )}
    </Box>
  );
};
