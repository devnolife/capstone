'use client';

import { useState } from 'react';
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
} from 'lucide-react';

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

export function SettingsContent({ role }: SettingsContentProps) {
  const { theme, setTheme } = useTheme();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [reviewReminders, setReviewReminders] = useState(true);
  const [projectUpdates, setProjectUpdates] = useState(true);
  const [language, setLanguage] = useState('id');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    // In a real app, this would save to the backend
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <motion.div
      className="max-w-3xl mx-auto space-y-4 md:space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
          <Settings size={24} />
          Pengaturan
        </h1>
        <p className="text-sm md:text-base text-default-500">
          Sesuaikan preferensi aplikasi Anda
        </p>
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
