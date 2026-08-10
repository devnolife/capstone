'use client';

import {
  ACCENT_CARD,
  ACCENT_DOT,
  ACCENT_ORDER,
  ACCENT_SOLID,
  CARD_FX,
} from '@/components/capstone-dashboard/accent';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ActivityIcon, CalendarClockIcon } from 'lucide-react';

import {
  deadlines,
  recentActivity,
} from '@/components/capstone-dashboard/data';

export function SidePanel() {
  return (
    <div className="flex flex-col gap-4 @container/side">
      <Card className={cn(CARD_FX, ACCENT_CARD.rose)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2.5">
            <span
              className={cn(
                'flex size-8 items-center justify-center rounded-lg',
                ACCENT_SOLID.rose,
              )}
            >
              <CalendarClockIcon className="size-4" />
            </span>
            Tenggat Terdekat
          </CardTitle>
          <CardDescription>Kalender akademik periode berjalan</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {deadlines.map((item, index) => {
            const accent = ACCENT_ORDER[index % ACCENT_ORDER.length];
            return (
              <div
                key={item.title}
                className="flex items-center gap-3 rounded-xl bg-background/60 p-2 shadow-xs backdrop-blur-sm transition-colors hover:bg-background/80 dark:bg-background/30 dark:hover:bg-background/40"
              >
                <div
                  className={cn(
                    'flex size-11 shrink-0 flex-col items-center justify-center rounded-lg',
                    ACCENT_SOLID[accent],
                  )}
                >
                  <span className="text-sm leading-none font-bold tabular-nums">
                    {item.date}
                  </span>
                  <span className="text-[10px] leading-tight uppercase opacity-90">
                    {item.month}
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium">
                    {item.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {item.note}
                  </span>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className={cn(CARD_FX, ACCENT_CARD.highlight)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2.5">
            <span
              className={cn(
                'flex size-8 items-center justify-center rounded-lg',
                ACCENT_SOLID.highlight,
              )}
            >
              <ActivityIcon className="size-4" />
            </span>
            Aktivitas Terbaru
          </CardTitle>
          <CardDescription>Update dari tim dan penguji</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            {recentActivity.map((item, index) => {
              const accent = ACCENT_ORDER[(index + 3) % ACCENT_ORDER.length];
              return (
                <div
                  key={`${item.actor}-${item.time}`}
                  className="relative flex gap-3 pb-5 last:pb-0"
                >
                  {index < recentActivity.length - 1 ? (
                    <span
                      aria-hidden="true"
                      className="absolute top-3 left-[3.5px] h-full w-px bg-border"
                    />
                  ) : null}
                  <span
                    aria-hidden="true"
                    className={cn(
                      'relative mt-1.5 size-2 shrink-0 rounded-full',
                      ACCENT_DOT[accent],
                    )}
                  />
                  <div className="flex min-w-0 flex-col gap-1">
                    <p className="text-sm leading-snug">
                      <span className="font-medium">{item.actor}</span>{' '}
                      <span className="text-muted-foreground">
                        {item.action}
                      </span>{' '}
                      <span className="font-medium">{item.target}</span>
                    </p>
                    <Badge
                      variant="outline"
                      className="w-fit border-transparent bg-background/70 font-mono text-[10px] shadow-xs dark:bg-background/40"
                    >
                      {item.time}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
