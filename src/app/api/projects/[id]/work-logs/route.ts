import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { decryptNullable } from '@/lib/crypto';
import { createGitHubClient, parseGitHubUrl } from '@/lib/github';

async function getProjectAccess(projectId: string, userId: string) {
  const [project, user] = await Promise.all([
    prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        status: true,
        mahasiswaId: true,
        githubRepoUrl: true,
        orgRepoUrl: true,
        members: { select: { userId: true } },
        assignments: { select: { dosenId: true } },
        mahasiswa: { select: { githubToken: true } },
      },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, githubToken: true },
    }),
  ]);

  if (!project) return null;

  const isOwner = project.mahasiswaId === userId;
  const isMember = project.members.some((m) => m.userId === userId);
  const isAssignedDosen = project.assignments.some((a) => a.dosenId === userId);
  const isAdmin = user?.role === 'ADMIN';
  const isDosen = user?.role === 'DOSEN_PENGUJI';

  return {
    project,
    user,
    canRead: isOwner || isMember || isAssignedDosen || isAdmin || isDosen,
    canWrite: isOwner || isMember || isAdmin,
  };
}

// GET /api/projects/[id]/work-logs - List work logs for a project
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const access = await getProjectAccess(id, session.user.id);

    if (!access) {
      return NextResponse.json({ error: 'Project tidak ditemukan' }, { status: 404 });
    }
    if (!access.canRead) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const workLogs = await prisma.projectWorkLog.findMany({
      where: { projectId: id },
      include: {
        author: { select: { id: true, name: true, image: true } },
      },
      orderBy: [{ dayNumber: 'asc' }, { createdAt: 'asc' }],
    });

    return NextResponse.json({ data: workLogs });
  } catch (error) {
    console.error('Get work logs error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/projects/[id]/work-logs - Add a work log entry
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const access = await getProjectAccess(id, session.user.id);

    if (!access) {
      return NextResponse.json({ error: 'Project tidak ditemukan' }, { status: 404 });
    }
    if (!access.canWrite) {
      return NextResponse.json(
        { error: 'Hanya pemilik atau anggota tim yang dapat menambah laporan pengerjaan' },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { dayNumber, workDate, activity, commitSha } = body;

    const parsedDay = Number(dayNumber);
    if (!Number.isInteger(parsedDay) || parsedDay < 1) {
      return NextResponse.json(
        { error: 'dayNumber harus berupa angka hari ke-N (minimal 1)' },
        { status: 400 },
      );
    }

    const parsedDate = workDate ? new Date(workDate) : null;
    if (!parsedDate || Number.isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { error: 'workDate tidak valid' },
        { status: 400 },
      );
    }

    if (typeof activity !== 'string' || activity.trim().length < 10) {
      return NextResponse.json(
        { error: 'Deskripsi pekerjaan minimal 10 karakter' },
        { status: 400 },
      );
    }

    if (typeof commitSha !== 'string' || !/^[0-9a-f]{7,40}$/i.test(commitSha.trim())) {
      return NextResponse.json(
        { error: 'Setiap laporan wajib memilih commit GitHub yang membuktikan pekerjaan' },
        { status: 400 },
      );
    }

    // Verifikasi commit benar-benar ada di repository project
    const repoUrl = access.project.githubRepoUrl || access.project.orgRepoUrl;
    if (!repoUrl) {
      return NextResponse.json(
        { error: 'Project belum terhubung dengan repository GitHub' },
        { status: 400 },
      );
    }
    const parsedRepo = parseGitHubUrl(repoUrl);
    if (!parsedRepo) {
      return NextResponse.json(
        { error: 'URL repository GitHub tidak valid' },
        { status: 400 },
      );
    }

    const token =
      decryptNullable(access.user?.githubToken ?? null) ||
      decryptNullable(access.project.mahasiswa.githubToken ?? null);
    if (!token) {
      return NextResponse.json(
        { error: 'GitHub tidak terhubung. Hubungkan akun GitHub terlebih dahulu.' },
        { status: 400 },
      );
    }

    let commit;
    try {
      const github = createGitHubClient(token);
      commit = await github.getCommit(
        parsedRepo.owner,
        parsedRepo.repo,
        commitSha.trim(),
      );
    } catch {
      return NextResponse.json(
        { error: 'Commit tidak ditemukan di repository project' },
        { status: 400 },
      );
    }

    // Satu commit hanya boleh dilaporkan sekali per project
    const existing = await prisma.projectWorkLog.findUnique({
      where: {
        projectId_commitSha: { projectId: id, commitSha: commit.sha },
      },
      select: { id: true, dayNumber: true },
    });
    if (existing) {
      return NextResponse.json(
        { error: `Commit ini sudah dilaporkan pada laporan hari ke-${existing.dayNumber}` },
        { status: 409 },
      );
    }

    const workLog = await prisma.projectWorkLog.create({
      data: {
        projectId: id,
        authorId: session.user.id,
        dayNumber: parsedDay,
        workDate: parsedDate,
        activity: activity.trim(),
        commitSha: commit.sha,
        commitMessage: commit.message,
        commitUrl: commit.html_url,
        commitDate: commit.author.date ? new Date(commit.author.date) : null,
      },
      include: {
        author: { select: { id: true, name: true, image: true } },
      },
    });

    return NextResponse.json({ data: workLog }, { status: 201 });
  } catch (error) {
    console.error('Create work log error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
