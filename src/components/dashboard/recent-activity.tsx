'use client';

import { Card, CardBody, CardHeader, Avatar, Chip } from '@heroui/react';
import { formatDateTime, getStatusColor, getStatusLabel } from '@/lib/utils';

interface Activity {
  id: string;
  type: 'submission' | 'review' | 'comment' | 'assignment';
  title: string;
  description: string;
  user: {
    name: string;
    avatar?: string;
  };
  timestamp: Date | string;
  status?: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'submission':
        return 'bg-primary/20 text-primary';
      case 'review':
        return 'bg-success/20 text-success';
      case 'comment':
        return 'bg-secondary/20 text-secondary';
      case 'assignment':
        return 'bg-warning/20 text-warning';
      default:
        return 'bg-default/20 text-default-500';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <h3 className="text-lg font-semibold">Aktivitas Terbaru</h3>
      </CardHeader>
      <CardBody className="gap-4">
        {activities.length === 0 ? (
          <p className="text-default-400 text-center py-4">
            Belum ada aktivitas
          </p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 pb-4 border-b border-divider last:border-0 last:pb-0"
              >
                <Avatar
                  name={activity.user.name}
                  src={activity.user.avatar}
                  size="sm"
                  className={getActivityIcon(activity.type)}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-sm truncate">
                      {activity.title}
                    </p>
                    {activity.status && (
                      <Chip
                        size="sm"
                        color={getStatusColor(activity.status)}
                        variant="flat"
                      >
                        {getStatusLabel(activity.status)}
                      </Chip>
                    )}
                  </div>
                  <p className="text-sm text-default-500 truncate">
                    {activity.description}
                  </p>
                  <p className="text-xs text-default-400 mt-1">
                    {formatDateTime(activity.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
