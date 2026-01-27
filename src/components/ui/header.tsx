'use client';

import { useState, useEffect, useCallback } from 'react';
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
      <header className="h-16 flex items-center justify-between px-4 md:px-6">
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
    <header className="h-16 flex items-center justify-between px-4 md:px-6">
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
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary to-secondary">
            <GitBranch className="text-white" size={18} />
          </div>
          <span className="font-bold text-base bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Capstone
          </span>
        </Link>

        {/* Page Title - Desktop */}
        {title && (
          <h1 className="hidden md:block text-xl font-semibold text-default-800">
            {title}
          </h1>
        )}
      </div>

      {/* Center - Search Bar (Desktop) */}
      <div className="hidden md:flex flex-1 max-w-2xl mx-8">
        <Input
          classNames={{
            base: 'w-full',
            inputWrapper: 'bg-default-100/70 hover:bg-default-100 border-transparent shadow-sm',
          }}
          placeholder="Search projects, documents..."
          size="sm"
          radius="lg"
          startContent={<Search size={18} className="text-default-400" />}
          endContent={
            <div className="hidden lg:flex items-center gap-1 text-default-400">
              <kbd className="px-1.5 py-0.5 text-[10px] font-medium bg-default-200 rounded">
                <Command size={10} className="inline" />
              </kbd>
              <kbd className="px-1.5 py-0.5 text-[10px] font-medium bg-default-200 rounded">K</kbd>
            </div>
          }
          type="search"
        />
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3">
        {/* Mobile Search Button */}
        <Button isIconOnly variant="light" size="sm" className="md:hidden">
          <Search size={20} />
        </Button>

        {/* Theme Toggle - Desktop */}
        <Button
          isIconOnly
          variant="light"
          onPress={toggleTheme}
          size="sm"
          className="hidden md:flex"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </Button>

        {/* Notifications - Real-time with polling */}
        <Dropdown 
          placement="bottom-end"
          isOpen={isDropdownOpen}
          onOpenChange={setIsDropdownOpen}
        >
          <DropdownTrigger>
            <Button isIconOnly variant="light" size="sm">
              <Badge 
                color="danger" 
                content={unreadCount > 99 ? '99+' : unreadCount} 
                size="sm" 
                shape="circle"
                isInvisible={unreadCount === 0}
              >
                <Bell size={20} />
              </Badge>
            </Button>
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

        {/* User Menu */}
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Button
              variant="light"
              className="p-1 min-w-0 h-auto"
            >
              <Avatar
                isBordered
                className="w-8 h-8"
                color="primary"
                name={session?.user?.name || 'User'}
                size="sm"
                src={getSimakPhotoUrl((session?.user as { nim?: string })?.nim) || session?.user?.image || undefined}
              />
            </Button>
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
            {/* Mobile Theme Toggle */}
            <DropdownItem
              key="theme"
              className="md:hidden"
              startContent={theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              onPress={toggleTheme}
            >
              {theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
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
