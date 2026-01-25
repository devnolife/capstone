'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Input,
  Select,
  SelectItem,
  Progress,
  Avatar,
  Tabs,
  Tab,
  Divider,
} from '@heroui/react';
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
  lineNumber: number | null;
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

const reviewStatusColors: Record<string, 'warning' | 'primary' | 'success'> = {
  PENDING: 'warning',
  IN_PROGRESS: 'primary',
  COMPLETED: 'success',
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
        <CardBody className="p-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="p-1.5 rounded-lg bg-warning/10 shrink-0">
                  <FolderGit2 className="text-warning" size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm truncate">{assignment.project.title}</p>
                  <p className="text-xs text-default-500">{assignment.project.mahasiswa.name}</p>
                </div>
              </div>
              <Chip size="sm" color="warning" variant="flat" className="h-5 text-[10px] shrink-0">
                Belum Direview
              </Chip>
            </div>

            <div className="flex items-center gap-3 text-xs text-default-500">
              <span>{assignment.project._count.documents} dokumen</span>
              <span>•</span>
              <span>Ditugaskan: {formatDate(assignment.assignedAt)}</span>
            </div>

            <Button
              as={Link}
              href={`/dosen/projects/${assignment.project.id}/review`}
              size="sm"
              color="primary"
              className="w-full h-8"
              startContent={<Play size={14} />}
            >
              Mulai Review
            </Button>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}

