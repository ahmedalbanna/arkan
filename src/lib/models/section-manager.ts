
import type { SectionName } from '@/ai/schemas';

/**
 * Represents the raw data structure for project sections.
 */
export type SectionsData = Partial<Record<SectionName, string>>;

/**
 * The SectionManager class encapsulates the data and business logic for managing project sections.
 */
export class SectionManager {
    private sections: SectionsData;

    /**
     * @param data The initial raw data for the sections.
     */
    constructor(data?: SectionsData | null) {
        this.sections = data || {};
    }

    /**
     * Retrieves the content of a specific section.
     * @param name The name of the section.
     * @returns The content of the section or an empty string if not found.
     */
    public getSection(name: SectionName): string {
        return this.sections[name] || '';
    }

    /**
     * Updates the content of a specific section.
     * @param name The name of the section to update.
     * @param content The new content. If null or undefined, the section is cleared.
     */
    public updateSection(name: SectionName, content: string | null | undefined): void {
        if (content) {
            this.sections[name] = content;
        } else {
            delete this.sections[name];
        }
    }

    /**
     * Gathers all sections into a single Markdown-formatted string.
     * The sections are separated by a horizontal rule.
     * @returns A single string containing all section content.
     */
    public toMarkdown(): string {
        return Object.values(this.sections)
            .filter(Boolean) // Filter out any empty/null/undefined sections
            .join('\n\n---\n\n');
    }

    /**
     * Checks if there is any content in any of the sections.
     * @returns True if any section has content, false otherwise.
     */
    public hasContent(): boolean {
        const markdown = this.toMarkdown();
        return markdown.trim() !== '';
    }

    /**
     * Serializes the manager's state into a plain data object for storage.
     * @returns A plain object representing the sections data.
     */
    public toJSON(): SectionsData {
        return this.sections;
    }
}
