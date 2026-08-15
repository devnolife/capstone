'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { addToast } from '@/lib/toast';
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
  Loader2,
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
      return <ClipboardCheck size={20} className="text-emerald-600 dark:text-emerald-400" />;
    case 'submission':
      return <FileText size={20} className="text-secondary-foreground" />;
    case 'system':
      return <AlertCircle size={20} className="text-amber-600 dark:text-amber-400" />;
    default:
      return <Bell size={20} className="text-muted-foreground" />;
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
        <Spinner className="size-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Notifikasi</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0
              ? `${unreadCount} notifikasi belum dibaca`
              : 'Semua notifikasi sudah dibaca'}
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" onClick={handleMarkAllAsRead}>
              <CheckCheck size={18} />
              Tandai Semua Dibaca
            </Button>
          )}
          {notifications.some((n) => n.isRead) && (
            <Button variant="destructive" onClick={handleDeleteAllRead}>
              <Trash2 size={18} />
              Hapus Dibaca
            </Button>
          )}
        </div>
      </div>

      {/* Broadcast Composer */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Megaphone size={18} className="text-primary" />
          <h2 className="text-lg font-semibold">Kirim Pengumuman</h2>
        </CardHeader>
        <Separator />
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="broadcast-role">Penerima</Label>
              <Select
                value={broadcastRole}
                onValueChange={(value) => {
                  if (typeof value === 'string') setBroadcastRole(value as typeof broadcastRole);
                }}
              >
                <SelectTrigger id="broadcast-role" size="sm" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua pengguna</SelectItem>
                  <SelectItem value="MAHASISWA">Semua mahasiswa</SelectItem>
                  <SelectItem value="DOSEN_PENGUJI">Semua dosen penguji</SelectItem>
                  <SelectItem value="ADMIN">Semua admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="broadcast-type">Tipe</Label>
              <Select
                value={broadcastType}
                onValueChange={(value) => {
                  if (typeof value === 'string') setBroadcastType(value);
                }}
              >
                <SelectTrigger id="broadcast-type" size="sm" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">Sistem</SelectItem>
                  <SelectItem value="assignment">Penugasan</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="submission">Submission</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="broadcast-title">Judul</Label>
            <Input
              id="broadcast-title"
              value={broadcastTitle}
              onChange={(e) => setBroadcastTitle(e.target.value)}
              maxLength={120}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="broadcast-message">Pesan</Label>
            <Textarea
              id="broadcast-message"
              rows={2}
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              maxLength={1000}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="broadcast-link">Link (opsional)</Label>
            <Input
              id="broadcast-link"
              placeholder="/admin/projects"
              value={broadcastLink}
              onChange={(e) => setBroadcastLink(e.target.value)}
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSendBroadcast} disabled={isSendingBroadcast}>
              {isSendingBroadcast ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
              Kirim
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">
            Daftar Notifikasi ({notifications.length})
          </h2>
        </CardHeader>
        <CardContent className="p-0">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell size={64} className="mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Tidak ada notifikasi</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${!notification.isRead ? 'bg-primary/5' : ''
                    }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-full bg-muted">
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
                              <Badge variant="secondary" className="bg-primary/10 text-primary">
                                Baru
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-foreground mt-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs text-muted-foreground">
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
                              size="icon-sm"
                              variant="ghost"
                              onClick={() => {
                                handleMarkAsRead(notification.id);
                              }}
                            >
                              <Check size={16} />
                            </Button>
                          )}
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => {
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
        </CardContent>
      </Card>

      {/* Confirm Dialog */}
      <ConfirmDialog />
    </div>
  );
}
