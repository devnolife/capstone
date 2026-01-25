import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createGitHubOrgClient } from '@/lib/github-org';

// GET /api/github/org-repos - List all repositories from organization
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admin and dosen can view org repos
    if (session.user.role !== 'ADMIN' && session.user.role !== 'DOSEN_PENGUJI') {
      return NextResponse.json(
        { error: 'Hanya admin dan dosen yang dapat mengakses data ini' },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'all' | 'public' | 'private' | 'forks' | 'sources' || 'all';
    const sort = searchParams.get('sort') as 'created' | 'updated' | 'pushed' | 'full_name' || 'updated';
    const capstonesOnly = searchParams.get('capstones') === 'true';
    const repoName = searchParams.get('repo'); // Get specific repo
    const withStats = searchParams.get('stats') === 'true';

    const orgClient = createGitHubOrgClient();

    // Get specific repo details
    if (repoName) {
      const repo = await orgClient.getOrgRepo(repoName);
      
      if (!repo) {
        return NextResponse.json(
          { error: 'Repository tidak ditemukan' },
          { status: 404 },
        );
      }

      // Get stats if requested
      if (withStats) {
        const stats = await orgClient.getRepoStats(repoName);
        return NextResponse.json({
          repo,
          stats,
        });
      }

      return NextResponse.json({ repo });
    }

    // List capstone repos only
    if (capstonesOnly) {
      const repos = await orgClient.listCapstoneRepos();
      
      // Get stats for each repo if requested
      if (withStats) {
        const reposWithStats = await Promise.all(
          repos.map(async (repo) => {
            const stats = await orgClient.getRepoStats(repo.name);
            return { ...repo, stats };
          })
        );
        
        return NextResponse.json({
          organization: orgClient.getOrgName(),
          total: reposWithStats.length,
          repos: reposWithStats,
        });
      }

      return NextResponse.json({
        organization: orgClient.getOrgName(),
        total: repos.length,
        repos,
      });
    }

    // List all org repos
    const { repos, total } = await orgClient.listOrgRepos({
      type,
      sort,
      perPage: 100,
    });

    return NextResponse.json({
      organization: orgClient.getOrgName(),
      total,
      repos,
    });
  } catch (error) {
    console.error('Error fetching org repos:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data repository dari organisasi' },
      { status: 500 },
    );
  }
}
