'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Button,
  Input,
  Chip,
  Image,
  Avatar,
  addToast,
} from '@heroui/react';
import { Camera, Trash2, Upload, ScanFace } from 'lucide-react';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';

interface UserPhoto {
  id: string;
  caption: string | null;
  fileName: string;
  fileUrl: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  createdAt: string;
  uploadedBy: { id: string; name: string; image?: string | null };
}

interface UserPhotoUploadProps {
  projectId: string;
  readOnly?: boolean;
}

const statusMeta: Record<
  UserPhoto['verificationStatus'],
  { label: string; color: 'warning' | 'success' | 'danger' }
> = {
  PENDING: { label: 'Menunggu Verifikasi Wajah', color: 'warning' },
  VERIFIED: { label: 'Wajah Terverifikasi', color: 'success' },
  REJECTED: { label: 'Verifikasi Ditolak', color: 'danger' },
};

export function UserPhotoUpload({ projectId, readOnly = false }: UserPhotoUploadProps) {
  const [photos, setPhotos] = useState<UserPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const fetchPhotos = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/user-photos`);
      if (res.ok) {
        const json = await res.json();
        setPhotos(json.data ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (caption.trim()) formData.append('caption', caption.trim());

      const res = await fetch(`/api/projects/${projectId}/user-photos`, {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Upload gagal');
      }
      setPhotos((prev) => [json.data, ...prev]);
      setCaption('');
      addToast({
        title: 'Foto berhasil diunggah',
        description: 'Foto akan diverifikasi dengan pengenalan wajah.',
        color: 'success',
      });
    } catch (error) {
      addToast({
        title: 'Gagal mengunggah',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan',
        color: 'danger',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (photo: UserPhoto) => {
    const ok = await confirm({
      title: 'Hapus Foto',
      message: 'Apakah Anda yakin ingin menghapus foto ini?',
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      type: 'danger',
    });
    if (!ok) return;
    const res = await fetch(
      `/api/projects/${projectId}/user-photos/${photo.id}`,
      { method: 'DELETE' },
    );
    if (res.ok) {
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
      addToast({ title: 'Foto dihapus', color: 'success' });
    } else {
      const json = await res.json().catch(() => null);
      addToast({
        title: 'Gagal menghapus',
        description: json?.error,
        color: 'danger',
      });
    }
  };

  return (
    <div>
      <ConfirmDialog />
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/30">
            <Camera size={18} className="text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">Foto Bersama Pengguna</h2>
            <p className="text-xs text-default-500">
              Unggah foto bersama pengguna aplikasi — wajib minimal 1 foto,
              wajah akan diverifikasi otomatis
            </p>
          </div>
        </div>
        <Chip
          size="sm"
          color={photos.length >= 1 ? 'success' : 'warning'}
          variant="flat"
        >
          {photos.length}/1 minimum
        </Chip>
      </div>

      {!readOnly && (
        <div className="mb-5 flex flex-col sm:flex-row gap-3">
          <Input
            size="sm"
            label="Keterangan foto (opsional)"
            placeholder="Contoh: Foto bersama Bpk. Ahmad (pemilik toko) saat uji coba aplikasi"
            value={caption}
            onValueChange={setCaption}
            className="flex-1"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileSelect}
          />
          <Button
            color="primary"
            variant="flat"
            isLoading={uploading}
            startContent={!uploading && <Upload size={16} />}
            onPress={() => fileInputRef.current?.click()}
            className="sm:self-end"
          >
            Pilih Foto
          </Button>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-default-400">Memuat foto...</p>
      ) : photos.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700">
          <ScanFace size={32} className="text-default-300" />
          <p className="text-sm text-default-400">
            Belum ada foto bersama pengguna.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {photos.map((photo) => {
            const meta = statusMeta[photo.verificationStatus] ?? statusMeta.PENDING;
            return (
              <div
                key={photo.id}
                className="rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden bg-zinc-50 dark:bg-zinc-800/50"
              >
                <Image
                  src={photo.fileUrl}
                  alt={photo.caption || photo.fileName}
                  className="w-full h-40 object-cover rounded-none"
                  radius="none"
                />
                <div className="p-3 space-y-2">
                  <Chip size="sm" color={meta.color} variant="flat" startContent={<ScanFace size={12} />}>
                    {meta.label}
                  </Chip>
                  {photo.caption && (
                    <p className="text-xs text-default-600 line-clamp-2">
                      {photo.caption}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-default-500">
                      <Avatar
                        src={photo.uploadedBy.image || undefined}
                        name={photo.uploadedBy.name}
                        className="w-4 h-4 text-[8px]"
                      />
                      <span className="truncate max-w-28">{photo.uploadedBy.name}</span>
                    </div>
                    {!readOnly && (
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="danger"
                        onPress={() => handleDelete(photo)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
