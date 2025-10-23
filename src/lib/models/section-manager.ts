
import { Section, SectionData } from './section';
import { SectionName } from '@/ai/schemas';

/**
 * The SectionManager class encapsulates the data and business logic for managing project sections.
 * It works with Section instances, providing a layer of abstraction over the raw data.
 */
export class SectionManager {
    // Storing Section instances directly.
    private sections: Record<string, Section | SectionData>;

    /**
     * @param data The initial raw data for the sections, as a record of SectionData.
     */
    constructor(data?: Record<string, SectionData | Section> | null) {
        this.sections = {};
        if (data) {
            for (const key in data) {
                const sectionData = data[key];
                if (sectionData instanceof Section) {
                    this.sections[key] = sectionData;
                } else {
                    this.sections[key] = new Section(sectionData as SectionData);
                }
            }
        }
    }

    /**
     * Retrieves a specific Section instance.
     * @param name The name of the section.
     * @returns The Section instance or undefined if not found.
     */
    public getSection(name: SectionName): Section | undefined {
        const section = this.sections[name];
        if (section instanceof Section) {
            return section;
        }
        // If it's not an instance, re-hydrate it before returning
        if (section) {
            const newSection = new Section(section as SectionData);
            this.sections[name] = newSection;
            return newSection;
        }
        return undefined;
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
            .map(section => (section as Section).content)
            .filter(Boolean)
            .join('\n\n---\n\n');
    }

    /**
     * Checks if there is any content in any of the sections.
     * @returns True if any section has content, false otherwise.
     */
    public hasContent(): boolean {
        return Object.values(this.sections).some(section => (section as Section).hasContent ? (section as Section).hasContent : !!(section as SectionData).content);
    }

    /**
     * Serializes the manager's state into a plain data object for storage.
     * Each Section instance is converted to its plain data representation.
     * @returns A record of plain objects representing the sections data.
     */
    public toJSON(): Record<string, SectionData> {
        const data: Record<string, SectionData> = {};
        for (const key in this.sections) {
            const section = this.sections[key];
            if ('toStateObject' in section && typeof section.toStateObject === 'function') {
                data[key] = section.toStateObject();
            } else {
                // If it's a plain object, just use it as is.
                data[key] = section as SectionData;
            }
        }
        return data;
    }
}
