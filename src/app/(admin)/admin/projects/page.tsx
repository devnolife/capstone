'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
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
  Trash2,
  Loader2,
  X,
} from 'lucide-react';
import { getInitials, getStatusColor, getStatusLabel, getSimakPhotoUrl } from '@/lib/utils';

const statusToneClass: Record<string, string> = {
  default: 'bg-muted text-muted-foreground',
  primary: 'bg-primary/10 text-primary',
  secondary: 'bg-secondary text-secondary-foreground',
  success:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  warning:
    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  danger: 'bg-destructive/10 text-destructive',
};

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
  onDeleteClick,
}: {
  project: Project;
  onStatusChange: (projectId: string, newStatus: string) => void;
  onApproveClick: (project: Project) => void;
  onDeleteClick: (project: Project) => void;
}) {
  const avatarUrl = getAvatarUrl(project.mahasiswa);

  return (
    <motion.div variants={itemVariants}>
      <div className="group relative p-5 rounded-2xl border bg-card mb-4 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30 transition-all duration-300">
        {/* Status Badge - Top Right */}
        <div className="absolute top-4 right-4">
          <Badge
            variant="secondary"
            className={`font-medium ${statusToneClass[getStatusColor(project.status)]}`}
          >
            {getStatusLabel(project.status)}
          </Badge>
        </div>

        {/* Main Content */}
        <div className="space-y-4">
          {/* Mahasiswa Info with Avatar */}
          <div className="flex items-center gap-3">
            <Avatar className="size-12 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt={project.mahasiswa.name} referrerPolicy="no-referrer" />
              ) : null}
              <AvatarFallback>{getInitials(project.mahasiswa.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">
                {project.mahasiswa.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {project.mahasiswa.nim || 'No NIM'}
              </p>
            </div>
          </div>

          {/* Project Title */}
          <div>
            <p className="font-bold text-lg text-foreground line-clamp-2 group-hover:text-primary transition-colors">
              {project.title}
            </p>
            {project.githubRepoUrl && (
              <a
                href={project.githubRepoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-2 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                <Github size={14} />
                <span>View Repository</span>
                <ExternalLink size={10} />
              </a>
            )}
          </div>

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} />
              <span>{project.semester}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FileText size={14} />
              <span>{project._count.documents} docs</span>
            </div>
            {project._count.assignments > 0 ? (
              <Badge variant="secondary" className={statusToneClass.success}>
                {project._count.assignments} Dosen
              </Badge>
            ) : (
              <Badge variant="secondary" className={statusToneClass.warning}>
                Belum Assign
              </Badge>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              render={<Link href={`/admin/projects/${project.id}`} />}
            >
              <Eye size={16} />
              Detail
            </Button>
            {project.status === 'SUBMITTED' && (
              <Button
                size="sm"
                className="flex-1"
                onClick={() => onStatusChange(project.id, 'IN_REVIEW')}
              >
                Mulai Review
              </Button>
            )}
            {project.status === 'IN_REVIEW' && (
              <>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => onApproveClick(project)}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => onStatusChange(project.id, 'REVISION_NEEDED')}
                >
                  Revisi
                </Button>
              </>
            )}
            {project._count.assignments === 0 && project.status !== 'SUBMITTED' && project.status !== 'IN_REVIEW' && (
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                render={<Link href="/admin/assignments" />}
              >
                <UserPlus size={16} />
                Assign
              </Button>
            )}
            <Button
              size="icon-sm"
              variant="destructive"
              aria-label="Hapus project"
              onClick={() => onDeleteClick(project)}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function AdminProjectsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><Spinner className="size-8" /></div>}>
      <AdminProjectsPageInner />
    </Suspense>
  );
}

