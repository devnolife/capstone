import { auth } from '@/lib/auth';
import type { ShellUser } from '@/components/ui/app-shell-sidebar';

/**
 * Ambil identitas pengguna di server agar sidebar merender menu sesuai peran
 * sejak paint pertama (tanpa kedip menu default saat hydration).
 */
export async function getShellUser(): Promise<ShellUser | undefined> {
  const session = await auth();
  const user = session?.user as
    | {
        name?: string | null;
        image?: string | null;
        nim?: string;
        username?: string;
        role?: string;
      }
    | undefined;

  if (!user) return undefined;

  return {
    name: user.name || 'Pengguna',
    identifier: user.nim || user.username || '-',
    role: user.role,
    image: user.image || undefined,
  };
}
