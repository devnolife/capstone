'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Button,
  Card,
  CardBody,
  Chip,
  Progress,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  addToast,
  Avatar,
} from '@heroui/react';
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
} from 'lucide-react';
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';

interface ProjectMember {
  id: string;
  projectId: string;
  githubUsername: string | null;
  githubId: string | null;
  githubAvatarUrl: string | null;
  name: string | null;
  role: string;
  userId: string | null;
  addedAt: Date;
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
    gradient: 'from-blue-500 via-indigo-500 to-violet-500',
    bgLight: 'bg-blue-50 dark:bg-blue-900/20',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    key: 'documents',
    label: 'Dokumen',
    icon: FileText,
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
    bgLight: 'bg-violet-50 dark:bg-violet-900/20',
    iconColor: 'text-violet-600 dark:text-violet-400',
  },
  {
    key: 'reviewed',
    label: 'Review Selesai',
    icon: ClipboardCheck,
    gradient: 'from-emerald-500 via-green-500 to-teal-500',
    bgLight: 'bg-emerald-50 dark:bg-emerald-900/20',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    key: 'pending',
    label: 'Menunggu Review',
    icon: Clock,
    gradient: 'from-amber-500 via-orange-500 to-yellow-500',
    bgLight: 'bg-amber-50 dark:bg-amber-900/20',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
];

