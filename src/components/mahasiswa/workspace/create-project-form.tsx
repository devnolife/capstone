'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Spinner } from '@/components/ui/spinner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { addToast } from '@/lib/toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
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
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
    {action}
  </div>
);

export function CreateProjectForm() {
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

  // Required fields that are still missing (used to explain why submit is disabled)
  const missingRequiredFields = useMemo(() => {
    const missing: string[] = [];
    if (formData.title.length < 5) missing.push('Judul minimal 5 karakter');
    if (formData.description.length < 20) missing.push('Deskripsi minimal 20 karakter');
    if (!formData.semester) missing.push('Semester');
    if (!formData.category) missing.push('Kategori');
    if (formData.productionUrl.length === 0) missing.push('URL Production');
    if (!consentDocument) missing.push('Surat Persetujuan');
    return missing;
  }, [formData, consentDocument]);

  // Form validation
  const isFormValid = missingRequiredFields.length === 0;

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
      if (!response.ok) {
        // Sudah punya project aktif — arahkan langsung ke project tersebut
        if (response.status === 409 && data.projectId) {
          addToast({
            title: 'Anda sudah punya project',
            description: data.error,
            color: 'warning',
          });
          router.push(`/mahasiswa/project?project=${data.projectId}`);
          router.refresh();
          return;
        }
        throw new Error(data.error || 'Gagal membuat project');
      }

      router.push(`/mahasiswa/project?project=${data.project.id}`);
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
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Rocket className="text-primary" size={22} />
              Buat Project Baru
            </h1>
            <p className="text-xs text-muted-foreground">
              Lengkapi informasi untuk memulai project capstone
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Progress Indicator */}
          <Tooltip>
            <TooltipTrigger
              render={
                <div className={`flex items-center gap-2 px-3 py-2 rounded-full border transition-all duration-300 ${formCompletion.percentage === 100
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30'
                  : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700'
                  }`} />
              }
            >
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
            </TooltipTrigger>
            <TooltipContent>
              {`${formCompletion.filledCount}/${formCompletion.total} field terisi`}
            </TooltipContent>
          </Tooltip>

          {/* Preview Toggle */}
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPreview(!showPreview)}
                  className={`w-10 h-10 rounded-full ${showPreview ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}
                />
              }
            >
              {showPreview ? <Eye size={18} /> : <EyeOff size={18} />}
            </TooltipTrigger>
            <TooltipContent>
              {showPreview ? 'Sembunyikan Preview' : 'Tampilkan Preview'}
            </TooltipContent>
          </Tooltip>

          {/* Save Button */}
          <Tooltip>
            <TooltipTrigger render={<span className="inline-block" />}>
              <Button
                size="sm"
                disabled={!isFormValid || isLoading}
                onClick={handleSubmit}
                className="font-semibold px-5 h-10 rounded-full shadow-md shadow-blue-500/20"
              >
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                Simpan
              </Button>
            </TooltipTrigger>
            {!isFormValid && (
              <TooltipContent>
                <div className="max-w-[220px] py-1">
                  <p className="font-semibold text-xs mb-1 flex items-center gap-1">
                    <AlertCircle size={13} />
                    Lengkapi dulu untuk menyimpan:
                  </p>
                  <ul className="list-disc list-inside text-xs space-y-0.5">
                    {missingRequiredFields.map((field) => (
                      <li key={field}>{field}</li>
                    ))}
                  </ul>
                </div>
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </div>

      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg p-3 flex items-center gap-2 text-sm"
          >
            <AlertCircle size={16} />
            <span className="flex-1">{error}</span>
            <Button size="icon-sm" variant="ghost" onClick={() => setError('')}>
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
          <Card className="border border-border shadow-sm py-0">
            <CardContent className="p-5">
              <SectionHeader
                icon={FileText}
                title="Informasi Dasar"
                subtitle="Detail utama project"
              />

              <div className="space-y-4">
                {/* Title */}
                <div className="space-y-1.5">
                  <Label htmlFor="project-title" className="text-sm font-medium">
                    Judul Project <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Sparkles
                      size={16}
                      className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                      id="project-title"
                      placeholder="Contoh: Sistem Monitoring IoT untuk Smart Agriculture"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      className="pl-8 pr-8"
                    />
                    {formData.title.length >= 5 && (
                      <CheckCircle2
                        size={16}
                        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-500"
                      />
                    )}
                  </div>
                  <p className={`text-xs ${formData.title.length < 5 ? 'text-amber-500' : 'text-emerald-600'}`}>
                    {formData.title.length}/100 karakter (min. 5)
                  </p>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <Label htmlFor="project-description" className="text-sm font-medium">
                    Deskripsi Project <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="project-description"
                    placeholder="Jelaskan latar belakang masalah, solusi yang ditawarkan, dan manfaat project..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    required
                  />
                  <p className={`text-xs ${formData.description.length < 20 ? 'text-amber-500' : 'text-emerald-600'}`}>
                    {formData.description.length}/1000 karakter (min. 20)
                  </p>
                </div>

                {/* Semester & Academic Year Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-foreground">
                      Semester <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.semester || null}
                      onValueChange={(value) => {
                        const name = typeof value === 'string' ? value : '';
                        const selected = semesterOptions.find((s) => s.name === name);
                        setFormData({
                          ...formData,
                          semester: name,
                          tahunAkademik: selected?.tahunAkademik || '',
                        });
                      }}
                    >
                      <SelectTrigger aria-label="Pilih Semester" className="w-full h-10">
                        <Calendar size={14} className="text-muted-foreground" />
                        <SelectValue placeholder="Pilih semester" />
                      </SelectTrigger>
                      <SelectContent>
                        {semesterOptions.map((sem) => (
                          <SelectItem key={sem.name} value={sem.name}>
                            {sem.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-foreground">
                      Tahun Akademik
                    </Label>
                    <div className="relative">
                      <BookOpen
                        size={14}
                        className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                      />
                      <Input
                        placeholder="Otomatis"
                        value={formData.tahunAkademik}
                        readOnly
                        aria-label="Tahun Akademik"
                        className="pl-8 h-10 bg-muted/50"
                      />
                    </div>
                  </div>
                </div>

                {/* Objectives */}
                <div className="space-y-1.5">
                  <Label htmlFor="project-objectives" className="text-sm font-medium">
                    Tujuan Project
                  </Label>
                  <Textarea
                    id="project-objectives"
                    placeholder="Apa yang ingin dicapai dengan project ini?"
                    value={formData.objectives}
                    onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                    rows={2}
                  />
                </div>

                {/* Visibility Toggle */}
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    {isPublic ? <Globe size={16} className="text-primary" /> : <Shield size={16} className="text-amber-500" />}
                    <div>
                      <p className="text-sm font-medium">{isPublic ? 'Project Publik' : 'Project Privat'}</p>
                      <p className="text-xs text-muted-foreground">
                        {isPublic ? 'Dapat dilihat semua user' : 'Hanya Anda dan dosen'}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={isPublic}
                    onCheckedChange={setIsPublic}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Category & Tech */}
          <Card className="border border-border shadow-sm py-0">
            <CardContent className="p-5">
              <SectionHeader
                icon={Tag}
                title="Kategori & Teknologi"
                subtitle="Jenis dan tech stack"
                action={
                  <Badge variant="secondary">
                    {selectedTechs.length} tech
                  </Badge>
                }
              />

              <div className="space-y-5">
                {/* Category Grid */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Kategori Project <span className="text-destructive">*</span>
                  </Label>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {PROJECT_CATEGORIES.map((cat) => {
                      const Icon = cat.icon;
                      const isSelected = formData.category === cat.key;
                      return (
                        <Tooltip key={cat.key}>
                          <TooltipTrigger
                            render={
                              <motion.button
                                type="button"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setFormData({ ...formData, category: cat.key })}
                                className={`
                              relative p-2.5 rounded-xl transition-all duration-200 flex flex-col items-center gap-1
                              ${isSelected
                                    ? 'bg-primary/10 ring-2 ring-primary ring-offset-1'
                                    : 'bg-muted/50 hover:bg-muted border border-border'
                                  }
                            `}
                              />
                            }
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
                          </TooltipTrigger>
                          <TooltipContent>{cat.label}</TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                </div>

                <Separator className="my-2" />

                {/* Technology Selection */}
                <div>
                  <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Code2 size={14} />
                    Teknologi <span className="text-destructive">*</span>
                  </Label>

                  <div className="relative mb-3">
                    <Search
                      size={14}
                      className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                      placeholder="Cari teknologi..."
                      value={techSearch}
                      onChange={(e) => setTechSearch(e.target.value)}
                      className="pl-8 h-8"
                      aria-label="Cari teknologi"
                    />
                    {techSearch.length > 0 && (
                      <div className="absolute z-30 mt-1 max-h-48 w-full overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10">
                        {ALL_TECHNOLOGIES.filter(t =>
                          !selectedTechs.includes(t) &&
                          t.toLowerCase().includes(techSearch.toLowerCase())
                        ).map((tech) => (
                          <button
                            key={tech}
                            type="button"
                            onClick={() => handleAddTech(tech)}
                            className="flex w-full items-center rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                          >
                            {tech}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Selected Techs */}
                  <div className="flex flex-wrap gap-1.5 min-h-[40px] p-2.5 bg-muted/50 rounded-lg border border-dashed border-border">
                    {selectedTechs.length === 0 ? (
                      <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
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
                            <Badge variant="secondary" className="h-6 gap-1">
                              {tech}
                              <button
                                type="button"
                                aria-label={`Hapus ${tech}`}
                                onClick={() => handleRemoveTech(tech)}
                                className="opacity-60 hover:opacity-100"
                              >
                                <X size={10} />
                              </button>
                            </Badge>
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
                        size="xs"
                        variant="outline"
                        className="h-6 rounded-full text-[10px] px-2"
                        disabled={selectedTechs.includes(tech)}
                        onClick={() => handleAddTech(tech)}
                      >
                        <Plus size={10} />
                        {tech}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: GitHub & Team - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* GitHub Repository */}
            <Card className="border border-border shadow-sm py-0">
              <CardContent className="p-5">
                <SectionHeader
                  icon={Github}
                  title="Repository GitHub"
                  action={
                    githubStatus.isLoading ? (
                      <Badge variant="secondary">
                        <Spinner className="size-3" />
                        Memuat...
                      </Badge>
                    ) : hasGitHubConnected ? (
                      <Badge
                        variant="outline"
                        className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                      >
                        @{githubUsername}
                      </Badge>
                    ) : null
                  }
                />

                {githubStatus.isLoading ? (
                  <div className="flex items-center justify-center p-6">
                    <Spinner className="size-4" />
                    <span className="ml-2 text-sm text-muted-foreground">Memeriksa status GitHub...</span>
                  </div>
                ) : !hasGitHubConnected ? (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800/50">
                    <div className="flex items-start gap-2">
                      <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-700 dark:text-amber-300">GitHub Belum Terhubung</p>
                        <p className="text-xs text-amber-600 dark:text-amber-400 mb-2">Hubungkan akun GitHub Anda di pengaturan untuk memilih repository</p>
                        <Button
                          size="sm"
                          variant="outline"
                          render={<Link href="/mahasiswa/settings" />}
                        >
                          <Github size={12} />
                          Hubungkan GitHub
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : selectedRepo ? (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200 dark:border-emerald-800/50">
                    <div className="flex items-start gap-2">
                      <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/40 rounded-md">
                        <FolderGit2 size={16} className="text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{selectedRepo.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{selectedRepo.full_name}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
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
                        <Button size="icon-sm" variant="ghost" onClick={() => setIsRepoSelectorOpen(true)}>
                          <Settings size={12} />
                        </Button>
                        <Button size="icon-sm" variant="ghost" className="text-destructive" onClick={handleRemoveRepo}>
                          <Trash2 size={12} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full h-14 border-dashed"
                      onClick={() => setIsRepoSelectorOpen(true)}
                    >
                      <FolderGit2 size={18} />
                      <div className="text-left">
                        <p className="font-medium text-sm">Pilih Repository</p>
                        <p className="text-xs text-muted-foreground">dari akun GitHub Anda</p>
                      </div>
                    </Button>

                    <div className="relative">
                      <Separator />
                      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
                        atau
                      </span>
                    </div>

                    <div className="relative">
                      <LinkIcon
                        size={12}
                        className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                      />
                      <Input
                        placeholder="https://github.com/user/repo"
                        value={formData.githubRepoUrl}
                        onChange={(e) => setFormData({ ...formData, githubRepoUrl: e.target.value })}
                        className="pl-8 h-8"
                        aria-label="URL Repository GitHub"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
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
          <Card className="border border-border shadow-sm py-0">
            <CardContent className="p-5">
              <div className="space-y-5">
                {/* Production URL */}
                <div>
                  <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Globe size={16} className="text-primary" />
                    URL Production/Demo
                    <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Globe
                        size={14}
                        className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                      />
                      <Input
                        placeholder="https://your-app.vercel.app"
                        value={formData.productionUrl}
                        onChange={(e) => setFormData({ ...formData, productionUrl: e.target.value })}
                        required
                        aria-label="URL Production"
                        aria-invalid={urlValidation.status === 'invalid'}
                        className={`pl-8 pr-8 h-8 ${urlValidation.status === 'valid' ? 'border-emerald-500' : ''}`}
                      />
                      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2">
                        {urlValidation.status === 'checking' ? (
                          <Spinner className="size-4" />
                        ) : urlValidation.status === 'valid' ? (
                          <CheckCircle2 size={16} className="text-emerald-500" />
                        ) : urlValidation.status === 'invalid' ? (
                          <XCircle size={16} className="text-destructive" />
                        ) : null}
                      </span>
                    </div>
                    {formData.productionUrl && urlValidation.status !== 'checking' && (
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Button
                              variant="secondary"
                              size="icon"
                              className="h-10 w-10"
                              render={
                                <a
                                  href={formData.productionUrl.startsWith('http') ? formData.productionUrl : `https://${formData.productionUrl}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                />
                              }
                            />
                          }
                        >
                          <ExternalLink size={16} />
                        </TooltipTrigger>
                        <TooltipContent>Buka di tab baru</TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  {urlValidation.status === 'checking' && (
                    <p className="text-xs mt-1.5 flex items-center gap-1 text-muted-foreground">
                      <Spinner className="size-3" />
                      Memeriksa URL...
                    </p>
                  )}
                  {urlValidation.status === 'valid' && (
                    <p className="text-xs mt-1.5 flex items-center gap-1 text-emerald-600">
                      <CheckCircle2 size={12} />
                      {urlValidation.message}
                    </p>
                  )}
                  {urlValidation.status === 'invalid' && (
                    <p className="text-xs mt-1.5 flex items-center gap-1 text-destructive">
                      <XCircle size={12} />
                      {urlValidation.message}
                    </p>
                  )}
                  {urlValidation.status === 'idle' && (
                    <p className="text-xs text-muted-foreground mt-1.5">URL aplikasi yang sudah di-deploy dan bisa diakses publik</p>
                  )}
                </div>

                <Separator />

                {/* Testing Credentials */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <KeyRound size={16} className="text-amber-500" />
                    <span className="text-sm font-medium">Akun Testing</span>
                    <Badge
                      variant="outline"
                      className="h-5 text-[10px] border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400"
                    >
                      Untuk Penguji
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="testing-username" className="text-xs font-medium">
                        Username/Email
                      </Label>
                      <div className="relative">
                        <User
                          size={14}
                          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                        />
                        <Input
                          id="testing-username"
                          placeholder="user@example.com"
                          value={testingCredentials.username}
                          onChange={(e) => setTestingCredentials({ ...testingCredentials, username: e.target.value })}
                          className="pl-8 h-8"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="testing-password" className="text-xs font-medium">
                        Password
                      </Label>
                      <div className="relative">
                        <KeyRound
                          size={14}
                          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                        />
                        <Input
                          id="testing-password"
                          placeholder="password123"
                          value={testingCredentials.password}
                          onChange={(e) => setTestingCredentials({ ...testingCredentials, password: e.target.value })}
                          className="pl-8 h-8"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 mt-4">
                    <Label htmlFor="testing-notes" className="text-xs font-medium">
                      Catatan Testing (Opsional)
                    </Label>
                    <Textarea
                      id="testing-notes"
                      placeholder="Langkah-langkah login, fitur utama yang bisa dicoba, atau informasi tambahan untuk penguji..."
                      value={testingCredentials.notes}
                      onChange={(e) => setTestingCredentials({ ...testingCredentials, notes: e.target.value })}
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card: Consent Document Upload */}
          <ConsentFileUpload
            document={consentDocument}
            onDocumentChange={setConsentDocument}
            isRequired={true}
          />

          {/* Card 4: Optional Fields (Collapsible) */}
          <Card className="border border-border shadow-sm py-0">
            <CardContent className="p-0">
              <button
                onClick={() => setShowOptional(!showOptional)}
                className="w-full p-5 flex items-center justify-between hover:bg-muted/50 transition-colors rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-muted text-muted-foreground">
                    <Settings size={18} />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-sm">Pengaturan Tambahan</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Metodologi & Output (Opsional)</p>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: showOptional ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={18} className="text-muted-foreground" />
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
                    <div className="px-5 pb-6 pt-4 border-t border-border">
                      <div className="grid gap-6">
                        {/* Methodology */}
                        <div className="space-y-1.5">
                          <Label htmlFor="project-methodology" className="text-sm font-medium">
                            Metodologi Pengembangan
                          </Label>
                          <Textarea
                            id="project-methodology"
                            placeholder="Jelaskan metodologi yang akan digunakan dalam pengembangan project ini. Contoh: Agile/Scrum, Waterfall, Prototype, RAD, dll..."
                            value={formData.methodology}
                            onChange={(e) => setFormData({ ...formData, methodology: e.target.value })}
                            rows={3}
                          />
                        </div>

                        {/* Expected Outcome */}
                        <div className="space-y-1.5">
                          <Label htmlFor="project-outcome" className="text-sm font-medium">
                            Output yang Diharapkan
                          </Label>
                          <Textarea
                            id="project-outcome"
                            placeholder="Jelaskan output/deliverable yang diharapkan dari project ini..."
                            value={formData.expectedOutcome}
                            onChange={(e) => setFormData({ ...formData, expectedOutcome: e.target.value })}
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
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
              <Card className="border border-zinc-200 dark:border-zinc-800 shadow-lg bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden py-0">
                <CardContent className="p-5 space-y-4">
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
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={session?.user?.image || ''} alt={session?.user?.name || ''} />
                        <AvatarFallback>
                          {(session?.user?.name || '?').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
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
                </CardContent>
              </Card>

              {/* Checklist Card - Enhanced */}
              <Card className="border border-border shadow-sm overflow-hidden py-0">
                <div className="p-4 bg-gradient-to-r from-emerald-50/50 to-transparent dark:from-emerald-950/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-emerald-500/10">
                        <CheckCircle2 size={14} className="text-emerald-600" />
                      </div>
                      <span className="font-semibold text-sm">Progress</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-emerald-600">{formCompletion.percentage}%</span>
                    </div>
                  </div>
                </div>
                <CardContent className="p-4 pt-2">
                  <Progress
                    value={formCompletion.percentage}
                    className="mb-4"
                  />
                  <div className="space-y-1">
                    {formCompletion.fields.map((field, index) => (
                      <motion.div
                        key={field.name}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg transition-all duration-300 ${field.filled
                          ? 'bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40'
                          : 'bg-muted/50 border border-transparent hover:border-border'
                          }`}
                      >
                        <span className={`font-medium ${field.filled ? 'text-emerald-700 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                          {field.name}
                        </span>
                        {field.filled ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500 }}
                          >
                            <CheckCircle2 size={14} className="text-emerald-500" />
                          </motion.div>
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-border border-dashed" />
                        )}
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Tips Card - Enhanced */}
              <Card className="border-0 overflow-hidden py-0">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 via-orange-400/20 to-amber-500/20" />
                <CardContent className="p-4 relative">
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
                </CardContent>
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
