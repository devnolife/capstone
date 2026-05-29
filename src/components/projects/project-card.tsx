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
  Sparkles,
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

  const getStatusColorStyles = () => {
    switch (project.status) {
      case 'APPROVED':
        return {
          bg: 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
          text: 'text-emerald-600 dark:text-emerald-400',
          accent: 'rgb(16, 185, 129)',
          border: 'border-emerald-500/20',
        };
      case 'REJECTED':
        return {
          bg: 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-450',
          text: 'text-rose-600',
          accent: 'rgb(244, 63, 94)',
          border: 'border-rose-500/20',
        };
      case 'IN_REVIEW':
        return {
          bg: 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400',
          text: 'text-amber-600 dark:text-amber-400',
          accent: 'rgb(245, 158, 11)',
          border: 'border-amber-500/20',
        };
      case 'REVISION_NEEDED':
        return {
          bg: 'bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400',
          text: 'text-orange-600 dark:text-orange-400',
          accent: 'rgb(249, 115, 22)',
          border: 'border-orange-500/10',
        };
      case 'SUBMITTED':
        return {
          bg: 'bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400',
          text: 'text-indigo-600',
          accent: 'rgb(99, 102, 241)',
          border: 'border-indigo-500/20',
        };
      default: // DRAFT
        return {
          bg: 'bg-[var(--color-fog)] text-[var(--color-steel)]',
          text: 'text-[var(--color-steel)]',
          accent: 'var(--color-steel)',
          border: 'border-[var(--color-pebble)] dark:border-[var(--color-graphite)]',
        };
    }
  };

  const styles = getStatusColorStyles();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="ae-card relative overflow-hidden group flex flex-col justify-between h-full bg-[var(--color-snow)] dark:bg-[var(--color-obsidian)] border border-[var(--color-pebble)] dark:border-[var(--color-graphite)] rounded-2xl p-6 hover:shadow-xl transition-all duration-300"
    >
      {/* Decorative Top Mesh Line */}
      <div className="absolute top-0 left-0 right-0 h-[3px] opacity-80" style={{ backgroundColor: styles.accent }} />

      <div className="space-y-4">
        {/* Header Metadata */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="p-2.5 rounded-2xl border border-[var(--color-pebble)] dark:border-[var(--color-graphite)] bg-[var(--color-fog)] dark:bg-zinc-900/40 text-current flex items-center justify-center">
                <FolderGit2 size={18} className="text-[var(--color-steel)]" />
              </div>
              {project.status === 'APPROVED' && (
                <div className="absolute -top-1 -right-1 p-0.5 rounded-full bg-[var(--color-ember)] border border-[var(--color-snow)] dark:border-[var(--color-obsidian)] animate-bounce">
                  <Sparkles size={8} className="text-white" />
                </div>
              )}
            </div>
            <div>
              <span className="font-mono-display text-[9px] uppercase tracking-widest opacity-60 font-bold block text-[var(--color-steel)]">
                {project.semester} · {project.tahunAkademik}
              </span>
              <h3 className="font-sans-display text-base sm:text-lg font-bold tracking-tight text-[var(--color-obsidian)] dark:text-white line-clamp-1 leading-tight mt-0.5">
                <Link
                  href={`/mahasiswa/projects/${project.id}`}
                  className="hover:text-[var(--color-ember)] transition-colors duration-200"
                >
                  {project.title}
                </Link>
              </h3>
            </div>
          </div>

          <span className={`font-mono-display text-[9px] tracking-wider uppercase font-extrabold px-2.5 py-1 rounded-full border border-current ${styles.bg}`}>
            {getStatusLabel(project.status)}
          </span>
        </div>

        {/* Roles Details Tag row */}
        <div className="flex gap-2 flex-wrap items-center">
          {isOwner ? (
            <span className="inline-flex items-center gap-1 font-mono-display text-[9px] uppercase tracking-widest font-extrabold py-1 px-2.5 rounded-full bg-[var(--color-fog)] dark:bg-zinc-800 text-[var(--color-obsidian)] dark:text-white border border-[var(--color-pebble)] dark:border-[var(--color-graphite)]">
              <Crown size={10} strokeWidth={2.5} className="text-[var(--color-ember)]" /> Ketua Kelompok
            </span>
          ) : (
            <Tooltip content={`Ketua: ${ownerName || 'Unknown'}`}>
              <span className="inline-flex items-center gap-1 font-mono-display text-[9px] uppercase tracking-widest font-extrabold py-1 px-2.5 rounded-full bg-transparent text-[var(--color-steel)] border border-[var(--color-pebble)] dark:border-[var(--color-graphite)] cursor-help">
                <Users size={10} /> Anggota
              </span>
            </Tooltip>
          )}
        </div>

        {/* Description block */}
        {project.description && (
          <p className="text-xs sm:text-sm opacity-75 line-clamp-2 leading-relaxed font-medium text-[var(--color-steel)]">
            {project.description}
          </p>
        )}

        {/* Dynamic Telemetry Stats Row */}
        <div className="flex items-center gap-2 flex-wrap pt-1 font-mono-display text-[10px] uppercase font-bold tracking-wider">
          <div className="flex items-center gap-1 py-1 px-2.5 rounded-lg bg-[var(--color-fog)] dark:bg-zinc-900 border border-[var(--color-pebble)] dark:border-[var(--color-graphite)]">
            <FileText size={11} className="text-blue-500" />
            <span>{documentCount}</span>
            <span className="opacity-60 text-[9px]">docs</span>
          </div>

          <div className="flex items-center gap-1 py-1 px-2.5 rounded-lg bg-[var(--color-fog)] dark:bg-zinc-900 border border-[var(--color-pebble)] dark:border-[var(--color-graphite)]">
            <MessageSquare size={11} className="text-amber-500" />
            <span>{reviewCount}</span>
            <span className="opacity-60 text-[9px]">reviews</span>
          </div>

          {project.githubRepoUrl && (
            <a
              href={project.githubRepoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 py-1 px-2.5 rounded-lg bg-[var(--color-fog)] dark:bg-zinc-900 border border-[var(--color-pebble)] dark:border-[var(--color-graphite)] text-current hover:bg-[var(--color-obsidian)] hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
            >
              <Github size={11} />
              <span className="max-w-[70px] truncate">{project.githubRepoName || 'Repo'}</span>
              <ExternalLink size={8} className="opacity-60" />
            </a>
          )}
        </div>

        {/* Premium Progress bar */}
        <div className="space-y-1.5 pt-2">
          <div className="flex justify-between items-center font-mono-display text-[10px] uppercase tracking-widest opacity-70 font-extrabold text-[var(--color-steel)]">
            <span>Progress Pelaksanaan</span>
            <span>{getProgress()}%</span>
          </div>
          <div className="h-2 rounded-full bg-[var(--color-fog)] dark:bg-zinc-800 overflow-hidden relative">
            <motion.div
              className="h-full rounded-full"
              style={{ width: `${getProgress()}%`, backgroundColor: styles.accent }}
              initial={{ width: 0 }}
              animate={{ width: `${getProgress()}%` }}
              transition={{ duration: 0.65, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* Footer Actions block */}
      <div className="pt-4 space-y-3.5 mt-4 border-t border-[var(--color-pebble)] dark:border-[var(--color-graphite)]">
        {showActions && (
          <div className="flex items-center gap-2">
            <Link
              href={`/mahasiswa/projects/${project.id}`}
              className="flex-1 py-2 px-3 rounded-xl font-mono-display text-[10px] font-extrabold tracking-wider uppercase text-center border border-[var(--color-pebble)] dark:border-[var(--color-graphite)] hover:bg-[var(--color-obsidian)] hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors duration-200 flex items-center justify-center gap-1.5 select-none"
            >
              Lihat Detail <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>

            {isOwner && project.status === 'DRAFT' && (
              <>
                <Link
                  href={`/mahasiswa/projects/${project.id}/edit`}
                  className="py-2 px-3.5 rounded-xl font-mono-display text-[10px] font-extrabold tracking-wider uppercase text-center border border-[var(--color-pebble)] dark:border-[var(--color-graphite)] bg-transparent text-current hover:bg-[var(--color-fog)] transition-colors"
                >
                  Edit
                </Link>

                {onDelete && (
                  <button
                    onClick={() => onDelete(project)}
                    className="p-2 rounded-xl border border-[var(--color-pebble)] dark:border-[var(--color-graphite)] bg-transparent text-current hover:bg-rose-500 hover:text-white dark:hover:bg-rose-600 transition-colors flex items-center justify-center"
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
        <div className="flex items-center justify-between text-[9px] font-mono-display uppercase tracking-widest opacity-50 font-bold text-[var(--color-steel)]">
          <span className="flex items-center gap-1">
            <Clock size={10} />
            <span>Aktif: {formatDate(project.updatedAt)}</span>
          </span>
          <span>CAPSTONE PRODI</span>
        </div>
      </div>
    </motion.div>
  );
}
