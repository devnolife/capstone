'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import {
  Settings,
  Sun,
  Moon,
  Monitor,
  Bell,
  Mail,
  Globe,
  Shield,
  Palette,
  Save,
  CheckCircle,
  Github,
  Link,
  Unlink,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

interface SettingsContentProps {
  role: 'admin' | 'dosen' | 'mahasiswa';
}

interface GitHubLinkStatus {
  linked: boolean;
  githubUsername: string | null;
  hasToken: boolean;
}

export function SettingsContent({ role }: SettingsContentProps) {
  const { theme, setTheme } = useTheme();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [reviewReminders, setReviewReminders] = useState(true);
  const [projectUpdates, setProjectUpdates] = useState(true);
  const [language, setLanguage] = useState('id');
  const [showProfile, setShowProfile] = useState(true);
  const [showGithub, setShowGithub] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingPrefs, setIsLoadingPrefs] = useState(true);

  // Load persisted preferences
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/profile/preferences');
        if (!res.ok) return;
        const p = await res.json();
        if (cancelled) return;
        setEmailNotifications(Boolean(p.emailNotifications));
        setPushNotifications(Boolean(p.pushNotifications));
        setReviewReminders(Boolean(p.reviewReminders));
        setProjectUpdates(Boolean(p.projectUpdates));
        setShowProfile(Boolean(p.showProfile));
        setShowGithub(Boolean(p.showGithub));
        if (p.language === 'id' || p.language === 'en') setLanguage(p.language);
      } catch (err) {
        console.error('Failed to load preferences', err);
      } finally {
        if (!cancelled) setIsLoadingPrefs(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // GitHub linking state
  const [githubStatus, setGithubStatus] = useState<GitHubLinkStatus | null>(null);
  const [isLoadingGithub, setIsLoadingGithub] = useState(true);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Fetch GitHub link status on mount
  useEffect(() => {
    const fetchGitHubStatus = async () => {
      try {
        const response = await fetch('/api/auth/link-github');
        if (response.ok) {
          const data = await response.json();
          setGithubStatus(data);
        }
      } catch (error) {
        console.error('Error fetching GitHub status:', error);
      } finally {
        setIsLoadingGithub(false);
      }
    };

    fetchGitHubStatus();
  }, []);

  const handleGitHubLink = () => {
    // Redirect to GitHub OAuth with custom callback for linking
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    if (!clientId) {
      toast.error('GitHub Client ID tidak dikonfigurasi');
      return;
    }
    const redirectUri = `${window.location.origin}/link-github/callback`;
    const scope = 'read:user user:email repo';

    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;

    window.location.href = authUrl;
  };

  const handleGitHubUnlink = async () => {
    const confirmed = await confirm({
      title: 'Putuskan Hubungan GitHub',
      message: 'Apakah Anda yakin ingin memutuskan hubungan dengan akun GitHub? Fitur review code tidak akan tersedia.',
      confirmText: 'Ya, Putuskan',
      cancelText: 'Batal',
      type: 'warning',
    });

    if (!confirmed) return;

    setIsUnlinking(true);
    try {
      const response = await fetch('/api/auth/link-github', {
        method: 'DELETE',
      });

      if (response.ok) {
        setGithubStatus({ linked: false, githubUsername: null, hasToken: false });
        toast.success('Akun GitHub berhasil di-unlink');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Gagal memutuskan hubungan dengan GitHub');
      }
    } catch {
      toast.error('Terjadi kesalahan');
    } finally {
      setIsUnlinking(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/profile/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailNotifications,
          pushNotifications,
          reviewReminders,
          projectUpdates,
          language,
          showProfile,
          showGithub,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || 'Gagal menyimpan pengaturan');
        return;
      }
      setIsSaved(true);
      toast.success('Pengaturan berhasil disimpan');
      setTimeout(() => setIsSaved(false), 3000);
    } catch {
      toast.error('Terjadi kesalahan');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      className="w-full space-y-5"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <div className="flex items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Pengaturan</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Sesuaikan preferensi aplikasi Anda
            </p>
          </div>
        </div>
      </motion.div>

      {/* Success Message */}
      {isSaved && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800 rounded-lg p-3 text-sm flex items-center gap-2"
        >
          <CheckCircle size={16} />
          Pengaturan berhasil disimpan
        </motion.div>
      )}

      {/* Appearance */}
      <motion.div variants={itemVariants}>
        <Card className="border border-border shadow-none">
          <CardHeader className="pb-0">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Palette size={16} />
              Tampilan
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Tema</p>
                <p className="text-sm text-muted-foreground">
                  Pilih tema tampilan aplikasi
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={theme === 'light' ? 'default' : 'outline'}
                  onClick={() => setTheme('light')}
                >
                  <Sun size={16} />
                  Terang
                </Button>
                <Button
                  size="sm"
                  variant={theme === 'dark' ? 'default' : 'outline'}
                  onClick={() => setTheme('dark')}
                >
                  <Moon size={16} />
                  Gelap
                </Button>
                <Button
                  size="sm"
                  variant={theme === 'system' ? 'default' : 'outline'}
                  onClick={() => setTheme('system')}
                  className="hidden md:flex"
                >
                  <Monitor size={16} />
                  Sistem
                </Button>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Bahasa</p>
                <p className="text-sm text-muted-foreground">
                  Pilih bahasa tampilan
                </p>
              </div>
              <Select
                value={language}
                onValueChange={(value) => setLanguage(value as string)}
              >
                <SelectTrigger size="sm" className="w-[150px]" aria-label="Bahasa">
                  <Globe size={16} className="text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="id">Indonesia</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Notifications */}
      <motion.div variants={itemVariants}>
        <Card className="border border-border shadow-none">
          <CardHeader className="pb-0">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Bell size={16} />
              Notifikasi
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Notifikasi Email</p>
                <p className="text-sm text-muted-foreground">
                  Terima notifikasi melalui email
                </p>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Notifikasi Push</p>
                <p className="text-sm text-muted-foreground">
                  Terima notifikasi di browser
                </p>
              </div>
              <Switch
                checked={pushNotifications}
                onCheckedChange={setPushNotifications}
              />
            </div>

            <Separator />

            {role === 'dosen' && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Pengingat Review</p>
                    <p className="text-sm text-muted-foreground">
                      Ingatkan untuk review project yang pending
                    </p>
                  </div>
                  <Switch
                    checked={reviewReminders}
                    onCheckedChange={setReviewReminders}
                  />
                </div>
                <Separator />
              </>
            )}

            {role === 'mahasiswa' && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Update Project</p>
                    <p className="text-sm text-muted-foreground">
                      Notifikasi saat ada update review
                    </p>
                  </div>
                  <Switch
                    checked={projectUpdates}
                    onCheckedChange={setProjectUpdates}
                  />
                </div>
                <Separator />
              </>
            )}

            {role === 'admin' && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Update Sistem</p>
                    <p className="text-sm text-muted-foreground">
                      Notifikasi saat ada aktivitas penting
                    </p>
                  </div>
                  <Switch
                    checked={projectUpdates}
                    onCheckedChange={setProjectUpdates}
                  />
                </div>
                <Separator />
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Privacy */}
      <motion.div variants={itemVariants}>
        <Card className="border border-border shadow-none">
          <CardHeader className="pb-0">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Shield size={16} />
              Privasi
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Tampilkan Profil</p>
                <p className="text-sm text-muted-foreground">
                  Izinkan pengguna lain melihat profil Anda
                </p>
              </div>
              <Switch checked={showProfile} onCheckedChange={setShowProfile} />
            </div>

            {role === 'mahasiswa' && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Tampilkan GitHub</p>
                    <p className="text-sm text-muted-foreground">
                      Tampilkan link GitHub di profil
                    </p>
                  </div>
                  <Switch checked={showGithub} onCheckedChange={setShowGithub} />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* GitHub Integration - Only for Mahasiswa */}
      {role === 'mahasiswa' && (
        <motion.div variants={itemVariants}>
          <Card className="border border-border shadow-none">
            <CardHeader className="pb-0">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Github size={16} />
                Integrasi GitHub
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium">Akun GitHub</p>
                  <p className="text-sm text-muted-foreground">
                    Hubungkan akun GitHub untuk fitur review code dan manajemen repository
                  </p>
                </div>

                {isLoadingGithub ? (
                  <Spinner />
                ) : githubStatus?.linked ? (
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="secondary"
                      className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                    >
                      <CheckCircle size={14} />
                      Terhubung
                    </Badge>
                    <a
                      href={`https://github.com/${githubStatus.githubUsername}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary flex items-center gap-1 hover:underline"
                    >
                      @{githubStatus.githubUsername}
                      <ExternalLink size={12} />
                    </a>
                  </div>
                ) : (
                  <Badge
                    variant="secondary"
                    className="bg-amber-500/10 text-amber-700 dark:text-amber-400"
                  >
                    Belum Terhubung
                  </Badge>
                )}
              </div>

              <Separator />

              <div className="flex justify-end gap-2">
                {githubStatus?.linked ? (
                  <Button
                    variant="destructive"
                    onClick={handleGitHubUnlink}
                    disabled={isUnlinking}
                  >
                    {isUnlinking ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Unlink size={16} />
                    )}
                    Putuskan Hubungan
                  </Button>
                ) : (
                  <Button onClick={handleGitHubLink}>
                    <Link size={16} />
                    Hubungkan GitHub
                  </Button>
                )}
              </div>

              {!githubStatus?.linked && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    <strong>Penting:</strong> Anda perlu menghubungkan akun GitHub untuk dapat membuat project dan menggunakan fitur review code.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Save Button */}
      <motion.div variants={itemVariants} className="flex justify-end pb-4">
        <Button
          onClick={handleSave}
          disabled={isSaving || isLoadingPrefs}
        >
          {isSaving ? <Loader2 className="animate-spin" /> : <Save size={18} />}
          Simpan Pengaturan
        </Button>
      </motion.div>

      {/* Confirm Dialog */}
      <ConfirmDialog />
    </motion.div>
  );
}
