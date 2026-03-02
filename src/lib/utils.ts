import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getStatusColor(
  status: string,
): 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' {
  const statusColors: Record<
    string,
    'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  > = {
    DRAFT: 'default',
    SUBMITTED: 'primary',
    IN_REVIEW: 'secondary',
    REVISION_NEEDED: 'warning',
    READY_FOR_PRESENTATION: 'primary',
    PRESENTATION_SCHEDULED: 'secondary',
    APPROVED: 'success',
    REJECTED: 'danger',
    PENDING: 'default',
    IN_PROGRESS: 'primary',
    COMPLETED: 'success',
  };
  return statusColors[status] || 'default';
}

export function getStatusLabel(status: string): string {
  const statusLabels: Record<string, string> = {
    DRAFT: 'Draft',
    SUBMITTED: 'Disubmit',
    IN_REVIEW: 'Dalam Review',
    REVISION_NEEDED: 'Perlu Revisi',
    READY_FOR_PRESENTATION: 'Siap Presentasi',
    PRESENTATION_SCHEDULED: 'Terjadwal',
    APPROVED: 'Disetujui',
    REJECTED: 'Ditolak',
    PENDING: 'Menunggu',
    IN_PROGRESS: 'Sedang Dikerjakan',
    COMPLETED: 'Selesai',
  };
  return statusLabels[status] || status;
}

export function getRoleLabel(role: string): string {
  const roleLabels: Record<string, string> = {
    MAHASISWA: 'Mahasiswa',
    DOSEN_PENGUJI: 'Dosen Penguji',
    ADMIN: 'Admin',
  };
  return roleLabels[role] || role;
}

export function getDocumentTypeLabel(type: string): string {
  const typeLabels: Record<string, string> = {
    PRESENTATION: 'Presentasi',
    SOURCE_CODE: 'Source Code',
    OTHER: 'Lainnya',
  };
  return typeLabels[type] || type;
}

/**
 * Get SIMAK photo URL from NIM
 * @param nim - Student NIM (Nomor Induk Mahasiswa)
 * @returns URL to SIMAK photo or undefined if no NIM provided
 */
export function getSimakPhotoUrl(nim: string | null | undefined): string | undefined {
  if (!nim) return undefined;
  return `https://simak.unismuh.ac.id/upload/mahasiswa/${nim}.jpg`;
}

// ==================== DEPLOYMENT PLATFORM CONFIG ====================

export interface DeploymentPlatform {
  key: string;
  label: string;
  description: string;
  category: 'manual' | 'cloud_service' | 'container' | 'semi_managed' | 'auto_managed';
  bonusPoints: number;
  icon: string; // Lucide icon name reference
}

/**
 * Deployment platforms sorted by bonus points (highest first).
 * Manual/VPS deployments get higher points because they require
 * more technical skill and understanding of infrastructure.
 */
