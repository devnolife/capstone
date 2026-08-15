'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import {
  Clock,
  CheckCircle2,
  FileText,
  Calendar,
  BarChart3,
  Eye,
  PlayCircle,
  Hourglass,
} from 'lucide-react';
import Link from 'next/link';
import { getSimakPhotoUrl } from '@/lib/utils';
import { PageHeader } from '@/components/caret/PageHeader';

interface Review {
  id: string;
  status: string;
  overallScore: number | null;
  createdAt: string;
  updatedAt: string;
  project: {
    id: string;
    title: string;
    status: string;
    mahasiswa: {
      name: string;
      username: string;
      image: string | null;
      profilePhoto: string | null;
    };
  };
}

interface PendingAssignment {
  id: string;
  project: {
    id: string;
    title: string;
    status: string;
    submittedAt: string | null;
    mahasiswa: {
      name: string;
      username: string;
      image: string | null;
      profilePhoto: string | null;
    };
  };
}

interface DosenReviewsClientProps {
  reviews: Review[];
  pendingAssignments: PendingAssignment[];
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

const getStatusVariant = (
  status: string
): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'COMPLETED':
      return 'secondary';
    case 'IN_PROGRESS':
      return 'outline';
    case 'PENDING':
      return 'outline';
    case 'APPROVED':
      return 'secondary';
    case 'REVISION_NEEDED':
      return 'outline';
    case 'SUBMITTED':
      return 'default';
    default:
      return 'outline';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return 'Selesai';
    case 'IN_PROGRESS':
      return 'Sedang Direview';
    case 'PENDING':
      return 'Belum Mulai';
    case 'APPROVED':
      return 'Disetujui';
    case 'REVISION_NEEDED':
      return 'Perlu Revisi';
    case 'SUBMITTED':
      return 'Menunggu Review';
    default:
      return status;
  }
};

