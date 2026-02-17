# NextAuth.js Migration Plan

## Overview
Migrate from Firebase Authentication to NextAuth.js for better Next.js integration and flexibility.

---

## Why NextAuth.js?

✅ **Native Next.js integration** - Built for App Router  
✅ **Multiple providers** - OAuth, credentials, email  
✅ **Prisma adapter** - Direct PostgreSQL integration  
✅ **Session management** - JWT or database sessions  
✅ **Middleware support** - Easy route protection  
✅ **Callbacks & events** - Full customization  

---

## Current Firebase Auth Features

| Feature | Firebase Auth | NextAuth.js | Notes |
|---------|---------------|-------------|-------|
| Email/Password | ✅ | ✅ | Need password reset flow |
| Google OAuth | ✅ | ✅ | Direct migration |
| Email Verification | ✅ | ✅ | Built-in with email provider |
| Session Management | ✅ | ✅ | JWT or database sessions |
| Password Reset | ✅ | ✅ | Custom email flow |
| Phone Auth | ✅ | ⚠️ | Requires custom provider |

---

## Installation

```bash
npm install next-auth @next-auth/prisma-adapter bcryptjs
npm install -D @types/bcryptjs
```

---

## NextAuth Configuration

### Basic Setup

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth, { AuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  
  providers: [
    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    
    // Email/Password
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.passwordHash) {
          throw new Error('User not found');
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isCorrectPassword) {
          throw new Error('Invalid password');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      }
    })
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.userId = user.id;
        token.role = user.role;
        token.credits = user.credits;
      }

      // Hasura claims for GraphQL
      token['https://hasura.io/jwt/claims'] = {
        'x-hasura-allowed-roles': [token.role || 'user'],
        'x-hasura-default-role': token.role || 'user',
        'x-hasura-user-id': token.userId,
      };

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.role = token.role as string;
        session.user.credits = token.credits as number;
      }
      return session;
    },

    async signIn({ user, account, profile }) {
      // Allow sign in
      return true;
    },
  },

  pages: {
    signIn: '/login',
    signOut: '/logout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/onboarding'
  },

  events: {
    async signIn({ user }) {
      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      });
    }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

---

## Environment Variables

```env
# .env.local
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-min-32-chars

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/arkan
```

---

## Auth Components

### Login Form

```typescript
// app/login/page.tsx
'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const result = await signIn('credentials', {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid credentials');
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/dashboard' });
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-2xl font-bold">Sign In</h1>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
            />
          </div>

          <Button type="submit" className="w-full">
            Sign In
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={handleGoogleSignIn}
          className="w-full"
        >
          <GoogleIcon className="mr-2 h-4 w-4" />
          Google
        </Button>

        <p className="text-center text-sm">
          Don't have an account?{' '}
          <Link href="/signup" className="underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
```

### Signup Form

```typescript
// app/signup/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import bcrypt from 'bcryptjs';

export default function SignupPage() {
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formData.get('email'),
        password: formData.get('password'),
        name: formData.get('name'),
      }),
    });

    if (response.ok) {
      // Sign in after signup
      await signIn('credentials', {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        callbackUrl: '/onboarding',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Form fields */}
    </form>
  );
}
```

### Signup API Route

```typescript
// app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = SignupSchema.parse(body);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: 'user',
        credits: 10, // Welcome credits
      }
    });

    return NextResponse.json(
      { message: 'User created', userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## Protected Routes (Middleware)

```typescript
// middleware.ts
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');
    
    // Admin route protection
    if (isAdminRoute && token?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/builder/:path*',
    '/admin/:path*',
    '/profile/:path*',
  ]
};
```

---

## Session Management

### Client-Side Session

```typescript
'use client';

import { useSession } from 'next-auth/react';

export function UserProfile() {
  const { data: session, status } = useSession();

  if (status === 'loading') return <Skeleton />;
  if (status === 'unauthenticated') return <LoginButton />;

  return (
    <div>
      <p>Welcome, {session.user.name}</p>
      <p>Credits: {session.user.credits}</p>
    </div>
  );
}
```

### Server-Side Session

```typescript
// Server Component
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return <div>Hello {session.user.name}</div>;
}
```

---

## Migration Strategy

### Phase 1: Parallel Running
1. Install NextAuth alongside Firebase Auth
2. Create new signup flow with NextAuth
3. Existing users continue with Firebase

### Phase 2: User Migration
```typescript
// Migration script
async function migrateFirebaseUsers() {
  const firebaseUsers = await admin.auth().listUsers();

  for (const fbUser of firebaseUsers.users) {
    // Create in PostgreSQL
    await prisma.user.upsert({
      where: { email: fbUser.email! },
      update: {
        emailVerified: fbUser.emailVerified,
        emailVerifiedAt: fbUser.emailVerified ? new Date() : null,
      },
      create: {
        id: fbUser.uid,
        email: fbUser.email!,
        name: fbUser.displayName || 'User',
        emailVerified: fbUser.emailVerified,
        passwordHash: null, // Users must reset password
        role: 'user',
      }
    });

    // Create OAuth accounts
    for (const provider of fbUser.providerData) {
      await prisma.account.create({
        data: {
          userId: fbUser.uid,
          type: 'oauth',
          provider: provider.providerId.replace('.com', ''),
          providerAccountId: provider.uid,
        }
      });
    }
  }
}
```

### Phase 3: Password Reset
- Force password reset for credential users
- Send email with reset link
- Users set new password in NextAuth

---

## TypeScript Types

```typescript
// types/next-auth.d.ts
import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    role: string;
    credits: number;
  }

  interface Session {
    user: User & {
      id: string;
      role: string;
      credits: number;
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId: string;
    role: string;
    credits: number;
  }
}
```

---

## Summary

NextAuth.js provides:
- ✅ Seamless Next.js integration
- ✅ Multiple auth providers
- ✅ Type-safe sessions
- ✅ Middleware protection
- ✅ Prisma adapter for PostgreSQL

Migration requires password reset for existing users but provides better long-term flexibility.
