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
  Accordion,
  AccordionItem,
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
  Download,
  Eye,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  ChevronUp,
  Code,
  Target,
  BookOpen,
  Cpu,
  BarChart3,
  CalendarDays,
  Building2,
  ShieldCheck,
  ListChecks,
} from 'lucide-react';
import { GitHubCodeViewer } from '@/components/github';
import { parseGitHubUrl } from '@/lib/github';
import {
  formatDateTime,
  getStatusColor,
  getStatusLabel,
  formatFileSize,
  getSimakPhotoUrl,
} from '@/lib/utils';

interface ProjectMember {
  id: string;
  githubUsername: string | null;
  githubAvatarUrl: string | null;
  name: string | null;
  role: string;
}

interface ProjectRequirements {
  id: string;
  completionPercent: number;
  judulProyek: string | null;
  targetPengguna: string | null;
  latarBelakangMasalah: string | null;
  tujuanProyek: string | null;
  manfaatProyek: string | null;
  integrasiMatakuliah: string | null;
  metodologi: string | null;
  penulisanLaporan: string | null;
  ruangLingkup: string | null;
  sumberDayaBatasan: string | null;
  teknologi: string | null;
  fiturUtama: string | null;
  analisisTemuan: string | null;
  presentasiUjian: string | null;
  stakeholder: string | null;
  kepatuhanEtika: string | null;
  timeline: string | null;
  kerangkaWaktu: string | null;
  deadlineDate: string | null;
}

