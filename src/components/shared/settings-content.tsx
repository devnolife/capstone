'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import {
  Card,
  CardBody,
  CardHeader,
  Switch,
  Select,
  SelectItem,
  Button,
  Divider,
  Chip,
  Spinner,
} from '@heroui/react';
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
            <h1 className="text-2xl font-semibold text-default-900">Pengaturan</h1>
            <p className="text-sm text-default-500 mt-0.5">
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
          className="bg-success-50 text-success border border-success-200 rounded-lg p-3 text-sm flex items-center gap-2"
        >
          <CheckCircle size={16} />
          Pengaturan berhasil disimpan
        </motion.div>
      )}

      {/* Appearance */}
      <motion.div variants={itemVariants}>
        <Card shadow="none" className="border border-divider/60">
          <CardHeader className="pb-0">
            <h3 className="text-sm font-semibold text-default-700 flex items-center gap-2">
              <Palette size={16} />
              Tampilan
            </h3>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Tema</p>
                <p className="text-sm text-default-500">
                  Pilih tema tampilan aplikasi
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={theme === 'light' ? 'solid' : 'bordered'}
                  color={theme === 'light' ? 'primary' : 'default'}
                  onPress={() => setTheme('light')}
                  startContent={<Sun size={16} />}
                >
                  Terang
                </Button>
                <Button
                  size="sm"
                  variant={theme === 'dark' ? 'solid' : 'bordered'}
                  color={theme === 'dark' ? 'primary' : 'default'}
                  onPress={() => setTheme('dark')}
                  startContent={<Moon size={16} />}
                >
                  Gelap
                </Button>
                <Button
                  size="sm"
                  variant={theme === 'system' ? 'solid' : 'bordered'}
                  color={theme === 'system' ? 'primary' : 'default'}
                  onPress={() => setTheme('system')}
                  startContent={<Monitor size={16} />}
                  className="hidden md:flex"
                >
                  Sistem
                </Button>
              </div>
            </div>

            <Divider />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Bahasa</p>
                <p className="text-sm text-default-500">
                  Pilih bahasa tampilan
                </p>
              </div>
              <Select
                selectedKeys={[language]}
                onSelectionChange={(keys) => setLanguage(Array.from(keys)[0] as string)}
                className="max-w-[150px]"
                size="sm"
                startContent={<Globe size={16} className="text-default-400" />}
              >
                <SelectItem key="id">Indonesia</SelectItem>
                <SelectItem key="en">English</SelectItem>
              </Select>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Notifications */}
      <motion.div variants={itemVariants}>
        <Card shadow="none" className="border border-divider/60">
          <CardHeader className="pb-0">
            <h3 className="text-sm font-semibold text-default-700 flex items-center gap-2">
              <Bell size={16} />
              Notifikasi
            </h3>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Notifikasi Email</p>
                <p className="text-sm text-default-500">
                  Terima notifikasi melalui email
                </p>
              </div>
              <Switch
                isSelected={emailNotifications}
                onValueChange={setEmailNotifications}
                color="primary"
              />
            </div>

            <Divider />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Notifikasi Push</p>
                <p className="text-sm text-default-500">
                  Terima notifikasi di browser
                </p>
              </div>
              <Switch
                isSelected={pushNotifications}
                onValueChange={setPushNotifications}
                color="primary"
              />
            </div>

            <Divider />

            {role === 'dosen' && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Pengingat Review</p>
                    <p className="text-sm text-default-500">
                      Ingatkan untuk review project yang pending
                    </p>
                  </div>
                  <Switch
                    isSelected={reviewReminders}
                    onValueChange={setReviewReminders}
                    color="primary"
                  />
                </div>
                <Divider />
              </>
            )}

            {role === 'mahasiswa' && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Update Project</p>
                    <p className="text-sm text-default-500">
                      Notifikasi saat ada update review
                    </p>
                  </div>
                  <Switch
                    isSelected={projectUpdates}
                    onValueChange={setProjectUpdates}
                    color="primary"
                  />
                </div>
                <Divider />
              </>
            )}

            {role === 'admin' && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Update Sistem</p>
                    <p className="text-sm text-default-500">
                      Notifikasi saat ada aktivitas penting
                    </p>
                  </div>
                  <Switch
                    isSelected={projectUpdates}
                    onValueChange={setProjectUpdates}
                    color="primary"
                  />
                </div>
                <Divider />
              </>
            )}
          </CardBody>
        </Card>
      </motion.div>

      {/* Privacy */}
      <motion.div variants={itemVariants}>
        <Card shadow="none" className="border border-divider/60">
          <CardHeader className="pb-0">
            <h3 className="text-sm font-semibold text-default-700 flex items-center gap-2">
              <Shield size={16} />
              Privasi
            </h3>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Tampilkan Profil</p>
                <p className="text-sm text-default-500">
                  Izinkan pengguna lain melihat profil Anda
                </p>
              </div>
              <Switch isSelected={showProfile} onValueChange={setShowProfile} color="primary" />
            </div>

            {role === 'mahasiswa' && (
              <>
                <Divider />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Tampilkan GitHub</p>
                    <p className="text-sm text-default-500">
                      Tampilkan link GitHub di profil
                    </p>
                  </div>
                  <Switch isSelected={showGithub} onValueChange={setShowGithub} color="primary" />
                </div>
              </>
            )}
          </CardBody>
        </Card>
      </motion.div>

      {/* GitHub Integration - Only for Mahasiswa */}
      {role === 'mahasiswa' && (
        <motion.div variants={itemVariants}>
          <Card shadow="none" className="border border-divider/60">
            <CardHeader className="pb-0">
              <h3 className="text-sm font-semibold text-default-700 flex items-center gap-2">
                <Github size={16} />
                Integrasi GitHub
              </h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium">Akun GitHub</p>
                  <p className="text-sm text-default-500">
                    Hubungkan akun GitHub untuk fitur review code dan manajemen repository
                  </p>
                </div>

                {isLoadingGithub ? (
                  <Spinner size="sm" />
                ) : githubStatus?.linked ? (
                  <div className="flex items-center gap-3">
                    <Chip
                      color="success"
                      variant="flat"
                      startContent={<CheckCircle size={14} />}
                    >
                      Terhubung
                    </Chip>
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
                  <Chip color="warning" variant="flat">
                    Belum Terhubung
                  </Chip>
                )}
              </div>

              <Divider />

              <div className="flex justify-end gap-2">
                {githubStatus?.linked ? (
                  <Button
                    color="danger"
                    variant="flat"
                    startContent={<Unlink size={16} />}
                    onPress={handleGitHubUnlink}
                    isLoading={isUnlinking}
                  >
                    Putuskan Hubungan
                  </Button>
                ) : (
                  <Button
                    color="primary"
                    startContent={<Link size={16} />}
                    onPress={handleGitHubLink}
                  >
                    Hubungkan GitHub
                  </Button>
                )}
              </div>

              {!githubStatus?.linked && (
                <div className="bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg p-3">
                  <p className="text-sm text-warning-700 dark:text-warning-300">
                    <strong>Penting:</strong> Anda perlu menghubungkan akun GitHub untuk dapat membuat project dan menggunakan fitur review code.
                  </p>
                </div>
              )}
            </CardBody>
          </Card>
        </motion.div>
      )}

      {/* Save Button */}
      <motion.div variants={itemVariants} className="flex justify-end pb-4">
        <Button
          color="primary"
          startContent={<Save size={18} />}
          onPress={handleSave}
          isLoading={isSaving}
          isDisabled={isLoadingPrefs}
        >
          Simpan Pengaturan
        </Button>
      </motion.div>

      {/* Confirm Dialog */}
      <ConfirmDialog />
    </motion.div>
  );
}
