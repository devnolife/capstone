/**
 * GitHub OAuth Callback for Account Linking
 * This page handles the OAuth callback when linking GitHub to an existing account
 */

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { CheckCircle, XCircle } from 'lucide-react';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Menghubungkan akun GitHub...');

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (error) {
      setStatus('error');
      setMessage(errorDescription || 'Gagal menghubungkan akun GitHub. Silakan coba lagi.');
      setTimeout(() => router.push('/mahasiswa/settings'), 3000);
      return;
    }

    if (!code) {
      setStatus('error');
      setMessage('Kode otorisasi tidak ditemukan.');
      setTimeout(() => router.push('/mahasiswa/settings'), 3000);
      return;
    }

    // Exchange code for token and link account
    const linkAccount = async () => {
      try {
        const response = await fetch('/api/auth/link-github/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });

        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Server mengembalikan respons tidak valid');
        }

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(`Akun GitHub @${data.githubUsername} berhasil terhubung!`);
          setTimeout(() => router.push('/mahasiswa/settings'), 2000);
        } else {
          setStatus('error');
          setMessage(data.error || 'Gagal menghubungkan akun GitHub.');
          setTimeout(() => router.push('/mahasiswa/settings'), 3000);
        }
      } catch (err) {
        setStatus('error');
        const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan';
        setMessage(`${errorMessage}. Silakan coba lagi.`);
        setTimeout(() => router.push('/mahasiswa/settings'), 3000);
      }
    };

    linkAccount();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          {status === 'loading' && (
            <>
              <Spinner className="mx-auto mb-4 size-8" />
              <p className="text-foreground">{message}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">Berhasil!</h2>
              <p className="text-foreground">{message}</p>
              <p className="text-sm text-muted-foreground mt-4">Mengalihkan...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-xl font-bold text-destructive mb-2">Gagal</h2>
              <p className="text-foreground">{message}</p>
              <p className="text-sm text-muted-foreground mt-4">Mengalihkan...</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function GitHubLinkCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="size-8" />
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
