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
import { getInitials } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  Plus,
  X,
  Github,
  ExternalLink,
  UserPlus,
  Crown,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  bio?: string | null;
  public_repos?: number | null;
  followers?: number | null;
}

interface ProjectMember {
  id: string;
  githubUsername: string;
  githubId?: string;
  githubAvatarUrl?: string;
  name?: string;
  role: string;
  joinedAt?: string;
}

interface TeamMembersProps {
  projectId?: string;
  members: ProjectMember[];
  onMembersChange: (members: ProjectMember[]) => void;
  ownerGithubUsername?: string;
  ownerName?: string;
  ownerImage?: string;
  maxMembers?: number;
  isEditable?: boolean;
  showHeader?: boolean;
  compact?: boolean;
}

export default function TeamMembers({
  projectId,
  members,
  onMembersChange,
  ownerGithubUsername,
  ownerName,
  ownerImage,
  maxMembers = 3,
  isEditable = true,
  showHeader = true,
  compact = false,
}: TeamMembersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GitHubUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Search GitHub users
  const searchUsers = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setError('');

    try {
      const response = await fetch(`/api/github/search-user?q=${encodeURIComponent(query)}`);

      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server mengembalikan respons tidak valid');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mencari pengguna');
      }

      // Filter out already added members and owner
      const filtered = data.users.filter((user: GitHubUser) => {
        const isAlreadyMember = members.some(
          (m) => m.githubUsername.toLowerCase() === user.login.toLowerCase()
        );
        const isOwner = ownerGithubUsername?.toLowerCase() === user.login.toLowerCase();
        return !isAlreadyMember && !isOwner;
      });

      setSearchResults(filtered);
    } catch (err) {
      console.error('Error searching users:', err);
      setError(err instanceof Error ? err.message : 'Gagal mencari pengguna');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [members, ownerGithubUsername]);

  useEffect(() => {
    searchUsers(debouncedSearch);
  }, [debouncedSearch, searchUsers]);

  // Add member
  const handleAddMember = async (user: GitHubUser) => {
    if (members.length >= maxMembers) {
      setError(`Maksimal ${maxMembers} anggota tim`);
      return;
    }

    setIsAdding(true);
    setError('');

    try {
      if (projectId) {
        // If project exists, add via API
        const response = await fetch(`/api/projects/${projectId}/members`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            githubUsername: user.login,
            role: 'member',
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Gagal menambahkan anggota');
        }

        onMembersChange([...members, data.member]);
      } else {
        // If no project yet, just add locally
        // Generate avatar URL if not provided (fallback to GitHub's default avatar URL pattern)
        const avatarUrl = user.avatar_url || `https://avatars.githubusercontent.com/u/${user.id}?v=4`;
        const newMember: ProjectMember = {
          id: `temp-${Date.now()}`,
          githubUsername: user.login,
          githubId: user.id.toString(),
          githubAvatarUrl: avatarUrl,
          name: user.name || undefined,
          role: 'member',
        };
        onMembersChange([...members, newMember]);
      }

      // Clear search
      setSearchQuery('');
      setSearchResults([]);
      setShowSearch(false);
    } catch (err) {
      console.error('Error adding member:', err);
      setError(err instanceof Error ? err.message : 'Gagal menambahkan anggota');
    } finally {
      setIsAdding(false);
    }
  };

  // Remove member
  const handleRemoveMember = async (member: ProjectMember) => {
    setError('');

    try {
      if (projectId && !member.id.startsWith('temp-')) {
        // If project exists, remove via API
        const response = await fetch(
          `/api/projects/${projectId}/members?memberId=${member.id}`,
          { method: 'DELETE' }
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Gagal menghapus anggota');
        }
      }

      onMembersChange(members.filter((m) => m.id !== member.id));
    } catch (err) {
      console.error('Error removing member:', err);
      setError(err instanceof Error ? err.message : 'Gagal menghapus anggota');
    }
  };

  const canAddMore = members.length < maxMembers;

  if (compact) {
    return (
      <div className="space-y-3">
        {/* Owner */}
        <div className="flex items-center gap-2">
          <Avatar size="sm" className="ring-2 ring-primary/40">
            <AvatarImage src={ownerImage} alt={ownerName || 'Owner'} />
            <AvatarFallback>{getInitials(ownerName || 'Owner')}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{ownerName}</p>
            {ownerGithubUsername && (
              <p className="text-xs text-app-secondary-invert">@{ownerGithubUsername}</p>
            )}
          </div>
          <Badge className="bg-primary/10 text-primary">
            <Crown size={10} />
            Owner
          </Badge>
        </div>

        {/* Members */}
        {members.map((member) => {
          const avatarUrl = member.githubAvatarUrl ||
            (member.githubId ? `https://avatars.githubusercontent.com/u/${member.githubId}?v=4` :
              `https://github.com/${member.githubUsername}.png`);

          return (
            <div key={member.id} className="flex items-center gap-2 group">
              <Avatar size="sm">
                <AvatarImage src={avatarUrl} alt={member.name || member.githubUsername} />
                <AvatarFallback>
                  {getInitials(member.name || member.githubUsername)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {member.name || member.githubUsername}
                </p>
                <p className="text-xs text-app-secondary-invert">@{member.githubUsername}</p>
              </div>
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
          );
        })}

        {/* Add Button */}
        {isEditable && canAddMore && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowSearch(true)}
            className="w-full"
          >
            <UserPlus size={14} />
            Tambah Anggota ({members.length}/{maxMembers})
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
                <p className="text-xs text-app-teritary-invert">Anggota kolaborator GitHub</p>
              </div>
            </div>
            <Badge variant="secondary">
              {members.length + 1}/{maxMembers + 1} orang
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
            <AvatarImage src={ownerImage} alt={ownerName || 'Owner'} />
            <AvatarFallback>{getInitials(ownerName || 'Owner')}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{ownerName}</p>
            {ownerGithubUsername && (
              <p className="text-xs text-app-secondary-invert flex items-center gap-1">
                <Github size={10} />
                @{ownerGithubUsername}
              </p>
            )}
          </div>
          <Badge className="bg-primary/10 text-primary">
            <Crown size={10} />
            Owner
          </Badge>
        </div>

        {/* Team Members List */}
        <AnimatePresence>
          {members.map((member) => {
            // Fallback avatar URL using GitHub ID or username
            const avatarUrl = member.githubAvatarUrl ||
              (member.githubId ? `https://avatars.githubusercontent.com/u/${member.githubId}?v=4` :
                `https://github.com/${member.githubUsername}.png`);

            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center gap-3 p-3 bg-app-quinary border border-border rounded-xl group"
              >
                <Avatar size="sm">
                  <AvatarImage src={avatarUrl} alt={member.name || member.githubUsername} />
                  <AvatarFallback>
                    {getInitials(member.name || member.githubUsername)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {member.name || member.githubUsername}
                  </p>
                  <p className="text-xs text-app-secondary-invert flex items-center gap-1">
                    <Github size={10} />
                    @{member.githubUsername}
                  </p>
                </div>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <a
                        href={`https://github.com/${member.githubUsername}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex size-7 items-center justify-center rounded-lg hover:bg-muted"
                      />
                    }
                  >
                    <ExternalLink size={14} />
                  </TooltipTrigger>
                  <TooltipContent>Lihat profil GitHub</TooltipContent>
                </Tooltip>
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
            );
          })}
        </AnimatePresence>

        {/* Add Member Section */}
        {isEditable && canAddMore && (
          <>
            <Separator />

            {showSearch ? (
              <div className="space-y-3">
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
                      placeholder="Cari username GitHub..."
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
                        onClick={() => handleAddMember(user)}
                      >
                        <Avatar size="sm">
                          <AvatarImage src={user.avatar_url} alt={user.login} />
                          <AvatarFallback>{getInitials(user.login)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {user.name || user.login}
                          </p>
                          <p className="text-xs text-app-secondary-invert truncate">
                            @{user.login}
                            {user.bio && ` • ${user.bio}`}
                          </p>
                        </div>
                        <Button size="icon-sm" variant="outline" disabled={isAdding}>
                          {isAdding ? <Loader2 className="animate-spin" /> : <Plus size={14} />}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* No Results */}
                {searchQuery.length >= 2 && !isSearching && searchResults.length === 0 && (
                  <p className="text-sm text-app-secondary-invert text-center py-4">
                    Tidak ditemukan pengguna dengan username &quot;{searchQuery}&quot;
                  </p>
                )}

                {/* Search Hint */}
                {searchQuery.length < 2 && (
                  <p className="text-xs text-app-teritary-invert text-center">
                    Ketik minimal 2 karakter untuk mencari
                  </p>
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
                  <p className="font-medium">Tambah Anggota Tim</p>
                  <p className="text-xs text-app-secondary-invert">
                    Cari berdasarkan username GitHub ({members.length}/{maxMembers})
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
      </CardContent>
    </Card>
  );
}
