'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Card,
  CardBody,
  Input,
  Textarea,
  Button,
  Select,
  SelectItem,
  Divider,
  Chip,
  Avatar,
  Progress,
  Tooltip,
  Autocomplete,
  AutocompleteItem,
  Switch,
  RadioGroup,
  Radio,
  Spinner,
} from '@heroui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Github,
  Save,
  Link as LinkIcon,
  AlertCircle,
  CheckCircle2,
  Users,
  Code2,
  FileText,
  Eye,
  EyeOff,
  Lightbulb,
  Sparkles,
  Tag,
  Calendar,
  Search,
  Info,
  Rocket,
  Target,
  BookOpen,
  Database,
  Globe,
  Smartphone,
  Monitor,
  Server,
  Brain,
  Shield,
  Zap,
  Clock,
  Star,
  FolderGit2,
  Settings,
  Trash2,
  ChevronRight,
  ChevronDown,
  Check,
  AlertTriangle,
  X,
  Plus,
} from 'lucide-react';
import Link from 'next/link';
import { GitHubRepoSelector } from '@/components/github/repo-selector';
import TeamMembersNimNew from '@/components/mahasiswa/team-members-nim-new';

interface Semester {
  id: string;
  name: string;
  tahunAkademik: string;
}

interface SelectedRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  language?: string | null;
  stargazers_count?: number;
  forks_count?: number;
  updated_at?: string;
}

interface PendingMember {
  id: string;
  name: string;
  nim: string;
  prodi?: string;
  image?: string;
  githubUsername: string;
}

// Project categories with icons
const PROJECT_CATEGORIES = [
  { key: 'web', label: 'Web Application', icon: Globe, color: 'from-blue-500 to-blue-600' },
  { key: 'mobile', label: 'Mobile App', icon: Smartphone, color: 'from-purple-500 to-purple-600' },
  { key: 'desktop', label: 'Desktop App', icon: Monitor, color: 'from-green-500 to-green-600' },
  { key: 'backend', label: 'Backend/API', icon: Server, color: 'from-orange-500 to-orange-600' },
  { key: 'ai-ml', label: 'AI / ML', icon: Brain, color: 'from-pink-500 to-pink-600' },
  { key: 'iot', label: 'IoT', icon: Zap, color: 'from-yellow-500 to-yellow-600' },
  { key: 'security', label: 'Security', icon: Shield, color: 'from-red-500 to-red-600' },
  { key: 'data', label: 'Data Science', icon: Database, color: 'from-cyan-500 to-cyan-600' },
];

// Popular technologies grouped
const TECH_GROUPS = {
  'Frontend': ['React', 'Next.js', 'Vue.js', 'Angular', 'Svelte', 'Tailwind CSS', 'TypeScript'],
  'Backend': ['Node.js', 'Express', 'NestJS', 'Django', 'FastAPI', 'Laravel', 'Spring Boot', 'Go'],
  'Mobile': ['React Native', 'Flutter', 'Swift', 'Kotlin'],
  'Database': ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Firebase', 'Supabase'],
  'DevOps': ['Docker', 'Kubernetes', 'AWS', 'GCP', 'Vercel'],
  'AI/ML': ['Python', 'TensorFlow', 'PyTorch', 'OpenAI API'],
};

const ALL_TECHNOLOGIES = Object.values(TECH_GROUPS).flat();

// Section Header Component
const SectionHeader = ({ icon: Icon, title, subtitle, action }: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 text-primary">
        <Icon size={18} />
      </div>
      <div>
        <h3 className="font-semibold text-foreground">{title}</h3>
        {subtitle && <p className="text-xs text-default-400">{subtitle}</p>}
      </div>
    </div>
    {action}
  </div>
);