export const DEPLOYMENT_PLATFORMS: DeploymentPlatform[] = [
  {
    key: 'vps_nginx',
    label: 'VPS + Nginx',
    description: 'Deploy manual di VPS (DigitalOcean, Linode, dll) dengan konfigurasi Nginx sebagai reverse proxy',
    category: 'manual',
    bonusPoints: 15,
    icon: 'Server',
  },
  {
    key: 'vps_apache',
    label: 'VPS + Apache',
    description: 'Deploy manual di VPS dengan konfigurasi Apache sebagai web server',
    category: 'manual',
    bonusPoints: 15,
    icon: 'Server',
  },
  {
    key: 'shared_hosting',
    label: 'Shared Hosting (cPanel)',
    description: 'Deploy di shared hosting dengan cPanel/Plesk (Niagahoster, Hostinger, dll)',
    category: 'manual',
    bonusPoints: 12,
    icon: 'HardDrive',
  },
  {
    key: 'aws',
    label: 'AWS (EC2/ECS/Lambda)',
    description: 'Deploy menggunakan layanan Amazon Web Services (EC2, ECS, Lambda, Elastic Beanstalk)',
    category: 'cloud_service',
    bonusPoints: 12,
    icon: 'Cloud',
  },
  {
    key: 'gcp',
    label: 'Google Cloud Platform',
    description: 'Deploy menggunakan Google Cloud (Compute Engine, Cloud Run, App Engine)',
    category: 'cloud_service',
    bonusPoints: 12,
    icon: 'Cloud',
  },
  {
    key: 'azure',
    label: 'Microsoft Azure',
    description: 'Deploy menggunakan Azure (Virtual Machines, App Service, Container Instances)',
    category: 'cloud_service',
    bonusPoints: 12,
    icon: 'Cloud',
  },
  {
    key: 'docker_vps',
    label: 'Docker di VPS',
    description: 'Deploy menggunakan Docker/Docker Compose di VPS sendiri',
    category: 'container',
    bonusPoints: 10,
    icon: 'Container',
  },
  {
    key: 'railway',
    label: 'Railway',
    description: 'Deploy menggunakan Railway (semi-managed PaaS)',
    category: 'semi_managed',
    bonusPoints: 8,
    icon: 'Train',
  },
  {
    key: 'flyio',
    label: 'Fly.io',
    description: 'Deploy menggunakan Fly.io (edge deployment)',
    category: 'semi_managed',
    bonusPoints: 8,
    icon: 'Plane',
  },
  {
    key: 'vercel',
    label: 'Vercel',
    description: 'Deploy otomatis menggunakan Vercel (auto CI/CD dari GitHub)',
    category: 'auto_managed',
    bonusPoints: 5,
    icon: 'Zap',
  },
  {
    key: 'netlify',
    label: 'Netlify',
    description: 'Deploy otomatis menggunakan Netlify',
    category: 'auto_managed',
    bonusPoints: 5,
    icon: 'Zap',
  },
  {
    key: 'other',
    label: 'Platform Lainnya',
    description: 'Platform deployment lain yang tidak terdaftar',
    category: 'semi_managed',
    bonusPoints: 5,
    icon: 'Globe',
  },
];

/**
 * Get deployment platform config by key
 */
export function getDeploymentPlatform(key: string | null | undefined): DeploymentPlatform | undefined {
  if (!key) return undefined;
  return DEPLOYMENT_PLATFORMS.find((p) => p.key === key);
}

/**
 * Get bonus points for a deployment platform
 */
export function getDeploymentBonusPoints(platformKey: string | null | undefined): number {
  const platform = getDeploymentPlatform(platformKey);
  return platform?.bonusPoints ?? 0;
}

/**
 * Get deployment category label
 */
export function getDeploymentCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    manual: 'Manual / VPS',
    cloud_service: 'Cloud Service',
    container: 'Container',
    semi_managed: 'Semi-Managed',
    auto_managed: 'Auto-Managed',
  };
  return labels[category] || category;
}

/**
 * Get color for deployment category (for Chip components)
 */
export function getDeploymentCategoryColor(category: string): 'success' | 'primary' | 'secondary' | 'warning' | 'default' {
  const colors: Record<string, 'success' | 'primary' | 'secondary' | 'warning' | 'default'> = {
    manual: 'success',
    cloud_service: 'primary',
    container: 'secondary',
    semi_managed: 'warning',
    auto_managed: 'default',
  };
  return colors[category] || 'default';
}

// ==================== DEPLOYMENT TOOLS / STEPS CONFIG ====================

export interface DeploymentTool {
  key: string;
  label: string;
  description: string;
  category: string;
  icon: string;
}

export interface DeploymentToolCategory {
  key: string;
  label: string;
  icon: string;
  tools: DeploymentTool[];
  /** Which platform categories show this tool category */
  showFor: Array<'manual' | 'cloud_service' | 'container' | 'semi_managed' | 'auto_managed'>;
}

