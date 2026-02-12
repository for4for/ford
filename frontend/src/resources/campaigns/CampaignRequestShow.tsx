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
import { useSmartBack } from '../../hooks/useSmartBack';
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
  Divider,
  Alert,
} from '@mui/material';
import { FormContainer, FormHeader } from '../../components/FormFields';
import { SectionTitle, SummaryRow, ShowCard, statusColors, MetaInfo } from '../../components/ShowFields';
import { TimelineItem, TimelineContainer, actionToTimelineType, statusChangeToTimelineType, type TimelineType } from '../../components/Timeline';
import EditIcon from '@mui/icons-material/Edit';
import BarChartIcon from '@mui/icons-material/BarChart';
import SendIcon from '@mui/icons-material/Send';
import SyncIcon from '@mui/icons-material/Sync';
import FacebookIcon from '@mui/icons-material/Facebook';
import { useState } from 'react';
import { getCurrentToken } from '../../authProvider';
import { FileUploadSection } from '../../components/FileUploadSection';
import { ctaChoices } from './constants';

// Feature flag: Kampanya Türü Seçimi (Link vs Görsel Yükleme)
// Ford için true, Tofaş için false
const ENABLE_CAMPAIGN_TYPE_SELECTION = false;

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
  const smartGoBack = useSmartBack({ fallbackResource: 'campaigns/requests' });
  
  const [approvalStatus, setApprovalStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isPushingToFb, setIsPushingToFb] = useState(false);
  const [isCheckingFbStatus, setIsCheckingFbStatus] = useState(false);
  const [isSavingFb, setIsSavingFb] = useState(false);
  const [fbAdMessage, setFbAdMessage] = useState<string | null>(null);
  const [fbWebsiteUrl, setFbWebsiteUrl] = useState<string | null>(null);
  const [fbCtaType, setFbCtaType] = useState<string | null>(null);
  
  const isAdmin = permissions === 'admin';
  const isModerator = permissions === 'moderator';
  const canApprove = isAdmin || isModerator;

  if (!record) return null;

  // Facebook form alanlarının güncel değerleri (local state yoksa record'dan al)
  const currentFbAdMessage = fbAdMessage !== null ? fbAdMessage : (record.ad_message || '');
  const currentFbWebsiteUrl = fbWebsiteUrl !== null ? fbWebsiteUrl : (record.website_url || '');
  const currentFbCtaType = fbCtaType !== null ? fbCtaType : (record.cta_type || 'LEARN_MORE');

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

  // Activity log'lardan timeline oluştur
  const buildTimelineFromLogs = () => {
    const items: { title: string; date: string; note?: string; type: TimelineType; userName?: string }[] = [];
    const logs = record.activity_logs || [];

    if (logs.length > 0) {
      // Yeni sistem: activity_logs API'den
      logs.forEach((log: any) => {
        let type: TimelineType = actionToTimelineType[log.action] || 'note';

        // Durum değişikliklerinde detaya göre renk/ikon belirle
        if (log.action === 'status_change' && log.details?.new_status) {
          type = statusChangeToTimelineType(log.details.new_status);
        }

        const note = log.details?.admin_notes || 
                     (log.action === 'fb_push_failed' ? log.details?.error : undefined);

        items.push({
          title: log.message,
          date: formatDateTime(log.created_at),
          note,
          type,
          userName: log.user_name,
        });
      });
    } else {
      // Fallback: Eski admin_notes parse sistemi (geçmiş veriler için)
      items.push({
        title: 'Kampanya talebi oluşturuldu',
        date: formatDateTime(record.created_at),
        type: 'created',
      });

      if (record.admin_notes) {
        const noteLines = record.admin_notes.split('\n').filter((line: string) => line.trim());
        noteLines.forEach((line: string) => {
          const matchWithNote = line.match(/\[(.+?)\s*-\s*(.+?)\]:\s*(.+)/);
          const matchWithoutNote = line.match(/\[(.+?)\s*-\s*(.+?)\]$/);
          const matchOldFormat = line.match(/\[(.+?)\]:\s*(.+)/);

          if (matchWithNote) {
            const titleLower = matchWithNote[1].toLowerCase();
            let type: TimelineType = 'note';
            if (titleLower.includes('gönderildi')) type = 'sent';
            else if (titleLower.includes('onaylandı')) type = 'approved';
            else if (titleLower.includes('reddedildi')) type = 'rejected';
            else if (titleLower.includes('yayın')) type = 'live';
            else if (titleLower.includes('tamamlandı')) type = 'completed';
            items.push({ title: matchWithNote[1], date: matchWithNote[2], note: matchWithNote[3], type });
          } else if (matchWithoutNote) {
            const titleLower = matchWithoutNote[1].toLowerCase();
            let type: TimelineType = 'note';
            if (titleLower.includes('gönderildi')) type = 'sent';
            else if (titleLower.includes('onaylandı')) type = 'approved';
            else if (titleLower.includes('reddedildi')) type = 'rejected';
            else if (titleLower.includes('yayın')) type = 'live';
            else if (titleLower.includes('tamamlandı')) type = 'completed';
            items.push({ title: matchWithoutNote[1], date: matchWithoutNote[2], type });
          } else if (matchOldFormat) {
            const titleLower = matchOldFormat[1].toLowerCase();
            let type: TimelineType = 'note';
            if (titleLower.includes('istek') || titleLower.includes('gönderildi')) type = 'sent';
            else if (titleLower.includes('onay')) type = 'approved';
            else if (titleLower.includes('red')) type = 'rejected';
            items.push({ title: matchOldFormat[1], date: '', note: matchOldFormat[2], type });
          } else if (line.trim()) {
            items.push({ title: 'Admin Notu', date: formatDateTime(record.updated_at), note: line.trim(), type: 'note' });
          }
        });
      }
    }

    return items;
  };

  const timelineItems = buildTimelineFromLogs();

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
      smartGoBack();
    }
  };

  const handleViewReport = () => {
    if (isDealer) {
      navigate(buildUrl(`/dealer/campaign-requests/${record.id}/report`));
    } else {
      navigate(buildUrl(`/backoffice/campaigns/requests/${record.id}/report`));
    }
  };

  // Facebook alanlarını kaydet
  const handleSaveFbFields = async () => {
    setIsSavingFb(true);
    try {
      await update('campaigns/requests', {
        id: record.id,
        data: {
          ad_message: currentFbAdMessage,
          website_url: currentFbWebsiteUrl || null,
          cta_type: currentFbCtaType,
        },
        previousData: record,
      });
      notify('Facebook alanları kaydedildi', { type: 'success' });
      refresh();
    } catch (error) {
      notify('Kaydetme sırasında hata oluştu', { type: 'error' });
    } finally {
      setIsSavingFb(false);
    }
  };

  // Facebook'a Gönder
  const handlePushToFacebook = async () => {
    setIsPushingToFb(true);
    try {
      // Önce form alanlarını kaydet
      await update('campaigns/requests', {
        id: record.id,
        data: {
          ad_message: currentFbAdMessage,
          website_url: currentFbWebsiteUrl || null,
          cta_type: currentFbCtaType,
        },
        previousData: record,
      });

      // Sonra Facebook'a push et
      const token = getCurrentToken();
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8084/api';
      const response = await fetch(`${apiUrl}/campaigns/requests/${record.id}/push-to-facebook/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      const result = await response.json();
      if (response.ok && result.success) {
        notify('Kampanya başarıyla Facebook\'a gönderildi', { type: 'success' });
        refresh();
      } else {
        notify(result.error || 'Facebook\'a gönderim başarısız', { type: 'error' });
        refresh();
      }
    } catch (error) {
      notify('Bir hata oluştu', { type: 'error' });
    } finally {
      setIsPushingToFb(false);
    }
  };

  // FB Durum Kontrol
  const handleCheckFbStatus = async () => {
    setIsCheckingFbStatus(true);
    try {
      const token = getCurrentToken();
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8084/api';
      const response = await fetch(`${apiUrl}/campaigns/requests/${record.id}/check-fb-status/`, {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      const result = await response.json();
      if (response.ok && result.success) {
        notify(`Facebook durumu: ${result.campaign_status?.effective_status || 'bilinmiyor'}`, { type: 'info' });
      } else {
        notify(result.error || 'Durum sorgulanamadı', { type: 'error' });
      }
    } catch (error) {
      notify('Bir hata oluştu', { type: 'error' });
    } finally {
      setIsCheckingFbStatus(false);
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
      </FormHeader>

      <ShowCard>
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
        <SummaryRow label="Reklam Modeli">
          <Typography sx={{ fontSize: 14 }}>{record.ad_model_display || '-'}</Typography>
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
      </ShowCard>

      {/* Durum Değiştir - Sadece Admin/Moderator için */}
      {!isDealer && !['tamamlandi', 'reddedildi'].includes(record.status) && (
        <ShowCard>
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
        </ShowCard>
      )}

      {/* Facebook Kampanyası - Sadece Admin/Moderator için */}
      {canApprove && record.status !== 'taslak' && (
        <ShowCard>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <FacebookIcon sx={{ fontSize: 20, color: '#1877F2' }} />
            <SectionTitle>Facebook Kampanyası</SectionTitle>
          </Box>

          {/* Başarılı gönderim sonrası durum bilgisi */}
          {record.fb_push_status === 'success' && (
            <Alert severity="success" sx={{ mb: 2, '& .MuiAlert-message': { fontSize: 13 } }}>
              Kampanya Facebook'a başarıyla gönderildi
              {record.fb_pushed_at && ` — ${new Date(record.fb_pushed_at).toLocaleString('tr-TR')}`}
            </Alert>
          )}
          {record.fb_push_status === 'failed' && record.fb_push_error && (
            <Alert severity="error" sx={{ mb: 2, '& .MuiAlert-message': { fontSize: 13 } }}>
              {record.fb_push_error}
            </Alert>
          )}

          {/* Kreatif Dosyaları */}
          <FileUploadSection
            files={record.creative_files || []}
            uploadUrl={`/campaigns/requests/${record.id}/upload-file/`}
            deleteUrl={`/campaigns/requests/${record.id}/delete-file/`}
            disabled={record.fb_push_status === 'success'}
            readOnly={record.fb_push_status === 'success'}
            helperText="JPEG, PNG, GIF, WebP veya MP4 (max 50MB)"
            extraFormData={{ file_type: 'post' }}
          />

          {/* Form Alanları */}
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Reklam Metni"
            placeholder="Facebook reklamında gösterilecek metin..."
            value={currentFbAdMessage}
            onChange={(e) => setFbAdMessage(e.target.value)}
            size="small"
            sx={{ mt: 2 }}
            disabled={record.fb_push_status === 'success'}
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Yönlendirme URL"
              placeholder="https://..."
              value={currentFbWebsiteUrl}
              onChange={(e) => setFbWebsiteUrl(e.target.value)}
              size="small"
              disabled={record.fb_push_status === 'success'}
            />

            <FormControl fullWidth size="small">
              <InputLabel>Aksiyon Butonu</InputLabel>
              <Select
                value={currentFbCtaType}
                onChange={(e) => setFbCtaType(e.target.value)}
                label="Aksiyon Butonu"
                disabled={record.fb_push_status === 'success'}
              >
                {ctaChoices.map((cta) => (
                  <MenuItem key={cta.id} value={cta.id}>{cta.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* FB ID Bilgileri - sadece gönderilmişse göster */}
          {record.fb_campaign_id && (
            <Box sx={{ mt: 2, p: 1.5, bgcolor: '#f9fafb', borderRadius: 1, border: '1px solid #f0f0f0' }}>
              <Typography sx={{ fontSize: 11, color: '#9ca3af', mb: 0.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Facebook Kampanya Bilgileri
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5 }}>
                <Typography sx={{ fontSize: 12, color: '#666' }}>Campaign: <span style={{ fontFamily: 'monospace' }}>{record.fb_campaign_id}</span></Typography>
                {record.fb_adset_id && <Typography sx={{ fontSize: 12, color: '#666' }}>AdSet: <span style={{ fontFamily: 'monospace' }}>{record.fb_adset_id}</span></Typography>}
                {record.fb_creative_id && <Typography sx={{ fontSize: 12, color: '#666' }}>Creative: <span style={{ fontFamily: 'monospace' }}>{record.fb_creative_id}</span></Typography>}
                {record.fb_ad_id && <Typography sx={{ fontSize: 12, color: '#666' }}>Ad: <span style={{ fontFamily: 'monospace' }}>{record.fb_ad_id}</span></Typography>}
              </Box>
            </Box>
          )}

          {/* Butonlar */}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            {/* Kaydet - sadece henüz gönderilmemişse */}
            {record.fb_push_status !== 'success' && (
              <Button
                onClick={handleSaveFbFields}
                disabled={isSavingFb}
                sx={{ 
                  color: '#666',
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#f5f5f5' }
                }}
              >
                {isSavingFb ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
            )}

            {/* Facebook'a Gönder - onaylı ve henüz gönderilmemişse */}
            {record.status === 'onaylandi' && record.fb_push_status !== 'success' && (
              <Button 
                variant="contained" 
                onClick={handlePushToFacebook}
                disabled={isPushingToFb || !currentFbAdMessage}
                startIcon={isPushingToFb ? <SyncIcon sx={{ fontSize: 16, animation: 'spin 1s linear infinite', '@keyframes spin': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } } }} /> : <SendIcon sx={{ fontSize: 16 }} />}
                sx={{ 
                  bgcolor: '#1877F2',
                  textTransform: 'none',
                  px: 3,
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#166FE5', boxShadow: 'none' },
                  '&.Mui-disabled': { bgcolor: '#94bef5', color: '#fff' },
                }}
              >
                {isPushingToFb ? 'Gönderiliyor...' : "Facebook'a Gönder"}
              </Button>
            )}

            {/* Durumu Kontrol Et - gönderilmişse */}
            {record.fb_campaign_id && (
              <Button 
                variant="outlined" 
                onClick={handleCheckFbStatus}
                disabled={isCheckingFbStatus}
                startIcon={isCheckingFbStatus ? <SyncIcon sx={{ fontSize: 16, animation: 'spin 1s linear infinite', '@keyframes spin': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } } }} /> : <FacebookIcon sx={{ fontSize: 16, color: '#1877F2' }} />}
                sx={{ 
                  textTransform: 'none',
                  borderColor: '#1877F2',
                  color: '#1877F2',
                  '&:hover': { borderColor: '#166FE5', bgcolor: '#eff6ff' },
                }}
              >
                {isCheckingFbStatus ? 'Kontrol Ediliyor...' : 'Durumu Kontrol Et'}
              </Button>
            )}
          </Box>
        </ShowCard>
      )}

      {/* İşlem Geçmişi - Timeline */}
      <ShowCard>
        <SectionTitle>İşlem Geçmişi</SectionTitle>
        
        <TimelineContainer>
          {timelineItems.map((item, index) => (
            <TimelineItem
              key={index}
              title={item.title}
              date={item.date}
              note={item.note}
              type={item.type}
              userName={item.userName}
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
              type={record.status === 'yayinda' ? 'completed' : 'waiting'}
              isLast={true}
            />
          )}
        </TimelineContainer>
      </ShowCard>

      {/* Meta Bilgiler */}
      <MetaInfo createdAt={record.created_at} updatedAt={record.updated_at} />
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


