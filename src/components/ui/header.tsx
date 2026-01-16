'use client';

import { useSession, signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Button,
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Badge,
  Input,
} from '@heroui/react';
import { Bell, Moon, Sun, Search, LogOut, User, Settings } from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Navbar
      maxWidth="full"
      className="border-b border-divider bg-background/70 backdrop-blur-lg"
      height="4rem"
    >
      <NavbarContent justify="start">
        {title && (
          <NavbarItem>
            <h1 className="text-xl font-semibold">{title}</h1>
          </NavbarItem>
        )}
      </NavbarContent>

      <NavbarContent justify="center" className="hidden md:flex">
        <NavbarItem className="w-full max-w-md">
          <Input
            classNames={{
              base: 'max-w-full',
              inputWrapper: 'bg-default-100',
            }}
            placeholder="Cari project, dokumen..."
            size="sm"
            startContent={<Search size={18} className="text-default-400" />}
            type="search"
          />
        </NavbarItem>
      </NavbarContent>

      <NavbarContent justify="end">
        {/* Theme Toggle */}
        <NavbarItem>
          <Button isIconOnly variant="light" onPress={toggleTheme}>
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </Button>
        </NavbarItem>

        {/* Notifications */}
        <NavbarItem>
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Button isIconOnly variant="light">
                <Badge color="danger" content="3" size="sm" shape="circle">
                  <Bell size={20} />
                </Badge>
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Notifications" className="w-80">
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
                className="text-primary"
                href="/dashboard/notifications"
              >
                Lihat semua notifikasi
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarItem>

        {/* User Menu */}
        <NavbarItem>
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                isBordered
                as="button"
                className="transition-transform"
                color="primary"
                name={session?.user?.name || 'User'}
                size="sm"
                src={session?.user?.image || undefined}
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="Profile Actions" variant="flat">
              <DropdownItem
                key="profile"
                className="h-14 gap-2"
                textValue="Profile"
              >
                <p className="font-semibold">{session?.user?.name}</p>
                <p className="text-sm text-default-500">
                  {session?.user?.email}
                </p>
              </DropdownItem>
              <DropdownItem
                key="my-profile"
                href="/dashboard/profile"
                startContent={<User size={18} />}
              >
                Profil Saya
              </DropdownItem>
              <DropdownItem
                key="settings"
                href="/dashboard/settings"
                startContent={<Settings size={18} />}
              >
                Pengaturan
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
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
