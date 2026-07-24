import type { Metadata } from 'next';
import { AdminDashboardContent } from '@/components/admin/dashboard-content';
import { MOCK_ADMIN } from '@/lib/mock-dashboard';

export const metadata: Metadata = {
  title: 'Preview Dashboard Admin - Capstone',
  robots: { index: false },
};

/** Preview publik dashboard admin dengan data mock (tanpa login). */
export default function DemoAdminPage() {
  return (
    <main className="min-h-screen px-4 py-6 md:px-6">
      <AdminDashboardContent
        userName="Admin Prodi"
        stats={MOCK_ADMIN.stats}
        recentUsers={MOCK_ADMIN.recentUsers}
        recentProjects={MOCK_ADMIN.recentProjects}
        activity={MOCK_ADMIN.activity()}
        upcomingPresentation={MOCK_ADMIN.upcomingPresentation}
      />
    </main>
  );
}
