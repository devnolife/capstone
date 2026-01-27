'use client';

import { useState } from 'react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
            <FolderGit2 size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold">Project Mahasiswa</h1>
            <p className="text-sm text-default-500">
              Lihat dan review project capstone mahasiswa
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Card className="border border-zinc-200 dark:border-zinc-800">
            <CardBody className="p-4 text-center">
              <FolderGit2 size={20} className="mx-auto mb-2 text-violet-500" />
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-default-500">Total</p>
            </CardBody>
          </Card>
          <Card className="border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-500/10">
            <CardBody className="p-4 text-center">
              <FileText size={20} className="mx-auto mb-2 text-blue-500" />
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.submitted}</p>
              <p className="text-xs text-blue-600/70 dark:text-blue-400/70">Menunggu</p>
            </CardBody>
          </Card>
          <Card className="border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-500/10">
            <CardBody className="p-4 text-center">
              <Clock size={20} className="mx-auto mb-2 text-amber-500" />
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.inReview}</p>
              <p className="text-xs text-amber-600/70 dark:text-amber-400/70">Direview</p>
            </CardBody>
          </Card>
          <Card className="border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-500/10">
            <CardBody className="p-4 text-center">
              <AlertTriangle size={20} className="mx-auto mb-2 text-orange-500" />
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.revision}</p>
              <p className="text-xs text-orange-600/70 dark:text-orange-400/70">Revisi</p>
            </CardBody>
          </Card>
          <Card className="border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-500/10">
            <CardBody className="p-4 text-center">
              <CheckCircle2 size={20} className="mx-auto mb-2 text-emerald-500" />
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.approved}</p>
              <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">Disetujui</p>
            </CardBody>
          </Card>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <Card className="border border-zinc-200 dark:border-zinc-800">
          <CardBody className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="Cari project atau mahasiswa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                startContent={<Search size={16} className="text-default-400" />}
                variant="bordered"
                classNames={{
                  inputWrapper: 'border-default-200',
                }}
                className="flex-1"
              />
              <Select
                placeholder="Filter Status"
                selectedKeys={[statusFilter]}
                onChange={(e) => setStatusFilter(e.target.value)}
                variant="bordered"
                startContent={<Filter size={16} className="text-default-400" />}
                classNames={{
                  trigger: 'border-default-200 min-w-[180px]',
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
          <Card className="border border-zinc-200 dark:border-zinc-800">
            <CardBody className="p-8 text-center">
              <FolderGit2 size={48} className="mx-auto mb-4 text-default-300" />
              <p className="font-semibold">Tidak ada project ditemukan</p>
              <p className="text-sm text-default-500 mt-1">
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
                <Card className="border border-zinc-200 dark:border-zinc-800 hover:border-primary/50 transition-colors">
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
                            <p className="text-sm text-default-500 line-clamp-1 mb-2">
                              {project.description}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-3 text-xs text-default-400">
                            <span className="flex items-center gap-1">
                              <Users size={12} />
                              {project.mahasiswa.name} ({project.mahasiswa.username})
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              {project.semester} {project.tahunAkademik}
                            </span>
                            <span className="flex items-center gap-1">
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
