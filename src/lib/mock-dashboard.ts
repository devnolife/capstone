/**
 * Mock/fallback data untuk dashboard & stats saat database tidak tersedia
 * (mis. development tanpa PostgreSQL). Setiap dashboard page mencoba query
 * Prisma dulu; jika gagal, fallback ke data di file ini.
 */

// ---------- Landing /api/stats ----------
export const MOCK_LANDING_STATS = {
  totalProjects: 128,
  approvedProjects: 87,
  totalMahasiswa: 215,
  successRate: 92,
};

// ---------- Shared ----------
const DAY_LABELS = ['MIN', 'SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB'];

/** Label 7 hari terakhir (paling lama → hari ini) dengan nilai mock. */
export function mockActivity(values: number[]): { label: string; value: number }[] {
  const now = new Date();
  const points: { label: string; value: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    points.push({ label: DAY_LABELS[day.getDay()], value: values[6 - i] ?? 0 });
  }
  return points;
}

function isoDaysFromNow(days: number, hour = 9): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

// ---------- Mahasiswa ----------
export const MOCK_MAHASISWA = {
  hasGitHubConnected: true,
  githubUsername: 'devnolife',
  stats: {
    totalProjects: 3,
    submittedProjects: 2,
    reviewedProjects: 1,
    pendingReviews: 1,
    totalDocuments: 8,
  },
  projects: [
    {
      id: 'mock-1',
      title: 'Sistem Rekomendasi UMKM Makassar',
      status: 'IN_REVIEW',
      semester: 'Ganjil',
      tahunAkademik: '2025/2026',
      documents: 4,
      reviews: 2,
    },
    {
      id: 'mock-2',
      title: 'Monitoring Klinik Digital',
      status: 'APPROVED',
      semester: 'Genap',
      tahunAkademik: '2024/2025',
      documents: 3,
      reviews: 1,
    },
    {
      id: 'mock-3',
      title: 'Marketplace Hasil Tani',
      status: 'DRAFT',
      semester: 'Ganjil',
      tahunAkademik: '2025/2026',
      documents: 1,
      reviews: 0,
    },
  ],
  activity: () => mockActivity([1, 0, 3, 2, 4, 1, 2]),
  upcomingPresentation: {
    projectTitle: 'Sistem Rekomendasi UMKM Makassar',
    scheduledDate: isoDaysFromNow(2),
    startTime: '09:30',
    endTime: '10:15',
    location: 'Lab IF-301',
    scheduledBy: 'Admin Prodi',
    notes: 'Siapkan demo aplikasi live dan kredensial testing untuk dosen penguji.',
  },
  reviews: [
    {
      id: 'mock-r1',
      status: 'IN_PROGRESS',
      overallComment:
        'Pisahkan layer service dan repository. Tambahkan pengujian untuk modul rekomendasi.',
      updatedAt: isoDaysFromNow(-1, 14),
      reviewerName: 'Dr. Andi Rahman',
      projectId: 'mock-1',
      projectTitle: 'Sistem Rekomendasi UMKM Makassar',
      commentCount: 5,
    },
    {
      id: 'mock-r2',
      status: 'COMPLETED',
      overallComment: 'Fungsionalitas lengkap dan deployment rapi. Disetujui.',
      updatedAt: isoDaysFromNow(-6, 10),
      reviewerName: 'Ir. Lisa Pratiwi',
      projectId: 'mock-2',
      projectTitle: 'Monitoring Klinik Digital',
      commentCount: 3,
    },
  ],
};

