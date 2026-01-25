'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardBody,
  Button,
  Chip,
  Avatar,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Switch,
  addToast,
} from '@heroui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  FileText,
  Github,
  ExternalLink,
  MessageSquare,
  Calendar,
  Clock,
  FolderGit2,
  Users,
  Star,
  ClipboardCheck,
  Download,
  Eye,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  ChevronUp,
  Code,
  GitFork,
  Building2,
  X,
  UserPlus,
  XCircle,
  RotateCcw,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';
import { GitHubCodeViewer } from '@/components/github';
import { parseGitHubUrl } from '@/lib/github';
import {
  formatDateTime,
  getStatusColor,
  getStatusLabel,
  getDocumentTypeLabel,
  formatFileSize,
  getSimakPhotoUrl,
} from '@/lib/utils';

interface ProjectMember {
  id: string;
  githubUsername: string | null;
  name: string | null;
  role: string;
}

interface Project {
  id: string;
  title: string;
  description: string | null;
  status: string;
  githubRepoUrl: string | null;
  githubRepoName: string | null;
  orgRepoUrl?: string | null;
  orgRepoName?: string | null;
  forkedAt?: string | null;
  semester: string;
  tahunAkademik: string;
  createdAt: string;
  updatedAt: string;
  submittedAt: string | null;
  mahasiswa: {
    id: string;
    name: string;
    email: string | null;
    username: string;
    nim?: string | null;
    image: string | null;
    githubUsername: string | null;
  };
  members?: ProjectMember[];
  documents: Array<{
    id: string;
    type: string;
    fileName: string;
    filePath: string;
    fileSize: number;
    uploadedAt: string;
  }>;
  reviews: Array<{
    id: string;
    status: string;
    overallScore: number | null;
    overallComment: string | null;
    reviewer: {
      id: string;
      name: string;
    };
  }>;
  requirements: {
    completionPercent: number;
  } | null;
  _count?: {
    assignments: number;
  };
}

interface ProjectScreenshot {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  category: string | null;
  orderIndex: number;
  fileName: string;
  fileKey: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  isFeatured: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

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
      return 'from-violet-600 via-purple-600 to-fuchsia-600';
  }
};

function getAvatarUrl(mahasiswa: Project['mahasiswa']): string | undefined {
  if (mahasiswa.nim) {
    return getSimakPhotoUrl(mahasiswa.nim);
  }
  if (mahasiswa.username) {
    return getSimakPhotoUrl(mahasiswa.username);
  }
  if (mahasiswa.githubUsername) {
    return `https://github.com/${mahasiswa.githubUsername}.png`;
  }
  return undefined;
}

