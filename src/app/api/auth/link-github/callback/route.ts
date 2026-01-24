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
    console.log('[GITHUB-LINK] Starting callback processing...');

    const session = await auth();

    if (!session?.user?.id) {
      console.log('[GITHUB-LINK] Error: No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[GITHUB-LINK] User ID:', session.user.id);

    const { code } = await request.json();

    if (!code) {
      console.log('[GITHUB-LINK] Error: No code provided');
      return NextResponse.json(
        { error: 'Authorization code is required' },
        { status: 400 }
      );
    }

    console.log('[GITHUB-LINK] Exchanging code for token...');
    console.log('[GITHUB-LINK] Client ID:', process.env.GITHUB_CLIENT_ID?.substring(0, 8) + '...');

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

    console.log('[GITHUB-LINK] Token response received');

    if (tokenData.error) {
      console.error('[GITHUB-LINK] Token error:', tokenData.error, tokenData.error_description);
      return NextResponse.json(
        { error: tokenData.error_description || 'Failed to get access token' },
        { status: 400 }
      );
    }

    console.log('[GITHUB-LINK] Token obtained, fetching user info...');

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
    console.log('[GITHUB-LINK] GitHub user:', githubUser.login);

    // Check if this GitHub account is already linked to another user
    const existingGitHubUser = await prisma.user.findUnique({
      where: { githubId: String(githubUser.id) },
    });

    if (existingGitHubUser && existingGitHubUser.id !== session.user.id) {
      console.log('[GITHUB-LINK] Error: GitHub already linked to another user');
      return NextResponse.json(
        { error: 'Akun GitHub ini sudah terhubung dengan akun lain' },
        { status: 400 }
      );
    }

    console.log('[GITHUB-LINK] Updating user with GitHub info...');

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

    console.log('[GITHUB-LINK] Upserting Account record...');

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

    console.log('[GITHUB-LINK] Success! GitHub linked for user:', session.user.id);

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
