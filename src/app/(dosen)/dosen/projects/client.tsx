'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { motion } from 'framer-motion';
import {
  FolderGit2,
  Search,
  Filter,
  Calendar,
  Clock,
  Eye,
  PlayCircle,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  Github,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { getSimakPhotoUrl } from '@/lib/utils';
import { PageHeader } from '@/components/caret/PageHeader';

interface Project {
  id: string;
  title: string;
  description: string | null;
  status: string;
  semester: string;
  tahunAkademik: string;
  githubRepoUrl: string | null;
  submittedAt: string | null;
  mahasiswa: {
    id: string;
    name: string;
    username: string;
    image: string | null;
    profilePhoto: string | null;
  };
  _count: {
    documents: number;
    reviews: number;
  };
  hasMyReview: boolean;
  myReviewStatus: string | null;
  isAssigned: boolean;
}

interface DosenProjectsClientProps {
  projects: Project[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
};

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'APPROVED':
      return 'secondary' as const;
    case 'IN_REVIEW':
      return 'outline' as const;
    case 'REVISION_NEEDED':
      return 'outline' as const;
    case 'SUBMITTED':
      return 'default' as const;
    case 'REJECTED':
      return 'destructive' as const;
    default:
      return 'outline' as const;
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'APPROVED':
      return 'Disetujui';
    case 'IN_REVIEW':
      return 'Sedang Direview';
    case 'REVISION_NEEDED':
      return 'Perlu Revisi';
    case 'SUBMITTED':
      return 'Menunggu Review';
    case 'REJECTED':
      return 'Ditolak';
    case 'DRAFT':
      return 'Draft';
    default:
      return status;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'APPROVED':
      return CheckCircle2;
    case 'IN_REVIEW':
      return Clock;
    case 'REVISION_NEEDED':
      return AlertTriangle;
    case 'SUBMITTED':
      return FileText;
    case 'REJECTED':
      return XCircle;
    default:
      return FileText;
  }
};

export function DosenProjectsClient({ projects }: DosenProjectsClientProps) {
  return (
    <Suspense fallback={null}>
      <DosenProjectsClientInner projects={projects} />
    </Suspense>
  );
}

