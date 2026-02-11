/**
 * Reusable Timeline Components
 * Tüm Show sayfalarındaki İşlem Geçmişi bölümü için ortak bileşenler
 */

import { Box, Typography, Avatar } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import VerifiedIcon from '@mui/icons-material/Verified';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import EditNoteIcon from '@mui/icons-material/EditNote';
import ForwardToInboxIcon from '@mui/icons-material/ForwardToInbox';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FacebookIcon from '@mui/icons-material/Facebook';

// ============================================
// TIMELINE TYPES
// ============================================

export type TimelineType = 
  | 'created' 
  | 'sent' 
  | 'approved' 
  | 'rejected' 
  | 'note' 
  | 'waiting' 
  | 'live' 
  | 'completed' 
  | 'fb_attempt' 
  | 'fb_success' 
  | 'fb_failed' 
  | 'file_upload' 
  | 'file_delete' 
  | 'updated';

// ============================================
// TIMELINE CONFIG
// ============================================

export const timelineConfig: Record<TimelineType, { icon: React.ReactNode; color: string; bgColor: string }> = {
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
  live: { 
    icon: <PlayArrowIcon sx={{ fontSize: 18 }} />, 
    color: '#1d4ed8', 
    bgColor: '#eff6ff' 
  },
  completed: { 
    icon: <CheckCircleIcon sx={{ fontSize: 18 }} />, 
    color: '#166534', 
    bgColor: '#f0fdf4' 
  },
  fb_attempt: {
    icon: <FacebookIcon sx={{ fontSize: 18 }} />,
    color: '#1877F2',
    bgColor: '#e7f0ff',
  },
  fb_success: {
    icon: <FacebookIcon sx={{ fontSize: 18 }} />,
    color: '#166534',
    bgColor: '#f0fdf4',
  },
  fb_failed: {
    icon: <FacebookIcon sx={{ fontSize: 18 }} />,
    color: '#991b1b',
    bgColor: '#fef2f2',
  },
  file_upload: {
    icon: <AddCircleOutlineIcon sx={{ fontSize: 18 }} />,
    color: '#6d28d9',
    bgColor: '#f5f3ff',
  },
  file_delete: {
    icon: <CancelIcon sx={{ fontSize: 18 }} />,
    color: '#9ca3af',
    bgColor: '#f9fafb',
  },
  updated: {
    icon: <EditNoteIcon sx={{ fontSize: 18 }} />,
    color: '#0369a1',
    bgColor: '#e0f2fe',
  },
};

// ============================================
// BACKEND ACTION → TIMELINE TYPE MAPPING
// ============================================

export const actionToTimelineType: Record<string, TimelineType> = {
  created: 'created',
  updated: 'updated',
  status_change: 'approved', // Durum değişikliğine göre override edilir
  fb_push_attempt: 'fb_attempt',
  fb_push_success: 'fb_success',
  fb_push_failed: 'fb_failed',
  fb_status_check: 'fb_attempt',
  file_upload: 'file_upload',
  file_delete: 'file_delete',
  note: 'note',
};

// Durum değişikliği için spesifik mapping
export const statusChangeToTimelineType = (newStatus?: string): TimelineType => {
  switch (newStatus) {
    case 'onaylandi': return 'approved';
    case 'reddedildi': return 'rejected';
    case 'yayinda': return 'live';
    case 'tamamlandi': return 'completed';
    case 'onay_bekliyor': return 'sent';
    default: return 'note';
  }
};

// ============================================
// TIMELINE ITEM
// ============================================

interface TimelineItemProps {
  title: string;
  date: string;
  note?: string;
  type?: TimelineType;
  isLast?: boolean;
  userName?: string;
}

export const TimelineItem = ({ 
  title, 
  date, 
  note, 
  type = 'note',
  isLast = false,
  userName,
}: TimelineItemProps) => {
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontWeight: 600, color: '#333', fontSize: 13 }}>
              {title}
            </Typography>
            {userName && (
              <Typography sx={{ color: '#9ca3af', fontSize: 11, fontStyle: 'italic' }}>
                — {userName}
              </Typography>
            )}
          </Box>
          {date && (
            <Typography sx={{ color: '#9ca3af', fontSize: 11, whiteSpace: 'nowrap', ml: 1 }}>
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

// ============================================
// TIMELINE CONTAINER
// ============================================

interface TimelineContainerProps {
  children: React.ReactNode;
}

export const TimelineContainer = ({ children }: TimelineContainerProps) => (
  <Box sx={{ 
    position: 'relative',
    pl: 0,
    '&::before': {
      content: '""',
      position: 'absolute',
      left: 15, // Avatar'ın ortası (32px / 2 = 16, border için -1)
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

