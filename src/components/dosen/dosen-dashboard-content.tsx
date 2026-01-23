'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Card,
  CardBody,
  Button,
  Avatar,
  Chip,
  Progress,
} from '@heroui/react';
import {
  FolderGit2,
  Clock,
  CheckCircle,
  Users,
  ClipboardCheck,
  FileSearch,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Target,
  Award,
  Calendar,
  FileText,
  Eye,
  GraduationCap,
} from 'lucide-react';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';

interface Project {
  id: string;
  title: string;
  semester: string;
  status: string;
  mahasiswa: {
    name: string;
    username: string;
    image: string | null;
  };
  _count: {
    documents: number;
    reviews: number;
  };
}

interface Activity {
  id: string;
  type: 'review';
  title: string;
  description: string;
  user: {
    name: string;
    avatar?: string;
  };
  timestamp: Date;
  status: string;
}

interface DosenDashboardContentProps {
  userName: string;
  userImage?: string;
  stats: {
    totalAssigned: number;
    pendingReview: number;
    completedReview: number;
    totalMahasiswa: number;
  };
  projects: Project[];
  activities: Activity[];
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
    key: 'assigned',
    label: 'Project Ditugaskan',
    icon: FolderGit2,
    gradient: 'from-blue-500 via-indigo-500 to-violet-500',
    bgLight: 'bg-blue-50 dark:bg-blue-900/20',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    key: 'pending',
    label: 'Menunggu Review',
    icon: Clock,
    gradient: 'from-amber-500 via-orange-500 to-yellow-500',
    bgLight: 'bg-amber-50 dark:bg-amber-900/20',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    key: 'completed',
    label: 'Review Selesai',
    icon: CheckCircle,
    gradient: 'from-emerald-500 via-green-500 to-teal-500',
    bgLight: 'bg-emerald-50 dark:bg-emerald-900/20',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    key: 'mahasiswa',
    label: 'Mahasiswa Bimbingan',
    icon: Users,
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
    bgLight: 'bg-violet-50 dark:bg-violet-900/20',
    iconColor: 'text-violet-600 dark:text-violet-400',
  },
];

// Quick actions configuration
const QUICK_ACTIONS = [
  {
    label: 'Semua Project',
    href: '/dosen/projects',
    icon: FolderGit2,
    gradient: 'from-blue-500 to-indigo-500',
    description: 'Lihat semua project mahasiswa',
  },
  {
    label: 'Perlu Review',
    href: '/dosen/projects?status=pending',
    icon: ClipboardCheck,
    gradient: 'from-amber-500 to-orange-500',
    description: 'Project menunggu review',
  },
  {
    label: 'Review Selesai',
    href: '/dosen/projects?status=completed',
    icon: FileSearch,
    gradient: 'from-emerald-500 to-green-500',
    description: 'Project yang sudah direview',
  },
];

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

