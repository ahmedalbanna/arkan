// src/lib/utils/markdown-generation.ts

import type { Project, Chapter, Section, ProjectProperties, ChapterProperties, SectionProperties } from '@/lib/models';

/**
 * A server-safe utility function to generate a single markdown string from project data.
 * @param projectData The plain project properties object.
 * @returns A string containing the full markdown content of the project.
 */
export function generateFullMarkdownFromProject(projectData: ProjectProperties): string {
  const content = projectData.content || [];
  return content.map(item => {
    // Type guard to check if the item is a chapter
    if ('sections' in item && Array.isArray(item.sections)) {
      const chapter = item as ChapterProperties;
      const chapterTitle = `# ${chapter.title}`;
      const sectionsContent = chapter.sections.map(s => `## ${s.title}\n\n${s.content || ''}`).join('\n\n');
      return `${chapterTitle}\n\n${sectionsContent}`;
    }
    // Assumes it's a section
    const section = item as SectionProperties;
    return `## ${section.title}\n\n${section.content || ''}`;
  }).filter(Boolean).join('\n\n---\n\n');
}
