'use client';

import { Card, CardBody, Chip, Progress } from '@heroui/react';
import { LucideIcon } from 'lucide-react';

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
  return (
    <Card className="w-full h-full">
      <CardBody className="p-3 md:p-4">
        <div className="flex items-start gap-3">
          <div
            className="p-2 md:p-2.5 rounded-xl shrink-0"
            style={{
              backgroundColor: `hsl(var(--heroui-${color}) / 0.1)`,
              color: `hsl(var(--heroui-${color}))`,
            }}
          >
            <Icon size={20} className="md:w-6 md:h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] md:text-xs text-default-500 font-medium uppercase tracking-wide truncate">
              {title}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-xl md:text-2xl font-bold">{value}</p>
              {trend && (
                <Chip
                  size="sm"
                  color={trend.isPositive ? 'success' : 'danger'}
                  variant="flat"
                  className="h-5 text-[10px]"
                >
                  {trend.isPositive ? '+' : '-'}
                  {Math.abs(trend.value)}%
                </Chip>
              )}
            </div>
            {description && (
              <p className="text-[10px] md:text-xs text-default-400 mt-1 truncate">
                {description}
              </p>
            )}
            {progress !== undefined && (
              <Progress value={progress} color={color} size="sm" className="mt-2" />
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
