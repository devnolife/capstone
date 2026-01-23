'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Card,
  CardBody,
  Button,
  Chip,
  Avatar,
  Progress,
  Tooltip,
} from '@heroui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  FileText,
  Github,
  ExternalLink,
  Edit,
  MessageSquare,
  ClipboardList,
  CheckCircle2,
  Circle,
  Calendar,
  Clock,
  FolderGit2,
  Send,
  Users,
  TrendingUp,
  Award,
  AlertCircle,
  ChevronRight,
  Sparkles,
  GraduationCap,
  Rocket,
  Lightbulb,
  Star,
  Code,
  ChevronDown,
  ChevronUp,
  Eye,
} from 'lucide-react';
import { GitHubCodeViewer } from '@/components/github';
import { parseGitHubUrl } from '@/lib/github';
import { SubmitProjectButton } from '@/components/projects/submit-button';
import {
  formatDateTime,
  getStatusColor,
  getStatusLabel,
} from '@/lib/utils';

interface ReviewComment {
  id: string;
  content: string;
  filePath: string | null;
  lineNumber: number | null;
}

interface ReviewScore {
  id: string;
  score: number;
  rubrik: {
    name: string;
    bobotMax: number;
  };
}

interface Review {
  id: string;
  status: string;
  overallScore: number | null;
  overallComment: string | null;
  updatedAt: Date;
  reviewer: {
    id: string;
    name: string;
    username: string;
    image: string | null;
  };
  comments: ReviewComment[];
  scores: ReviewScore[];
}

interface Assignment {
  id: string;
  dosen: {
    id: string;
    name: string;
    username: string;
    image: string | null;
  };
}

interface ProjectRequirements {
  id: string;
  projectId: string;
  integrasiMatakuliah: string | null;
  metodologi: string | null;
  ruangLingkup: string | null;
  sumberDayaBatasan: string | null;
  fiturUtama: string | null;
  analisisTemuan: string | null;
  presentasiUjian: string | null;
  stakeholder: string | null;
  kepatuhanEtika: string | null;
  completionPercent: number;
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
  createdAt: Date;
  updatedAt: Date;
  submittedAt: Date | null;
  mahasiswaId: string;
  mahasiswa: {
    id: string;
    name: string;
    username: string;
    image: string | null;
  };
  requirements: ProjectRequirements | null;
  reviews: Review[];
  assignments: Assignment[];
}

interface ProjectDetailContentProps {
  project: Project;
  canEdit: boolean;
}

// Progress steps configuration
const PROGRESS_STEPS = [
  { key: 'created', label: 'Project Dibuat', icon: FolderGit2 },
  { key: 'requirements', label: 'Persyaratan Lengkap', icon: ClipboardList },
  { key: 'submitted', label: 'Disubmit', icon: Send },
  { key: 'review', label: 'Dalam Review', icon: MessageSquare },
  { key: 'approved', label: 'Disetujui', icon: Award },
];

// Requirements list with database field mapping
const REQUIREMENTS = [
  { key: 'integrasiMatakuliah', label: 'Integrasi Mata Kuliah', icon: GraduationCap, category: 'akademik' },
  { key: 'metodologi', label: 'Metodologi', icon: GraduationCap, category: 'akademik' },
  { key: 'ruangLingkup', label: 'Ruang Lingkup', icon: Rocket, category: 'teknis' },
  { key: 'sumberDayaBatasan', label: 'Sumber Daya & Batasan', icon: Rocket, category: 'teknis' },
  { key: 'fiturUtama', label: 'Fitur Utama', icon: Rocket, category: 'teknis' },
  { key: 'analisisTemuan', label: 'Analisis Temuan', icon: Lightbulb, category: 'analisis' },
  { key: 'presentasiUjian', label: 'Presentasi & Ujian', icon: Lightbulb, category: 'analisis' },
  { key: 'stakeholder', label: 'Stakeholder', icon: Lightbulb, category: 'analisis' },
  { key: 'kepatuhanEtika', label: 'Kepatuhan Etika', icon: Lightbulb, category: 'analisis' },
];

const getStatusGradient = (status: string) => {
  switch (status) {
    case 'APPROVED':
      return 'from-emerald-500 via-green-500 to-teal-500';
    case 'REJECTED':
      return 'from-red-500 via-rose-500 to-pink-500';
    case 'IN_REVIEW':
      return 'from-amber-500 via-orange-500 to-yellow-500';
    case 'SUBMITTED':
      return 'from-blue-500 via-indigo-500 to-violet-500';
    case 'REVISION_NEEDED':
      return 'from-orange-500 via-amber-500 to-yellow-500';
    default:
      return 'from-blue-600 via-indigo-600 to-violet-600';
  }
};

