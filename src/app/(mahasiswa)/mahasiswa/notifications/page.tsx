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
  Avatar,
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
  Users,
  X,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from 'sonner';

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
      return <UserCog size={20} className="text-primary" />;
    case 'review':
      return <ClipboardCheck size={20} className="text-success" />;
    case 'submission':
      return <FileText size={20} className="text-secondary" />;
    case 'invitation':
      return <Users size={20} className="text-emerald-500" />;
    case 'system':
      return <AlertCircle size={20} className="text-warning" />;
    default:
      return <Bell size={20} className="text-default-500" />;
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

      {/* Team Invitations Section */}
      {invitations.length > 0 && (
        <Card className="border-2 border-emerald-200 dark:border-emerald-800">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30">
            <div className="flex items-center gap-2">
              <Users size={20} className="text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-lg font-semibold">
                Undangan Tim ({invitations.length})
              </h2>
              <Chip size="sm" color="warning" variant="flat">Perlu Respon</Chip>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            <div className="divide-y divide-divider">
              {invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20"
                >
                  <div className="flex items-start gap-4">
                    <Avatar
                      name={invitation.inviter.name}
                      src={invitation.inviter.image || undefined}
                      size="md"
                      className="ring-2 ring-emerald-200 dark:ring-emerald-700"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <h3 className="font-semibold text-emerald-800 dark:text-emerald-200">
                            Undangan Bergabung Tim
                          </h3>
                          <p className="text-sm text-default-600 mt-1">
                            <span className="font-medium">{invitation.inviter.name}</span>
                            {invitation.inviter.nim && (
                              <span className="text-default-400"> ({invitation.inviter.nim})</span>
                            )}
                            {' '}mengundang Anda bergabung ke project:
                          </p>
                          <div className="mt-2 p-3 rounded-lg bg-white dark:bg-zinc-800 border border-emerald-100 dark:border-emerald-800">
                            <p className="font-medium text-default-800">{invitation.project.title}</p>
                            {invitation.project.description && (
                              <p className="text-sm text-default-500 mt-1 line-clamp-2">
                                {invitation.project.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <Chip size="sm" variant="flat">
                                {invitation.project.semester} {invitation.project.tahunAkademik}
                              </Chip>
                            </div>
                          </div>
                          <p className="text-xs text-default-400 mt-2">
                            Dikirim {formatDate(invitation.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            color="success"
                            variant="flat"
                            startContent={<Check size={16} />}
                            isLoading={respondingTo === invitation.id}
                            isDisabled={respondingTo !== null}
                            onPress={() => handleInvitationResponse(invitation.id, 'accept')}
                          >
                            Terima
                          </Button>
                          <Button
                            size="sm"
                            color="danger"
                            variant="flat"
                            startContent={<X size={16} />}
                            isLoading={respondingTo === invitation.id}
                            isDisabled={respondingTo !== null}
                            onPress={() => handleInvitationResponse(invitation.id, 'reject')}
                          >
                            Tolak
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

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
