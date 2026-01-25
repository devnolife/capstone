import { Octokit } from 'octokit';

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  clone_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  default_branch: string;
  private: boolean;
}

export interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  type: 'file' | 'dir';
  url: string;
  html_url: string;
  download_url: string | null;
}

export interface GitHubFileContent {
  name: string;
  path: string;
  sha: string;
  size: number;
  content: string;
  encoding: string;
}

export interface GitHubCommit {
  sha: string;
  message: string;
  author: {
    name: string;
    email: string;
    date: string;
  };
  committer: {
    name: string;
    email: string;
    date: string;
  };
  html_url: string;
}

export class GitHubClient {
  private octokit: Octokit;

  constructor(token: string) {
    this.octokit = new Octokit({ auth: token });
  }

  /**
   * Get authenticated user's repositories (only public repos for capstone)
   */
  async getUserRepos(publicOnly: boolean = true): Promise<GitHubRepo[]> {
    const { data } = await this.octokit.rest.repos.listForAuthenticatedUser({
      sort: 'updated',
      per_page: 100,
      visibility: publicOnly ? 'public' : 'all',
    });

    return data.map((repo) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      html_url: repo.html_url,
      clone_url: repo.clone_url || '',
      language: repo.language,
      stargazers_count: repo.stargazers_count || 0,
      forks_count: repo.forks_count || 0,
      updated_at: repo.updated_at || '',
      default_branch: repo.default_branch || 'main',
      private: repo.private,
    })) as GitHubRepo[];
  }

  /**
   * Get repository details by owner and repo name
   */
  async getRepo(owner: string, repo: string): Promise<GitHubRepo> {
    const { data } = await this.octokit.rest.repos.get({
      owner,
      repo,
    });

    return {
      id: data.id,
      name: data.name,
      full_name: data.full_name,
      description: data.description,
      html_url: data.html_url,
      clone_url: data.clone_url || '',
      language: data.language,
      stargazers_count: data.stargazers_count,
      forks_count: data.forks_count,
      updated_at: data.updated_at || '',
      default_branch: data.default_branch,
      private: data.private,
    };
  }

  /**
   * Get repository contents (files and directories)
   */
  async getRepoContents(
    owner: string,
    repo: string,
    path: string = '',
    ref?: string,
  ): Promise<GitHubFile[]> {
    const { data } = await this.octokit.rest.repos.getContent({
      owner,
      repo,
      path,
      ref,
    });

    if (!Array.isArray(data)) {
      // Single file returned
      return [
        {
          name: data.name,
          path: data.path,
          sha: data.sha,
          size: data.size,
          type: data.type as 'file' | 'dir',
          url: data.url,
          html_url: data.html_url || '',
          download_url: data.download_url || null,
        },
      ];
    }

    return data.map((item) => ({
      name: item.name,
      path: item.path,
      sha: item.sha,
      size: item.size,
      type: item.type as 'file' | 'dir',
      url: item.url,
      html_url: item.html_url || '',
      download_url: item.download_url || null,
    }));
  }

  /**
   * Get file content from repository
   */
  async getFileContent(
    owner: string,
    repo: string,
    path: string,
    ref?: string,
  ): Promise<GitHubFileContent> {
    const { data } = await this.octokit.rest.repos.getContent({
      owner,
      repo,
      path,
      ref,
    });

    if (Array.isArray(data) || data.type !== 'file') {
      throw new Error('Path is not a file');
    }

    // Decode base64 content
    const content =
      'content' in data && data.content
        ? Buffer.from(data.content, 'base64').toString('utf-8')
        : '';

    return {
      name: data.name,
      path: data.path,
      sha: data.sha,
      size: data.size,
      content,
      encoding: 'encoding' in data ? (data.encoding as string) : 'base64',
    };
  }

  /**
   * Get recent commits for a repository
   */
  async getCommits(
    owner: string,
    repo: string,
    options?: { sha?: string; path?: string; per_page?: number },
  ): Promise<GitHubCommit[]> {
    const { data } = await this.octokit.rest.repos.listCommits({
      owner,
      repo,
      sha: options?.sha,
      path: options?.path,
      per_page: options?.per_page || 10,
    });

    return data.map((commit) => ({
      sha: commit.sha,
      message: commit.commit.message,
      author: {
        name: commit.commit.author?.name || '',
        email: commit.commit.author?.email || '',
        date: commit.commit.author?.date || '',
      },
      committer: {
        name: commit.commit.committer?.name || '',
        email: commit.commit.committer?.email || '',
        date: commit.commit.committer?.date || '',
      },
      html_url: commit.html_url,
    })) as GitHubCommit[];
  }

  /**
   * Get repository tree (recursive file listing)
   */
  async getTree(
    owner: string,
    repo: string,
    sha: string = 'HEAD',
    recursive: boolean = true,
  ): Promise<GitHubFile[]> {
    const { data } = await this.octokit.rest.git.getTree({
      owner,
      repo,
      tree_sha: sha,
      recursive: recursive ? 'true' : undefined,
    });

    return (
      data.tree as Array<{
        path?: string;
        sha?: string;
        size?: number;
        type?: string;
        url?: string;
      }>
    )
      .filter((item) => item.type === 'blob' || item.type === 'tree')
      .map((item) => ({
        name: item.path?.split('/').pop() || '',
        path: item.path || '',
        sha: item.sha || '',
        size: item.size || 0,
        type: (item.type === 'blob' ? 'file' : 'dir') as 'file' | 'dir',
        url: item.url || '',
        html_url: '',
        download_url: null,
      }));
  }

  /**
   * Get repository languages
   */
  async getLanguages(
    owner: string,
    repo: string,
  ): Promise<Record<string, number>> {
    const { data } = await this.octokit.rest.repos.listLanguages({
      owner,
      repo,
    });

    return data;
  }

  /**
   * Get repository branches
   */
  async getBranches(
    owner: string,
    repo: string,
  ): Promise<{ name: string; sha: string }[]> {
    const { data } = await this.octokit.rest.repos.listBranches({
      owner,
      repo,
      per_page: 100,
    });

    return data.map((branch) => ({
      name: branch.name,
      sha: branch.commit.sha,
    })) as { name: string; sha: string }[];
  }
}

