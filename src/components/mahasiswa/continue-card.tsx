'use client';

import Link from 'next/link';
import { Button, Chip, Progress } from '@heroui/react';
import { ArrowRight, ShieldAlert } from 'lucide-react';
import type { StudentJourney } from '@/lib/student-journey';
import { getStatusColor, getStatusLabel } from '@/lib/utils';

const ACTION_COLOR = {
  primary: 'primary',
  warning: 'warning',
  success: 'success',
  neutral: 'default',
} as const;

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
              <Chip
                size="sm"
                color={getStatusColor(journey.projectStatus)}
                variant="flat"
              >
                {getStatusLabel(journey.projectStatus)}
              </Chip>
            )}
          </div>
          <h2 className="text-lg font-bold truncate">
            {journey.nextAction.label}
          </h2>
          <p className="text-sm text-default-600 line-clamp-2">
            {journey.nextAction.description}
          </p>
          <div className="flex items-center gap-3 pt-1">
            <div className="flex items-center gap-2 w-40">
              <Progress
                value={journey.progress}
                color={journey.progress >= 100 ? 'success' : 'primary'}
                size="sm"
                aria-label={`Progress ${journey.progress}%`}
                className="flex-1"
              />
              <span className="text-xs font-semibold text-default-600">
                {journey.progress}%
              </span>
            </div>
            {journey.deadline && (
              <span
                className={`inline-flex items-center gap-1 text-xs font-medium ${
                  journey.deadline.isPast
                    ? 'text-danger'
                    : journey.deadline.daysRemaining <= 3
                      ? 'text-warning-600'
                      : 'text-default-500'
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
        <Button
          as={Link}
          href={journey.nextAction.href}
          color={ACTION_COLOR[journey.nextAction.tone]}
          size="lg"
          endContent={<ArrowRight size={18} />}
          className="shrink-0 font-semibold"
        >
          Kerjakan Sekarang
        </Button>
      </div>
    </div>
  );
}
