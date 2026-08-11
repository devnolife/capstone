'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

import { NavUser } from '@/components/capstone-dashboard/nav-user';
import {
  ACCENT_TEXT,
  type AccentName,
} from '@/components/capstone-dashboard/accent';
import { cn, getSimakPhotoUrl } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  FolderGit2,
  MessagesSquare,
  FileText,
  CalendarCheck,
  ClipboardCheck,
  Users,
  Bell,
  Settings,
  BookOpen,
  Mail,
  Bot,
  BarChart3,
  UserCog,
  GraduationCap,
} from 'lucide-react';

type NavItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: AccentName;
};

type NavGroupDef = {
  label?: string;
  items: NavItem[];
};

const mahasiswaGroups: NavGroupDef[] = [
  {
    items: [
      { title: 'Dashboard', href: '/mahasiswa/dashboard', icon: LayoutDashboard, accent: 'brand' },
      { title: 'Project Saya', href: '/mahasiswa/project', icon: FolderGit2, accent: 'info' },
    ],
  },
  {
    label: 'Lainnya',
    items: [
      { title: 'Notifikasi', href: '/mahasiswa/notifications', icon: Bell, accent: 'rose' },
      { title: 'Pengaturan', href: '/mahasiswa/settings', icon: Settings, accent: 'info' },
    ],
  },
];

const dosenGroups: NavGroupDef[] = [
  {
    items: [
      { title: 'Dashboard', href: '/dosen/dashboard', icon: LayoutDashboard, accent: 'brand' },
      { title: 'Project Mahasiswa', href: '/dosen/projects', icon: FolderGit2, accent: 'info' },
      { title: 'Review', href: '/dosen/reviews', icon: MessagesSquare, accent: 'highlight' },
      { title: 'Auto Review', href: '/dosen/auto-review', icon: Bot, accent: 'success' },
    ],
  },
  {
    label: 'Akademik',
    items: [
      { title: 'Statistik', href: '/dosen/statistics', icon: BarChart3, accent: 'warning' },
    ],
  },
  {
    label: 'Lainnya',
    items: [
      { title: 'Notifikasi', href: '/dosen/notifications', icon: Bell, accent: 'rose' },
      { title: 'Pengaturan', href: '/dosen/settings', icon: Settings, accent: 'info' },
    ],
  },
];

const adminGroups: NavGroupDef[] = [
  {
    items: [
      { title: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, accent: 'brand' },
      { title: 'Semua Project', href: '/admin/projects', icon: FolderGit2, accent: 'info' },
      { title: 'Manajemen User', href: '/admin/users', icon: Users, accent: 'highlight' },
    ],
  },
  {
    label: 'Akademik',
    items: [
      { title: 'Jadwal Presentasi', href: '/admin/presentations', icon: CalendarCheck, accent: 'rose' },
      { title: 'Penugasan Dosen', href: '/admin/assignments', icon: UserCog, accent: 'orange' },
      { title: 'Rubrik Penilaian', href: '/admin/rubrik', icon: ClipboardCheck, accent: 'warning' },
      { title: 'Semester', href: '/admin/semesters', icon: GraduationCap, accent: 'success' },
    ],
  },
  {
    label: 'Lainnya',
    items: [
      { title: 'Notifikasi', href: '/admin/notifications', icon: Bell, accent: 'rose' },
      { title: 'Pengaturan', href: '/admin/settings', icon: Settings, accent: 'info' },
    ],
  },
];

/* Rute yang harus cocok persis agar tidak ikut aktif saat berada di sub-halaman. */
const EXACT_MATCH_PATHS = new Set([
  '/admin/dashboard',
  '/dosen/dashboard',
  '/mahasiswa/dashboard',
  '/admin/notifications',
  '/dosen/notifications',
  '/mahasiswa/notifications',
  '/admin/settings',
  '/dosen/settings',
  '/mahasiswa/settings',
]);

/* Menu 40px, teks 15px. Ikon memakai warna aksen per item (menggantikan abu),
   item aktif = pill tint brand + garis kiri. Collapsed icon-mode pakai metrik bawaan. */
const menuButtonBase =
  'h-10 gap-3 rounded-lg px-3 text-[15px] font-medium text-sidebar-foreground/85 [&_svg]:size-[18px] data-active:relative data-active:bg-brand/12 data-active:text-brand data-active:before:absolute data-active:before:left-0 data-active:before:top-1/2 data-active:before:h-5 data-active:before:w-[3px] data-active:before:-translate-y-1/2 data-active:before:rounded-full data-active:before:bg-brand group-data-[collapsible=icon]:[&_svg]:size-4 group-data-[collapsible=icon]:before:hidden group-data-[collapsible=icon]:rounded-md';

