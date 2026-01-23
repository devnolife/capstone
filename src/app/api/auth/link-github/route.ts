/**
 * GitHub Account Linking API
 * Handles linking/unlinking GitHub accounts to existing users
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/auth/link-github - Get current GitHub link status
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        githubId: true,
        githubUsername: true,
        githubToken: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      linked: !!user.githubId,
      githubUsername: user.githubUsername,
      hasToken: !!user.githubToken,
    });
  } catch (error) {
    console.error('Error checking GitHub link status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/auth/link-github - Unlink GitHub account
export async function DELETE() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Remove GitHub data from user
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        githubId: null,
        githubUsername: null,
        githubToken: null,
      },
    });

    // Remove Account record for GitHub
    await prisma.account.deleteMany({
      where: {
        userId: session.user.id,
        provider: 'github',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Akun GitHub berhasil di-unlink',
    });
  } catch (error) {
    console.error('Error unlinking GitHub account:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
