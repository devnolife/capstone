import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { MahasiswaDocumentsContent } from '@/components/mahasiswa/documents-content';

export default async function MahasiswaDocumentsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // Fetch user's projects with documents
  const projects = await prisma.project.findMany({
    where: { mahasiswaId: session.user.id },
    include: {
      documents: {
        orderBy: { uploadedAt: 'desc' },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  // Flatten documents with project info
  const documents = projects.flatMap((project) =>
    project.documents.map((doc) => ({
      ...doc,
      project: {
        id: project.id,
        title: project.title,
        status: project.status,
      },
    }))
  );

  // Calculate stats
  const stats = {
    totalDocuments: documents.length,
    totalSize: documents.reduce((acc, doc) => acc + doc.fileSize, 0),
    byType: documents.reduce((acc, doc) => {
      acc[doc.type] = (acc[doc.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  return (
    <MahasiswaDocumentsContent
      documents={documents}
      projects={projects}
      stats={stats}
    />
  );
}
