'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button, buttonVariants } from '@/components/ui/button';
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
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
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
  TrendingUp,
  Award,
  Calendar,
  Code,
  FolderGit2,
  Zap,
  Users,
  User,
  Download,
  FileDown,
  Loader2,
} from 'lucide-react';
import { cn, formatDateTime, getInitials } from '@/lib/utils';
import { addToast } from '@/lib/toast';
import { PageHeader } from '@/components/caret/PageHeader';

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

interface ProjectMemberInfo {
  id: string;
  name: string | null;
  role: string;
  user: {
    id: string;
    name: string | null;
    username: string;
  } | null;
}

interface MemberReviewScore {
  id: string;
  score: number;
  maxScore: number;
  feedback: string | null;
  member: ProjectMemberInfo;
  rubrik: {
    id: string;
    name: string;
    kategori: string;
    bobotMax: number;
    tipe: string;
  };
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
    members?: ProjectMemberInfo[];
  };
  reviewer: {
    id: string;
    name: string;
    username: string;
  };
  scores: ReviewScore[];
  comments: ReviewComment[];
  memberScores?: MemberReviewScore[];
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
  },
  {
    key: 'completed',
    label: 'Selesai',
    icon: CheckCircle2,
  },
  {
    key: 'pending',
    label: 'Menunggu',
    icon: Clock,
  },
  {
    key: 'average',
    label: 'Rata-rata Nilai',
    icon: Star,
  },
];

function getScoreColor(score: number, max: number): string {
  const percentage = (score / max) * 100;
  if (percentage >= 70) return '[&_[data-slot=progress-indicator]]:bg-success';
  if (percentage >= 50) return '[&_[data-slot=progress-indicator]]:bg-warning';
  return '[&_[data-slot=progress-indicator]]:bg-destructive';
}

/** Titik status semantik kecil untuk chip status review. */
function statusDotClass(status: string): string {
  switch (status) {
    case 'COMPLETED':
      return 'bg-success';
    case 'IN_PROGRESS':
      return 'bg-primary';
    case 'PENDING':
      return 'bg-warning';
    default:
      return 'bg-app-teritary-invert';
  }
}

function getScoreGrade(score: number): { label: string; color: string; bgColor: string } {
  if (score >= 85) return { label: 'Excellent', color: 'text-success', bgColor: 'bg-success/10' };
  if (score >= 70) return { label: 'Good', color: 'text-foreground', bgColor: 'bg-app-quaternary' };
  if (score >= 55) return { label: 'Fair', color: 'text-warning', bgColor: 'bg-warning/10' };
  return { label: 'Needs Work', color: 'text-destructive', bgColor: 'bg-destructive/10' };
}

// Helper to get member display name
function getMemberDisplayName(member: ProjectMemberInfo): string {
  if (member.user?.name) return member.user.name;
  if (member.name) return member.name;
  if (member.user?.username) return member.user.username;
  return 'Anggota';
}

// Helper to group member scores by member
function groupScoresByMember(memberScores: MemberReviewScore[]): Map<string, { member: ProjectMemberInfo; scores: MemberReviewScore[]; totalScore: number; maxScore: number }> {
  const grouped = new Map<string, { member: ProjectMemberInfo; scores: MemberReviewScore[]; totalScore: number; maxScore: number }>();

  memberScores.forEach((ms) => {
    const existing = grouped.get(ms.member.id);
    if (existing) {
      existing.scores.push(ms);
      existing.totalScore += ms.score;
      existing.maxScore += ms.maxScore;
    } else {
      grouped.set(ms.member.id, {
        member: ms.member,
        scores: [ms],
        totalScore: ms.score,
        maxScore: ms.maxScore,
      });
    }
  });

  return grouped;
}

