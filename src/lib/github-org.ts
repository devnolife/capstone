import { Octokit } from 'octokit';

// GitHub Organization configuration
const GITHUB_ORG_NAME = process.env.GITHUB_ORG_NAME || 'capstone-informatika';
const GITHUB_ORG_TOKEN = process.env.GITHUB_ORG_TOKEN;

export interface GitHubUser {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
  name: string | null;
  type: string;
}

export interface ForkResult {
  success: boolean;
  repoUrl?: string;
  repoName?: string;
  fullName?: string;
  error?: string;
}

export interface CollaboratorResult {
  success: boolean;
  username?: string;
  error?: string;
}

export interface OrgRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  clone_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  size: number;
  default_branch: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  private: boolean;
  fork: boolean;
  archived: boolean;
  topics: string[];
  // Parent info if forked
  parent?: {
    full_name: string;
    html_url: string;
    owner: {
      login: string;
      avatar_url: string;
    };
  } | null;
}

/**
 * GitHub Organization Client for managing capstone repositories
 */
export class GitHubOrgClient {
  private octokit: Octokit;
  private orgName: string;

  constructor(token?: string) {
    const authToken = token || GITHUB_ORG_TOKEN;
    if (!authToken) {
      throw new Error('GitHub organization token is not configured');
    }
    this.octokit = new Octokit({ auth: authToken });
    this.orgName = GITHUB_ORG_NAME;
  }

  /**
   * Generate a slug from project title for repo naming
   * Format: capstone-{year}-{title-slug}
   */
  static generateRepoName(title: string, year?: string): string {
    const currentYear = year || new Date().getFullYear().toString();
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
      .substring(0, 50); // Limit length

    return `capstone-${currentYear}-${slug}`;
  }

  /**
   * Search for GitHub users by username
   */
  async searchUsers(query: string, perPage: number = 10): Promise<GitHubUser[]> {
    try {
      const { data } = await this.octokit.rest.search.users({
        q: `${query} in:login`,
        per_page: perPage,
      });

      return data.items.map((user) => ({
        id: user.id,
        login: user.login,
        avatar_url: user.avatar_url,
        html_url: user.html_url,
        name: user.name || null,
        type: user.type,
      }));
    } catch (error) {
      console.error('Error searching GitHub users:', error);
      return [];
    }
  }

  /**
   * Get a specific GitHub user by username
   */
  async getUser(username: string): Promise<GitHubUser | null> {
    try {
      const { data } = await this.octokit.rest.users.getByUsername({
        username,
      });

      return {
        id: data.id,
        login: data.login,
        avatar_url: data.avatar_url,
        html_url: data.html_url,
        name: data.name || null,
        type: data.type,
      };
    } catch (error) {
      console.error(`Error getting GitHub user ${username}:`, error);
      return null;
    }
  }

  /**
   * Fork a repository to the organization
   */
  async forkToOrg(
    sourceOwner: string,
    sourceRepo: string,
    newRepoName?: string,
  ): Promise<ForkResult> {
    try {
      // First, verify source repo exists and is accessible
      try {
        await this.octokit.rest.repos.get({
          owner: sourceOwner,
          repo: sourceRepo,
        });
      } catch (sourceError) {
        console.error('Source repo not accessible:', sourceError);
        return {
          success: false,
          error: `Repository sumber ${sourceOwner}/${sourceRepo} tidak ditemukan atau tidak dapat diakses`,
        };
      }
      
      // Check if repo already exists in org
      try {
        const existingRepo = await this.octokit.rest.repos.get({
          owner: this.orgName,
          repo: newRepoName || sourceRepo,
        });
        
        if (existingRepo.data) {
          return {
            success: true,
            repoUrl: existingRepo.data.html_url,
            repoName: existingRepo.data.name,
            fullName: existingRepo.data.full_name,
          };
        }
      } catch {
        // Repo doesn't exist, proceed with fork
      }

      // Create fork in the organization
      const { data } = await this.octokit.rest.repos.createFork({
        owner: sourceOwner,
        repo: sourceRepo,
        organization: this.orgName,
        name: newRepoName,
        default_branch_only: false,
      });

      // Wait a bit for the fork to be ready
      await new Promise((resolve) => setTimeout(resolve, 2000));

      return {
        success: true,
        repoUrl: data.html_url,
        repoName: data.name,
        fullName: data.full_name,
      };
    } catch (error) {
      console.error('Error forking repository to org:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: `Failed to fork repository: ${errorMessage}`,
      };
    }
  }

