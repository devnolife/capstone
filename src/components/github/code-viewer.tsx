'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Folder,
  File,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  Home,
  GitBranch,
  AlertTriangle,
} from 'lucide-react';
import { getLanguageFromPath, isBinaryFile } from '@/lib/github';

interface FileTreeItem {
  name: string;
  path: string;
  type: 'file' | 'dir';
  size?: number;
}

interface CodeViewerProps {
  owner: string;
  repo: string;
  defaultBranch?: string;
  projectId?: string; // Optional: used to get GitHub token from project owner
  onFileSelect?: (filePath: string, content: string) => void;
  onAddComment?: (
    filePath: string,
    lineStart: number,
    content: string,
  ) => void;
  selectedFile?: string;
  comments?: Array<{
    filePath: string;
    lineStart: number;
    content: string;
  }>;
  showBranchSelector?: boolean; // Whether to show branch selector
  availableBranches?: string[]; // List of available branches
  onBranchChange?: (branch: string) => void; // Callback when branch changes
}

export function GitHubCodeViewer({
  owner,
  repo,
  defaultBranch = 'main',
  projectId,
  onFileSelect,
  onAddComment,
  selectedFile: externalSelectedFile,
  comments = [],
  showBranchSelector = false,
  availableBranches = [],
  onBranchChange,
}: CodeViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<FileTreeItem[]>([]);
  const [currentPath, setCurrentPath] = useState('');
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());
  const [selectedFile, setSelectedFile] = useState<string | null>(
    externalSelectedFile || null,
  );
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [hoveredLine, setHoveredLine] = useState<number | null>(null);
  const [currentBranch, setCurrentBranch] = useState(defaultBranch);

  // Check if viewing non-main branch
  const isNonMainBranch = currentBranch !== 'main' && currentBranch !== 'master';

  // Handle branch change
  const handleBranchChange = (branch: string) => {
    setCurrentBranch(branch);
    setSelectedFile(null);
    setFileContent(null);
    setCurrentPath('');
    setExpandedDirs(new Set());
    if (onBranchChange) {
      onBranchChange(branch);
    }
  };

  // Fetch directory contents
  const fetchContents = useCallback(
    async (path: string = '') => {
      try {
        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams({
          owner,
          repo,
          path,
          ref: currentBranch,
        });

        // Add projectId if available for token resolution
        if (projectId) {
          params.set('projectId', projectId);
        }

        const response = await fetch(`/api/github/files?${params}`);

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to fetch files');
        }

        const data = await response.json();
        setFiles(data.files || []);
        setCurrentPath(path);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading files');
      } finally {
        setIsLoading(false);
      }
    },
    [owner, repo, currentBranch, projectId],
  );

  // Fetch file content
  const fetchFileContent = useCallback(
    async (filePath: string) => {
      if (isBinaryFile(filePath)) {
        setFileContent('[Binary file - cannot display]');
        return;
      }

      try {
        setIsLoadingFile(true);
        setError(null);

        const params = new URLSearchParams({
          owner,
          repo,
          path: filePath,
          ref: currentBranch,
          content: 'true',
        });

        // Add projectId if available for token resolution
        if (projectId) {
          params.set('projectId', projectId);
        }

        const response = await fetch(`/api/github/files?${params}`);

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to fetch file');
        }

        const data = await response.json();
        setFileContent(data.content || '');
        setSelectedFile(filePath);

        if (onFileSelect) {
          onFileSelect(filePath, data.content || '');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading file');
        setFileContent(null);
      } finally {
        setIsLoadingFile(false);
      }
    },
    [owner, repo, currentBranch, projectId, onFileSelect],
  );

  // Initial load
  useEffect(() => {
    fetchContents();
  }, [fetchContents]);

  // Refetch when branch changes
  useEffect(() => {
    fetchContents('');
  }, [currentBranch]);

  // Handle external file selection
  useEffect(() => {
    if (externalSelectedFile && externalSelectedFile !== selectedFile) {
      fetchFileContent(externalSelectedFile);
    }
  }, [externalSelectedFile, selectedFile, fetchFileContent]);

  const handleDirClick = (item: FileTreeItem) => {
    if (expandedDirs.has(item.path)) {
      const newExpanded = new Set(expandedDirs);
      newExpanded.delete(item.path);
      setExpandedDirs(newExpanded);
    } else {
      setExpandedDirs(new Set([...expandedDirs, item.path]));
      fetchContents(item.path);
    }
  };

  const handleFileClick = (item: FileTreeItem) => {
    fetchFileContent(item.path);
  };

  const handleBreadcrumbClick = (path: string) => {
    fetchContents(path);
    setSelectedFile(null);
    setFileContent(null);
  };

  const handleCopyCode = async () => {
    if (fileContent) {
      await navigator.clipboard.writeText(fileContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLineClick = (lineStart: number) => {
    if (onAddComment && selectedFile) {
      const comment = prompt('Add a comment for this line:');
      if (comment) {
        onAddComment(selectedFile, lineStart, comment);
      }
    }
  };

  // Get comments for current file
  const fileComments = comments.filter((c) => c.filePath === selectedFile);

  // Render breadcrumb
  const renderBreadcrumb = () => {
    const parts = currentPath ? currentPath.split('/') : [];

    return (
      <div className="flex items-center gap-1 text-sm overflow-x-auto">
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={() => handleBreadcrumbClick('')}
        >
          <Home size={14} />
        </Button>
        <span className="text-muted-foreground">/</span>
        {parts.map((part, index) => {
          const path = parts.slice(0, index + 1).join('/');
          return (
            <div key={path} className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="px-1"
                onClick={() => handleBreadcrumbClick(path)}
              >
                {part}
              </Button>
              {index < parts.length - 1 && (
                <span className="text-muted-foreground">/</span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Render file tree
  const renderFileTree = () => {
    // Sort: directories first, then files
    const sortedFiles = [...files].sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name);
      return a.type === 'dir' ? -1 : 1;
    });

    return (
      <div className="space-y-1">
        {sortedFiles.map((item) => (
          <div
            key={item.path}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${selectedFile === item.path
              ? 'bg-primary/10 text-primary'
              : 'hover:bg-muted'
              }`}
            onClick={() =>
              item.type === 'dir' ? handleDirClick(item) : handleFileClick(item)
            }
          >
            {item.type === 'dir' ? (
              <>
                {expandedDirs.has(item.path) ? (
                  <ChevronDown size={14} className="text-muted-foreground" />
                ) : (
                  <ChevronRight size={14} className="text-muted-foreground" />
                )}
                <Folder size={16} className="text-amber-500" />
              </>
            ) : (
              <>
                <span className="w-[14px]" />
                <File size={16} className="text-muted-foreground" />
              </>
            )}
            <span className="text-sm truncate">{item.name}</span>
          </div>
        ))}
      </div>
    );
  };

  // Render code with line numbers
  const renderCode = () => {
    if (!fileContent) return null;

    const lines = fileContent.split('\n');
    const language = selectedFile ? getLanguageFromPath(selectedFile) : 'text';

    return (
      <div className="relative">
        <div className="absolute top-2 right-2 flex gap-2">
          <Badge variant="secondary">
            {language}
          </Badge>
          <Button size="icon-sm" variant="outline" onClick={handleCopyCode}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </Button>
          {selectedFile && (
            <Button
              render={
                <a
                  href={`https://github.com/${owner}/${repo}/blob/${currentBranch}/${selectedFile}`}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
              size="icon-sm"
              variant="outline"
            >
              <ExternalLink size={14} />
            </Button>
          )}
        </div>

        <ScrollArea className="max-h-[600px]">
          <div className="font-mono text-sm">
            <table className="w-full border-collapse">
              <tbody>
                {lines.map((line, index) => {
                  const lineNum = index + 1;
                  const lineComment = fileComments.find(
                    (c) => c.lineStart === lineNum,
                  );
                  const hasComment = !!lineComment;

                  return (
                    <React.Fragment key={lineNum}>
                      <tr
                        className={`${hoveredLine === lineNum ? 'bg-muted' : ''
                          } ${hasComment ? 'bg-amber-50 dark:bg-amber-900/20' : ''}`}
                        onMouseEnter={() => setHoveredLine(lineNum)}
                        onMouseLeave={() => setHoveredLine(null)}
                      >
                        <td
                          className="select-none px-3 py-0.5 text-right text-muted-foreground border-r border-border w-12 cursor-pointer hover:text-primary hover:bg-primary/10"
                          onClick={() => handleLineClick(lineNum)}
                          title={
                            onAddComment ? 'Click to add comment' : undefined
                          }
                        >
                          {lineNum}
                        </td>
                        <td className="px-4 py-0.5 whitespace-pre overflow-x-auto">
                          {line || ' '}
                        </td>
                      </tr>
                      {hasComment && (
                        <tr>
                          <td colSpan={2} className="bg-amber-100 dark:bg-amber-900/30 px-4 py-2">
                            <div className="text-sm text-amber-700 dark:text-amber-300">
                              <strong>Comment:</strong> {lineComment.content}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </ScrollArea>
      </div>
    );
  };

  if (error && !files.length) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <AlertCircle size={48} className="mx-auto text-destructive mb-4" />
          <p className="text-destructive">{error}</p>
          <Button
            className="mt-4"
            variant="outline"
            onClick={() => fetchContents()}
          >
            <RefreshCw size={16} />
            Coba Lagi
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      {/* Branch Warning Banner */}
      {isNonMainBranch && (
        <div className="bg-amber-100 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-800 px-4 py-2 flex items-center gap-2">
          <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400" />
          <span className="text-sm text-amber-700 dark:text-amber-300">
            <strong>Perhatian:</strong> Anda sedang melihat branch <code className="bg-amber-200 dark:bg-amber-800 px-1 rounded">{currentBranch}</code>.
            Hanya kode di branch <code className="bg-amber-200 dark:bg-amber-800 px-1 rounded">main</code> yang akan dinilai.
          </span>
        </div>
      )}

      <CardHeader className="flex justify-between items-center gap-4">
        <div className="flex-1">{renderBreadcrumb()}</div>
        <div className="flex items-center gap-2">
          {/* Branch Selector */}
          {showBranchSelector && availableBranches.length > 0 && (
            <Select
              value={currentBranch}
              onValueChange={(value) => {
                if (value) handleBranchChange(value as string);
              }}
            >
              <SelectTrigger size="sm" className="w-40" aria-label="Pilih branch">
                <GitBranch size={14} />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableBranches.map((branch) => (
                  <SelectItem key={branch} value={branch}>
                    <span className="flex items-center gap-2">
                      <span>{branch}</span>
                      {(branch === 'main' || branch === 'master') && (
                        <Badge
                          variant="secondary"
                          className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                        >
                          default
                        </Badge>
                      )}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Current branch indicator (when selector is not shown) */}
          {!showBranchSelector && (
            <Badge variant="secondary">
              <GitBranch size={12} />
              {currentBranch}
            </Badge>
          )}

          <Button
            size="icon-sm"
            variant="outline"
            onClick={() => fetchContents(currentPath)}
            disabled={isLoading}
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </Button>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="p-0">
        <div className="flex min-h-[400px]">
          {/* File Tree */}
          <div className="w-64 border-r border-border p-3 overflow-y-auto">
            {isLoading && !files.length ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : (
              renderFileTree()
            )}
          </div>

          {/* Code View */}
          <div className="flex-1 overflow-hidden">
            {isLoadingFile ? (
              <div className="flex items-center justify-center h-full">
                <Spinner className="size-8" />
              </div>
            ) : selectedFile && fileContent !== null ? (
              <div className="h-full">
                <div className="bg-muted px-4 py-2 border-b border-border">
                  <p className="text-sm font-medium">{selectedFile}</p>
                </div>
                <div className="overflow-auto">{renderCode()}</div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <File size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Pilih file untuk melihat kode</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
