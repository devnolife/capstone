'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Github,
  Search,
  Star,
  GitFork,
  Globe,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Code2,
  FolderGit2,
  Clock,
  X,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  default_branch: string;
  private: boolean;
}

interface RepoSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (repo: GitHubRepo) => void;
  selectedRepoUrl?: string;
}

const languageColors: Record<string, string> = {
  JavaScript: '#f7df1e',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#178600',
  Go: '#00ADD8',
  Rust: '#dea584',
  PHP: '#4F5D95',
  Ruby: '#701516',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  Vue: '#41b883',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
};

export function GitHubRepoSelector({
  isOpen,
  onClose,
  onSelect,
  selectedRepoUrl,
}: RepoSelectorProps) {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [filteredRepos, setFilteredRepos] = useState<GitHubRepo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);

  const fetchRepos = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/github/repos');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mengambil repository');
      }

      setRepos(data);
      setFilteredRepos(data);

      if (selectedRepoUrl) {
        const matched = data.find(
          (repo: GitHubRepo) => repo.html_url === selectedRepoUrl
        );
        if (matched) {
          setSelectedRepo(matched);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRepos();
      setSearchQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredRepos(repos);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredRepos(
        repos.filter(
          (repo) =>
            repo.name.toLowerCase().includes(query) ||
            repo.full_name.toLowerCase().includes(query) ||
            repo.description?.toLowerCase().includes(query) ||
            repo.language?.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, repos]);

  const handleSelect = () => {
    if (selectedRepo) {
      onSelect(selectedRepo);
      onClose();
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="m-0 h-screen max-h-screen w-screen max-w-none translate-x-0 translate-y-0 top-0 left-0 rounded-none border-0 bg-background p-0 sm:max-w-none"
      >
        <div className="flex flex-col h-screen">
          {/* Header */}
          <div className="shrink-0 border-b bg-muted/50 backdrop-blur-lg sticky top-0 z-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-[#24292e] to-[#1a1e22] shadow-lg">
                    <Github size={22} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Pilih Repository</h2>
                    <p className="text-xs text-muted-foreground hidden sm:block">
                      {repos.length} repository public tersedia
                    </p>
                  </div>
                </div>

                {/* Search - Center */}
                <div className="flex-1 max-w-xl">
                  <div className="relative">
                    <Search
                      size={18}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                      placeholder="Cari repository, bahasa, atau deskripsi..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      aria-label="Cari repository"
                      className="h-10 pl-10 pr-10 text-sm"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full transition-colors"
                        aria-label="Bersihkan pencarian"
                      >
                        <X size={14} className="text-muted-foreground" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="font-medium"
                  >
                    Batal
                  </Button>
                  <Button
                    onClick={handleSelect}
                    disabled={!selectedRepo}
                    className="font-medium shadow-lg shadow-primary/20"
                  >
                    <CheckCircle2 size={16} />
                    <span className="hidden sm:inline ml-1">Pilih</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {/* Info Banner - Only public repos */}
            {!isLoading && !error && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50">
                  <Globe className="text-blue-500 shrink-0" size={18} />
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Hanya repository <strong>public</strong> yang ditampilkan. Repository private tidak dapat di-fork ke organisasi.
                  </p>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/30">
                  <AlertCircle className="text-destructive shrink-0" size={20} />
                  <p className="text-sm text-destructive flex-1">{error}</p>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={fetchRepos}
                  >
                    <RefreshCw size={14} />
                    Coba Lagi
                  </Button>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="relative">
                  <Spinner className="size-8 text-primary" />
                </div>
                <p className="text-muted-foreground">Mengambil repository public dari GitHub...</p>
              </div>
            )}

            {/* Repository Grid */}
            {!isLoading && !error && (
              <ScrollArea className="h-full">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                  {filteredRepos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                      <div className="p-4 rounded-full bg-muted">
                        <FolderGit2 className="text-muted-foreground" size={48} />
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-foreground">
                          {searchQuery ? 'Tidak ada hasil' : 'Tidak ada repository public'}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {searchQuery ? `Tidak ditemukan repository untuk "${searchQuery}"` : 'Buat repository public baru di GitHub untuk project capstone'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Filter chips */}
                      {searchQuery && (
                        <div className="mb-4 flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {filteredRepos.length} hasil untuk
                          </span>
                          <Badge
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => setSearchQuery('')}
                          >
                            {searchQuery}
                            <X size={10} />
                          </Badge>
                        </div>
                      )}

                      {/* Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <AnimatePresence mode="popLayout">
                          {filteredRepos.map((repo, index) => {
                            const isSelected = selectedRepo?.id === repo.id;
                            const langColor = languageColors[repo.language || ''] || '#6e7681';

                            return (
                              <motion.div
                                key={repo.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: index * 0.02 }}
                              >
                                <button
                                  onClick={() => setSelectedRepo(repo)}
                                  className={`
                                    w-full text-left p-4 rounded-xl border-2 transition-all duration-200
                                    hover:shadow-md hover:scale-[1.01] active:scale-[0.99]
                                    ${isSelected
                                      ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                                      : 'border-border hover:border-foreground/20 bg-background'
                                    }
                                  `}
                                >
                                  {/* Header */}
                                  <div className="flex items-start justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <div
                                        className="w-4 h-4 rounded-full shrink-0 ring-2 ring-offset-2 ring-offset-background"
                                        style={{
                                          backgroundColor: langColor,
                                          ['--tw-ring-color' as string]: langColor + '40'
                                        }}
                                      />
                                      <h3 className="font-semibold truncate">{repo.name}</h3>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <Globe size={12} className="text-emerald-600" />
                                      {isSelected && (
                                        <motion.div
                                          initial={{ scale: 0 }}
                                          animate={{ scale: 1 }}
                                          className="w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                                        >
                                          <CheckCircle2 size={12} className="text-white" />
                                        </motion.div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Full name */}
                                  <p className="text-xs text-muted-foreground truncate mb-2">
                                    {repo.full_name}
                                  </p>

                                  {/* Description */}
                                  {repo.description ? (
                                    <p className="text-sm text-foreground line-clamp-2 mb-3 min-h-[40px]">
                                      {repo.description}
                                    </p>
                                  ) : (
                                    <p className="text-sm text-muted-foreground italic mb-3 min-h-[40px]">
                                      Tidak ada deskripsi
                                    </p>
                                  )}

                                  {/* Footer Stats */}
                                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    {repo.language && (
                                      <span className="font-medium" style={{ color: langColor }}>
                                        {repo.language}
                                      </span>
                                    )}
                                    <div className="flex items-center gap-1">
                                      <Star size={12} />
                                      <span>{repo.stargazers_count}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <GitFork size={12} />
                                      <span>{repo.forks_count}</span>
                                    </div>
                                    <div className="flex items-center gap-1 ml-auto">
                                      <Clock size={12} />
                                      <span className="truncate max-w-[80px]">
                                        {formatDistanceToNow(new Date(repo.updated_at), {
                                          addSuffix: false,
                                          locale: id,
                                        })}
                                      </span>
                                    </div>
                                  </div>
                                </button>
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                      </div>
                    </>
                  )}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Selected Repo Footer */}
          <AnimatePresence>
            {selectedRepo && (
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="shrink-0 border-t bg-muted/50 backdrop-blur-lg"
              >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Code2 size={18} className="text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {selectedRepo.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {selectedRepo.full_name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        render={
                          <a
                            href={selectedRepo.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          />
                        }
                      >
                        <ExternalLink size={14} />
                        <span className="hidden sm:inline">Lihat di GitHub</span>
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSelect}
                        className="shadow-lg shadow-primary/20"
                      >
                        <CheckCircle2 size={14} />
                        Konfirmasi Pilihan
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface RepoDisplayProps {
  repoUrl: string;
  repoName?: string;
  onRemove?: () => void;
  onChangeRepo?: () => void;
}

export function GitHubRepoDisplay({
  repoUrl,
  repoName,
  onRemove,
  onChangeRepo,
}: RepoDisplayProps) {
  const displayName = repoName || repoUrl.replace('https://github.com/', '');
  const [owner, repo] = displayName.split('/');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-xl border bg-gradient-to-r from-muted/50 to-background"
    >
      {/* Accent line */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-primary to-secondary" />

      <div className="flex items-center gap-4 p-4 pl-5">
        {/* Icon */}
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#24292e] to-[#1a1e22] shadow-md">
          <Github size={20} className="text-white" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground">{owner}</span>
            <span className="text-muted-foreground">/</span>
            <span className="font-semibold">{repo}</span>
          </div>
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-0.5"
          >
            Buka di GitHub
            <ExternalLink size={10} />
          </a>
        </div>

        {/* Actions */}
        <div className="flex gap-2 shrink-0">
          {onChangeRepo && (
            <Button
              size="sm"
              variant="outline"
              onClick={onChangeRepo}
            >
              Ganti
            </Button>
          )}
          {onRemove && (
            <Button
              size="sm"
              variant="destructive"
              onClick={onRemove}
            >
              Hapus
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
