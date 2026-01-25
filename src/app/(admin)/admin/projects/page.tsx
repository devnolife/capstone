'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Button,
  Chip,
  Avatar,
  Input,
  Select,
  SelectItem,
  Spinner,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Switch,
} from '@heroui/react';
import {
  Search,
  FolderGit2,
  ExternalLink,
  MoreVertical,
  UserPlus,
  Eye,
  FileText,
  Github,
  Calendar,
  GitFork,
  CheckCircle2,
  AlertCircle,
  Building2,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { formatDate, getStatusColor, getStatusLabel, getSimakPhotoUrl } from '@/lib/utils';

interface Project {
  id: string;
  title: string;
  description: string | null;
  status: string;
  githubRepoUrl: string | null;
  orgRepoUrl?: string | null;
  orgRepoName?: string | null;
  forkedAt?: string | null;
  semester: string;
  tahunAkademik: string;
  submittedAt: string | null;
  createdAt: string;
  mahasiswa: {
    id: string;
    name: string;
    email: string;
    nim: string | null;
    githubUsername?: string | null;
  };
  members?: Array<{
    id: string;
    githubUsername: string;
    name?: string | null;
  }>;
  _count: {
    documents: number;
    reviews: number;
    assignments: number;
  };
}

interface DropdownItemData {
  key: string;
  label: string;
  icon?: React.ReactNode;
  color?:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'danger';
  href?: string;
  onPress?: () => void;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

// Helper function to get avatar URL
function getAvatarUrl(mahasiswa: Project['mahasiswa']): string | undefined {
  // Priority: SIMAK photo > GitHub avatar > undefined (fallback to initials)
  if (mahasiswa.nim) {
    return getSimakPhotoUrl(mahasiswa.nim);
  }
  if (mahasiswa.githubUsername) {
    return `https://github.com/${mahasiswa.githubUsername}.png`;
  }
  return undefined;
}

// Modern Project Card Component
function MobileProjectCard({
  project,
  onStatusChange,
  onApproveClick,
}: {
  project: Project;
  onStatusChange: (projectId: string, newStatus: string) => void;
  onApproveClick: (project: Project) => void;
}) {
  const avatarUrl = getAvatarUrl(project.mahasiswa);
  
  return (
    <motion.div variants={itemVariants}>
      <div className="group relative p-5 rounded-2xl border border-default-200 dark:border-default-100 bg-white dark:bg-default-50 mb-4 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30 transition-all duration-300">
        {/* Status Badge - Top Right */}
        <div className="absolute top-4 right-4">
          <Chip
            size="sm"
            color={getStatusColor(project.status)}
            variant="flat"
            className="font-medium"
          >
            {getStatusLabel(project.status)}
          </Chip>
        </div>

        {/* Main Content */}
        <div className="space-y-4">
          {/* Mahasiswa Info with Avatar */}
          <div className="flex items-center gap-3">
            <Avatar 
              src={avatarUrl}
              name={project.mahasiswa.name} 
              size="lg" 
              className="ring-2 ring-primary/20 ring-offset-2 ring-offset-background"
              imgProps={{ referrerPolicy: "no-referrer" }}
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-default-900 truncate">
                {project.mahasiswa.name}
              </p>
              <p className="text-xs text-default-500">
                {project.mahasiswa.nim || 'No NIM'}
              </p>
            </div>
          </div>

          {/* Project Title */}
          <div>
            <p className="font-bold text-lg text-default-900 line-clamp-2 group-hover:text-primary transition-colors">
              {project.title}
            </p>
            {project.githubRepoUrl && (
              <a
                href={project.githubRepoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-2 text-xs text-default-500 hover:text-primary transition-colors"
              >
                <Github size={14} />
                <span>View Repository</span>
                <ExternalLink size={10} />
              </a>
            )}
          </div>

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-sm text-default-500">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} />
              <span>{project.semester}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FileText size={14} />
              <span>{project._count.documents} docs</span>
            </div>
            {project._count.assignments > 0 ? (
              <Chip size="sm" variant="flat" color="success" className="h-6">
                {project._count.assignments} Dosen
              </Chip>
            ) : (
              <Chip size="sm" variant="dot" color="warning" className="h-6">
                Belum Assign
              </Chip>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
                <Button
                      as={Link}
                      href={`/admin/projects/${project.id}`}
                      size="sm"
                      variant="flat"
                      className="flex-1"
                      startContent={<Eye size={16} />}
                    >
                      Detail
                    </Button>
            {project.status === 'SUBMITTED' && (
              <Button
                size="sm"
                color="primary"
                className="flex-1"
                onPress={() => onStatusChange(project.id, 'IN_REVIEW')}
              >
                Mulai Review
              </Button>
            )}
            {project.status === 'IN_REVIEW' && (
              <>
                <Button
                  size="sm"
                  color="success"
                  className="flex-1"
                  onPress={() => onApproveClick(project)}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  color="warning"
                  variant="flat"
                  className="flex-1"
                  onPress={() => onStatusChange(project.id, 'REVISION_NEEDED')}
                >
                  Revisi
                </Button>
              </>
            )}
            {project._count.assignments === 0 && project.status !== 'SUBMITTED' && project.status !== 'IN_REVIEW' && (
              <Button
                as={Link}
                href="/admin/assignments"
                size="sm"
                color="warning"
                variant="flat"
                className="flex-1"
                startContent={<UserPlus size={16} />}
              >
                Assign
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [semesterFilter, setSemesterFilter] = useState<string>('all');
  
  // Approval modal state
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [forkToOrg, setForkToOrg] = useState(true);
  const [isApproving, setIsApproving] = useState(false);
  const [approvalError, setApprovalError] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects?all=true');
      if (response.ok) {
        const data = await response.json();
        setProjects(Array.isArray(data) ? data : data.projects || []);
      } else {
        setProjects([]);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (projectId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        await fetchProjects();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleApproveClick = (project: Project) => {
    setSelectedProject(project);
    setForkToOrg(!!project.githubRepoUrl);
    setApprovalError('');
    setApprovalModalOpen(true);
  };

  const handleApprovalSubmit = async () => {
    if (!selectedProject) return;

    setIsApproving(true);
    setApprovalError('');

    try {
      if (forkToOrg && selectedProject.githubRepoUrl) {
        const forkResponse = await fetch('/api/github/fork-to-org', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId: selectedProject.id,
            addCollaborators: true,
          }),
        });

        const forkData = await forkResponse.json();

        if (!forkResponse.ok) {
          throw new Error(forkData.error || 'Gagal fork repository ke organisasi');
        }
      } else {
        const response = await fetch(`/api/projects/${selectedProject.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'APPROVED' }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Gagal menyetujui project');
        }
      }

      setApprovalModalOpen(false);
      setSelectedProject(null);
      await fetchProjects();
    } catch (error) {
      console.error('Error approving project:', error);
      setApprovalError(error instanceof Error ? error.message : 'Terjadi kesalahan');
    } finally {
      setIsApproving(false);
    }
  };

  const getDropdownItems = (project: Project): DropdownItemData[] => {
    const items: DropdownItemData[] = [
      {
        key: 'view',
        label: 'Lihat Detail',
        icon: <Eye size={16} />,
        href: `/admin/projects/${project.id}`,
      },
      {
        key: 'assign',
        label: 'Assign Dosen',
        icon: <UserPlus size={16} />,
        href: '/admin/assignments',
      },
    ];

    if (project.githubRepoUrl) {
      items.push({
        key: 'github',
        label: 'Buka GitHub',
        icon: <ExternalLink size={16} />,
        href: project.githubRepoUrl,
      });
    }

    if (project.status === 'SUBMITTED') {
      items.push({
        key: 'start-review',
        label: 'Mulai Review',
        color: 'primary',
        onPress: () => handleStatusChange(project.id, 'IN_REVIEW'),
      });
    }

    if (project.status === 'IN_REVIEW') {
      items.push(
        {
          key: 'approve',
          label: 'Approve',
          color: 'success',
          onPress: () => handleApproveClick(project),
        },
        {
          key: 'revision',
          label: 'Perlu Revisi',
          color: 'warning',
          onPress: () => handleStatusChange(project.id, 'REVISION_NEEDED'),
        },
        {
          key: 'reject',
          label: 'Reject',
          color: 'danger',
          onPress: () => handleStatusChange(project.id, 'REJECTED'),
        },
      );
    }

    return items;
  };

  const semesters = [...new Set(projects.map((p) => p.semester))];

  const filteredProjects = projects.filter((project) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      project.title.toLowerCase().includes(searchLower) ||
      project.mahasiswa.name.toLowerCase().includes(searchLower) ||
      project.mahasiswa.nim?.toLowerCase().includes(searchLower);

    const matchesStatus =
      statusFilter === 'all' || project.status === statusFilter;
    const matchesSemester =
      semesterFilter === 'all' || project.semester === semesterFilter;

    return matchesSearch && matchesStatus && matchesSemester;
  });

  const stats = {
    total: projects.length,
    draft: projects.filter((p) => p.status === 'DRAFT').length,
    submitted: projects.filter((p) => p.status === 'SUBMITTED').length,
    inReview: projects.filter((p) => p.status === 'IN_REVIEW').length,
    approved: projects.filter((p) => p.status === 'APPROVED').length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero Header - Soft Violet/Purple */}
      <motion.div variants={itemVariants}>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-950/40 dark:via-purple-950/30 dark:to-fuchsia-950/40 border border-violet-200/50 dark:border-violet-800/30 p-6 md:p-8">
          {/* Subtle Background Accent */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-violet-400/20 to-purple-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-fuchsia-400/15 to-violet-400/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
          
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25">
                <FolderGit2 className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">Semua Project</h1>
                <p className="text-violet-600/70 dark:text-violet-400/60 text-sm mt-1">Kelola semua project capstone mahasiswa</p>
              </div>
            </div>
            
            {/* Quick Stats - Refined Cards */}
            <div className="flex gap-3 md:gap-4">
              <div className="text-center px-4 py-2 rounded-xl bg-white/70 dark:bg-zinc-800/60 backdrop-blur-sm border border-violet-200/50 dark:border-violet-800/30">
                <p className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">{stats.total}</p>
                <p className="text-violet-600/60 dark:text-violet-400/60 text-xs">Total</p>
              </div>
              <div className="text-center px-4 py-2 rounded-xl bg-white/70 dark:bg-zinc-800/60 backdrop-blur-sm border border-violet-200/50 dark:border-violet-800/30">
                <p className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.submitted}</p>
                <p className="text-violet-600/60 dark:text-violet-400/60 text-xs">Submit</p>
              </div>
              <div className="text-center px-4 py-2 rounded-xl bg-white/70 dark:bg-zinc-800/60 backdrop-blur-sm border border-violet-200/50 dark:border-violet-800/30">
                <p className="text-2xl md:text-3xl font-bold text-emerald-600 dark:text-emerald-400">{stats.approved}</p>
                <p className="text-violet-600/60 dark:text-violet-400/60 text-xs">Approved</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid - Cleaner Design */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="relative overflow-hidden rounded-xl border border-slate-200/60 dark:border-zinc-700/50 bg-white dark:bg-zinc-900/50 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-zinc-800">
                <TrendingUp size={16} className="text-slate-600 dark:text-zinc-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.total}</p>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Total</p>
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-xl border border-slate-200/60 dark:border-zinc-700/50 bg-white dark:bg-zinc-900/50 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-zinc-800">
                <FileText size={16} className="text-slate-500 dark:text-zinc-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-500 dark:text-zinc-400">{stats.draft}</p>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Draft</p>
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-xl border border-slate-200/60 dark:border-zinc-700/50 bg-white dark:bg-zinc-900/50 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30">
                <Clock size={16} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.submitted}</p>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Submit</p>
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-xl border border-slate-200/60 dark:border-zinc-700/50 bg-white dark:bg-zinc-900/50 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/30">
                <Eye size={16} className="text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.inReview}</p>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Review</p>
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-xl border border-slate-200/60 dark:border-zinc-700/50 bg-white dark:bg-zinc-900/50 p-4 hover:shadow-md transition-shadow col-span-2 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/30">
                <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.approved}</p>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Approved</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters - Clean Design */}
      <motion.div variants={itemVariants}>
        <div className="rounded-xl border border-slate-200/60 dark:border-zinc-700/50 bg-white dark:bg-zinc-900/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800">
              <Search size={14} className="text-slate-600 dark:text-zinc-400" />
            </div>
            <h3 className="font-medium text-sm text-slate-700 dark:text-zinc-300">Filter & Pencarian</h3>
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:gap-4">
            <Input
              placeholder="Cari judul, nama, atau NIM..."
              startContent={<Search size={18} className="text-slate-400 dark:text-zinc-500" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
              size="sm"
              classNames={{
                inputWrapper: 'h-10 bg-slate-50 dark:bg-zinc-800 border-slate-200/60 dark:border-zinc-700/50 hover:bg-slate-100 dark:hover:bg-zinc-700/50',
              }}
            />
            <div className="flex gap-2">
              <Select
                placeholder="Status"
                selectedKeys={[statusFilter]}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 md:w-[150px]"
                size="sm"
              >
                <SelectItem key="all">Semua Status</SelectItem>
                <SelectItem key="DRAFT">Draft</SelectItem>
                <SelectItem key="SUBMITTED">Submitted</SelectItem>
                <SelectItem key="IN_REVIEW">In Review</SelectItem>
                <SelectItem key="REVISION_NEEDED">Revisi</SelectItem>
                <SelectItem key="APPROVED">Approved</SelectItem>
                <SelectItem key="REJECTED">Rejected</SelectItem>
              </Select>
              <Select
                placeholder="Semester"
                selectedKeys={[semesterFilter]}
                onChange={(e) => setSemesterFilter(e.target.value)}
                className="flex-1 md:w-[150px]"
                size="sm"
                items={[
                  { key: 'all', label: 'Semua' },
                  ...semesters.map((sem) => ({ key: sem, label: sem })),
                ]}
              >
                {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
              </Select>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Projects List - Clean Container */}
      <motion.div variants={itemVariants}>
        <div className="rounded-xl border border-slate-200/60 dark:border-zinc-700/50 bg-white dark:bg-zinc-900/50 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200/60 dark:border-zinc-700/50 bg-slate-50/50 dark:bg-zinc-800/30">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800">
                <FolderGit2 size={14} className="text-slate-600 dark:text-zinc-400" />
              </div>
              <h2 className="font-medium text-slate-700 dark:text-zinc-300">
                Daftar Project ({filteredProjects.length})
              </h2>
            </div>
          </div>
          <div className="p-4">
            {filteredProjects.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex p-4 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-4">
                  <FolderGit2 size={48} className="text-zinc-400" />
                </div>
                <p className="text-zinc-500">
                  Tidak ada project ditemukan
                </p>
              </div>
            ) : (
              <>
                {/* Mobile View - Cards */}
                <div className="md:hidden">
                  <motion.div variants={containerVariants}>
                    {filteredProjects.map((project) => (
                      <MobileProjectCard
                        key={project.id}
                        project={project}
                        onStatusChange={handleStatusChange}
                        onApproveClick={handleApproveClick}
                      />
                    ))}
                  </motion.div>
                </div>

                {/* Desktop View - Modern Card-style Table */}
                <div className="hidden md:block space-y-3">
                  {filteredProjects.map((project, index) => {
                    const avatarUrl = getAvatarUrl(project.mahasiswa);
                    return (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group relative flex items-center gap-4 p-4 rounded-xl border border-slate-200/60 dark:border-zinc-700/50 bg-white dark:bg-zinc-800/30 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30 transition-all duration-300"
                      >
                        {/* Avatar Section */}
                        <div className="flex-shrink-0">
                          <Avatar
                            src={avatarUrl}
                            name={project.mahasiswa.name}
                            size="lg"
                            className="w-14 h-14 ring-2 ring-slate-200/60 dark:ring-zinc-700/50 group-hover:ring-primary/30 transition-all"
                            imgProps={{ referrerPolicy: "no-referrer" }}
                          />
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 min-w-0 grid grid-cols-12 gap-4 items-center">
                          {/* Project & Student Info - 4 cols */}
                          <div className="col-span-4 space-y-1">
                            <Link 
                              href={`/admin/projects/${project.id}`}
                              className="font-semibold text-slate-800 dark:text-white hover:text-primary transition-colors line-clamp-1"
                            >
                              {project.title}
                            </Link>
                            <div className="flex items-center gap-2">
                              <p className="text-sm text-slate-600 dark:text-zinc-400 truncate">
                                {project.mahasiswa.name}
                              </p>
                              <span className="text-slate-300 dark:text-zinc-600">|</span>
                              <p className="text-xs text-slate-500 dark:text-zinc-500 font-mono">
                                {project.mahasiswa.nim || '-'}
                              </p>
                            </div>
                            {project.githubRepoUrl && (
                              <a
                                href={project.githubRepoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-primary transition-colors"
                              >
                                <Github size={12} />
                                <span className="truncate max-w-[180px]">Repository</span>
                                <ExternalLink size={10} />
                              </a>
                            )}
                          </div>

                          {/* Semester - 2 cols */}
                          <div className="col-span-2 flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800">
                              <Calendar size={12} className="text-slate-500 dark:text-zinc-400" />
                            </div>
                            <span className="text-sm text-slate-600 dark:text-zinc-400">{project.semester}</span>
                          </div>

                          {/* Status - 2 cols */}
                          <div className="col-span-2">
                            <Chip
                              size="sm"
                              color={getStatusColor(project.status)}
                              variant="flat"
                              className="font-medium"
                            >
                              {getStatusLabel(project.status)}
                            </Chip>
                          </div>

                          {/* Penguji & Dokumen - 2 cols */}
                          <div className="col-span-2 flex items-center gap-2">
                            {project._count.assignments > 0 ? (
                              <Chip size="sm" variant="flat" color="success" className="font-medium">
                                {project._count.assignments} Dosen
                              </Chip>
                            ) : (
                              <Chip size="sm" variant="dot" color="warning" className="font-medium">
                                Belum
                              </Chip>
                            )}
                            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                              <FileText size={12} />
                              <span className="text-xs font-medium">{project._count.documents}</span>
                            </div>
                          </div>

                          {/* Actions - 2 cols */}
                          <div className="col-span-2 flex items-center justify-end gap-2">
                            <Button
                              as={Link}
                              href={`/admin/projects/${project.id}`}
                              size="sm"
                              variant="flat"
                              className="bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700"
                              startContent={<Eye size={14} />}
                            >
                              Detail
                            </Button>
                            <Dropdown>
                              <DropdownTrigger>
                                <Button 
                                  isIconOnly 
                                  size="sm" 
                                  variant="light"
                                  className="text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                                >
                                  <MoreVertical size={16} />
                                </Button>
                              </DropdownTrigger>
                              <DropdownMenu<DropdownItemData>
                                aria-label="Project actions"
                                items={getDropdownItems(project)}
                              >
                                {(item: DropdownItemData) => (
                                  <DropdownItem
                                    key={item.key}
                                    startContent={item.icon}
                                    color={item.color}
                                    href={item.href}
                                    onPress={item.onPress}
                                  >
                                    {item.label}
                                  </DropdownItem>
                                )}
                              </DropdownMenu>
                            </Dropdown>
                          </div>
                        </div>

                        {/* Hover Accent */}
                        <div className="absolute inset-y-0 left-0 w-1 rounded-l-xl bg-gradient-to-b from-violet-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </motion.div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Approval Modal with Fork Option - Clean Design */}
      <Modal
        isOpen={approvalModalOpen}
        onClose={() => {
          setApprovalModalOpen(false);
          setSelectedProject(null);
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
                {selectedProject && (
                  <div className="space-y-4">
                    {/* Project Info */}
                    <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200/40 dark:border-zinc-700/30">
                      <h4 className="font-semibold text-slate-800 dark:text-white mb-2">{selectedProject.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-zinc-400">
                        <Avatar
                          name={selectedProject.mahasiswa.name}
                          size="sm"
                        />
                        <span>{selectedProject.mahasiswa.name}</span>
                        <span className="text-slate-300 dark:text-zinc-600">|</span>
                        <span>{selectedProject.semester}</span>
                      </div>
                    </div>

                    {/* Fork Option */}
                    {selectedProject.githubRepoUrl ? (
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
                                {selectedProject.mahasiswa.githubUsername 
                                  ? `Menambahkan @${selectedProject.mahasiswa.githubUsername} sebagai collaborator`
                                  : 'Menambahkan mahasiswa sebagai collaborator'}
                              </li>
                              {selectedProject.members && selectedProject.members.length > 0 && (
                                <li>
                                  Menambahkan {selectedProject.members.length} anggota tim sebagai collaborator
                                </li>
                              )}
                            </ul>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-500">
                          <Github size={12} />
                          <a
                            href={selectedProject.githubRepoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-primary hover:underline truncate"
                          >
                            {selectedProject.githubRepoUrl}
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
                )}
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
                  {forkToOrg && selectedProject?.githubRepoUrl
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
