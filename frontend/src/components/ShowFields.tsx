/**
 * Reusable Show Page Components
 * Tüm Show sayfaları için ortak bileşenler
 */

import { Box, Typography, Paper } from '@mui/material';

// ============================================
// STATUS COLORS
// ============================================

// Tüm modüllerin durum renkleri (superset)
export const statusColors: Record<string, string> = {
  taslak: '#4b5563',
  onay_bekliyor: '#b45309',
  gorsel_bekliyor: '#b45309',
  bayi_onayi_bekliyor: '#1d4ed8',
  degerlendirme: '#1d4ed8',
  onaylandi: '#166534',
  reddedildi: '#991b1b',
  yayinda: '#1d4ed8',
  tamamlandi: '#166534',
};

// ============================================
// SECTION TITLE
// ============================================

export const SectionTitle = ({ children }: { children: React.ReactNode }) => (
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

// ============================================
// SUMMARY ROW
// ============================================

interface SummaryRowProps {
  label: string;
  children: React.ReactNode;
}

export const SummaryRow = ({ label, children }: SummaryRowProps) => (
  <Box sx={{ display: 'flex', mb: 1.5 }}>
    <Typography sx={{ fontWeight: 500, color: '#666', width: 180, flexShrink: 0, fontSize: 14 }}>
      {label}
    </Typography>
    <Box sx={{ color: '#333', flex: 1, fontSize: 14 }}>
      {children}
    </Box>
  </Box>
);

// ============================================
// SHOW CARD
// ============================================

interface ShowCardProps {
  children: React.ReactNode;
}

export const ShowCard = ({ children }: ShowCardProps) => (
  <Paper
    elevation={0}
    sx={{
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      p: 4,
      backgroundColor: '#fff',
      mb: 3,
    }}
  >
    {children}
  </Paper>
);

// ============================================
// META INFO
// ============================================

interface MetaInfoProps {
  createdAt: string;
  updatedAt: string;
}

export const MetaInfo = ({ createdAt, updatedAt }: MetaInfoProps) => (
  <Box sx={{ mt: 2, px: 1 }}>
    <Typography variant="caption" sx={{ color: '#6b7280' }}>
      Oluşturulma: {new Date(createdAt).toLocaleString('tr-TR')} | 
      Son Güncelleme: {new Date(updatedAt).toLocaleString('tr-TR')}
    </Typography>
  </Box>
);

