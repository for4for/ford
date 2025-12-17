import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Divider,
  Checkbox,
  Radio,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useCreate, useNotify } from 'react-admin';
import { useState } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';

// Feature flag: Kampanya Türü Seçimi (Link vs Görsel Yükleme)
// Ford için true, Tofaş için false
const ENABLE_CAMPAIGN_TYPE_SELECTION = false;

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

// Section Title
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

// Label Component
const FieldLabel = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
  <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#555', mb: 0.5 }}>
    {children} {required && <span style={{ color: '#d32f2f' }}>*</span>}
  </Typography>
);

// Platform Checkbox
const PlatformCheckbox = ({ 
  checked, 
  onChange, 
  icon, 
  label 
}: { 
  checked: boolean; 
  onChange: () => void;
  icon: React.ReactNode;
  label: string;
}) => (
  <Box
    onClick={onChange}
    sx={{
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      px: 1.5,
      py: 1,
      borderRadius: '6px',
      border: `1.5px solid ${checked ? '#374151' : '#e5e7eb'}`,
      backgroundColor: checked ? '#f9fafb' : '#fff',
      cursor: 'pointer',
      '&:hover': { borderColor: checked ? '#374151' : '#d1d5db' },
    }}
  >
    <Checkbox checked={checked} size="small" sx={{ p: 0, color: '#d1d5db', '&.Mui-checked': { color: '#374151' } }} />
    {icon}
    <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>{label}</Typography>
  </Box>
);

