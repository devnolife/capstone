import type { Metadata } from 'next';
import { DosenDashboardContent } from '@/components/dosen/dashboard-content';
import { MOCK_DOSEN } from '@/lib/mock-dashboard';

export const metadata: Metadata = {
  title: 'Preview Dashboard Dosen - Capstone',
  robots: { index: false },
};

/** Preview publik dashboard dosen dengan data mock (tanpa login). */
export default function DemoDosenPage() {
  return (
    <main className="min-h-screen px-4 py-6 md:px-6">
      <DosenDashboardContent
        userName="Dr. Andi Rahman"
        stats={MOCK_DOSEN.stats}
        projects={MOCK_DOSEN.projects}
        activity={MOCK_DOSEN.activity()}
        upcomingPresentation={MOCK_DOSEN.upcomingPresentation}
        reviewFeed={MOCK_DOSEN.reviewFeed}
      />
    </main>
  );
}
