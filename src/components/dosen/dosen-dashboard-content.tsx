'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
} from '@heroui/react';
import {
  FolderGit2,
  Clock,
  CheckCircle,
  Users,
  ClipboardCheck,
  FileSearch,
  ChevronRight,
} from 'lucide-react';
import { StatsCard } from '@/components/dashboard/stats-card';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { ProjectsTable } from './projects-table';

interface Project {
  id: string;
  title: string;
  semester: string;
  status: string;
  mahasiswa: {
    name: string;
    username: string;
    image: string | null;
  };
  _count: {
    documents: number;
    reviews: number;
  };
}

interface Activity {
  id: string;
  type: 'review';
  title: string;
  description: string;
  user: {
    name: string;
    avatar?: string;
  };
  timestamp: Date;
  status: string;
}

interface DosenDashboardContentProps {
  userName: string;
  stats: {
    totalAssigned: number;
    pendingReview: number;
    completedReview: number;
    totalMahasiswa: number;
  };
  projects: Project[];
  activities: Activity[];
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

export function DosenDashboardContent({
  userName,
  stats,
  projects,
  activities,
}: DosenDashboardContentProps) {
  return (
    <motion.div
      className="space-y-4 md:space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Welcome Section */}
      <motion.div variants={itemVariants}>
        <h1 className="text-xl md:text-2xl font-bold">
          Selamat Datang, {userName}!
        </h1>
        <p className="text-sm md:text-base text-default-500">
          Kelola review project mahasiswa di sini
        </p>
      </motion.div>

      {/* Stats Grid - Scrollable on mobile */}
      <motion.div
        variants={itemVariants}
        className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:overflow-visible"
      >
        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 min-w-max md:min-w-0">
          <div className="w-[160px] md:w-auto shrink-0">
            <StatsCard
              title="Ditugaskan"
              value={stats.totalAssigned}
              icon={FolderGit2}
              color="primary"
              description="Total project"
            />
          </div>
          <div className="w-[160px] md:w-auto shrink-0">
            <StatsCard
              title="Menunggu"
              value={stats.pendingReview}
              icon={Clock}
              color="warning"
              description="Perlu direview"
            />
          </div>
          <div className="w-[160px] md:w-auto shrink-0">
            <StatsCard
              title="Selesai"
              value={stats.completedReview}
              icon={CheckCircle}
              color="success"
              description="Review selesai"
            />
          </div>
          <div className="w-[160px] md:w-auto shrink-0">
            <StatsCard
              title="Mahasiswa"
              value={stats.totalMahasiswa}
              icon={Users}
              color="secondary"
              description="Yang dibimbing"
            />
          </div>
        </div>
      </motion.div>

      {/* Quick Actions - Mobile Only */}
      <motion.div variants={itemVariants} className="md:hidden">
        <Card>
          <CardHeader className="pb-2">
            <h3 className="font-semibold text-sm">Aksi Cepat</h3>
          </CardHeader>
          <CardBody className="pt-0">
            <div className="grid grid-cols-3 gap-2">
              <Button
                as={Link}
                href="/dosen/projects"
                variant="flat"
                color="primary"
                className="h-auto py-3 flex-col gap-1"
              >
                <FolderGit2 size={20} />
                <span className="text-[10px]">Semua Project</span>
              </Button>
              <Button
                as={Link}
                href="/dosen/projects?status=pending"
                variant="flat"
                color="warning"
                className="h-auto py-3 flex-col gap-1"
              >
                <Clock size={20} />
                <span className="text-[10px]">Perlu Review</span>
              </Button>
              <Button
                as={Link}
                href="/dosen/projects?status=completed"
                variant="flat"
                color="success"
                className="h-auto py-3 flex-col gap-1"
              >
                <CheckCircle size={20} />
                <span className="text-[10px]">Selesai</span>
              </Button>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Projects Table */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <ProjectsTable projects={projects} />
        </motion.div>

        {/* Sidebar */}
        <motion.div variants={itemVariants} className="space-y-4 md:space-y-6">
          {/* Quick Actions - Desktop Only */}
          <Card className="hidden md:block">
            <CardHeader>
              <h3 className="font-semibold">Aksi Cepat</h3>
            </CardHeader>
            <CardBody className="space-y-2">
              <Button
                as={Link}
                href="/dosen/projects"
                className="w-full justify-start"
                variant="flat"
                startContent={<FolderGit2 size={18} />}
              >
                Lihat Semua Project
              </Button>
              <Button
                as={Link}
                href="/dosen/projects?status=pending"
                className="w-full justify-start"
                variant="flat"
                color="warning"
                startContent={<ClipboardCheck size={18} />}
              >
                Project Perlu Review
              </Button>
              <Button
                as={Link}
                href="/dosen/projects?status=completed"
                className="w-full justify-start"
                variant="flat"
                color="success"
                startContent={<FileSearch size={18} />}
              >
                Review Selesai
              </Button>
            </CardBody>
          </Card>

          {/* Recent Activity */}
          <RecentActivity activities={activities} />
        </motion.div>
      </div>
    </motion.div>
  );
}
