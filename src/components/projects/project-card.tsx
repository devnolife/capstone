'use client';

import Link from 'next/link';
import {
  Card,
  CardBody,
  CardFooter,
  Chip,
  Progress,
  Button,
} from '@heroui/react';
import { FolderGit2, FileText, Github, ExternalLink } from 'lucide-react';
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';
import type { Project, Document, Review } from '@/generated/prisma';

interface ProjectWithRelations extends Project {
  documents?: Document[];
  reviews?: Review[];
  _count?: {
    documents: number;
    reviews: number;
  };
}

interface ProjectCardProps {
  project: ProjectWithRelations;
  showActions?: boolean;
}

export function ProjectCard({ project, showActions = true }: ProjectCardProps) {
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
                href={`/dashboard/mahasiswa/projects/${project.id}`}
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
            <span>{documentCount} dokumen</span>
          </div>
          <div className="flex items-center gap-1">
            <span>{reviewCount} review</span>
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
      </CardBody>

      {showActions && (
        <CardFooter className="gap-2 pt-0">
          <Button
            as={Link}
            href={`/dashboard/mahasiswa/projects/${project.id}`}
            size="sm"
            variant="flat"
            className="flex-1"
          >
            Lihat Detail
          </Button>
          {project.status === 'DRAFT' && (
            <Button
              as={Link}
              href={`/dashboard/mahasiswa/projects/${project.id}/edit`}
              size="sm"
              color="primary"
              variant="flat"
              className="flex-1"
            >
              Edit
            </Button>
          )}
        </CardFooter>
      )}

      <div className="px-4 pb-3">
        <p className="text-xs text-default-400">
          Diperbarui: {formatDate(project.updatedAt)}
        </p>
      </div>
    </Card>
  );
}
