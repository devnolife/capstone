'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import { MoonIcon, SunIcon } from 'lucide-react';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === 'dark';

  return (
    <Button
      variant="outline"
      size="icon-sm"
      aria-label={isDark ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      {/* render setelah mount agar ikon tidak mismatch saat hidrasi */}
      {mounted ? (
        isDark ? (
          <SunIcon className="text-warning" />
        ) : (
          <MoonIcon className="text-highlight" />
        )
      ) : (
        <MoonIcon className="opacity-0" />
      )}
    </Button>
  );
}
