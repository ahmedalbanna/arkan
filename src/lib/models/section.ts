import { Agent } from './agent';
export type SectionType = 'report' | 'diagram' | 'presentation';

export interface SectionProperties {
    id: string;
    title: string;
    agentId: Agent;
    type: SectionType;
    content?: string;
}

export class Section {
    private _id: string;
    private _title: string;
    private _agentId: Agent;
    private _type: SectionType;
    private _content?: string;
    constructor(props: SectionProperties) {
        this._id = props.id;
        this._title = props.title;
        this._agentId = props.agentId;
        this._type = props.type;
        this._content = props.content;
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

    get agentId(): Agent {
        return this._agentId;
    }
    set agentId(value: Agent) {
        this._agentId = value;
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
    public toJSON(): SectionProperties {
        return {
            id: this._id,
            title: this._title,
            agentId: this._agentId,
            type: this._type,
            content: this._content,
        };
    }
    public toStateObject(): SectionProperties {
        return this.toJSON();
    }
}
