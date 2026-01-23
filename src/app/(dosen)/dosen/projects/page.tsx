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

  // Fetch all submitted projects (dosen can see all projects that need review)
  const projects = await prisma.project.findMany({
    where: {
      status: {
        in: ['SUBMITTED', 'IN_REVIEW', 'APPROVED', 'REVISION_NEEDED'],
      },
    },
    include: {
      mahasiswa: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
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
    orderBy: { submittedAt: 'desc' },
  });

  return (
    <DosenProjectsContent 
      projects={projects} 
      currentUserId={session.user.id} 
    />
  );
}
