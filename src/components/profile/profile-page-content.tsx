'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  User,
  Save,
  Github,
  Calendar,
  CheckCircle,
  AlertCircle,
  Link as LinkIcon,
  Key,
  Clock,
  Activity,
  Loader2,
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
    if (profile?.profilePhoto) return getSimakPhotoUrl(profile.profilePhoto);
    if (profile?.image) return getSimakPhotoUrl(profile.image);
    if (profile?.username) return getSimakPhotoUrl(profile.username);
    return undefined;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <AlertCircle size={48} className="mx-auto text-destructive mb-4" />
        <p className="text-destructive">{error || 'Profil tidak ditemukan'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Profil Saya</h1>
        <p className="text-muted-foreground">Kelola informasi akun Anda</p>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - Profile Overview */}
        <div className="xl:col-span-1 space-y-6">
          {/* Profile Card */}
          <Card className="border">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="w-28 h-28 text-2xl mb-4">
                  {getAvatarSrc() && (
                    <AvatarImage src={getAvatarSrc()} alt={profile.name} />
                  )}
                  <AvatarFallback className="text-2xl">
                    {profile.name?.charAt(0)?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold">{profile.name}</h2>
                <p className="text-muted-foreground text-sm mb-1">@{profile.username}</p>
                {profile.prodi && (
                  <p className="text-muted-foreground text-xs mb-4">{profile.prodi}</p>
                )}

                <div className="flex flex-wrap gap-2 justify-center mb-4">
                  <Badge
                    variant="secondary"
                    className={
                      profile.role === 'ADMIN'
                        ? 'bg-destructive/10 text-destructive'
                        : profile.role === 'DOSEN_PENGUJI'
                          ? 'bg-violet-500/10 text-violet-700 dark:text-violet-400'
                          : 'bg-primary/10 text-primary'
                    }
                  >
                    {getRoleLabel(profile.role)}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className={
                      profile.isActive
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                        : ''
                    }
                  >
                    {profile.isActive ? (
                      <CheckCircle size={14} />
                    ) : (
                      <AlertCircle size={14} />
                    )}
                    {profile.isActive ? 'Aktif' : 'Tidak Aktif'}
                  </Badge>
                </div>

                {profile.githubUsername && (
                  <a
                    href={`https://github.com/${profile.githubUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
                  >
                    <Github size={16} />
                    {profile.githubUsername}
                  </a>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="border">
            <CardHeader className="pb-2">
              <h3 className="font-semibold flex items-center gap-2 text-sm">
                <Activity size={16} />
                Statistik Akun
              </h3>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="space-y-3">
                {profile._count && profile.role === 'MAHASISWA' && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Total Project</span>
                    <span className="font-semibold">{profile._count.projects}</span>
                  </div>
                )}
                {profile._count && profile.role === 'DOSEN_PENGUJI' && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Total Review</span>
                    <span className="font-semibold">{profile._count.reviews}</span>
                  </div>
                )}
                {profile._count && (profile.role === 'MAHASISWA' || profile.role === 'DOSEN_PENGUJI') && (
                  <Separator />
                )}
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm flex items-center gap-1">
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
                  <span className="text-muted-foreground text-sm flex items-center gap-1">
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
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Tabs Content */}
        <div className="xl:col-span-2">
          <Tabs defaultValue="info">
            <TabsList variant="line" className="w-full justify-start gap-6 border-b">
              <TabsTrigger value="info">Informasi Profil</TabsTrigger>
              <TabsTrigger value="security">Keamanan</TabsTrigger>
              <TabsTrigger value="github">Integrasi GitHub</TabsTrigger>
              <TabsTrigger value="activity">Aktivitas</TabsTrigger>
            </TabsList>

            <TabsContent value="info">
              <Card className="border mt-4">
                <CardHeader className="border-b">
                  <h3 className="font-semibold flex items-center gap-2">
                    <User size={18} />
                    Informasi Dasar
                  </h3>
                </CardHeader>
                <CardContent className="p-6">
                  {error && (
                    <div className="bg-destructive/10 text-destructive border border-destructive/30 rounded-lg p-3 text-sm mb-4">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800 rounded-lg p-3 text-sm flex items-center gap-2 mb-4">
                      <CheckCircle size={16} />
                      {success}
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <Label htmlFor="profile-name">Nama Lengkap</Label>
                      <Input
                        id="profile-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="Masukkan nama lengkap"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="profile-username">Username</Label>
                      <Input
                        id="profile-username"
                        value={profile.username}
                        readOnly
                      />
                      <p className="text-xs text-muted-foreground">
                        Username tidak dapat diubah
                      </p>
                    </div>

                    <div className="space-y-1.5 lg:col-span-2">
                      <Label htmlFor="profile-email">Email</Label>
                      <Input
                        id="profile-email"
                        value={profile.email || '-'}
                        readOnly
                      />
                      <p className="text-xs text-muted-foreground">
                        Email tidak dapat diubah
                      </p>
                    </div>

                    {profile.role === 'MAHASISWA' && (
                      <>
                        <div className="space-y-1.5">
                          <Label htmlFor="profile-nim">NIM (Nomor Induk Mahasiswa)</Label>
                          <Input
                            id="profile-nim"
                            value={nim}
                            onChange={(e) => setNim(e.target.value)}
                            placeholder="Contoh: 123456789"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="profile-prodi">Program Studi</Label>
                          <Input
                            id="profile-prodi"
                            value={prodi}
                            onChange={(e) => setProdi(e.target.value)}
                            placeholder="Contoh: Teknik Informatika"
                          />
                        </div>
                      </>
                    )}

                    {profile.role === 'DOSEN_PENGUJI' && (
                      <div className="space-y-1.5 lg:col-span-2">
                        <Label htmlFor="profile-nip">NIP (Nomor Induk Pegawai)</Label>
                        <Input
                          id="profile-nip"
                          value={nip}
                          onChange={(e) => setNip(e.target.value)}
                          placeholder="Contoh: 198501012010011001"
                        />
                      </div>
                    )}
                  </div>

                  <Separator className="my-6" />

                  <div className="flex justify-end">
                    <Button
                      size="lg"
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <Save size={18} />
                      )}
                      Simpan Perubahan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card className="border mt-4">
                <CardHeader className="border-b">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Key size={18} />
                    Ubah Password
                  </h3>
                </CardHeader>
                <CardContent className="p-6">
                  {profile.githubUsername && !profile.nim && !profile.nip ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                        <Github size={32} className="text-muted-foreground" />
                      </div>
                      <h4 className="font-semibold mb-2">Login via GitHub</h4>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        Anda login menggunakan GitHub. Password dikelola oleh GitHub.
                        Untuk mengubah password, silakan kunjungi pengaturan akun GitHub Anda.
                      </p>
                    </div>
                  ) : (
                    <>
                      {passwordError && (
                        <div className="bg-destructive/10 text-destructive border border-destructive/30 rounded-lg p-3 text-sm mb-4">
                          {passwordError}
                        </div>
                      )}

                      {passwordSuccess && (
                        <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800 rounded-lg p-3 text-sm flex items-center gap-2 mb-4">
                          <CheckCircle size={16} />
                          {passwordSuccess}
                        </div>
                      )}

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-1.5 lg:col-span-2">
                          <Label htmlFor="current-password">Password Saat Ini</Label>
                          <Input
                            id="current-password"
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Masukkan password saat ini"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="new-password">Password Baru</Label>
                          <Input
                            id="new-password"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Masukkan password baru"
                          />
                          <p className="text-xs text-muted-foreground">Minimal 8 karakter</p>
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="confirm-password">Konfirmasi Password Baru</Label>
                          <Input
                            id="confirm-password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Ulangi password baru"
                          />
                        </div>
                      </div>

                      <Separator className="my-6" />

                      <div className="flex justify-end">
                        <Button
                          size="lg"
                          onClick={handleChangePassword}
                          disabled={
                            isChangingPassword ||
                            !currentPassword ||
                            !newPassword ||
                            !confirmPassword
                          }
                        >
                          {isChangingPassword ? (
                            <Loader2 className="animate-spin" />
                          ) : (
                            <Save size={18} />
                          )}
                          Ubah Password
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="github">
              <Card className="border mt-4">
                <CardHeader className="border-b">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Github size={18} />
                    Akun GitHub
                  </h3>
                </CardHeader>
                <CardContent className="p-6">
                  {profile.githubUsername ? (
                    <div className="space-y-6">
                      <div className="flex items-center gap-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                          <CheckCircle className="text-emerald-600 dark:text-emerald-400" size={24} />
                        </div>
                        <div>
                          <p className="font-semibold text-emerald-700 dark:text-emerald-400">GitHub Terhubung</p>
                          <p className="text-sm text-emerald-600 dark:text-emerald-500">
                            Akun Anda terhubung dengan GitHub @{profile.githubUsername}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                        <Avatar size="lg">
                          <AvatarImage
                            src={getSimakPhotoUrl(profile.image)}
                            alt={profile.githubUsername}
                          />
                          <AvatarFallback>
                            {profile.githubUsername.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
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
                      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                        <Github size={40} className="text-muted-foreground" />
                      </div>
                      <h4 className="font-semibold text-lg mb-2">Hubungkan GitHub</h4>
                      <p className="text-muted-foreground max-w-md mx-auto mb-6">
                        Hubungkan akun GitHub Anda untuk mengimpor repositori ke project capstone
                        dan mengaktifkan fitur sinkronisasi kode otomatis.
                      </p>
                      <Button
                        // eslint-disable-next-line @next/next/no-html-link-for-pages
                        render={<a href="/api/auth/link-github" />}
                        variant="outline"
                        size="lg"
                      >
                        <Github size={18} />
                        Hubungkan GitHub
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity">
              <Card className="border mt-4">
                <CardHeader className="border-b">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Calendar size={18} />
                    Riwayat Akun
                  </h3>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/50 rounded-xl border">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Calendar size={20} className="text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Akun Dibuat</p>
                          <p className="text-xs text-muted-foreground">Tanggal pendaftaran</p>
                        </div>
                      </div>
                      <p className="text-lg font-semibold mt-2">
                        {formatDateTime(profile.createdAt)}
                      </p>
                    </div>

                    <div className="p-4 bg-muted/50 rounded-xl border">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                          <Clock size={20} className="text-violet-600 dark:text-violet-400" />
                        </div>
                        <div>
                          <p className="font-medium">Terakhir Diperbarui</p>
                          <p className="text-xs text-muted-foreground">Pembaruan profil</p>
                        </div>
                      </div>
                      <p className="text-lg font-semibold mt-2">
                        {formatDateTime(profile.updatedAt)}
                      </p>
                    </div>
                  </div>

                  {/* Activity Timeline Placeholder */}
                  <Separator className="my-6" />

                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <Activity size={28} className="text-muted-foreground" />
                    </div>
                    <h4 className="font-semibold mb-2">Log Aktivitas</h4>
                    <p className="text-muted-foreground text-sm">
                      Fitur log aktivitas detail akan segera tersedia.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
