
import { Section, SectionData } from './section';
import { SectionName } from '@/ai/schemas';

/**
 * The SectionManager class encapsulates the data and business logic for managing project sections.
 * It works with Section instances, providing a layer of abstraction over the raw data.
 */
export class SectionManager {
    // Storing Section instances directly.
    private sections: Record<string, Section>;

    /**
     * @param data The initial raw data for the sections, as a record of SectionData.
     */
    constructor(data?: Record<string, SectionData> | null) {
        this.sections = {};
        if (data) {
            for (const key in data) {
                // Create a new Section instance for each data entry.
                this.sections[key] = new Section(data[key]);
            }
        }
    }

    /**
     * Retrieves a specific Section instance.
     * @param name The name of the section.
     * @returns The Section instance or undefined if not found.
     */
    public getSection(name: SectionName): Section | undefined {
        return this.sections[name];
    }

    /**
     * Updates the content of a specific section. If the section doesn't exist, it's created.
     * @param name The name of the section to update.
     * @param content The new content. If null or undefined, the section content is cleared.
     */
    public updateSection(name: SectionName, content: string | null | undefined): void {
        const section = this.getSection(name);
        if (section) {
            section.updateContent(content || '');
        } 
    }

    /**
     * Gathers all sections into a single Markdown-formatted string.
     * @returns A single string containing all section content.
     */
    public toMarkdown(): string {
        return Object.values(this.sections)
            .map(section => section.content)
            .filter(Boolean)
            .join('\n\n---\n\n');
    }

    /**
     * Checks if there is any content in any of the sections.
     * @returns True if any section has content, false otherwise.
     */
    public hasContent(): boolean {
        return Object.values(this.sections).some(section => section.hasContent());
    }

    /**
     * Serializes the manager's state into a plain data object for storage.
     * Each Section instance is converted to its plain data representation.
     * @returns A record of plain objects representing the sections data.
     */
    public toJSON(): Record<string, SectionData> {
        const data: Record<string, SectionData> = {};
        for (const key in this.sections) {
            data[key] = this.sections[key].toStateObject();
        }
        return data;
    }
}
