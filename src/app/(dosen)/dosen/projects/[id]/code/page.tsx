'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardBody,
  Button,
  Chip,
  Spinner,
  Select,
  SelectItem,
  Avatar,
} from '@heroui/react';
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
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <AlertCircle size={32} className="text-red-500" />
        </div>
        <p className="text-danger text-lg font-medium">
          {error || 'Project tidak ditemukan'}
        </p>
        <Button
          as={Link}
          href="/dosen/projects"
          variant="flat"
          className="mt-4"
          startContent={<ArrowLeft size={16} />}
        >
          Kembali ke Daftar Project
        </Button>
      </div>
    );
  }

  if (!project.githubRepoUrl) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
          <Github size={32} className="text-amber-500" />
        </div>
        <p className="text-amber-600 dark:text-amber-400 text-lg font-medium">
          Project ini tidak memiliki repository GitHub
        </p>
        <Button
          as={Link}
          href={`/dosen/projects/${projectId}`}
          variant="flat"
          className="mt-4"
          startContent={<ArrowLeft size={16} />}
        >
          Kembali ke Detail Project
        </Button>
      </div>
    );
  }

  const githubInfo = parseGitHubUrl(project.githubRepoUrl);

  if (!githubInfo) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <AlertCircle size={32} className="text-red-500" />
        </div>
        <p className="text-danger text-lg font-medium">
          URL GitHub tidak valid
        </p>
        <Button
          as={Link}
          href={`/dosen/projects/${projectId}`}
          variant="flat"
          className="mt-4"
          startContent={<ArrowLeft size={16} />}
        >
          Kembali ke Detail Project
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 pb-8">
      {/* Header */}
      <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <CardBody className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                as={Link}
                href={`/dosen/projects/${projectId}`}
                variant="flat"
                size="sm"
                startContent={<ArrowLeft size={16} />}
              >
                Kembali
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-zinc-900 dark:bg-zinc-700 text-white">
                  <Github size={20} />
                </div>
                <div>
                  <h1 className="font-semibold text-lg">{project.title}</h1>
                  <div className="flex items-center gap-2 text-sm text-default-500">
                    <Avatar
                      name={project.mahasiswa.name}
                      src={project.mahasiswa.image || undefined}
                      size="sm"
                      className="w-5 h-5"
                    />
                    <span>{project.mahasiswa.name}</span>
                    <span className="text-default-400">•</span>
                    <span>{project.githubRepoName || 'Repository'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Branch Selector */}
              {branches.length > 0 && (
                <Select
                  size="sm"
                  label="Branch"
                  selectedKeys={[selectedBranch]}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-40"
                  startContent={<GitBranch size={14} />}
                  isLoading={isLoadingBranches}
                >
                  {branches.map((branch) => (
                    <SelectItem key={branch.name}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </Select>
              )}

              <Button
                as="a"
                href={project.githubRepoUrl}
                target="_blank"
                rel="noopener noreferrer"
                size="sm"
                variant="bordered"
                startContent={<ExternalLink size={14} />}
              >
                Buka di GitHub
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Full Height Code Viewer */}
      <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <CardBody className="p-0">
          <div className="min-h-[calc(100vh-220px)]">
            <GitHubCodeViewer
              owner={githubInfo.owner}
              repo={githubInfo.repo}
              defaultBranch={selectedBranch}
              projectId={projectId}
            />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
