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
  Accordion,
  AccordionItem,
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
  User,
  AlertCircle,
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
  };
  reviewer: {
    id: string;
    name: string;
    username: string;
  };
  scores: ReviewScore[];
  comments: ReviewComment[];
}

interface ReviewsContentProps {
  reviews: Review[];
  stats: {
    totalReviews: number;
    completedReviews: number;
    pendingReviews: number;
    averageScore: number | null;
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

function getScoreColor(score: number, max: number): 'success' | 'warning' | 'danger' {
  const percentage = (score / max) * 100;
  if (percentage >= 70) return 'success';
  if (percentage >= 50) return 'warning';
  return 'danger';
}

// Mobile Review Card
function MobileReviewCard({ review }: { review: Review }) {
  return (
    <motion.div variants={itemVariants}>
      <Card className="mb-3">
        <CardBody className="p-4">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Avatar
                  name={review.reviewer.name}
                  size="sm"
                  className="shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm">{review.reviewer.name}</p>
                  <p className="text-xs text-default-500 truncate">{review.project.title}</p>
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

            {/* Score */}
            {review.overallScore !== null && (
              <div className="flex items-center justify-between p-2 rounded-lg bg-default-100">
                <span className="text-sm text-default-600">Nilai Keseluruhan</span>
                <div className="flex items-center gap-1">
                  <Star size={16} className="text-warning fill-warning" />
                  <span className="font-bold text-lg">{review.overallScore}</span>
                  <span className="text-default-400">/100</span>
                </div>
              </div>
            )}

            {/* Comment Preview */}
            {review.overallComment && (
              <div className="p-2 rounded-lg bg-default-50 border border-default-200">
                <p className="text-xs text-default-500 mb-1 flex items-center gap-1">
                  <MessageSquare size={12} />
                  Komentar
                </p>
                <p className="text-sm line-clamp-2">{review.overallComment}</p>
              </div>
            )}

            {/* Meta */}
            <div className="flex items-center gap-3 text-xs text-default-500">
              <span>{review.scores.length} kriteria dinilai</span>
              <span>•</span>
              <span>{formatDate(review.updatedAt)}</span>
            </div>

            {/* Actions */}
            <Button
              as={Link}
              href={`/mahasiswa/projects/${review.project.id}`}
              size="sm"
              variant="flat"
              color="primary"
              className="w-full h-8"
              endContent={<ChevronRight size={14} />}
            >
              Lihat Detail Project
            </Button>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}

// Desktop Review Card with expandable scores
function DesktopReviewCard({ review }: { review: Review }) {
  return (
    <Card className="mb-4">
      <CardBody className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar
                name={review.reviewer.name}
                size="md"
              />
              <div>
                <p className="font-semibold">{review.reviewer.name}</p>
                <p className="text-sm text-default-500">{review.reviewer.username}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Chip
                size="sm"
                color={reviewStatusColors[review.status]}
                variant="flat"
              >
                {reviewStatusLabels[review.status]}
              </Chip>
              {review.overallScore !== null && (
                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-warning/10">
                  <Star size={16} className="text-warning fill-warning" />
                  <span className="font-bold">{review.overallScore}</span>
                  <span className="text-default-400 text-sm">/100</span>
                </div>
              )}
            </div>
          </div>

          {/* Project Link */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-default-50">
            <FileText size={18} className="text-default-400" />
            <span className="text-sm text-default-600">Project:</span>
            <Link
              href={`/mahasiswa/projects/${review.project.id}`}
              className="text-primary hover:underline flex items-center gap-1 font-medium"
            >
              {review.project.title}
              <ExternalLink size={14} />
            </Link>
          </div>

          {/* Overall Comment */}
          {review.overallComment && (
            <div className="p-4 rounded-lg bg-default-50 border border-default-200">
              <p className="text-sm text-default-500 mb-2 flex items-center gap-1">
                <MessageSquare size={14} />
                Komentar Keseluruhan
              </p>
              <p className="text-default-700">{review.overallComment}</p>
            </div>
          )}

          {/* Scores Accordion */}
          {review.scores.length > 0 && (
            <Accordion variant="bordered">
              <AccordionItem
                key="scores"
                aria-label="Lihat Nilai per Kriteria"
                title={
                  <span className="text-sm font-medium">
                    Lihat Nilai per Kriteria ({review.scores.length})
                  </span>
                }
              >
                <div className="space-y-3 pb-2">
                  {review.scores.map((score) => (
                    <div key={score.id} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-default-600">{score.rubrik.name}</span>
                        <span className="font-medium">
                          {score.score}/{score.rubrik.bobotMax}
                        </span>
                      </div>
                      <Progress
                        value={(score.score / score.rubrik.bobotMax) * 100}
                        color={getScoreColor(score.score, score.rubrik.bobotMax)}
                        size="sm"
                        className="h-2"
                      />
                      {score.feedback && (
                        <p className="text-xs text-default-500 mt-1">{score.feedback}</p>
                      )}
                    </div>
                  ))}
                </div>
              </AccordionItem>
            </Accordion>
          )}

          {/* Comments Preview */}
          {review.comments.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-default-500 flex items-center gap-1">
                <MessageSquare size={14} />
                Komentar Code ({review.comments.length})
              </p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {review.comments.slice(0, 3).map((comment) => (
                  <div key={comment.id} className="p-2 rounded bg-default-50 text-sm">
                    {comment.filePath && (
                      <p className="text-xs text-default-400 font-mono mb-1">
                        {comment.filePath}
                        {comment.lineNumber && `:${comment.lineNumber}`}
                      </p>
                    )}
                    <p className="text-default-700">{comment.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timestamp */}
          <p className="text-xs text-default-400">
            {review.status === 'COMPLETED' && review.completedAt
              ? `Selesai pada: ${formatDate(review.completedAt)}`
              : `Diperbarui: ${formatDate(review.updatedAt)}`}
          </p>
        </div>
      </CardBody>
    </Card>
  );
}

export function MahasiswaReviewsContent({ reviews, stats }: ReviewsContentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filter reviews
  const filteredReviews = reviews.filter((review) => {
    const matchesSearch = 
      review.project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.reviewer.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || review.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <motion.div
      className="space-y-4 md:space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-xl md:text-2xl font-bold">Review Saya</h1>
        <p className="text-sm md:text-base text-default-500">
          Lihat semua review dari dosen penguji
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        variants={itemVariants}
        className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:overflow-visible"
      >
        <div className="flex md:grid md:grid-cols-4 gap-3 md:gap-4 min-w-max md:min-w-0">
          <div className="w-[140px] md:w-auto shrink-0">
            <StatsCard
              title="Total Review"
              value={stats.totalReviews}
              icon={ClipboardCheck}
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
              title="Menunggu"
              value={stats.pendingReviews}
              icon={Clock}
              color="warning"
            />
          </div>
          <div className="w-[140px] md:w-auto shrink-0">
            <StatsCard
              title="Rata-rata Nilai"
              value={stats.averageScore !== null ? stats.averageScore : '-'}
              icon={Star}
              color="secondary"
              description={stats.averageScore !== null ? '/100' : 'Belum ada'}
            />
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardBody className="p-3 md:p-4">
            <div className="flex flex-col md:flex-row gap-3">
              <Input
                placeholder="Cari review..."
                value={searchQuery}
                onValueChange={setSearchQuery}
                startContent={<Search size={18} className="text-default-400" />}
                className="md:max-w-xs"
                size="sm"
              />
              <Select
                placeholder="Semua Status"
                selectedKeys={statusFilter ? [statusFilter] : []}
                onSelectionChange={(keys) => setStatusFilter(Array.from(keys)[0] as string || 'all')}
                className="md:max-w-[180px]"
                size="sm"
                startContent={<Filter size={16} className="text-default-400" />}
                items={[
                  { key: 'all', label: 'Semua Status' },
                  { key: 'PENDING', label: 'Menunggu' },
                  { key: 'IN_PROGRESS', label: 'Sedang Direview' },
                  { key: 'COMPLETED', label: 'Selesai' },
                ]}
              >
                {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
              </Select>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Reviews List */}
      <motion.div variants={itemVariants}>
        {filteredReviews.length === 0 ? (
          <Card>
            <CardBody className="py-12 text-center">
              {reviews.length === 0 ? (
                <>
                  <AlertCircle size={48} className="mx-auto text-default-300 mb-4" />
                  <p className="text-default-500 mb-2">Belum ada review</p>
                  <p className="text-sm text-default-400">
                    Review akan muncul setelah dosen penguji ditugaskan ke project Anda
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
        )}
      </motion.div>
    </motion.div>
  );
}
