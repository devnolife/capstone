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
  Crown,
  MapPin,
  CalendarCheck,
  Server,
  Trophy,
} from 'lucide-react';
import { GitHubCodeViewer } from '@/components/github';
import { parseGitHubUrl } from '@/lib/github';
import { SubmitProjectButton } from '@/components/projects/submit-button';
import {
  formatDateTime,
  getStatusColor,
  getStatusLabel,
  getDeploymentPlatform,
  getDeploymentCategoryLabel,
  getDeploymentCategoryColor,
  parseDeploymentTools,
  getToolCategoriesForPlatform,
} from '@/lib/utils';
import StakeholderUpload from './stakeholder-upload';
import ProjectScreenshotUpload from './screenshot-upload';


interface ReviewComment {
  id: string;
  content: string;
  filePath: string | null;
  lineStart: number | null;
  lineEnd: number | null;
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

interface PresentationSchedule {
  id: string;
  scheduledDate: Date;
  startTime: string;
  endTime: string | null;
  location: string | null;
  notes: string | null;
  presentationStatus: string;
  completedAt: Date | null;
  scheduledBy: {
    id: string;
    name: string;
  };
}

interface StakeholderDocument {
  id: string;
  projectId: string;
  stakeholderName: string;
  stakeholderRole: string | null;
  organization: string | null;
  type: "SIGNATURE" | "PHOTO" | "AGREEMENT_LETTER" | "ID_CARD" | "SCREENSHOT" | "SUPPORTING_DOCUMENT" | "OTHER";
  fileName: string;
  fileUrl: string;
  fileSize: number;
  description: string | null;
  uploadedAt: string;
}

// Interface for documents from database (with Date)
interface StakeholderDocumentFromDB {
  id: string;
  projectId: string;
  stakeholderName: string;
  stakeholderRole: string | null;
  organization: string | null;
  type: "SIGNATURE" | "PHOTO" | "AGREEMENT_LETTER" | "ID_CARD" | "SCREENSHOT" | "SUPPORTING_DOCUMENT" | "OTHER";
  fileName: string;
  fileUrl: string;
  fileSize: number;
  description: string | null;
  uploadedAt: Date;
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
  deploymentPlatform: string | null;
  deploymentDescription: string | null;
  deploymentEvidence: string | null;
  deploymentTools: string | null;
  deploymentBonusPoints: number;
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
    nim?: string | null;
    prodi?: string | null;
    image: string | null;
    githubUsername?: string | null;
  };
  members?: {
    id: string;
    role: string;
    userId: string | null;
    user: {
      id: string;
      name: string;
      username: string;
      nim: string | null;
      prodi: string | null;
      image: string | null;
      githubUsername: string | null;
    } | null;
  }[];
  invitations?: {
    id: string;
    status: string;
    invitee: {
      id: string;
      name: string;
      username: string;
      nim: string | null;
      prodi: string | null;
      image: string | null;
      githubUsername: string | null;
    };
  }[];
  requirements: ProjectRequirements | null;
  reviews: Review[];
  assignments: Assignment[];
  stakeholderDocuments: StakeholderDocumentFromDB[];
  presentationSchedule?: PresentationSchedule | null;
}

