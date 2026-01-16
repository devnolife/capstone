'use client';

import { Card, CardBody, CardHeader, Chip, Progress } from '@heroui/react';
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
    <Card className="w-full">
      <CardHeader className="flex gap-3 pb-0">
        <div
          className={`p-2 rounded-lg bg-${color}/10 text-${color}`}
          style={{
            backgroundColor: `hsl(var(--heroui-${color}) / 0.1)`,
            color: `hsl(var(--heroui-${color}))`,
          }}
        >
          <Icon size={24} />
        </div>
        <div className="flex flex-col flex-1">
          <p className="text-sm text-default-500">{title}</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold">{value}</p>
            {trend && (
              <Chip
                size="sm"
                color={trend.isPositive ? 'success' : 'danger'}
                variant="flat"
              >
                {trend.isPositive ? '+' : '-'}
                {Math.abs(trend.value)}%
              </Chip>
            )}
          </div>
        </div>
      </CardHeader>
      <CardBody className="pt-2">
        {description && (
          <p className="text-sm text-default-400">{description}</p>
        )}
        {progress !== undefined && (
          <Progress value={progress} color={color} size="sm" className="mt-2" />
        )}
      </CardBody>
    </Card>
  );
}
