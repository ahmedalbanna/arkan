# Data Flow Patterns - Client to Server

## Overview
This document describes the complete data flow patterns between client, server, and database layers in the new PostgreSQL architecture.

---

## Flow Pattern Categories

### 1. Initial Page Load (SSR)
### 2. Client-Side Data Fetching
### 3. Form Submissions & Mutations
### 4. Real-time Updates
### 5. File Uploads
### 6. AI Generation Flows

---

## 1. Initial Page Load (Server-Side Rendering)

### Flow Diagram
```
┌──────────┐
│ Browser  │
└────┬─────┘
     │ GET /dashboard
     ▼
┌─────────────────────────┐
│  Next.js Server         │
│  ┌──────────────────┐   │
│  │ Server Component │   │
│  │ (RSC)           │   │
│  └────┬─────────────┘   │
│       │                 │
│       │ getServerSession()
│       ▼                 │
│  ┌──────────────────┐   │
│  │ NextAuth.js     │   │
│  │ Check Session   │   │
│  └────┬─────────────┘   │
│       │                 │
│       │ Session Valid   │
│       ▼                 │
│  ┌──────────────────┐   │
│  │ Prisma Query    │   │
│  │ Get Projects    │   │
│  └────┬─────────────┘   │
└───────┼─────────────────┘
        │
        ▼
┌──────────────────┐
│  PostgreSQL      │
│  SELECT * FROM   │
│  projects        │
│  WHERE user_id=? │
└────┬─────────────┘
     │
     │ Return Data
     ▼
┌─────────────────────────┐
│  Next.js Server         │
│  Render HTML with data  │
└────┬────────────────────┘
     │
     │ HTML Response
     ▼
┌──────────┐
│ Browser  │
│ Display  │
└──────────┘
```

### Code Example
```typescript
// app/dashboard/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export default async function DashboardPage() {
  // 1. Get session
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }
  
  // 2. Query database directly
  const projects = await prisma.project.findMany({
    where: { 
      userId: session.user.id,
      deletedAt: null 
    },
    select: {
      id: true,
      title: true,
      updatedAt: true,
      projectType: true
    },
    orderBy: { updatedAt: 'desc' },
    take: 10
  });
  
  // 3. Render with data
  return <ProjectList projects={projects} />;
}
```

**Advantages**:
- Fast initial load
- SEO friendly
- No loading states needed
- Data available immediately

---

## 2. Client-Side Data Fetching

### Flow Diagram
```
┌──────────────┐
│ Client       │
│ Component    │
└──────┬───────┘
       │ useQuery()
       ▼
┌──────────────────┐
│ React Query      │
│ Check Cache      │
└──────┬───────────┘
       │ Cache Miss
       │ 
       │ fetch('/api/projects')
       ▼
┌─────────────────────────┐
│  Next.js API Route      │
│  /api/projects/route.ts │
│  ┌──────────────────┐   │
│  │ Validate Auth   │   │
│  └────┬─────────────┘   │
│       │                 │
│       │ Prisma Query    │
│       ▼                 │
│  ┌──────────────────┐   │
│  │ PostgreSQL      │   │
│  └────┬─────────────┘   │
└───────┼─────────────────┘
        │ JSON Response
        ▼
┌──────────────────┐
│ React Query      │
│ Cache & Return   │
└──────┬───────────┘
       │
       ▼
┌──────────────┐
│ Component    │
│ Re-render    │
└──────────────┘
```

### Code Example

**Client Component**:
```typescript
'use client';

import { useQuery } from '@tanstack/react-query';

export function ProjectsDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await fetch('/api/projects');
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  if (isLoading) return <ProjectsSkeleton />;
  if (error) return <ErrorDisplay error={error} />;
  
  return <ProjectList projects={data} />;
}
```

**API Route**:
```typescript
// app/api/projects/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  const projects = await prisma.project.findMany({
    where: { userId: session.user.id }
  });
  
  return NextResponse.json(projects);
}
```

---

## 3. Form Submissions & Mutations

