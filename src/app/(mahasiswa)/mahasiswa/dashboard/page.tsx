import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { MahasiswaDashboardContent } from '@/components/mahasiswa/dashboard-content';
import { buildStudentJourney } from '@/lib/student-journey';
import { resolveProjectSubmissionDeadline } from '@/lib/semester';

export default async function MahasiswaDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const [user, projects, activeSemesters] = await Promise.all([
    // Fetch user data for GitHub status
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        githubUsername: true,
        githubToken: true,
      },
    }),
    // Include projects owned by the user and projects joined as a team member.
    prisma.project.findMany({
      where: {
        OR: [
          { mahasiswaId: session.user.id },
          { members: { some: { userId: session.user.id } } },
        ],
      },
      include: {
        documents: true,
        requirements: true,
        stakeholderDocuments: { select: { id: true } },
        presentationSchedule: true,
        reviews: {
          include: {
            reviewer: true,
          },
        },
        members: {
          orderBy: {
            role: 'asc', // leader first
          },
        },
        _count: {
          select: {
            documents: true,
            reviews: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.semester.findMany({
      where: { isActive: true },
      select: {
        name: true,
        tahunAkademik: true,
        isActive: true,
        submissionDeadline: true,
      },
    }),
  ]);

  const hasGitHubConnected = !!(user?.githubUsername && user?.githubToken);
  const currentProject =
    projects.find(
      (project) =>
        project.status !== 'APPROVED' && project.status !== 'REJECTED',
    ) ?? projects[0] ?? null;
  const submissionDeadline = currentProject
    ? resolveProjectSubmissionDeadline(currentProject, activeSemesters)
    : activeSemesters[0]?.submissionDeadline ?? null;
  const journey = buildStudentJourney({
    hasGitHubConnected,
    submissionDeadline,
    project: currentProject
      ? {
        id: currentProject.id,
        title: currentProject.title,
        status: currentProject.status,
        githubRepoUrl: currentProject.githubRepoUrl,
        requirements: currentProject.requirements,
        documentTypes: currentProject.documents.map((document) => document.type),
        stakeholderDocumentCount: currentProject.stakeholderDocuments.length,
        reviews: currentProject.reviews.map((review) => ({
          status: review.status,
        })),
        presentationSchedule: currentProject.presentationSchedule
          ? {
            ...currentProject.presentationSchedule,
            scheduledDate:
              currentProject.presentationSchedule.scheduledDate.toISOString(),
          }
          : null,
        memberCount: new Set([
          currentProject.mahasiswaId,
          ...currentProject.members
            .map((member) => member.userId)
            .filter((userId): userId is string => !!userId),
        ]).size,
        isOwner: currentProject.mahasiswaId === session.user.id,
      }
      : null,
  });

  const dashboardProjects = projects.map((project) => ({
    id: project.id,
    title: project.title,
    description: project.description,
    status: project.status,
    githubRepoUrl: project.githubRepoUrl,
    githubRepoName: project.githubRepoName,
    semester: project.semester,
    tahunAkademik: project.tahunAkademik,
    submittedAt: project.submittedAt,
    mahasiswaId: project.mahasiswaId,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    documents: project.documents.map((document) => ({ id: document.id })),
    reviews: project.reviews.map((review) => ({
      id: review.id,
      reviewer: { name: review.reviewer.name },
    })),
    members: project.members,
    _count: project._count,
  }));

  // Calculate stats
  const totalProjects = projects.length;
  const submittedProjects = projects.filter((p) => p.status !== 'DRAFT').length;
  const reviewedProjects = projects.filter(
    (p) => p.status === 'APPROVED' || p.status === 'REJECTED',
  ).length;
  const pendingReviews = projects.filter(
    (p) => p.status === 'IN_REVIEW' || p.status === 'SUBMITTED',
  ).length;

  // Get total documents
  const totalDocuments = projects.reduce(
    (acc, p) => acc + p._count.documents,
    0,
  );

  return (
    <MahasiswaDashboardContent
      userName={session.user.name || 'User'}
      userImage={session.user.image || undefined}
      projects={dashboardProjects}
      hasGitHubConnected={hasGitHubConnected}
      githubUsername={user?.githubUsername || undefined}
      journey={journey}
      stats={{
        totalProjects,
        submittedProjects,
        reviewedProjects,
        pendingReviews,
        totalDocuments,
      }}
    />
  );
}
