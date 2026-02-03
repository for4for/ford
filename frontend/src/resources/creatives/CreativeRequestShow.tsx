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
import { API_URL } from '../../config';
import {
  Box,
  Paper,
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
  Avatar,
  IconButton,
  CircularProgress,
  Modal,
  Backdrop,
  Fade,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import VerifiedIcon from '@mui/icons-material/Verified';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import EditNoteIcon from '@mui/icons-material/EditNote';
import ForwardToInboxIcon from '@mui/icons-material/ForwardToInbox';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SendIcon from '@mui/icons-material/Send';
import EditIcon from '@mui/icons-material/Edit';
import { useState, useRef, useEffect } from 'react';

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

// Kurumsal durum renkleri - listStyles.ts ile senkron
const statusColors: Record<string, string> = {
  taslak: '#4b5563',
  gorsel_bekliyor: '#b45309',
  bayi_onayi_bekliyor: '#1d4ed8',
  onay_bekliyor: '#b45309',
  onaylandi: '#166534',
  reddedildi: '#991b1b',
  degerlendirme: '#1d4ed8',
  tamamlandi: '#166534',
};

// Summary Row Component - Minimal
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

// Section Title - Minimal uppercase
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

// Timeline Item Component
type TimelineType = 'created' | 'sent' | 'approved' | 'rejected' | 'note' | 'waiting';

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
};

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
      left: 15,
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
  
  const [approvalTarget, setApprovalTarget] = useState('');
  const [approvalQuestion, setApprovalQuestion] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Creative Agency için çoklu görsel yükleme state'leri
  const [uploadedFiles, setUploadedFiles] = useState<Array<{id: number, file_name: string, file_size: number, file: string}>>([]);
  const [sendNote, setSendNote] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Önizleme modal state'i
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewFileName, setPreviewFileName] = useState<string>('');
  
  // Sürükle-bırak state'i
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{total: number, current: number} | null>(null);
  
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

  // Dosya validasyonu
  const validateFile = (file: File): string | null => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return `"${file.name}" desteklenmeyen dosya türü`;
    }
    if (file.size > 10 * 1024 * 1024) {
      return `"${file.name}" 10MB'dan büyük`;
    }
    return null;
  };

  // Tek dosya yükle
  const uploadSingleFile = async (file: File): Promise<boolean> => {
    const token = localStorage.getItem('admin_auth_token');
    
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_URL}/creatives/requests/${record.id}/upload_file/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    return response.ok;
  };

  // Çoklu dosya yükle
  const handleMultipleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    // Validasyon
    const errors: string[] = [];
    const validFiles: File[] = [];
    
    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(error);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      notify(`Bazı dosyalar yüklenemedi: ${errors.join(', ')}`, { type: 'warning' });
    }

    if (validFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress({ total: validFiles.length, current: 0 });
    
    let successCount = 0;
    let failCount = 0;

    try {
      for (let i = 0; i < validFiles.length; i++) {
        setUploadProgress({ total: validFiles.length, current: i + 1 });
        
        const success = await uploadSingleFile(validFiles[i]);
        if (success) {
          successCount++;
        } else {
          failCount++;
        }
      }

      if (successCount > 0) {
        notify(`${successCount} dosya başarıyla yüklendi${failCount > 0 ? `, ${failCount} dosya yüklenemedi` : ''}`, { 
          type: failCount > 0 ? 'warning' : 'success' 
        });
        refresh();
      } else {
        notify('Dosyalar yüklenirken hata oluştu', { type: 'error' });
      }
      
      // Input'u temizle
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      notify('Dosyalar yüklenirken bir hata oluştu', { type: 'error' });
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  // Input change handler
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    await handleMultipleFiles(files);
  };

  // Sürükle-bırak handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await handleMultipleFiles(files);
    }
  };

  // Dosya silme
  const handleFileDelete = async (fileId: number) => {
    try {
      const token = localStorage.getItem('admin_auth_token');
      
      const response = await fetch(`${API_URL}/creatives/requests/${record.id}/delete_file/${fileId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Dosya silme hatası');
      }

      notify('Dosya silindi', { type: 'success' });
      refresh();
    } catch (error) {
      notify('Dosya silinirken bir hata oluştu', { type: 'error' });
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

  // Önizleme aç
  const handlePreview = (fileUrl: string, fileName: string) => {
    setPreviewImage(fileUrl);
    setPreviewFileName(fileName);
    setPreviewOpen(true);
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
          // [Birim'e Gönderildi - Tarih]: Not
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
          // [Birim'e Gönderildi - Tarih]
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

  const handleGoBack = () => {
    if (isDealer) {
      navigate(buildUrl('/dealer/requests'));
    } else {
      redirect('list', 'creatives/requests');
    }
  };

  return (
    <Box sx={{ maxWidth: 800, margin: '0 auto', px: 3, py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <ArrowBackIcon 
            onClick={handleGoBack}
            sx={{ 
              fontSize: 22, 
              color: '#666', 
              cursor: 'pointer',
              '&:hover': { color: '#333' },
            }} 
          />
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: '#1a1a2e',
              fontSize: 22,
            }}
          >
            Kreatif Talebi
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {isDealer && record.status !== 'tamamlandi' && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<EditIcon sx={{ fontSize: 16 }} />}
              onClick={() => navigate(buildUrl(`/dealer/creative-requests/${record.id}/edit`))}
              sx={{
                textTransform: 'none',
                fontSize: 13,
                borderColor: '#d1d5db',
                color: '#666',
                '&:hover': { borderColor: '#999', bgcolor: '#f9fafb' },
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
              fontWeight: 500
            }} 
          />
        </Box>
        </Box>

      <Paper 
        elevation={0} 
        sx={{ 
          border: '1px solid #e5e7eb',
          borderRadius: 2,
          p: 3,
        }}
      >
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
          <SectionTitle>Teslim Edilen Görseller</SectionTitle>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {deliveredFiles.map((file: any) => (
                <Box 
                  key={file.id}
                  sx={{ 
                    width: 200, 
                    border: '1px solid #94a3b8', 
                    borderRadius: 1, 
                    bgcolor: '#f8fafc',
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
                      <InsertDriveFileIcon sx={{ fontSize: 48, color: '#1E3A5F' }} />
                    </Box>
                  )}
                  <Box sx={{ p: 1, borderTop: '1px solid #e2e8f0' }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {file.file_name}
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: '#999' }}>
                      {(file.file_size / 1024 / 1024).toFixed(2)} MB
                    </Typography>
                    {file.note && (
                      <Typography sx={{ fontSize: 11, color: '#1E3A5F', mt: 0.5 }}>
                        Not: {file.note}
                      </Typography>
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
          </>
        )}
      </Paper>

        {/* Görsel Yükle - Creative Agency ve Admin */}
        {canUploadCreative && (
          <Paper 
            elevation={0} 
            sx={{ 
            border: '1px solid #94a3b8', 
            borderRadius: 2, 
            p: 3, 
              mt: 2,
              bgcolor: '#f8fafc',
            }}
          >
            <SectionTitle>Görsel Yükle</SectionTitle>
            
            {/* Yüklenen dosyalar önizlemeli grid */}
            {deliveredFiles.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography sx={{ fontSize: 13, color: '#666', mb: 1.5, fontWeight: 600 }}>
                  Yüklenen Dosyalar ({deliveredFiles.length}):
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {deliveredFiles.map((file: any) => {
                    const isImage = file.file_name?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                    return (
                      <Box 
                        key={file.id}
                        sx={{ 
                          width: 150, 
                          border: '1px solid #94a3b8', 
                          borderRadius: 2, 
                          bgcolor: '#fff',
                          overflow: 'hidden',
                          position: 'relative',
                          '&:hover .file-actions': {
                            opacity: 1,
                          }
                        }}
                      >
                        {/* Önizleme alanı */}
                        <Box 
                          sx={{ 
                            height: 120, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            bgcolor: '#f5f5f5',
                            cursor: isImage ? 'pointer' : 'default',
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                          onClick={() => isImage && handlePreview(file.file, file.file_name)}
                        >
                          {isImage ? (
                            <img 
                              src={file.file} 
                              alt={file.file_name}
                              style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'cover' 
                              }}
                            />
                          ) : (
                            <InsertDriveFileIcon sx={{ fontSize: 48, color: '#1E3A5F' }} />
                          )}
                          
                          {/* Hover overlay - resimler için */}
                          {isImage && (
                            <Box 
                              className="file-actions"
                              sx={{ 
                                position: 'absolute', 
                                top: 0, 
                                left: 0, 
                                right: 0, 
                                bottom: 0, 
                                bgcolor: 'rgba(0,0,0,0.5)', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                opacity: 0,
                                transition: 'opacity 0.2s'
                              }}
                            >
                              <ZoomInIcon sx={{ color: '#fff', fontSize: 32 }} />
                            </Box>
                          )}
                        </Box>
                        
                        {/* Dosya bilgileri */}
                        <Box sx={{ p: 1, borderTop: '1px solid #e2e8f0' }}>
                          <Typography 
                            sx={{ 
                              fontSize: 11, 
                              fontWeight: 500, 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis', 
                              whiteSpace: 'nowrap',
                              mb: 0.5
                            }}
                            title={file.file_name}
                          >
                            {file.file_name}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography sx={{ fontSize: 10, color: '#999' }}>
                              {(file.file_size / 1024 / 1024).toFixed(2)} MB
                            </Typography>
                            <IconButton 
                              size="small"
                              onClick={() => handleFileDelete(file.id)}
                              sx={{ color: '#d32f2f', p: 0.5 }}
                            >
                              <DeleteIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Box>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            )}

            {/* Dosya yükleme alanı - Sürükle-bırak destekli */}
            <Box 
              sx={{ 
                border: isDragging ? '3px dashed #1E3A5F' : '2px dashed #94a3b8', 
                borderRadius: 2, 
                p: 3, 
                textAlign: 'center',
                bgcolor: isDragging ? '#f3e5f5' : '#fff',
                cursor: isUploading ? 'wait' : 'pointer',
                transition: 'all 0.2s',
                opacity: isUploading ? 0.7 : 1,
                transform: isDragging ? 'scale(1.02)' : 'scale(1)',
                '&:hover': {
                  borderColor: '#1E3A5F',
                  bgcolor: '#f8fafc'
                }
              }}
              onClick={() => !isUploading && fileInputRef.current?.click()}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*,.pdf"
                multiple
                style={{ display: 'none' }}
                disabled={isUploading}
              />
              {isUploading ? (
                <>
                  <CircularProgress size={48} sx={{ color: '#1E3A5F', mb: 1 }} />
                  {uploadProgress && (
                    <Typography sx={{ color: '#1E3A5F', fontWeight: 500 }}>
                      Yükleniyor... {uploadProgress.current}/{uploadProgress.total}
                    </Typography>
                  )}
                </>
              ) : isDragging ? (
                <>
                  <CloudUploadIcon sx={{ fontSize: 64, color: '#1E3A5F', mb: 1 }} />
                  <Typography sx={{ color: '#1E3A5F', fontWeight: 600, fontSize: 18 }}>
                    Dosyaları buraya bırakın
                  </Typography>
                </>
              ) : (
                <>
                  <CloudUploadIcon sx={{ fontSize: 48, color: '#94a3b8', mb: 1 }} />
                  <Typography sx={{ color: '#1E3A5F', fontWeight: 500 }}>
                    Dosya eklemek için tıklayın veya sürükleyin
                  </Typography>
                  <Typography sx={{ color: '#999', fontSize: 12, mt: 0.5 }}>
                    JPEG, PNG, GIF, WebP veya PDF (max 10MB)
                  </Typography>
                  <Typography sx={{ color: '#1E3A5F', fontSize: 11, mt: 1, fontWeight: 500 }}>
                    📁 Birden fazla dosya seçebilirsiniz
                  </Typography>
                </>
              )}
            </Box>

          </Paper>
        )}

        {/* Durum Değiştir - Admin/Moderator ve Creative Agency */}
        {record.status !== 'tamamlandi' && record.status !== 'reddedildi' && record.status !== 'onaylandi' && (
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
          </Paper>
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
        </Paper>

        {/* Meta Bilgiler */}
        <Box sx={{ mt: 2, px: 1 }}>
          <Typography variant="caption" sx={{ color: '#999' }}>
            Oluşturulma: {formatDateTime(record.created_at)} | 
            Son Güncelleme: {formatDateTime(record.updated_at)}
          </Typography>
        </Box>

      {/* Önizleme Modal */}
      <Modal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 300,
            sx: { bgcolor: 'rgba(0, 0, 0, 0.9)' }
          },
        }}
      >
        <Fade in={previewOpen}>
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            maxWidth: '90vw',
            maxHeight: '90vh',
            outline: 'none',
          }}>
            {/* Kapatma ve indirme butonları */}
            <Box sx={{ 
              position: 'absolute', 
              top: -50, 
              right: 0, 
              display: 'flex', 
              gap: 1 
            }}>
              <IconButton 
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = previewImage || '';
                  link.download = previewFileName;
                  link.click();
                }}
                sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}
              >
                <DownloadIcon />
              </IconButton>
              <IconButton 
                onClick={() => setPreviewOpen(false)}
                sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
            
            {/* Resim */}
            {previewImage && (
              <img 
                src={previewImage} 
                alt={previewFileName}
                style={{ 
                  maxWidth: '90vw', 
                  maxHeight: '85vh', 
                  objectFit: 'contain',
                  borderRadius: 8,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
                }}
              />
            )}
            
            {/* Dosya adı */}
            <Typography sx={{ 
              color: '#fff', 
              textAlign: 'center', 
              mt: 2, 
              fontSize: 14,
              opacity: 0.8
            }}>
              {previewFileName}
            </Typography>
          </Box>
        </Fade>
      </Modal>
    </Box>
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
        marginTop: 4,
        '& .RaShow-main': {
          marginTop: 0,
        },
      }}
    >
    <CreativeRequestShowContent />
  </Show>
);
};
