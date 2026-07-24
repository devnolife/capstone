'use client';

import { HeroUIProvider } from '@heroui/react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { useRouter } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <SessionProvider
      // Kurangi polling session di background — mencegah ClientFetchError
      // transien saat dev server sedang restart (fetch mendapat HTML, bukan JSON).
      refetchInterval={0}
      refetchOnWindowFocus={false}
    >
      <NextThemesProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        disableTransitionOnChange
      >
        <HeroUIProvider navigate={router.push}>
          {children}
          <Toaster position="top-right" richColors />
        </HeroUIProvider>
      </NextThemesProvider>
    </SessionProvider>
  );
}
