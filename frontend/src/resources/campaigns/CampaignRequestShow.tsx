import {
  Show,
  useRecordContext,
  useUpdate,
  useNotify,
  useRefresh,
  usePermissions,
  useRedirect,
} from 'react-admin';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useBrand } from '../../context/BrandContext';
import {
  Box,
  Typography,
  Chip,
  Select,
  MenuItem,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Link,
  Paper,
  Divider,
  Alert,
  Avatar,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { FormContainer, FormHeader } from '../../components/FormFields';
import EditIcon from '@mui/icons-material/Edit';
import BarChartIcon from '@mui/icons-material/BarChart';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import VerifiedIcon from '@mui/icons-material/Verified';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import EditNoteIcon from '@mui/icons-material/EditNote';
import ForwardToInboxIcon from '@mui/icons-material/ForwardToInbox';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useState } from 'react';

// Feature flag: Kampanya Türü Seçimi (Link vs Görsel Yükleme)
// Ford için true, Tofaş için false
const ENABLE_CAMPAIGN_TYPE_SELECTION = false;

// Kurumsal durum renkleri
const statusColors: Record<string, string> = {
  taslak: '#4b5563',
  onay_bekliyor: '#b45309',
  onaylandi: '#166534',
  reddedildi: '#991b1b',
  yayinda: '#1d4ed8',
  tamamlandi: '#166534',
};

// Section Title
const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <Typography
    sx={{
      fontSize: 13,
      fontWeight: 600,
      color: '#999',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      mb: 2,
      mt: 1,
    }}
  >
    {children}
  </Typography>
);

// Summary Row Component
const SummaryRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <Box sx={{ display: 'flex', mb: 1.5 }}>
    <Typography sx={{ fontWeight: 500, color: '#666', width: 180, flexShrink: 0, fontSize: 14 }}>
      {label}
    </Typography>
    <Box sx={{ color: '#333', flex: 1, fontSize: 14 }}>
      {children}
    </Box>
  </Box>
);

// Reklam modeli preview kutusu
const AdModelPreview = ({ isFormModel }: { isFormModel: boolean }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
    <Box
      sx={{
        width: 60,
        height: 60,
        border: '1px solid #ddd',
        borderRadius: '4px',
        backgroundColor: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#999',
        fontSize: 20,
      }}
    >
      ✕
    </Box>
    <Typography sx={{ fontSize: 12, color: '#666' }}>
      {isFormModel ? '(Lead toplama odaklıdır)' : '(Beğeni ve yorum ön plandadır)'}
    </Typography>
  </Box>
);

// Timeline Types
type TimelineType = 'created' | 'sent' | 'approved' | 'rejected' | 'note' | 'waiting' | 'live' | 'completed';

// Kurumsal timeline renkleri
const timelineConfig: Record<TimelineType, { icon: React.ReactNode; color: string; bgColor: string }> = {
  created: { 
    icon: <AddCircleOutlineIcon sx={{ fontSize: 18 }} />, 
    color: '#1E3A5F', 
    bgColor: '#e8f4fc' 
  },
  sent: { 
    icon: <ForwardToInboxIcon sx={{ fontSize: 18 }} />, 
    color: '#1d4ed8', 
    bgColor: '#eff6ff' 
  },
  approved: { 
    icon: <VerifiedIcon sx={{ fontSize: 18 }} />, 
    color: '#166534', 
    bgColor: '#f0fdf4' 
  },
  rejected: { 
    icon: <CancelIcon sx={{ fontSize: 18 }} />, 
    color: '#991b1b', 
    bgColor: '#fef2f2' 
  },
  note: { 
    icon: <EditNoteIcon sx={{ fontSize: 18 }} />, 
    color: '#b45309', 
    bgColor: '#fffbeb' 
  },
  waiting: { 
    icon: <HourglassEmptyIcon sx={{ fontSize: 18 }} />, 
    color: '#4b5563', 
    bgColor: '#f9fafb' 
  },
  live: { 
    icon: <PlayArrowIcon sx={{ fontSize: 18 }} />, 
    color: '#1d4ed8', 
    bgColor: '#eff6ff' 
  },
  completed: { 
    icon: <CheckCircleIcon sx={{ fontSize: 18 }} />, 
    color: '#166534', 
    bgColor: '#f0fdf4' 
  },
};

