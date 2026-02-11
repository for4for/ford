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
import { useSmartBack } from '../../hooks/useSmartBack';
import {
  Box,
  Chip,
  Select,
  MenuItem,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Link,
  InputAdornment,
  Divider,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useState } from 'react';
import { FormContainer, FormHeader } from '../../components/FormFields';
import { SectionTitle, SummaryRow, ShowCard, statusColors, MetaInfo } from '../../components/ShowFields';
import { Typography } from '@mui/material';

// Main Content Component
const IncentiveRequestShowContent = () => {
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
  const smartGoBack = useSmartBack({ fallbackResource: 'incentives/requests' });
  
  const [approvalStatus, setApprovalStatus] = useState('');
  const [approvedAmount, setApprovedAmount] = useState<string>('');
  const [adminNotes, setAdminNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

  // Handle save
  const handleSave = async () => {
    if (!approvalStatus) {
      notify('Lütfen onay durumunu seçin', { type: 'warning' });
      return;
    }

    if (approvalStatus === 'onaylandi' && !approvedAmount) {
      notify('Onaylanan tutarı giriniz', { type: 'warning' });
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
                          approvalStatus === 'degerlendirme' ? 'Değerlendirmeye Alındı' : 'Güncellendi';
      
      let newNote = `[${statusLabel} - ${timestamp}]`;
      
      // Onaylanan tutarı işlem geçmişine ekle
      if (approvalStatus === 'onaylandi' && approvedAmount) {
        const formattedAmount = new Intl.NumberFormat('tr-TR', {
          style: 'currency',
          currency: 'TRY',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(parseFloat(approvedAmount));
        newNote += ` - Onaylanan Tutar: ${formattedAmount}`;
      }
      
      if (adminNotes) {
        newNote += `\nNot: ${adminNotes}`;
      }

      const updatedData: any = {
        dealer: record.dealer,
        incentive_title: record.incentive_title,
        incentive_details: record.incentive_details,
        purpose: record.purpose,
        target_audience: record.target_audience,
        incentive_amount: record.incentive_amount,
        event_time: record.event_time,
        event_location: record.event_location,
        event_venue: record.event_venue,
        map_link: record.map_link || '',
        performance_metrics: record.performance_metrics,
        notes: record.notes || '',
        status: approvalStatus,
        admin_notes: record.admin_notes 
          ? `${record.admin_notes}\n${newNote}`.trim() 
          : newNote
      };

      if (approvalStatus === 'onaylandi' && approvedAmount) {
        updatedData.approved_amount = parseFloat(approvedAmount);
      }

      await update(
        'incentives/requests',
        { 
          id: record.id, 
          data: updatedData,
          previousData: record 
        }
      );
      
      notify('Teşvik talebi kaydedildi', { type: 'success' });
      setApprovalStatus('');
      setApprovedAmount('');
      setAdminNotes('');
      refresh();
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

  return (
    <FormContainer maxWidth={800}>
      {/* Header */}
      <FormHeader
        title="Teşvik Talebi"
        subtitle={record.incentive_title}
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
        {/* Edit Button - Admin/Moderator always, Dealer only for editable statuses */}
        {(!isDealer || (isDealer && !['tamamlandi', 'reddedildi'].includes(record.status))) && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<EditIcon sx={{ fontSize: 16 }} />}
            onClick={() => {
              if (isDealer) {
                navigate(buildUrl(`/dealer/incentive-requests/${record.id}/edit`));
              } else {
                redirect('edit', 'incentives/requests', record.id);
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
        {/* Talep Bilgileri */}
        <SectionTitle>Talep Bilgileri</SectionTitle>
        
        <SummaryRow label="Teşvik Başlığı">
          <Typography sx={{ fontSize: 14 }}>{record.incentive_title}</Typography>
        </SummaryRow>
        <SummaryRow label="Detaylar">
          <Typography sx={{ fontSize: 14, whiteSpace: 'pre-wrap' }}>{record.incentive_details}</Typography>
        </SummaryRow>
        <SummaryRow label="Amaç">
          <Typography sx={{ fontSize: 14 }}>{record.purpose}</Typography>
        </SummaryRow>
        <SummaryRow label="Hedef Kitle">
          <Typography sx={{ fontSize: 14 }}>{record.target_audience}</Typography>
        </SummaryRow>

        <Divider sx={{ my: 3, borderColor: '#eee' }} />

        {/* Finansal Bilgiler */}
        <SectionTitle>Finansal Bilgiler</SectionTitle>
        
        <SummaryRow label="Talep Edilen Tutar">
          <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{formatCurrency(record.incentive_amount)}</Typography>
        </SummaryRow>
        {record.approved_amount && (
          <SummaryRow label="Onaylanan Tutar">
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#166534' }}>
              {formatCurrency(record.approved_amount)}
            </Typography>
          </SummaryRow>
        )}

        <Divider sx={{ my: 3, borderColor: '#eee' }} />

        {/* Etkinlik Bilgileri */}
        <SectionTitle>Etkinlik Bilgileri</SectionTitle>
        
        <SummaryRow label="Etkinlik Zamanı">
          <Typography sx={{ fontSize: 14 }}>{record.event_time}</Typography>
        </SummaryRow>
        <SummaryRow label="Konum">
          <Typography sx={{ fontSize: 14 }}>
            {record.event_location}
            {record.event_venue && `, ${record.event_venue}`}
          </Typography>
        </SummaryRow>
        {record.map_link && (
          <SummaryRow label="Harita">
            <Link href={record.map_link} target="_blank" rel="noopener" sx={{ fontSize: 14 }}>
              Haritada Görüntüle
            </Link>
          </SummaryRow>
        )}
        <SummaryRow label="Performans Metrikleri">
          <Typography sx={{ fontSize: 14, whiteSpace: 'pre-wrap' }}>{record.performance_metrics}</Typography>
        </SummaryRow>

        <Divider sx={{ my: 3, borderColor: '#eee' }} />

        {/* Bayi Bilgileri */}
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

        {/* Ek Dosyalar */}
        {(record.proposal_document || record.reference_image || record.notes) && (
          <>
            <Divider sx={{ my: 3, borderColor: '#eee' }} />
            <SectionTitle>Ekler</SectionTitle>
            
            {record.proposal_document && (
              <SummaryRow label="Teklif Dokümanı">
                <Link href={record.proposal_document} target="_blank" rel="noopener" sx={{ fontSize: 14 }}>
                  Dokümanı Görüntüle
                </Link>
              </SummaryRow>
            )}
            {record.reference_image && (
              <SummaryRow label="Referans Görsel">
                <Link href={record.reference_image} target="_blank" rel="noopener" sx={{ fontSize: 14 }}>
                  Görseli Görüntüle
                </Link>
              </SummaryRow>
            )}
            {record.notes && (
              <SummaryRow label="Notlar">
                <Typography sx={{ fontSize: 14, whiteSpace: 'pre-wrap' }}>{record.notes}</Typography>
              </SummaryRow>
            )}
          </>
        )}

        {/* İşlem Geçmişi */}
        {record.admin_notes && (
          <>
            <Divider sx={{ my: 3, borderColor: '#eee' }} />
            <SectionTitle>İşlem Geçmişi</SectionTitle>
            <Typography sx={{ whiteSpace: 'pre-wrap', fontSize: 13, color: '#666', bgcolor: '#f9f9f9', p: 2, borderRadius: 1 }}>
              {record.admin_notes}
            </Typography>
          </>
        )}
      </ShowCard>

      {/* Onay Kararı - Sadece admin/moderator için ve henüz tamamlanmamışsa */}
      {canApprove && record.status !== 'tamamlandi' && record.status !== 'reddedildi' && record.status !== 'onaylandi' && (
        <ShowCard>
          <SectionTitle>Onay Kararı</SectionTitle>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Onay Durumu</InputLabel>
              <Select
                value={approvalStatus}
                onChange={(e) => setApprovalStatus(e.target.value)}
                label="Onay Durumu"
              >
                <MenuItem value="">Seçiniz</MenuItem>
                <MenuItem value="onaylandi" sx={{ color: '#2e7d32' }}>Onayla</MenuItem>
                <MenuItem value="reddedildi" sx={{ color: '#d32f2f' }}>Reddet</MenuItem>
                <MenuItem value="degerlendirme">Değerlendirmeye Al</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              label="Onaylanan Tutar"
              type="number"
              value={approvedAmount}
              onChange={(e) => setApprovedAmount(e.target.value)}
              size="small"
              fullWidth
              InputProps={{
                endAdornment: <InputAdornment position="end">₺</InputAdornment>,
              }}
              disabled={approvalStatus !== 'onaylandi'}
            />
          </Box>
          
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Onay Notları"
            placeholder="Onay kararı ile ilgili notlarınızı buraya yazabilirsiniz..."
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
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

      {/* Meta Bilgiler */}
      <MetaInfo createdAt={record.created_at} updatedAt={record.updated_at} />
    </FormContainer>
  );
};

export const IncentiveRequestShow = () => {
  const { id } = useParams();
  
  return (
    <Show 
      resource="incentives/requests"
      id={id}
      component="div"
      actions={false}
      sx={{
        '& .RaShow-main': {
          marginTop: 0,
        },
      }}
    >
      <IncentiveRequestShowContent />
    </Show>
  );
};
