import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { ProjectCard } from '@/components/projects/project-card';
import {
  Button,
  Chip,
  Input,
  Select,
  SelectItem,
  Card,
  CardBody,
} from '@heroui/react';
import { Plus, Search, FolderGit2 } from 'lucide-react';
import Link from 'next/link';

export default async function MahasiswaProjectsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const projects = await prisma.project.findMany({
    where: { mahasiswaId: session.user.id },
    include: {
      documents: true,
      reviews: {
        include: {
          reviewer: true,
        },
      },
      _count: {
        select: {
          documents: true,
          reviews: true,
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  const statusCounts = {
    all: projects.length,
    DRAFT: projects.filter((p) => p.status === 'DRAFT').length,
    SUBMITTED: projects.filter((p) => p.status === 'SUBMITTED').length,
    IN_REVIEW: projects.filter((p) => p.status === 'IN_REVIEW').length,
    APPROVED: projects.filter((p) => p.status === 'APPROVED').length,
    REJECTED: projects.filter((p) => p.status === 'REJECTED').length,
  };

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
          href="/dashboard/mahasiswa/projects/new"
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
              href="/dashboard/mahasiswa/projects/new"
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
