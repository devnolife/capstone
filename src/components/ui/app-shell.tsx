'use client';

import * as React from 'react';

import { AppShellSidebar, type ShellUser } from '@/components/ui/app-shell-sidebar';
import { Header } from '@/components/ui/header';
import { MobileBottomNav } from '@/components/ui/mobile-bottom-nav';
import {
  SidebarInset,
  SidebarProvider,
  useSidebar,
} from '@/components/ui/sidebar';

/* Header butuh akses context sidebar, jadi harus berada di dalam provider. */
function ShellHeader() {
  const { toggleSidebar } = useSidebar();
  return <Header onMenuClick={toggleSidebar} />;
}

export function AppShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user?: ShellUser;
}) {
  return (
    <SidebarProvider
      className="h-svh overflow-hidden"
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppShellSidebar user={user} />
      <SidebarInset className="min-h-0 overflow-hidden">
        <ShellHeader />
        <div className="flex-1 overflow-y-auto p-4 pb-24 md:p-6 md:pb-6">
          {children}
        </div>
      </SidebarInset>
      <MobileBottomNav />
    </SidebarProvider>
  );
}
