'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardBody,
  Button,
  Chip,
  Avatar,
} from '@heroui/react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Bot,
  RefreshCw,
  Zap,
  Palette,
  FileCode2,
  Gauge,
  Lock,
  BookMarked,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Calendar,
  Clock,
  Github,
  Globe,
  Lightbulb,
  AlertCircle,
  FileText,
  History,
  Construction,
} from 'lucide-react';
import { getSimakPhotoUrl } from '@/lib/utils';

interface AspectDetail {
  item: string;
  status: 'pass' | 'warning' | 'fail';
  value: string;
}

interface Aspect {
  key: string;
  label: string;
  score: number;
  previousScore: number;
  summary: string;
  details: AspectDetail[];
  suggestions: string[];
}

interface AnalysisHistory {
  date: string;
  score: number;
}

interface ProjectData {
  id: string;
  title: string;
  description: string;
  semester: string;
  tahunAkademik: string;
  githubRepoUrl: string | null;
  productionUrl: string | null;
  projectStatus: string;
  mahasiswa: {
    name: string;
    username: string;
    prodi: string;
    image: string | null;
    profilePhoto: string | null;
  };
  overallScore: number;
  previousScore: number;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  analysisStatus: string;
  lastAnalyzed: string;
  analysisHistory: AnalysisHistory[];
  aspects: Aspect[];
}

interface AutoReviewDetailClientProps {
  project: ProjectData;
}

const ASPECT_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  functionality: Zap,
  uiux: Palette,
  codeQuality: FileCode2,
  performance: Gauge,
  security: Lock,
  documentation: BookMarked,
};

const ASPECT_COLORS: Record<string, string> = {
  functionality: 'emerald',
  uiux: 'violet',
  codeQuality: 'blue',
  performance: 'orange',
  security: 'green',
  documentation: 'pink',
};

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

