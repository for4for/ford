import { useState, useRef } from 'react';
import { useNotify, useRefresh } from 'react-admin';
import {
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Modal,
  Backdrop,
  Fade,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { getCurrentToken } from '../authProvider';
import { API_URL } from '../config';

export interface UploadedFile {
  id: number;
  file: string;
  file_name: string;
  file_size: number;
  file_type?: string;
  note?: string;
  uploaded_at?: string;
}

interface FileUploadSectionProps {
  /** Yüklenen dosyalar listesi */
  files: UploadedFile[];
  /** Dosya upload endpoint URL'i (örn: /campaigns/requests/5/upload-file/) */
  uploadUrl: string;
  /** Dosya silme endpoint URL'i (dosya id'si eklenmeden önce, örn: /campaigns/requests/5/delete-file/) */
  deleteUrl: string;
  /** Kabul edilen dosya türleri (input accept attr) */
  accept?: string;
  /** İzin verilen MIME türleri */
  allowedTypes?: string[];
  /** Maksimum dosya boyutu (bytes) */
  maxFileSize?: number;
  /** Upload sırasında ek form data gönder */
  extraFormData?: Record<string, string>;
  /** Dosya yükleme alanını devre dışı bırak */
  disabled?: boolean;
  /** Dosyalar salt okunur (silme/yükleme yok) */
  readOnly?: boolean;
  /** Bölüm başlığı */
  title?: string;
  /** Accept helper text */
  helperText?: string;
}

export const FileUploadSection = ({
  files,
  uploadUrl,
  deleteUrl,
  accept = 'image/*,video/mp4',
  allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime'],
  maxFileSize = 50 * 1024 * 1024,
  extraFormData = {},
  disabled = false,
  readOnly = false,
  title,
  helperText = 'JPEG, PNG, GIF, WebP veya MP4 (max 50MB)',
}: FileUploadSectionProps) => {
  const notify = useNotify();
  const refresh = useRefresh();

  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ total: number; current: number } | null>(null);

  // Önizleme modal
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewFileName, setPreviewFileName] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Dosya validasyonu ---
  const validateFile = (file: File): string | null => {
    if (!allowedTypes.includes(file.type)) {
      return `"${file.name}" desteklenmeyen dosya türü`;
    }
    if (file.size > maxFileSize) {
      return `"${file.name}" ${Math.round(maxFileSize / 1024 / 1024)}MB'dan büyük`;
    }
    return null;
  };

  // --- Tek dosya yükle ---
  const uploadSingleFile = async (file: File): Promise<boolean> => {
    const token = getCurrentToken();

    const formData = new FormData();
    formData.append('file', file);
    Object.entries(extraFormData).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const response = await fetch(`${API_URL}${uploadUrl}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    return response.ok;
  };

  // --- Çoklu dosya yükle ---
  const handleMultipleFiles = async (fileList: FileList | File[]) => {
    const fileArray = Array.from(fileList);
    if (fileArray.length === 0) return;

    const errors: string[] = [];
    const validFiles: File[] = [];

    fileArray.forEach((file) => {
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
        notify(
          `${successCount} dosya başarıyla yüklendi${failCount > 0 ? `, ${failCount} dosya yüklenemedi` : ''}`,
          { type: failCount > 0 ? 'warning' : 'success' }
        );
        refresh();
      } else {
        notify('Dosyalar yüklenirken hata oluştu', { type: 'error' });
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch {
      notify('Dosyalar yüklenirken bir hata oluştu', { type: 'error' });
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  // --- Input change ---
  const handleFileInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputFiles = event.target.files;
    if (!inputFiles || inputFiles.length === 0) return;
    await handleMultipleFiles(inputFiles);
  };

  // --- Drag & Drop ---
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
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      await handleMultipleFiles(droppedFiles);
    }
  };

  // --- Dosya sil ---
  const handleFileDelete = async (fileId: number) => {
    try {
      const token = getCurrentToken();
      const response = await fetch(`${API_URL}${deleteUrl}${fileId}/`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Dosya silme hatası');
      }

      notify('Dosya silindi', { type: 'success' });
      refresh();
    } catch {
      notify('Dosya silinirken bir hata oluştu', { type: 'error' });
    }
  };

  // --- Önizleme ---
  const handlePreview = (fileUrl: string, fileName: string) => {
    setPreviewImage(fileUrl);
    setPreviewFileName(fileName);
    setPreviewOpen(true);
  };

  const isImageFile = (fileName: string) => fileName?.match(/\.(jpg|jpeg|png|gif|webp)$/i);

  return (
    <Box>
      {title && (
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
          {title}
        </Typography>
      )}

      {/* Yüklenen dosyalar grid */}
      {files.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: 13, color: '#666', mb: 1.5, fontWeight: 600 }}>
            Yüklenen Dosyalar ({files.length}):
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {files.map((file) => {
              const isImage = isImageFile(file.file_name);
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
                    '&:hover .file-actions': { opacity: 1 },
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
                      overflow: 'hidden',
                    }}
                    onClick={() => isImage && handlePreview(file.file, file.file_name)}
                  >
                    {isImage ? (
                      <img
                        src={file.file}
                        alt={file.file_name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <InsertDriveFileIcon sx={{ fontSize: 48, color: '#1E3A5F' }} />
                    )}

                    {/* Hover overlay */}
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
                          transition: 'opacity 0.2s',
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
                        mb: 0.5,
                      }}
                      title={file.file_name}
                    >
                      {file.file_name}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography sx={{ fontSize: 10, color: '#999' }}>
                        {(file.file_size / 1024 / 1024).toFixed(2)} MB
                      </Typography>
                      {!readOnly && !disabled && (
                        <IconButton
                          size="small"
                          onClick={() => handleFileDelete(file.id)}
                          sx={{ color: '#d32f2f', p: 0.5 }}
                        >
                          <DeleteIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      )}
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}

      {/* Dosya yükleme alanı - Sürükle-bırak */}
      {!readOnly && !disabled && (
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
              bgcolor: '#f8fafc',
            },
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
            onChange={handleFileInputChange}
            accept={accept}
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
                {helperText}
              </Typography>
              <Typography sx={{ color: '#1E3A5F', fontSize: 11, mt: 1, fontWeight: 500 }}>
                📁 Birden fazla dosya seçebilirsiniz
              </Typography>
            </>
          )}
        </Box>
      )}

      {/* Salt okunur modda dosya yoksa mesaj göster */}
      {readOnly && files.length === 0 && (
        <Typography sx={{ color: '#999', fontSize: 13, fontStyle: 'italic' }}>
          Henüz dosya yüklenmemiş.
        </Typography>
      )}

      {/* Önizleme Modal */}
      <Modal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 300,
            sx: { bgcolor: 'rgba(0, 0, 0, 0.9)' },
          },
        }}
      >
        <Fade in={previewOpen}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              maxWidth: '90vw',
              maxHeight: '90vh',
              outline: 'none',
            }}
          >
            {/* Kapatma ve indirme butonları */}
            <Box sx={{ position: 'absolute', top: -50, right: 0, display: 'flex', gap: 1 }}>
              <IconButton
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = previewImage || '';
                  link.download = previewFileName;
                  link.click();
                }}
                sx={{
                  color: '#fff',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                }}
              >
                <DownloadIcon />
              </IconButton>
              <IconButton
                onClick={() => setPreviewOpen(false)}
                sx={{
                  color: '#fff',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                }}
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
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                }}
              />
            )}

            {/* Dosya adı */}
            <Typography sx={{ color: '#fff', textAlign: 'center', mt: 2, fontSize: 14, opacity: 0.8 }}>
              {previewFileName}
            </Typography>
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

