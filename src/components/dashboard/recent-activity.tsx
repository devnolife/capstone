'use client';

import { motion } from 'framer-motion';
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

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
    },
  },
};

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
      <CardHeader className="px-4 py-3">
        <h3 className="text-base md:text-lg font-semibold">Aktivitas Terbaru</h3>
      </CardHeader>
      <CardBody className="gap-3 md:gap-4 pt-0">
        {activities.length === 0 ? (
          <p className="text-default-400 text-center py-4 text-sm">
            Belum ada aktivitas
          </p>
        ) : (
          <div className="space-y-3 md:space-y-4">
            {activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-2 md:gap-3 pb-3 md:pb-4 border-b border-divider last:border-0 last:pb-0"
              >
                <Avatar
                  name={activity.user.name}
                  src={activity.user.avatar}
                  size="sm"
                  className={`${getActivityIcon(activity.type)} w-8 h-8 md:w-9 md:h-9 shrink-0`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-xs md:text-sm truncate flex-1">
                      {activity.title}
                    </p>
                    {activity.status && (
                      <Chip
                        size="sm"
                        color={getStatusColor(activity.status)}
                        variant="flat"
                        className="h-5 text-[10px] md:h-6 md:text-xs shrink-0"
                      >
                        <span className="hidden md:inline">
                          {getStatusLabel(activity.status)}
                        </span>
                        <span className="md:hidden">
                          {getStatusLabel(activity.status).slice(0, 8)}
                        </span>
                      </Chip>
                    )}
                  </div>
                  <p className="text-xs md:text-sm text-default-500 truncate">
                    {activity.description}
                  </p>
                  <p className="text-[10px] md:text-xs text-default-400 mt-0.5 md:mt-1">
                    {formatDateTime(activity.timestamp)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
