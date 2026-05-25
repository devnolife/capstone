import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import GitHub from 'next-auth/providers/github';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { validateSimakCredentials, upsertUserFromSimak } from '@/lib/simak';
import { encryptNullable } from '@/lib/crypto';
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
        username: { label: 'NIM/Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error('NIM/Username dan password diperlukan');
        }

        const username = credentials.username as string;
        const password = credentials.password as string;

        // Check if user exists locally first
        const existingUser = await prisma.user.findUnique({
          where: { username },
        });

        // For MAHASISWA role, try SIMAK validation first
        // Determine if this could be a student NIM (numeric pattern)
        const isStudentNim = /^\d+$/.test(username);

        if (isStudentNim) {
          if (existingUser && !existingUser.isActive) {
            throw new Error('Akun tidak aktif');
          }

          // ---------- FAST PATH: local bcrypt ----------
          // If user already exists and was previously SIMAK-validated, try
          // the local bcrypt hash first to avoid a network call to SIMAK on
          // every login.
          let localPasswordMatches = false;
          if (existingUser?.password && existingUser.simakValidated) {
            localPasswordMatches = await bcrypt.compare(password, existingUser.password);
            if (localPasswordMatches) {
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

          // ---------- FALLBACK: re-check against SIMAK ----------
          // Local hash didn't match (or user is new / never validated).
          // SIMAK passwords can rotate, so we re-validate against the
          // authoritative source. If SIMAK accepts the password, we update
          // (rotate) the local bcrypt hash so the fast path works next time.
          const simakResult = await validateSimakCredentials(username, password);

          if (simakResult.success && simakResult.data) {
            const bcryptHash = await bcrypt.hash(password, 12);
            const user = await upsertUserFromSimak(
              prisma,
              simakResult.data,
              bcryptHash,
            );

            if (existingUser) {
              console.info(
                `[auth] Password rotated for NIM ${username} via SIMAK (local hash was stale).`,
              );
            } else {
              console.info(`[auth] New mahasiswa provisioned from SIMAK: ${username}.`);
            }

            return {
              id: user.id,
              username: user.username,
              name: user.name,
              role: user.role as Role,
              image: null,
              githubUsername: null,
            };
          }

          // ---------- LAST RESORT: local fallback when SIMAK is unreachable ----------
          // SIMAK rejected OR was unreachable. If we have an existing user
          // with a usable local hash, accept the local match so students can
          // still log in during a SIMAK outage. (We already know
          // `localPasswordMatches` is false above for simakValidated users,
          // but a user might not be `simakValidated` yet — check anyway.)
          if (existingUser?.password) {
            const isPasswordValid =
              localPasswordMatches ||
              (await bcrypt.compare(password, existingUser.password));
            if (isPasswordValid) {
              console.warn(
                `[auth] SIMAK rejected/unreachable for NIM ${username}; accepted local hash fallback.`,
              );
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

          // Both SIMAK and local validation failed
          throw new Error(simakResult.message || 'NIM atau password salah');
        }

        // For non-student users (dosen, admin), use local validation only
        if (!existingUser || !existingUser.password) {
          throw new Error('NIM/Username atau password salah');
        }

        const isPasswordValid = await bcrypt.compare(password, existingUser.password);

        if (!isPasswordValid) {
          throw new Error('NIM/Username atau password salah');
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
            // SECURITY: Do NOT auto-create accounts via GitHub OAuth.
            // Accounts must be provisioned through SIMAK (mahasiswa) or by an
            // admin (dosen/admin). GitHub login is for *linking* an existing
            // account only. Otherwise anyone on the internet could create a
            // MAHASISWA account.
            console.warn(
              `[auth] Rejected GitHub sign-in for unprovisioned user: ${githubProfile.login} (${githubProfile.email ?? 'no email'})`,
            );
            return false;
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

          // Store access token for GitHub API access (encrypted at rest)
          if (account.access_token) {
            const encryptedToken = encryptNullable(account.access_token);
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { githubToken: encryptedToken },
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
