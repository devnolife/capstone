'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/ui/sidebar';
import { Header } from '@/components/ui/header';
import { MobileBottomNav } from '@/components/ui/mobile-bottom-nav';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden bg-background">
          <Header onMenuClick={() => setIsMobileSidebarOpen(true)} />
          <main id="main-content" className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6">
            {children}
          </main>
        </div>
      </div>
      <MobileBottomNav />
    </div>
  );
}
