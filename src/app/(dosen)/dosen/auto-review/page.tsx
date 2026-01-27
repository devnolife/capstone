import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { AutoReviewClient } from './client';

export default async function AutoReviewPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const userId = session.user.id;

  // Fetch all projects assigned to this dosen
  const projects = await prisma.project.findMany({
    where: {
      assignments: {
        some: { dosenId: userId },
      },
      status: {
        in: ['SUBMITTED', 'IN_REVIEW', 'REVISION_NEEDED', 'APPROVED'],
      },
    },
    include: {
      mahasiswa: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
          profilePhoto: true,
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  // Transform data for client - since we don't have AI analysis data yet,
  // we'll generate placeholder scores based on project status
  const projectsData = projects.map((project) => {
    // Generate pseudo-scores based on status (placeholder until real AI analysis)
    const baseScore = project.status === 'APPROVED' ? 85 : 
                      project.status === 'REVISION_NEEDED' ? 55 :
                      project.status === 'IN_REVIEW' ? 70 : 60;
    
    const variance = Math.floor(Math.random() * 15) - 7; // -7 to +7
    const overallScore = Math.min(100, Math.max(0, baseScore + variance));
    
    return {
      id: project.id,
      title: project.title,
      semester: project.semester,
      tahunAkademik: project.tahunAkademik,
      githubRepoUrl: project.githubRepoUrl,
      mahasiswa: {
        name: project.mahasiswa.name,
        username: project.mahasiswa.username,
        image: project.mahasiswa.image,
        profilePhoto: project.mahasiswa.profilePhoto,
      },
      // Placeholder analysis data - will be replaced when AI analysis is implemented
      lastAnalyzed: project.updatedAt.toISOString(),
      overallScore,
      trend: (overallScore >= 75 ? 'up' : overallScore >= 50 ? 'stable' : 'down') as 'up' | 'down' | 'stable',
      trendValue: Math.floor(Math.random() * 10) - 3,
      status: overallScore >= 80 ? 'excellent' : 
              overallScore >= 70 ? 'good' : 
              overallScore >= 50 ? 'warning' : 'poor',
      aspects: {
        functionality: Math.min(100, Math.max(0, overallScore + Math.floor(Math.random() * 20) - 10)),
        uiux: Math.min(100, Math.max(0, overallScore + Math.floor(Math.random() * 20) - 10)),
        codeQuality: Math.min(100, Math.max(0, overallScore + Math.floor(Math.random() * 20) - 10)),
        performance: Math.min(100, Math.max(0, overallScore + Math.floor(Math.random() * 20) - 10)),
        security: Math.min(100, Math.max(0, overallScore + Math.floor(Math.random() * 20) - 10)),
        documentation: Math.min(100, Math.max(0, overallScore + Math.floor(Math.random() * 20) - 10)),
      },
    };
  });

  return <AutoReviewClient projects={projectsData} />;
}
