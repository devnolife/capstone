'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Button,
  Chip,
  Card,
  CardBody,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@heroui/react';
import { Plus, FolderGit2, Trash2, Crown, Users, Search } from 'lucide-react';
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
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Keep state in sync if URL ?q= changes (e.g. header search)
  useEffect(() => {
    setSearchQuery(searchParams.get('q') || searchParams.get('search') || '');
  }, [searchParams]);

  const filteredProjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((p) => {
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
  }, [projects, searchQuery]);

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

  return (
    <div className="space-y-6">
      {/* Header - Soft Colored */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-950/40 dark:via-purple-950/30 dark:to-fuchsia-950/40 border border-violet-200/50 dark:border-violet-800/30 p-6 md:p-8">
        {/* Subtle Background Accents */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-violet-400/20 to-purple-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-fuchsia-400/15 to-violet-400/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25">
              <FolderGit2 size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">Project Saya</h1>
              <p className="text-violet-600/70 dark:text-violet-400/60">Kelola semua project capstone Anda</p>
            </div>
          </div>
          <Button
            as={Link}
            href="/mahasiswa/projects/new"
            color="primary"
            startContent={<Plus size={18} />}
          >
            Buat Project Baru
          </Button>
        </div>
      </div>

      {/* Search */}
      <Input
        placeholder="Cari project, semester, atau anggota tim..."
        startContent={<Search size={18} className="text-default-400" />}
        value={searchQuery}
        onValueChange={setSearchQuery}
        isClearable
        onClear={() => setSearchQuery('')}
        variant="bordered"
        size="md"
      />

      {/* Status Filter Chips */}
      <div className="flex flex-wrap gap-2">
        <Chip variant="flat" color="default">
          Semua ({statusCounts.all})
        </Chip>
        <Chip variant="flat" color="default">
          Draft ({statusCounts.DRAFT})
        </Chip>
        <Chip variant="flat" color="primary">
          Disubmit ({statusCounts.SUBMITTED})
        </Chip>
        <Chip variant="flat" color="secondary">
          Dalam Review ({statusCounts.IN_REVIEW})
        </Chip>
        <Chip variant="flat" color="success">
          Disetujui ({statusCounts.APPROVED})
        </Chip>
        <Chip variant="flat" color="danger">
          Ditolak ({statusCounts.REJECTED})
        </Chip>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <FolderGit2 size={64} className="mx-auto text-default-300 mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {projects.length === 0 ? 'Belum Ada Project' : 'Tidak Ada Hasil'}
            </h3>
            <p className="text-default-500 mb-6">
              {projects.length === 0
                ? 'Anda belum memiliki project capstone. Mulai dengan membuat project baru atau terima undangan dari ketua kelompok.'
                : 'Tidak ada project yang cocok dengan pencarian Anda.'}
            </p>
            {projects.length === 0 && (
              <Button
                as={Link}
                href="/mahasiswa/projects/new"
                color="primary"
                startContent={<Plus size={18} />}
              >
                Buat Project Pertama
              </Button>
            )}
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              isOwner={project.isOwner}
              ownerName={project.mahasiswa?.name}
              onDelete={project.isOwner && project.status === 'DRAFT' ? handleDeleteClick : undefined}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setProjectToDelete(null);
        }}
        classNames={{
          backdrop: 'bg-black/50 backdrop-blur-sm',
          base: 'border border-slate-200/60 dark:border-zinc-700/50',
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex items-center gap-3 border-b border-slate-200/60 dark:border-zinc-700/50">
                <div className="p-2 rounded-xl bg-danger-50 dark:bg-danger-900/30 text-danger">
                  <Trash2 size={20} />
                </div>
                <span className="font-semibold text-slate-800 dark:text-white">Hapus Project</span>
              </ModalHeader>
              <ModalBody className="py-5">
                {projectToDelete && (
                  <div className="space-y-4">
                    <p className="text-slate-600 dark:text-zinc-400">
                      Apakah Anda yakin ingin menghapus project:
                    </p>
                    <div className="p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-lg border border-slate-200/60 dark:border-zinc-700/50">
                      <p className="font-semibold text-slate-800 dark:text-white">{projectToDelete.title}</p>
                      <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
                        {projectToDelete.semester} - {projectToDelete.tahunAkademik}
                      </p>
                    </div>
                    <div className="p-3 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800/30 rounded-lg">
                      <p className="text-sm text-danger">
                        Tindakan ini akan menghapus semua data terkait termasuk dokumen yang sudah diupload. Tindakan ini tidak dapat dibatalkan.
                      </p>
                    </div>
                  </div>
                )}
              </ModalBody>
              <ModalFooter className="border-t border-slate-200/60 dark:border-zinc-700/50">
                <Button variant="flat" onPress={onClose} isDisabled={isDeleting}>
                  Batal
                </Button>
                <Button
                  color="danger"
                  onPress={handleDeleteProject}
                  isLoading={isDeleting}
                  startContent={!isDeleting && <Trash2 size={18} />}
                >
                  Hapus Project
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
