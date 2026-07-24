'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Card,
  CardBody,
  Button,
  Chip,
  Avatar,
  Input,
  Select,
  SelectItem,
} from '@heroui/react';
import { motion } from 'framer-motion';
import {
  FolderGit2,
  Search,
  Filter,
  Calendar,
  Clock,
  Eye,
  PlayCircle,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  Github,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { getSimakPhotoUrl } from '@/lib/utils';
import { PageHeader } from '@/components/caret/PageHeader';

interface Project {
  id: string;
  title: string;
  description: string | null;
  status: string;
  semester: string;
  tahunAkademik: string;
  githubRepoUrl: string | null;
  submittedAt: string | null;
  mahasiswa: {
    id: string;
    name: string;
    username: string;
    image: string | null;
    profilePhoto: string | null;
  };
  _count: {
    documents: number;
    reviews: number;
  };
  hasMyReview: boolean;
  myReviewStatus: string | null;
}

interface DosenProjectsClientProps {
  projects: Project[];
}

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

const getStatusColor = (status: string) => {
  switch (status) {
    case 'APPROVED':
      return 'success';
    case 'IN_REVIEW':
      return 'warning';
    case 'REVISION_NEEDED':
      return 'warning';
    case 'SUBMITTED':
      return 'primary';
    case 'REJECTED':
      return 'danger';
    default:
      return 'default';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'APPROVED':
      return 'Disetujui';
    case 'IN_REVIEW':
      return 'Sedang Direview';
    case 'REVISION_NEEDED':
      return 'Perlu Revisi';
    case 'SUBMITTED':
      return 'Menunggu Review';
    case 'REJECTED':
      return 'Ditolak';
    case 'DRAFT':
      return 'Draft';
    default:
      return status;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'APPROVED':
      return CheckCircle2;
    case 'IN_REVIEW':
      return Clock;
    case 'REVISION_NEEDED':
      return AlertTriangle;
    case 'SUBMITTED':
      return FileText;
    case 'REJECTED':
      return XCircle;
    default:
      return FileText;
  }
};

export function DosenProjectsClient({ projects }: DosenProjectsClientProps) {
  return (
    <Suspense fallback={null}>
      <DosenProjectsClientInner projects={projects} />
    </Suspense>
  );
}

function DosenProjectsClientInner({ projects }: DosenProjectsClientProps) {
  const urlParams = useSearchParams();
  const initialQuery = urlParams.get('q') || urlParams.get('search') || '';
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [statusFilter, setStatusFilter] = useState('all');

  // Sync when URL query changes
  useEffect(() => {
    const q = urlParams.get('q') || urlParams.get('search') || '';
    setSearchQuery(q);
  }, [urlParams]);

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
    submitted: projects.filter((p) => p.status === 'SUBMITTED').length,
    inReview: projects.filter((p) => p.status === 'IN_REVIEW').length,
    approved: projects.filter((p) => p.status === 'APPROVED').length,
    revision: projects.filter((p) => p.status === 'REVISION_NEEDED').length,
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
        <PageHeader
          label="[01] PROJECT"
          labelRight="/ DITUGASKAN"
          title="Project Mahasiswa"
          description="Lihat dan review project capstone mahasiswa"
        />
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Card className="border border-border bg-card shadow-none">
            <CardBody className="p-4 text-center">
              <FolderGit2 size={20} className="mx-auto mb-2 text-app-secondary-invert" />
              <p className="text-2xl font-bold tabular-nums">{stats.total}</p>
              <p className="text-app-teritary-invert font-mono text-[10px] uppercase tracking-[0.18em]">Total</p>
            </CardBody>
          </Card>
          <Card className="border border-border bg-card shadow-none">
            <CardBody className="p-4 text-center">
              <FileText size={20} className="mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-primary tabular-nums">{stats.submitted}</p>
              <p className="text-app-teritary-invert font-mono text-[10px] uppercase tracking-[0.18em]">Menunggu</p>
            </CardBody>
          </Card>
          <Card className="border border-border bg-card shadow-none">
            <CardBody className="p-4 text-center">
              <Clock size={20} className="mx-auto mb-2 text-warning" />
              <p className="text-2xl font-bold text-warning tabular-nums">{stats.inReview}</p>
              <p className="text-app-teritary-invert font-mono text-[10px] uppercase tracking-[0.18em]">Direview</p>
            </CardBody>
          </Card>
          <Card className="border border-border bg-card shadow-none">
            <CardBody className="p-4 text-center">
              <AlertTriangle size={20} className="mx-auto mb-2 text-warning" />
              <p className="text-2xl font-bold text-warning tabular-nums">{stats.revision}</p>
              <p className="text-app-teritary-invert font-mono text-[10px] uppercase tracking-[0.18em]">Revisi</p>
            </CardBody>
          </Card>
          <Card className="border border-border bg-card shadow-none">
            <CardBody className="p-4 text-center">
              <CheckCircle2 size={20} className="mx-auto mb-2 text-success" />
              <p className="text-2xl font-bold text-success tabular-nums">{stats.approved}</p>
              <p className="text-app-teritary-invert font-mono text-[10px] uppercase tracking-[0.18em]">Disetujui</p>
            </CardBody>
          </Card>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <Card className="border border-border bg-card shadow-none">
          <CardBody className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="Cari project atau mahasiswa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                startContent={<Search size={16} className="text-app-teritary-invert" />}
                variant="bordered"
                classNames={{
                  inputWrapper: 'border-border',
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
                  trigger: 'border-border min-w-[180px]',
                }}
              >
                <SelectItem key="all">Semua Status</SelectItem>
                <SelectItem key="SUBMITTED">Menunggu Review</SelectItem>
                <SelectItem key="IN_REVIEW">Sedang Direview</SelectItem>
                <SelectItem key="REVISION_NEEDED">Perlu Revisi</SelectItem>
                <SelectItem key="APPROVED">Disetujui</SelectItem>
                <SelectItem key="REJECTED">Ditolak</SelectItem>
              </Select>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Project List */}
      <motion.div variants={itemVariants} className="space-y-3">
        {filteredProjects.length === 0 ? (
          <Card className="border border-border bg-card shadow-none">
            <CardBody className="p-8 text-center">
              <FolderGit2 size={48} className="mx-auto mb-4 text-app-teritary-invert" />
              <p className="font-semibold">Tidak ada project ditemukan</p>
              <p className="text-sm text-app-secondary-invert mt-1">
                {projects.length === 0
                  ? 'Belum ada project yang ditugaskan kepada Anda'
                  : 'Coba ubah filter atau kata kunci pencarian'}
              </p>
            </CardBody>
          </Card>
        ) : (
          filteredProjects.map((project) => {
            const StatusIcon = getStatusIcon(project.status);
            const avatarSrc = project.mahasiswa.profilePhoto || project.mahasiswa.image || getSimakPhotoUrl(project.mahasiswa.username);

            return (
              <motion.div key={project.id} variants={itemVariants}>
                <Card className="border border-border bg-card shadow-none hover:border-primary/50 transition-colors">
                  <CardBody className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Left - Project Info */}
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <Avatar
                          name={project.mahasiswa.name}
                          src={avatarSrc}
                          size="lg"
                          className="shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-semibold text-base truncate">
                              {project.title}
                            </h3>
                            <Chip
                              size="sm"
                              color={getStatusColor(project.status)}
                              variant="flat"
                              startContent={<StatusIcon size={12} />}
                            >
                              {getStatusLabel(project.status)}
                            </Chip>
                          </div>
                          {project.description && (
                            <p className="text-sm text-app-secondary-invert line-clamp-1 mb-2">
                              {project.description}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-3 text-xs text-app-teritary-invert">
                            <span className="flex items-center gap-1">
                              <Users size={12} />
                              {project.mahasiswa.name} ({project.mahasiswa.username})
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              {project.semester} {project.tahunAkademik}
                            </span>
                            <span className="flex items-center gap-1 tabular-nums">
                              <FileText size={12} />
                              {project._count.documents} dokumen
                            </span>
                            {project.githubRepoUrl && (
                              <a
                                href={project.githubRepoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 hover:text-primary transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Github size={12} />
                                Repository
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right - Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          as={Link}
                          href={`/dosen/projects/${project.id}`}
                          size="sm"
                          variant="flat"
                          startContent={<Eye size={14} />}
                        >
                          Detail
                        </Button>
                        {!project.hasMyReview && ['SUBMITTED', 'IN_REVIEW'].includes(project.status) && (
                          <Button
                            as={Link}
                            href={`/dosen/projects/${project.id}/review`}
                            size="sm"
                            color="primary"
                            startContent={<PlayCircle size={14} />}
                          >
                            Review
                          </Button>
                        )}
                        {project.hasMyReview && project.myReviewStatus === 'IN_PROGRESS' && (
                          <Button
                            as={Link}
                            href={`/dosen/projects/${project.id}/review`}
                            size="sm"
                            color="warning"
                            startContent={<PlayCircle size={14} />}
                          >
                            Lanjutkan
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            );
          })
        )}
      </motion.div>
    </motion.div>
  );
}
