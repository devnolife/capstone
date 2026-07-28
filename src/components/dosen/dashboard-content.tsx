'use client';

import Link from 'next/link';
import {
  Card,
  CardBody,
  Button,
  Chip,
  Avatar,
} from '@heroui/react';
import {
  FolderGit2,
  Users,
  Clock,
  CheckCircle2,
  ChevronRight,
  Activity,
  ClipboardCheck,
  TrendingUp,
  Eye,
} from 'lucide-react';
import { getStatusColor, getStatusLabel, formatDateTime, getSimakPhotoUrl } from '@/lib/utils';

interface Project {
  id: string;
  title: string;
  semester: string;
  tahunAkademik: string | null;
  status: string;
  mahasiswa: {
    id: string;
    name: string;
    username: string;
    image: string | null;
    profilePhoto: string | null;
  };
  _count: {
    documents: number;
    reviews: number;
  };
}

interface ReviewActivity {
  id: string;
  status: string;
  updatedAt: Date;
  project: {
    id: string;
    title: string;
    mahasiswa: {
      name: string;
    };
  };
}

interface DosenDashboardContentProps {
  userName: string;
  stats: {
    totalAssigned: number;
    pendingReview: number;
    completedReview: number;
    totalMahasiswa: number;
  };
  recentProjects: Project[];
  recentActivities: ReviewActivity[];
}

// Get greeting based on time
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Selamat Pagi';
  if (hour < 15) return 'Selamat Siang';
  if (hour < 18) return 'Selamat Sore';
  return 'Selamat Malam';
}

