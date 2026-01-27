'use client';

import { useState } from 'react';
import {
  Card,
  CardBody,
  Button,
  Chip,
  Avatar,
  Input,
  Select,
  SelectItem,
  Tooltip,
} from '@heroui/react';
import { motion } from 'framer-motion';
import {
  Bot,
  RefreshCw,
  Search,
  Filter,
  Zap,
  Palette,
  FileCode2,
  Gauge,
  Lock,
  BookMarked,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  BarChart3,
  Activity,
  Construction,
} from 'lucide-react';
import Link from 'next/link';
import { getSimakPhotoUrl } from '@/lib/utils';

interface Project {
  id: string;
  title: string;
  semester: string;
  tahunAkademik: string;
  githubRepoUrl: string | null;
  mahasiswa: {
    name: string;
    username: string;
    image: string | null;
    profilePhoto: string | null;
  };
  lastAnalyzed: string;
  overallScore: number;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  status: string;
  aspects: {
    functionality: number;
    uiux: number;
    codeQuality: number;
    performance: number;
    security: number;
    documentation: number;
  };
}

interface AutoReviewClientProps {
  projects: Project[];
}

const ASPECTS_CONFIG = [
  { key: 'functionality', label: 'Fungsionalitas', icon: Zap, color: 'emerald' },
  { key: 'uiux', label: 'UI/UX', icon: Palette, color: 'violet' },
  { key: 'codeQuality', label: 'Code Quality', icon: FileCode2, color: 'blue' },
  { key: 'performance', label: 'Performance', icon: Gauge, color: 'orange' },
  { key: 'security', label: 'Security', icon: Lock, color: 'green' },
  { key: 'documentation', label: 'Docs', icon: BookMarked, color: 'pink' },
];

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 60) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
};

const getScoreBgColor = (score: number) => {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 60) return 'bg-amber-500';
  return 'bg-red-500';
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'excellent':
      return { color: 'success' as const, label: 'Excellent', icon: CheckCircle2 };
    case 'good':
      return { color: 'primary' as const, label: 'Good', icon: CheckCircle2 };
    case 'warning':
      return { color: 'warning' as const, label: 'Warning', icon: AlertTriangle };
    case 'poor':
      return { color: 'danger' as const, label: 'Needs Work', icon: XCircle };
    default:
      return { color: 'default' as const, label: 'Unknown', icon: Minus };
  }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
};

