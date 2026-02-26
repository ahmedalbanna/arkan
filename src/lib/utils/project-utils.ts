
import type { Project, Section } from '@/lib/types';

/**
 * Extracts context names (section names and file names) from a section's context.
 * @param project The current project instance.
 * @param section The section to extract context from.
 * @returns An array of context names.
 */
export function getContextNames(project: Project, section: Section): string[] {
    if (!section) return [];
    const context = section.context;
    if (!context) return [];

    const sectionNames = Object.keys(context.sections || {}).map(id => 
        project.getSection(id)?.title || 'Untitled Section'
    );
    const fileNames = Object.keys(context.externalContext || {}).map(id => 
        project.externalContext.find(f => f.id === id)?.fileName || 'Untitled File'
    );

    return [...sectionNames, ...fileNames];
}
