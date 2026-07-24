'use client';

import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  /** Dipertahankan untuk kompatibilitas API lama — kini hanya memengaruhi warna trend */
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  progress?: number;
}

/**
 * Stat card dalam bahasa visual Caret bento: border zinc, label mono
 * uppercase, angka font-display. API props tidak berubah sehingga
 * halaman lama (reviews, documents) tetap bekerja tanpa edit.
 */
export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  progress,
}: StatsCardProps) {
  return (
    <div className="border-border bg-background hover:bg-app-quinary group flex h-full w-full flex-col gap-3 border px-5 py-4 transition-colors md:px-6 md:py-5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-app-teritary-invert truncate font-mono text-[10px] tracking-wider uppercase md:text-xs">
          {title}
        </span>
        <span className="bg-app-primary text-foreground flex size-7 shrink-0 items-center justify-center rounded-lg">
          <Icon className="size-3.5" />
        </span>
      </div>

      <div className="flex items-baseline gap-2.5">
        <span className="font-display text-3xl leading-none font-[450] tracking-tight tabular-nums md:text-4xl">
          {value}
        </span>
        {trend && (
          <span
            className={
              trend.isPositive
                ? 'inline-flex items-center gap-1 text-xs font-medium text-emerald-400'
                : 'text-destructive inline-flex items-center gap-1 text-xs font-medium'
            }
          >
            {trend.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(trend.value)}%
          </span>
        )}
      </div>

      {description && (
        <span className="text-app-secondary-invert truncate text-xs font-medium">
          {description}
        </span>
      )}

      {progress !== undefined && (
        <div className="mt-auto space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-app-teritary-invert font-mono text-[10px] tracking-wider uppercase">
              Progress
            </span>
            <span className="font-mono text-[10px] font-semibold text-foreground">
              {progress}%
            </span>
          </div>
          <div className="bg-app-primary h-1.5 overflow-hidden rounded-full">
            <div
              className="bg-primary h-full rounded-full transition-[width] duration-500"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
