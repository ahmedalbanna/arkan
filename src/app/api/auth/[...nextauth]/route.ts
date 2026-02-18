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
        console.log('[NextAuth] authorize() called with email:', credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
          console.error('[NextAuth] Missing credentials');
          throw new Error('Missing credentials');
        }

        // Find user by email
        console.log('[NextAuth] Searching for user with email:', credentials.email);
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          console.error('[NextAuth] No user found with email:', credentials.email);
          throw new Error('No user found with this email');
        }

        console.log('[NextAuth] User found:', {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          credits: user.credits,
          hasPasswordHash: !!user.passwordHash
        });

        // For now, skip password check if user doesn't have a password hash
        // (migrated users from Firebase who used OAuth)
        if (!user.passwordHash) {
          console.error('[NextAuth] User has no password hash, OAuth required');
          throw new Error('Please use OAuth to sign in');
        }

        // Verify password
        console.log('[NextAuth] Verifying password...');
        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isValid) {
          console.error('[NextAuth] Invalid password for user:', user.email);
          throw new Error('Invalid password');
        }

        console.log('[NextAuth] Password verified successfully');

        // Return user object
        const returnedUser = {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
        console.log('[NextAuth] authorize() returning user:', returnedUser);
        return returnedUser;
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
    async jwt({ token, user, account: _account }) {
      console.log('[NextAuth JWT] jwt() called', {
        hasUser: !!user,
        tokenHasUserId: !!token.userId,
        userId: (user?.id || token.userId)
      });

      // Initial sign in
      if (user) {
        console.log('[NextAuth JWT] Initial sign in - user object:', {
          id: user.id,
          email: user.email,
          name: user.name
        });

        token.userId = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;

        // Fetch full user data for role and credits
        console.log('[NextAuth JWT] Fetching full user data for ID:', user.id);
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            role: true,
            credits: true,
          },
        });

        console.log('[NextAuth JWT] Full user data fetched:', {
          role: dbUser?.role,
          credits: dbUser?.credits
        });

        token.role = dbUser?.role || 'USER';
        token.credits = dbUser?.credits || 0;

        console.log('[NextAuth JWT] Token updated with role and credits:', {
          role: token.role,
          credits: token.credits
        });
      }

      // Add Hasura claims
      console.log('[NextAuth JWT] Adding Hasura claims with role:', token.role);
      token['https://hasura.io/jwt/claims'] = {
        'x-hasura-allowed-roles': [token.role as string, 'anonymous'],
        'x-hasura-default-role': token.role as string,
        'x-hasura-user-id': token.userId as string,
        'x-hasura-role': token.role as string,
      };

      console.log('[NextAuth JWT] jwt() returning token:', {
        userId: token.userId,
        email: token.email,
        role: token.role,
        credits: token.credits
      });

      return token;
    },

    /**
     * Session Callback - Expose user data to client
     */
    async session({ session, token }) {
      console.log('[NextAuth Session] session() called with token:', {
        userId: token.userId,
        email: token.email,
        role: token.role,
        credits: token.credits
      });

      if (session.user) {
        session.user.id = token.userId as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
        session.user.role = token.role as string;
        session.user.credits = token.credits as number;

        console.log('[NextAuth Session] Session user object populated:', {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          role: session.user.role,
          credits: session.user.credits
        });
      }

      // Add Hasura token
      session.hasuraToken = token['https://hasura.io/jwt/claims'];
      console.log('[NextAuth Session] Hasura token added:', session.hasuraToken);

      console.log('[NextAuth Session] session() returning:', {
        userExists: !!session.user,
        userId: session.user?.id,
        hasuraTokenExists: !!session.hasuraToken
      });

      return session;
    },

    /**
     * Sign In Callback - Update last login
     */
    async signIn({ user }) {
      console.log('[NextAuth SignIn] signIn() called for user:', user.id);
      
      if (user.id) {
        // Update last login timestamp
        console.log('[NextAuth SignIn] Updating lastLoginAt for user:', user.id);
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });
        console.log('[NextAuth SignIn] lastLoginAt updated successfully');
      }
      
      console.log('[NextAuth SignIn] signIn() returning true');
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
