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
  Calendar,
  Shield,
  TrendingUp,
  Activity,
  BookOpen,
  Settings,
} from 'lucide-react';
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
  image: string | null;
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

// Get greeting based on time
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Selamat Pagi';
  if (hour < 15) return 'Selamat Siang';
  if (hour < 18) return 'Selamat Sore';
  return 'Selamat Malam';
}

// Mobile User Card Component
function MobileUserCard({ user }: { user: User }) {
  return (
    <motion.div variants={itemVariants}>
      <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar
              name={user.name}
              src={user.image || undefined}
              size="md"
              className="ring-2 ring-zinc-200 dark:ring-zinc-700"
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{user.name}</p>
              <p className="text-xs text-zinc-500 truncate">{user.username}</p>
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
                <span className="text-[10px] text-zinc-400">
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
      </div>
    </motion.div>
  );
}

// Mobile Project Card Component
function MobileProjectCard({ project }: { project: Project }) {
  return (
    <motion.div variants={itemVariants}>
      <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 mb-3">
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
                <span className="text-xs text-zinc-500 truncate">
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
          
          <div className="flex items-center justify-between text-xs text-zinc-400">
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
      </div>
    </motion.div>
  );
}

export function AdminDashboardContent({
  stats,
  recentUsers,
  recentProjects,
}: AdminDashboardProps) {
  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero Welcome Card */}
      <motion.div variants={itemVariants}>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500 via-pink-500 to-purple-600 p-6 md:p-8 text-white">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="admin-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#admin-grid)" />
            </svg>
          </div>
          
          {/* Decorative circles */}
          <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/10 blur-xl" />
          
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <p className="text-white/80 text-sm">{getGreeting()}</p>
                <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-white/70 text-sm mt-1">Kelola sistem capstone project</p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="flex gap-4 md:gap-6">
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold">{stats.totalUsers}</p>
                <p className="text-white/70 text-xs">Total User</p>
              </div>
              <div className="w-px bg-white/20" />
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold">{stats.totalProjects}</p>
                <p className="text-white/70 text-xs">Total Project</p>
              </div>
              <div className="w-px bg-white/20" />
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold">{stats.completedReviews}</p>
                <p className="text-white/70 text-xs">Review Selesai</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Total Users */}
          <div className="relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-zinc-500 mb-1">Total User</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
                <p className="text-xs text-zinc-400 mt-1">
                  {stats.totalMahasiswa} mhs, {stats.totalDosen} dsn
                </p>
              </div>
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                <Users size={20} />
              </div>
            </div>
          </div>

          {/* Total Projects */}
          <div className="relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-purple-500" />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-zinc-500 mb-1">Total Project</p>
                <p className="text-2xl font-bold">{stats.totalProjects}</p>
                <p className="text-xs text-zinc-400 mt-1">
                  {stats.submittedProjects} disubmit
                </p>
              </div>
              <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 text-white">
                <FolderGit2 size={20} />
              </div>
            </div>
          </div>

          {/* Mahasiswa */}
          <div className="relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-green-500" />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-zinc-500 mb-1">Mahasiswa</p>
                <p className="text-2xl font-bold">{stats.totalMahasiswa}</p>
                <p className="text-xs text-zinc-400 mt-1">Terdaftar</p>
              </div>
              <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 text-white">
                <GraduationCap size={20} />
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div className="relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-zinc-500 mb-1">Review</p>
                <p className="text-2xl font-bold">{stats.completedReviews}</p>
                <p className="text-xs text-zinc-400 mt-1">Selesai</p>
              </div>
              <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white">
                <ClipboardCheck size={20} />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions - Mobile */}
      <motion.div variants={itemVariants} className="md:hidden">
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4 shadow-sm">
          <h3 className="font-semibold text-sm mb-3">Aksi Cepat</h3>
          <div className="grid grid-cols-3 gap-2">
            <Button
              as={Link}
              href="/admin/users?action=add"
              variant="flat"
              className="h-auto py-3 flex-col gap-1"
            >
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                <UserPlus size={18} />
              </div>
              <span className="text-[10px]">User Baru</span>
            </Button>
            <Button
              as={Link}
              href="/admin/assignments"
              variant="flat"
              className="h-auto py-3 flex-col gap-1"
            >
              <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 text-white">
                <ClipboardCheck size={18} />
              </div>
              <span className="text-[10px]">Assign</span>
            </Button>
            <Button
              as={Link}
              href="/admin/rubrik"
              variant="flat"
              className="h-auto py-3 flex-col gap-1"
            >
              <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white">
                <BookOpen size={18} />
              </div>
              <span className="text-[10px]">Rubrik</span>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Users */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm overflow-hidden">
            <div className="flex justify-between items-center px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                  <Users size={16} />
                </div>
                <h2 className="font-semibold">User Terbaru</h2>
              </div>
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
            </div>
            <div className="p-4">
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
                              src={user.image || undefined}
                              size="sm"
                            />
                            <div>
                              <p className="font-medium text-sm">{user.name}</p>
                              <p className="text-xs text-zinc-500">
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
                        <TableCell className="text-zinc-500 text-sm">
                          {formatDate(user.createdAt)}
                        </TableCell>
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
            </div>
          </div>
        </motion.div>

        {/* Quick Actions - Desktop */}
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="hidden md:block rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-rose-500 to-pink-500 text-white">
                  <Activity size={16} />
                </div>
                <h3 className="font-semibold">Aksi Cepat</h3>
              </div>
            </div>
            <div className="p-4 space-y-2">
              <Button
                as={Link}
                href="/admin/users?action=add"
                className="w-full justify-start"
                variant="flat"
                startContent={
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                    <UserPlus size={14} />
                  </div>
                }
              >
                Tambah User Baru
              </Button>
              <Button
                as={Link}
                href="/admin/assignments"
                className="w-full justify-start"
                variant="flat"
                startContent={
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 text-white">
                    <ClipboardCheck size={14} />
                  </div>
                }
              >
                Assign Dosen ke Project
              </Button>
              <Button
                as={Link}
                href="/admin/rubrik"
                className="w-full justify-start"
                variant="flat"
                startContent={
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white">
                    <BookOpen size={14} />
                  </div>
                }
              >
                Kelola Rubrik Penilaian
              </Button>
              <Button
                as={Link}
                href="/admin/semesters"
                className="w-full justify-start"
                variant="flat"
                startContent={
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 text-white">
                    <Calendar size={14} />
                  </div>
                }
              >
                Kelola Semester
              </Button>
              <Button
                as={Link}
                href="/admin/settings"
                className="w-full justify-start"
                variant="flat"
                startContent={
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-zinc-500 to-zinc-600 text-white">
                    <Settings size={14} />
                  </div>
                }
              >
                Pengaturan Sistem
              </Button>
            </div>
          </div>

          {/* System Status */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 text-white">
                  <TrendingUp size={16} />
                </div>
                <h3 className="font-semibold">Status Sistem</h3>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm text-emerald-700 dark:text-emerald-400">Sistem Online</span>
                </div>
                <Chip size="sm" color="success" variant="flat">Active</Chip>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <span>Project Aktif</span>
                  <span className="font-medium">{stats.submittedProjects}</span>
                </div>
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <span>Review Pending</span>
                  <span className="font-medium">{stats.totalProjects - stats.completedReviews}</span>
                </div>
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <span>Dosen Terdaftar</span>
                  <span className="font-medium">{stats.totalDosen}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Projects */}
      <motion.div variants={itemVariants}>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm overflow-hidden">
          <div className="flex justify-between items-center px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 text-white">
                <FolderGit2 size={16} />
              </div>
              <h2 className="font-semibold">Project Terbaru</h2>
            </div>
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
          </div>
          <div className="p-4">
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
                        <div className="flex items-center gap-2">
                          <Avatar name={project.mahasiswa.name} size="sm" />
                          <div>
                            <p className="text-sm">{project.mahasiswa.name}</p>
                            <p className="text-xs text-zinc-500">
                              {project.mahasiswa.username}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip size="sm" variant="flat">{project.semester}</Chip>
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
                      <TableCell className="text-zinc-500 text-sm">
                        {formatDate(project.createdAt)}
                      </TableCell>
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
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
