'use client';

import { ProjectBlueprintTool } from '@/components/writing-tools/ProjectBlueprintTool';
import { Building2 } from 'lucide-react';
import { useLocalization } from '@/context/LocalizationContext';

export default function ProjectBlueprintPage() {
  const { t } = useLocalization();
  
  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <Building2 className="w-10 h-10" />
          {t('writingTools.projectBlueprint.pageTitle')}
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          {t('writingTools.projectBlueprint.pageSubtitle')}
        </p>
      </div>
      <ProjectBlueprintTool />
    </div>
  );
}