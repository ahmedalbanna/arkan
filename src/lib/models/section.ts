import { Agent } from './agent';
export type SectionType = 'report' | 'diagram' | 'presentation';

export interface SectionProperties {
    id: string;
    title: string;
    agent: Agent;
    type: SectionType;
    content?: string;
}

export class Section {
    private _id: string;
    private _title: string;
    private _agent: Agent;
    private _type: SectionType;
    private _content?: string;
    constructor(props: SectionProperties) {
        this._id = props.id;
        this._title = props.title;
        this._agent = props.agent;
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

    get agent(): Agent {
        return this._agent;
    }
    set agent(value: Agent) {
        this._agent = value;
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
            agent: this._agent,
            type: this._type,
            content: this._content,
        };
    }
    public toStateObject(): SectionProperties {
        return this.toJSON();
    }
}
