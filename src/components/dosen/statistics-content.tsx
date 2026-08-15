'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  Star,
  Target,
  Users,
  Calendar,
  PieChart,
  Activity,
  Award,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { PageHeader } from '@/components/caret/PageHeader';

interface ReviewStats {
  summary: {
    totalReviews: number;
    completedReviews: number;
    inProgressReviews: number;
    pendingReviews: number;
    totalAssignments: number;
    averageScore: number;
    completionRate: number;
  };
  scoreDistribution: {
    excellent: number;
    good: number;
    average: number;
    belowAverage: number;
    poor: number;
  };
  rubrikAverages: Array<{
    id: string;
    name: string;
    kategori: string;
    maxScore: number;
    averageScore: number;
    averagePercentage: number;
    totalReviews: number;
  }>;
  kategoriAverages: Array<{
    kategori: string;
    averagePercentage: number;
    totalReviews: number;
  }>;
  recentReviews: Array<{
    id: string;
    projectTitle: string;
    mahasiswaName: string;
    status: string;
    overallScore: number | null;
    createdAt: string;
    completedAt: string | null;
  }>;
  monthlyStats: Array<{
    month: string;
    year: number;
    completed: number;
    averageScore: number;
  }>;
  projectStatusCounts: Record<string, number>;
  projectsBySemester: Array<{
    semester: string;
    tahunAkademik: string;
    count: number;
  }>;
}

function getGradeLabel(score: number): { label: string; color: 'success' | 'primary' | 'warning' | 'danger' } {
  if (score >= 90) return { label: 'A', color: 'success' };
  if (score >= 80) return { label: 'A-/B+', color: 'success' };
  if (score >= 70) return { label: 'B', color: 'primary' };
  if (score >= 60) return { label: 'C', color: 'warning' };
  return { label: 'D', color: 'danger' };
}

type LegacyColor = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

/** Pemetaan warna legacy ke varian Badge shadcn. */
function badgeVariant(
  color: LegacyColor
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (color) {
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

/** Warna indikator Progress agar semantik warna lama tetap terlihat. */
function progressIndicatorClass(color: LegacyColor): string {
  switch (color) {
    case 'success':
      return '[&_[data-slot=progress-indicator]]:bg-success';
    case 'warning':
      return '[&_[data-slot=progress-indicator]]:bg-warning';
    case 'danger':
      return '[&_[data-slot=progress-indicator]]:bg-destructive';
    case 'secondary':
      return '[&_[data-slot=progress-indicator]]:bg-secondary';
    case 'default':
      return '[&_[data-slot=progress-indicator]]:bg-muted-foreground';
    default:
      return '';
  }
}

function getStatusColor(status: string): 'success' | 'primary' | 'warning' | 'default' {
  switch (status) {
    case 'COMPLETED':
      return 'success';
    case 'IN_PROGRESS':
      return 'primary';
    case 'PENDING':
      return 'warning';
    default:
      return 'default';
  }
}

function getProjectStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    DRAFT: 'Draft',
    SUBMITTED: 'Disubmit',
    IN_REVIEW: 'Sedang Direview',
    REVISION_NEEDED: 'Perlu Revisi',
    APPROVED: 'Disetujui',
    REJECTED: 'Ditolak',
  };
  return labels[status] || status;
}

function getKategoriIcon(kategori: string) {
  switch (kategori.toLowerCase()) {
    case 'teknis':
      return <Activity className="w-4 h-4" />;
    case 'dokumentasi':
      return <FileText className="w-4 h-4" />;
    case 'presentasi':
      return <Users className="w-4 h-4" />;
    default:
      return <Star className="w-4 h-4" />;
  }
}

