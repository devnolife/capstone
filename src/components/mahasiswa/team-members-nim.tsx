'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
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
  Loader2,
} from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { getInitials, getSimakPhotoUrl } from '@/lib/utils';

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
          <Avatar size="sm" className="ring-2 ring-primary/40">
            <AvatarImage
              src={getSimakPhotoUrl(ownerNim) || ownerImage}
              alt={ownerName || 'Owner'}
            />
            <AvatarFallback>{getInitials(ownerName || 'Owner')}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{ownerName}</p>
            {ownerNim && (
              <p className="text-xs text-app-secondary-invert">{ownerNim}</p>
            )}
          </div>
          <Badge className="bg-primary/10 text-primary">
            <Crown size={10} />
            Ketua
          </Badge>
        </div>

        {/* Confirmed Members */}
        {members.map((member) => (
          <div key={member.id} className="flex items-center gap-2 group">
            <Avatar size="sm">
              <AvatarImage
                src={getSimakPhotoUrl(member.user?.nim) || member.user?.image || member.githubAvatarUrl || undefined}
                alt={member.user?.name || member.name || member.githubUsername}
              />
              <AvatarFallback>
                {getInitials(member.user?.name || member.name || member.githubUsername)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {member.user?.name || member.name || member.githubUsername}
              </p>
              <p className="text-xs text-app-secondary-invert">
                {member.user?.nim || member.githubUsername}
              </p>
            </div>
            <Badge className="bg-success/15 text-success">
              <CheckCircle2 size={10} />
              Tergabung
            </Badge>
            {isEditable && (
              <Button
                size="icon-sm"
                variant="ghost"
                className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemoveMember(member)}
              >
                <X size={14} />
              </Button>
            )}
          </div>
        ))}

        {/* Pending Invitations */}
        {pendingInvitations.map((invitation) => (
          <div key={invitation.id} className="flex items-center gap-2 group opacity-70">
            <Avatar size="sm">
              <AvatarImage
                src={getSimakPhotoUrl(invitation.invitee.nim) || invitation.invitee.image || undefined}
                alt={invitation.invitee.name || invitation.invitee.username}
              />
              <AvatarFallback>
                {getInitials(invitation.invitee.name || invitation.invitee.username)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {invitation.invitee.name || invitation.invitee.username}
              </p>
              <p className="text-xs text-app-secondary-invert">
                {invitation.invitee.nim}
              </p>
            </div>
            <Badge className="bg-warning/15 text-warning">
              <Clock size={10} />
              Pending
            </Badge>
          </div>
        ))}

        {/* Add Button */}
        {isEditable && canAddMore && projectId && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowSearch(true)}
            className="w-full"
          >
            <UserPlus size={14} />
            Undang Anggota ({members.length + pendingInvitations.length}/{maxMembers})
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className="border border-border bg-card shadow-sm">
      {showHeader && (
        <CardHeader className="border-b border-border pb-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-app-primary text-foreground">
                <Users size={22} />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Tim Project</h2>
                <p className="text-xs text-app-teritary-invert">Anggota kolaborator project</p>
              </div>
            </div>
            <Badge variant="secondary">
              {members.length + 1}/{maxMembers + 1} tergabung
            </Badge>
          </div>
        </CardHeader>
      )}

      <CardContent className="space-y-4 pt-2">
        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
            <AlertCircle size={16} />
            {error}
            <Button
              size="icon-sm"
              variant="ghost"
              className="ml-auto text-destructive"
              onClick={() => setError('')}
            >
              <X size={14} />
            </Button>
          </div>
        )}

        {/* Owner - Team Lead */}
        <div className="flex items-center gap-3 p-3 bg-app-quinary border border-border rounded-xl">
          <Avatar size="sm" className="ring-2 ring-primary/40">
            <AvatarImage
              src={getSimakPhotoUrl(ownerNim) || ownerImage}
              alt={ownerName || 'Owner'}
            />
            <AvatarFallback>{getInitials(ownerName || 'Owner')}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{ownerName}</p>
            <p className="text-xs text-app-secondary-invert flex items-center gap-1">
              <CreditCard size={10} />
              {ownerNim || ownerGithubUsername}
            </p>
          </div>
          <Badge className="bg-primary/10 text-primary">
            <Crown size={10} />
            Ketua
          </Badge>
        </div>

        {/* Confirmed Team Members */}
        <AnimatePresence>
          {members.map((member) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex items-center gap-3 p-3 bg-app-quinary border border-border rounded-xl group"
            >
              <Avatar size="sm">
                <AvatarImage
                  src={getSimakPhotoUrl(member.user?.nim) || member.user?.image || member.githubAvatarUrl || undefined}
                  alt={member.user?.name || member.name || member.githubUsername}
                />
                <AvatarFallback>
                  {getInitials(member.user?.name || member.name || member.githubUsername)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {member.user?.name || member.name || member.githubUsername}
                </p>
                <p className="text-xs text-app-secondary-invert flex items-center gap-1">
                  <CreditCard size={10} />
                  {member.user?.nim || member.githubUsername}
                </p>
              </div>
              <Badge className="bg-success/15 text-success">
                <CheckCircle2 size={10} />
                Anggota
              </Badge>
              {isEditable && (
                <Button
                  size="icon-sm"
                  variant="ghost"
                  className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemoveMember(member)}
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
            <Separator />
            <p className="text-app-secondary-invert flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em]">
              <Mail size={14} />
              Undangan Terkirim
            </p>
            {pendingInvitations.map((invitation) => (
              <motion.div
                key={invitation.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3 p-3 bg-app-quinary border border-border rounded-xl group"
              >
                <Avatar size="sm">
                  <AvatarImage
                    src={getSimakPhotoUrl(invitation.invitee.nim) || invitation.invitee.image || undefined}
                    alt={invitation.invitee.name || invitation.invitee.username}
                  />
                  <AvatarFallback>
                    {getInitials(invitation.invitee.name || invitation.invitee.username)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {invitation.invitee.name || invitation.invitee.username}
                  </p>
                  <p className="text-xs text-app-secondary-invert flex items-center gap-1">
                    <CreditCard size={10} />
                    {invitation.invitee.nim}
                  </p>
                </div>
                <Badge className="bg-warning/15 text-warning">
                  <Clock size={10} />
                  Menunggu
                </Badge>
                {isEditable && (
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleCancelInvitation(invitation.id)}
                        />
                      }
                    >
                      <X size={14} />
                    </TooltipTrigger>
                    <TooltipContent>Batalkan undangan</TooltipContent>
                  </Tooltip>
                )}
              </motion.div>
            ))}
          </>
        )}

        {/* Add Member Section */}
        {isEditable && canAddMore && projectId && (
          <>
            <Separator />

            {showSearch ? (
              <div className="space-y-3">
                {/* Selected User */}
                {selectedUser ? (
                  <div className="p-3 border-2 border-ring rounded-xl bg-app-quaternary">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="ring-2 ring-primary/40">
                        <AvatarImage
                          src={getSimakPhotoUrl(selectedUser.nim) || selectedUser.image || undefined}
                          alt={selectedUser.name || selectedUser.username}
                        />
                        <AvatarFallback>
                          {getInitials(selectedUser.name || selectedUser.username)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">
                          {selectedUser.name || selectedUser.username}
                        </p>
                        <p className="text-sm text-app-secondary-invert">
                          NIM: {selectedUser.nim}
                        </p>
                      </div>
                      <Button
                        size="icon-sm"
                        variant="outline"
                        onClick={() => setSelectedUser(null)}
                      >
                        <X size={14} />
                      </Button>
                    </div>

                    <Textarea
                      placeholder="Pesan undangan (opsional)..."
                      value={invitationMessage}
                      onChange={(e) => setInvitationMessage(e.target.value)}
                      rows={2}
                      className="mb-3"
                    />

                    <div className="flex gap-2">
                      <Button
                        disabled={isInviting}
                        onClick={handleSendInvitation}
                        className="flex-1"
                      >
                        {isInviting ? <Loader2 className="animate-spin" /> : <Send size={14} />}
                        Kirim Undangan
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
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
                      <div className="relative flex-1">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2">
                          {isSearching ? (
                            <Spinner className="size-4" />
                          ) : (
                            <Search size={16} className="text-app-teritary-invert" />
                          )}
                        </span>
                        <Input
                          placeholder="Cari NIM atau nama mahasiswa..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9"
                          autoFocus
                        />
                      </div>
                      <Button
                        size="icon-sm"
                        variant="outline"
                        onClick={() => {
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
                            className="flex items-center gap-3 p-2 hover:bg-app-quaternary rounded-lg cursor-pointer transition-colors"
                            onClick={() => handleSelectUser(user)}
                          >
                            <Avatar size="sm">
                              <AvatarImage
                                src={getSimakPhotoUrl(user.nim) || user.image || undefined}
                                alt={user.name || user.username}
                              />
                              <AvatarFallback>
                                {getInitials(user.name || user.username)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {user.name || user.username}
                              </p>
                              <p className="text-xs text-app-secondary-invert truncate">
                                NIM: {user.nim}
                              </p>
                            </div>
                            <Button size="icon-sm" variant="outline">
                              <UserPlus size={14} />
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {/* No Results */}
                    {searchQuery.length >= 2 && !isSearching && searchResults.length === 0 && (
                      <p className="text-sm text-app-secondary-invert text-center py-4">
                        Tidak ditemukan mahasiswa dengan NIM/nama &quot;{searchQuery}&quot;
                      </p>
                    )}

                    {/* Search Hint */}
                    {searchQuery.length < 2 && (
                      <p className="text-xs text-app-teritary-invert text-center">
                        Ketik minimal 2 karakter untuk mencari
                      </p>
                    )}
                  </>
                )}
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full border-dashed h-auto py-3"
                onClick={() => setShowSearch(true)}
              >
                <UserPlus size={18} />
                <div className="text-left">
                  <p className="font-medium">Undang Anggota Tim</p>
                  <p className="text-xs text-app-secondary-invert">
                    Cari berdasarkan NIM atau nama ({members.length + pendingInvitations.length}/{maxMembers})
                  </p>
                </div>
              </Button>
            )}
          </>
        )}

        {/* Max Members Reached */}
        {!canAddMore && isEditable && (
          <div className="flex items-center gap-2 p-3 bg-warning/10 border border-warning/40 text-warning rounded-lg text-sm">
            <CheckCircle2 size={16} />
            Tim sudah lengkap (maksimal {maxMembers} anggota)
          </div>
        )}

        {/* No Project ID Warning */}
        {isEditable && !projectId && (
          <div className="flex items-center gap-2 p-3 bg-app-quinary border border-border text-app-secondary-invert rounded-lg text-sm">
            <AlertCircle size={16} />
            Simpan project terlebih dahulu untuk mengundang anggota
          </div>
        )}
      </CardContent>
    </Card>
  );
}
