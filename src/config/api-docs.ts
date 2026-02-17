'use client';

import {
  Shield,
  Key,
  FolderKanban,
  Wand2,
  type LucideIcon,
} from 'lucide-react';

export interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  auth: 'admin' | 'user' | 'public';
  parameters?: Record<string, any>;
  requestBody?: Record<string, any>;
  responseBody?: Record<string, any>;
}

export interface ApiSection {
  id: string;
  title: string;
  icon: LucideIcon;
  endpoints: ApiEndpoint[];
}

export const apiDocsConfig: ApiSection[] = [
  {
    id: 'admin',
    title: 'Admin API',
    icon: Shield,
    endpoints: [
      {
        method: 'GET',
        path: '/api/admin/dashboard-stats',
        description: 'Get statistics for the admin dashboard.',
        auth: 'admin',
        responseBody: {
          totalUsers: 150,
          totalGenerations: 2500,
          pendingPayments: 5,
        },
      },
      {
        method: 'GET',
        path: '/api/admin/users',
        description: 'Get a paginated list of all users.',
        auth: 'admin',
        parameters: {
          limit: '10',
          lastVisibleId: 'USER_ID_FROM_PREVIOUS_PAGE',
        },
        responseBody: {
          users: [{ id: 'user1', name: 'John Doe', email: 'john@example.com' }],
          hasNextPage: true,
          lastVisibleId: 'user_xyz',
        },
      },
      {
        method: 'POST',
        path: '/api/admin/users',
        description: 'Create a new user.',
        auth: 'admin',
        requestBody: {
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'securepassword',
          role: 'user',
          credits: 50,
        },
        responseBody: {
          id: 'newUser123',
          name: 'Jane Doe',
        },
      },
    ],
  },
  {
    id: 'auth',
    title: 'Authentication API',
    icon: Key,
    endpoints: [
      {
        method: 'POST',
        path: '/api/auth/signup',
        description: 'Register a new user account.',
        auth: 'public',
        requestBody: {
          name: 'New User',
          email: 'user@example.com',
          password: 'password123',
        },
        responseBody: {
          user: { uid: 'xyz123', email: 'user@example.com' },
        },
      },
      {
        method: 'POST',
        path: '/api/auth/session',
        description: 'Create a session cookie after successful Firebase client login.',
        auth: 'public',
        requestBody: {
          idToken: 'FIREBASE_ID_TOKEN',
        },
        responseBody: {
          status: 'success',
        },
      },
       {
        method: 'POST',
        path: '/api/auth/guest',
        description: 'Create a temporary guest session.',
        auth: 'public',
        responseBody: {
          status: 'success',
        },
      },
      {
        method: 'POST',
        path: '/api/auth/logout',
        description: 'Log out the current user and clear session cookies.',
        auth: 'public',
        responseBody: {
          message: 'Logout successful',
        },
      },
    ],
  },
  {
    id: 'projects',
    title: 'Projects API',
    icon: FolderKanban,
    endpoints: [
      {
        method: 'GET',
        path: '/api/projects',
        description: 'Get all projects for the authenticated user.',
        auth: 'user',
        responseBody: [
          {
            id: 'proj1',
            name: 'My First Project',
            updatedAt: '2024-01-01T12:00:00Z',
          },
        ],
      },
      {
        method: 'POST',
        path: '/api/projects',
        description: 'Save a new project or update an existing one.',
        auth: 'user',
        requestBody: {
          id: 'optional-project-id',
          name: 'Updated Project Name',
          content: '...',
        },
        responseBody: {
          id: 'proj1',
          name: 'Updated Project Name',
        },
      },
    ],
  },
  {
    id: 'writing-tools',
    title: 'AI Writing Tools API',
    icon: Wand2,
    endpoints: [
      {
        method: 'POST',
        path: '/api/writing-tools/summarize',
        description: 'Summarize a given block of text.',
        auth: 'user',
        requestBody: {
          text: 'A long piece of text to be summarized...',
          length: 'medium',
        },
        responseBody: {
          summary: 'A concise summary of the text.',
        },
      },
      {
        method: 'POST',
        path: '/api/writing-tools/paraphrase',
        description: 'Paraphrase text in a specific style.',
        auth: 'user',
        requestBody: {
          text: 'Some text to paraphrase.',
          mode: 'formal',
        },
        responseBody: {
          paraphrasedText: 'The formally paraphrased text.',
        },
      },
    ],
  },
];
