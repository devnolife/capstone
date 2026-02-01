'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Spinner,
  Chip,
  Progress,
  Divider,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Tooltip,
} from '@heroui/react';
import {
  BarChart3,
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

function getKategoriColor(kategori: string): string {
  switch (kategori.toLowerCase()) {
    case 'teknis':
      return 'bg-blue-500';
    case 'dokumentasi':
      return 'bg-emerald-500';
    case 'presentasi':
      return 'bg-purple-500';
    case 'umum':
      return 'bg-amber-500';
    default:
      return 'bg-gray-500';
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
        <Spinner size="lg" label="Memuat statistik..." />
      </div>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardBody className="text-center py-10">
          <AlertCircle className="w-12 h-12 mx-auto text-warning mb-4" />
          <p className="text-default-500">Gagal memuat data statistik</p>
        </CardBody>
      </Card>
    );
  }

  const { summary, scoreDistribution, rubrikAverages, kategoriAverages, recentReviews, monthlyStats, projectStatusCounts, projectsBySemester } = stats;

  // Calculate max for chart scaling
  const maxMonthlyCompleted = Math.max(...monthlyStats.map((m) => m.completed), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-xl">
          <BarChart3 className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Statistik Review</h1>
          <p className="text-default-500 text-sm">Analisis dan insight dari data penilaian</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary.totalReviews}</p>
                <p className="text-xs text-default-500">Total Review</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-success/10 to-success/5">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/20 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary.completedReviews}</p>
                <p className="text-xs text-default-500">Selesai</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-warning/10 to-warning/5">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/20 rounded-lg">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary.inProgressReviews + summary.pendingReviews}</p>
                <p className="text-xs text-default-500">Pending</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary/20 rounded-lg">
                <Star className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary.averageScore}</p>
                <p className="text-xs text-default-500">Rata-rata Nilai</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Progress & Score Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completion Progress */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Progress Review</h3>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
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
                    className="text-default-200"
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
                  <p className="text-3xl font-bold">{summary.completionRate}%</p>
                  <p className="text-xs text-default-500">Selesai</p>
                </div>
              </div>
            </div>

            <Divider />

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-default-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-success"></span>
                  Selesai
                </span>
                <span className="font-semibold">{summary.completedReviews}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-default-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  Sedang Dikerjakan
                </span>
                <span className="font-semibold">{summary.inProgressReviews}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-default-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-warning"></span>
                  Belum Dimulai
                </span>
                <span className="font-semibold">{summary.pendingReviews}</span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Score Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Distribusi Nilai</h3>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-success" />
                    Sangat Baik (90-100)
                  </span>
                  <span className="font-semibold">{scoreDistribution.excellent}</span>
                </div>
                <Progress
                  value={summary.completedReviews > 0 ? (scoreDistribution.excellent / summary.completedReviews) * 100 : 0}
                  color="success"
                  size="sm"
                  className="h-2"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-primary" />
                    Baik (75-89)
                  </span>
                  <span className="font-semibold">{scoreDistribution.good}</span>
                </div>
                <Progress
                  value={summary.completedReviews > 0 ? (scoreDistribution.good / summary.completedReviews) * 100 : 0}
                  color="primary"
                  size="sm"
                  className="h-2"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-secondary" />
                    Cukup (60-74)
                  </span>
                  <span className="font-semibold">{scoreDistribution.average}</span>
                </div>
                <Progress
                  value={summary.completedReviews > 0 ? (scoreDistribution.average / summary.completedReviews) * 100 : 0}
                  color="secondary"
                  size="sm"
                  className="h-2"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-warning" />
                    Kurang (40-59)
                  </span>
                  <span className="font-semibold">{scoreDistribution.belowAverage}</span>
                </div>
                <Progress
                  value={summary.completedReviews > 0 ? (scoreDistribution.belowAverage / summary.completedReviews) * 100 : 0}
                  color="warning"
                  size="sm"
                  className="h-2"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-danger" />
                    Sangat Kurang (0-39)
                  </span>
                  <span className="font-semibold">{scoreDistribution.poor}</span>
                </div>
                <Progress
                  value={summary.completedReviews > 0 ? (scoreDistribution.poor / summary.completedReviews) * 100 : 0}
                  color="danger"
                  size="sm"
                  className="h-2"
                />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Monthly Trend Chart */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Tren Review 6 Bulan Terakhir</h3>
          </div>
        </CardHeader>
        <CardBody>
          <div className="flex items-end gap-2 h-48 px-4">
            {monthlyStats.map((month, idx) => (
              <Tooltip
                key={idx}
                content={
                  <div className="text-center p-1">
                    <p className="font-semibold">{month.month} {month.year}</p>
                    <p className="text-sm">{month.completed} review selesai</p>
                    <p className="text-sm">Rata-rata: {month.averageScore}</p>
                  </div>
                }
              >
                <div className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className={cn(
                      'w-full rounded-t-lg transition-all duration-300 hover:opacity-80 cursor-pointer',
                      month.completed > 0 ? 'bg-gradient-to-t from-primary to-primary/60' : 'bg-default-200'
                    )}
                    style={{
                      height: `${(month.completed / maxMonthlyCompleted) * 100}%`,
                      minHeight: month.completed > 0 ? '20px' : '4px',
                    }}
                  />
                  <span className="text-xs text-default-500">{month.month}</span>
                </div>
              </Tooltip>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Kategori Performance */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Performa per Kategori</h3>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {kategoriAverages.map((kategori) => {
              const grade = getGradeLabel(kategori.averagePercentage);
              return (
                <div
                  key={kategori.kategori}
                  className="p-4 rounded-xl bg-default-50 border border-default-200"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className={cn('p-2 rounded-lg text-white', getKategoriColor(kategori.kategori))}>
                      {getKategoriIcon(kategori.kategori)}
                    </div>
                    <span className="font-medium">{kategori.kategori}</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-bold">{Math.round(kategori.averagePercentage)}%</p>
                      <p className="text-xs text-default-500">{kategori.totalReviews} review</p>
                    </div>
                    <Chip color={grade.color} size="sm" variant="flat">
                      {grade.label}
                    </Chip>
                  </div>
                  <Progress
                    value={kategori.averagePercentage}
                    color={grade.color}
                    size="sm"
                    className="mt-3"
                  />
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* Rubrik Details */}
      {rubrikAverages.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Detail per Rubrik Penilaian</h3>
            </div>
          </CardHeader>
          <CardBody>
            <Table removeWrapper aria-label="Rubrik statistics table">
              <TableHeader>
                <TableColumn>RUBRIK</TableColumn>
                <TableColumn>KATEGORI</TableColumn>
                <TableColumn className="text-center">RATA-RATA</TableColumn>
                <TableColumn className="text-center">PERSENTASE</TableColumn>
                <TableColumn className="text-center">GRADE</TableColumn>
                <TableColumn className="text-center">TOTAL REVIEW</TableColumn>
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
                        <Chip
                          size="sm"
                          variant="flat"
                          startContent={getKategoriIcon(rubrik.kategori)}
                          className="gap-1"
                        >
                          {rubrik.kategori}
                        </Chip>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-semibold">
                          {Math.round(rubrik.averageScore * 10) / 10} / {rubrik.maxScore}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center gap-2 justify-center">
                          <Progress
                            value={rubrik.averagePercentage}
                            color={grade.color}
                            size="sm"
                            className="max-w-20"
                          />
                          <span className="text-sm font-medium w-12">
                            {Math.round(rubrik.averagePercentage)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Chip color={grade.color} size="sm" variant="flat">
                          {grade.label}
                        </Chip>
                      </TableCell>
                      <TableCell className="text-center text-default-500">
                        {rubrik.totalReviews}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      )}

      {/* Recent Reviews & Project Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Reviews */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Review Terbaru</h3>
            </div>
          </CardHeader>
          <CardBody>
            {recentReviews.length === 0 ? (
              <p className="text-center text-default-500 py-8">Belum ada review</p>
            ) : (
              <div className="space-y-3">
                {recentReviews.slice(0, 5).map((review) => (
                  <div
                    key={review.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-default-50 hover:bg-default-100 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{review.projectTitle}</p>
                      <p className="text-xs text-default-500">{review.mahasiswaName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {review.overallScore !== null && (
                        <Chip
                          size="sm"
                          variant="flat"
                          color={getGradeLabel(review.overallScore).color}
                        >
                          {Math.round(review.overallScore)}
                        </Chip>
                      )}
                      <Chip size="sm" variant="dot" color={getStatusColor(review.status)}>
                        {review.status === 'COMPLETED'
                          ? 'Selesai'
                          : review.status === 'IN_PROGRESS'
                          ? 'Proses'
                          : 'Pending'}
                      </Chip>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Project Status Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Status Project</h3>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {Object.entries(projectStatusCounts).map(([status, count]) => {
                const total = Object.values(projectStatusCounts).reduce((a, b) => a + b, 0);
                const percentage = total > 0 ? (count / total) * 100 : 0;
                const colorMap: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'danger'> = {
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
                      <span className="font-semibold">{count}</span>
                    </div>
                    <Progress
                      value={percentage}
                      color={colorMap[status] || 'default'}
                      size="sm"
                      className="h-2"
                    />
                  </div>
                );
              })}
            </div>

            {projectsBySemester.length > 0 && (
              <>
                <Divider className="my-4" />
                <div>
                  <p className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Project per Semester
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {projectsBySemester.map((sem, idx) => (
                      <Chip key={idx} variant="flat" size="sm">
                        {sem.semester} {sem.tahunAkademik}: {sem.count}
                      </Chip>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
