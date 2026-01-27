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
  Clock,
  Activity,
} from 'lucide-react';
import { formatDateTime, getRoleLabel, getSimakPhotoUrl } from '@/lib/utils';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  username: string;
  role: string;
  nim: string | null;
  nip: string | null;
  prodi: string | null;
  image: string | null;
  profilePhoto: string | null;
  githubUsername: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    projects: number;
    reviews: number;
  };
}

interface ProfilePageProps {
  /** Base path for role-specific links (e.g., '/admin', '/dosen', '/mahasiswa') */
  basePath?: string;
}

export function ProfilePageContent({ basePath = '' }: ProfilePageProps) {
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
  const [prodi, setProdi] = useState('');

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
        setName(data.name || '');
        setNim(data.nim || '');
        setNip(data.nip || '');
        setProdi(data.prodi || '');
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
          prodi: prodi || null,
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

  // Get avatar source
  const getAvatarSrc = () => {
    if (profile?.profilePhoto) return profile.profilePhoto;
    if (profile?.image) return profile.image;
    if (profile?.username) return getSimakPhotoUrl(profile.username);
    return undefined;
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Profil Saya</h1>
        <p className="text-default-500">Kelola informasi akun Anda</p>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - Profile Overview */}
        <div className="xl:col-span-1 space-y-6">
          {/* Profile Card */}
          <Card className="border border-default-200">
            <CardBody className="p-6">
              <div className="flex flex-col items-center text-center">
                <Avatar
                  src={getAvatarSrc()}
                  name={profile.name}
                  className="w-28 h-28 text-2xl mb-4"
                />
                <h2 className="text-xl font-bold">{profile.name}</h2>
                <p className="text-default-500 text-sm mb-1">@{profile.username}</p>
                {profile.prodi && (
                  <p className="text-default-400 text-xs mb-4">{profile.prodi}</p>
                )}
                
                <div className="flex flex-wrap gap-2 justify-center mb-4">
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
                </div>

                {profile.githubUsername && (
                  <a
                    href={`https://github.com/${profile.githubUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-default-600 hover:text-primary transition-colors"
                  >
                    <Github size={16} />
                    {profile.githubUsername}
                  </a>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Quick Stats */}
          <Card className="border border-default-200">
            <CardHeader className="pb-2">
              <h3 className="font-semibold flex items-center gap-2 text-sm">
                <Activity size={16} />
                Statistik Akun
              </h3>
            </CardHeader>
            <CardBody className="pt-2">
              <div className="space-y-3">
                {profile._count && profile.role === 'MAHASISWA' && (
                  <div className="flex justify-between items-center">
                    <span className="text-default-500 text-sm">Total Project</span>
                    <span className="font-semibold">{profile._count.projects}</span>
                  </div>
                )}
                {profile._count && profile.role === 'DOSEN_PENGUJI' && (
                  <div className="flex justify-between items-center">
                    <span className="text-default-500 text-sm">Total Review</span>
                    <span className="font-semibold">{profile._count.reviews}</span>
                  </div>
                )}
                {profile._count && (profile.role === 'MAHASISWA' || profile.role === 'DOSEN_PENGUJI') && (
                  <Divider />
                )}
                <div className="flex justify-between items-center">
                  <span className="text-default-500 text-sm flex items-center gap-1">
                    <Calendar size={14} />
                    Bergabung
                  </span>
                  <span className="text-sm">
                    {new Date(profile.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-default-500 text-sm flex items-center gap-1">
                    <Clock size={14} />
                    Diperbarui
                  </span>
                  <span className="text-sm">
                    {new Date(profile.updatedAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right Column - Tabs Content */}
        <div className="xl:col-span-2">
          <Tabs 
            aria-label="Profile sections" 
            variant="underlined"
            classNames={{
              tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
              cursor: "w-full bg-primary",
              tab: "max-w-fit px-0 h-12",
              tabContent: "group-data-[selected=true]:text-primary"
            }}
          >
            <Tab key="info" title="Informasi Profil">
              <Card className="border border-default-200 mt-4">
                <CardHeader className="border-b border-default-100">
                  <h3 className="font-semibold flex items-center gap-2">
                    <User size={18} />
                    Informasi Dasar
                  </h3>
                </CardHeader>
                <CardBody className="p-6">
                  {error && (
                    <div className="bg-danger-50 text-danger border border-danger-200 rounded-lg p-3 text-sm mb-4">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="bg-success-50 text-success border border-success-200 rounded-lg p-3 text-sm flex items-center gap-2 mb-4">
                      <CheckCircle size={16} />
                      {success}
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Input
                      label="Nama Lengkap"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      startContent={<User size={16} className="text-default-400" />}
                      isRequired
                      variant="bordered"
                      labelPlacement="outside"
                      placeholder="Masukkan nama lengkap"
                    />

                    <Input
                      label="Username"
                      value={profile.username}
                      isReadOnly
                      startContent={<User size={16} className="text-default-400" />}
                      variant="bordered"
                      labelPlacement="outside"
                      description="Username tidak dapat diubah"
                    />

                    <Input
                      label="Email"
                      value={profile.email || '-'}
                      isReadOnly
                      startContent={<Mail size={16} className="text-default-400" />}
                      variant="bordered"
                      labelPlacement="outside"
                      description="Email tidak dapat diubah"
                      className="lg:col-span-2"
                    />

                    {profile.role === 'MAHASISWA' && (
                      <>
                        <Input
                          label="NIM (Nomor Induk Mahasiswa)"
                          value={nim}
                          onChange={(e) => setNim(e.target.value)}
                          startContent={
                            <BookOpen size={16} className="text-default-400" />
                          }
                          variant="bordered"
                          labelPlacement="outside"
                          placeholder="Contoh: 123456789"
                        />
                        <Input
                          label="Program Studi"
                          value={prodi}
                          onChange={(e) => setProdi(e.target.value)}
                          startContent={
                            <BookOpen size={16} className="text-default-400" />
                          }
                          variant="bordered"
                          labelPlacement="outside"
                          placeholder="Contoh: Teknik Informatika"
                        />
                      </>
                    )}

                    {profile.role === 'DOSEN_PENGUJI' && (
                      <Input
                        label="NIP (Nomor Induk Pegawai)"
                        value={nip}
                        onChange={(e) => setNip(e.target.value)}
                        startContent={
                          <Shield size={16} className="text-default-400" />
                        }
                        variant="bordered"
                        labelPlacement="outside"
                        placeholder="Contoh: 198501012010011001"
                        className="lg:col-span-2"
                      />
                    )}
                  </div>

                  <Divider className="my-6" />

                  <div className="flex justify-end">
                    <Button
                      color="primary"
                      startContent={<Save size={18} />}
                      onPress={handleSaveProfile}
                      isLoading={isSaving}
                      size="lg"
                    >
                      Simpan Perubahan
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </Tab>

            <Tab key="security" title="Keamanan">
              <Card className="border border-default-200 mt-4">
                <CardHeader className="border-b border-default-100">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Key size={18} />
                    Ubah Password
                  </h3>
                </CardHeader>
                <CardBody className="p-6">
                  {profile.githubUsername && !profile.nim && !profile.nip ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-full bg-default-100 flex items-center justify-center mx-auto mb-4">
                        <Github size={32} className="text-default-400" />
                      </div>
                      <h4 className="font-semibold mb-2">Login via GitHub</h4>
                      <p className="text-default-500 max-w-md mx-auto">
                        Anda login menggunakan GitHub. Password dikelola oleh GitHub.
                        Untuk mengubah password, silakan kunjungi pengaturan akun GitHub Anda.
                      </p>
                    </div>
                  ) : (
                    <>
                      {passwordError && (
                        <div className="bg-danger-50 text-danger border border-danger-200 rounded-lg p-3 text-sm mb-4">
                          {passwordError}
                        </div>
                      )}

                      {passwordSuccess && (
                        <div className="bg-success-50 text-success border border-success-200 rounded-lg p-3 text-sm flex items-center gap-2 mb-4">
                          <CheckCircle size={16} />
                          {passwordSuccess}
                        </div>
                      )}

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Input
                          type="password"
                          label="Password Saat Ini"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          startContent={
                            <Key size={16} className="text-default-400" />
                          }
                          variant="bordered"
                          labelPlacement="outside"
                          placeholder="Masukkan password saat ini"
                          className="lg:col-span-2"
                        />

                        <Input
                          type="password"
                          label="Password Baru"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          startContent={
                            <Key size={16} className="text-default-400" />
                          }
                          variant="bordered"
                          labelPlacement="outside"
                          placeholder="Masukkan password baru"
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
                          variant="bordered"
                          labelPlacement="outside"
                          placeholder="Ulangi password baru"
                        />
                      </div>

                      <Divider className="my-6" />

                      <div className="flex justify-end">
                        <Button
                          color="primary"
                          startContent={<Save size={18} />}
                          onPress={handleChangePassword}
                          isLoading={isChangingPassword}
                          isDisabled={
                            !currentPassword || !newPassword || !confirmPassword
                          }
                          size="lg"
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
              <Card className="border border-default-200 mt-4">
                <CardHeader className="border-b border-default-100">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Github size={18} />
                    Akun GitHub
                  </h3>
                </CardHeader>
                <CardBody className="p-6">
                  {profile.githubUsername ? (
                    <div className="space-y-6">
                      <div className="flex items-center gap-4 p-4 bg-success-50 dark:bg-success-900/20 rounded-xl border border-success-200 dark:border-success-800">
                        <div className="w-12 h-12 rounded-full bg-success-100 dark:bg-success-900/40 flex items-center justify-center">
                          <CheckCircle className="text-success" size={24} />
                        </div>
                        <div>
                          <p className="font-semibold text-success-700 dark:text-success-400">GitHub Terhubung</p>
                          <p className="text-sm text-success-600 dark:text-success-500">
                            Akun Anda terhubung dengan GitHub @{profile.githubUsername}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-4 bg-default-50 dark:bg-default-100/10 rounded-xl">
                        <Avatar
                          src={profile.image || undefined}
                          name={profile.githubUsername}
                          size="lg"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-lg">{profile.githubUsername}</p>
                          <a
                            href={`https://github.com/${profile.githubUsername}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline flex items-center gap-1"
                          >
                            <LinkIcon size={14} />
                            github.com/{profile.githubUsername}
                          </a>
                        </div>
                      </div>

                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          <strong>Tip:</strong> Dengan GitHub terhubung, Anda dapat dengan mudah mengimpor repositori 
                          ke project capstone Anda dan melakukan sinkronisasi kode secara otomatis.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 rounded-full bg-default-100 flex items-center justify-center mx-auto mb-4">
                        <Github size={40} className="text-default-400" />
                      </div>
                      <h4 className="font-semibold text-lg mb-2">Hubungkan GitHub</h4>
                      <p className="text-default-500 max-w-md mx-auto mb-6">
                        Hubungkan akun GitHub Anda untuk mengimpor repositori ke project capstone
                        dan mengaktifkan fitur sinkronisasi kode otomatis.
                      </p>
                      <Button
                        as="a"
                        href="/api/auth/link-github"
                        color="default"
                        variant="bordered"
                        startContent={<Github size={18} />}
                        size="lg"
                      >
                        Hubungkan GitHub
                      </Button>
                    </div>
                  )}
                </CardBody>
              </Card>
            </Tab>

            <Tab key="activity" title="Aktivitas">
              <Card className="border border-default-200 mt-4">
                <CardHeader className="border-b border-default-100">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Calendar size={18} />
                    Riwayat Akun
                  </h3>
                </CardHeader>
                <CardBody className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="p-4 bg-default-50 dark:bg-default-100/10 rounded-xl border border-default-200">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                          <Calendar size={20} className="text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Akun Dibuat</p>
                          <p className="text-xs text-default-500">Tanggal pendaftaran</p>
                        </div>
                      </div>
                      <p className="text-lg font-semibold mt-2">
                        {formatDateTime(profile.createdAt)}
                      </p>
                    </div>

                    <div className="p-4 bg-default-50 dark:bg-default-100/10 rounded-xl border border-default-200">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-secondary-100 dark:bg-secondary-900/30 flex items-center justify-center">
                          <Clock size={20} className="text-secondary" />
                        </div>
                        <div>
                          <p className="font-medium">Terakhir Diperbarui</p>
                          <p className="text-xs text-default-500">Pembaruan profil</p>
                        </div>
                      </div>
                      <p className="text-lg font-semibold mt-2">
                        {formatDateTime(profile.updatedAt)}
                      </p>
                    </div>
                  </div>

                  {/* Activity Timeline Placeholder */}
                  <Divider className="my-6" />
                  
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-default-100 flex items-center justify-center mx-auto mb-4">
                      <Activity size={28} className="text-default-400" />
                    </div>
                    <h4 className="font-semibold mb-2">Log Aktivitas</h4>
                    <p className="text-default-500 text-sm">
                      Fitur log aktivitas detail akan segera tersedia.
                    </p>
                  </div>
                </CardBody>
              </Card>
            </Tab>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
