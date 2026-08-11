import { AppShell } from '@/components/ui/app-shell';
import { getShellUser } from '@/lib/shell-user';

export default async function DosenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getShellUser();

  return <AppShell user={user}>{children}</AppShell>;
}