export function StatisticsContent() {
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats/reviews');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Gagal memuat statistik');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner className="size-8" aria-label="Memuat statistik..." />
      </div>
    );
  }

  if (!stats) {
    return (
      <Card className="rounded-2xl border border-border bg-card shadow-none">
        <CardContent className="text-center py-10">
          <AlertCircle className="w-12 h-12 mx-auto text-warning mb-4" />
          <p className="text-app-secondary-invert">Gagal memuat data statistik</p>
        </CardContent>
      </Card>
    );
  }

  const { summary, scoreDistribution, rubrikAverages, kategoriAverages, recentReviews, monthlyStats, projectStatusCounts, projectsBySemester } = stats;

  // Calculate max for chart scaling
  const maxMonthlyCompleted = Math.max(...monthlyStats.map((m) => m.completed), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        label="[05] STATISTIK"
        labelRight="/ REVIEW"
        title="Statistik Review"
        description="Analisis dan insight dari data penilaian"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-px border border-border bg-border md:grid-cols-4">
        <div className="bg-background px-5 py-4 transition-colors hover:bg-app-quinary">
          <div className="flex items-center justify-between gap-2">
            <span className="text-app-teritary-invert truncate font-mono text-[10px] uppercase tracking-[0.18em]">Total Review</span>
            <span className="bg-app-primary text-foreground flex size-7 shrink-0 items-center justify-center rounded-lg">
              <FileText className="size-3.5" />
            </span>
          </div>
          <p className="font-display mt-2 text-2xl font-[450] tracking-tight tabular-nums md:text-3xl">{summary.totalReviews}</p>
        </div>

        <div className="bg-background px-5 py-4 transition-colors hover:bg-app-quinary">
          <div className="flex items-center justify-between gap-2">
            <span className="text-app-teritary-invert truncate font-mono text-[10px] uppercase tracking-[0.18em]">Selesai</span>
            <span className="bg-app-primary text-foreground flex size-7 shrink-0 items-center justify-center rounded-lg">
              <CheckCircle2 className="size-3.5" />
            </span>
          </div>
          <p className="font-display mt-2 text-2xl font-[450] tracking-tight tabular-nums md:text-3xl">{summary.completedReviews}</p>
        </div>

        <div className="bg-background px-5 py-4 transition-colors hover:bg-app-quinary">
          <div className="flex items-center justify-between gap-2">
            <span className="text-app-teritary-invert truncate font-mono text-[10px] uppercase tracking-[0.18em]">Pending</span>
            <span className="bg-app-primary text-foreground flex size-7 shrink-0 items-center justify-center rounded-lg">
              <Clock className="size-3.5" />
            </span>
          </div>
          <p className="font-display mt-2 text-2xl font-[450] tracking-tight tabular-nums md:text-3xl">{summary.inProgressReviews + summary.pendingReviews}</p>
        </div>

        <div className="bg-background px-5 py-4 transition-colors hover:bg-app-quinary">
          <div className="flex items-center justify-between gap-2">
            <span className="text-app-teritary-invert truncate font-mono text-[10px] uppercase tracking-[0.18em]">Rata-rata Nilai</span>
            <span className="bg-app-primary text-foreground flex size-7 shrink-0 items-center justify-center rounded-lg">
              <Star className="size-3.5" />
            </span>
          </div>
          <p className="font-display mt-2 text-2xl font-[450] tracking-tight tabular-nums md:text-3xl">{summary.averageScore}</p>
        </div>
      </div>

      {/* Progress & Score Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completion Progress */}
        <Card className="rounded-2xl border border-border bg-card shadow-none">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-app-teritary-invert" />
              <CardTitle className="font-semibold">Progress Review</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-4">
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-app-primary"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${summary.completionRate * 3.51} 351`}
                    className="text-success"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute text-center">
                  <p className="text-3xl font-bold tabular-nums">{summary.completionRate}%</p>
                  <p className="text-xs text-app-teritary-invert">Selesai</p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-app-secondary-invert flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-success"></span>
                  Selesai
                </span>
                <span className="font-semibold tabular-nums">{summary.completedReviews}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-app-secondary-invert flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  Sedang Dikerjakan
                </span>
                <span className="font-semibold tabular-nums">{summary.inProgressReviews}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-app-secondary-invert flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-warning"></span>
                  Belum Dimulai
                </span>
                <span className="font-semibold tabular-nums">{summary.pendingReviews}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Score Distribution */}
        <Card className="rounded-2xl border border-border bg-card shadow-none">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-app-teritary-invert" />
              <CardTitle className="font-semibold">Distribusi Nilai</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-success" />
                    Sangat Baik (90-100)
                  </span>
                  <span className="font-semibold tabular-nums">{scoreDistribution.excellent}</span>
                </div>
                <Progress
                  value={summary.completedReviews > 0 ? (scoreDistribution.excellent / summary.completedReviews) * 100 : 0}
                  className={progressIndicatorClass('success')}
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-primary" />
                    Baik (75-89)
                  </span>
                  <span className="font-semibold tabular-nums">{scoreDistribution.good}</span>
                </div>
                <Progress
                  value={summary.completedReviews > 0 ? (scoreDistribution.good / summary.completedReviews) * 100 : 0}
                  className={progressIndicatorClass('primary')}
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-secondary" />
                    Cukup (60-74)
                  </span>
                  <span className="font-semibold tabular-nums">{scoreDistribution.average}</span>
                </div>
                <Progress
                  value={summary.completedReviews > 0 ? (scoreDistribution.average / summary.completedReviews) * 100 : 0}
                  className={progressIndicatorClass('secondary')}
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-warning" />
                    Kurang (40-59)
                  </span>
                  <span className="font-semibold tabular-nums">{scoreDistribution.belowAverage}</span>
                </div>
                <Progress
                  value={summary.completedReviews > 0 ? (scoreDistribution.belowAverage / summary.completedReviews) * 100 : 0}
                  className={progressIndicatorClass('warning')}
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-destructive" />
                    Sangat Kurang (0-39)
                  </span>
                  <span className="font-semibold tabular-nums">{scoreDistribution.poor}</span>
                </div>
                <Progress
                  value={summary.completedReviews > 0 ? (scoreDistribution.poor / summary.completedReviews) * 100 : 0}
                  className={progressIndicatorClass('danger')}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend Chart */}
      <Card className="rounded-2xl border border-border bg-card shadow-none">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-app-teritary-invert" />
            <CardTitle className="font-semibold">Tren Review 6 Bulan Terakhir</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2 h-48 px-4">
            {monthlyStats.map((month, idx) => (
              <Tooltip key={idx}>
                <TooltipTrigger render={<div className="flex-1" />}>
                  <div className="flex h-full flex-col items-center justify-end gap-2">
                    <div
                      className={cn(
                        'w-full rounded-t-lg transition-all duration-300 hover:opacity-80 cursor-pointer',
                        month.completed > 0 ? 'bg-primary' : 'bg-app-quaternary'
                      )}
                      style={{
                        height: `${(month.completed / maxMonthlyCompleted) * 100}%`,
                        minHeight: month.completed > 0 ? '20px' : '4px',
                      }}
                    />
                    <span className="text-xs text-app-teritary-invert">{month.month}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-center p-1">
                    <p className="font-semibold">{month.month} {month.year}</p>
                    <p className="text-sm">{month.completed} review selesai</p>
                    <p className="text-sm">Rata-rata: {month.averageScore}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Kategori Performance */}
      <Card className="rounded-2xl border border-border bg-card shadow-none">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-app-teritary-invert" />
            <CardTitle className="font-semibold">Performa per Kategori</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {kategoriAverages.map((kategori) => {
              const grade = getGradeLabel(kategori.averagePercentage);
              return (
                <div
                  key={kategori.kategori}
                  className="p-4 rounded-xl border border-border bg-app-quinary"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-app-primary text-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
                      {getKategoriIcon(kategori.kategori)}
                    </div>
                    <span className="font-medium">{kategori.kategori}</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-bold tabular-nums">{Math.round(kategori.averagePercentage)}%</p>
                      <p className="text-xs text-app-teritary-invert">{kategori.totalReviews} review</p>
                    </div>
                    <Badge variant={badgeVariant(grade.color)}>
                      {grade.label}
                    </Badge>
                  </div>
                  <Progress
                    value={kategori.averagePercentage}
                    className={cn('mt-3', progressIndicatorClass(grade.color))}
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Rubrik Details */}
      {rubrikAverages.length > 0 && (
        <Card className="rounded-2xl border border-border bg-card shadow-none">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-app-teritary-invert" />
              <CardTitle className="font-semibold">Detail per Rubrik Penilaian</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Table aria-label="Rubrik statistics table">
              <TableHeader>
                <TableRow>
                  <TableHead>RUBRIK</TableHead>
                  <TableHead>KATEGORI</TableHead>
                  <TableHead className="text-center">RATA-RATA</TableHead>
                  <TableHead className="text-center">PERSENTASE</TableHead>
                  <TableHead className="text-center">GRADE</TableHead>
                  <TableHead className="text-center">TOTAL REVIEW</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rubrikAverages.map((rubrik) => {
                  const grade = getGradeLabel(rubrik.averagePercentage);
                  return (
                    <TableRow key={rubrik.id}>
                      <TableCell>
                        <span className="font-medium">{rubrik.name}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="gap-1">
                          {getKategoriIcon(rubrik.kategori)}
                          {rubrik.kategori}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-semibold tabular-nums">
                          {Math.round(rubrik.averageScore * 10) / 10} / {rubrik.maxScore}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center gap-2 justify-center">
                          <Progress
                            value={rubrik.averagePercentage}
                            className={cn('max-w-20', progressIndicatorClass(grade.color))}
                          />
                          <span className="text-sm font-medium w-12 tabular-nums">
                            {Math.round(rubrik.averagePercentage)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={badgeVariant(grade.color)}>
                          {grade.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center text-app-secondary-invert">
                        {rubrik.totalReviews}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Recent Reviews & Project Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Reviews */}
        <Card className="rounded-2xl border border-border bg-card shadow-none">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-app-teritary-invert" />
              <CardTitle className="font-semibold">Review Terbaru</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {recentReviews.length === 0 ? (
              <p className="text-center text-app-secondary-invert py-8">Belum ada review</p>
            ) : (
              <div className="space-y-3">
                {recentReviews.slice(0, 5).map((review) => (
                  <div
                    key={review.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border bg-app-quinary hover:bg-app-quaternary transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{review.projectTitle}</p>
                      <p className="text-xs text-app-teritary-invert">{review.mahasiswaName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {review.overallScore !== null && (
                        <Badge variant={badgeVariant(getGradeLabel(review.overallScore).color)}>
                          {Math.round(review.overallScore)}
                        </Badge>
                      )}
                      <Badge variant="outline" className="gap-1.5">
                        <span
                          className={cn(
                            'size-1.5 rounded-full',
                            getStatusColor(review.status) === 'success' && 'bg-success',
                            getStatusColor(review.status) === 'primary' && 'bg-primary',
                            getStatusColor(review.status) === 'warning' && 'bg-warning',
                            getStatusColor(review.status) === 'default' && 'bg-muted-foreground'
                          )}
                        />
                        {review.status === 'COMPLETED'
                          ? 'Selesai'
                          : review.status === 'IN_PROGRESS'
                            ? 'Proses'
                            : 'Pending'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Project Status Distribution */}
        <Card className="rounded-2xl border border-border bg-card shadow-none">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-app-teritary-invert" />
              <CardTitle className="font-semibold">Status Project</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(projectStatusCounts).map(([status, count]) => {
                const total = Object.values(projectStatusCounts).reduce((a, b) => a + b, 0);
                const percentage = total > 0 ? (count / total) * 100 : 0;
                const colorMap: Record<string, LegacyColor> = {
                  DRAFT: 'default',
                  SUBMITTED: 'primary',
                  IN_REVIEW: 'primary',
                  REVISION_NEEDED: 'warning',
                  APPROVED: 'success',
                  REJECTED: 'danger',
                };
                return (
                  <div key={status}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{getProjectStatusLabel(status)}</span>
                      <span className="font-semibold tabular-nums">{count}</span>
                    </div>
                    <Progress
                      value={percentage}
                      className={progressIndicatorClass(colorMap[status] || 'default')}
                    />
                  </div>
                );
              })}
            </div>

            {projectsBySemester.length > 0 && (
              <>
                <Separator className="my-4" />
                <div>
                  <p className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Project per Semester
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {projectsBySemester.map((sem, idx) => (
                      <Badge key={idx} variant="outline">
                        {sem.semester} {sem.tahunAkademik}: {sem.count}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