const getProgressValue = (status: string, hasReviews: boolean, requirementsPercent: number) => {
  switch (status) {
    case 'APPROVED':
      return 100;
    case 'REJECTED':
      return 100;
    case 'IN_REVIEW':
      return 75;
    case 'SUBMITTED':
      return 50;
    case 'REVISION_NEEDED':
      return 60;
    default:
      // For DRAFT status, use requirements completion as progress
      // Scale from 0-100 to 0-40 (max 40% for draft with complete requirements)
      return Math.round((requirementsPercent / 100) * 40);
  }
};

const getStepStatus = (stepKey: string, projectStatus: string, hasReviews: boolean, requirementsComplete: boolean) => {
  const statusOrder: Record<string, number> = {
    DRAFT: 1,
    SUBMITTED: 3,
    IN_REVIEW: 4,
    REVISION_NEEDED: 3,
    APPROVED: 5,
    REJECTED: 5,
  };

  const stepOrder: Record<string, number> = {
    created: 1,
    requirements: 2,
    submitted: 3,
    review: 4,
    approved: 5,
  };

  const currentOrder = statusOrder[projectStatus] || 1;
  const thisStepOrder = stepOrder[stepKey];

  if (stepKey === 'approved' && projectStatus === 'REJECTED') return 'rejected';
  if (stepKey === 'requirements' && requirementsComplete) return 'completed';
  if (stepKey === 'requirements' && !requirementsComplete && projectStatus === 'DRAFT') return 'current';
  if (stepKey === 'review' && hasReviews) return 'completed';
  if (thisStepOrder < currentOrder) return 'completed';
  if (thisStepOrder === currentOrder) return 'current';
  return 'pending';
};

