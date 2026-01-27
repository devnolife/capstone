'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Button,
  Card,
  CardBody,
  Chip,
  Input,
  Select,
  SelectItem,
  Progress,
  Avatar,
  Accordion,
  AccordionItem,
  Tooltip,
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
  AlertCircle,
  TrendingUp,
  Award,
  Sparkles,
  Calendar,
  Code,
  FolderGit2,
  Zap,
} from 'lucide-react';
import { formatDate, formatDateTime } from '@/lib/utils';

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
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

// Stats card configurations
const STATS_CONFIG = [
  {
    key: 'total',
    label: 'Total Review',
    icon: ClipboardCheck,
    gradient: 'from-blue-500 via-indigo-500 to-violet-500',
    bgLight: 'bg-blue-50 dark:bg-blue-900/20',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    key: 'completed',
    label: 'Selesai',
    icon: CheckCircle2,
    gradient: 'from-emerald-500 via-green-500 to-teal-500',
    bgLight: 'bg-emerald-50 dark:bg-emerald-900/20',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    key: 'pending',
    label: 'Menunggu',
    icon: Clock,
    gradient: 'from-amber-500 via-orange-500 to-yellow-500',
    bgLight: 'bg-amber-50 dark:bg-amber-900/20',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    key: 'average',
    label: 'Rata-rata Nilai',
    icon: Star,
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
    bgLight: 'bg-violet-50 dark:bg-violet-900/20',
    iconColor: 'text-violet-600 dark:text-violet-400',
  },
];

function getScoreColor(score: number, max: number): 'success' | 'warning' | 'danger' {
  const percentage = (score / max) * 100;
  if (percentage >= 70) return 'success';
  if (percentage >= 50) return 'warning';
  return 'danger';
}

function getStatusGradient(status: string) {
  switch (status) {
    case 'COMPLETED':
      return 'from-emerald-500 to-green-400';
    case 'IN_PROGRESS':
      return 'from-blue-500 to-indigo-400';
    case 'PENDING':
      return 'from-amber-500 to-orange-400';
    default:
      return 'from-zinc-500 to-zinc-400';
  }
}

