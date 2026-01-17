'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Card,
  CardBody,
  Input,
  Button,
  Divider,
  Checkbox,
} from '@heroui/react';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  Github, 
  GraduationCap,
  ArrowRight,
  Sparkles,
  IdCard,
  Home,
} from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

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
        setError('NIM/NIP atau password salah');
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
    <div className="min-h-screen w-full flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-500 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white rounded-full blur-3xl" />
        </div>
        
        {/* Floating Elements */}
        <motion.div 
          className="absolute top-32 left-16"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <GraduationCap className="text-white" size={32} />
          </div>
        </motion.div>
        
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
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <GraduationCap size={28} />
              </div>
              <span className="text-2xl font-bold">Capstone</span>
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <GraduationCap className="text-white" size={24} />
            </div>
            <span className="text-xl font-bold">Capstone</span>
          </div>

          {/* Back to Home Button */}
          <div className="mb-6">
            <Button
              as={Link}
              href="/"
              variant="light"
              startContent={<Home size={18} />}
              className="text-default-600 hover:text-primary -ml-2"
            >
              Kembali ke Beranda
            </Button>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Selamat Datang!</h2>
            <p className="text-default-500">
              Masuk dengan NIM/NIP Anda untuk melanjutkan
            </p>
          </div>

          <Card className="shadow-none border border-default-200">
            <CardBody className="p-6 md:p-8">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-danger-50 text-danger border border-danger-200 rounded-xl p-4 mb-6 text-sm"
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="NIM / NIP"
                  type="text"
                  placeholder="Masukkan NIM atau NIP"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  startContent={<IdCard size={18} className="text-default-400" />}
                  variant="bordered"
                  size="lg"
                  classNames={{
                    inputWrapper: "bg-default-50",
                  }}
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
                  classNames={{
                    inputWrapper: "bg-default-50",
                  }}
                  isRequired
                  autoComplete="current-password"
                />

                <div className="flex items-center justify-between">
                  <Checkbox
                    size="sm"
                    isSelected={rememberMe}
                    onValueChange={setRememberMe}
                  >
                    <span className="text-sm">Ingat saya</span>
                  </Checkbox>
                  <button 
                    type="button"
                    className="text-sm text-primary hover:underline"
                  >
                    Lupa password?
                  </button>
                </div>

                <Button
                  type="submit"
                  color="primary"
                  size="lg"
                  className="w-full font-semibold"
                  isLoading={isLoading}
                  endContent={!isLoading && <ArrowRight size={18} />}
                >
                  Masuk
                </Button>
              </form>

              <Divider className="my-6" />

              <div className="text-center">
                <p className="text-sm text-default-500 mb-3">
                  Integrasi dengan GitHub untuk review code
                </p>
                <div className="flex items-center justify-center gap-2 text-default-400">
                  <Github size={20} />
                  <span className="text-sm">Hubungkan setelah login</span>
                </div>
              </div>
            </CardBody>
          </Card>

          <p className="text-center text-sm text-default-500 mt-6">
            Hubungi administrator jika Anda memerlukan akun baru
          </p>
        </motion.div>
      </div>
    </div>
  );
}