// Timeline Item Component
const TimelineItem = ({ 
  title, 
  date, 
  note, 
  type = 'note',
  isLast = false 
}: { 
  title: string; 
  date: string; 
  note?: string;
  type?: TimelineType;
  isLast?: boolean;
}) => {
  const config = timelineConfig[type];
  
  return (
    <Box sx={{ display: 'flex', position: 'relative', pb: isLast ? 0 : 2.5, minHeight: isLast ? 'auto' : 70 }}>
      {/* Timeline Icon */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        mr: 2.5,
        position: 'relative',
        zIndex: 1,
      }}>
        <Avatar 
          sx={{ 
            width: 32, 
            height: 32, 
            bgcolor: config.bgColor,
            color: config.color,
            border: `2px solid ${config.color}`,
          }}
        >
          {config.icon}
        </Avatar>
      </Box>
      
      {/* Content */}
      <Box sx={{ flex: 1, pt: 0.5 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          mb: 0.5
        }}>
          <Typography sx={{ fontWeight: 600, color: '#333', fontSize: 13 }}>
            {title}
          </Typography>
          {date && (
            <Typography sx={{ color: '#9ca3af', fontSize: 11 }}>
              {date}
            </Typography>
          )}
        </Box>
        
        {note && (
          <Box sx={{ 
            bgcolor: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderLeft: `3px solid ${config.color}`,
            padding: '8px 12px', 
            mt: 0.75, 
            borderRadius: '0 6px 6px 0', 
            fontSize: 12, 
            color: '#6b7280',
          }}>
            {note}
          </Box>
        )}
      </Box>
    </Box>
  );
};

// Timeline Container - dikey çizgi ile
const TimelineContainer = ({ children }: { children: React.ReactNode }) => (
  <Box sx={{ 
    position: 'relative',
    pl: 0,
    '&::before': {
      content: '""',
      position: 'absolute',
      left: 15, // Avatar'ın ortası (32px / 2 = 16, border için -1)
      top: 16,
      bottom: 16,
      width: 2,
      bgcolor: '#e5e7eb',
      borderRadius: 1,
    }
  }}>
    {children}
  </Box>
);

