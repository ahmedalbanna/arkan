'use client';

import { useMemo } from 'react';
import { Project } from '@/modules/projects/domain/entities/Project';

/**
 * Hook to provide intelligent writing suggestions based on the current project state.
 */
export function useDocumentSuggestion(project: Project | null) {
  return useMemo(() => {
    if (!project || !project.sections || project.sections.length === 0) {
      return 'Start by adding a chapter or applying a template.';
    }

    const emptySection = project.sections.find((s) => !s.content);
    if (emptySection) {
      return `Try generating the "${emptySection.title}" section next.`;
    }

    return 'All sections have content. You can now review or export your document.';
  }, [project]);
}
