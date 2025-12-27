import { Chapter, Project, Section } from './models';

/**
 * A dedicated class for building complex AI prompts from the project structure.
 * This centralizes the logic for how project data is translated into instructions for the AI.
 */
export class PromptBuilder {
    /**
     * Builds a detailed prompt for a single section.
     * @param section - The Section object to build the prompt for.
     * @param project - The entire Project object to resolve context references.
     * @returns A string containing the formatted prompt for the section.
     */
    public static buildSectionPrompt(section: Section, project: Project): string {
        const contextSectionsContent = Object.entries(section.context?.sections || {})
            .map(([sectionId, type]) => {
                const contextSection = project.getSection(sectionId);
                if (contextSection) {
                    return `--- Context from Section: ${contextSection.title} (Type: ${type}) ---\n${contextSection.content || ''}`;
                }
                return '';
            })
            .filter(Boolean)
            .join('\n\n');

        const externalContextContent = Object.entries(section.context?.externalContext || {})
            .map(([fileId, type]) => {
                const file = project.externalContext?.find(f => f.id === fileId);
                if (file) {
                    return `--- Context from File: ${file.fileName} (Type: ${type}) ---\n${file.content}`;
                }
                return '';
            })
            .filter(Boolean)
            .join('\n\n');
        
        const fullContext = [contextSectionsContent, externalContextContent].filter(Boolean).join('\n\n');
        
        // Use the new dynamic system prompt and action prompt from the section model
        const systemPrompt = section.buildSystemPrompt();
        const actionPrompt = section.buildActionPrompt();

        return `
### Instructions for Section: "${section.title}"

**Main Task & Controls:**
${actionPrompt}

**System Instructions (Persona, Rules, Guidelines):**
${systemPrompt}

**Provided Context from Other Project Items:**
${fullContext || 'No context provided from other items.'}
---
        `;
    }

    /**
     * Builds a prompt for an entire chapter by aggregating the prompts of its selected sections.
     * @param chapter - The Chapter object.
     * @param project - The parent Project object.
     * @param selectedSections - A Set of section IDs that should be included.
     * @returns A string containing the formatted prompt for the chapter.
     */
    public static buildChapterPrompt(chapter: Chapter, project: Project, selectedSections: Set<string>): string {
        const sectionInstructions = chapter.sections
            .filter(s => selectedSections.has(s.id))
            .map(section => this.buildSectionPrompt(section, project))
            .join('');

        if (!sectionInstructions) return '';

        return `# Chapter: ${chapter.title}\n${sectionInstructions}`;
    }

    /**
     * Builds the final, complete prompt for the entire project generation task, including project metadata.
     * @param project - The Project object.
     * @param selectedSections - A Set of all section IDs selected for generation across all chapters.
     * @returns A string representing the complete prompt for the AI.
     */
    public static buildProjectPrompt(project: Project, selectedSections: Set<string>): string {
        if (!selectedSections || selectedSections.size === 0) {
            return '';
        }

        const chapterPrompts = project.chapters
            .map(chapter => this.buildChapterPrompt(chapter, project, selectedSections))
            .filter(Boolean)
            .join('\n\n');

        if (!chapterPrompts) return '';

        const teamMemberNames = project.teamMembers?.join(', ');

        const metadataFields: { label: string; value: string | undefined }[] = [
            { label: 'Project Type', value: project.projectType },
            { label: 'Specialization', value: project.specialization },
            { label: 'University', value: project.university },
            { label: 'Course', value: project.course },
            { label: 'Supervisor', value: project.supervisor },
            { label: 'Team Members', value: teamMemberNames },
        ];


        const metadataBlock = metadataFields
            .filter(field => field.value && field.value.length > 0)
            .map(field => `- ${field.label}: ${field.value}`)
            .join('\n');

        const metadataPrompt = metadataBlock ? `\n--- PROJECT METADATA ---\n${metadataBlock}\n------------------------\n` : '';

        return `You are an expert author and technical writer. Your task is to write content for a project titled "${project.name}". The project's overall description is "${project.projectDescription}".
${metadataPrompt}
You will be given instructions for one or more chapters. For each chapter, generate the content for all its sections based on their specific instructions. Your output must be a single, complete markdown document.\n\n${chapterPrompts}`;
    }
}
