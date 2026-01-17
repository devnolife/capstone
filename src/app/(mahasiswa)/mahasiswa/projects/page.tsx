import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { ProjectsListContent } from '@/components/mahasiswa/projects-list-content';

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

  return <ProjectsListContent projects={projects} statusCounts={statusCounts} />;
}