// Quick actions configuration
const QUICK_ACTIONS = [
  {
    label: 'Buat Project Baru',
    href: '/mahasiswa/projects/new',
    icon: Plus,
    color: 'primary' as const,
    gradient: 'from-blue-500 to-indigo-500',
    description: 'Mulai project capstone baru',
  },
  {
    label: 'Lihat Persyaratan',
    href: '/mahasiswa/persyaratan',
    icon: BookOpen,
    color: 'secondary' as const,
    gradient: 'from-violet-500 to-purple-500',
    description: 'Panduan persyaratan capstone',
  },
  {
    label: 'Semua Project',
    href: '/mahasiswa/projects',
    icon: FolderGit2,
    color: 'default' as const,
    gradient: 'from-zinc-500 to-zinc-600',
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

// Get status gradient
const getStatusGradient = (status: string) => {
  switch (status) {
    case 'APPROVED':
      return 'from-emerald-500 to-green-400';
    case 'REJECTED':
      return 'from-red-500 to-rose-400';
    case 'IN_REVIEW':
      return 'from-amber-500 to-orange-400';
    case 'SUBMITTED':
      return 'from-blue-500 to-indigo-400';
    case 'REVISION_NEEDED':
      return 'from-orange-500 to-amber-400';
    default:
      return 'from-zinc-500 to-zinc-400';
  }
};

export function MahasiswaDashboardContent({
  userName,
  userImage,
  projects,
  hasGitHubConnected,
  githubUsername,
  stats,
}: MahasiswaDashboardProps) {
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
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
      {/* Hero Welcome Card - Soft Colored */}
      <motion.div variants={itemVariants}>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-violet-950/40 border border-blue-200/50 dark:border-blue-800/30 p-6 md:p-8">
          {/* Subtle Background Accents */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-violet-400/15 to-blue-400/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
          
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Left side - Welcome */}
            <div className="flex items-center gap-4">
              <Avatar
                name={userName}
                src={userImage}
                size="lg"
                className="ring-4 ring-blue-200 dark:ring-blue-800 w-16 h-16 md:w-20 md:h-20"
              />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles size={16} className="text-blue-500" />
                  <span className="text-sm text-blue-600/70 dark:text-blue-400/70">{getGreeting()}</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-zinc-800 dark:text-zinc-100">{firstName}!</h1>
                <p className="text-blue-600/70 dark:text-blue-400/60 text-sm md:text-base mt-1">
                  Kelola project capstone Anda di sini
                </p>
              </div>
            </div>

            {/* Right side - Quick Stats */}
            <div className="flex items-center gap-3 md:gap-4">
              <div className="text-center px-4 py-2 rounded-xl bg-white/60 dark:bg-zinc-800/60 border border-blue-200/50 dark:border-blue-700/30">
                <p className="text-2xl md:text-3xl font-bold text-blue-700 dark:text-blue-300">{stats.totalProjects}</p>
                <p className="text-xs text-blue-600/70 dark:text-blue-400/70">Project</p>
              </div>
              <div className="text-center px-4 py-2 rounded-xl bg-white/60 dark:bg-zinc-800/60 border border-blue-200/50 dark:border-blue-700/30">
                <p className="text-2xl md:text-3xl font-bold text-blue-700 dark:text-blue-300">{stats.submittedProjects}</p>
                <p className="text-xs text-blue-600/70 dark:text-blue-400/70">Disubmit</p>
              </div>
              {stats.pendingReviews > 0 && (
                <div className="text-center px-4 py-2 rounded-xl bg-amber-100/80 dark:bg-amber-900/30 border border-amber-300/50 dark:border-amber-700/30">
                  <p className="text-2xl md:text-3xl font-bold text-amber-700 dark:text-amber-300">{stats.pendingReviews}</p>
                  <p className="text-xs text-amber-600/70 dark:text-amber-400/70">Pending</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* GitHub Connection Banner */}
      {!hasGitHubConnected && (
        <motion.div variants={itemVariants}>
          <Card className="border-2 border-dashed border-warning-300 dark:border-warning-700 bg-warning-50/50 dark:bg-warning-900/20">
            <CardBody className="p-4 md:p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-warning-100 dark:bg-warning-800/50">
                    <Github size={24} className="text-warning-600 dark:text-warning-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-warning-700 dark:text-warning-300">
                      Hubungkan Akun GitHub
                    </h3>
                    <p className="text-sm text-warning-600/80 dark:text-warning-400/80 mt-0.5">
                      Hubungkan akun GitHub Anda untuk memilih repository project capstone
                    </p>
                  </div>
                </div>
                <Button
                  as={Link}
                  href="/mahasiswa/settings"
                  color="warning"
                  variant="flat"
                  startContent={<Link2 size={16} />}
                  className="shrink-0"
                >
                  Hubungkan Sekarang
                </Button>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      )}

      {/* GitHub Connected Success */}
      {hasGitHubConnected && githubUsername && (
        <motion.div variants={itemVariants}>
          <Card className="border border-success-200 dark:border-success-800 bg-success-50/50 dark:bg-success-900/20">
            <CardBody className="p-3 md:p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success-100 dark:bg-success-800/50">
                  <CheckCircle2 size={18} className="text-success-600 dark:text-success-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-success-700 dark:text-success-300">
                    GitHub Terhubung
                  </p>
                  <p className="text-xs text-success-600/80 dark:text-success-400/80">
                    @{githubUsername}
                  </p>
                </div>
                <Button
                  as="a"
                  href={`https://github.com/${githubUsername}`}
                  target="_blank"
                  size="sm"
                  variant="light"
                  color="success"
                  startContent={<Github size={14} />}
                >
                  Lihat Profil
                </Button>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      )}

      {/* Stats Grid */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {STATS_CONFIG.map((stat) => {
            const Icon = stat.icon;
            const value = getStatsValue(stat.key);
            return (
              <Card
                key={stat.key}
                className="border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden group hover:shadow-md transition-shadow"
              >
                <CardBody className="p-4 md:p-5">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-xs md:text-sm text-default-500">{stat.label}</p>
                      <p className="text-2xl md:text-3xl font-bold">{value}</p>
                    </div>
                    <div className={`p-2 md:p-3 rounded-xl ${stat.bgLight} transition-transform group-hover:scale-110`}>
                      <Icon size={20} className={stat.iconColor} />
                    </div>
                  </div>
                  {/* Gradient bar at bottom */}
                  <div className={`h-1 mt-4 rounded-full bg-gradient-to-r ${stat.gradient} opacity-50 group-hover:opacity-100 transition-opacity`} />
                </CardBody>
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
          <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-800 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                    <Rocket size={20} />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">Project Saya</h2>
                    <p className="text-xs text-default-500">
                      {projects.length === 0 ? 'Belum ada project' : `${projects.length} project`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    as={Link}
                    href="/mahasiswa/projects/new"
                    color="primary"
                    size="sm"
                    startContent={<Plus size={16} />}
                    className="hidden md:flex"
                  >
                    Buat Baru
                  </Button>
                  <Button
                    as={Link}
                    href="/mahasiswa/projects"
                    variant="flat"
                    size="sm"
                    endContent={<ChevronRight size={16} />}
                  >
                    Semua
                  </Button>
                </div>
              </div>
            </div>

            <CardBody className="p-0">
              {projects.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center">
                    <FolderGit2 size={36} className="text-blue-500" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Belum Ada Project</h3>
                  <p className="text-default-500 mb-4 text-sm max-w-sm mx-auto">
                    Mulai perjalanan capstone Anda dengan membuat project pertama!
                  </p>
                  <Button
                    as={Link}
                    href="/mahasiswa/projects/new"
                    color="primary"
                    size="lg"
                    startContent={<Zap size={18} />}
                  >
                    Buat Project Sekarang
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {projects.slice(0, 3).map((project, index) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 md:p-5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        {/* Project Info */}
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {/* Status indicator with gradient */}
                          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${getStatusGradient(project.status)} text-white shrink-0`}>
                            <FolderGit2 size={18} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Link
                                href={`/mahasiswa/projects/${project.id}`}
                                className="font-semibold text-base hover:text-primary transition-colors truncate"
                              >
                                {project.title}
                              </Link>
                              <Chip
                                size="sm"
                                color={getStatusColor(project.status)}
                                variant="flat"
                                className="shrink-0"
                              >
                                {getStatusLabel(project.status)}
                              </Chip>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-default-500">
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
                                  className="flex items-center gap-1 text-primary hover:underline"
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
                                <span className="text-default-400">Progress</span>
                                <span className="font-medium">{getProgress(project.status)}%</span>
                              </div>
                              <Progress
                                value={getProgress(project.status)}
                                color={getStatusColor(project.status)}
                                size="sm"
                                className="h-1.5"
                              />
                            </div>

                            {/* Team Members */}
                            {project.members && project.members.length > 0 && (
                              <div className="mt-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700">
                                <div className="flex items-center gap-2 mb-2">
                                  <Users size={12} className="text-default-500" />
                                  <span className="text-xs font-medium text-default-600">
                                    Anggota Tim ({project.members.length})
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {project.members.map((member) => (
                                    <div
                                      key={member.id}
                                      className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600"
                                    >
                                      <Avatar
                                        src={member.githubAvatarUrl || undefined}
                                        name={member.name || member.githubUsername || 'Member'}
                                        size="sm"
                                        className="w-5 h-5"
                                      />
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
                          <Button
                            as={Link}
                            href={`/mahasiswa/projects/${project.id}`}
                            size="sm"
                            variant="flat"
                          >
                            Detail
                          </Button>
                          {project.status === 'DRAFT' && (
                            <>
                              <Button
                                as={Link}
                                href={`/mahasiswa/projects/${project.id}/edit`}
                                size="sm"
                                color="primary"
                                variant="flat"
                                startContent={<Edit size={14} />}
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                color="danger"
                                variant="flat"
                                isIconOnly
                                onPress={() => handleDeleteClick(project)}
                              >
                                <Trash2 size={14} />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Updated timestamp */}
                      <p className="text-[10px] text-default-400 mt-3 md:ml-14">
                        Diperbarui: {formatDate(project.updatedAt)}
                      </p>
                    </motion.div>
                  ))}

                  {projects.length > 3 && (
                    <div className="p-4 text-center bg-zinc-50 dark:bg-zinc-800/30">
                      <Button
                        as={Link}
                        href="/mahasiswa/projects"
                        variant="light"
                        color="primary"
                        endContent={<ChevronRight size={16} />}
                      >
                        Lihat Semua Project ({projects.length})
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardBody>
          </Card>
        </motion.div>

        {/* Right Sidebar */}
        <motion.div variants={itemVariants} className="space-y-6">
          {/* Quick Actions Card */}
          <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Target size={18} className="text-violet-600 dark:text-violet-400" />
                <h3 className="font-semibold">Aksi Cepat</h3>
              </div>
            </div>
            <CardBody className="p-4 space-y-3">
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group"
                  >
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${action.gradient} text-white shrink-0 transition-transform group-hover:scale-110`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm group-hover:text-primary transition-colors">
                        {action.label}
                      </p>
                      <p className="text-xs text-default-500 truncate">{action.description}</p>
                    </div>
                    <ChevronRight size={16} className="text-default-300 group-hover:text-primary transition-colors" />
                  </Link>
                );
              })}
            </CardBody>
          </Card>

          {/* Progress Overview Card */}
          <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-semibold">Ringkasan Progress</h3>
              </div>
            </div>
            <CardBody className="p-5">
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
                        className="text-zinc-100 dark:text-zinc-800"
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
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="50%" stopColor="#14b8a6" />
                          <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                      </defs>
                    </svg>
                    {/* Center text - positioned properly */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                        {stats.totalProjects > 0 ? Math.round((stats.reviewedProjects / stats.totalProjects) * 100) : 0}%
                      </span>
                      <span className="text-xs text-default-500 mt-1">Selesai</span>
                    </div>
                  </div>
                </div>

                {/* Stats breakdown */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-100/50 dark:from-emerald-900/30 dark:to-emerald-800/20 border border-emerald-200/50 dark:border-emerald-700/30">
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
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-900/30 dark:to-amber-800/20 border border-amber-200/50 dark:border-amber-700/30">
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
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-zinc-50 to-zinc-100/50 dark:from-zinc-800/50 dark:to-zinc-700/30 border border-zinc-200/50 dark:border-zinc-600/30">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-zinc-500/10">
                        <FileText size={14} className="text-zinc-600 dark:text-zinc-400" />
                      </div>
                      <span className="text-sm font-medium">Draft</span>
                    </div>
                    <span className="font-bold text-zinc-600 dark:text-zinc-400">
                      {stats.totalProjects - stats.submittedProjects}
                    </span>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="sm">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-danger">
              <AlertTriangle size={20} />
              <span>Hapus Project</span>
            </div>
          </ModalHeader>
          <ModalBody>
            <p className="text-default-600">
              Apakah Anda yakin ingin menghapus project{' '}
              <span className="font-semibold">&quot;{selectedProject?.title}&quot;</span>?
            </p>
            <p className="text-sm text-default-400">
              Tindakan ini tidak dapat dibatalkan. Semua data project termasuk dokumen dan review akan dihapus.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose} isDisabled={isDeleting}>
              Batal
            </Button>
            <Button
              color="danger"
              onPress={handleDeleteConfirm}
              isLoading={isDeleting}
            >
              Hapus
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </motion.div>
  );
}
