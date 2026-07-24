'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Avatar,
  Chip,
  Spinner,
} from '@heroui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Check,
  X,
  Clock,
  FolderGit2,
  AlertCircle,
  Users,
  Inbox,
} from 'lucide-react';
import { PageHeader } from '@/components/caret/PageHeader';

interface Invitation {
  id: string;
  status: string;
  message: string | null;
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
    name: string | null;
    username: string;
    image: string | null;
    nim: string | null;
    prodi: string | null;
  };
}

export default function InvitationsContent() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Fetch invitations
  const fetchInvitations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/invitations');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal memuat undangan');
      }

      setInvitations(data.invitations);
    } catch (err) {
      console.error('Error fetching invitations:', err);
      setError(err instanceof Error ? err.message : 'Gagal memuat undangan');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  // Handle invitation response
  const handleResponse = async (invitationId: string, action: 'accept' | 'reject') => {
    setProcessingId(invitationId);
    setError('');

    try {
      const response = await fetch(`/api/invitations/${invitationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal memproses undangan');
      }

      // Update local state
      setInvitations(invitations.map(inv =>
        inv.id === invitationId
          ? { ...inv, status: action === 'accept' ? 'accepted' : 'rejected' }
          : inv
      ));

      // Refresh after a delay to update the list
      setTimeout(() => {
        fetchInvitations();
      }, 1000);
    } catch (err) {
      console.error('Error responding to invitation:', err);
      setError(err instanceof Error ? err.message : 'Gagal memproses undangan');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'warning';
      case 'accepted': return 'success';
      case 'rejected': return 'danger';
      case 'cancelled': return 'default';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'Menunggu';
      case 'accepted': return 'Diterima';
      case 'rejected': return 'Ditolak';
      case 'cancelled': return 'Dibatalkan';
      default: return status;
    }
  };

  const pendingInvitations = invitations.filter(inv => inv.status.toLowerCase() === 'pending');
  const historyInvitations = invitations.filter(inv => inv.status.toLowerCase() !== 'pending');

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        label="[04] UNDANGAN"
        labelRight="/ TIM"
        title="Undangan tim"
        description="Kelola undangan dari ketua project untuk bergabung ke tim."
      />

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-danger/40 bg-danger/10 p-4 text-danger">
          <AlertCircle size={18} className="shrink-0" />
          <p className="text-sm font-medium">{error}</p>
          <Button
            size="sm"
            variant="light"
            color="danger"
            isIconOnly
            className="ml-auto"
            onPress={() => setError('')}
          >
            <X size={14} />
          </Button>
        </div>
      )}

      {/* Pending Invitations */}
      <Card className="overflow-hidden rounded-2xl border border-border bg-card shadow-none">
        <CardHeader className="border-b border-border bg-app-quinary p-4 md:p-5">
          <div className="flex items-center gap-3">
            <span className="bg-app-primary text-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
              <Mail size={16} />
            </span>
            <div>
              <h2 className="font-display text-lg font-[450] leading-tight tracking-tight">Undangan Masuk</h2>
              <p className="text-app-teritary-invert text-xs">
                <span className="tabular-nums">{pendingInvitations.length}</span> undangan menunggu konfirmasi
              </p>
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-4 md:p-5">
          {pendingInvitations.length === 0 ? (
            <div className="text-app-teritary-invert flex flex-col items-center justify-center py-8">
              <span className="bg-app-primary mb-3 flex size-14 items-center justify-center rounded-full">
                <Inbox size={24} />
              </span>
              <p className="text-sm">Tidak ada undangan menunggu</p>
            </div>
          ) : (
            <AnimatePresence>
              <div className="space-y-4">
                {pendingInvitations.map((invitation, index) => (
                  <motion.div
                    key={invitation.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.1 }}
                    className="rounded-xl border border-border bg-app-quinary p-4"
                  >
                    <div className="flex items-start gap-4">
                      {/* Inviter Avatar */}
                      <Avatar
                        src={invitation.inviter.image || undefined}
                        name={invitation.inviter.name || invitation.inviter.username}
                        size="md"
                        isBordered
                        color="primary"
                      />

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        {/* Inviter Info */}
                        <div className="mb-1 flex items-center gap-2">
                          <p className="text-sm font-medium">
                            {invitation.inviter.name || invitation.inviter.username}
                          </p>
                          {invitation.inviter.nim && (
                            <Chip size="sm" variant="flat" className="bg-app-quaternary text-app-secondary-invert">
                              {invitation.inviter.nim}
                            </Chip>
                          )}
                        </div>

                        {/* Message */}
                        <p className="text-app-teritary-invert mb-3 text-xs">
                          mengundang Anda bergabung ke tim project
                        </p>

                        {/* Project Info */}
                        <div className="mb-3 rounded-lg border border-border bg-background p-3">
                          <div className="mb-1 flex items-center gap-2">
                            <FolderGit2 size={14} className="text-primary" />
                            <p className="truncate text-sm font-medium">
                              {invitation.project.title}
                            </p>
                          </div>
                          {invitation.project.description && (
                            <p className="text-app-teritary-invert line-clamp-2 text-xs">
                              {invitation.project.description}
                            </p>
                          )}
                          <div className="text-app-teritary-invert mt-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em]">
                            <Clock size={12} />
                            <span>{invitation.project.semester} {invitation.project.tahunAkademik}</span>
                          </div>
                        </div>

                        {/* Custom Message */}
                        {invitation.message && (
                          <p className="text-app-secondary-invert mb-3 rounded-lg bg-app-quaternary p-2 text-xs italic">
                            &ldquo;{invitation.message}&rdquo;
                          </p>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            color="success"
                            startContent={<Check size={14} />}
                            isLoading={processingId === invitation.id}
                            isDisabled={processingId !== null}
                            onPress={() => handleResponse(invitation.id, 'accept')}
                          >
                            Terima
                          </Button>
                          <Button
                            size="sm"
                            color="danger"
                            variant="flat"
                            startContent={<X size={14} />}
                            isLoading={processingId === invitation.id}
                            isDisabled={processingId !== null}
                            onPress={() => handleResponse(invitation.id, 'reject')}
                          >
                            Tolak
                          </Button>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <Chip
                        size="sm"
                        color={getStatusColor(invitation.status)}
                        variant="flat"
                      >
                        {getStatusLabel(invitation.status)}
                      </Chip>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}
        </CardBody>
      </Card>

      {/* History */}
      {historyInvitations.length > 0 && (
        <Card className="overflow-hidden rounded-2xl border border-border bg-card shadow-none">
          <CardHeader className="border-b border-border bg-app-quinary p-4 md:p-5">
            <div className="flex items-center gap-3">
              <span className="bg-app-primary text-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
                <Users size={16} />
              </span>
              <div>
                <h2 className="font-display text-lg font-[450] leading-tight tracking-tight">Riwayat Undangan</h2>
                <p className="text-app-teritary-invert text-xs">
                  <span className="tabular-nums">{historyInvitations.length}</span> undangan telah diproses
                </p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="p-4 md:p-5">
            <div className="space-y-3">
              {historyInvitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-app-quinary p-3"
                >
                  <Avatar
                    src={invitation.inviter.image || undefined}
                    name={invitation.inviter.name || invitation.inviter.username}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {invitation.project.title}
                    </p>
                    <p className="text-app-teritary-invert text-xs">
                      Diundang oleh {invitation.inviter.name || invitation.inviter.username}
                    </p>
                  </div>
                  <Chip
                    size="sm"
                    color={getStatusColor(invitation.status)}
                    variant="flat"
                  >
                    {getStatusLabel(invitation.status)}
                  </Chip>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
