'use client';

import Link from 'next/link';
import {
  Button,
  Card,
  CardBody,
  Chip,
  Progress,
} from '@heroui/react';
import {
  ArrowRight,
  CalendarCheck,
  Check,
  CircleDashed,
  ClipboardList,
  Clock3,
  FileCheck2,
  FolderGit2,
  Github,
  MapPin,
  MessageSquareText,
  Send,
  ShieldAlert,
  Trophy,
} from 'lucide-react';
import type {
  JourneyStageId,
  JourneyStageStatus,
  StudentJourney,
} from '@/lib/student-journey';
import { getStatusColor, getStatusLabel } from '@/lib/utils';

interface StudentJourneyHubProps {
  journey: StudentJourney;
}

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

const STATUS_STYLES: Record<
  JourneyStageStatus,
  { icon: string; surface: string; label: string }
> = {
  complete: {
    icon: 'bg-emerald-500 text-white',
    surface: 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-800 dark:bg-emerald-950/20',
    label: 'Selesai',
  },
  current: {
    icon: 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900/50',
    surface: 'border-blue-300 bg-blue-50/80 dark:border-blue-700 dark:bg-blue-950/25',
    label: 'Saat ini',
  },
  blocked: {
    icon: 'bg-amber-500 text-white',
    surface: 'border-amber-200 bg-amber-50/70 dark:border-amber-800 dark:bg-amber-950/20',
    label: 'Perlu dilengkapi',
  },
  waiting: {
    icon: 'bg-violet-500 text-white',
    surface: 'border-violet-200 bg-violet-50/70 dark:border-violet-800 dark:bg-violet-950/20',
    label: 'Menunggu',
  },
  upcoming: {
    icon: 'bg-default-200 text-default-500 dark:bg-default-100/20',
    surface: 'border-default-200 bg-default-50/60 dark:bg-default-100/5',
    label: 'Berikutnya',
  },
};

const ACTION_COLOR = {
  primary: 'primary',
  warning: 'warning',
  success: 'success',
  neutral: 'default',
} as const;

const formatPresentationDate = (value: Date | string) =>
  new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Makassar',
  }).format(new Date(value));

