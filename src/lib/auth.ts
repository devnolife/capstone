import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import type { Role } from '@/generated/prisma';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: Role;
      image?: string | null;
      githubUsername?: string | null;
    };
  }

  interface User {
    role: Role;
    githubUsername?: string | null;
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id: string;
    role: Role;
    githubUsername?: string | null;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma) as never,
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
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email dan password diperlukan');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) {
          throw new Error('Email atau password salah');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );

        if (!isPasswordValid) {
          throw new Error('Email atau password salah');
        }

        if (!user.isActive) {
          throw new Error('Akun tidak aktif');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.avatarUrl,
          githubUsername: user.githubUsername,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'github') {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        if (existingUser) {
          // Update GitHub info for existing user
          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              githubId: account.providerAccountId,
              githubUsername: (profile as { login?: string })?.login || null,
              githubToken: account.access_token,
              avatarUrl: user.image || existingUser.avatarUrl,
            },
          });
        } else {
          // Create new user with GitHub
          await prisma.user.create({
            data: {
              email: user.email!,
              name: user.name || 'User',
              role: 'MAHASISWA', // Default role for new GitHub users
              githubId: account.providerAccountId,
              githubUsername: (profile as { login?: string })?.login || null,
              githubToken: account.access_token,
              avatarUrl: user.image,
            },
          });
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.githubUsername = dbUser.githubUsername;
        }
      }

      // Store GitHub token if available
      if (account?.provider === 'github' && account.access_token) {
        await prisma.user.updateMany({
          where: { email: token.email! },
          data: { githubToken: account.access_token },
        });
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.githubUsername = token.githubUsername;
      }
      return session;
    },
  },
});
