'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Spinner } from '@/components/ui/spinner';
import { addToast } from '@/lib/toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Camera,
  Trash2,
  Eye,
  X,
  Plus,
  ImageIcon,
  Monitor,
  Smartphone,
  Layout,
  TestTube,
  Layers,
  GripVertical,
  Loader2,
} from 'lucide-react';

interface ProjectScreenshot {
  id: string;
  projectId: string;
  title: string;
  description?: string | null;
  category?: string | null;
  orderIndex: number;
  fileName: string;
  fileKey: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

interface ScreenshotUploadProps {
  projectId: string;
  readOnly?: boolean;
}

const CATEGORIES = [
  { value: 'UI', label: 'User Interface', icon: Layout },
  { value: 'FEATURE', label: 'Fitur Utama', icon: Layers },
  { value: 'MOBILE', label: 'Tampilan Mobile', icon: Smartphone },
  { value: 'DESKTOP', label: 'Tampilan Desktop', icon: Monitor },
  { value: 'TESTING', label: 'Testing/Demo', icon: TestTube },
  { value: 'OTHER', label: 'Lainnya', icon: ImageIcon },
];

const getCategoryConfig = (category: string | null | undefined) => {
  const found = CATEGORIES.find((c) => c.value === category);
  return found || { value: 'OTHER', label: 'Lainnya', icon: ImageIcon };
};

// Convert MinIO URL to proxy URL if needed
const getProxyUrl = (url: string, fileKey: string) => {
  // If already using proxy API, return as is
  if (url.startsWith('/api/minio/')) {
    return url;
  }
  // Convert old direct MinIO URLs to proxy URL
  return `/api/minio/${fileKey}`;
};

function useDialogState() {
  const [isOpen, setIsOpen] = useState(false);
  return {
    isOpen,
    onOpen: () => setIsOpen(true),
    onClose: () => setIsOpen(false),
    onOpenChange: setIsOpen,
  };
}

export default function ScreenshotUpload({
  projectId,
  readOnly = false,
}: ScreenshotUploadProps) {
  const uploadModal = useDialogState();
  const previewModal = useDialogState();
  const [screenshots, setScreenshots] = useState<ProjectScreenshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch screenshots on mount
  useEffect(() => {
    const fetchScreenshots = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}/screenshots`);
        if (response.ok) {
          const data = await response.json();
          setScreenshots(data.screenshots || []);
        }
      } catch (error) {
        console.error('Failed to fetch screenshots:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchScreenshots();
  }, [projectId]);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'UI',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);

  // Reset form
  const resetForm = () => {
    setFormData({ title: '', description: '', category: 'UI' });
    setSelectedFile(null);
    setPreviewDataUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle file selection
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      addToast({
        title: 'Error',
        description: 'Hanya file gambar yang diperbolehkan (PNG, JPG, GIF, WEBP)',
        color: 'danger',
      });
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      addToast({
        title: 'Error',
        description: 'Ukuran file maksimal 10MB',
        color: 'danger',
      });
      return;
    }

    setSelectedFile(file);

    // Generate preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewDataUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Auto-fill title from filename if empty
    if (!formData.title) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setFormData((prev) => ({ ...prev, title: nameWithoutExt }));
    }
  }, [formData.title]);

  // Handle upload
  const handleUpload = async () => {
    if (!selectedFile || !formData.title.trim()) {
      addToast({
        title: 'Error',
        description: 'Judul dan file screenshot harus diisi',
        color: 'danger',
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('file', selectedFile);
      formDataToSend.append('title', formData.title.trim());
      if (formData.description) {
        formDataToSend.append('description', formData.description.trim());
      }
      formDataToSend.append('category', formData.category);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch(`/api/projects/${projectId}/screenshots`, {
        method: 'POST',
        body: formDataToSend,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Gagal mengupload screenshot');
      }

      const { screenshot } = await response.json();

      // Update screenshots list
      setScreenshots((prev) => [...prev, screenshot]);

      addToast({
        title: 'Berhasil',
        description: 'Screenshot berhasil diupload',
        color: 'success',
      });

      // Close modal and reset
      uploadModal.onClose();
      resetForm();
    } catch (error) {
      console.error('Upload error:', error);
      addToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Gagal mengupload screenshot',
        color: 'danger',
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // State for delete confirmation
  const deleteConfirmModal = useDialogState();
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Handle delete
  const handleDelete = async (screenshotId: string) => {
    setDeleteTargetId(screenshotId);
    deleteConfirmModal.onOpen();
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;

    try {
      const response = await fetch(
        `/api/projects/${projectId}/screenshots?screenshotId=${deleteTargetId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Gagal menghapus screenshot');
      }

      // Update screenshots list
      setScreenshots((prev) => prev.filter((s) => s.id !== deleteTargetId));

      addToast({
        title: 'Berhasil',
        description: 'Screenshot berhasil dihapus',
        color: 'success',
      });

      deleteConfirmModal.onClose();
      setDeleteTargetId(null);
    } catch (error) {
      console.error('Delete error:', error);
      addToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Gagal menghapus screenshot',
        color: 'danger',
      });
    }
  };

  // Open preview
  const openPreview = (screenshot: ProjectScreenshot) => {
    const imageUrl = getProxyUrl(screenshot.fileUrl, screenshot.fileKey);
    setPreviewUrl(imageUrl);
    setPreviewTitle(screenshot.title);
    previewModal.onOpen();
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <>
      <Card className="border border-border bg-card shadow-sm">
        <CardHeader className="border-b border-border pb-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-app-primary text-foreground">
                <Camera size={22} />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Screenshot Aplikasi</h2>
                <p className="text-xs text-app-teritary-invert">
                  Upload screenshot tampilan aplikasi/sistem
                </p>
              </div>
            </div>
            {!readOnly && (
              <Button size="sm" onClick={uploadModal.onOpen}>
                <Plus size={16} />
                Tambah Screenshot
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-5">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Spinner className="size-8 text-primary" />
            </div>
          ) : screenshots.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-app-primary flex items-center justify-center">
                <ImageIcon size={32} className="text-app-teritary-invert" />
              </div>
              <p className="text-app-secondary-invert mb-2">Belum ada screenshot</p>
              <p className="text-xs text-app-teritary-invert mb-4">
                Upload screenshot tampilan aplikasi untuk dokumentasi
              </p>
              {!readOnly && (
                <Button variant="outline" onClick={uploadModal.onOpen}>
                  <Upload size={16} />
                  Upload Screenshot Pertama
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <AnimatePresence>
                {screenshots.map((screenshot, index) => {
                  const categoryConfig = getCategoryConfig(screenshot.category);
                  const CategoryIcon = categoryConfig.icon;
                  const imageUrl = getProxyUrl(screenshot.fileUrl, screenshot.fileKey);

                  return (
                    <motion.div
                      key={screenshot.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                      className="group relative"
                    >
                      <div className="aspect-video rounded-lg overflow-hidden border border-border bg-app-quinary relative">
                        {/* Clickable image for preview */}
                        <div
                          className="w-full h-full cursor-pointer"
                          onClick={() => openPreview(screenshot)}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={imageUrl}
                            alt={screenshot.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>

                        {/* Delete button on hover */}
                        {!readOnly && (
                          <Button
                            size="icon-sm"
                            variant="destructive"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                            onClick={() => handleDelete(screenshot.id)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        )}
                      </div>

                      {/* Info below image */}
                      <div className="mt-2">
                        <p className="text-sm font-medium truncate">{screenshot.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary">
                            <CategoryIcon size={10} />
                            {categoryConfig.label}
                          </Badge>
                          <span className="text-xs text-app-teritary-invert">
                            {formatFileSize(screenshot.fileSize)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Modal */}
      <Dialog open={uploadModal.isOpen} onOpenChange={uploadModal.onOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera size={20} className="text-foreground" />
              Upload Screenshot Baru
            </DialogTitle>
          </DialogHeader>
          <div className="pb-2">
            <div className="space-y-4">
              {/* File Upload Area */}
              <div
                className={`
                  border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer
                  ${previewDataUrl
                    ? 'border-ring bg-app-quaternary'
                    : 'border-border bg-app-quinary hover:bg-app-quaternary'
                  }
                `}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                  className="hidden"
                  onChange={handleFileSelect}
                />

                {previewDataUrl ? (
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewDataUrl}
                      alt="Preview"
                      className="max-h-48 mx-auto rounded-lg"
                    />
                    <Button
                      size="icon-sm"
                      variant="destructive"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewDataUrl(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                    >
                      <X size={14} />
                    </Button>
                    <p className="mt-2 text-sm text-app-secondary-invert">
                      {selectedFile?.name} ({formatFileSize(selectedFile?.size || 0)})
                    </p>
                  </div>
                ) : (
                  <>
                    <Upload size={40} className="mx-auto mb-3 text-app-teritary-invert" />
                    <p className="text-foreground mb-1">
                      Klik atau drag file screenshot ke sini
                    </p>
                    <p className="text-xs text-app-teritary-invert">
                      PNG, JPG, GIF, WEBP (Maks. 10MB)
                    </p>
                  </>
                )}
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <Label htmlFor="screenshot-title">Judul Screenshot *</Label>
                <Input
                  id="screenshot-title"
                  placeholder="Contoh: Halaman Login, Dashboard Admin"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <Label>Kategori</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: (value as string) ?? formData.category })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <cat.icon size={16} />
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="screenshot-description">Deskripsi (Opsional)</Label>
                <Textarea
                  id="screenshot-description"
                  placeholder="Jelaskan screenshot ini..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                />
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-app-secondary-invert">Mengupload...</span>
                    <span className="text-primary font-medium">{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                uploadModal.onClose();
                resetForm();
              }}
              disabled={isUploading}
            >
              Batal
            </Button>
            <Button
              onClick={handleUpload}
              disabled={isUploading || !selectedFile || !formData.title.trim()}
            >
              {isUploading ? <Loader2 className="animate-spin" /> : <Upload size={16} />}
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={previewModal.isOpen} onOpenChange={previewModal.onOpenChange}>
        <DialogContent className="sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>{previewTitle}</DialogTitle>
          </DialogHeader>
          <div className="overflow-auto">
            {previewUrl && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={previewUrl} alt={previewTitle} className="w-full" loading="lazy" />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={previewModal.onClose}>
              Tutup
            </Button>
            {previewUrl && (
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants()}
              >
                Buka di Tab Baru
              </a>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={deleteConfirmModal.isOpen}
        onOpenChange={deleteConfirmModal.onOpenChange}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 size={20} className="text-destructive" />
              Konfirmasi Hapus
            </DialogTitle>
          </DialogHeader>
          <p className="text-app-secondary-invert">
            Yakin ingin menghapus screenshot ini? Tindakan ini tidak dapat dibatalkan.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                deleteConfirmModal.onClose();
                setDeleteTargetId(null);
              }}
            >
              Batal
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              <Trash2 size={16} />
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
