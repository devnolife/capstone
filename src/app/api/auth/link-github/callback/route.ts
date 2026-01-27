/**
 * GitHub OAuth Callback API for Account Linking
 * Exchanges OAuth code for token and links GitHub account to current user
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

interface GitHubTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
  error?: string;
  error_description?: string;
}

interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  avatar_url: string;
  email: string | null;
}

// POST /api/auth/link-github/callback - Exchange code and link account
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code is required' },
        { status: 400 }
      );
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData: GitHubTokenResponse = await tokenResponse.json();

    if (tokenData.error) {
      console.error('[GITHUB-LINK] Token error:', tokenData.error, tokenData.error_description);
      return NextResponse.json(
        { error: tokenData.error_description || 'Failed to get access token' },
        { status: 400 }
      );
    }

    // Get GitHub user info
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!userResponse.ok) {
      console.error('[GITHUB-LINK] Failed to get user info:', userResponse.status);
      return NextResponse.json(
        { error: 'Failed to get GitHub user info' },
        { status: 400 }
      );
    }

    const githubUser: GitHubUser = await userResponse.json();

    // Check if this GitHub account is already linked to another user
    const existingGitHubUser = await prisma.user.findUnique({
      where: { githubId: String(githubUser.id) },
    });

    if (existingGitHubUser && existingGitHubUser.id !== session.user.id) {
      return NextResponse.json(
        { error: 'Akun GitHub ini sudah terhubung dengan akun lain' },
        { status: 400 }
      );
    }

    // Link GitHub account to current user
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        githubId: String(githubUser.id),
        githubUsername: githubUser.login,
        githubToken: tokenData.access_token,
        // Optionally update image if user doesn't have one
        image: githubUser.avatar_url,
      },
    });

    // Also store in Account table for NextAuth compatibility
    await prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: 'github',
          providerAccountId: String(githubUser.id),
        },
      },
      update: {
        access_token: tokenData.access_token,
        token_type: tokenData.token_type,
        scope: tokenData.scope,
      },
      create: {
        userId: session.user.id,
        type: 'oauth',
        provider: 'github',
        providerAccountId: String(githubUser.id),
        access_token: tokenData.access_token,
        token_type: tokenData.token_type,
        scope: tokenData.scope,
      },
    });

    return NextResponse.json({
      success: true,
      githubUsername: githubUser.login,
      message: 'Akun GitHub berhasil terhubung',
    });
  } catch (error) {
    console.error('[GITHUB-LINK] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
