'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/shell/sidebar';
import { Header } from '@/components/shell/header';
import { MobileBottomNav } from '@/components/shell/mobile-bottom-nav';

export default function DosenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-canvas">
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />
      <div className="flex flex-1 flex-col overflow-hidden p-2 md:pl-0">
        <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
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
