'use client';

import { Card, CardBody, Chip, Progress } from '@heroui/react';
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
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  progress?: number;
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  color = 'primary',
  progress,
}: StatsCardProps) {
  const getColorClasses = () => {
    switch (color) {
      case 'success':
        return {
          gradient: 'from-emerald-500/20 via-green-500/10 to-transparent',
          iconBg: 'from-emerald-500/20 to-green-500/10',
          iconBorder: 'border-emerald-500/20 group-hover:border-emerald-500/40',
          iconColor: 'text-emerald-500',
        };
      case 'warning':
        return {
          gradient: 'from-amber-500/20 via-yellow-500/10 to-transparent',
          iconBg: 'from-amber-500/20 to-yellow-500/10',
          iconBorder: 'border-amber-500/20 group-hover:border-amber-500/40',
          iconColor: 'text-amber-500',
        };
      case 'danger':
        return {
          gradient: 'from-red-500/20 via-rose-500/10 to-transparent',
          iconBg: 'from-red-500/20 to-rose-500/10',
          iconBorder: 'border-red-500/20 group-hover:border-red-500/40',
          iconColor: 'text-red-500',
        };
      case 'secondary':
        return {
          gradient: 'from-purple-500/20 via-violet-500/10 to-transparent',
          iconBg: 'from-purple-500/20 to-violet-500/10',
          iconBorder: 'border-purple-500/20 group-hover:border-purple-500/40',
          iconColor: 'text-purple-500',
        };
      default:
        return {
          gradient: 'from-primary/20 via-primary/10 to-transparent',
          iconBg: 'from-primary/20 to-primary/10',
          iconBorder: 'border-primary/20 group-hover:border-primary/40',
          iconColor: 'text-primary',
        };
    }
  };

  const colors = getColorClasses();

  return (
    <Card className="group w-full h-full relative overflow-hidden border border-default-200/50 dark:border-default-100/10 bg-background/60 dark:bg-default-50/5 backdrop-blur-xl shadow-sm hover:shadow-lg hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-0.5 hover:border-primary/20">
      {/* Gradient overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
      />

      {/* Shine effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>

      <CardBody className="p-4 md:p-5 relative z-10">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="relative shrink-0">
            <div
              className={`p-3 md:p-3.5 rounded-2xl bg-gradient-to-br ${colors.iconBg} border ${colors.iconBorder} transition-all duration-300 group-hover:scale-105`}
            >
              <Icon size={20} className={`md:w-6 md:h-6 ${colors.iconColor}`} />
            </div>
            {/* Glow effect */}
            <div
              className={`absolute inset-0 rounded-2xl ${colors.iconColor} blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`}
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-1">
            <p className="text-[10px] md:text-xs text-default-500 dark:text-default-400 font-medium uppercase tracking-wider truncate">
              {title}
            </p>

            <div className="flex items-center gap-2.5 mt-1">
              <p className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                {value}
              </p>
              {trend && (
                <Chip
                  size="sm"
                  color={trend.isPositive ? 'success' : 'danger'}
                  variant="flat"
                  className="h-6 text-[10px] md:text-xs font-medium"
                  classNames={{
                    base: 'border border-current/20',
                  }}
                  startContent={
                    trend.isPositive ? (
                      <TrendingUp size={12} />
                    ) : (
                      <TrendingDown size={12} />
                    )
                  }
                >
                  {Math.abs(trend.value)}%
                </Chip>
              )}
            </div>

            {description && (
              <p className="text-[11px] md:text-xs text-default-400 dark:text-default-500 mt-1.5 truncate">
                {description}
              </p>
            )}

            {progress !== undefined && (
              <div className="mt-3 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-default-400">Progress</span>
                  <span className="text-[10px] font-semibold text-foreground">
                    {progress}%
                  </span>
                </div>
                <Progress
                  value={progress}
                  color={color}
                  size="sm"
                  className="h-1.5"
                  classNames={{
                    track: 'bg-default-200/50 dark:bg-default-100/10',
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