### Flow Diagram (Server Actions)
```
┌──────────────┐
│ Form Submit  │
└──────┬───────┘
       │ action={createProject}
       ▼
┌─────────────────────────┐
│  Server Action          │
│  'use server'           │
│  ┌──────────────────┐   │
│  │ Validate Input  │   │
│  └────┬─────────────┘   │
│       │                 │
│       │ Prisma Create   │
│       ▼                 │
│  ┌──────────────────┐   │
│  │ PostgreSQL      │   │
│  │ INSERT INTO     │   │
│  └────┬─────────────┘   │
│       │                 │
│       │ revalidatePath  │
│       ▼                 │
│  ┌──────────────────┐   │
│  │ Clear Cache     │   │
│  └─────────────────┘   │
└────────┬────────────────┘
         │ Return Result
         ▼
┌──────────────┐
│ Client       │
│ UI Update    │
└──────────────┘
```

### Code Example

**Server Action**:
```typescript
// app/actions/projects.ts
'use server';

import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const CreateProjectSchema = z.object({
  title: z.string().min(1),
  projectType: z.string(),
});

export async function createProject(formData: FormData) {
  // 1. Auth check
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Unauthorized');
  
  // 2. Validate input
  const data = CreateProjectSchema.parse({
    title: formData.get('title'),
    projectType: formData.get('projectType'),
  });
  
  // 3. Create in database
  const project = await prisma.project.create({
    data: {
      userId: session.user.id,
      title: data.title,
      projectType: data.projectType,
      status: 'draft',
    }
  });
  
  // 4. Revalidate cache
  revalidatePath('/dashboard');
  
  return { success: true, project };
}
```

**Client Form**:
```typescript
'use client';

import { createProject } from '@/app/actions/projects';
import { useTransition } from 'react';

export function CreateProjectForm() {
  const [isPending, startTransition] = useTransition();
  
  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await createProject(formData);
      if (result.success) {
        toast.success('Project created!');
      }
    });
  };
  
  return (
    <form action={handleSubmit}>
      <input name="title" required />
      <select name="projectType">
        <option value="report">Report</option>
        <option value="thesis">Thesis</option>
      </select>
      <button type="submit" disabled={isPending}>
        {isPending ? 'Creating...' : 'Create Project'}
      </button>
    </form>
  );
}
```

---

## 4. Real-time Updates (Hasura Subscriptions)

### Flow Diagram
```
┌──────────────┐
│ Client       │
│ Component    │
└──────┬───────┘
       │ useSubscription()
       ▼
┌──────────────────┐
│ Apollo Client    │
│ GraphQL WS       │
└──────┬───────────┘
       │ WebSocket Connection
       ▼
┌─────────────────────────┐
│  Hasura GraphQL Engine  │
│  ┌──────────────────┐   │
│  │ Auth Check      │   │
│  │ (JWT/Header)    │   │
│  └────┬─────────────┘   │
│       │                 │
│       │ Subscribe to DB │
│       ▼                 │
│  ┌──────────────────┐   │
│  │ PostgreSQL      │   │
│  │ LISTEN/NOTIFY   │   │
│  └────┬─────────────┘   │
└───────┼─────────────────┘
        │
        │ Data Changes
        │
        │ NOTIFY Trigger
        ▼
┌─────────────────────────┐
│  Hasura Pushes Update   │
└────────┬────────────────┘
         │ WebSocket
         ▼
┌──────────────────┐
│ Apollo Client    │
│ Update Cache     │
└──────┬───────────┘
       │
       ▼
┌──────────────┐
│ Component    │
│ Re-render    │
└──────────────┘
```

### Code Example

**PostgreSQL Trigger**:
```sql
-- Trigger to notify on credit changes
CREATE OR REPLACE FUNCTION notify_credit_change()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify(
    'credit_updated',
    json_build_object(
      'user_id', NEW.id,
      'credits', NEW.credits
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_credits_notify
AFTER UPDATE OF credits ON users
FOR EACH ROW
EXECUTE FUNCTION notify_credit_change();
```

