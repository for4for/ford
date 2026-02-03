import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Divider,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useCreate, useUpdate, useGetOne, useNotify } from 'react-admin';
import { useBrand } from '../../context/BrandContext';
import { useState, useRef, useEffect } from 'react';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DescriptionIcon from '@mui/icons-material/Description';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ArticleIcon from '@mui/icons-material/Article';
import ImageIcon from '@mui/icons-material/Image';
import { BASE_URL } from '../../config';

// Minimal input styles
const inputStyles = {
  '& .MuiOutlinedInput-root': {
    fontSize: 13,
    backgroundColor: '#fafafa',
    '& fieldset': { borderColor: '#e5e7eb' },
    '&:hover fieldset': { borderColor: '#d1d5db' },
    '&.Mui-focused fieldset': { borderColor: '#1a1a2e' },
  },
  '& .MuiInputLabel-root': { fontSize: 13 },
};

// Section Title - Minimal
const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <Typography
    sx={{
      fontSize: 12,
      fontWeight: 600,
      color: '#999',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      mb: 1.5,
      mt: 2,
    }}
  >
    {children}
  </Typography>
);

// Label Component - Minimal
const FieldLabel = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
  <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#555', mb: 0.5 }}>
    {children} {required && <span style={{ color: '#d32f2f' }}>*</span>}
  </Typography>
);

type Step = 'form' | 'summary' | 'success';

interface DealerIncentiveRequestFormProps {
  mode: 'create' | 'edit';
}

interface IncentiveRecord {
  id: number;
  incentive_title: string;
  incentive_details: string;
  purpose: string;
  target_audience: string;
  incentive_amount: number;
  event_time: string;
  event_location: string;
  event_venue: string;
  map_link: string;
  performance_metrics: string;
  notes: string;
  status: string;
  proposal_document?: string;
  reference_image?: string;
}

