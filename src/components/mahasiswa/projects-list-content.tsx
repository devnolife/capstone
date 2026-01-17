'use client';

import Link from 'next/link';
import { Button, Chip, Card, CardBody } from '@heroui/react';
import { Plus, FolderGit2 } from 'lucide-react';
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
  documents?: { id: string }[];
  reviews?: { id: string }[];
  _count?: {
    documents: number;
    reviews: number;
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
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Project Saya</h1>
          <p className="text-default-500">Kelola semua project capstone Anda</p>
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
      {projects.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <FolderGit2 size={64} className="mx-auto text-default-300 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Belum Ada Project</h3>
            <p className="text-default-500 mb-6">
              Anda belum memiliki project capstone. Mulai dengan membuat project
              baru.
            </p>
            <Button
              as={Link}
              href="/mahasiswa/projects/new"
              color="primary"
              startContent={<Plus size={18} />}
            >
              Buat Project Pertama
            </Button>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
