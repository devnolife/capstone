'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Input,
  Button,
  Avatar,
  Chip,
  Spinner,
  Tooltip,
  Divider,
  Textarea,
} from '@heroui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  X,
  ExternalLink,
  UserPlus,
  Crown,
  AlertCircle,
  CheckCircle2,
  Mail,
  Clock,
  Send,
  CreditCard,
} from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { getSimakPhotoUrl } from '@/lib/utils';

interface SearchedUser {
  id: string;
  username: string;
  name: string | null;
  nim: string | null;
  image: string | null;
}

interface ProjectMember {
  id: string;
  githubUsername: string;
  githubId?: string;
  githubAvatarUrl?: string;
  name?: string;
  role: string;
  userId?: string;
  user?: {
    id: string;
    name: string | null;
    nim: string | null;
    image: string | null;
  };
  joinedAt?: string;
}

interface TeamInvitation {
  id: string;
  status: string;
  message: string | null;
  createdAt: string;
  invitee: {
    id: string;
    name: string | null;
    username: string;
    nim: string | null;
    image: string | null;
  };
}

interface TeamMembersNimProps {
  projectId?: string;
  members: ProjectMember[];
  onMembersChange?: (members: ProjectMember[]) => void;
  ownerGithubUsername?: string;
  ownerName?: string;
  ownerImage?: string;
  ownerNim?: string;
  maxMembers?: number;
  isEditable?: boolean;
  showHeader?: boolean;
  compact?: boolean;
}