interface StakeholderDocument {
  id: string;
  stakeholderName: string;
  stakeholderRole: string | null;
  organization: string | null;
  type: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  description: string | null;
  uploadedAt: string;
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
  createdAt: string;
  updatedAt: string;
  submittedAt: string | null;
  mahasiswa: {
    id: string;
    name: string;
    email: string | null;
    username: string;
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
  requirements: ProjectRequirements | null;
  stakeholderDocuments?: StakeholderDocument[];
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

function getAvatarUrl(mahasiswa: Project['mahasiswa']): string | undefined {
  if (mahasiswa.username) {
    return getSimakPhotoUrl(mahasiswa.username);
  }
  if (mahasiswa.githubUsername) {
    return `https://github.com/${mahasiswa.githubUsername}.png`;
  }
  return mahasiswa.image || undefined;
}

const REQUIREMENTS_SECTIONS = [
  {
    key: 'basic',
    title: 'Informasi Dasar',
    icon: Target,
    color: 'from-blue-500 to-indigo-500',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    fields: [
      { key: 'judulProyek', label: 'Judul Proyek' },
      { key: 'targetPengguna', label: 'Target Pengguna' },
      { key: 'latarBelakangMasalah', label: 'Latar Belakang Masalah' },
      { key: 'tujuanProyek', label: 'Tujuan Proyek' },
      { key: 'manfaatProyek', label: 'Manfaat Proyek' },
    ],
  },
  {
    key: 'academic',
    title: 'Aspek Akademik',
    icon: BookOpen,
    color: 'from-violet-500 to-purple-500',
    bgColor: 'bg-violet-50 dark:bg-violet-900/20',
    fields: [
      { key: 'integrasiMatakuliah', label: 'Integrasi Mata Kuliah' },
      { key: 'metodologi', label: 'Metodologi Pengembangan' },
      { key: 'penulisanLaporan', label: 'Rencana Penulisan Laporan' },
    ],
  },
  {
    key: 'technical',
    title: 'Teknis & Implementasi',
    icon: Cpu,
    color: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    fields: [
      { key: 'ruangLingkup', label: 'Ruang Lingkup' },
      { key: 'sumberDayaBatasan', label: 'Sumber Daya & Batasan' },
      { key: 'teknologi', label: 'Teknologi yang Digunakan' },
      { key: 'fiturUtama', label: 'Fitur Utama' },
    ],
  },
  {
    key: 'analysis',
    title: 'Analisis & Evaluasi',
    icon: BarChart3,
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    fields: [
      { key: 'analisisTemuan', label: 'Rencana Analisis & Temuan' },
      { key: 'presentasiUjian', label: 'Rencana Presentasi & Ujian' },
      { key: 'stakeholder', label: 'Keterlibatan Stakeholder' },
      { key: 'kepatuhanEtika', label: 'Kepatuhan Etika' },
    ],
  },
  {
    key: 'timeline',
    title: 'Timeline',
    icon: CalendarDays,
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-50 dark:bg-pink-900/20',
    fields: [
      { key: 'timeline', label: 'Deskripsi Timeline' },
      { key: 'kerangkaWaktu', label: 'Kerangka Waktu' },
      { key: 'deadlineDate', label: 'Deadline' },
    ],
  },
];

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
          <CardBody className="p-5 relative">
            <div className="flex items-center justify-between mb-4">
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

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm">
                  <FolderGit2 size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Chip size="sm" className="bg-white/20 text-white h-5 text-xs">
                      {getStatusLabel(project.status)}
                    </Chip>
                  </div>
                  <h1 className="text-xl md:text-2xl font-bold">{project.title}</h1>
                  <div className="flex flex-wrap items-center gap-3 text-white/80 text-xs mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {project.semester} {project.tahunAkademik}
                    </span>
                    {project.githubRepoUrl && (
                      <a
                        href={project.githubRepoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-white transition-colors"
                      >
                        <Github size={12} />
                        {project.githubRepoName?.split('/')[1] || 'Repository'}
                        <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {project.requirements && (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-white/70 text-xs">Kelengkapan</p>
                    <p className="text-2xl font-bold">{project.requirements.completionPercent}%</p>
                  </div>
                  <div className="relative w-14 h-14">
                    <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                      <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="5" />
                      <circle
                        cx="28"
                        cy="28"
                        r="22"
                        fill="none"
                        stroke="white"
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeDasharray={138}
                        strokeDashoffset={138 - (138 * project.requirements.completionPercent) / 100}
                        className="transition-all duration-1000"
                      />
                    </svg>
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
          {/* Mahasiswa & Deskripsi Card */}
          <motion.div variants={itemVariants}>
            <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <CardBody className="p-4 space-y-4">
                {/* Mahasiswa Info */}
                <div className="flex items-center gap-3">
                  <Avatar
                    name={project.mahasiswa.name}
                    src={avatarUrl}
                    className="w-12 h-12 ring-2 ring-violet-200 dark:ring-violet-800"
                    imgProps={{ referrerPolicy: "no-referrer" }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{project.mahasiswa.name}</p>
                    <p className="text-default-500 text-sm font-mono">{project.mahasiswa.username || '-'}</p>
                  </div>
                  {project.mahasiswa.githubUsername && (
                    <a
                      href={`https://github.com/${project.mahasiswa.githubUsername}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-sm"
                    >
                      <Github size={14} />
                      @{project.mahasiswa.githubUsername}
                    </a>
                  )}
                </div>

                {/* Team Members */}
                {project.members && project.members.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {project.members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm"
                      >
                        <Avatar
                          name={member.name || member.githubUsername || 'Member'}
                          src={member.githubAvatarUrl || (member.githubUsername ? `https://github.com/${member.githubUsername}.png` : undefined)}
                          className="w-5 h-5"
                        />
                        <span>{member.name || member.githubUsername}</span>
                        {member.role === 'leader' && (
                          <Chip size="sm" color="warning" variant="flat" className="h-4 text-xs">Ketua</Chip>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Description */}
                {project.description && (
                  <>
                    <Divider />
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <FileText size={14} className="text-blue-600 dark:text-blue-400" />
                        <h3 className="font-semibold text-sm">Deskripsi Project</h3>
                      </div>
                      <p className="text-default-600 text-sm leading-relaxed whitespace-pre-wrap">{project.description}</p>
                    </div>
                  </>
                )}
              </CardBody>
            </Card>
          </motion.div>

          {/* Requirements Card */}
          {project.requirements && (
            <motion.div variants={itemVariants}>
              <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="p-3 bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/30 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ListChecks size={16} className="text-indigo-600 dark:text-indigo-400" />
                      <h3 className="font-semibold text-sm">Persyaratan Proyek</h3>
                    </div>
                    <Chip size="sm" variant="flat" color={project.requirements.completionPercent >= 80 ? 'success' : project.requirements.completionPercent >= 50 ? 'warning' : 'default'} className="h-5 text-xs">
                      {project.requirements.completionPercent}% Lengkap
                    </Chip>
                  </div>
                </div>
                <CardBody className="p-3">
                  <Accordion variant="splitted" selectionMode="single" className="px-0 gap-2">
                    {REQUIREMENTS_SECTIONS.map((section) => {
                      const SectionIcon = section.icon;
                      const filledFields = section.fields.filter(
                        (field) => project.requirements?.[field.key as keyof ProjectRequirements]
                      );
                      const totalFields = section.fields.length;
                      const hasContent = filledFields.length > 0;

                      if (!hasContent) return null;

                      return (
                        <AccordionItem
                          key={section.key}
                          aria-label={section.title}
                          classNames={{
                            base: `border border-zinc-200 dark:border-zinc-700 rounded-lg ${section.bgColor}`,
                            title: 'font-medium text-sm',
                            trigger: 'px-3 py-2',
                            content: 'px-3 pb-3',
                          }}
                          title={
                            <div className="flex items-center gap-2">
                              <div className={`p-1.5 rounded-md bg-gradient-to-br ${section.color} text-white`}>
                                <SectionIcon size={14} />
                              </div>
                              <span className="flex-1 text-sm">{section.title}</span>
                              <Chip size="sm" variant="flat" color={filledFields.length === totalFields ? 'success' : 'default'} className="h-5 text-xs">
                                {filledFields.length}/{totalFields}
                              </Chip>
                            </div>
                          }
                        >
                          <div className="space-y-2">
                            {filledFields.map((field) => {
                              const value = project.requirements?.[field.key as keyof ProjectRequirements];
                              if (!value) return null;
                              const displayValue = field.key === 'deadlineDate' && typeof value === 'string'
                                ? formatDateTime(value)
                                : String(value);

                              return (
                                <div key={field.key} className="bg-white dark:bg-zinc-800 rounded-md p-2.5 border border-zinc-100 dark:border-zinc-700">
                                  <p className="text-xs font-medium text-default-500 uppercase tracking-wide mb-1">{field.label}</p>
                                  <p className="text-sm text-default-700 dark:text-default-300 whitespace-pre-wrap">{displayValue}</p>
                                </div>
                              );
                            })}
                          </div>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                </CardBody>
              </Card>
            </motion.div>
          )}

          {/* GitHub Repository Card */}
          {project.githubRepoUrl && githubInfo && (
            <motion.div variants={itemVariants}>
              <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <CardBody className="p-0">
                  <div className="flex items-center gap-3 p-3 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="p-2 rounded-lg bg-zinc-900 dark:bg-zinc-700 text-white">
                      <Github size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{project.githubRepoName || 'GitHub Repository'}</p>
                      <p className="text-xs text-default-500 truncate">{project.githubRepoUrl}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="flat"
                        color="primary"
                        startContent={showCodeViewer ? <ChevronUp size={14} /> : <Eye size={14} />}
                        onPress={() => setShowCodeViewer(!showCodeViewer)}
                        className="h-8"
                      >
                        {showCodeViewer ? 'Tutup' : 'Lihat Kode'}
                      </Button>
                      <Button
                        as={Link}
                        href={`/dosen/projects/${project.id}/code`}
                        size="sm"
                        variant="flat"
                        color="secondary"
                        startContent={<Code size={14} />}
                        className="h-8"
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
                        isIconOnly
                        className="h-8 w-8 min-w-8"
                      >
                        <ExternalLink size={14} />
                      </Button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {showCodeViewer && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="p-3 bg-zinc-50 dark:bg-zinc-900">
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
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Review Action Card */}
          <motion.div variants={itemVariants}>
            <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <CardBody className="p-4">
                {canReview ? (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 size={18} className="text-amber-600 dark:text-amber-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-sm text-amber-800 dark:text-amber-200">
                          {hasExistingReview ? 'Review Sudah Dimulai' : 'Siap untuk Review'}
                        </p>
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                          {hasExistingReview ? 'Lanjutkan review project ini.' : 'Project siap untuk direview.'}
                        </p>
                      </div>
                    </div>
                    <Button
                      as={Link}
                      href={`/dosen/projects/${project.id}/review`}
                      color="warning"
                      className="w-full font-semibold mt-3"
                      size="sm"
                      startContent={hasExistingReview ? <Eye size={14} /> : <PlayCircle size={14} />}
                    >
                      {hasExistingReview ? 'Lanjutkan Review' : 'Mulai Review'}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <AlertCircle size={20} className="mx-auto mb-1.5 text-zinc-400" />
                    <p className="text-sm text-default-500">
                      Status <strong>{getStatusLabel(project.status)}</strong> tidak dapat direview
                    </p>
                  </div>
                )}
              </CardBody>
            </Card>
          </motion.div>

          {/* Reviews Card */}
          {project.reviews.length > 0 && (
            <motion.div variants={itemVariants}>
              <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <MessageSquare size={16} className="text-blue-600 dark:text-blue-400" />
                    <h4 className="font-semibold text-sm">Review Sebelumnya</h4>
                  </div>
                </div>
                <CardBody className="p-3">
                  <div className="space-y-2">
                    {project.reviews.map((review) => (
                      <div key={review.id} className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-sm">{review.reviewer.name}</p>
                          <Chip size="sm" color={getStatusColor(review.status)} variant="flat" className="h-5 text-xs">
                            {getStatusLabel(review.status)}
                          </Chip>
                        </div>
                        {review.overallScore !== null && (
                          <div className="flex items-center gap-1 text-sm">
                            <Star size={12} className="text-amber-500" />
                            <span className="font-semibold">{review.overallScore}</span>
                          </div>
                        )}
                        {review.overallComment && (
                          <p className="text-xs text-default-500 mt-1 line-clamp-2">{review.overallComment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          )}

          {/* Stakeholder Documents Card - Moved to Sidebar */}
          {project.stakeholderDocuments && project.stakeholderDocuments.length > 0 && (
            <motion.div variants={itemVariants}>
              <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="p-3 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 size={16} className="text-teal-600 dark:text-teal-400" />
                      <h3 className="font-semibold text-sm">Dokumen Stakeholder</h3>
                    </div>
                    <Chip size="sm" variant="flat" color="primary" className="h-5 text-xs">{project.stakeholderDocuments.length}</Chip>
                  </div>
                </div>
                <CardBody className="p-3">
                  <div className="space-y-2">
                    {project.stakeholderDocuments.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className="p-1.5 rounded-md bg-teal-100 dark:bg-teal-900/30">
                            <ShieldCheck size={14} className="text-teal-600 dark:text-teal-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm truncate">{doc.stakeholderName}</p>
                            <p className="text-xs text-default-500 truncate">
                              {doc.stakeholderRole} • {formatFileSize(doc.fileSize)}
                            </p>
                          </div>
                        </div>
                        <Button as="a" href={doc.fileUrl} target="_blank" size="sm" variant="flat" color="primary" isIconOnly className="h-7 w-7 min-w-7">
                          <Download size={12} />
                        </Button>
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
              <div className="p-3 bg-gradient-to-r from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-zinc-600 dark:text-zinc-400" />
                  <h4 className="font-semibold text-sm">Timeline</h4>
                </div>
              </div>
              <CardBody className="p-3">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <div className="flex-1">
                      <p className="text-xs text-default-500">Dibuat</p>
                      <p className="text-sm font-medium">{formatDateTime(project.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <div className="flex-1">
                      <p className="text-xs text-default-500">Terakhir Diperbarui</p>
                      <p className="text-sm font-medium">{formatDateTime(project.updatedAt)}</p>
                    </div>
                  </div>
                  {project.submittedAt && (
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-violet-500" />
                      <div className="flex-1">
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
