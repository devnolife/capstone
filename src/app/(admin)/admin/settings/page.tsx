import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { SettingsContent } from '@/components/shared/settings-content';

export default async function AdminSettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return <SettingsContent role="admin" />;
}