const getItemStatusIcon = (status: string) => {
  switch (status) {
    case 'pass':
      return <CheckCircle2 size={14} className="text-emerald-500" />;
    case 'warning':
      return <AlertTriangle size={14} className="text-amber-500" />;
    case 'fail':
      return <XCircle size={14} className="text-red-500" />;
    default:
      return <Minus size={14} className="text-zinc-400" />;
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

export function AutoReviewDetailClient({ project }: AutoReviewDetailClientProps) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const analysisStatusConfig = getStatusConfig(project.analysisStatus);
  const StatusIcon = analysisStatusConfig.icon;

  const avatarSrc = project.mahasiswa.profilePhoto || project.mahasiswa.image || getSimakPhotoUrl(project.mahasiswa.username);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      router.refresh();
    }, 2000);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-3 mb-4">
          <Button
            as={Link}
            href="/dosen/auto-review"
            variant="light"
            isIconOnly
            radius="full"
            size="sm"
          >
            <ArrowLeft size={18} />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Bot className="text-violet-500" size={22} />
              Detail Auto Review
            </h1>
            <p className="text-sm text-default-500">Analisis otomatis kualitas project</p>
          </div>
          <Button
            color="secondary"
            variant="flat"
            startContent={<RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />}
            onPress={handleRefresh}
            isLoading={isRefreshing}
          >
            {isRefreshing ? 'Menganalisis...' : 'Re-analyze'}
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
                  Sistem AI Auto Review sedang dalam tahap pengembangan. Skor dan detail analisis yang ditampilkan 
                  saat ini adalah estimasi placeholder berdasarkan status project. Analisis kode dan AI scoring 
                  akan segera tersedia.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Project Overview Card */}
      <motion.div variants={itemVariants}>
        <Card className="border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-950/30 dark:via-purple-950/30 dark:to-fuchsia-950/30 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Score Circle */}
                <div className="relative">
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="6"
                      className="text-zinc-200 dark:text-zinc-700"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={201}
                      strokeDashoffset={201 - (201 * project.overallScore) / 100}
                      className={getScoreBgColor(project.overallScore).replace('bg-', 'text-')}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-2xl font-bold ${getScoreColor(project.overallScore)}`}>
                      {project.overallScore}
                    </span>
                    <span className="text-[10px] text-default-400">/ 100</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Chip size="sm" color={analysisStatusConfig.color} variant="flat" startContent={<StatusIcon size={12} />}>
                      {analysisStatusConfig.label}
                    </Chip>
                    <span
                      className={`flex items-center gap-1 text-sm ${
                        project.trend === 'up'
                          ? 'text-emerald-500'
                          : project.trend === 'down'
                          ? 'text-red-500'
                          : 'text-zinc-400'
                      }`}
                    >
                      {project.trend === 'up' && <TrendingUp size={14} />}
                      {project.trend === 'down' && <TrendingDown size={14} />}
                      {project.trend === 'stable' && <Minus size={14} />}
                      {project.trendValue > 0 ? '+' : ''}
                      {project.trendValue} dari sebelumnya
                    </span>
                  </div>
                  <h2 className="font-bold text-lg">{project.title}</h2>
                  <p className="text-sm text-default-500 mt-1 line-clamp-2">{project.description || 'Tidak ada deskripsi'}</p>
                </div>
              </div>
            </div>
          </div>

          <CardBody className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Mahasiswa Info */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                <Avatar 
                  name={project.mahasiswa.name} 
                  src={avatarSrc}
                  size="md" 
                />
                <div>
                  <p className="font-semibold text-sm">{project.mahasiswa.name}</p>
                  <p className="text-xs text-default-500">
                    {project.mahasiswa.username} - {project.mahasiswa.prodi}
                  </p>
                </div>
              </div>

              {/* Meta Info */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                  <Calendar size={14} className="text-default-400" />
                  <span className="text-xs">{project.semester} {project.tahunAkademik}</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                  <Clock size={14} className="text-default-400" />
                  <span className="text-xs">
                    {new Date(project.lastAnalyzed).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Links */}
            <div className="flex flex-wrap gap-2 mt-4">
              {project.githubRepoUrl && (
                <Button
                  as="a"
                  href={project.githubRepoUrl}
                  target="_blank"
                  size="sm"
                  variant="flat"
                  startContent={<Github size={14} />}
                >
                  Repository
                </Button>
              )}
              {project.productionUrl && (
                <Button
                  as="a"
                  href={project.productionUrl}
                  target="_blank"
                  size="sm"
                  variant="flat"
                  color="success"
                  startContent={<Globe size={14} />}
                >
                  Live Demo
                </Button>
              )}
              <Button
                as={Link}
                href={`/dosen/projects/${project.id}`}
                size="sm"
                variant="flat"
                color="primary"
                startContent={<Eye size={14} />}
              >
                Lihat Project
              </Button>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Analysis History */}
      <motion.div variants={itemVariants}>
        <Card className="border border-zinc-200 dark:border-zinc-800">
          <CardBody className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <History size={16} className="text-violet-500" />
              <h3 className="font-semibold text-sm">Riwayat Analisis</h3>
              <Chip size="sm" variant="flat" color="warning">Placeholder</Chip>
            </div>
            <div className="flex items-end gap-2 h-24">
              {project.analysisHistory.map((history, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={`w-full rounded-t-md ${getScoreBgColor(history.score)}`}
                    style={{ height: `${history.score}%` }}
                  />
                  <span className={`text-xs font-medium ${getScoreColor(history.score)}`}>
                    {history.score}
                  </span>
                  <span className="text-[10px] text-default-400">
                    {new Date(history.date).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Aspect Details */}
      <motion.div variants={itemVariants}>
        <div className="space-y-4">
          {project.aspects.map((aspect) => {
            const AspectIcon = ASPECT_ICONS[aspect.key] || FileText;
            const aspectColor = ASPECT_COLORS[aspect.key] || 'zinc';
            const aspectStatus = getStatusConfig(
              aspect.score >= 80 ? 'excellent' : 
              aspect.score >= 70 ? 'good' : 
              aspect.score >= 50 ? 'warning' : 'poor'
            );
            const scoreDiff = aspect.score - aspect.previousScore;

            return (
              <Card key={aspect.key} className="border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-zinc-50 to-zinc-50/50 dark:from-zinc-800/50 dark:to-zinc-800/30 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-700">
                        <AspectIcon size={18} className="text-zinc-600 dark:text-zinc-300" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{aspect.label}</h3>
                        <p className="text-xs text-default-500">{aspect.summary}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className={`text-2xl font-bold ${getScoreColor(aspect.score)}`}>
                            {aspect.score}
                          </span>
                          <span
                            className={`text-xs flex items-center gap-0.5 ${
                              scoreDiff > 0 ? 'text-emerald-500' : scoreDiff < 0 ? 'text-red-500' : 'text-zinc-400'
                            }`}
                          >
                            {scoreDiff > 0 ? <TrendingUp size={12} /> : scoreDiff < 0 ? <TrendingDown size={12} /> : <Minus size={12} />}
                            {scoreDiff > 0 ? '+' : ''}
                            {scoreDiff}
                          </span>
                        </div>
                        <Chip size="sm" color={aspectStatus.color} variant="flat" className="mt-1">
                          {aspectStatus.label}
                        </Chip>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getScoreBgColor(aspect.score)} transition-all duration-500`}
                        style={{ width: `${aspect.score}%` }}
                      />
                    </div>
                  </div>
                </div>

                <CardBody className="p-4 space-y-4">
                  {/* Details Table */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <FileText size={14} className="text-default-400" />
                      Detail Analisis
                      <Chip size="sm" variant="flat" color="warning">Placeholder</Chip>
                    </h4>
                    <div className="space-y-1.5">
                      {aspect.details.map((detail, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50"
                        >
                          <div className="flex items-center gap-2">
                            {getItemStatusIcon(detail.status)}
                            <span className="text-sm">{detail.item}</span>
                          </div>
                          <span className="text-sm text-default-500">{detail.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Suggestions */}
                  {aspect.suggestions.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium flex items-center gap-2">
                        <Lightbulb size={14} className="text-amber-500" />
                        Saran Perbaikan
                      </h4>
                      <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20">
                        <ul className="space-y-1.5">
                          {aspect.suggestions.map((suggestion, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-amber-800 dark:text-amber-200">
                              <span className="text-amber-500 mt-1">•</span>
                              <span>{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </CardBody>
              </Card>
            );
          })}
        </div>
      </motion.div>

      {/* Info Card */}
      <motion.div variants={itemVariants}>
        <Card className="border border-dashed border-violet-300 dark:border-violet-700 bg-violet-50/50 dark:bg-violet-500/5">
          <CardBody className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-500/20">
                <AlertCircle size={20} className="text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">Catatan</h4>
                <p className="text-xs text-default-500 leading-relaxed">
                  Hasil analisis ini akan dihasilkan secara otomatis oleh sistem AI dan bersifat sebagai referensi.
                  Penilaian akhir tetap berada di tangan dosen penguji berdasarkan rubrik penilaian yang berlaku.
                  Saat ini fitur AI analysis masih dalam pengembangan.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </motion.div>
  );
}