  /**
   * Add a collaborator to a repository in the organization
   */
  async addCollaborator(
    repoName: string,
    username: string,
    permission: 'pull' | 'push' | 'admin' | 'maintain' | 'triage' = 'push',
  ): Promise<CollaboratorResult> {
    try {
      await this.octokit.rest.repos.addCollaborator({
        owner: this.orgName,
        repo: repoName,
        username,
        permission,
      });

      return {
        success: true,
        username,
      };
    } catch (error) {
      console.error(`Error adding collaborator ${username}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        username,
        error: `Failed to add collaborator: ${errorMessage}`,
      };
    }
  }

  /**
   * Remove a collaborator from a repository in the organization
   */
  async removeCollaborator(
    repoName: string,
    username: string,
  ): Promise<CollaboratorResult> {
    try {
      await this.octokit.rest.repos.removeCollaborator({
        owner: this.orgName,
        repo: repoName,
        username,
      });

      return {
        success: true,
        username,
      };
    } catch (error) {
      console.error(`Error removing collaborator ${username}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        username,
        error: `Failed to remove collaborator: ${errorMessage}`,
      };
    }
  }

  /**
   * List collaborators on a repository
   */
  async listCollaborators(repoName: string): Promise<GitHubUser[]> {
    try {
      const { data } = await this.octokit.rest.repos.listCollaborators({
        owner: this.orgName,
        repo: repoName,
        per_page: 100,
      });

      return data.map((user) => ({
        id: user.id,
        login: user.login,
        avatar_url: user.avatar_url,
        html_url: user.html_url,
        name: null,
        type: user.type || 'User',
      }));
    } catch (error) {
      console.error('Error listing collaborators:', error);
      return [];
    }
  }

