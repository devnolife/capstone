'use client';

import Link from 'next/link';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Avatar,
  Divider,
} from '@heroui/react';
import {
  Users,
  FolderGit2,
  GraduationCap,
  ClipboardCheck,
  UserPlus,
  ChevronRight,
  BookOpen,
  CalendarCheck,
  UserCog,
  ArrowUpRight,
  type LucideIcon,
} from 'lucide-react';
import {
  formatDate,
  getStatusColor,
  getStatusLabel,
  getRoleLabel,
} from '@/lib/utils';

interface User {
  id: string;
  name: string;
  username: string;
  role: string;
  image: string | null;
  createdAt: Date;
}

interface Project {
  id: string;
  title: string;
  semester: string;
  status: string;
  createdAt: Date;
  mahasiswa: {
    name: string;
    username: string;
  };
}

interface AdminDashboardProps {
  stats: {
    totalUsers: number;
    totalMahasiswa: number;
    totalDosen: number;
    totalProjects: number;
    submittedProjects: number;
    completedReviews: number;
  };
  recentUsers: User[];
  recentProjects: Project[];
}

interface StatItem {
  label: string;
  value: number;
  hint?: string;
  icon: LucideIcon;
  href: string;
  iconClass: string;
}

interface QuickAction {
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
  iconClass: string;
}

