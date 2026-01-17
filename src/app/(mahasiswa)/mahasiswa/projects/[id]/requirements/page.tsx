import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { ProjectRequirementsForm } from '@/components/mahasiswa/project-requirements-form';

export default async function ProjectRequirementsPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // Fetch project
  const project = await prisma.project.findUnique({
    where: {
      id: params.id,
      mahasiswaId: session.user.id,
    },
    include: {
      requirements: true,
    },
  });

  if (!project) {
    redirect('/mahasiswa/projects');
  }

  // Check if GitHub is connected
  if (!project.githubRepoUrl) {
    redirect(`/mahasiswa/projects/${params.id}`);
  }

  return <ProjectRequirementsForm project={project} />;
}