  /**
   * Check if user is a member of the organization
   */
  async isOrgMember(username: string): Promise<boolean> {
    try {
      await this.octokit.rest.orgs.checkMembershipForUser({
        org: this.orgName,
        username,
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Update repository visibility
   */
  async updateRepoVisibility(
    repoName: string,
    isPrivate: boolean,
  ): Promise<boolean> {
    try {
      await this.octokit.rest.repos.update({
        owner: this.orgName,
        repo: repoName,
        private: isPrivate,
      });
      return true;
    } catch (error) {
      console.error('Error updating repository visibility:', error);
      return false;
    }
  }

  /**
   * Delete a repository from the organization (use with caution!)
   */
  async deleteRepo(repoName: string): Promise<boolean> {
    try {
      await this.octokit.rest.repos.delete({
        owner: this.orgName,
        repo: repoName,
      });
      return true;
    } catch (error) {
      console.error('Error deleting repository:', error);
      return false;
    }
  }

  /**
   * Get organization name
   */
  getOrgName(): string {
    return this.orgName;
  }

  /**
   * List all repositories in the organization
   */
  async listOrgRepos(options?: {
    type?: 'all' | 'public' | 'private' | 'forks' | 'sources';
    sort?: 'created' | 'updated' | 'pushed' | 'full_name';
    direction?: 'asc' | 'desc';
    perPage?: number;
    page?: number;
  }): Promise<{ repos: OrgRepo[]; total: number }> {
    try {
      const { data } = await this.octokit.rest.repos.listForOrg({
        org: this.orgName,
        type: options?.type || 'all',
        sort: options?.sort || 'updated',
        direction: options?.direction || 'desc',
        per_page: options?.perPage || 100,
        page: options?.page || 1,
      });

      const repos: OrgRepo[] = data.map((repo) => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description || null,
        html_url: repo.html_url,
        clone_url: repo.clone_url || '',
        language: repo.language || null,
        stargazers_count: repo.stargazers_count || 0,
        forks_count: repo.forks_count || 0,
        open_issues_count: repo.open_issues_count || 0,
        size: repo.size || 0,
        default_branch: repo.default_branch || 'main',
        created_at: repo.created_at || '',
        updated_at: repo.updated_at || '',
        pushed_at: repo.pushed_at || '',
        private: repo.private,
        fork: repo.fork,
        archived: repo.archived || false,
        topics: repo.topics || [],
        parent: null, // Will be populated if needed via getOrgRepo
      }));

      return { repos, total: repos.length };
    } catch (error) {
      console.error('Error listing organization repos:', error);
      return { repos: [], total: 0 };
    }
  }

  /**
   * Get detailed information about a specific repository in the organization
   */
  async getOrgRepo(repoName: string): Promise<OrgRepo | null> {
    try {
      const { data } = await this.octokit.rest.repos.get({
        owner: this.orgName,
        repo: repoName,
      });

      return {
        id: data.id,
        name: data.name,
        full_name: data.full_name,
        description: data.description || null,
        html_url: data.html_url,
        clone_url: data.clone_url || '',
        language: data.language || null,
        stargazers_count: data.stargazers_count || 0,
        forks_count: data.forks_count || 0,
        open_issues_count: data.open_issues_count || 0,
        size: data.size || 0,
        default_branch: data.default_branch || 'main',
        created_at: data.created_at || '',
        updated_at: data.updated_at || '',
        pushed_at: data.pushed_at || '',
        private: data.private,
        fork: data.fork,
        archived: data.archived || false,
        topics: data.topics || [],
        parent: data.parent ? {
          full_name: data.parent.full_name,
          html_url: data.parent.html_url,
          owner: {
            login: data.parent.owner.login,
            avatar_url: data.parent.owner.avatar_url,
          },
        } : null,
      };
    } catch (error) {
      console.error(`Error getting org repo ${repoName}:`, error);
      return null;
    }
  }

  /**
   * Get all forked capstone repositories (repos that start with 'capstone-')
   */
  async listCapstoneRepos(): Promise<OrgRepo[]> {
    try {
      const { repos } = await this.listOrgRepos({ type: 'forks', perPage: 100 });
      
      // Filter only capstone repos (naming convention: capstone-{year}-{slug})
      return repos.filter(repo => repo.name.startsWith('capstone-'));
    } catch (error) {
      console.error('Error listing capstone repos:', error);
      return [];
    }
  }

  /**
   * Get repository statistics (languages, commits count, contributors)
   */
  async getRepoStats(repoName: string): Promise<{
    languages: Record<string, number>;
    commitCount: number;
    contributors: Array<{ login: string; contributions: number; avatar_url: string }>;
  } | null> {
    try {
      const [languagesResponse, contributorsResponse, commitsResponse] = await Promise.all([
        this.octokit.rest.repos.listLanguages({
          owner: this.orgName,
          repo: repoName,
        }),
        this.octokit.rest.repos.listContributors({
          owner: this.orgName,
          repo: repoName,
          per_page: 100,
        }),
        this.octokit.rest.repos.listCommits({
          owner: this.orgName,
          repo: repoName,
          per_page: 1,
        }),
      ]);

      // Get total commit count from Link header
      let commitCount = 0;
      const linkHeader = commitsResponse.headers.link;
      if (linkHeader) {
        const match = linkHeader.match(/page=(\d+)>; rel="last"/);
        if (match) {
          commitCount = parseInt(match[1], 10);
        }
      } else {
        commitCount = commitsResponse.data.length;
      }

      return {
        languages: languagesResponse.data,
        commitCount,
        contributors: contributorsResponse.data.map((c) => ({
          login: c.login || 'unknown',
          contributions: c.contributions,
          avatar_url: c.avatar_url || '',
        })),
      };
    } catch (error) {
      console.error(`Error getting repo stats for ${repoName}:`, error);
      return null;
    }
  }
}

/**
 * Create GitHubOrgClient instance
 */
export function createGitHubOrgClient(token?: string): GitHubOrgClient {
  return new GitHubOrgClient(token);
}

/**
 * Helper to parse GitHub URL and extract owner/repo
 */
export function parseGitHubRepoUrl(url: string): { owner: string; repo: string } | null {
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