function getScoreGrade(score: number): { label: string; color: string; bgColor: string } {
  if (score >= 85) return { label: 'Excellent', color: 'text-emerald-600 dark:text-emerald-400', bgColor: 'bg-emerald-50 dark:bg-emerald-900/20' };
  if (score >= 70) return { label: 'Good', color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-50 dark:bg-blue-900/20' };
  if (score >= 55) return { label: 'Fair', color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-50 dark:bg-amber-900/20' };
  return { label: 'Needs Work', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-50 dark:bg-red-900/20' };
}

// Modern Review Card
function ReviewCard({ review, index }: { review: Review; index: number }) {
  const grade = review.overallScore ? getScoreGrade(review.overallScore) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
        <CardBody className="p-0">
          {/* Header with gradient */}
          <div className={`p-4 md:p-5 bg-gradient-to-r ${getStatusGradient(review.status)} text-white`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar
                  name={review.reviewer.name}
                  size="md"
                  className="ring-2 ring-white/30"
                />
                <div>
                  <p className="font-semibold">{review.reviewer.name}</p>
                  <p className="text-sm text-white/80">@{review.reviewer.username}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Chip
                  size="sm"
                  className="bg-white/20 text-white"
                  startContent={review.status === 'COMPLETED' ? <Sparkles size={12} /> : undefined}
                >
                  {reviewStatusLabels[review.status]}
                </Chip>
                {review.overallScore !== null && (
                  <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/20">
                    <Star size={14} className="fill-yellow-300 text-yellow-300" />
                    <span className="font-bold">{review.overallScore}</span>
                    <span className="text-white/70 text-sm">/100</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 md:p-5 space-y-4">
            {/* Project Link Card */}
            <Link
              href={`/mahasiswa/projects/${review.project.id}`}
              className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group"
            >
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
                <FolderGit2 size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-default-500">Project</p>
                <p className="font-medium truncate group-hover:text-primary transition-colors">
                  {review.project.title}
                </p>
              </div>
              <ExternalLink size={16} className="text-default-400 group-hover:text-primary transition-colors" />
            </Link>

            {/* Score Grade (if completed) */}
            {grade && (
              <div className={`p-4 rounded-xl ${grade.bgColor} border border-zinc-100 dark:border-zinc-700`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Award size={18} className={grade.color} />
                    <span className="font-semibold">Nilai Keseluruhan</span>
                  </div>
                  <div className={`px-3 py-1 rounded-full ${grade.bgColor}`}>
                    <span className={`text-sm font-bold ${grade.color}`}>{grade.label}</span>
                  </div>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold">{review.overallScore}</span>
                  <span className="text-default-500 mb-1">/100</span>
                </div>
                {/* Progress bar */}
                <div className="mt-3">
                  <Progress
                    value={review.overallScore || 0}
                    color={review.overallScore && review.overallScore >= 70 ? 'success' : review.overallScore && review.overallScore >= 55 ? 'warning' : 'danger'}
                    size="sm"
                    className="h-2"
                  />
                </div>
              </div>
            )}

            {/* Overall Comment */}
            {review.overallComment && (
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare size={14} className="text-default-500" />
                  <span className="text-sm font-medium text-default-600">Komentar Dosen</span>
                </div>
                <p className="text-default-700 leading-relaxed">{review.overallComment}</p>
              </div>
            )}

            {/* Scores Accordion */}
            {review.scores.length > 0 && (
              <Accordion variant="bordered" className="px-0">
                <AccordionItem
                  key="scores"
                  aria-label="Lihat Nilai per Kriteria"
                  title={
                    <div className="flex items-center gap-2">
                      <TrendingUp size={16} className="text-default-500" />
                      <span className="text-sm font-medium">
                        Nilai per Kriteria ({review.scores.length})
                      </span>
                    </div>
                  }
                  classNames={{
                    content: 'pt-0 pb-4',
                  }}
                >
                  <div className="space-y-3">
                    {review.scores.map((score) => (
                      <div key={score.id} className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                        <div className="flex justify-between items-center mb-2">
                          <div>
                            <span className="text-sm font-medium">{score.rubrik.name}</span>
                            <Chip size="sm" variant="flat" className="ml-2 h-5 text-[10px]">
                              {score.rubrik.kategori}
                            </Chip>
                          </div>
                          <span className="font-bold">
                            {score.score}
                            <span className="text-default-400 font-normal">/{score.rubrik.bobotMax}</span>
                          </span>
                        </div>
                        <Progress
                          value={(score.score / score.rubrik.bobotMax) * 100}
                          color={getScoreColor(score.score, score.rubrik.bobotMax)}
                          size="sm"
                          className="h-1.5"
                        />
                        {score.feedback && (
                          <p className="text-xs text-default-500 mt-2 italic">&quot;{score.feedback}&quot;</p>
                        )}
                      </div>
                    ))}
                  </div>
                </AccordionItem>
              </Accordion>
            )}

            {/* Code Comments */}
            {review.comments.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Code size={14} className="text-default-500" />
                  <span className="text-sm font-medium text-default-600">
                    Komentar Code ({review.comments.length})
                  </span>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {review.comments.slice(0, 3).map((comment) => (
                    <div key={comment.id} className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700">
                      {comment.filePath && (
                        <p className="text-xs text-primary font-mono mb-1 flex items-center gap-1">
                          <FileText size={10} />
                          {comment.filePath}
                          {comment.lineStart && (
                            <span className="text-default-400">:{comment.lineStart}{comment.lineEnd && comment.lineEnd !== comment.lineStart ? `-${comment.lineEnd}` : ''}</span>
                          )}
                        </p>
                      )}
                      <p className="text-sm text-default-700">{comment.content}</p>
                    </div>
                  ))}
                  {review.comments.length > 3 && (
                    <p className="text-xs text-center text-default-400">
                      +{review.comments.length - 3} komentar lainnya
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Timestamp */}
            <div className="flex items-center gap-2 pt-2 text-xs text-default-400">
              <Calendar size={12} />
              <span>
                {review.status === 'COMPLETED' && review.completedAt
                  ? `Selesai: ${formatDateTime(review.completedAt)}`
                  : `Diperbarui: ${formatDateTime(review.updatedAt)}`}
              </span>
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
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

  const getStatsValue = (key: string) => {
    switch (key) {
      case 'total':
        return stats.totalReviews;
      case 'completed':
        return stats.completedReviews;
      case 'pending':
        return stats.pendingReviews;
      case 'average':
        return stats.averageScore !== null ? stats.averageScore : '-';
      default:
        return 0;
    }
  };

  return (
    <motion.div
      className="w-full space-y-6 pb-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero Header Card - Soft Colored */}
      <motion.div variants={itemVariants}>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-rose-950/40 border border-amber-200/50 dark:border-amber-800/30 p-6 md:p-8">
          {/* Subtle Background Accents */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-rose-400/15 to-amber-400/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
          
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Left side */}
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/25">
                <ClipboardCheck size={28} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-zinc-800 dark:text-zinc-100">Review & Feedback</h1>
                <p className="text-amber-600/70 dark:text-amber-400/60 text-sm md:text-base mt-1">
                  Lihat semua review dari dosen penguji untuk project Anda
                </p>
              </div>
            </div>

            {/* Right side - Quick Stats */}
            <div className="flex items-center gap-3 md:gap-4">
              <div className="text-center px-4 py-2 rounded-xl bg-white/60 dark:bg-zinc-800/60 border border-amber-200/50 dark:border-amber-700/30">
                <p className="text-2xl md:text-3xl font-bold text-amber-700 dark:text-amber-300">{stats.totalReviews}</p>
                <p className="text-xs text-amber-600/70 dark:text-amber-400/70">Total</p>
              </div>
              <div className="text-center px-4 py-2 rounded-xl bg-white/60 dark:bg-zinc-800/60 border border-amber-200/50 dark:border-amber-700/30">
                <p className="text-2xl md:text-3xl font-bold text-amber-700 dark:text-amber-300">{stats.completedReviews}</p>
                <p className="text-xs text-amber-600/70 dark:text-amber-400/70">Selesai</p>
              </div>
              {stats.averageScore !== null && (
                <div className="text-center px-4 py-2 rounded-xl bg-yellow-100/80 dark:bg-yellow-900/30 border border-yellow-300/50 dark:border-yellow-700/30">
                  <div className="flex items-center justify-center gap-1">
                    <Star size={16} className="fill-yellow-500 text-yellow-500" />
                    <p className="text-2xl md:text-3xl font-bold text-yellow-700 dark:text-yellow-300">{stats.averageScore}</p>
                  </div>
                  <p className="text-xs text-yellow-600/70 dark:text-yellow-400/70">Rata-rata</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {STATS_CONFIG.map((stat) => {
            const Icon = stat.icon;
            const value = getStatsValue(stat.key);
            return (
              <Card
                key={stat.key}
                className="border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden group hover:shadow-md transition-shadow"
              >
                <CardBody className="p-4 md:p-5">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-xs md:text-sm text-default-500">{stat.label}</p>
                      <p className="text-2xl md:text-3xl font-bold">
                        {value}
                        {stat.key === 'average' && value !== '-' && (
                          <span className="text-sm text-default-400 font-normal">/100</span>
                        )}
                      </p>
                    </div>
                    <div className={`p-2 md:p-3 rounded-xl ${stat.bgLight} transition-transform group-hover:scale-110`}>
                      <Icon size={20} className={stat.iconColor} />
                    </div>
                  </div>
                  <div className={`h-1 mt-4 rounded-full bg-gradient-to-r ${stat.gradient} opacity-50 group-hover:opacity-100 transition-opacity`} />
                </CardBody>
              </Card>
            );
          })}
        </div>
      </motion.div>

      {/* Filter Card */}
      <motion.div variants={itemVariants}>
        <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-800 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-default-500" />
              <h3 className="font-semibold">Filter Review</h3>
            </div>
          </div>
          <CardBody className="p-4">
            <div className="flex flex-col md:flex-row gap-3">
              <Input
                placeholder="Cari berdasarkan project atau reviewer..."
                value={searchQuery}
                onValueChange={setSearchQuery}
                startContent={<Search size={18} className="text-default-400" />}
                className="md:flex-1"
                size="sm"
                classNames={{
                  inputWrapper: 'border border-zinc-200 dark:border-zinc-700',
                }}
              />
              <Select
                placeholder="Semua Status"
                selectedKeys={statusFilter ? [statusFilter] : []}
                onSelectionChange={(keys) => setStatusFilter(Array.from(keys)[0] as string || 'all')}
                className="md:w-[200px]"
                size="sm"
                classNames={{
                  trigger: 'border border-zinc-200 dark:border-zinc-700',
                }}
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
          <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardBody className="py-16 text-center">
              {reviews.length === 0 ? (
                <>
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center">
                    <ClipboardCheck size={36} className="text-amber-500" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Belum Ada Review</h3>
                  <p className="text-default-500 mb-4 text-sm max-w-sm mx-auto">
                    Review akan muncul setelah dosen penguji ditugaskan dan mulai menilai project Anda
                  </p>
                  <Button
                    as={Link}
                    href="/mahasiswa/projects"
                    color="primary"
                    startContent={<Zap size={18} />}
                  >
                    Lihat Project Saya
                  </Button>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700 flex items-center justify-center">
                    <Search size={36} className="text-zinc-400" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Tidak Ada Hasil</h3>
                  <p className="text-default-500 text-sm">
                    Tidak ada review yang cocok dengan filter Anda
                  </p>
                  <Button
                    variant="flat"
                    className="mt-4"
                    onPress={() => {
                      setSearchQuery('');
                      setStatusFilter('all');
                    }}
                  >
                    Reset Filter
                  </Button>
                </>
              )}
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {filteredReviews.map((review, index) => (
              <ReviewCard key={review.id} review={review} index={index} />
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
