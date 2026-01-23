'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FolderGit2,
  Bell,
  User,
  ClipboardCheck,
  Users,
  Mail,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const mahasiswaNavItems: NavItem[] = [
  { title: 'Home', href: '/mahasiswa/dashboard', icon: LayoutDashboard },
  { title: 'Project', href: '/mahasiswa/projects', icon: FolderGit2 },
  { title: 'Undangan', href: '/mahasiswa/invitations', icon: Mail },
  { title: 'Profil', href: '/mahasiswa/profile', icon: User },
];

const dosenNavItems: NavItem[] = [
  { title: 'Home', href: '/dosen/dashboard', icon: LayoutDashboard },
  { title: 'Project', href: '/dosen/projects', icon: FolderGit2 },
  { title: 'Review', href: '/dosen/reviews', icon: ClipboardCheck },
  { title: 'Profil', href: '/dosen/profile', icon: User },
];

const adminNavItems: NavItem[] = [
  { title: 'Home', href: '/admin/dashboard', icon: LayoutDashboard },
  { title: 'Project', href: '/admin/projects', icon: FolderGit2 },
  { title: 'User', href: '/admin/users', icon: Users },
  { title: 'Profil', href: '/admin/profile', icon: User },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const userRole = session?.user?.role;

  const navItems =
    userRole === 'ADMIN'
      ? adminNavItems
      : userRole === 'DOSEN_PENGUJI'
        ? dosenNavItems
        : mahasiswaNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-content1/95 backdrop-blur-lg border-t border-divider safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== '/mahasiswa/dashboard' &&
              item.href !== '/dosen/dashboard' &&
              item.href !== '/admin/dashboard' &&
              item.href !== '/mahasiswa/profile' &&
              item.href !== '/dosen/profile' &&
              item.href !== '/admin/profile' &&
              item.href !== '/mahasiswa/notifications' &&
              item.href !== '/dosen/notifications' &&
              item.href !== '/admin/notifications' &&
              pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center w-full h-full relative',
                'transition-colors duration-200',
                isActive ? 'text-primary' : 'text-default-500',
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute -top-0.5 w-8 h-1 bg-primary rounded-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <Icon
                size={22}
                className={cn(
                  'transition-transform duration-200',
                  isActive && 'scale-110',
                )}
              />
              <span
                className={cn(
                  'text-[10px] mt-1 font-medium',
                  isActive ? 'text-primary' : 'text-default-500',
                )}
              >
                {item.title}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
