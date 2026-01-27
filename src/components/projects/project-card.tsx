'use client';

import Link from 'next/link';
import {
  Card,
  CardBody,
  CardFooter,
  Chip,
  Progress,
  Button,
  Tooltip,
} from '@heroui/react';
import {
  FolderGit2,
  FileText,
  Github,
  ExternalLink,
  MessageSquare,
  Clock,
  ArrowRight,
  Sparkles,
  Trash2,
  Crown,
  Users,
} from 'lucide-react';
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';

interface ProjectWithRelations {
  id: string;
  title: string;
  description: string | null;
  status: string;
  githubRepoUrl: string | null;
  githubRepoName: string | null;
  semester: string;
  tahunAkademik: string;
  createdAt: Date;
  updatedAt: Date;
  documents?: { id: string }[];
  reviews?: { id: string }[];
  _count?: {
    documents: number;
    reviews: number;
    members?: number;
  };
}

interface ProjectCardProps {
  project: ProjectWithRelations;
  showActions?: boolean;
  isOwner?: boolean;
  ownerName?: string;
  onDelete?: (project: ProjectWithRelations) => void;
}

export function ProjectCard({ project, showActions = true, isOwner = true, ownerName, onDelete }: ProjectCardProps) {
  const documentCount =
    project._count?.documents || project.documents?.length || 0;
  const reviewCount = project._count?.reviews || project.reviews?.length || 0;

  // Calculate progress based on status
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

  const getStatusGradient = () => {
    switch (project.status) {
      case 'APPROVED':
        return 'from-emerald-500/20 via-green-500/10 to-transparent';
      case 'REJECTED':
        return 'from-red-500/20 via-rose-500/10 to-transparent';
      case 'IN_REVIEW':
        return 'from-amber-500/20 via-yellow-500/10 to-transparent';
      case 'REVISION_NEEDED':
        return 'from-orange-500/20 via-amber-500/10 to-transparent';
      case 'SUBMITTED':
        return 'from-blue-500/20 via-sky-500/10 to-transparent';
      default:
        return 'from-primary/20 via-primary/10 to-transparent';
    }
  };

  return (
    <Card className="group w-full relative overflow-hidden border border-default-200/50 dark:border-default-100/10 bg-background/60 dark:bg-default-50/5 backdrop-blur-xl shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1 hover:border-primary/30">
      {/* Gradient overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${getStatusGradient()} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
      />

      {/* Shine effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>

      <CardBody className="gap-4 relative z-10 p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 group-hover:border-primary/40 transition-colors duration-300">
                <FolderGit2 className="text-primary" size={22} />
              </div>
              {project.status === 'APPROVED' && (
                <div className="absolute -top-1 -right-1 p-1 rounded-full bg-success/20 border border-success/30">
                  <Sparkles size={10} className="text-success" />
                </div>
              )}
            </div>
            <div className="space-y-1">
              <Link
                href={`/mahasiswa/projects/${project.id}`}
                className="font-semibold text-foreground hover:text-primary transition-colors duration-300 line-clamp-1"
              >
                {project.title}
              </Link>
              <div className="flex items-center gap-2 text-xs text-default-400">
                <span className="px-2 py-0.5 rounded-full bg-default-100 dark:bg-default-50/10">
                  {project.semester}
                </span>
                <span className="text-default-300">|</span>
                <span>{project.tahunAkademik}</span>
              </div>
            </div>
          </div>
          <Chip
            size="sm"
            color={getStatusColor(project.status)}
            variant="flat"
            className="font-medium shadow-sm"
            classNames={{
              base: 'border border-current/20',
            }}
          >
            {getStatusLabel(project.status)}
          </Chip>
        </div>

        {/* Role Badge - Shows if user is owner or team member */}
        <div className="flex items-center gap-2">
          {isOwner ? (
            <Chip
              size="sm"
              color="primary"
              variant="flat"
              startContent={<Crown size={12} />}
              className="font-medium"
            >
              Ketua
            </Chip>
          ) : (
            <Tooltip content={`Ketua: ${ownerName || 'Unknown'}`}>
              <Chip
                size="sm"
                color="secondary"
                variant="flat"
                startContent={<Users size={12} />}
                className="font-medium"
              >
                Anggota
              </Chip>
            </Tooltip>
          )}
        </div>

        {/* Description */}
        {project.description && (
          <p className="text-sm text-default-500 dark:text-default-400 line-clamp-2 leading-relaxed">
            {project.description}
          </p>
        )}

        {/* Stats Row */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-default-100/80 dark:bg-default-50/10 text-sm text-default-600 dark:text-default-400">
            <FileText size={14} className="text-primary" />
            <span className="font-medium">{documentCount}</span>
            <span className="text-default-400">dokumen</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-default-100/80 dark:bg-default-50/10 text-sm text-default-600 dark:text-default-400">
            <MessageSquare size={14} className="text-secondary" />
            <span className="font-medium">{reviewCount}</span>
            <span className="text-default-400">review</span>
          </div>
          {project.githubRepoUrl && (
            <a
              href={project.githubRepoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-default-100/80 dark:bg-default-50/10 text-sm text-default-600 dark:text-default-400 hover:bg-primary/10 hover:text-primary transition-all duration-300"
            >
              <Github size={14} />
              <span>Repo</span>
              <ExternalLink size={10} className="opacity-60" />
            </a>
          )}
        </div>

        {/* Progress Section */}
        <div className="space-y-2 pt-1">
          <div className="flex justify-between items-center text-sm">
            <span className="text-default-500 dark:text-default-400">
              Progress
            </span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">
                {getProgress()}%
              </span>
              <div
                className={`w-2 h-2 rounded-full ${
                  getProgress() === 100
                    ? 'bg-success animate-pulse'
                    : 'bg-primary/50'
                }`}
              />
            </div>
          </div>
          <div className="relative">
            <Progress
              value={getProgress()}
              color={getStatusColor(project.status)}
              size="sm"
              className="h-2"
              classNames={{
                track: 'bg-default-200/50 dark:bg-default-100/10',
                indicator:
                  'bg-gradient-to-r from-primary via-primary to-primary/80',
              }}
            />
          </div>
        </div>
      </CardBody>

      {/* Footer */}
      {showActions && (
        <CardFooter className="gap-3 pt-0 px-5 pb-4 relative z-10">
          <Button
            as={Link}
            href={`/mahasiswa/projects/${project.id}`}
            size="sm"
            variant="flat"
            className="flex-1 bg-default-100/80 dark:bg-default-50/10 hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20 transition-all duration-300"
            endContent={
              <ArrowRight
                size={14}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            }
          >
            Lihat Detail
          </Button>
          {isOwner && project.status === 'DRAFT' && (
            <>
              <Button
                as={Link}
                href={`/mahasiswa/projects/${project.id}/edit`}
                size="sm"
                color="primary"
                variant="flat"
                className="flex-1 bg-primary/10 hover:bg-primary/20 border border-primary/20 hover:border-primary/40 transition-all duration-300"
              >
                Edit
              </Button>
              {onDelete && (
                <Button
                  size="sm"
                  color="danger"
                  variant="flat"
                  isIconOnly
                  className="bg-danger/10 hover:bg-danger/20 border border-danger/20 hover:border-danger/40 transition-all duration-300"
                  onPress={() => onDelete(project)}
                >
                  <Trash2 size={16} />
                </Button>
              )}
            </>
          )}
        </CardFooter>
      )}

      {/* Timestamp */}
      <div className="px-5 pb-4 relative z-10">
        <div className="flex items-center gap-1.5 text-xs text-default-400">
          <Clock size={12} />
          <span>Diperbarui: {formatDate(project.updatedAt)}</span>
        </div>
      </div>
    </Card>
  );
}
