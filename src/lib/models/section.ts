
export type SectionType = 'report' | 'diagram' | 'presentation';

// Represents the raw, serializable data for a section
export interface SectionData {
    id: string;
    title: string;
    agentId: string;
    type: SectionType;
    content: string;
    // Optional properties from old SectionProperties
    prompt?: string;
    guidelines?: string[];
    instruction?: string;
}

export class Section {
    public id: string;
    public title: string;
    public agentId: string;
    public type: SectionType;
    public content: string;

    constructor(props: SectionData) {
        this.id = props.id;
        this.title = props.title;
        this.agentId = props.agentId;
        this.type = props.type;
        this.content = props.content || '';
    }

    /**
     * Updates the content of the section.
     * @param {string} newContent - The new content for the section.
     */
    public updateContent(newContent: string): void {
        this.content = newContent;
    }

    /**
     * Checks if the section has any meaningful content.
     * @returns {boolean} True if content is not empty.
     */
    public get hasContent(): boolean {
        return this.content.trim().length > 0;
    }

    /**
     * Serializes the Section instance into a plain data object.
     * @returns {SectionData} The raw data representation of the section.
     */
    public toJSON(): SectionData {
        return {
            id: this.id,
            title: this.title,
            agentId: this.agentId,
            type: this.type,
            content: this.content,
        };
    }
}
