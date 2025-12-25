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
        const contextSectionsContent = Object.keys(section.context.sections || {})
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
            .filter(item => section.context.externalContext?.[item.id])
            .map(file => `--- Context from File: ${file.fileName} ---\n${file.content}`)
            .join('\n\n');

        const fullContext = [contextSectionsContent, externalContextContent].filter(Boolean).join('\n\n');

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
     * Builds the final, complete prompt for the entire project generation task.
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
            .filter(Boolean) // Filter out chapters that had no selected sections
            .join('\n\n');
        
        if (!chapterPrompts) return '';

        return `You are an expert author and technical writer. Your task is to write content for a project titled "${project.name}". The project's overall description is "${project.projectDescription}". You will be given instructions for one or more chapters. For each chapter, generate the content for all its sections based on their specific instructions. Your output must be a single, complete markdown document.\n\n${chapterPrompts}`;
    }
}
