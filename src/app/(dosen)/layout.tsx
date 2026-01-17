'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/ui/sidebar';
import { Header } from '@/components/ui/header';
import { MobileBottomNav } from '@/components/ui/mobile-bottom-nav';

export default function DosenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-default-100/50 dark:bg-default-50/50">
      <Sidebar 
        isMobileOpen={isMobileSidebarOpen} 
        onMobileClose={() => setIsMobileSidebarOpen(false)} 
      />
      <div className="flex-1 flex flex-col overflow-hidden md:py-3 md:pr-3">
        <div className="flex-1 flex flex-col overflow-hidden bg-background md:rounded-3xl md:shadow-sm md:border md:border-divider/50">
          <Header onMenuClick={() => setIsMobileSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6">
            {children}
          </main>
        </div>
      </div>
      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
