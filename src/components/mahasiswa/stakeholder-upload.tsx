"use client";

import { useState, useCallback, useRef } from "react";
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
} from "@heroui/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileSignature,
  Camera,
  FileText,
  IdCard,
  File,
  Trash2,
  Eye,
  X,
  CheckCircle2,
  Building2,
  User,
  Briefcase,
  Plus,
} from "lucide-react";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";

interface StakeholderDocument {
  id: string;
  projectId: string;
  stakeholderName: string;
  stakeholderRole?: string | null;
  organization?: string | null;
  type: "SIGNATURE" | "PHOTO" | "AGREEMENT_LETTER" | "ID_CARD" | "SCREENSHOT" | "SUPPORTING_DOCUMENT" | "OTHER";
  fileName: string;
  fileKey: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  description?: string | null;
  uploadedAt: string;
}

interface StakeholderUploadProps {
  projectId: string;
  documents: StakeholderDocument[];
  onDocumentsChange: (documents: StakeholderDocument[]) => void;
  readOnly?: boolean;
}

const DOCUMENT_TYPES = [
  { value: "SIGNATURE", label: "Tanda Tangan", icon: FileSignature },
  { value: "PHOTO", label: "Foto", icon: Camera },
  { value: "AGREEMENT_LETTER", label: "Surat Persetujuan", icon: FileText },
  { value: "ID_CARD", label: "Kartu Identitas", icon: IdCard },
  { value: "SCREENSHOT", label: "Screenshot", icon: Camera },
  { value: "SUPPORTING_DOCUMENT", label: "Dokumen Pelengkap", icon: FileText },
  { value: "OTHER", label: "Lainnya", icon: File },
];

const getTypeConfig = (type: string) => {
  const config: Record<string, { color: "success" | "primary" | "warning" | "secondary" | "danger" | "default"; icon: React.ElementType; label: string }> = {
    SIGNATURE: { color: "success", icon: FileSignature, label: "Tanda Tangan" },
    PHOTO: { color: "primary", icon: Camera, label: "Foto" },
    AGREEMENT_LETTER: { color: "warning", icon: FileText, label: "Surat Persetujuan" },
    ID_CARD: { color: "secondary", icon: IdCard, label: "Kartu Identitas" },
    SCREENSHOT: { color: "primary", icon: Camera, label: "Screenshot" },
    SUPPORTING_DOCUMENT: { color: "warning", icon: FileText, label: "Dokumen Pelengkap" },
    OTHER: { color: "danger", icon: File, label: "Lainnya" },
  };
  return config[type] || config.OTHER;
};

