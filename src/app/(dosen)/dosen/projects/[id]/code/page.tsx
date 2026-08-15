'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ArrowLeft,
  Github,
  ExternalLink,
  AlertCircle,
  GitBranch,
  User,
} from 'lucide-react';
import { GitHubCodeViewer } from '@/components/github';
import { parseGitHubUrl } from '@/lib/github';

interface Project {
  id: string;
  title: string;
  githubRepoUrl: string | null;
  githubRepoName: string | null;
  mahasiswa: {
    id: string;
    name: string;
    username: string;
    image: string | null;
  };
}

interface Branch {
  name: string;
  protected: boolean;
}

export default function DosenProjectCodeViewerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState('');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState('main');
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch project');
        }
        const data = await response.json();
        setProject(data);

        // Fetch branches if GitHub URL exists
        if (data.githubRepoUrl) {
          const githubInfo = parseGitHubUrl(data.githubRepoUrl);
          if (githubInfo) {
            fetchBranches(githubInfo.owner, githubInfo.repo);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading project');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  const fetchBranches = async (owner: string, repo: string) => {
    setIsLoadingBranches(true);
    try {
      const response = await fetch(
        `/api/github/files?owner=${owner}&repo=${repo}&action=branches`
      );
      if (response.ok) {
        const data = await response.json();
        setBranches(data.branches || []);
        // Set default branch if available
        const defaultBranch = data.branches?.find(
          (b: Branch) => b.name === 'main' || b.name === 'master'
        );
        if (defaultBranch) {
          setSelectedBranch(defaultBranch.name);
        }
      }
    } catch (err) {
      console.error('Failed to fetch branches:', err);
    } finally {
      setIsLoadingBranches(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertCircle size={32} className="text-destructive" />
        </div>
        <p className="text-destructive text-lg font-medium">
          {error || 'Project tidak ditemukan'}
        </p>
        <Button
          render={<Link href="/dosen/projects" />}
          variant="secondary"
          className="mt-4"
        >
          <ArrowLeft size={16} />
          Kembali ke Daftar Project
        </Button>
      </div>
    );
  }

  if (!project.githubRepoUrl) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-warning/10 flex items-center justify-center">
          <Github size={32} className="text-warning" />
        </div>
        <p className="text-warning text-lg font-medium">
          Project ini tidak memiliki repository GitHub
        </p>
        <Button
          render={<Link href={`/dosen/projects/${projectId}`} />}
          variant="secondary"
          className="mt-4"
        >
          <ArrowLeft size={16} />
          Kembali ke Detail Project
        </Button>
      </div>
    );
  }

  const githubInfo = parseGitHubUrl(project.githubRepoUrl);

  if (!githubInfo) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertCircle size={32} className="text-destructive" />
        </div>
        <p className="text-destructive text-lg font-medium">
          URL GitHub tidak valid
        </p>
        <Button
          render={<Link href={`/dosen/projects/${projectId}`} />}
          variant="secondary"
          className="mt-4"
        >
          <ArrowLeft size={16} />
          Kembali ke Detail Project
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 pb-8">
      {/* Header */}
      <Card className="border border-border bg-card shadow-none">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                render={<Link href={`/dosen/projects/${projectId}`} />}
                variant="secondary"
                size="sm"
              >
                <ArrowLeft size={16} />
                Kembali
              </Button>
              <div className="flex items-center gap-3">
                <span className="bg-app-primary text-foreground flex size-9 items-center justify-center rounded-lg">
                  <Github size={20} />
                </span>
                <div>
                  <h1 className="font-semibold text-lg">{project.title}</h1>
                  <div className="flex items-center gap-2 text-sm text-app-secondary-invert">
                    <Avatar className="size-5">
                      <AvatarImage
                        src={project.mahasiswa.image || undefined}
                        alt={project.mahasiswa.name}
                      />
                      <AvatarFallback className="text-[10px]">
                        {project.mahasiswa.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span>{project.mahasiswa.name}</span>
                    <span className="text-app-teritary-invert">•</span>
                    <span>{project.githubRepoName || 'Repository'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                render={
                  <a
                    href={project.githubRepoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
                size="sm"
                variant="outline"
              >
                <ExternalLink size={14} />
                Buka di GitHub
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Full Height Code Viewer */}
      <Card className="border border-border bg-card shadow-none overflow-hidden">
        <CardContent className="p-0">
          <div className="min-h-[calc(100vh-220px)]">
            <GitHubCodeViewer
              owner={githubInfo.owner}
              repo={githubInfo.repo}
              defaultBranch={selectedBranch}
              projectId={projectId}
              showBranchSelector={branches.length > 0}
              availableBranches={branches.map(b => b.name)}
              onBranchChange={(branch) => setSelectedBranch(branch)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
