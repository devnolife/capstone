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
  Info,
  Trash2,
  UserCheck,
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
  };

  // Remove member from pending list
  const handleRemoveMember = (memberId: string) => {
    onPendingMembersChange(pendingMembers.filter((m) => m.id !== memberId));
  };

  const canAddMore = pendingMembers.length < maxMembers;
  const totalMembers = pendingMembers.length + 1; // +1 for owner

  return (
    <Card className="border border-default-100 shadow-sm">
      <CardBody className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500/10 to-purple-500/10 text-violet-600 dark:text-violet-400">
              <Users size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Tim Project</h3>
              <p className="text-xs text-default-400">Kelola anggota tim</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: maxMembers + 1 }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i < totalMembers
                    ? 'bg-violet-500'
                    : 'bg-default-200 dark:bg-default-700'
                }`}
              />
            ))}
            <span className="text-xs text-default-400 ml-1">
              {totalMembers}/{maxMembers + 1}
            </span>
          </div>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 p-2.5 mb-3 bg-danger-50 dark:bg-danger-500/10 text-danger rounded-lg text-xs"
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

        {/* Team Members Grid */}
        <div className="space-y-2">
          {/* Owner Card */}
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-500/10 dark:to-green-500/10 rounded-xl border border-emerald-100 dark:border-emerald-500/20">
            <div className="relative">
              <Avatar
                src={getSimakPhotoUrl(ownerNim) || ownerImage}
                name={ownerName || 'Owner'}
                className="w-11 h-11 ring-2 ring-emerald-500/30"
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full border-2 border-white dark:border-zinc-900 flex items-center justify-center shadow-sm">
                <Crown size={10} className="text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate text-foreground">{ownerName || 'Anda'}</p>
              <p className="text-xs text-default-500 flex items-center gap-1">
                <span>{ownerNim || 'NIM'}</span>
                {ownerGithubUsername && (
                  <>
                    <span className="text-default-300">•</span>
                    <Github size={10} className="text-default-400" />
                    <span className="text-default-400">@{ownerGithubUsername}</span>
                  </>
                )}
              </p>
            </div>
            <Chip 
              size="sm" 
              classNames={{ 
                base: 'bg-gradient-to-r from-emerald-500 to-green-500 border-0',
                content: 'text-white font-medium text-[10px]'
              }}
            >
              Ketua Tim
            </Chip>
          </div>

          {/* Pending Members */}
          <AnimatePresence>
            {pendingMembers.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 p-3 bg-default-50 dark:bg-default-100/5 rounded-xl border border-default-100 dark:border-default-800 group hover:border-violet-200 dark:hover:border-violet-500/30 transition-colors"
              >
                <div className="relative">
                  <Avatar
                    src={member.image}
                    name={member.name}
                    className="w-11 h-11"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white dark:border-zinc-900 flex items-center justify-center">
                    <UserCheck size={10} className="text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate text-foreground">{member.name}</p>
                  <p className="text-xs text-default-500 flex items-center gap-1">
                    <span>{member.nim}</span>
                    {member.prodi && (
                      <>
                        <span className="text-default-300">•</span>
                        <span className="truncate">{member.prodi}</span>
                      </>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Tooltip content={`@${member.githubUsername}`}>
                    <Chip 
                      size="sm" 
                      variant="flat" 
                      color="success" 
                      classNames={{ base: 'h-6 gap-1' }}
                      startContent={<Github size={10} />}
                    >
                      <span className="text-[10px]">Connected</span>
                    </Chip>
                  </Tooltip>
                  {isEditable && (
                    <Tooltip content="Hapus dari tim">
                      <Button
                        size="sm"
                        variant="light"
                        color="danger"
                        isIconOnly
                        className="h-7 w-7 min-w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        onPress={() => handleRemoveMember(member.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </Tooltip>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Empty State */}
          {pendingMembers.length === 0 && (
            <div className="flex items-center justify-center gap-2 py-4 text-default-400">
              <Users size={16} className="text-default-300" />
              <span className="text-xs">Belum ada anggota ditambahkan</span>
            </div>
          )}
        </div>

        {/* Search Section */}
        {isEditable && canAddMore && (
          <div className="mt-4 space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Input
                size="sm"
                variant="bordered"
                placeholder="Cari berdasarkan NIM atau nama..."
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
                  searchQuery && (
                    <Button
                      size="sm"
                      variant="light"
                      isIconOnly
                      className="h-6 w-6 min-w-6"
                      onPress={() => {
                        setSearchQuery('');
                        setSearchResults([]);
                      }}
                    >
                      <X size={14} />
                    </Button>
                  )
                }
                classNames={{
                  inputWrapper: 'border-default-200 hover:border-violet-400 data-[focused=true]:border-violet-500',
                }}
              />

              {/* Search Results Dropdown */}
              <AnimatePresence>
                {searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-50 w-full mt-2 bg-white dark:bg-zinc-900 border border-default-200 dark:border-default-700 rounded-xl shadow-lg overflow-hidden"
                  >
                    <div className="max-h-[240px] overflow-y-auto">
                      {searchResults.map((user, index) => (
                        <motion.button
                          key={user.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.03 }}
                          type="button"
                          onClick={() => handleAddMember(user)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-colors text-left border-b border-default-100 dark:border-default-800 last:border-b-0 group"
                        >
                          <Avatar
                            src={getSimakPhotoUrl(user.nim) || user.image || user.simakPhoto || undefined}
                            name={user.name || user.username}
                            className="w-10 h-10"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm truncate text-foreground">
                                {user.name || user.username}
                              </p>
                              {user.githubUsername && (
                                <Chip 
                                  size="sm" 
                                  variant="flat" 
                                  color="success" 
                                  classNames={{ base: 'h-5 gap-0.5' }}
                                  startContent={<Github size={10} />}
                                >
                                  <span className="text-[10px]">Ready</span>
                                </Chip>
                              )}
                            </div>
                            <p className="text-xs text-default-500">
                              {user.nim || user.username}
                              {user.prodi && ` • ${user.prodi}`}
                            </p>
                          </div>
                          <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            <UserPlus size={16} />
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* No Results */}
              {searchQuery.length >= 2 && !isSearching && searchResults.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute z-50 w-full mt-2 bg-white dark:bg-zinc-900 border border-default-200 dark:border-default-700 rounded-xl shadow-lg p-4"
                >
                  <div className="text-center text-default-400">
                    <Users size={24} className="mx-auto mb-2 text-default-300" />
                    <p className="text-sm font-medium">Tidak ditemukan</p>
                    <p className="text-xs">Coba kata kunci lain</p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Info */}
            <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
              <Info size={14} className="shrink-0 mt-0.5 text-blue-500" />
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Hanya mahasiswa yang sudah <strong>terdaftar</strong> dan <strong>menghubungkan GitHub</strong> yang dapat ditambahkan.
              </p>
            </div>
          </div>
        )}

        {/* Max Members Reached */}
        {!canAddMore && (
          <div className="mt-4 flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg">
            <CheckCircle2 size={16} className="text-emerald-500" />
            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
              Tim sudah lengkap! ({totalMembers} anggota)
            </span>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