/**
 * Deployment tools grouped by category.
 * Each category is shown conditionally based on selected platform type.
 */
export const DEPLOYMENT_TOOL_CATEGORIES: DeploymentToolCategory[] = [
  {
    key: 'web_server',
    label: 'Web Server / Reverse Proxy',
    icon: 'Server',
    showFor: ['manual', 'cloud_service', 'container'],
    tools: [
      { key: 'nginx', label: 'Nginx', description: 'Web server & reverse proxy', category: 'web_server', icon: 'Server' },
      { key: 'apache', label: 'Apache', description: 'Apache HTTP Server', category: 'web_server', icon: 'Server' },
      { key: 'caddy', label: 'Caddy', description: 'Web server dengan auto HTTPS', category: 'web_server', icon: 'Server' },
      { key: 'traefik', label: 'Traefik', description: 'Cloud-native reverse proxy', category: 'web_server', icon: 'Server' },
    ],
  },
  {
    key: 'ssl_tls',
    label: 'SSL / HTTPS',
    icon: 'ShieldCheck',
    showFor: ['manual', 'cloud_service', 'container'],
    tools: [
      { key: 'certbot', label: 'Certbot (Let\'s Encrypt)', description: 'Free SSL certificate via Let\'s Encrypt', category: 'ssl_tls', icon: 'ShieldCheck' },
      { key: 'cloudflare_ssl', label: 'Cloudflare SSL', description: 'SSL melalui Cloudflare proxy', category: 'ssl_tls', icon: 'Shield' },
      { key: 'custom_ssl', label: 'Custom SSL Certificate', description: 'SSL certificate berbayar/manual', category: 'ssl_tls', icon: 'Shield' },
    ],
  },
  {
    key: 'process_manager',
    label: 'Process Manager',
    icon: 'Cpu',
    showFor: ['manual', 'cloud_service'],
    tools: [
      { key: 'pm2', label: 'PM2', description: 'Node.js process manager', category: 'process_manager', icon: 'Cpu' },
      { key: 'systemd', label: 'Systemd Service', description: 'Linux systemd service unit', category: 'process_manager', icon: 'Cpu' },
      { key: 'supervisor', label: 'Supervisor', description: 'Process control system', category: 'process_manager', icon: 'Cpu' },
    ],
  },
  {
    key: 'containerization',
    label: 'Container & Orchestration',
    icon: 'Container',
    showFor: ['container', 'cloud_service'],
    tools: [
      { key: 'docker', label: 'Docker', description: 'Container runtime', category: 'containerization', icon: 'Container' },
      { key: 'docker_compose', label: 'Docker Compose', description: 'Multi-container orchestration', category: 'containerization', icon: 'Container' },
      { key: 'kubernetes', label: 'Kubernetes', description: 'Container orchestration platform', category: 'containerization', icon: 'Container' },
    ],
  },
  {
    key: 'database',
    label: 'Database Server',
    icon: 'Database',
    showFor: ['manual', 'cloud_service', 'container'],
    tools: [
      { key: 'postgresql', label: 'PostgreSQL', description: 'Relational database', category: 'database', icon: 'Database' },
      { key: 'mysql', label: 'MySQL / MariaDB', description: 'Relational database', category: 'database', icon: 'Database' },
      { key: 'mongodb', label: 'MongoDB', description: 'NoSQL document database', category: 'database', icon: 'Database' },
      { key: 'redis', label: 'Redis', description: 'In-memory data store / cache', category: 'database', icon: 'Database' },
      { key: 'sqlite', label: 'SQLite', description: 'Embedded database', category: 'database', icon: 'Database' },
    ],
  },
  {
    key: 'ci_cd',
    label: 'CI/CD & Automation',
    icon: 'GitBranch',
    showFor: ['manual', 'cloud_service', 'container', 'semi_managed'],
    tools: [
      { key: 'github_actions', label: 'GitHub Actions', description: 'CI/CD pipeline via GitHub', category: 'ci_cd', icon: 'GitBranch' },
      { key: 'gitlab_ci', label: 'GitLab CI/CD', description: 'CI/CD pipeline via GitLab', category: 'ci_cd', icon: 'GitBranch' },
      { key: 'jenkins', label: 'Jenkins', description: 'Automation server', category: 'ci_cd', icon: 'GitBranch' },
      { key: 'webhook_deploy', label: 'Webhook Auto-Deploy', description: 'Deploy otomatis via webhook', category: 'ci_cd', icon: 'Zap' },
    ],
  },
  {
    key: 'dns_domain',
    label: 'DNS & Domain',
    icon: 'Globe',
    showFor: ['manual', 'cloud_service', 'container', 'semi_managed'],
    tools: [
      { key: 'cloudflare_dns', label: 'Cloudflare DNS', description: 'DNS management via Cloudflare', category: 'dns_domain', icon: 'Globe' },
      { key: 'custom_domain', label: 'Custom Domain', description: 'Domain sendiri (bukan subdomain gratis)', category: 'dns_domain', icon: 'Globe' },
      { key: 'namecheap', label: 'Namecheap', description: 'Domain registrar', category: 'dns_domain', icon: 'Globe' },
      { key: 'niagahoster_domain', label: 'Niagahoster / IDCloudHost', description: 'Domain registrar lokal', category: 'dns_domain', icon: 'Globe' },
    ],
  },
  {
    key: 'security',
    label: 'Keamanan Server',
    icon: 'ShieldCheck',
    showFor: ['manual', 'cloud_service'],
    tools: [
      { key: 'ufw', label: 'UFW Firewall', description: 'Uncomplicated Firewall', category: 'security', icon: 'Shield' },
      { key: 'fail2ban', label: 'Fail2Ban', description: 'Brute-force protection', category: 'security', icon: 'Shield' },
      { key: 'ssh_key', label: 'SSH Key Auth', description: 'Login server dengan SSH key', category: 'security', icon: 'KeyRound' },
    ],
  },
  {
    key: 'runtime',
    label: 'Runtime & Environment',
    icon: 'Terminal',
    showFor: ['manual', 'cloud_service', 'container'],
    tools: [
      { key: 'nodejs', label: 'Node.js', description: 'JavaScript runtime', category: 'runtime', icon: 'Terminal' },
      { key: 'python', label: 'Python', description: 'Python runtime', category: 'runtime', icon: 'Terminal' },
      { key: 'php', label: 'PHP / PHP-FPM', description: 'PHP runtime', category: 'runtime', icon: 'Terminal' },
      { key: 'java', label: 'Java / JVM', description: 'Java runtime', category: 'runtime', icon: 'Terminal' },
      { key: 'golang', label: 'Go', description: 'Go runtime', category: 'runtime', icon: 'Terminal' },
      { key: 'dotnet', label: '.NET', description: '.NET runtime', category: 'runtime', icon: 'Terminal' },
    ],
  },
];

/**
 * Get all deployment tools as a flat list
 */
export function getAllDeploymentTools(): DeploymentTool[] {
  return DEPLOYMENT_TOOL_CATEGORIES.flatMap((cat) => cat.tools);
}

/**
 * Get a deployment tool by key
 */
export function getDeploymentTool(key: string): DeploymentTool | undefined {
  return getAllDeploymentTools().find((t) => t.key === key);
}

/**
 * Get visible tool categories for a given platform category
 */
export function getToolCategoriesForPlatform(platformCategory: string): DeploymentToolCategory[] {
  return DEPLOYMENT_TOOL_CATEGORIES.filter((cat) =>
    cat.showFor.includes(platformCategory as DeploymentToolCategory['showFor'][number])
  );
}

/**
 * Parse deploymentTools JSON string to array
 */
export function parseDeploymentTools(json: string | null | undefined): string[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
