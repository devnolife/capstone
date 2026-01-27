import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { AdminDashboardContent } from '@/components/admin/dashboard-content';

export default async function AdminDashboardPage() {
  const session = await auth();

  // Debug logging
  console.log('[ADMIN DASHBOARD] Session:', session ? 'exists' : 'null', 'User:', session?.user?.username, 'Role:', session?.user?.role);

  if (!session?.user) {
    console.log('[ADMIN DASHBOARD] No session, redirecting to login');
    redirect('/login');
  }

  if (session.user.role !== 'ADMIN') {
    console.log('[ADMIN DASHBOARD] Not admin role, redirecting to /');
    redirect('/');
  }

  // Fetch stats
  const [
    totalUsers,
    totalMahasiswa,
    totalDosen,
    totalProjects,
    submittedProjects,
    completedReviews,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'MAHASISWA' } }),
    prisma.user.count({ where: { role: 'DOSEN_PENGUJI' } }),
    prisma.project.count(),
    prisma.project.count({
      where: { status: { not: 'DRAFT' } },
    }),
    prisma.review.count({
      where: { status: 'COMPLETED' },
    }),
  ]);

  // Fetch recent users
  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
      image: true,
      createdAt: true,
    },
  });

  // Fetch recent projects
  const recentProjects = await prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      mahasiswa: {
        select: {
          name: true,
          username: true,
        },
      },
    },
  });

  return (
    <AdminDashboardContent
      stats={{
        totalUsers,
        totalMahasiswa,
        totalDosen,
        totalProjects,
        submittedProjects,
        completedReviews,
      }}
      recentUsers={recentUsers}
      recentProjects={recentProjects}
    />
  );
}
