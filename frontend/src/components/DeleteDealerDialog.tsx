import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  TextField,
  Box,
} from '@mui/material';

interface DeleteDealerDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  dealer: {
    dealer_name?: string;
    dealer_code?: string;
  } | null;
  isLoading?: boolean;
}

export const DeleteDealerDialog = ({
  open,
  onClose,
  onConfirm,
  dealer,
  isLoading = false,
}: DeleteDealerDialogProps) => {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    onConfirm(reason);
    setReason('');
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  if (!dealer) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600, color: '#111827' }}>
        Bayi Sil
      </DialogTitle>
      <DialogContent>
        <Typography sx={{ mb: 3, color: '#374151' }}>
          <strong>{dealer.dealer_name}</strong>
          {dealer.dealer_code && (
            <span style={{ color: '#6b7280' }}> ({dealer.dealer_code})</span>
          )}{' '}
          bayisini silmek istediğinize emin misiniz?
        </Typography>

        <TextField
          label="Silme Nedeni (Opsiyonel)"
          multiline
          rows={3}
          fullWidth
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Silme nedenini belirtin..."
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
            },
          }}
        />

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ color: '#6b7280', fontSize: 13 }}>
            Not: Bu işlem bayiye bağlı kullanıcıları da pasif hale getirecektir.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2.5, pt: 1 }}>
        <Button
          onClick={handleClose}
          disabled={isLoading}
          sx={{
            textTransform: 'none',
            color: '#374151',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            px: 3,
            '&:hover': { bgcolor: '#f3f4f6' },
          }}
        >
          İptal
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={isLoading}
          variant="contained"
          sx={{
            textTransform: 'none',
            bgcolor: '#ef4444',
            borderRadius: '8px',
            px: 3,
            '&:hover': { bgcolor: '#dc2626' },
          }}
        >
          {isLoading ? 'Siliniyor...' : 'Sil'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

