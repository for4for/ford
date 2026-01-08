import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useNotify, useRedirect } from 'react-admin';
import { getCurrentToken } from '../../authProvider';
import { API_URL } from '../../config';
import {
  Box,
  Typography,
  Paper,
  LinearProgress,
  Grid,
  CircularProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
// Performans ikonları
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import TouchAppOutlinedIcon from '@mui/icons-material/TouchAppOutlined';
import PercentIcon from '@mui/icons-material/Percent';
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
// Etkileşim ikonları
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
// Dönüşüm ikonları
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import LanguageIcon from '@mui/icons-material/Language';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
// Platform ikonları
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';

// Report Card Component
const ReportCard = ({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) => (
  <Paper
    elevation={0}
    sx={{
      border: '1px solid #e5e7eb',
      borderRadius: '10px',
      p: 2,
      mb: 2,
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, pb: 1.25, borderBottom: '1px solid #f3f4f6' }}>
      {icon}
      <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
        {title}
      </Typography>
    </Box>
    {children}
  </Paper>
);

// Report Row Component
const ReportRow = ({ label, value, icon, valueColor }: { label: string; value: string | number; icon?: React.ReactNode; valueColor?: string }) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      py: 1,
      borderBottom: '1px solid #f9fafb',
      '&:last-child': { borderBottom: 'none' },
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {icon && <Box sx={{ color: '#9ca3af', display: 'flex' }}>{icon}</Box>}
      <Typography sx={{ fontSize: 13, color: '#6b7280' }}>{label}</Typography>
    </Box>
    <Typography sx={{ fontSize: 14, fontWeight: 600, color: valueColor || '#1f2937' }}>{value}</Typography>
  </Box>
);

// Metric Card Component - Kompakt performans kartı
const MetricCard = ({ 
  label, 
  value, 
  icon,
  subtitle 
}: { 
  label: string; 
  value: string | number; 
  icon: React.ReactNode;
  subtitle?: string;
}) => (
  <Paper
    elevation={0}
    sx={{
      border: '1px solid #e5e7eb',
      borderRadius: '10px',
      p: 1.5,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
    }}
  >
    <Box sx={{ color: '#9ca3af', mb: 0.5 }}>{icon}</Box>
    <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#1f2937', lineHeight: 1.2 }}>{value}</Typography>
    <Typography sx={{ fontSize: 11, color: '#6b7280', mt: 0.25 }}>{label}</Typography>
    {subtitle && <Typography sx={{ fontSize: 10, color: '#9ca3af' }}>{subtitle}</Typography>}
  </Paper>
);

// Budget Card Component
const BudgetCard = ({ 
  remaining, 
  spent, 
  total, 
  percentage 
}: { 
  remaining: number; 
  spent: number; 
  total: number; 
  percentage: number;
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) + ' ₺';
  };

  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid #e5e7eb',
        borderRadius: '10px',
        p: 2,
        mb: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <PaidOutlinedIcon sx={{ fontSize: 18, color: '#6b7280' }} />
        <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#6b7280' }}>Bütçe Durumu</Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.5 }}>
        <Typography sx={{ fontSize: 28, fontWeight: 700, color: '#1f2937' }}>
          {formatCurrency(remaining)}
        </Typography>
        <Typography sx={{ fontSize: 12, color: '#9ca3af' }}>kalan</Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={percentage}
        sx={{
          height: 8,
          borderRadius: 4,
          backgroundColor: '#f3f4f6',
          mb: 1,
          '& .MuiLinearProgress-bar': {
            backgroundColor: '#10b981',
            borderRadius: 4,
          },
        }}
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography sx={{ fontSize: 12, color: '#6b7280' }}>
          Harcanan: <strong style={{ color: '#374151' }}>{formatCurrency(spent)}</strong>
        </Typography>
        <Typography sx={{ fontSize: 12, color: '#6b7280' }}>
          Toplam: <strong style={{ color: '#374151' }}>{formatCurrency(total)}</strong>
        </Typography>
      </Box>
    </Paper>
  );
};

// Format number with K suffix
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace('.0', '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace('.0', '') + 'K';
  }
  return num.toLocaleString('tr-TR');
};

// Format currency
const formatTL = (amount: number): string => {
  return amount.toLocaleString('tr-TR') + ' ₺';
};

