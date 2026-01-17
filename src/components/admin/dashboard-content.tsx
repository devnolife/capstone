'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
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
  ChevronRight,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import { StatsCard } from '@/components/dashboard/stats-card';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import {
  formatDate,
  getStatusColor,
  getStatusLabel,
  getRoleLabel,
} from '@/lib/utils';

interface User {
  id: string;
  name: string;
  username: string;
  role: string;
  avatarUrl: string | null;
  createdAt: Date;
}

interface Project {
  id: string;
  title: string;
  semester: string;
  status: string;
  createdAt: Date;
  mahasiswa: {
    name: string;
    username: string;
  };
}

interface AdminDashboardProps {
  stats: {
    totalUsers: number;
    totalMahasiswa: number;
    totalDosen: number;
    totalProjects: number;
    submittedProjects: number;
    completedReviews: number;
  };
  recentUsers: User[];
  recentProjects: Project[];
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

// Mobile User Card Component
function MobileUserCard({ user }: { user: User }) {
  return (
    <motion.div variants={itemVariants}>
      <Card className="mb-3">
        <CardBody className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar
                name={user.name}
                src={user.avatarUrl || undefined}
                size="md"
                className="ring-2 ring-default-200"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{user.name}</p>
                <p className="text-xs text-default-500 truncate">{user.username}</p>
                <div className="flex items-center gap-2 mt-1">
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
                    className="h-5 text-[10px]"
                  >
                    {getRoleLabel(user.role)}
                  </Chip>
                  <span className="text-[10px] text-default-400">
                    {formatDate(user.createdAt)}
                  </span>
                </div>
              </div>
            </div>
            <Button
              as={Link}
              href={`/admin/users?id=${user.id}`}
              isIconOnly
              size="sm"
              variant="light"
            >
              <ChevronRight size={18} />
            </Button>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}

// Mobile Project Card Component
function MobileProjectCard({ project }: { project: Project }) {
  return (
    <motion.div variants={itemVariants}>
      <Card className="mb-3">
        <CardBody className="p-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0 pr-2">
                <p className="font-semibold text-sm line-clamp-2">{project.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Avatar
                    name={project.mahasiswa.name}
                    size="sm"
                    className="w-5 h-5"
                  />
                  <span className="text-xs text-default-500 truncate">
                    {project.mahasiswa.name}
                  </span>
                </div>
              </div>
              <Chip
                size="sm"
                color={getStatusColor(project.status)}
                variant="flat"
                className="h-6 text-[10px] shrink-0"
              >
                {getStatusLabel(project.status)}
              </Chip>
            </div>
            
            <div className="flex items-center justify-between text-xs text-default-400">
              <div className="flex items-center gap-1">
                <Calendar size={12} />
                <span>{project.semester}</span>
              </div>
              <span>{formatDate(project.createdAt)}</span>
            </div>

            <div className="flex gap-2">
              <Button
                as={Link}
                href={`/admin/projects?id=${project.id}`}
                size="sm"
                variant="flat"
                className="flex-1 h-8"
              >
                Detail
              </Button>
              <Button
                as={Link}
                href={`/admin/assignments?projectId=${project.id}`}
                size="sm"
                color="primary"
                variant="flat"
                className="flex-1 h-8"
              >
                Assign
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}

export function AdminDashboardContent({
  stats,
  recentUsers,
  recentProjects,
}: AdminDashboardProps) {
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
    <motion.div 
      className="space-y-4 md:space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Welcome Section */}
      <motion.div variants={itemVariants}>
        <h1 className="text-xl md:text-2xl font-bold">Dashboard Admin</h1>
        <p className="text-sm md:text-base text-default-500">Kelola sistem capstone project</p>
      </motion.div>

      {/* Stats Grid - Scrollable on mobile */}
      <motion.div 
        variants={itemVariants}
        className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:overflow-visible"
      >
        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 min-w-max md:min-w-0">
          <div className="w-[160px] md:w-auto shrink-0">
            <StatsCard
              title="Total User"
              value={stats.totalUsers}
              icon={Users}
              color="primary"
              description={`${stats.totalMahasiswa} mhs, ${stats.totalDosen} dsn`}
            />
          </div>
          <div className="w-[160px] md:w-auto shrink-0">
            <StatsCard
              title="Total Project"
              value={stats.totalProjects}
              icon={FolderGit2}
              color="secondary"
              description={`${stats.submittedProjects} disubmit`}
            />
          </div>
          <div className="w-[160px] md:w-auto shrink-0">
            <StatsCard
              title="Mahasiswa"
              value={stats.totalMahasiswa}
              icon={GraduationCap}
              color="success"
              description="Terdaftar"
            />
          </div>
          <div className="w-[160px] md:w-auto shrink-0">
            <StatsCard
              title="Review"
              value={stats.completedReviews}
              icon={ClipboardCheck}
              color="warning"
              description="Selesai"
            />
          </div>
        </div>
      </motion.div>

      {/* Quick Actions - Mobile Grid */}
      <motion.div variants={itemVariants} className="md:hidden">
        <Card>
          <CardHeader className="pb-2">
            <h3 className="font-semibold text-sm">Aksi Cepat</h3>
          </CardHeader>
          <CardBody className="pt-0">
            <div className="grid grid-cols-3 gap-2">
              <Button
                as={Link}
                href="/admin/users?action=add"
                variant="flat"
                className="h-auto py-3 flex-col gap-1"
              >
                <UserPlus size={20} />
                <span className="text-[10px]">User Baru</span>
              </Button>
              <Button
                as={Link}
                href="/admin/assignments"
                variant="flat"
                color="primary"
                className="h-auto py-3 flex-col gap-1"
              >
                <ClipboardCheck size={20} />
                <span className="text-[10px]">Assign</span>
              </Button>
              <Button
                as={Link}
                href="/admin/rubrik"
                variant="flat"
                color="secondary"
                className="h-auto py-3 flex-col gap-1"
              >
                <GraduationCap size={20} />
                <span className="text-[10px]">Rubrik</span>
              </Button>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Recent Users */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card>
            <CardHeader className="flex justify-between items-center px-4 py-3">
              <h2 className="text-base md:text-lg font-semibold">User Terbaru</h2>
              <Button
                as={Link}
                href="/admin/users"
                variant="light"
                color="primary"
                size="sm"
                endContent={<ChevronRight size={16} />}
              >
                <span className="hidden sm:inline">Lihat Semua</span>
                <span className="sm:hidden">Semua</span>
              </Button>
            </CardHeader>
            <CardBody className="pt-0">
              {/* Mobile View - Cards */}
              <div className="md:hidden">
                <motion.div variants={containerVariants}>
                  {recentUsers.map((user) => (
                    <MobileUserCard key={user.id} user={user} />
                  ))}
                </motion.div>
              </div>

              {/* Desktop View - Table */}
              <div className="hidden md:block">
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
                                {user.username}
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
                            href={`/admin/users?id=${user.id}`}
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
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Activity & Quick Actions (Desktop) */}
        <motion.div variants={itemVariants} className="space-y-4 md:space-y-6">
          {/* Quick Actions - Desktop Only */}
          <Card className="hidden md:block">
            <CardHeader>
              <h3 className="font-semibold">Aksi Cepat</h3>
            </CardHeader>
            <CardBody className="space-y-2">
              <Button
                as={Link}
                href="/admin/users?action=add"
                className="w-full justify-start"
                variant="flat"
                startContent={<UserPlus size={18} />}
              >
                Tambah User Baru
              </Button>
              <Button
                as={Link}
                href="/admin/assignments"
                className="w-full justify-start"
                variant="flat"
                startContent={<ClipboardCheck size={18} />}
              >
                Assign Dosen ke Project
              </Button>
              <Button
                as={Link}
                href="/admin/rubrik"
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
        </motion.div>
      </div>

      {/* Recent Projects */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="flex justify-between items-center px-4 py-3">
            <h2 className="text-base md:text-lg font-semibold">Project Terbaru</h2>
            <Button
              as={Link}
              href="/admin/projects"
              variant="light"
              color="primary"
              size="sm"
              endContent={<ChevronRight size={16} />}
            >
              <span className="hidden sm:inline">Lihat Semua</span>
              <span className="sm:hidden">Semua</span>
            </Button>
          </CardHeader>
          <CardBody className="pt-0">
            {/* Mobile View - Cards */}
            <div className="md:hidden">
              <motion.div variants={containerVariants}>
                {recentProjects.map((project) => (
                  <MobileProjectCard key={project.id} project={project} />
                ))}
              </motion.div>
            </div>

            {/* Desktop View - Table */}
            <div className="hidden md:block">
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
                          {project.mahasiswa.username}
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
                            href={`/admin/projects?id=${project.id}`}
                            size="sm"
                            variant="flat"
                          >
                            Detail
                          </Button>
                          <Button
                            as={Link}
                            href={`/admin/assignments?projectId=${project.id}`}
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
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </motion.div>
  );
}