export default function TeamMembersNim({
  projectId,
  members,
  onMembersChange,
  ownerGithubUsername,
  ownerName,
  ownerImage,
  ownerNim,
  maxMembers = 3,
  isEditable = true,
  showHeader = true,
  compact = false,
}: TeamMembersNimProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchedUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [error, setError] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [invitationMessage, setInvitationMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState<SearchedUser | null>(null);
  const [pendingInvitations, setPendingInvitations] = useState<TeamInvitation[]>([]);
  const [isLoadingInvitations, setIsLoadingInvitations] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Fetch pending invitations for this project
  const fetchInvitations = useCallback(async () => {
    if (!projectId) return;

    setIsLoadingInvitations(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/invitations`);
      const data = await response.json();

      if (response.ok) {
        setPendingInvitations(data.invitations.filter((inv: TeamInvitation) => inv.status === 'PENDING'));
      }
    } catch (err) {
      console.error('Error fetching invitations:', err);
    } finally {
      setIsLoadingInvitations(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  // Search users by NIM or name
  const searchUsers = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setError('');

    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mencari pengguna');
      }

      // Filter out already added members, owner, and pending invitations
      const filtered = data.users.filter((user: SearchedUser) => {
        const isAlreadyMember = members.some((m) => m.userId === user.id);
        const isOwner = ownerNim === user.nim;
        const hasPendingInvitation = pendingInvitations.some((inv) => inv.invitee.id === user.id);
        return !isAlreadyMember && !isOwner && !hasPendingInvitation;
      });

      setSearchResults(filtered);
    } catch (err) {
      console.error('Error searching users:', err);
      setError(err instanceof Error ? err.message : 'Gagal mencari pengguna');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [members, ownerNim, pendingInvitations]);

  useEffect(() => {
    searchUsers(debouncedSearch);
  }, [debouncedSearch, searchUsers]);

  // Select user for invitation
  const handleSelectUser = (user: SearchedUser) => {
    setSelectedUser(user);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Send invitation
  const handleSendInvitation = async () => {
    if (!selectedUser || !projectId) return;

    if (members.length + pendingInvitations.length >= maxMembers) {
      setError(`Maksimal ${maxMembers} anggota tim (termasuk undangan pending)`);
      return;
    }

    setIsInviting(true);
    setError('');

    try {
      const response = await fetch(`/api/projects/${projectId}/invitations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inviteeId: selectedUser.id,
          message: invitationMessage || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mengirim undangan');
      }

      // Refresh invitations
      fetchInvitations();

      // Clear selection
      setSelectedUser(null);
      setInvitationMessage('');
      setShowSearch(false);
    } catch (err) {
      console.error('Error sending invitation:', err);
      setError(err instanceof Error ? err.message : 'Gagal mengirim undangan');
    } finally {
      setIsInviting(false);
    }
  };

  // Cancel invitation
  const handleCancelInvitation = async (invitationId: string) => {
    try {
      const response = await fetch(`/api/invitations/${invitationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Gagal membatalkan undangan');
      }

      fetchInvitations();
    } catch (err) {
      console.error('Error cancelling invitation:', err);
      setError(err instanceof Error ? err.message : 'Gagal membatalkan undangan');
    }
  };

  // Remove member
  const handleRemoveMember = async (member: ProjectMember) => {
    setError('');

    try {
      if (projectId && !member.id.startsWith('temp-')) {
        const response = await fetch(
          `/api/projects/${projectId}/members?memberId=${member.id}`,
          { method: 'DELETE' }
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Gagal menghapus anggota');
        }
      }

      if (onMembersChange) {
        onMembersChange(members.filter((m) => m.id !== member.id));
      }
    } catch (err) {
      console.error('Error removing member:', err);
      setError(err instanceof Error ? err.message : 'Gagal menghapus anggota');
    }
  };

  const canAddMore = members.length + pendingInvitations.length < maxMembers;

  if (compact) {
    return (
      <div className="space-y-3">
        {/* Owner */}
        <div className="flex items-center gap-2">
          <Avatar
            src={getSimakPhotoUrl(ownerNim) || ownerImage}
            name={ownerName || 'Owner'}
            size="sm"
            isBordered
            color="primary"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{ownerName}</p>
            {ownerNim && (
              <p className="text-xs text-default-500">{ownerNim}</p>
            )}
          </div>
          <Chip size="sm" color="primary" variant="flat" startContent={<Crown size={10} />}>
            Ketua
          </Chip>
        </div>

        {/* Confirmed Members */}
        {members.map((member) => (
          <div key={member.id} className="flex items-center gap-2 group">
            <Avatar
              src={getSimakPhotoUrl(member.user?.nim) || member.user?.image || member.githubAvatarUrl}
              name={member.user?.name || member.name || member.githubUsername}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {member.user?.name || member.name || member.githubUsername}
              </p>
              <p className="text-xs text-default-500">
                {member.user?.nim || member.githubUsername}
              </p>
            </div>
            <Chip size="sm" color="success" variant="flat">
              <CheckCircle2 size={10} className="mr-1" />
              Tergabung
            </Chip>
            {isEditable && (
              <Button
                size="sm"
                variant="light"
                color="danger"
                isIconOnly
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onPress={() => handleRemoveMember(member)}
              >
                <X size={14} />
              </Button>
            )}
          </div>
        ))}

        {/* Pending Invitations */}
        {pendingInvitations.map((invitation) => (
          <div key={invitation.id} className="flex items-center gap-2 group opacity-70">
            <Avatar
              src={getSimakPhotoUrl(invitation.invitee.nim) || invitation.invitee.image || undefined}
              name={invitation.invitee.name || invitation.invitee.username}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {invitation.invitee.name || invitation.invitee.username}
              </p>
              <p className="text-xs text-default-500">
                {invitation.invitee.nim}
              </p>
            </div>
            <Chip size="sm" color="warning" variant="flat">
              <Clock size={10} className="mr-1" />
              Pending
            </Chip>
          </div>
        ))}

        {/* Add Button */}
        {isEditable && canAddMore && projectId && (
          <Button
            size="sm"
            variant="flat"
            startContent={<UserPlus size={14} />}
            onPress={() => setShowSearch(true)}
            className="w-full"
          >
            Undang Anggota ({members.length + pendingInvitations.length}/{maxMembers})
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className="shadow-sm">
      {showHeader && (
        <CardHeader className="bg-gradient-to-r from-success-50 to-transparent dark:from-success-900/20 pb-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-success/10 text-success">
                <Users size={22} />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Tim Project</h2>
                <p className="text-xs text-default-500">Anggota kolaborator project</p>
              </div>
            </div>
            <Chip size="sm" variant="flat">
              {members.length + 1}/{maxMembers + 1} tergabung
            </Chip>
          </div>
        </CardHeader>
      )}

      <CardBody className="space-y-4 pt-2">
        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-danger-50 text-danger rounded-lg text-sm">
            <AlertCircle size={16} />
            {error}
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

        {/* Owner - Team Lead */}
        <div className="flex items-center gap-3 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
          <Avatar
            src={getSimakPhotoUrl(ownerNim) || ownerImage}
            name={ownerName || 'Owner'}
            size="sm"
            isBordered
            color="primary"
          />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{ownerName}</p>
            <p className="text-xs text-default-500 flex items-center gap-1">
              <CreditCard size={10} />
              {ownerNim || ownerGithubUsername}
            </p>
          </div>
          <Chip size="sm" color="primary" variant="flat" startContent={<Crown size={10} />}>
            Ketua
          </Chip>
        </div>

        {/* Confirmed Team Members */}
        <AnimatePresence>
          {members.map((member) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex items-center gap-3 p-3 bg-success-50 dark:bg-success-900/20 rounded-xl group"
            >
              <Avatar
                src={getSimakPhotoUrl(member.user?.nim) || member.user?.image || member.githubAvatarUrl}
                name={member.user?.name || member.name || member.githubUsername}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {member.user?.name || member.name || member.githubUsername}
                </p>
                <p className="text-xs text-default-500 flex items-center gap-1">
                  <CreditCard size={10} />
                  {member.user?.nim || member.githubUsername}
                </p>
              </div>
              <Chip size="sm" color="success" variant="flat">
                <CheckCircle2 size={10} className="mr-1" />
                Anggota
              </Chip>
              {isEditable && (
                <Button
                  size="sm"
                  variant="light"
                  color="danger"
                  isIconOnly
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onPress={() => handleRemoveMember(member)}
                >
                  <X size={14} />
                </Button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Pending Invitations */}
        {pendingInvitations.length > 0 && (
          <>
            <Divider />
            <p className="text-sm font-medium text-default-600 flex items-center gap-2">
              <Mail size={14} />
              Undangan Terkirim
            </p>
            {pendingInvitations.map((invitation) => (
              <motion.div
                key={invitation.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3 p-3 bg-warning-50 dark:bg-warning-900/20 rounded-xl group"
              >
                <Avatar
                  src={getSimakPhotoUrl(invitation.invitee.nim) || invitation.invitee.image || undefined}
                  name={invitation.invitee.name || invitation.invitee.username}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {invitation.invitee.name || invitation.invitee.username}
                  </p>
                  <p className="text-xs text-default-500 flex items-center gap-1">
                    <CreditCard size={10} />
                    {invitation.invitee.nim}
                  </p>
                </div>
                <Chip size="sm" color="warning" variant="flat">
                  <Clock size={10} className="mr-1" />
                  Menunggu
                </Chip>
                {isEditable && (
                  <Tooltip content="Batalkan undangan">
                    <Button
                      size="sm"
                      variant="light"
                      color="danger"
                      isIconOnly
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onPress={() => handleCancelInvitation(invitation.id)}
                    >
                      <X size={14} />
                    </Button>
                  </Tooltip>
                )}
              </motion.div>
            ))}
          </>
        )}

        {/* Add Member Section */}
        {isEditable && canAddMore && projectId && (
          <>
            <Divider />

            {showSearch ? (
              <div className="space-y-3">
                {/* Selected User */}
                {selectedUser ? (
                  <div className="p-3 border-2 border-primary rounded-xl bg-primary-50/50">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar
                        src={getSimakPhotoUrl(selectedUser.nim) || selectedUser.image || undefined}
                        name={selectedUser.name || selectedUser.username}
                        size="md"
                        isBordered
                        color="primary"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">
                          {selectedUser.name || selectedUser.username}
                        </p>
                        <p className="text-sm text-default-500">
                          NIM: {selectedUser.nim}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="flat"
                        isIconOnly
                        onPress={() => setSelectedUser(null)}
                      >
                        <X size={14} />
                      </Button>
                    </div>

                    <Textarea
                      placeholder="Pesan undangan (opsional)..."
                      value={invitationMessage}
                      onChange={(e) => setInvitationMessage(e.target.value)}
                      size="sm"
                      minRows={2}
                      className="mb-3"
                    />

                    <div className="flex gap-2">
                      <Button
                        color="primary"
                        startContent={<Send size={14} />}
                        isLoading={isInviting}
                        onPress={handleSendInvitation}
                        className="flex-1"
                      >
                        Kirim Undangan
                      </Button>
                      <Button
                        variant="flat"
                        onPress={() => {
                          setSelectedUser(null);
                          setShowSearch(false);
                        }}
                      >
                        Batal
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Cari NIM atau nama mahasiswa..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        startContent={
                          isSearching ? (
                            <Spinner size="sm" />
                          ) : (
                            <Search size={16} className="text-default-400" />
                          )
                        }
                        size="sm"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        variant="flat"
                        isIconOnly
                        onPress={() => {
                          setShowSearch(false);
                          setSearchQuery('');
                          setSearchResults([]);
                        }}
                      >
                        <X size={16} />
                      </Button>
                    </div>

                    {/* Search Results */}
                    {searchResults.length > 0 && (
                      <div className="space-y-2 max-h-[200px] overflow-y-auto">
                        {searchResults.map((user) => (
                          <motion.div
                            key={user.id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-3 p-2 hover:bg-default-100 rounded-lg cursor-pointer transition-colors"
                            onClick={() => handleSelectUser(user)}
                          >
                            <Avatar
                              src={getSimakPhotoUrl(user.nim) || user.image || undefined}
                              name={user.name || user.username}
                              size="sm"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {user.name || user.username}
                              </p>
                              <p className="text-xs text-default-500 truncate">
                                NIM: {user.nim}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              color="primary"
                              variant="flat"
                              isIconOnly
                            >
                              <UserPlus size={14} />
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {/* No Results */}
                    {searchQuery.length >= 2 && !isSearching && searchResults.length === 0 && (
                      <p className="text-sm text-default-500 text-center py-4">
                        Tidak ditemukan mahasiswa dengan NIM/nama &quot;{searchQuery}&quot;
                      </p>
                    )}

                    {/* Search Hint */}
                    {searchQuery.length < 2 && (
                      <p className="text-xs text-default-400 text-center">
                        Ketik minimal 2 karakter untuk mencari
                      </p>
                    )}
                  </>
                )}
              </div>
            ) : (
              <Button
                variant="bordered"
                className="w-full border-dashed"
                startContent={<UserPlus size={18} />}
                onPress={() => setShowSearch(true)}
              >
                <div className="text-left">
                  <p className="font-medium">Undang Anggota Tim</p>
                  <p className="text-xs text-default-500">
                    Cari berdasarkan NIM atau nama ({members.length + pendingInvitations.length}/{maxMembers})
                  </p>
                </div>
              </Button>
            )}
          </>
        )}

        {/* Max Members Reached */}
        {!canAddMore && isEditable && (
          <div className="flex items-center gap-2 p-3 bg-warning-50 text-warning-700 rounded-lg text-sm">
            <CheckCircle2 size={16} />
            Tim sudah lengkap (maksimal {maxMembers} anggota)
          </div>
        )}

        {/* No Project ID Warning */}
        {isEditable && !projectId && (
          <div className="flex items-center gap-2 p-3 bg-default-100 text-default-500 rounded-lg text-sm">
            <AlertCircle size={16} />
            Simpan project terlebih dahulu untuk mengundang anggota
          </div>
        )}
      </CardBody>
    </Card>
  );
}
