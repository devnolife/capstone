'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Spinner,
  Chip,
  Divider,
} from '@heroui/react';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  UserCog,
  ClipboardCheck,
  FileText,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'assignment':
      return <UserCog size={20} className="text-primary" />;
    case 'review':
      return <ClipboardCheck size={20} className="text-success" />;
    case 'submission':
      return <FileText size={20} className="text-secondary" />;
    case 'system':
      return <AlertCircle size={20} className="text-warning" />;
    default:
      return <Bell size={20} className="text-default-500" />;
  }
};

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'PUT',
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark-all-read' }),
      });

      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const notification = notifications.find((n) => n.id === id);
        if (notification && !notification.isRead) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleDeleteAllRead = async () => {
    if (!confirm('Hapus semua notifikasi yang sudah dibaca?')) return;

    try {
      const response = await fetch('/api/notifications?read=true', {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotifications((prev) => prev.filter((n) => !n.isRead));
      }
    } catch (error) {
      console.error('Error deleting read notifications:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - Soft Colored */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-yellow-950/40 border border-amber-200/50 dark:border-amber-800/30 p-6 md:p-8">
        {/* Subtle Background Accents */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-yellow-400/15 to-amber-400/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/25">
              <Bell size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">Notifikasi</h1>
              <p className="text-amber-600/70 dark:text-amber-400/60">
                {unreadCount > 0
                  ? `${unreadCount} notifikasi belum dibaca`
                  : 'Semua notifikasi sudah dibaca'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button
                variant="flat"
                startContent={<CheckCheck size={18} />}
                onPress={handleMarkAllAsRead}
              >
                Tandai Semua Dibaca
              </Button>
            )}
            {notifications.some((n) => n.isRead) && (
              <Button
                variant="flat"
                color="danger"
                startContent={<Trash2 size={18} />}
                onPress={handleDeleteAllRead}
              >
                Hapus Dibaca
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">
            Daftar Notifikasi ({notifications.length})
          </h2>
        </CardHeader>
        <CardBody className="p-0">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell size={64} className="mx-auto text-default-300 mb-4" />
              <p className="text-default-500">Tidak ada notifikasi</p>
            </div>
          ) : (
            <div className="divide-y divide-divider">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-default-50 transition-colors cursor-pointer ${
                    !notification.isRead ? 'bg-primary-50/50' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-full bg-default-100">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">
                              {notification.title}
                            </h3>
                            {!notification.isRead && (
                              <Chip size="sm" color="primary" variant="flat">
                                Baru
                              </Chip>
                            )}
                          </div>
                          <p className="text-sm text-default-600 mt-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs text-default-400">
                              {formatDate(notification.createdAt)}
                            </span>
                            {notification.link && (
                              <span className="text-xs text-primary flex items-center gap-1">
                                <ExternalLink size={12} />
                                Lihat detail
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {!notification.isRead && (
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              onPress={() => {
                                handleMarkAsRead(notification.id);
                              }}
                            >
                              <Check size={16} />
                            </Button>
                          )}
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            color="danger"
                            onPress={() => {
                              handleDelete(notification.id);
                            }}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