function getBasePath(role?: string): string {
  switch (role) {
    case 'ADMIN':
      return '/admin';
    case 'DOSEN_PENGUJI':
      return '/dosen';
    default:
      return '/mahasiswa';
  }
}

function getRoleLabel(role?: string): string {
  switch (role) {
    case 'ADMIN':
      return 'Administrator';
    case 'DOSEN_PENGUJI':
      return 'Dosen Penguji';
    default:
      return 'Mahasiswa';
  }
}

function getGroups(role?: string): NavGroupDef[] {
  switch (role) {
    case 'ADMIN':
      return adminGroups;
    case 'DOSEN_PENGUJI':
      return dosenGroups;
    default:
      return mahasiswaGroups;
  }
}

export type ShellUser = {
  name: string;
  identifier: string;
  role?: string;
  image?: string;
};

function NavGroup({
  label,
  items,
  isActive,
  onNavigate,
}: {
  label?: string;
  items: NavItem[];
  isActive: (href: string) => boolean;
  onNavigate: () => void;
}) {
  return (
    <SidebarGroup>
      {label ? (
        <SidebarGroupLabel className="px-3 font-mono text-[11px] tracking-[0.08em] uppercase">
          {label}
        </SidebarGroupLabel>
      ) : null}
      <SidebarGroupContent>
        <SidebarMenu className="gap-1">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  isActive={isActive(item.href)}
                  tooltip={item.title}
                  className={menuButtonBase}
                  render={<Link href={item.href} onClick={onNavigate} />}
                >
                  <span
                    className={cn(
                      'flex shrink-0 items-center justify-center',
                      ACCENT_TEXT[item.accent],
                    )}
                  >
                    <Icon />
                  </span>
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AppShellSidebar({
  user: initialUser,
  ...props
}: React.ComponentProps<typeof Sidebar> & { user?: ShellUser }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { isMobile, setOpenMobile } = useSidebar();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const sessionUser = session?.user as
    | { name?: string | null; image?: string | null; nim?: string; username?: string; role?: string }
    | undefined;

  /* Data dari server dipakai lebih dulu supaya menu sesuai peran sejak render
     pertama; sesi klien menjadi sumber kebenaran setelah hydration. */
  const name = sessionUser?.name || initialUser?.name || 'Pengguna';
  const identifier =
    sessionUser?.nim || sessionUser?.username || initialUser?.identifier || '-';
  const image =
    getSimakPhotoUrl(sessionUser?.nim ?? initialUser?.identifier) ||
    sessionUser?.image ||
    initialUser?.image ||
    undefined;
  const role = sessionUser?.role ?? initialUser?.role;

  const groups = getGroups(role);
  const basePath = getBasePath(role);
  const roleLabel = getRoleLabel(role);

  const isActive = React.useCallback(
    (href: string) =>
      pathname === href ||
      (!EXACT_MATCH_PATHS.has(href) && pathname.startsWith(`${href}/`)),
    [pathname],
  );

  /* Tutup drawer setelah pindah halaman di mobile. */
  const handleNavigate = React.useCallback(() => {
    if (isMobile) setOpenMobile(false);
  }, [isMobile, setOpenMobile]);

  const handleLogout = React.useCallback(async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      if (typeof window !== 'undefined') sessionStorage.clear();
      await signOut({ callbackUrl: '/', redirect: true });
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/';
    }
  }, [isLoggingOut]);

  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader className="pb-1">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="h-12 gap-3 rounded-lg px-2 data-[slot=sidebar-menu-button]:p-1.5!"
              render={
                <Link href={`${basePath}/dashboard`} onClick={handleNavigate} />
              }
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
        {groups.map((group, index) => (
          <NavGroup
            key={group.label ?? `utama-${index}`}
            label={group.label}
            items={group.items}
            isActive={isActive}
            onNavigate={handleNavigate}
          />
        ))}
      </SidebarContent>

      <SidebarFooter>
        <NavUser
          user={{
            name,
            id: identifier,
            role: roleLabel,
          }}
          avatarSrc={image}
          profileHref={`${basePath}/profile`}
          githubHref="/link-github/callback"
          notificationsHref={`${basePath}/notifications`}
          onLogout={handleLogout}
          isLoggingOut={isLoggingOut}
        />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
