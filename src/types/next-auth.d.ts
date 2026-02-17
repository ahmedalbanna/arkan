/**
 * NextAuth Type Definitions
 * Extends NextAuth types with custom fields
 */

import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string;
      role: string;
      credits: number;
    };
    hasuraToken?: {
      'x-hasura-allowed-roles': string[];
      'x-hasura-default-role': string;
      'x-hasura-user-id': string;
      'x-hasura-role': string;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    image?: string;
    role?: string;
    credits?: number;
    passwordHash?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId?: string;
    role?: string;
    credits?: number;
    'https://hasura.io/jwt/claims'?: {
      'x-hasura-allowed-roles': string[];
      'x-hasura-default-role': string;
      'x-hasura-user-id': string;
      'x-hasura-role': string;
    };
  }
}