// Review Card (Mobile)
function MobileReviewCard({ review }: { review: Review }) {
  return (
    <motion.div variants={itemVariants}>
      <Card className="mb-3">
        <CardBody className="p-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Avatar
                  name={review.project.mahasiswa.name}
                  size="sm"
                  className="shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm truncate">{review.project.title}</p>
                  <p className="text-xs text-default-500">{review.project.mahasiswa.name}</p>
                </div>
              </div>
              <Chip
                size="sm"
                color={reviewStatusColors[review.status]}
                variant="flat"
                className="h-5 text-[10px] shrink-0"
              >
                {reviewStatusLabels[review.status]}
              </Chip>
            </div>

            {review.overallScore !== null && (
              <div className="flex items-center justify-between p-2 rounded-lg bg-default-100">
                <span className="text-sm text-default-600">Nilai</span>
                <div className="flex items-center gap-1">
                  <Star size={16} className="text-warning fill-warning" />
                  <span className="font-bold text-lg">{review.overallScore}</span>
                  <span className="text-default-400">/100</span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 text-xs text-default-500">
              <span>{review.scores.length} kriteria</span>
              <span>•</span>
              <span>{formatDate(review.updatedAt)}</span>
            </div>

            <div className="flex gap-2">
              <Button
                as={Link}
                href={`/dosen/projects/${review.project.id}/review`}
                size="sm"
                variant="flat"
                color="primary"
                className="flex-1 h-8"
              >
                {review.status === 'COMPLETED' ? 'Lihat Review' : 'Lanjutkan'}
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}

// Desktop Pending Card
function DesktopPendingCard({ assignment }: { assignment: PendingAssignment }) {
  return (
    <Card className="border-l-4 border-l-warning">
      <CardBody className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-lg bg-warning/10">
              <FolderGit2 className="text-warning" size={24} />
            </div>
              <div>
              <p className="font-semibold">{assignment.project.title}</p>
              <div className="flex items-center gap-2 text-sm text-default-500">
                <User size={14} />
                <span>{assignment.project.mahasiswa.name}</span>
                <span>•</span>
                <span>{assignment.project.mahasiswa.username}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right text-sm">
              <p className="text-default-500">Dokumen</p>
              <p className="font-medium">{assignment.project._count.documents}</p>
            </div>
            <div className="text-right text-sm">
              <p className="text-default-500">Ditugaskan</p>
              <p className="font-medium">{formatDate(assignment.assignedAt)}</p>
            </div>
            <Button
              as={Link}
              href={`/dosen/projects/${assignment.project.id}/review`}
              color="primary"
              startContent={<Play size={16} />}
            >
              Mulai Review
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

// Desktop Review Card
function DesktopReviewCard({ review }: { review: Review }) {
  return (
    <Card className="mb-4">
      <CardBody className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar name={review.project.mahasiswa.name} size="md" />
            <div>
              <p className="font-semibold">{review.project.title}</p>
              <div className="flex items-center gap-2 text-sm text-default-500">
                <span>{review.project.mahasiswa.name}</span>
                <span>•</span>
                <span>{review.project.mahasiswa.username}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            {review.overallScore !== null && (
              <div className="text-center">
                <p className="text-xs text-default-500">Nilai</p>
                <div className="flex items-center gap-1">
                  <Star size={16} className="text-warning fill-warning" />
                  <span className="font-bold text-lg">{review.overallScore}</span>
                </div>
              </div>
            )}
            <div className="text-center">
              <p className="text-xs text-default-500">Kriteria</p>
              <p className="font-bold text-lg">{review.scores.length}</p>
            </div>
            <Chip
              size="sm"
              color={reviewStatusColors[review.status]}
              variant="flat"
            >
              {reviewStatusLabels[review.status]}
            </Chip>
            <Button
              as={Link}
              href={`/dosen/projects/${review.project.id}/review`}
              variant="flat"
              color="primary"
              endContent={<ChevronRight size={16} />}
            >
              {review.status === 'COMPLETED' ? 'Lihat' : 'Lanjutkan'}
            </Button>
          </div>
        </div>
      </CardBody>
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
      className="space-y-4 md:space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header - Soft Colored */}
      <motion.div variants={itemVariants}>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-50 via-cyan-50 to-sky-50 dark:from-teal-950/40 dark:via-cyan-950/30 dark:to-sky-950/40 border border-teal-200/50 dark:border-teal-800/30 p-6 md:p-8">
          {/* Subtle Background Accents */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-teal-400/20 to-cyan-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-sky-400/15 to-teal-400/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
          
          <div className="relative flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-lg shadow-teal-500/25">
              <ClipboardCheck size={28} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-zinc-800 dark:text-zinc-100">Review</h1>
              <p className="text-sm md:text-base text-teal-600/70 dark:text-teal-400/60">
                Kelola review project mahasiswa
              </p>
            </div>
          </div>
        </div>
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
          <CardBody className="p-3 md:p-4">
            <div className="flex flex-col gap-4">
              <Tabs
                selectedKey={selectedTab}
                onSelectionChange={(key) => setSelectedTab(key as string)}
                aria-label="Review tabs"
                color="primary"
                variant="underlined"
              >
                <Tab
                  key="pending"
                  title={
                    <div className="flex items-center gap-2">
                      <AlertCircle size={16} />
                      <span>Perlu Direview</span>
                      {pendingAssignments.length > 0 && (
                        <Chip size="sm" color="warning" variant="flat">
                          {pendingAssignments.length}
                        </Chip>
                      )}
                    </div>
                  }
                />
                <Tab
                  key="reviews"
                  title={
                    <div className="flex items-center gap-2">
                      <ClipboardCheck size={16} />
                      <span>Riwayat Review</span>
                    </div>
                  }
                />
              </Tabs>

              <div className="flex flex-col md:flex-row gap-3">
                <Input
                  placeholder="Cari project atau mahasiswa..."
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                  startContent={<Search size={18} className="text-default-400" />}
                  className="md:max-w-xs"
                  size="sm"
                />
                {selectedTab === 'reviews' && (
                  <Select
                    placeholder="Semua Status"
                    selectedKeys={statusFilter ? [statusFilter] : []}
                    onSelectionChange={(keys) => setStatusFilter(Array.from(keys)[0] as string || 'all')}
                    className="md:max-w-[180px]"
                    size="sm"
                    startContent={<Filter size={16} className="text-default-400" />}
                    items={[
                      { key: 'all', label: 'Semua Status' },
                      { key: 'IN_PROGRESS', label: 'Sedang Dikerjakan' },
                      { key: 'COMPLETED', label: 'Selesai' },
                    ]}
                  >
                    {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
                  </Select>
                )}
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Content */}
      <motion.div variants={itemVariants}>
        {selectedTab === 'pending' ? (
          // Pending Assignments
          filteredPending.length === 0 ? (
            <Card>
              <CardBody className="py-12 text-center">
                <CheckCircle2 size={48} className="mx-auto text-success mb-4" />
                <p className="text-default-500 mb-2">Tidak ada project yang perlu direview</p>
                <p className="text-sm text-default-400">
                  Semua project yang ditugaskan sudah direview
                </p>
              </CardBody>
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
              <CardBody className="py-12 text-center">
                {reviews.length === 0 ? (
                  <>
                    <ClipboardCheck size={48} className="mx-auto text-default-300 mb-4" />
                    <p className="text-default-500 mb-2">Belum ada review</p>
                    <p className="text-sm text-default-400">
                      Mulai review project yang ditugaskan kepada Anda
                    </p>
                  </>
                ) : (
                  <>
                    <Search size={48} className="mx-auto text-default-300 mb-4" />
                    <p className="text-default-500">
                      Tidak ada review yang cocok dengan filter
                    </p>
                  </>
                )}
              </CardBody>
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
