import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import GitHub from 'next-auth/providers/github';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import type { Role } from '@/generated/prisma';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      username: string;
      name: string;
      role: Role;
      image?: string | null;
      githubUsername?: string | null;
    };
  }

  interface User {
    username: string;
    role: Role;
    githubUsername?: string | null;
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id: string;
    username: string;
    role: Role;
    githubUsername?: string | null;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  // Note: We don't use PrismaAdapter here because our User model
  // has required fields (username) that the adapter doesn't handle.
  // Instead, we handle user creation/lookup manually in callbacks.
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'read:user user:email repo',
        },
      },
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        username: { label: 'NIM/NIP', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error('NIM/NIP dan password diperlukan');
        }

        const user = await prisma.user.findUnique({
          where: { username: credentials.username as string },
        });

        if (!user || !user.password) {
          throw new Error('NIM/NIP atau password salah');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );

        if (!isPasswordValid) {
          throw new Error('NIM/NIP atau password salah');
        }

        if (!user.isActive) {
          throw new Error('Akun tidak aktif');
        }

        return {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
          image: user.image,
          githubUsername: user.githubUsername,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle GitHub OAuth sign in
      if (account?.provider === 'github' && profile) {
        const githubProfile = profile as unknown as {
          id: number;
          login: string;
          name?: string;
          avatar_url?: string;
          email?: string;
        };

        try {
          // Check if user already exists with this GitHub ID
          let existingUser = await prisma.user.findUnique({
            where: { githubId: String(githubProfile.id) },
          });

          // Also check by email if GitHub ID not found
          if (!existingUser && githubProfile.email) {
            existingUser = await prisma.user.findUnique({
              where: { email: githubProfile.email },
            });

            // If found by email, link the GitHub account
            if (existingUser) {
              await prisma.user.update({
                where: { id: existingUser.id },
                data: {
                  githubId: String(githubProfile.id),
                  githubUsername: githubProfile.login,
                  image: githubProfile.avatar_url || existingUser.image,
                },
              });
            }
          }

          if (!existingUser) {
            // Check if username (GitHub login) already exists
            const usernameExists = await prisma.user.findUnique({
              where: { username: githubProfile.login },
            });

            // Generate unique username if needed
            let username = githubProfile.login;
            if (usernameExists) {
              username = `${githubProfile.login}_${githubProfile.id}`;
            }

            // Create new user
            existingUser = await prisma.user.create({
              data: {
                username: username,
                name: githubProfile.name || githubProfile.login,
                email: githubProfile.email,
                githubId: String(githubProfile.id),
                githubUsername: githubProfile.login,
                image: githubProfile.avatar_url,
                role: 'MAHASISWA', // Default role for new GitHub users
                isActive: true,
              },
            });
          } else {
            // Update existing user's GitHub info
            await prisma.user.update({
              where: { id: existingUser.id },
              data: {
                githubUsername: githubProfile.login,
                image: githubProfile.avatar_url || existingUser.image,
              },
            });
          }

          // Store access token for GitHub API access
          if (account.access_token) {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { githubToken: account.access_token },
            });

            // Also store in Account table for token refresh
            await prisma.account.upsert({
              where: {
                provider_providerAccountId: {
                  provider: 'github',
                  providerAccountId: String(githubProfile.id),
                },
              },
              update: {
                access_token: account.access_token,
                refresh_token: account.refresh_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
              },
              create: {
                userId: existingUser.id,
                type: 'oauth',
                provider: 'github',
                providerAccountId: String(githubProfile.id),
                access_token: account.access_token,
                refresh_token: account.refresh_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
              },
            });
          }

          // Check if user is active
          if (!existingUser.isActive) {
            return false;
          }

          // Set user id for JWT callback
          user.id = existingUser.id;
          return true;
        } catch (error) {
          console.error('GitHub sign in error:', error);
          return false;
        }
      }

      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        // For GitHub OAuth, fetch user from database
        if (account?.provider === 'github') {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
          });

          if (dbUser) {
            token.id = dbUser.id;
            token.username = dbUser.username;
            token.role = dbUser.role;
            token.githubUsername = dbUser.githubUsername;
          }
        } else {
          // For credentials login
          const dbUser = await prisma.user.findUnique({
            where: { username: (user as { username: string }).username },
          });

          if (dbUser) {
            token.id = dbUser.id;
            token.username = dbUser.username;
            token.role = dbUser.role;
            token.githubUsername = dbUser.githubUsername;
          }
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.role = token.role;
        session.user.githubUsername = token.githubUsername;
      }
      return session;
    },
  },
});
