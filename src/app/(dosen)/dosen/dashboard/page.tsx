import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { DosenDashboardContent } from '@/components/dosen/dashboard-content';

export default async function DosenDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const userId = session.user.id;

  // Fetch stats and data
  const [assignedProjects, reviews, recentProjects, recentActivities] = await Promise.all([
    // Total assigned projects
    prisma.projectAssignment.count({
      where: { dosenId: userId },
    }),
    // Review stats
    prisma.review.findMany({
      where: { reviewerId: userId },
      select: { status: true },
    }),
    // Recent projects assigned to this dosen
    prisma.project.findMany({
      where: {
        assignments: {
          some: { dosenId: userId },
        },
      },
      include: {
        mahasiswa: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            profilePhoto: true,
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
    }),
    // Recent reviews as activities
    prisma.review.findMany({
      where: { reviewerId: userId },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            mahasiswa: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    }),
  ]);

  // Calculate stats
  const pendingReview = reviews.filter((r) => r.status === 'PENDING' || r.status === 'IN_PROGRESS').length;
  const completedReview = reviews.filter((r) => r.status === 'COMPLETED').length;

  // Count unique mahasiswa from assigned projects
  const uniqueMahasiswa = await prisma.project.findMany({
    where: {
      assignments: {
        some: { dosenId: userId },
      },
    },
    select: { mahasiswaId: true },
    distinct: ['mahasiswaId'],
  });

  const stats = {
    totalAssigned: assignedProjects,
    pendingReview,
    completedReview,
    totalMahasiswa: uniqueMahasiswa.length,
  };

  const userName = session.user.name || 'Dosen';

  return (
    <DosenDashboardContent
      userName={userName}
      stats={stats}
      recentProjects={recentProjects}
      recentActivities={recentActivities}
    />
  );
}
