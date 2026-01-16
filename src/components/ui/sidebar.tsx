'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  Button,
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Divider,
} from '@heroui/react';
import {
  LayoutDashboard,
  FolderGit2,
  FileText,
  Users,
  ClipboardCheck,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell,
  GraduationCap,
  UserCog,
  BookOpen,
  GitBranch,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

const mahasiswaMenuItems: SidebarItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard/mahasiswa',
    icon: <LayoutDashboard size={20} />,
  },
  {
    title: 'Project Saya',
    href: '/dashboard/mahasiswa/projects',
    icon: <FolderGit2 size={20} />,
  },
  {
    title: 'Dokumen',
    href: '/dashboard/mahasiswa/documents',
    icon: <FileText size={20} />,
  },
  {
    title: 'Review & Feedback',
    href: '/dashboard/mahasiswa/reviews',
    icon: <ClipboardCheck size={20} />,
  },
];

const dosenMenuItems: SidebarItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard/dosen',
    icon: <LayoutDashboard size={20} />,
  },
  {
    title: 'Project Mahasiswa',
    href: '/dashboard/dosen/projects',
    icon: <FolderGit2 size={20} />,
  },
  {
    title: 'Review',
    href: '/dashboard/dosen/reviews',
    icon: <ClipboardCheck size={20} />,
  },
];

const adminMenuItems: SidebarItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard/admin',
    icon: <LayoutDashboard size={20} />,
  },
  {
    title: 'Semua Project',
    href: '/dashboard/admin/projects',
    icon: <FolderGit2 size={20} />,
  },
  {
    title: 'Manajemen User',
    href: '/dashboard/admin/users',
    icon: <Users size={20} />,
  },
  {
    title: 'Penugasan Dosen',
    href: '/dashboard/admin/assignments',
    icon: <UserCog size={20} />,
  },
  {
    title: 'Rubrik Penilaian',
    href: '/dashboard/admin/rubrik',
    icon: <BookOpen size={20} />,
  },
  {
    title: 'Semester',
    href: '/dashboard/admin/semesters',
    icon: <GraduationCap size={20} />,
  },
];

export function Sidebar() {
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

  return (
    <aside
      className={cn(
        'flex flex-col h-screen bg-content1 border-r border-divider transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64',
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-divider">
        {!isCollapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <GitBranch className="text-primary" size={24} />
            <span className="font-bold text-lg">Capstone</span>
          </Link>
        )}
        <Button
          isIconOnly
          variant="light"
          size="sm"
          onPress={() => setIsCollapsed(!isCollapsed)}
          className={cn(isCollapsed && 'mx-auto')}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>

      {/* User Info */}
      {!isCollapsed && (
        <div className="px-4 py-3 border-b border-divider">
          <div className="flex items-center gap-3">
            <Avatar
              src={session?.user?.image || undefined}
              name={session?.user?.name || 'User'}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {session?.user?.name}
              </p>
              <p className="text-xs text-default-500 truncate">{roleLabel}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard/mahasiswa' &&
                item.href !== '/dashboard/dosen' &&
                item.href !== '/dashboard/admin' &&
                pathname.startsWith(item.href));

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-default-100 text-default-600',
                    isCollapsed && 'justify-center',
                  )}
                  title={isCollapsed ? item.title : undefined}
                >
                  {item.icon}
                  {!isCollapsed && (
                    <span className="text-sm font-medium">{item.title}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-divider p-2">
        <Dropdown placement="right-end">
          <DropdownTrigger>
            <Button
              variant="light"
              className={cn(
                'w-full justify-start gap-3',
                isCollapsed && 'justify-center',
              )}
            >
              <Settings size={20} />
              {!isCollapsed && <span>Pengaturan</span>}
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="User menu">
            <DropdownItem
              key="profile"
              href="/dashboard/profile"
              startContent={<Users size={18} />}
            >
              Profil Saya
            </DropdownItem>
            <DropdownItem
              key="notifications"
              href="/dashboard/notifications"
              startContent={<Bell size={18} />}
            >
              Notifikasi
            </DropdownItem>
            <DropdownItem
              key="logout"
              color="danger"
              startContent={<LogOut size={18} />}
              onPress={() => signOut({ callbackUrl: '/login' })}
            >
              Keluar
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </aside>
  );
}
