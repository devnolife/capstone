import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { StatisticsContent } from '@/components/dosen/statistics-content';

export default async function DosenStatisticsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.role !== 'DOSEN_PENGUJI' && session.user.role !== 'ADMIN') {
    redirect('/');
  }

  return <StatisticsContent />;
}
