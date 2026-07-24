import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { DosenDashboardContent } from '@/components/dosen/dashboard-content';
import { MOCK_DOSEN } from '@/lib/mock-dashboard';

const DAY_LABELS = ['MIN', 'SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB'];

type ContentProps = Parameters<typeof DosenDashboardContent>[0];
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

async function getData(userId: string): Promise<DashboardData> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [
    assignedProjects,
    reviews,
    recentProjects,
    recentActivities,
    uniqueMahasiswa,
    weeklyReviews,
    upcomingPresentation,
  ] = await Promise.all([
    prisma.projectAssignment.count({
      where: { dosenId: userId },
    }),
    prisma.review.findMany({
      where: { reviewerId: userId },
      select: { status: true },
    }),
    prisma.project.findMany({
      where: {
        assignments: {
          some: { dosenId: userId },
        },
      },
      include: {
        mahasiswa: {
          select: { name: true },
        },
        _count: {
          select: { documents: true, reviews: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    }),
    prisma.review.findMany({
      where: { reviewerId: userId },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            mahasiswa: { select: { name: true } },
          },
        },
        _count: { select: { comments: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 4,
    }),
    prisma.project.findMany({
      where: {
        assignments: {
          some: { dosenId: userId },
        },
      },
      select: { mahasiswaId: true },
      distinct: ['mahasiswaId'],
    }),
    prisma.review.findMany({
      where: { reviewerId: userId, updatedAt: { gte: sevenDaysAgo } },
      select: { updatedAt: true },
    }),
    prisma.presentationSchedule.findFirst({
      where: {
        project: { assignments: { some: { dosenId: userId } } },
        presentationStatus: 'scheduled',
        scheduledDate: { gte: startOfToday },
      },
      orderBy: [{ scheduledDate: 'asc' }, { startTime: 'asc' }],
      include: {
        project: {
          select: { title: true, mahasiswa: { select: { name: true } } },
        },
      },
    }),
  ]);

  const pendingReview = reviews.filter(
    (r) => r.status === 'PENDING' || r.status === 'IN_PROGRESS',
  ).length;
  const completedReview = reviews.filter((r) => r.status === 'COMPLETED').length;

  return {
    stats: {
      totalAssigned: assignedProjects,
      pendingReview,
      completedReview,
      totalMahasiswa: uniqueMahasiswa.length,
    },
    projects: recentProjects.map((p) => ({
      id: p.id,
      title: p.title,
      status: p.status,
      mahasiswaName: p.mahasiswa.name,
      semester: p.semester,
      tahunAkademik: p.tahunAkademik,
      documents: p._count.documents,
      reviews: p._count.reviews,
    })),
    activity: buildDayBuckets(weeklyReviews.map((r) => r.updatedAt)),
    upcomingPresentation: upcomingPresentation
      ? {
          projectTitle: upcomingPresentation.project.title,
          mahasiswaName: upcomingPresentation.project.mahasiswa.name,
          scheduledDate: upcomingPresentation.scheduledDate.toISOString(),
          startTime: upcomingPresentation.startTime,
          endTime: upcomingPresentation.endTime,
          location: upcomingPresentation.location,
        }
      : null,
    reviewFeed: recentActivities.map((r) => ({
      id: r.id,
      status: r.status,
      overallComment: r.overallComment,
      updatedAt: r.updatedAt.toISOString(),
      projectId: r.project.id,
      projectTitle: r.project.title,
      mahasiswaName: r.project.mahasiswa.name,
      commentCount: r._count.comments,
    })),
  };
}

function getMockData(): DashboardData {
  return {
    stats: MOCK_DOSEN.stats,
    projects: MOCK_DOSEN.projects,
    activity: MOCK_DOSEN.activity(),
    upcomingPresentation: MOCK_DOSEN.upcomingPresentation,
    reviewFeed: MOCK_DOSEN.reviewFeed,
  };
}

export default async function DosenDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  let props: DashboardData;
  if (session.user.id.startsWith('dev-')) {
    // Sesi akun fake (dev) — langsung mock, tanpa menyentuh database
    props = getMockData();
  } else {
    try {
      props = await getData(session.user.id);
    } catch (error) {
      console.error('[dosen/dashboard] DB tidak tersedia, pakai data mock:', error);
      props = getMockData();
    }
  }

  return (
    <DosenDashboardContent {...props} userName={session.user.name || 'Dosen'} />
  );
}
