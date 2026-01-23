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
import { FolderGit2, FileText, ChevronRight, Calendar } from 'lucide-react';
import { getStatusColor, getStatusLabel } from '@/lib/utils';

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

interface ProjectsTableProps {
  projects: Project[];
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

// Mobile Project Card for Dosen
function MobileProjectCard({ project }: { project: Project }) {
  return (
    <motion.div variants={itemVariants}>
      <Card className="mb-3">
        <CardBody className="p-4">
          <div className="space-y-3">
            {/* Mahasiswa Info */}
            <div className="flex items-center gap-3">
              <Avatar
                name={project.mahasiswa.name}
                src={project.mahasiswa.image || undefined}
                size="sm"
                className="ring-2 ring-default-200"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {project.mahasiswa.name}
                </p>
                <p className="text-xs text-default-500">
                  {project.mahasiswa.username}
                </p>
              </div>
              <Chip
                size="sm"
                color={getStatusColor(project.status)}
                variant="flat"
                className="h-5 text-[10px] shrink-0"
              >
                {getStatusLabel(project.status)}
              </Chip>
            </div>

            {/* Project Info */}
            <div className="pl-11">
              <p className="font-semibold text-sm line-clamp-2">{project.title}</p>
              <div className="flex items-center gap-3 mt-1 text-xs text-default-500">
                <div className="flex items-center gap-1">
                  <Calendar size={10} />
                  <span>{project.semester}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FileText size={10} />
                  <span>{project._count.documents} dokumen</span>
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="pl-11">
              <Button
                as={Link}
                href={`/dosen/projects/${project.id}`}
                size="sm"
                variant="flat"
                color="primary"
                className="w-full h-8"
              >
                Review Project
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}

export function ProjectsTable({ projects }: ProjectsTableProps) {
  return (
    <Card>
      <CardHeader className="flex justify-between items-center px-4 py-3">
        <h2 className="text-base md:text-lg font-semibold">Project Ditugaskan</h2>
        <Button
          as={Link}
          href="/dosen/projects"
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
        {projects.length === 0 ? (
          <div className="text-center py-8">
            <FolderGit2
              size={48}
              className="mx-auto text-default-300 mb-4"
            />
            <p className="text-default-500 text-sm md:text-base">
              Belum ada project yang ditugaskan kepada Anda
            </p>
          </div>
        ) : (
          <>
            {/* Mobile View - Cards */}
            <div className="md:hidden">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {projects.slice(0, 5).map((project) => (
                  <MobileProjectCard key={project.id} project={project} />
                ))}
              </motion.div>
            </div>

            {/* Desktop View - Table */}
            <div className="hidden md:block">
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
                            src={project.mahasiswa.image || undefined}
                            size="sm"
                          />
                          <div>
                            <p className="font-medium text-sm">
                              {project.mahasiswa.name}
                            </p>
                            <p className="text-xs text-default-500">
                              {project.mahasiswa.username}
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
                          href={`/dosen/projects/${project.id}`}
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
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
}
