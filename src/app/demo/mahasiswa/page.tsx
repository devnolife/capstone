import type { Metadata } from 'next';
import { MahasiswaDashboardContent } from '@/components/mahasiswa/dashboard-content';
import { MOCK_MAHASISWA } from '@/lib/mock-dashboard';

export const metadata: Metadata = {
  title: 'Preview Dashboard Mahasiswa - Capstone',
  robots: { index: false },
};

/** Preview publik dashboard mahasiswa dengan data mock (tanpa login). */
export default function DemoMahasiswaPage() {
  return (
    <main className="min-h-screen px-4 py-6 md:px-6">
      <MahasiswaDashboardContent
        userName="Aldi Pratama"
        hasGitHubConnected={MOCK_MAHASISWA.hasGitHubConnected}
        githubUsername={MOCK_MAHASISWA.githubUsername}
        stats={MOCK_MAHASISWA.stats}
        projects={MOCK_MAHASISWA.projects}
        activity={MOCK_MAHASISWA.activity()}
        upcomingPresentation={MOCK_MAHASISWA.upcomingPresentation}
        reviews={MOCK_MAHASISWA.reviews}
      />
    </main>
  );
}