interface ProjectDetailContentProps {
  project: Project;
  canEdit: boolean;
  isOwner?: boolean;
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

/** Titik status semantik kecil di dalam chip (satu-satunya warna di header). */
const statusDotClass = (status: string) => {
  switch (status) {
    case 'APPROVED':
      return 'bg-success';
    case 'REJECTED':
      return 'bg-danger';
    case 'IN_REVIEW':
      return 'bg-warning animate-pulse';
    case 'REVISION_NEEDED':
      return 'bg-warning';
    case 'SUBMITTED':
      return 'bg-primary';
    default:
      return 'bg-app-teritary-invert';
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
  isOwner = false,
}: ProjectDetailContentProps) {
  // State for code viewer visibility
  const [showCodeViewer, setShowCodeViewer] = useState(false);

  // State for stakeholder documents
  const [stakeholderDocs, setStakeholderDocs] = useState<StakeholderDocument[]>(
    // Convert Date to string for the component
    project.stakeholderDocuments.map(doc => ({
      ...doc,
      uploadedAt: doc.uploadedAt.toISOString(),
    }))
  );

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
      <Card className="border border-zinc-800 bg-card overflow-hidden">
        <CardBody className="p-6 relative">
          {/* Top Actions */}
          <div className="flex items-center justify-between mb-6">
            <Button
              as={Link}
              href="/mahasiswa/projects"
              variant="flat"
              size="sm"
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
                  startContent={<Edit size={16} />}
                >
                  Edit
                </Button>
              )}
              {isOwner && (
                <SubmitProjectButton
                  projectId={project.id}
                  currentStatus={project.status}
                />
              )}
            </div>
          </div>

          {/* Project Title & Info */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="bg-app-primary text-foreground flex size-12 shrink-0 items-center justify-center rounded-xl">
                  <FolderGit2 size={24} />
                </div>
                <div>
                  <span className="border-app-secondary bg-app-quinary text-app-secondary-invert mb-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium whitespace-nowrap">
                    <span className={`size-1.5 rounded-full ${statusDotClass(project.status)}`} />
                    {getStatusLabel(project.status)}
                  </span>
                  <h1 className="font-display text-2xl md:text-3xl font-[450] tracking-tight">{project.title}</h1>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-app-secondary-invert text-sm">
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
                    className="flex items-center gap-1.5 hover:text-foreground transition-colors"
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
                <p className="text-app-teritary-invert font-mono text-[10px] uppercase tracking-[0.18em]">Progress</p>
                <p className="text-3xl font-bold tabular-nums">{progressValue}%</p>
              </div>
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-app-primary"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={201}
                    strokeDashoffset={201 - (201 * progressValue) / 100}
                    className="text-primary transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center md:hidden">
                  <span className="text-lg font-bold tabular-nums">{progressValue}%</span>
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
              <Card className="border border-zinc-800 shadow-sm">
                <CardBody className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-app-primary text-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
                      <FileText size={18} />
                    </div>
                    <h2 className="font-semibold text-lg">Deskripsi Project</h2>
                  </div>
                  <p className="text-app-secondary-invert leading-relaxed">{project.description}</p>
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
              <Card className="border border-zinc-800 shadow-sm overflow-hidden">
                <CardBody className="p-0">
                  {/* Repository Header */}
                  <div className="flex items-center gap-4 p-5 border-b border-zinc-800">
                    <div className="bg-app-primary text-foreground flex size-12 shrink-0 items-center justify-center rounded-xl">
                      <Github size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-lg">
                        {project.githubRepoName || 'GitHub Repository'}
                      </p>
                      <p className="text-sm text-app-secondary-invert truncate">{project.githubRepoUrl}</p>
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
                        <div className="p-4 bg-app-quinary">
                          <div className="rounded-lg overflow-hidden border border-zinc-800">
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
            <Card className="border border-zinc-800 shadow-sm overflow-hidden">
              <CardBody className="p-0">
                {/* Header */}
                <div className="p-5 bg-app-quinary border-b border-zinc-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-app-primary text-foreground flex size-10 shrink-0 items-center justify-center rounded-lg">
                        <ClipboardList size={20} />
                      </div>
                      <div>
                        <h2 className="font-bold text-lg">Persyaratan Dokumen</h2>
                        <p className="text-xs text-app-secondary-invert tabular-nums">
                          {requirementsComplete ? (
                            <span className="text-success font-medium">Semua persyaratan lengkap!</span>
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
                            className="text-app-primary"
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
                            className={`transition-all duration-500 ${requirementsComplete ? 'text-success' : 'text-primary'
                              }`}
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold tabular-nums">
                          {requirementsPercent}%
                        </span>
                      </div>
                      <Button
                        as={Link}
                        href={`/mahasiswa/documents/${project.id}`}
                        color={!isOwner ? 'default' : (requirementsComplete ? 'success' : 'primary')}
                        variant={!isOwner ? 'flat' : 'solid'}
                        size="sm"
                        endContent={<ChevronRight size={16} />}
                      >
                        {!isOwner ? 'Lihat' : (requirementsComplete ? 'Lihat' : 'Isi')}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Requirements Grid */}
                <div className="p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                    {/* Akademik */}
                    <div className="p-4 rounded-xl bg-app-quinary border border-zinc-800">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <GraduationCap size={16} className="text-app-secondary-invert" />
                          <span className="text-sm font-semibold">Akademik</span>
                        </div>
                        <span className="font-mono text-[10px] tabular-nums text-app-teritary-invert">
                          {REQUIREMENTS.filter(r => r.category === 'akademik' && filledRequirements[r.key as keyof typeof filledRequirements]).length}/
                          {REQUIREMENTS.filter(r => r.category === 'akademik').length}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {REQUIREMENTS.filter(r => r.category === 'akademik').map((req) => {
                          const isFilled = filledRequirements[req.key as keyof typeof filledRequirements];
                          return (
                            <div key={req.key} className={`flex items-center gap-2 text-xs ${isFilled
                              ? 'text-success'
                              : 'text-app-secondary-invert'
                              }`}>
                              {isFilled ? <CheckCircle2 size={12} /> : <Circle size={12} />}
                              <span className={isFilled ? 'line-through opacity-70' : ''}>{req.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Teknis */}
                    <div className="p-4 rounded-xl bg-app-quinary border border-zinc-800">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Rocket size={16} className="text-app-secondary-invert" />
                          <span className="text-sm font-semibold">Teknis</span>
                        </div>
                        <span className="font-mono text-[10px] tabular-nums text-app-teritary-invert">
                          {REQUIREMENTS.filter(r => r.category === 'teknis' && filledRequirements[r.key as keyof typeof filledRequirements]).length}/
                          {REQUIREMENTS.filter(r => r.category === 'teknis').length}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {REQUIREMENTS.filter(r => r.category === 'teknis').map((req) => {
                          const isFilled = filledRequirements[req.key as keyof typeof filledRequirements];
                          return (
                            <div key={req.key} className={`flex items-center gap-2 text-xs ${isFilled
                              ? 'text-success'
                              : 'text-app-secondary-invert'
                              }`}>
                              {isFilled ? <CheckCircle2 size={12} /> : <Circle size={12} />}
                              <span className={isFilled ? 'line-through opacity-70' : ''}>{req.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Analisis */}
                    <div className="p-4 rounded-xl bg-app-quinary border border-zinc-800">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Lightbulb size={16} className="text-app-secondary-invert" />
                          <span className="text-sm font-semibold">Analisis</span>
                        </div>
                        <span className="font-mono text-[10px] tabular-nums text-app-teritary-invert">
                          {REQUIREMENTS.filter(r => r.category === 'analisis' && filledRequirements[r.key as keyof typeof filledRequirements]).length}/
                          {REQUIREMENTS.filter(r => r.category === 'analisis').length}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {REQUIREMENTS.filter(r => r.category === 'analisis').map((req) => {
                          const isFilled = filledRequirements[req.key as keyof typeof filledRequirements];
                          return (
                            <div key={req.key} className={`flex items-center gap-2 text-xs ${isFilled
                              ? 'text-success'
                              : 'text-app-secondary-invert'
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
                    color={!isOwner ? 'default' : (requirementsComplete ? 'success' : 'primary')}
                    variant={!isOwner ? 'flat' : 'solid'}
                    className="w-full"
                    size="lg"
                    startContent={!isOwner ? <FileText size={18} /> : (requirementsComplete ? <Sparkles size={18} /> : <CheckCircle2 size={18} />)}
                  >
                    {!isOwner 
                      ? 'Lihat Persyaratan' 
                      : (requirementsComplete ? 'Persyaratan Lengkap - Lihat Detail' : 'Lengkapi Persyaratan Sekarang')}
                  </Button>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* Deployment Info Card */}
          {project.requirements?.deploymentPlatform && (() => {
            const platform = getDeploymentPlatform(project.requirements.deploymentPlatform);
            if (!platform) return null;
            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.21 }}
              >
                <Card className="border border-zinc-800 shadow-sm overflow-hidden">
                  <CardBody className="p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-app-primary text-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
                        <Server size={18} />
                      </div>
                      <div className="flex-1">
                        <h2 className="font-semibold text-lg">Deployment Setup</h2>
                        <p className="text-xs text-app-secondary-invert">Konfigurasi deployment aplikasi</p>
                      </div>
                      <Chip
                        size="sm"
                        color={getDeploymentCategoryColor(platform.category)}
                        variant="flat"
                      >
                        {getDeploymentCategoryLabel(platform.category)}
                      </Chip>
                    </div>

                    <div className="space-y-3">
                      {/* Platform Info */}
                      <div className="p-3 rounded-xl bg-app-quinary border border-zinc-800">
                        <p className="text-xs text-app-teritary-invert mb-1">Platform</p>
                        <p className="text-sm font-semibold">{platform.label}</p>
                        <p className="text-xs text-app-secondary-invert mt-0.5">{platform.description}</p>
                      </div>

                      {/* Bonus Points */}
                      <div className="p-3 rounded-xl bg-app-quinary border border-zinc-800">
                        <div className="flex items-center gap-2">
                          <Trophy size={16} className="text-warning" />
                          <span className="text-sm font-bold tabular-nums">
                            +{project.requirements.deploymentBonusPoints} poin bonus deployment
                          </span>
                        </div>
                      </div>

                      {/* Deployment Tools */}
                      {(() => {
                        const tools = parseDeploymentTools(project.requirements.deploymentTools);
                        if (tools.length === 0) return null;
                        const toolCategories = getToolCategoriesForPlatform(platform.category);
                        const groupedTools = toolCategories
                          .map((cat) => ({
                            ...cat,
                            selected: cat.tools.filter((t) => tools.includes(t.key)),
                          }))
                          .filter((cat) => cat.selected.length > 0);

                        return (
                          <div className="p-3 rounded-xl bg-app-quinary border border-zinc-800">
                            <p className="text-xs text-app-teritary-invert mb-2 tabular-nums">Tools & Services ({tools.length})</p>
                            <div className="space-y-2.5">
                              {groupedTools.map((cat) => (
                                <div key={cat.key}>
                                  <p className="text-xs text-app-secondary-invert font-medium mb-1">{cat.label}</p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {cat.selected.map((tool) => (
                                      <Chip
                                        key={tool.key}
                                        size="sm"
                                        variant="flat"
                                        color="primary"
                                        startContent={<CheckCircle2 size={10} />}
                                      >
                                        {tool.label}
                                      </Chip>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Description */}
                      {project.requirements.deploymentDescription && (
                        <div className="p-3 rounded-xl bg-app-quinary border border-zinc-800">
                          <p className="text-xs text-app-teritary-invert mb-1">Deskripsi Deployment</p>
                          <p className="text-xs text-app-secondary-invert whitespace-pre-wrap">
                            {project.requirements.deploymentDescription}
                          </p>
                        </div>
                      )}

                      {/* Evidence */}
                      {project.requirements.deploymentEvidence && (
                        <div className="p-3 rounded-xl bg-app-quinary border border-zinc-800">
                          <p className="text-xs text-app-teritary-invert mb-1">Bukti/Evidence</p>
                          <p className="text-xs text-app-secondary-invert whitespace-pre-wrap">
                            {project.requirements.deploymentEvidence}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            );
          })()}

          {/* Stakeholder Documents Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
          >
            <Card className="border border-zinc-800 shadow-sm overflow-hidden">
              <CardBody className="p-5">
                <StakeholderUpload
                  projectId={project.id}
                  documents={stakeholderDocs as Parameters<typeof StakeholderUpload>[0]['documents']}
                  onDocumentsChange={(docs) => setStakeholderDocs(docs as StakeholderDocument[])}
                  readOnly={!canEdit}
                />
              </CardBody>
            </Card>
          </motion.div>

          {/* Project Screenshots Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.23 }}
          >
            <Card className="border border-zinc-800 shadow-sm overflow-hidden">
              <CardBody className="p-5">
                <ProjectScreenshotUpload
                  projectId={project.id}
                  readOnly={!canEdit}
                />
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
              <Card className="border border-zinc-800 shadow-sm">
                <CardBody className="p-5">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="bg-app-primary text-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
                      <MessageSquare size={18} />
                    </div>
                    <div>
                      <h2 className="font-semibold text-lg">Review & Feedback</h2>
                      <p className="text-xs text-app-secondary-invert tabular-nums">{project.reviews.length} review</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {project.reviews.map((review) => (
                      <div
                        key={review.id}
                        className="p-4 rounded-xl border border-zinc-800 bg-app-quinary"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Avatar
                              name={review.reviewer.name}
                              src={review.reviewer.image || undefined}
                              size="sm"
                              className="ring-2 ring-zinc-800"
                            />
                            <div>
                              <p className="font-medium text-sm">{review.reviewer.name}</p>
                              <p className="text-xs text-app-secondary-invert">
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
                          <div className="bg-background rounded-lg p-3 mb-3 border border-zinc-800">
                            <p className="text-sm text-app-secondary-invert">{review.overallComment}</p>
                          </div>
                        )}

                        {review.scores.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-app-secondary-invert">Skor per Kategori</p>
                            {review.scores.map((score) => (
                              <div key={score.id} className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span className="text-app-secondary-invert">{score.rubrik.name}</span>
                                  <span className="font-medium tabular-nums">
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
          {/* Presentation Schedule Card - Show when status is READY_FOR_PRESENTATION or PRESENTATION_SCHEDULED */}
          {(project.status === 'READY_FOR_PRESENTATION' || project.status === 'PRESENTATION_SCHEDULED') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Card className="border border-zinc-800 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-zinc-800 bg-app-quinary">
                  <div className="flex items-center gap-2">
                    <CalendarCheck size={18} className={project.presentationSchedule ? 'text-success' : 'text-warning'} />
                    <h3 className="font-semibold">Jadwal Presentasi</h3>
                  </div>
                </div>
                <CardBody className="p-4">
                  {project.presentationSchedule ? (
                    <div className="space-y-4">
                      {/* Scheduled Date & Time */}
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-app-quinary border border-zinc-800">
                        <div className="bg-app-primary text-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
                          <Calendar size={16} />
                        </div>
                        <div>
                          <p className="text-xs text-success font-medium">Tanggal & Waktu</p>
                          <p className="text-sm font-semibold">
                            {new Date(project.presentationSchedule.scheduledDate).toLocaleDateString('id-ID', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                          <p className="text-sm text-app-secondary-invert tabular-nums">
                            {project.presentationSchedule.startTime}
                            {project.presentationSchedule.endTime && ` - ${project.presentationSchedule.endTime}`}
                          </p>
                        </div>
                      </div>

                      {/* Location */}
                      {project.presentationSchedule.location && (
                        <div className="flex items-start gap-3 p-3 rounded-xl bg-app-quinary">
                          <div className="bg-app-primary text-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
                            <MapPin size={16} />
                          </div>
                          <div>
                            <p className="text-xs text-app-teritary-invert font-medium">Lokasi</p>
                            <p className="text-sm font-medium">{project.presentationSchedule.location}</p>
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {project.presentationSchedule.notes && (
                        <div className="p-3 rounded-xl bg-app-quinary border border-zinc-800">
                          <p className="text-xs text-app-primary-invert font-medium mb-1">Catatan</p>
                          <p className="text-sm text-app-secondary-invert">{project.presentationSchedule.notes}</p>
                        </div>
                      )}

                      {/* Status Badge */}
                      <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                        <span className="text-xs text-app-secondary-invert">Status</span>
                        <Chip
                          size="sm"
                          color={
                            project.presentationSchedule.presentationStatus === 'completed' ? 'success' :
                            project.presentationSchedule.presentationStatus === 'cancelled' ? 'danger' :
                            project.presentationSchedule.presentationStatus === 'rescheduled' ? 'warning' :
                            'primary'
                          }
                          variant="flat"
                        >
                          {project.presentationSchedule.presentationStatus === 'completed' ? 'Selesai' :
                           project.presentationSchedule.presentationStatus === 'cancelled' ? 'Dibatalkan' :
                           project.presentationSchedule.presentationStatus === 'rescheduled' ? 'Dijadwalkan Ulang' :
                           'Terjadwal'}
                        </Chip>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-app-primary flex items-center justify-center">
                        <Clock size={24} className="text-warning" />
                      </div>
                      <p className="text-sm font-medium text-warning">Menunggu Penjadwalan</p>
                      <p className="text-xs text-app-teritary-invert mt-1">
                        Project Anda sudah di-ACC oleh dosen.<br/>Admin akan segera menjadwalkan presentasi.
                      </p>
                    </div>
                  )}
                </CardBody>
              </Card>
            </motion.div>
          )}

          {/* Progress Timeline Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border border-zinc-800 shadow-sm overflow-hidden">
              <div className="p-4 bg-app-quinary border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <TrendingUp size={18} className="text-app-secondary-invert" />
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
                              ? 'bg-success text-success-foreground'
                              : status === 'current'
                                ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                                : status === 'rejected'
                                  ? 'bg-danger text-danger-foreground'
                                  : 'bg-app-primary text-app-teritary-invert'
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
                                ? 'bg-success'
                                : 'bg-zinc-800'
                                }`}
                            />
                          )}
                        </div>

                        {/* Label */}
                        <div className="pt-1">
                          <p
                            className={`text-sm font-medium ${status === 'completed'
                              ? 'text-success'
                              : status === 'current'
                                ? 'text-foreground'
                                : status === 'rejected'
                                  ? 'text-danger'
                                  : 'text-app-teritary-invert'
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
            <Card className="border border-zinc-800 shadow-sm overflow-hidden">
              <div className="p-4 bg-app-quinary border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Users size={18} className="text-app-secondary-invert" />
                  <h3 className="font-semibold">Dosen Penguji</h3>
                </div>
              </div>
              <CardBody className="p-4">
                {project.assignments.length === 0 ? (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-app-primary flex items-center justify-center">
                      <Users size={24} className="text-app-teritary-invert" />
                    </div>
                    <p className="text-sm text-app-secondary-invert">Belum ada dosen yang ditugaskan</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {project.assignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-app-quinary"
                      >
                        <Avatar
                          name={assignment.dosen.name}
                          src={assignment.dosen.image || undefined}
                          size="sm"
                          className="ring-2 ring-zinc-700"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{assignment.dosen.name}</p>
                          <p className="text-xs text-app-secondary-invert">@{assignment.dosen.username}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          </motion.div>

          {/* Tim Project Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38 }}
          >
            <Card className="border border-zinc-800 shadow-sm overflow-hidden">
              <div className="p-4 bg-app-quinary border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Users size={18} className="text-app-secondary-invert" />
                  <h3 className="font-semibold">Tim Project</h3>
                  <Chip size="sm" variant="flat" color="primary" className="tabular-nums">
                    {1 + (project.members?.filter(m => m.role !== 'leader').length || 0) + (project.invitations?.filter(i => i.status === 'pending').length || 0)} anggota
                  </Chip>
                </div>
              </div>
              <CardBody className="p-4">
                <div className="space-y-3">
                  {/* Owner/Ketua */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-app-quaternary border border-zinc-800">
                    <Avatar
                      name={project.mahasiswa.name}
                      src={project.mahasiswa.image || undefined}
                      size="sm"
                      className="ring-2 ring-zinc-700"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium truncate">{project.mahasiswa.name}</p>
                        <Crown size={14} className="text-warning flex-shrink-0" />
                      </div>
                      <p className="text-xs text-app-secondary-invert">{project.mahasiswa.nim || `@${project.mahasiswa.username}`}</p>
                    </div>
                    <Chip size="sm" color="primary" variant="flat">Ketua</Chip>
                  </div>

                  {/* Accepted Members */}
                  {project.members?.filter(m => m.role !== 'leader' && m.user).map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-app-quinary"
                    >
                      <Avatar
                        name={member.user!.name}
                        src={member.user!.image || undefined}
                        size="sm"
                        className="ring-2 ring-zinc-700"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{member.user!.name}</p>
                        <p className="text-xs text-app-secondary-invert">{member.user!.nim || `@${member.user!.username}`}</p>
                      </div>
                      <Chip size="sm" color="success" variant="flat">Anggota</Chip>
                    </div>
                  ))}

                  {/* Pending Invitations */}
                  {project.invitations?.filter(i => i.status === 'pending').map((invitation) => (
                    <div
                      key={invitation.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-app-quinary border border-zinc-800"
                    >
                      <Avatar
                        name={invitation.invitee.name}
                        src={invitation.invitee.image || undefined}
                        size="sm"
                        className="ring-2 ring-zinc-700 opacity-75"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate text-app-secondary-invert">{invitation.invitee.name}</p>
                        <p className="text-xs text-app-secondary-invert">{invitation.invitee.nim || `@${invitation.invitee.username}`}</p>
                      </div>
                      <Chip size="sm" color="warning" variant="flat">Menunggu</Chip>
                    </div>
                  ))}

                  {/* Empty state if only owner */}
                  {(!project.members || project.members.filter(m => m.role !== 'leader').length === 0) && 
                   (!project.invitations || project.invitations.filter(i => i.status === 'pending').length === 0) && (
                    <p className="text-xs text-center text-app-teritary-invert py-2">Belum ada anggota tim lainnya</p>
                  )}
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* Timeline Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border border-zinc-800 shadow-sm overflow-hidden">
              <div className="p-4 bg-app-quinary border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-app-secondary-invert" />
                  <h3 className="font-semibold">Timeline</h3>
                </div>
              </div>
              <CardBody className="p-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-app-teritary-invert" />
                    <div>
                      <p className="text-xs text-app-secondary-invert">Dibuat</p>
                      <p className="text-sm font-medium">{formatDateTime(project.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-success" />
                    <div>
                      <p className="text-xs text-app-secondary-invert">Terakhir Diperbarui</p>
                      <p className="text-sm font-medium">{formatDateTime(project.updatedAt)}</p>
                    </div>
                  </div>
                  {project.submittedAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 mt-2 rounded-full bg-primary" />
                      <div>
                        <p className="text-xs text-app-secondary-invert">Disubmit</p>
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
