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
} from '@heroui/react';
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
  addedAt?: string;
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
          <Avatar
            src={ownerImage}
            name={ownerName || 'Owner'}
            size="sm"
            isBordered
            color="primary"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{ownerName}</p>
            {ownerGithubUsername && (
              <p className="text-xs text-default-500">@{ownerGithubUsername}</p>
            )}
          </div>
          <Chip size="sm" color="primary" variant="flat" startContent={<Crown size={10} />}>
            Owner
          </Chip>
        </div>

        {/* Members */}
        {members.map((member) => {
          const avatarUrl = member.githubAvatarUrl || 
            (member.githubId ? `https://avatars.githubusercontent.com/u/${member.githubId}?v=4` : 
             `https://github.com/${member.githubUsername}.png`);
          
          return (
            <div key={member.id} className="flex items-center gap-2 group">
              <Avatar
                src={avatarUrl}
                name={member.name || member.githubUsername}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {member.name || member.githubUsername}
                </p>
                <p className="text-xs text-default-500">@{member.githubUsername}</p>
              </div>
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
          );
        })}

        {/* Add Button */}
        {isEditable && canAddMore && (
          <Button
            size="sm"
            variant="flat"
            startContent={<UserPlus size={14} />}
            onPress={() => setShowSearch(true)}
            className="w-full"
          >
            Tambah Anggota ({members.length}/{maxMembers})
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
                <p className="text-xs text-default-500">Anggota kolaborator GitHub</p>
              </div>
            </div>
            <Chip size="sm" variant="flat">
              {members.length + 1}/{maxMembers + 1} orang
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
            src={ownerImage}
            name={ownerName || 'Owner'}
            size="sm"
            isBordered
            color="primary"
          />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{ownerName}</p>
            {ownerGithubUsername && (
              <p className="text-xs text-default-500 flex items-center gap-1">
                <Github size={10} />
                @{ownerGithubUsername}
              </p>
            )}
          </div>
          <Chip size="sm" color="primary" variant="flat" startContent={<Crown size={10} />}>
            Owner
          </Chip>
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
                className="flex items-center gap-3 p-3 bg-default-50 rounded-xl group"
              >
                <Avatar
                  src={avatarUrl}
                  name={member.name || member.githubUsername}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {member.name || member.githubUsername}
                  </p>
                  <p className="text-xs text-default-500 flex items-center gap-1">
                    <Github size={10} />
                    @{member.githubUsername}
                  </p>
                </div>
                <Tooltip content="Lihat profil GitHub">
                  <Button
                    as="a"
                    href={`https://github.com/${member.githubUsername}`}
                    target="_blank"
                    size="sm"
                    variant="light"
                    isIconOnly
                  >
                    <ExternalLink size={14} />
                  </Button>
                </Tooltip>
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
            );
          })}
        </AnimatePresence>

        {/* Add Member Section */}
        {isEditable && canAddMore && (
          <>
            <Divider />
            
            {showSearch ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Cari username GitHub..."
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
                        onClick={() => handleAddMember(user)}
                      >
                        <Avatar src={user.avatar_url} name={user.login} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {user.name || user.login}
                          </p>
                          <p className="text-xs text-default-500 truncate">
                            @{user.login}
                            {user.bio && ` • ${user.bio}`}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          color="primary"
                          variant="flat"
                          isIconOnly
                          isLoading={isAdding}
                        >
                          <Plus size={14} />
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* No Results */}
                {searchQuery.length >= 2 && !isSearching && searchResults.length === 0 && (
                  <p className="text-sm text-default-500 text-center py-4">
                    Tidak ditemukan pengguna dengan username &quot;{searchQuery}&quot;
                  </p>
                )}

                {/* Search Hint */}
                {searchQuery.length < 2 && (
                  <p className="text-xs text-default-400 text-center">
                    Ketik minimal 2 karakter untuk mencari
                  </p>
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
                  <p className="font-medium">Tambah Anggota Tim</p>
                  <p className="text-xs text-default-500">
                    Cari berdasarkan username GitHub ({members.length}/{maxMembers})
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
      </CardBody>
    </Card>
  );
}
