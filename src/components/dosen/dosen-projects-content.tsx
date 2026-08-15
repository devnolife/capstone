'use client';

import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Search, FolderGit2, FileText, Calendar, ChevronRight, ClipboardCheck, Eye, Users } from 'lucide-react';
import { getStatusColor, getStatusLabel } from '@/lib/utils';
import { PageHeader } from '@/components/caret/PageHeader';

interface Review {
  id: string;
  status: string;
  reviewerId: string;
}

interface Project {
  id: string;
  title: string;
  semester: string;
  tahunAkademik: string;
  status: string;
  mahasiswa: {
    id: string;
    name: string;
    username: string;
    image: string | null;
  };
  reviews: Review[];
  _count: {
    documents: number;
    reviews: number;
  };
}

interface DosenProjectsContentProps {
  projects: Project[];
  currentUserId: string;
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

// Get progress based on status
const getProgress = (status: string) => {
  switch (status) {
    case 'DRAFT':
      return 15;
    case 'SUBMITTED':
      return 40;
    case 'IN_REVIEW':
      return 65;
    case 'REVISION_NEEDED':
      return 55;
    case 'APPROVED':
      return 100;
    case 'REJECTED':
      return 100;
    default:
      return 0;
  }
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

// Mobile Project Card for full list
function MobileProjectCard({
  project,
  currentUserId,
}: {
  project: Project;
  currentUserId: string;
}) {
  const myReview = project.reviews.find((r) => r.reviewerId === currentUserId);

  return (
    <motion.div variants={itemVariants}>
      <Card className="mb-3 border border-border bg-card shadow-none overflow-hidden">
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Mahasiswa Info */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-app-quinary border border-border">
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
                <p className="text-xs text-app-secondary-invert">
                  @{project.mahasiswa.username}
                </p>
              </div>
            </div>

            {/* Project Title with icon tile */}
            <div className="flex items-start gap-3">
              <span className="bg-app-primary text-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
                <FolderGit2 size={16} />
              </span>
              <Link
                href={`/dosen/projects/${project.id}`}
                className="font-semibold text-sm hover:text-primary transition-colors line-clamp-2 flex-1"
              >
                {project.title}
              </Link>
            </div>

            {/* Status Chips */}
            <div className="flex flex-wrap gap-2">
              <Badge variant={statusBadgeVariant(project.status)}>
                {getStatusLabel(project.status)}
              </Badge>
              {myReview ? (
                <Badge variant={statusBadgeVariant(myReview.status)}>
                  {getStatusLabel(myReview.status)}
                </Badge>
              ) : (
                <Badge variant="outline">
                  Belum Direview
                </Badge>
              )}
            </div>

            {/* Progress bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-app-teritary-invert">Progress</span>
                <span className="font-medium tabular-nums">{getProgress(project.status)}%</span>
              </div>
              <Progress value={getProgress(project.status)} />
            </div>

            {/* Info Row */}
            <div className="flex items-center gap-3 text-xs text-app-secondary-invert">
              <div className="flex items-center gap-1">
                <Calendar size={12} />
                <span>
                  {project.semester} {project.tahunAkademik}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <FileText size={12} />
                <span className="tabular-nums">{project._count.documents} dok</span>
              </div>
              <div className="flex items-center gap-1">
                <ClipboardCheck size={12} />
                <span className="tabular-nums">{project._count.reviews} review</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                render={<Link href={`/dosen/projects/${project.id}`} />}
                size="sm"
                variant="secondary"
                className="flex-1"
              >
                <Eye size={14} />
                Detail
              </Button>
              <Button
                render={<Link href={`/dosen/projects/${project.id}/review`} />}
                size="sm"
                className="flex-1"
              >
                <ClipboardCheck size={14} />
                Review
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function DosenProjectsContent({
  projects,
  currentUserId,
}: DosenProjectsContentProps) {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || searchParams.get('search') || '';
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Keep state in sync if URL ?q= changes (e.g. via header search)
  useEffect(() => {
    setSearchQuery(searchParams.get('q') || searchParams.get('search') || '');
  }, [searchParams]);

  const filteredProjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return projects.filter((p) => {
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      if (!q) return matchesStatus;
      const haystack = [
        p.title,
        p.mahasiswa?.name,
        p.mahasiswa?.username,
        p.semester,
        p.tahunAkademik,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return matchesStatus && haystack.includes(q);
    });
  }, [projects, searchQuery, statusFilter]);

  return (
    <motion.div
      className="w-full space-y-5 pb-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <PageHeader
          label="[01] PROJECT"
          labelRight="/ DITUGASKAN"
          title="Project Mahasiswa"
          description="Daftar project yang ditugaskan untuk Anda review"
          actions={
            <>
              <div className="rounded-full border border-border bg-app-quinary px-3 py-1.5">
                <span className="text-sm font-semibold tabular-nums">{projects.length}</span>
                <span className="text-xs text-app-teritary-invert ml-1.5">Total</span>
              </div>
              <div className="rounded-full border border-warning/40 bg-warning/10 px-3 py-1.5">
                <span className="text-sm font-semibold text-warning tabular-nums">
                  {projects.filter(p => p.status === 'SUBMITTED' || p.status === 'IN_REVIEW').length}
                </span>
                <span className="text-xs text-warning ml-1.5">Perlu Review</span>
              </div>
            </>
          }
        />
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Cari project atau mahasiswa..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              if (value) setStatusFilter(value as string);
            }}
          >
            <SelectTrigger aria-label="Filter status" className="w-full md:max-w-[200px]">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="SUBMITTED">Disubmit</SelectItem>
              <SelectItem value="IN_REVIEW">Dalam Review</SelectItem>
              <SelectItem value="APPROVED">Disetujui</SelectItem>
              <SelectItem value="REVISION_NEEDED">Perlu Revisi</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Projects List/Table */}
      <motion.div variants={itemVariants}>
        <Card className="border border-border bg-card overflow-hidden shadow-none">
          <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-app-teritary-invert">Project Ditugaskan</h2>
            <span className="text-xs text-app-teritary-invert tabular-nums">
              {filteredProjects.length} hasil
            </span>
          </div>

          <CardContent className="p-0">
            {filteredProjects.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-app-quaternary flex items-center justify-center">
                  <FolderGit2 size={36} className="text-app-teritary-invert" />
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  {projects.length === 0 ? 'Belum Ada Project' : 'Tidak Ada Hasil'}
                </h3>
                <p className="text-app-secondary-invert text-sm max-w-sm mx-auto">
                  {projects.length === 0
                    ? 'Belum ada project yang ditugaskan kepada Anda'
                    : 'Tidak ada project yang cocok dengan pencarian atau filter Anda'}
                </p>
              </div>
            ) : (
              <>
                {/* Mobile View - Cards */}
                <div className="md:hidden p-4">
                  <motion.div variants={containerVariants}>
                    {filteredProjects.map((project) => (
                      <MobileProjectCard
                        key={project.id}
                        project={project}
                        currentUserId={currentUserId}
                      />
                    ))}
                  </motion.div>
                </div>

                {/* Desktop View - Table */}
                <div className="hidden md:block p-4">
                  <Table aria-label="Projects table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>MAHASISWA</TableHead>
                        <TableHead>PROJECT</TableHead>
                        <TableHead>SEMESTER</TableHead>
                        <TableHead>STATUS</TableHead>
                        <TableHead>PROGRESS</TableHead>
                        <TableHead>REVIEW STATUS</TableHead>
                        <TableHead>AKSI</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProjects.map((project) => {
                        const myReview = project.reviews.find(
                          (r) => r.reviewerId === currentUserId,
                        );

                        return (
                          <TableRow key={project.id} className="hover:bg-app-quinary">
                            <TableCell>
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
                                <div>
                                  <p className="font-medium text-sm">
                                    {project.mahasiswa.name}
                                  </p>
                                  <p className="text-xs text-app-secondary-invert">
                                    @{project.mahasiswa.username}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Link
                                href={`/dosen/projects/${project.id}`}
                                className="font-medium hover:text-primary transition-colors"
                              >
                                {project.title}
                              </Link>
                              <p className="text-xs text-app-secondary-invert tabular-nums">
                                {project._count.documents} dokumen • {project._count.reviews} review
                              </p>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm font-medium">{project.semester}</p>
                              <p className="text-xs text-app-secondary-invert">
                                {project.tahunAkademik}
                              </p>
                            </TableCell>
                            <TableCell>
                              <Badge variant={statusBadgeVariant(project.status)}>
                                {getStatusLabel(project.status)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="w-24">
                                <Progress value={getProgress(project.status)} />
                                <p className="text-xs text-app-secondary-invert mt-1 tabular-nums">
                                  {getProgress(project.status)}%
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              {myReview ? (
                                <Badge variant={statusBadgeVariant(myReview.status)}>
                                  {getStatusLabel(myReview.status)}
                                </Badge>
                              ) : (
                                <Badge variant="outline">
                                  Belum Direview
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  render={<Link href={`/dosen/projects/${project.id}`} />}
                                  size="sm"
                                  variant="secondary"
                                >
                                  <Eye size={14} />
                                  Detail
                                </Button>
                                <Button
                                  render={<Link href={`/dosen/projects/${project.id}/review`} />}
                                  size="sm"
                                >
                                  <ClipboardCheck size={14} />
                                  Review
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
