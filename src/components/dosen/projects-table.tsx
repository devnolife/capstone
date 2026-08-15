'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardAction } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@/components/ui/table';
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

/** Pemetaan warna status (HeroUI legacy) ke varian Badge shadcn. */
function statusBadgeVariant(
  status: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (getStatusColor(status)) {
    case 'danger':
      return 'destructive';
    case 'success':
    case 'secondary':
      return 'secondary';
    case 'primary':
      return 'default';
    default:
      return 'outline';
  }
}

// Mobile Project Card for Dosen
function MobileProjectCard({ project }: { project: Project }) {
  return (
    <motion.div variants={itemVariants}>
      <Card className="mb-3">
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Mahasiswa Info */}
            <div className="flex items-center gap-3">
              <Avatar className="size-8 ring-2 ring-border">
                <AvatarImage
                  src={project.mahasiswa.image || undefined}
                  alt={project.mahasiswa.name}
                />
                <AvatarFallback className="text-xs">
                  {project.mahasiswa.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {project.mahasiswa.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {project.mahasiswa.username}
                </p>
              </div>
              <Badge
                variant={statusBadgeVariant(project.status)}
                className="h-5 text-[10px] shrink-0"
              >
                {getStatusLabel(project.status)}
              </Badge>
            </div>

            {/* Project Info */}
            <div className="pl-11">
              <p className="font-semibold text-sm line-clamp-2">{project.title}</p>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
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
                render={<Link href={`/dosen/projects/${project.id}`} />}
                size="sm"
                className="w-full h-8"
              >
                Review Project
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function ProjectsTable({ projects }: ProjectsTableProps) {
  return (
    <Card>
      <CardHeader className="px-4 py-3">
        <CardTitle className="text-base md:text-lg">Project Ditugaskan</CardTitle>
        <CardAction>
          <Button
            render={<Link href="/dosen/projects" />}
            variant="ghost"
            size="sm"
          >
            <span className="hidden sm:inline">Lihat Semua</span>
            <span className="sm:hidden">Semua</span>
            <ChevronRight size={16} />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="pt-0">
        {projects.length === 0 ? (
          <div className="text-center py-8">
            <FolderGit2
              size={48}
              className="mx-auto text-muted-foreground/50 mb-4"
            />
            <p className="text-muted-foreground text-sm md:text-base">
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
              <Table aria-label="Projects table">
                <TableHeader>
                  <TableRow>
                    <TableHead>MAHASISWA</TableHead>
                    <TableHead>PROJECT</TableHead>
                    <TableHead>STATUS</TableHead>
                    <TableHead>DOKUMEN</TableHead>
                    <TableHead>AKSI</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.slice(0, 5).map((project) => (
                    <TableRow key={project.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8">
                            <AvatarImage
                              src={project.mahasiswa.image || undefined}
                              alt={project.mahasiswa.name}
                            />
                            <AvatarFallback className="text-xs">
                              {project.mahasiswa.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">
                              {project.mahasiswa.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {project.mahasiswa.username}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium truncate max-w-[200px]">
                          {project.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {project.semester}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusBadgeVariant(project.status)}>
                          {getStatusLabel(project.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>{project._count.documents} file</TableCell>
                      <TableCell>
                        <Button
                          render={<Link href={`/dosen/projects/${project.id}`} />}
                          size="sm"
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
      </CardContent>
    </Card>
  );
}
