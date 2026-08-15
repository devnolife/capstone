'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  MapPin,
} from 'lucide-react';
import type { StudentJourney, SubmissionBlocker } from '@/lib/student-journey';
import { JourneyStepper } from './journey-stepper';
import { SubmitProjectButton } from '@/components/projects/submit-button';
import type { WorkspaceProject } from './types';
import { resolveBlockerTarget, type WorkspaceTab } from './project-workspace';

interface OverviewTabProps {
  project: WorkspaceProject;
  journey: StudentJourney;
  isOwner: boolean;
  onGoToBlocker: (blocker: SubmissionBlocker) => void;
  onNavigateTab: (tab: WorkspaceTab) => void;
}

export function OverviewTab({
  project,
  journey,
  isOwner,
  onGoToBlocker,
  onNavigateTab,
}: OverviewTabProps) {
  const readiness = journey.readiness;
  const presentation = project.presentationSchedule;

  return (
    <div className="space-y-6 pt-6">
      {/* Journey progress ringkas */}
      <JourneyStepper journey={journey} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Checklist readiness */}
        <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm py-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">Checklist Submission</h2>
              {readiness && (
                <Badge
                  variant="outline"
                  className={
                    readiness.canSubmit
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400'
                      : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400'
                  }
                >
                  {readiness.completedChecks}/{readiness.totalChecks} lengkap
                </Badge>
              )}
            </div>

            {readiness && (
              <Progress
                aria-label="Kelengkapan submission"
                value={(readiness.completedChecks / readiness.totalChecks) * 100}
                className="mb-4"
              />
            )}

            {readiness && readiness.blockers.length > 0 ? (
              <div className="space-y-2">
                {readiness.blockers.map((blocker: SubmissionBlocker, index) => {
                  const target = resolveBlockerTarget(blocker);
                  const navigable = target.tab !== 'ringkasan';
                  return (
                    <button
                      key={`${blocker.code}-${blocker.field ?? index}`}
                      type="button"
                      onClick={() => navigable && onGoToBlocker(blocker)}
                      className={`w-full flex items-start gap-3 p-3 rounded-xl border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-900/10 text-left ${navigable
                          ? 'hover:bg-amber-100 dark:hover:bg-amber-900/20 transition-colors cursor-pointer'
                          : 'cursor-default'
                        }`}
                    >
                      <AlertCircle
                        size={16}
                        className="text-amber-600 mt-0.5 shrink-0"
                      />
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-medium">
                          {blocker.label}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {blocker.description}
                        </span>
                      </span>
                      {navigable && (
                        <ChevronRight
                          size={16}
                          className="text-muted-foreground mt-1 shrink-0"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/40">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <p className="text-sm text-emerald-700 dark:text-emerald-400">
                  Semua persyaratan lengkap — project siap disubmit.
                </p>
              </div>
            )}

            {isOwner &&
              (project.status === 'DRAFT' ||
                project.status === 'REVISION_NEEDED') && (
                <div className="mt-4">
                  <SubmitProjectButton
                    projectId={project.id}
                    currentStatus={project.status}
                  />
                </div>
              )}
          </CardContent>
        </Card>

        {/* Info ringkas */}
        <div className="space-y-6">
          {/* Presentasi */}
          <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm py-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap size={18} className="text-secondary" />
                <h2 className="font-semibold">Jadwal Presentasi</h2>
              </div>
              {presentation ? (
                <div className="space-y-1.5 text-sm">
                  <p className="flex items-center gap-2">
                    <CalendarClock size={14} className="text-muted-foreground" />
                    {new Date(presentation.scheduledDate).toLocaleDateString(
                      'id-ID',
                      {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      },
                    )}{' '}
                    · {presentation.startTime}
                    {presentation.endTime ? `–${presentation.endTime}` : ''}
                  </p>
                  {presentation.location && (
                    <p className="flex items-center gap-2">
                      <MapPin size={14} className="text-muted-foreground" />
                      {presentation.location}
                    </p>
                  )}
                  <Button
                    size="sm"
                    variant="secondary"
                    className="mt-2"
                    onClick={() => onNavigateTab('hasil')}
                  >
                    Lihat detail
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Belum ada jadwal presentasi.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Dosen penguji */}
          <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm py-0">
            <CardContent className="p-6">
              <h2 className="font-semibold mb-3">Dosen Penguji</h2>
              {project.assignments.length > 0 ? (
                <ul className="space-y-1 text-sm">
                  {project.assignments.map((assignment) => (
                    <li key={assignment.id}>{assignment.dosen.name}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Belum ada dosen penguji yang ditugaskan.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