export function DosenDashboardContent({
  userName,
  stats,
  recentProjects,
  recentActivities,
}: DosenDashboardContentProps) {
  const statCardClass =
    'bg-[var(--color-snow)] dark:bg-[var(--color-obsidian)] border border-[var(--color-pebble)] dark:border-[var(--color-graphite)] rounded-2xl hover:shadow-xl transition-all';
  const iconContainerClass =
    'p-2.5 rounded-2xl border border-[var(--color-pebble)] dark:border-[var(--color-graphite)] bg-[var(--color-fog)] dark:bg-zinc-900/40';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="font-mono-display text-[10px] uppercase tracking-widest font-bold text-[var(--color-steel)]">
            Dashboard Dosen
          </p>
          <h1 className="font-sans-display text-2xl font-bold tracking-tight text-[var(--color-obsidian)] dark:text-white">
            {getGreeting()}, {userName}!
          </h1>
          <p className="text-sm text-[var(--color-steel)]">
            {new Date().toLocaleDateString('id-ID', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
        <Button
          as={Link}
          href="/dosen/projects"
          className="bg-[var(--color-ember)] text-white font-mono-display text-[10px] uppercase tracking-widest font-bold"
          endContent={<ChevronRight size={16} />}
        >
          Lihat Semua Project
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card shadow="none" className={statCardClass}>
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className={iconContainerClass}>
                <FolderGit2 size={20} className="text-[var(--color-ember)]" />
              </div>
              <div>
                <p className="font-sans-display text-2xl font-bold tracking-tight text-[var(--color-obsidian)] dark:text-white tabular-nums">{stats.totalAssigned}</p>
                <p className="font-mono-display text-[9px] uppercase tracking-widest font-bold text-[var(--color-steel)]">Total Project</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card shadow="none" className={statCardClass}>
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className={iconContainerClass}>
                <Clock size={20} className="text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="font-sans-display text-2xl font-bold tracking-tight text-[var(--color-obsidian)] dark:text-white tabular-nums">{stats.pendingReview}</p>
                <p className="font-mono-display text-[9px] uppercase tracking-widest font-bold text-[var(--color-steel)]">Perlu Direview</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card shadow="none" className={statCardClass}>
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className={iconContainerClass}>
                <CheckCircle2 size={20} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="font-sans-display text-2xl font-bold tracking-tight text-[var(--color-obsidian)] dark:text-white tabular-nums">{stats.completedReview}</p>
                <p className="font-mono-display text-[9px] uppercase tracking-widest font-bold text-[var(--color-steel)]">Selesai Review</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card shadow="none" className={statCardClass}>
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className={iconContainerClass}>
                <Users size={20} className="text-[var(--color-steel)]" />
              </div>
              <div>
                <p className="font-sans-display text-2xl font-bold tracking-tight text-[var(--color-obsidian)] dark:text-white tabular-nums">{stats.totalMahasiswa}</p>
                <p className="font-mono-display text-[9px] uppercase tracking-widest font-bold text-[var(--color-steel)]">Mahasiswa</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left - Project List */}
        <div className="lg:col-span-2">
          <Card shadow="none" className="bg-[var(--color-snow)] dark:bg-[var(--color-obsidian)] border border-[var(--color-pebble)] dark:border-[var(--color-graphite)] rounded-2xl hover:shadow-xl transition-all">
            <CardBody className="p-0">
              <div className="p-4 border-b border-[var(--color-pebble)] dark:border-[var(--color-graphite)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-2xl border border-[var(--color-pebble)] dark:border-[var(--color-graphite)] bg-[var(--color-fog)] dark:bg-zinc-900/40">
                      <FolderGit2 size={16} className="text-[var(--color-ember)]" />
                    </div>
                    <div>
                      <p className="font-mono-display text-[9px] uppercase tracking-widest font-bold text-[var(--color-steel)]">Daftar Project</p>
                      <h3 className="font-sans-display font-bold tracking-tight text-[var(--color-obsidian)] dark:text-white">Project Terbaru</h3>
                    </div>
                  </div>
                  <Button
                    as={Link}
                    href="/dosen/projects"
                    size="sm"
                    variant="light"
                    className="font-mono-display text-[10px] uppercase tracking-widest font-bold text-[var(--color-steel)] hover:text-[var(--color-ember)]"
                    endContent={<ChevronRight size={14} />}
                  >
                    Lihat Semua
                  </Button>
                </div>
              </div>
              <div className="divide-y divide-[var(--color-pebble)] dark:divide-[var(--color-graphite)]">
                {recentProjects.length === 0 ? (
                  <div className="p-8 text-center">
                    <FolderGit2 size={40} className="mx-auto mb-3 text-[var(--color-steel)] opacity-60" />
                    <p className="text-sm text-[var(--color-steel)]">Belum ada project yang ditugaskan</p>
                  </div>
                ) : (
                  recentProjects.map((project) => (
                    <div
                      key={project.id}
                      className="p-4 hover:bg-[var(--color-mist)] dark:hover:bg-zinc-900/50 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar
                            name={project.mahasiswa.name}
                            src={getSimakPhotoUrl(project.mahasiswa.profilePhoto || project.mahasiswa.image || project.mahasiswa.username)}
                            size="sm"
                          />
                          <div className="min-w-0">
                            <h4 className="font-sans-display font-bold tracking-tight text-sm truncate text-[var(--color-obsidian)] dark:text-white">{project.title}</h4>
                            <p className="text-xs text-[var(--color-steel)]">
                              {project.mahasiswa.name} • {project.semester} {project.tahunAkademik}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Chip size="sm" color={getStatusColor(project.status)} variant="flat">
                            {getStatusLabel(project.status)}
                          </Chip>
                          <Button
                            as={Link}
                            href={`/dosen/projects/${project.id}`}
                            size="sm"
                            variant="light"
                            isIconOnly
                          >
                            <Eye size={16} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right - Activity */}
        <div>
          <Card shadow="none" className="bg-[var(--color-snow)] dark:bg-[var(--color-obsidian)] border border-[var(--color-pebble)] dark:border-[var(--color-graphite)] rounded-2xl hover:shadow-xl transition-all">
            <CardBody className="p-0">
              <div className="p-4 border-b border-[var(--color-pebble)] dark:border-[var(--color-graphite)]">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-2xl border border-[var(--color-pebble)] dark:border-[var(--color-graphite)] bg-[var(--color-fog)] dark:bg-zinc-900/40">
                    <Activity size={16} className="text-[var(--color-ember)]" />
                  </div>
                  <div>
                    <p className="font-mono-display text-[9px] uppercase tracking-widest font-bold text-[var(--color-steel)]">Log Review</p>
                    <h3 className="font-sans-display font-bold tracking-tight text-[var(--color-obsidian)] dark:text-white">Aktivitas Terbaru</h3>
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-4">
                {recentActivities.length === 0 ? (
                  <div className="py-6 text-center">
                    <Activity size={32} className="mx-auto mb-2 text-[var(--color-steel)] opacity-60" />
                    <p className="text-sm text-[var(--color-steel)]">Belum ada aktivitas</p>
                  </div>
                ) : (
                  recentActivities.map((activity, idx) => (
                    <div key={activity.id} className="flex gap-3">
                      <div className="relative">
                        <div className="w-8 h-8 rounded-full border border-[var(--color-pebble)] dark:border-[var(--color-graphite)] bg-[var(--color-fog)] dark:bg-zinc-900/40 flex items-center justify-center">
                          <ClipboardCheck size={14} className="text-[var(--color-ember)]" />
                        </div>
                        {idx < recentActivities.length - 1 && (
                          <div className="absolute top-8 left-1/2 -translate-x-1/2 w-px h-6 bg-[var(--color-pebble)] dark:bg-[var(--color-graphite)]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 pb-4">
                        <p className="text-sm font-semibold truncate text-[var(--color-obsidian)] dark:text-white">{activity.project.title}</p>
                        <p className="text-xs text-[var(--color-steel)]">Review untuk {activity.project.mahasiswa.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Chip size="sm" color={getStatusColor(activity.status)} variant="flat">
                            {getStatusLabel(activity.status)}
                          </Chip>
                          <span className="text-xs text-[var(--color-steel)]">
                            {formatDateTime(activity.updatedAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardBody>
          </Card>

          {/* Quick Actions */}
          <Card shadow="none" className="bg-[var(--color-snow)] dark:bg-[var(--color-obsidian)] border border-[var(--color-pebble)] dark:border-[var(--color-graphite)] rounded-2xl hover:shadow-xl transition-all mt-4">
            <CardBody className="p-4">
              <p className="font-mono-display text-[9px] uppercase tracking-widest font-bold text-[var(--color-steel)]">Navigasi</p>
              <h3 className="font-sans-display font-bold tracking-tight text-sm mb-3 text-[var(--color-obsidian)] dark:text-white">Aksi Cepat</h3>
              <div className="space-y-2">
                <Button
                  as={Link}
                  href="/dosen/reviews"
                  variant="flat"
                  className="w-full justify-start bg-[var(--color-fog)] dark:bg-zinc-900/40 text-[var(--color-obsidian)] dark:text-white border border-[var(--color-pebble)] dark:border-[var(--color-graphite)]"
                  startContent={<ClipboardCheck size={16} />}
                >
                  Lihat Review Saya
                </Button>
                <Button
                  as={Link}
                  href="/dosen/auto-review"
                  variant="flat"
                  className="w-full justify-start bg-[var(--color-fog)] dark:bg-zinc-900/40 text-[var(--color-obsidian)] dark:text-white border border-[var(--color-pebble)] dark:border-[var(--color-graphite)]"
                  startContent={<TrendingUp size={16} />}
                >
                  Auto Review (AI)
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
