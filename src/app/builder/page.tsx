import ReportModeGenerator from '@/modules/ai-content/adapters/components/report-mode/ReportModeGenerator';
import { BuilderPageSkeleton } from './loading';
import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { ProjectProperties } from '@/lib/types';

async function getInitialProject(id: string, token: string | undefined) {
  if (!id || !token) return null;
  
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';
    const response = await fetch(`${baseUrl}/api/projects/${id}`, {
      headers: {
        'Cookie': `__session=${token}`
      },
      next: { revalidate: 0 } // Bypass cache for builder to ensure fresh data
    });
    
    if (response.ok) {
      const result = await response.json();
      return result as ProjectProperties;
    }
  } catch (error) {
    console.error('Failed to fetch initial project on server:', error);
  }
  return null;
}

export default async function GeneratePage(props: { searchParams: Promise<{ id?: string }> }) {
  const searchParams = await props.searchParams;
  const projectId = searchParams.id;
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('__session')?.value;

  const initialProject = projectId ? await getInitialProject(projectId, sessionToken) : null;

  return (
    <Suspense fallback={<BuilderPageSkeleton />}>
      <ReportModeGenerator initialProject={initialProject} />
    </Suspense>
  );
}
