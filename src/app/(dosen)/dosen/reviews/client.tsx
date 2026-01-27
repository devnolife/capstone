'use client';

import { useState } from 'react';
import {
  Card,
  CardBody,
  Button,
  Chip,
  Avatar,
  Tabs,
  Tab,
} from '@heroui/react';
import { motion } from 'framer-motion';
import {
  ClipboardCheck,
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

const getStatusColor = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return 'success';
    case 'IN_PROGRESS':
      return 'warning';
    case 'PENDING':
      return 'default';
    case 'APPROVED':
      return 'success';
    case 'REVISION_NEEDED':
      return 'warning';
    case 'SUBMITTED':
      return 'primary';
    default:
      return 'default';
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
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
            <ClipboardCheck size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold">Review Project</h1>
            <p className="text-sm text-default-500">
              Kelola review project mahasiswa
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="border border-zinc-200 dark:border-zinc-800">
            <CardBody className="p-4 text-center">
              <Hourglass size={20} className="mx-auto mb-2 text-amber-500" />
              <p className="text-2xl font-bold">{stats.pendingAssignments}</p>
              <p className="text-xs text-default-500">Perlu Direview</p>
            </CardBody>
          </Card>
          <Card className="border border-zinc-200 dark:border-zinc-800">
            <CardBody className="p-4 text-center">
              <Clock size={20} className="mx-auto mb-2 text-blue-500" />
              <p className="text-2xl font-bold">{stats.inProgressReviews}</p>
              <p className="text-xs text-default-500">Sedang Berjalan</p>
            </CardBody>
          </Card>
          <Card className="border border-zinc-200 dark:border-zinc-800">
            <CardBody className="p-4 text-center">
              <CheckCircle2 size={20} className="mx-auto mb-2 text-emerald-500" />
              <p className="text-2xl font-bold">{stats.completedReviews}</p>
              <p className="text-xs text-default-500">Selesai</p>
            </CardBody>
          </Card>
          <Card className="border border-zinc-200 dark:border-zinc-800">
            <CardBody className="p-4 text-center">
              <BarChart3 size={20} className="mx-auto mb-2 text-violet-500" />
              <p className="text-2xl font-bold">{stats.totalReviews}</p>
              <p className="text-xs text-default-500">Total Review</p>
            </CardBody>
          </Card>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs
          selectedKey={selectedTab}
          onSelectionChange={(key) => setSelectedTab(key as string)}
          variant="underlined"
          classNames={{
            tabList: 'gap-4',
            tab: 'px-0 h-10',
          }}
        >
          <Tab
            key="pending"
            title={
              <div className="flex items-center gap-2">
                <Hourglass size={16} />
                <span>Perlu Direview</span>
                {stats.pendingAssignments > 0 && (
                  <Chip size="sm" variant="flat" color="warning">
                    {stats.pendingAssignments}
                  </Chip>
                )}
              </div>
            }
          />
          <Tab
            key="history"
            title={
              <div className="flex items-center gap-2">
                <FileText size={16} />
                <span>Riwayat Review</span>
                {stats.totalReviews > 0 && (
                  <Chip size="sm" variant="flat">
                    {stats.totalReviews}
                  </Chip>
                )}
              </div>
            }
          />
        </Tabs>
      </motion.div>

      {/* Content */}
      <motion.div variants={itemVariants} className="space-y-3">
        {selectedTab === 'pending' ? (
          <>
            {pendingAssignments.length === 0 ? (
              <Card className="border border-zinc-200 dark:border-zinc-800">
                <CardBody className="p-8 text-center">
                  <CheckCircle2 size={48} className="mx-auto mb-4 text-emerald-500" />
                  <p className="font-semibold">Tidak ada project yang perlu direview</p>
                  <p className="text-sm text-default-500 mt-1">
                    Semua project yang ditugaskan sudah direview
                  </p>
                </CardBody>
              </Card>
            ) : (
              pendingAssignments.map((assignment) => {
                const avatarSrc = assignment.project.mahasiswa.profilePhoto || assignment.project.mahasiswa.image || getSimakPhotoUrl(assignment.project.mahasiswa.username);

                return (
                  <Card
                    key={assignment.id}
                    className="border border-zinc-200 dark:border-zinc-800 hover:border-primary/50 transition-colors"
                  >
                    <CardBody className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Avatar
                            name={assignment.project.mahasiswa.name}
                            src={avatarSrc}
                            size="md"
                            className="shrink-0"
                          />
                          <div className="min-w-0">
                            <h3 className="font-semibold text-sm truncate">
                              {assignment.project.title}
                            </h3>
                            <p className="text-xs text-default-500">
                              {assignment.project.mahasiswa.name} ({assignment.project.mahasiswa.username})
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Chip
                                size="sm"
                                color={getStatusColor(assignment.project.status)}
                                variant="flat"
                              >
                                {getStatusLabel(assignment.project.status)}
                              </Chip>
                              {assignment.project.submittedAt && (
                                <span className="text-xs text-default-400 flex items-center gap-1">
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
                            as={Link}
                            href={`/dosen/projects/${assignment.project.id}`}
                            size="sm"
                            variant="flat"
                            startContent={<Eye size={14} />}
                          >
                            Lihat
                          </Button>
                          <Button
                            as={Link}
                            href={`/dosen/projects/${assignment.project.id}/review`}
                            size="sm"
                            color="primary"
                            startContent={<PlayCircle size={14} />}
                          >
                            Mulai Review
                          </Button>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                );
              })
            )}
          </>
        ) : (
          <>
            {reviews.length === 0 ? (
              <Card className="border border-zinc-200 dark:border-zinc-800">
                <CardBody className="p-8 text-center">
                  <FileText size={48} className="mx-auto mb-4 text-default-300" />
                  <p className="font-semibold">Belum ada riwayat review</p>
                  <p className="text-sm text-default-500 mt-1">
                    Review yang sudah selesai akan muncul di sini
                  </p>
                </CardBody>
              </Card>
            ) : (
              reviews.map((review) => {
                const avatarSrc = review.project.mahasiswa.profilePhoto || review.project.mahasiswa.image || getSimakPhotoUrl(review.project.mahasiswa.username);

                return (
                  <Card
                    key={review.id}
                    className="border border-zinc-200 dark:border-zinc-800 hover:border-primary/50 transition-colors"
                  >
                    <CardBody className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Avatar
                            name={review.project.mahasiswa.name}
                            src={avatarSrc}
                            size="md"
                            className="shrink-0"
                          />
                          <div className="min-w-0">
                            <h3 className="font-semibold text-sm truncate">
                              {review.project.title}
                            </h3>
                            <p className="text-xs text-default-500">
                              {review.project.mahasiswa.name} ({review.project.mahasiswa.username})
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Chip
                                size="sm"
                                color={getStatusColor(review.status)}
                                variant="flat"
                              >
                                {getStatusLabel(review.status)}
                              </Chip>
                              {review.overallScore !== null && (
                                <Chip size="sm" variant="flat" color="secondary">
                                  Skor: {review.overallScore}
                                </Chip>
                              )}
                              <span className="text-xs text-default-400 flex items-center gap-1">
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
                            as={Link}
                            href={`/dosen/projects/${review.project.id}`}
                            size="sm"
                            variant="flat"
                            startContent={<Eye size={14} />}
                          >
                            Lihat
                          </Button>
                          {review.status === 'IN_PROGRESS' && (
                            <Button
                              as={Link}
                              href={`/dosen/projects/${review.project.id}/review`}
                              size="sm"
                              color="warning"
                              startContent={<PlayCircle size={14} />}
                            >
                              Lanjutkan
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardBody>
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
