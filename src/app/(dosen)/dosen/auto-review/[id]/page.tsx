import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import { AutoReviewDetailClient } from './client';

type DetailStatus = 'pass' | 'warning' | 'fail';

interface AspectDetail {
  item: string;
  status: DetailStatus;
  value: string;
}

interface Aspect {
  key: string;
  label: string;
  score: number;
  previousScore: number;
  summary: string;
  details: AspectDetail[];
  suggestions: string[];
}

// Generate placeholder analysis data based on project status
// This will be replaced with real AI analysis when implemented
function generateAnalysisData(projectStatus: string, updatedAt: Date) {
  const baseScore = projectStatus === 'APPROVED' ? 85 : 
                    projectStatus === 'REVISION_NEEDED' ? 55 :
                    projectStatus === 'IN_REVIEW' ? 70 : 60;
  
  const variance = Math.floor(Math.random() * 15) - 7;
  const overallScore = Math.min(100, Math.max(0, baseScore + variance));
  const previousScore = Math.max(0, overallScore - Math.floor(Math.random() * 10) - 2);
  
  const generateAspectScore = () => Math.min(100, Math.max(0, overallScore + Math.floor(Math.random() * 20) - 10));
  const getDetailStatus = (condition: boolean): DetailStatus => condition ? 'pass' : 'warning';
  
  const aspects: Aspect[] = [
    {
      key: 'functionality',
      label: 'Fungsionalitas',
      score: generateAspectScore(),
      previousScore: generateAspectScore() - 5,
      summary: 'Analisis fitur dan fungsionalitas aplikasi',
      details: [
        { item: 'Unit Tests', status: getDetailStatus(overallScore > 70), value: 'Menunggu analisis AI' },
        { item: 'Integration Tests', status: getDetailStatus(overallScore > 60), value: 'Menunggu analisis AI' },
        { item: 'E2E Tests', status: 'warning' as DetailStatus, value: 'Menunggu analisis AI' },
        { item: 'API Endpoints', status: getDetailStatus(overallScore > 65), value: 'Menunggu analisis AI' },
        { item: 'Error Handling', status: 'warning' as DetailStatus, value: 'Menunggu analisis AI' },
      ],
      suggestions: [
        'Analisis lebih detail akan tersedia setelah AI analysis diimplementasi',
        'Pastikan semua fitur utama telah diimplementasi',
        'Tambahkan unit test untuk coverage yang lebih baik',
      ],
    },
    {
      key: 'uiux',
      label: 'UI/UX Design',
      score: generateAspectScore(),
      previousScore: generateAspectScore() - 3,
      summary: 'Analisis desain antarmuka dan pengalaman pengguna',
      details: [
        { item: 'Responsive Design', status: getDetailStatus(overallScore > 70), value: 'Menunggu analisis AI' },
        { item: 'Color Contrast', status: 'warning' as DetailStatus, value: 'Menunggu analisis AI' },
        { item: 'Keyboard Navigation', status: 'warning' as DetailStatus, value: 'Menunggu analisis AI' },
        { item: 'Screen Reader', status: 'warning' as DetailStatus, value: 'Menunggu analisis AI' },
        { item: 'Loading States', status: getDetailStatus(overallScore > 65), value: 'Menunggu analisis AI' },
      ],
      suggestions: [
        'Analisis aksesibilitas akan tersedia setelah AI analysis',
        'Pastikan desain responsif di semua ukuran layar',
        'Perhatikan kontras warna untuk aksesibilitas',
      ],
    },
    {
      key: 'codeQuality',
      label: 'Code Quality',
      score: generateAspectScore(),
      previousScore: generateAspectScore() - 4,
      summary: 'Analisis kualitas dan struktur kode',
      details: [
        { item: 'ESLint', status: getDetailStatus(overallScore > 70), value: 'Menunggu analisis AI' },
        { item: 'TypeScript', status: getDetailStatus(overallScore > 65), value: 'Menunggu analisis AI' },
        { item: 'Code Coverage', status: 'warning' as DetailStatus, value: 'Menunggu analisis AI' },
        { item: 'Complexity', status: 'warning' as DetailStatus, value: 'Menunggu analisis AI' },
        { item: 'Duplications', status: 'warning' as DetailStatus, value: 'Menunggu analisis AI' },
      ],
      suggestions: [
        'Analisis code quality akan tersedia setelah AI analysis',
        'Gunakan TypeScript strict mode untuk type safety',
        'Refactor kode duplikat ke dalam fungsi reusable',
      ],
    },
    {
      key: 'performance',
      label: 'Performance',
      score: generateAspectScore(),
      previousScore: generateAspectScore() - 2,
      summary: 'Analisis performa dan optimasi aplikasi',
      details: [
        { item: 'Lighthouse Score', status: getDetailStatus(overallScore > 70), value: 'Menunggu analisis AI' },
        { item: 'LCP', status: 'warning' as DetailStatus, value: 'Menunggu analisis AI' },
        { item: 'FID', status: 'warning' as DetailStatus, value: 'Menunggu analisis AI' },
        { item: 'CLS', status: 'warning' as DetailStatus, value: 'Menunggu analisis AI' },
        { item: 'Bundle Size', status: 'warning' as DetailStatus, value: 'Menunggu analisis AI' },
      ],
      suggestions: [
        'Analisis performa akan tersedia setelah AI analysis',
        'Optimalkan gambar dengan next/image',
        'Implementasikan lazy loading untuk komponen berat',
      ],
    },
    {
      key: 'security',
      label: 'Security',
      score: generateAspectScore(),
      previousScore: generateAspectScore() - 1,
      summary: 'Analisis keamanan aplikasi',
      details: [
        { item: 'HTTPS', status: 'pass' as DetailStatus, value: 'Menunggu analisis AI' },
        { item: 'Dependencies', status: 'warning' as DetailStatus, value: 'Menunggu analisis AI' },
        { item: 'Authentication', status: getDetailStatus(overallScore > 65), value: 'Menunggu analisis AI' },
        { item: 'API Security', status: 'warning' as DetailStatus, value: 'Menunggu analisis AI' },
        { item: 'Data Validation', status: 'warning' as DetailStatus, value: 'Menunggu analisis AI' },
      ],
      suggestions: [
        'Analisis keamanan akan tersedia setelah AI analysis',
        'Selalu validasi input dari pengguna',
        'Update dependencies secara berkala',
      ],
    },
    {
      key: 'documentation',
      label: 'Documentation',
      score: generateAspectScore(),
      previousScore: generateAspectScore() - 3,
      summary: 'Analisis dokumentasi project',
      details: [
        { item: 'README', status: getDetailStatus(overallScore > 60), value: 'Menunggu analisis AI' },
        { item: 'API Docs', status: 'warning' as DetailStatus, value: 'Menunggu analisis AI' },
        { item: 'Code Comments', status: 'warning' as DetailStatus, value: 'Menunggu analisis AI' },
        { item: 'User Guide', status: 'warning' as DetailStatus, value: 'Menunggu analisis AI' },
        { item: 'Architecture', status: 'warning' as DetailStatus, value: 'Menunggu analisis AI' },
      ],
      suggestions: [
        'Analisis dokumentasi akan tersedia setelah AI analysis',
        'Lengkapi README dengan instruksi setup',
        'Dokumentasikan API endpoints yang ada',
      ],
    },
  ];

  // Fix previousScore to be less than current score for proper trend display
  aspects.forEach(aspect => {
    aspect.previousScore = Math.max(0, aspect.score - Math.abs(aspect.previousScore - aspect.score));
  });

  // Generate fake analysis history (last 4 weeks)
  const analysisHistory = [
    { date: updatedAt.toISOString(), score: overallScore },
    { date: new Date(updatedAt.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(), score: previousScore },
    { date: new Date(updatedAt.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(), score: Math.max(0, previousScore - 5) },
    { date: new Date(updatedAt.getTime() - 21 * 24 * 60 * 60 * 1000).toISOString(), score: Math.max(0, previousScore - 10) },
  ];

  const analysisStatus = overallScore >= 80 ? 'excellent' : 
                         overallScore >= 70 ? 'good' : 
                         overallScore >= 50 ? 'warning' : 'poor';

  return {
    overallScore,
    previousScore,
    trend: (overallScore > previousScore ? 'up' : overallScore < previousScore ? 'down' : 'stable') as 'up' | 'down' | 'stable',
    trendValue: overallScore - previousScore,
    analysisStatus,
    lastAnalyzed: updatedAt.toISOString(),
    analysisHistory,
    aspects,
  };
}

export default async function AutoReviewDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const userId = session.user.id;

  // Fetch the project with assignment verification
  const project = await prisma.project.findFirst({
    where: {
      id,
      assignments: {
        some: { dosenId: userId },
      },
    },
    include: {
      mahasiswa: {
        select: {
          id: true,
          name: true,
          username: true,
          prodi: true,
          image: true,
          profilePhoto: true,
        },
      },
    },
  });

  if (!project) {
    notFound();
  }

  // Generate placeholder analysis data
  const analysisData = generateAnalysisData(project.status, project.updatedAt);

  // Prepare serialized data for client
  const projectData = {
    id: project.id,
    title: project.title,
    description: project.description || '',
    semester: project.semester,
    tahunAkademik: project.tahunAkademik,
    githubRepoUrl: project.githubRepoUrl,
    productionUrl: project.productionUrl,
    projectStatus: project.status,
    mahasiswa: {
      name: project.mahasiswa.name,
      username: project.mahasiswa.username,
      prodi: project.mahasiswa.prodi || 'Teknik Informatika',
      image: project.mahasiswa.image,
      profilePhoto: project.mahasiswa.profilePhoto,
    },
    ...analysisData,
  };

  return <AutoReviewDetailClient project={projectData} />;
}