// Main Content Component
const CampaignRequestShowContent = () => {
  const record = useRecordContext();
  const [update] = useUpdate();
  const notify = useNotify();
  const refresh = useRefresh();
  const redirect = useRedirect();
  const { permissions } = usePermissions();
  const location = useLocation();
  const navigate = useNavigate();
  const { buildUrl } = useBrand();
  const isDealer = location.pathname.includes('/dealer/');
  
  const [approvalStatus, setApprovalStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const isAdmin = permissions === 'admin';
  const isModerator = permissions === 'moderator';
  const canApprove = isAdmin || isModerator;

  if (!record) return null;

  // Format currency
  const formatCurrency = (amount: number | string | null | undefined) => {
    if (amount === null || amount === undefined) return '-';
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Format date
  const formatDate = (date: string | null | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('tr-TR');
  };

  // Format datetime
  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('tr-TR');
  };

  // Parse admin notes for timeline
  const parseAdminNotes = () => {
    const notes: { title: string; date: string; note?: string; type: TimelineType }[] = [];
    
    // İlk kayıt - Oluşturulma
    notes.push({
      title: 'Kampanya talebi oluşturuldu',
      date: formatDateTime(record.created_at),
      type: 'created',
    });

    // Admin notlarından timeline item'ları çıkar
    if (record.admin_notes) {
      const noteLines = record.admin_notes.split('\n').filter((line: string) => line.trim());
      noteLines.forEach((line: string) => {
        // Format: [Birim'e Gönderildi - Tarih]: Not (opsiyonel)
        // veya: [Birim'e Gönderildi - Tarih]
        const matchWithNote = line.match(/\[(.+?)\s*-\s*(.+?)\]:\s*(.+)/);
        const matchWithoutNote = line.match(/\[(.+?)\s*-\s*(.+?)\]$/);
        const matchOldFormat = line.match(/\[(.+?)\]:\s*(.+)/);
        
        if (matchWithNote) {
          // [Birim'e Gönderildi - Tarih]: Not
          const titleLower = matchWithNote[1].toLowerCase();
          let type: TimelineType = 'note';
          
          if (titleLower.includes('gönderildi')) {
            type = 'sent';
          } else if (titleLower.includes('onaylandı')) {
            type = 'approved';
          } else if (titleLower.includes('reddedildi')) {
            type = 'rejected';
          } else if (titleLower.includes('yayın') || titleLower.includes('yayına')) {
            type = 'live';
          } else if (titleLower.includes('tamamlandı')) {
            type = 'completed';
          }
          
          notes.push({
            title: matchWithNote[1],
            date: matchWithNote[2],
            note: matchWithNote[3],
            type,
          });
        } else if (matchWithoutNote) {
          // [Birim'e Gönderildi - Tarih]
          const titleLower = matchWithoutNote[1].toLowerCase();
          let type: TimelineType = 'note';
          
          if (titleLower.includes('gönderildi')) {
            type = 'sent';
          } else if (titleLower.includes('onaylandı')) {
            type = 'approved';
          } else if (titleLower.includes('reddedildi')) {
            type = 'rejected';
          } else if (titleLower.includes('yayın') || titleLower.includes('yayına')) {
            type = 'live';
          } else if (titleLower.includes('tamamlandı')) {
            type = 'completed';
          }
          
          notes.push({
            title: matchWithoutNote[1],
            date: matchWithoutNote[2],
            type,
          });
        } else if (matchOldFormat) {
          // Eski format: [Başlık]: Not
          const titleLower = matchOldFormat[1].toLowerCase();
          let type: TimelineType = 'note';
          
          if (titleLower.includes('istek') || titleLower.includes('gönderildi')) {
            type = 'sent';
          } else if (titleLower.includes('onay')) {
            type = 'approved';
          } else if (titleLower.includes('red')) {
            type = 'rejected';
          }
          
          notes.push({
            title: matchOldFormat[1],
            date: '',
            note: matchOldFormat[2],
            type,
          });
        } else if (line.trim()) {
          notes.push({
            title: 'Admin Notu',
            date: formatDateTime(record.updated_at),
            note: line.trim(),
            type: 'note',
          });
        }
      });
    }

    return notes;
  };

  const timelineItems = parseAdminNotes();

  // Handle save
  const handleSave = async () => {
    if (!approvalStatus) {
      notify('Lütfen onay durumunu seçin', { type: 'warning' });
      return;
    }

    if (approvalStatus === 'reddedildi' && !adminNotes) {
      notify('Reddetme sebebini notlar bölümüne yazınız', { type: 'warning' });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const timestamp = new Date().toLocaleString('tr-TR');
      const statusLabel = approvalStatus === 'onaylandi' ? 'Onaylandı' : 
                          approvalStatus === 'reddedildi' ? 'Reddedildi' : 
                          approvalStatus === 'yayinda' ? 'Yayına Alındı' : 
                          approvalStatus === 'tamamlandi' ? 'Tamamlandı' : 'Güncellendi';
      
      let newNote = `[${statusLabel} - ${timestamp}]`;
      if (adminNotes) {
        newNote += `: ${adminNotes}`;
      }

      const updatedData: any = {
        dealer: record.dealer,
        campaign_name: record.campaign_name,
        budget: record.budget,
        start_date: record.start_date,
        end_date: record.end_date,
        platforms: record.platforms,
        campaign_type: record.campaign_type,
        fb_post_link: record.fb_post_link || '',
        ig_post_link: record.ig_post_link || '',
        post_images: record.post_images || [],
        story_images: record.story_images || [],
        redirect_type: record.redirect_type,
        ad_model: record.ad_model,
        notes: record.notes || '',
        status: approvalStatus,
        admin_notes: record.admin_notes 
          ? `${record.admin_notes}\n${newNote}`.trim() 
          : newNote
      };

      await update(
        'campaigns/requests',
        { 
          id: record.id, 
          data: updatedData,
          previousData: record 
        }
      );
      
      notify('Kampanya talebi kaydedildi', { type: 'success' });
      setApprovalStatus('');
      setAdminNotes('');
      refresh();
    } catch (error) {
      notify('Bir hata oluştu', { type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle request creation (for dealer)
  const handleCreateRequest = async () => {
    setIsSubmitting(true);
    try {
      await update(
        'campaigns/requests',
        { 
          id: record.id, 
          data: { ...record, status: 'onay_bekliyor' },
          previousData: record 
        }
      );
      setShowSuccess(true);
      notify('Kampanya talebiniz alındı', { type: 'success' });
    } catch (error) {
      notify('Bir hata oluştu', { type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    if (isDealer) {
      navigate(buildUrl('/dealer/requests'));
    } else {
      redirect('list', 'campaigns/requests');
    }
  };

  const handleViewReport = () => {
    if (isDealer) {
      navigate(buildUrl(`/dealer/campaign-requests/${record.id}/report`));
    } else {
      navigate(buildUrl(`/backoffice/campaigns/requests/${record.id}/report`));
    }
  };

  return (
    <FormContainer maxWidth={800}>
      {/* Header */}
      <FormHeader
        title="Kampanya Özet"
        subtitle={record.campaign_name}
        onBack={handleGoBack}
      >
        {/* Report Button - only for yayinda or tamamlandi */}
        {(record.status === 'yayinda' || record.status === 'tamamlandi') && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<BarChartIcon sx={{ fontSize: 16 }} />}
            onClick={handleViewReport}
            sx={{
              textTransform: 'none',
              fontSize: 13,
              borderColor: '#1d4ed8',
              color: '#1d4ed8',
              borderRadius: '8px',
              '&:hover': { borderColor: '#1d4ed8', bgcolor: '#eff6ff' },
            }}
          >
            Rapor
          </Button>
        )}
        {/* Edit Button - Admin/Moderator always, Dealer only for editable statuses */}
        {(!isDealer || (isDealer && !['tamamlandi', 'yayinda'].includes(record.status))) && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<EditIcon sx={{ fontSize: 16 }} />}
            onClick={() => {
              if (isDealer) {
                navigate(buildUrl(`/dealer/campaign-requests/${record.id}/edit`));
              } else {
                redirect('edit', 'campaigns/requests', record.id);
              }
            }}
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
        )}
        <Chip 
          label={record.status_display} 
          size="small"
          sx={{ 
            bgcolor: statusColors[record.status] || '#9e9e9e',
            color: 'white',
            fontWeight: 500,
            borderRadius: '8px',
          }} 
        />
      </FormHeader>

      <Paper 
        elevation={0} 
        sx={{ 
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          p: 4,
          backgroundColor: '#fff',
        }}
      >
        {/* 
          =====================================================
          KAMPANYA TÜRÜ - FORD İÇİN AKTİF EDİLECEK
          Tofaş için devre dışı (ENABLE_CAMPAIGN_TYPE_SELECTION = false)
          =====================================================
        */}
        {ENABLE_CAMPAIGN_TYPE_SELECTION && (
          <>
            <SectionTitle>Kampanya Türü</SectionTitle>
            <SummaryRow label="Tür">
              <Typography sx={{ fontSize: 14 }}>{record.campaign_type_display}</Typography>
            </SummaryRow>

            <Divider sx={{ my: 3, borderColor: '#eee' }} />
          </>
        )}

        {/* Kampanya Bilgileri */}
        <SectionTitle>Kampanya Bilgileri</SectionTitle>
        
        <SummaryRow label="Kampanya Adı">
          <Typography sx={{ fontSize: 14 }}>{record.campaign_name}</Typography>
        </SummaryRow>
        {record.brand_name && (
          <SummaryRow label="Marka">
            <Typography sx={{ fontSize: 14 }}>{record.brand_name}</Typography>
          </SummaryRow>
        )}
        <SummaryRow label="Bütçe">
          <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{formatCurrency(record.budget)}</Typography>
        </SummaryRow>
        <SummaryRow label="Süre">
          <Typography sx={{ fontSize: 14 }}>
            {formatDate(record.start_date)} - {formatDate(record.end_date)}
          </Typography>
        </SummaryRow>
        <SummaryRow label="Platform">
          <Typography sx={{ fontSize: 14 }}>{record.platforms_display}</Typography>
        </SummaryRow>

        {/* 
          =====================================================
          KAMPANYA DETAYLARI - FORD İÇİN AKTİF EDİLECEK
          Tofaş için devre dışı (ENABLE_CAMPAIGN_TYPE_SELECTION = false)
          =====================================================
        */}
        {ENABLE_CAMPAIGN_TYPE_SELECTION && (
          <>
            <Divider sx={{ my: 3, borderColor: '#eee' }} />

            {/* Kampanya Detayları - Link veya Görsel */}
            <SectionTitle>Kampanya Detayları</SectionTitle>
            
            {record.campaign_type === 'link' ? (
              <>
                {record.fb_post_link && (
                  <SummaryRow label="Facebook Post">
                    <Link href={record.fb_post_link} target="_blank" rel="noopener" sx={{ fontSize: 14 }}>
                      Postu Görüntüle
                    </Link>
                  </SummaryRow>
                )}
                {record.ig_post_link && (
                  <SummaryRow label="Instagram Post">
                    <Link href={record.ig_post_link} target="_blank" rel="noopener" sx={{ fontSize: 14 }}>
                      Postu Görüntüle
                    </Link>
                  </SummaryRow>
                )}
              </>
            ) : (
              <>
                <SummaryRow label="Post Görselleri">
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                    {record.post_images?.length > 0 ? (
                      record.post_images.map((img: string, idx: number) => (
                        <Box
                          key={idx}
                          sx={{
                            width: 60,
                            height: 60,
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            backgroundColor: '#f5f5f5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 10,
                            color: '#999',
                          }}
                        >
                          Post
                        </Box>
                      ))
                    ) : (
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          backgroundColor: '#f5f5f5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 10,
                          color: '#999',
                        }}
                      >
                        Post
                      </Box>
                    )}
                  </Box>
                </SummaryRow>
                <SummaryRow label="Story Görselleri">
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                    {record.story_images?.length > 0 ? (
                      record.story_images.map((img: string, idx: number) => (
                        <Box
                          key={idx}
                          sx={{
                            width: 60,
                            height: 60,
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            backgroundColor: '#f5f5f5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 10,
                            color: '#999',
                          }}
                        >
                          Story
                        </Box>
                      ))
                    ) : (
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          backgroundColor: '#f5f5f5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 10,
                          color: '#999',
                        }}
                      >
                        Story
                      </Box>
                    )}
                  </Box>
                </SummaryRow>
              </>
            )}
          </>
        )}

        {/* Notlar */}
        {record.notes && (
          <>
            <Divider sx={{ my: 3, borderColor: '#eee' }} />
            <SectionTitle>Notlar</SectionTitle>
            <Typography sx={{ fontSize: 14, whiteSpace: 'pre-wrap' }}>{record.notes}</Typography>
          </>
        )}

        {/* Bayi Bilgileri */}
        <Divider sx={{ my: 3, borderColor: '#eee' }} />
        <SectionTitle>Bayi Bilgileri</SectionTitle>
        
        <SummaryRow label="Bayi">
          <Typography sx={{ fontSize: 14 }}>{record.dealer_name}</Typography>
        </SummaryRow>
        <SummaryRow label="Bayi Kodu">
          <Typography sx={{ fontSize: 14 }}>{record.dealer_code}</Typography>
        </SummaryRow>
        <SummaryRow label="Sorumlu">
          <Typography sx={{ fontSize: 14 }}>{record.dealer_contact_first_name} {record.dealer_contact_last_name}</Typography>
        </SummaryRow>
        <SummaryRow label="İletişim">
          <Typography sx={{ fontSize: 14 }}>
            {record.dealer_email}
            {record.dealer_phone && ` - ${record.dealer_phone}`}
          </Typography>
        </SummaryRow>

        {/* Talep Oluştur Button - Dealer only, for taslak status */}
        {isDealer && record.status === 'taslak' && !showSuccess && (
          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleCreateRequest}
              disabled={isSubmitting}
              sx={{
                bgcolor: '#1a1a2e',
                textTransform: 'none',
                fontWeight: 500,
                py: 1.5,
                '&:hover': { bgcolor: '#2d2d44' },
              }}
            >
              Talep oluştur
            </Button>
          </Box>
        )}

        {/* Success Message */}
        {showSuccess && (
          <Alert 
            icon={<Box sx={{ fontSize: 20 }}>✓</Box>}
            severity="success"
            sx={{ mt: 3 }}
          >
            Kampanya talebiniz alındı, mail ile bilgilendirileceksiniz.
          </Alert>
        )}
      </Paper>

      {/* Durum Değiştir - Sadece Admin/Moderator için */}
      {!isDealer && !['tamamlandi', 'reddedildi'].includes(record.status) && (
        <Paper 
          elevation={0} 
          sx={{ 
            border: '1px solid #e5e7eb',
            borderRadius: 2,
            p: 3,
            mt: 2,
          }}
        >
          <SectionTitle>Durum Değiştir</SectionTitle>
          
          <FormControl fullWidth>
            <InputLabel>İşlem Seçin</InputLabel>
              <Select
                value={approvalStatus}
                onChange={(e) => setApprovalStatus(e.target.value)}
              label="İşlem Seçin"
              >
                <MenuItem value="">Seçiniz</MenuItem>
              <MenuItem value="onaylandi" sx={{ color: '#2e7d32', fontWeight: 500 }}>
                ✓ Onayla
              </MenuItem>
              <MenuItem value="reddedildi" sx={{ color: '#c62828', fontWeight: 500 }}>
                ✗ Reddet
              </MenuItem>
              <MenuItem divider disabled sx={{ my: 1 }}>─────────────────</MenuItem>
              <MenuItem value="yayinda">Yayına Al</MenuItem>
                <MenuItem value="tamamlandi">Tamamlandı</MenuItem>
              </Select>
            </FormControl>
          
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Not (Opsiyonel)"
            placeholder="İşlem ile ilgili not ekleyebilirsiniz..."
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            sx={{ mt: 2 }}
            size="small"
          />
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button 
              onClick={handleGoBack}
              sx={{ 
                color: '#666',
                textTransform: 'none',
                '&:hover': { bgcolor: '#f5f5f5' }
              }}
            >
              İptal
            </Button>
            <Button 
              variant="contained" 
              onClick={handleSave}
              disabled={!approvalStatus || isSubmitting}
              sx={{ 
                bgcolor: '#1a1a2e',
                textTransform: 'none',
                px: 4,
                boxShadow: 'none',
                '&:hover': { bgcolor: '#2d2d44', boxShadow: 'none' }
              }}
            >
              Kaydet
            </Button>
          </Box>
        </Paper>
      )}

      {/* İşlem Geçmişi - Timeline */}
      <Paper 
        elevation={0} 
        sx={{ 
          border: '1px solid #e5e7eb',
          borderRadius: 2,
          p: 3,
          mt: 2,
        }}
      >
        <SectionTitle>İşlem Geçmişi</SectionTitle>
        
        <TimelineContainer>
          {timelineItems.map((item, index) => (
            <TimelineItem
              key={index}
              title={item.title}
              date={item.date}
              note={item.note}
              type={item.type}
              isLast={index === timelineItems.length - 1 && (record.status === 'tamamlandi' || record.status === 'reddedildi')}
            />
          ))}

          {/* Bekleyen durum - dinamik olarak mevcut duruma göre göster */}
          {record.status !== 'tamamlandi' && record.status !== 'reddedildi' && (
            <TimelineItem
              title={
                record.status === 'onay_bekliyor' ? 'Onay bekleniyor' :
                record.status === 'onaylandi' ? 'Yayına alınması bekleniyor' :
                record.status === 'yayinda' ? 'Kampanya yayında' :
                record.status === 'taslak' ? 'Taslak - İşlem bekleniyor' :
                'İşlem bekleniyor'
              }
              date=""
              type="waiting"
              isLast={true}
            />
          )}
        </TimelineContainer>
      </Paper>

      {/* Meta Bilgiler */}
      <Box sx={{ mt: 2, px: 1 }}>
        <Typography variant="caption" sx={{ color: '#6b7280' }}>
          Oluşturulma: {new Date(record.created_at).toLocaleString('tr-TR')} | 
          Son Güncelleme: {new Date(record.updated_at).toLocaleString('tr-TR')}
        </Typography>
      </Box>
    </FormContainer>
  );
};

export const CampaignRequestShow = () => {
  const { id } = useParams();
  
  return (
    <Show 
      resource="campaigns/requests"
      id={id}
      component="div"
      actions={false}
      sx={{
        '& .RaShow-main': {
          marginTop: 0,
        },
      }}
    >
      <CampaignRequestShowContent />
    </Show>
  );
};


