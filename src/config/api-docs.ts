'use client';

import {
  Shield,
  Key,
  Users,
  FolderKanban,
  Wand2,
  type LucideIcon,
  Database,
  FileUp,
  FileDown,
  Bell,
  Palette,
  Bot,
  PencilRuler,
  Activity,
  UserCog,
  CreditCard,
  Settings,
  Image,
  SlidersHorizontal,
  History,
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
       {
        method: 'POST',
        path: '/forgot-password',
        description: 'Send a password reset link to the user\'s email.',
        auth: 'public',
        requestBody: {
          email: 'user@example.com',
        },
        responseBody: {
          message: 'Password reset email sent.',
        },
      },
    ],
  },
   {
    id: 'user',
    title: 'User & Profile API',
    icon: UserCog,
    endpoints: [
      {
        method: 'GET',
        path: '/api/users/[id]',
        description: 'Get a specific user\'s profile. Can be accessed by the user themselves or an admin.',
        auth: 'user',
        responseBody: {
          id: 'user123',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'user',
          credits: 100
        }
      },
      {
        method: 'PUT',
        path: '/api/users/[id]',
        description: 'Update a user\'s own profile information (name, bio, etc.).',
        auth: 'user',
        requestBody: {
          name: 'Johnathan Doe',
          bio: 'A software developer.'
        },
        responseBody: {
          id: 'user123',
          name: 'Johnathan Doe',
          bio: 'A software developer.'
        }
      },
      {
        method: 'POST',
        path: '/api/users/[id]/upload-profile-picture',
        description: 'Upload a new profile picture for the user.',
        auth: 'user',
        requestBody: {
          file: '(binary file data)'
        },
        responseBody: {
          profilePictureUrl: 'https://storage.googleapis.com/...'
        }
      },
      {
        method: 'GET',
        path: '/api/stats',
        description: 'Get dashboard statistics for the currently authenticated user.',
        auth: 'user',
        responseBody: {
            totalGenerations: 50,
            creditsUsed: 120,
            agentUsageChartData: [{ name: 'summarizer', count: 20 }],
            recentActivity: [{ id: 'log1', agentId: 'summarizer', createdAt: '...'}]
        }
      },
      {
        method: 'GET',
        path: '/api/transactions',
        description: 'Get the transaction history for the current user.',
        auth: 'user',
        responseBody: [{ id: 'txn1', planName: 'Basic Plan', price: 10, status: 'verified' }]
      }
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
            meta: { updatedAt: '2024-01-01T12:00:00Z' }
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
       {
        method: 'GET',
        path: '/api/projects/[id]',
        description: 'Get a specific project by its ID.',
        auth: 'user',
        responseBody: {
            id: 'proj1',
            name: 'My First Project',
            content: '...'
        }
      },
      {
        method: 'PUT',
        path: '/api/projects/[id]',
        description: 'Update an existing project.',
        auth: 'user',
        requestBody: {
          name: 'My Updated Project',
          content: [{ "type": "chapter", "title": "Updated Chapter", "sections": [] }],
        },
        responseBody: {
          id: 'proj1',
          name: 'My Updated Project',
          meta: { updatedAt: '2024-01-02T12:00:00Z' }
        },
      },
      {
        method: 'DELETE',
        path: '/api/projects/[id]',
        description: 'Delete a specific project.',
        auth: 'user',
        responseBody: {
            message: 'Project deleted successfully.'
        }
      }
    ],
  },
  {
    id: 'writing-tools',
    title: 'AI Writing Tools API',
    icon: Wand2,
    endpoints: [
      {
        method: 'POST',
        path: '/api/writing-tools/[tool]',
        description: 'Generic endpoint for all AI writing tools. The `[tool]` parameter can be `summarize`, `paraphrase`, `grammar-checker`, etc.',
        auth: 'user',
        requestBody: {
          text: 'The input text for the AI tool...',
          // ...other tool-specific options
        },
        responseBody: {
          // ...tool-specific output
        },
      },
    ],
  },
   {
    id: 'rag',
    title: 'RAG & Document Indexing API',
    icon: Database,
    endpoints: [
        {
            method: 'GET',
            path: '/api/rag/health',
            description: 'Check the health status of the RAG system components (Vector Store, Ollama).',
            auth: 'public',
            responseBody: {
                status: 'healthy',
                checks: {}
            }
        },
        {
            method: 'POST',
            path: '/api/admin/rag/index',
            description: 'Upload and index a document (PDF, DOCX, TXT, MD) into the RAG system.',
            auth: 'admin',
            requestBody: {
                file: '(binary file data)',
                projectId: 'my-knowledge-base',
            },
            responseBody: {
                success: true,
                chunksCreated: 15,
                fileName: 'document.pdf',
            }
        },
        {
            method: 'GET',
            path: '/api/admin/rag/documents',
            description: 'Get a list of all documents indexed in the RAG system.',
            auth: 'admin',
            responseBody: {
                documents: [{ id: 'doc1', sourceFile: 'mydoc.pdf', chunksCount: 15 }]
            }
        },
        {
            method: 'DELETE',
            path: '/api/admin/rag/documents',
            description: 'Delete all indexed chunks associated with a specific project ID.',
            auth: 'admin',
            parameters: { projectId: 'project-to-delete' },
            responseBody: {
                success: true,
                message: 'Deleted all chunks for project: project-to-delete'
            }
        },
        {
            method: 'POST',
            path: '/api/rag/retrieve-context',
            description: 'Retrieve relevant context from the vector store for a given query.',
            auth: 'user',
            requestBody: {
                query: 'What is machine learning?',
                projectId: 'optional-project-filter',
                topK: 5
            },
            responseBody: {
                context: 'Combined context string...',
                sources: [{ content: '...', score: 0.89 }]
            }
        },
        {
            method: 'POST',
            path: '/api/admin/rag/test-query',
            description: 'An advanced endpoint for admins to test RAG queries with detailed options like caching and re-ranking.',
            auth: 'admin',
            requestBody: {
                query: 'What is RAG?',
                rerank: true,
                rerankStrategy: 'hybrid'
            },
            responseBody: {
                context: '...',
                sources: [{ content: '...', score: 0.95 }],
                cacheHit: false
            }
        }
    ]
  },
  {
    id: 'templates',
    title: 'Templates API',
    icon: Palette,
    endpoints: [
        {
            method: 'GET',
            path: '/api/templates/docx',
            description: 'Get all available DOCX style templates.',
            auth: 'public',
            responseBody: {
                modern: { name: 'Modern' },
                classic: { name: 'Classic' }
            }
        },
        {
            method: 'GET',
            path: '/api/templates/pptx',
            description: 'Get all available PPTX style templates.',
            auth: 'public',
            responseBody: {
                modern: { name: 'Modern' },
                dark: { name: 'Dark' }
            }
        },
        {
            method: 'GET',
            path: '/api/templates/report',
            description: 'Get all available Report structure templates.',
            auth: 'public',
            responseBody: [{ id: 'technical-report', name: 'Technical Report' }]
        }
    ]
  },
  {
    id: 'admin-users',
    title: 'Admin API: User Management',
    icon: Users,
    endpoints: [
       {
        method: 'GET',
        path: '/api/admin/users',
        description: 'Admin: Get a paginated list of all users.',
        auth: 'admin',
        parameters: { limit: 10, lastVisibleId: '...' },
        responseBody: { users: [{}], hasNextPage: true, lastVisibleId: '...' }
      },
      {
        method: 'POST',
        path: '/api/admin/users',
        description: 'Admin: Create a new user.',
        auth: 'admin',
        requestBody: { name: 'New User', email: 'new@user.com', password: '...', role: 'user', credits: 100 },
        responseBody: { user: { uid: '...' } }
      },
      {
        method: 'PUT',
        path: '/api/admin/users/[id]',
        description: 'Admin: Update any user\'s profile information.',
        auth: 'admin',
        requestBody: { name: 'Updated Name', credits: 200, role: 'admin' },
        responseBody: { id: 'user123', name: 'Updated Name' }
      },
      {
        method: 'DELETE',
        path: '/api/admin/users/[id]',
        description: 'Admin: Delete a user account permanently.',
        auth: 'admin',
        responseBody: { message: 'User deleted successfully' }
      },
      {
        method: 'POST',
        path: '/api/admin/users/[id]/reset-password',
        description: 'Admin: Send a password reset email to a user.',
        auth: 'admin',
        responseBody: { message: 'A password reset email has been sent...' }
      },
    ]
  },
  {
    id: 'admin-payments',
    title: 'Admin API: Payment Management',
    icon: CreditCard,
    endpoints: [
        {
            method: 'GET',
            path: '/api/admin/transactions',
            description: 'Admin: Get a list of transactions filtered by status.',
            auth: 'admin',
            parameters: { status: 'pending', limit: 10 },
            responseBody: { transactions: [{}] }
        },
        {
            method: 'POST',
            path: '/api/admin/payments/verify',
            description: 'Admin: Verify or reject a pending payment request.',
            auth: 'admin',
            requestBody: { transactionId: '...', userId: '...', creditsToGrant: 100, status: 'verified' },
            responseBody: { message: 'Transaction verified successfully.' }
        },
        {
            method: 'POST',
            path: '/api/admin/gift-credits',
            description: 'Admin: Gift AI credits to a specific user.',
            auth: 'admin',
            requestBody: { userId: 'user123', credits: 50, message: 'Bonus for feedback!' },
            responseBody: { message: 'Successfully gifted 50 credits...' }
        },
        {
            method: 'GET',
            path: '/api/admin/transactions/report',
            description: 'Admin: Get a transaction report for a specific date range.',
            auth: 'admin',
            parameters: { startDate: 'ISO_DATE', endDate: 'ISO_DATE' },
            responseBody: [{ id: '...', amount: 10, status: 'verified' }]
        },
    ]
  },
  {
    id: 'admin-agents',
    title: 'Admin API: Agent Management',
    icon: Bot,
    endpoints: [
        {
            method: 'POST',
            path: '/api/admin/agents',
            description: 'Admin: Create a new AI agent.',
            auth: 'admin',
            requestBody: { id: 'my-agent', name: 'My Agent' },
            responseBody: { id: 'my-agent' }
        },
        {
            method: 'PUT',
            path: '/api/admin/agents/[id]',
            description: 'Admin: Update an existing AI agent.',
            auth: 'admin',
            requestBody: { name: 'Updated Agent Name' },
            responseBody: { id: 'my-agent', name: 'Updated Agent Name' }
        },
    ]
  },
  {
    id: 'admin-templates',
    title: 'Admin API: Template Management',
    icon: PencilRuler,
    endpoints: [
        { method: 'POST', path: '/api/admin/templates/docx', description: 'Admin: Create a new DOCX style template.', auth: 'admin' },
        { method: 'PUT', path: '/api/admin/templates/docx/[key]', description: 'Admin: Update a DOCX style template.', auth: 'admin' },
        { method: 'DELETE', path: '/api/admin/templates/docx/[key]', description: 'Admin: Delete a DOCX style template.', auth: 'admin' },
        { method: 'POST', path: '/api/admin/templates/pptx', description: 'Admin: Create a new PPTX style template.', auth: 'admin' },
        { method: 'PUT', path: '/api/admin/templates/pptx/[key]', description: 'Admin: Update a PPTX style template.', auth: 'admin' },
        { method: 'DELETE', path: '/api/admin/templates/pptx/[key]', description: 'Admin: Delete a PPTX style template.', auth: 'admin' },
        { method: 'GET', path: '/api/admin/templates/report/[id]', description: 'Admin: Get a single report template.', auth: 'admin' },
        { method: 'POST', path: '/api/admin/templates/report', description: 'Admin: Create a new report template.', auth: 'admin' },
        { method: 'PUT', path: '/api/admin/templates/report/[id]', description: 'Admin: Update a report template.', auth: 'admin' },
        { method: 'DELETE', path: '/api/admin/templates/report/[id]', description: 'Admin: Delete a report template.', auth: 'admin' },
    ]
  },
  {
    id: 'admin-system',
    title: 'Admin API: System & Logs',
    icon: History,
    endpoints: [
        {
            method: 'GET',
            path: '/api/admin/dashboard-stats',
            description: 'Admin: Get aggregated statistics for the admin dashboard.',
            auth: 'admin',
            responseBody: { totalUsers: 100, totalGenerations: 5000 }
        },
        {
            method: 'PUT',
            path: '/api/admin/features/[id]',
            description: 'Admin: Enable or disable a specific feature flag.',
            auth: 'admin',
            requestBody: { isEnabled: true },
            responseBody: { id: 'feature-id', isEnabled: true }
        },
        {
            method: 'GET',
            path: '/api/admin/logs',
            description: 'Admin: Get a paginated list of AI generation logs.',
            auth: 'admin',
            parameters: { limit: 20, agentId: 'summarizer' },
            responseBody: { logs: [{}], hasNextPage: true }
        },
        {
            method: 'POST',
            path: '/api/admin/notifications/send',
            description: 'Admin: Send a manual notification to a user.',
            auth: 'admin',
            requestBody: { userId: 'user123', title: 'Update', body: '...' },
            responseBody: { messageId: '...' }
        },
        {
            method: 'PUT',
            path: '/api/admin/settings',
            description: 'Admin: Update global application settings.',
            auth: 'admin',
            requestBody: { newUserCredits: 20 },
            responseBody: { newUserCredits: 20 }
        },
    ]
  },
  {
    id: 'utilities',
    title: 'Utilities API',
    icon: Settings,
    endpoints: [
        {
            method: 'POST',
            path: '/api/export/docx',
            description: 'Export project content or raw markdown to a DOCX file.',
            auth: 'user',
            requestBody: { project: {}, selectedContent: [] },
            responseBody: {} as Record<string, any>
        },
        {
            method: 'POST',
            path: '/api/export/pptx',
            description: 'Export project content or raw markdown to a PPTX file.',
            auth: 'user',
            requestBody: { markdown: '# Slide 1', fileName: 'presentation' },
            responseBody: {} as Record<string, any>
        },
        {
            method: 'POST',
            path: '/api/process-file',
            description: 'Process an uploaded file (PDF, DOCX, TXT) and extract its text content as markdown.',
            auth: 'user',
            requestBody: { file: '(binary file data)' },
            responseBody: { markdown: 'Extracted markdown content...' }
        },
        {
            method: 'POST',
            path: '/api/image-to-svg',
            description: 'Convert a raster image (PNG, JPG) to a vector SVG.',
            auth: 'user',
            requestBody: { file: '(binary file data)', mode: 'line' } as Record<string, any>,
            responseBody: {} as Record<string, any>
        },
    ]
  }
];
