'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  Users,
  X,
  Loader2,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from 'sonner';
import { PageHeader } from '@/components/caret/PageHeader';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

interface TeamInvitation {
  id: string;
  status: string;
  createdAt: string;
  project: {
    id: string;
    title: string;
    description: string | null;
    semester: string;
    tahunAkademik: string;
  };
  inviter: {
    id: string;
    name: string;
    username: string;
    nim: string | null;
    image: string | null;
    prodi: string | null;
  };
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'assignment':
      return <UserCog size={16} className="text-app-secondary-invert" />;
    case 'review':
      return <ClipboardCheck size={16} className="text-app-secondary-invert" />;
    case 'submission':
      return <FileText size={16} className="text-app-secondary-invert" />;
    case 'invitation':
      return <Users size={16} className="text-app-secondary-invert" />;
    case 'system':
      return <AlertCircle size={16} className="text-warning" />;
    default:
      return <Bell size={16} className="text-app-secondary-invert" />;
  }
};

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  useEffect(() => {
    fetchNotifications();
    fetchInvitations();
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

  const fetchInvitations = async () => {
    try {
      const response = await fetch('/api/invitations?status=pending');
      if (response.ok) {
        const data = await response.json();
        setInvitations(data.invitations || []);
      }
    } catch (error) {
      console.error('Error fetching invitations:', error);
    }
  };

  const handleInvitationResponse = async (invitationId: string, action: 'accept' | 'reject') => {
    setRespondingTo(invitationId);
    try {
      const response = await fetch(`/api/invitations/${invitationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        // Remove the invitation from list
        setInvitations((prev) => prev.filter((i) => i.id !== invitationId));
        // Refresh notifications
        fetchNotifications();

        if (action === 'accept') {
          // Optionally redirect to the project
          const invitation = invitations.find((i) => i.id === invitationId);
          if (invitation) {
            router.push(`/mahasiswa/projects/${invitation.project.id}`);
          }
        }
      } else {
        toast.error(data.error || 'Gagal merespon undangan');
      }
    } catch (error) {
      console.error('Error responding to invitation:', error);
      toast.error('Terjadi kesalahan');
    } finally {
      setRespondingTo(null);
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
      <div className="flex h-[60vh] items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <PageHeader
        label="[05] NOTIFIKASI"
        labelRight="/ SEMUA"
        title="Notifikasi"
        description={
          unreadCount > 0
            ? `${unreadCount} notifikasi belum dibaca`
            : 'Semua notifikasi sudah dibaca'
        }
        actions={
          <>
            {unreadCount > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleMarkAllAsRead}
              >
                <CheckCheck size={16} />
                Tandai Semua Dibaca
              </Button>
            )}
            {notifications.some((n) => n.isRead) && (
              <Button
                size="sm"
                variant="destructive"
                onClick={handleDeleteAllRead}
              >
                <Trash2 size={16} />
                Hapus Dibaca
              </Button>
            )}
          </>
        }
      />

      {/* Team Invitations Section */}
      {invitations.length > 0 && (
        <Card className="overflow-hidden rounded-2xl border border-border bg-card shadow-none">
          <CardHeader className="border-b border-border bg-app-quinary p-4 md:p-5">
            <div className="flex items-center gap-3">
              <span className="bg-app-primary text-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
                <Users size={16} />
              </span>
              <h2 className="font-display text-lg font-[450] tracking-tight">
                Undangan Tim (<span className="tabular-nums">{invitations.length}</span>)
              </h2>
              <Badge variant="outline" className="border-amber-500/40 text-amber-600 dark:text-amber-400">Perlu Respon</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="bg-app-quinary p-4"
                >
                  <div className="flex items-start gap-4">
                    <Avatar size="lg" className="ring-2 ring-border">
                      {invitation.inviter.image && (
                        <AvatarImage src={invitation.inviter.image} alt={invitation.inviter.name} />
                      )}
                      <AvatarFallback>
                        {invitation.inviter.name?.charAt(0)?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-foreground">
                            Undangan Bergabung Tim
                          </h3>
                          <p className="text-app-secondary-invert mt-1 text-sm">
                            <span className="font-medium">{invitation.inviter.name}</span>
                            {invitation.inviter.nim && (
                              <span className="text-app-teritary-invert"> ({invitation.inviter.nim})</span>
                            )}
                            {' '}mengundang Anda bergabung ke project:
                          </p>
                          <div className="mt-2 rounded-lg border border-border bg-background p-3">
                            <p className="font-medium text-foreground">{invitation.project.title}</p>
                            {invitation.project.description && (
                              <p className="text-app-teritary-invert mt-1 line-clamp-2 text-sm">
                                {invitation.project.description}
                              </p>
                            )}
                            <div className="mt-2 flex items-center gap-2">
                              <Badge variant="secondary" className="bg-app-quaternary text-app-secondary-invert">
                                {invitation.project.semester} {invitation.project.tahunAkademik}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-app-teritary-invert mt-2 font-mono text-[10px] tracking-wider">
                            Dikirim {formatDate(invitation.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={respondingTo !== null}
                            onClick={() => handleInvitationResponse(invitation.id, 'accept')}
                          >
                            {respondingTo === invitation.id ? (
                              <Loader2 className="animate-spin" />
                            ) : (
                              <Check size={16} />
                            )}
                            Terima
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={respondingTo !== null}
                            onClick={() => handleInvitationResponse(invitation.id, 'reject')}
                          >
                            {respondingTo === invitation.id ? (
                              <Loader2 className="animate-spin" />
                            ) : (
                              <X size={16} />
                            )}
                            Tolak
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notifications List */}
      <Card className="overflow-hidden rounded-2xl border border-border bg-card shadow-none">
        <CardHeader className="border-b border-border p-4 md:p-5">
          <h2 className="font-display text-lg font-[450] tracking-tight">
            Daftar Notifikasi (<span className="tabular-nums">{notifications.length}</span>)
          </h2>
        </CardHeader>
        <CardContent className="p-0">
          {notifications.length === 0 ? (
            <div className="py-12 text-center">
              <div className="bg-app-primary text-app-teritary-invert mx-auto mb-4 flex size-16 items-center justify-center rounded-full">
                <Bell size={28} />
              </div>
              <p className="text-app-teritary-invert">Tidak ada notifikasi</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`cursor-pointer p-4 transition-colors ${!notification.isRead ? 'bg-app-quaternary' : 'hover:bg-app-quinary'
                    }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-app-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-medium">
                              {notification.title}
                            </h3>
                            {!notification.isRead && (
                              <Badge>
                                Baru
                              </Badge>
                            )}
                          </div>
                          <p className="text-app-secondary-invert mt-1 text-sm">
                            {notification.message}
                          </p>
                          <div className="mt-2 flex items-center gap-4">
                            <span className="text-app-teritary-invert font-mono text-[10px] tracking-wider">
                              {formatDate(notification.createdAt)}
                            </span>
                            {notification.link && (
                              <span className="flex items-center gap-1 text-xs text-primary">
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
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notification.id);
                              }}
                            >
                              <Check size={16} />
                            </Button>
                          )}
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
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
