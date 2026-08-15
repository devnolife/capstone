'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { buttonVariants } from '@/components/ui/button';
import { ArrowRight, ShieldAlert } from 'lucide-react';
import type { StudentJourney } from '@/lib/student-journey';
import { cn, getStatusColor, getStatusLabel } from '@/lib/utils';

const ACTION_CLASS = {
  primary: '',
  warning: 'bg-warning text-warning-foreground hover:bg-warning/90',
  success: 'bg-success text-success-foreground hover:bg-success/90',
  neutral: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
} as const;

const STATUS_BADGE_CLASS: Record<string, string> = {
  default: 'bg-muted text-muted-foreground',
  primary: 'bg-primary/10 text-primary',
  secondary: 'bg-secondary text-secondary-foreground',
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-warning',
  danger: 'bg-destructive/10 text-destructive',
};

interface ContinueCardProps {
  journey: StudentJourney;
}

/**
 * Kartu "Lanjutkan" ringkas untuk dashboard — pengganti journey hub penuh.
 * Satu aksi jelas + progress + deadline; detail lengkap ada di workspace.
 */
export function ContinueCard({ journey }: ContinueCardProps) {
  return (
    <div className="rounded-2xl border border-blue-200 dark:border-blue-800/50 bg-gradient-to-br from-blue-50 via-indigo-50 to-white dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-zinc-900 p-5 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-blue-600 dark:text-blue-400">
              Lanjutkan pekerjaan
            </p>
            {journey.projectStatus && (
              <Badge
                className={STATUS_BADGE_CLASS[getStatusColor(journey.projectStatus)]}
              >
                {getStatusLabel(journey.projectStatus)}
              </Badge>
            )}
          </div>
          <h2 className="text-lg font-bold truncate">
            {journey.nextAction.label}
          </h2>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {journey.nextAction.description}
          </p>
          <div className="flex items-center gap-3 pt-1">
            <div className="flex items-center gap-2 w-40">
              <Progress
                value={journey.progress}
                aria-label={`Progress ${journey.progress}%`}
                className={cn(
                  'flex-1',
                  journey.progress >= 100 &&
                  '[&_[data-slot=progress-indicator]]:bg-success'
                )}
              />
              <span className="text-xs font-semibold text-muted-foreground">
                {journey.progress}%
              </span>
            </div>
            {journey.deadline && (
              <span
                className={`inline-flex items-center gap-1 text-xs font-medium ${journey.deadline.isPast
                    ? 'text-destructive'
                    : journey.deadline.daysRemaining <= 3
                      ? 'text-warning'
                      : 'text-muted-foreground'
                  }`}
              >
                <ShieldAlert size={13} />
                {journey.deadline.isPast
                  ? 'Deadline berakhir'
                  : journey.deadline.daysRemaining === 0
                    ? 'Deadline hari ini'
                    : `${journey.deadline.daysRemaining} hari lagi`}
              </span>
            )}
          </div>
        </div>
        <Link
          href={journey.nextAction.href}
          className={cn(
            buttonVariants({ size: 'lg' }),
            ACTION_CLASS[journey.nextAction.tone],
            'shrink-0 font-semibold'
          )}
        >
          Kerjakan Sekarang
          <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}
