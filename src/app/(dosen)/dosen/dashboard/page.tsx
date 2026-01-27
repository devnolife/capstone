import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import {
  Card,
  CardBody,
  Button,
  Chip,
  Avatar,
} from '@heroui/react';
import {
  FolderGit2,
  Users,
  Clock,
  CheckCircle2,
  ChevronRight,
  Activity,
  ClipboardCheck,
  TrendingUp,
  Eye,
} from 'lucide-react';
import Link from 'next/link';
import { getStatusColor, getStatusLabel, formatDateTime, getSimakPhotoUrl } from '@/lib/utils';

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

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  const userName = session.user.name || 'Dosen';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{getGreeting()}, {userName}!</h1>
          <p className="text-default-500">
            {new Date().toLocaleDateString('id-ID', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
        <Button
          as={Link}
          href="/dosen/projects"
          color="primary"
          endContent={<ChevronRight size={16} />}
        >
          Lihat Semua Project
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border border-zinc-200 dark:border-zinc-800">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-500/20">
                <FolderGit2 size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalAssigned}</p>
                <p className="text-xs text-default-500">Total Project</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border border-zinc-200 dark:border-zinc-800">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-500/20">
                <Clock size={20} className="text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pendingReview}</p>
                <p className="text-xs text-default-500">Perlu Direview</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border border-zinc-200 dark:border-zinc-800">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-500/20">
                <CheckCircle2 size={20} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completedReview}</p>
                <p className="text-xs text-default-500">Selesai Review</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border border-zinc-200 dark:border-zinc-800">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-violet-100 dark:bg-violet-500/20">
                <Users size={20} className="text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalMahasiswa}</p>
                <p className="text-xs text-default-500">Mahasiswa</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left - Project List */}
        <div className="lg:col-span-2">
          <Card className="border border-zinc-200 dark:border-zinc-800">
            <CardBody className="p-0">
              <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FolderGit2 size={18} className="text-primary" />
                    <h3 className="font-semibold">Project Terbaru</h3>
                  </div>
                  <Button
                    as={Link}
                    href="/dosen/projects"
                    size="sm"
                    variant="light"
                    endContent={<ChevronRight size={14} />}
                  >
                    Lihat Semua
                  </Button>
                </div>
              </div>
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {recentProjects.length === 0 ? (
                  <div className="p-8 text-center">
                    <FolderGit2 size={40} className="mx-auto mb-3 text-default-300" />
                    <p className="text-sm text-default-500">Belum ada project yang ditugaskan</p>
                  </div>
                ) : (
                  recentProjects.map((project) => (
                    <div
                      key={project.id}
                      className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar
                            name={project.mahasiswa.name}
                            src={project.mahasiswa.profilePhoto || project.mahasiswa.image || getSimakPhotoUrl(project.mahasiswa.username)}
                            size="sm"
                          />
                          <div className="min-w-0">
                            <h4 className="font-medium text-sm truncate">{project.title}</h4>
                            <p className="text-xs text-default-500">
                              {project.mahasiswa.name} • {project.semester} {project.tahunAkademik}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Chip size="sm" color={getStatusColor(project.status)} variant="flat">
                            {getStatusLabel(project.status)}
                          </Chip>
                          <Button
                            as={Link}
                            href={`/dosen/projects/${project.id}`}
                            size="sm"
                            variant="light"
                            isIconOnly
                          >
                            <Eye size={16} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right - Activity */}
        <div>
          <Card className="border border-zinc-200 dark:border-zinc-800">
            <CardBody className="p-0">
              <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <Activity size={18} className="text-primary" />
                  <h3 className="font-semibold">Aktivitas Terbaru</h3>
                </div>
              </div>
              <div className="p-4 space-y-4">
                {recentActivities.length === 0 ? (
                  <div className="py-6 text-center">
                    <Activity size={32} className="mx-auto mb-2 text-default-300" />
                    <p className="text-sm text-default-500">Belum ada aktivitas</p>
                  </div>
                ) : (
                  recentActivities.map((activity, idx) => (
                    <div key={activity.id} className="flex gap-3">
                      <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <ClipboardCheck size={14} className="text-primary" />
                        </div>
                        {idx < recentActivities.length - 1 && (
                          <div className="absolute top-8 left-1/2 -translate-x-1/2 w-px h-6 bg-zinc-200 dark:bg-zinc-700" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 pb-4">
                        <p className="text-sm font-medium truncate">{activity.project.title}</p>
                        <p className="text-xs text-default-500">Review untuk {activity.project.mahasiswa.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Chip size="sm" color={getStatusColor(activity.status)} variant="flat">
                            {getStatusLabel(activity.status)}
                          </Chip>
                          <span className="text-xs text-default-400">
                            {formatDateTime(activity.updatedAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardBody>
          </Card>

          {/* Quick Actions */}
          <Card className="border border-zinc-200 dark:border-zinc-800 mt-4">
            <CardBody className="p-4">
              <h3 className="font-semibold text-sm mb-3">Aksi Cepat</h3>
              <div className="space-y-2">
                <Button
                  as={Link}
                  href="/dosen/reviews"
                  variant="flat"
                  className="w-full justify-start"
                  startContent={<ClipboardCheck size={16} />}
                >
                  Lihat Review Saya
                </Button>
                <Button
                  as={Link}
                  href="/dosen/auto-review"
                  variant="flat"
                  color="secondary"
                  className="w-full justify-start"
                  startContent={<TrendingUp size={16} />}
                >
                  Auto Review (AI)
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