export default function AdminProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState('');
  const [showCodeViewer, setShowCodeViewer] = useState(false);

  // Approval modal state
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [forkToOrg, setForkToOrg] = useState(true);
  const [isApproving, setIsApproving] = useState(false);
  const [approvalError, setApprovalError] = useState('');

  // Status change loading
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  // Screenshots state
  const [screenshots, setScreenshots] = useState<ProjectScreenshot[]>([]);
  const [isLoadingScreenshots, setIsLoadingScreenshots] = useState(false);
  const [togglingFeatured, setTogglingFeatured] = useState<string | null>(null);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch project');
      }
      const data = await response.json();
      setProject(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading project');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchScreenshots = async () => {
    try {
      setIsLoadingScreenshots(true);
      const response = await fetch(`/api/projects/${projectId}/screenshots`);
      if (response.ok) {
        const data = await response.json();
        setScreenshots(data.screenshots || []);
      }
    } catch (err) {
      console.error('Error fetching screenshots:', err);
    } finally {
      setIsLoadingScreenshots(false);
    }
  };

  const handleToggleFeatured = async (screenshotId: string, currentValue: boolean) => {
    setTogglingFeatured(screenshotId);
    try {
      const response = await fetch(`/api/screenshots/${screenshotId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: !currentValue }),
      });

      if (response.ok) {
        const data = await response.json();
        setScreenshots(prev => 
          prev.map(s => s.id === screenshotId ? { ...s, isFeatured: data.screenshot.isFeatured } : s)
        );
        addToast({
          title: 'Berhasil',
          description: data.screenshot.isFeatured 
            ? 'Screenshot ditambahkan ke showcase landing page' 
            : 'Screenshot dihapus dari showcase',
          color: 'success',
        });
      } else {
        const data = await response.json();
        addToast({
          title: 'Gagal',
          description: data.error || 'Gagal mengubah status featured',
          color: 'danger',
        });
      }
    } catch (error) {
      console.error('Error toggling featured:', error);
      addToast({
        title: 'Error',
        description: 'Terjadi kesalahan',
        color: 'danger',
      });
    } finally {
      setTogglingFeatured(null);
    }
  };

  useEffect(() => {
    fetchProject();
    fetchScreenshots();
  }, [projectId]);

  const handleStatusChange = async (newStatus: string) => {
    if (!project) return;
    setIsChangingStatus(true);

    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        addToast({
          title: 'Berhasil',
          description: `Status project diubah menjadi ${getStatusLabel(newStatus)}`,
          color: 'success',
        });
        await fetchProject();
      } else {
        const data = await response.json();
        addToast({
          title: 'Gagal',
          description: data.error || 'Gagal mengubah status',
          color: 'danger',
        });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      addToast({
        title: 'Error',
        description: 'Terjadi kesalahan',
        color: 'danger',
      });
    } finally {
      setIsChangingStatus(false);
    }
  };

  const handleApproveClick = () => {
    if (!project) return;
    setForkToOrg(!!project.githubRepoUrl);
    setApprovalError('');
    setApprovalModalOpen(true);
  };

  const handleApprovalSubmit = async () => {
    if (!project) return;

    setIsApproving(true);
    setApprovalError('');

    try {
      if (forkToOrg && project.githubRepoUrl) {
        const forkResponse = await fetch('/api/github/fork-to-org', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId: project.id,
            addCollaborators: true,
          }),
        });

        const forkData = await forkResponse.json();

        if (!forkResponse.ok) {
          throw new Error(forkData.error || 'Gagal fork repository ke organisasi');
        }

        addToast({
          title: 'Berhasil',
          description: 'Project approved dan repository berhasil di-fork ke organisasi',
          color: 'success',
        });
      } else {
        const response = await fetch(`/api/projects/${project.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'APPROVED' }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Gagal menyetujui project');
        }

        addToast({
          title: 'Berhasil',
          description: 'Project berhasil disetujui',
          color: 'success',
        });
      }

      setApprovalModalOpen(false);
      await fetchProject();
    } catch (error) {
      console.error('Error approving project:', error);
      setApprovalError(error instanceof Error ? error.message : 'Terjadi kesalahan');
    } finally {
      setIsApproving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <AlertCircle size={32} className="text-red-500" />
        </div>
        <p className="text-danger text-lg font-medium">{error || 'Project tidak ditemukan'}</p>
        <Button
          as={Link}
          href="/admin/projects"
          variant="flat"
          className="mt-4"
          startContent={<ArrowLeft size={16} />}
        >
          Kembali ke Daftar Project
        </Button>
      </div>
    );
  }

  const canApprove = ['SUBMITTED', 'IN_REVIEW'].includes(project.status);
  const canReject = ['SUBMITTED', 'IN_REVIEW'].includes(project.status);
  const canStartReview = project.status === 'SUBMITTED';
  const canRequestRevision = project.status === 'IN_REVIEW';
  const githubInfo = project.githubRepoUrl ? parseGitHubUrl(project.githubRepoUrl) : null;
  const avatarUrl = getAvatarUrl(project.mahasiswa);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full space-y-6 pb-8"
    >
      {/* Hero Header Card */}
      <motion.div variants={itemVariants}>
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
                href="/admin/projects"
                variant="flat"
                size="sm"
                className="bg-white/20 text-white hover:bg-white/30"
                startContent={<ArrowLeft size={16} />}
              >
                Kembali
              </Button>
              <div className="flex items-center gap-2">
                {canStartReview && (
                  <Button
                    size="sm"
                    className="bg-white/20 text-white hover:bg-white/30 font-semibold"
                    startContent={<PlayCircle size={16} />}
                    onPress={() => handleStatusChange('IN_REVIEW')}
                    isLoading={isChangingStatus}
                  >
                    Mulai Review
                  </Button>
                )}
                {canApprove && (
                  <Button
                    color="success"
                    size="sm"
                    className="font-semibold"
                    startContent={<CheckCircle2 size={16} />}
                    onPress={handleApproveClick}
                  >
                    Approve
                  </Button>
                )}
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

              {/* Requirements Completion */}
              {project.requirements && (
                <div className="flex items-center gap-4">
                  <div className="text-right hidden md:block">
                    <p className="text-white/70 text-sm">Kelengkapan</p>
                    <p className="text-3xl font-bold">{project.requirements.completionPercent}%</p>
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
                        strokeDashoffset={201 - (201 * project.requirements.completionPercent) / 100}
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center md:hidden">
                      <span className="text-lg font-bold">{project.requirements.completionPercent}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Forked Repository Info */}
      {project.orgRepoUrl && (
        <motion.div variants={itemVariants}>
          <Card className="border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/20">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-800/50">
                    <GitFork size={20} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-emerald-800 dark:text-emerald-200">
                      Repository sudah di-fork ke Organisasi
                    </p>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400">
                      {project.orgRepoName}
                    </p>
                  </div>
                </div>
                <Button
                  as="a"
                  href={project.orgRepoUrl}
                  target="_blank"
                  size="sm"
                  color="success"
                  variant="flat"
                  startContent={<ExternalLink size={14} />}
                >
                  Buka Repo Org
                </Button>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mahasiswa Info Card */}
          <motion.div variants={itemVariants}>
            <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <Users size={18} className="text-violet-600 dark:text-violet-400" />
                  <h3 className="font-semibold">Informasi Mahasiswa</h3>
                </div>
              </div>
              <CardBody className="p-5">
                <div className="flex items-center gap-4">
                  <Avatar
                    name={project.mahasiswa.name}
                    src={avatarUrl}
                    size="lg"
                    className="ring-2 ring-violet-200 dark:ring-violet-800"
                    imgProps={{ referrerPolicy: "no-referrer" }}
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-lg">{project.mahasiswa.name}</p>
                    <p className="text-default-500 text-sm font-mono">
                      {project.mahasiswa.nim || project.mahasiswa.username || '-'}
                    </p>
                    <p className="text-default-400 text-xs">{project.mahasiswa.email}</p>
                  </div>
                  {project.mahasiswa.githubUsername && (
                    <a
                      href={`https://github.com/${project.mahasiswa.githubUsername}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                    >
                      <Github size={16} />
                      <span className="text-sm">@{project.mahasiswa.githubUsername}</span>
                    </a>
                  )}
                </div>

                {/* Team Members */}
                {project.members && project.members.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <p className="text-sm font-medium text-default-500 mb-3">Anggota Tim ({project.members.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {project.members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
                        >
                          <Avatar
                            name={member.name || member.githubUsername || 'Member'}
                            src={member.githubUsername ? `https://github.com/${member.githubUsername}.png` : undefined}
                            size="sm"
                            className="w-6 h-6"
                          />
                          <span className="text-sm">{member.name || member.githubUsername}</span>
                          {member.role === 'leader' && (
                            <Chip size="sm" color="warning" variant="flat" className="h-5">
                              Ketua
                            </Chip>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          </motion.div>

          {/* Description Card */}
          {project.description && (
            <motion.div variants={itemVariants}>
              <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <CardBody className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                      <FileText size={18} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="font-semibold text-lg">Deskripsi Project</h2>
                  </div>
                  <p className="text-default-600 leading-relaxed whitespace-pre-wrap">{project.description}</p>
                </CardBody>
              </Card>
            </motion.div>
          )}

          {/* GitHub Repository Card with Code Viewer */}
          {project.githubRepoUrl && githubInfo && (
            <motion.div variants={itemVariants}>
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

          {/* Documents Card */}
          <motion.div variants={itemVariants}>
            <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText size={18} className="text-emerald-600 dark:text-emerald-400" />
                    <h3 className="font-semibold">Dokumen Project</h3>
                  </div>
                  <Chip size="sm" variant="flat" color="success">
                    {project.documents.length} file
                  </Chip>
                </div>
              </div>
              <CardBody className="p-4">
                {project.documents.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                      <FileText size={24} className="text-zinc-400" />
                    </div>
                    <p className="text-sm text-default-500">Belum ada dokumen yang diupload</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {project.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                            <FileText size={16} className="text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{doc.fileName}</p>
                            <div className="flex items-center gap-2 text-xs text-default-500">
                              <span>{getDocumentTypeLabel(doc.type)}</span>
                              <span>-</span>
                              <span>{formatFileSize(doc.fileSize)}</span>
                              <span>-</span>
                              <span>{formatDateTime(doc.uploadedAt)}</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          as="a"
                          href={doc.filePath}
                          target="_blank"
                          size="sm"
                          variant="flat"
                          color="primary"
                          startContent={<Download size={14} />}
                        >
                          Unduh
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          </motion.div>

          {/* Screenshots Card with Featured Toggle */}
          <motion.div variants={itemVariants}>
            <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon size={18} className="text-purple-600 dark:text-purple-400" />
                    <h3 className="font-semibold">Screenshot Aplikasi</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Chip size="sm" variant="flat" color="secondary">
                      {screenshots.length} gambar
                    </Chip>
                    {screenshots.filter(s => s.isFeatured).length > 0 && (
                      <Chip size="sm" variant="flat" color="warning" startContent={<Sparkles size={12} />}>
                        {screenshots.filter(s => s.isFeatured).length} featured
                      </Chip>
                    )}
                  </div>
                </div>
              </div>
              <CardBody className="p-4">
                {isLoadingScreenshots ? (
                  <div className="text-center py-8">
                    <Spinner size="sm" />
                    <p className="text-sm text-default-500 mt-2">Memuat screenshot...</p>
                  </div>
                ) : screenshots.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                      <ImageIcon size={24} className="text-zinc-400" />
                    </div>
                    <p className="text-sm text-default-500">Belum ada screenshot</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {screenshots.map((screenshot) => (
                      <div
                        key={screenshot.id}
                        className={`relative group rounded-xl overflow-hidden border-2 transition-all ${
                          screenshot.isFeatured 
                            ? 'border-amber-400 dark:border-amber-500 shadow-lg shadow-amber-500/20' 
                            : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                        }`}
                      >
                        {/* Featured Badge */}
                        {screenshot.isFeatured && (
                          <div className="absolute top-2 left-2 z-10">
                            <Chip 
                              size="sm" 
                              color="warning" 
                              variant="solid"
                              startContent={<Sparkles size={10} />}
                              className="text-xs font-semibold"
                            >
                              Featured
                            </Chip>
                          </div>
                        )}
                        
                        {/* Image */}
                        <div className="aspect-video bg-zinc-100 dark:bg-zinc-800">
                          <img
                            src={screenshot.fileUrl}
                            alt={screenshot.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        {/* Info Overlay */}
                        <div className="p-3 bg-white dark:bg-zinc-900">
                          <p className="font-medium text-sm truncate">{screenshot.title}</p>
                          {screenshot.category && (
                            <p className="text-xs text-default-500">{screenshot.category}</p>
                          )}
                          
                          {/* Toggle Featured Button */}
                          <div className="mt-2 flex items-center justify-between">
                            <a
                              href={screenshot.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline flex items-center gap-1"
                            >
                              <Eye size={12} />
                              Lihat
                            </a>
                            <Button
                              size="sm"
                              variant={screenshot.isFeatured ? "solid" : "flat"}
                              color={screenshot.isFeatured ? "warning" : "default"}
                              onPress={() => handleToggleFeatured(screenshot.id, screenshot.isFeatured)}
                              isLoading={togglingFeatured === screenshot.id}
                              startContent={togglingFeatured !== screenshot.id && <Sparkles size={12} />}
                              className="text-xs h-7"
                            >
                              {screenshot.isFeatured ? 'Unfeatured' : 'Feature'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Info about featured screenshots */}
                {screenshots.length > 0 && (
                  <div className="mt-4 p-3 bg-amber-50/50 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-800/30 rounded-lg">
                    <p className="text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2">
                      <Sparkles size={14} />
                      <span>
                        Screenshot dengan status <strong>Featured</strong> akan ditampilkan di gallery landing page.
                        {project.status !== 'APPROVED' && (
                          <span className="text-amber-600 dark:text-amber-400">
                            {' '}(Hanya screenshot dari project APPROVED yang akan tampil)
                          </span>
                        )}
                      </span>
                    </p>
                  </div>
                )}
              </CardBody>
            </Card>
          </motion.div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Admin Action Card */}
          <motion.div variants={itemVariants}>
            <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <ClipboardCheck size={18} className="text-violet-600 dark:text-violet-400" />
                  <h3 className="font-semibold">Aksi Admin</h3>
                </div>
              </div>
              <CardBody className="p-4 space-y-3">
                {canStartReview && (
                  <Button
                    className="w-full"
                    color="primary"
                    variant="flat"
                    startContent={<PlayCircle size={18} />}
                    onPress={() => handleStatusChange('IN_REVIEW')}
                    isLoading={isChangingStatus}
                  >
                    Mulai Review
                  </Button>
                )}
                {canApprove && (
                  <Button
                    className="w-full"
                    color="success"
                    startContent={<CheckCircle2 size={18} />}
                    onPress={handleApproveClick}
                  >
                    Approve Project
                  </Button>
                )}
                {canRequestRevision && (
                  <Button
                    className="w-full"
                    color="warning"
                    variant="flat"
                    startContent={<RotateCcw size={18} />}
                    onPress={() => handleStatusChange('REVISION_NEEDED')}
                    isLoading={isChangingStatus}
                  >
                    Minta Revisi
                  </Button>
                )}
                {canReject && (
                  <Button
                    className="w-full"
                    color="danger"
                    variant="flat"
                    startContent={<XCircle size={18} />}
                    onPress={() => handleStatusChange('REJECTED')}
                    isLoading={isChangingStatus}
                  >
                    Reject Project
                  </Button>
                )}
                <Button
                  as={Link}
                  href="/admin/assignments"
                  className="w-full"
                  variant="bordered"
                  startContent={<UserPlus size={18} />}
                >
                  Kelola Penugasan Dosen
                </Button>

                {/* Status Info */}
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <p className="text-xs text-default-400 mb-2">Status saat ini:</p>
                  <Chip color={getStatusColor(project.status)} variant="flat" size="lg" className="w-full justify-center">
                    {getStatusLabel(project.status)}
                  </Chip>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* Existing Reviews Card */}
          {project.reviews.length > 0 && (
            <motion.div variants={itemVariants}>
              <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <MessageSquare size={18} className="text-blue-600 dark:text-blue-400" />
                    <h3 className="font-semibold">Review ({project.reviews.length})</h3>
                  </div>
                </div>
                <CardBody className="p-4">
                  <div className="space-y-3">
                    {project.reviews.map((review) => (
                      <div
                        key={review.id}
                        className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-sm">{review.reviewer.name}</p>
                          <Chip size="sm" color={getStatusColor(review.status)} variant="flat">
                            {getStatusLabel(review.status)}
                          </Chip>
                        </div>
                        {review.overallScore !== null && (
                          <div className="flex items-center gap-2">
                            <Star size={14} className="text-amber-500" />
                            <span className="text-sm font-semibold">{review.overallScore}</span>
                          </div>
                        )}
                        {review.overallComment && (
                          <p className="text-xs text-default-500 mt-2 line-clamp-2">
                            {review.overallComment}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          )}

          {/* Timeline Card */}
          <motion.div variants={itemVariants}>
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
                  {project.forkedAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 mt-2 rounded-full bg-emerald-500" />
                      <div>
                        <p className="text-xs text-default-500">Di-fork ke Org</p>
                        <p className="text-sm font-medium">{formatDateTime(project.forkedAt)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Approval Modal with Fork Option */}
      <Modal
        isOpen={approvalModalOpen}
        onClose={() => {
          setApprovalModalOpen(false);
          setApprovalError('');
        }}
        size="lg"
        classNames={{
          backdrop: 'bg-black/50 backdrop-blur-sm',
          base: 'border border-slate-200/60 dark:border-zinc-700/50',
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex items-center gap-3 border-b border-slate-200/60 dark:border-zinc-700/50">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <span className="block font-semibold text-slate-800 dark:text-white">Approve Project</span>
                  <span className="text-sm font-normal text-slate-500 dark:text-zinc-400">
                    Setujui project dan atur integrasi GitHub
                  </span>
                </div>
              </ModalHeader>
              <ModalBody className="py-5">
                <div className="space-y-4">
                  {/* Project Info */}
                  <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200/40 dark:border-zinc-700/30">
                    <h4 className="font-semibold text-slate-800 dark:text-white mb-2">{project.title}</h4>
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-zinc-400">
                      <Avatar
                        name={project.mahasiswa.name}
                        src={avatarUrl}
                        size="sm"
                        imgProps={{ referrerPolicy: "no-referrer" }}
                      />
                      <span>{project.mahasiswa.name}</span>
                      <span className="text-slate-300 dark:text-zinc-600">|</span>
                      <span>{project.semester}</span>
                    </div>
                  </div>

                  {/* Fork Option */}
                  {project.githubRepoUrl ? (
                    <div className="p-4 border border-slate-200/60 dark:border-zinc-700/50 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-violet-50 dark:bg-violet-900/30 rounded-lg text-violet-600 dark:text-violet-400">
                            <GitFork size={20} />
                          </div>
                          <div>
                            <p className="font-medium text-slate-800 dark:text-white">Fork ke Organisasi</p>
                            <p className="text-xs text-slate-500 dark:text-zinc-400">
                              Repository akan di-fork ke org capstone
                            </p>
                          </div>
                        </div>
                        <Switch
                          isSelected={forkToOrg}
                          onValueChange={setForkToOrg}
                        />
                      </div>

                      {forkToOrg && (
                        <div className="mt-3 p-3 bg-violet-50/50 dark:bg-violet-900/20 border border-violet-200/50 dark:border-violet-800/30 rounded-lg space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Building2 size={14} className="text-violet-600 dark:text-violet-400" />
                            <span className="font-medium text-violet-700 dark:text-violet-300">capstone-informatika</span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-zinc-400">
                            Repository akan otomatis:
                          </p>
                          <ul className="text-xs text-slate-500 dark:text-zinc-500 space-y-1 ml-4 list-disc">
                            <li>Di-fork ke organisasi dengan nama baru</li>
                            <li>
                              {project.mahasiswa.githubUsername
                                ? `Menambahkan @${project.mahasiswa.githubUsername} sebagai collaborator`
                                : 'Menambahkan mahasiswa sebagai collaborator'}
                            </li>
                            {project.members && project.members.length > 0 && (
                              <li>
                                Menambahkan {project.members.length} anggota tim sebagai collaborator
                              </li>
                            )}
                          </ul>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-500">
                        <Github size={12} />
                        <a
                          href={project.githubRepoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary hover:underline truncate"
                        >
                          {project.githubRepoUrl}
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-amber-50/50 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-800/30 rounded-xl">
                      <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                        <AlertCircle size={18} />
                        <span className="font-medium">Tidak ada repository GitHub</span>
                      </div>
                      <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                        Project akan disetujui tanpa fork ke organisasi
                      </p>
                    </div>
                  )}

                  {/* Error Message */}
                  {approvalError && (
                    <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg">
                      <div className="flex items-center gap-2 text-danger">
                        <AlertCircle size={16} />
                        <span className="text-sm">{approvalError}</span>
                      </div>
                    </div>
                  )}
                </div>
              </ModalBody>
              <ModalFooter className="border-t border-slate-200/60 dark:border-zinc-700/50">
                <Button variant="flat" onPress={onClose} isDisabled={isApproving}>
                  Batal
                </Button>
                <Button
                  color="success"
                  onPress={handleApprovalSubmit}
                  isLoading={isApproving}
                  startContent={!isApproving && <CheckCircle2 size={18} />}
                >
                  {forkToOrg && project.githubRepoUrl
                    ? 'Approve & Fork'
                    : 'Approve'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </motion.div>
  );
}
