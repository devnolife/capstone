import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { DosenProjectsContent } from '@/components/dosen/dosen-projects-content';

export default async function DosenProjectsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.role !== 'DOSEN_PENGUJI' && session.user.role !== 'ADMIN') {
    redirect('/');
  }

  // Fetch assigned projects
  const assignedProjects = await prisma.projectAssignment.findMany({
    where: { dosenId: session.user.id },
    include: {
      project: {
        include: {
          mahasiswa: {
            select: {
              id: true,
              name: true,
              username: true,
              avatarUrl: true,
            },
          },
          documents: true,
          reviews: {
            where: { reviewerId: session.user.id },
          },
          _count: {
            select: {
              documents: true,
              reviews: true,
            },
          },
        },
      },
    },
    orderBy: { assignedAt: 'desc' },
  });

  const projects = assignedProjects.map((a) => a.project);

  return (
    <DosenProjectsContent 
      projects={projects} 
      currentUserId={session.user.id} 
    />
  );
}
