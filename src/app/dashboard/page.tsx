import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DashboardRedirectPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // Redirect based on user role
  const role = (session.user as { role?: string }).role;

  switch (role) {
    case 'ADMIN':
      redirect('/admin/dashboard');
    case 'DOSEN_PENGUJI':
      redirect('/dosen/dashboard');
    case 'MAHASISWA':
    default:
      redirect('/mahasiswa/dashboard');
  }
}
