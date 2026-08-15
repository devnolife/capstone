'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ClipboardCheck,
  Clock,
  CheckCircle2,
  Search,
  Filter,
  Star,
  MessageSquare,
  FileText,
  ExternalLink,
  ChevronRight,
  Play,
  User,
  AlertCircle,
  FolderGit2,
} from 'lucide-react';
import { StatsCard } from '@/components/dashboard/stats-card';
import { formatDate } from '@/lib/utils';

interface ReviewScore {
  id: string;
  score: number;
  feedback: string | null;
  rubrik: {
    id: string;
    name: string;
    kategori: string;
    bobotMax: number;
  };
}

interface ReviewComment {
  id: string;
  content: string;
  filePath: string | null;
  lineStart: number | null;
  lineEnd: number | null;
  createdAt: Date;
}

interface Review {
  id: string;
  status: string;
  overallScore: number | null;
  overallComment: string | null;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
  project: {
    id: string;
    title: string;
    status: string;
    mahasiswa: {
      id: string;
      name: string;
      username: string;
    };
  };
  scores: ReviewScore[];
  comments: ReviewComment[];
}

interface PendingAssignment {
  id: string;
  assignedAt: Date;
  project: {
    id: string;
    title: string;
    status: string;
    mahasiswa: {
      id: string;
      name: string;
      username: string;
    };
    documents: { id: string }[];
    _count: {
      documents: number;
    };
  };
}

interface ReviewsContentProps {
  reviews: Review[];
  pendingAssignments: PendingAssignment[];
  stats: {
    totalReviews: number;
    completedReviews: number;
    inProgressReviews: number;
    pendingAssignments: number;
  };
}

const reviewStatusLabels: Record<string, string> = {
  PENDING: 'Menunggu',
  IN_PROGRESS: 'Sedang Direview',
  COMPLETED: 'Selesai',
};

const reviewStatusVariants: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  PENDING: 'outline',
  IN_PROGRESS: 'default',
  COMPLETED: 'secondary',
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

