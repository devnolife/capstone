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

/** Widget progres semester berjalan (di atas kartu user). */
function SemesterWidget() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
  }, []);

  if (!now) return null;

  const month = now.getMonth(); // 0-11
  const year = now.getFullYear();
  const isGanjil = month >= 7 || month === 0; // Agu-Jan
  const semester = isGanjil ? 'Ganjil' : 'Genap';
  const tahunAkademik = isGanjil
    ? month === 0
      ? `${year - 1}/${year}`
      : `${year}/${year + 1}`
    : `${year - 1}/${year}`;

  // Perkiraan progres semester (24 pekan sejak awal Sep / awal Mar)
  const start = isGanjil
    ? new Date(month === 0 ? year - 1 : year, 8, 1)
    : new Date(year, 2, 1);
  const weeks = Math.floor((now.getTime() - start.getTime()) / (7 * 86400000)) + 1;
  const pct = Math.min(100, Math.max(4, Math.round((weeks / 24) * 100)));

  return (
    <div className="px-3 pb-2">
      <div className="rounded-xl border border-border bg-app-quinary px-3 py-2.5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[9px] text-app-teritary-invert uppercase tracking-[0.18em]">
            Semester {semester}
          </span>
          <span className="font-mono text-[9px] text-app-teritary-invert tabular-nums">
            {tahunAkademik}
          </span>
        </div>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-app-primary">
          <div
            className="bg-primary h-full rounded-full transition-[width] duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-app-teritary-invert mt-1.5 text-[10px] tabular-nums">
          Pekan ke-{Math.max(1, weeks)} · ±{pct}% berjalan
        </p>
      </div>
    </div>
  );
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
          'group/nav relative flex items-center gap-2.5 px-3.5 h-9 rounded-full text-sm transition-all',
          isActive
            ? 'bg-app-primary text-foreground font-medium'
            : 'text-app-secondary-invert hover:bg-app-quaternary hover:text-foreground hover:translate-x-0.5',
          isCollapsed && 'justify-center px-0 w-9 mx-auto hover:translate-x-0',
        )}
        onClick={onMobileClose}
      >
        <span
          className={cn(
            'shrink-0 transition-colors',
            isActive ? 'text-foreground' : 'text-app-teritary-invert group-hover/nav:text-foreground',
          )}
        >
          {item.icon}
        </span>
        {!isCollapsed && <span className="truncate">{item.title}</span>}
        {!isCollapsed && isActive && (
          <span className="bg-primary ml-auto size-1.5 shrink-0 rounded-full" />
        )}
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
          'flex items-center h-14 px-4 shrink-0',
          isCollapsed ? 'justify-center px-0' : 'justify-start gap-2.5',
        )}
      >
        <Link href={dashboardUrl} className="flex items-center gap-2.5 min-w-0">
          <span className="bg-app-primary flex size-8 shrink-0 items-center justify-center rounded-lg">
            <Image
              src="/logo.png"
              alt="Capstone"
              width={20}
              height={20}
              className="object-contain shrink-0"
            />
          </span>
          {!isCollapsed && (
            <span className="min-w-0">
              <span className="font-editorial block text-lg leading-none tracking-tight text-foreground truncate">
                capstone
              </span>
              <span className="font-mono text-[8px] text-app-teritary-invert uppercase tracking-[0.22em] block mt-0.5 truncate">
                Prodi Informatika
              </span>
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <div className="space-y-4">
          {sections.map((section, sectionIdx) => (
            <div key={section.label}>
              {!isCollapsed && (
                <div className="mb-1.5 flex items-center gap-2 px-3.5">
                  <p className="font-mono text-[10px] text-app-teritary-invert uppercase tracking-[0.18em] shrink-0">
                    {section.label}
                  </p>
                  <span className="h-px flex-1 bg-border" />
                </div>
              )}
              {isCollapsed && sectionIdx > 0 && (
                <div className="h-px bg-border mx-2 mb-2" />
              )}
              <div className="space-y-0.5">{section.items.map(renderItem)}</div>
            </div>
          ))}
        </div>
      </nav>

      {/* Semester progress */}
      {!isCollapsed && <SemesterWidget />}

      {/* User Section */}
      <div className="p-2 pt-0">
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
          <Link
            href={dashboardUrl.replace('/dashboard', '/profile')}
            className="flex items-center gap-2.5 rounded-xl border border-border bg-app-quinary px-2.5 py-2 transition-colors hover:bg-app-quaternary"
          >
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
              <p className="text-xs font-semibold truncate text-foreground">
                {session?.user?.name}
              </p>
              <p className="font-mono text-[9px] text-app-teritary-invert uppercase tracking-[0.18em] truncate">
                {roleLabel}
              </p>
            </div>
            <span className="size-1.5 shrink-0 animate-pulse rounded-full bg-green-500" title="Online" />
          </Link>
        )}

        {/* Collapse Toggle - Desktop Only */}
        <div className="hidden md:block pt-1 mt-1">
          {isCollapsed ? (
            <Tooltip content="Perluas" placement="right">
              <button
                type="button"
                onClick={() => setIsCollapsed(false)}
                className="text-app-secondary-invert hover:bg-app-quaternary hover:text-foreground flex h-8 w-full items-center justify-center rounded-full transition-colors"
              >
                <ChevronRight size={15} />
              </button>
            </Tooltip>
          ) : (
            <button
              type="button"
              onClick={() => setIsCollapsed(true)}
              className="text-app-teritary-invert hover:bg-app-quaternary hover:text-foreground flex h-8 w-full items-center justify-between rounded-full px-3 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors"
            >
              <span>Ciutkan</span>
              <ChevronLeft size={13} />
            </button>
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
            'flex flex-col h-full bg-transparent transition-[width] duration-200 overflow-hidden',
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
          'fixed inset-y-0 left-0 z-50 w-72 bg-background border-r border-border transition-transform duration-200 ease-out md:hidden',
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
