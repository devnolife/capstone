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
  Input,
  Textarea,
  Select,
  SelectItem,
  addToast,
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
  Megaphone,
  Send,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';

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
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Broadcast form state
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastType, setBroadcastType] = useState('system');
  const [broadcastRole, setBroadcastRole] = useState<'all' | 'MAHASISWA' | 'DOSEN_PENGUJI' | 'ADMIN'>('all');
  const [broadcastLink, setBroadcastLink] = useState('');
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);

  const handleSendBroadcast = async () => {
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
      addToast({ title: 'Judul dan pesan wajib diisi', color: 'warning' });
      return;
    }
    setIsSendingBroadcast(true);
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: broadcastRole,
          title: broadcastTitle.trim(),
          message: broadcastMessage.trim(),
          type: broadcastType,
          link: broadcastLink.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        addToast({ title: data.error || 'Gagal mengirim notifikasi', color: 'danger' });
        return;
      }
      addToast({
        title: data.message || 'Notifikasi terkirim',
        color: 'success',
      });
      setBroadcastTitle('');
      setBroadcastMessage('');
      setBroadcastLink('');
    } catch {
      addToast({ title: 'Terjadi kesalahan', color: 'danger' });
    } finally {
      setIsSendingBroadcast(false);
    }
  };

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
    const confirmed = await confirm({
      title: 'Hapus Notifikasi',
      message: 'Hapus semua notifikasi yang sudah dibaca?',
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      type: 'warning',
    });

    if (!confirmed) return;

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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Notifikasi</h1>
          <p className="text-default-500">
            {unreadCount > 0
              ? `${unreadCount} notifikasi belum dibaca`
              : 'Semua notifikasi sudah dibaca'}
          </p>
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

      {/* Broadcast Composer */}
      <Card>
        <CardHeader className="flex items-center gap-2">
          <Megaphone size={18} className="text-primary" />
          <h2 className="text-lg font-semibold">Kirim Pengumuman</h2>
        </CardHeader>
        <Divider />
        <CardBody className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Select
              label="Penerima"
              size="sm"
              selectedKeys={[broadcastRole]}
              onSelectionChange={(keys) => {
                const v = Array.from(keys)[0] as string;
                if (v) setBroadcastRole(v as typeof broadcastRole);
              }}
            >
              <SelectItem key="all">Semua pengguna</SelectItem>
              <SelectItem key="MAHASISWA">Semua mahasiswa</SelectItem>
              <SelectItem key="DOSEN_PENGUJI">Semua dosen penguji</SelectItem>
              <SelectItem key="ADMIN">Semua admin</SelectItem>
            </Select>
            <Select
              label="Tipe"
              size="sm"
              selectedKeys={[broadcastType]}
              onSelectionChange={(keys) => {
                const v = Array.from(keys)[0] as string;
                if (v) setBroadcastType(v);
              }}
            >
              <SelectItem key="system">Sistem</SelectItem>
              <SelectItem key="assignment">Penugasan</SelectItem>
              <SelectItem key="review">Review</SelectItem>
              <SelectItem key="submission">Submission</SelectItem>
            </Select>
          </div>
          <Input
            label="Judul"
            size="sm"
            value={broadcastTitle}
            onValueChange={setBroadcastTitle}
            maxLength={120}
          />
          <Textarea
            label="Pesan"
            minRows={2}
            value={broadcastMessage}
            onValueChange={setBroadcastMessage}
            maxLength={1000}
          />
          <Input
            label="Link (opsional)"
            placeholder="/admin/projects"
            size="sm"
            value={broadcastLink}
            onValueChange={setBroadcastLink}
          />
          <div className="flex justify-end">
            <Button
              color="primary"
              startContent={<Send size={16} />}
              onPress={handleSendBroadcast}
              isLoading={isSendingBroadcast}
            >
              Kirim
            </Button>
          </div>
        </CardBody>
      </Card>

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
                  className={`p-4 hover:bg-default-50 transition-colors cursor-pointer ${!notification.isRead ? 'bg-primary-50/50' : ''
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

      {/* Confirm Dialog */}
      <ConfirmDialog />
    </div>
  );
}
