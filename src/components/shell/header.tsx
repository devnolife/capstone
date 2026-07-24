'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import {
  Button,
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Badge,
  Input,
  Skeleton,
  Spinner,
} from '@heroui/react';
import {
  Bell,
  Search,
  LogOut,
  User,
  Settings,
  Menu,
  Moon,
  Plus,
  Sun,
  Command,
  Check,
  ChevronDown,
  FileText,
  UserPlus,
  ClipboardCheck,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getSimakPhotoUrl } from '@/lib/utils';
import { useNotifications, type Notification } from '@/hooks/use-notifications';
import { Breadcrumbs } from '@/components/shell/breadcrumbs';

interface HeaderProps {
  title?: string;
  onMenuClick?: () => void;
}

// Get icon based on notification type
function getNotificationIcon(type: string) {
  switch (type) {
    case 'assignment':
      return <UserPlus size={16} className="text-blue-500" />;
    case 'review':
      return <ClipboardCheck size={16} className="text-green-500" />;
    case 'submission':
      return <FileText size={16} className="text-violet-500" />;
    case 'invitation':
      return <UserPlus size={16} className="text-orange-500" />;
    case 'system':
    default:
      return <AlertCircle size={16} className="text-app-teritary-invert" />;
  }
}

// Format relative time
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Baru saja';
  if (diffMins < 60) return `${diffMins} menit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays < 7) return `${diffDays} hari lalu`;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

function getWeekNumber(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - start.getTime();
  return Math.ceil((diff / 86400000 + start.getDay() + 1) / 7);
}

export function Header({ title, onMenuClick }: HeaderProps) {
  const { data: session } = useSession();
  const { resolvedTheme, setTheme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Chip tanggal · pekan (dihitung setelah mount agar bebas hydration mismatch)
  const dateChip = mounted
    ? `${new Date()
        .toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })
        .replace(/,/g, '')
        .toUpperCase()} · PEKAN ${getWeekNumber(new Date())}`
    : '';

  const isDark = mounted && resolvedTheme === 'dark';
  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');

  // Aksi cepat per-role (pill primary di header)
  const quickAction = (() => {
    const r = (session?.user as { role?: string })?.role;
    switch (r) {
      case 'MAHASISWA':
        return { label: 'Buat Project', href: '/mahasiswa/projects/new', icon: Plus };
      case 'DOSEN_PENGUJI':
        return { label: 'Antrian Review', href: '/dosen/reviews', icon: ClipboardCheck };
      case 'ADMIN':
        return { label: 'Tambah User', href: '/admin/users?action=add', icon: UserPlus };
      default:
        return null;
    }
  })();

  // Use the notifications hook with 30 second polling
  const {
    notifications,
    unreadCount,
    isLoading: notifLoading,
    markAsRead,
    markAllAsRead,
    refresh: refreshNotifications,
  } = useNotifications({
    pollingInterval: 30000, // 30 seconds
    limit: 5, // Only show 5 in dropdown
    autoStart: true,
  });

  // Wait for client-side hydration to complete
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get role-based path prefix
  const role = (session?.user as { role?: string })?.role?.toLowerCase() || 'mahasiswa';
  const basePath = role === 'dosen_penguji' ? '/dosen' : `/${role}`;

  // Submit search: navigate to role-based projects list with ?q=
  const submitSearch = useCallback(
    (query: string) => {
      const trimmed = query.trim();
      const target = `${basePath}/projects${trimmed ? `?q=${encodeURIComponent(trimmed)}` : ''}`;
      router.push(target);
    },
    [basePath, router],
  );

  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        submitSearch(searchQuery);
      }
    },
    [searchQuery, submitSearch],
  );

  // Global Cmd+K / Ctrl+K shortcut to focus search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleLogout = useCallback(async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      // Clear any cached data first
      if (typeof window !== 'undefined') {
        // Clear session storage
        sessionStorage.clear();
      }

      // Sign out and redirect to landing page
      await signOut({
        callbackUrl: '/',
        redirect: true
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect on error
      window.location.href = '/';
    }
  }, [isLoggingOut]);

  // Handle notification click
  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    // Navigate to link if exists
    if (notification.link) {
      setIsDropdownOpen(false);
      router.push(notification.link);
    }
  };

  // Show skeleton while mounting to prevent hydration mismatch
  if (!mounted) {
    return (
      <header className="h-14 flex items-center justify-between px-4 md:px-6 border-b border-border bg-background">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-full md:hidden" />
          <Skeleton className="w-24 h-6 rounded-lg md:hidden" />
          {title && <Skeleton className="hidden md:block w-32 h-6 rounded-lg" />}
        </div>
        <div className="hidden md:flex flex-1 max-w-xl mx-8">
          <Skeleton className="w-full h-9 rounded-full" />
        </div>
        <div className="flex items-center gap-1">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="w-8 h-8 rounded-full" />
        </div>
      </header>
    );
  }

  return (
    <header className="h-14 flex items-center justify-between px-4 md:px-6 border-b border-border bg-background">
      {/* Left Side */}
      <div className="flex items-center gap-3">
        {/* Mobile Menu Button */}
        <Button
          isIconOnly
          variant="light"
          onPress={onMenuClick}
          className="md:hidden"
        >
          <Menu size={22} />
        </Button>

        {/* Mobile Logo */}
        <Link href={`${basePath}/dashboard`} className="flex items-center gap-2 md:hidden">
          <Image src="/logo.png" alt="Capstone" width={22} height={22} className="object-contain" />
          <span className="font-editorial text-lg leading-none tracking-tight text-foreground">
            capstone
          </span>
        </Link>

        {/* Breadcrumbs - Desktop */}
        <div className="hidden md:flex items-center min-w-0">
          {title ? (
            <h1 className="text-lg font-semibold text-foreground truncate">{title}</h1>
          ) : (
            <Breadcrumbs />
          )}
        </div>
      </div>

      {/* Center - Search Bar (Desktop) */}
      <div className="hidden md:flex flex-1 max-w-2xl mx-8">
        <Input
          ref={searchInputRef}
          classNames={{
            base: 'w-full',
            inputWrapper:
              'bg-app-quinary hover:bg-app-quaternary border border-border shadow-none rounded-full h-9',
          }}
          placeholder="Cari project, mahasiswa, NIM..."
          size="sm"
          radius="full"
          value={searchQuery}
          onValueChange={setSearchQuery}
          onKeyDown={handleSearchKeyDown}
          isClearable
          onClear={() => setSearchQuery('')}
          startContent={<Search size={18} className="text-app-teritary-invert" />}
          endContent={
            <div className="hidden lg:flex items-center gap-1 text-app-teritary-invert">
              <kbd className="px-1.5 py-0.5 text-[10px] font-medium border border-border rounded-md font-dm-mono">
                <Command size={10} className="inline" />
              </kbd>
              <kbd className="px-1.5 py-0.5 text-[10px] font-medium border border-border rounded-md font-dm-mono">
                K
              </kbd>
            </div>
          }
          type="search"
        />
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2">
        {/* Mobile Search Button */}
        <Button
          isIconOnly
          variant="light"
          size="sm"
          className="md:hidden"
          onPress={() => submitSearch('')}
          aria-label="Cari"
        >
          <Search size={20} />
        </Button>

        {/* Aksi cepat per-role */}
        {quickAction && (
          <Link
            href={quickAction.href}
            className="bg-primary text-primary-foreground hover:bg-primary/90 hidden h-9 shrink-0 items-center gap-1.5 rounded-full px-4 text-[13px] font-medium whitespace-nowrap shadow-xs transition-all active:scale-[0.98] lg:inline-flex"
          >
            <quickAction.icon size={14} strokeWidth={2.5} />
            {quickAction.label}
          </Link>
        )}

        {/* Tanggal · pekan (gaya DashTopbar) */}
        <span
          className="text-app-secondary-invert hidden shrink-0 font-mono text-xs tracking-wider xl:block"
          suppressHydrationWarning
        >
          {dateChip}
        </span>

        {/* Pemisah cluster */}
        <span className="hidden h-5 w-px bg-border lg:block" />

        {/* Toggle tema light/dark */}
        <button
          type="button"
          onClick={toggleTheme}
          className="text-app-secondary-invert hover:bg-app-quaternary hover:text-foreground hidden size-9 items-center justify-center rounded-full border border-border transition-colors md:flex"
          aria-label={isDark ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Notifications - Real-time with polling */}
        <Dropdown
          placement="bottom-end"
          isOpen={isDropdownOpen}
          onOpenChange={setIsDropdownOpen}
        >
          <DropdownTrigger>
            <button
              type="button"
              className="text-app-secondary-invert hover:bg-app-quaternary hover:text-foreground relative flex size-9 items-center justify-center rounded-full border border-border transition-colors"
              aria-label="Notifikasi"
            >
              <Badge
                color="danger"
                content={unreadCount > 99 ? '99+' : unreadCount}
                size="sm"
                shape="circle"
                isInvisible={unreadCount === 0}
              >
                <Bell size={16} />
              </Badge>
            </button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Notifications"
            className="w-80 max-w-[calc(100vw-2rem)]"
            closeOnSelect={false}
          >
            <DropdownItem
              key="header"
              className="h-14 gap-2"
              isReadOnly
              textValue="Notifications Header"
            >
              <div className="flex items-center justify-between w-full">
                <div>
                  <p className="font-semibold">Notifikasi</p>
                  <p className="text-xs text-default-500">
                    {unreadCount > 0 ? `${unreadCount} notifikasi baru` : 'Tidak ada notifikasi baru'}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() => refreshNotifications()}
                    isDisabled={notifLoading}
                  >
                    <RefreshCw size={14} className={notifLoading ? 'animate-spin' : ''} />
                  </Button>
                  {unreadCount > 0 && (
                    <Button
                      size="sm"
                      variant="light"
                      onPress={() => markAllAsRead()}
                      startContent={<Check size={14} />}
                      className="text-xs"
                    >
                      Baca semua
                    </Button>
                  )}
                </div>
              </div>
            </DropdownItem>

            {notifLoading && notifications.length === 0 ? (
              <DropdownItem key="loading" isReadOnly textValue="Loading">
                <div className="flex items-center justify-center py-4">
                  <Spinner size="sm" />
                </div>
              </DropdownItem>
            ) : notifications.length === 0 ? (
              <DropdownItem key="empty" isReadOnly textValue="No notifications">
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Bell size={32} className="text-default-300 mb-2" />
                  <p className="text-sm text-default-500">Tidak ada notifikasi</p>
                </div>
              </DropdownItem>
            ) : (
              <>
                {notifications.map((notification) => (
                  <DropdownItem
                    key={notification.id}
                    textValue={notification.title}
                    className={`py-3 ${!notification.isRead ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}
                    onPress={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm ${!notification.isRead ? 'font-semibold' : ''} truncate`}>
                            {notification.title}
                          </p>
                          {!notification.isRead && (
                            <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-default-500 line-clamp-2 mt-0.5">
                          {notification.message}
                        </p>
                        <p className="text-[10px] text-default-400 mt-1">
                          {formatRelativeTime(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  </DropdownItem>
                ))}
              </>
            )}

            <DropdownItem
              key="view-all"
              className="text-primary text-center border-t border-default-100"
              href={`${basePath}/notifications`}
              onPress={() => setIsDropdownOpen(false)}
            >
              Lihat semua notifikasi
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>

        {/* User Menu — account chip gaya DashTopbar */}
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <button
              type="button"
              className="border-border hover:bg-app-quaternary inline-flex h-9 shrink-0 items-center gap-2 rounded-full border px-1.5 transition-all outline-none md:px-2.5"
            >
              <Avatar
                className="size-6"
                name={session?.user?.name || 'User'}
                size="sm"
                src={getSimakPhotoUrl((session?.user as { nim?: string })?.nim) || session?.user?.image || undefined}
              />
              <span className="hidden max-w-[120px] truncate text-sm font-medium md:block">
                {(session?.user?.name || 'User').split(' ')[0]}
              </span>
              <ChevronDown size={14} className="text-app-teritary-invert hidden md:block" />
            </button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Profile Actions" variant="flat">
            <DropdownItem
              key="profile-info"
              className="h-14 gap-2"
              textValue="Profile Info"
              isReadOnly
            >
              <p className="font-semibold">{session?.user?.name}</p>
              <p className="text-xs text-default-500">
                {(session?.user as { username?: string })?.username}
              </p>
            </DropdownItem>
            <DropdownItem
              key="my-profile"
              href={`${basePath}/profile`}
              startContent={<User size={18} />}
            >
              Profil Saya
            </DropdownItem>
            <DropdownItem
              key="settings"
              href={`${basePath}/settings`}
              startContent={<Settings size={18} />}
            >
              Pengaturan
            </DropdownItem>
            {/* Toggle tema — mobile (desktop punya tombol sendiri) */}
            <DropdownItem
              key="theme"
              className="md:hidden"
              startContent={isDark ? <Sun size={18} /> : <Moon size={18} />}
              onPress={toggleTheme}
            >
              {isDark ? 'Mode Terang' : 'Mode Gelap'}
            </DropdownItem>
            <DropdownItem
              key="logout"
              color="danger"
              startContent={<LogOut size={18} />}
              onPress={handleLogout}
              isDisabled={isLoggingOut}
            >
              {isLoggingOut ? 'Keluar...' : 'Keluar'}
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </header>
  );
}