**Client Subscription**:
```typescript
'use client';

import { useSubscription, gql } from '@apollo/client';

const USER_CREDITS_SUBSCRIPTION = gql`
  subscription UserCredits($userId: uuid!) {
    users_by_pk(id: $userId) {
      id
      credits
      updated_at
    }
  }
`;

export function CreditDisplay({ userId }) {
  const { data, loading } = useSubscription(
    USER_CREDITS_SUBSCRIPTION,
    { variables: { userId } }
  );
  
  if (loading) return <Skeleton />;
  
  return (
    <div className="flex items-center gap-2">
      <CoinIcon />
      <span>{data?.users_by_pk?.credits ?? 0} Credits</span>
    </div>
  );
}
```

---

## 5. File Upload Flow

### Flow Diagram
```
┌──────────────┐
│ File Input   │
└──────┬───────┘
       │ User selects file
       ▼
┌──────────────────┐
│ Client Upload    │
│ FormData         │
└──────┬───────────┘
       │ POST /api/upload
       ▼
┌─────────────────────────┐
│  Next.js API Route      │
│  ┌──────────────────┐   │
│  │ Validate File   │   │
│  └────┬─────────────┘   │
│       │                 │
│       │ Upload to Storage
│       ▼                 │
│  ┌──────────────────┐   │
│  │ Firebase Storage│   │
│  └────┬─────────────┘   │
│       │                 │
│       │ Get URL         │
│       │                 │
│       │ Save to DB      │
│       ▼                 │
│  ┌──────────────────┐   │
│  │ PostgreSQL      │   │
│  │ UPDATE project  │   │
│  │ SET logo_url    │   │
│  └─────────────────┘   │
└────────┬────────────────┘
         │
         ▼
┌──────────────┐
│ Return URL   │
└──────────────┘
```

### Code Example
```typescript
// app/api/upload/logo/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { storage } from '@/lib/firebase/server-init';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const projectId = formData.get('projectId') as string;
  
  // Validate file
  if (!file || file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'Invalid file' }, { status: 400 });
  }
  
  // Upload to Firebase Storage
  const buffer = await file.arrayBuffer();
  const bucket = storage.bucket();
  const fileName = `logos/${projectId}/${Date.now()}-${file.name}`;
  const fileRef = bucket.file(fileName);
  
  await fileRef.save(Buffer.from(buffer), {
    metadata: { contentType: file.type }
  });
  
  const [url] = await fileRef.getSignedUrl({
    action: 'read',
    expires: '03-01-2500'
  });
  
  // Update project in PostgreSQL
  await prisma.project.update({
    where: { id: projectId },
    data: { logoUrl: url }
  });
  
  return NextResponse.json({ url });
}
```

---

## 6. AI Generation Flow

### Flow Diagram
```
┌──────────────┐
│ User Request │
│ "Generate"   │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ Check Credits    │
└──────┬───────────┘
       │ Credits OK
       ▼
┌─────────────────────────┐
│  API Route              │
│  POST /api/generate     │
│  ┌──────────────────┐   │
│  │ Deduct Credits  │   │
│  │ (Transaction)   │   │
│  └────┬─────────────┘   │
│       │                 │
│       │ Create Job      │
│       ▼                 │
│  ┌──────────────────┐   │
│  │ PostgreSQL      │   │
│  │ INSERT INTO     │   │
│  │ agent_generations│  │
│  └─────────────────┘   │
└────────┬────────────────┘
         │
         │ Call AI
         ▼
┌─────────────────────────┐
│  Genkit Flow            │
│  Generate Content       │
└────────┬────────────────┘
         │ Result
         ▼
┌─────────────────────────┐
│  Update Job Status      │
│  ┌──────────────────┐   │
│  │ PostgreSQL      │   │
│  │ UPDATE          │   │
│  │ status='complete'│  │
│  └─────────────────┘   │
└────────┬────────────────┘
         │
         │ NOTIFY (trigger)
         ▼
┌─────────────────────────┐
│  Hasura Pushes Update   │
└────────┬────────────────┘
         │
         ▼
┌──────────────┐
│ Client Gets  │
│ Result       │
└──────────────┘
```

