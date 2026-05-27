import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { decryptNullable } from '@/lib/crypto';
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

    const { searchParams } = new URL(request.url);
    const repoUrl = searchParams.get('repoUrl');
    const ownerParam = searchParams.get('owner');
    const repoParam = searchParams.get('repo');
    const path = searchParams.get('path') || '';
    const ref = searchParams.get('ref'); // branch/commit reference
    const action = searchParams.get('action') || 'list'; // list, content, tree, commits
    const getContent = searchParams.get('content') === 'true'; // shortcut for content action
    const projectId = searchParams.get('projectId'); // Optional: to get token from project owner

    // Allow access if either:
    //  - the requester has a valid session, OR
    //  - a valid projectId is provided (so we have explicit project context
    //    and can resolve a GitHub token via the project owner / org fallback).
    // This mirrors how the GitHub code viewer is used across the app and
    // avoids spurious 401s when the user's session cookie isn't visible to
    // the API route (e.g. expired session while the page is still mounted).
    if (!session?.user?.id && !projectId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    // Collect GitHub token candidates in priority order. We'll try each
    // until one works — this matters because the *current* user (often a
    // dosen) may have a valid GitHub token that simply doesn't have access
    // to the mahasiswa's private repo. In that case GitHub returns 401 and
    // we should transparently fall back to the project owner's token, then
    // to the org/app tokens, before surfacing an error.
    const tokenCandidates: Array<{ source: string; raw: string }> = [];
    const pushCandidate = (source: string, raw: string | null | undefined) => {
      if (!raw) return;
      if (tokenCandidates.some((c) => c.raw === raw)) return;
      tokenCandidates.push({ source, raw });
    };

    // 1. Project owner's token (preferred when projectId is given — they
    //    are guaranteed to have access to their own repo).
    if (projectId) {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: {
          id: true,
          mahasiswa: {
            select: { githubToken: true },
          },
        },
      });

      if (!session?.user?.id && !project) {
        // Unauthenticated callers must reference an existing project.
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      pushCandidate('project-owner', project?.mahasiswa?.githubToken ?? null);
    }

    // 2. Token from any project that owns this repo (covers cases where the
    //    caller didn't pass projectId but the repo is tracked).
    {
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
      pushCandidate('repo-owner', project?.mahasiswa?.githubToken ?? null);
    }

    // 3. Current authenticated user's token (last DB candidate — dosens
    //    typically can't read student private repos with their own token).
    if (session?.user?.id) {
      const currentUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { githubToken: true },
      });
      pushCandidate('current-user', currentUser?.githubToken ?? null);
    }

    // 4. Environment-provided org / app tokens.
    pushCandidate('env-org', process.env.GITHUB_ORG_TOKEN);
    pushCandidate('env-app', process.env.GITHUB_APP_TOKEN);

    if (tokenCandidates.length === 0) {
      return NextResponse.json(
        {
          error:
            'GitHub tidak terhubung. Silakan konfigurasi GITHUB_ORG_TOKEN di environment variables atau pemilik project perlu login dengan GitHub.',
          code: 'NO_GITHUB_TOKEN',
        },
        { status: 400 },
      );
    }

    // Try each candidate token, falling back on auth errors (401/403). For
    // any other error we surface it immediately — it's not a credentials
    // problem.
    const runWithToken = async <T>(
      fn: (gh: ReturnType<typeof createGitHubClient>) => Promise<T>,
    ): Promise<T> => {
      let lastAuthError: unknown = null;
      for (const candidate of tokenCandidates) {
        const resolved = decryptNullable(candidate.raw);
        if (!resolved) continue;
        try {
          const gh = createGitHubClient(resolved);
          return await fn(gh);
        } catch (err) {
          const status = (err as { status?: number }).status;
          if (status === 401 || status === 403) {
            console.warn(
              `[github/files] token '${candidate.source}' rejected (${status}) for ${owner}/${repo}; trying next candidate`,
            );
            lastAuthError = err;
            continue;
          }
          throw err;
        }
      }
      // All candidates failed with auth errors.
      throw lastAuthError ?? new Error('No usable GitHub token');
    };

    // Handle shortcut for getting file content directly
    if (getContent && path) {
      if (isBinaryFile(path)) {
        return NextResponse.json({
          content: '[Binary file - cannot display]',
          path,
          isBinary: true,
        });
      }

      const fileContent = await runWithToken((gh) =>
        gh.getFileContent(owner, repo, path, ref || undefined),
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
        const contents = await runWithToken((gh) =>
          gh.getRepoContents(owner, repo, path, ref || undefined),
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

        const fileContent = await runWithToken((gh) =>
          gh.getFileContent(owner, repo, path, ref || undefined),
        );
        const language = getLanguageFromPath(path);

        return NextResponse.json({
          ...fileContent,
          language,
        });
      }

      case 'tree': {
        // Get full repository tree
        const tree = await runWithToken((gh) => gh.getTree(owner, repo));

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
        const commits = await runWithToken((gh) =>
          gh.getCommits(owner, repo, {
            path: path || undefined,
            per_page: 20,
          }),
        );

        return NextResponse.json({
          commits,
        });
      }

      case 'branches': {
        // Get branches
        const branches = await runWithToken((gh) => gh.getBranches(owner, repo));

        return NextResponse.json({
          branches,
        });
      }

      case 'languages': {
        // Get language breakdown
        const languages = await runWithToken((gh) => gh.getLanguages(owner, repo));

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
        const repoInfo = await runWithToken((gh) => gh.getRepo(owner, repo));

        return NextResponse.json(repoInfo);
      }

      default:
        return NextResponse.json(
          { error: 'Action tidak valid' },
          { status: 400 },
        );
    }
  } catch (error: unknown) {
    console.error('Error fetching GitHub files:', error);

    // Handle GitHub API errors with more detail
    const httpError = error as { status?: number; message?: string };

    if (httpError.status === 404) {
      return NextResponse.json(
        {
          error: 'Repository atau branch tidak ditemukan. Pastikan repository ada dan dapat diakses.',
          details: 'Repository mungkin private, belum dibuat, atau nama/branch salah.',
          code: 'REPO_NOT_FOUND'
        },
        { status: 404 },
      );
    }

    if (httpError.status === 403) {
      return NextResponse.json(
        {
          error: 'Akses ditolak ke repository.',
          details: 'Token GitHub tidak memiliki izin untuk mengakses repository ini.',
          code: 'ACCESS_DENIED'
        },
        { status: 403 },
      );
    }

    if (httpError.status === 401) {
      return NextResponse.json(
        {
          error: 'Token GitHub tidak valid atau expired.',
          details:
            'Tidak ada token GitHub yang berhasil mengakses repository ini. Pastikan pemilik project login ulang dengan GitHub, atau atur GITHUB_ORG_TOKEN di environment.',
          code: 'UNAUTHORIZED',
        },
        { status: 401 },
      );
    }

    if (error instanceof Error) {
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