// Review Card — Caret zinc
function ReviewCard({ review, index, onExport, isExporting }: { review: Review; index: number; onExport?: (reviewId: string) => void; isExporting?: boolean }) {
  const grade = review.overallScore ? getScoreGrade(review.overallScore) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="overflow-hidden rounded-2xl border border-border bg-card shadow-none">
        <CardContent className="p-0">
          {/* Header */}
          <div className="border-b border-border bg-app-quinary p-4 md:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar className="shrink-0">
                  <AvatarFallback>{getInitials(review.reviewer.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{review.reviewer.name}</p>
                  <p className="text-app-teritary-invert font-mono text-[10px] tracking-wider">@{review.reviewer.username}</p>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <span className="text-app-secondary-invert inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-border bg-app-quinary px-2.5 py-1 text-[11px] font-medium">
                  <span className={`size-1.5 rounded-full ${statusDotClass(review.status)}`} />
                  {reviewStatusLabels[review.status]}
                </span>
                {review.overallScore !== null && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-border bg-app-quaternary px-2.5 py-1 text-[11px] font-semibold text-foreground">
                    <Star size={11} className="text-app-secondary-invert" />
                    <span className="tabular-nums">{review.overallScore}</span>
                    <span className="text-app-teritary-invert font-normal">/100</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-4 p-4 md:p-5">
            {/* Project Link Card */}
            <Link
              href={`/mahasiswa/projects/${review.project.id}`}
              className="group flex items-center gap-3 rounded-xl border border-border bg-app-quinary p-3 transition-colors hover:bg-app-quaternary"
            >
              <span className="bg-app-primary text-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
                <FolderGit2 size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-app-teritary-invert font-mono text-[9px] uppercase tracking-[0.18em]">Project</p>
                <p className="truncate text-sm font-medium transition-colors group-hover:text-primary">
                  {review.project.title}
                </p>
              </div>
              <ExternalLink size={16} className="text-app-teritary-invert transition-colors group-hover:text-primary" />
            </Link>

            {/* Score Grade (if completed) */}
            {grade && (
              <div className="rounded-xl border border-border bg-app-quinary p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award size={18} className={grade.color} />
                    <span className="text-sm font-semibold">Nilai Keseluruhan</span>
                  </div>
                  <div className={`rounded-full px-3 py-1 ${grade.bgColor}`}>
                    <span className={`text-sm font-bold ${grade.color}`}>{grade.label}</span>
                  </div>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold tabular-nums">{review.overallScore}</span>
                  <span className="text-app-teritary-invert mb-1">/100</span>
                </div>
                {/* Progress bar */}
                <div className="mt-3">
                  <Progress
                    value={review.overallScore || 0}
                    className={cn(
                      '[&_[data-slot=progress-track]]:h-2 [&_[data-slot=progress-track]]:bg-app-primary',
                      review.overallScore && review.overallScore >= 70
                        ? '[&_[data-slot=progress-indicator]]:bg-success'
                        : review.overallScore && review.overallScore >= 55
                          ? '[&_[data-slot=progress-indicator]]:bg-warning'
                          : '[&_[data-slot=progress-indicator]]:bg-destructive'
                    )}
                  />
                </div>
              </div>
            )}

            {/* Overall Comment */}
            {review.overallComment && (
              <div className="rounded-xl border border-border bg-app-quinary p-4">
                <div className="mb-2 flex items-center gap-2">
                  <MessageSquare size={14} className="text-app-teritary-invert" />
                  <span className="text-app-secondary-invert text-sm font-medium">Komentar Dosen</span>
                </div>
                <p className="text-app-secondary-invert leading-relaxed">{review.overallComment}</p>
              </div>
            )}

            {/* Scores Accordion */}
            {review.scores.length > 0 && (
              <Accordion className="rounded-xl border border-border px-3">
                <AccordionItem value="scores">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <TrendingUp size={16} className="text-app-teritary-invert" />
                      <span className="text-sm font-medium">
                        Nilai per Kriteria ({review.scores.length})
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      {review.scores.map((score) => (
                        <div key={score.id} className="rounded-lg bg-app-quinary p-3">
                          <div className="mb-2 flex items-center justify-between">
                            <div>
                              <span className="text-sm font-medium">{score.rubrik.name}</span>
                              <Badge variant="secondary" className="ml-2 h-5 text-[10px]">
                                {score.rubrik.kategori}
                              </Badge>
                            </div>
                            <span className="font-bold tabular-nums">
                              {score.score}
                              <span className="text-app-teritary-invert font-normal">/{score.rubrik.bobotMax}</span>
                            </span>
                          </div>
                          <Progress
                            value={(score.score / score.rubrik.bobotMax) * 100}
                            className={cn(
                              '[&_[data-slot=progress-track]]:h-1.5 [&_[data-slot=progress-track]]:bg-app-primary',
                              getScoreColor(score.score, score.rubrik.bobotMax)
                            )}
                          />
                          {score.feedback && (
                            <p className="text-app-teritary-invert mt-2 text-xs italic">&quot;{score.feedback}&quot;</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}

            {/* Individual Member Scores */}
            {review.memberScores && review.memberScores.length > 0 && (() => {
              const groupedScores = groupScoresByMember(review.memberScores);
              const membersArray = Array.from(groupedScores.values());

              return (
                <Accordion className="rounded-xl border border-border px-3">
                  <AccordionItem value="member-scores">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-app-teritary-invert" />
                        <span className="text-sm font-medium">
                          Nilai Individu per Anggota ({membersArray.length} anggota)
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        {membersArray.map(({ member, scores, totalScore, maxScore }) => {
                          const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
                          const memberGrade = getScoreGrade(percentage);

                          return (
                            <div
                              key={member.id}
                              className="rounded-xl border border-border bg-app-quinary p-4"
                            >
                              {/* Member Header */}
                              <div className="mb-3 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <span className="bg-app-primary text-foreground flex size-9 items-center justify-center rounded-lg">
                                    <User size={16} />
                                  </span>
                                  <div>
                                    <p className="text-sm font-semibold">{getMemberDisplayName(member)}</p>
                                    <div className="flex items-center gap-2">
                                      <Badge
                                        className={cn(
                                          'h-5 text-[10px]',
                                          member.role === 'leader'
                                            ? 'bg-primary/10 text-primary'
                                            : 'bg-muted text-muted-foreground'
                                        )}
                                      >
                                        {member.role === 'leader' ? 'Ketua' : 'Anggota'}
                                      </Badge>
                                      {member.user?.username && (
                                        <span className="text-app-teritary-invert text-xs">@{member.user.username}</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className={`rounded-full px-3 py-1 ${memberGrade.bgColor}`}>
                                    <span className={`text-xs font-bold tabular-nums ${memberGrade.color}`}>
                                      {totalScore.toFixed(1)}/{maxScore.toFixed(1)}
                                    </span>
                                  </div>
                                  <p className={`mt-1 text-xs ${memberGrade.color}`}>{memberGrade.label}</p>
                                </div>
                              </div>

                              {/* Member's Individual Scores */}
                              <div className="space-y-2">
                                {scores.map((score) => (
                                  <div
                                    key={score.id}
                                    className="rounded-lg border border-border bg-app-quaternary p-2.5"
                                  >
                                    <div className="mb-1.5 flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium">{score.rubrik.name}</span>
                                        <Badge variant="secondary" className="h-4 px-1 text-[9px]">
                                          {score.rubrik.kategori}
                                        </Badge>
                                      </div>
                                      <span className="text-xs font-bold tabular-nums">
                                        {score.score}
                                        <span className="text-app-teritary-invert font-normal">/{score.maxScore}</span>
                                      </span>
                                    </div>
                                    <Progress
                                      value={(score.score / score.maxScore) * 100}
                                      className={cn(
                                        '[&_[data-slot=progress-track]]:h-1 [&_[data-slot=progress-track]]:bg-app-primary',
                                        getScoreColor(score.score, score.maxScore)
                                      )}
                                    />
                                    {score.feedback && (
                                      <p className="text-app-teritary-invert mt-1.5 text-[10px] italic">&quot;{score.feedback}&quot;</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              );
            })()}

            {/* Code Comments */}
            {review.comments.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Code size={14} className="text-app-teritary-invert" />
                  <span className="text-app-secondary-invert text-sm font-medium">
                    Komentar Code ({review.comments.length})
                  </span>
                </div>
                <div className="max-h-40 space-y-2 overflow-y-auto">
                  {review.comments.slice(0, 3).map((comment) => (
                    <div key={comment.id} className="rounded-lg border border-border bg-app-quinary p-3">
                      {comment.filePath && (
                        <p className="mb-1 flex items-center gap-1 font-mono text-xs text-primary">
                          <FileText size={10} />
                          {comment.filePath}
                          {comment.lineStart && (
                            <span className="text-app-teritary-invert">:{comment.lineStart}{comment.lineEnd && comment.lineEnd !== comment.lineStart ? `-${comment.lineEnd}` : ''}</span>
                          )}
                        </p>
                      )}
                      <p className="text-app-secondary-invert text-sm">{comment.content}</p>
                    </div>
                  ))}
                  {review.comments.length > 3 && (
                    <p className="text-app-teritary-invert text-center text-xs">
                      +{review.comments.length - 3} komentar lainnya
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Timestamp and Export */}
            <div className="flex items-center justify-between pt-2">
              <div className="text-app-teritary-invert flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider">
                <Calendar size={12} />
                <span>
                  {review.status === 'COMPLETED' && review.completedAt
                    ? `Selesai: ${formatDateTime(review.completedAt)}`
                    : `Diperbarui: ${formatDateTime(review.updatedAt)}`}
                </span>
              </div>
              {review.status === 'COMPLETED' && onExport && (
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        size="icon-sm"
                        variant="outline"
                        disabled={isExporting}
                        onClick={() => onExport(review.id)}
                      />
                    }
                  >
                    {isExporting ? <Loader2 className="animate-spin" /> : <Download size={14} />}
                  </TooltipTrigger>
                  <TooltipContent>Download laporan review ini</TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function MahasiswaReviewsContent({ reviews, stats }: ReviewsContentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isExporting, setIsExporting] = useState(false);

  // Export all completed reviews as report
  const handleExportAll = async () => {
    if (stats.completedReviews === 0) {
      addToast({
        title: 'Tidak Ada Review Selesai',
        description: 'Belum ada review yang selesai untuk di-export',
        color: 'warning',
      });
      return;
    }

    setIsExporting(true);
    try {
      const response = await fetch('/api/reviews/export?all=true');
      if (!response.ok) {
        throw new Error('Failed to export reviews');
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch ? filenameMatch[1] : 'Laporan_Review.html';

      // Download file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      addToast({
        title: 'Export Berhasil',
        description: 'Laporan review berhasil di-download. Buka file HTML dan klik "Cetak/Simpan PDF"',
        color: 'success',
      });
    } catch (error) {
      console.error('Export error:', error);
      addToast({
        title: 'Export Gagal',
        description: 'Terjadi kesalahan saat mengexport laporan review',
        color: 'danger',
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Export single review
  const handleExportSingle = async (reviewId: string) => {
    setIsExporting(true);
    try {
      const response = await fetch(`/api/reviews/export?reviewId=${reviewId}`);
      if (!response.ok) {
        throw new Error('Failed to export review');
      }

      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch ? filenameMatch[1] : 'Laporan_Review.html';

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      addToast({
        title: 'Export Berhasil',
        description: 'Laporan review berhasil di-download',
        color: 'success',
      });
    } catch (error) {
      console.error('Export error:', error);
      addToast({
        title: 'Export Gagal',
        description: 'Terjadi kesalahan saat mengexport laporan review',
        color: 'danger',
      });
    } finally {
      setIsExporting(false);
    }
  };

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
      {/* Page Header */}
      <motion.div variants={itemVariants}>
        <PageHeader
          label="[03] REVIEW"
          labelRight="/ FEEDBACK"
          title="Review & feedback"
          description="Lihat semua review dari dosen penguji untuk project Anda."
        />
      </motion.div>

      {/* Export Actions */}
      {stats.completedReviews > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden rounded-2xl border border-border bg-card shadow-none">
            <CardContent className="p-4">
              <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <span className="bg-app-primary text-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
                    <FileDown size={16} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">Export Laporan Review</p>
                    <p className="text-app-teritary-invert text-xs">Download laporan lengkap dengan nilai dan feedback</p>
                  </div>
                </div>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={isExporting}
                        onClick={handleExportAll}
                      />
                    }
                  >
                    {isExporting ? <Loader2 className="animate-spin" /> : <Download size={16} />}
                    Export Semua ({stats.completedReviews})
                  </TooltipTrigger>
                  <TooltipContent>Download laporan semua review yang sudah selesai</TooltipContent>
                </Tooltip>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Stats Grid */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-2 gap-px border border-border bg-border lg:grid-cols-4">
          {STATS_CONFIG.map((stat) => {
            const Icon = stat.icon;
            const value = getStatsValue(stat.key);
            return (
              <div
                key={stat.key}
                className="group bg-background p-4 transition-colors hover:bg-app-quinary md:p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <p className="text-app-teritary-invert font-mono text-[10px] uppercase tracking-[0.18em]">{stat.label}</p>
                    <p className="font-display text-2xl font-[450] tabular-nums tracking-tight md:text-3xl">
                      {value}
                      {stat.key === 'average' && value !== '-' && (
                        <span className="text-app-teritary-invert text-sm font-normal">/100</span>
                      )}
                    </p>
                  </div>
                  <span className="bg-app-primary text-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
                    <Icon size={16} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Filter Card */}
      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden rounded-2xl border border-border bg-card shadow-none">
          <div className="border-b border-border bg-app-quinary p-4">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-app-teritary-invert" />
              <h3 className="text-sm font-semibold">Filter Review</h3>
            </div>
          </div>
          <CardContent className="p-4">
            <div className="flex flex-col gap-3 md:flex-row">
              <div className="relative md:flex-1">
                <Search
                  size={18}
                  className="text-app-teritary-invert absolute left-2.5 top-1/2 -translate-y-1/2"
                />
                <Input
                  placeholder="Cari berdasarkan project atau reviewer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border border-border bg-app-quinary pl-9"
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter((value as string) || 'all')}
              >
                <SelectTrigger
                  size="sm"
                  className="border border-border bg-app-quinary md:w-[200px]"
                >
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="PENDING">Menunggu</SelectItem>
                  <SelectItem value="IN_PROGRESS">Sedang Direview</SelectItem>
                  <SelectItem value="COMPLETED">Selesai</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Reviews List */}
      <motion.div variants={itemVariants}>
        {filteredReviews.length === 0 ? (
          <Card className="rounded-2xl border border-border bg-card shadow-none">
            <CardContent className="py-16 text-center">
              {reviews.length === 0 ? (
                <>
                  <div className="bg-app-primary text-app-secondary-invert mx-auto mb-4 flex size-20 items-center justify-center rounded-full">
                    <ClipboardCheck size={36} />
                  </div>
                  <h3 className="font-display mb-2 text-lg font-[450] tracking-tight">Belum Ada Review</h3>
                  <p className="text-app-secondary-invert mx-auto mb-4 max-w-sm text-sm">
                    Review akan muncul setelah dosen penguji ditugaskan dan mulai menilai project Anda
                  </p>
                  <Link
                    href="/mahasiswa/projects"
                    className={buttonVariants()}
                  >
                    <Zap size={18} />
                    Lihat Project Saya
                  </Link>
                </>
              ) : (
                <>
                  <div className="bg-app-primary text-app-teritary-invert mx-auto mb-4 flex size-20 items-center justify-center rounded-full">
                    <Search size={36} />
                  </div>
                  <h3 className="font-display mb-2 text-lg font-[450] tracking-tight">Tidak Ada Hasil</h3>
                  <p className="text-app-secondary-invert text-sm">
                    Tidak ada review yang cocok dengan filter Anda
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('all');
                    }}
                  >
                    Reset Filter
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2">
            {filteredReviews.map((review, index) => (
              <ReviewCard
                key={review.id}
                review={review}
                index={index}
                onExport={handleExportSingle}
                isExporting={isExporting}
              />
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
