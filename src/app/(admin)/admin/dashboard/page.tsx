import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { AdminDashboardContent } from '@/components/admin/dashboard-content';
import { MOCK_ADMIN } from '@/lib/mock-dashboard';

const DAY_LABELS = ['MIN', 'SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB'];

type ContentProps = Parameters<typeof AdminDashboardContent>[0];
type DashboardData = Omit<ContentProps, 'userName'>;

/** Bucket timestamps into the last 7 days (oldest → today). */
function buildDayBuckets(dates: Date[]): { label: string; value: number }[] {
  const buckets: { label: string; value: number; key: string }[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    buckets.push({
      label: DAY_LABELS[day.getDay()],
      value: 0,
      key: day.toDateString(),
    });
  }
  for (const date of dates) {
    const key = new Date(date).toDateString();
    const bucket = buckets.find((b) => b.key === key);
    if (bucket) bucket.value += 1;
  }
  return buckets.map(({ label, value }) => ({ label, value }));
}

async function getData(): Promise<DashboardData> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [
    totalUsers,
    totalMahasiswa,
    totalDosen,
    totalProjects,
    submittedProjects,
    completedReviews,
    recentUsers,
    recentProjects,
    weeklyProjects,
    upcomingPresentation,
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
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        createdAt: true,
      },
    }),
    prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        mahasiswa: {
          select: { name: true },
        },
      },
    }),
    prisma.project.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true },
    }),
    prisma.presentationSchedule.findFirst({
      where: {
        presentationStatus: 'scheduled',
        scheduledDate: { gte: startOfToday },
      },
      orderBy: [{ scheduledDate: 'asc' }, { startTime: 'asc' }],
      include: {
        project: {
          select: { title: true, mahasiswa: { select: { name: true } } },
        },
        scheduledBy: { select: { name: true } },
      },
    }),
  ]);

  return {
    stats: {
      totalUsers,
      totalMahasiswa,
      totalDosen,
      totalProjects,
      submittedProjects,
      completedReviews,
    },
    recentUsers: recentUsers.map((u) => ({
      id: u.id,
      name: u.name,
      username: u.username,
      role: u.role,
      createdAt: u.createdAt.toISOString(),
    })),
    recentProjects: recentProjects.map((p) => ({
      id: p.id,
      title: p.title,
      status: p.status,
      semester: p.semester,
      tahunAkademik: p.tahunAkademik,
      mahasiswaName: p.mahasiswa.name,
    })),
    activity: buildDayBuckets(weeklyProjects.map((p) => p.createdAt)),
    upcomingPresentation: upcomingPresentation
      ? {
          projectTitle: upcomingPresentation.project.title,
          mahasiswaName: upcomingPresentation.project.mahasiswa.name,
          scheduledDate: upcomingPresentation.scheduledDate.toISOString(),
          startTime: upcomingPresentation.startTime,
          endTime: upcomingPresentation.endTime,
          location: upcomingPresentation.location,
          scheduledBy: upcomingPresentation.scheduledBy.name,
        }
      : null,
  };
}

function getMockData(): DashboardData {
  return {
    stats: MOCK_ADMIN.stats,
    recentUsers: MOCK_ADMIN.recentUsers,
    recentProjects: MOCK_ADMIN.recentProjects,
    activity: MOCK_ADMIN.activity(),
    upcomingPresentation: MOCK_ADMIN.upcomingPresentation,
  };
}

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/');
  }

  let props: DashboardData;
  if (session.user.id.startsWith('dev-')) {
    // Sesi akun fake (dev) — langsung mock, tanpa menyentuh database
    props = getMockData();
  } else {
    try {
      props = await getData();
    } catch (error) {
      console.error('[admin/dashboard] DB tidak tersedia, pakai data mock:', error);
      props = getMockData();
    }
  }

  return (
    <AdminDashboardContent {...props} userName={session.user.name || 'Admin'} />
  );
}
