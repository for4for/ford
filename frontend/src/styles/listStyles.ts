import { SxProps, Theme } from '@mui/material';

// Liste sayfası container stili
export const listPageContainer: SxProps<Theme> = {
  p: 3,
  pt: 4,
};

// Gradient header stili
export const listHeader: SxProps<Theme> = {
  background: 'linear-gradient(135deg, #00095B 0%, #1a2a7a 100%)',
  borderRadius: '10px 10px 0 0',
  px: 3,
  py: 2,
};

// Header başlık stili
export const listHeaderTitle: SxProps<Theme> = {
  fontFamily: 'inherit',
  fontWeight: 600,
  fontSize: '1.125rem',
  color: '#ffffff',
  letterSpacing: '-0.01em',
};

// Header alt başlık stili
export const listHeaderSubtitle: SxProps<Theme> = {
  fontFamily: 'inherit',
  fontSize: '0.8rem',
  color: 'rgba(255, 255, 255, 0.7)',
  mt: 0.25,
  fontWeight: 400,
};

// List bileşeni stili
export const listStyles: SxProps<Theme> = {
  '& .RaList-main': {
    backgroundColor: '#fff',
    borderRadius: '0 0 12px 12px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  },
  '& .RaList-actions': {
    padding: '16px 20px',
    minHeight: 'auto',
    alignItems: 'center',
  },
  '& .RaList-content': {
    borderRadius: '0 0 12px 12px',
    overflow: 'hidden',
    padding: '0 16px',
  },
};

// Datagrid stili
export const datagridStyles: SxProps<Theme> = {
  fontFamily: 'inherit',
  '& .RaDatagrid-table': {
    minWidth: 900,
    borderCollapse: 'separate',
    borderSpacing: 0,
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid #eef0f2',
  },
  '& .RaDatagrid-headerCell': {
    backgroundColor: '#fafbfc',
    color: '#64748b',
    fontFamily: 'inherit',
    fontWeight: 600,
    fontSize: '0.8125rem',
    textTransform: 'none',
    borderBottom: '1px solid #eef0f2',
    padding: '4px 16px',
    whiteSpace: 'nowrap',
    '&:first-of-type': {
      borderTopLeftRadius: '12px',
    },
    '&:last-of-type': {
      borderTopRightRadius: '12px',
    },
  },
  '& .RaDatagrid-row': {
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor: '#f8fafc !important',
    },
  },
  '& .RaDatagrid-row:nth-of-type(even)': {
    backgroundColor: '#fcfcfd',
  },
  '& .RaDatagrid-rowCell': {
    fontFamily: 'inherit',
    fontSize: '0.875rem',
    color: '#1a1a2e',
    padding: '4px 16px',
    borderBottom: '1px solid #f0f2f4',
    verticalAlign: 'middle',
  },
  '& .RaDatagrid-row:last-of-type .RaDatagrid-rowCell': {
    borderBottom: 'none',
    '&:first-of-type': {
      borderBottomLeftRadius: '12px',
    },
    '&:last-of-type': {
      borderBottomRightRadius: '12px',
    },
  },
};

// TextField stilleri
export const textFieldPrimary: SxProps<Theme> = {
  '& span': {
    fontFamily: 'inherit',
    fontWeight: 600,
    color: '#00095B',
    fontSize: '0.875rem',
  },
};

export const textFieldDefault: SxProps<Theme> = {
  '& span': {
    fontFamily: 'inherit',
    fontWeight: 500,
    color: '#1a1a2e',
    fontSize: '0.875rem',
  },
};

// Email field stili
export const emailFieldStyles: SxProps<Theme> = {
  '& a': {
    fontFamily: 'inherit',
    color: '#2563eb',
    textDecoration: 'none',
    fontSize: '0.875rem',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
};

// Filter input stilleri
export const filterInputStyles: SxProps<Theme> = {
  minWidth: 200,
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#fff',
    borderRadius: '8px',
    fontSize: '0.875rem',
    '& fieldset': {
      borderColor: '#e0e0e0',
    },
    '&:hover fieldset': {
      borderColor: '#00095B',
    },
  },
  '& .MuiInputLabel-root': {
    fontSize: '0.875rem',
  },
};

export const filterSelectStyles: SxProps<Theme> = {
  minWidth: 130,
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    fontSize: '0.875rem',
  },
};

// Chip renk tipleri
export type ChipColorConfig = {
  bg: string;
  color: string;
  label: string;
};

// Durum renkleri - Kurumsal solid renkler
export const statusColors: Record<string, ChipColorConfig> = {
  aktif: { bg: '#166534', color: '#ffffff', label: 'Aktif' },
  pasif: { bg: '#4b5563', color: '#ffffff', label: 'Pasif' },
  askida: { bg: '#b45309', color: '#ffffff', label: 'Askıda' },
  taslak: { bg: '#4b5563', color: '#ffffff', label: 'Taslak' },
  // Kreatif/Teşvik talep durumları
  gorsel_bekliyor: { bg: '#b45309', color: '#ffffff', label: 'Kreatif Bekliyor' },
  bayi_onayi_bekliyor: { bg: '#1d4ed8', color: '#ffffff', label: 'Bayi Onayı Bekliyor' },
  onay_bekliyor: { bg: '#b45309', color: '#ffffff', label: 'Onay Bekliyor' },
  onaylandi: { bg: '#166534', color: '#ffffff', label: 'Onaylandı' },
  reddedildi: { bg: '#991b1b', color: '#ffffff', label: 'Reddedildi' },
  degerlendirme: { bg: '#1d4ed8', color: '#ffffff', label: 'Değerlendirme' },
  tamamlandi: { bg: '#166534', color: '#ffffff', label: 'Tamamlandı' },
};

// Bayi tipi renkleri
export const dealerTypeColors: Record<string, ChipColorConfig> = {
  yetkili: { bg: '#e3f2fd', color: '#1565c0', label: 'Yetkili' },
  anlasmali: { bg: '#f3e5f5', color: '#7b1fa2', label: 'Anlaşmalı' },
  satis: { bg: '#e0f2f1', color: '#00695c', label: 'Satış' },
};

// Rol renkleri
export const roleColors: Record<string, ChipColorConfig> = {
  admin: { bg: '#ffebee', color: '#c62828', label: 'Admin' },
  moderator: { bg: '#e3f2fd', color: '#1565c0', label: 'Moderatör' },
  bayi: { bg: '#e8f5e9', color: '#2e7d32', label: 'Bayi' },
  creative_agency: { bg: '#f3e5f5', color: '#7b1fa2', label: 'Creative Agency' },
};

// Chip stili oluşturucu
export const getChipStyles = (config: ChipColorConfig): SxProps<Theme> => ({
  backgroundColor: config.bg,
  color: config.color,
  fontFamily: 'inherit',
  fontWeight: 600,
  fontSize: '0.75rem',
  height: 26,
  borderRadius: '6px',
  '& .MuiChip-label': {
    px: 1.5,
  },
});

// Icon button stilleri
export const iconButtonPrimary: SxProps<Theme> = {
  color: '#00095B',
  width: 32,
  height: 32,
  '&:hover': {
    backgroundColor: 'rgba(0, 9, 91, 0.08)',
  },
};

export const iconButtonSecondary: SxProps<Theme> = {
  color: '#6c757d',
  width: 32,
  height: 32,
  '&:hover': {
    backgroundColor: 'rgba(108, 117, 125, 0.08)',
  },
};
