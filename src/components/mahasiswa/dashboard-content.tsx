'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Progress,
} from '@heroui/react';
import {
  FolderGit2,
  FileText,
  ClipboardCheck,
  Clock,
  Plus,
  Upload,
  Github,
  ChevronRight,
  ExternalLink,
  Calendar,
} from 'lucide-react';
import { StatsCard } from '@/components/dashboard/stats-card';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';

interface Project {
  id: string;
  title: string;
  description: string | null;
  status: string;
  githubRepoUrl: string | null;
  githubRepoName: string | null;
  semester: string;
  tahunAkademik: string;
  submittedAt: Date | null;
  mahasiswaId: string;
  createdAt: Date;
  updatedAt: Date;
  documents: { id: string }[];
  reviews: { id: string; reviewer: { name: string } }[];
  _count: {
    documents: number;
    reviews: number;
  };
}

interface MahasiswaDashboardProps {
  userName: string;
  userImage?: string;
  projects: Project[];
  stats: {
    totalProjects: number;
    submittedProjects: number;
    reviewedProjects: number;
    pendingReviews: number;
    totalDocuments: number;
  };
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

// Mobile Project Card Component
function MobileProjectCard({ project }: { project: Project }) {
  const getProgress = () => {
    switch (project.status) {
      case 'DRAFT':
        return 10;
      case 'SUBMITTED':
        return 30;
      case 'IN_REVIEW':
        return 60;
      case 'REVISION_NEEDED':
        return 50;
      case 'APPROVED':
        return 100;
      case 'REJECTED':
        return 100;
      default:
        return 0;
    }
  };

  return (
    <motion.div variants={itemVariants}>
      <Card className="mb-3">
        <CardBody className="p-4">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="p-1.5 rounded-lg bg-primary/10 shrink-0">
                  <FolderGit2 className="text-primary" size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm truncate">{project.title}</p>
                  <div className="flex items-center gap-1 text-xs text-default-500">
                    <Calendar size={10} />
                    <span>{project.semester}</span>
                  </div>
                </div>
              </div>
              <Chip
                size="sm"
                color={getStatusColor(project.status)}
                variant="flat"
                className="h-5 text-[10px] shrink-0"
              >
                {getStatusLabel(project.status)}
              </Chip>
            </div>

            {/* Description */}
            {project.description && (
              <p className="text-xs text-default-500 line-clamp-2">
                {project.description}
              </p>
            )}

            {/* Stats Row */}
            <div className="flex items-center gap-3 text-xs text-default-500">
              <div className="flex items-center gap-1">
                <FileText size={12} />
                <span>{project._count.documents} dok</span>
              </div>
              <div className="flex items-center gap-1">
                <ClipboardCheck size={12} />
                <span>{project._count.reviews} review</span>
              </div>
              {project.githubRepoUrl && (
                <a
                  href={project.githubRepoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Github size={12} />
                  <ExternalLink size={10} />
                </a>
              )}
            </div>

            {/* Progress */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-default-400">Progress</span>
                <span className="font-medium">{getProgress()}%</span>
              </div>
              <Progress
                value={getProgress()}
                color={getStatusColor(project.status)}
                size="sm"
                className="h-1.5"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <Button
                as={Link}
                href={`/mahasiswa/projects/${project.id}`}
                size="sm"
                variant="flat"
                className="flex-1 h-8"
              >
                Detail
              </Button>
              {project.status === 'DRAFT' && (
                <Button
                  as={Link}
                  href={`/mahasiswa/projects/${project.id}/edit`}
                  size="sm"
                  color="primary"
                  variant="flat"
                  className="flex-1 h-8"
                >
                  Edit
                </Button>
              )}
            </div>

            {/* Timestamp */}
            <p className="text-[10px] text-default-400">
              Diperbarui: {formatDate(project.updatedAt)}
            </p>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}

export function MahasiswaDashboardContent({
  userName,
  userImage,
  projects,
  stats,
}: MahasiswaDashboardProps) {
  const activities = projects.slice(0, 5).map((project) => ({
    id: project.id,
    type: 'submission' as const,
    title: project.title,
    description: `Project ${project.status === 'DRAFT' ? 'dibuat' : 'disubmit'}`,
    user: {
      name: userName,
      avatar: userImage,
    },
    timestamp: project.updatedAt,
    status: project.status,
  }));

  return (
    <motion.div
      className="space-y-4 md:space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Welcome Section */}
      <motion.div variants={itemVariants}>
        <h1 className="text-xl md:text-2xl font-bold">
          Selamat Datang, {userName}!
        </h1>
        <p className="text-sm md:text-base text-default-500">
          Kelola project capstone Anda di sini
        </p>
      </motion.div>

      {/* Stats Grid - Scrollable on mobile */}
      <motion.div
        variants={itemVariants}
        className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:overflow-visible"
      >
        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 min-w-max md:min-w-0">
          <div className="w-[160px] md:w-auto shrink-0">
            <StatsCard
              title="Total Project"
              value={stats.totalProjects}
              icon={FolderGit2}
              color="primary"
              description={`${stats.submittedProjects} disubmit`}
            />
          </div>
          <div className="w-[160px] md:w-auto shrink-0">
            <StatsCard
              title="Dokumen"
              value={stats.totalDocuments}
              icon={FileText}
              color="secondary"
              description="Total upload"
            />
          </div>
          <div className="w-[160px] md:w-auto shrink-0">
            <StatsCard
              title="Review Selesai"
              value={stats.reviewedProjects}
              icon={ClipboardCheck}
              color="success"
              description="Sudah direview"
            />
          </div>
          <div className="w-[160px] md:w-auto shrink-0">
            <StatsCard
              title="Menunggu"
              value={stats.pendingReviews}
              icon={Clock}
              color="warning"
              description="Dalam antrian"
            />
          </div>
        </div>
      </motion.div>

      {/* Quick Actions - Mobile Only */}
      <motion.div variants={itemVariants} className="md:hidden">
        <Card>
          <CardHeader className="pb-2">
            <h3 className="font-semibold text-sm">Aksi Cepat</h3>
          </CardHeader>
          <CardBody className="pt-0">
            <div className="grid grid-cols-3 gap-2">
              <Button
                as={Link}
                href="/mahasiswa/projects/new"
                variant="flat"
                color="primary"
                className="h-auto py-3 flex-col gap-1"
              >
                <Plus size={20} />
                <span className="text-[10px]">Project Baru</span>
              </Button>
              <Button
                as={Link}
                href="/mahasiswa/upload"
                variant="flat"
                color="secondary"
                className="h-auto py-3 flex-col gap-1"
              >
                <Upload size={20} />
                <span className="text-[10px]">Upload</span>
              </Button>
              <Button
                as={Link}
                href="/mahasiswa/projects"
                variant="flat"
                className="h-auto py-3 flex-col gap-1"
              >
                <FolderGit2 size={20} />
                <span className="text-[10px]">Semua Project</span>
              </Button>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Projects Section */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card>
            <CardHeader className="flex justify-between items-center px-4 py-3">
              <h2 className="text-base md:text-lg font-semibold">Project Saya</h2>
              <Button
                as={Link}
                href="/mahasiswa/projects/new"
                color="primary"
                size="sm"
                className="hidden md:flex"
              >
                Buat Project Baru
              </Button>
              <Button
                as={Link}
                href="/mahasiswa/projects"
                variant="light"
                color="primary"
                size="sm"
                endContent={<ChevronRight size={16} />}
                className="md:hidden"
              >
                Semua
              </Button>
            </CardHeader>
            <CardBody className="pt-0">
              {projects.length === 0 ? (
                <div className="text-center py-8">
                  <FolderGit2
                    size={48}
                    className="mx-auto text-default-300 mb-4"
                  />
                  <p className="text-default-500 mb-4 text-sm md:text-base">
                    Belum ada project. Buat project pertama Anda!
                  </p>
                  <Button
                    as={Link}
                    href="/mahasiswa/projects/new"
                    color="primary"
                  >
                    Buat Project
                  </Button>
                </div>
              ) : (
                <>
                  {/* Mobile View - Cards */}
                  <div className="md:hidden">
                    <motion.div variants={containerVariants}>
                      {projects.slice(0, 3).map((project) => (
                        <MobileProjectCard key={project.id} project={project} />
                      ))}
                    </motion.div>
                    {projects.length > 3 && (
                      <div className="text-center pt-2">
                        <Button
                          as={Link}
                          href="/mahasiswa/projects"
                          variant="light"
                          color="primary"
                          size="sm"
                        >
                          Lihat Semua ({projects.length})
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Desktop View - Original Cards */}
                  <div className="hidden md:block space-y-4">
                    {projects.slice(0, 3).map((project) => (
                      <DesktopProjectCard key={project.id} project={project} />
                    ))}
                    {projects.length > 3 && (
                      <div className="text-center">
                        <Button
                          as={Link}
                          href="/mahasiswa/projects"
                          variant="light"
                          color="primary"
                        >
                          Lihat Semua Project
                        </Button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardBody>
          </Card>
        </motion.div>

        {/* Activity Section */}
        <motion.div variants={itemVariants} className="space-y-4 md:space-y-6">
          {/* Quick Actions - Desktop Only */}
          <Card className="hidden md:block">
            <CardHeader>
              <h3 className="font-semibold">Aksi Cepat</h3>
            </CardHeader>
            <CardBody className="space-y-2">
              <Button
                as={Link}
                href="/mahasiswa/projects/new"
                className="w-full justify-start"
                variant="flat"
                color="primary"
                startContent={<Plus size={18} />}
              >
                Buat Project Baru
              </Button>
              <Button
                as={Link}
                href="/mahasiswa/upload"
                className="w-full justify-start"
                variant="flat"
                startContent={<Upload size={18} />}
              >
                Upload Dokumen
              </Button>
              <Button
                as={Link}
                href="/mahasiswa/projects"
                className="w-full justify-start"
                variant="flat"
                startContent={<FolderGit2 size={18} />}
              >
                Lihat Semua Project
              </Button>
            </CardBody>
          </Card>

          <RecentActivity activities={activities} />
        </motion.div>
      </div>
    </motion.div>
  );
}

// Desktop Project Card (using existing ProjectCard style)
function DesktopProjectCard({ project }: { project: Project }) {
  const getProgress = () => {
    switch (project.status) {
      case 'DRAFT':
        return 10;
      case 'SUBMITTED':
        return 30;
      case 'IN_REVIEW':
        return 60;
      case 'REVISION_NEEDED':
        return 50;
      case 'APPROVED':
        return 100;
      case 'REJECTED':
        return 100;
      default:
        return 0;
    }
  };

  return (
    <Card className="w-full">
      <CardBody className="gap-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FolderGit2 className="text-primary" size={24} />
            </div>
            <div>
              <Link
                href={`/mahasiswa/projects/${project.id}`}
                className="font-semibold hover:text-primary transition-colors"
              >
                {project.title}
              </Link>
              <p className="text-sm text-default-500">
                {project.semester} - {project.tahunAkademik}
              </p>
            </div>
          </div>
          <Chip size="sm" color={getStatusColor(project.status)} variant="flat">
            {getStatusLabel(project.status)}
          </Chip>
        </div>

        {project.description && (
          <p className="text-sm text-default-600 line-clamp-2">
            {project.description}
          </p>
        )}

        <div className="flex items-center gap-4 text-sm text-default-500">
          <div className="flex items-center gap-1">
            <FileText size={16} />
            <span>{project._count.documents} dokumen</span>
          </div>
          <div className="flex items-center gap-1">
            <span>{project._count.reviews} review</span>
          </div>
          {project.githubRepoUrl && (
            <a
              href={project.githubRepoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-primary transition-colors"
            >
              <Github size={16} />
              <span>GitHub</span>
              <ExternalLink size={12} />
            </a>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-default-500">Progress</span>
            <span className="font-medium">{getProgress()}%</span>
          </div>
          <Progress
            value={getProgress()}
            color={getStatusColor(project.status)}
            size="sm"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            as={Link}
            href={`/mahasiswa/projects/${project.id}`}
            size="sm"
            variant="flat"
            className="flex-1"
          >
            Lihat Detail
          </Button>
          {project.status === 'DRAFT' && (
            <Button
              as={Link}
              href={`/mahasiswa/projects/${project.id}/edit`}
              size="sm"
              color="primary"
              variant="flat"
              className="flex-1"
            >
              Edit
            </Button>
          )}
        </div>

        <p className="text-xs text-default-400">
          Diperbarui: {formatDate(project.updatedAt)}
        </p>
      </CardBody>
    </Card>
  );
}