function DosenProjectsClientInner({ projects }: DosenProjectsClientProps) {
  const urlParams = useSearchParams();
  const initialQuery = urlParams.get('q') || urlParams.get('search') || '';
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [statusFilter, setStatusFilter] = useState('all');

  // Sync when URL query changes
  useEffect(() => {
    const q = urlParams.get('q') || urlParams.get('search') || '';
    setSearchQuery(q);
  }, [urlParams]);

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.mahasiswa.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.mahasiswa.username.includes(searchQuery);

    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const stats = {
    total: projects.length,
    submitted: projects.filter((p) => p.status === 'SUBMITTED').length,
    inReview: projects.filter((p) => p.status === 'IN_REVIEW').length,
    approved: projects.filter((p) => p.status === 'APPROVED').length,
    revision: projects.filter((p) => p.status === 'REVISION_NEEDED').length,
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <PageHeader
          label="[01] PROJECT"
          labelRight="/ DITUGASKAN"
          title="Project Mahasiswa"
          description="Lihat dan review project capstone mahasiswa"
        />
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Card className="border border-border bg-card shadow-none">
            <CardContent className="p-4 text-center">
              <FolderGit2 size={20} className="mx-auto mb-2 text-app-secondary-invert" />
              <p className="text-2xl font-bold tabular-nums">{stats.total}</p>
              <p className="text-app-teritary-invert font-mono text-[10px] uppercase tracking-[0.18em]">Total</p>
            </CardContent>
          </Card>
          <Card className="border border-border bg-card shadow-none">
            <CardContent className="p-4 text-center">
              <FileText size={20} className="mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-primary tabular-nums">{stats.submitted}</p>
              <p className="text-app-teritary-invert font-mono text-[10px] uppercase tracking-[0.18em]">Menunggu</p>
            </CardContent>
          </Card>
          <Card className="border border-border bg-card shadow-none">
            <CardContent className="p-4 text-center">
              <Clock size={20} className="mx-auto mb-2 text-warning" />
              <p className="text-2xl font-bold text-warning tabular-nums">{stats.inReview}</p>
              <p className="text-app-teritary-invert font-mono text-[10px] uppercase tracking-[0.18em]">Direview</p>
            </CardContent>
          </Card>
          <Card className="border border-border bg-card shadow-none">
            <CardContent className="p-4 text-center">
              <AlertTriangle size={20} className="mx-auto mb-2 text-warning" />
              <p className="text-2xl font-bold text-warning tabular-nums">{stats.revision}</p>
              <p className="text-app-teritary-invert font-mono text-[10px] uppercase tracking-[0.18em]">Revisi</p>
            </CardContent>
          </Card>
          <Card className="border border-border bg-card shadow-none">
            <CardContent className="p-4 text-center">
              <CheckCircle2 size={20} className="mx-auto mb-2 text-success" />
              <p className="text-2xl font-bold text-success tabular-nums">{stats.approved}</p>
              <p className="text-app-teritary-invert font-mono text-[10px] uppercase tracking-[0.18em]">Disetujui</p>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <Card className="border border-border bg-card shadow-none">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  placeholder="Cari project atau mahasiswa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as string)}>
                <SelectTrigger className="min-w-[180px]">
                  <Filter size={16} className="text-muted-foreground" />
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="SUBMITTED">Menunggu Review</SelectItem>
                  <SelectItem value="IN_REVIEW">Sedang Direview</SelectItem>
                  <SelectItem value="REVISION_NEEDED">Perlu Revisi</SelectItem>
                  <SelectItem value="APPROVED">Disetujui</SelectItem>
                  <SelectItem value="REJECTED">Ditolak</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Project List */}
      <motion.div variants={itemVariants} className="space-y-3">
        {filteredProjects.length === 0 ? (
          <Card className="border border-border bg-card shadow-none">
            <CardContent className="p-8 text-center">
              <FolderGit2 size={48} className="mx-auto mb-4 text-app-teritary-invert" />
              <p className="font-semibold">Tidak ada project ditemukan</p>
              <p className="text-sm text-app-secondary-invert mt-1">
                {projects.length === 0
                  ? 'Belum ada project yang disubmit mahasiswa'
                  : 'Coba ubah filter atau kata kunci pencarian'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredProjects.map((project) => {
            const StatusIcon = getStatusIcon(project.status);
            const avatarSrc = project.mahasiswa.profilePhoto || project.mahasiswa.image || getSimakPhotoUrl(project.mahasiswa.username);

            return (
              <motion.div key={project.id} variants={itemVariants}>
                <Card className="border border-border bg-card shadow-none hover:border-primary/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Left - Project Info */}
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <Avatar className="size-12 shrink-0">
                          <AvatarImage src={avatarSrc} alt={project.mahasiswa.name} />
                          <AvatarFallback>
                            {project.mahasiswa.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-semibold text-base truncate">
                              {project.title}
                            </h3>
                            <Badge variant={getStatusVariant(project.status)}>
                              <StatusIcon size={12} />
                              {getStatusLabel(project.status)}
                            </Badge>
                            {project.isAssigned && (
                              <Badge variant="secondary">
                                Ditugaskan
                              </Badge>
                            )}
                          </div>
                          {project.description && (
                            <p className="text-sm text-app-secondary-invert line-clamp-1 mb-2">
                              {project.description}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-3 text-xs text-app-teritary-invert">
                            <span className="flex items-center gap-1">
                              <Users size={12} />
                              {project.mahasiswa.name} ({project.mahasiswa.username})
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              {project.semester} {project.tahunAkademik}
                            </span>
                            <span className="flex items-center gap-1 tabular-nums">
                              <FileText size={12} />
                              {project._count.documents} dokumen
                            </span>
                            {project.githubRepoUrl && (
                              <a
                                href={project.githubRepoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 hover:text-primary transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Github size={12} />
                                Repository
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right - Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          render={<Link href={`/dosen/projects/${project.id}`} />}
                          size="sm"
                          variant="secondary"
                        >
                          <Eye size={14} />
                          Detail
                        </Button>
                        {!project.hasMyReview && ['SUBMITTED', 'IN_REVIEW'].includes(project.status) && (
                          <Button
                            render={<Link href={`/dosen/projects/${project.id}/review`} />}
                            size="sm"
                          >
                            <PlayCircle size={14} />
                            Review
                          </Button>
                        )}
                        {project.hasMyReview && project.myReviewStatus === 'IN_PROGRESS' && (
                          <Button
                            render={<Link href={`/dosen/projects/${project.id}/review`} />}
                            size="sm"
                            variant="outline"
                          >
                            <PlayCircle size={14} />
                            Lanjutkan
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </motion.div>
    </motion.div>
  );
}