export function DosenReviewsClient({ reviews, pendingAssignments }: DosenReviewsClientProps) {
  const [selectedTab, setSelectedTab] = useState('pending');

  const stats = {
    totalReviews: reviews.length,
    completedReviews: reviews.filter((r) => r.status === 'COMPLETED').length,
    inProgressReviews: reviews.filter((r) => r.status === 'IN_PROGRESS').length,
    pendingAssignments: pendingAssignments.length,
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
          label="[04] REVIEW"
          labelRight="/ SAYA"
          title="Review Project"
          description="Kelola review project mahasiswa"
        />
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-2 gap-px border border-border bg-border md:grid-cols-4">
          <div className="bg-background px-5 py-4 transition-colors hover:bg-app-quinary">
            <div className="flex items-center justify-between gap-2">
              <span className="text-app-teritary-invert truncate font-mono text-[10px] uppercase tracking-[0.18em]">Perlu Direview</span>
              <span className="bg-app-primary text-foreground flex size-7 shrink-0 items-center justify-center rounded-lg">
                <Hourglass size={14} />
              </span>
            </div>
            <p className="font-display mt-2 text-2xl font-[450] tracking-tight tabular-nums md:text-3xl">{stats.pendingAssignments}</p>
          </div>
          <div className="bg-background px-5 py-4 transition-colors hover:bg-app-quinary">
            <div className="flex items-center justify-between gap-2">
              <span className="text-app-teritary-invert truncate font-mono text-[10px] uppercase tracking-[0.18em]">Sedang Berjalan</span>
              <span className="bg-app-primary text-foreground flex size-7 shrink-0 items-center justify-center rounded-lg">
                <Clock size={14} />
              </span>
            </div>
            <p className="font-display mt-2 text-2xl font-[450] tracking-tight tabular-nums md:text-3xl">{stats.inProgressReviews}</p>
          </div>
          <div className="bg-background px-5 py-4 transition-colors hover:bg-app-quinary">
            <div className="flex items-center justify-between gap-2">
              <span className="text-app-teritary-invert truncate font-mono text-[10px] uppercase tracking-[0.18em]">Selesai</span>
              <span className="bg-app-primary text-foreground flex size-7 shrink-0 items-center justify-center rounded-lg">
                <CheckCircle2 size={14} />
              </span>
            </div>
            <p className="font-display mt-2 text-2xl font-[450] tracking-tight tabular-nums md:text-3xl">{stats.completedReviews}</p>
          </div>
          <div className="bg-background px-5 py-4 transition-colors hover:bg-app-quinary">
            <div className="flex items-center justify-between gap-2">
              <span className="text-app-teritary-invert truncate font-mono text-[10px] uppercase tracking-[0.18em]">Total Review</span>
              <span className="bg-app-primary text-foreground flex size-7 shrink-0 items-center justify-center rounded-lg">
                <BarChart3 size={14} />
              </span>
            </div>
            <p className="font-display mt-2 text-2xl font-[450] tracking-tight tabular-nums md:text-3xl">{stats.totalReviews}</p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs
          value={selectedTab}
          onValueChange={(value) => setSelectedTab(value as string)}
        >
          <TabsList variant="line" className="gap-4">
            <TabsTrigger value="pending" className="h-10">
              <Hourglass size={16} />
              <span>Perlu Direview</span>
              {stats.pendingAssignments > 0 && (
                <Badge variant="outline">{stats.pendingAssignments}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="history" className="h-10">
              <FileText size={16} />
              <span>Riwayat Review</span>
              {stats.totalReviews > 0 && (
                <Badge variant="outline">{stats.totalReviews}</Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </motion.div>

      {/* Content */}
      <motion.div variants={itemVariants} className="space-y-3">
        {selectedTab === 'pending' ? (
          <>
            {pendingAssignments.length === 0 ? (
              <Card className="rounded-2xl border border-border bg-card shadow-none">
                <CardContent className="p-8 text-center">
                  <CheckCircle2 size={48} className="mx-auto mb-4 text-success" />
                  <p className="font-semibold">Tidak ada project yang perlu direview</p>
                  <p className="text-sm text-app-secondary-invert mt-1">
                    Semua project yang ditugaskan sudah direview
                  </p>
                </CardContent>
              </Card>
            ) : (
              pendingAssignments.map((assignment) => {
                const avatarSrc = assignment.project.mahasiswa.profilePhoto || assignment.project.mahasiswa.image || getSimakPhotoUrl(assignment.project.mahasiswa.username);

                return (
                  <Card
                    key={assignment.id}
                    className="rounded-2xl border border-border bg-card shadow-none hover:border-primary/50 transition-colors"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Avatar className="size-10 shrink-0">
                            <AvatarImage
                              src={avatarSrc}
                              alt={assignment.project.mahasiswa.name}
                            />
                            <AvatarFallback>
                              {assignment.project.mahasiswa.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-sm truncate">
                              {assignment.project.title}
                            </h3>
                            <p className="text-xs text-app-secondary-invert">
                              {assignment.project.mahasiswa.name} ({assignment.project.mahasiswa.username})
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={getStatusVariant(assignment.project.status)}>
                                {getStatusLabel(assignment.project.status)}
                              </Badge>
                              {assignment.project.submittedAt && (
                                <span className="text-xs text-app-teritary-invert flex items-center gap-1">
                                  <Calendar size={10} />
                                  {new Date(assignment.project.submittedAt).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  })}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            render={<Link href={`/dosen/projects/${assignment.project.id}`} />}
                            size="sm"
                            variant="secondary"
                          >
                            <Eye size={14} />
                            Lihat
                          </Button>
                          <Button
                            render={<Link href={`/dosen/projects/${assignment.project.id}/review`} />}
                            size="sm"
                          >
                            <PlayCircle size={14} />
                            Mulai Review
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </>
        ) : (
          <>
            {reviews.length === 0 ? (
              <Card className="rounded-2xl border border-border bg-card shadow-none">
                <CardContent className="p-8 text-center">
                  <FileText size={48} className="mx-auto mb-4 text-app-teritary-invert" />
                  <p className="font-semibold">Belum ada riwayat review</p>
                  <p className="text-sm text-app-secondary-invert mt-1">
                    Review yang sudah selesai akan muncul di sini
                  </p>
                </CardContent>
              </Card>
            ) : (
              reviews.map((review) => {
                const avatarSrc = review.project.mahasiswa.profilePhoto || review.project.mahasiswa.image || getSimakPhotoUrl(review.project.mahasiswa.username);

                return (
                  <Card
                    key={review.id}
                    className="rounded-2xl border border-border bg-card shadow-none hover:border-primary/50 transition-colors"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Avatar className="size-10 shrink-0">
                            <AvatarImage
                              src={avatarSrc}
                              alt={review.project.mahasiswa.name}
                            />
                            <AvatarFallback>
                              {review.project.mahasiswa.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-sm truncate">
                              {review.project.title}
                            </h3>
                            <p className="text-xs text-app-secondary-invert">
                              {review.project.mahasiswa.name} ({review.project.mahasiswa.username})
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={getStatusVariant(review.status)}>
                                {getStatusLabel(review.status)}
                              </Badge>
                              {review.overallScore !== null && (
                                <Badge variant="secondary">
                                  Skor: {review.overallScore}
                                </Badge>
                              )}
                              <span className="text-xs text-app-teritary-invert flex items-center gap-1">
                                <Clock size={10} />
                                {new Date(review.updatedAt).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            render={<Link href={`/dosen/projects/${review.project.id}`} />}
                            size="sm"
                            variant="secondary"
                          >
                            <Eye size={14} />
                            Lihat
                          </Button>
                          {review.status === 'IN_PROGRESS' && (
                            <Button
                              render={<Link href={`/dosen/projects/${review.project.id}/review`} />}
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
                );
              })
            )}
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
