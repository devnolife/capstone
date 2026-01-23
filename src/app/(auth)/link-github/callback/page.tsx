/**
 * GitHub OAuth Callback for Account Linking
 * This page handles the OAuth callback when linking GitHub to an existing account
 */

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardBody, Spinner } from '@heroui/react';
import { CheckCircle, XCircle } from 'lucide-react';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Menghubungkan akun GitHub...');

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      setStatus('error');
      setMessage('Gagal menghubungkan akun GitHub. Silakan coba lagi.');
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
      } catch {
        setStatus('error');
        setMessage('Terjadi kesalahan. Silakan coba lagi.');
        setTimeout(() => router.push('/mahasiswa/settings'), 3000);
      }
    };

    linkAccount();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardBody className="p-8 text-center">
          {status === 'loading' && (
            <>
              <Spinner size="lg" className="mb-4" />
              <p className="text-default-600">{message}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <h2 className="text-xl font-bold text-success mb-2">Berhasil!</h2>
              <p className="text-default-600">{message}</p>
              <p className="text-sm text-default-400 mt-4">Mengalihkan...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-danger-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-danger" />
              </div>
              <h2 className="text-xl font-bold text-danger mb-2">Gagal</h2>
              <p className="text-default-600">{message}</p>
              <p className="text-sm text-default-400 mt-4">Mengalihkan...</p>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default function GitHubLinkCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