// ---------- Dosen ----------
export const MOCK_DOSEN = {
  stats: {
    totalAssigned: 8,
    pendingReview: 3,
    completedReview: 5,
    totalMahasiswa: 8,
  },
  projects: [
    {
      id: 'mock-1',
      title: 'Sistem Rekomendasi UMKM Makassar',
      status: 'IN_REVIEW',
      mahasiswaName: 'Aldi Pratama',
      semester: 'Ganjil',
      tahunAkademik: '2025/2026',
      documents: 4,
      reviews: 2,
    },
    {
      id: 'mock-2',
      title: 'Monitoring Klinik Digital',
      status: 'READY_FOR_PRESENTATION',
      mahasiswaName: 'Nisa Aulia',
      semester: 'Ganjil',
      tahunAkademik: '2025/2026',
      documents: 3,
      reviews: 1,
    },
    {
      id: 'mock-3',
      title: 'Marketplace Hasil Tani',
      status: 'SUBMITTED',
      mahasiswaName: 'Budi Santoso',
      semester: 'Ganjil',
      tahunAkademik: '2025/2026',
      documents: 2,
      reviews: 0,
    },
  ],
  activity: () => mockActivity([2, 1, 0, 3, 1, 2, 1]),
  upcomingPresentation: {
    projectTitle: 'Monitoring Klinik Digital',
    mahasiswaName: 'Nisa Aulia',
    scheduledDate: isoDaysFromNow(1),
    startTime: '13:00',
    endTime: '13:45',
    location: 'Ruang Rapat Lt. 2',
  },
  reviewFeed: [
    {
      id: 'mock-r1',
      status: 'IN_PROGRESS',
      overallComment: 'Menunggu tanggapan revisi arsitektur dari tim.',
      updatedAt: isoDaysFromNow(-1, 15),
      projectId: 'mock-1',
      projectTitle: 'Sistem Rekomendasi UMKM Makassar',
      mahasiswaName: 'Aldi Pratama',
      commentCount: 5,
    },
    {
      id: 'mock-r2',
      status: 'COMPLETED',
      overallComment: 'Review selesai — siap dijadwalkan presentasi.',
      updatedAt: isoDaysFromNow(-2, 11),
      projectId: 'mock-2',
      projectTitle: 'Monitoring Klinik Digital',
      mahasiswaName: 'Nisa Aulia',
      commentCount: 3,
    },
  ],
};

// ---------- Admin ----------
export const MOCK_ADMIN = {
  stats: {
    totalUsers: 226,
    totalMahasiswa: 215,
    totalDosen: 10,
    totalProjects: 128,
    submittedProjects: 96,
    completedReviews: 74,
  },
  recentUsers: [
    { id: 'mock-u1', name: 'Aldi Pratama', username: '10582001', role: 'MAHASISWA', createdAt: isoDaysFromNow(-1, 8) },
    { id: 'mock-u2', name: 'Nisa Aulia', username: '10582002', role: 'MAHASISWA', createdAt: isoDaysFromNow(-2, 9) },
    { id: 'mock-u3', name: 'Dr. Andi Rahman', username: '0901018801', role: 'DOSEN_PENGUJI', createdAt: isoDaysFromNow(-3, 10) },
    { id: 'mock-u4', name: 'Budi Santoso', username: '10582003', role: 'MAHASISWA', createdAt: isoDaysFromNow(-4, 13) },
  ],
  recentProjects: [
    {
      id: 'mock-1',
      title: 'Sistem Rekomendasi UMKM Makassar',
      status: 'IN_REVIEW',
      semester: 'Ganjil',
      tahunAkademik: '2025/2026',
      mahasiswaName: 'Aldi Pratama',
    },
    {
      id: 'mock-2',
      title: 'Monitoring Klinik Digital',
      status: 'READY_FOR_PRESENTATION',
      semester: 'Ganjil',
      tahunAkademik: '2025/2026',
      mahasiswaName: 'Nisa Aulia',
    },
    {
      id: 'mock-3',
      title: 'Marketplace Hasil Tani',
      status: 'SUBMITTED',
      semester: 'Ganjil',
      tahunAkademik: '2025/2026',
      mahasiswaName: 'Budi Santoso',
    },
  ],
  activity: () => mockActivity([1, 2, 0, 4, 3, 1, 2]),
  upcomingPresentation: {
    projectTitle: 'Monitoring Klinik Digital',
    mahasiswaName: 'Nisa Aulia',
    scheduledDate: isoDaysFromNow(1),
    startTime: '13:00',
    endTime: '13:45',
    location: 'Ruang Rapat Lt. 2',
    scheduledBy: 'Admin Prodi',
  },
};
