'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Bell,
  Moon,
  Sun,
  Search,
  LogOut,
  User,
  Settings,
  Menu,
  GitBranch,
  Command,
  Check,
  FileText,
  UserPlus,
  ClipboardCheck,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSimakPhotoUrl } from '@/lib/utils';
import { useNotifications, type Notification } from '@/hooks/use-notifications';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';

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
      return <AlertCircle size={16} className="text-zinc-500" />;
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

export function Header({ title, onMenuClick }: HeaderProps) {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

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
      <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-[var(--color-pebble)] dark:border-[var(--color-graphite)] bg-[var(--color-snow)] dark:bg-zinc-950">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-lg md:hidden" />
          <Skeleton className="w-24 h-6 rounded-lg md:hidden" />
          {title && <Skeleton className="hidden md:block w-32 h-6 rounded-lg" />}
        </div>
        <div className="hidden md:flex flex-1 max-w-xl mx-8">
          <Skeleton className="w-full h-10 rounded-lg" />
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
    <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-[var(--color-pebble)] dark:border-[var(--color-graphite)] bg-[var(--color-snow)] dark:bg-zinc-950">
      {/* Left Side */}
      <div className="flex items-center gap-3">
        {/* Mobile Menu Button */}
        <Button
          size="icon"
          variant="ghost"
          onClick={onMenuClick}
          aria-label="Menu"
          className="md:hidden"
        >
          <Menu size={22} />
        </Button>

        {/* Mobile Logo */}
        <Link href={`${basePath}/dashboard`} className="flex items-center gap-2 md:hidden">
          <div className="p-1.5 rounded-xl bg-[var(--color-obsidian)] dark:bg-white">
            <GitBranch className="text-white dark:text-zinc-900" size={16} />
          </div>
          <span className="font-sans-display font-bold tracking-tight text-sm text-[var(--color-obsidian)] dark:text-white">
            Capstone
          </span>
        </Link>

        {/* Breadcrumbs - Desktop */}
        <div className="hidden md:flex items-center min-w-0">
          {title ? (
            <h1 className="font-sans-display text-lg font-bold tracking-tight text-[var(--color-obsidian)] dark:text-white truncate">{title}</h1>
          ) : (
            <Breadcrumbs />
          )}
        </div>
      </div>

      {/* Center - Search Bar (Desktop) */}
      <div className="hidden md:flex flex-1 max-w-2xl mx-8">
        <div className="relative w-full">
          <Search
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            ref={searchInputRef}
            type="search"
            aria-label="Cari"
            placeholder="Cari project, mahasiswa, NIM..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="h-9 w-full rounded-lg border-transparent bg-[var(--color-fog)] pl-10 pr-20 shadow-none hover:bg-[var(--color-pebble)] dark:bg-zinc-800/60 dark:hover:bg-zinc-800"
          />
          <div className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 text-muted-foreground lg:flex">
            <kbd className="px-1.5 py-0.5 text-[10px] font-medium bg-muted rounded">
              <Command size={10} className="inline" />
            </kbd>
            <kbd className="px-1.5 py-0.5 text-[10px] font-medium bg-muted rounded">K</kbd>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3">
        {/* Mobile Search Button */}
        <Button
          size="icon-sm"
          variant="ghost"
          className="md:hidden"
          onClick={() => submitSearch('')}
          aria-label="Cari"
        >
          <Search size={20} />
        </Button>

        {/* Theme Toggle - Desktop */}
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={toggleTheme}
          aria-label="Ganti tema"
          className="hidden md:flex"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </Button>

        {/* Notifications - Real-time with polling */}
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger
            render={
              <Button
                size="icon-sm"
                variant="ghost"
                aria-label="Notifikasi"
                className="relative"
              />
            }
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] leading-4 font-medium text-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            aria-label="Notifications"
            className="w-80 max-w-[calc(100vw-2rem)]"
          >
            <div className="flex items-center justify-between gap-2 px-2 py-2">
              <div>
                <p className="font-semibold">Notifikasi</p>
                <p className="text-xs text-muted-foreground">
                  {unreadCount > 0 ? `${unreadCount} notifikasi baru` : 'Tidak ada notifikasi baru'}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="icon-sm"
                  variant="ghost"
                  aria-label="Muat ulang notifikasi"
                  onClick={() => refreshNotifications()}
                  disabled={notifLoading}
                >
                  <RefreshCw size={14} className={notifLoading ? 'animate-spin' : ''} />
                </Button>
                {unreadCount > 0 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => markAllAsRead()}
                    className="text-xs"
                  >
                    <Check size={14} />
                    Baca semua
                  </Button>
                )}
              </div>
            </div>

            <DropdownMenuSeparator />

            {notifLoading && notifications.length === 0 ? (
              <div className="flex items-center justify-center py-4">
                <Spinner />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Bell size={32} className="text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Tidak ada notifikasi</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  closeOnClick={false}
                  className={`py-3 ${!notification.isRead ? 'bg-primary/5' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
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
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {notification.message}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {formatRelativeTime(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))
            )}

            <DropdownMenuSeparator />

            <DropdownMenuItem
              render={<Link href={`${basePath}/notifications`} />}
              className="justify-center text-primary"
              onClick={() => setIsDropdownOpen(false)}
            >
              Lihat semua notifikasi
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                aria-label="Menu profil"
                className="h-auto p-1"
              />
            }
          >
            <Avatar className="w-8 h-8 ring-2 ring-primary/40">
              <AvatarImage
                src={
                  getSimakPhotoUrl((session?.user as { nim?: string })?.nim) ||
                  session?.user?.image ||
                  undefined
                }
                alt={session?.user?.name || 'User'}
              />
              <AvatarFallback>
                {(session?.user?.name || 'User').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" aria-label="Profile Actions">
            <div className="px-2 py-2">
              <p className="font-semibold">{session?.user?.name}</p>
              <p className="text-xs text-muted-foreground">
                {(session?.user as { username?: string })?.username}
              </p>
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem render={<Link href={`${basePath}/profile`} />}>
              <User size={18} />
              Profil Saya
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href={`${basePath}/settings`} />}>
              <Settings size={18} />
              Pengaturan
            </DropdownMenuItem>
            {/* Mobile Theme Toggle */}
            <DropdownMenuItem className="md:hidden" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              {theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <LogOut size={18} />
              {isLoggingOut ? 'Keluar...' : 'Keluar'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
