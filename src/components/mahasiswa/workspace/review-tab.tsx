'use client';

import { Card, CardBody, Chip } from '@heroui/react';
import { CalendarClock, GraduationCap, MapPin, User } from 'lucide-react';
import { MahasiswaReviewsContent } from '@/components/mahasiswa/reviews-content';
import type {
  WorkspacePresentation,
  WorkspaceReview,
  ReviewStats,
} from './types';

interface ReviewTabProps {
  reviews: WorkspaceReview[];
  reviewStats: ReviewStats;
  presentationSchedule: WorkspacePresentation | null;
}

const PRESENTATION_STATUS: Record<
  string,
  { label: string; color: 'primary' | 'success' | 'danger' | 'warning' }
> = {
  scheduled: { label: 'Terjadwal', color: 'primary' },
  completed: { label: 'Selesai', color: 'success' },
  cancelled: { label: 'Dibatalkan', color: 'danger' },
  rescheduled: { label: 'Dijadwalkan Ulang', color: 'warning' },
};

export function ReviewTab({
  reviews,
  reviewStats,
  presentationSchedule,
}: ReviewTabProps) {
  const status = presentationSchedule
    ? (PRESENTATION_STATUS[presentationSchedule.presentationStatus] ?? {
        label: presentationSchedule.presentationStatus,
        color: 'primary' as const,
      })
    : null;

  return (
    <div className="space-y-6 pt-6">
      {/* Jadwal presentasi detail */}
      {presentationSchedule && (
        <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <CardBody className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <GraduationCap size={18} className="text-secondary" />
              <h2 className="font-semibold text-lg">Jadwal Presentasi</h2>
              {status && (
                <Chip size="sm" color={status.color} variant="flat">
                  {status.label}
                </Chip>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <p className="flex items-center gap-2">
                <CalendarClock size={14} className="text-default-400" />
                {new Date(presentationSchedule.scheduledDate).toLocaleDateString(
                  'id-ID',
                  {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  },
                )}{' '}
                · {presentationSchedule.startTime}
                {presentationSchedule.endTime
                  ? `–${presentationSchedule.endTime}`
                  : ''}
              </p>
              {presentationSchedule.location && (
                <p className="flex items-center gap-2">
                  <MapPin size={14} className="text-default-400" />
                  {presentationSchedule.location}
                </p>
              )}
              <p className="flex items-center gap-2">
                <User size={14} className="text-default-400" />
                Dijadwalkan oleh {presentationSchedule.scheduledBy.name}
              </p>
            </div>
            {presentationSchedule.notes && (
              <p className="mt-3 text-xs text-default-500 whitespace-pre-wrap">
                {presentationSchedule.notes}
              </p>
            )}
          </CardBody>
        </Card>
      )}

      {/* Review & feedback dosen */}
      <MahasiswaReviewsContent reviews={reviews} stats={reviewStats} />
    </div>
  );
}
