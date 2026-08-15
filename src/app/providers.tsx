'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from '@/components/ui/sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <NextThemesProvider attribute="class" defaultTheme="light" storageKey="capstone-theme">
        {children}
        <Toaster position="top-right" richColors />
      </NextThemesProvider>
    </SessionProvider>
  );
}
