'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Avatar,
  Divider,
  Chip,
  Spinner,
  Tabs,
  Tab,
} from '@heroui/react';
import {
  User,
  Mail,
  Save,
  Github,
  Shield,
  Calendar,
  CheckCircle,
  AlertCircle,
  Link as LinkIcon,
  BookOpen,
  Key,
} from 'lucide-react';
import { formatDateTime, getRoleLabel } from '@/lib/utils';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  nim: string | null;
  nip: string | null;
  avatarUrl: string | null;
  githubUsername: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    projects: number;
    reviews: number;
  };
}

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [nim, setNim] = useState('');
  const [nip, setNip] = useState('');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile');
        if (!response.ok) throw new Error('Failed to fetch profile');
        const data = await response.json();
        setProfile(data);
        setName(data.name);
        setNim(data.nim || '');
        setNip(data.nip || '');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          nim: nim || null,
          nip: nip || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update profile');
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      setSuccess('Profil berhasil diperbarui');

      // Update session
      await updateSession({
        ...session,
        user: {
          ...session?.user,
          name: updatedProfile.name,
        },
      });

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setIsChangingPassword(true);
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError('Password baru tidak cocok');
      setIsChangingPassword(false);
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('Password minimal 8 karakter');
      setIsChangingPassword(false);
      return;
    }

    try {
      const response = await fetch('/api/profile/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to change password');
      }

      setPasswordSuccess('Password berhasil diubah');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setTimeout(() => setPasswordSuccess(''), 3000);
    } catch (err) {
      setPasswordError(
        err instanceof Error ? err.message : 'Error changing password',
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <AlertCircle size={48} className="mx-auto text-danger mb-4" />
        <p className="text-danger">{error || 'Profil tidak ditemukan'}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Profil Saya</h1>
        <p className="text-default-500">Kelola informasi akun Anda</p>
      </div>

      {/* Profile Overview Card */}
      <Card>
        <CardBody>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar
              src={profile.avatarUrl || undefined}
              name={profile.name}
              className="w-24 h-24 text-large"
            />
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl font-semibold">{profile.name}</h2>
              <p className="text-default-500">{profile.email}</p>
              <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                <Chip
                  color={
                    profile.role === 'ADMIN'
                      ? 'danger'
                      : profile.role === 'DOSEN_PENGUJI'
                        ? 'secondary'
                        : 'primary'
                  }
                  variant="flat"
                >
                  {getRoleLabel(profile.role)}
                </Chip>
                <Chip
                  color={profile.isActive ? 'success' : 'default'}
                  variant="flat"
                  startContent={
                    profile.isActive ? (
                      <CheckCircle size={14} />
                    ) : (
                      <AlertCircle size={14} />
                    )
                  }
                >
                  {profile.isActive ? 'Aktif' : 'Tidak Aktif'}
                </Chip>
                {profile.githubUsername && (
                  <Chip variant="flat" startContent={<Github size={14} />}>
                    {profile.githubUsername}
                  </Chip>
                )}
              </div>
            </div>

            {/* Stats */}
            {profile._count && (
              <div className="flex gap-6 text-center">
                {profile.role === 'MAHASISWA' && (
                  <div>
                    <p className="text-2xl font-bold text-primary">
                      {profile._count.projects}
                    </p>
                    <p className="text-sm text-default-500">Project</p>
                  </div>
                )}
                {profile.role === 'DOSEN_PENGUJI' && (
                  <div>
                    <p className="text-2xl font-bold text-primary">
                      {profile._count.reviews}
                    </p>
                    <p className="text-sm text-default-500">Review</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Tabs */}
      <Tabs aria-label="Profile sections">
        <Tab key="info" title="Informasi Profil">
          <Card>
            <CardHeader>
              <h3 className="font-semibold flex items-center gap-2">
                <User size={18} />
                Informasi Dasar
              </h3>
            </CardHeader>
            <CardBody className="space-y-4">
              {error && (
                <div className="bg-danger-50 text-danger border border-danger-200 rounded-lg p-3 text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-success-50 text-success border border-success-200 rounded-lg p-3 text-sm flex items-center gap-2">
                  <CheckCircle size={16} />
                  {success}
                </div>
              )}

              <Input
                label="Nama Lengkap"
                value={name}
                onChange={(e) => setName(e.target.value)}
                startContent={<User size={16} className="text-default-400" />}
                isRequired
              />

              <Input
                label="Email"
                value={profile.email}
                isReadOnly
                startContent={<Mail size={16} className="text-default-400" />}
                description="Email tidak dapat diubah"
              />

              {profile.role === 'MAHASISWA' && (
                <Input
                  label="NIM (Nomor Induk Mahasiswa)"
                  value={nim}
                  onChange={(e) => setNim(e.target.value)}
                  startContent={
                    <BookOpen size={16} className="text-default-400" />
                  }
                  placeholder="Contoh: 123456789"
                />
              )}

              {profile.role === 'DOSEN_PENGUJI' && (
                <Input
                  label="NIP (Nomor Induk Pegawai)"
                  value={nip}
                  onChange={(e) => setNip(e.target.value)}
                  startContent={
                    <Shield size={16} className="text-default-400" />
                  }
                  placeholder="Contoh: 198501012010011001"
                />
              )}

              <Divider />

              <div className="flex justify-end">
                <Button
                  color="primary"
                  startContent={<Save size={18} />}
                  onPress={handleSaveProfile}
                  isLoading={isSaving}
                >
                  Simpan Perubahan
                </Button>
              </div>
            </CardBody>
          </Card>
        </Tab>

        <Tab key="security" title="Keamanan">
          <Card>
            <CardHeader>
              <h3 className="font-semibold flex items-center gap-2">
                <Key size={18} />
                Ubah Password
              </h3>
            </CardHeader>
            <CardBody className="space-y-4">
              {profile.githubUsername && !profile.nim && !profile.nip ? (
                <div className="text-center py-8">
                  <Github size={48} className="mx-auto text-default-400 mb-4" />
                  <p className="text-default-500">
                    Anda login menggunakan GitHub. Password dikelola oleh
                    GitHub.
                  </p>
                </div>
              ) : (
                <>
                  {passwordError && (
                    <div className="bg-danger-50 text-danger border border-danger-200 rounded-lg p-3 text-sm">
                      {passwordError}
                    </div>
                  )}

                  {passwordSuccess && (
                    <div className="bg-success-50 text-success border border-success-200 rounded-lg p-3 text-sm flex items-center gap-2">
                      <CheckCircle size={16} />
                      {passwordSuccess}
                    </div>
                  )}

                  <Input
                    type="password"
                    label="Password Saat Ini"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    startContent={
                      <Key size={16} className="text-default-400" />
                    }
                  />

                  <Input
                    type="password"
                    label="Password Baru"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    startContent={
                      <Key size={16} className="text-default-400" />
                    }
                    description="Minimal 8 karakter"
                  />

                  <Input
                    type="password"
                    label="Konfirmasi Password Baru"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    startContent={
                      <Key size={16} className="text-default-400" />
                    }
                  />

                  <Divider />

                  <div className="flex justify-end">
                    <Button
                      color="primary"
                      startContent={<Save size={18} />}
                      onPress={handleChangePassword}
                      isLoading={isChangingPassword}
                      isDisabled={
                        !currentPassword || !newPassword || !confirmPassword
                      }
                    >
                      Ubah Password
                    </Button>
                  </div>
                </>
              )}
            </CardBody>
          </Card>
        </Tab>

        <Tab key="github" title="Integrasi GitHub">
          <Card>
            <CardHeader>
              <h3 className="font-semibold flex items-center gap-2">
                <Github size={18} />
                GitHub
              </h3>
            </CardHeader>
            <CardBody className="space-y-4">
              {profile.githubUsername ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-success-50 rounded-lg">
                    <CheckCircle className="text-success" size={24} />
                    <div>
                      <p className="font-medium">GitHub Terhubung</p>
                      <p className="text-sm text-default-500">
                        Akun Anda terhubung dengan GitHub @
                        {profile.githubUsername}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-default-100 rounded-lg">
                    <Avatar
                      src={profile.avatarUrl || undefined}
                      name={profile.githubUsername}
                      size="sm"
                    />
                    <div>
                      <p className="font-medium">{profile.githubUsername}</p>
                      <a
                        href={`https://github.com/${profile.githubUsername}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        <LinkIcon size={12} />
                        Lihat Profil GitHub
                      </a>
                    </div>
                  </div>

                  <p className="text-sm text-default-500">
                    Anda dapat menggunakan repositori GitHub untuk project
                    capstone Anda.
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Github size={48} className="mx-auto text-default-400 mb-4" />
                  <p className="text-default-500 mb-4">
                    Hubungkan akun GitHub Anda untuk mengimpor repositori ke
                    project capstone.
                  </p>
                  <Button
                    as="a"
                    href="/api/auth/signin/github"
                    color="default"
                    variant="bordered"
                    startContent={<Github size={18} />}
                  >
                    Hubungkan GitHub
                  </Button>
                </div>
              )}
            </CardBody>
          </Card>
        </Tab>

        <Tab key="activity" title="Aktivitas">
          <Card>
            <CardHeader>
              <h3 className="font-semibold flex items-center gap-2">
                <Calendar size={18} />
                Riwayat Akun
              </h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-default-50 rounded-lg">
                  <div>
                    <p className="font-medium">Akun Dibuat</p>
                    <p className="text-sm text-default-500">
                      Tanggal pendaftaran akun
                    </p>
                  </div>
                  <p className="text-sm">{formatDateTime(profile.createdAt)}</p>
                </div>

                <div className="flex justify-between items-center p-3 bg-default-50 rounded-lg">
                  <div>
                    <p className="font-medium">Terakhir Diperbarui</p>
                    <p className="text-sm text-default-500">
                      Pembaruan profil terakhir
                    </p>
                  </div>
                  <p className="text-sm">{formatDateTime(profile.updatedAt)}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
}