export const DealerIncentiveRequestForm = ({ mode }: DealerIncentiveRequestFormProps) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const notify = useNotify();
  const { buildUrl } = useBrand();
  const proposalInputRef = useRef<HTMLInputElement>(null);
  const referenceInputRef = useRef<HTMLInputElement>(null);

  const isEdit = mode === 'edit';

  // API hooks
  const [create, { isLoading: isCreating }] = useCreate();
  const [update, { isLoading: isUpdating }] = useUpdate();
  
  // Fetch existing data for edit mode
  const { data: record, isLoading: isLoadingRecord } = useGetOne<IncentiveRecord>(
    'incentives/requests',
    { id: id ? parseInt(id, 10) : 0 },
    { enabled: isEdit && !!id }
  );

  const isLoading = isCreating || isUpdating;

  const [currentStep, setCurrentStep] = useState<Step>('form');
  const [formInitialized, setFormInitialized] = useState(!isEdit);

  const [formData, setFormData] = useState({
    incentive_title: '',
    incentive_details: '',
    purpose: '',
    target_audience: '',
    incentive_amount: '',
    event_time: '',
    event_location: '',
    event_venue: '',
    map_link: '',
    performance_metrics: '',
    notes: '',
  });

  const [proposalDocument, setProposalDocument] = useState<File | null>(null);
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [referenceImagePreview, setReferenceImagePreview] = useState<string | null>(null);
  const [existingProposalDocument, setExistingProposalDocument] = useState<string | null>(null);
  const [existingReferenceImage, setExistingReferenceImage] = useState<string | null>(null);

  // Load record data into form when editing
  useEffect(() => {
    if (isEdit && record && !formInitialized) {
      setFormData({
        incentive_title: record.incentive_title || '',
        incentive_details: record.incentive_details || '',
        purpose: record.purpose || '',
        target_audience: record.target_audience || '',
        incentive_amount: record.incentive_amount ? String(record.incentive_amount) : '',
        event_time: record.event_time || '',
        event_location: record.event_location || '',
        event_venue: record.event_venue || '',
        map_link: record.map_link || '',
        performance_metrics: record.performance_metrics || '',
        notes: record.notes || '',
      });
      if (record.proposal_document) {
        setExistingProposalDocument(record.proposal_document);
      }
      if (record.reference_image) {
        setExistingReferenceImage(record.reference_image);
      }
      setFormInitialized(true);
    }
  }, [isEdit, record, formInitialized]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleProposalChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        notify('PDF, DOC veya DOCX formatında dosya yükleyin', { type: 'error' });
        return;
      }
      setProposalDocument(file);
      setExistingProposalDocument(null);
    }
  };

  const handleReferenceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setReferenceImage(file);
      setExistingReferenceImage(null);
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setReferenceImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setReferenceImagePreview(null);
      }
    }
  };

  // Get file icon based on file type
  const getFileIcon = (fileName: string | null) => {
    if (!fileName) return <DescriptionIcon sx={{ color: '#999', fontSize: 20 }} />;
    
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return <PictureAsPdfIcon sx={{ color: '#d32f2f', fontSize: 20 }} />;
      case 'doc':
      case 'docx':
        return <ArticleIcon sx={{ color: '#1976d2', fontSize: 20 }} />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return <ImageIcon sx={{ color: '#2e7d32', fontSize: 20 }} />;
      default:
        return <DescriptionIcon sx={{ color: '#666', fontSize: 20 }} />;
    }
  };

  const validateForm = (): boolean => {
    if (!formData.incentive_title.trim()) {
      notify('Teşvik Talebi alanı zorunludur', { type: 'error' });
      return false;
    }
    if (!formData.incentive_details.trim()) {
      notify('Teşvik Talep Detayları alanı zorunludur', { type: 'error' });
      return false;
    }
    if (!formData.purpose.trim()) {
      notify('Talebin amacı alanı zorunludur', { type: 'error' });
      return false;
    }
    if (!formData.target_audience.trim()) {
      notify('Hedef kitle alanı zorunludur', { type: 'error' });
      return false;
    }
    if (!formData.incentive_amount.trim()) {
      notify('Teşvik İstenen Tutar alanı zorunludur', { type: 'error' });
      return false;
    }
    if (!formData.event_time.trim()) {
      notify('Etkinlik Zamanı alanı zorunludur', { type: 'error' });
      return false;
    }
    if (!formData.event_location.trim()) {
      notify('Etkinlik İl-İlçe alanı zorunludur', { type: 'error' });
      return false;
    }
    if (!formData.event_venue.trim()) {
      notify('Etkinlik Yeri İsmi alanı zorunludur', { type: 'error' });
      return false;
    }
    if (!formData.performance_metrics.trim()) {
      notify('Performans Metrikleri alanı zorunludur', { type: 'error' });
      return false;
    }
    return true;
  };

  const handleGoToSummary = () => {
    if (validateForm()) {
      setCurrentStep('summary');
    }
  };

  const handleBackToForm = () => {
    setCurrentStep('form');
  };

  const handleSubmit = async (saveAsDraft = false) => {
    if (!saveAsDraft && !validateForm()) {
      return;
    }

    const data = {
      incentive_title: formData.incentive_title || '',
      incentive_details: formData.incentive_details || '',
      purpose: formData.purpose || '',
      target_audience: formData.target_audience || '',
      incentive_amount: parseFloat(formData.incentive_amount) || 0,
      event_time: formData.event_time || '',
      event_location: formData.event_location || '',
      event_venue: formData.event_venue || '',
      map_link: formData.map_link || '',
      performance_metrics: formData.performance_metrics || '',
      notes: formData.notes || '',
      status: saveAsDraft ? 'taslak' : 'onay_bekliyor',
    };

    const handleError = (error: unknown) => {
      const err = error as { body?: { detail?: string; [key: string]: unknown } };
      if (err?.body?.detail) {
        notify(err.body.detail, { type: 'error' });
      } else if (err?.body && typeof err.body === 'object') {
        const firstError = Object.values(err.body)[0];
        if (typeof firstError === 'string') {
          notify(firstError, { type: 'error' });
        } else if (Array.isArray(firstError) && firstError.length > 0) {
          notify(String(firstError[0]), { type: 'error' });
        } else {
          notify('Bir hata oluştu', { type: 'error' });
        }
      } else {
        notify('Bir hata oluştu', { type: 'error' });
      }
    };

    try {
      if (isEdit && id) {
        // Update existing record
        await update(
          'incentives/requests',
          { id, data },
          {
            onSuccess: () => {
              if (saveAsDraft) {
                notify('Taslak kaydedildi', { type: 'success' });
                navigate(buildUrl('/dealer/requests'));
              } else {
                setCurrentStep('success');
              }
            },
            onError: handleError,
          }
        );
      } else {
        // Create new record
        await create(
          'incentives/requests',
          { data },
          {
            onSuccess: () => {
              if (saveAsDraft) {
                notify('Taslak kaydedildi', { type: 'success' });
                navigate(buildUrl('/dealer/requests'));
              } else {
                setCurrentStep('success');
              }
            },
            onError: handleError,
          }
        );
      }
    } catch (error) {
      notify('Bir hata oluştu', { type: 'error' });
    }
  };

  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return '-';
    return num.toLocaleString('tr-TR') + ' TL';
  };

  const formatDate = (value: string) => {
    if (!value) return '-';
    try {
      const date = new Date(value);
      return date.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return value;
    }
  };

  const getDocumentDisplayName = () => {
    if (proposalDocument) return proposalDocument.name;
    if (existingProposalDocument) {
      const parts = existingProposalDocument.split('/');
      return parts[parts.length - 1];
    }
    return null;
  };

  const getReferenceDisplayName = () => {
    if (referenceImage) return referenceImage.name;
    if (existingReferenceImage) {
      const parts = existingReferenceImage.split('/');
      return parts[parts.length - 1];
    }
    return null;
  };

  // Loading state for edit mode
  if (isEdit && isLoadingRecord) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  // Success Step
  if (currentStep === 'success') {
    return (
      <Box sx={{ p: 2, maxWidth: 500, margin: '0 auto' }}>
        <Paper elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 2, p: 4, textAlign: 'center' }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              backgroundColor: '#e8f5e9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 32, color: '#166534' }} />
          </Box>
          <Typography sx={{ fontWeight: 600, fontSize: 16, mb: 1, color: '#333' }}>
            {isEdit ? 'Teşvik talebiniz güncellendi' : 'Teşvik talebiniz alındı'}
          </Typography>
          <Typography sx={{ fontSize: 13, color: '#666', mb: 3 }}>
            Mail ile bilgilendirileceksiniz.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate(buildUrl('/dealer/requests'))}
            sx={{
              bgcolor: '#1a1a2e',
              textTransform: 'none',
              px: 4,
              py: 1,
              boxShadow: 'none',
              '&:hover': { bgcolor: '#2d2d44', boxShadow: 'none' },
            }}
          >
            Taleplerime Git
          </Button>
        </Paper>
      </Box>
    );
  }

  // Summary Step
  if (currentStep === 'summary') {
    return (
      <Box sx={{ p: 2 }}>
        {/* Header */}
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <ArrowBackIcon 
            onClick={handleBackToForm}
            sx={{ fontSize: 20, color: '#666', cursor: 'pointer', '&:hover': { color: '#333' } }} 
          />
          <Typography sx={{ fontWeight: 600, fontSize: 16, color: '#1a1a2e' }}>
            Özet
          </Typography>
        </Box>

        <Paper elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 2, p: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <SummaryItem title="Teşvik Talebi" value={formData.incentive_title} />
            <Divider sx={{ borderColor: '#f0f0f0' }} />
            <SummaryItem title="Detaylar" value={formData.incentive_details} />
            <Divider sx={{ borderColor: '#f0f0f0' }} />
            <SummaryItem title="Amaç" value={formData.purpose} />
            <Divider sx={{ borderColor: '#f0f0f0' }} />
            <SummaryItem title="Hedef Kitle" value={formData.target_audience} />
            <Divider sx={{ borderColor: '#f0f0f0' }} />
            <SummaryItem title="Tutar" value={formatCurrency(formData.incentive_amount)} />
            <Divider sx={{ borderColor: '#f0f0f0' }} />
            <SummaryItem title="Döküman" value={getDocumentDisplayName() || '-'} />
            <Divider sx={{ borderColor: '#f0f0f0' }} />
            <SummaryItem title="Zaman" value={formatDate(formData.event_time)} />
            <Divider sx={{ borderColor: '#f0f0f0' }} />
            <SummaryItem title="Yer" value={`${formData.event_location}, ${formData.event_venue}`} />
            {formData.map_link && (
              <>
                <Divider sx={{ borderColor: '#f0f0f0' }} />
                <SummaryItem title="Harita" value={formData.map_link} />
              </>
            )}
            <Divider sx={{ borderColor: '#f0f0f0' }} />
            <SummaryItem title="Metrikler" value={formData.performance_metrics} />
            <Divider sx={{ borderColor: '#f0f0f0' }} />
            <SummaryItem title="Görsel" value={getReferenceDisplayName() || '-'} />
            {formData.notes && (
              <>
                <Divider sx={{ borderColor: '#f0f0f0' }} />
                <SummaryItem title="Not" value={formData.notes} />
              </>
            )}
          </Box>

          {/* Submit Button */}
          <Button
            variant="contained"
            fullWidth
            onClick={() => handleSubmit(false)}
            disabled={isLoading}
            sx={{
              mt: 3,
              py: 1.2,
              bgcolor: '#1a1a2e',
              textTransform: 'none',
              fontSize: 14,
              boxShadow: 'none',
              '&:hover': { bgcolor: '#2d2d44', boxShadow: 'none' },
            }}
          >
            {isLoading ? 'Gönderiliyor...' : (isEdit ? 'Talebi Güncelle' : 'Talep Oluştur')}
          </Button>
        </Paper>
      </Box>
    );
  }

  // Form Step
  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <ArrowBackIcon 
          onClick={() => navigate(buildUrl('/dealer/requests'))}
          sx={{ fontSize: 20, color: '#666', cursor: 'pointer', '&:hover': { color: '#333' } }} 
        />
        <Typography sx={{ fontWeight: 600, fontSize: 16, color: '#1a1a2e' }}>
          {isEdit ? 'Teşvik Talebi Düzenle' : 'Teşvik Talebi Oluştur'}
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 2, p: 2 }}>
        <SectionTitle>Teşvik Bilgileri</SectionTitle>

        {/* Teşvik Talebi */}
        <Box sx={{ mb: 2 }}>
          <FieldLabel required>Teşvik Talebi</FieldLabel>
          <TextField
            fullWidth
            multiline
            rows={2}
            placeholder="Teşvik talebinizi açıklayın..."
            value={formData.incentive_title}
            onChange={(e) => handleInputChange('incentive_title', e.target.value)}
            sx={inputStyles}
            size="small"
          />
        </Box>

        {/* Teşvik Talep Detayları */}
        <Box sx={{ mb: 2 }}>
          <FieldLabel required>Detaylar</FieldLabel>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Talebin kapsamını ve gereksinimlerini belirtin..."
            value={formData.incentive_details}
            onChange={(e) => handleInputChange('incentive_details', e.target.value)}
            sx={inputStyles}
            size="small"
          />
        </Box>

        {/* Talebin Amacı */}
        <Box sx={{ mb: 2 }}>
          <FieldLabel required>Amaç</FieldLabel>
          <TextField
            fullWidth
            multiline
            rows={2}
            placeholder="İş ve iletişim amacı..."
            value={formData.purpose}
            onChange={(e) => handleInputChange('purpose', e.target.value)}
            sx={inputStyles}
            size="small"
          />
        </Box>

        {/* Hedef Kitle */}
        <Box sx={{ mb: 2 }}>
          <FieldLabel required>Hedef Kitle</FieldLabel>
          <TextField
            fullWidth
            multiline
            rows={2}
            placeholder="Katılımcı bilgileri, demografi..."
            value={formData.target_audience}
            onChange={(e) => handleInputChange('target_audience', e.target.value)}
            sx={inputStyles}
            size="small"
          />
        </Box>

        <Divider sx={{ my: 2, borderColor: '#eee' }} />
        <SectionTitle>Finansal</SectionTitle>

        {/* Teşvik İstenen Tutar */}
        <Box sx={{ mb: 2 }}>
          <FieldLabel required>İstenen Tutar (TL)</FieldLabel>
          <TextField
            fullWidth
            type="number"
            placeholder="0"
            value={formData.incentive_amount}
            onChange={(e) => {
              const value = e.target.value;
              // Only allow positive numbers
              if (value === '' || (parseFloat(value) >= 0 && !value.includes('-'))) {
                handleInputChange('incentive_amount', value);
              }
            }}
            onKeyDown={(e) => {
              // Prevent minus key
              if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                e.preventDefault();
              }
            }}
            inputProps={{ min: 0, step: 100 }}
            sx={inputStyles}
            size="small"
          />
        </Box>

          {/* Teşvik Teklif Dökümanı */}
          <Box sx={{ mb: 2 }}>
            <FieldLabel>Teklif Dökümanı</FieldLabel>
            <input
              type="file"
              ref={proposalInputRef}
              onChange={handleProposalChange}
              style={{ display: 'none' }}
              accept=".pdf,.doc,.docx"
            />
            {getDocumentDisplayName() ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: '1px solid #d1d5db',
                  borderRadius: 1,
                  p: 1.5,
                  bgcolor: '#f8fafc',
                }}
              >
                <Box 
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', flex: 1 }}
                  onClick={() => proposalInputRef.current?.click()}
                >
                  {getFileIcon(getDocumentDisplayName())}
                  <Typography sx={{ fontSize: 13, color: '#333' }}>{getDocumentDisplayName()}</Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setProposalDocument(null);
                    setExistingProposalDocument(null);
                    if (proposalInputRef.current) {
                      proposalInputRef.current.value = '';
                    }
                  }}
                  sx={{ 
                    color: '#999',
                    '&:hover': { color: '#d32f2f', bgcolor: '#fee2e2' },
                  }}
                >
                  <CloseIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>
            ) : (
              <Box
                onClick={() => proposalInputRef.current?.click()}
                sx={{
                  cursor: 'pointer',
                  border: '1px dashed #d1d5db',
                  borderRadius: 1,
                  p: 2,
                  textAlign: 'center',
                  bgcolor: '#fafafa',
                  '&:hover': { bgcolor: '#f5f5f5', borderColor: '#999' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <DescriptionIcon sx={{ fontSize: 20, color: '#999' }} />
                  <Typography sx={{ fontSize: 13, color: '#666' }}>
                    PDF, DOC, DOCX
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>

          <Divider sx={{ my: 2, borderColor: '#eee' }} />
          <SectionTitle>Etkinlik Bilgileri</SectionTitle>

          {/* Etkinlik Zamanı */}
          <Box sx={{ mb: 2 }}>
            <FieldLabel required>Zaman</FieldLabel>
            <TextField
              fullWidth
              type="date"
              value={formData.event_time}
              onChange={(e) => handleInputChange('event_time', e.target.value)}
              sx={inputStyles}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          {/* Etkinlik İl-İlçe */}
          <Box sx={{ mb: 2 }}>
            <FieldLabel required>İl - İlçe</FieldLabel>
            <TextField
              fullWidth
              placeholder="Örn: İstanbul - Kadıköy"
              value={formData.event_location}
              onChange={(e) => handleInputChange('event_location', e.target.value)}
              sx={inputStyles}
              size="small"
            />
          </Box>

          {/* Etkinlik Yeri İsmi */}
          <Box sx={{ mb: 2 }}>
            <FieldLabel required>Yer İsmi</FieldLabel>
            <TextField
              fullWidth
              placeholder="Örn: Kadıköy Meydan"
              value={formData.event_venue}
              onChange={(e) => handleInputChange('event_venue', e.target.value)}
              sx={inputStyles}
              size="small"
            />
          </Box>

          {/* Harita Linki */}
          <Box sx={{ mb: 2 }}>
            <FieldLabel>Harita Linki</FieldLabel>
            <TextField
              fullWidth
              placeholder="https://maps.google.com/..."
              value={formData.map_link}
              onChange={(e) => handleInputChange('map_link', e.target.value)}
              sx={inputStyles}
              size="small"
            />
          </Box>

          <Divider sx={{ my: 2, borderColor: '#eee' }} />
          <SectionTitle>Performans & Ek Bilgiler</SectionTitle>

          {/* Performans Metrikleri */}
          <Box sx={{ mb: 2 }}>
            <FieldLabel required>Performans Metrikleri</FieldLabel>
            <TextField
              fullWidth
              multiline
              rows={2}
              placeholder="Hedeflenen sonuçlar..."
              value={formData.performance_metrics}
              onChange={(e) => handleInputChange('performance_metrics', e.target.value)}
              sx={inputStyles}
              size="small"
            />
          </Box>

          {/* Referans/Örnek Görsel */}
          <Box sx={{ mb: 2 }}>
            <FieldLabel>Referans Görsel</FieldLabel>
            <input
              type="file"
              ref={referenceInputRef}
              onChange={handleReferenceChange}
              style={{ display: 'none' }}
              accept="image/*,.pdf"
            />
            {getReferenceDisplayName() ? (
              <Box
                sx={{
                  border: '1px solid #d1d5db',
                  borderRadius: 1,
                  overflow: 'hidden',
                  bgcolor: '#f8fafc',
                }}
              >
                {/* Image Preview */}
                {(referenceImagePreview || (existingReferenceImage && existingReferenceImage.match(/\.(jpg|jpeg|png|gif|webp)$/i))) && (
                  <Box
                    sx={{
                      width: '100%',
                      height: 150,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: '#f0f0f0',
                      cursor: 'pointer',
                    }}
                    onClick={() => referenceInputRef.current?.click()}
                  >
                    <img
                      src={referenceImagePreview || (existingReferenceImage ? `${BASE_URL}${existingReferenceImage}` : '')}
                      alt="Preview"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                      }}
                    />
                  </Box>
                )}
                {/* File Info Row */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 1.5,
                    borderTop: (referenceImagePreview || (existingReferenceImage && existingReferenceImage.match(/\.(jpg|jpeg|png|gif|webp)$/i))) ? '1px solid #e5e7eb' : 'none',
                  }}
                >
                  <Box 
                    sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', flex: 1 }}
                    onClick={() => referenceInputRef.current?.click()}
                  >
                    {getFileIcon(getReferenceDisplayName())}
                    <Typography sx={{ fontSize: 13, color: '#333' }}>{getReferenceDisplayName()}</Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setReferenceImage(null);
                      setReferenceImagePreview(null);
                      setExistingReferenceImage(null);
                      if (referenceInputRef.current) {
                        referenceInputRef.current.value = '';
                      }
                    }}
                    sx={{ 
                      color: '#999',
                      '&:hover': { color: '#d32f2f', bgcolor: '#fee2e2' },
                    }}
                  >
                    <CloseIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>
              </Box>
            ) : (
              <Box
                onClick={() => referenceInputRef.current?.click()}
                sx={{
                  cursor: 'pointer',
                  border: '1px dashed #d1d5db',
                  borderRadius: 1,
                  p: 2,
                  textAlign: 'center',
                  bgcolor: '#fafafa',
                  '&:hover': { bgcolor: '#f5f5f5', borderColor: '#999' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <ImageIcon sx={{ fontSize: 20, color: '#999' }} />
                  <Typography sx={{ fontSize: 13, color: '#666' }}>
                    Görsel yükle
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>

          {/* Not */}
          <Box sx={{ mb: 2 }}>
            <FieldLabel>Not</FieldLabel>
            <TextField
              fullWidth
              multiline
              rows={2}
              placeholder="Ek bilgiler..."
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              sx={inputStyles}
              size="small"
            />
          </Box>

          {/* Warning Box */}
          <Alert
            icon={<WarningAmberIcon sx={{ fontSize: 18 }} />}
            severity="warning"
            sx={{
              mt: 2,
              mb: 2,
              py: 1,
              bgcolor: '#fffbeb',
              border: '1px solid #fcd34d',
              '& .MuiAlert-icon': { color: '#d97706' },
              '& .MuiAlert-message': { py: 0 },
            }}
          >
            <Typography sx={{ fontWeight: 600, fontSize: 12, mb: 0.5, color: '#92400e' }}>
              Dikkat:
            </Typography>
            <Typography sx={{ fontSize: 11, lineHeight: 1.5, color: '#78350f' }}>
              • Görsel taleplerinizi en az 15 gün önceden iletiniz.<br />
              • Detaylı bilgi: oyilma61@ford.com.tr
            </Typography>
          </Alert>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1.5, mt: 3 }}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<SaveIcon sx={{ fontSize: 18 }} />}
              onClick={() => handleSubmit(true)}
              disabled={isLoading}
              sx={{ 
                py: 1.2, 
                textTransform: 'none', 
                fontSize: 13,
                borderColor: '#d1d5db',
                color: '#666',
                '&:hover': { borderColor: '#999', bgcolor: '#f9fafb' },
              }}
            >
              Taslak
            </Button>
            <Button
              variant="contained"
              fullWidth
              onClick={handleGoToSummary}
              sx={{
                py: 1.2,
                bgcolor: '#1a1a2e',
                textTransform: 'none',
                fontSize: 13,
                boxShadow: 'none',
                '&:hover': { bgcolor: '#2d2d44', boxShadow: 'none' },
              }}
            >
              İleri
            </Button>
          </Box>
        </Paper>
      </Box>
    );
};

// Summary Item Component - Minimal
const SummaryItem = ({ title, value }: { title: string; value: string }) => (
  <Box sx={{ display: 'flex', py: 0.5 }}>
    <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#666', width: 100, flexShrink: 0 }}>
      {title}
    </Typography>
    <Typography sx={{ fontSize: 13, color: '#333', flex: 1, whiteSpace: 'pre-line' }}>
      {value || '-'}
    </Typography>
  </Box>
);

// Backward compatibility exports
export const DealerIncentiveRequestCreate = () => <DealerIncentiveRequestForm mode="create" />;
export const DealerIncentiveRequestEdit = () => <DealerIncentiveRequestForm mode="edit" />;

