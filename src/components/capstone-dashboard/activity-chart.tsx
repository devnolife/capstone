'use client';

import * as React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

import {
  ACCENT_CARD,
  ACCENT_SOLID,
  CARD_FX,
} from '@/components/capstone-dashboard/accent';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/components/ui/toggle-group';
import { TrendingUpIcon } from 'lucide-react';
import { activitySeries } from '@/components/capstone-dashboard/data';

const chartConfig = {
  submission: {
    label: 'Submission',
    color: 'var(--brand)',
  },
  review: {
    label: 'Review Selesai',
    color: 'var(--success)',
  },
} satisfies ChartConfig;

type Range = 'all' | '8w' | '4w';

export function ActivityChart() {
  const isMobile = useIsMobile();
  const [range, setRange] = React.useState<Range>('all');

  React.useEffect(() => {
    if (isMobile) {
      setRange('4w');
    }
  }, [isMobile]);

  const data = React.useMemo(() => {
    if (range === '8w') return activitySeries.slice(-8);
    if (range === '4w') return activitySeries.slice(-4);
    return activitySeries;
  }, [range]);

  return (
    <Card className={cn('@container/card', CARD_FX, ACCENT_CARD.brand)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2.5">
          <span
            className={cn(
              'flex size-8 items-center justify-center rounded-lg',
              ACCENT_SOLID.brand,
            )}
          >
            <TrendingUpIcon className="size-4" />
          </span>
          Aktivitas Semester
        </CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Submission masuk vs review selesai per pekan
          </span>
          <span className="@[540px]/card:hidden">Submission vs review</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            value={[range]}
            onValueChange={(value) => {
              const next = value[0] as Range | undefined;
              if (next) setRange(next);
            }}
            multiple={false}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="all">Semua</ToggleGroupItem>
            <ToggleGroupItem value="8w">8 pekan</ToggleGroupItem>
            <ToggleGroupItem value="4w">4 pekan</ToggleGroupItem>
          </ToggleGroup>
          <Select
            value={range}
            onValueChange={(value) => value && setRange(value as Range)}
          >
            <SelectTrigger
              className="flex w-36 @[767px]/card:hidden"
              size="sm"
              aria-label="Pilih rentang"
            >
              <SelectValue placeholder="Semua pekan" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectGroup>
                <SelectItem value="all" className="rounded-lg">
                  Semua pekan
                </SelectItem>
                <SelectItem value="8w" className="rounded-lg">
                  8 pekan terakhir
                </SelectItem>
                <SelectItem value="4w" className="rounded-lg">
                  4 pekan terakhir
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <div className="rounded-xl bg-background/60 p-3 shadow-xs backdrop-blur-sm dark:bg-background/30">
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
          <AreaChart data={data}>
            <defs>
              <linearGradient id="fillSubmission" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-submission)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-submission)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillReview" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-review)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-review)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="week"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={28}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Area
              dataKey="review"
              type="natural"
              fill="url(#fillReview)"
              stroke="var(--color-review)"
              stackId="a"
            />
            <Area
              dataKey="submission"
              type="natural"
              fill="url(#fillSubmission)"
              stroke="var(--color-submission)"
              stackId="a"
            />
          </AreaChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
