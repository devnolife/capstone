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
  Divider,
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

interface Invitation {
  id: string;
  status: string;
  message: string | null;
  createdAt: string;
  project: {
    id: string;
    title: string;
    description: string | null;
    semester: {
      id: string;
      name: string;
    };
  };
  inviter: {
    id: string;
    name: string | null;
    username: string;
    image: string | null;
    nim: string | null;
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
          ? { ...inv, status: action === 'accept' ? 'ACCEPTED' : 'REJECTED' }
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
    switch (status) {
      case 'PENDING': return 'warning';
      case 'ACCEPTED': return 'success';
      case 'REJECTED': return 'danger';
      case 'CANCELLED': return 'default';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Menunggu';
      case 'ACCEPTED': return 'Diterima';
      case 'REJECTED': return 'Ditolak';
      case 'CANCELLED': return 'Dibatalkan';
      default: return status;
    }
  };

  const pendingInvitations = invitations.filter(inv => inv.status === 'PENDING');
  const historyInvitations = invitations.filter(inv => inv.status !== 'PENDING');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-danger-50 text-danger rounded-lg">
          <AlertCircle size={18} />
          <p>{error}</p>
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
      <Card className="shadow-sm">
        <CardHeader className="bg-gradient-to-r from-warning-50 to-transparent dark:from-warning-900/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-warning/10 text-warning">
              <Mail size={22} />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Undangan Masuk</h2>
              <p className="text-xs text-default-500">
                {pendingInvitations.length} undangan menunggu konfirmasi
              </p>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          {pendingInvitations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-default-400">
              <Inbox size={48} className="mb-3" />
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
                    className="p-4 border rounded-xl bg-default-50"
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
                      <div className="flex-1 min-w-0">
                        {/* Inviter Info */}
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm">
                            {invitation.inviter.name || invitation.inviter.username}
                          </p>
                          {invitation.inviter.nim && (
                            <Chip size="sm" variant="flat">
                              {invitation.inviter.nim}
                            </Chip>
                          )}
                        </div>

                        {/* Message */}
                        <p className="text-xs text-default-500 mb-3">
                          mengundang Anda bergabung ke tim project
                        </p>

                        {/* Project Info */}
                        <div className="p-3 bg-white dark:bg-default-100 rounded-lg mb-3">
                          <div className="flex items-center gap-2 mb-1">
                            <FolderGit2 size={14} className="text-primary" />
                            <p className="font-medium text-sm truncate">
                              {invitation.project.title}
                            </p>
                          </div>
                          {invitation.project.description && (
                            <p className="text-xs text-default-500 line-clamp-2">
                              {invitation.project.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2 text-xs text-default-400">
                            <Clock size={12} />
                            <span>{invitation.project.semester.name}</span>
                          </div>
                        </div>

                        {/* Custom Message */}
                        {invitation.message && (
                          <p className="text-xs text-default-600 italic mb-3 p-2 bg-default-100 rounded">
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
        <Card className="shadow-sm">
          <CardHeader className="bg-gradient-to-r from-default-50 to-transparent dark:from-default-100/20">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-default-100 text-default-500">
                <Users size={22} />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Riwayat Undangan</h2>
                <p className="text-xs text-default-500">
                  {historyInvitations.length} undangan telah diproses
                </p>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {historyInvitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center gap-3 p-3 bg-default-50 rounded-lg"
                >
                  <Avatar
                    src={invitation.inviter.image || undefined}
                    name={invitation.inviter.name || invitation.inviter.username}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {invitation.project.title}
                    </p>
                    <p className="text-xs text-default-500">
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
