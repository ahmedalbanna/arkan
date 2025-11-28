
export type SectionType = 'report' | 'diagram' | 'presentation';

export interface SectionProperties {
    id: string;
    title: string;
    type: SectionType;
    content?: string;
    // Agent-related properties are now part of the section itself
    prompt?: string;
    guidelines?: string[];
    agentId?: string | null;
    commandId?: string | null;
}

export class Section {
    public id: string;
    public title: string;
    public type: SectionType;
    public content?: string;
    public prompt?: string;
    public guidelines?: string[];
    public agentId?: string | null;
    public commandId?: string | null;


    constructor(props: SectionProperties) {
        this.id = props.id;
        this.title = props.title;
        this.type = props.type;
        this.content = props.content ?? '';
        this.prompt = props.prompt ?? 'You are a helpful assistant.';
        this.guidelines = props.guidelines ?? [];
        this.agentId = props.agentId || null;
        this.commandId = props.commandId || null;
    }

    public toJSON(): SectionProperties {
        return {
            id: this.id,
            title: this.title,
            type: this.type,
            content: this.content,
            prompt: this.prompt,
            guidelines: this.guidelines,
            agentId: this.agentId,
            commandId: this.commandId,
        };
    }

    public toStateObject(): SectionProperties {
        return this.toJSON();
    }
}
