import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { MahasiswaDashboardContent } from '@/components/mahasiswa/dashboard-content';
import { MOCK_MAHASISWA } from '@/lib/mock-dashboard';

const DAY_LABELS = ['MIN', 'SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB'];

type ContentProps = Parameters<typeof MahasiswaDashboardContent>[0];
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
    user,
    totalProjects,
    submittedProjects,
    reviewedProjects,
    pendingReviews,
    totalDocuments,
    projects,
    notifications,
    upcomingPresentation,
    recentReviews,
  ] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { githubUsername: true, githubToken: true },
    }),
    prisma.project.count({ where: { mahasiswaId: userId } }),
    prisma.project.count({
      where: { mahasiswaId: userId, status: { not: 'DRAFT' } },
    }),
    prisma.project.count({
      where: { mahasiswaId: userId, status: { in: ['APPROVED', 'REJECTED'] } },
    }),
    prisma.project.count({
      where: { mahasiswaId: userId, status: { in: ['IN_REVIEW', 'SUBMITTED'] } },
    }),
    prisma.document.count({ where: { project: { mahasiswaId: userId } } }),
    prisma.project.findMany({
      where: { mahasiswaId: userId },
      include: {
        _count: { select: { documents: true, reviews: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    }),
    prisma.notification.findMany({
      where: { userId, createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true },
    }),
    prisma.presentationSchedule.findFirst({
      where: {
        project: { mahasiswaId: userId },
        presentationStatus: 'scheduled',
        scheduledDate: { gte: startOfToday },
      },
      orderBy: [{ scheduledDate: 'asc' }, { startTime: 'asc' }],
      include: {
        project: { select: { id: true, title: true } },
        scheduledBy: { select: { name: true } },
      },
    }),
    prisma.review.findMany({
      where: { project: { mahasiswaId: userId } },
      include: {
        reviewer: { select: { name: true } },
        project: { select: { id: true, title: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 4,
    }),
  ]);

  return {
    hasGitHubConnected: !!(user?.githubUsername && user?.githubToken),
    githubUsername: user?.githubUsername || null,
    stats: {
      totalProjects,
      submittedProjects,
      reviewedProjects,
      pendingReviews,
      totalDocuments,
    },
    projects: projects.map((p) => ({
      id: p.id,
      title: p.title,
      status: p.status,
      semester: p.semester,
      tahunAkademik: p.tahunAkademik,
      documents: p._count.documents,
      reviews: p._count.reviews,
    })),
    activity: buildDayBuckets(notifications.map((n) => n.createdAt)),
    upcomingPresentation: upcomingPresentation
      ? {
          projectTitle: upcomingPresentation.project.title,
          scheduledDate: upcomingPresentation.scheduledDate.toISOString(),
          startTime: upcomingPresentation.startTime,
          endTime: upcomingPresentation.endTime,
          location: upcomingPresentation.location,
          scheduledBy: upcomingPresentation.scheduledBy.name,
          notes: upcomingPresentation.notes,
        }
      : null,
    reviews: recentReviews.map((r) => ({
      id: r.id,
      status: r.status,
      overallComment: r.overallComment,
      updatedAt: r.updatedAt.toISOString(),
      reviewerName: r.reviewer.name,
      projectId: r.project.id,
      projectTitle: r.project.title,
      commentCount: r._count.comments,
    })),
  };
}

function getMockData(): DashboardData {
  return {
    hasGitHubConnected: MOCK_MAHASISWA.hasGitHubConnected,
    githubUsername: MOCK_MAHASISWA.githubUsername,
    stats: MOCK_MAHASISWA.stats,
    projects: MOCK_MAHASISWA.projects,
    activity: MOCK_MAHASISWA.activity(),
    upcomingPresentation: MOCK_MAHASISWA.upcomingPresentation,
    reviews: MOCK_MAHASISWA.reviews,
  };
}

export default async function MahasiswaDashboardPage() {
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
      console.error('[mahasiswa/dashboard] DB tidak tersedia, pakai data mock:', error);
      props = getMockData();
    }
  }

  return (
    <MahasiswaDashboardContent
      {...props}
      userName={session.user.name || 'Mahasiswa'}
    />
  );
}
