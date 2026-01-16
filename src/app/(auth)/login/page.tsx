'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Input,
  Button,
  Divider,
} from '@heroui/react';
import { Github, Mail, Lock, Eye, EyeOff, GitBranch } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    setIsGitHubLoading(true);
    try {
      await signIn('github', { callbackUrl: '/dashboard' });
    } catch {
      setError('Gagal login dengan GitHub');
    } finally {
      setIsGitHubLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="flex flex-col gap-2 items-center pt-8 pb-4">
        <div className="flex items-center gap-2 mb-2">
          <GitBranch className="text-primary" size={32} />
          <span className="text-2xl font-bold">Capstone</span>
        </div>
        <h1 className="text-xl font-semibold">Selamat Datang</h1>
        <p className="text-sm text-default-500">
          Masuk ke akun Anda untuk melanjutkan
        </p>
      </CardHeader>

      <CardBody className="gap-4 px-8">
        {error && (
          <div className="bg-danger-50 text-danger border border-danger-200 rounded-lg p-3 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="nama@email.com"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            startContent={<Mail size={18} className="text-default-400" />}
            isRequired
          />

          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Masukkan password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            startContent={<Lock size={18} className="text-default-400" />}
            endContent={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff size={18} className="text-default-400" />
                ) : (
                  <Eye size={18} className="text-default-400" />
                )}
              </button>
            }
            isRequired
          />

          <Button
            type="submit"
            color="primary"
            className="w-full"
            isLoading={isLoading}
          >
            Masuk
          </Button>
        </form>

        <div className="flex items-center gap-4 my-2">
          <Divider className="flex-1" />
          <span className="text-default-400 text-sm">atau</span>
          <Divider className="flex-1" />
        </div>

        <Button
          variant="bordered"
          className="w-full"
          startContent={<Github size={20} />}
          isLoading={isGitHubLoading}
          onPress={handleGitHubLogin}
        >
          Lanjutkan dengan GitHub
        </Button>
      </CardBody>

      <CardFooter className="flex justify-center pb-8">
        <p className="text-sm text-default-500">
          Belum punya akun?{' '}
          <Link href="/register" className="text-primary hover:underline">
            Daftar sekarang
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