export default function StakeholderUpload({
  projectId,
  documents,
  onDocumentsChange,
  readOnly = false,
}: StakeholderUploadProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const previewModal = useDisclosure();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFileName, setPreviewFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [stakeholderName, setStakeholderName] = useState("");
  const [stakeholderRole, setStakeholderRole] = useState("");
  const [organization, setOrganization] = useState("");
  const [documentType, setDocumentType] = useState<string>("SIGNATURE");
  const [description, setDescription] = useState("");

  const resetForm = useCallback(() => {
    setSelectedFile(null);
    setFilePreview(null);
    setStakeholderName("");
    setStakeholderRole("");
    setOrganization("");
    setDocumentType("SIGNATURE");
    setDescription("");
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      addToast({
        title: "Error",
        description: "Tipe file tidak didukung. Gunakan JPG, PNG, WebP, atau PDF.",
        color: "danger",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      addToast({
        title: "Error",
        description: "Ukuran file terlalu besar. Maksimal 10MB.",
        color: "danger",
      });
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !stakeholderName.trim()) {
      addToast({
        title: "Error",
        description: "Pilih file dan isi nama stakeholder.",
        color: "danger",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      // Step 1: Upload file to MinIO
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("prefix", "stakeholder-documents");
      formData.append("projectId", projectId);

      setUploadProgress(30);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const error = await uploadRes.json();
        throw new Error(error.error || "Upload failed");
      }

      const uploadData = await uploadRes.json();
      setUploadProgress(60);

      // Step 2: Create stakeholder document record
      const docRes = await fetch("/api/stakeholder-documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          stakeholderName: stakeholderName.trim(),
          stakeholderRole: stakeholderRole.trim() || null,
          organization: organization.trim() || null,
          type: documentType,
          fileName: uploadData.data.fileName,
          fileKey: uploadData.data.fileKey,
          fileUrl: uploadData.data.fileUrl,
          fileSize: uploadData.data.fileSize,
          mimeType: uploadData.data.mimeType,
          description: description.trim() || null,
        }),
      });

      setUploadProgress(90);

      if (!docRes.ok) {
        const error = await docRes.json();
        throw new Error(error.error || "Failed to save document");
      }

      const docData = await docRes.json();
      setUploadProgress(100);

      // Update documents list
      onDocumentsChange([docData.data, ...documents]);

      addToast({
        title: "Berhasil",
        description: "Dokumen stakeholder berhasil diunggah.",
        color: "success",
      });

      resetForm();
      onClose();
    } catch (error) {
      console.error("Upload error:", error);
      addToast({
        title: "Error",
        description: error instanceof Error ? error.message : "Gagal mengunggah dokumen.",
        color: "danger",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (documentId: string) => {
    const confirmed = await confirm({
      title: 'Hapus Dokumen',
      message: 'Apakah Anda yakin ingin menghapus dokumen ini?',
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      type: 'danger',
    });

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/stakeholder-documents?id=${documentId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Delete failed");
      }

      // Update documents list
      onDocumentsChange(documents.filter((d) => d.id !== documentId));

      addToast({
        title: "Berhasil",
        description: "Dokumen berhasil dihapus.",
        color: "success",
      });
    } catch (error) {
      console.error("Delete error:", error);
      addToast({
        title: "Error",
        description: error instanceof Error ? error.message : "Gagal menghapus dokumen.",
        color: "danger",
      });
    }
  };

  const handlePreview = (doc: StakeholderDocument) => {
    setPreviewUrl(doc.fileUrl);
    setPreviewFileName(doc.fileName);
    previewModal.onOpen();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Dokumen Stakeholder
          </h3>
          <p className="text-sm text-default-500">
            Upload tanda tangan, foto, dan dokumen pendukung lainnya
          </p>
        </div>
        {!readOnly && (
          <Button
            color="primary"
            startContent={<Plus className="w-4 h-4" />}
            onPress={onOpen}
          >
            Tambah Dokumen
          </Button>
        )}
      </div>

      {/* Documents Grid */}
      {documents.length === 0 ? (
        <Card className="border-2 border-dashed border-default-200">
          <CardBody className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-full bg-default-100 flex items-center justify-center mb-4">
              <FileSignature className="w-8 h-8 text-default-400" />
            </div>
            <p className="text-default-500 text-center">
              Belum ada dokumen stakeholder.
              {!readOnly && (
                <>
                  <br />
                  <span className="text-sm">
                    Klik tombol &quot;Tambah Dokumen&quot; untuk mulai mengupload.
                  </span>
                </>
              )}
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {documents.map((doc, index) => {
              const typeConfig = getTypeConfig(doc.type);
              const TypeIcon = typeConfig.icon;
              const isImage = doc.mimeType.startsWith("image/");

              return (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                    {/* Preview Thumbnail */}
                    {isImage ? (
                      <div className="relative h-40 bg-default-100 overflow-hidden">
                        <Image
                          src={doc.fileUrl}
                          alt={doc.fileName}
                          className="w-full h-full object-cover"
                          removeWrapper
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="flat"
                            className="bg-white/20 backdrop-blur-sm text-white"
                            onPress={() => handlePreview(doc)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {!readOnly && (
                            <Button
                              isIconOnly
                              size="sm"
                              variant="flat"
                              className="bg-white/20 backdrop-blur-sm text-white"
                              onPress={() => handleDelete(doc.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="relative h-40 bg-gradient-to-br from-default-100 to-default-200 flex items-center justify-center">
                        <FileText className="w-16 h-16 text-default-400" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="flat"
                            className="bg-white/20 backdrop-blur-sm text-white"
                            onPress={() => handlePreview(doc)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {!readOnly && (
                            <Button
                              isIconOnly
                              size="sm"
                              variant="flat"
                              className="bg-white/20 backdrop-blur-sm text-white"
                              onPress={() => handleDelete(doc.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    )}

                    <CardBody className="p-4 space-y-3">
                      {/* Type Badge */}
                      <Chip
                        size="sm"
                        color={typeConfig.color}
                        variant="flat"
                        startContent={<TypeIcon className="w-3 h-3" />}
                      >
                        {typeConfig.label}
                      </Chip>

                      {/* Stakeholder Info */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-default-400" />
                          <span className="text-sm font-medium truncate">
                            {doc.stakeholderName}
                          </span>
                        </div>
                        {doc.stakeholderRole && (
                          <div className="flex items-center gap-2">
                            <Briefcase className="w-3.5 h-3.5 text-default-400" />
                            <span className="text-xs text-default-500 truncate">
                              {doc.stakeholderRole}
                            </span>
                          </div>
                        )}
                        {doc.organization && (
                          <div className="flex items-center gap-2">
                            <Building2 className="w-3.5 h-3.5 text-default-400" />
                            <span className="text-xs text-default-500 truncate">
                              {doc.organization}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* File Info */}
                      <div className="flex items-center justify-between text-xs text-default-400">
                        <span className="truncate max-w-[60%]">{doc.fileName}</span>
                        <span>{formatFileSize(doc.fileSize)}</span>
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Upload Modal */}
      <Modal size="2xl" isOpen={isOpen} onClose={onClose} scrollBehavior="inside">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h3 className="text-lg font-semibold">Tambah Dokumen Stakeholder</h3>
            <p className="text-sm text-default-500 font-normal">
              Upload dokumen seperti tanda tangan, foto, atau surat persetujuan
            </p>
          </ModalHeader>
          <ModalBody className="gap-6">
            {/* File Upload Area */}
            <div className="space-y-3">
              <label className="text-sm font-medium">File Dokumen *</label>
              <div
                className={`border-2 border-dashed rounded-xl p-6 transition-colors cursor-pointer hover:border-primary hover:bg-primary/5 ${selectedFile ? "border-success bg-success/5" : "border-default-200"
                  }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                  className="hidden"
                  onChange={handleFileSelect}
                />

                {selectedFile ? (
                  <div className="flex items-center gap-4">
                    {filePreview ? (
                      <Image
                        src={filePreview}
                        alt="Preview"
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-default-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-8 h-8 text-default-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{selectedFile.name}</p>
                      <p className="text-sm text-default-500">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="flat"
                      color="danger"
                      onPress={() => {
                        setSelectedFile(null);
                        setFilePreview(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="w-10 h-10 mx-auto text-default-400 mb-3" />
                    <p className="text-sm font-medium mb-1">
                      Klik atau drag file ke sini
                    </p>
                    <p className="text-xs text-default-400">
                      JPG, PNG, WebP, atau PDF (Maks. 10MB)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Document Type */}
            <Select
              label="Jenis Dokumen"
              labelPlacement="outside"
              placeholder="Pilih jenis dokumen"
              selectedKeys={[documentType]}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                if (selected) setDocumentType(selected);
              }}
              isRequired
            >
              {DOCUMENT_TYPES.map((type) => (
                <SelectItem key={type.value} startContent={<type.icon className="w-4 h-4" />}>
                  {type.label}
                </SelectItem>
              ))}
            </Select>

            {/* Stakeholder Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nama Stakeholder"
                labelPlacement="outside"
                placeholder="Contoh: Budi Santoso"
                value={stakeholderName}
                onValueChange={setStakeholderName}
                startContent={<User className="w-4 h-4 text-default-400" />}
                isRequired
              />
              <Input
                label="Jabatan/Peran"
                labelPlacement="outside"
                placeholder="Contoh: Direktur IT"
                value={stakeholderRole}
                onValueChange={setStakeholderRole}
                startContent={<Briefcase className="w-4 h-4 text-default-400" />}
              />
            </div>

            <Input
              label="Organisasi/Perusahaan"
              labelPlacement="outside"
              placeholder="Contoh: PT Teknologi Indonesia"
              value={organization}
              onValueChange={setOrganization}
              startContent={<Building2 className="w-4 h-4 text-default-400" />}
            />

            <Textarea
              label="Deskripsi (Opsional)"
              labelPlacement="outside"
              placeholder="Tambahkan keterangan tentang dokumen ini..."
              value={description}
              onValueChange={setDescription}
              minRows={2}
            />

            {/* Upload Progress */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-default-600">Mengupload...</span>
                  <span className="text-primary font-medium">{uploadProgress}%</span>
                </div>
                <Progress
                  value={uploadProgress}
                  color="primary"
                  size="sm"
                  className="w-full"
                />
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose} isDisabled={isUploading}>
              Batal
            </Button>
            <Button
              color="primary"
              onPress={handleUpload}
              isLoading={isUploading}
              isDisabled={!selectedFile || !stakeholderName.trim()}
              startContent={!isUploading && <CheckCircle2 className="w-4 h-4" />}
            >
              {isUploading ? "Mengupload..." : "Upload Dokumen"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Preview Modal */}
      <Modal
        size="4xl"
        isOpen={previewModal.isOpen}
        onClose={previewModal.onClose}
      >
        <ModalContent>
          <ModalHeader>{previewFileName}</ModalHeader>
          <ModalBody className="p-0">
            {previewUrl && (
              previewUrl.endsWith(".pdf") ? (
                <iframe
                  src={previewUrl}
                  className="w-full h-[70vh]"
                  title="PDF Preview"
                />
              ) : (
                <div className="flex items-center justify-center p-4">
                  <Image
                    src={previewUrl}
                    alt={previewFileName}
                    className="max-h-[70vh] object-contain"
                  />
                </div>
              )
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={previewModal.onClose}>
              Tutup
            </Button>
            <Button
              color="primary"
              as="a"
              href={previewUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
            >
              Buka di Tab Baru
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog />
    </div>
  );
}
