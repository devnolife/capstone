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
  FileText,
  Users,
  ClipboardCheck,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  UserCog,
  BookOpen,
  GitBranch,
  X,
  Menu,
  Mail,
  Bot,
} from 'lucide-react';
import { cn, getSimakPhotoUrl } from '@/lib/utils';

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

const mahasiswaMenuItems: SidebarItem[] = [
  {
    title: 'Dashboard',
    href: '/mahasiswa/dashboard',
    icon: <LayoutDashboard size={20} />,
  },
  {
    title: 'Project Saya',
    href: '/mahasiswa/projects',
    icon: <FolderGit2 size={20} />,
  },
  {
    title: 'Undangan Tim',
    href: '/mahasiswa/invitations',
    icon: <Mail size={20} />,
  },
  {
    title: 'Persyaratan',
    href: '/mahasiswa/persyaratan',
    icon: <BookOpen size={20} />,
  },
  {
    title: 'Review & Feedback',
    href: '/mahasiswa/reviews',
    icon: <ClipboardCheck size={20} />,
  },
];

const dosenMenuItems: SidebarItem[] = [
  {
    title: 'Dashboard',
    href: '/dosen/dashboard',
    icon: <LayoutDashboard size={20} />,
  },
  {
    title: 'Project Mahasiswa',
    href: '/dosen/projects',
    icon: <FolderGit2 size={20} />,
  },
  {
    title: 'Review',
    href: '/dosen/reviews',
    icon: <ClipboardCheck size={20} />,
  },
  {
    title: 'Auto Review',
    href: '/dosen/auto-review',
    icon: <Bot size={20} />,
  },
];

const adminMenuItems: SidebarItem[] = [
  {
    title: 'Dashboard',
    href: '/admin/dashboard',
    icon: <LayoutDashboard size={20} />,
  },
  {
    title: 'Semua Project',
    href: '/admin/projects',
    icon: <FolderGit2 size={20} />,
  },
  {
    title: 'Manajemen User',
    href: '/admin/users',
    icon: <Users size={20} />,
  },
  {
    title: 'Penugasan Dosen',
    href: '/admin/assignments',
    icon: <UserCog size={20} />,
  },
  {
    title: 'Rubrik Penilaian',
    href: '/admin/rubrik',
    icon: <BookOpen size={20} />,
  },
  {
    title: 'Semester',
    href: '/admin/semesters',
    icon: <GraduationCap size={20} />,
  },
];

interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

// Helper function to get dashboard URL based on role
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

  const menuItems =
    userRole === 'ADMIN'
      ? adminMenuItems
      : userRole === 'DOSEN_PENGUJI'
        ? dosenMenuItems
        : mahasiswaMenuItems;

  const roleLabel =
    userRole === 'ADMIN'
      ? 'Administrator'
      : userRole === 'DOSEN_PENGUJI'
        ? 'Dosen Penguji'
        : 'Mahasiswa';

  const dashboardUrl = getDashboardUrl(userRole);

  // Close mobile sidebar when route changes
  useEffect(() => {
    if (onMobileClose) {
      onMobileClose();
    }
  }, [pathname]);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn(
        "flex items-center h-20 px-4",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        {!isCollapsed && (
          <Link href={dashboardUrl} className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Capstone Logo"
              width={48}
              height={48}
              className="object-contain"
            />
            <div>
              <span className="font-bold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Capstone
              </span>
              <p className="text-[10px] text-default-400 -mt-0.5">Prodi Informatika</p>
            </div>
          </Link>
        )}
        {isCollapsed && (
          <Link href={dashboardUrl}>
            <Image
              src="/logo.png"
              alt="Capstone Logo"
              width={40}
              height={40}
              className="object-contain"
            />
          </Link>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className={cn("space-y-1", isCollapsed && "px-0")}>
          {!isCollapsed && (
            <p className="text-[10px] font-semibold text-default-400 uppercase tracking-wider px-3 mb-3">
              Menu
            </p>
          )}
          {menuItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/mahasiswa/dashboard' &&
                item.href !== '/dosen/dashboard' &&
                item.href !== '/admin/dashboard' &&
                pathname.startsWith(item.href));

            const linkContent = (
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group',
                  isActive
                    ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/30'
                    : 'hover:bg-default-100 text-default-600 hover:text-default-900',
                  isCollapsed && 'justify-center px-2',
                )}
                onClick={onMobileClose}
              >
                <span className={cn(
                  'transition-transform duration-200',
                  !isActive && 'group-hover:scale-110',
                  isActive && 'drop-shadow-sm'
                )}>
                  {item.icon}
                </span>
                {!isCollapsed && (
                  <span className="text-sm font-medium">{item.title}</span>
                )}
              </Link>
            );

            return (
              <div key={item.href}>
                {isCollapsed ? (
                  <Tooltip content={item.title} placement="right">
                    {linkContent}
                  </Tooltip>
                ) : (
                  linkContent
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* User Section at Bottom */}
      <div className="p-3 border-t border-divider">
        {isCollapsed ? (
          <Tooltip content={session?.user?.name || 'User'} placement="right">
            <div className="flex justify-center">
              <Avatar
                src={getSimakPhotoUrl((session?.user as { nim?: string })?.nim) || session?.user?.image || undefined}
                name={session?.user?.name || 'User'}
                size="sm"
                className="ring-2 ring-primary/20"
              />
            </div>
          </Tooltip>
        ) : (
          <div className="flex items-center gap-3 p-2 rounded-xl bg-default-100/50">
            <Avatar
              src={getSimakPhotoUrl((session?.user as { nim?: string })?.nim) || session?.user?.image || undefined}
              name={session?.user?.name || 'User'}
              size="sm"
              className="ring-2 ring-primary/20"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">
                {session?.user?.name}
              </p>
              <p className="text-xs text-default-500 truncate">{roleLabel}</p>
            </div>
          </div>
        )}

        {/* Collapse Toggle - Desktop Only */}
        <div className="hidden md:block pt-3 mt-3 border-t border-divider">
          {isCollapsed ? (
            <Tooltip content="Expand" placement="right">
              <Button
                isIconOnly
                variant="light"
                className="w-full"
                onPress={() => setIsCollapsed(false)}
              >
                <ChevronRight size={18} />
              </Button>
            </Tooltip>
          ) : (
            <Button
              variant="light"
              className="w-full justify-between text-default-500"
              onPress={() => setIsCollapsed(true)}
              endContent={<ChevronLeft size={16} />}
            >
              <span className="text-xs">Collapse</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block p-3 h-screen">
        <aside
          className={cn(
            'flex flex-col h-full bg-content1 rounded-3xl shadow-xl shadow-default-200/50 dark:shadow-none border border-divider/50 transition-all duration-300 overflow-hidden',
            isCollapsed ? 'w-[72px]' : 'w-64',
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
          'fixed inset-y-0 left-0 z-50 w-72 bg-content1 transition-transform duration-300 ease-out md:hidden',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Mobile Close Button */}
        <div className="absolute top-4 right-4">
          <Button
            isIconOnly
            variant="flat"
            size="sm"
            onPress={onMobileClose}
            className="rounded-full"
          >
            <X size={18} />
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
