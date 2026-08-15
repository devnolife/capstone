'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { addToast } from '@/lib/toast';
import {
  FolderGit2,
  FileText,
  ClipboardCheck,
  Clock,
  Plus,
  Github,
  ChevronRight,
  ExternalLink,
  Calendar,
  Trash2,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  Edit,
  Rocket,
  BookOpen,
  Target,
  Award,
  Zap,
  Users,
  Crown,
  Link2,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { cn, formatDate, getInitials, getStatusColor, getStatusLabel } from '@/lib/utils';
import { ContinueCard } from '@/components/mahasiswa/continue-card';
import type { StudentJourney } from '@/lib/student-journey';

interface ProjectMember {
  id: string;
  projectId: string;
  githubUsername: string | null;
  githubAvatarUrl: string | null;
  name: string | null;
  role: string;
  userId: string | null;
  joinedAt: Date;
}

interface Project {
  id: string;
  title: string;
  description: string | null;
  status: string;
  githubRepoUrl: string | null;
  githubRepoName: string | null;
  semester: string;
  tahunAkademik: string;
  submittedAt: Date | null;
  mahasiswaId: string;
  createdAt: Date;
  updatedAt: Date;
  documents: { id: string }[];
  reviews: { id: string; reviewer: { name: string } }[];
  members: ProjectMember[];
  _count: {
    documents: number;
    reviews: number;
  };
}

interface MahasiswaDashboardProps {
  userName: string;
  userImage?: string;
  projects: Project[];
  hasGitHubConnected?: boolean;
  githubUsername?: string;
  journey: StudentJourney;
  stats: {
    totalProjects: number;
    submittedProjects: number;
    reviewedProjects: number;
    pendingReviews: number;
    totalDocuments: number;
  };
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

// Get greeting based on time
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Selamat Pagi';
  if (hour < 15) return 'Selamat Siang';
  if (hour < 18) return 'Selamat Sore';
  return 'Selamat Malam';
};

// Stats card configurations
const STATS_CONFIG = [
  {
    key: 'total',
    label: 'Total Project',
    icon: FolderGit2,
    gradient: 'bg-[var(--color-ember)]',
    bgLight: 'bg-[var(--color-fog)] dark:bg-zinc-900/40',
    iconColor: 'text-[var(--color-ember)]',
  },
  {
    key: 'documents',
    label: 'Dokumen',
    icon: FileText,
    gradient: 'bg-[var(--color-ember)]',
    bgLight: 'bg-[var(--color-fog)] dark:bg-zinc-900/40',
    iconColor: 'text-[var(--color-ember)]',
  },
  {
    key: 'reviewed',
    label: 'Review Selesai',
    icon: ClipboardCheck,
    gradient: 'bg-emerald-500',
    bgLight: 'bg-[var(--color-fog)] dark:bg-zinc-900/40',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    key: 'pending',
    label: 'Menunggu Review',
    icon: Clock,
    gradient: 'bg-amber-500',
    bgLight: 'bg-[var(--color-fog)] dark:bg-zinc-900/40',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
];

// Quick actions configuration
const QUICK_ACTIONS = [
  {
    label: 'Buat Project Baru',
    href: '/mahasiswa/project',
    icon: Plus,
    color: 'default' as const,
    gradient: 'bg-[var(--color-ember)]',
    description: 'Mulai project capstone baru',
  },
  {
    label: 'Lihat Persyaratan',
    href: '/mahasiswa/project?tab=persyaratan',
    icon: BookOpen,
    color: 'default' as const,
    gradient: 'bg-[var(--color-obsidian)] dark:bg-white dark:text-[var(--color-obsidian)]',
    description: 'Panduan persyaratan capstone',
  },
  {
    label: 'Semua Project',
    href: '/mahasiswa/project',
    icon: FolderGit2,
    color: 'default' as const,
    gradient: 'bg-[var(--color-steel)]',
    description: 'Kelola semua project Anda',
  },
];

// Get progress based on status
const getProgress = (status: string) => {
  switch (status) {
    case 'DRAFT':
      return 15;
    case 'SUBMITTED':
      return 40;
    case 'IN_REVIEW':
      return 65;
    case 'REVISION_NEEDED':
      return 55;
    case 'APPROVED':
      return 100;
    case 'REJECTED':
      return 100;
    default:
      return 0;
  }
};

// Get status accent
const STATUS_BADGE_CLASS: Record<string, string> = {
  default: 'bg-muted text-muted-foreground',
  primary: 'bg-primary/10 text-primary',
  secondary: 'bg-secondary text-secondary-foreground',
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-warning',
  danger: 'bg-destructive/10 text-destructive',
};

const STATUS_PROGRESS_CLASS: Record<string, string> = {
  default: '[&_[data-slot=progress-indicator]]:bg-muted-foreground',
  primary: '',
  secondary: '[&_[data-slot=progress-indicator]]:bg-secondary-foreground',
  success: '[&_[data-slot=progress-indicator]]:bg-success',
  warning: '[&_[data-slot=progress-indicator]]:bg-warning',
  danger: '[&_[data-slot=progress-indicator]]:bg-destructive',
};

const getStatusGradient = (status: string) => {
  switch (status) {
    case 'APPROVED':
      return 'bg-emerald-500';
    case 'REJECTED':
      return 'bg-rose-500';
    case 'IN_REVIEW':
      return 'bg-amber-500';
    case 'SUBMITTED':
      return 'bg-[var(--color-ember)]';
    case 'REVISION_NEEDED':
      return 'bg-orange-500';
    default:
      return 'bg-[var(--color-steel)]';
  }
};

export function MahasiswaDashboardContent({
  userName,
  userImage,
  projects,
  hasGitHubConnected,
  githubUsername,
  journey,
  stats,
}: MahasiswaDashboardProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (project: Project) => {
    setSelectedProject(project);
    onOpen();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProject) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/projects/${selectedProject.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        addToast({
          title: 'Berhasil',
          description: 'Project berhasil dihapus',
          color: 'success',
        });
        onClose();
        router.refresh();
      } else {
        const data = await response.json();
        addToast({
          title: 'Gagal',
          description: data.error || 'Gagal menghapus project',
          color: 'danger',
        });
      }
    } catch {
      addToast({
        title: 'Error',
        description: 'Terjadi kesalahan saat menghapus project',
        color: 'danger',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatsValue = (key: string) => {
    switch (key) {
      case 'total':
        return stats.totalProjects;
      case 'documents':
        return stats.totalDocuments;
      case 'reviewed':
        return stats.reviewedProjects;
      case 'pending':
        return stats.pendingReviews;
      default:
        return 0;
    }
  };

  const firstName = userName.split(' ')[0];

  return (
    <motion.div
      className="w-full space-y-6 pb-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero Welcome Card */}
      <motion.div variants={itemVariants}>
        <div className="ae-card ae-noise relative overflow-hidden rounded-2xl bg-[var(--color-snow)] dark:bg-[var(--color-obsidian)] border border-[var(--color-pebble)] dark:border-[var(--color-graphite)] p-6 md:p-8 hover:shadow-xl transition-all">
          <div className="absolute inset-x-0 top-0 h-1 bg-[var(--color-ember)]" />

          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Left side - Welcome */}
            <div className="flex items-center gap-4">
              <Avatar className="size-16 md:size-20 ring-4 ring-[var(--color-fog)] dark:ring-[var(--color-graphite)]">
                <AvatarImage src={userImage} alt={userName} />
                <AvatarFallback className="text-lg">{getInitials(userName)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles size={16} className="text-[var(--color-ember)]" />
                  <span className="font-mono-display text-[10px] uppercase tracking-widest font-bold text-[var(--color-steel)]">{getGreeting()}</span>
                </div>
                <h1 className="font-sans-display text-2xl md:text-3xl font-bold tracking-tight text-[var(--color-obsidian)] dark:text-white">{firstName}!</h1>
                <p className="text-[var(--color-steel)] text-sm md:text-base mt-1">
                  Kelola project capstone Anda di sini
                </p>
              </div>
            </div>

            {/* Right side - Quick Stats */}
            <div className="flex items-center gap-3 md:gap-4">
              <div className="text-center px-4 py-2 rounded-xl bg-[var(--color-mist)] dark:bg-zinc-900/40 border border-[var(--color-pebble)] dark:border-[var(--color-graphite)]">
                <p className="font-sans-display text-2xl md:text-3xl font-bold text-[var(--color-ember)]">{stats.totalProjects}</p>
                <p className="font-mono-display text-[10px] uppercase tracking-widest font-bold text-[var(--color-steel)]">Project</p>
              </div>
              <div className="text-center px-4 py-2 rounded-xl bg-[var(--color-mist)] dark:bg-zinc-900/40 border border-[var(--color-pebble)] dark:border-[var(--color-graphite)]">
                <p className="font-sans-display text-2xl md:text-3xl font-bold text-[var(--color-ember)]">{stats.submittedProjects}</p>
                <p className="font-mono-display text-[10px] uppercase tracking-widest font-bold text-[var(--color-steel)]">Disubmit</p>
              </div>
              {stats.pendingReviews > 0 && (
                <div className="text-center px-4 py-2 rounded-xl bg-[var(--color-mist)] dark:bg-zinc-900/40 border border-amber-300/70 dark:border-amber-700/50">
                  <p className="font-sans-display text-2xl md:text-3xl font-bold text-amber-700 dark:text-amber-300">{stats.pendingReviews}</p>
                  <p className="font-mono-display text-[10px] uppercase tracking-widest font-bold text-amber-600 dark:text-amber-400">Pending</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* GitHub Connection Banner */}
      {!hasGitHubConnected && (
        <motion.div variants={itemVariants}>
          <Card className="bg-[var(--color-snow)] dark:bg-[var(--color-obsidian)] border-2 border-dashed border-amber-300 dark:border-amber-700 rounded-2xl">
            <CardContent className="p-4 md:p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-2xl bg-[var(--color-fog)] dark:bg-zinc-900/40 border border-amber-300/70 dark:border-amber-700/50">
                    <Github size={24} className="text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-sans-display font-bold tracking-tight text-amber-700 dark:text-amber-300">
                      Hubungkan Akun GitHub
                    </h3>
                    <p className="text-sm text-[var(--color-steel)] mt-0.5">
                      Hubungkan akun GitHub Anda untuk memilih repository project capstone
                    </p>
                  </div>
                </div>
                <Link
                  href="/mahasiswa/settings"
                  className={cn(
                    buttonVariants({ variant: 'outline' }),
                    'shrink-0 border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-300'
                  )}
                >
                  <Link2 size={16} />
                  Hubungkan Sekarang
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* GitHub Connected Success */}
      {hasGitHubConnected && githubUsername && (
        <motion.div variants={itemVariants}>
          <Card className="bg-[var(--color-snow)] dark:bg-[var(--color-obsidian)] border border-emerald-200 dark:border-emerald-800 rounded-2xl">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-2xl bg-[var(--color-fog)] dark:bg-zinc-900/40 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1">
                  <p className="font-sans-display text-sm font-bold tracking-tight text-emerald-700 dark:text-emerald-300">
                    GitHub Terhubung
                  </p>
                  <p className="font-mono-display text-[10px] uppercase tracking-widest font-bold text-[var(--color-steel)]">
                    @{githubUsername}
                  </p>
                </div>
                <a
                  href={`https://github.com/${githubUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ variant: 'ghost', size: 'sm' }),
                    'text-emerald-700 dark:text-emerald-300'
                  )}
                >
                  <Github size={14} />
                  Lihat Profil
                </a>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Lanjutkan pekerjaan — 1 aksi jelas, detail lengkap di workspace */}
      <motion.div variants={itemVariants}>
        <ContinueCard journey={journey} />
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {STATS_CONFIG.map((stat) => {
            const Icon = stat.icon;
            const value = getStatsValue(stat.key);
            return (
              <Card
                key={stat.key}
                className="ae-card bg-[var(--color-snow)] dark:bg-[var(--color-obsidian)] border border-[var(--color-pebble)] dark:border-[var(--color-graphite)] rounded-2xl overflow-hidden group hover:shadow-xl transition-all"
              >
                <CardContent className="p-4 md:p-5">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="font-mono-display text-[9px] md:text-[10px] uppercase tracking-widest font-bold text-[var(--color-steel)]">{stat.label}</p>
                      <p className="font-sans-display text-2xl md:text-3xl font-bold tracking-tight text-[var(--color-ember)]">{value}</p>
                    </div>
                    <div className={`p-2.5 rounded-2xl border border-[var(--color-pebble)] dark:border-[var(--color-graphite)] ${stat.bgLight} transition-transform group-hover:scale-105`}>
                      <Icon size={20} className={stat.iconColor} />
                    </div>
                  </div>
                  <div className="h-1 mt-4 rounded-full bg-[var(--color-fog)] dark:bg-zinc-800 overflow-hidden">
                    <div className={`h-full rounded-full ${stat.gradient} opacity-80 group-hover:opacity-100 transition-opacity`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects Section */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          {/* Projects Card */}
          <Card className="ae-card bg-[var(--color-snow)] dark:bg-[var(--color-obsidian)] border border-[var(--color-pebble)] dark:border-[var(--color-graphite)] rounded-2xl overflow-hidden hover:shadow-xl transition-all">
            {/* Header */}
            <div className="p-5 bg-[var(--color-mist)] dark:bg-zinc-900/40 border-b border-[var(--color-pebble)] dark:border-[var(--color-graphite)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl border border-[var(--color-pebble)] dark:border-[var(--color-graphite)] bg-[var(--color-fog)] dark:bg-zinc-900/40">
                    <Rocket size={20} className="text-[var(--color-ember)]" />
                  </div>
                  <div>
                    <h2 className="font-sans-display font-bold tracking-tight text-lg text-[var(--color-obsidian)] dark:text-white">Project Saya</h2>
                    <p className="font-mono-display text-[10px] uppercase tracking-widest font-bold text-[var(--color-steel)]">
                      {projects.length === 0 ? 'Belum ada project' : `${projects.length} project`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href="/mahasiswa/project"
                    className={cn(
                      buttonVariants({ size: 'sm' }),
                      'hidden md:flex bg-[var(--color-ember)] text-white font-mono-display text-[10px] uppercase tracking-widest font-bold'
                    )}
                  >
                    <Plus size={16} />
                    Buat Baru
                  </Link>
                  <Link
                    href="/mahasiswa/project"
                    className={cn(
                      buttonVariants({ variant: 'outline', size: 'sm' }),
                      'font-mono-display text-[10px] uppercase tracking-widest font-bold border border-[var(--color-pebble)] dark:border-[var(--color-graphite)]'
                    )}
                  >
                    Semua
                    <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            </div>

            <CardContent className="p-0">
              {projects.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-2xl border border-[var(--color-pebble)] dark:border-[var(--color-graphite)] bg-[var(--color-fog)] dark:bg-zinc-900/40 flex items-center justify-center">
                    <FolderGit2 size={36} className="text-[var(--color-ember)]" />
                  </div>
                  <h3 className="font-sans-display font-bold tracking-tight text-lg mb-2 text-[var(--color-obsidian)] dark:text-white">Belum Ada Project</h3>
                  <p className="text-[var(--color-steel)] mb-4 text-sm max-w-sm mx-auto">
                    Mulai perjalanan capstone Anda dengan membuat project pertama!
                  </p>
                  <Link
                    href="/mahasiswa/project"
                    className={cn(
                      buttonVariants({ size: 'lg' }),
                      'bg-[var(--color-ember)] text-white font-mono-display text-[10px] uppercase tracking-widest font-bold'
                    )}
                  >
                    <Zap size={18} />
                    Buat Project Sekarang
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-[var(--color-pebble)] dark:divide-[var(--color-graphite)]">
                  {projects.slice(0, 3).map((project, index) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 md:p-5 hover:bg-[var(--color-mist)] dark:hover:bg-zinc-900/40 transition-colors"
                    >
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        {/* Project Info */}
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {/* Status indicator */}
                          <div className={`p-2.5 rounded-2xl ${getStatusGradient(project.status)} text-white shrink-0`}>
                            <FolderGit2 size={18} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Link
                                href={`/mahasiswa/project?project=${project.id}`}
                                className="font-sans-display font-bold tracking-tight text-base text-[var(--color-obsidian)] dark:text-white hover:text-[var(--color-ember)] transition-colors truncate"
                              >
                                {project.title}
                              </Link>
                              <Badge
                                className={cn(
                                  'shrink-0',
                                  STATUS_BADGE_CLASS[getStatusColor(project.status)]
                                )}
                              >
                                {getStatusLabel(project.status)}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--color-steel)]">
                              <span className="flex items-center gap-1">
                                <Calendar size={12} />
                                {project.semester}
                              </span>
                              <span className="flex items-center gap-1">
                                <FileText size={12} />
                                {project._count.documents} dok
                              </span>
                              <span className="flex items-center gap-1">
                                <ClipboardCheck size={12} />
                                {project._count.reviews} review
                              </span>
                              {project.githubRepoUrl && (
                                <a
                                  href={project.githubRepoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-[var(--color-ember)] hover:underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Github size={12} />
                                  <ExternalLink size={10} />
                                </a>
                              )}
                            </div>

                            {/* Progress bar */}
                            <div className="mt-3 space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-[var(--color-steel)]">Progress</span>
                                <span className="font-medium">{getProgress(project.status)}%</span>
                              </div>
                              <Progress
                                value={getProgress(project.status)}
                                className={cn(
                                  '[&_[data-slot=progress-track]]:h-1.5',
                                  STATUS_PROGRESS_CLASS[getStatusColor(project.status)]
                                )}
                              />
                            </div>

                            {/* Team Members */}
                            {project.members && project.members.length > 0 && (
                              <div className="mt-3 p-3 rounded-xl bg-[var(--color-mist)] dark:bg-zinc-900/40 border border-[var(--color-pebble)] dark:border-[var(--color-graphite)]">
                                <div className="flex items-center gap-2 mb-2">
                                  <Users size={12} className="text-[var(--color-steel)]" />
                                  <span className="font-mono-display text-[10px] uppercase tracking-widest font-bold text-[var(--color-steel)]">
                                    Anggota Tim ({project.members.length})
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {project.members.map((member) => (
                                    <div
                                      key={member.id}
                                      className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[var(--color-snow)] dark:bg-[var(--color-obsidian)] border border-[var(--color-pebble)] dark:border-[var(--color-graphite)]"
                                    >
                                      <Avatar size="sm" className="size-5">
                                        <AvatarImage
                                          src={member.githubAvatarUrl || undefined}
                                          alt={member.name || member.githubUsername || 'Member'}
                                        />
                                        <AvatarFallback className="text-[8px]">
                                          {getInitials(member.name || member.githubUsername || 'Member')}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className="text-xs font-medium truncate max-w-[100px]">
                                        {member.name || member.githubUsername || 'Member'}
                                      </span>
                                      {member.role === 'leader' && (
                                        <Crown size={10} className="text-amber-500 shrink-0" />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0 md:ml-4">
                          <Link
                            href={`/mahasiswa/project?project=${project.id}`}
                            className={cn(
                              buttonVariants({ variant: 'outline', size: 'sm' }),
                              'font-mono-display text-[10px] uppercase tracking-widest font-bold'
                            )}
                          >
                            Detail
                          </Link>
                          {project.status === 'DRAFT' && (
                            <>
                              <Link
                                href={`/mahasiswa/project?project=${project.id}&tab=repository`}
                                className={cn(
                                  buttonVariants({ variant: 'ghost', size: 'sm' }),
                                  'bg-[var(--color-ember)]/10 text-[var(--color-ember)] font-mono-display text-[10px] uppercase tracking-widest font-bold'
                                )}
                              >
                                <Edit size={14} />
                                Edit
                              </Link>
                              <Button
                                size="icon-sm"
                                variant="destructive"
                                onClick={() => handleDeleteClick(project)}
                              >
                                <Trash2 size={14} />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Updated timestamp */}
                      <p className="font-mono-display text-[10px] uppercase tracking-widest text-[var(--color-steel)] mt-3 md:ml-14">
                        Diperbarui: {formatDate(project.updatedAt)}
                      </p>
                    </motion.div>
                  ))}

                  {projects.length > 3 && (
                    <div className="p-4 text-center bg-[var(--color-mist)] dark:bg-zinc-900/40">
                      <Link
                        href="/mahasiswa/project"
                        className={cn(
                          buttonVariants({ variant: 'ghost' }),
                          'text-[var(--color-ember)] font-mono-display text-[10px] uppercase tracking-widest font-bold'
                        )}
                      >
                        Lihat Semua Project ({projects.length})
                        <ChevronRight size={16} />
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Sidebar */}
        <motion.div variants={itemVariants} className="space-y-6">
          {/* Quick Actions Card */}
          <Card className="ae-card bg-[var(--color-snow)] dark:bg-[var(--color-obsidian)] border border-[var(--color-pebble)] dark:border-[var(--color-graphite)] rounded-2xl overflow-hidden hover:shadow-xl transition-all">
            <div className="p-4 bg-[var(--color-mist)] dark:bg-zinc-900/40 border-b border-[var(--color-pebble)] dark:border-[var(--color-graphite)]">
              <div className="flex items-center gap-2">
                <Target size={18} className="text-[var(--color-ember)]" />
                <h3 className="font-sans-display font-bold tracking-tight text-[var(--color-obsidian)] dark:text-white">Aksi Cepat</h3>
              </div>
            </div>
            <CardContent className="p-4 space-y-3">
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--color-mist)] dark:hover:bg-zinc-900/40 transition-colors group"
                  >
                    <div className={`p-2.5 rounded-2xl ${action.gradient} text-white shrink-0 transition-transform group-hover:scale-105`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-sans-display font-bold text-sm text-[var(--color-obsidian)] dark:text-white group-hover:text-[var(--color-ember)] transition-colors">
                        {action.label}
                      </p>
                      <p className="text-xs text-[var(--color-steel)] truncate">{action.description}</p>
                    </div>
                    <ChevronRight size={16} className="text-[var(--color-steel)] group-hover:text-[var(--color-ember)] transition-colors" />
                  </Link>
                );
              })}
            </CardContent>
          </Card>

          {/* Progress Overview Card */}
          <Card className="ae-card bg-[var(--color-snow)] dark:bg-[var(--color-obsidian)] border border-[var(--color-pebble)] dark:border-[var(--color-graphite)] rounded-2xl overflow-hidden hover:shadow-xl transition-all">
            <div className="p-4 bg-[var(--color-mist)] dark:bg-zinc-900/40 border-b border-[var(--color-pebble)] dark:border-[var(--color-graphite)]">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-[var(--color-ember)]" />
                <h3 className="font-sans-display font-bold tracking-tight text-[var(--color-obsidian)] dark:text-white">Ringkasan Progress</h3>
              </div>
            </div>
            <CardContent className="p-5">
              <div className="space-y-5">
                {/* Overall progress - Larger ring */}
                <div className="text-center py-6">
                  <div className="relative w-32 h-32 mx-auto">
                    <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                      {/* Background circle */}
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="10"
                        className="text-[var(--color-fog)] dark:text-zinc-800"
                      />
                      {/* Progress circle */}
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        fill="none"
                        stroke="url(#progressGradient)"
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={314}
                        strokeDashoffset={
                          314 - (314 * (stats.totalProjects > 0 ? (stats.reviewedProjects / stats.totalProjects) * 100 : 0)) / 100
                        }
                        className="transition-all duration-1000 ease-out"
                      />
                      <defs>
                        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="var(--color-ember)" />
                          <stop offset="100%" stopColor="var(--color-orchid-flash)" />
                        </linearGradient>
                      </defs>
                    </svg>
                    {/* Center text - positioned properly */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="font-sans-display text-3xl font-bold text-[var(--color-ember)]">
                        {stats.totalProjects > 0 ? Math.round((stats.reviewedProjects / stats.totalProjects) * 100) : 0}%
                      </span>
                      <span className="font-mono-display text-[10px] uppercase tracking-widest font-bold text-[var(--color-steel)] mt-1">Selesai</span>
                    </div>
                  </div>
                </div>

                {/* Stats breakdown */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-mist)] dark:bg-zinc-900/40 border border-[var(--color-pebble)] dark:border-[var(--color-graphite)]">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-emerald-500/10">
                        <Award size={14} className="text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <span className="text-sm font-medium">Approved</span>
                    </div>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {stats.reviewedProjects}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-mist)] dark:bg-zinc-900/40 border border-[var(--color-pebble)] dark:border-[var(--color-graphite)]">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-amber-500/10">
                        <Clock size={14} className="text-amber-600 dark:text-amber-400" />
                      </div>
                      <span className="text-sm font-medium">Dalam Review</span>
                    </div>
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      {stats.pendingReviews}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-mist)] dark:bg-zinc-900/40 border border-[var(--color-pebble)] dark:border-[var(--color-graphite)]">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-[var(--color-fog)] dark:bg-zinc-800">
                        <FileText size={14} className="text-[var(--color-steel)]" />
                      </div>
                      <span className="text-sm font-medium">Draft</span>
                    </div>
                    <span className="font-bold text-[var(--color-steel)]">
                      {stats.totalProjects - stats.submittedProjects}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle size={20} />
              Hapus Project
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-[var(--color-steel)]">
              Apakah Anda yakin ingin menghapus project{' '}
              <span className="font-semibold text-[var(--color-obsidian)] dark:text-white">&quot;{selectedProject?.title}&quot;</span>?
            </p>
            <p className="text-sm text-[var(--color-steel)]">
              Tindakan ini tidak dapat dibatalkan. Semua data project termasuk dokumen dan review akan dihapus.
            </p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={onClose} disabled={isDeleting}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="animate-spin" />}
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
