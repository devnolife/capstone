'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Button,
  Avatar,
  Tooltip,
} from '@heroui/react';
import {
  LayoutDashboard,
  FolderGit2,
  Users,
  ClipboardCheck,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  UserCog,
  BookOpen,
  X,
  Menu,
  Mail,
  Bot,
  BarChart3,
  CalendarCheck,
} from 'lucide-react';
import { cn, getSimakPhotoUrl } from '@/lib/utils';

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

interface SidebarSection {
  label: string;
  items: SidebarItem[];
}

const mahasiswaSections: SidebarSection[] = [
  {
    label: 'Ringkasan',
    items: [
      { title: 'Dashboard', href: '/mahasiswa/dashboard', icon: <LayoutDashboard size={18} /> },
    ],
  },
  {
    label: 'Proyek',
    items: [
      { title: 'Project Saya', href: '/mahasiswa/projects', icon: <FolderGit2 size={18} /> },
      { title: 'Persyaratan', href: '/mahasiswa/persyaratan', icon: <BookOpen size={18} /> },
    ],
  },
  {
    label: 'Tim & Review',
    items: [
      { title: 'Undangan Tim', href: '/mahasiswa/invitations', icon: <Mail size={18} /> },
      { title: 'Review & Feedback', href: '/mahasiswa/reviews', icon: <ClipboardCheck size={18} /> },
      { title: 'Jadwal Presentasi', href: '/mahasiswa/presentations', icon: <CalendarCheck size={18} /> },
    ],
  },
];

const dosenSections: SidebarSection[] = [
  {
    label: 'Ringkasan',
    items: [
      { title: 'Dashboard', href: '/dosen/dashboard', icon: <LayoutDashboard size={18} /> },
    ],
  },
  {
    label: 'Penilaian',
    items: [
      { title: 'Project Mahasiswa', href: '/dosen/projects', icon: <FolderGit2 size={18} /> },
      { title: 'Review', href: '/dosen/reviews', icon: <ClipboardCheck size={18} /> },
      { title: 'Auto Review', href: '/dosen/auto-review', icon: <Bot size={18} /> },
    ],
  },
  {
    label: 'Analitik',
    items: [
      { title: 'Statistik', href: '/dosen/statistics', icon: <BarChart3 size={18} /> },
    ],
  },
];

const adminSections: SidebarSection[] = [
  {
    label: 'Ringkasan',
    items: [
      { title: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard size={18} /> },
    ],
  },
  {
    label: 'Akademik',
    items: [
      { title: 'Semua Project', href: '/admin/projects', icon: <FolderGit2 size={18} /> },
      { title: 'Jadwal Presentasi', href: '/admin/presentations', icon: <CalendarCheck size={18} /> },
      { title: 'Penugasan Dosen', href: '/admin/assignments', icon: <UserCog size={18} /> },
    ],
  },
  {
    label: 'Konfigurasi',
    items: [
      { title: 'Manajemen User', href: '/admin/users', icon: <Users size={18} /> },
      { title: 'Rubrik Penilaian', href: '/admin/rubrik', icon: <BookOpen size={18} /> },
      { title: 'Semester', href: '/admin/semesters', icon: <GraduationCap size={18} /> },
    ],
  },
];

interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

const DASHBOARD_PATHS = new Set([
  '/admin/dashboard',
  '/dosen/dashboard',
  '/mahasiswa/dashboard',
]);

function getDashboardUrl(role?: string): string {
  switch (role) {
    case 'ADMIN':
      return '/admin/dashboard';
    case 'DOSEN_PENGUJI':
      return '/dosen/dashboard';
    case 'MAHASISWA':
      return '/mahasiswa/dashboard';
    default:
      return '/';
  }
}

