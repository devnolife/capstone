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
import { PageHeader } from '@/components/caret/PageHeader';

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
  { key: 'functionality', label: 'Fungsionalitas', icon: Zap },
  { key: 'uiux', label: 'UI/UX', icon: Palette },
  { key: 'codeQuality', label: 'Code Quality', icon: FileCode2 },
  { key: 'performance', label: 'Performance', icon: Gauge },
  { key: 'security', label: 'Security', icon: Lock },
  { key: 'documentation', label: 'Docs', icon: BookMarked },
];

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-success';
  if (score >= 60) return 'text-warning';
  return 'text-danger';
};

const getScoreBgColor = (score: number) => {
  if (score >= 80) return 'bg-success';
  if (score >= 60) return 'bg-warning';
  return 'bg-danger';
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
        <PageHeader
          label="[03] AUTO REVIEW"
          labelRight="/ AI"
          title="Auto Review System"
          description="Analisis otomatis kualitas project menggunakan AI"
          actions={
            <Button
              color="secondary"
              variant="flat"
              startContent={<RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />}
              onPress={handleRefreshAll}
              isLoading={isRefreshing}
            >
              {isRefreshing ? 'Menganalisis...' : 'Refresh Semua'}
            </Button>
          }
        />
      </motion.div>

      {/* Development Notice */}
      <motion.div variants={itemVariants}>
        <Card className="rounded-2xl border border-dashed border-warning/30 bg-warning/5 shadow-none">
          <CardBody className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-warning/10 text-warning">
                <Construction size={18} />
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">Fitur dalam Pengembangan</h4>
                <p className="text-xs text-app-secondary-invert leading-relaxed">
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
        <div className="grid grid-cols-2 gap-px border border-border bg-border md:grid-cols-3 lg:grid-cols-6">
          <div className="bg-background px-5 py-4 transition-colors hover:bg-app-quinary">
            <div className="flex items-center justify-between gap-2">
              <span className="text-app-teritary-invert truncate font-mono text-[10px] uppercase tracking-[0.18em]">Total Project</span>
              <span className="bg-app-primary text-foreground flex size-7 shrink-0 items-center justify-center rounded-lg">
                <Activity size={14} />
              </span>
            </div>
            <p className="font-display mt-2 text-2xl font-[450] tracking-tight tabular-nums md:text-3xl">{stats.total}</p>
          </div>
          <div className="bg-background px-5 py-4 transition-colors hover:bg-app-quinary">
            <div className="flex items-center justify-between gap-2">
              <span className="text-app-teritary-invert truncate font-mono text-[10px] uppercase tracking-[0.18em]">Rata-rata Score</span>
              <span className="bg-app-primary text-foreground flex size-7 shrink-0 items-center justify-center rounded-lg">
                <BarChart3 size={14} />
              </span>
            </div>
            <p className="font-display mt-2 text-2xl font-[450] tracking-tight tabular-nums md:text-3xl">{stats.avgScore}</p>
          </div>
          <div className="bg-background px-5 py-4 transition-colors hover:bg-app-quinary">
            <div className="flex items-center justify-between gap-2">
              <span className="text-app-teritary-invert flex min-w-0 items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em]">
                <span className="size-1.5 shrink-0 rounded-full bg-success" />
                <span className="truncate">Excellent</span>
              </span>
              <span className="bg-app-primary text-foreground flex size-7 shrink-0 items-center justify-center rounded-lg">
                <CheckCircle2 size={14} />
              </span>
            </div>
            <p className="font-display mt-2 text-2xl font-[450] tracking-tight tabular-nums md:text-3xl">{stats.excellent}</p>
          </div>
          <div className="bg-background px-5 py-4 transition-colors hover:bg-app-quinary">
            <div className="flex items-center justify-between gap-2">
              <span className="text-app-teritary-invert flex min-w-0 items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em]">
                <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                <span className="truncate">Good</span>
              </span>
              <span className="bg-app-primary text-foreground flex size-7 shrink-0 items-center justify-center rounded-lg">
                <CheckCircle2 size={14} />
              </span>
            </div>
            <p className="font-display mt-2 text-2xl font-[450] tracking-tight tabular-nums md:text-3xl">{stats.good}</p>
          </div>
          <div className="bg-background px-5 py-4 transition-colors hover:bg-app-quinary">
            <div className="flex items-center justify-between gap-2">
              <span className="text-app-teritary-invert flex min-w-0 items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em]">
                <span className="size-1.5 shrink-0 rounded-full bg-warning" />
                <span className="truncate">Warning</span>
              </span>
              <span className="bg-app-primary text-foreground flex size-7 shrink-0 items-center justify-center rounded-lg">
                <AlertTriangle size={14} />
              </span>
            </div>
            <p className="font-display mt-2 text-2xl font-[450] tracking-tight tabular-nums md:text-3xl">{stats.warning}</p>
          </div>
          <div className="bg-background px-5 py-4 transition-colors hover:bg-app-quinary">
            <div className="flex items-center justify-between gap-2">
              <span className="text-app-teritary-invert flex min-w-0 items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em]">
                <span className="size-1.5 shrink-0 rounded-full bg-danger" />
                <span className="truncate">Needs Work</span>
              </span>
              <span className="bg-app-primary text-foreground flex size-7 shrink-0 items-center justify-center rounded-lg">
                <XCircle size={14} />
              </span>
            </div>
            <p className="font-display mt-2 text-2xl font-[450] tracking-tight tabular-nums md:text-3xl">{stats.poor}</p>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <Card className="rounded-2xl border border-border bg-card shadow-none">
          <CardBody className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="Cari project atau mahasiswa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                startContent={<Search size={16} className="text-app-teritary-invert" />}
                variant="bordered"
                classNames={{
                  inputWrapper: 'border-border bg-app-quinary',
                }}
                className="flex-1"
              />
              <Select
                placeholder="Filter Status"
                selectedKeys={[statusFilter]}
                onChange={(e) => setStatusFilter(e.target.value)}
                variant="bordered"
                startContent={<Filter size={16} className="text-app-teritary-invert" />}
                classNames={{
                  trigger: 'border-border bg-app-quinary min-w-[160px]',
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
          <Card className="rounded-2xl border border-border bg-card shadow-none">
            <CardBody className="p-8 text-center">
              <Bot size={48} className="mx-auto mb-4 text-app-teritary-invert" />
              <p className="font-semibold">Tidak ada project yang ditemukan</p>
              <p className="text-sm text-app-secondary-invert mt-1">
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
                <Card className="rounded-2xl border border-border bg-card shadow-none hover:border-primary/50 transition-colors">
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
                                className="text-app-primary"
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
                                className={`text-lg font-bold tabular-nums ${getScoreColor(
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
                                  <span className="text-sm text-app-secondary-invert">
                                    {project.mahasiswa.name}
                                  </span>
                                  <span className="text-xs text-app-teritary-invert">
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
                            <div className="flex flex-wrap items-center gap-3 text-xs text-app-teritary-invert mb-3">
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
                                    ? 'text-success'
                                    : project.trend === 'down'
                                    ? 'text-danger'
                                    : 'text-app-teritary-invert'
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
                                        <span className="flex items-center gap-1 text-app-teritary-invert">
                                          <AspectIcon size={10} />
                                          {aspect.label}
                                        </span>
                                        <span className={`font-medium tabular-nums ${getScoreColor(score)}`}>
                                          {score}
                                        </span>
                                      </div>
                                      <div className="h-1.5 bg-app-primary rounded-full overflow-hidden">
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
                      <div className="flex lg:flex-col items-center justify-end gap-2 p-4 lg:p-5 lg:pl-0 border-t lg:border-t-0 lg:border-l border-border">
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
        <Card className="rounded-2xl border border-dashed border-border bg-card shadow-none">
          <CardBody className="p-4">
            <div className="flex items-start gap-3">
              <div className="bg-app-primary text-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
                <Bot size={18} />
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">Tentang Auto Review</h4>
                <p className="text-xs text-app-secondary-invert leading-relaxed">
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
