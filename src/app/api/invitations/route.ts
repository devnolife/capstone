import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/invitations - Get current user's received invitations
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const invitations = await prisma.teamInvitation.findMany({
      where: {
        inviteeId: session.user.id,
        status: 'pending',
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            description: true,
            semester: true,
            tahunAkademik: true,
            mahasiswa: {
              select: {
                id: true,
                name: true,
                username: true,
                nim: true,
                prodi: true,
                image: true,
                simakPhoto: true,
              },
            },
            _count: {
              select: {
                members: true,
              },
            },
          },
        },
        inviter: {
          select: {
            id: true,
            name: true,
            username: true,
            nim: true,
            image: true,
            simakPhoto: true,
            prodi: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Also get count of pending invitations
    const pendingCount = invitations.length;

    return NextResponse.json({ invitations, pendingCount });
  } catch (error) {
    console.error('Error fetching invitations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
