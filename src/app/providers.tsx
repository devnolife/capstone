'use client';

import { HeroUIProvider } from '@heroui/react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { useRouter } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <SessionProvider>
      <NextThemesProvider attribute="class" defaultTheme="light">
        <HeroUIProvider navigate={router.push}>
          {children}
          <Toaster position="top-right" richColors />
        </HeroUIProvider>
      </NextThemesProvider>
    </SessionProvider>
  );
}
