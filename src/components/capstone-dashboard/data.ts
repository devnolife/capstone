// Mock data dashboard — struktur mengikuti prisma/schema.prisma
// (ProjectStatus, PresentationSchedule, Review). Diganti data asli saat RBAC di-wire.

export type ProjectStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'IN_REVIEW'
  | 'REVISION_NEEDED'
  | 'READY_FOR_PRESENTATION'
  | 'PRESENTATION_SCHEDULED'
  | 'APPROVED';

export const STATUS_LABEL: Record<ProjectStatus, string> = {
  DRAFT: 'Draft',
  SUBMITTED: 'Terkumpul',
  IN_REVIEW: 'Direview',
  REVISION_NEEDED: 'Perlu Revisi',
  READY_FOR_PRESENTATION: 'Siap Sidang',
  PRESENTATION_SCHEDULED: 'Sidang Terjadwal',
  APPROVED: 'Lulus',
};

export interface ProjectRow {
  id: string;
  title: string;
  team: string;
  members: { name: string; initials: string }[];
  status: ProjectStatus;
  milestone: { current: number; total: number };
  updatedAt: string;
}

export const projects: ProjectRow[] = [
  {
    id: 'CPS-2025-042',
    title: 'Smart Campus IoT',
    team: 'Tim Alpha',
    members: [
      { name: 'Andi Pratama', initials: 'AP' },
      { name: 'Nurul Hikmah', initials: 'NH' },
      { name: 'Muh. Fadel', initials: 'MF' },
    ],
    status: 'IN_REVIEW',
    milestone: { current: 3, total: 4 },
    updatedAt: '2 jam lalu',
  },
  {
    id: 'CPS-2025-038',
    title: 'Sistem Deteksi Plagiarisme',
    team: 'Tim Beta',
    members: [
      { name: 'Sitti Rahmah', initials: 'SR' },
      { name: 'Ahmad Yani', initials: 'AY' },
    ],
    status: 'REVISION_NEEDED',
    milestone: { current: 2, total: 4 },
    updatedAt: '5 jam lalu',
  },
  {
    id: 'CPS-2025-051',
    title: 'E-Perpustakaan Fakultas',
    team: 'Tim Gamma',
    members: [
      { name: 'Rizky Aulia', initials: 'RA' },
      { name: 'Dewi Lestari', initials: 'DL' },
      { name: 'Fajar Sidiq', initials: 'FS' },
    ],
    status: 'READY_FOR_PRESENTATION',
    milestone: { current: 4, total: 4 },
    updatedAt: 'kemarin',
  },
  {
    id: 'CPS-2025-029',
    title: 'Klasifikasi Penyakit Padi (CNN)',
    team: 'Tim Delta',
    members: [
      { name: 'Ilham Akbar', initials: 'IA' },
      { name: 'Mutiara Sari', initials: 'MS' },
    ],
    status: 'PRESENTATION_SCHEDULED',
    milestone: { current: 4, total: 4 },
    updatedAt: 'kemarin',
  },
  {
    id: 'CPS-2025-047',
    title: 'Monitoring Gizi Balita',
    team: 'Tim Epsilon',
    members: [
      { name: 'Putri Amanda', initials: 'PA' },
      { name: 'Bagus Wirawan', initials: 'BW' },
      { name: 'Lina Marlina', initials: 'LM' },
    ],
    status: 'SUBMITTED',
    milestone: { current: 3, total: 4 },
    updatedAt: '2 hari lalu',
  },
  {
    id: 'CPS-2025-015',
    title: 'Absensi Wajah Realtime',
    team: 'Tim Zeta',
    members: [
      { name: 'Hendra Gunawan', initials: 'HG' },
      { name: 'Ayu Wandira', initials: 'AW' },
    ],
    status: 'APPROVED',
    milestone: { current: 4, total: 4 },
    updatedAt: '3 hari lalu',
  },
  {
    id: 'CPS-2025-056',
    title: 'Marketplace Hasil Tani',
    team: 'Tim Eta',
    members: [
      { name: 'Rahmat Hidayat', initials: 'RH' },
      { name: 'Salsabila Zahra', initials: 'SZ' },
    ],
    status: 'DRAFT',
    milestone: { current: 1, total: 4 },
    updatedAt: '4 hari lalu',
  },
];

export interface ActivityPoint {
  week: string;
  submission: number;
  review: number;
}

export const activitySeries: ActivityPoint[] = [
  { week: 'Pekan 1', submission: 4, review: 2 },
  { week: 'Pekan 2', submission: 9, review: 6 },
  { week: 'Pekan 3', submission: 14, review: 10 },
  { week: 'Pekan 4', submission: 11, review: 12 },
  { week: 'Pekan 5', submission: 18, review: 14 },
  { week: 'Pekan 6', submission: 15, review: 17 },
  { week: 'Pekan 7', submission: 22, review: 18 },
  { week: 'Pekan 8', submission: 19, review: 21 },
  { week: 'Pekan 9', submission: 27, review: 22 },
  { week: 'Pekan 10', submission: 24, review: 26 },
  { week: 'Pekan 11', submission: 31, review: 27 },
  { week: 'Pekan 12', submission: 28, review: 30 },
];

export interface DeadlineItem {
  date: string;
  month: string;
  title: string;
  note: string;
}

export const deadlines: DeadlineItem[] = [
  { date: '12', month: 'Des', title: 'Milestone 4 (Final)', note: '3 hari lagi' },
  { date: '15', month: 'Des', title: 'Laporan Akhir (BAB 1-5)', note: '6 hari lagi' },
  { date: '18', month: 'Des', title: 'Slide Presentasi', note: '9 hari lagi' },
  { date: '22', month: 'Des', title: 'Sidang Gelombang 1', note: 'Lab 2 · 09:00' },
];

export interface ActivityItem {
  actor: string;
  action: string;
  target: string;
  time: string;
}

export const recentActivity: ActivityItem[] = [
  {
    actor: 'Dr. Lukman',
    action: 'meminta revisi pada',
    target: 'Sistem Deteksi Plagiarisme',
    time: '32 menit lalu',
  },
  {
    actor: 'Tim Alpha',
    action: 'mengumpulkan submission v3',
    target: 'Smart Campus IoT',
    time: '2 jam lalu',
  },
  {
    actor: 'Ir. Hasanuddin',
    action: 'menyelesaikan review',
    target: 'E-Perpustakaan Fakultas',
    time: '4 jam lalu',
  },
  {
    actor: 'Admin Prodi',
    action: 'menjadwalkan sidang',
    target: 'Klasifikasi Penyakit Padi',
    time: 'kemarin',
  },
];
