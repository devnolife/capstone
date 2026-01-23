import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import {
  createGitHubClient,
  parseGitHubUrl,
  isBinaryFile,
  getLanguageFromPath,
} from '@/lib/github';

// GET /api/github/files - Get files from a GitHub repository
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const repoUrl = searchParams.get('repoUrl');
    const ownerParam = searchParams.get('owner');
    const repoParam = searchParams.get('repo');
    const path = searchParams.get('path') || '';
    const ref = searchParams.get('ref'); // branch/commit reference
    const action = searchParams.get('action') || 'list'; // list, content, tree, commits
    const getContent = searchParams.get('content') === 'true'; // shortcut for content action
    const projectId = searchParams.get('projectId'); // Optional: to get token from project owner

    let owner: string;
    let repo: string;

    // Support both repoUrl and owner/repo params
    if (ownerParam && repoParam) {
      owner = ownerParam;
      repo = repoParam;
    } else if (repoUrl) {
      // Parse GitHub URL
      const parsed = parseGitHubUrl(repoUrl);
      if (!parsed) {
        return NextResponse.json(
          { error: 'URL GitHub tidak valid' },
          { status: 400 },
        );
      }
      owner = parsed.owner;
      repo = parsed.repo;
    } else {
      return NextResponse.json(
        { error: 'Repository URL atau owner/repo diperlukan' },
        { status: 400 },
      );
    }

    // Try to get GitHub token from multiple sources
    let githubToken: string | null = null;

    // 1. First, try current user's token
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { githubToken: true, role: true },
    });

    if (currentUser?.githubToken) {
      githubToken = currentUser.githubToken;
    }

    // 2. If current user doesn't have token and projectId is provided,
    //    try to get token from project owner (mahasiswa)
    if (!githubToken && projectId) {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: {
          mahasiswa: {
            select: { githubToken: true },
          },
        },
      });

      if (project?.mahasiswa?.githubToken) {
        githubToken = project.mahasiswa.githubToken;
      }
    }

    // 3. If still no token, try to find project by repo URL and get owner's token
    if (!githubToken) {
      const repoFullUrl = `https://github.com/${owner}/${repo}`;
      const project = await prisma.project.findFirst({
        where: {
          OR: [
            { githubRepoUrl: { contains: `${owner}/${repo}` } },
            { orgRepoUrl: { contains: `${owner}/${repo}` } },
          ],
        },
        select: {
          mahasiswa: {
            select: { githubToken: true },
          },
        },
      });

      if (project?.mahasiswa?.githubToken) {
        githubToken = project.mahasiswa.githubToken;
      }
    }

    // 4. Fallback to organization token (for org repos) or app token
    if (!githubToken) {
      // Use org token if repo belongs to the organization
      const orgName = process.env.GITHUB_ORG_NAME || 'capstone-informatika';
      if (owner === orgName && process.env.GITHUB_ORG_TOKEN) {
        githubToken = process.env.GITHUB_ORG_TOKEN;
      }
      // Or if it's any repo and we have an org token, use it
      else if (process.env.GITHUB_ORG_TOKEN) {
        githubToken = process.env.GITHUB_ORG_TOKEN;
      }
      // Final fallback to app token
      else if (process.env.GITHUB_APP_TOKEN) {
        githubToken = process.env.GITHUB_APP_TOKEN;
      }
    }

    if (!githubToken) {
      return NextResponse.json(
        {
          error: 'GitHub tidak terhubung. Silakan konfigurasi GITHUB_ORG_TOKEN di environment variables atau pemilik project perlu login dengan GitHub.',
          code: 'NO_GITHUB_TOKEN'
        },
        { status: 400 },
      );
    }

    const github = createGitHubClient(githubToken);

    // Handle shortcut for getting file content directly
    if (getContent && path) {
      if (isBinaryFile(path)) {
        return NextResponse.json({
          content: '[Binary file - cannot display]',
          path,
          isBinary: true,
        });
      }

      const fileContent = await github.getFileContent(
        owner,
        repo,
        path,
        ref || undefined,
      );
      const language = getLanguageFromPath(path);

      return NextResponse.json({
        ...fileContent,
        content: fileContent.content,
        language,
      });
    }

    switch (action) {
      case 'list': {
        // Get files/folders at specific path
        const contents = await github.getRepoContents(
          owner,
          repo,
          path,
          ref || undefined,
        );

        // Sort: directories first, then files
        contents.sort((a, b) => {
          if (a.type === 'dir' && b.type === 'file') return -1;
          if (a.type === 'file' && b.type === 'dir') return 1;
          return a.name.localeCompare(b.name);
        });

        return NextResponse.json({
          path,
          files: contents, // Also return as 'files' for compatibility
          contents,
        });
      }

      case 'content': {
        // Get file content
        if (isBinaryFile(path)) {
          return NextResponse.json({
            content: '[Binary file - cannot display]',
            path,
            isBinary: true,
          });
        }

        const fileContent = await github.getFileContent(
          owner,
          repo,
          path,
          ref || undefined,
        );
        const language = getLanguageFromPath(path);

        return NextResponse.json({
          ...fileContent,
          language,
        });
      }

      case 'tree': {
        // Get full repository tree
        const tree = await github.getTree(owner, repo);

        // Filter out common non-code directories
        const filtered = tree.filter((item) => {
          const ignoreDirs = [
            'node_modules',
            '.git',
            'dist',
            'build',
            '.next',
            'vendor',
            '__pycache__',
          ];
          return !ignoreDirs.some(
            (dir) => item.path.startsWith(dir + '/') || item.path === dir,
          );
        });

        return NextResponse.json({
          tree: filtered,
        });
      }

      case 'commits': {
        // Get recent commits
        const commits = await github.getCommits(owner, repo, {
          path: path || undefined,
          per_page: 20,
        });

        return NextResponse.json({
          commits,
        });
      }

      case 'branches': {
        // Get branches
        const branches = await github.getBranches(owner, repo);

        return NextResponse.json({
          branches,
        });
      }

      case 'languages': {
        // Get language breakdown
        const languages = await github.getLanguages(owner, repo);

        // Calculate percentages
        const total = Object.values(languages).reduce(
          (sum, bytes) => sum + bytes,
          0,
        );
        const languagePercentages = Object.entries(languages).map(
          ([lang, bytes]) => ({
            language: lang,
            bytes,
            percentage: Math.round((bytes / total) * 100 * 10) / 10,
          }),
        );

        return NextResponse.json({
          languages: languagePercentages,
        });
      }

      case 'info': {
        // Get repository info
        const repoInfo = await github.getRepo(owner, repo);

        return NextResponse.json(repoInfo);
      }

      default:
        return NextResponse.json(
          { error: 'Action tidak valid' },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error('Error fetching GitHub files:', error);

    // Handle GitHub API errors
    if (error instanceof Error) {
      if (error.message.includes('Not Found')) {
        return NextResponse.json(
          { error: 'Repository atau file tidak ditemukan' },
          { status: 404 },
        );
      }
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'Batas request GitHub tercapai. Coba lagi nanti.' },
          { status: 429 },
        );
      }
    }

    return NextResponse.json(
      { error: 'Gagal mengambil file dari GitHub' },
      { status: 500 },
    );
  }
}