export function AutoReviewClient({ projects }: AutoReviewClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshAll = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.mahasiswa.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.mahasiswa.username.includes(searchQuery);

    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const stats = {
    total: projects.length,
    excellent: projects.filter((p) => p.status === 'excellent').length,
    good: projects.filter((p) => p.status === 'good').length,
    warning: projects.filter((p) => p.status === 'warning').length,
    poor: projects.filter((p) => p.status === 'poor').length,
    avgScore: projects.length > 0 
      ? Math.round(projects.reduce((acc, p) => acc + p.overallScore, 0) / projects.length)
      : 0,
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/30">
              <Bot size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold">Auto Review System</h1>
              <p className="text-sm text-default-500">
                Analisis otomatis kualitas project menggunakan AI
              </p>
            </div>
          </div>
          <Button
            color="secondary"
            variant="flat"
            startContent={<RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />}
            onPress={handleRefreshAll}
            isLoading={isRefreshing}
          >
            {isRefreshing ? 'Menganalisis...' : 'Refresh Semua'}
          </Button>
        </div>
      </motion.div>

      {/* Development Notice */}
      <motion.div variants={itemVariants}>
        <Card className="border border-dashed border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-500/5">
          <CardBody className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-500/20">
                <Construction size={20} className="text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">Fitur dalam Pengembangan</h4>
                <p className="text-xs text-default-500 leading-relaxed">
                  Sistem AI Auto Review sedang dalam tahap pengembangan. Skor yang ditampilkan saat ini 
                  adalah estimasi berdasarkan status project. Fitur analisis kode dan AI scoring akan 
                  segera tersedia.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <Card className="border border-zinc-200 dark:border-zinc-800">
            <CardBody className="p-4 text-center">
              <Activity size={20} className="mx-auto mb-2 text-violet-500" />
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-default-500">Total Project</p>
            </CardBody>
          </Card>
          <Card className="border border-zinc-200 dark:border-zinc-800">
            <CardBody className="p-4 text-center">
              <BarChart3 size={20} className="mx-auto mb-2 text-blue-500" />
              <p className="text-2xl font-bold">{stats.avgScore}</p>
              <p className="text-xs text-default-500">Rata-rata Score</p>
            </CardBody>
          </Card>
          <Card className="border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-500/10">
            <CardBody className="p-4 text-center">
              <CheckCircle2 size={20} className="mx-auto mb-2 text-emerald-500" />
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {stats.excellent}
              </p>
              <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">Excellent</p>
            </CardBody>
          </Card>
          <Card className="border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-500/10">
            <CardBody className="p-4 text-center">
              <CheckCircle2 size={20} className="mx-auto mb-2 text-blue-500" />
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.good}</p>
              <p className="text-xs text-blue-600/70 dark:text-blue-400/70">Good</p>
            </CardBody>
          </Card>
          <Card className="border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-500/10">
            <CardBody className="p-4 text-center">
              <AlertTriangle size={20} className="mx-auto mb-2 text-amber-500" />
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {stats.warning}
              </p>
              <p className="text-xs text-amber-600/70 dark:text-amber-400/70">Warning</p>
            </CardBody>
          </Card>
          <Card className="border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-500/10">
            <CardBody className="p-4 text-center">
              <XCircle size={20} className="mx-auto mb-2 text-red-500" />
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.poor}</p>
              <p className="text-xs text-red-600/70 dark:text-red-400/70">Needs Work</p>
            </CardBody>
          </Card>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <Card className="border border-zinc-200 dark:border-zinc-800">
          <CardBody className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="Cari project atau mahasiswa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                startContent={<Search size={16} className="text-default-400" />}
                variant="bordered"
                classNames={{
                  inputWrapper: 'border-default-200',
                }}
                className="flex-1"
              />
              <Select
                placeholder="Filter Status"
                selectedKeys={[statusFilter]}
                onChange={(e) => setStatusFilter(e.target.value)}
                variant="bordered"
                startContent={<Filter size={16} className="text-default-400" />}
                classNames={{
                  trigger: 'border-default-200 min-w-[160px]',
                }}
              >
                <SelectItem key="all">Semua Status</SelectItem>
                <SelectItem key="excellent">Excellent</SelectItem>
                <SelectItem key="good">Good</SelectItem>
                <SelectItem key="warning">Warning</SelectItem>
                <SelectItem key="poor">Needs Work</SelectItem>
              </Select>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Project List */}
      <motion.div variants={itemVariants} className="space-y-4">
        {filteredProjects.length === 0 ? (
          <Card className="border border-zinc-200 dark:border-zinc-800">
            <CardBody className="p-8 text-center">
              <Bot size={48} className="mx-auto mb-4 text-default-300" />
              <p className="font-semibold">Tidak ada project yang ditemukan</p>
              <p className="text-sm text-default-500 mt-1">
                {projects.length === 0 
                  ? 'Belum ada project yang ditugaskan kepada Anda'
                  : 'Coba ubah filter atau kata kunci pencarian'}
              </p>
            </CardBody>
          </Card>
        ) : (
          filteredProjects.map((project) => {
            const statusConfig = getStatusConfig(project.status);
            const StatusIcon = statusConfig.icon;
            const avatarSrc = project.mahasiswa.profilePhoto || project.mahasiswa.image || getSimakPhotoUrl(project.mahasiswa.username);

            return (
              <motion.div key={project.id} variants={itemVariants}>
                <Card className="border border-zinc-200 dark:border-zinc-800 hover:border-primary/50 transition-colors">
                  <CardBody className="p-0">
                    <div className="flex flex-col lg:flex-row">
                      {/* Left Section - Project Info */}
                      <div className="flex-1 p-4 lg:p-5">
                        <div className="flex items-start gap-4">
                          {/* Score Circle */}
                          <div className="relative shrink-0">
                            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                              <circle
                                cx="32"
                                cy="32"
                                r="26"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="5"
                                className="text-zinc-200 dark:text-zinc-700"
                              />
                              <circle
                                cx="32"
                                cy="32"
                                r="26"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="5"
                                strokeLinecap="round"
                                strokeDasharray={163.36}
                                strokeDashoffset={
                                  163.36 - (163.36 * project.overallScore) / 100
                                }
                                className={getScoreBgColor(project.overallScore).replace(
                                  'bg-',
                                  'text-'
                                )}
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span
                                className={`text-lg font-bold ${getScoreColor(
                                  project.overallScore
                                )}`}
                              >
                                {project.overallScore}
                              </span>
                            </div>
                          </div>

                          {/* Project Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div>
                                <h3 className="font-semibold text-base line-clamp-1">
                                  {project.title}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <Avatar
                                    name={project.mahasiswa.name}
                                    src={avatarSrc}
                                    size="sm"
                                    className="w-5 h-5"
                                  />
                                  <span className="text-sm text-default-600">
                                    {project.mahasiswa.name}
                                  </span>
                                  <span className="text-xs text-default-400">
                                    ({project.mahasiswa.username})
                                  </span>
                                </div>
                              </div>
                              <Chip
                                size="sm"
                                color={statusConfig.color}
                                variant="flat"
                                startContent={<StatusIcon size={12} />}
                              >
                                {statusConfig.label}
                              </Chip>
                            </div>

                            {/* Meta Info */}
                            <div className="flex flex-wrap items-center gap-3 text-xs text-default-500 mb-3">
                              <span className="flex items-center gap-1">
                                <Calendar size={12} />
                                {project.semester} {project.tahunAkademik}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock size={12} />
                                {new Date(project.lastAnalyzed).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                              <span
                                className={`flex items-center gap-1 ${
                                  project.trend === 'up'
                                    ? 'text-emerald-500'
                                    : project.trend === 'down'
                                    ? 'text-red-500'
                                    : 'text-zinc-400'
                                }`}
                              >
                                {project.trend === 'up' && <TrendingUp size={12} />}
                                {project.trend === 'down' && <TrendingDown size={12} />}
                                {project.trend === 'stable' && <Minus size={12} />}
                                {project.trendValue > 0 ? '+' : ''}
                                {project.trendValue} dari sebelumnya
                              </span>
                            </div>

                            {/* Aspect Bars */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                              {ASPECTS_CONFIG.map((aspect) => {
                                const score =
                                  project.aspects[aspect.key as keyof typeof project.aspects];
                                const AspectIcon = aspect.icon;

                                return (
                                  <Tooltip
                                    key={aspect.key}
                                    content={`${aspect.label}: ${score}/100`}
                                  >
                                    <div className="space-y-1">
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="flex items-center gap-1 text-default-500">
                                          <AspectIcon size={10} />
                                          {aspect.label}
                                        </span>
                                        <span className={`font-medium ${getScoreColor(score)}`}>
                                          {score}
                                        </span>
                                      </div>
                                      <div className="h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                                        <div
                                          className={`h-full rounded-full ${getScoreBgColor(score)}`}
                                          style={{ width: `${score}%` }}
                                        />
                                      </div>
                                    </div>
                                  </Tooltip>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Section - Actions */}
                      <div className="flex lg:flex-col items-center justify-end gap-2 p-4 lg:p-5 lg:pl-0 border-t lg:border-t-0 lg:border-l border-zinc-100 dark:border-zinc-800">
                        <Button
                          as={Link}
                          href={`/dosen/auto-review/${project.id}`}
                          size="sm"
                          color="primary"
                          variant="flat"
                          endContent={<ChevronRight size={14} />}
                        >
                          Detail
                        </Button>
                        <Button
                          as={Link}
                          href={`/dosen/projects/${project.id}`}
                          size="sm"
                          variant="bordered"
                          startContent={<Eye size={14} />}
                        >
                          Project
                        </Button>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            );
          })
        )}
      </motion.div>

      {/* Info Card */}
      <motion.div variants={itemVariants}>
        <Card className="border border-dashed border-violet-300 dark:border-violet-700 bg-violet-50/50 dark:bg-violet-500/5">
          <CardBody className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-500/20">
                <Bot size={20} className="text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">Tentang Auto Review</h4>
                <p className="text-xs text-default-500 leading-relaxed">
                  Sistem ini akan menggunakan AI untuk menganalisis kualitas project secara otomatis.
                  Analisis mencakup fungsionalitas, UI/UX, kualitas kode, performa, keamanan, dan
                  dokumentasi. Hasil analisis dapat digunakan sebagai referensi untuk review manual.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </motion.div>
  );
}
