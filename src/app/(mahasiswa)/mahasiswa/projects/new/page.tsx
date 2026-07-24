'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
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
  Loader2,
  ExternalLink,
  User,
  KeyRound,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { GitHubRepoSelector } from '@/components/github/repo-selector';
import TeamMembersNimNew from '@/components/mahasiswa/team-members-nim-new';
import ConsentFileUpload from '@/components/mahasiswa/consent-file-upload';
import { PageHeader } from '@/components/caret/PageHeader';

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
  { key: 'web', label: 'Web Application', icon: Globe },
  { key: 'mobile', label: 'Mobile App', icon: Smartphone },
  { key: 'desktop', label: 'Desktop App', icon: Monitor },
  { key: 'backend', label: 'Backend/API', icon: Server },
  { key: 'ai-ml', label: 'AI / ML', icon: Brain },
  { key: 'iot', label: 'IoT', icon: Zap },
  { key: 'security', label: 'Security', icon: Shield },
  { key: 'data', label: 'Data Science', icon: Database },
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
      <div className="bg-app-primary text-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
        <Icon size={16} />
      </div>
      <div>
        <h3 className="font-semibold text-foreground">{title}</h3>
        {subtitle && <p className="text-xs text-app-teritary-invert">{subtitle}</p>}
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

  // Consent document state
  const [consentDocument, setConsentDocument] = useState<{
    fileName: string;
    fileKey?: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
  } | null>(null);

  // URL Validation state
  const [urlValidation, setUrlValidation] = useState<{
    status: 'idle' | 'checking' | 'valid' | 'invalid';
    message?: string;
    responseTime?: number;
  }>({ status: 'idle' });

  // Testing credentials state
  const [testingCredentials, setTestingCredentials] = useState({
    username: '',
    password: '',
    notes: '',
  });

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
    productionUrl: '',
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
      { name: 'URL Production', filled: formData.productionUrl.length > 0 },
      { name: 'Surat Persetujuan', filled: !!consentDocument },
    ];

    const filledCount = fields.filter(f => f.filled).length;
    const percentage = Math.round((filledCount / fields.length) * 100);

    return { fields, filledCount, total: fields.length, percentage };
  }, [formData, selectedTechs, selectedRepo, consentDocument]);

  // Form validation
  const isFormValid = useMemo(() => {
    return formData.title.length >= 5 &&
      formData.description.length >= 20 &&
      formData.semester &&
      formData.category &&
      formData.productionUrl.length > 0 &&
      !!consentDocument;
  }, [formData, consentDocument]);

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

  // Validate Production URL
  const validateProductionUrl = useCallback(async (url: string) => {
    if (!url) {
      setUrlValidation({ status: 'idle' });
      return;
    }

    // Basic URL format check
    const urlPattern = /^https?:\/\/.+\..+/;
    if (!urlPattern.test(url)) {
      setUrlValidation({ status: 'idle' });
      return;
    }

    setUrlValidation({ status: 'checking' });

    try {
      const response = await fetch('/api/validate-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (data.valid) {
        setUrlValidation({
          status: 'valid',
          message: `URL aktif (${data.responseTime}ms)`,
          responseTime: data.responseTime,
        });
      } else {
        setUrlValidation({
          status: 'invalid',
          message: data.error || 'URL tidak dapat diakses',
        });
      }
    } catch {
      setUrlValidation({
        status: 'invalid',
        message: 'Gagal memeriksa URL',
      });
    }
  }, []);

  // Auto-validate URL with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      validateProductionUrl(formData.productionUrl);
    }, 800); // 800ms debounce

    return () => clearTimeout(timeoutId);
  }, [formData.productionUrl, validateProductionUrl]);

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
          testingUsername: testingCredentials.username || null,
          testingPassword: testingCredentials.password || null,
          testingNotes: testingCredentials.notes || null,
          consentDocument: consentDocument,
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
      <div className="mb-6">
        <PageHeader
          label="[01] PROJECT"
          labelRight="/ BARU"
          title="Buat project baru"
          description="Lengkapi informasi untuk memulai project capstone."
          actions={
            <div className="flex items-center gap-2">
              <Link
                href="/mahasiswa/projects"
                title="Kembali ke daftar project"
                className="border-input bg-input/30 text-app-secondary-invert hover:bg-input/50 hover:text-foreground flex size-9 items-center justify-center rounded-full border transition-all active:scale-[0.98]"
              >
                <ArrowLeft size={16} />
              </Link>

              {/* Progress Indicator */}
              <Tooltip content={`${formCompletion.filledCount}/${formCompletion.total} field terisi`}>
                <div className={`flex items-center gap-2 px-3 py-2 rounded-full border transition-all duration-300 ${formCompletion.percentage === 100
                  ? 'border-success/40 bg-success/10'
                  : 'border-zinc-800 bg-app-quinary'
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
                        className="text-zinc-800"
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
                        className={`transition-all duration-500 ${formCompletion.percentage === 100 ? 'text-success' : 'text-primary'
                          }`}
                      />
                    </svg>
                  </div>
                  {/* Percentage Text */}
                  <span className={`text-xs font-bold min-w-[32px] text-center tabular-nums ${formCompletion.percentage === 100
                    ? 'text-success'
                    : 'text-foreground'
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
                  className={`w-10 h-10 ${showPreview ? 'bg-primary/15 text-primary' : 'bg-app-quinary text-app-teritary-invert'}`}
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
                className="font-semibold px-5 h-10 rounded-full"
              >
                Simpan
              </Button>
            </div>
          }
        />
      </div>

      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 bg-destructive/10 text-destructive border border-destructive/40 rounded-lg p-3 flex items-center gap-2 text-sm"
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
      <div className="lg:flex lg:gap-5 lg:items-start">
        {/* Left Column - Main Form */}
        <div className={`space-y-5 ${showPreview ? 'lg:flex-1 lg:min-w-0' : 'w-full'}`}>

          {/* Card 1: Basic Info */}
          <Card className="border border-zinc-800 bg-card">
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
                    inputWrapper: 'border-input bg-input/30',
                  }}
                  startContent={<Sparkles size={16} className="text-app-teritary-invert" />}
                  endContent={
                    formData.title.length >= 5 && <CheckCircle2 size={16} className="text-success" />
                  }
                  description={
                    <span className={formData.title.length < 5 ? 'text-warning tabular-nums' : 'text-success tabular-nums'}>
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
                    inputWrapper: 'border-input bg-input/30',
                  }}
                  description={
                    <span className={formData.description.length < 20 ? 'text-warning tabular-nums' : 'text-success tabular-nums'}>
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
                        trigger: 'border-input bg-input/30 h-10',
                      }}
                      startContent={<Calendar size={14} className="text-app-teritary-invert" />}
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
                        inputWrapper: 'border-input bg-input/20 h-10',
                      }}
                      startContent={<BookOpen size={14} className="text-app-teritary-invert" />}
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
                    inputWrapper: 'border-input bg-input/30',
                  }}
                  startContent={<Target size={14} className="text-app-teritary-invert mt-2" />}
                />

                {/* Visibility Toggle */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-800 bg-app-quinary">
                  <div className="flex items-center gap-2">
                    {isPublic ? <Globe size={16} className="text-primary" /> : <Shield size={16} className="text-warning" />}
                    <div>
                      <p className="text-sm font-medium">{isPublic ? 'Project Publik' : 'Project Privat'}</p>
                      <p className="text-xs text-app-teritary-invert">
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
          <Card className="border border-zinc-800 bg-card">
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
                                ? 'bg-primary/10 ring-2 ring-primary'
                                : 'bg-app-quinary hover:bg-app-quaternary border border-zinc-800'
                              }
                            `}
                          >
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center shadow-sm"
                              >
                                <Check size={10} className="text-primary-foreground" />
                              </motion.div>
                            )}
                            <div className="bg-app-primary text-foreground rounded-lg p-1.5">
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
                    startContent={<Search size={14} className="text-app-teritary-invert" />}
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
                  <div className="flex flex-wrap gap-1.5 min-h-[40px] p-2.5 bg-app-quinary rounded-lg border border-dashed border-zinc-800">
                    {selectedTechs.length === 0 ? (
                      <div className="flex items-center gap-1.5 text-app-teritary-invert text-xs">
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
                        className="h-6 text-[10px] px-2 border-zinc-800"
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
            <Card className="border border-zinc-800 bg-card">
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
                    <span className="ml-2 text-sm text-app-teritary-invert">Memeriksa status GitHub...</span>
                  </div>
                ) : !hasGitHubConnected ? (
                  <div className="p-3 bg-warning/10 rounded-lg border border-warning/40">
                    <div className="flex items-start gap-2">
                      <AlertTriangle size={16} className="text-warning shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-warning">GitHub Belum Terhubung</p>
                        <p className="text-xs text-warning/80 mb-2">Hubungkan akun GitHub Anda di pengaturan untuk memilih repository</p>
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
                  <div className="p-3 bg-success/10 rounded-lg border border-success/40">
                    <div className="flex items-start gap-2">
                      <div className="p-1.5 bg-success/15 rounded-md">
                        <FolderGit2 size={16} className="text-success" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{selectedRepo.name}</p>
                        <p className="text-xs text-app-secondary-invert truncate">{selectedRepo.full_name}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-app-teritary-invert">
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
                      className="w-full h-14 border-dashed border-zinc-800"
                      startContent={<FolderGit2 size={18} />}
                      onPress={() => setIsRepoSelectorOpen(true)}
                    >
                      <div className="text-left">
                        <p className="font-medium text-sm">Pilih Repository</p>
                        <p className="text-xs text-app-teritary-invert">dari akun GitHub Anda</p>
                      </div>
                    </Button>

                    <div className="relative">
                      <Divider />
                      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-app-teritary-invert">
                        atau
                      </span>
                    </div>

                    <Input
                      size="sm"
                      variant="bordered"
                      placeholder="https://github.com/user/repo"
                      value={formData.githubRepoUrl}
                      onChange={(e) => setFormData({ ...formData, githubRepoUrl: e.target.value })}
                      startContent={<LinkIcon size={12} className="text-app-teritary-invert" />}
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

          {/* Production URL & Testing Credentials - di bawah GitHub & Team */}
          <Card className="border border-zinc-800 bg-card">
            <CardBody className="p-5">
              <div className="space-y-5">
                {/* Production URL */}
                <div>
                  <label className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Globe size={16} className="text-primary" />
                    URL Production/Demo
                    <span className="text-danger">*</span>
                  </label>
                  <div className="flex gap-2">
                    <Input
                      size="sm"
                      variant="bordered"
                      placeholder="https://your-app.vercel.app"
                      value={formData.productionUrl}
                      onChange={(e) => setFormData({ ...formData, productionUrl: e.target.value })}
                      startContent={<Globe size={14} className="text-app-teritary-invert" />}
                      endContent={
                        urlValidation.status === 'checking' ? (
                          <Spinner size="sm" className="w-4 h-4" />
                        ) : urlValidation.status === 'valid' ? (
                          <CheckCircle2 size={16} className="text-success" />
                        ) : urlValidation.status === 'invalid' ? (
                          <XCircle size={16} className="text-danger" />
                        ) : null
                      }
                      isRequired
                      className="flex-1"
                      classNames={{
                        inputWrapper: `border-input bg-input/30 ${
                          urlValidation.status === 'valid' ? 'border-success' : 
                          urlValidation.status === 'invalid' ? 'border-danger' : ''
                        }`,
                      }}
                    />
                    {formData.productionUrl && urlValidation.status !== 'checking' && (
                      <Tooltip content="Buka di tab baru">
                        <Button
                          size="sm"
                          variant="flat"
                          isIconOnly
                          as="a"
                          href={formData.productionUrl.startsWith('http') ? formData.productionUrl : `https://${formData.productionUrl}`}
                          target="_blank"
                          className="h-10 w-10"
                        >
                          <ExternalLink size={16} />
                        </Button>
                      </Tooltip>
                    )}
                  </div>
                  {urlValidation.status === 'checking' && (
                    <p className="text-xs mt-1.5 flex items-center gap-1 text-app-teritary-invert">
                      <Spinner size="sm" className="w-3 h-3" />
                      Memeriksa URL...
                    </p>
                  )}
                  {urlValidation.status === 'valid' && (
                    <p className="text-xs mt-1.5 flex items-center gap-1 text-success">
                      <CheckCircle2 size={12} />
                      {urlValidation.message}
                    </p>
                  )}
                  {urlValidation.status === 'invalid' && (
                    <p className="text-xs mt-1.5 flex items-center gap-1 text-danger">
                      <XCircle size={12} />
                      {urlValidation.message}
                    </p>
                  )}
                  {urlValidation.status === 'idle' && (
                    <p className="text-xs text-app-teritary-invert mt-1.5">URL aplikasi yang sudah di-deploy dan bisa diakses publik</p>
                  )}
                </div>

                <Divider />

                {/* Testing Credentials */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <KeyRound size={16} className="text-warning" />
                    <span className="text-sm font-medium">Akun Testing</span>
                    <Chip size="sm" variant="flat" color="warning" classNames={{ base: 'h-5 text-[10px]' }}>
                      Untuk Penguji
                    </Chip>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      size="sm"
                      variant="bordered"
                      label="Username/Email"
                      labelPlacement="outside"
                      placeholder="user@example.com"
                      value={testingCredentials.username}
                      onChange={(e) => setTestingCredentials({ ...testingCredentials, username: e.target.value })}
                      startContent={<User size={14} className="text-app-teritary-invert" />}
                      classNames={{
                        label: 'text-xs font-medium',
                        inputWrapper: 'border-input bg-input/30',
                      }}
                    />
                    <Input
                      size="sm"
                      variant="bordered"
                      label="Password"
                      labelPlacement="outside"
                      placeholder="password123"
                      value={testingCredentials.password}
                      onChange={(e) => setTestingCredentials({ ...testingCredentials, password: e.target.value })}
                      startContent={<KeyRound size={14} className="text-app-teritary-invert" />}
                      classNames={{
                        label: 'text-xs font-medium',
                        inputWrapper: 'border-input bg-input/30',
                      }}
                    />
                  </div>
                  
                  <Textarea
                    size="sm"
                    variant="bordered"
                    label="Catatan Testing (Opsional)"
                    labelPlacement="outside"
                    placeholder="Langkah-langkah login, fitur utama yang bisa dicoba, atau informasi tambahan untuk penguji..."
                    value={testingCredentials.notes}
                    onChange={(e) => setTestingCredentials({ ...testingCredentials, notes: e.target.value })}
                    minRows={2}
                    className="mt-4"
                    classNames={{
                      label: 'text-xs font-medium',
                      inputWrapper: 'border-input bg-input/30',
                    }}
                  />
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Card: Consent Document Upload */}
          <ConsentFileUpload
            document={consentDocument}
            onDocumentChange={setConsentDocument}
            isRequired={true}
          />

          {/* Card 4: Optional Fields (Collapsible) */}
          <Card className="border border-zinc-800 bg-card">
            <CardBody className="p-0">
              <button
                onClick={() => setShowOptional(!showOptional)}
                className="w-full p-5 flex items-center justify-between hover:bg-app-quinary transition-colors rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-app-primary text-foreground flex size-9 items-center justify-center rounded-lg">
                    <Settings size={16} />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-sm">Pengaturan Tambahan</p>
                    <p className="text-xs text-app-teritary-invert mt-0.5">Metodologi & Output (Opsional)</p>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: showOptional ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={18} className="text-app-teritary-invert" />
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
                    <div className="px-5 pb-6 pt-4 border-t border-zinc-800">
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
                            inputWrapper: 'border-input bg-input/30',
                            input: 'placeholder:text-app-teritary-invert',
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
                            inputWrapper: 'border-input bg-input/30',
                            input: 'placeholder:text-app-teritary-invert',
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

        {/* Right Column - Preview & Checklist (Scroll together) */}
        <AnimatePresence>
          {showPreview && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="hidden lg:block w-[340px] flex-shrink-0 space-y-4"
            >
                {/* Live Preview Card - Clean Design */}
                <Card className="border border-zinc-800 bg-card rounded-2xl overflow-hidden">
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
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-zinc-800 bg-app-quaternary text-foreground text-xs font-medium">
                                <Icon size={12} />
                                <span>{cat.label}</span>
                              </div>
                            );
                          }
                          return null;
                        })()
                      ) : (
                        <div className="inline-flex items-center px-2.5 py-1 rounded-full border border-dashed border-zinc-800 bg-app-quinary text-app-teritary-invert text-xs">
                          Pilih Kategori
                        </div>
                      )}

                      {/* Project Title */}
                      <h3 className="font-bold text-lg text-foreground leading-snug">
                        {formData.title || 'Judul Project Anda'}
                      </h3>

                      {/* Semester Info */}
                      <div className="flex items-center gap-2 text-sm text-app-secondary-invert">
                        <Calendar size={14} />
                        <span>{formData.semester || 'Ganjil 2025/2026'}</span>
                        <span className="text-zinc-600">•</span>
                        <span>{formData.tahunAkademik || '2025/2026'}</span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-app-secondary-invert line-clamp-2">
                      {formData.description || 'Deskripsi project akan ditampilkan di sini...'}
                    </p>

                    {/* Tech Stack */}
                    {selectedTechs.length === 0 ? (
                      <p className="text-xs text-app-teritary-invert italic">Belum ada teknologi dipilih</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedTechs.slice(0, 4).map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-0.5 rounded-md border border-zinc-800 bg-app-quinary text-app-secondary-invert text-xs font-medium"
                          >
                            {tech}
                          </span>
                        ))}
                        {selectedTechs.length > 4 && (
                          <span className="px-2 py-0.5 rounded-md bg-app-quinary text-app-teritary-invert text-xs tabular-nums">
                            +{selectedTechs.length - 4}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Divider */}
                    <div className="border-t border-zinc-800" />

                    {/* Stats Row */}
                    <div className="grid grid-cols-4 gap-2">
                      <div className="text-center p-2 rounded-xl bg-app-quinary">
                        <Users size={16} className="mx-auto mb-1 text-app-secondary-invert" />
                        <p className="text-sm font-semibold text-foreground tabular-nums">{pendingTeamMembers.length + 1}</p>
                        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-app-teritary-invert">Tim</p>
                      </div>
                      <div className="text-center p-2 rounded-xl bg-app-quinary">
                        <Github size={16} className={`mx-auto mb-1 ${(selectedRepo || formData.githubRepoUrl) ? 'text-success' : 'text-app-teritary-invert'}`} />
                        <p className="text-sm font-semibold text-foreground">{(selectedRepo || formData.githubRepoUrl) ? 'Yes' : 'No'}</p>
                        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-app-teritary-invert">Repo</p>
                      </div>
                      <div className="text-center p-2 rounded-xl bg-app-quinary">
                        {isPublic ? <Globe size={16} className="mx-auto mb-1 text-app-secondary-invert" /> : <Shield size={16} className="mx-auto mb-1 text-warning" />}
                        <p className="text-sm font-semibold text-foreground">{isPublic ? 'Public' : 'Private'}</p>
                        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-app-teritary-invert">Access</p>
                      </div>
                      <div className="text-center p-2 rounded-xl bg-app-quinary">
                        <Clock size={16} className="mx-auto mb-1 text-warning" />
                        <p className="text-sm font-semibold text-foreground">Draft</p>
                        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-app-teritary-invert">Status</p>
                      </div>
                    </div>

                    {/* Author Section */}
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-app-quinary">
                      <div className="relative">
                        <Avatar
                          src={session?.user?.image || ''}
                          name={session?.user?.name || ''}
                          size="sm"
                          className="w-10 h-10"
                        />
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-success rounded-full border-2 border-zinc-900 flex items-center justify-center">
                          <Check size={8} className="text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">{session?.user?.name || 'Your Name'}</p>
                        <p className="text-xs text-app-teritary-invert flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                          Ketua Tim • Project Owner
                        </p>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* Checklist Card - Enhanced */}
                <Card className="border border-zinc-800 bg-card overflow-hidden">
                  <div className="p-4 border-b border-zinc-800 bg-app-quinary">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-success/10">
                          <CheckCircle2 size={14} className="text-success" />
                        </div>
                        <span className="font-semibold text-sm">Progress</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-success tabular-nums">{formCompletion.percentage}%</span>
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
                        track: 'h-2 bg-app-primary',
                        indicator: formCompletion.percentage === 100
                          ? 'bg-success'
                          : 'bg-primary'
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
                            ? 'bg-success/10 border border-success/30'
                            : 'bg-app-quinary border border-transparent hover:border-zinc-800'
                            }`}
                        >
                          <span className={`font-medium ${field.filled ? 'text-success' : 'text-app-secondary-invert'}`}>
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
                            <div className="w-4 h-4 rounded-full border-2 border-zinc-800 border-dashed" />
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </CardBody>
                </Card>

                {/* Tips Card - Enhanced */}
                <Card className="border border-zinc-800 bg-card overflow-hidden">
                  <CardBody className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="bg-app-primary text-foreground flex size-7 items-center justify-center rounded-lg">
                        <Lightbulb size={14} />
                      </div>
                      <span className="font-semibold text-sm text-foreground">Pro Tips</span>
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
                          className="flex items-start gap-2 text-[11px] text-app-secondary-invert"
                        >
                          <ChevronRight size={12} className="mt-0.5 text-app-teritary-invert shrink-0" />
                          <span>{tip}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </CardBody>
                </Card>
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