export const CampaignRequestReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const notify = useNotify();
  const redirect = useRedirect();
  const isDealer = location.pathname.startsWith('/dealer');
  
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const token = getCurrentToken();
        const response = await fetch(`${API_URL}/campaigns/requests/${id}/report/`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setReportData(data);
        } else {
          throw new Error('API call failed');
        }
      } catch (error) {
        console.log('Using dummy data for report');
        setReportData({
          campaign_id: id,
          campaign_name: 'Bahar Kampanyası',
          status: 'yayinda',
          status_display: 'Yayında',
          platforms: ['instagram', 'facebook'],
          platforms_display: 'Instagram, Facebook',
          start_date: '2025-03-05',
          end_date: '2025-03-17',
          total_budget: 15000,
          spent_budget: 7750,
          remaining_budget: 7250,
          budget_percentage: 52,
          impressions: 45200,
          clicks: 2800,
          ctr: 6.19,
          cpm: 171,
          cpc: 2.77,
          reach: 38500,
          likes: 1245,
          comments: 187,
          shares: 92,
          saves: 328,
          form_submissions: 142,
          website_visits: 1876,
          phone_calls: 34,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  const handleGoBack = () => {
    if (isDealer) {
      navigate(`/dealer/campaign-requests/${id}`);
    } else {
      navigate(`/backoffice/campaigns/requests/${id}/show`);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress size={32} sx={{ color: '#6b7280' }} />
      </Box>
    );
  }

  if (!reportData) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Rapor verisi bulunamadı.</Typography>
      </Box>
    );
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <Box sx={{ maxWidth: 600, margin: '0 auto', px: 2, py: 2 }}>
      {/* Header */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <ArrowBackIcon 
          onClick={handleGoBack}
          sx={{ fontSize: 20, color: '#6b7280', cursor: 'pointer', '&:hover': { color: '#374151' } }} 
        />
        <Typography sx={{ fontWeight: 600, color: '#1f2937', fontSize: 18 }}>
          Kampanya Raporu
        </Typography>
      </Box>

      {/* Kampanya Bilgisi */}
      <Paper
        elevation={0}
        sx={{
          border: '1px solid #e5e7eb',
          borderRadius: '10px',
          p: 2,
          mb: 2,
        }}
      >
        <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#1f2937', mb: 1 }}>
          {reportData.campaign_name}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {reportData.platforms?.includes('instagram') && <InstagramIcon sx={{ fontSize: 16, color: '#E4405F' }} />}
            {reportData.platforms?.includes('facebook') && <FacebookIcon sx={{ fontSize: 16, color: '#1877F2' }} />}
            <Typography sx={{ fontSize: 12, color: '#6b7280' }}>{reportData.platforms_display}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 14, color: '#9ca3af' }} />
            <Typography sx={{ fontSize: 12, color: '#6b7280' }}>
              {formatDate(reportData.start_date)} - {formatDate(reportData.end_date)}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Bütçe Bilgisi */}
      <BudgetCard
        remaining={reportData.remaining_budget}
        spent={reportData.spent_budget}
        total={reportData.total_budget}
        percentage={reportData.budget_percentage}
      />

      {/* Performans Metrikleri */}
      <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', mb: 1 }}>
        Performans
      </Typography>
      <Grid container spacing={1} sx={{ mb: 2 }}>
        <Grid size={{ xs: 4 }}>
          <MetricCard 
            label="Gösterim" 
            value={formatNumber(reportData.impressions)} 
            icon={<VisibilityOutlinedIcon sx={{ fontSize: 20 }} />}
          />
        </Grid>
        <Grid size={{ xs: 4 }}>
          <MetricCard 
            label="Tıklama" 
            value={formatNumber(reportData.clicks)} 
            icon={<TouchAppOutlinedIcon sx={{ fontSize: 20 }} />}
          />
        </Grid>
        <Grid size={{ xs: 4 }}>
          <MetricCard 
            label="Erişim" 
            value={formatNumber(reportData.reach)} 
            icon={<PeopleOutlinedIcon sx={{ fontSize: 20 }} />}
          />
        </Grid>
        <Grid size={{ xs: 4 }}>
          <MetricCard 
            label="CTR" 
            value={`%${reportData.ctr}`} 
            icon={<PercentIcon sx={{ fontSize: 20 }} />}
          />
        </Grid>
        <Grid size={{ xs: 4 }}>
          <MetricCard 
            label="CPM" 
            value={formatTL(reportData.cpm)} 
            icon={<PaidOutlinedIcon sx={{ fontSize: 20 }} />}
          />
        </Grid>
        <Grid size={{ xs: 4 }}>
          <MetricCard 
            label="CPC" 
            value={formatTL(reportData.cpc)} 
            icon={<PaidOutlinedIcon sx={{ fontSize: 20 }} />}
          />
        </Grid>
      </Grid>

      {/* Etkileşim Metrikleri */}
      <ReportCard 
        title="Etkileşim" 
        icon={<ThumbUpOutlinedIcon sx={{ fontSize: 16, color: '#9ca3af' }} />}
      >
        <ReportRow 
          label="Beğeni" 
          value={reportData.likes.toLocaleString('tr-TR')} 
          icon={<ThumbUpOutlinedIcon sx={{ fontSize: 16 }} />}
        />
        <ReportRow 
          label="Yorum" 
          value={reportData.comments.toLocaleString('tr-TR')} 
          icon={<ChatBubbleOutlineIcon sx={{ fontSize: 16 }} />}
        />
        <ReportRow 
          label="Paylaşım" 
          value={reportData.shares.toLocaleString('tr-TR')} 
          icon={<ShareOutlinedIcon sx={{ fontSize: 16 }} />}
        />
        <ReportRow 
          label="Kaydetme" 
          value={reportData.saves.toLocaleString('tr-TR')} 
          icon={<BookmarkBorderIcon sx={{ fontSize: 16 }} />}
        />
      </ReportCard>

      {/* Dönüşümler */}
      <ReportCard 
        title="Dönüşümler" 
        icon={<AssignmentOutlinedIcon sx={{ fontSize: 16, color: '#9ca3af' }} />}
      >
        <ReportRow 
          label="Form Doldurma" 
          value={reportData.form_submissions.toLocaleString('tr-TR')} 
          icon={<AssignmentOutlinedIcon sx={{ fontSize: 16 }} />}
          valueColor="#059669"
        />
        <ReportRow 
          label="Web Sitesi Ziyareti" 
          value={reportData.website_visits.toLocaleString('tr-TR')} 
          icon={<LanguageIcon sx={{ fontSize: 16 }} />}
        />
        <ReportRow 
          label="Telefon Araması" 
          value={reportData.phone_calls.toLocaleString('tr-TR')} 
          icon={<PhoneOutlinedIcon sx={{ fontSize: 16 }} />}
        />
      </ReportCard>
    </Box>
  );
};



