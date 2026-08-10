import type { Metadata } from 'next';

import { AppSidebar } from '@/components/capstone-dashboard/app-sidebar';
import { ActivityChart } from '@/components/capstone-dashboard/activity-chart';
import { ProjectsTable } from '@/components/capstone-dashboard/projects-table';
import { SidePanel } from '@/components/capstone-dashboard/side-panel';
import { SiteHeader } from '@/components/capstone-dashboard/site-header';
import { StatCards } from '@/components/capstone-dashboard/stat-cards';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export const metadata: Metadata = {
  title: 'Dashboard - Capstone Informatika',
  description:
    'Dashboard platform capstone project Prodi Informatika. Pantau project, review, dan jadwal sidang.',
};

export default function DashboardPreviewPage() {
  return (
    // Mengikuti tema global (next-themes): toggle light/dark ada di header
    <div className="bg-background text-foreground">
      <SidebarProvider
        style={
          {
            '--sidebar-width': 'calc(var(--spacing) * 72)',
            '--header-height': 'calc(var(--spacing) * 12)',
          } as React.CSSProperties
        }
      >
        <AppSidebar />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <StatCards />
                <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @5xl/main:grid-cols-[2fr_1fr]">
                  <div className="flex flex-col gap-4">
                    <ActivityChart />
                    <ProjectsTable />
                  </div>
                  <SidePanel />
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
