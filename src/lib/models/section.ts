
export type SectionType = 'report' | 'diagram' | 'presentation';

export interface SectionProperties {
    id: string;
    title: string;
    type: SectionType;
    content?: string;
    // Agent-related properties are now part of the section itself
    prompt?: string;
    guidelines?: string[];
}

export class Section {
    private _id: string;
    private _title: string;
    private _type: SectionType;
    private _content?: string;
    private _prompt?: string;
    private _guidelines?: string[];


    constructor(props: SectionProperties) {
        this._id = props.id;
        this._title = props.title;
        this._type = props.type;
        this._content = props.content ?? '';
        this._prompt = props.prompt ?? 'You are a helpful assistant.';
        this._guidelines = props.guidelines ?? [];
    }

    get id(): string {
        return this._id;
    }
    set id(value: string) {
        this._id = value;
    }

    get title(): string {
        return this._title;
    }
    set title(value: string) {
        this._title = value;
    }

    get type(): SectionType {
        return this._type;
    }
    set type(value: SectionType) {
        this._type = value;
    }
    get content(): string | undefined {
        return this._content;
    }
    set content(value: string | undefined) {
        this._content = value;
    }

    get prompt(): string | undefined {
        return this._prompt;
    }
    set prompt(value: string | undefined) {
        this._prompt = value;
    }
    get guidelines(): string[] | undefined {
        return this._guidelines;
    }
    set guidelines(value: string[] | undefined) {
        this._guidelines = value;
    }

    public toJSON(): SectionProperties {
        return {
            id: this._id,
            title: this._title,
            type: this._type,
            content: this._content,
            prompt: this._prompt,
            guidelines: this._guidelines,
        };
    }

    public toStateObject(): SectionProperties {
        return this.toJSON();
    }
}
