import {
  Box,
  Paper,
  Typography,
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useBrand } from '../../context/BrandContext';
import { useGetList } from 'react-admin';
import { useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'onaylandi':
    case 'tamamlandi':
      return '#166534'; // Koyu yeşil
    case 'bekliyor':
    case 'onay_bekliyor':
    case 'gorsel_bekliyor':
    case 'bayi_onayi_bekliyor':
    case 'degerlendirme':
      return '#b45309'; // Koyu amber
    case 'yayinda':
      return '#1d4ed8'; // Mavi
    case 'reddedildi':
      return '#991b1b'; // Koyu kırmızı
    case 'taslak':
      return '#4b5563'; // Koyu gri
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
const RequestCard = ({ request, type, onClick, primaryColor }: any) => {
  const typeColor = getTypeColor(type, primaryColor);
  return (
    <Paper
      onClick={onClick}
      elevation={0}
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

export const MyRequestsList = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { buildUrl } = useBrand();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  // Minimal input styles with theme
  const inputStyles = {
    '& .MuiOutlinedInput-root': {
      fontSize: 13,
      backgroundColor: '#fafafa',
      '& fieldset': { borderColor: '#e5e7eb' },
      '&:hover fieldset': { borderColor: '#d1d5db' },
      '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
    },
    '& .MuiInputLabel-root': { fontSize: 13 },
  };

  // Get creative requests
  const { data: creativeRequests, isLoading: creativeLoading } = useGetList('creatives/requests', {
    pagination: { page: 1, perPage: 100 },
    sort: { field: 'created_at', order: 'DESC' },
  });

  // Get incentive requests
  const { data: incentiveRequests, isLoading: incentiveLoading } = useGetList(
    'incentives/requests',
    {
      pagination: { page: 1, perPage: 100 },
      sort: { field: 'created_at', order: 'DESC' },
    }
  );

  // Get campaign requests
  const { data: campaignRequests, isLoading: campaignLoading } = useGetList(
    'campaigns/requests',
    {
      pagination: { page: 1, perPage: 100 },
      sort: { field: 'created_at', order: 'DESC' },
    }
  );

  const isLoading = creativeLoading || incentiveLoading || campaignLoading;

  // Combine and filter requests
  const allRequests = [
    ...(creativeRequests?.map((r: any) => ({ ...r, type: 'creative' })) || []),
    ...(incentiveRequests?.map((r: any) => ({ ...r, type: 'incentive' })) || []),
    ...(campaignRequests?.map((r: any) => ({ ...r, type: 'campaign' })) || []),
  ]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .filter((request) => {
      // Filter by search query
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const title =
          request.type === 'creative'
            ? request.creative_work_request
            : request.type === 'campaign'
            ? request.campaign_name
            : request.incentive_title;
        if (!title?.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Filter by status
      if (filterStatus !== 'all' && request.status !== filterStatus) {
        return false;
      }

      // Filter by type
      if (filterType !== 'all' && request.type !== filterType) {
        return false;
      }

      return true;
    });

  const handleRequestClick = (request: any) => {
    if (request.type === 'creative') {
      navigate(buildUrl(`/dealer/creative-requests/${request.id}`));
    } else if (request.type === 'campaign') {
      navigate(buildUrl(`/dealer/campaign-requests/${request.id}`));
    } else {
      navigate(buildUrl(`/dealer/incentive-requests/${request.id}`));
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Typography sx={{ fontWeight: 600, fontSize: 16, color: theme.palette.primary.main, mb: 2 }}>
        Taleplerim
      </Typography>

      {/* Filters */}
      <Paper elevation={0} sx={{ mb: 2, p: 1.5, border: '1px solid #e5e7eb', borderRadius: 1.5 }}>
        {/* Search */}
        <TextField
          fullWidth
          placeholder="Ara..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: '#999', fontSize: 18 }} />,
          }}
          sx={{ ...inputStyles, mb: 2 }}
          size="small"
        />

        {/* Status and Type Filters */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl fullWidth size="small" sx={inputStyles}>
            <InputLabel sx={{ fontSize: 13 }}>Durum</InputLabel>
            <Select
              value={filterStatus}
              label="Durum"
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <MenuItem value="all" sx={{ fontSize: 13 }}>Tümü</MenuItem>
              <MenuItem value="bekliyor" sx={{ fontSize: 13 }}>Bekliyor</MenuItem>
              <MenuItem value="onaylandi" sx={{ fontSize: 13 }}>Onaylı</MenuItem>
              <MenuItem value="reddedildi" sx={{ fontSize: 13 }}>Reddedildi</MenuItem>
              <MenuItem value="taslak" sx={{ fontSize: 13 }}>Taslak</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth size="small" sx={inputStyles}>
            <InputLabel sx={{ fontSize: 13 }}>Tip</InputLabel>
            <Select
              value={filterType}
              label="Tip"
              onChange={(e) => setFilterType(e.target.value)}
            >
              <MenuItem value="all" sx={{ fontSize: 13 }}>Tümü</MenuItem>
              <MenuItem value="creative" sx={{ fontSize: 13 }}>Kreatif</MenuItem>
              <MenuItem value="incentive" sx={{ fontSize: 13 }}>Teşvik</MenuItem>
              <MenuItem value="campaign" sx={{ fontSize: 13 }}>Kampanya</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Summary Stats */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 0.75,
          mb: 2,
        }}
      >
        <Paper elevation={0} sx={{ textAlign: 'center', p: 1, border: '1px solid #e5e7eb', borderRadius: 1 }}>
          <Typography sx={{ fontWeight: 600, fontSize: 16, color: theme.palette.primary.main }}>
            {allRequests.length}
          </Typography>
          <Typography sx={{ fontSize: 10, color: '#999' }}>
            Toplam
          </Typography>
        </Paper>
        <Paper elevation={0} sx={{ textAlign: 'center', p: 1, border: '1px solid #e5e7eb', borderRadius: 1 }}>
          <Typography sx={{ fontWeight: 600, fontSize: 16, color: '#b45309' }}>
            {allRequests.filter((r) => ['bekliyor', 'onay_bekliyor', 'gorsel_bekliyor', 'bayi_onayi_bekliyor'].includes(r.status)).length}
          </Typography>
          <Typography sx={{ fontSize: 10, color: '#999' }}>
            Bekliyor
          </Typography>
        </Paper>
        <Paper elevation={0} sx={{ textAlign: 'center', p: 1, border: '1px solid #e5e7eb', borderRadius: 1 }}>
          <Typography sx={{ fontWeight: 600, fontSize: 16, color: '#166534' }}>
            {allRequests.filter((r) => ['onaylandi', 'tamamlandi'].includes(r.status)).length}
          </Typography>
          <Typography sx={{ fontSize: 10, color: '#999' }}>
            Onaylı
          </Typography>
        </Paper>
        <Paper elevation={0} sx={{ textAlign: 'center', p: 1, border: '1px solid #e5e7eb', borderRadius: 1 }}>
          <Typography sx={{ fontWeight: 600, fontSize: 16, color: '#991b1b' }}>
            {allRequests.filter((r) => r.status === 'reddedildi').length}
          </Typography>
          <Typography sx={{ fontSize: 10, color: '#999' }}>
            Ret
          </Typography>
        </Paper>
      </Box>

      {/* Requests List */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={24} sx={{ color: '#999' }} />
        </Box>
      ) : allRequests.length > 0 ? (
        allRequests.map((request: any) => (
          <RequestCard
            key={`${request.type}-${request.id}`}
            request={request}
            type={request.type}
            onClick={() => handleRequestClick(request)}
            primaryColor={theme.palette.primary.main}
          />
        ))
      ) : (
        <Paper
          elevation={0}
          sx={{
            border: '1px solid #e5e7eb',
            borderRadius: 1.5,
            textAlign: 'center',
            py: 4,
            px: 2,
          }}
        >
          <Typography sx={{ fontSize: 13, color: '#999' }}>
            {searchQuery || filterStatus !== 'all' || filterType !== 'all'
              ? 'Sonuç bulunamadı'
              : 'Henüz talep yok'}
          </Typography>
          {!searchQuery && filterStatus === 'all' && filterType === 'all' && (
            <Typography sx={{ fontSize: 11, color: '#ccc', mt: 0.5 }}>
              Alt menüden yeni talep oluşturun
            </Typography>
          )}
        </Paper>
      )}
    </Box>
  );
};

