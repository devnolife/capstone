'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Button,
  Chip,
  Avatar,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
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
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';

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

// Mobile Project Card Component
function MobileProjectCard({
  project,
  onStatusChange,
  onApproveClick,
}: {
  project: Project;
  onStatusChange: (projectId: string, newStatus: string) => void;
  onApproveClick: (project: Project) => void;
}) {
  return (
    <motion.div variants={itemVariants}>
      <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 mb-3">
        <div className="space-y-3">
          {/* Project Title */}
          <div className="flex items-start gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 text-white shrink-0">
              <FolderGit2 size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm line-clamp-2">
                {project.title}
              </p>
              {project.githubRepoUrl && (
                <a
                  href={project.githubRepoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary flex items-center gap-1 mt-1"
                >
                  <Github size={10} />
                  <span>GitHub</span>
                  <ExternalLink size={8} />
                </a>
              )}
            </div>
          </div>

          {/* Mahasiswa Info */}
          <div className="flex items-center gap-2">
            <Avatar name={project.mahasiswa.name} size="sm" className="w-6 h-6" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">
                {project.mahasiswa.name}
              </p>
              <p className="text-[10px] text-zinc-500">
                {project.mahasiswa.nim || '-'}
              </p>
            </div>
          </div>

          {/* Status & Info */}
          <div className="flex flex-wrap gap-2">
            <Chip
              size="sm"
              color={getStatusColor(project.status)}
              variant="flat"
              className="h-5 text-[10px]"
            >
              {getStatusLabel(project.status)}
            </Chip>
            {project._count.assignments > 0 ? (
              <Chip size="sm" variant="flat" color="success" className="h-5 text-[10px]">
                {project._count.assignments} Dosen
              </Chip>
            ) : (
              <Chip size="sm" variant="flat" color="warning" className="h-5 text-[10px]">
                Belum Assign
              </Chip>
            )}
          </div>

          {/* Info Row */}
          <div className="flex items-center gap-3 text-xs text-zinc-500">
            <div className="flex items-center gap-1">
              <Calendar size={10} />
              <span>{project.semester}</span>
            </div>
            <div className="flex items-center gap-1">
              <FileText size={10} />
              <span>{project._count.documents} dok</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              as={Link}
              href={`/mahasiswa/projects/${project.id}`}
              size="sm"
              variant="flat"
              className="flex-1 h-8"
              startContent={<Eye size={14} />}
            >
              Detail
            </Button>
            {project._count.assignments === 0 && (
              <Button
                as={Link}
                href="/admin/assignments"
                size="sm"
                variant="flat"
                color="warning"
                className="flex-1 h-8"
                startContent={<UserPlus size={14} />}
              >
                Assign
              </Button>
            )}
          </div>

          {/* Status Change Actions */}
          {project.status === 'SUBMITTED' && (
            <Button
              size="sm"
              color="primary"
              variant="flat"
              className="w-full h-8"
              onPress={() => onStatusChange(project.id, 'IN_REVIEW')}
            >
              Mulai Review
            </Button>
          )}
          {project.status === 'IN_REVIEW' && (
            <div className="flex gap-2">
              <Button
                size="sm"
                color="success"
                variant="flat"
                className="flex-1 h-8"
                onPress={() => onApproveClick(project)}
              >
                Approve
              </Button>
              <Button
                size="sm"
                color="warning"
                variant="flat"
                className="flex-1 h-8"
                onPress={() => onStatusChange(project.id, 'REVISION_NEEDED')}
              >
                Revisi
              </Button>
            </div>
          )}
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
        href: `/mahasiswa/projects/${project.id}`,
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
      {/* Hero Header */}
      <motion.div variants={itemVariants}>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 p-6 md:p-8 text-white">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="projects-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#projects-grid)" />
            </svg>
          </div>
          
          <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/10 blur-xl" />
          
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                <FolderGit2 className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Semua Project</h1>
                <p className="text-white/70 text-sm mt-1">Kelola semua project capstone mahasiswa</p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="flex gap-4 md:gap-6">
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold">{stats.total}</p>
                <p className="text-white/70 text-xs">Total</p>
              </div>
              <div className="w-px bg-white/20" />
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold">{stats.submitted}</p>
                <p className="text-white/70 text-xs">Submit</p>
              </div>
              <div className="w-px bg-white/20" />
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold">{stats.approved}</p>
                <p className="text-white/70 text-xs">Approved</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-3 shadow-sm">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-zinc-400 to-zinc-500" />
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-zinc-500">Total</p>
          </div>
          <div className="relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-3 shadow-sm">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-zinc-300 to-zinc-400" />
            <p className="text-2xl font-bold text-zinc-500">{stats.draft}</p>
            <p className="text-xs text-zinc-500">Draft</p>
          </div>
          <div className="relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-3 shadow-sm">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
            <p className="text-2xl font-bold text-blue-600">{stats.submitted}</p>
            <p className="text-xs text-zinc-500">Submit</p>
          </div>
          <div className="relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-3 shadow-sm">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
            <p className="text-2xl font-bold text-amber-600">{stats.inReview}</p>
            <p className="text-xs text-zinc-500">Review</p>
          </div>
          <div className="relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-3 shadow-sm col-span-2 md:col-span-1">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-green-500" />
            <p className="text-2xl font-bold text-emerald-600">{stats.approved}</p>
            <p className="text-xs text-zinc-500">Approved</p>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 text-white">
              <Search size={14} />
            </div>
            <h3 className="font-semibold text-sm">Filter & Pencarian</h3>
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:gap-4">
            <Input
              placeholder="Cari judul, nama, atau NIM..."
              startContent={<Search size={18} className="text-zinc-400" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
              size="sm"
              classNames={{
                inputWrapper: 'h-10 border-zinc-200 dark:border-zinc-700',
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

      {/* Projects List */}
      <motion.div variants={itemVariants}>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 text-white">
                <FolderGit2 size={14} />
              </div>
              <h2 className="font-semibold">
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

                {/* Desktop View - Table */}
                <div className="hidden md:block">
                  <Table aria-label="Projects table" removeWrapper>
                    <TableHeader>
                      <TableColumn>PROJECT</TableColumn>
                      <TableColumn>MAHASISWA</TableColumn>
                      <TableColumn>SEMESTER</TableColumn>
                      <TableColumn>STATUS</TableColumn>
                      <TableColumn>PENGUJI</TableColumn>
                      <TableColumn>DOKUMEN</TableColumn>
                      <TableColumn>AKSI</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {filteredProjects.map((project) => (
                        <TableRow key={project.id}>
                          <TableCell>
                            <div className="max-w-[250px]">
                              <p className="font-medium truncate">
                                {project.title}
                              </p>
                              {project.githubRepoUrl && (
                                <a
                                  href={project.githubRepoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary flex items-center gap-1"
                                >
                                  <Github size={12} />
                                  GitHub
                                </a>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar
                                name={project.mahasiswa.name}
                                size="sm"
                              />
                              <div>
                                <p className="font-medium text-sm">
                                  {project.mahasiswa.name}
                                </p>
                                <p className="text-xs text-zinc-500">
                                  {project.mahasiswa.nim || '-'}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Chip size="sm" variant="flat">
                              {project.semester}
                            </Chip>
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="sm"
                              color={getStatusColor(project.status)}
                              variant="flat"
                            >
                              {getStatusLabel(project.status)}
                            </Chip>
                          </TableCell>
                          <TableCell>
                            {project._count.assignments > 0 ? (
                              <Chip size="sm" variant="flat" color="success">
                                {project._count.assignments} Dosen
                              </Chip>
                            ) : (
                              <Link href="/admin/assignments">
                                <Button
                                  size="sm"
                                  variant="flat"
                                  color="warning"
                                  startContent={<UserPlus size={14} />}
                                >
                                  Assign
                                </Button>
                              </Link>
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip size="sm" variant="flat">
                              <FileText size={12} className="mr-1" />
                              {project._count.documents}
                            </Chip>
                          </TableCell>
                          <TableCell>
                            <Dropdown>
                              <DropdownTrigger>
                                <Button isIconOnly size="sm" variant="light">
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
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Approval Modal with Fork Option */}
      <Modal
        isOpen={approvalModalOpen}
        onClose={() => {
          setApprovalModalOpen(false);
          setSelectedProject(null);
          setApprovalError('');
        }}
        size="lg"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 text-white">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <span className="block">Approve Project</span>
                  <span className="text-sm font-normal text-zinc-500">
                    Setujui project dan atur integrasi GitHub
                  </span>
                </div>
              </ModalHeader>
              <ModalBody>
                {selectedProject && (
                  <div className="space-y-4">
                    {/* Project Info */}
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                      <h4 className="font-semibold mb-2">{selectedProject.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-zinc-500">
                        <Avatar
                          name={selectedProject.mahasiswa.name}
                          size="sm"
                        />
                        <span>{selectedProject.mahasiswa.name}</span>
                        <span>•</span>
                        <span>{selectedProject.semester}</span>
                      </div>
                    </div>

                    {/* Fork Option */}
                    {selectedProject.githubRepoUrl ? (
                      <div className="p-4 border border-zinc-200 dark:border-zinc-700 rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg text-white">
                              <GitFork size={20} />
                            </div>
                            <div>
                              <p className="font-medium">Fork ke Organisasi</p>
                              <p className="text-xs text-zinc-500">
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
                          <div className="mt-3 p-3 bg-violet-50 dark:bg-violet-900/20 rounded-lg space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Building2 size={14} className="text-violet-600" />
                              <span className="font-medium">capstone-informatika</span>
                            </div>
                            <p className="text-xs text-zinc-600 dark:text-zinc-400">
                              Repository akan otomatis:
                            </p>
                            <ul className="text-xs text-zinc-500 space-y-1 ml-4 list-disc">
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

                        <div className="flex items-center gap-2 text-xs text-zinc-500">
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
                      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
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
              <ModalFooter>
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
