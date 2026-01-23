import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createGitHubClient } from '@/lib/github';
import { Octokit } from 'octokit';

// GET /api/github/search-user?q=username - Search GitHub users
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Query minimal 2 karakter' },
        { status: 400 },
      );
    }

    // Get user's GitHub token for authenticated requests (higher rate limit)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { githubToken: true },
    });

    // Use user's token if available, otherwise use org token
    const token = user?.githubToken || process.env.GITHUB_ORG_TOKEN;
    
    if (!token) {
      return NextResponse.json(
        { error: 'GitHub token tidak tersedia' },
        { status: 500 },
      );
    }

    const octokit = new Octokit({ auth: token });

    // Search for users
    const { data } = await octokit.rest.search.users({
      q: `${query} in:login`,
      per_page: 10,
    });

    // Get additional user info for each result
    const users = await Promise.all(
      data.items.slice(0, 10).map(async (item) => {
        try {
          const { data: userDetail } = await octokit.rest.users.getByUsername({
            username: item.login,
          });
          
          return {
            id: userDetail.id,
            login: userDetail.login,
            name: userDetail.name,
            avatar_url: userDetail.avatar_url,
            html_url: userDetail.html_url,
            bio: userDetail.bio,
            public_repos: userDetail.public_repos,
            followers: userDetail.followers,
          };
        } catch {
          // Return basic info if detailed fetch fails
          return {
            id: item.id,
            login: item.login,
            name: null,
            avatar_url: item.avatar_url,
            html_url: item.html_url,
            bio: null,
            public_repos: null,
            followers: null,
          };
        }
      }),
    );

    return NextResponse.json({
      total: data.total_count,
      users,
    });
  } catch (error) {
    console.error('Error searching GitHub users:', error);
    return NextResponse.json(
      { error: 'Gagal mencari pengguna GitHub' },
      { status: 500 },
    );
  }
}

// POST /api/github/search-user - Get user by exact username
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { username } = body;

    if (!username) {
      return NextResponse.json(
        { error: 'Username diperlukan' },
        { status: 400 },
      );
    }

    // Get user's GitHub token
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { githubToken: true },
    });

    const token = user?.githubToken || process.env.GITHUB_ORG_TOKEN;
    
    if (!token) {
      return NextResponse.json(
        { error: 'GitHub token tidak tersedia' },
        { status: 500 },
      );
    }

    const octokit = new Octokit({ auth: token });

    try {
      const { data } = await octokit.rest.users.getByUsername({
        username,
      });

      return NextResponse.json({
        found: true,
        user: {
          id: data.id,
          login: data.login,
          name: data.name,
          avatar_url: data.avatar_url,
          html_url: data.html_url,
          bio: data.bio,
          public_repos: data.public_repos,
          followers: data.followers,
        },
      });
    } catch (error: unknown) {
      // User not found
      if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
        return NextResponse.json({
          found: false,
          user: null,
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error getting GitHub user:', error);
    return NextResponse.json(
      { error: 'Gagal mendapatkan pengguna GitHub' },
      { status: 500 },
    );
  }
}
