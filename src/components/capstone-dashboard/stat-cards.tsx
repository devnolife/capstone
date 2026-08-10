'use client';

import type { ReactNode } from 'react';

import {
  ACCENT_CARD,
  ACCENT_SOLID,
  CARD_FX,
  type AccentName,
} from '@/components/capstone-dashboard/accent';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  FolderGitIcon,
  MessagesSquareIcon,
  FileWarningIcon,
  PresentationIcon,
} from 'lucide-react';

type Stat = {
  label: string;
  value: string;
  icon: ReactNode;
  accent: AccentName;
  badgeText: string;
  headline: string;
  detail: string;
};

const STATS: Stat[] = [
  {
    label: 'Total Project Aktif',
    value: '42',
    icon: <FolderGitIcon className="size-4" />,
    accent: 'brand',
    badgeText: 'Semester ini',
    headline: '14 tim angkatan 2022',
    detail: '38 repository sudah terhubung GitHub',
  },
  {
    label: 'Menunggu Review',
    value: '9',
    icon: <MessagesSquareIcon className="size-4" />,
    accent: 'info',
    badgeText: '3 baru',
    headline: 'Rata-rata direview 1,8 hari',
    detail: 'Submission masuk antrean penguji',
  },
  {
    label: 'Perlu Revisi',
    value: '6',
    icon: <FileWarningIcon className="size-4" />,
    accent: 'warning',
    badgeText: '2 mendekati tenggat',
    headline: 'Catatan revisi menunggu tindak lanjut',
    detail: 'Submit ulang sebelum milestone 4',
  },
  {
    label: 'Siap Sidang',
    value: '11',
    icon: <PresentationIcon className="size-4" />,
    accent: 'success',
    badgeText: 'Gel. 1: 22 Des',
    headline: '7 sudah dijadwalkan',
    detail: '4 menunggu penetapan jadwal admin',
  },
];

export function StatCards() {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {STATS.map((stat) => (
        <Card
          key={stat.label}
          className={cn('@container/card', CARD_FX, ACCENT_CARD[stat.accent])}
        >
          <CardHeader>
            <CardDescription className="flex items-center gap-2.5 font-medium text-foreground/70">
              <span
                className={cn(
                  'flex size-8 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3',
                  ACCENT_SOLID[stat.accent],
                )}
              >
                {stat.icon}
              </span>
              {stat.label}
            </CardDescription>
            <CardTitle className="text-3xl font-bold tracking-tight tabular-nums @[250px]/card:text-4xl">
              {stat.value}
            </CardTitle>
            <CardAction>
              <Badge
                variant="outline"
                className="border-transparent bg-background/70 font-medium shadow-sm backdrop-blur-sm dark:bg-background/40"
              >
                {stat.badgeText}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 font-medium">{stat.headline}</div>
            <div className="text-muted-foreground">{stat.detail}</div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
