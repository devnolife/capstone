'use client';

import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  Card,
  CardBody,
  Input,
  Button,
  Spinner,
} from '@heroui/react';
import {
  Lock,
  Eye,
  EyeOff,
  GraduationCap,
  ArrowRight,
  Sparkles,
  User,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const callbackError = searchParams.get('error');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        username: formData.username,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error.includes('SIMAK')) {
          setError(result.error);
        } else {
          setError('Username atau password salah.');
        }
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-sm"
    >
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <Image
          src="/logo.png"
          alt="Capstone Logo"
          width={80}
          height={80}
          className="object-contain mb-4"
        />
        <h2 className="text-2xl font-bold">Selamat Datang!</h2>
        <p className="text-default-500 text-sm mt-1">
          Masuk untuk melanjutkan
        </p>
      </div>

      {(error || callbackError) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-danger-50 text-danger border border-danger-200 rounded-xl p-3 mb-4 text-sm"
        >
          {error || 'Terjadi kesalahan saat login.'}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Username / NIM"
          type="text"
          placeholder="Masukkan username atau NIM"
          value={formData.username}
          onChange={(e) =>
            setFormData({ ...formData, username: e.target.value })
          }
          startContent={<User size={18} className="text-default-400" />}
          variant="bordered"
          size="lg"
          isRequired
          autoComplete="username"
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
              className="focus:outline-none hover:opacity-70 transition-opacity"
            >
              {showPassword ? (
                <EyeOff size={18} className="text-default-400" />
              ) : (
                <Eye size={18} className="text-default-400" />
              )}
            </button>
          }
          variant="bordered"
          size="lg"
          isRequired
          autoComplete="current-password"
        />

        <Button
          type="submit"
          color="primary"
          size="lg"
          className="w-full font-semibold"
          isLoading={isLoading}
          endContent={!isLoading && <ArrowRight size={18} />}
        >
          {isLoading ? 'Memproses...' : 'Masuk'}
        </Button>
      </form>

      <div className="mt-6 text-center space-y-3">
        <p className="text-xs text-default-400">
          Hubungi administrator jika mengalami kendala
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-default-500 hover:text-primary transition-colors"
        >
          <ArrowLeft size={14} />
          Kembali ke Beranda
        </Link>
      </div>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-500 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white rounded-full blur-3xl" />
        </div>

        <motion.div
          className="absolute bottom-40 right-24"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <Sparkles className="text-white" size={24} />
          </div>
        </motion.div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <GraduationCap size={48} />
              <div>
                <span className="text-2xl font-bold">Capstone Project</span>
                <p className="text-sm text-white/80">Prodi Informatika</p>
              </div>
            </div>

            <h1 className="text-4xl xl:text-5xl font-bold mb-6 leading-tight">
              Sistem Manajemen<br />
              <span className="text-white/90">Project Capstone</span>
            </h1>

            <p className="text-lg text-white/80 max-w-md mb-8">
              Platform terintegrasi untuk mengelola project capstone mahasiswa
              dengan fitur review dan penilaian dari dosen penguji.
            </p>

            {/* Features */}
            <div className="space-y-4">
              {[
                'Upload dan kelola dokumen project',
                'Review code langsung dari GitHub',
                'Penilaian berdasarkan rubrik',
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                  <span className="text-white/90">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-background">
        <Suspense fallback={<Spinner size="lg" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
