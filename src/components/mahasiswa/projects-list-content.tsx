'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@heroui/react';
import { Plus, Trash2, Search, Filter, AlertCircle } from 'lucide-react';
import { ProjectCard } from '@/components/projects/project-card';
import { PageHeader } from '@/components/caret/PageHeader';
import { EmptyStateIllustration } from '@/components/caret/illustrations';

interface Project {
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
  isOwner?: boolean;
  mahasiswa?: {
    id: string;
    name: string;
    username: string;
    nim: string | null;
    image: string | null;
  };
  documents?: { id: string }[];
  reviews?: { id: string }[];
  _count?: {
    documents: number;
    reviews: number;
    members?: number;
  };
}

interface ProjectsListContentProps {
  projects: Project[];
  statusCounts: {
    all: number;
    DRAFT: number;
    SUBMITTED: number;
    IN_REVIEW: number;
    APPROVED: number;
    REJECTED: number;
  };
}

export function ProjectsListContent({ projects, statusCounts }: ProjectsListContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || searchParams.get('search') || '';
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Keep state in sync if URL ?q= changes (e.g. header search)
  useEffect(() => {
    setSearchQuery(searchParams.get('q') || searchParams.get('search') || '');
  }, [searchParams]);

  const filteredProjects = useMemo(() => {
    let result = projects;

    // Status Filter
    if (selectedStatus !== 'ALL') {
      result = result.filter((p) => p.status === selectedStatus);
    }

    // Keyword Search
    const q = searchQuery.trim().toLowerCase();
    if (!q) return result;

    return result.filter((p) => {
      const haystack = [
        p.title,
        p.description,
        p.githubRepoName,
        p.semester,
        p.tahunAkademik,
        p.mahasiswa?.name,
        p.mahasiswa?.username,
        p.mahasiswa?.nim ?? '',
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [projects, searchQuery, selectedStatus]);

  const handleDeleteClick = (project: Project) => {
    setProjectToDelete(project);
    setDeleteModalOpen(true);
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/projects/${projectToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDeleteModalOpen(false);
        setProjectToDelete(null);
        // Refresh the page to get updated data
        router.refresh();
      } else {
        const data = await response.json();
        console.error('Error deleting project:', data.error);
        alert(data.error || 'Gagal menghapus project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Terjadi kesalahan saat menghapus project');
    } finally {
      setIsDeleting(false);
    }
  };

  const filters = [
    { id: 'ALL', label: 'Semua', count: statusCounts.all },
    { id: 'DRAFT', label: 'Draft', count: statusCounts.DRAFT },
    { id: 'SUBMITTED', label: 'Disubmit', count: statusCounts.SUBMITTED },
    { id: 'IN_REVIEW', label: 'Review', count: statusCounts.IN_REVIEW },
    { id: 'APPROVED', label: 'Disetujui', count: statusCounts.APPROVED },
    { id: 'REJECTED', label: 'Ditolak', count: statusCounts.REJECTED },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      <PageHeader
        label="[01] PROJECT"
        labelRight="/ SAYA"
        title="Project saya"
        description="Kelola dan pantau seluruh project capstone-mu."
        actions={
          <Link
            href="/mahasiswa/projects/new"
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm font-medium shadow-xs transition-all active:scale-[0.98]"
          >
            <Plus size={15} strokeWidth={2.5} /> Buat Project
          </Link>
        }
      />

      {/* Search + Filter */}
      <div className="space-y-3">
        <div className="group relative">
          <div className="text-app-teritary-invert group-focus-within:text-foreground pointer-events-none absolute inset-y-0 left-4 flex items-center transition-colors">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="Cari project berdasarkan judul, teknologi, semester…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="placeholder:text-app-teritary-invert h-10 w-full rounded-full border border-zinc-800 bg-app-quinary pl-11 pr-16 text-sm text-foreground outline-none transition-all hover:bg-app-quaternary focus:border-ring focus:ring-[3px] focus:ring-ring/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-app-teritary-invert hover:text-foreground absolute inset-y-0 right-4 flex items-center font-mono text-[10px] uppercase tracking-wider transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        <div className="space-y-2">
          <div className="text-app-teritary-invert flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.18em]">
            <Filter size={10} /> Filter status
          </div>

          <div className="flex flex-wrap gap-2 select-none">
            {filters.map((fl) => {
              const isActive = selectedStatus === fl.id;
              return (
                <button
                  key={fl.id}
                  onClick={() => setSelectedStatus(fl.id)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-all outline-none active:scale-[0.98] ${
                    isActive
                      ? 'border-transparent bg-primary font-semibold text-primary-foreground'
                      : 'text-app-secondary-invert border-zinc-800 hover:bg-app-quaternary hover:text-foreground'
                  }`}
                >
                  <span>{fl.label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[9px] tabular-nums ${
                      isActive ? 'bg-black/10' : 'bg-app-primary text-foreground'
                    }`}
                  >
                    {fl.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid */}
      <AnimatePresence mode="wait">
        {filteredProjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="border border-dashed border-zinc-800 bg-background p-12 text-center"
          >
            <div className="mx-auto max-w-md space-y-4">
              <EmptyStateIllustration icon="review" />
              <h3 className="font-display text-lg font-[450] tracking-tight">
                {projects.length === 0 ? 'Belum ada project' : 'Tidak ditemukan'}
              </h3>
              <p className="text-app-secondary-invert text-sm leading-relaxed">
                {projects.length === 0
                  ? 'Kamu belum punya project capstone. Hubungkan repository GitHub dan mulai langkah pertamamu.'
                  : 'Tidak ada project yang cocok dengan pencarian atau filter status.'}
              </p>
              {projects.length === 0 && (
                <div className="pt-2">
                  <Link
                    href="/mahasiswa/projects/new"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm font-medium shadow-xs transition-all active:scale-[0.98]"
                  >
                    <Plus size={15} /> Buat project pertama
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={selectedStatus + searchQuery}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 gap-px border border-zinc-800 bg-zinc-800 md:grid-cols-2 xl:grid-cols-3"
          >
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                isOwner={project.isOwner}
                ownerName={project.mahasiswa?.name}
                onDelete={
                  project.isOwner && project.status === 'DRAFT' ? handleDeleteClick : undefined
                }
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setProjectToDelete(null);
        }}
        classNames={{
          backdrop: 'bg-black/60 backdrop-blur-md',
          base: 'border border-zinc-800 bg-card rounded-2xl overflow-hidden',
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex items-center gap-3 border-b border-zinc-800 p-5">
                <span className="flex size-9 items-center justify-center rounded-lg bg-destructive/15 text-destructive">
                  <Trash2 size={16} />
                </span>
                <span className="font-display text-lg font-[450] tracking-tight">
                  Hapus project
                </span>
              </ModalHeader>
              <ModalBody className="space-y-4 p-6">
                {projectToDelete && (
                  <div className="space-y-4">
                    <p className="text-app-secondary-invert text-sm">
                      Yakin ingin menghapus project berikut secara permanen?
                    </p>
                    <div className="rounded-xl border border-zinc-800 bg-app-quinary p-4">
                      <p className="text-base font-semibold leading-tight">
                        {projectToDelete.title}
                      </p>
                      <p className="text-app-teritary-invert mt-1.5 font-mono text-[10px] uppercase tracking-[0.18em]">
                        Semester {projectToDelete.semester} · {projectToDelete.tahunAkademik}
                      </p>
                    </div>
                    <div className="flex items-start gap-2.5 rounded-xl border border-destructive/40 bg-destructive/10 p-3.5 text-destructive">
                      <AlertCircle size={16} className="mt-0.5 shrink-0" />
                      <p className="text-xs leading-relaxed font-medium">
                        Seluruh dokumen, bukti stakeholder, dan riwayat review akan
                        terhapus permanen dari sistem.
                      </p>
                    </div>
                  </div>
                )}
              </ModalBody>
              <ModalFooter className="border-t border-zinc-800 bg-app-quinary p-4">
                <button
                  onClick={onClose}
                  disabled={isDeleting}
                  className="inline-flex h-9 items-center rounded-full border border-input bg-input/30 px-4 text-xs font-medium text-foreground transition-all hover:bg-input/50 active:scale-[0.98] disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleDeleteProject}
                  disabled={isDeleting}
                  className="bg-danger text-danger-foreground inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-xs font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                >
                  {isDeleting ? 'Menghapus…' : 'Hapus project'}
                </button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
