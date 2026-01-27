import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { ProjectsListContent } from '@/components/mahasiswa/projects-list-content';

export default async function MahasiswaProjectsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // Fetch projects where user is owner OR team member
  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { mahasiswaId: session.user.id },
        {
          members: {
            some: { userId: session.user.id },
          },
        },
      ],
    },
    include: {
      mahasiswa: {
        select: {
          id: true,
          name: true,
          username: true,
          nim: true,
          image: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              nim: true,
              image: true,
            },
          },
        },
      },
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
          members: true,
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  // Add isOwner flag to each project
  const projectsWithOwnership = projects.map((project) => ({
    ...project,
    isOwner: project.mahasiswaId === session.user.id,
  }));

  const statusCounts = {
    all: projects.length,
    DRAFT: projects.filter((p) => p.status === 'DRAFT').length,
    SUBMITTED: projects.filter((p) => p.status === 'SUBMITTED').length,
    IN_REVIEW: projects.filter((p) => p.status === 'IN_REVIEW').length,
    APPROVED: projects.filter((p) => p.status === 'APPROVED').length,
    REJECTED: projects.filter((p) => p.status === 'REJECTED').length,
  };

  return <ProjectsListContent projects={projectsWithOwnership} statusCounts={statusCounts} />;
}
