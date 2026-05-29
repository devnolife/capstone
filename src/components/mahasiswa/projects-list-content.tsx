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
import { Plus, FolderGit2, Trash2, Search, ArrowRight, Asterisk, Sparkles, Filter, AlertCircle } from 'lucide-react';
import { ProjectCard } from '@/components/projects/project-card';

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
    { id: 'ALL', label: 'Semua', count: statusCounts.all, color: 'hover:bg-[var(--color-fog)] dark:hover:bg-zinc-800' },
    { id: 'DRAFT', label: 'Draft', count: statusCounts.DRAFT, color: 'hover:bg-[var(--color-fog)] dark:hover:bg-zinc-800' },
    { id: 'SUBMITTED', label: 'Disubmit', count: statusCounts.SUBMITTED, color: 'hover:bg-indigo-500/10 hover:text-indigo-500' },
    { id: 'IN_REVIEW', label: 'Review', count: statusCounts.IN_REVIEW, color: 'hover:bg-amber-500/10 hover:text-amber-500' },
    { id: 'APPROVED', label: 'Disetujui', count: statusCounts.APPROVED, color: 'hover:bg-emerald-500/10 hover:text-emerald-500' },
    { id: 'REJECTED', label: 'Ditolak', count: statusCounts.REJECTED, color: 'hover:bg-rose-500/10 hover:text-rose-500' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Editorial Header - Premium Awesomic Canvas */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="ae-card relative p-8 md:p-12 bg-[var(--color-snow)] dark:bg-[var(--color-obsidian)] border border-[var(--color-pebble)] dark:border-[var(--color-graphite)] rounded-2xl overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-radial-gradient from-[var(--color-ember)]/10 to-transparent blur-3xl pointer-events-none -translate-y-1/3 translate-x-1/3" />
        <div className="absolute -bottom-10 -left-10 text-[var(--color-ember)] opacity-5 pointer-events-none select-none">
          <FolderGit2 size={180} />
        </div>

        <div className="relative flex items-start gap-4">
          <div className="p-3.5 rounded-2xl border border-[var(--color-pebble)] dark:border-[var(--color-graphite)] bg-[var(--color-fog)] dark:bg-zinc-800 text-[var(--color-obsidian)] dark:text-white flex items-center justify-center">
            <FolderGit2 size={24} className="text-[var(--color-ember)]" />
          </div>
          <div className="space-y-1">
            <span className="font-mono-display text-[9px] uppercase tracking-widest opacity-60 font-bold flex items-center gap-1 text-[var(--color-steel)]">
              <Asterisk size={10} className="animate-spin text-[var(--color-ember)]" /> student workspaces
            </span>
            <h1 className="font-sans-display text-2xl sm:text-4xl font-extrabold tracking-[-0.03em] leading-none uppercase text-[var(--color-obsidian)] dark:text-white">
              Project <span className="font-serif-display italic lowercase text-[var(--color-ember)] normal-case">Saya</span>
            </h1>
            <p className="text-xs sm:text-sm opacity-70 font-medium text-[var(--color-steel)]">Kelola dan pantau seluruh pengerjaan capstone akademik Anda.</p>
          </div>
        </div>

        <div className="relative pt-2 md:pt-0">
          <Link
            href="/mahasiswa/projects/new"
            className="inline-flex items-center gap-2 py-3 px-6 rounded-full font-mono-display text-xs font-bold uppercase tracking-wider bg-[var(--color-obsidian)] text-white dark:bg-white dark:text-[#09090b] hover:scale-102 transition-transform select-none"
          >
            <Plus size={16} strokeWidth={2.5} /> Buat Project Baru
          </Link>
        </div>
      </motion.div>

      {/* Control Panel: Search & Filter Grid */}
      <div className="space-y-4">
        {/* Search Input styled as outline card */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-current/50 group-focus-within:text-current">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Cari project berdasarkan judul, teknologi, semester, dsb..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-10 py-3.5 rounded-2xl border border-[var(--color-pebble)] dark:border-[var(--color-graphite)] bg-[var(--color-snow)] dark:bg-[var(--color-obsidian)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-ember)] font-medium transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-4 flex items-center text-xs font-mono-display uppercase opacity-60 hover:opacity-100 font-extrabold text-[var(--color-steel)]"
            >
              Clear
            </button>
          )}
        </div>

        {/* Status Filter Tab Blocks */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-[9px] font-mono-display uppercase tracking-widest opacity-60 font-extrabold text-[var(--color-steel)]">
            <Filter size={10} /> Urutkan Berdasarkan Status
          </div>

          <div className="flex flex-wrap gap-2 select-none">
            {filters.map((fl) => {
              const isActive = selectedStatus === fl.id;
              return (
                <button
                  key={fl.id}
                  onClick={() => setSelectedStatus(fl.id)}
                  className={`py-1.5 px-3.5 rounded-full font-mono-display text-[10px] font-extrabold uppercase tracking-wide border transition-all outline-none ${isActive
                    ? 'bg-[var(--color-obsidian)] text-white dark:bg-white dark:text-[#09090b] border-transparent'
                    : `bg-transparent text-current/80 border-[var(--color-pebble)] dark:border-[var(--color-graphite)] ${fl.color}`
                    }`}
                >
                  <span>{fl.label}</span>
                  <span className={`text-[9px] font-normal px-1.5 py-0.5 rounded-full ${isActive ? 'bg-[var(--color-ember)] text-white' : 'bg-black/5 dark:bg-white/10'}`}>
                    {fl.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid Canvas */}
      <AnimatePresence mode="wait">
        {filteredProjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="ae-card p-12 text-center bg-[var(--color-snow)] dark:bg-[var(--color-obsidian)] border border-dashed border-[var(--color-pebble)] dark:border-[var(--color-graphite)] rounded-2xl"
          >
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-full border border-[var(--color-pebble)] dark:border-[var(--color-graphite)] bg-[var(--color-fog)] dark:bg-zinc-900 flex items-center justify-center mx-auto text-current opacity-70">
                <FolderGit2 size={32} className="text-[var(--color-steel)]" />
              </div>
              <h3 className="font-sans-display text-lg font-bold tracking-tight uppercase text-[var(--color-obsidian)] dark:text-white">
                {projects.length === 0 ? 'Belum Ada Project' : 'Data Tidak Ditemukan'}
              </h3>
              <p className="text-xs sm:text-sm text-[var(--color-steel)] leading-relaxed font-medium">
                {projects.length === 0
                  ? 'Anda belum memiliki capstone terdaftar. Hubungkan repositori GitHub Anda sekarang untuk memulai langkah penyusunan.'
                  : 'Gak ada berkas capstone yang sesuai kriteria pencarian atau status filter pilihan Anda.'}
              </p>
              {projects.length === 0 && (
                <div className="pt-3">
                  <Link
                    href="/mahasiswa/projects/new"
                    className="inline-flex items-center gap-2 py-2 px-5 rounded-full font-mono-display text-[10px] font-bold uppercase tracking-wider bg-[var(--color-obsidian)] text-white dark:bg-white dark:text-[#09090b] select-none"
                  >
                    Buat Project Pertama
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
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                isOwner={project.isOwner}
                ownerName={project.mahasiswa?.name}
                onDelete={project.isOwner && project.status === 'DRAFT' ? handleDeleteClick : undefined}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal - styled matching the theme */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setProjectToDelete(null);
        }}
        classNames={{
          backdrop: 'bg-black/60 backdrop-blur-md',
          base: 'border border-[var(--color-pebble)] dark:border-[var(--color-graphite)] bg-[var(--color-snow)] dark:bg-[var(--color-obsidian)] rounded-2xl overflow-hidden',
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex items-center gap-3 border-b border-[var(--color-pebble)] dark:border-[var(--color-graphite)] p-5">
                <div className="p-2 rounded-xl bg-rose-500 text-white flex items-center justify-center">
                  <Trash2 size={18} />
                </div>
                <span className="font-sans-display text-base font-extrabold uppercase">Hapus Berkas Project</span>
              </ModalHeader>
              <ModalBody className="p-6 space-y-4">
                {projectToDelete && (
                  <div className="space-y-4 font-medium">
                    <p className="opacity-80 text-sm text-[var(--color-steel)]">
                      Apakah Anda yakin ingin menghapus data project berikut secara permanen?
                    </p>
                    <div className="p-4 bg-[var(--color-snow)] dark:bg-[var(--color-obsidian)] rounded-2xl border border-[var(--color-pebble)] dark:border-[var(--color-graphite)]">
                      <p className="font-sans-display font-bold text-base leading-tight text-[var(--color-obsidian)] dark:text-white">{projectToDelete.title}</p>
                      <p className="text-[10px] font-mono-display uppercase tracking-widest opacity-60 mt-1.5 font-bold text-[var(--color-steel)]">
                        Semester {projectToDelete.semester} · {projectToDelete.tahunAkademik}
                      </p>
                    </div>
                    <div className="p-3.5 bg-red-500/10 border border-red-500/30 text-rose-600 dark:text-rose-400 rounded-xl flex gap-2.5 items-start">
                      <AlertCircle size={18} className="shrink-0 mt-0.5 text-rose-550" />
                      <p className="text-xs leading-relaxed font-bold">
                        Peringatan: Seluruh data pendukung, persetujuan stakeholder, s3 file dokumen, dan histori review evaluasi dosen akan terhapus permanen dari sistem.
                      </p>
                    </div>
                  </div>
                )}
              </ModalBody>
              <ModalFooter className="border-t border-[var(--color-pebble)] dark:border-[var(--color-graphite)] bg-[var(--color-fog)] dark:bg-zinc-900 p-5">
                <button
                  onClick={onClose}
                  disabled={isDeleting}
                  className="py-2 px-4 rounded-xl font-mono-display text-[10px] font-bold uppercase tracking-wider border border-[var(--color-pebble)] dark:border-[var(--color-graphite)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors disabled:opacity-50 select-none text-[var(--color-steel)]"
                >
                  Batal
                </button>
                <button
                  onClick={handleDeleteProject}
                  disabled={isDeleting}
                  className="py-2 px-4 rounded-xl font-mono-display text-[10px] font-bold uppercase tracking-wider bg-rose-600 text-white hover:bg-rose-700 transition-colors disabled:opacity-50 flex items-center gap-1.5 select-none"
                >
                  {isDeleting ? 'Menghapus...' : 'Hapus Project'}
                </button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
