import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Divider,
  Checkbox,
  Radio,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useCreate, useUpdate, useGetOne, useNotify, useGetList } from 'react-admin';
import { useBrand } from '../../context/BrandContext';
import { useState, useEffect, useCallback } from 'react';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import { getCurrentToken } from '../../authProvider';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { inputStyles, Section, FieldLabel, DealerPageHeader, DealerSummaryItem } from '../../components/FormFields';
import { useSmartBack } from '../../hooks/useSmartBack';

// Feature flag: Kampanya Türü Seçimi (Link vs Görsel Yükleme)
// Ford için true, Tofaş için false
const ENABLE_CAMPAIGN_TYPE_SELECTION = false;

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


type Step = 'form' | 'summary' | 'success';

interface CampaignRecord {
  id: number;
  campaign_name: string;
  brand: number | null;
  brand_name?: string;
  budget: number;
  start_date: string;
  end_date: string;
  platforms: string[];
  campaign_type: string;
  ad_model: string;
  redirect_type: string;
  fb_post_link: string;
  ig_post_link: string;
  notes: string;
  status: string;
}

interface BrandRecord {
  id: number;
  name: string;
}

interface DealerCampaignRequestFormProps {
  mode: 'create' | 'edit';
}

// Budget check result type
interface BudgetCheckResult {
  valid: boolean;
  error?: string;
  message?: string;
  warning?: boolean;
  has_plan: boolean;
  plan_start?: string;
  plan_end?: string;
  total_budget?: number;
  used_budget?: number;
  available_budget: number;
  requested_budget: number;
  remaining_after?: number;
}

