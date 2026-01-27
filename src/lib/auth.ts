import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import GitHub from 'next-auth/providers/github';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { validateSimakCredentials, upsertUserFromSimak } from '@/lib/simak';
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

// For reverse proxy setup: disable __Secure- prefix since the proxy handles HTTPS
// The internal connection from proxy to Next.js is HTTP, but external is HTTPS
const useSecureCookies = false; // Disable for reverse proxy setup
const cookiePrefix = ''; // No prefix needed

// Debug cookie settings
console.log('[AUTH CONFIG] useSecureCookies:', useSecureCookies, 'cookiePrefix:', cookiePrefix);

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  cookies: {
    sessionToken: {
      name: `${cookiePrefix}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: false, // Let the reverse proxy handle HTTPS
      },
    },
    callbackUrl: {
      name: `${cookiePrefix}next-auth.callback-url`,
      options: {
        sameSite: 'lax',
        path: '/',
        secure: false,
      },
    },
    csrfToken: {
      name: `${cookiePrefix}next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: false,
      },
    },
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
        const authStart = Date.now();

        if (!credentials?.username || !credentials?.password) {
          throw new Error('NIM/NIP dan password diperlukan');
        }

        const username = credentials.username as string;
        const password = credentials.password as string;

        console.log(`[AUTH] Login attempt for: ${username}`);

        // Check if user exists locally first
        const existingUser = await prisma.user.findUnique({
          where: { username },
        });

        // For MAHASISWA role, try SIMAK validation first
        // Determine if this could be a student NIM (numeric pattern)
        const isStudentNim = /^\d+$/.test(username);

        if (isStudentNim) {
          // OPTIMIZATION: If user exists locally, already validated with SIMAK, 
          // and password matches locally - skip SIMAK call for faster login
          if (existingUser && existingUser.password && existingUser.simakValidated && existingUser.isActive) {
            console.log(`[AUTH] User exists with SIMAK validation, trying local password...`);
            const isLocalPasswordValid = await bcrypt.compare(password, existingUser.password);
            if (isLocalPasswordValid) {
              console.log(`[AUTH] Local password valid! Login fast path (${Date.now() - authStart}ms)`);
              return {
                id: existingUser.id,
                username: existingUser.username,
                name: existingUser.name,
                role: existingUser.role,
                image: existingUser.image,
                githubUsername: existingUser.githubUsername,
              };
            }
            console.log(`[AUTH] Local password invalid, will try SIMAK...`);
          }

          // Try SIMAK validation (for new users or password changes)
          console.log(`[AUTH] Calling SIMAK API for validation...`);
          const simakResult = await validateSimakCredentials(username, password);

          if (simakResult.success && simakResult.data) {
            console.log(`[AUTH] SIMAK validation successful, upserting user...`);
            // SIMAK validation succeeded, create/update user
            const bcryptHash = await bcrypt.hash(password, 12);
            const user = await upsertUserFromSimak(
              prisma,
              simakResult.data,
              bcryptHash
            );

            console.log(`[AUTH] Login complete via SIMAK (${Date.now() - authStart}ms)`);
            return {
              id: user.id,
              username: user.username,
              name: user.name,
              role: user.role as Role,
              image: null,
              githubUsername: null,
            };
          }

          console.log(`[AUTH] SIMAK validation failed: ${simakResult.message}`);

          // SIMAK validation failed, try local fallback if user exists
          if (existingUser && existingUser.password) {
            console.log(`[AUTH] Trying local fallback...`);
            const isPasswordValid = await bcrypt.compare(password, existingUser.password);

            if (isPasswordValid && existingUser.isActive) {
              console.log(`[AUTH] Local fallback successful (${Date.now() - authStart}ms)`);
              return {
                id: existingUser.id,
                username: existingUser.username,
                name: existingUser.name,
                role: existingUser.role,
                image: existingUser.image,
                githubUsername: existingUser.githubUsername,
              };
            }
          }

          // Neither SIMAK nor local validation succeeded
          throw new Error(simakResult.message || 'NIM atau password salah');
        }

        // For non-student users (dosen, admin), use local validation only
        if (!existingUser || !existingUser.password) {
          throw new Error('NIM/NIP atau password salah');
        }

        const isPasswordValid = await bcrypt.compare(password, existingUser.password);

        if (!isPasswordValid) {
          throw new Error('NIM/NIP atau password salah');
        }

        if (!existingUser.isActive) {
          throw new Error('Akun tidak aktif');
        }

        return {
          id: existingUser.id,
          username: existingUser.username,
          name: existingUser.name,
          role: existingUser.role,
          image: existingUser.image,
          githubUsername: existingUser.githubUsername,
        };
      },
    }),
  ],
  debug: process.env.NODE_ENV === 'development', // Enable debug in development
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
      console.log('[AUTH JWT] user:', user ? 'exists' : 'null', 'account:', account?.provider || 'null');
      
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
      console.log('[AUTH SESSION] token:', token ? { id: token.id, role: token.role } : 'null');
      
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
