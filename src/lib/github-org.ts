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
