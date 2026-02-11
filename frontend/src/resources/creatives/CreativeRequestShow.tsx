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
import { API_URL } from '../../config';
import {
  Box,
  Typography,
  Chip,
  Divider,
  Select,
  MenuItem,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Alert,
} from '@mui/material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import { useState, useEffect } from 'react';
import { FileUploadSection } from '../../components/FileUploadSection';
import { FormContainer, FormHeader } from '../../components/FormFields';
import { SectionTitle, SummaryRow, ShowCard, statusColors, MetaInfo } from '../../components/ShowFields';
import { TimelineItem, TimelineContainer, type TimelineType } from '../../components/Timeline';

const creativeTypeLabels: Record<string, string> = {
  poster: 'Poster / Afiş',
  cadir: 'Çadır',
  tente: 'Tente',
  stand: 'Stand',
  orumcek: 'Örümcek Stand',
  megalight: 'Megalight',
  dijital: 'Dijital Ekran',
  led: 'Led Saha Kenarı',
  rollup: 'Roll-up',
  el_ilani: 'El İlanı',
  branda: 'Branda',
  totem: 'Totem',
  sticker: 'Sticker',
  diger: 'Diğer',
};

// Main Content Component
const CreativeRequestShowContent = () => {
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
  const smartGoBack = useSmartBack({ fallbackResource: 'creatives/requests' });
  
  const [approvalTarget, setApprovalTarget] = useState('');
  const [approvalQuestion, setApprovalQuestion] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Creative Agency için gönderim state'leri
  const [sendNote, setSendNote] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  const isCreativeAgency = permissions === 'creative_agency';
  const isAdmin = permissions === 'admin';
  const isModerator = permissions === 'moderator';
  const canUploadCreative = isCreativeAgency || isAdmin || isModerator;
  
  // Record'dan delivered_files'ı al
  const deliveredFiles = record?.delivered_files || [];

  // Creative Agency için varsayılan seçenek
  useEffect(() => {
    if (isCreativeAgency && approvalTarget === '') {
      setApprovalTarget('brand');
    }
  }, [isCreativeAgency]);

  if (!record) return null;

  const handleStatusUpdate = async () => {
    if (!approvalTarget) {
      notify('Lütfen bir işlem seçin', { type: 'warning' });
      return;
    }

    // Durum mapping
    const statusMap: Record<string, string> = {
      'approve': 'onaylandi',
      'reject': 'reddedildi',
      'creative-agency': 'gorsel_bekliyor',
      'dealer': 'bayi_onayi_bekliyor',
      'brand': 'onay_bekliyor',
    };

    const actionNameMap: Record<string, string> = {
      'approve': 'Onaylandı',
      'reject': 'Reddedildi',
      'creative-agency': 'Creative Ajans\'a Gönderildi',
      'dealer': 'Bayi Onayına Gönderildi',
      'brand': 'Marka Onayına Gönderildi',
    };

    // assigned_to mapping for database
    const assignedToMap: Record<string, string | null> = {
      'approve': null,
      'reject': null,
      'creative-agency': 'creative_agency',
      'dealer': 'dealer',
      'brand': 'brand',
    };

    try {
      const actionName = actionNameMap[approvalTarget];
      const timestamp = new Date().toLocaleString('tr-TR');
      
      // Timeline log formatı
      let newNote = `[${actionName} - ${timestamp}]`;
      if (approvalQuestion) {
        newNote += `: ${approvalQuestion}`;
      }

      const updatedData: any = {
        dealer: record.dealer,
        creative_work_request: record.creative_work_request,
        quantity_request: record.quantity_request,
        work_details: record.work_details,
        intended_message: record.intended_message || '',
        legal_text: record.legal_text || '',
        deadline: record.deadline,
        sizes: record.sizes,
        creatives: record.creatives,
        status: statusMap[approvalTarget],
        admin_notes: record.admin_notes 
          ? `${record.admin_notes}\n${newNote}`.trim() 
          : newNote
      };

      // assigned_to sadece birim seçiliyse güncelle
      if (assignedToMap[approvalTarget] !== null) {
        updatedData.assigned_to = assignedToMap[approvalTarget];
      }

      await update(
        'creatives/requests',
        { 
          id: record.id, 
          data: updatedData,
          previousData: record 
        }
      );
      setShowSuccess(true);
      setApprovalTarget('');
      setApprovalQuestion('');
      notify(`${actionName}`, { type: 'success' });
      refresh();
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      notify('Bir hata oluştu', { type: 'error' });
    }
  };

  // Onayla / Reddet işlemi
  const handleStatusChange = async (newStatus: string, statusLabel: string) => {
    try {
      const timestamp = new Date().toLocaleString('tr-TR');
      const newNote = `[${statusLabel} - ${timestamp}]`;

      const updatedData = {
        dealer: record.dealer,
        creative_work_request: record.creative_work_request,
        quantity_request: record.quantity_request,
        work_details: record.work_details,
        intended_message: record.intended_message || '',
        legal_text: record.legal_text || '',
        deadline: record.deadline,
        sizes: record.sizes,
        creatives: record.creatives,
        status: newStatus,
        admin_notes: record.admin_notes 
          ? `${record.admin_notes}\n${newNote}`.trim() 
          : newNote
      };

      await update(
        'creatives/requests',
        { 
          id: record.id, 
          data: updatedData,
          previousData: record 
        }
      );
      
      notify(`Talep ${statusLabel.toLowerCase()}`, { type: newStatus === 'onaylandi' ? 'success' : 'warning' });
      refresh();
    } catch (error) {
      notify('Bir hata oluştu', { type: 'error' });
    }
  };

  // Bayiye gönder
  const handleSendToDealer = async () => {
    if (deliveredFiles.length === 0) {
      notify('En az bir dosya yüklemelisiniz', { type: 'warning' });
      return;
    }

    setIsSending(true);
    
    try {
      const token = localStorage.getItem('admin_auth_token');
      
      const response = await fetch(`${API_URL}/creatives/requests/${record.id}/send_to_dealer/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ note: sendNote }),
      });

      if (!response.ok) {
        throw new Error('Gönderme hatası');
      }

      setSendNote('');
      notify('Görseller başarıyla bayiye gönderildi', { type: 'success' });
      refresh();
    } catch (error) {
      notify('Gönderilirken bir hata oluştu', { type: 'error' });
    } finally {
      setIsSending(false);
    }
  };

  // Format date helper
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('tr-TR');
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('tr-TR');
  };

  // Parse admin notes for timeline
  const parseAdminNotes = () => {
    const notes: { title: string; date: string; note?: string; type: TimelineType }[] = [];
    
    // İlk kayıt - Oluşturulma
    notes.push({
      title: 'Talep oluşturuldu',
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
          const titleLower = matchWithNote[1].toLowerCase();
          let type: TimelineType = 'note';
          
          if (titleLower.includes('gönderildi')) {
            type = 'sent';
          } else if (titleLower.includes('onaylandı')) {
            type = 'approved';
          } else if (titleLower.includes('reddedildi')) {
            type = 'rejected';
          }
          
          notes.push({
            title: matchWithNote[1],
            date: matchWithNote[2],
            note: matchWithNote[3],
            type,
          });
        } else if (matchWithoutNote) {
          const titleLower = matchWithoutNote[1].toLowerCase();
          let type: TimelineType = 'note';
          
          if (titleLower.includes('gönderildi')) {
            type = 'sent';
          } else if (titleLower.includes('onaylandı')) {
            type = 'approved';
          } else if (titleLower.includes('reddedildi')) {
            type = 'rejected';
          }
          
          notes.push({
            title: matchWithoutNote[1],
            date: matchWithoutNote[2],
            type,
          });
        } else if (matchOldFormat) {
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
        title="Kreatif Talebi"
        subtitle={record.creative_work_request}
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
        {(!isDealer || (isDealer && !['tamamlandi', 'reddedildi', 'onaylandi'].includes(record.status))) && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<EditIcon sx={{ fontSize: 16 }} />}
            onClick={() => {
              if (isDealer) {
                navigate(buildUrl(`/dealer/creative-requests/${record.id}/edit`));
              } else {
                redirect('edit', 'creatives/requests', record.id);
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
        {/* Kreatif Çalışma Bilgileri */}
        <SectionTitle>Talep Bilgileri</SectionTitle>
        <SummaryRow label="Bayi">
          <Typography sx={{ fontSize: 14 }}>{record.dealer_name}</Typography>
        </SummaryRow>
        <SummaryRow label="Çalışma İsteği">
          <Typography sx={{ fontSize: 14 }}>{record.creative_work_request}</Typography>
        </SummaryRow>
        <SummaryRow label="Adet Talebi">
          <Typography sx={{ fontSize: 14 }}>{record.quantity_request}</Typography>
        </SummaryRow>
        <SummaryRow label="Detaylar">
          <Typography sx={{ fontSize: 14, whiteSpace: 'pre-wrap' }}>{record.work_details}</Typography>
        </SummaryRow>
        {record.intended_message && (
          <SummaryRow label="Mesaj">
            <Typography sx={{ fontSize: 14 }}>{record.intended_message}</Typography>
          </SummaryRow>
        )}
        {record.legal_text && (
          <SummaryRow label="Legal Metin">
            <Typography sx={{ fontSize: 14 }}>{record.legal_text}</Typography>
          </SummaryRow>
        )}

        <Divider sx={{ my: 3, borderColor: '#eee' }} />

        {/* Boyut ve Kreatif Detayları */}
        <SectionTitle>Boyut ve Kreatif Türleri</SectionTitle>
        <SummaryRow label="Kullanılacak Boyut/Ölçü">
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {record.sizes?.map((size: any, index: number) => (
              <Chip 
                key={index}
                label={`${size.size} (${size.quantity} adet)`}
                variant="outlined"
                size="small"
                sx={{ bgcolor: '#f0f0f0', borderColor: '#ddd' }}
              />
            ))}
          </Box>
        </SummaryRow>
        <SummaryRow label="İstenilen Kreatif">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {record.creatives?.map((creative: any, index: number) => (
              <Box key={index}>
                <Chip 
                  label={creativeTypeLabels[creative.creative_type] || creative.creative_type_display}
                  variant="outlined"
                  size="small"
                  sx={{ bgcolor: '#f0f0f0', borderColor: '#ddd', mb: 0.5 }}
                />
                {creative.description && (
                  <Typography sx={{ color: '#666', fontSize: 13, ml: 0.5 }}>
                    {creative.description}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        </SummaryRow>
        <SummaryRow label="Deadline">
          <Typography sx={{ fontWeight: 500, color: '#d32f2f', fontSize: 14 }}>
            {formatDate(record.deadline)}
          </Typography>
        </SummaryRow>

        {/* Referans/Örnek Görseller */}
        {(record.reference_files?.length > 0 || record.reference_image) && (
          <>
            <Divider sx={{ my: 3, borderColor: '#eee' }} />
            <SectionTitle>Referans Görseller</SectionTitle>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {/* Yeni çoklu dosya sistemi */}
              {record.reference_files?.map((file: any) => (
                <Box 
                  key={file.id}
                  sx={{ 
                    width: 200, 
                    border: '1px solid #ddd', 
                    borderRadius: 1, 
                    bgcolor: '#fafafa',
                    overflow: 'hidden'
                  }}
                >
                  {file.file_name?.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                    <Box sx={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5' }}>
                      <img 
                        src={file.file} 
                        alt={file.file_name}
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      />
                    </Box>
                  ) : (
                    <Box sx={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5' }}>
                      <InsertDriveFileIcon sx={{ fontSize: 48, color: '#999' }} />
                    </Box>
                  )}
                  <Box sx={{ p: 1, borderTop: '1px solid #eee' }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {file.file_name}
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: '#999' }}>
                      {(file.file_size / 1024 / 1024).toFixed(2)} MB
                    </Typography>
                  </Box>
                </Box>
              ))}
              {/* Eski tek dosya (geriye dönük uyumluluk) */}
              {record.reference_image && !record.reference_files?.length && (
                <Box sx={{ 
                  width: 200, 
                  height: 140, 
                  border: '2px dashed #ddd', 
                  borderRadius: 1, 
                  bgcolor: '#fafafa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}>
                  {typeof record.reference_image === 'string' ? (
                    <img 
                      src={record.reference_image} 
                      alt="Referans" 
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <Box sx={{ textAlign: 'center', color: '#999' }}>
                      <Typography sx={{ fontSize: 24 }}>🖼️</Typography>
                      <Typography sx={{ fontSize: 11 }}>Referans Görsel</Typography>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          </>
        )}

        {/* Teslim Edilen Dosyalar - Görsel yükleme bölümü aktif değilse göster */}
        {deliveredFiles.length > 0 && !canUploadCreative && (
          <>
            <Divider sx={{ my: 3, borderColor: '#eee' }} />
            <FileUploadSection
              files={deliveredFiles}
              uploadUrl={`/creatives/requests/${record.id}/upload_file/`}
              deleteUrl={`/creatives/requests/${record.id}/delete_file/`}
              readOnly={true}
              title="Teslim Edilen Görseller"
            />
          </>
        )}
      </ShowCard>

      {/* Görsel Yükle - Creative Agency ve Admin */}
      {canUploadCreative && (
        <ShowCard>
          <FileUploadSection
            files={deliveredFiles}
            uploadUrl={`/creatives/requests/${record.id}/upload_file/`}
            deleteUrl={`/creatives/requests/${record.id}/delete_file/`}
            accept="image/*,.pdf"
            allowedTypes={['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']}
            maxFileSize={10 * 1024 * 1024}
            title="Görsel Yükle"
            helperText="JPEG, PNG, GIF, WebP veya PDF (max 10MB)"
          />
        </ShowCard>
      )}

      {/* Durum Değiştir - Admin/Moderator ve Creative Agency */}
      {record.status !== 'tamamlandi' && record.status !== 'reddedildi' && record.status !== 'onaylandi' && (
        <ShowCard>
          <SectionTitle>Durum Değiştir</SectionTitle>
          
          <FormControl fullWidth>
            <InputLabel>İşlem Seçin</InputLabel>
            <Select
              value={approvalTarget}
              onChange={(e) => setApprovalTarget(e.target.value)}
              label="İşlem Seçin"
            >
              {isCreativeAgency ? (
                // Creative Agency sadece Marka Onayına Gönder seçeneğini görür
                <MenuItem value="brand">Marka Onayına Gönder</MenuItem>
              ) : (
                // Admin/Moderator tüm seçenekleri görür
                [
                  <MenuItem key="" value="">Seçiniz</MenuItem>,
                  <MenuItem key="approve" value="approve" sx={{ color: '#2e7d32', fontWeight: 500 }}>
                    ✓ Onayla
                  </MenuItem>,
                  <MenuItem key="reject" value="reject" sx={{ color: '#c62828', fontWeight: 500 }}>
                    ✗ Reddet
                  </MenuItem>,
                  <MenuItem key="divider" divider disabled sx={{ my: 1 }}>─────────────────</MenuItem>,
                  <MenuItem key="creative-agency" value="creative-agency">Creative Ajans'a Gönder</MenuItem>,
                  <MenuItem key="dealer" value="dealer">Bayi Onayına Gönder</MenuItem>,
                  <MenuItem key="brand" value="brand">Marka Onayına Gönder</MenuItem>
                ]
              )}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            multiline
            rows={2}
            label="Not (Opsiyonel)"
            placeholder="İşlem ile ilgili not ekleyebilirsiniz..."
            value={approvalQuestion}
            onChange={(e) => setApprovalQuestion(e.target.value)}
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
              onClick={handleStatusUpdate}
              disabled={!approvalTarget}
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

      {/* Başarı Mesajı */}
      {showSuccess && (
        <Alert 
          icon={<CheckCircleIcon />}
          severity="success"
          sx={{ mt: 2 }}
        >
          Onay isteği başarıyla gönderildi.
        </Alert>
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
              isLast={index === timelineItems.length - 1 && (record.status === 'tamamlandi' || record.status === 'reddedildi')}
            />
          ))}

          {/* Bekleyen durum - dinamik olarak mevcut duruma göre göster */}
          {record.status !== 'tamamlandi' && record.status !== 'reddedildi' && (
            <TimelineItem
              title={
                record.status === 'gorsel_bekliyor' ? 'Creative Ajans\'tan görsel bekleniyor' :
                record.status === 'bayi_onayi_bekliyor' ? 'Bayi onayı bekleniyor' :
                record.status === 'onay_bekliyor' ? 'Marka onayı bekleniyor' :
                record.status === 'taslak' ? 'Taslak - İşlem bekleniyor' :
                'İşlem bekleniyor'
              }
              date=""
              type="waiting"
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

export const CreativeRequestShow = () => {
  const { id } = useParams();
  
  return (
    <Show 
      resource="creatives/requests"
      id={id}
      component="div"
      actions={false}
      sx={{
        '& .RaShow-main': {
          marginTop: 0,
        },
      }}
    >
      <CreativeRequestShowContent />
    </Show>
  );
};
