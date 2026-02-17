/**
 * NextAuth API Route Handler
 * Handles authentication with PostgreSQL + Prisma adapter
 */

import NextAuth, { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from '@/lib/db/prisma';
import bcrypt from 'bcrypt';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  
  providers: [
    // Credentials Provider (Email/Password)
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Missing credentials');
        }

        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error('No user found with this email');
        }

        // For now, skip password check if user doesn't have a password hash
        // (migrated users from Firebase who used OAuth)
        if (!user.passwordHash) {
          throw new Error('Please use OAuth to sign in');
        }

        // Verify password
        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isValid) {
          throw new Error('Invalid password');
        }

        // Return user object
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),

    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true, // For migration period
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
  },

  callbacks: {
    /**
     * JWT Callback - Add custom claims for Hasura
     */
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.userId = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;

        // Fetch full user data for role and credits
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            role: true,
            credits: true,
          },
        });

        token.role = dbUser?.role || 'USER';
        token.credits = dbUser?.credits || 0;
      }

      // Add Hasura claims
      token['https://hasura.io/jwt/claims'] = {
        'x-hasura-allowed-roles': [token.role as string, 'anonymous'],
        'x-hasura-default-role': token.role as string,
        'x-hasura-user-id': token.userId as string,
        'x-hasura-role': token.role as string,
      };

      return token;
    },

    /**
     * Session Callback - Expose user data to client
     */
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
        session.user.role = token.role as string;
        session.user.credits = token.credits as number;
      }

      // Add Hasura token
      session.hasuraToken = token['https://hasura.io/jwt/claims'];

      return session;
    },

    /**
     * Sign In Callback - Update last login
     */
    async signIn({ user }) {
      if (user.id) {
        // Update last login timestamp
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });
      }
      return true;
    },
  },

  events: {
    /**
     * Create Session Event - Handled by database trigger
     */
    async createUser({ user }) {
      console.log('New user created:', user.email);
    },
  },

  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
