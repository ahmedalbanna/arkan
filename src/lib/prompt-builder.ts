import { Chapter, Project, Section } from './models';

/**
 * A dedicated class for building complex AI prompts from the project structure.
 * This centralizes the logic for how project data is translated into instructions for the AI.
 */
export class PromptBuilder {
    /**
     * Builds project metadata context block that will be included in section prompts.
     * @param project - The Project object containing metadata.
     * @returns A formatted string with project information.
     */
    private static buildProjectMetadata(project: Project): string {
        const teamMemberNames = project.teamMembers?.join(', ');

        const metadataFields: { label: string; value: string | undefined }[] = [
            { label: 'Project Name', value: project.name },
            { label: 'Project Description', value: project.projectDescription },
            { label: 'Project Type', value: project.projectType },
            { label: 'Specialization', value: project.specialization },
            { label: 'University', value: project.university },
            { label: 'Course', value: project.course },
            { label: 'Educational Level', value: project.educationalLevel },
            { label: 'Supervisor', value: project.supervisor },
            { label: 'Team Members', value: teamMemberNames },
        ];

        const metadataEntries = metadataFields
            .filter(field => field.value && field.value.trim().length > 0)
            .map(field => `- **${field.label}**: ${field.value}`)
            .join('\n');

        if (!metadataEntries) {
            return '';
        }

        return `**PROJECT CONTEXT:**
${metadataEntries}
---
`;
    }

    /**
     * Builds a detailed prompt for a single section.
     * @param section - The Section object to build the prompt for.
     * @param project - The entire Project object to resolve context references.
     * @returns A string containing the formatted prompt for the section.
     * @deprecated Use buildSectionSystemPrompt and buildSectionUserPrompt instead
     */
    public static buildSectionPrompt(section: Section, project: Project): string {
        // Build project metadata context
        const projectMetadata = this.buildProjectMetadata(project);

        const contextSectionsContent = Object.entries(section.context?.sections || {})
            .map(([sectionId, type]) => {
                const contextSection = project.getSection(sectionId);
                if (contextSection) {
                    return `--- Context from Section: ${contextSection.title} (Type: ${type}) ---\\n${contextSection.content || ''}`;
                }
                return '';
            })
            .filter(Boolean)
            .join('\\n\\n');

        const externalContextContent = Object.entries(section.context?.externalContext || {})
            .map(([fileId, type]) => {
                const file = project.externalContext?.find(f => f.id === fileId);
                if (file) {
                    return `--- Context from File: ${file.fileName} (Type: ${type}) ---\\n${file.content}`;
                }
                return '';
            })
            .filter(Boolean)
            .join('\\n\\n');

        const fullContext = [contextSectionsContent, externalContextContent].filter(Boolean).join('\\n\\n');

        // Use the new dynamic system prompt and action prompt from the section model
        const systemPrompt = section.buildSystemPrompt();
        const actionPrompt = section.buildActionPrompt();

        return `
### Instructions for Section: \"${section.title}\"

${projectMetadata}

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
     * Builds the system prompt for a section containing role, persona, and constraints
     * @param section - The Section object
     * @param project - The parent Project object
     * @returns System prompt string for the AI
     */
    public static buildSectionSystemPrompt(section: Section, project: Project): string {
        const projectMetadata = this.buildProjectMetadata(project);
        const systemPrompt = section.buildSystemPrompt();

        return `You are an expert technical writer and analyst specialized in creating high-quality documentation.

${projectMetadata}

**Your Role for Section: "${section.title}"**
${systemPrompt}

**Core Instructions:**
- Review all provided context carefully before writing
- Synthesize information from multiple sources into a coherent narrative
- Write in a natural, engaging style (not robotic)
- Follow all guidelines and constraints provided
- Output ONLY the markdown content for this section
- Do NOT wrap output in JSON, XML, or any other format
- Do NOT include schema definitions or metadata
- Return pure markdown text only`;
    }

    /**
     * Builds the user prompt containing task, context, and specific instructions
     * @param section - The Section object
     * @param project - The parent Project object
     * @returns User prompt string with task and context
     */
    public static buildSectionUserPrompt(section: Section, project: Project): string {
        const actionPrompt = section.buildActionPrompt();

        // Build context from linked sections
        const contextSectionsContent = Object.entries(section.context?.sections || {})
            .map(([sectionId, type]) => {
                const contextSection = project.getSection(sectionId);
                if (contextSection) {
                    return `--- Context from Section: ${contextSection.title} (Type: ${type}) ---
${contextSection.content || '(No content yet)'}`;
                }
                return '';
            })
            .filter(Boolean)
            .join('\\n\\n');

        // Build context from external files
        const externalContextContent = Object.entries(section.context?.externalContext || {})
            .map(([fileId, type]) => {
                const file = project.externalContext?.find(f => f.id === fileId);
                if (file) {
                    return `--- Context from File: ${file.fileName} (Type: ${type}) ---
${file.content}`;
                }
                return '';
            })
            .filter(Boolean)
            .join('\\n\\n');

        const fullContext = [contextSectionsContent, externalContextContent]
            .filter(Boolean)
            .join('\\n\\n');

        // Build guidelines list
        const guidelinesList = section.guidelines && section.guidelines.length > 0
            ? `\\n**Guidelines to Follow:**\\n${section.guidelines.map(g => `- ${g}`).join('\\n')}`
            : '';

        return `**Task:** Write the section titled "${section.title}"

${actionPrompt}${guidelinesList}

${fullContext ? `**Available Context:**\\n\\n${fullContext}` : '**Note:** No additional context provided. Write based on the section title and instructions above.'}

**Output Requirements:**
- Write complete, well-structured markdown content
- Use appropriate headings (start with ##, not #)
- Include relevant examples, explanations, and details
- Ensure the content flows naturally
- Meet the specified word count if provided
- Return ONLY markdown text - no JSON, no schema, no metadata`;
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
