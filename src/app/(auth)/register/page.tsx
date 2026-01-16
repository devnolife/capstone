'use client';

import { useState } from 'react';
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
  Select,
  SelectItem,
} from '@heroui/react';
import {
  Github,
  Mail,
  Lock,
  Eye,
  EyeOff,
  GitBranch,
  User,
  CreditCard,
} from 'lucide-react';
import { signIn } from 'next-auth/react';

const roles = [
  { key: 'MAHASISWA', label: 'Mahasiswa' },
  { key: 'DOSEN_PENGUJI', label: 'Dosen Penguji' },
];

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'MAHASISWA',
    nim: '',
    nip: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Password tidak cocok');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password minimal 6 karakter');
      setIsLoading(false);
      return;
    }

    if (formData.role === 'MAHASISWA' && !formData.nim) {
      setError('NIM wajib diisi untuk mahasiswa');
      setIsLoading(false);
      return;
    }

    if (formData.role === 'DOSEN_PENGUJI' && !formData.nip) {
      setError('NIP wajib diisi untuk dosen');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          nim: formData.role === 'MAHASISWA' ? formData.nim : null,
          nip: formData.role === 'DOSEN_PENGUJI' ? formData.nip : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mendaftar');
      }

      // Auto login after registration
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        router.push('/login');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubRegister = async () => {
    setIsGitHubLoading(true);
    try {
      await signIn('github', { callbackUrl: '/dashboard' });
    } catch {
      setError('Gagal mendaftar dengan GitHub');
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
        <h1 className="text-xl font-semibold">Buat Akun Baru</h1>
        <p className="text-sm text-default-500">
          Daftar untuk mulai menggunakan sistem
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
            label="Nama Lengkap"
            placeholder="Masukkan nama lengkap"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            startContent={<User size={18} className="text-default-400" />}
            isRequired
          />

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

          <Select
            label="Daftar Sebagai"
            placeholder="Pilih role"
            selectedKeys={[formData.role]}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            isRequired
          >
            {roles.map((role) => (
              <SelectItem key={role.key}>{role.label}</SelectItem>
            ))}
          </Select>

          {formData.role === 'MAHASISWA' && (
            <Input
              label="NIM"
              placeholder="Masukkan NIM"
              value={formData.nim}
              onChange={(e) =>
                setFormData({ ...formData, nim: e.target.value })
              }
              startContent={
                <CreditCard size={18} className="text-default-400" />
              }
              isRequired
            />
          )}

          {formData.role === 'DOSEN_PENGUJI' && (
            <Input
              label="NIP"
              placeholder="Masukkan NIP"
              value={formData.nip}
              onChange={(e) =>
                setFormData({ ...formData, nip: e.target.value })
              }
              startContent={
                <CreditCard size={18} className="text-default-400" />
              }
              isRequired
            />
          )}

          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Minimal 6 karakter"
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

          <Input
            label="Konfirmasi Password"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Ulangi password"
            value={formData.confirmPassword}
            onChange={(e) =>
              setFormData({ ...formData, confirmPassword: e.target.value })
            }
            startContent={<Lock size={18} className="text-default-400" />}
            endContent={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="focus:outline-none"
              >
                {showConfirmPassword ? (
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
            Daftar
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
          onPress={handleGitHubRegister}
        >
          Daftar dengan GitHub
        </Button>
      </CardBody>

      <CardFooter className="flex justify-center pb-8">
        <p className="text-sm text-default-500">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Masuk di sini
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