// Pending Assignment Card (Mobile)
function MobilePendingCard({ assignment }: { assignment: PendingAssignment }) {
  return (
    <motion.div variants={itemVariants}>
      <Card className="mb-3 border-l-4 border-l-warning">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="p-1.5 rounded-lg bg-warning/10 shrink-0">
                  <FolderGit2 className="text-warning" size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm truncate">{assignment.project.title}</p>
                  <p className="text-xs text-muted-foreground">{assignment.project.mahasiswa.name}</p>
                </div>
              </div>
              <Badge variant="outline" className="h-5 text-[10px] shrink-0">
                Belum Direview
              </Badge>
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>{assignment.project._count.documents} dokumen</span>
              <span>•</span>
              <span>Ditugaskan: {formatDate(assignment.assignedAt)}</span>
            </div>

            <Button
              render={<Link href={`/dosen/projects/${assignment.project.id}/review`} />}
              size="sm"
              className="w-full h-8"
            >
              <Play size={14} />
              Mulai Review
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Review Card (Mobile)
function MobileReviewCard({ review }: { review: Review }) {
  return (
    <motion.div variants={itemVariants}>
      <Card className="mb-3">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Avatar className="size-8 shrink-0">
                  <AvatarFallback className="text-xs">
                    {review.project.mahasiswa.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm truncate">{review.project.title}</p>
                  <p className="text-xs text-muted-foreground">{review.project.mahasiswa.name}</p>
                </div>
              </div>
              <Badge
                variant={reviewStatusVariants[review.status]}
                className="h-5 text-[10px] shrink-0"
              >
                {reviewStatusLabels[review.status]}
              </Badge>
            </div>

            {review.overallScore !== null && (
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted">
                <span className="text-sm text-foreground">Nilai</span>
                <div className="flex items-center gap-1">
                  <Star size={16} className="text-warning fill-warning" />
                  <span className="font-bold text-lg">{review.overallScore}</span>
                  <span className="text-muted-foreground">/100</span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>{review.scores.length} kriteria</span>
              <span>•</span>
              <span>{formatDate(review.updatedAt)}</span>
            </div>

            <div className="flex gap-2">
              <Button
                render={<Link href={`/dosen/projects/${review.project.id}/review`} />}
                size="sm"
                variant="secondary"
                className="flex-1 h-8"
              >
                {review.status === 'COMPLETED' ? 'Lihat Review' : 'Lanjutkan'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Desktop Pending Card
function DesktopPendingCard({ assignment }: { assignment: PendingAssignment }) {
  return (
    <Card className="border-l-4 border-l-warning">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-lg bg-warning/10">
              <FolderGit2 className="text-warning" size={24} />
            </div>
            <div>
              <p className="font-semibold">{assignment.project.title}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User size={14} />
                <span>{assignment.project.mahasiswa.name}</span>
                <span>•</span>
                <span>{assignment.project.mahasiswa.username}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right text-sm">
              <p className="text-muted-foreground">Dokumen</p>
              <p className="font-medium">{assignment.project._count.documents}</p>
            </div>
            <div className="text-right text-sm">
              <p className="text-muted-foreground">Ditugaskan</p>
              <p className="font-medium">{formatDate(assignment.assignedAt)}</p>
            </div>
            <Button
              render={<Link href={`/dosen/projects/${assignment.project.id}/review`} />}
            >
              <Play size={16} />
              Mulai Review
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Desktop Review Card
function DesktopReviewCard({ review }: { review: Review }) {
  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="size-10">
              <AvatarFallback>
                {review.project.mahasiswa.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{review.project.title}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{review.project.mahasiswa.name}</span>
                <span>•</span>
                <span>{review.project.mahasiswa.username}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            {review.overallScore !== null && (
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Nilai</p>
                <div className="flex items-center gap-1">
                  <Star size={16} className="text-warning fill-warning" />
                  <span className="font-bold text-lg">{review.overallScore}</span>
                </div>
              </div>
            )}
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Kriteria</p>
              <p className="font-bold text-lg">{review.scores.length}</p>
            </div>
            <Badge variant={reviewStatusVariants[review.status]}>
              {reviewStatusLabels[review.status]}
            </Badge>
            <Button
              render={<Link href={`/dosen/projects/${review.project.id}/review`} />}
              variant="secondary"
            >
              {review.status === 'COMPLETED' ? 'Lihat' : 'Lanjutkan'}
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DosenReviewsContent({ reviews, pendingAssignments, stats }: ReviewsContentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTab, setSelectedTab] = useState<string>('pending');

  // Filter reviews
  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.project.mahasiswa.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || review.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filter pending assignments
  const filteredPending = pendingAssignments.filter((assignment) => {
    return (
      assignment.project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.project.mahasiswa.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <motion.div
      className="space-y-5"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <header>
          <h1 className="text-2xl font-semibold text-foreground">Review</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Kelola review project mahasiswa
          </p>
        </header>
      </motion.div>

      {/* Stats */}
      <motion.div
        variants={itemVariants}
        className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:overflow-visible"
      >
        <div className="flex md:grid md:grid-cols-4 gap-3 md:gap-4 min-w-max md:min-w-0">
          <div className="w-[140px] md:w-auto shrink-0">
            <StatsCard
              title="Perlu Direview"
              value={stats.pendingAssignments}
              icon={AlertCircle}
              color="warning"
            />
          </div>
          <div className="w-[140px] md:w-auto shrink-0">
            <StatsCard
              title="Sedang Dikerjakan"
              value={stats.inProgressReviews}
              icon={Clock}
              color="primary"
            />
          </div>
          <div className="w-[140px] md:w-auto shrink-0">
            <StatsCard
              title="Selesai"
              value={stats.completedReviews}
              icon={CheckCircle2}
              color="success"
            />
          </div>
          <div className="w-[140px] md:w-auto shrink-0">
            <StatsCard
              title="Total Review"
              value={stats.totalReviews}
              icon={ClipboardCheck}
              color="secondary"
            />
          </div>
        </div>
      </motion.div>

      {/* Tabs & Filters */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex flex-col gap-4">
              <Tabs
                value={selectedTab}
                onValueChange={(value) => setSelectedTab(value as string)}
                aria-label="Review tabs"
              >
                <TabsList variant="line">
                  <TabsTrigger value="pending">
                    <AlertCircle size={16} />
                    <span>Perlu Direview</span>
                    {pendingAssignments.length > 0 && (
                      <Badge variant="outline">{pendingAssignments.length}</Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="reviews">
                    <ClipboardCheck size={16} />
                    <span>Riwayat Review</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative md:max-w-xs">
                  <Search
                    size={18}
                    className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    placeholder="Cari project atau mahasiswa..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                {selectedTab === 'reviews' && (
                  <Select
                    value={statusFilter}
                    onValueChange={(value) => setStatusFilter((value as string) || 'all')}
                  >
                    <SelectTrigger className="md:max-w-[180px]">
                      <Filter size={16} className="text-muted-foreground" />
                      <SelectValue placeholder="Semua Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Status</SelectItem>
                      <SelectItem value="IN_PROGRESS">Sedang Dikerjakan</SelectItem>
                      <SelectItem value="COMPLETED">Selesai</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Content */}
      <motion.div variants={itemVariants}>
        {selectedTab === 'pending' ? (
          // Pending Assignments
          filteredPending.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle2 size={48} className="mx-auto text-success mb-4" />
                <p className="text-muted-foreground mb-2">Tidak ada project yang perlu direview</p>
                <p className="text-sm text-muted-foreground">
                  Semua project yang ditugaskan sudah direview
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Mobile View */}
              <div className="md:hidden">
                <motion.div variants={containerVariants}>
                  {filteredPending.map((assignment) => (
                    <MobilePendingCard key={assignment.id} assignment={assignment} />
                  ))}
                </motion.div>
              </div>

              {/* Desktop View */}
              <div className="hidden md:block space-y-3">
                {filteredPending.map((assignment) => (
                  <DesktopPendingCard key={assignment.id} assignment={assignment} />
                ))}
              </div>
            </>
          )
        ) : (
          // Reviews History
          filteredReviews.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                {reviews.length === 0 ? (
                  <>
                    <ClipboardCheck size={48} className="mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground mb-2">Belum ada review</p>
                    <p className="text-sm text-muted-foreground">
                      Mulai review project yang ditugaskan kepada Anda
                    </p>
                  </>
                ) : (
                  <>
                    <Search size={48} className="mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">
                      Tidak ada review yang cocok dengan filter
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Mobile View */}
              <div className="md:hidden">
                <motion.div variants={containerVariants}>
                  {filteredReviews.map((review) => (
                    <MobileReviewCard key={review.id} review={review} />
                  ))}
                </motion.div>
              </div>

              {/* Desktop View */}
              <div className="hidden md:block">
                {filteredReviews.map((review) => (
                  <DesktopReviewCard key={review.id} review={review} />
                ))}
              </div>
            </>
          )
        )}
      </motion.div>
    </motion.div>
  );
}