/**
 * Parse GitHub repository URL to extract owner and repo name
 */
export function parseGitHubUrl(
  url: string,
): { owner: string; repo: string } | null {
  // Handle various GitHub URL formats
  const patterns = [
    /github\.com\/([^\/]+)\/([^\/\.]+)/,
    /github\.com:([^\/]+)\/([^\/\.]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return {
        owner: match[1],
        repo: match[2].replace(/\.git$/, ''),
      };
    }
  }

  return null;
}

/**
 * Create GitHubClient instance with user's token
 */
export function createGitHubClient(token: string): GitHubClient {
  return new GitHubClient(token);
}

/**
 * Get file extension language mapping for syntax highlighting
 */
export function getLanguageFromPath(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase() || '';

  const languageMap: Record<string, string> = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    py: 'python',
    rb: 'ruby',
    java: 'java',
    kt: 'kotlin',
    go: 'go',
    rs: 'rust',
    cpp: 'cpp',
    c: 'c',
    h: 'c',
    hpp: 'cpp',
    cs: 'csharp',
    php: 'php',
    swift: 'swift',
    sql: 'sql',
    html: 'html',
    css: 'css',
    scss: 'scss',
    sass: 'sass',
    less: 'less',
    json: 'json',
    yaml: 'yaml',
    yml: 'yaml',
    xml: 'xml',
    md: 'markdown',
    sh: 'bash',
    bash: 'bash',
    zsh: 'bash',
    dockerfile: 'dockerfile',
    prisma: 'prisma',
    graphql: 'graphql',
    vue: 'vue',
    svelte: 'svelte',
  };

  return languageMap[ext] || 'plaintext';
}

/**
 * Check if file is binary (should not be displayed as text)
 */
export function isBinaryFile(path: string): boolean {
  const ext = path.split('.').pop()?.toLowerCase() || '';

  const binaryExtensions = [
    'png',
    'jpg',
    'jpeg',
    'gif',
    'ico',
    'webp',
    'svg',
    'bmp',
    'pdf',
    'doc',
    'docx',
    'xls',
    'xlsx',
    'ppt',
    'pptx',
    'zip',
    'tar',
    'gz',
    'rar',
    '7z',
    'exe',
    'dll',
    'so',
    'dylib',
    'mp3',
    'mp4',
    'avi',
    'mov',
    'wav',
    'woff',
    'woff2',
    'ttf',
    'eot',
    'otf',
  ];

  return binaryExtensions.includes(ext);
}