// Ad Model Option
const AdModelOption = ({ 
  selected, 
  title, 
  description,
  onChange 
}: { 
  selected: boolean;
  title: string;
  description: string;
  onChange: () => void;
}) => (
  <Box
    onClick={onChange}
    sx={{
      flex: 1,
      border: `1.5px solid ${selected ? '#374151' : '#e5e7eb'}`,
      borderRadius: '6px',
      p: 1.5,
      cursor: 'pointer',
      backgroundColor: selected ? '#f9fafb' : '#fff',
      '&:hover': { borderColor: selected ? '#374151' : '#d1d5db' },
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
      <Radio checked={selected} size="small" sx={{ p: 0, mt: 0.3, color: '#d1d5db', '&.Mui-checked': { color: '#374151' } }} />
      <Box>
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{title}</Typography>
        <Typography sx={{ fontSize: 11, color: '#9ca3af' }}>{description}</Typography>
      </Box>
    </Box>
  </Box>
);

// Summary Item
const SummaryItem = ({ title, value }: { title: string; value: string }) => (
  <Box sx={{ display: 'flex', py: 0.5 }}>
    <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#666', width: 120, flexShrink: 0 }}>
      {title}
    </Typography>
    <Typography sx={{ fontSize: 13, color: '#333', flex: 1 }}>
      {value || '-'}
    </Typography>
  </Box>
);

type Step = 'form' | 'summary' | 'success';

export const DealerCampaignRequestCreate = () => {
  const navigate = useNavigate();
  const [create, { isLoading }] = useCreate();
  const notify = useNotify();

  const [currentStep, setCurrentStep] = useState<Step>('form');

  const [formData, setFormData] = useState({
    campaign_name: '',
    budget: '',
    start_date: '',
    end_date: '',
    redirect_type: 'satis',
    notes: '',
    fb_post_link: '',
    ig_post_link: '',
  });

  const [platforms, setPlatforms] = useState<string[]>(['instagram', 'facebook']);
  const [campaignType, setCampaignType] = useState<'link' | 'upload'>('link');
  const [adModel, setAdModel] = useState<'bayi_sayfasi' | 'form_yonlendirme'>('bayi_sayfasi');

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePlatformToggle = (platform: string) => {
    if (platforms.includes(platform)) {
      setPlatforms(platforms.filter(p => p !== platform));
    } else {
      setPlatforms([...platforms, platform]);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.campaign_name.trim()) {
      notify('Kampanya adı zorunludur', { type: 'error' });
      return false;
    }
    if (!formData.budget.trim()) {
      notify('Bütçe zorunludur', { type: 'error' });
      return false;
    }
    if (!formData.start_date.trim()) {
      notify('Başlangıç tarihi zorunludur', { type: 'error' });
      return false;
    }
    if (!formData.end_date.trim()) {
      notify('Bitiş tarihi zorunludur', { type: 'error' });
      return false;
    }
    if (platforms.length === 0) {
      notify('En az bir platform seçmelisiniz', { type: 'error' });
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
      campaign_name: formData.campaign_name,
      budget: parseFloat(formData.budget) || 0,
      start_date: formData.start_date,
      end_date: formData.end_date,
      platforms,
      campaign_type: campaignType,
      ad_model: adModel,
      redirect_type: formData.redirect_type,
      fb_post_link: formData.fb_post_link,
      ig_post_link: formData.ig_post_link,
      notes: formData.notes,
      status: saveAsDraft ? 'taslak' : 'onay_bekliyor',
    };

    try {
      await create(
        'campaigns/requests',
        { data },
        {
          onSuccess: () => {
            if (saveAsDraft) {
              notify('Taslak kaydedildi', { type: 'success' });
              navigate('/dealer/requests');
            } else {
              setCurrentStep('success');
            }
          },
          onError: () => {
            notify('Bir hata oluştu', { type: 'error' });
          },
        }
      );
    } catch (error) {
      notify('Bir hata oluştu', { type: 'error' });
    }
  };

  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return '-';
    return num.toLocaleString('tr-TR') + ' ₺';
  };

  const getRedirectTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      satis: 'Satış Sayfası',
      servis: 'Servis Sayfası',
      diger: 'Diğer',
    };
    return labels[type] || type;
  };

  const getAdModelLabel = (model: string) => {
    const labels: Record<string, string> = {
      bayi_sayfasi: 'Bayi Sayfası',
      form_yonlendirme: 'Form Yönlendirme',
    };
    return labels[model] || model;
  };

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
            Kampanya talebiniz alındı
          </Typography>
          <Typography sx={{ fontSize: 13, color: '#666', mb: 3 }}>
            Mail ile bilgilendirileceksiniz.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/dealer/requests')}
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
            Kampanya Özet
          </Typography>
        </Box>

        <Paper elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 2, p: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <SummaryItem title="Kampanya Adı" value={formData.campaign_name} />
            <Divider sx={{ borderColor: '#f0f0f0' }} />
            <SummaryItem title="Bütçe" value={formatCurrency(formData.budget)} />
            <Divider sx={{ borderColor: '#f0f0f0' }} />
            <SummaryItem title="Tarih" value={`${formData.start_date} - ${formData.end_date}`} />
            <Divider sx={{ borderColor: '#f0f0f0' }} />
            <SummaryItem title="Platformlar" value={platforms.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ')} />
            <Divider sx={{ borderColor: '#f0f0f0' }} />
            <SummaryItem title="Yönlendirme" value={getRedirectTypeLabel(formData.redirect_type)} />
            <Divider sx={{ borderColor: '#f0f0f0' }} />
            <SummaryItem title="Reklam Modeli" value={getAdModelLabel(adModel)} />
            {formData.notes && (
              <>
                <Divider sx={{ borderColor: '#f0f0f0' }} />
                <SummaryItem title="Notlar" value={formData.notes} />
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
            {isLoading ? 'Gönderiliyor...' : 'Talep Oluştur'}
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
          onClick={() => navigate('/dealer/requests')}
          sx={{ fontSize: 20, color: '#666', cursor: 'pointer', '&:hover': { color: '#333' } }} 
        />
        <Typography sx={{ fontWeight: 600, fontSize: 16, color: '#1a1a2e' }}>
          Kampanya Oluştur
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 2, p: 2 }}>
        <SectionTitle>Kampanya Bilgileri</SectionTitle>

        {/* Kampanya Adı */}
        <Box sx={{ mb: 2 }}>
          <FieldLabel required>Kampanya Adı</FieldLabel>
          <TextField
            fullWidth
            placeholder="Örn: Bahar Kampanyası"
            value={formData.campaign_name}
            onChange={(e) => handleInputChange('campaign_name', e.target.value)}
            sx={inputStyles}
            size="small"
          />
        </Box>

        {/* Bütçe */}
        <Box sx={{ mb: 2 }}>
          <FieldLabel required>Bütçe (₺)</FieldLabel>
          <TextField
            fullWidth
            type="number"
            placeholder="0"
            value={formData.budget}
            onChange={(e) => handleInputChange('budget', e.target.value)}
            inputProps={{ min: 0 }}
            sx={inputStyles}
            size="small"
          />
        </Box>

        {/* Tarihler */}
        <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <FieldLabel required>Başlangıç</FieldLabel>
            <TextField
              fullWidth
              type="date"
              value={formData.start_date}
              onChange={(e) => handleInputChange('start_date', e.target.value)}
              sx={inputStyles}
              size="small"
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <FieldLabel required>Bitiş</FieldLabel>
            <TextField
              fullWidth
              type="date"
              value={formData.end_date}
              onChange={(e) => handleInputChange('end_date', e.target.value)}
              sx={inputStyles}
              size="small"
            />
          </Box>
        </Box>

        <Divider sx={{ my: 2, borderColor: '#eee' }} />
        <SectionTitle>Platform</SectionTitle>

        {/* Platform Seçimi */}
        <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
          <PlatformCheckbox
            checked={platforms.includes('instagram')}
            onChange={() => handlePlatformToggle('instagram')}
            icon={<InstagramIcon sx={{ fontSize: 18, color: '#E4405F' }} />}
            label="Instagram"
          />
          <PlatformCheckbox
            checked={platforms.includes('facebook')}
            onChange={() => handlePlatformToggle('facebook')}
            icon={<FacebookIcon sx={{ fontSize: 18, color: '#1877F2' }} />}
            label="Facebook"
          />
        </Box>

        {/* Kampanya Türü - Ford için */}
        {ENABLE_CAMPAIGN_TYPE_SELECTION && (
          <>
            <Divider sx={{ my: 2, borderColor: '#eee' }} />
            <SectionTitle>Kampanya Türü</SectionTitle>
            
            <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
              <AdModelOption
                selected={campaignType === 'link'}
                title="Link ile"
                description="Post linkini paylaşın"
                onChange={() => setCampaignType('link')}
              />
              <AdModelOption
                selected={campaignType === 'upload'}
                title="Görsel Yükle"
                description="Kendi görselinizi yükleyin"
                onChange={() => setCampaignType('upload')}
              />
            </Box>

            {campaignType === 'link' && (
              <>
                <Box sx={{ mb: 2 }}>
                  <FieldLabel>Facebook Post Linki</FieldLabel>
                  <TextField
                    fullWidth
                    placeholder="https://facebook.com/..."
                    value={formData.fb_post_link}
                    onChange={(e) => handleInputChange('fb_post_link', e.target.value)}
                    sx={inputStyles}
                    size="small"
                  />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <FieldLabel>Instagram Post Linki</FieldLabel>
                  <TextField
                    fullWidth
                    placeholder="https://instagram.com/..."
                    value={formData.ig_post_link}
                    onChange={(e) => handleInputChange('ig_post_link', e.target.value)}
                    sx={inputStyles}
                    size="small"
                  />
                </Box>
              </>
            )}
          </>
        )}

        <Divider sx={{ my: 2, borderColor: '#eee' }} />
        <SectionTitle>Yönlendirme</SectionTitle>

        {/* Yönlendirme */}
        <Box sx={{ mb: 2 }}>
          <FieldLabel>Hedef Sayfa</FieldLabel>
          <TextField
            fullWidth
            select
            value={formData.redirect_type}
            onChange={(e) => handleInputChange('redirect_type', e.target.value)}
            sx={inputStyles}
            size="small"
            SelectProps={{ native: true }}
          >
            <option value="satis">Satış Sayfası</option>
            <option value="servis">Servis Sayfası</option>
            <option value="diger">Diğer</option>
          </TextField>
        </Box>

        <Divider sx={{ my: 2, borderColor: '#eee' }} />
        <SectionTitle>Reklam Modeli</SectionTitle>

        {/* Reklam Modeli */}
        <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
          <AdModelOption
            selected={adModel === 'bayi_sayfasi'}
            title="Bayi Sayfası"
            description="Beğeni ve yorum odaklı"
            onChange={() => setAdModel('bayi_sayfasi')}
          />
          <AdModelOption
            selected={adModel === 'form_yonlendirme'}
            title="Form Yönlendirme"
            description="Lead toplama odaklı"
            onChange={() => setAdModel('form_yonlendirme')}
          />
        </Box>

        <Divider sx={{ my: 2, borderColor: '#eee' }} />
        <SectionTitle>Notlar (Opsiyonel)</SectionTitle>

        {/* Not */}
        <Box sx={{ mb: 2 }}>
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

