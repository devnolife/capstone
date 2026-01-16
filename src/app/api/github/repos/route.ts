import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createGitHubClient } from '@/lib/github';

// GET /api/github/repos - Get user's GitHub repositories
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's GitHub token
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { githubToken: true },
    });

    if (!user?.githubToken) {
      return NextResponse.json(
        { error: 'GitHub tidak terhubung. Silakan login dengan GitHub.' },
        { status: 400 },
      );
    }

    const github = createGitHubClient(user.githubToken);
    const repos = await github.getUserRepos();

    return NextResponse.json(repos);
  } catch (error) {
    console.error('Error fetching GitHub repos:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil repository dari GitHub' },
      { status: 500 },
    );
  }
}