export function AdminDashboardContent({
  stats,
  recentUsers,
  recentProjects,
}: AdminDashboardProps) {
  const iconContainerClass =
    'border border-[var(--color-pebble)] dark:border-[var(--color-graphite)] bg-[var(--color-fog)] dark:bg-zinc-900/40';

  const statItems: StatItem[] = [
    {
      label: 'Total User',
      value: stats.totalUsers,
      hint: `${stats.totalMahasiswa} mahasiswa · ${stats.totalDosen} dosen`,
      icon: Users,
      href: '/admin/users',
      iconClass: `${iconContainerClass} text-[var(--color-ember)]`,
    },
    {
      label: 'Total Project',
      value: stats.totalProjects,
      hint: `${stats.submittedProjects} sudah submit`,
      icon: FolderGit2,
      href: '/admin/projects',
      iconClass: `${iconContainerClass} text-[var(--color-steel)]`,
    },
    {
      label: 'Mahasiswa',
      value: stats.totalMahasiswa,
      icon: GraduationCap,
      href: '/admin/users?role=MAHASISWA',
      iconClass: `${iconContainerClass} text-[var(--color-steel)]`,
    },
    {
      label: 'Review Selesai',
      value: stats.completedReviews,
      icon: ClipboardCheck,
      href: '/admin/projects',
      iconClass: `${iconContainerClass} text-emerald-600 dark:text-emerald-400`,
    },
  ];

  const quickActions: QuickAction[] = [
    {
      label: 'Tambah User',
      description: 'Daftarkan mahasiswa, dosen, atau admin baru',
      href: '/admin/users?action=add',
      icon: UserPlus,
      iconClass: `${iconContainerClass} text-[var(--color-ember)]`,
    },
    {
      label: 'Penugasan Dosen',
      description: 'Assign dosen penguji ke project',
      href: '/admin/assignments',
      icon: UserCog,
      iconClass: `${iconContainerClass} text-[var(--color-steel)]`,
    },
    {
      label: 'Jadwal Presentasi',
      description: 'Atur jadwal sidang & presentasi',
      href: '/admin/presentations',
      icon: CalendarCheck,
      iconClass: `${iconContainerClass} text-amber-600 dark:text-amber-400`,
    },
    {
      label: 'Rubrik Penilaian',
      description: 'Kelola rubrik penilaian',
      href: '/admin/rubrik',
      icon: BookOpen,
      iconClass: `${iconContainerClass} text-[var(--color-steel)]`,
    },
  ];

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="font-mono-display text-[10px] uppercase tracking-widest font-bold text-[var(--color-steel)]">
            Panel Admin
          </p>
          <h1 className="font-sans-display text-2xl font-bold tracking-tight text-[var(--color-obsidian)] dark:text-white">
            Dashboard
          </h1>
          <p className="text-sm text-[var(--color-steel)] mt-0.5">
            Ringkasan aktivitas sistem capstone
          </p>
        </div>
      </header>

      {/* Stats grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statItems.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.label}
              href={s.href}
              className="group block bg-[var(--color-snow)] dark:bg-[var(--color-obsidian)] border border-[var(--color-pebble)] dark:border-[var(--color-graphite)] rounded-2xl p-4 hover:shadow-xl transition-all"
            >
              <div className="flex items-start justify-between">
                <div className={`p-2.5 rounded-2xl ${s.iconClass}`}>
                  <Icon size={18} />
                </div>
                <ArrowUpRight
                  size={14}
                  className="text-[var(--color-steel)] opacity-50 group-hover:text-[var(--color-ember)] group-hover:opacity-100 transition-colors"
                />
              </div>
              <p className="font-sans-display text-2xl font-bold tracking-tight text-[var(--color-obsidian)] dark:text-white mt-3 tabular-nums group-hover:text-[var(--color-ember)] transition-colors">
                {s.value}
              </p>
              <p className="font-mono-display text-[9px] uppercase tracking-widest font-bold text-[var(--color-steel)] mt-0.5">{s.label}</p>
              {s.hint && (
                <p className="text-[11px] text-[var(--color-steel)] mt-1 truncate">{s.hint}</p>
              )}
            </Link>
          );
        })}
      </section>

      {/* Quick Actions */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-mono-display text-[10px] uppercase tracking-widest font-bold text-[var(--color-steel)]">
            Aksi Cepat
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((a) => {
            const Icon = a.icon;
            return (
              <Link
                key={a.label}
                href={a.href}
                className="group flex items-start gap-3 bg-[var(--color-snow)] dark:bg-[var(--color-obsidian)] border border-[var(--color-pebble)] dark:border-[var(--color-graphite)] rounded-2xl p-3.5 hover:shadow-xl transition-all"
              >
                <div className={`p-2.5 rounded-2xl ${a.iconClass} shrink-0`}>
                  <Icon size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-sans-display text-sm font-bold tracking-tight text-[var(--color-obsidian)] dark:text-white leading-tight">
                    {a.label}
                  </p>
                  <p className="text-xs text-[var(--color-steel)] mt-0.5 line-clamp-2">
                    {a.description}
                  </p>
                </div>
                <ChevronRight
                  size={14}
                  className="text-[var(--color-steel)] opacity-50 group-hover:text-[var(--color-ember)] group-hover:opacity-100 transition-colors mt-1 shrink-0"
                />
              </Link>
            );
          })}
        </div>
      </section>

      {/* Recent activity - 2 columns */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card shadow="none" className="bg-[var(--color-snow)] dark:bg-[var(--color-obsidian)] border border-[var(--color-pebble)] dark:border-[var(--color-graphite)] rounded-2xl hover:shadow-xl transition-all">
          <CardHeader className="pb-2 flex items-center justify-between">
            <div>
              <p className="font-mono-display text-[9px] uppercase tracking-widest font-bold text-[var(--color-steel)]">Registrasi</p>
              <h3 className="font-sans-display text-sm font-bold tracking-tight text-[var(--color-obsidian)] dark:text-white">User Terbaru</h3>
              <p className="text-xs text-[var(--color-steel)]">5 pendaftar terakhir</p>
            </div>
            <Button
              as={Link}
              href="/admin/users"
              size="sm"
              variant="light"
              className="font-mono-display text-[10px] uppercase tracking-widest font-bold text-[var(--color-steel)] hover:text-[var(--color-ember)]"
              endContent={<ChevronRight size={14} />}
            >
              Semua
            </Button>
          </CardHeader>
          <Divider className="bg-[var(--color-pebble)] dark:bg-[var(--color-graphite)]" />
          <CardBody className="p-0">
            {recentUsers.length === 0 ? (
              <p className="text-sm text-[var(--color-steel)] text-center py-8">
                Belum ada user terdaftar
              </p>
            ) : (
              <ul className="divide-y divide-[var(--color-pebble)] dark:divide-[var(--color-graphite)]">
                {recentUsers.map((u) => (
                  <li key={u.id}>
                    <Link
                      href={`/admin/users?id=${u.id}`}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--color-mist)] dark:hover:bg-zinc-900/50 transition-colors"
                    >
                      <Avatar
                        name={u.name}
                        src={u.image || undefined}
                        size="sm"
                        className="shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[var(--color-obsidian)] dark:text-white truncate">
                          {u.name}
                        </p>
                        <p className="text-xs text-[var(--color-steel)] truncate">
                          {u.username}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Chip
                          size="sm"
                          variant="bordered"
                          className="h-5 rounded-full border-current bg-transparent font-mono-display text-[10px] uppercase tracking-wider font-bold text-[var(--color-steel)]"
                        >
                          {getRoleLabel(u.role)}
                        </Chip>
                        <span className="text-[10px] text-[var(--color-steel)] hidden sm:inline">
                          {formatDate(u.createdAt)}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card shadow="none" className="bg-[var(--color-snow)] dark:bg-[var(--color-obsidian)] border border-[var(--color-pebble)] dark:border-[var(--color-graphite)] rounded-2xl hover:shadow-xl transition-all">
          <CardHeader className="pb-2 flex items-center justify-between">
            <div>
              <p className="font-mono-display text-[9px] uppercase tracking-widest font-bold text-[var(--color-steel)]">Project</p>
              <h3 className="font-sans-display text-sm font-bold tracking-tight text-[var(--color-obsidian)] dark:text-white">Project Terbaru</h3>
              <p className="text-xs text-[var(--color-steel)]">5 project terakhir dibuat</p>
            </div>
            <Button
              as={Link}
              href="/admin/projects"
              size="sm"
              variant="light"
              className="font-mono-display text-[10px] uppercase tracking-widest font-bold text-[var(--color-steel)] hover:text-[var(--color-ember)]"
              endContent={<ChevronRight size={14} />}
            >
              Semua
            </Button>
          </CardHeader>
          <Divider className="bg-[var(--color-pebble)] dark:bg-[var(--color-graphite)]" />
          <CardBody className="p-0">
            {recentProjects.length === 0 ? (
              <p className="text-sm text-[var(--color-steel)] text-center py-8">
                Belum ada project
              </p>
            ) : (
              <ul className="divide-y divide-[var(--color-pebble)] dark:divide-[var(--color-graphite)]">
                {recentProjects.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/admin/projects?id=${p.id}`}
                      className="flex items-start gap-3 px-4 py-2.5 hover:bg-[var(--color-mist)] dark:hover:bg-zinc-900/50 transition-colors"
                    >
                      <div className="p-2 rounded-2xl border border-[var(--color-pebble)] dark:border-[var(--color-graphite)] bg-[var(--color-fog)] dark:bg-zinc-900/40 shrink-0 mt-0.5">
                        <FolderGit2 size={14} className="text-[var(--color-ember)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[var(--color-obsidian)] dark:text-white line-clamp-1">
                          {p.title}
                        </p>
                        <p className="text-xs text-[var(--color-steel)] truncate">
                          {p.mahasiswa.name} · {p.semester}
                        </p>
                      </div>
                      <Chip
                        size="sm"
                        variant="flat"
                        color={getStatusColor(p.status)}
                        className="h-5 text-[10px] shrink-0"
                      >
                        {getStatusLabel(p.status)}
                      </Chip>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </section>
    </div>
  );
}
