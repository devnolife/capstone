'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { addToast } from '@/lib/toast';
import { getInitials } from '@/lib/utils';
import { Camera, Trash2, Upload, ScanFace, RefreshCw, Loader2 } from 'lucide-react';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';

interface UserPhoto {
  id: string;
  caption: string | null;
  fileName: string;
  fileUrl: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  verificationResult?: { note?: string; personCount?: number } | null;
  createdAt: string;
  uploadedBy: { id: string; name: string; image?: string | null };
}

interface UserPhotoUploadProps {
  projectId: string;
  readOnly?: boolean;
}

const statusMeta: Record<
  UserPhoto['verificationStatus'],
  { label: string; className: string }
> = {
  PENDING: { label: 'Menunggu Verifikasi Wajah', className: 'bg-warning/15 text-warning' },
  VERIFIED: { label: 'Wajah Terverifikasi', className: 'bg-success/15 text-success' },
  REJECTED: { label: 'Verifikasi Ditolak', className: 'bg-destructive/10 text-destructive' },
};

export function UserPhotoUpload({ projectId, readOnly = false }: UserPhotoUploadProps) {
  const [photos, setPhotos] = useState<UserPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
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

  const handleReverify = async (photo: UserPhoto) => {
    setVerifyingId(photo.id);
    try {
      const res = await fetch(
        `/api/projects/${projectId}/user-photos/${photo.id}/verify`,
        { method: 'POST' },
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Verifikasi gagal');
      setPhotos((prev) =>
        prev.map((p) => (p.id === photo.id ? json.data : p)),
      );
      addToast({
        title:
          json.data.verificationStatus === 'VERIFIED'
            ? 'Wajah terverifikasi'
            : json.data.verificationStatus === 'REJECTED'
              ? 'Verifikasi ditolak'
              : 'Verifikasi masih tertunda',
        description: json.data.verificationResult?.note,
        color:
          json.data.verificationStatus === 'VERIFIED'
            ? 'success'
            : json.data.verificationStatus === 'REJECTED'
              ? 'danger'
              : 'warning',
      });
    } catch (error) {
      addToast({
        title: 'Gagal memverifikasi',
        description: error instanceof Error ? error.message : undefined,
        color: 'danger',
      });
    } finally {
      setVerifyingId(null);
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
            <p className="text-xs text-muted-foreground">
              Unggah foto bersama pengguna aplikasi — wajib minimal 1 foto,
              wajah akan diverifikasi otomatis
            </p>
          </div>
        </div>
        <Badge
          className={
            photos.length >= 1
              ? 'bg-success/15 text-success'
              : 'bg-warning/15 text-warning'
          }
        >
          {photos.length}/1 minimum
        </Badge>
      </div>

      {!readOnly && (
        <div className="mb-5 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="user-photo-caption">Keterangan foto (opsional)</Label>
            <Input
              id="user-photo-caption"
              placeholder="Contoh: Foto bersama Bpk. Ahmad (pemilik toko) saat uji coba aplikasi"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileSelect}
          />
          <Button
            variant="outline"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="sm:self-end"
          >
            {uploading ? <Loader2 className="animate-spin" /> : <Upload size={16} />}
            Pilih Foto
          </Button>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Memuat foto...</p>
      ) : photos.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700">
          <ScanFace size={32} className="text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
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
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.fileUrl}
                  alt={photo.caption || photo.fileName}
                  className="w-full h-40 object-cover"
                />
                <div className="p-3 space-y-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Badge className={meta.className}>
                      <ScanFace size={12} />
                      {meta.label}
                    </Badge>
                    {!readOnly && photo.verificationStatus !== 'VERIFIED' && (
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        disabled={verifyingId === photo.id}
                        onClick={() => handleReverify(photo)}
                        title="Verifikasi ulang wajah"
                      >
                        {verifyingId === photo.id ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <RefreshCw size={12} />
                        )}
                      </Button>
                    )}
                  </div>
                  {photo.verificationResult?.note && (
                    <p className="text-[11px] text-muted-foreground line-clamp-2">
                      {photo.verificationResult.note}
                    </p>
                  )}
                  {photo.caption && (
                    <p className="text-xs text-foreground line-clamp-2">
                      {photo.caption}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Avatar className="size-4">
                        <AvatarImage
                          src={photo.uploadedBy.image || undefined}
                          alt={photo.uploadedBy.name}
                        />
                        <AvatarFallback className="text-[8px]">
                          {getInitials(photo.uploadedBy.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate max-w-28">{photo.uploadedBy.name}</span>
                    </div>
                    {!readOnly && (
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => handleDelete(photo)}
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