export function ProjectDetailContent({
  project,
  canEdit,
}: ProjectDetailContentProps) {
  // State for code viewer visibility
  const [showCodeViewer, setShowCodeViewer] = useState(false);

  // Parse GitHub URL to get owner and repo
  const githubInfo = project.githubRepoUrl ? parseGitHubUrl(project.githubRepoUrl) : null;

  // Calculate requirements completion
  const requirementsPercent = project.requirements?.completionPercent ?? 0;
  const requirementsComplete = requirementsPercent === 100;

  // Check which requirements are filled
  const getFilledRequirements = () => {
    if (!project.requirements) return {};
    const req = project.requirements;
    return {
      integrasiMatakuliah: !!req.integrasiMatakuliah?.trim(),
      metodologi: !!req.metodologi?.trim(),
      ruangLingkup: !!req.ruangLingkup?.trim(),
      sumberDayaBatasan: !!req.sumberDayaBatasan?.trim(),
      fiturUtama: !!req.fiturUtama?.trim(),
      analisisTemuan: !!req.analisisTemuan?.trim(),
      presentasiUjian: !!req.presentasiUjian?.trim(),
      stakeholder: !!req.stakeholder?.trim(),
      kepatuhanEtika: !!req.kepatuhanEtika?.trim(),
    };
  };

  const filledRequirements = getFilledRequirements();
  const progressValue = getProgressValue(project.status, project.reviews.length > 0, requirementsPercent);

  return (
    <div className="w-full space-y-6 pb-8">
      {/* Hero Header Card */}
      <Card className={`border-0 bg-gradient-to-br ${getStatusGradient(project.status)} text-white overflow-hidden`}>
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
        <CardBody className="p-6 relative">
          {/* Top Actions */}
          <div className="flex items-center justify-between mb-6">
            <Button
              as={Link}
              href="/mahasiswa/projects"
              variant="flat"
              size="sm"
              className="bg-white/20 text-white hover:bg-white/30"
              startContent={<ArrowLeft size={16} />}
            >
              Kembali
            </Button>
            <div className="flex items-center gap-2">
              {canEdit && (
                <Button
                  as={Link}
                  href={`/mahasiswa/projects/${project.id}/edit`}
                  variant="flat"
                  size="sm"
                  className="bg-white/20 text-white hover:bg-white/30"
                  startContent={<Edit size={16} />}
                >
                  Edit
                </Button>
              )}
              <SubmitProjectButton
                projectId={project.id}
                currentStatus={project.status}
              />
            </div>
          </div>

          {/* Project Title & Info */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                  <FolderGit2 size={28} />
                </div>
                <div>
                  <Chip
                    size="sm"
                    className="bg-white/20 text-white mb-2"
                    startContent={project.status === 'APPROVED' ? <Sparkles size={12} /> : undefined}
                  >
                    {getStatusLabel(project.status)}
                  </Chip>
                  <h1 className="text-2xl md:text-3xl font-bold">{project.title}</h1>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  {project.semester}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={14} />
                  {project.tahunAkademik}
                </span>
                {project.githubRepoUrl && (
                  <a
                    href={project.githubRepoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 hover:text-white transition-colors"
                  >
                    <Github size={14} />
                    {project.githubRepoName?.split('/')[1] || 'Repository'}
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>

            {/* Progress Circle */}
            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <p className="text-white/70 text-sm">Progress</p>
                <p className="text-3xl font-bold">{progressValue}%</p>
              </div>
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    fill="none"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="8"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    fill="none"
                    stroke="white"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={201}
                    strokeDashoffset={201 - (201 * progressValue) / 100}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center md:hidden">
                  <span className="text-lg font-bold">{progressValue}%</span>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description Card */}
          {project.description && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <CardBody className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                      <FileText size={18} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="font-semibold text-lg">Deskripsi Project</h2>
                  </div>
                  <p className="text-default-600 leading-relaxed">{project.description}</p>
                </CardBody>
              </Card>
            </motion.div>
          )}

          {/* GitHub Repository Card with Code Viewer */}
          {project.githubRepoUrl && githubInfo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <CardBody className="p-0">
                  {/* Repository Header */}
                  <div className="flex items-center gap-4 p-5 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="p-3 rounded-2xl bg-zinc-900 dark:bg-zinc-700 text-white">
                      <Github size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-lg">
                        {project.githubRepoName || 'GitHub Repository'}
                      </p>
                      <p className="text-sm text-default-500 truncate">{project.githubRepoUrl}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="flat"
                        color="primary"
                        startContent={showCodeViewer ? <ChevronUp size={16} /> : <Eye size={16} />}
                        onPress={() => setShowCodeViewer(!showCodeViewer)}
                      >
                        {showCodeViewer ? 'Sembunyikan' : 'Lihat Kode'}
                      </Button>
                      <Button
                        as={Link}
                        href={`/mahasiswa/projects/${project.id}/code`}
                        size="sm"
                        variant="flat"
                        color="secondary"
                        startContent={<Code size={14} />}
                      >
                        Fullscreen
                      </Button>
                      <Button
                        as="a"
                        href={project.githubRepoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="sm"
                        variant="bordered"
                        startContent={<ExternalLink size={14} />}
                      >
                        GitHub
                      </Button>
                    </div>
                  </div>

                  {/* Code Viewer Section */}
                  <AnimatePresence>
                    {showCodeViewer && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 bg-zinc-50 dark:bg-zinc-900">
                          <div className="rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700">
                            <GitHubCodeViewer
                              owner={githubInfo.owner}
                              repo={githubInfo.repo}
                              defaultBranch="main"
                              projectId={project.id}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardBody>
              </Card>
            </motion.div>
          )}

          {/* Requirements Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <CardBody className="p-0">
                {/* Header */}
                <div className="p-5 bg-gradient-to-r from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-800 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                        <ClipboardList size={20} />
                      </div>
                      <div>
                        <h2 className="font-bold text-lg">Persyaratan Dokumen</h2>
                        <p className="text-xs text-default-500">
                          {requirementsComplete ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">Semua persyaratan lengkap!</span>
                          ) : (
                            <span>{requirementsPercent}% terisi - {Object.values(filledRequirements).filter(Boolean).length}/9 persyaratan</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* Progress Circle */}
                      <div className="relative w-12 h-12">
                        <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                          <circle
                            cx="24"
                            cy="24"
                            r="18"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                            className="text-zinc-200 dark:text-zinc-700"
                          />
                          <circle
                            cx="24"
                            cy="24"
                            r="18"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeDasharray={113}
                            strokeDashoffset={113 - (113 * requirementsPercent) / 100}
                            className={`transition-all duration-500 ${requirementsComplete ? 'text-emerald-500' : 'text-violet-500'
                              }`}
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
                          {requirementsPercent}%
                        </span>
                      </div>
                      <Button
                        as={Link}
                        href={`/mahasiswa/documents/${project.id}`}
                        color={requirementsComplete ? 'success' : 'primary'}
                        size="sm"
                        endContent={<ChevronRight size={16} />}
                      >
                        {requirementsComplete ? 'Lihat' : 'Isi'}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Requirements Grid */}
                <div className="p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                    {/* Akademik */}
                    <div className="p-4 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <GraduationCap size={16} className="text-violet-600 dark:text-violet-400" />
                          <span className="text-sm font-semibold text-violet-700 dark:text-violet-300">Akademik</span>
                        </div>
                        <span className="text-[10px] font-medium text-violet-600 dark:text-violet-400">
                          {REQUIREMENTS.filter(r => r.category === 'akademik' && filledRequirements[r.key as keyof typeof filledRequirements]).length}/
                          {REQUIREMENTS.filter(r => r.category === 'akademik').length}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {REQUIREMENTS.filter(r => r.category === 'akademik').map((req) => {
                          const isFilled = filledRequirements[req.key as keyof typeof filledRequirements];
                          return (
                            <div key={req.key} className={`flex items-center gap-2 text-xs ${isFilled
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-violet-600 dark:text-violet-400'
                              }`}>
                              {isFilled ? <CheckCircle2 size={12} /> : <Circle size={12} />}
                              <span className={isFilled ? 'line-through opacity-70' : ''}>{req.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Teknis */}
                    <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Rocket size={16} className="text-orange-600 dark:text-orange-400" />
                          <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">Teknis</span>
                        </div>
                        <span className="text-[10px] font-medium text-orange-600 dark:text-orange-400">
                          {REQUIREMENTS.filter(r => r.category === 'teknis' && filledRequirements[r.key as keyof typeof filledRequirements]).length}/
                          {REQUIREMENTS.filter(r => r.category === 'teknis').length}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {REQUIREMENTS.filter(r => r.category === 'teknis').map((req) => {
                          const isFilled = filledRequirements[req.key as keyof typeof filledRequirements];
                          return (
                            <div key={req.key} className={`flex items-center gap-2 text-xs ${isFilled
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-orange-600 dark:text-orange-400'
                              }`}>
                              {isFilled ? <CheckCircle2 size={12} /> : <Circle size={12} />}
                              <span className={isFilled ? 'line-through opacity-70' : ''}>{req.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Analisis */}
                    <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Lightbulb size={16} className="text-emerald-600 dark:text-emerald-400" />
                          <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Analisis</span>
                        </div>
                        <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                          {REQUIREMENTS.filter(r => r.category === 'analisis' && filledRequirements[r.key as keyof typeof filledRequirements]).length}/
                          {REQUIREMENTS.filter(r => r.category === 'analisis').length}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {REQUIREMENTS.filter(r => r.category === 'analisis').map((req) => {
                          const isFilled = filledRequirements[req.key as keyof typeof filledRequirements];
                          return (
                            <div key={req.key} className={`flex items-center gap-2 text-xs ${isFilled
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-emerald-600/60 dark:text-emerald-400/60'
                              }`}>
                              {isFilled ? <CheckCircle2 size={12} /> : <Circle size={12} />}
                              <span className={isFilled ? 'line-through opacity-70' : ''}>{req.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <Button
                    as={Link}
                    href={`/mahasiswa/documents/${project.id}`}
                    color={requirementsComplete ? 'success' : 'primary'}
                    className="w-full"
                    size="lg"
                    startContent={requirementsComplete ? <Sparkles size={18} /> : <CheckCircle2 size={18} />}
                  >
                    {requirementsComplete ? 'Persyaratan Lengkap - Lihat Detail' : 'Lengkapi Persyaratan Sekarang'}
                  </Button>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* Reviews Card */}
          {project.reviews.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <CardBody className="p-5">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/30">
                      <MessageSquare size={18} className="text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-lg">Review & Feedback</h2>
                      <p className="text-xs text-default-500">{project.reviews.length} review</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {project.reviews.map((review) => (
                      <div
                        key={review.id}
                        className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Avatar
                              name={review.reviewer.name}
                              src={review.reviewer.image || undefined}
                              size="sm"
                              className="ring-2 ring-white dark:ring-zinc-800"
                            />
                            <div>
                              <p className="font-medium text-sm">{review.reviewer.name}</p>
                              <p className="text-xs text-default-500">
                                {formatDateTime(review.updatedAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Chip
                              size="sm"
                              color={getStatusColor(review.status)}
                              variant="flat"
                            >
                              {getStatusLabel(review.status)}
                            </Chip>
                            {review.overallScore !== null && (
                              <Chip size="sm" color="primary" variant="solid" startContent={<Star size={10} />}>
                                {review.overallScore}
                              </Chip>
                            )}
                          </div>
                        </div>

                        {review.overallComment && (
                          <div className="bg-white dark:bg-zinc-900 rounded-lg p-3 mb-3 border border-zinc-100 dark:border-zinc-700">
                            <p className="text-sm text-default-600">{review.overallComment}</p>
                          </div>
                        )}

                        {review.scores.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-default-500">Skor per Kategori</p>
                            {review.scores.map((score) => (
                              <div key={score.id} className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span className="text-default-600">{score.rubrik.name}</span>
                                  <span className="font-medium">
                                    {score.score}/{score.rubrik.bobotMax}
                                  </span>
                                </div>
                                <Progress
                                  value={(score.score / score.rubrik.bobotMax) * 100}
                                  color="primary"
                                  size="sm"
                                  className="h-1.5"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Progress Timeline Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <TrendingUp size={18} className="text-blue-600 dark:text-blue-400" />
                  <h3 className="font-semibold">Progress Project</h3>
                </div>
              </div>
              <CardBody className="p-4">
                <div className="space-y-1">
                  {PROGRESS_STEPS.map((step, index) => {
                    const status = getStepStatus(step.key, project.status, project.reviews.length > 0, requirementsComplete);
                    const StepIcon = step.icon;
                    const isLast = index === PROGRESS_STEPS.length - 1;

                    return (
                      <div key={step.key} className="flex items-start gap-3">
                        {/* Icon & Line */}
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${status === 'completed'
                              ? 'bg-emerald-500 text-white'
                              : status === 'current'
                                ? 'bg-blue-500 text-white ring-4 ring-blue-100 dark:ring-blue-900'
                                : status === 'rejected'
                                  ? 'bg-red-500 text-white'
                                  : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-400'
                              }`}
                          >
                            {status === 'completed' ? (
                              <CheckCircle2 size={16} />
                            ) : status === 'rejected' ? (
                              <AlertCircle size={16} />
                            ) : (
                              <StepIcon size={16} />
                            )}
                          </div>
                          {!isLast && (
                            <div
                              className={`w-0.5 h-8 my-1 ${status === 'completed'
                                ? 'bg-emerald-500'
                                : 'bg-zinc-200 dark:bg-zinc-700'
                                }`}
                            />
                          )}
                        </div>

                        {/* Label */}
                        <div className="pt-1">
                          <p
                            className={`text-sm font-medium ${status === 'completed'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : status === 'current'
                                ? 'text-blue-600 dark:text-blue-400'
                                : status === 'rejected'
                                  ? 'text-red-600 dark:text-red-400'
                                  : 'text-zinc-400'
                              }`}
                          >
                            {step.label}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* Dosen Penguji Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <Users size={18} className="text-violet-600 dark:text-violet-400" />
                  <h3 className="font-semibold">Dosen Penguji</h3>
                </div>
              </div>
              <CardBody className="p-4">
                {project.assignments.length === 0 ? (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                      <Users size={24} className="text-zinc-400" />
                    </div>
                    <p className="text-sm text-default-500">Belum ada dosen yang ditugaskan</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {project.assignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50"
                      >
                        <Avatar
                          name={assignment.dosen.name}
                          src={assignment.dosen.image || undefined}
                          size="sm"
                          className="ring-2 ring-white dark:ring-zinc-700"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{assignment.dosen.name}</p>
                          <p className="text-xs text-default-500">@{assignment.dosen.username}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          </motion.div>

          {/* Timeline Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-zinc-600 dark:text-zinc-400" />
                  <h3 className="font-semibold">Timeline</h3>
                </div>
              </div>
              <CardBody className="p-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-blue-500" />
                    <div>
                      <p className="text-xs text-default-500">Dibuat</p>
                      <p className="text-sm font-medium">{formatDateTime(project.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-emerald-500" />
                    <div>
                      <p className="text-xs text-default-500">Terakhir Diperbarui</p>
                      <p className="text-sm font-medium">{formatDateTime(project.updatedAt)}</p>
                    </div>
                  </div>
                  {project.submittedAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 mt-2 rounded-full bg-violet-500" />
                      <div>
                        <p className="text-xs text-default-500">Disubmit</p>
                        <p className="text-sm font-medium">{formatDateTime(project.submittedAt)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