### Code Example
```typescript
// app/api/generate/section/route.ts
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const body = await request.json();
  
  // Start transaction
  const result = await prisma.$transaction(async (tx) => {
    // 1. Check credits
    const user = await tx.user.findUnique({
      where: { id: session.user.id }
    });
    
    if (user.credits < 1) {
      throw new Error('Insufficient credits');
    }
    
    // 2. Deduct credits
    await tx.user.update({
      where: { id: session.user.id },
      data: { credits: { decrement: 1 } }
    });
    
    // 3. Create generation job
    const job = await tx.agentGeneration.create({
      data: {
        userId: session.user.id,
        agentId: body.agentId,
        flowName: body.flowName,
        inputData: body.input,
        status: 'pending',
        creditsConsumed: 1
      }
    });
    
    return job;
  });
  
  // 4. Call AI (async, don't await)
  generateContent(result.id, body).catch(console.error);
  
  // 5. Return job ID for tracking
  return NextResponse.json({ jobId: result.id });
}

async function generateContent(jobId: string, input: any) {
  try {
    const startTime = Date.now();
    
    // Call Genkit flow
    const output = await runFlow('generate-section', input);
    
    // Update job with result
    await prisma.agentGeneration.update({
      where: { id: jobId },
      data: {
        outputData: output,
        status: 'completed',
        executionTimeMs: Date.now() - startTime,
        completedAt: new Date()
      }
    });
    // PostgreSQL trigger will NOTIFY Hasura
  } catch (error) {
    await prisma.agentGeneration.update({
      where: { id: jobId },
      data: {
        status: 'failed',
        errorMessage: error.message
      }
    });
  }
}
```

---

## Performance Optimization Patterns

### 1. Optimistic Updates
```typescript
const mutation = useMutation({
  mutationFn: updateProject,
  onMutate: async (newData) => {
    // Cancel outgoing queries
    await queryClient.cancelQueries(['project', projectId]);
    
    // Snapshot previous value
    const previous = queryClient.getQueryData(['project', projectId]);
    
    // Optimistically update
    queryClient.setQueryData(['project', projectId], newData);
    
    return { previous };
  },
  onError: (err, variables, context) => {
    // Rollback on error
    queryClient.setQueryData(['project', projectId], context.previous);
  },
  onSettled: () => {
    // Refetch to ensure sync
    queryClient.invalidateQueries(['project', projectId]);
  }
});
```

### 2. Parallel Data Fetching
```typescript
export default async function Page() {
  // All queries run in parallel
  const [user, projects, transactions] = await Promise.all([
    prisma.user.findUnique({ where: { id } }),
    prisma.project.findMany({ where: { userId: id } }),
    prisma.transaction.findMany({ where: { userId: id } })
  ]);
  
  return <Dashboard user={user} projects={projects} transactions={transactions} />;
}
```

### 3. Streaming Responses
```typescript
// For long-running operations
export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      // Send progress updates
      controller.enqueue(encoder.encode('data: {"progress": 0}\n\n'));
      
      // Do work...
      await processStep1();
      controller.enqueue(encoder.encode('data: {"progress": 50}\n\n'));
      
      await processStep2();
      controller.enqueue(encoder.encode('data: {"progress": 100, "done": true}\n\n'));
      
      controller.close();
    }
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    }
  });
}
```

---

## Summary

The new architecture provides multiple data flow patterns:

1. **SSR**: Fast initial loads with server components
2. **Client Fetching**: Dynamic updates with React Query
3. **Server Actions**: Progressive enhancement for forms
4. **Real-time**: Hasura subscriptions for live updates
5. **File Uploads**: Integrated with existing Firebase Storage
6. **AI Generation**: Async jobs with status tracking

All patterns maintain type safety, proper authentication, and optimal performance.
