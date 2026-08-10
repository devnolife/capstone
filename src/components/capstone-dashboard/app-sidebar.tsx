'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { NavUser } from '@/components/capstone-dashboard/nav-user';
import {
  ACCENT_TEXT,
  type AccentName,
} from '@/components/capstone-dashboard/accent';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  LayoutDashboardIcon,
  FolderGitIcon,
  MessagesSquareIcon,
  FileTextIcon,
  CalendarClockIcon,
  ClipboardCheckIcon,
  UsersIcon,
  BellIcon,
  Settings2Icon,
  CircleHelpIcon,
} from 'lucide-react';

type NavItem = {
  title: string;
  url: string;
  icon: React.ReactNode;
  accent: AccentName;
  active?: boolean;
  badge?: string;
};

const navUtama: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/demo/dashboard',
    icon: <LayoutDashboardIcon />,
    accent: 'brand',
    active: true,
  },
  { title: 'Project', url: '#', icon: <FolderGitIcon />, accent: 'info' },
  {
    title: 'Review',
    url: '#',
    icon: <MessagesSquareIcon />,
    accent: 'highlight',
    badge: '3',
  },
  { title: 'Dokumen', url: '#', icon: <FileTextIcon />, accent: 'success' },
];

const navAkademik: NavItem[] = [
  {
    title: 'Jadwal Sidang',
    url: '#',
    icon: <CalendarClockIcon />,
    accent: 'rose',
  },
  {
    title: 'Penilaian',
    url: '#',
    icon: <ClipboardCheckIcon />,
    accent: 'warning',
  },
  { title: 'Tim', url: '#', icon: <UsersIcon />, accent: 'orange' },
];

const navLainnya: NavItem[] = [
  { title: 'Notifikasi', url: '#', icon: <BellIcon />, accent: 'rose', badge: '5' },
  { title: 'Pengaturan', url: '#', icon: <Settings2Icon />, accent: 'info' },
  { title: 'Bantuan', url: '#', icon: <CircleHelpIcon />, accent: 'success' },
];

/* Menu 40px, teks 15px. Ikon memakai warna aksen per item (menggantikan abu),
   item aktif = pill tint brand + garis kiri. Collapsed icon-mode pakai metrik bawaan. */
const menuButtonBase =
  'h-10 gap-3 rounded-lg px-3 text-[15px] font-medium text-sidebar-foreground/85 [&_svg]:size-[18px] data-active:relative data-active:bg-brand/12 data-active:text-brand data-active:before:absolute data-active:before:left-0 data-active:before:top-1/2 data-active:before:h-5 data-active:before:w-[3px] data-active:before:-translate-y-1/2 data-active:before:rounded-full data-active:before:bg-brand group-data-[collapsible=icon]:[&_svg]:size-4 group-data-[collapsible=icon]:before:hidden group-data-[collapsible=icon]:rounded-md';

const badgeClass =
  'top-2.5 right-2 h-5 min-w-5 rounded-full bg-rose/15 font-mono text-[11px] text-rose';

function NavGroup({ label, items }: { label?: string; items: NavItem[] }) {
  return (
    <SidebarGroup>
      {label ? (
        <SidebarGroupLabel className="px-3 font-mono text-[11px] tracking-[0.08em] uppercase">
          {label}
        </SidebarGroupLabel>
      ) : null}
      <SidebarGroupContent>
        <SidebarMenu className="gap-1">
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                isActive={item.active}
                tooltip={item.title}
                className={menuButtonBase}
                render={<Link href={item.url} />}
              >
                <span className={cn('flex shrink-0 items-center justify-center', ACCENT_TEXT[item.accent])}>
                  {item.icon}
                </span>
                <span>{item.title}</span>
              </SidebarMenuButton>
              {item.badge ? (
                <SidebarMenuBadge className={badgeClass}>
                  {item.badge}
                </SidebarMenuBadge>
              ) : null}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader className="pb-1">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="h-12 gap-3 rounded-lg px-2 data-[slot=sidebar-menu-button]:p-1.5!"
              render={<Link href="/" />}
            >
              <span className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white p-0.5 ring-1 ring-border group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:rounded-md">
                <Image
                  src="/logo.png"
                  alt="Logo Prodi Informatika"
                  width={32}
                  height={32}
                  className="size-full object-contain"
                />
              </span>
              <span className="flex flex-col leading-none group-data-[collapsible=icon]:hidden">
                <span className="flex items-baseline font-mono text-[17px] tracking-tight">
                  <span className="font-semibold">capstone</span>
                  <span className="text-brand">.if</span>
                </span>
                <span className="mt-1 text-[11px] text-muted-foreground">
                  Prodi Informatika
                </span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavGroup items={navUtama} />
        <NavGroup label="Akademik" items={navAkademik} />
        <NavGroup label="Lainnya" items={navLainnya} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: 'Andi Pratama',
            id: '105841100121',
            role: 'Mahasiswa',
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
