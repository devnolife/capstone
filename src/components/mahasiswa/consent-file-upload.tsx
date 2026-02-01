'use client';

import { useState, useCallback, useRef } from 'react';
import {
  Card,
  CardBody,
  Button,
  Progress,
  Chip,
  Tooltip,
  addToast,
} from '@heroui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileCheck2,
  File,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  FileText,
  Download,
  Shield,
  Info,
} from 'lucide-react';

interface ConsentDocument {
  id?: string;
  fileName: string;
  fileKey?: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
}

interface ConsentFileUploadProps {
  projectId?: string; // Optional for new projects
  document: ConsentDocument | null;
  onDocumentChange: (document: ConsentDocument | null) => void;
  readOnly?: boolean;
  isRequired?: boolean;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function ConsentFileUpload({
  projectId,
  document,
  onDocumentChange,
  readOnly = false,
  isRequired = true,
}: ConsentFileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    async (file: File) => {
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];

      if (!allowedTypes.includes(file.type)) {
        addToast({
          title: 'Tipe File Tidak Didukung',
          description: 'Gunakan file PDF, gambar (JPG/PNG), atau Word (DOC/DOCX).',
          color: 'danger',
        });
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        addToast({
          title: 'Ukuran File Terlalu Besar',
          description: 'Maksimal ukuran file adalah 10MB.',
          color: 'danger',
        });
        return;
      }

      setIsUploading(true);
      setUploadProgress(10);

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('prefix', 'consent-agreements');
        if (projectId) {
          formData.append('projectId', projectId);
        }

        // Simulate progress
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => Math.min(prev + 10, 90));
        }, 200);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        clearInterval(progressInterval);

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Upload gagal');
        }

        const result = await response.json();
        setUploadProgress(100);

        onDocumentChange({
          fileName: result.data.fileName,
          fileKey: result.data.fileKey,
          fileUrl: result.data.fileUrl,
          fileSize: result.data.fileSize,
          mimeType: result.data.mimeType,
        });

        addToast({
          title: 'Berhasil',
          description: 'File persetujuan berhasil diupload',
          color: 'success',
        });
      } catch (error) {
        console.error('Upload error:', error);
        addToast({
          title: 'Gagal Upload',
          description: error instanceof Error ? error.message : 'Terjadi kesalahan',
          color: 'danger',
        });
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [projectId, onDocumentChange]
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragOver(false);

      const file = event.dataTransfer.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleRemove = () => {
    onDocumentChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePreview = () => {
    if (document?.fileUrl) {
      window.open(document.fileUrl, '_blank');
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType === 'application/pdf') return FileText;
    if (mimeType.startsWith('image/')) return FileCheck2;
    return File;
  };

  return (
    <Card className="border border-default-100 shadow-sm">
      <CardBody className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 text-emerald-600">
              <Shield size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                Surat Persetujuan
                {isRequired && <span className="text-danger">*</span>}
              </h3>
              <p className="text-xs text-default-400">
                Persetujuan bahwa project dapat digunakan/dipelajari
              </p>
            </div>
          </div>
          {document && (
            <Chip size="sm" color="success" variant="flat" startContent={<CheckCircle2 size={12} />}>
              Terupload
            </Chip>
          )}
        </div>

        {/* Info Box */}
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/30">
          <div className="flex gap-2">
            <Info size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-blue-700 dark:text-blue-300">
              <p className="font-medium mb-1">Dokumen ini menyatakan:</p>
              <ul className="list-disc list-inside space-y-0.5 text-blue-600 dark:text-blue-400">
                <li>Project dapat digunakan untuk keperluan akademik</li>
                <li>Project dapat dipelajari oleh mahasiswa lain</li>
                <li>Source code dapat di-fork dan dikembangkan lebih lanjut</li>
              </ul>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {document ? (
            /* Document Preview */
            <motion.div
              key="document"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/30"
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-emerald-100 dark:bg-emerald-800/50 rounded-lg">
                  {(() => {
                    const Icon = getFileIcon(document.mimeType);
                    return <Icon size={20} className="text-emerald-600 dark:text-emerald-400" />;
                  })()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate text-emerald-900 dark:text-emerald-100">
                    {document.fileName}
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">
                    {formatFileSize(document.fileSize)}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Tooltip content="Lihat File">
                    <Button
                      size="sm"
                      variant="flat"
                      color="success"
                      isIconOnly
                      onPress={handlePreview}
                    >
                      <Eye size={14} />
                    </Button>
                  </Tooltip>
                  {!readOnly && (
                    <Tooltip content="Hapus">
                      <Button
                        size="sm"
                        variant="flat"
                        color="danger"
                        isIconOnly
                        onPress={handleRemove}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </Tooltip>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            /* Upload Area */
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {isUploading ? (
                /* Upload Progress */
                <div className="p-6 border-2 border-dashed border-primary/30 rounded-xl bg-primary/5">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                      <Upload size={24} className="text-primary animate-pulse" />
                    </div>
                    <p className="text-sm font-medium text-primary mb-2">Mengupload...</p>
                    <Progress
                      value={uploadProgress}
                      color="primary"
                      size="sm"
                      className="max-w-xs mx-auto"
                    />
                    <p className="text-xs text-default-400 mt-2">{uploadProgress}%</p>
                  </div>
                </div>
              ) : (
                /* Drop Zone */
                <div
                  onDrop={readOnly ? undefined : handleDrop}
                  onDragOver={readOnly ? undefined : handleDragOver}
                  onDragLeave={readOnly ? undefined : handleDragLeave}
                  onClick={readOnly ? undefined : () => fileInputRef.current?.click()}
                  className={`
                    p-6 border-2 border-dashed rounded-xl transition-all duration-200
                    ${readOnly ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
                    ${
                      isDragOver
                        ? 'border-primary bg-primary/5'
                        : 'border-default-200 hover:border-primary/50 hover:bg-default-50'
                    }
                  `}
                >
                  <div className="text-center">
                    <div
                      className={`
                        w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center transition-colors
                        ${isDragOver ? 'bg-primary/20' : 'bg-default-100'}
                      `}
                    >
                      <Upload
                        size={24}
                        className={isDragOver ? 'text-primary' : 'text-default-400'}
                      />
                    </div>
                    <p className="text-sm font-medium text-default-700 mb-1">
                      {isDragOver ? 'Lepas file di sini' : 'Klik atau drag file ke sini'}
                    </p>
                    <p className="text-xs text-default-400">
                      PDF, Gambar (JPG/PNG), atau Word (DOC/DOCX) - Maks 10MB
                    </p>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleInputChange}
                className="hidden"
                disabled={readOnly || isUploading}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Validation Warning */}
        {isRequired && !document && !isUploading && (
          <div className="mt-3 flex items-center gap-2 text-warning text-xs">
            <AlertCircle size={14} />
            <span>Dokumen persetujuan wajib diupload</span>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
