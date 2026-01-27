import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  IconButton,
  FormControlLabel,
  Checkbox,
  Alert,
  Divider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useCreate, useNotify } from 'react-admin';
import { useState, useRef } from 'react';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';

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

interface Size {
  width: string;
  height: string;
  unit: string;
  quantity: number;
}

interface CreativeType {
  checked: boolean;
  description: string;
}

type Step = 'form' | 'summary' | 'success';

export const DealerCreativeRequestCreate = () => {
  const navigate = useNavigate();
  const [create, { isLoading }] = useCreate();
  const notify = useNotify();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentStep, setCurrentStep] = useState<Step>('form');
  const [additionalNote, setAdditionalNote] = useState('');

  const [formData, setFormData] = useState({
    creative_work_request: '',
    quantity_request: '',
    work_details: '',
    intended_message: '',
    legal_text: '',
    deadline: '',
  });

  const [sizes, setSizes] = useState<Size[]>([{ width: '', height: '', unit: 'cm', quantity: 1 }]);
  
  // İstenilen Kreatif - HTML wireframe ile aynı sırada
  const [creativeTypes, setCreativeTypes] = useState<Record<string, CreativeType>>({
    poster: { checked: false, description: '' },
    cadir: { checked: false, description: '' },
    tente: { checked: false, description: '' },
    stand: { checked: false, description: '' },
    orumcek: { checked: false, description: '' },
    megalight: { checked: false, description: '' },
    dijital: { checked: false, description: '' },
    led: { checked: false, description: '' },
    rollup: { checked: false, description: '' },
    el_ilani: { checked: false, description: '' },
    branda: { checked: false, description: '' },
    totem: { checked: false, description: '' },
    sticker: { checked: false, description: '' },
    diger: { checked: false, description: '' },
  });

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

  const [referenceFile, setReferenceFile] = useState<File | null>(null);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddSize = () => {
    setSizes([...sizes, { width: '', height: '', unit: 'cm', quantity: 1 }]);
  };

  const handleRemoveSize = (index: number) => {
    if (sizes.length > 1) {
      setSizes(sizes.filter((_, i) => i !== index));
    }
  };

  const handleSizeChange = (index: number, field: 'width' | 'height' | 'unit' | 'quantity', value: any) => {
    const newSizes = [...sizes];
    if (field === 'quantity') {
      newSizes[index] = { ...newSizes[index], quantity: parseInt(value) || 0 };
    } else {
      newSizes[index] = { ...newSizes[index], [field]: value };
    }
    setSizes(newSizes);
  };

  const handleCreativeTypeChange = (key: string, checked: boolean) => {
    setCreativeTypes((prev) => ({
      ...prev,
      [key]: { ...prev[key], checked, description: checked ? prev[key].description : '' },
    }));
  };

  const handleCreativeDescriptionChange = (key: string, description: string) => {
    setCreativeTypes((prev) => ({
      ...prev,
      [key]: { ...prev[key], description },
    }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setReferenceFile(file);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.creative_work_request.trim()) {
      notify('Kreatif Çalışma İsteği alanı zorunludur', { type: 'error' });
      return false;
    }
    if (!formData.quantity_request.trim()) {
      notify('Kreatif Çalışma Adet Talebi alanı zorunludur', { type: 'error' });
      return false;
    }
    if (!formData.work_details.trim()) {
      notify('Kreatif Çalışma Detayları alanı zorunludur', { type: 'error' });
      return false;
    }
    if (sizes.length === 0 || !sizes[0].width.trim() || !sizes[0].height.trim()) {
      notify('En az bir boyut eklemelisiniz (En ve Boy zorunludur)', { type: 'error' });
      return false;
    }
    
    const hasSelectedCreative = Object.values(creativeTypes).some((ct) => ct.checked);
    if (!hasSelectedCreative) {
      notify('En az bir İstenilen Kreatif seçmelisiniz', { type: 'error' });
      return false;
    }
    
    if (!formData.deadline.trim()) {
      notify('Deadline alanı zorunludur', { type: 'error' });
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
    // Taslak kaydetme için validasyon gerekmiyor
    if (!saveAsDraft && !validateForm()) {
      return;
    }

    const selectedCreatives = Object.entries(creativeTypes)
      .filter(([, value]) => value.checked)
      .map(([key, value]) => ({
        creative_type: key,
        description: value.description,
      }));

    const data = {
      creative_work_request: formData.creative_work_request,
      quantity_request: parseInt(formData.quantity_request) || 0,
      work_details: formData.work_details,
      intended_message: formData.intended_message,
      legal_text: formData.legal_text,
      deadline: formData.deadline,
      status: saveAsDraft ? 'taslak' : 'gorsel_bekliyor',
      admin_notes: additionalNote,
      sizes: sizes.filter(s => s.width.trim() && s.height.trim()).map((s) => ({ 
        size: `${s.width}${s.unit} x ${s.height}${s.unit}`, 
        quantity: s.quantity 
      })),
      creatives: selectedCreatives.length > 0 ? selectedCreatives : [{ creative_type: 'diger', description: '' }],
    };

    try {
      await create(
        'creatives/requests',
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

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR');
  };

  const getSelectedCreativesText = () => {
    return Object.entries(creativeTypes)
      .filter(([, value]) => value.checked)
      .map(([key, value]) => {
        const label = creativeTypeLabels[key];
        return value.description ? `${label}: ${value.description}` : label;
      })
      .join('\n');
  };

  const getSizesText = () => {
    return sizes
      .filter((s) => s.width.trim() && s.height.trim())
      .map((s) => `${s.width}${s.unit} x ${s.height}${s.unit} - Adet: ${s.quantity}`)
      .join('\n');
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
              Kreatif talebiniz alındı
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
            Özet
              </Typography>
            </Box>

        <Paper elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 2, p: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <SummaryItem title="Çalışma İsteği" value={formData.creative_work_request} />
            <Divider sx={{ borderColor: '#f0f0f0' }} />
            <SummaryItem title="Adet" value={formData.quantity_request} />
            <Divider sx={{ borderColor: '#f0f0f0' }} />
            <SummaryItem title="Detaylar" value={formData.work_details} />
            <Divider sx={{ borderColor: '#f0f0f0' }} />
            <SummaryItem title="Mesaj" value={formData.intended_message || '-'} />
            <Divider sx={{ borderColor: '#f0f0f0' }} />
            <SummaryItem title="Legal" value={formData.legal_text || '-'} />
            <Divider sx={{ borderColor: '#f0f0f0' }} />
            <SummaryItem title="Boyut" value={getSizesText()} multiline />
            <Divider sx={{ borderColor: '#f0f0f0' }} />
            <SummaryItem title="Kreatif Türü" value={getSelectedCreativesText()} multiline />
            <Divider sx={{ borderColor: '#f0f0f0' }} />
              <SummaryItem title="Deadline" value={formatDate(formData.deadline)} />
            <Divider sx={{ borderColor: '#f0f0f0' }} />
            <SummaryItem title="Görsel" value={referenceFile?.name || '-'} />
            <Divider sx={{ borderColor: '#f0f0f0' }} />

              {/* Additional Note */}
            <Box sx={{ mt: 1 }}>
              <FieldLabel>Not (opsiyonel)</FieldLabel>
                <TextField
                  fullWidth
                  multiline
                rows={2}
                  placeholder="Notunuzu buraya yazın..."
                  value={additionalNote}
                  onChange={(e) => setAdditionalNote(e.target.value)}
                sx={inputStyles}
                size="small"
              />
            </Box>
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
                {isLoading ? 'Gönderiliyor...' : 'İstek Oluştur'}
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
            Yeni Kreatif Talebi
          </Typography>
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 2, p: 2 }}>
        <SectionTitle>Talep Bilgileri</SectionTitle>

          {/* Kreatif Çalışma İsteği */}
        <Box sx={{ mb: 2 }}>
          <FieldLabel required>Çalışma İsteği</FieldLabel>
            <TextField
              fullWidth
              multiline
            rows={2}
            placeholder="Örn: Yeni Capri için roll up tasarımı..."
              value={formData.creative_work_request}
              onChange={(e) => handleInputChange('creative_work_request', e.target.value)}
            sx={inputStyles}
            size="small"
            />
          </Box>

          {/* Adet Talebi */}
        <Box sx={{ mb: 2 }}>
          <FieldLabel required>Adet Talebi</FieldLabel>
            <TextField
              fullWidth
              type="number"
              placeholder="Örn: 3"
              value={formData.quantity_request}
              onChange={(e) => handleInputChange('quantity_request', e.target.value)}
              inputProps={{ min: 1 }}
            sx={inputStyles}
            size="small"
            />
          </Box>

          {/* Çalışma Detayları */}
        <Box sx={{ mb: 2 }}>
          <FieldLabel required>Detaylar</FieldLabel>
            <TextField
              fullWidth
              multiline
            rows={3}
            placeholder="İçerik bilgileri, teknik özellikler..."
              value={formData.work_details}
              onChange={(e) => handleInputChange('work_details', e.target.value)}
            sx={inputStyles}
            size="small"
            />
          </Box>

          {/* Verilmek İstenen Mesaj */}
        <Box sx={{ mb: 2 }}>
          <FieldLabel>Mesaj</FieldLabel>
            <TextField
              fullWidth
              multiline
              rows={2}
            placeholder="İletilmek istenen ana mesaj..."
              value={formData.intended_message}
              onChange={(e) => handleInputChange('intended_message', e.target.value)}
            sx={inputStyles}
            size="small"
            />
          </Box>

          {/* Legal Metin */}
        <Box sx={{ mb: 2 }}>
          <FieldLabel>Legal Metin</FieldLabel>
            <TextField
              fullWidth
              multiline
              rows={2}
            placeholder="Legal metin varsa..."
              value={formData.legal_text}
              onChange={(e) => handleInputChange('legal_text', e.target.value)}
            sx={inputStyles}
            size="small"
            />
          </Box>

        <Divider sx={{ my: 2, borderColor: '#eee' }} />
        <SectionTitle>Boyut / Ölçü</SectionTitle>

          {/* Kullanılacak Boyut/Ölçü */}
        <Box sx={{ mb: 2 }}>
            {sizes.map((size, index) => (
              <Box
                key={index}
              sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}
              >
                <TextField
                  type="number"
                  placeholder="En"
                  value={size.width}
                  onChange={(e) => handleSizeChange(index, 'width', e.target.value)}
                  inputProps={{ min: 1 }}
                  sx={{ ...inputStyles, width: 80 }}
                  size="small"
                />
                <Typography sx={{ color: '#999', fontSize: 14 }}>x</Typography>
                <TextField
                  type="number"
                  placeholder="Boy"
                  value={size.height}
                  onChange={(e) => handleSizeChange(index, 'height', e.target.value)}
                  inputProps={{ min: 1 }}
                  sx={{ ...inputStyles, width: 80 }}
                  size="small"
                />
                <TextField
                  select
                  value={size.unit}
                  onChange={(e) => handleSizeChange(index, 'unit', e.target.value)}
                  sx={{ ...inputStyles, width: 70 }}
                  size="small"
                  SelectProps={{ native: true }}
                >
                  <option value="cm">cm</option>
                  <option value="m">m</option>
                  <option value="mm">mm</option>
                  <option value="px">px</option>
                </TextField>
                <TextField
                  type="number"
                  placeholder="Adet"
                  value={size.quantity}
                  onChange={(e) => handleSizeChange(index, 'quantity', e.target.value)}
                  inputProps={{ min: 1 }}
                  sx={{ ...inputStyles, width: 70 }}
                  size="small"
                />
                <IconButton
                  onClick={() => (sizes.length === 1 ? handleAddSize() : handleRemoveSize(index))}
                  sx={{
                  border: '1px solid #e5e7eb',
                  borderRadius: 1,
                  p: 0.75,
                  '&:hover': { bgcolor: '#f5f5f5' },
                  }}
                size="small"
                >
                {sizes.length === 1 ? <AddIcon sx={{ fontSize: 18 }} /> : <RemoveIcon sx={{ fontSize: 18 }} />}
                </IconButton>
              </Box>
            ))}
            {sizes.length > 1 && (
              <Button
              startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                onClick={handleAddSize}
                size="small"
              sx={{ 
                mt: 0.5, 
                fontSize: 12, 
                textTransform: 'none',
                color: '#666',
              }}
              >
                Boyut Ekle
              </Button>
            )}
          </Box>

        <Divider sx={{ my: 2, borderColor: '#eee' }} />
        <SectionTitle>İstenilen Kreatif</SectionTitle>

          {/* İstenilen Kreatif */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {Object.entries(creativeTypes).map(([key, value]) => (
                <Box key={key}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={value.checked}
                        onChange={(e) => handleCreativeTypeChange(key, e.target.checked)}
                      size="small"
                      sx={{ py: 0.5 }}
                      />
                    }
                  label={<Typography sx={{ fontSize: 13 }}>{creativeTypeLabels[key]}</Typography>}
                  sx={{ m: 0 }}
                  />
                  {value.checked && (
                    <TextField
                      fullWidth
                      placeholder={`${creativeTypeLabels[key]} açıklaması...`}
                      value={value.description}
                      onChange={(e) => handleCreativeDescriptionChange(key, e.target.value)}
                    sx={{ ...inputStyles, ml: 3.5, mt: 0.5, mb: 1 }}
                    size="small"
                    />
                  )}
                </Box>
              ))}
            </Box>
          </Box>

        <Divider sx={{ my: 2, borderColor: '#eee' }} />
        <SectionTitle>Tarih & Dosya</SectionTitle>

          {/* Deadline */}
        <Box sx={{ mb: 2 }}>
          <FieldLabel required>Deadline</FieldLabel>
            <TextField
              fullWidth
              type="date"
              value={formData.deadline}
              onChange={(e) => handleInputChange('deadline', e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={inputStyles}
            size="small"
            />
          </Box>

          {/* Referans/Örnek Görsel */}
        <Box sx={{ mb: 2 }}>
          <FieldLabel>Referans Görsel</FieldLabel>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
              accept="image/*,.pdf"
            />
            <Box
              onClick={() => fileInputRef.current?.click()}
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
            {referenceFile ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <CloudUploadIcon sx={{ fontSize: 18, color: '#666' }} />
                <Typography sx={{ fontSize: 13 }}>{referenceFile.name}</Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <CloudUploadIcon sx={{ fontSize: 20, color: '#999' }} />
                <Typography sx={{ fontSize: 13, color: '#666' }}>
                  Dosya yükle
              </Typography>
              </Box>
            )}
            </Box>
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

// Summary Item Component - Minimal
const SummaryItem = ({ 
  title, 
  value, 
  multiline = false 
}: { 
  title: string; 
  value: string; 
  multiline?: boolean;
}) => (
  <Box sx={{ display: 'flex', py: 0.5 }}>
    <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#666', width: 100, flexShrink: 0 }}>
      {title}
    </Typography>
    <Typography 
      sx={{ 
        fontSize: 13,
        color: '#333', 
        flex: 1,
        whiteSpace: multiline ? 'pre-line' : 'normal',
      }}
    >
      {value || '-'}
    </Typography>
  </Box>
);
