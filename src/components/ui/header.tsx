'use client';

import { useState, useEffect } from 'react';
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
} from '@heroui/react';
import { Bell, Moon, Sun, Search, LogOut, User, Settings, Menu, GitBranch, Command } from 'lucide-react';
import Link from 'next/link';
import { getSimakPhotoUrl } from '@/lib/utils';

interface HeaderProps {
  title?: string;
  onMenuClick?: () => void;
}

export function Header({ title, onMenuClick }: HeaderProps) {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

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

        {/* Notifications */}
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Button isIconOnly variant="light" size="sm">
              <Badge color="danger" content="3" size="sm" shape="circle">
                <Bell size={20} />
              </Badge>
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Notifications" className="w-80 max-w-[calc(100vw-2rem)]">
            <DropdownItem
              key="header"
              className="h-14 gap-2"
              isReadOnly
              textValue="Notifications"
            >
              <p className="font-semibold">Notifikasi</p>
              <p className="text-xs text-default-500">3 notifikasi baru</p>
            </DropdownItem>
            <DropdownItem
              key="notif-1"
              description="Dosen telah memberikan review pada project Anda"
              className="py-3"
            >
              Review Baru
            </DropdownItem>
            <DropdownItem
              key="notif-2"
              description="Project Anda telah berhasil disubmit"
              className="py-3"
            >
              Project Submitted
            </DropdownItem>
            <DropdownItem
              key="notif-3"
              description="Ada update baru pada rubrik penilaian"
              className="py-3"
            >
              Update Rubrik
            </DropdownItem>
            <DropdownItem
              key="view-all"
              className="text-primary text-center"
              href={`${basePath}/notifications`}
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
              onPress={() => signOut({ callbackUrl: '/login' })}
            >
              Keluar
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </header>
  );
}
