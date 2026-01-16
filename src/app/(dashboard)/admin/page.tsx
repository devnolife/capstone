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
  Users,
  FolderGit2,
  GraduationCap,
  ClipboardCheck,
  UserPlus,
} from 'lucide-react';
import Link from 'next/link';
import {
  formatDate,
  getStatusColor,
  getStatusLabel,
  getRoleLabel,
} from '@/lib/utils';

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard');
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
      email: true,
      role: true,
      avatarUrl: true,
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
          nim: true,
        },
      },
    },
  });

  const activities = recentProjects.map((project) => ({
    id: project.id,
    type: 'submission' as const,
    title: project.title,
    description: `oleh ${project.mahasiswa.name}`,
    user: {
      name: project.mahasiswa.name,
    },
    timestamp: project.createdAt,
    status: project.status,
  }));

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard Admin</h1>
        <p className="text-default-500">Kelola sistem capstone project</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total User"
          value={totalUsers}
          icon={Users}
          color="primary"
          description={`${totalMahasiswa} mahasiswa, ${totalDosen} dosen`}
        />
        <StatsCard
          title="Total Project"
          value={totalProjects}
          icon={FolderGit2}
          color="secondary"
          description={`${submittedProjects} sudah disubmit`}
        />
        <StatsCard
          title="Mahasiswa"
          value={totalMahasiswa}
          icon={GraduationCap}
          color="success"
          description="Total mahasiswa terdaftar"
        />
        <StatsCard
          title="Review Selesai"
          value={completedReviews}
          icon={ClipboardCheck}
          color="warning"
          description="Total review completed"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Users */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">User Terbaru</h2>
              <Button
                as={Link}
                href="/dashboard/admin/users"
                variant="light"
                color="primary"
                size="sm"
              >
                Lihat Semua
              </Button>
            </CardHeader>
            <CardBody>
              <Table aria-label="Recent users" removeWrapper>
                <TableHeader>
                  <TableColumn>USER</TableColumn>
                  <TableColumn>ROLE</TableColumn>
                  <TableColumn>TANGGAL DAFTAR</TableColumn>
                  <TableColumn>AKSI</TableColumn>
                </TableHeader>
                <TableBody>
                  {recentUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar
                            name={user.name}
                            src={user.avatarUrl || undefined}
                            size="sm"
                          />
                          <div>
                            <p className="font-medium text-sm">{user.name}</p>
                            <p className="text-xs text-default-500">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="sm"
                          color={
                            user.role === 'ADMIN'
                              ? 'danger'
                              : user.role === 'DOSEN_PENGUJI'
                                ? 'secondary'
                                : 'primary'
                          }
                          variant="flat"
                        >
                          {getRoleLabel(user.role)}
                        </Chip>
                      </TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell>
                        <Button
                          as={Link}
                          href={`/dashboard/admin/users?id=${user.id}`}
                          size="sm"
                          variant="flat"
                        >
                          Detail
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardBody>
          </Card>
        </div>

        {/* Activity & Quick Actions */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Aksi Cepat</h3>
            </CardHeader>
            <CardBody className="space-y-2">
              <Button
                as={Link}
                href="/dashboard/admin/users?action=add"
                className="w-full justify-start"
                variant="flat"
                startContent={<UserPlus size={18} />}
              >
                Tambah User Baru
              </Button>
              <Button
                as={Link}
                href="/dashboard/admin/assignments"
                className="w-full justify-start"
                variant="flat"
                startContent={<ClipboardCheck size={18} />}
              >
                Assign Dosen ke Project
              </Button>
              <Button
                as={Link}
                href="/dashboard/admin/rubrik"
                className="w-full justify-start"
                variant="flat"
                startContent={<GraduationCap size={18} />}
              >
                Kelola Rubrik Penilaian
              </Button>
            </CardBody>
          </Card>

          {/* Recent Activity */}
          <RecentActivity activities={activities} />
        </div>
      </div>

      {/* Recent Projects */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Project Terbaru</h2>
          <Button
            as={Link}
            href="/dashboard/admin/projects"
            variant="light"
            color="primary"
            size="sm"
          >
            Lihat Semua
          </Button>
        </CardHeader>
        <CardBody>
          <Table aria-label="Recent projects" removeWrapper>
            <TableHeader>
              <TableColumn>PROJECT</TableColumn>
              <TableColumn>MAHASISWA</TableColumn>
              <TableColumn>SEMESTER</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>TANGGAL</TableColumn>
              <TableColumn>AKSI</TableColumn>
            </TableHeader>
            <TableBody>
              {recentProjects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <p className="font-medium truncate max-w-[200px]">
                      {project.title}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{project.mahasiswa.name}</p>
                    <p className="text-xs text-default-500">
                      {project.mahasiswa.nim}
                    </p>
                  </TableCell>
                  <TableCell>{project.semester}</TableCell>
                  <TableCell>
                    <Chip
                      size="sm"
                      color={getStatusColor(project.status)}
                      variant="flat"
                    >
                      {getStatusLabel(project.status)}
                    </Chip>
                  </TableCell>
                  <TableCell>{formatDate(project.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        as={Link}
                        href={`/dashboard/admin/projects?id=${project.id}`}
                        size="sm"
                        variant="flat"
                      >
                        Detail
                      </Button>
                      <Button
                        as={Link}
                        href={`/dashboard/admin/assignments?projectId=${project.id}`}
                        size="sm"
                        color="primary"
                        variant="flat"
                      >
                        Assign
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
}
