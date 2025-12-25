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
        const contextSectionsContent = Object.keys(section.context?.sections || {})
            .filter(key => section.context.sections[key])
            .map(key => {
                const contextSection = project.getSection(key);
                if (contextSection) {
                    return `--- Context from Section: ${contextSection.title} ---\n${contextSection.content || ''}`;
                }
                return '';
            })
            .filter(Boolean)
            .join('\n\n');

        const externalContextContent = (project.externalContext || [])
            .filter(item => section.context?.externalContext?.[item.id])
            .map(file => `--- Context from File: ${file.fileName} ---\n${file.content}`)
            .join('\n\n');

        const fullContext = [contextSectionsContent, externalContextContent].filter(Boolean).join('\n\n');

        // This prompt is used when generating a single section, so it doesn't need the full project metadata.
        // It remains focused on its specific task.
        return `
### Instructions for Section: "${section.title}"
**Base Prompt:**
${section.prompt}\n
**Guidelines:**
${section.guidelines && section.guidelines.length > 0 ? section.guidelines.map(g => `- ${g}`).join('\n') : '- No specific guidelines provided.'} \n
**Additional Instructions:**
${section.instruction}\n
**Context:**
${fullContext || 'No context provided.'}
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

        // Build the metadata block, including only fields that have values.
        const metadataFields: { label: string; value: string | string[] | undefined }[] = [
            { label: 'Project Type', value: project.projectType },
            { label: 'Specialization', value: project.specialization },
            { label: 'Student Name', value: project.studentName },
            { label: 'Student ID', value: project.studentId },
            { label: 'University', value: project.university },
            { label: 'Course', value: project.course },
            { label: 'Supervisor', value: project.supervisor },
            { label: 'Country', value: project.country },
            { label: 'City', value: project.city },
            { label: 'Team Members', value: project.teamMembers?.join(', ') },
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