export function StudentJourneyHub({ journey }: StudentJourneyHubProps) {
  return (
    <Card className="overflow-hidden border border-zinc-200 shadow-sm dark:border-zinc-800">
      <div className="relative overflow-hidden border-b border-zinc-200 bg-zinc-950 px-5 py-6 text-white dark:border-zinc-800 md:px-6">
        <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-blue-500/25 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 h-44 w-44 rounded-full bg-emerald-400/15 blur-3xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
                Perjalanan Capstone
              </p>
              {journey.projectStatus ? (
                <Chip
                  size="sm"
                  color={getStatusColor(journey.projectStatus)}
                  variant="flat"
                  className="bg-white/10 text-white"
                >
                  {getStatusLabel(journey.projectStatus)}
                </Chip>
              ) : null}
            </div>
            <h2 className="max-w-2xl text-xl font-semibold md:text-2xl">
              {journey.projectTitle ?? 'Mulai project capstone Anda'}
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">
              Semua tahapan, kekurangan, dan tindakan berikutnya dirangkum di satu tempat.
            </p>
          </div>

          <div className="min-w-56 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-zinc-400">Progress keseluruhan</span>
              <span className="font-semibold text-white">{journey.progress}%</span>
            </div>
            <Progress
              value={journey.progress}
              color="primary"
              size="sm"
              aria-label={`Progress perjalanan capstone ${journey.progress}%`}
              classNames={{ track: 'bg-white/10' }}
            />
          </div>
        </div>
      </div>

      <CardBody className="space-y-5 p-4 md:p-6">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-8">
          {journey.stages.map((stage, index) => {
            const Icon = STAGE_ICONS[stage.id];
            const style = STATUS_STYLES[stage.status];

            return (
              <div
                key={stage.id}
                className={`relative min-h-36 rounded-2xl border p-3 transition-transform hover:-translate-y-0.5 ${style.surface}`}
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${style.icon}`}>
                    {stage.status === 'complete' ? <Check size={17} /> : <Icon size={17} />}
                  </div>
                  <span className="text-[10px] font-semibold text-default-400">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                <p className="text-sm font-semibold text-default-800">{stage.label}</p>
                <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-default-500">
                  {stage.description}
                </p>
                <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-default-400">
                  {style.label}
                </p>
              </div>
            );
          })}
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.42fr)]">
          <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 dark:border-blue-800 dark:from-blue-950/30 dark:to-indigo-950/20 md:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-blue-600 p-2.5 text-white">
                  <ArrowRight size={19} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                    Langkah berikutnya
                  </p>
                  <h3 className="mt-0.5 font-semibold text-default-900">
                    {journey.nextAction.label}
                  </h3>
                  <p className="mt-1 text-sm text-default-600">
                    {journey.nextAction.description}
                  </p>
                </div>
              </div>
              <Button
                as={Link}
                href={journey.nextAction.href}
                color={ACTION_COLOR[journey.nextAction.tone]}
                endContent={<ArrowRight size={16} />}
                className="shrink-0"
              >
                Buka
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {journey.deadline ? (
              <div
                className={`rounded-2xl border p-4 ${journey.deadline.isPast
                    ? 'border-danger-200 bg-danger-50 dark:border-danger-800 dark:bg-danger-950/20'
                    : journey.deadline.daysRemaining <= 3
                      ? 'border-warning-200 bg-warning-50 dark:border-warning-800 dark:bg-warning-950/20'
                      : 'border-default-200 bg-default-50 dark:bg-default-100/5'
                  }`}
              >
                <div className="flex items-start gap-3">
                  <ShieldAlert
                    size={18}
                    className={journey.deadline.isPast ? 'text-danger' : 'text-warning'}
                  />
                  <div>
                    <p className="text-xs font-medium text-default-500">Batas submission</p>
                    <p className="text-sm font-semibold">
                      {journey.deadline.isPast
                        ? 'Sudah berakhir'
                        : journey.deadline.daysRemaining === 0
                          ? 'Hari ini'
                          : `${journey.deadline.daysRemaining} hari lagi`}
                    </p>
                    <p className="mt-0.5 text-xs text-default-500">
                      {new Intl.DateTimeFormat('id-ID', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                        timeZone: 'Asia/Makassar',
                      }).format(new Date(journey.deadline.at))} WITA
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-default-200 bg-default-50 p-4 dark:bg-default-100/5">
                <div className="flex items-start gap-3">
                  <CircleDashed size={18} className="text-default-400" />
                  <div>
                    <p className="text-xs font-medium text-default-500">Batas submission</p>
                    <p className="text-sm font-semibold">Belum ditetapkan</p>
                  </div>
                </div>
              </div>
            )}

            {journey.reviewProgress.total > 0 ? (
              <div className="rounded-2xl border border-default-200 bg-default-50 p-4 dark:bg-default-100/5">
                <div className="flex items-start gap-3">
                  <MessageSquareText size={18} className="text-violet-500" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-medium text-default-500">Progress review</p>
                      <p className="text-xs font-semibold">
                        {journey.reviewProgress.completed}/{journey.reviewProgress.total}
                      </p>
                    </div>
                    <Progress
                      className="mt-2"
                      size="sm"
                      color="secondary"
                      aria-label="Progress review dosen"
                      value={
                        (journey.reviewProgress.completed /
                          journey.reviewProgress.total) *
                        100
                      }
                    />
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {journey.presentation ? (
          <div className="flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-800 dark:bg-emerald-950/20 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-emerald-500 p-2.5 text-white">
                <CalendarCheck size={19} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                  Jadwal Presentasi
                </p>
                <p className="mt-0.5 font-semibold">
                  {formatPresentationDate(journey.presentation.scheduledDate)}
                </p>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-default-600">
                  <span className="flex items-center gap-1.5">
                    <Clock3 size={14} />
                    {journey.presentation.startTime}
                    {journey.presentation.endTime
                      ? ` - ${journey.presentation.endTime}`
                      : ''}
                  </span>
                  {journey.presentation.location ? (
                    <span className="flex items-center gap-1.5">
                      <MapPin size={14} />
                      {journey.presentation.location}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
            <Button
              as={Link}
              href="/mahasiswa/presentations"
              color="success"
              variant="flat"
              endContent={<ArrowRight size={16} />}
            >
              Detail Jadwal
            </Button>
          </div>
        ) : null}
      </CardBody>
    </Card>
  );
}