export const DealerCampaignRequestForm = ({ mode }: DealerCampaignRequestFormProps) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const notify = useNotify();
  const { buildUrl } = useBrand();
  
  const isEdit = mode === 'edit';
  const smartGoBack = useSmartBack({ fallbackPath: buildUrl('/dealer/requests') });

  // API hooks
  const [create, { isLoading: isCreating }] = useCreate();
  const [update, { isLoading: isUpdating }] = useUpdate();
  
  // Fetch existing data for edit mode
  const { data: record, isLoading: isLoadingRecord } = useGetOne<CampaignRecord>(
    'campaigns/requests',
    { id: id ? parseInt(id, 10) : 0 },
    { enabled: isEdit && !!id }
  );

  // Fetch brands list
  const { data: brandsData } = useGetList<BrandRecord>(
    'brands',
    { pagination: { page: 1, perPage: 100 }, sort: { field: 'name', order: 'ASC' } }
  );
  const brands = brandsData || [];

  const isLoading = isCreating || isUpdating;

  const [currentStep, setCurrentStep] = useState<Step>('form');
  const [formInitialized, setFormInitialized] = useState(!isEdit);
  const [selectedBrand, setSelectedBrand] = useState<number | ''>('');

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
  const [adModel, setAdModel] = useState<'bayi_sayfasi' | 'form_yonlendirme' | 'leasing'>('form_yonlendirme');

  // Budget check states
  const [budgetCheckResult, setBudgetCheckResult] = useState<BudgetCheckResult | null>(null);
  const [isBudgetChecking, setIsBudgetChecking] = useState(false);
  const [budgetCheckDebounce, setBudgetCheckDebounce] = useState<ReturnType<typeof setTimeout> | null>(null);

  // Budget check function
  const checkBudget = useCallback(async (budget: string, startDate: string, endDate: string) => {
    const budgetNum = parseFloat(budget);
    
    // Bütçe girilmediyse veya geçersizse
    if (!budget || isNaN(budgetNum) || budgetNum <= 0) {
      setBudgetCheckResult(null);
      return;
    }

    // Tarihler eksikse uyarı göster
    if (!startDate || !endDate) {
      setBudgetCheckResult({
        valid: false,
        warning: true,
        error: 'Bütçe kontrolü için başlangıç ve bitiş tarihlerini girin.',
        has_plan: false,
        available_budget: 0,
        requested_budget: budgetNum,
      });
      return;
    }

    setIsBudgetChecking(true);
    
    try {
      const token = getCurrentToken();
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8084/api';
      console.log('[BudgetCheck] Sending request to:', `${apiUrl}/dealers/check_budget/`, 'Token:', token ? 'exists' : 'missing');
      
      const response = await fetch(`${apiUrl}/dealers/check_budget/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          start_date: startDate,
          end_date: endDate,
          budget_amount: budgetNum,
        }),
      });
      
      console.log('[BudgetCheck] Response status:', response.status);
      const result = await response.json();
      console.log('[BudgetCheck] Result:', result);
      setBudgetCheckResult(result);
    } catch (error) {
      console.error('[BudgetCheck] Failed:', error);
      setBudgetCheckResult({
        valid: false,
        error: 'Bütçe kontrolü yapılamadı. Lütfen tekrar deneyin.',
        has_plan: false,
        available_budget: 0,
        requested_budget: budgetNum,
      });
    } finally {
      setIsBudgetChecking(false);
    }
  }, []);

  // Debounced budget check on input change
  useEffect(() => {
    if (budgetCheckDebounce) {
      clearTimeout(budgetCheckDebounce);
    }

    const timeout = setTimeout(() => {
      checkBudget(formData.budget, formData.start_date, formData.end_date);
    }, 500); // 500ms debounce

    setBudgetCheckDebounce(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.budget, formData.start_date, formData.end_date]);

  // Load record data into form when editing
  useEffect(() => {
    if (isEdit && record && !formInitialized) {
      setFormData({
        campaign_name: record.campaign_name || '',
        budget: record.budget ? String(record.budget) : '',
        start_date: record.start_date || '',
        end_date: record.end_date || '',
        redirect_type: record.redirect_type || 'satis',
        notes: record.notes || '',
        fb_post_link: record.fb_post_link || '',
        ig_post_link: record.ig_post_link || '',
      });
      if (record.brand) {
        setSelectedBrand(record.brand);
      }
      if (record.platforms) {
        setPlatforms(Array.isArray(record.platforms) ? record.platforms : JSON.parse(record.platforms as any));
      }
      if (record.campaign_type) {
        setCampaignType(record.campaign_type as 'link' | 'upload');
      }
      if (record.ad_model) {
        setAdModel('form_yonlendirme');
      }
      setFormInitialized(true);
    }
  }, [isEdit, record, formInitialized]);

  // Show loading state for edit mode
  if (isEdit && isLoadingRecord) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography>Yükleniyor...</Typography>
      </Box>
    );
  }

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
    // Bitiş tarihi, başlangıç tarihinden önce olamaz
    if (formData.start_date && formData.end_date && formData.end_date < formData.start_date) {
      notify('Bitiş tarihi, başlangıç tarihinden önce olamaz', { type: 'error' });
      return false;
    }
    if (platforms.length === 0) {
      notify('En az bir platform seçmelisiniz', { type: 'error' });
      return false;
    }
    // Bütçe kontrolü
    if (budgetCheckResult && !budgetCheckResult.valid) {
      notify(budgetCheckResult.error || 'Bütçe kontrolü başarısız', { type: 'error' });
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
      brand: selectedBrand || null,
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
      if (isEdit && id) {
        await update(
          'campaigns/requests',
          { id: parseInt(id, 10), data },
          {
            onSuccess: () => {
              if (saveAsDraft) {
                notify('Taslak kaydedildi', { type: 'success' });
                navigate(buildUrl('/dealer/requests'));
              } else {
                setCurrentStep('success');
              }
            },
            onError: () => {
              notify('Bir hata oluştu', { type: 'error' });
            },
          }
        );
      } else {
        await create(
          'campaigns/requests',
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
            onError: () => {
              notify('Bir hata oluştu', { type: 'error' });
            },
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
    return num.toLocaleString('tr-TR') + ' ₺';
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
            {isEdit ? 'Kampanya talebiniz güncellendi' : 'Kampanya talebiniz alındı'}
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
        <DealerPageHeader title="Kampanya Özet" onBack={handleBackToForm} />

        <Paper elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 2, p: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <DealerSummaryItem title="Kampanya Adı" value={formData.campaign_name} />
            {selectedBrand && (
              <>
                <Divider sx={{ borderColor: '#f0f0f0' }} />
                <DealerSummaryItem title="Marka" value={brands.find(b => b.id === selectedBrand)?.name || ''} />
              </>
            )}
            <Divider sx={{ borderColor: '#f0f0f0' }} />
            <DealerSummaryItem title="Bütçe" value={formatCurrency(formData.budget)} />
            <Divider sx={{ borderColor: '#f0f0f0' }} />
            <DealerSummaryItem title="Tarih" value={`${formData.start_date} - ${formData.end_date}`} />
            <Divider sx={{ borderColor: '#f0f0f0' }} />
            <DealerSummaryItem title="Platformlar" value={platforms.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ')} />
            <Divider sx={{ borderColor: '#f0f0f0' }} />
            <DealerSummaryItem 
              title="Reklam Modeli" 
              value={adModel === 'form_yonlendirme' ? 'Form Yönlendirme' : adModel === 'leasing' ? 'Leasing' : adModel === 'bayi_sayfasi' ? 'Bayi Sayfası' : adModel} 
            />
            {formData.notes && (
              <>
                <Divider sx={{ borderColor: '#f0f0f0' }} />
                <DealerSummaryItem title="Notlar" value={formData.notes} />
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
      <DealerPageHeader
        title={isEdit ? 'Kampanya Düzenle' : 'Kampanya Oluştur'}
        onBack={smartGoBack}
      />

      <Paper elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 2, p: 2 }}>
        <Section title="Kampanya Bilgileri" first />

        {/* Kampanya Adı ve Marka */}
        <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
          <Box sx={{ flex: 2 }}>
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
          <Box sx={{ flex: 1 }}>
            <FieldLabel>Marka</FieldLabel>
            <FormControl fullWidth size="small">
              <Select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value as number | '')}
                displayEmpty
                sx={{
                  fontSize: 13,
                  backgroundColor: '#fafafa',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e5e7eb' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#d1d5db' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1a1a2e' },
                }}
              >
                <MenuItem value="">
                  <em>Marka seçin</em>
                </MenuItem>
                {brands.map((brand) => (
                  <MenuItem key={brand.id} value={brand.id}>
                    {brand.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* Tarihler - Bütçenin üstünde */}
        <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <FieldLabel required>Başlangıç Tarihi</FieldLabel>
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
            <FieldLabel required>Bitiş Tarihi</FieldLabel>
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

        {/* Bütçe - Tarihlerin altında */}
        <Box sx={{ mb: 2 }}>
          <FieldLabel required>Bütçe (₺)</FieldLabel>
          <Box sx={{ position: 'relative' }}>
            <TextField
              fullWidth
              type="number"
              placeholder="0"
              value={formData.budget}
              onChange={(e) => handleInputChange('budget', e.target.value)}
              inputProps={{ min: 0 }}
              sx={{
                ...inputStyles,
                '& .MuiOutlinedInput-root': {
                  ...inputStyles['& .MuiOutlinedInput-root'],
                  ...(budgetCheckResult && !budgetCheckResult.valid && !budgetCheckResult.warning && {
                    '& fieldset': { borderColor: '#d32f2f' },
                  }),
                  ...(budgetCheckResult && budgetCheckResult.warning && {
                    '& fieldset': { borderColor: '#ed6c02' },
                  }),
                },
              }}
              size="small"
              InputProps={{
                endAdornment: isBudgetChecking ? (
                  <CircularProgress size={16} sx={{ mr: 1 }} />
                ) : null,
              }}
            />
          </Box>
          
          {/* Budget Check Alert - Sadece hata durumlarında göster */}
          {budgetCheckResult && !budgetCheckResult.valid && (
            <Alert
              severity={budgetCheckResult.warning ? 'warning' : 'error'}
              icon={budgetCheckResult.warning ? <WarningAmberIcon fontSize="small" /> : <ErrorOutlineIcon fontSize="small" />}
              sx={{ 
                mt: 1.5, 
                py: 0.5,
                px: 1.5,
                '& .MuiAlert-message': { fontSize: 13 },
                '& .MuiAlert-icon': { py: 0.5, mr: 1 },
              }}
            >
              {budgetCheckResult.has_plan 
                ? 'Yetersiz bütçe' 
                : 'Bu tarih aralığında bütçe planı tanımlı değil'}
            </Alert>
          )}
        </Box>

        <Section title="Platform" />

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
            <Section title="Kampanya Türü" />
            
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


        <Section title="Reklam Modeli" />

        {/* Reklam Modeli */}
        <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
          <AdModelOption
            selected={adModel === 'form_yonlendirme'}
            title="Form Yönlendirme"
            description="Lead toplama odaklı"
            onChange={() => setAdModel('form_yonlendirme')}
          />
          <AdModelOption
            selected={adModel === 'leasing'}
            title="Leasing"
            description="Leasing kampanyaları"
            onChange={() => setAdModel('leasing')}
          />
        </Box>

        <Section title="Notlar (Opsiyonel)" />

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

// Backward compatibility export
export const DealerCampaignRequestCreate = () => <DealerCampaignRequestForm mode="create" />;

