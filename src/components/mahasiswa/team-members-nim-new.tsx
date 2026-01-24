'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Card,
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
  X,
  UserPlus,
  Crown,
  AlertCircle,
  CheckCircle2,
  Github,
  CreditCard,
  Info,
  AlertTriangle,
} from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { getSimakPhotoUrl } from '@/lib/utils';

interface SearchedUser {
  id: string;
  username: string;
  name: string | null;
  nim: string | null;
  prodi: string | null;
  image: string | null;
  simakPhoto: string | null;
  githubUsername: string | null;
}

interface PendingMember {
  id: string;
  name: string;
  nim: string;
  prodi?: string;
  image?: string;
  githubUsername: string;
}

interface TeamMembersNimNewProps {
  pendingMembers: PendingMember[];
  onPendingMembersChange: (members: PendingMember[]) => void;
  ownerGithubUsername?: string;
  ownerName?: string;
  ownerImage?: string;
  ownerNim?: string;
  maxMembers?: number;
  isEditable?: boolean;
}

export default function TeamMembersNimNew({
  pendingMembers,
  onPendingMembersChange,
  ownerGithubUsername,
  ownerName,
  ownerImage,
  ownerNim,
  maxMembers = 3,
  isEditable = true,
}: TeamMembersNimNewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchedUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Search users by NIM or name
  const searchUsers = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setError('');

    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}&requireGithub=true`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mencari pengguna');
      }

      // Filter out already added members and owner
      const filtered = (data.users || data).filter((user: SearchedUser) => {
        const isAlreadyMember = pendingMembers.some((m) => m.id === user.id);
        const isOwner = ownerNim === user.nim || ownerGithubUsername === user.githubUsername;
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
  }, [pendingMembers, ownerNim, ownerGithubUsername]);

  useEffect(() => {
    searchUsers(debouncedSearch);
  }, [debouncedSearch, searchUsers]);

  // Add member to pending list
  const handleAddMember = (user: SearchedUser) => {
    if (!user.githubUsername) {
      setError('User ini belum menghubungkan akun GitHub');
      return;
    }

    if (pendingMembers.length >= maxMembers) {
      setError(`Maksimal ${maxMembers} anggota tim`);
      return;
    }

    const newMember: PendingMember = {
      id: user.id,
      name: user.name || user.username,
      nim: user.nim || user.username,
      prodi: user.prodi || undefined,
      image: getSimakPhotoUrl(user.nim) || user.image || user.simakPhoto || undefined,
      githubUsername: user.githubUsername,
    };

    onPendingMembersChange([...pendingMembers, newMember]);
    setSearchQuery('');
    setSearchResults([]);
    setShowSearch(false);
  };

  // Remove member from pending list
  const handleRemoveMember = (memberId: string) => {
    onPendingMembersChange(pendingMembers.filter((m) => m.id !== memberId));
  };

  const canAddMore = pendingMembers.length < maxMembers;

  return (
    <Card className="border border-default-100 shadow-sm">
      <CardBody className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-success/10 to-success/5 text-success">
              <Users size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Tim Project</h3>
              <p className="text-xs text-default-400">Cari anggota berdasarkan NIM</p>
            </div>
          </div>
          <Chip size="sm" variant="flat" color="primary">
            {pendingMembers.length + 1}/{maxMembers + 1}
          </Chip>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 p-2.5 mb-3 bg-danger-50 text-danger rounded-lg text-xs"
            >
              <AlertCircle size={14} />
              <span className="flex-1">{error}</span>
              <Button
                size="sm"
                variant="light"
                color="danger"
                isIconOnly
                className="h-5 w-5 min-w-5"
                onPress={() => setError('')}
              >
                <X size={12} />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Owner Section */}
        <div className="flex items-center gap-3 p-3 bg-primary-50/50 dark:bg-primary-900/10 rounded-lg border border-primary-100/50 dark:border-primary-800/30 mb-3">
          <div className="relative">
            <Avatar
              src={getSimakPhotoUrl(ownerNim) || ownerImage}
              name={ownerName || 'Owner'}
              size="sm"
              className="w-9 h-9"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-primary rounded-full border-2 border-white dark:border-zinc-900 flex items-center justify-center">
              <Crown size={8} className="text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{ownerName || 'Anda'}</p>
            <p className="text-xs text-default-500">{ownerNim || 'Ketua Tim'}</p>
          </div>
          <Chip size="sm" color="primary" variant="flat" classNames={{ base: 'h-5' }}>
            Ketua
          </Chip>
        </div>

        <Divider className="my-3" />

        {/* Pending Members List */}
        <div className="space-y-2 mb-3">
          <AnimatePresence>
            {pendingMembers.map((member) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="flex items-center gap-3 p-2.5 bg-default-50 dark:bg-default-100/10 rounded-lg group"
              >
                <Avatar
                  src={member.image}
                  name={member.name}
                  size="sm"
                  className="w-9 h-9"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-medium text-sm truncate">{member.name}</p>
                    <Tooltip content={`@${member.githubUsername}`}>
                      <Github size={12} className="text-default-400 shrink-0" />
                    </Tooltip>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-default-400">
                    <span className="flex items-center gap-1">
                      <CreditCard size={10} />
                      {member.nim}
                    </span>
                    {member.prodi && (
                      <>
                        <span>•</span>
                        <span className="truncate">{member.prodi}</span>
                      </>
                    )}
                  </div>
                </div>
                {isEditable && (
                  <Button
                    size="sm"
                    variant="light"
                    color="danger"
                    isIconOnly
                    className="h-7 w-7 min-w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    onPress={() => handleRemoveMember(member.id)}
                  >
                    <X size={14} />
                  </Button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {pendingMembers.length === 0 && (
            <div className="flex items-center gap-2 p-3 text-default-400 text-xs">
              <Info size={12} />
              <span>Belum ada anggota tim ditambahkan</span>
            </div>
          )}
        </div>

        {/* Search Section */}
        {isEditable && canAddMore && (
          <AnimatePresence>
            {showSearch ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <div className="relative">
                  <Input
                    size="sm"
                    variant="bordered"
                    placeholder="Cari NIM atau nama mahasiswa..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    startContent={
                      isSearching ? (
                        <Spinner size="sm" className="w-4 h-4" />
                      ) : (
                        <Search size={14} className="text-default-400" />
                      )
                    }
                    endContent={
                      <Button
                        size="sm"
                        variant="light"
                        isIconOnly
                        className="h-6 w-6 min-w-6"
                        onPress={() => {
                          setShowSearch(false);
                          setSearchQuery('');
                          setSearchResults([]);
                        }}
                      >
                        <X size={14} />
                      </Button>
                    }
                    classNames={{
                      inputWrapper: 'border-default-200 hover:border-primary',
                    }}
                    autoFocus
                  />
                </div>

                {/* Search Results */}
                <AnimatePresence>
                  {searchResults.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="border border-default-200 rounded-lg overflow-hidden max-h-[200px] overflow-y-auto"
                    >
                      {searchResults.map((user, index) => (
                        <motion.button
                          key={user.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.05 }}
                          type="button"
                          onClick={() => handleAddMember(user)}
                          className="w-full flex items-center gap-3 p-2.5 hover:bg-default-100 transition-colors text-left border-b border-default-100 last:border-b-0"
                        >
                          <Avatar
                            src={getSimakPhotoUrl(user.nim) || user.image || user.simakPhoto || undefined}
                            name={user.name || user.username}
                            size="sm"
                            className="w-8 h-8"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="font-medium text-sm truncate">
                                {user.name || user.username}
                              </p>
                              {user.githubUsername ? (
                                <Chip size="sm" variant="flat" color="success" classNames={{ base: 'h-4 px-1' }}>
                                  <Github size={10} className="mr-0.5" />
                                  <span className="text-[10px]">Connected</span>
                                </Chip>
                              ) : (
                                <Chip size="sm" variant="flat" color="warning" classNames={{ base: 'h-4 px-1' }}>
                                  <AlertTriangle size={10} className="mr-0.5" />
                                  <span className="text-[10px]">No GitHub</span>
                                </Chip>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-default-400">
                              <span>{user.nim || user.username}</span>
                              {user.prodi && (
                                <>
                                  <span>•</span>
                                  <span className="truncate">{user.prodi}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <UserPlus size={16} className="text-primary shrink-0" />
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* No Results */}
                {searchQuery.length >= 2 && !isSearching && searchResults.length === 0 && (
                  <div className="text-center py-3 text-xs text-default-400">
                    Tidak ada mahasiswa ditemukan
                  </div>
                )}

                {/* Info about GitHub requirement */}
                <div className="flex items-start gap-2 p-2.5 bg-blue-50 dark:bg-blue-500/10 rounded-lg text-xs text-blue-700 dark:text-blue-300">
                  <Info size={14} className="shrink-0 mt-0.5" />
                  <span>
                    Hanya mahasiswa yang sudah <strong>terdaftar di aplikasi</strong> dan{' '}
                    <strong>menghubungkan akun GitHub</strong> yang dapat ditambahkan sebagai anggota tim.
                  </span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Button
                  variant="bordered"
                  size="sm"
                  className="w-full border-dashed border-default-300 h-10"
                  startContent={<UserPlus size={16} />}
                  onPress={() => setShowSearch(true)}
                >
                  <span className="flex-1 text-left">Tambah Anggota Tim</span>
                  <span className="text-xs text-default-400">
                    {pendingMembers.length}/{maxMembers}
                  </span>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Max Members Reached */}
        {!canAddMore && (
          <div className="flex items-center gap-2 p-2.5 bg-success-50 dark:bg-success-500/10 rounded-lg text-xs text-success-700 dark:text-success-300">
            <CheckCircle2 size={14} />
            <span>Tim sudah lengkap ({maxMembers} anggota)</span>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