export default function NewProjectPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [isRepoSelectorOpen, setIsRepoSelectorOpen] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<SelectedRepo | null>(null);
  const [selectedTechs, setSelectedTechs] = useState<string[]>([]);
  const [pendingTeamMembers, setPendingTeamMembers] = useState<PendingMember[]>([]);
  const [showPreview, setShowPreview] = useState(true);
  const [isPublic, setIsPublic] = useState(true);
  const [techSearch, setTechSearch] = useState('');
  const [showOptional, setShowOptional] = useState(false);

  // GitHub status - fetched from API to ensure accuracy (session might be stale)
  const [githubStatus, setGithubStatus] = useState<{
    isConnected: boolean;
    username: string | null;
    isLoading: boolean;
  }>({ isConnected: false, username: null, isLoading: true });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    githubRepoUrl: '',
    githubRepoName: '',
    semester: '',
    tahunAkademik: '',
    category: '',
    objectives: '',
    methodology: '',
    expectedOutcome: '',
  });

  // Fetch GitHub status from API (session might be stale after linking GitHub)
  useEffect(() => {
    const fetchGitHubStatus = async () => {
      try {
        const response = await fetch('/api/profile');
        if (response.ok) {
          const data = await response.json();
          setGithubStatus({
            isConnected: !!data.githubUsername,
            username: data.githubUsername,
            isLoading: false,
          });
        } else {
          setGithubStatus(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setGithubStatus(prev => ({ ...prev, isLoading: false }));
      }
    };
    fetchGitHubStatus();
  }, []);

  // Use API data for GitHub status (more reliable than session)
  const hasGitHubConnected = githubStatus.isConnected;
  const githubUsername = githubStatus.username;

  // Calculate form completion
  const formCompletion = useMemo(() => {
    const fields = [
      { name: 'Judul', filled: formData.title.length >= 5 },
      { name: 'Deskripsi', filled: formData.description.length >= 20 },
      { name: 'Semester', filled: !!formData.semester },
      { name: 'Kategori', filled: !!formData.category },
      { name: 'Teknologi', filled: selectedTechs.length > 0 },
      { name: 'Tujuan', filled: formData.objectives.length > 0 },
      { name: 'GitHub', filled: !!(formData.githubRepoUrl || selectedRepo) },
    ];

    const filledCount = fields.filter(f => f.filled).length;
    const percentage = Math.round((filledCount / fields.length) * 100);

    return { fields, filledCount, total: fields.length, percentage };
  }, [formData, selectedTechs, selectedRepo]);

  // Form validation
  const isFormValid = useMemo(() => {
    return formData.title.length >= 5 &&
      formData.description.length >= 20 &&
      formData.semester &&
      formData.category;
  }, [formData]);

  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        const response = await fetch('/api/semesters?active=true');
        if (response.ok) {
          const data = await response.json();
          setSemesters(data);
          const activeSemester = data.find((s: Semester & { isActive: boolean }) => s.isActive);
          if (activeSemester) {
            setFormData((prev) => ({
              ...prev,
              semester: activeSemester.name,
              tahunAkademik: activeSemester.tahunAkademik,
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching semesters:', error);
      }
    };
    fetchSemesters();
  }, []);

  const handleRepoSelect = (repo: SelectedRepo) => {
    setSelectedRepo(repo);
    setFormData((prev) => ({
      ...prev,
      githubRepoUrl: repo.html_url,
      githubRepoName: repo.full_name,
      description: prev.description || repo.description || '',
    }));
    if (repo.language && !selectedTechs.includes(repo.language)) {
      setSelectedTechs(prev => [...prev, repo.language!]);
    }
  };

  const handleRemoveRepo = () => {
    setSelectedRepo(null);
    setFormData((prev) => ({ ...prev, githubRepoUrl: '', githubRepoName: '' }));
  };

  const handleAddTech = (tech: string) => {
    if (tech && !selectedTechs.includes(tech)) {
      setSelectedTechs([...selectedTechs, tech]);
      setTechSearch('');
    }
  };

  const handleRemoveTech = (tech: string) => {
    setSelectedTechs(selectedTechs.filter(t => t !== tech));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          technologies: selectedTechs,
          pendingTeamMembers: pendingTeamMembers,
          isPublic,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Gagal membuat project');

      router.push(`/mahasiswa/projects/${data.project.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  };

  const defaultSemesters = [
    { name: 'Ganjil 2024/2025', tahunAkademik: '2024/2025' },
    { name: 'Genap 2024/2025', tahunAkademik: '2024/2025' },
    { name: 'Ganjil 2025/2026', tahunAkademik: '2025/2026' },
  ];

  const semesterOptions = semesters.length > 0 ? semesters : defaultSemesters;

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Button
            as={Link}
            href="/mahasiswa/projects"
            variant="light"
            isIconOnly
            radius="full"
            size="sm"
          >
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Rocket className="text-primary" size={22} />
              Buat Project Baru
            </h1>
            <p className="text-xs text-default-400">
              Lengkapi informasi untuk memulai project capstone
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Progress Indicator */}
          <Tooltip content={`${formCompletion.filledCount}/${formCompletion.total} field terisi`}>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-full border transition-all duration-300 ${formCompletion.percentage === 100
              ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30'
              : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700'
              }`}>
              {/* Progress Circle */}
              <div className="relative w-7 h-7">
                <svg className="w-7 h-7 -rotate-90" viewBox="0 0 28 28">
                  <circle
                    cx="14"
                    cy="14"
                    r="10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-zinc-200 dark:text-zinc-700"
                  />
                  <circle
                    cx="14"
                    cy="14"
                    r="10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={62.8}
                    strokeDashoffset={62.8 - (62.8 * formCompletion.percentage) / 100}
                    className={`transition-all duration-500 ${formCompletion.percentage === 100 ? 'text-emerald-500' : 'text-blue-500'
                      }`}
                  />
                </svg>
              </div>
              {/* Percentage Text */}
              <span className={`text-xs font-bold min-w-[32px] text-center ${formCompletion.percentage === 100
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-zinc-700 dark:text-zinc-300'
                }`}>
                {formCompletion.percentage}%
              </span>
            </div>
          </Tooltip>

          {/* Preview Toggle */}
          <Tooltip content={showPreview ? 'Sembunyikan Preview' : 'Tampilkan Preview'}>
            <Button
              variant="flat"
              size="sm"
              isIconOnly
              radius="full"
              onPress={() => setShowPreview(!showPreview)}
              className={`w-10 h-10 ${showPreview ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}
            >
              {showPreview ? <Eye size={18} /> : <EyeOff size={18} />}
            </Button>
          </Tooltip>

          {/* Save Button */}
          <Button
            color="primary"
            size="sm"
            startContent={!isLoading && <Save size={16} />}
            isLoading={isLoading}
            isDisabled={!isFormValid}
            onPress={handleSubmit}
            className="font-semibold px-5 h-10 rounded-full shadow-md shadow-blue-500/20"
          >
            Simpan
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 bg-danger-50 text-danger border border-danger-100 rounded-lg p-3 flex items-center gap-2 text-sm"
          >
            <AlertCircle size={16} />
            <span className="flex-1">{error}</span>
            <Button size="sm" variant="light" color="danger" isIconOnly onPress={() => setError('')}>
              <X size={14} />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column - Main Form */}
        <div className={`space-y-5 ${showPreview ? 'lg:col-span-8' : 'lg:col-span-12'}`}>

          {/* Card 1: Basic Info */}
          <Card className="border border-default-100 shadow-sm">
            <CardBody className="p-5">
              <SectionHeader
                icon={FileText}
                title="Informasi Dasar"
                subtitle="Detail utama project"
              />

              <div className="space-y-4">
                {/* Title */}
                <Input
                  label="Judul Project"
                  labelPlacement="outside"
                  placeholder="Contoh: Sistem Monitoring IoT untuk Smart Agriculture"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  isRequired
                  variant="bordered"
                  classNames={{
                    label: 'text-sm font-medium',
                    inputWrapper: 'border-default-200 hover:border-primary data-[focused=true]:border-primary',
                  }}
                  startContent={<Sparkles size={16} className="text-default-400" />}
                  endContent={
                    formData.title.length >= 5 && <CheckCircle2 size={16} className="text-success" />
                  }
                  description={
                    <span className={formData.title.length < 5 ? 'text-warning-500' : 'text-success-500'}>
                      {formData.title.length}/100 karakter (min. 5)
                    </span>
                  }
                />

                {/* Description */}
                <Textarea
                  label="Deskripsi Project"
                  labelPlacement="outside"
                  placeholder="Jelaskan latar belakang masalah, solusi yang ditawarkan, dan manfaat project..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  minRows={3}
                  maxRows={6}
                  isRequired
                  variant="bordered"
                  classNames={{
                    label: 'text-sm font-medium',
                    inputWrapper: 'border-default-200 hover:border-primary data-[focused=true]:border-primary',
                  }}
                  description={
                    <span className={formData.description.length < 20 ? 'text-warning-500' : 'text-success-500'}>
                      {formData.description.length}/1000 karakter (min. 20)
                    </span>
                  }
                />

                {/* Semester & Academic Year Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">
                      Semester <span className="text-danger">*</span>
                    </label>
                    <Select
                      placeholder="Pilih semester"
                      selectedKeys={formData.semester ? [formData.semester] : []}
                      onChange={(e) => {
                        const selected = semesterOptions.find((s) => s.name === e.target.value);
                        setFormData({
                          ...formData,
                          semester: e.target.value,
                          tahunAkademik: selected?.tahunAkademik || '',
                        });
                      }}
                      variant="bordered"
                      classNames={{
                        trigger: 'border-default-200 hover:border-primary data-[open=true]:border-primary h-10',
                      }}
                      startContent={<Calendar size={14} className="text-default-400" />}
                      aria-label="Pilih Semester"
                    >
                      {semesterOptions.map((sem) => (
                        <SelectItem key={sem.name}>{sem.name}</SelectItem>
                      ))}
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">
                      Tahun Akademik
                    </label>
                    <Input
                      placeholder="Otomatis"
                      value={formData.tahunAkademik}
                      isReadOnly
                      variant="bordered"
                      classNames={{
                        inputWrapper: 'bg-default-50 border-default-200 h-10',
                      }}
                      startContent={<BookOpen size={14} className="text-default-400" />}
                      aria-label="Tahun Akademik"
                    />
                  </div>
                </div>

                {/* Objectives */}
                <Textarea
                  label="Tujuan Project"
                  labelPlacement="outside"
                  placeholder="Apa yang ingin dicapai dengan project ini?"
                  value={formData.objectives}
                  onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                  minRows={2}
                  variant="bordered"
                  classNames={{
                    label: 'text-sm font-medium',
                    inputWrapper: 'border-default-200 hover:border-primary data-[focused=true]:border-primary',
                  }}
                  startContent={<Target size={14} className="text-default-400 mt-2" />}
                />

                {/* Visibility Toggle */}
                <div className="flex items-center justify-between p-3 bg-default-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    {isPublic ? <Globe size={16} className="text-primary" /> : <Shield size={16} className="text-warning" />}
                    <div>
                      <p className="text-sm font-medium">{isPublic ? 'Project Publik' : 'Project Privat'}</p>
                      <p className="text-xs text-default-400">
                        {isPublic ? 'Dapat dilihat semua user' : 'Hanya Anda dan dosen'}
                      </p>
                    </div>
                  </div>
                  <Switch
                    size="sm"
                    isSelected={isPublic}
                    onValueChange={setIsPublic}
                  />
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Card 2: Category & Tech */}
          <Card className="border border-default-100 shadow-sm">
            <CardBody className="p-5">
              <SectionHeader
                icon={Tag}
                title="Kategori & Teknologi"
                subtitle="Jenis dan tech stack"
                action={
                  <Chip size="sm" variant="flat" color="primary">
                    {selectedTechs.length} tech
                  </Chip>
                }
              />

              <div className="space-y-5">
                {/* Category Grid */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Kategori Project <span className="text-danger">*</span>
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {PROJECT_CATEGORIES.map((cat) => {
                      const Icon = cat.icon;
                      const isSelected = formData.category === cat.key;
                      return (
                        <Tooltip key={cat.key} content={cat.label}>
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setFormData({ ...formData, category: cat.key })}
                            className={`
                              relative p-2.5 rounded-xl transition-all duration-200 flex flex-col items-center gap-1
                              ${isSelected
                                ? 'bg-primary/10 ring-2 ring-primary ring-offset-1'
                                : 'bg-default-50 hover:bg-default-100 border border-default-200'
                              }
                            `}
                          >
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center shadow-sm"
                              >
                                <Check size={10} className="text-white" />
                              </motion.div>
                            )}
                            <div className={`p-1.5 rounded-lg bg-gradient-to-br ${cat.color} text-white`}>
                              <Icon size={16} />
                            </div>
                            <span className="text-[10px] font-medium text-center leading-tight truncate w-full">
                              {cat.label.split(' ')[0]}
                            </span>
                          </motion.button>
                        </Tooltip>
                      );
                    })}
                  </div>
                </div>

                <Divider className="my-2" />

                {/* Technology Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Code2 size={14} />
                    Teknologi <span className="text-danger">*</span>
                  </label>

                  <Autocomplete
                    placeholder="Cari teknologi..."
                    size="sm"
                    variant="bordered"
                    startContent={<Search size={14} className="text-default-400" />}
                    inputValue={techSearch}
                    onInputChange={setTechSearch}
                    onSelectionChange={(key) => {
                      if (key) handleAddTech(key.toString());
                    }}
                    classNames={{
                      base: 'mb-3',
                    }}
                  >
                    {ALL_TECHNOLOGIES.filter(t =>
                      !selectedTechs.includes(t) &&
                      t.toLowerCase().includes(techSearch.toLowerCase())
                    ).map((tech) => (
                      <AutocompleteItem key={tech}>{tech}</AutocompleteItem>
                    ))}
                  </Autocomplete>

                  {/* Selected Techs */}
                  <div className="flex flex-wrap gap-1.5 min-h-[40px] p-2.5 bg-default-50 rounded-lg border border-dashed border-default-200">
                    {selectedTechs.length === 0 ? (
                      <div className="flex items-center gap-1.5 text-default-400 text-xs">
                        <Info size={12} />
                        Pilih minimal 1 teknologi
                      </div>
                    ) : (
                      <AnimatePresence>
                        {selectedTechs.map((tech) => (
                          <motion.div
                            key={tech}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                          >
                            <Chip
                              size="sm"
                              variant="flat"
                              color="primary"
                              onClose={() => handleRemoveTech(tech)}
                              classNames={{ base: 'h-6' }}
                            >
                              {tech}
                            </Chip>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    )}
                  </div>

                  {/* Quick Add Buttons */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {['React', 'Next.js', 'Node.js', 'Python', 'TypeScript', 'PostgreSQL'].map((tech) => (
                      <Button
                        key={tech}
                        size="sm"
                        variant="bordered"
                        radius="full"
                        className="h-6 text-[10px] px-2 border-default-200"
                        isDisabled={selectedTechs.includes(tech)}
                        onPress={() => handleAddTech(tech)}
                        startContent={<Plus size={10} />}
                      >
                        {tech}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Card 3: GitHub & Team - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* GitHub Repository */}
            <Card className="border border-default-100 shadow-sm">
              <CardBody className="p-5">
                <SectionHeader
                  icon={Github}
                  title="Repository GitHub"
                  action={
                    githubStatus.isLoading ? (
                      <Chip size="sm" variant="flat" classNames={{ base: 'h-5' }}>
                        <Spinner size="sm" className="w-3 h-3 mr-1" />
                        Memuat...
                      </Chip>
                    ) : hasGitHubConnected ? (
                      <Chip size="sm" variant="dot" color="success" classNames={{ base: 'h-5' }}>
                        @{githubUsername}
                      </Chip>
                    ) : null
                  }
                />

                {githubStatus.isLoading ? (
                  <div className="flex items-center justify-center p-6">
                    <Spinner size="sm" />
                    <span className="ml-2 text-sm text-default-400">Memeriksa status GitHub...</span>
                  </div>
                ) : !hasGitHubConnected ? (
                  <div className="p-3 bg-warning-50 rounded-lg border border-warning-100">
                    <div className="flex items-start gap-2">
                      <AlertTriangle size={16} className="text-warning shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-warning-700">GitHub Belum Terhubung</p>
                        <p className="text-xs text-warning-600 mb-2">Hubungkan akun GitHub Anda di pengaturan untuk memilih repository</p>
                        <Button
                          as={Link}
                          href="/mahasiswa/settings"
                          size="sm"
                          color="warning"
                          variant="flat"
                          startContent={<Github size={12} />}
                        >
                          Hubungkan GitHub
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : selectedRepo ? (
                  <div className="p-3 bg-success-50 rounded-lg border border-success-100">
                    <div className="flex items-start gap-2">
                      <div className="p-1.5 bg-success-100 rounded-md">
                        <FolderGit2 size={16} className="text-success-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{selectedRepo.name}</p>
                        <p className="text-xs text-default-500 truncate">{selectedRepo.full_name}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-default-400">
                          {selectedRepo.language && (
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-primary" />
                              {selectedRepo.language}
                            </span>
                          )}
                          {selectedRepo.stargazers_count !== undefined && (
                            <span className="flex items-center gap-0.5">
                              <Star size={10} />
                              {selectedRepo.stargazers_count}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="light" isIconOnly onPress={() => setIsRepoSelectorOpen(true)}>
                          <Settings size={12} />
                        </Button>
                        <Button size="sm" variant="light" color="danger" isIconOnly onPress={handleRemoveRepo}>
                          <Trash2 size={12} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Button
                      variant="bordered"
                      className="w-full h-14 border-dashed border-default-300"
                      startContent={<FolderGit2 size={18} />}
                      onPress={() => setIsRepoSelectorOpen(true)}
                    >
                      <div className="text-left">
                        <p className="font-medium text-sm">Pilih Repository</p>
                        <p className="text-xs text-default-400">dari akun GitHub Anda</p>
                      </div>
                    </Button>

                    <div className="relative">
                      <Divider />
                      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-default-300">
                        atau
                      </span>
                    </div>

                    <Input
                      size="sm"
                      variant="bordered"
                      placeholder="https://github.com/user/repo"
                      value={formData.githubRepoUrl}
                      onChange={(e) => setFormData({ ...formData, githubRepoUrl: e.target.value })}
                      startContent={<LinkIcon size={12} className="text-default-400" />}
                    />
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Team Members */}
            <TeamMembersNimNew
              pendingMembers={pendingTeamMembers}
              onPendingMembersChange={setPendingTeamMembers}
              ownerGithubUsername={githubUsername ?? undefined}
              ownerName={session?.user?.name || ''}
              ownerImage={session?.user?.image || ''}
              ownerNim={(session?.user as { nim?: string })?.nim}
              maxMembers={3}
              isEditable={true}
            />
          </div>

          {/* Card 4: Optional Fields (Collapsible) */}
          <Card className="border border-default-100 shadow-sm">
            <CardBody className="p-0">
              <button
                onClick={() => setShowOptional(!showOptional)}
                className="w-full p-5 flex items-center justify-between hover:bg-default-50 transition-colors rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-default-100 text-default-500">
                    <Settings size={18} />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-sm">Pengaturan Tambahan</p>
                    <p className="text-xs text-default-400 mt-0.5">Metodologi & Output (Opsional)</p>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: showOptional ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={18} className="text-default-400" />
                </motion.div>
              </button>

              <AnimatePresence>
                {showOptional && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-6 pt-4 border-t border-default-100">
                      <div className="grid gap-6">
                        {/* Methodology */}
                        <Textarea
                          label="Metodologi Pengembangan"
                          labelPlacement="outside"
                          placeholder="Jelaskan metodologi yang akan digunakan dalam pengembangan project ini. Contoh: Agile/Scrum, Waterfall, Prototype, RAD, dll..."
                          value={formData.methodology}
                          onChange={(e) => setFormData({ ...formData, methodology: e.target.value })}
                          minRows={3}
                          variant="bordered"
                          classNames={{
                            label: 'text-sm font-medium mb-2',
                            inputWrapper: 'border-default-200 hover:border-primary focus-within:border-primary',
                            input: 'placeholder:text-default-300',
                          }}
                        />

                        {/* Expected Outcome */}
                        <Textarea
                          label="Output yang Diharapkan"
                          labelPlacement="outside"
                          placeholder="Jelaskan output/deliverable yang diharapkan dari project ini..."
                          value={formData.expectedOutcome}
                          onChange={(e) => setFormData({ ...formData, expectedOutcome: e.target.value })}
                          minRows={3}
                          variant="bordered"
                          classNames={{
                            label: 'text-sm font-medium mb-2',
                            inputWrapper: 'border-default-200 hover:border-primary focus-within:border-primary',
                            input: 'placeholder:text-default-300',
                          }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardBody>
          </Card>
        </div>

        {/* Right Column - Preview & Checklist */}
        <AnimatePresence>
          {showPreview && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="lg:col-span-4"
            >
              <div className="sticky top-20 space-y-4">
                {/* Live Preview Card - Clean Design */}
                <Card className="border border-zinc-200 dark:border-zinc-800 shadow-lg bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden">
                  <CardBody className="p-5 space-y-4">
                    {/* Header: Category + Title */}
                    <div className="space-y-3">
                      {/* Category Badge */}
                      {formData.category ? (
                        (() => {
                          const cat = PROJECT_CATEGORIES.find(c => c.key === formData.category);
                          if (cat) {
                            const Icon = cat.icon;
                            return (
                              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r ${cat.color} text-white text-xs font-medium`}>
                                <Icon size={12} />
                                <span>{cat.label}</span>
                              </div>
                            );
                          }
                          return null;
                        })()
                      ) : (
                        <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 text-xs">
                          Pilih Kategori
                        </div>
                      )}

                      {/* Project Title */}
                      <h3 className="font-bold text-lg text-zinc-900 dark:text-white leading-snug">
                        {formData.title || 'Judul Project Anda'}
                      </h3>

                      {/* Semester Info */}
                      <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                        <Calendar size={14} />
                        <span>{formData.semester || 'Ganjil 2025/2026'}</span>
                        <span className="text-zinc-300 dark:text-zinc-600">•</span>
                        <span>{formData.tahunAkademik || '2025/2026'}</span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                      {formData.description || 'Deskripsi project akan ditampilkan di sini...'}
                    </p>

                    {/* Tech Stack */}
                    {selectedTechs.length === 0 ? (
                      <p className="text-xs text-zinc-400 italic">Belum ada teknologi dipilih</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedTechs.slice(0, 4).map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-medium"
                          >
                            {tech}
                          </span>
                        ))}
                        {selectedTechs.length > 4 && (
                          <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-xs">
                            +{selectedTechs.length - 4}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Divider */}
                    <div className="border-t border-zinc-100 dark:border-zinc-800" />

                    {/* Stats Row */}
                    <div className="grid grid-cols-4 gap-2">
                      <div className="text-center p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                        <Users size={16} className="mx-auto mb-1 text-blue-500" />
                        <p className="text-sm font-semibold text-zinc-900 dark:text-white">{pendingTeamMembers.length + 1}</p>
                        <p className="text-[10px] text-zinc-400">Tim</p>
                      </div>
                      <div className="text-center p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                        <Github size={16} className={`mx-auto mb-1 ${(selectedRepo || formData.githubRepoUrl) ? 'text-emerald-500' : 'text-zinc-400'}`} />
                        <p className="text-sm font-semibold text-zinc-900 dark:text-white">{(selectedRepo || formData.githubRepoUrl) ? 'Yes' : 'No'}</p>
                        <p className="text-[10px] text-zinc-400">Repo</p>
                      </div>
                      <div className="text-center p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                        {isPublic ? <Globe size={16} className="mx-auto mb-1 text-blue-500" /> : <Shield size={16} className="mx-auto mb-1 text-amber-500" />}
                        <p className="text-sm font-semibold text-zinc-900 dark:text-white">{isPublic ? 'Public' : 'Private'}</p>
                        <p className="text-[10px] text-zinc-400">Access</p>
                      </div>
                      <div className="text-center p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                        <Clock size={16} className="mx-auto mb-1 text-amber-500" />
                        <p className="text-sm font-semibold text-zinc-900 dark:text-white">Draft</p>
                        <p className="text-[10px] text-zinc-400">Status</p>
                      </div>
                    </div>

                    {/* Author Section */}
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                      <div className="relative">
                        <Avatar
                          src={session?.user?.image || ''}
                          name={session?.user?.name || ''}
                          size="sm"
                          className="w-10 h-10"
                        />
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-zinc-900 flex items-center justify-center">
                          <Check size={8} className="text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-zinc-900 dark:text-white truncate">{session?.user?.name || 'Your Name'}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          Ketua Tim • Project Owner
                        </p>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* Checklist Card - Enhanced */}
                <Card className="border border-default-100 shadow-sm overflow-hidden">
                  <div className="p-4 bg-gradient-to-r from-success-50/50 to-transparent">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-success/10">
                          <CheckCircle2 size={14} className="text-success" />
                        </div>
                        <span className="font-semibold text-sm">Progress</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-success">{formCompletion.percentage}%</span>
                      </div>
                    </div>
                  </div>
                  <CardBody className="p-4 pt-2">
                    <Progress
                      value={formCompletion.percentage}
                      color={formCompletion.percentage === 100 ? 'success' : 'primary'}
                      size="md"
                      className="mb-4"
                      classNames={{
                        track: 'h-2',
                        indicator: formCompletion.percentage === 100
                          ? 'bg-gradient-to-r from-success to-success-400'
                          : 'bg-gradient-to-r from-primary to-secondary'
                      }}
                    />
                    <div className="space-y-1">
                      {formCompletion.fields.map((field, index) => (
                        <motion.div
                          key={field.name}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg transition-all duration-300 ${field.filled
                            ? 'bg-success-50 border border-success-100'
                            : 'bg-default-50 border border-transparent hover:border-default-200'
                            }`}
                        >
                          <span className={`font-medium ${field.filled ? 'text-success-700' : 'text-default-500'}`}>
                            {field.name}
                          </span>
                          {field.filled ? (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 500 }}
                            >
                              <CheckCircle2 size={14} className="text-success" />
                            </motion.div>
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-default-300 border-dashed" />
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </CardBody>
                </Card>

                {/* Tips Card - Enhanced */}
                <Card className="border-0 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 via-orange-400/20 to-amber-500/20" />
                  <CardBody className="p-4 relative">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 rounded-lg bg-amber-500/20">
                        <Lightbulb size={14} className="text-amber-600" />
                      </div>
                      <span className="font-semibold text-sm text-amber-800 dark:text-amber-200">Pro Tips</span>
                    </div>
                    <ul className="space-y-2">
                      {[
                        'Judul spesifik memudahkan pencarian',
                        'Deskripsi lengkap bantu reviewer',
                        'Hubungkan GitHub untuk code review'
                      ].map((tip, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + index * 0.1 }}
                          className="flex items-start gap-2 text-[11px] text-amber-900/80 dark:text-amber-100/80"
                        >
                          <ChevronRight size={12} className="mt-0.5 text-amber-500 shrink-0" />
                          <span>{tip}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </CardBody>
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* GitHub Repository Selector Modal */}
      <GitHubRepoSelector
        isOpen={isRepoSelectorOpen}
        onClose={() => setIsRepoSelectorOpen(false)}
        onSelect={handleRepoSelect}
        selectedRepoUrl={formData.githubRepoUrl}
      />
    </div>
  );
}
