import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getStatusColor(
  status: string,
): 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' {
  const statusColors: Record<
    string,
    'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  > = {
    DRAFT: 'default',
    SUBMITTED: 'primary',
    IN_REVIEW: 'secondary',
    REVISION_NEEDED: 'warning',
    APPROVED: 'success',
    REJECTED: 'danger',
    PENDING: 'default',
    IN_PROGRESS: 'primary',
    COMPLETED: 'success',
  };
  return statusColors[status] || 'default';
}

export function getStatusLabel(status: string): string {
  const statusLabels: Record<string, string> = {
    DRAFT: 'Draft',
    SUBMITTED: 'Disubmit',
    IN_REVIEW: 'Dalam Review',
    REVISION_NEEDED: 'Perlu Revisi',
    APPROVED: 'Disetujui',
    REJECTED: 'Ditolak',
    PENDING: 'Menunggu',
    IN_PROGRESS: 'Sedang Dikerjakan',
    COMPLETED: 'Selesai',
  };
  return statusLabels[status] || status;
}

export function getRoleLabel(role: string): string {
  const roleLabels: Record<string, string> = {
    MAHASISWA: 'Mahasiswa',
    DOSEN_PENGUJI: 'Dosen Penguji',
    ADMIN: 'Admin',
  };
  return roleLabels[role] || role;
}

export function getDocumentTypeLabel(type: string): string {
  const typeLabels: Record<string, string> = {
    PROPOSAL: 'Proposal',
    BAB_1: 'Bab 1 - Pendahuluan',
    BAB_2: 'Bab 2 - Tinjauan Pustaka',
    BAB_3: 'Bab 3 - Metodologi',
    BAB_4: 'Bab 4 - Hasil & Pembahasan',
    BAB_5: 'Bab 5 - Kesimpulan',
    FINAL_REPORT: 'Laporan Akhir',
    PRESENTATION: 'Presentasi',
    SOURCE_CODE: 'Source Code',
    OTHER: 'Lainnya',
  };
  return typeLabels[type] || type;
}

/**
 * Get SIMAK photo URL from NIM
 * @param nim - Student NIM (Nomor Induk Mahasiswa)
 * @returns URL to SIMAK photo or undefined if no NIM provided
 */
export function getSimakPhotoUrl(nim: string | null | undefined): string | undefined {
  if (!nim) return undefined;
  return `https://simak.unismuh.ac.id/upload/mahasiswa/${nim}.jpg`;
}
