'use client';

import { useState, useCallback, useRef } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
  Image,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Chip,
  Progress,
  addToast,
} from '@heroui/react';
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
  screenshots: ProjectScreenshot[];
  onScreenshotsChange: (screenshots: ProjectScreenshot[]) => void;
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

export default function ScreenshotUpload({
  projectId,
  screenshots,
  onScreenshotsChange,
  readOnly = false,
}: ScreenshotUploadProps) {
  const uploadModal = useDisclosure();
  const previewModal = useDisclosure();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      onScreenshotsChange([...screenshots, screenshot]);

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

  // Handle delete
  const handleDelete = async (screenshotId: string) => {
    if (!confirm('Yakin ingin menghapus screenshot ini?')) return;

    try {
      const response = await fetch(
        `/api/projects/${projectId}/screenshots?screenshotId=${screenshotId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Gagal menghapus screenshot');
      }

      // Update screenshots list
      onScreenshotsChange(screenshots.filter((s) => s.id !== screenshotId));

      addToast({
        title: 'Berhasil',
        description: 'Screenshot berhasil dihapus',
        color: 'success',
      });
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
    setPreviewUrl(screenshot.fileUrl);
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
      <Card className="border border-default-200 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-900/20 pb-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                <Camera size={22} />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Screenshot Aplikasi</h2>
                <p className="text-xs text-default-500">
                  Upload screenshot tampilan aplikasi/sistem
                </p>
              </div>
            </div>
            {!readOnly && (
              <Button
                color="primary"
                size="sm"
                startContent={<Plus size={16} />}
                onPress={uploadModal.onOpen}
              >
                Tambah Screenshot
              </Button>
            )}
          </div>
        </CardHeader>

        <CardBody className="p-5">
          {screenshots.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-default-100 flex items-center justify-center">
                <ImageIcon size={32} className="text-default-400" />
              </div>
              <p className="text-default-500 mb-2">Belum ada screenshot</p>
              <p className="text-xs text-default-400 mb-4">
                Upload screenshot tampilan aplikasi untuk dokumentasi
              </p>
              {!readOnly && (
                <Button
                  variant="flat"
                  color="primary"
                  startContent={<Upload size={16} />}
                  onPress={uploadModal.onOpen}
                >
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

                  return (
                    <motion.div
                      key={screenshot.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                      className="group relative"
                    >
                      <div className="aspect-video rounded-lg overflow-hidden border border-default-200 bg-default-100">
                        <Image
                          src={screenshot.fileUrl}
                          alt={screenshot.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />

                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="flat"
                            isIconOnly
                            className="bg-white/20 text-white"
                            onPress={() => openPreview(screenshot)}
                          >
                            <Eye size={16} />
                          </Button>
                          {!readOnly && (
                            <Button
                              size="sm"
                              variant="flat"
                              isIconOnly
                              className="bg-red-500/50 text-white"
                              onPress={() => handleDelete(screenshot.id)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Info below image */}
                      <div className="mt-2">
                        <p className="text-sm font-medium truncate">{screenshot.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Chip
                            size="sm"
                            variant="flat"
                            startContent={<CategoryIcon size={10} />}
                            classNames={{ base: 'h-5' }}
                          >
                            {categoryConfig.label}
                          </Chip>
                          <span className="text-xs text-default-400">
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
        </CardBody>
      </Card>

      {/* Upload Modal */}
      <Modal isOpen={uploadModal.isOpen} onClose={uploadModal.onClose} size="2xl">
        <ModalContent>
          <ModalHeader className="flex items-center gap-2">
            <Camera size={20} className="text-purple-500" />
            Upload Screenshot Baru
          </ModalHeader>
          <ModalBody className="pb-6">
            <div className="space-y-4">
              {/* File Upload Area */}
              <div
                className={`
                  border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer
                  ${previewDataUrl
                    ? 'border-primary bg-primary/5'
                    : 'border-default-300 hover:border-primary hover:bg-default-50'
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
                    <Image
                      src={previewDataUrl}
                      alt="Preview"
                      className="max-h-48 mx-auto rounded-lg"
                    />
                    <Button
                      size="sm"
                      variant="flat"
                      color="danger"
                      isIconOnly
                      className="absolute top-2 right-2"
                      onPress={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                        setPreviewDataUrl(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                    >
                      <X size={14} />
                    </Button>
                    <p className="mt-2 text-sm text-default-500">
                      {selectedFile?.name} ({formatFileSize(selectedFile?.size || 0)})
                    </p>
                  </div>
                ) : (
                  <>
                    <Upload size={40} className="mx-auto mb-3 text-default-400" />
                    <p className="text-default-600 mb-1">
                      Klik atau drag file screenshot ke sini
                    </p>
                    <p className="text-xs text-default-400">
                      PNG, JPG, GIF, WEBP (Maks. 10MB)
                    </p>
                  </>
                )}
              </div>

              {/* Title */}
              <Input
                label="Judul Screenshot"
                placeholder="Contoh: Halaman Login, Dashboard Admin"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                isRequired
                variant="bordered"
              />

              {/* Category */}
              <Select
                label="Kategori"
                placeholder="Pilih kategori"
                selectedKeys={[formData.category]}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                variant="bordered"
              >
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} startContent={<cat.icon size={16} />}>
                    {cat.label}
                  </SelectItem>
                ))}
              </Select>

              {/* Description */}
              <Textarea
                label="Deskripsi (Opsional)"
                placeholder="Jelaskan screenshot ini..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                variant="bordered"
                minRows={2}
              />

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-2">
                  <Progress
                    value={uploadProgress}
                    color="primary"
                    size="sm"
                    label="Mengupload..."
                    showValueLabel
                  />
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              onPress={() => {
                uploadModal.onClose();
                resetForm();
              }}
              isDisabled={isUploading}
            >
              Batal
            </Button>
            <Button
              color="primary"
              onPress={handleUpload}
              isLoading={isUploading}
              isDisabled={!selectedFile || !formData.title.trim()}
              startContent={!isUploading && <Upload size={16} />}
            >
              Upload
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Preview Modal */}
      <Modal
        isOpen={previewModal.isOpen}
        onClose={previewModal.onClose}
        size="5xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>{previewTitle}</ModalHeader>
          <ModalBody className="p-0">
            {previewUrl && (
              <Image
                src={previewUrl}
                alt={previewTitle}
                className="w-full"
                loading="lazy"
              />
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={previewModal.onClose}>
              Tutup
            </Button>
            {previewUrl && (
              <Button
                color="primary"
                as="a"
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Buka di Tab Baru
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
