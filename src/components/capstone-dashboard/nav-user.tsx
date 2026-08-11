'use client';

import Link from 'next/link';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  accentFor,
  ACCENT_TINT,
  ACCENT_TEXT,
} from '@/components/capstone-dashboard/accent';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  EllipsisVerticalIcon,
  CircleUserRoundIcon,
  GithubIcon,
  BellIcon,
  LogOutIcon,
} from 'lucide-react';

export function NavUser({
  user,
  avatarSrc,
  profileHref,
  githubHref,
  notificationsHref,
  onLogout,
  isLoggingOut = false,
}: {
  user: {
    name: string;
    id: string;
    role: string;
  };
  avatarSrc?: string;
  profileHref?: string;
  githubHref?: string;
  notificationsHref?: string;
  onLogout?: () => void;
  isLoggingOut?: boolean;
}) {
  const { isMobile } = useSidebar();
  const initials =
    user.name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'U';
  const accent = accentFor(user.name);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton size="lg" className="aria-expanded:bg-muted" />
            }
          >
            <Avatar className="size-8 rounded-lg">
              {avatarSrc ? (
                <AvatarImage src={avatarSrc} alt={user.name} />
              ) : null}
              <AvatarFallback
                className={cn('rounded-lg border', ACCENT_TINT[accent])}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.name}</span>
              <span className="truncate text-xs text-foreground/70">
                {user.id} · {user.role}
              </span>
            </div>
            <EllipsisVerticalIcon className="ml-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="size-8">
                    {avatarSrc ? (
                      <AvatarImage src={avatarSrc} alt={user.name} />
                    ) : null}
                    <AvatarFallback
                      className={cn('rounded-lg border', ACCENT_TINT[accent])}
                    >
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user.id} · {user.role}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                {...(profileHref ? { render: <Link href={profileHref} /> } : {})}
              >
                <CircleUserRoundIcon className={ACCENT_TEXT.brand} />
                Profil
              </DropdownMenuItem>
              <DropdownMenuItem
                {...(githubHref ? { render: <Link href={githubHref} /> } : {})}
              >
                <GithubIcon className={ACCENT_TEXT.highlight} />
                Akun GitHub
              </DropdownMenuItem>
              <DropdownMenuItem
                {...(notificationsHref
                  ? { render: <Link href={notificationsHref} /> }
                  : {})}
              >
                <BellIcon className={ACCENT_TEXT.rose} />
                Notifikasi
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              disabled={isLoggingOut}
              onClick={onLogout}
            >
              <LogOutIcon />
              {isLoggingOut ? 'Keluar...' : 'Keluar'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
