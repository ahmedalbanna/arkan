/**
 * Creative Studio - Project Editor Page
 * صفحة محرر المشروع
 */

'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import StepByStepGenerator from '@/components/creative-studio/StepByStepGenerator';
import { useCreativeStudio } from '@/hooks/creative-studio/use-creative-studio';
import { Loader2 } from 'lucide-react';

export default function ProjectEditorPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const { currentProject, loadProject } = useCreativeStudio();

  useEffect(() => {
    if (projectId && projectId !== 'new') {
      loadProject(projectId);
    }
  }, [projectId, loadProject]);

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <StepByStepGenerator />;
}
