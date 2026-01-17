'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Card,
  CardBody,
  CardHeader,
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
} from '@heroui/react';
import { Search, FolderGit2, FileText, Calendar, ChevronRight } from 'lucide-react';
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
    avatarUrl: string | null;
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
      <Card className="mb-3">
        <CardBody className="p-4">
          <div className="space-y-3">
            {/* Mahasiswa Info */}
            <div className="flex items-center gap-3">
              <Avatar
                name={project.mahasiswa.name}
                src={project.mahasiswa.avatarUrl || undefined}
                size="sm"
                className="ring-2 ring-default-200"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {project.mahasiswa.name}
                </p>
                <p className="text-xs text-default-500">
                  {project.mahasiswa.username}
                </p>
              </div>
            </div>

            {/* Project Title */}
            <div>
              <Link
                href={`/dosen/projects/${project.id}`}
                className="font-semibold text-sm hover:text-primary transition-colors line-clamp-2"
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
                className="h-5 text-[10px]"
              >
                {getStatusLabel(project.status)}
              </Chip>
              {myReview ? (
                <Chip
                  size="sm"
                  color={getStatusColor(myReview.status)}
                  variant="flat"
                  className="h-5 text-[10px]"
                >
                  {getStatusLabel(myReview.status)}
                </Chip>
              ) : (
                <Chip size="sm" variant="flat" className="h-5 text-[10px]">
                  Belum Direview
                </Chip>
              )}
            </div>

            {/* Info Row */}
            <div className="flex items-center gap-3 text-xs text-default-500">
              <div className="flex items-center gap-1">
                <Calendar size={10} />
                <span>
                  {project.semester} {project.tahunAkademik}
                </span>
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
                href={`/dosen/projects/${project.id}`}
                size="sm"
                variant="flat"
                className="flex-1 h-8"
              >
                Detail
              </Button>
              <Button
                as={Link}
                href={`/dosen/projects/${project.id}/review`}
                size="sm"
                color="primary"
                variant="flat"
                className="flex-1 h-8"
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
      className="space-y-4 md:space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-xl md:text-2xl font-bold">Project Mahasiswa</h1>
        <p className="text-sm md:text-base text-default-500">
          Daftar project yang ditugaskan untuk Anda review
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardBody className="p-3 md:p-4">
            <div className="flex flex-col gap-3 md:flex-row md:gap-4">
              <Input
                placeholder="Cari project atau mahasiswa..."
                startContent={<Search size={18} className="text-default-400" />}
                className="flex-1"
                size="sm"
                classNames={{
                  inputWrapper: 'h-10',
                }}
              />
              <Select
                placeholder="Filter Status"
                className="w-full md:max-w-[200px]"
                size="sm"
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
        <Card>
          <CardHeader className="px-4 py-3">
            <h2 className="text-base md:text-lg font-semibold">
              Project Ditugaskan ({projects.length})
            </h2>
          </CardHeader>
          <CardBody className="pt-0">
            {projects.length === 0 ? (
              <div className="text-center py-12">
                <FolderGit2 size={64} className="mx-auto text-default-300 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Belum Ada Project</h3>
                <p className="text-default-500 text-sm md:text-base">
                  Belum ada project yang ditugaskan kepada Anda
                </p>
              </div>
            ) : (
              <>
                {/* Mobile View - Cards */}
                <div className="md:hidden">
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
                <div className="hidden md:block">
                  <Table aria-label="Projects table" removeWrapper>
                    <TableHeader>
                      <TableColumn>MAHASISWA</TableColumn>
                      <TableColumn>PROJECT</TableColumn>
                      <TableColumn>SEMESTER</TableColumn>
                      <TableColumn>STATUS</TableColumn>
                      <TableColumn>DOKUMEN</TableColumn>
                      <TableColumn>REVIEW STATUS</TableColumn>
                      <TableColumn>AKSI</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {projects.map((project) => {
                        const myReview = project.reviews.find(
                          (r) => r.reviewerId === currentUserId,
                        );

                        return (
                          <TableRow key={project.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar
                                  name={project.mahasiswa.name}
                                  src={project.mahasiswa.avatarUrl || undefined}
                                  size="sm"
                                />
                                <div>
                                  <p className="font-medium text-sm">
                                    {project.mahasiswa.name}
                                  </p>
                                  <p className="text-xs text-default-500">
                                    {project.mahasiswa.username}
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
                            </TableCell>
                            <TableCell>
                              <p className="text-sm">{project.semester}</p>
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
                            <TableCell>{project._count.documents} file</TableCell>
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
                                <Chip size="sm" variant="flat">
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
                                >
                                  Detail
                                </Button>
                                <Button
                                  as={Link}
                                  href={`/dosen/projects/${project.id}/review`}
                                  size="sm"
                                  color="primary"
                                  variant="flat"
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
