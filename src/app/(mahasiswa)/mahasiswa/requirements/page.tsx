import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { RequirementsContent } from '@/components/mahasiswa/requirements-content';

export default async function RequirementsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return <RequirementsContent />;
}
