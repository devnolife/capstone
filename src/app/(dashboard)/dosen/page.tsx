import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { StatsCard } from '@/components/dashboard/stats-card';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Avatar,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from '@heroui/react';
import {
  FolderGit2,
  ClipboardCheck,
  Clock,
  CheckCircle,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';

export default async function DosenDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.role !== 'DOSEN_PENGUJI' && session.user.role !== 'ADMIN') {
    redirect('/dashboard');
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
              email: true,
              nim: true,
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

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold">
          Selamat Datang, {session.user.name}!
        </h1>
        <p className="text-default-500">
          Kelola review project mahasiswa di sini
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Project Ditugaskan"
          value={totalAssigned}
          icon={FolderGit2}
          color="primary"
          description="Total project yang ditugaskan"
        />
        <StatsCard
          title="Menunggu Review"
          value={pendingReview}
          icon={Clock}
          color="warning"
          description="Project perlu direview"
        />
        <StatsCard
          title="Review Selesai"
          value={completedReview}
          icon={CheckCircle}
          color="success"
          description="Review yang sudah selesai"
        />
        <StatsCard
          title="Total Mahasiswa"
          value={totalMahasiswa}
          icon={Users}
          color="secondary"
          description="Mahasiswa yang dibimbing"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects Table */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Project yang Ditugaskan</h2>
              <Button
                as={Link}
                href="/dashboard/dosen/projects"
                variant="light"
                color="primary"
                size="sm"
              >
                Lihat Semua
              </Button>
            </CardHeader>
            <CardBody>
              {projects.length === 0 ? (
                <div className="text-center py-8">
                  <FolderGit2
                    size={48}
                    className="mx-auto text-default-300 mb-4"
                  />
                  <p className="text-default-500">
                    Belum ada project yang ditugaskan kepada Anda
                  </p>
                </div>
              ) : (
                <Table aria-label="Projects table" removeWrapper>
                  <TableHeader>
                    <TableColumn>MAHASISWA</TableColumn>
                    <TableColumn>PROJECT</TableColumn>
                    <TableColumn>STATUS</TableColumn>
                    <TableColumn>DOKUMEN</TableColumn>
                    <TableColumn>AKSI</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {projects.slice(0, 5).map((project) => (
                      <TableRow key={project.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar
                              name={project.mahasiswa.name}
                              src={project.mahasiswa.avatarUrl || undefined}
                              size="sm"
                            />
                            <div>
                              <p className="font-medium text-sm">
                                {project.mahasiswa.name}
                              </p>
                              <p className="text-xs text-default-500">
                                {project.mahasiswa.nim}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium truncate max-w-[200px]">
                            {project.title}
                          </p>
                          <p className="text-xs text-default-500">
                            {project.semester}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="sm"
                            color={getStatusColor(project.status)}
                            variant="flat"
                          >
                            {getStatusLabel(project.status)}
                          </Chip>
                        </TableCell>
                        <TableCell>{project._count.documents} file</TableCell>
                        <TableCell>
                          <Button
                            as={Link}
                            href={`/dashboard/dosen/projects/${project.id}`}
                            size="sm"
                            variant="flat"
                            color="primary"
                          >
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Activity Section */}
        <div>
          <RecentActivity activities={activities} />
        </div>
      </div>
    </div>
  );
}
