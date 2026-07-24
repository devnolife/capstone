'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Tooltip } from '@heroui/react';
import {
  FolderGit2,
  FileText,
  Github,
  ExternalLink,
  MessageSquare,
  Clock,
  ArrowRight,
  Trash2,
  Crown,
  Users,
} from 'lucide-react';
import { formatDate, getStatusLabel } from '@/lib/utils';

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

/** Titik status semantik kecil di dalam chip (satu-satunya warna di kartu). */
function statusDotClass(status: string): string {
  switch (status) {
    case 'APPROVED':
      return 'bg-success';
    case 'REJECTED':
      return 'bg-danger';
    case 'IN_REVIEW':
      return 'bg-warning animate-pulse';
    case 'REVISION_NEEDED':
      return 'bg-warning';
    case 'SUBMITTED':
      return 'bg-primary';
    default: // DRAFT
      return 'bg-app-teritary-invert';
  }
}

function getProgress(status: string): number {
  switch (status) {
    case 'DRAFT':
      return 10;
    case 'SUBMITTED':
      return 30;
    case 'IN_REVIEW':
      return 60;
    case 'REVISION_NEEDED':
      return 50;
    case 'APPROVED':
    case 'REJECTED':
      return 100;
    default:
      return 0;
  }
}

const statChipClass =
  'flex items-center gap-1.5 rounded-full border border-border bg-app-quinary px-2.5 py-1 font-mono text-[10px] tracking-wider text-app-secondary-invert';

/**
 * Kartu project mahasiswa — sel bento Caret (dirender di dalam grid
 * gap-px, jadi tanpa border/radius sendiri).
 */
export function ProjectCard({
  project,
  showActions = true,
  isOwner = true,
  ownerName,
  onDelete,
}: ProjectCardProps) {
  const documentCount = project._count?.documents || project.documents?.length || 0;
  const reviewCount = project._count?.reviews || project.reviews?.length || 0;
  const progress = getProgress(project.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="group flex h-full flex-col justify-between bg-background p-5 transition-colors hover:bg-app-quinary md:p-6"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="bg-app-primary text-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
              <FolderGit2 size={16} />
            </span>
            <div className="min-w-0">
              <span className="text-app-teritary-invert block font-mono text-[9px] uppercase tracking-[0.18em]">
                {project.semester} · {project.tahunAkademik}
              </span>
              <h3 className="mt-0.5 truncate text-base font-semibold leading-tight tracking-tight">
                <Link
                  href={`/mahasiswa/projects/${project.id}`}
                  className="transition-colors hover:text-app-secondary-invert"
                >
                  {project.title}
                </Link>
              </h3>
            </div>
          </div>

          <span className="border-app-secondary bg-app-quinary text-app-secondary-invert inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium whitespace-nowrap">
            <span className={`size-1.5 rounded-full ${statusDotClass(project.status)}`} />
            {getStatusLabel(project.status)}
          </span>
        </div>

        {/* Peran */}
        <div className="flex flex-wrap items-center gap-2">
          {isOwner ? (
            <span className="text-app-primary-invert inline-flex items-center gap-1.5 rounded-full border border-border bg-app-quaternary px-2.5 py-1 font-mono text-[9px] uppercase tracking-widest">
              <Crown size={10} /> Ketua Kelompok
            </span>
          ) : (
            <Tooltip content={`Ketua: ${ownerName || 'Tidak diketahui'}`}>
              <span className="text-app-teritary-invert inline-flex cursor-help items-center gap-1.5 rounded-full border border-border px-2.5 py-1 font-mono text-[9px] uppercase tracking-widest">
                <Users size={10} /> Anggota
              </span>
            </Tooltip>
          )}
        </div>

        {/* Deskripsi */}
        {project.description && (
          <p className="text-app-secondary-invert line-clamp-2 text-sm leading-relaxed">
            {project.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <div className={statChipClass}>
            <FileText size={11} />
            <span className="tabular-nums">{documentCount}</span>
            <span className="text-app-teritary-invert text-[9px]">dok</span>
          </div>
          <div className={statChipClass}>
            <MessageSquare size={11} />
            <span className="tabular-nums">{reviewCount}</span>
            <span className="text-app-teritary-invert text-[9px]">review</span>
          </div>
          {project.githubRepoUrl && (
            <a
              href={project.githubRepoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`${statChipClass} transition-colors hover:bg-app-quaternary hover:text-foreground`}
            >
              <Github size={11} />
              <span className="max-w-[80px] truncate normal-case">
                {project.githubRepoName || 'Repo'}
              </span>
              <ExternalLink size={8} className="text-app-teritary-invert" />
            </a>
          )}
        </div>

        {/* Progress */}
        <div className="space-y-1.5 pt-2">
          <div className="text-app-teritary-invert flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em]">
            <span>Progress</span>
            <span className="tabular-nums">{progress}%</span>
          </div>
          <div className="bg-app-primary h-1.5 overflow-hidden rounded-full">
            <motion.div
              className="bg-primary h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.65, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 space-y-3 border-t border-border pt-4">
        {showActions && (
          <div className="flex items-center gap-2">
            <Link
              href={`/mahasiswa/projects/${project.id}`}
              className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-full border border-input bg-input/30 text-xs font-medium text-foreground transition-all hover:bg-input/50 active:scale-[0.98]"
            >
              Lihat Detail
              <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
            </Link>

            {isOwner && project.status === 'DRAFT' && (
              <>
                <Link
                  href={`/mahasiswa/projects/${project.id}/edit`}
                  className="inline-flex h-8 items-center justify-center rounded-full border border-input bg-input/30 px-3.5 text-xs font-medium text-foreground transition-all hover:bg-input/50 active:scale-[0.98]"
                >
                  Edit
                </Link>
                {onDelete && (
                  <button
                    onClick={() => onDelete(project)}
                    className="text-app-secondary-invert flex size-8 items-center justify-center rounded-full border border-input bg-input/30 transition-all hover:bg-destructive/15 hover:text-destructive active:scale-[0.98]"
                    title="Hapus Project"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* Timestamp */}
        <div className="text-app-teritary-invert flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.18em]">
          <span className="flex items-center gap-1">
            <Clock size={10} />
            <span>Aktif: {formatDate(project.updatedAt)}</span>
          </span>
          <span>Capstone Prodi</span>
        </div>
      </div>
    </motion.div>
  );
}