export function Sidebar({ isMobileOpen, onMobileClose }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  const userRole = session?.user?.role;

  const sections =
    userRole === 'ADMIN'
      ? adminSections
      : userRole === 'DOSEN_PENGUJI'
        ? dosenSections
        : mahasiswaSections;

  const roleLabel =
    userRole === 'ADMIN'
      ? 'Administrator'
      : userRole === 'DOSEN_PENGUJI'
        ? 'Dosen Penguji'
        : 'Mahasiswa';

  const dashboardUrl = getDashboardUrl(userRole);

  useEffect(() => {
    if (onMobileClose) {
      onMobileClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const isItemActive = (href: string) =>
    pathname === href || (!DASHBOARD_PATHS.has(href) && pathname.startsWith(href));

  const renderItem = (item: SidebarItem) => {
    const isActive = isItemActive(item.href);

    const link = (
      <Link
        href={item.href}
        className={cn(
          'flex items-center gap-2.5 px-3 h-9 rounded-xl text-sm transition-colors',
          isActive
            ? 'bg-[var(--color-obsidian)] text-white font-semibold dark:bg-white dark:text-zinc-900'
            : 'text-[var(--color-steel)] hover:bg-[var(--color-fog)] hover:text-[var(--color-obsidian)] dark:hover:bg-zinc-800 dark:hover:text-white',
          isCollapsed && 'justify-center px-0 w-9 mx-auto',
        )}
        onClick={onMobileClose}
      >
        <span className="shrink-0">{item.icon}</span>
        {!isCollapsed && <span className="truncate">{item.title}</span>}
      </Link>
    );

    return (
      <div key={item.href}>
        {isCollapsed ? (
          <Tooltip content={item.title} placement="right" delay={300}>
            {link}
          </Tooltip>
        ) : (
          link
        )}
      </div>
    );
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div
        className={cn(
          'flex items-center h-14 px-3 border-b border-[var(--color-pebble)] dark:border-[var(--color-graphite)]',
          isCollapsed ? 'justify-center' : 'justify-start gap-2.5',
        )}
      >
        <Link href={dashboardUrl} className="flex items-center gap-2.5 min-w-0">
          <Image
            src="/logo.png"
            alt="Capstone"
            width={32}
            height={32}
            className="object-contain shrink-0"
          />
          {!isCollapsed && (
            <div className="min-w-0">
              <p className="font-sans-display font-bold tracking-tight text-sm text-[var(--color-obsidian)] dark:text-white leading-tight truncate">
                Capstone
              </p>
              <p className="font-mono-display text-[9px] uppercase tracking-widest font-bold text-[var(--color-steel)] leading-tight truncate">
                Prodi Informatika
              </p>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <div className="space-y-4">
          {sections.map((section, sectionIdx) => (
            <div key={section.label}>
              {!isCollapsed && (
                <p className="font-mono-display text-[9px] font-bold text-[var(--color-steel)] uppercase tracking-widest px-3 mb-1.5">
                  {section.label}
                </p>
              )}
              {isCollapsed && sectionIdx > 0 && (
                <div className="h-px bg-divider/50 mx-2 mb-2" />
              )}
              <div className="space-y-0.5">{section.items.map(renderItem)}</div>
            </div>
          ))}
        </div>
      </nav>

      {/* User Section */}
      <div className="p-2 border-t border-[var(--color-pebble)] dark:border-[var(--color-graphite)]">
        {isCollapsed ? (
          <Tooltip content={session?.user?.name || 'User'} placement="right">
            <div className="flex justify-center py-1">
              <Avatar
                src={
                  getSimakPhotoUrl((session?.user as { nim?: string })?.nim) ||
                  session?.user?.image ||
                  undefined
                }
                name={session?.user?.name || 'User'}
                size="sm"
              />
            </div>
          </Tooltip>
        ) : (
          <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg">
            <Avatar
              src={
                getSimakPhotoUrl((session?.user as { nim?: string })?.nim) ||
                session?.user?.image ||
                undefined
              }
              name={session?.user?.name || 'User'}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate text-[var(--color-obsidian)] dark:text-white">
                {session?.user?.name}
              </p>
              <p className="font-mono-display text-[9px] uppercase tracking-widest font-bold text-[var(--color-steel)] truncate">{roleLabel}</p>
            </div>
          </div>
        )}

        {/* Collapse Toggle - Desktop Only */}
        <div className="hidden md:block pt-2 mt-2 border-t border-[var(--color-pebble)] dark:border-[var(--color-graphite)]">
          {isCollapsed ? (
            <Tooltip content="Perluas" placement="right">
              <Button
                isIconOnly
                variant="light"
                size="sm"
                className="w-full h-8"
                onPress={() => setIsCollapsed(false)}
              >
                <ChevronRight size={16} />
              </Button>
            </Tooltip>
          ) : (
            <Button
              variant="light"
              size="sm"
              className="w-full justify-between h-8 text-default-500"
              onPress={() => setIsCollapsed(true)}
              endContent={<ChevronLeft size={14} />}
            >
              <span className="text-[11px]">Ciutkan</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block h-screen">
        <aside
          className={cn(
            'flex flex-col h-full bg-[var(--color-mist)] dark:bg-zinc-950 border-r border-[var(--color-pebble)] dark:border-[var(--color-graphite)] transition-[width] duration-200 overflow-hidden',
            isCollapsed ? 'w-[60px]' : 'w-60',
          )}
        >
          {sidebarContent}
        </aside>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={onMobileClose}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 bg-[var(--color-mist)] dark:bg-zinc-950 transition-transform duration-200 ease-out md:hidden',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="absolute top-3 right-3">
          <Button
            isIconOnly
            variant="flat"
            size="sm"
            onPress={onMobileClose}
            className="rounded-full"
          >
            <X size={16} />
          </Button>
        </div>
        {sidebarContent}
      </aside>
    </>
  );
}

// Mobile menu button component to be used in header
export function MobileMenuButton({ onPress }: { onPress: () => void }) {
  return (
    <Button
      isIconOnly
      variant="light"
      size="sm"
      onPress={onPress}
      className="md:hidden"
    >
      <Menu size={24} />
    </Button>
  );
}
