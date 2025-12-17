import { Paper, Typography, Box, Grid, Chip } from '@mui/material';
import { useGetIdentity, useGetOne, useGetList } from 'react-admin';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'onaylandi':
    case 'tamamlandi':
      return '#22c55e';
    case 'bekliyor':
    case 'onay_bekliyor':
    case 'gorsel_bekliyor':
    case 'bayi_onayi_bekliyor':
      return '#f59e0b';
    case 'reddedildi':
      return '#ef4444';
    case 'taslak':
      return '#9ca3af';
    default:
      return '#9ca3af';
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

const BudgetCard = ({ budget }: any) => (
  <Paper
    elevation={0}
    sx={{
      p: 2,
      border: '1px solid #e5e7eb',
      borderRadius: 1.5,
      bgcolor: '#1a1a2e',
    }}
  >
    <Typography sx={{ fontWeight: 600, fontSize: 13, mb: 1.5, color: '#fff' }}>
      {budget?.year || new Date().getFullYear()} Bütçe
    </Typography>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
      <Typography sx={{ fontSize: 12, color: '#9ca3af' }}>Toplam</Typography>
      <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#e5e7eb' }}>
        ₺{budget?.total_budget?.toLocaleString() || '0'}
      </Typography>
    </Box>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
      <Typography sx={{ fontSize: 12, color: '#9ca3af' }}>Kullanılan</Typography>
      <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#e5e7eb' }}>
        ₺{budget?.used_budget?.toLocaleString() || '0'}
      </Typography>
    </Box>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
      <Typography sx={{ fontSize: 12, color: '#9ca3af' }}>Kalan</Typography>
      <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#22c55e' }}>
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
          bgcolor: '#22c55e',
        }}
      />
    </Box>
    <Typography sx={{ fontSize: 10, mt: 0.75, color: '#6b7280' }}>
      %{budget?.usage_percentage?.toFixed(0) || '0'} kullanıldı
    </Typography>
  </Paper>
);

const RequestCard = ({ request, type }: any) => (
  <Paper
    elevation={0}
    sx={{
      mb: 1,
      p: 1.5,
      border: '1px solid #e5e7eb',
      borderRadius: 1.5,
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontWeight: 500,
            fontSize: 13,
            mb: 0.25,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {type === 'creative' ? request.creative_work_request : request.incentive_title}
        </Typography>
        <Typography sx={{ fontSize: 11, color: '#999' }}>
          {type === 'creative' ? 'Kreatif' : 'Teşvik'} ·{' '}
          {new Date(request.created_at).toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'short',
          })}
          {type === 'incentive' && request.incentive_amount && (
            <> · ₺{request.incentive_amount?.toLocaleString()}</>
          )}
        </Typography>
      </Box>
      <Chip
        label={getStatusLabel(request.status)}
        size="small"
        sx={{
          bgcolor: `${getStatusColor(request.status)}15`,
          color: getStatusColor(request.status),
          fontWeight: 500,
          fontSize: 10,
          height: 20,
          ml: 1,
          '& .MuiChip-label': { px: 1 },
        }}
      />
    </Box>
  </Paper>
);

export const DealerDashboard = () => {
  const { data: identity } = useGetIdentity();

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

  const totalCreative = creativeRequests?.length || 0;
  const totalIncentive = incentiveRequests?.length || 0;
  const pendingCreative =
    creativeRequests?.filter((r: any) =>
      ['bekliyor', 'onay_bekliyor', 'gorsel_bekliyor', 'bayi_onayi_bekliyor'].includes(r.status)
    ).length || 0;
  const pendingIncentive =
    incentiveRequests?.filter((r: any) =>
      ['bekliyor', 'onay_bekliyor', 'gorsel_bekliyor', 'bayi_onayi_bekliyor'].includes(r.status)
    ).length || 0;
  const approvedTotal =
    (creativeRequests?.filter((r: any) => ['onaylandi', 'tamamlandi'].includes(r.status)).length || 0) +
    (incentiveRequests?.filter((r: any) => ['onaylandi', 'tamamlandi'].includes(r.status)).length || 0);

  const allRequests = [
    ...(creativeRequests?.map((r: any) => ({ ...r, type: 'creative' })) || []),
    ...(incentiveRequests?.map((r: any) => ({ ...r, type: 'incentive' })) || []),
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
          bgcolor: '#1a1a2e',
        }}
      >
        <Typography sx={{ fontWeight: 600, fontSize: 16, mb: 0.5, color: '#fff' }}>
          Hoş geldiniz
        </Typography>
        <Typography sx={{ fontSize: 14, color: '#e5e7eb' }}>
          {dealer?.dealer_name || identity?.fullName}
        </Typography>
        {dealer?.city && dealer?.district && (
          <Typography sx={{ fontSize: 12, color: '#9ca3af', mt: 0.25 }}>
            {dealer.city} / {dealer.district}
          </Typography>
        )}
      </Paper>

      {/* Budget */}
      {dealer?.current_budget && (
        <Box sx={{ mb: 2 }}>
          <BudgetCard budget={dealer.current_budget} />
        </Box>
      )}

      {/* Stats */}
      <Typography sx={{ fontWeight: 600, fontSize: 13, color: '#1a1a2e', mb: 1 }}>
        Özet
      </Typography>
      <Grid container spacing={1} sx={{ mb: 2 }}>
        <Grid size={{ xs: 3 }}>
          <StatCard title="Kreatif" value={totalCreative} color="#3b82f6" />
        </Grid>
        <Grid size={{ xs: 3 }}>
          <StatCard title="Teşvik" value={totalIncentive} color="#f59e0b" />
        </Grid>
        <Grid size={{ xs: 3 }}>
          <StatCard title="Bekleyen" value={pendingCreative + pendingIncentive} color="#f59e0b" />
        </Grid>
        <Grid size={{ xs: 3 }}>
          <StatCard title="Onaylı" value={approvedTotal} color="#22c55e" />
        </Grid>
      </Grid>

      {/* Recent Requests */}
      <Typography sx={{ fontWeight: 600, fontSize: 13, color: '#1a1a2e', mb: 1 }}>
        Son Talepler
      </Typography>
      {allRequests.length > 0 ? (
        allRequests.map((request: any) => (
          <RequestCard key={`${request.type}-${request.id}`} request={request} type={request.type} />
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
