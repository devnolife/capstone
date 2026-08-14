import NextAuth, { CredentialsSignin } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import GitHub from 'next-auth/providers/github';
import Keycloak from 'next-auth/providers/keycloak';
import prisma from '@/lib/prisma';
import { encryptNullable } from '@/lib/crypto';
import { isAdminAccessCodeValid } from '@/lib/admin-access-code';
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

/**
 * Error login dengan pesan yang diteruskan ke client via `code`.
 * NextAuth v5 menyembunyikan Error biasa sebagai "Configuration",
 * jadi kita pakai subclass CredentialsSignin agar pesan asli sampai ke UI.
 */
class LoginError extends CredentialsSignin {
  constructor(message: string) {
    super(message);
    this.code = message;
  }
}


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
    /* Provider SSO hanya didaftarkan bila env-nya lengkap. Tanpa penjagaan ini
       Auth.js melempar InvalidEndpoints yang mematikan SELURUH endpoint auth
       (termasuk login credentials), bukan hanya tombol SSO. */
    ...(process.env.SSO_ISSUER && process.env.SSO_CLIENT_ID
      ? [
        Keycloak({
          // SSO Unismuh (Keycloak OIDC) — lihat https://sso.if.unismuh.ac.id/docs/
          id: 'sso-unismuh',
          name: 'SSO Unismuh',
          issuer: process.env.SSO_ISSUER,
          clientId: process.env.SSO_CLIENT_ID,
          clientSecret: process.env.SSO_CLIENT_SECRET,
          authorization: { params: { scope: 'openid profile email' } },
        }),
      ]
      : []),
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? [
        GitHub({
          clientId: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
          authorization: {
            params: {
              scope: 'read:user user:email repo',
            },
          },
        }),
      ]
      : []),
    Credentials({
      name: 'credentials',
      credentials: {
        accessCode: { label: 'Kode Akses', type: 'password' },
      },
      async authorize(credentials) {
        // Login credentials sekarang HANYA untuk ADMIN dan satu-satunya faktor
        // adalah kode akses (ADMIN_ACCESS_CODE). Mahasiswa & dosen memakai SSO.
        if (!isAdminAccessCodeValid(credentials?.accessCode)) {
          throw new LoginError('Kode akses tidak valid');
        }

        const adminUsername = process.env.ADMIN_USERNAME;
        const adminUser = adminUsername
          ? await prisma.user.findUnique({ where: { username: adminUsername } })
          : await prisma.user.findFirst({
            where: { role: 'ADMIN' as Role, isActive: true },
            orderBy: { createdAt: 'asc' },
          });

        if (!adminUser || adminUser.role !== ('ADMIN' as Role)) {
          throw new LoginError('Akun admin tidak ditemukan');
        }

        if (!adminUser.isActive) {
          throw new LoginError('Akun tidak aktif');
        }

        return {
          id: adminUser.id,
          username: adminUser.username,
          name: adminUser.name,
          role: adminUser.role,
          image: adminUser.image,
          githubUsername: adminUser.githubUsername,
        };
      },
    }),
  ],
  debug: process.env.NODE_ENV === 'development', // Enable debug in development
  callbacks: {
    async signIn({ user, account, profile }) {
      // ---------- SSO Unismuh (Keycloak OIDC) ----------
      if (account?.provider === 'sso-unismuh' && profile) {
        const sso = profile as unknown as {
          sub: string;
          preferred_username?: string;
          name?: string;
          email?: string;
          picture?: string;
          nim?: string;
          nidn?: string;
          nama_prodi?: string;
          realm_access?: { roles?: string[] };
        };

        try {
          const username = sso.preferred_username || sso.nim || sso.nidn || sso.sub;
          const roles = sso.realm_access?.roles ?? [];
          // Petakan realm role SSO → Role aplikasi
          const role: Role = roles.includes('dosen')
            ? ('DOSEN_PENGUJI' as Role)
            : roles.includes('admin-akademik') || roles.includes('pimpinan')
              ? ('ADMIN' as Role)
              : ('MAHASISWA' as Role);

          // Cari user: kunci utama `ssoSub`, fallback username (NIM/NIDN) lalu email
          let existingUser = await prisma.user.findUnique({ where: { ssoSub: sso.sub } });
          if (!existingUser) {
            existingUser = await prisma.user.findUnique({ where: { username } });
          }
          if (!existingUser && sso.email) {
            existingUser = await prisma.user.findUnique({ where: { email: sso.email } });
          }

          if (existingUser) {
            if (!existingUser.isActive) return false;
            existingUser = await prisma.user.update({
              where: { id: existingUser.id },
              data: {
                ssoSub: sso.sub,
                name: sso.name || existingUser.name,
                email: sso.email || existingUser.email,
                image: existingUser.image || sso.picture || undefined,
                nim: sso.nim || existingUser.nim,
                prodi: sso.nama_prodi || existingUser.prodi,
                simakValidated: true,
                simakLastSync: new Date(),
              },
            });
          } else {
            // Provision user baru — identitas sudah diverifikasi Keycloak (akun kampus)
            existingUser = await prisma.user.create({
              data: {
                username,
                ssoSub: sso.sub,
                name: sso.name || username,
                email: sso.email || null,
                image: sso.picture || null,
                role,
                nim: sso.nim || null,
                nip: sso.nidn || null,
                prodi: sso.nama_prodi || null,
                simakValidated: true,
                simakLastSync: new Date(),
              },
            });
            console.info(`[auth] User baru diprovisi dari SSO: ${username} (${role})`);
          }

          user.id = existingUser.id;
          return true;
        } catch (error) {
          console.error('[auth] SSO sign in error:', error);
          return false;
        }
      }

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
        // For OAuth (GitHub / SSO Unismuh), fetch user from database
        if (account?.provider === 'github' || account?.provider === 'sso-unismuh') {
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
          // For credentials login: percayai nilai dari authorize() dulu
          // (agar fake login & kondisi DB-down tetap jalan), lalu coba
          // segarkan dari database jika tersedia.
          const authUser = user as {
            id: string;
            username: string;
            role: Role;
            githubUsername?: string | null;
          };
          token.id = authUser.id;
          token.username = authUser.username;
          token.role = authUser.role;
          token.githubUsername = authUser.githubUsername ?? null;

          try {
            const dbUser = await prisma.user.findUnique({
              where: { username: authUser.username },
            });

            if (dbUser) {
              token.id = dbUser.id;
              token.username = dbUser.username;
              token.role = dbUser.role;
              token.githubUsername = dbUser.githubUsername;
            }
          } catch (error) {
            console.warn(
              '[auth] DB tidak tersedia saat refresh JWT — pakai data dari authorize().',
              error instanceof Error ? error.message : error,
            );
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
