'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarClock, GraduationCap, MapPin, User } from 'lucide-react';
import { MahasiswaReviewsContent } from '@/components/mahasiswa/reviews-content';
import type {
  WorkspacePresentation,
  WorkspaceReview,
  ReviewStats,
} from './types';

interface ResultTabProps {
  reviews: WorkspaceReview[];
  reviewStats: ReviewStats;
  presentationSchedule: WorkspacePresentation | null;
}

const PRESENTATION_STATUS: Record<
  string,
  { label: string; className: string }
> = {
  scheduled: {
    label: 'Terjadwal',
    className:
      'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-400',
  },
  completed: {
    label: 'Selesai',
    className:
      'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400',
  },
  cancelled: {
    label: 'Dibatalkan',
    className:
      'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400',
  },
  rescheduled: {
    label: 'Dijadwalkan Ulang',
    className:
      'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400',
  },
};

export function ResultTab({
  reviews,
  reviewStats,
  presentationSchedule,
}: ResultTabProps) {
  const status = presentationSchedule
    ? (PRESENTATION_STATUS[presentationSchedule.presentationStatus] ?? {
      label: presentationSchedule.presentationStatus,
      className:
        'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-400',
    })
    : null;

  return (
    <div className="space-y-6 pt-6">
      {/* Jadwal presentasi detail */}
      {presentationSchedule && (
        <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm py-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <GraduationCap size={18} className="text-secondary" />
              <h2 className="font-semibold text-lg">Jadwal Presentasi</h2>
              {status && (
                <Badge variant="outline" className={status.className}>
                  {status.label}
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <p className="flex items-center gap-2">
                <CalendarClock size={14} className="text-muted-foreground" />
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
                  <MapPin size={14} className="text-muted-foreground" />
                  {presentationSchedule.location}
                </p>
              )}
              <p className="flex items-center gap-2">
                <User size={14} className="text-muted-foreground" />
                Dijadwalkan oleh {presentationSchedule.scheduledBy.name}
              </p>
            </div>
            {presentationSchedule.notes && (
              <p className="mt-3 text-xs text-muted-foreground whitespace-pre-wrap">
                {presentationSchedule.notes}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Review & feedback dosen */}
      <MahasiswaReviewsContent reviews={reviews} stats={reviewStats} />
    </div>
  );
}
