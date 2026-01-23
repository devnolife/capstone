'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Card,
  CardBody,
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
  Progress,
} from '@heroui/react';
import { Search, FolderGit2, FileText, Calendar, ChevronRight, ClipboardCheck, Eye, Users } from 'lucide-react';
import { getStatusColor, getStatusLabel } from '@/lib/utils';

interface Review {
  id: string;
  status: string;
  reviewerId: string;
}

interface Project {
  id: string;
  title: string;
  semester: string;
  tahunAkademik: string;
  status: string;
  mahasiswa: {
    id: string;
    name: string;
    username: string;
    image: string | null;
  };
  reviews: Review[];
  _count: {
    documents: number;
    reviews: number;
  };
}

interface DosenProjectsContentProps {
  projects: Project[];
  currentUserId: string;
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

// Get status gradient
const getStatusGradient = (status: string) => {
  switch (status) {
    case 'APPROVED':
      return 'from-emerald-500 to-green-400';
    case 'REJECTED':
      return 'from-red-500 to-rose-400';
    case 'IN_REVIEW':
      return 'from-amber-500 to-orange-400';
    case 'SUBMITTED':
      return 'from-blue-500 to-indigo-400';
    case 'REVISION_NEEDED':
      return 'from-orange-500 to-amber-400';
    default:
      return 'from-zinc-500 to-zinc-400';
  }
};

// Get progress based on status
const getProgress = (status: string) => {
  switch (status) {
    case 'DRAFT':
      return 15;
    case 'SUBMITTED':
      return 40;
    case 'IN_REVIEW':
      return 65;
    case 'REVISION_NEEDED':
      return 55;
    case 'APPROVED':
      return 100;
    case 'REJECTED':
      return 100;
    default:
      return 0;
  }
};

// Mobile Project Card for full list
function MobileProjectCard({
  project,
  currentUserId,
}: {
  project: Project;
  currentUserId: string;
}) {
  const myReview = project.reviews.find((r) => r.reviewerId === currentUserId);

  return (
    <motion.div variants={itemVariants}>
      <Card className="mb-3 border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
        <CardBody className="p-4">
          <div className="space-y-3">
            {/* Mahasiswa Info */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700">
              <Avatar
                name={project.mahasiswa.name}
                src={project.mahasiswa.image || undefined}
                size="sm"
                className="ring-2 ring-white dark:ring-zinc-700"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {project.mahasiswa.name}
                </p>
                <p className="text-xs text-default-500">
                  @{project.mahasiswa.username}
                </p>
              </div>
            </div>

            {/* Project Title with gradient icon */}
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-xl bg-gradient-to-br ${getStatusGradient(project.status)} text-white shrink-0`}>
                <FolderGit2 size={16} />
              </div>
              <Link
                href={`/dosen/projects/${project.id}`}
                className="font-semibold text-sm hover:text-primary transition-colors line-clamp-2 flex-1"
              >
                {project.title}
              </Link>
            </div>

            {/* Status Chips */}
            <div className="flex flex-wrap gap-2">
              <Chip
                size="sm"
                color={getStatusColor(project.status)}
                variant="flat"
              >
                {getStatusLabel(project.status)}
              </Chip>
              {myReview ? (
                <Chip
                  size="sm"
                  color={getStatusColor(myReview.status)}
                  variant="flat"
                >
                  {getStatusLabel(myReview.status)}
                </Chip>
              ) : (
                <Chip size="sm" variant="flat" color="warning">
                  Belum Direview
                </Chip>
              )}
            </div>

            {/* Progress bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-default-400">Progress</span>
                <span className="font-medium">{getProgress(project.status)}%</span>
              </div>
              <Progress
                value={getProgress(project.status)}
                color={getStatusColor(project.status)}
                size="sm"
                className="h-1.5"
              />
            </div>

            {/* Info Row */}
            <div className="flex items-center gap-3 text-xs text-default-500">
              <div className="flex items-center gap-1">
                <Calendar size={12} />
                <span>
                  {project.semester} {project.tahunAkademik}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <FileText size={12} />
                <span>{project._count.documents} dok</span>
              </div>
              <div className="flex items-center gap-1">
                <ClipboardCheck size={12} />
                <span>{project._count.reviews} review</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                as={Link}
                href={`/dosen/projects/${project.id}`}
                size="sm"
                variant="flat"
                className="flex-1"
                startContent={<Eye size={14} />}
              >
                Detail
              </Button>
              <Button
                as={Link}
                href={`/dosen/projects/${project.id}/review`}
                size="sm"
                color="primary"
                className="flex-1"
                startContent={<ClipboardCheck size={14} />}
              >
                Review
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}

export function DosenProjectsContent({
  projects,
  currentUserId,
}: DosenProjectsContentProps) {
  return (
    <motion.div
      className="w-full space-y-6 pb-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Card */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 text-white overflow-hidden">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            }}
          />
          <CardBody className="p-6 md:p-8 relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                  <ClipboardCheck size={28} />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">Project Mahasiswa</h1>
                  <p className="text-white/70 text-sm md:text-base mt-1">
                    Daftar project yang ditugaskan untuk Anda review
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-center px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm">
                  <p className="text-2xl md:text-3xl font-bold">{projects.length}</p>
                  <p className="text-xs text-white/70">Total Project</p>
                </div>
                <div className="text-center px-4 py-2 rounded-xl bg-amber-500/30 backdrop-blur-sm">
                  <p className="text-2xl md:text-3xl font-bold">
                    {projects.filter(p => p.status === 'SUBMITTED' || p.status === 'IN_REVIEW').length}
                  </p>
                  <p className="text-xs text-white/70">Perlu Review</p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <CardBody className="p-4">
            <div className="flex flex-col gap-3 md:flex-row md:gap-4">
              <Input
                placeholder="Cari project atau mahasiswa..."
                startContent={<Search size={18} className="text-default-400" />}
                className="flex-1"
                size="md"
                variant="bordered"
              />
              <Select
                placeholder="Filter Status"
                className="w-full md:max-w-[200px]"
                size="md"
                variant="bordered"
              >
                <SelectItem key="all">Semua Status</SelectItem>
                <SelectItem key="SUBMITTED">Disubmit</SelectItem>
                <SelectItem key="IN_REVIEW">Dalam Review</SelectItem>
                <SelectItem key="APPROVED">Disetujui</SelectItem>
                <SelectItem key="REVISION_NEEDED">Perlu Revisi</SelectItem>
              </Select>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Projects List/Table */}
      <motion.div variants={itemVariants}>
        <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="p-5 bg-gradient-to-r from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-800 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                  <FolderGit2 size={20} />
                </div>
                <div>
                  <h2 className="font-bold text-lg">Project Ditugaskan</h2>
                  <p className="text-xs text-default-500">
                    {projects.length} project untuk direview
                  </p>
                </div>
              </div>
            </div>
          </div>

          <CardBody className="p-0">
            {projects.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center">
                  <FolderGit2 size={36} className="text-emerald-500" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Belum Ada Project</h3>
                <p className="text-default-500 text-sm max-w-sm mx-auto">
                  Belum ada project yang ditugaskan kepada Anda
                </p>
              </div>
            ) : (
              <>
                {/* Mobile View - Cards */}
                <div className="md:hidden p-4">
                  <motion.div variants={containerVariants}>
                    {projects.map((project) => (
                      <MobileProjectCard
                        key={project.id}
                        project={project}
                        currentUserId={currentUserId}
                      />
                    ))}
                  </motion.div>
                </div>

                {/* Desktop View - Table */}
                <div className="hidden md:block p-4">
                  <Table aria-label="Projects table" removeWrapper>
                    <TableHeader>
                      <TableColumn>MAHASISWA</TableColumn>
                      <TableColumn>PROJECT</TableColumn>
                      <TableColumn>SEMESTER</TableColumn>
                      <TableColumn>STATUS</TableColumn>
                      <TableColumn>PROGRESS</TableColumn>
                      <TableColumn>REVIEW STATUS</TableColumn>
                      <TableColumn>AKSI</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {projects.map((project) => {
                        const myReview = project.reviews.find(
                          (r) => r.reviewerId === currentUserId,
                        );

                        return (
                          <TableRow key={project.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar
                                  name={project.mahasiswa.name}
                                  src={project.mahasiswa.image || undefined}
                                  size="sm"
                                  className="ring-2 ring-zinc-200 dark:ring-zinc-700"
                                />
                                <div>
                                  <p className="font-medium text-sm">
                                    {project.mahasiswa.name}
                                  </p>
                                  <p className="text-xs text-default-500">
                                    @{project.mahasiswa.username}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Link
                                href={`/dosen/projects/${project.id}`}
                                className="font-medium hover:text-primary transition-colors"
                              >
                                {project.title}
                              </Link>
                              <p className="text-xs text-default-500">
                                {project._count.documents} dokumen • {project._count.reviews} review
                              </p>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm font-medium">{project.semester}</p>
                              <p className="text-xs text-default-500">
                                {project.tahunAkademik}
                              </p>
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
                              <div className="w-24">
                                <Progress
                                  value={getProgress(project.status)}
                                  color={getStatusColor(project.status)}
                                  size="sm"
                                  className="h-1.5"
                                />
                                <p className="text-xs text-default-500 mt-1">
                                  {getProgress(project.status)}%
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              {myReview ? (
                                <Chip
                                  size="sm"
                                  color={getStatusColor(myReview.status)}
                                  variant="flat"
                                >
                                  {getStatusLabel(myReview.status)}
                                </Chip>
                              ) : (
                                <Chip size="sm" variant="flat" color="warning">
                                  Belum Direview
                                </Chip>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  as={Link}
                                  href={`/dosen/projects/${project.id}`}
                                  size="sm"
                                  variant="flat"
                                  startContent={<Eye size={14} />}
                                >
                                  Detail
                                </Button>
                                <Button
                                  as={Link}
                                  href={`/dosen/projects/${project.id}/review`}
                                  size="sm"
                                  color="primary"
                                  startContent={<ClipboardCheck size={14} />}
                                >
                                  Review
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardBody>
        </Card>
      </motion.div>
    </motion.div>
  );
}
