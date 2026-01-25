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
  const [isSaved, setIsSaved] = useState(false);

  // GitHub linking state
  const [githubStatus, setGithubStatus] = useState<GitHubLinkStatus | null>(null);
  const [isLoadingGithub, setIsLoadingGithub] = useState(true);
  const [isUnlinking, setIsUnlinking] = useState(false);

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

    console.log('[GITHUB] Redirect URI:', redirectUri);
    console.log('[GITHUB] Auth URL:', authUrl);

    window.location.href = authUrl;
  };

  const handleGitHubUnlink = async () => {
    if (!confirm('Apakah Anda yakin ingin memutuskan hubungan dengan akun GitHub? Fitur review code tidak akan tersedia.')) {
      return;
    }

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

  const handleSave = () => {
    // In a real app, this would save to the backend
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <motion.div
      className="w-full space-y-4 md:space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header - Soft Colored */}
      <motion.div variants={itemVariants}>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-50 via-slate-50 to-gray-50 dark:from-zinc-950/40 dark:via-slate-950/30 dark:to-gray-950/40 border border-zinc-200/50 dark:border-zinc-800/30 p-6 md:p-8">
          {/* Subtle Background Accents */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-zinc-400/20 to-slate-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-gray-400/15 to-zinc-400/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
          
          <div className="relative flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-zinc-600 to-slate-700 text-white shadow-lg shadow-zinc-500/25">
              <Settings size={28} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-zinc-800 dark:text-zinc-100">Pengaturan</h1>
              <p className="text-sm md:text-base text-zinc-600/70 dark:text-zinc-400/60">
                Sesuaikan preferensi aplikasi Anda
              </p>
            </div>
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
        <Card>
          <CardHeader className="pb-0">
            <h3 className="font-semibold flex items-center gap-2">
              <Palette size={18} />
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
        <Card>
          <CardHeader className="pb-0">
            <h3 className="font-semibold flex items-center gap-2">
              <Bell size={18} />
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
        <Card>
          <CardHeader className="pb-0">
            <h3 className="font-semibold flex items-center gap-2">
              <Shield size={18} />
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
              <Switch defaultSelected color="primary" />
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
                  <Switch defaultSelected color="primary" />
                </div>
              </>
            )}
          </CardBody>
        </Card>
      </motion.div>

      {/* GitHub Integration - Only for Mahasiswa */}
      {role === 'mahasiswa' && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-0">
              <h3 className="font-semibold flex items-center gap-2">
                <Github size={18} />
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
        >
          Simpan Pengaturan
        </Button>
      </motion.div>
    </motion.div>
  );
}
