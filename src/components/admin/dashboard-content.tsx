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
  const statItems: StatItem[] = [
    {
      label: 'Total User',
      value: stats.totalUsers,
      hint: `${stats.totalMahasiswa} mahasiswa · ${stats.totalDosen} dosen`,
      icon: Users,
      href: '/admin/users',
      iconClass: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300',
    },
    {
      label: 'Total Project',
      value: stats.totalProjects,
      hint: `${stats.submittedProjects} sudah submit`,
      icon: FolderGit2,
      href: '/admin/projects',
      iconClass: 'bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-300',
    },
    {
      label: 'Mahasiswa',
      value: stats.totalMahasiswa,
      icon: GraduationCap,
      href: '/admin/users?role=MAHASISWA',
      iconClass: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300',
    },
    {
      label: 'Review Selesai',
      value: stats.completedReviews,
      icon: ClipboardCheck,
      href: '/admin/projects',
      iconClass: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300',
    },
  ];

  const quickActions: QuickAction[] = [
    {
      label: 'Tambah User',
      description: 'Daftarkan mahasiswa, dosen, atau admin baru',
      href: '/admin/users?action=add',
      icon: UserPlus,
      iconClass: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300',
    },
    {
      label: 'Penugasan Dosen',
      description: 'Assign dosen penguji ke project',
      href: '/admin/assignments',
      icon: UserCog,
      iconClass: 'bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-300',
    },
    {
      label: 'Jadwal Presentasi',
      description: 'Atur jadwal sidang & presentasi',
      href: '/admin/presentations',
      icon: CalendarCheck,
      iconClass: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300',
    },
    {
      label: 'Rubrik Penilaian',
      description: 'Kelola rubrik penilaian',
      href: '/admin/rubrik',
      icon: BookOpen,
      iconClass: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300',
    },
  ];

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-default-900">Dashboard</h1>
          <p className="text-sm text-default-500 mt-0.5">
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
              className="group block rounded-xl border border-divider/60 bg-content1 p-4 hover:border-default-300 hover:bg-content2 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className={`p-2 rounded-lg ${s.iconClass}`}>
                  <Icon size={18} />
                </div>
                <ArrowUpRight
                  size={14}
                  className="text-default-300 group-hover:text-default-500 transition-colors"
                />
              </div>
              <p className="text-2xl font-semibold text-default-900 mt-3 tabular-nums">
                {s.value}
              </p>
              <p className="text-xs text-default-600 mt-0.5">{s.label}</p>
              {s.hint && (
                <p className="text-[11px] text-default-400 mt-1 truncate">{s.hint}</p>
              )}
            </Link>
          );
        })}
      </section>

      {/* Quick Actions */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-default-700 uppercase tracking-wide">
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
                className="group flex items-start gap-3 rounded-xl border border-divider/60 bg-content1 p-3.5 hover:border-default-300 hover:bg-content2 transition-colors"
              >
                <div className={`p-2 rounded-lg ${a.iconClass} shrink-0`}>
                  <Icon size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-default-900 leading-tight">
                    {a.label}
                  </p>
                  <p className="text-xs text-default-500 mt-0.5 line-clamp-2">
                    {a.description}
                  </p>
                </div>
                <ChevronRight
                  size={14}
                  className="text-default-300 group-hover:text-default-500 transition-colors mt-1 shrink-0"
                />
              </Link>
            );
          })}
        </div>
      </section>

      {/* Recent activity - 2 columns */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card shadow="none" className="border border-divider/60">
          <CardHeader className="pb-2 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-default-900">User Terbaru</h3>
              <p className="text-xs text-default-500">5 pendaftar terakhir</p>
            </div>
            <Button
              as={Link}
              href="/admin/users"
              size="sm"
              variant="light"
              endContent={<ChevronRight size={14} />}
            >
              Semua
            </Button>
          </CardHeader>
          <Divider />
          <CardBody className="p-0">
            {recentUsers.length === 0 ? (
              <p className="text-sm text-default-500 text-center py-8">
                Belum ada user terdaftar
              </p>
            ) : (
              <ul className="divide-y divide-divider/60">
                {recentUsers.map((u) => (
                  <li key={u.id}>
                    <Link
                      href={`/admin/users?id=${u.id}`}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-content2 transition-colors"
                    >
                      <Avatar
                        name={u.name}
                        src={u.image || undefined}
                        size="sm"
                        className="shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-default-900 truncate">
                          {u.name}
                        </p>
                        <p className="text-xs text-default-500 truncate">
                          {u.username}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Chip
                          size="sm"
                          variant="flat"
                          color={
                            u.role === 'ADMIN'
                              ? 'danger'
                              : u.role === 'DOSEN_PENGUJI'
                                ? 'secondary'
                                : 'primary'
                          }
                          className="h-5 text-[10px]"
                        >
                          {getRoleLabel(u.role)}
                        </Chip>
                        <span className="text-[10px] text-default-400 hidden sm:inline">
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

        <Card shadow="none" className="border border-divider/60">
          <CardHeader className="pb-2 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-default-900">Project Terbaru</h3>
              <p className="text-xs text-default-500">5 project terakhir dibuat</p>
            </div>
            <Button
              as={Link}
              href="/admin/projects"
              size="sm"
              variant="light"
              endContent={<ChevronRight size={14} />}
            >
              Semua
            </Button>
          </CardHeader>
          <Divider />
          <CardBody className="p-0">
            {recentProjects.length === 0 ? (
              <p className="text-sm text-default-500 text-center py-8">
                Belum ada project
              </p>
            ) : (
              <ul className="divide-y divide-divider/60">
                {recentProjects.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/admin/projects?id=${p.id}`}
                      className="flex items-start gap-3 px-4 py-2.5 hover:bg-content2 transition-colors"
                    >
                      <div className="p-1.5 rounded-md bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-300 shrink-0 mt-0.5">
                        <FolderGit2 size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-default-900 line-clamp-1">
                          {p.title}
                        </p>
                        <p className="text-xs text-default-500 truncate">
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
