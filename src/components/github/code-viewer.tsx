'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Spinner,
  Chip,
  Divider,
  ScrollShadow,
  Select,
  SelectItem,
} from '@heroui/react';
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
          size="sm"
          variant="light"
          isIconOnly
          onPress={() => handleBreadcrumbClick('')}
        >
          <Home size={14} />
        </Button>
        <span className="text-default-400">/</span>
        {parts.map((part, index) => {
          const path = parts.slice(0, index + 1).join('/');
          return (
            <div key={path} className="flex items-center gap-1">
              <Button
                size="sm"
                variant="light"
                className="min-w-0 px-1"
                onPress={() => handleBreadcrumbClick(path)}
              >
                {part}
              </Button>
              {index < parts.length - 1 && (
                <span className="text-default-400">/</span>
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
              : 'hover:bg-default-100'
              }`}
            onClick={() =>
              item.type === 'dir' ? handleDirClick(item) : handleFileClick(item)
            }
          >
            {item.type === 'dir' ? (
              <>
                {expandedDirs.has(item.path) ? (
                  <ChevronDown size={14} className="text-default-400" />
                ) : (
                  <ChevronRight size={14} className="text-default-400" />
                )}
                <Folder size={16} className="text-warning" />
              </>
            ) : (
              <>
                <span className="w-[14px]" />
                <File size={16} className="text-default-400" />
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
          <Chip size="sm" variant="flat">
            {language}
          </Chip>
          <Button size="sm" variant="flat" isIconOnly onPress={handleCopyCode}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </Button>
          {selectedFile && (
            <Button
              as="a"
              href={`https://github.com/${owner}/${repo}/blob/${currentBranch}/${selectedFile}`}
              target="_blank"
              size="sm"
              variant="flat"
              isIconOnly
            >
              <ExternalLink size={14} />
            </Button>
          )}
        </div>

        <ScrollShadow className="max-h-[600px]">
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
                        className={`${hoveredLine === lineNum ? 'bg-default-100' : ''
                          } ${hasComment ? 'bg-warning-50' : ''}`}
                        onMouseEnter={() => setHoveredLine(lineNum)}
                        onMouseLeave={() => setHoveredLine(null)}
                      >
                        <td
                          className="select-none px-3 py-0.5 text-right text-default-400 border-r border-divider w-12 cursor-pointer hover:text-primary hover:bg-primary/10"
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
                          <td colSpan={2} className="bg-warning-100 px-4 py-2">
                            <div className="text-sm text-warning-700">
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
        </ScrollShadow>
      </div>
    );
  };

  if (error && !files.length) {
    return (
      <Card>
        <CardBody className="text-center py-12">
          <AlertCircle size={48} className="mx-auto text-danger mb-4" />
          <p className="text-danger">{error}</p>
          <Button
            className="mt-4"
            variant="flat"
            startContent={<RefreshCw size={16} />}
            onPress={() => fetchContents()}
          >
            Coba Lagi
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      {/* Branch Warning Banner */}
      {isNonMainBranch && (
        <div className="bg-warning-100 border-b border-warning-200 px-4 py-2 flex items-center gap-2">
          <AlertTriangle size={16} className="text-warning-600" />
          <span className="text-sm text-warning-700">
            <strong>Perhatian:</strong> Anda sedang melihat branch <code className="bg-warning-200 px-1 rounded">{currentBranch}</code>. 
            Hanya kode di branch <code className="bg-warning-200 px-1 rounded">main</code> yang akan dinilai.
          </span>
        </div>
      )}

      <CardHeader className="flex justify-between items-center gap-4">
        <div className="flex-1">{renderBreadcrumb()}</div>
        <div className="flex items-center gap-2">
          {/* Branch Selector */}
          {showBranchSelector && availableBranches.length > 0 && (
            <Select
              size="sm"
              variant="flat"
              selectedKeys={[currentBranch]}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                if (selected) handleBranchChange(selected);
              }}
              className="w-40"
              startContent={<GitBranch size={14} />}
              aria-label="Pilih branch"
            >
              {availableBranches.map((branch) => (
                <SelectItem key={branch} textValue={branch}>
                  <div className="flex items-center gap-2">
                    <span>{branch}</span>
                    {(branch === 'main' || branch === 'master') && (
                      <Chip size="sm" color="success" variant="flat">
                        default
                      </Chip>
                    )}
                  </div>
                </SelectItem>
              ))}
            </Select>
          )}

          {/* Current branch indicator (when selector is not shown) */}
          {!showBranchSelector && (
            <Chip
              size="sm"
              variant="flat"
              startContent={<GitBranch size={12} />}
            >
              {currentBranch}
            </Chip>
          )}

          <Button
            size="sm"
            variant="flat"
            isIconOnly
            onPress={() => fetchContents(currentPath)}
            isLoading={isLoading}
          >
            <RefreshCw size={14} />
          </Button>
        </div>
      </CardHeader>

      <Divider />

      <CardBody className="p-0">
        <div className="flex min-h-[400px]">
          {/* File Tree */}
          <div className="w-64 border-r border-divider p-3 overflow-y-auto">
            {isLoading && !files.length ? (
              <div className="flex justify-center py-8">
                <Spinner size="sm" />
              </div>
            ) : (
              renderFileTree()
            )}
          </div>

          {/* Code View */}
          <div className="flex-1 overflow-hidden">
            {isLoadingFile ? (
              <div className="flex items-center justify-center h-full">
                <Spinner size="lg" />
              </div>
            ) : selectedFile && fileContent !== null ? (
              <div className="h-full">
                <div className="bg-default-100 px-4 py-2 border-b border-divider">
                  <p className="text-sm font-medium">{selectedFile}</p>
                </div>
                <div className="overflow-auto">{renderCode()}</div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-default-400">
                <div className="text-center">
                  <File size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Pilih file untuk melihat kode</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
