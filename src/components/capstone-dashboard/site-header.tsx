'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/capstone-dashboard/theme-toggle';
import { PlusIcon } from 'lucide-react';

export function SiteHeader() {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-2 px-4 lg:gap-3 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-1 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">Dashboard</h1>
        <Badge
          variant="outline"
          className="hidden border-brand/35 bg-brand/12 text-brand sm:inline-flex"
        >
          Ganjil 2025/2026
        </Badge>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Button
            size="sm"
            className="bg-brand text-brand-foreground hover:bg-brand/90"
          >
            <PlusIcon data-icon="inline-start" />
            <span className="hidden sm:inline">Project Baru</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
