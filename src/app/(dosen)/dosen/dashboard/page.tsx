import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { DosenDashboardContent } from '@/components/dosen/dosen-dashboard-content';

export default async function DosenDashboardPage() {
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

  // Calculate stats
  const totalAssigned = projects.length;
  const pendingReview = projects.filter(
    (p) => p.status === 'SUBMITTED' || p.status === 'IN_REVIEW',
  ).length;
  const completedReview = projects.filter((p) =>
    p.reviews.some(
      (r) => r.reviewerId === session.user.id && r.status === 'COMPLETED',
    ),
  ).length;
  const totalMahasiswa = new Set(projects.map((p) => p.mahasiswaId)).size;

  // Get recent reviews by this dosen
  const recentReviews = await prisma.review.findMany({
    where: { reviewerId: session.user.id },
    include: {
      project: {
        include: {
          mahasiswa: {
            select: { name: true, avatarUrl: true },
          },
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
    take: 5,
  });

  const activities = recentReviews.map((review) => ({
    id: review.id,
    type: 'review' as const,
    title: review.project.title,
    description: `Review untuk ${review.project.mahasiswa.name}`,
    user: {
      name: session.user.name || 'User',
      avatar: session.user.image || undefined,
    },
    timestamp: review.updatedAt,
    status: review.status,
  }));

  // Format projects for the table
  const formattedProjects = projects.map((p) => ({
    id: p.id,
    title: p.title,
    semester: p.semester,
    status: p.status,
    mahasiswa: {
      name: p.mahasiswa.name,
      username: p.mahasiswa.username,
      avatarUrl: p.mahasiswa.avatarUrl,
    },
    _count: p._count,
  }));

  return (
    <DosenDashboardContent
      userName={session.user.name || 'Dosen'}
      stats={{
        totalAssigned,
        pendingReview,
        completedReview,
        totalMahasiswa,
      }}
      projects={formattedProjects}
      activities={activities}
    />
  );
}
