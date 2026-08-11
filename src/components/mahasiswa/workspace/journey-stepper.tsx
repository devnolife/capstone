'use client';

import { Chip, Progress, Tooltip } from '@heroui/react';
import {
  CalendarCheck,
  Check,
  ClipboardList,
  FileCheck2,
  FolderGit2,
  Github,
  MessageSquareText,
  Send,
  Trophy,
} from 'lucide-react';
import type {
  JourneyStageId,
  JourneyStageStatus,
  StudentJourney,
} from '@/lib/student-journey';
import { getStatusColor, getStatusLabel } from '@/lib/utils';

const STAGE_ICONS = {
  account: Github,
  project: FolderGit2,
  requirements: ClipboardList,
  evidence: FileCheck2,
  submission: Send,
  review: MessageSquareText,
  presentation: CalendarCheck,
  result: Trophy,
} satisfies Record<JourneyStageId, typeof Github>;

const DOT_STYLES: Record<JourneyStageStatus, string> = {
  complete: 'bg-emerald-500 text-white',
  current: 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900/50',
  blocked: 'bg-amber-500 text-white',
  waiting: 'bg-violet-500 text-white',
  upcoming: 'bg-default-200 text-default-500 dark:bg-default-100/20',
};

const CONNECTOR_DONE = 'bg-emerald-400';
const CONNECTOR_TODO = 'bg-default-200 dark:bg-default-100/20';

interface JourneyStepperProps {
  journey: StudentJourney;
}

/**
 * Stepper journey ringkas 1 baris — pengganti grid 8 kartu StudentJourneyHub
 * agar checklist & aksi di bawahnya langsung terlihat tanpa scroll.
 */
export function JourneyStepper({ journey }: JourneyStepperProps) {
  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold">Perjalanan Capstone</h2>
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
        <div className="flex items-center gap-2 min-w-44">
          <Progress
            value={journey.progress}
            color={journey.progress >= 100 ? 'success' : 'primary'}
            size="sm"
            aria-label={`Progress ${journey.progress}%`}
            className="flex-1"
          />
          <span className="text-xs font-semibold text-default-600 w-9 text-right">
            {journey.progress}%
          </span>
        </div>
      </div>

      <div className="flex items-center overflow-x-auto pb-1">
        {journey.stages.map((stage, index) => {
          const Icon = STAGE_ICONS[stage.id];
          const isLast = index === journey.stages.length - 1;
          return (
            <div key={stage.id} className="flex items-center flex-1 min-w-fit">
              <Tooltip
                content={
                  <div className="max-w-52 py-1">
                    <p className="text-xs font-semibold">{stage.label}</p>
                    <p className="text-[11px] text-default-500">
                      {stage.description}
                    </p>
                  </div>
                }
              >
                <div className="flex flex-col items-center gap-1.5 px-1 cursor-default">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${DOT_STYLES[stage.status]}`}
                  >
                    {stage.status === 'complete' ? (
                      <Check size={16} />
                    ) : (
                      <Icon size={15} />
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-medium whitespace-nowrap ${
                      stage.status === 'current'
                        ? 'text-blue-600 dark:text-blue-400'
                        : stage.status === 'blocked'
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-default-500'
                    }`}
                  >
                    {stage.label}
                  </span>
                </div>
              </Tooltip>
              {!isLast && (
                <div
                  className={`h-0.5 flex-1 min-w-4 rounded-full mx-0.5 mb-5 ${
                    stage.status === 'complete' ? CONNECTOR_DONE : CONNECTOR_TODO
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
