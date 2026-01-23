import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { MahasiswaDashboardContent } from '@/components/mahasiswa/dashboard-content';

export default async function MahasiswaDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // Fetch user's projects
  const projects = await prisma.project.findMany({
    where: { mahasiswaId: session.user.id },
    include: {
      documents: true,
      reviews: {
        include: {
          reviewer: true,
        },
      },
      members: {
        orderBy: {
          role: 'asc', // leader first
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
    take: 5,
  });

  // Calculate stats
  const totalProjects = projects.length;
  const submittedProjects = projects.filter((p) => p.status !== 'DRAFT').length;
  const reviewedProjects = projects.filter(
    (p) => p.status === 'APPROVED' || p.status === 'REJECTED',
  ).length;
  const pendingReviews = projects.filter(
    (p) => p.status === 'IN_REVIEW' || p.status === 'SUBMITTED',
  ).length;

  // Get total documents
  const totalDocuments = projects.reduce(
    (acc, p) => acc + p._count.documents,
    0,
  );

  return (
    <MahasiswaDashboardContent
      userName={session.user.name || 'User'}
      userImage={session.user.image || undefined}
      projects={projects}
      stats={{
        totalProjects,
        submittedProjects,
        reviewedProjects,
        pendingReviews,
        totalDocuments,
      }}
    />
  );
}
