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
  Divider,
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
} from 'lucide-react';
import { GitHubCodeViewer } from '@/components/github';
import { parseGitHubUrl } from '@/lib/github';
import {
  formatDateTime,
  getStatusColor,
  getStatusLabel,
  getDocumentTypeLabel,
  formatFileSize,
} from '@/lib/utils';

interface Project {
  id: string;
  title: string;
  description: string | null;
  status: string;
  githubRepoUrl: string | null;
  githubRepoName: string | null;
  semester: string;
  tahunAkademik: string;
  createdAt: string;
  updatedAt: string;
  submittedAt: string | null;
  mahasiswa: {
    id: string;
    name: string;
    email: string | null;
    username: string; // username is NIM for mahasiswa
    image: string | null;
    githubUsername: string | null;
  };
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
      return 'from-blue-600 via-indigo-600 to-violet-600';
  }
};

export default function DosenProjectDetailPage({
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

  useEffect(() => {
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

    fetchProject();
  }, [projectId]);

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
          href="/dosen/projects"
          variant="flat"
          className="mt-4"
          startContent={<ArrowLeft size={16} />}
        >
          Kembali ke Daftar Project
        </Button>
      </div>
    );
  }

  const hasExistingReview = project.reviews.length > 0;
  const canReview = ['SUBMITTED', 'IN_REVIEW', 'REVISION_NEEDED'].includes(project.status);
  const githubInfo = project.githubRepoUrl ? parseGitHubUrl(project.githubRepoUrl) : null;

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
                href="/dosen/projects"
                variant="flat"
                size="sm"
                className="bg-white/20 text-white hover:bg-white/30"
                startContent={<ArrowLeft size={16} />}
              >
                Kembali
              </Button>
              <div className="flex items-center gap-2">
                {canReview && (
                  <Button
                    as={Link}
                    href={`/dosen/projects/${project.id}/review`}
                    color="warning"
                    size="sm"
                    className="font-semibold"
                    startContent={hasExistingReview ? <Eye size={16} /> : <PlayCircle size={16} />}
                  >
                    {hasExistingReview ? 'Lanjutkan Review' : 'Mulai Review'}
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
                    src={project.mahasiswa.image || undefined}
                    size="lg"
                    className="ring-2 ring-violet-200 dark:ring-violet-800"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-lg">{project.mahasiswa.name}</p>
                    <p className="text-default-500 text-sm">{project.mahasiswa.username || '-'}</p>
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
                        as={Link}
                        href={`/dosen/projects/${project.id}/code`}
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
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Action Card */}
          <motion.div variants={itemVariants}>
            <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <ClipboardCheck size={18} className="text-amber-600 dark:text-amber-400" />
                  <h3 className="font-semibold">Aksi Review</h3>
                </div>
              </div>
              <CardBody className="p-4">
                {canReview ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 size={20} className="text-amber-600 dark:text-amber-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm text-amber-800 dark:text-amber-200">
                            {hasExistingReview ? 'Review Sudah Dimulai' : 'Siap untuk Review'}
                          </p>
                          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                            {hasExistingReview
                              ? 'Anda sudah memulai review untuk project ini. Klik tombol di bawah untuk melanjutkan.'
                              : 'Project ini siap untuk direview. Klik tombol di bawah untuk memulai proses review.'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button
                      as={Link}
                      href={`/dosen/projects/${project.id}/review`}
                      color="warning"
                      className="w-full font-semibold"
                      size="lg"
                      startContent={hasExistingReview ? <Eye size={18} /> : <PlayCircle size={18} />}
                    >
                      {hasExistingReview ? 'Lanjutkan Review' : 'Mulai Review'}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                      <AlertCircle size={24} className="text-zinc-400" />
                    </div>
                    <p className="text-sm text-default-500">
                      Project dengan status <strong>{getStatusLabel(project.status)}</strong> tidak dapat direview
                    </p>
                  </div>
                )}
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
                    <h3 className="font-semibold">Review Sebelumnya</h3>
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
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