function AdminProjectsPageInner() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || searchParams.get('search') || '';
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [semesterFilter, setSemesterFilter] = useState<string>('all');

  // Keep state in sync when URL ?q= changes (e.g. header search)
  useEffect(() => {
    setSearchQuery(searchParams.get('q') || searchParams.get('search') || '');
  }, [searchParams]);

  // Approval modal state
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [forkToOrg, setForkToOrg] = useState(true);
  const [isApproving, setIsApproving] = useState(false);
  const [approvalError, setApprovalError] = useState('');

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/projects/${projectToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchProjects();
        setDeleteModalOpen(false);
        setProjectToDelete(null);
      } else {
        const data = await response.json();
        console.error('Error deleting project:', data.error);
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    } finally {
      setIsDeleting(false);
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

    // Add delete option for all projects (admin can delete any project)
    items.push({
      key: 'delete',
      label: 'Hapus Project',
      icon: <Trash2 size={16} />,
      color: 'danger',
      onPress: () => {
        setProjectToDelete(project);
        setDeleteModalOpen(true);
      },
    });

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
        <Spinner className="size-8" />
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-5"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Semua Project</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Kelola seluruh project capstone mahasiswa
          </p>
        </div>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total', value: stats.total, icon: TrendingUp, cls: 'bg-muted text-foreground' },
          { label: 'Draft', value: stats.draft, icon: FileText, cls: 'bg-muted text-muted-foreground' },
          { label: 'Submit', value: stats.submitted, icon: Clock, cls: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300' },
          { label: 'Review', value: stats.inReview, icon: Eye, cls: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300' },
          { label: 'Approved', value: stats.approved, icon: CheckCircle2, cls: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="flex items-center gap-3 rounded-xl border bg-card p-3.5"
            >
              <div className={`p-2 rounded-lg ${s.cls}`}>
                <Icon size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-xl font-semibold text-foreground tabular-nums leading-tight">
                  {s.value}
                </p>
                <p className="text-xs text-muted-foreground leading-tight">{s.label}</p>
              </div>
            </div>
          );
        })}
      </section>

      {/* Filters */}
      <section className="flex flex-col gap-2 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari judul, nama mahasiswa, NIM, atau repo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchQuery && (
            <Button
              size="icon-xs"
              variant="ghost"
              aria-label="Bersihkan pencarian"
              className="absolute right-1.5 top-1/2 -translate-y-1/2"
              onClick={() => setSearchQuery('')}
            >
              <X size={14} />
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              if (typeof value === 'string') setStatusFilter(value);
            }}
          >
            <SelectTrigger aria-label="Status" className="flex-1 md:w-44">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="SUBMITTED">Submitted</SelectItem>
              <SelectItem value="IN_REVIEW">In Review</SelectItem>
              <SelectItem value="REVISION_NEEDED">Revisi</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={semesterFilter}
            onValueChange={(value) => {
              if (typeof value === 'string') setSemesterFilter(value);
            }}
          >
            <SelectTrigger aria-label="Semester" className="flex-1 md:w-44">
              <SelectValue placeholder="Semester" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Semester</SelectItem>
              {semesters.map((sem) => (
                <SelectItem key={sem} value={sem}>
                  {sem}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Projects List */}
      <motion.div variants={itemVariants}>
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="px-4 py-2.5 border-b flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Daftar Project</h2>
            <span className="text-xs text-muted-foreground tabular-nums">
              {filteredProjects.length} hasil
            </span>
          </div>
          <div className="p-4">
            {filteredProjects.length === 0 ? (
              <div className="text-center py-10">
                <div className="inline-flex p-3 rounded-full bg-muted mb-3">
                  <FolderGit2 size={32} className="text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
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
                        onDeleteClick={(proj) => {
                          setProjectToDelete(proj);
                          setDeleteModalOpen(true);
                        }}
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
                          <Avatar className="w-14 h-14 ring-2 ring-slate-200/60 dark:ring-zinc-700/50 group-hover:ring-primary/30 transition-all">
                            {avatarUrl ? (
                              <AvatarImage src={avatarUrl} alt={project.mahasiswa.name} referrerPolicy="no-referrer" />
                            ) : null}
                            <AvatarFallback>{getInitials(project.mahasiswa.name)}</AvatarFallback>
                          </Avatar>
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
                            <Badge
                              variant="secondary"
                              className={`font-medium ${statusToneClass[getStatusColor(project.status)]}`}
                            >
                              {getStatusLabel(project.status)}
                            </Badge>
                          </div>

                          {/* Penguji & Dokumen - 2 cols */}
                          <div className="col-span-2 flex items-center gap-2">
                            {project._count.assignments > 0 ? (
                              <Badge variant="secondary" className={`font-medium ${statusToneClass.success}`}>
                                {project._count.assignments} Dosen
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className={`font-medium ${statusToneClass.warning}`}>
                                Belum
                              </Badge>
                            )}
                            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                              <FileText size={12} />
                              <span className="text-xs font-medium">{project._count.documents}</span>
                            </div>
                          </div>

                          {/* Actions - 2 cols */}
                          <div className="col-span-2 flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              render={<Link href={`/admin/projects/${project.id}`} />}
                            >
                              <Eye size={14} />
                              Detail
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                render={
                                  <Button
                                    size="icon-sm"
                                    variant="ghost"
                                    aria-label="Project actions"
                                    className="text-muted-foreground hover:text-foreground"
                                  />
                                }
                              >
                                <MoreVertical size={16} />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {getDropdownItems(project).map((item) =>
                                  item.href ? (
                                    <DropdownMenuItem
                                      key={item.key}
                                      variant={item.color === 'danger' ? 'destructive' : 'default'}
                                      render={<a href={item.href} />}
                                    >
                                      {item.icon}
                                      {item.label}
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem
                                      key={item.key}
                                      variant={item.color === 'danger' ? 'destructive' : 'default'}
                                      onClick={item.onPress}
                                    >
                                      {item.icon}
                                      {item.label}
                                    </DropdownMenuItem>
                                  )
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
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
      <Dialog
        open={approvalModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setApprovalModalOpen(false);
            setSelectedProject(null);
            setApprovalError('');
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader className="flex flex-row items-center gap-3 pb-4 border-b">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <DialogTitle>Approve Project</DialogTitle>
              <DialogDescription>
                Setujui project dan atur integrasi GitHub
              </DialogDescription>
            </div>
          </DialogHeader>
          {selectedProject && (
            <div className="space-y-4">
              {/* Project Info */}
              <div className="p-4 bg-muted/40 rounded-xl border">
                <h4 className="font-semibold text-foreground mb-2">{selectedProject.title}</h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Avatar className="size-7">
                    <AvatarFallback className="text-[10px]">
                      {getInitials(selectedProject.mahasiswa.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span>{selectedProject.mahasiswa.name}</span>
                  <span className="text-muted-foreground">|</span>
                  <span>{selectedProject.semester}</span>
                </div>
              </div>

              {/* Fork Option */}
              {selectedProject.githubRepoUrl ? (
                <div className="p-4 border rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-violet-50 dark:bg-violet-900/30 rounded-lg text-violet-600 dark:text-violet-400">
                        <GitFork size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Fork ke Organisasi</p>
                        <p className="text-xs text-muted-foreground">
                          Repository akan di-fork ke org capstone
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={forkToOrg}
                      onCheckedChange={setForkToOrg}
                    />
                  </div>

                  {forkToOrg && (
                    <div className="mt-3 p-3 bg-violet-50/50 dark:bg-violet-900/20 border border-violet-200/50 dark:border-violet-800/30 rounded-lg space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 size={14} className="text-violet-600 dark:text-violet-400" />
                        <span className="font-medium text-violet-700 dark:text-violet-300">capstone-informatika</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Repository akan otomatis:
                      </p>
                      <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
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

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle size={16} />
                    <span className="text-sm">{approvalError}</span>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="border-t pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setApprovalModalOpen(false);
                setSelectedProject(null);
                setApprovalError('');
              }}
              disabled={isApproving}
            >
              Batal
            </Button>
            <Button onClick={handleApprovalSubmit} disabled={isApproving}>
              {isApproving ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={18} />}
              {forkToOrg && selectedProject?.githubRepoUrl
                ? 'Approve & Fork'
                : 'Approve'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={deleteModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteModalOpen(false);
            setProjectToDelete(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader className="flex flex-row items-center gap-3 pb-4 border-b">
            <div className="p-2 rounded-xl bg-destructive/10 text-destructive">
              <Trash2 size={20} />
            </div>
            <DialogTitle>Hapus Project</DialogTitle>
          </DialogHeader>
          {projectToDelete && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Apakah Anda yakin ingin menghapus project:
              </p>
              <div className="p-3 bg-muted/40 rounded-lg border">
                <p className="font-semibold text-foreground">{projectToDelete.title}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {projectToDelete.mahasiswa.name} - {projectToDelete.semester}
                </p>
              </div>
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                <p className="text-sm text-destructive font-medium">
                  Tindakan ini akan menghapus semua data terkait termasuk:
                </p>
                <ul className="text-xs text-destructive mt-2 space-y-1 ml-4 list-disc">
                  <li>Dokumen ({projectToDelete._count.documents} file)</li>
                  <li>Review ({projectToDelete._count.reviews} review)</li>
                  <li>Assignment dosen ({projectToDelete._count.assignments} assignment)</li>
                  <li>Anggota tim dan screenshot</li>
                </ul>
                <p className="text-xs text-destructive font-semibold mt-2">
                  Tindakan ini tidak dapat dibatalkan!
                </p>
              </div>
            </div>
          )}
          <DialogFooter className="border-t pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteModalOpen(false);
                setProjectToDelete(null);
              }}
              disabled={isDeleting}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteProject}
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="animate-spin" /> : <Trash2 size={18} />}
              Hapus Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
