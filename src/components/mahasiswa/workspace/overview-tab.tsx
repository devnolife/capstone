'use client';

import { Card, CardBody, Chip, Progress, Button } from '@heroui/react';
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
        <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">Checklist Submission</h2>
              {readiness && (
                <Chip
                  size="sm"
                  color={readiness.canSubmit ? 'success' : 'warning'}
                  variant="flat"
                >
                  {readiness.completedChecks}/{readiness.totalChecks} lengkap
                </Chip>
              )}
            </div>

            {readiness && (
              <Progress
                aria-label="Kelengkapan submission"
                value={(readiness.completedChecks / readiness.totalChecks) * 100}
                color={readiness.canSubmit ? 'success' : 'warning'}
                size="sm"
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
                      className={`w-full flex items-start gap-3 p-3 rounded-xl border border-warning-200 dark:border-warning-800/40 bg-warning-50 dark:bg-warning-900/10 text-left ${
                        navigable
                          ? 'hover:bg-warning-100 dark:hover:bg-warning-900/20 transition-colors cursor-pointer'
                          : 'cursor-default'
                      }`}
                    >
                      <AlertCircle
                        size={16}
                        className="text-warning-600 mt-0.5 shrink-0"
                      />
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-medium">
                          {blocker.label}
                        </span>
                        <span className="block text-xs text-default-500">
                          {blocker.description}
                        </span>
                      </span>
                      {navigable && (
                        <ChevronRight
                          size={16}
                          className="text-default-400 mt-1 shrink-0"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-success-50 dark:bg-success-900/10 border border-success-200 dark:border-success-800/40">
                <CheckCircle2 size={16} className="text-success-600" />
                <p className="text-sm text-success-700 dark:text-success-400">
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
          </CardBody>
        </Card>

        {/* Info ringkas */}
        <div className="space-y-6">
          {/* Presentasi */}
          <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardBody className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap size={18} className="text-secondary" />
                <h2 className="font-semibold">Jadwal Presentasi</h2>
              </div>
              {presentation ? (
                <div className="space-y-1.5 text-sm">
                  <p className="flex items-center gap-2">
                    <CalendarClock size={14} className="text-default-400" />
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
                      <MapPin size={14} className="text-default-400" />
                      {presentation.location}
                    </p>
                  )}
                  <Button
                    size="sm"
                    variant="flat"
                    color="secondary"
                    className="mt-2"
                    onPress={() => onNavigateTab('hasil')}
                  >
                    Lihat detail
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-default-400">
                  Belum ada jadwal presentasi.
                </p>
              )}
            </CardBody>
          </Card>

          {/* Dosen penguji */}
          <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardBody className="p-6">
              <h2 className="font-semibold mb-3">Dosen Penguji</h2>
              {project.assignments.length > 0 ? (
                <ul className="space-y-1 text-sm">
                  {project.assignments.map((assignment) => (
                    <li key={assignment.id}>{assignment.dosen.name}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-default-400">
                  Belum ada dosen penguji yang ditugaskan.
                </p>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
