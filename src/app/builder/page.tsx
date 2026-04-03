import { BuilderWorkspace } from '@/modules/ai-content/adapters/components/builder/BuilderWorkspace';
import { BuilderPageSkeleton } from './loading';
import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { type ProjectProperties } from '@/modules/projects/domain/entities/Project';

import { container } from '@/infrastructure/di/container';
import { ProjectController } from '@/modules/projects/adapters/controllers/ProjectController';

async function getInitialProject(id: string) {
  if (!id) return null;
  
  try {
    const controller = container.resolve(ProjectController);
    const result = await controller.getProjectById(id);
    
    if (result.isSuccess) {
      return result.getValue().toProperties();
    }
  } catch (error) {
    console.error('Failed to fetch initial project on server:', error);
  }
  return null;
}

export default async function GeneratePage(props: { searchParams: Promise<{ id?: string }> }) {
  const searchParams = await props.searchParams;
  const projectId = searchParams.id;

  const initialProject = projectId ? await getInitialProject(projectId) : null;

  return (
    <Suspense fallback={<BuilderPageSkeleton />}>
      <BuilderWorkspace initialProject={initialProject} />
    </Suspense>
  );
}