export function DosenDashboardContent({
  userName,
  userImage,
  stats,
  projects,
  activities,
}: DosenDashboardContentProps) {
  const getStatsValue = (key: string) => {
    switch (key) {
      case 'assigned':
        return stats.totalAssigned;
      case 'pending':
        return stats.pendingReview;
      case 'completed':
        return stats.completedReview;
      case 'mahasiswa':
        return stats.totalMahasiswa;
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
        <Card className="border-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 text-white overflow-hidden">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            }}
          />
          <CardBody className="p-6 md:p-8 relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Left side - Welcome */}
              <div className="flex items-center gap-4">
                <Avatar
                  name={userName}
                  src={userImage}
                  size="lg"
                  className="ring-4 ring-white/30 w-16 h-16 md:w-20 md:h-20"
                  icon={<GraduationCap size={32} />}
                />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles size={16} className="text-yellow-300" />
                    <span className="text-sm text-white/80">{getGreeting()}</span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold">{firstName}!</h1>
                  <p className="text-white/70 text-sm md:text-base mt-1">
                    Kelola review project mahasiswa di sini
                  </p>
                </div>
              </div>

              {/* Right side - Quick Stats */}
              <div className="flex items-center gap-3 md:gap-4">
                <div className="text-center px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm">
                  <p className="text-2xl md:text-3xl font-bold">{stats.totalAssigned}</p>
                  <p className="text-xs text-white/70">Project</p>
                </div>
                <div className="text-center px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm">
                  <p className="text-2xl md:text-3xl font-bold">{stats.totalMahasiswa}</p>
                  <p className="text-xs text-white/70">Mahasiswa</p>
                </div>
                {stats.pendingReview > 0 && (
                  <div className="text-center px-4 py-2 rounded-xl bg-amber-500/30 backdrop-blur-sm">
                    <p className="text-2xl md:text-3xl font-bold">{stats.pendingReview}</p>
                    <p className="text-xs text-white/70">Pending</p>
                  </div>
                )}
              </div>
            </div>
          </CardBody>
        </Card>
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
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                    <ClipboardCheck size={20} />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">Project Mahasiswa</h2>
                    <p className="text-xs text-default-500">
                      {projects.length === 0 ? 'Belum ada project' : `${projects.length} project ditugaskan`}
                    </p>
                  </div>
                </div>
                <Button
                  as={Link}
                  href="/dosen/projects"
                  variant="flat"
                  size="sm"
                  endContent={<ChevronRight size={16} />}
                >
                  Semua
                </Button>
              </div>
            </div>

            <CardBody className="p-0">
              {projects.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center">
                    <FolderGit2 size={36} className="text-emerald-500" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Belum Ada Project</h3>
                  <p className="text-default-500 mb-4 text-sm max-w-sm mx-auto">
                    Anda belum ditugaskan untuk mereview project mahasiswa
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {projects.slice(0, 5).map((project, index) => (
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
                                href={`/dosen/projects/${project.id}`}
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
                            </div>

                            {/* Mahasiswa Info */}
                            <div className="mt-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700">
                              <div className="flex items-center gap-2">
                                <Avatar
                                  src={project.mahasiswa.image || undefined}
                                  name={project.mahasiswa.name}
                                  size="sm"
                                  className="w-6 h-6"
                                />
                                <div>
                                  <span className="text-sm font-medium">
                                    {project.mahasiswa.name}
                                  </span>
                                  <span className="text-xs text-default-400 ml-2">
                                    @{project.mahasiswa.username}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0 md:ml-4">
                          <Button
                            as={Link}
                            href={`/dosen/projects/${project.id}`}
                            size="sm"
                            color="primary"
                            variant="flat"
                            startContent={<Eye size={14} />}
                          >
                            Review
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {projects.length > 5 && (
                    <div className="p-4 text-center bg-zinc-50 dark:bg-zinc-800/30">
                      <Button
                        as={Link}
                        href="/dosen/projects"
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
            <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Target size={18} className="text-emerald-600 dark:text-emerald-400" />
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
            <div className="p-4 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-violet-600 dark:text-violet-400" />
                <h3 className="font-semibold">Statistik Review</h3>
              </div>
            </div>
            <CardBody className="p-4">
              <div className="space-y-4">
                {/* Overall progress */}
                <div className="text-center py-4">
                  <div className="relative w-24 h-24 mx-auto">
                    <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        className="text-zinc-200 dark:text-zinc-700"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="url(#progressGradientDosen)"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={251}
                        strokeDashoffset={
                          251 - (251 * (stats.totalAssigned > 0 ? (stats.completedReview / stats.totalAssigned) * 100 : 0)) / 100
                        }
                        className="transition-all duration-1000"
                      />
                      <defs>
                        <linearGradient id="progressGradientDosen" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#14b8a6" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold">
                        {stats.totalAssigned > 0 ? Math.round((stats.completedReview / stats.totalAssigned) * 100) : 0}%
                      </span>
                      <span className="text-[10px] text-default-500">Selesai</span>
                    </div>
                  </div>
                </div>

                {/* Stats breakdown */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
                    <div className="flex items-center gap-2">
                      <Award size={16} className="text-emerald-600 dark:text-emerald-400" />
                      <span className="text-sm">Review Selesai</span>
                    </div>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {stats.completedReview}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-amber-600 dark:text-amber-400" />
                      <span className="text-sm">Menunggu Review</span>
                    </div>
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      {stats.pendingReview}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-violet-50 dark:bg-violet-900/20">
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-violet-600 dark:text-violet-400" />
                      <span className="text-sm">Mahasiswa</span>
                    </div>
                    <span className="font-bold text-violet-600 dark:text-violet-400">
                      {stats.totalMahasiswa}
                    </span>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Recent Activity */}
          <RecentActivity activities={activities} />
        </motion.div>
      </div>
    </motion.div>
  );
}
