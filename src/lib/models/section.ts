import { Agent } from './agent';
export type SectionType = 'report' | 'diagram' | 'presentation';

export interface SectionProperties {
    id: string;
    title: string;
    agent?: Agent; // Agent can be optional, especially for user-created sections
    type: SectionType;
    content?: string;
    agentId?: string; // agentId can be a fallback
    icon?: string;
}

export class Section {
    private _id: string;
    private _title: string;
    private _agent?: Agent; // Agent is now optional
    private _type: SectionType;
    private _content?: string;
    private _agentId?: string;
    private _icon?: string;

    constructor(props: SectionProperties) {
        this._id = props.id;
        this._title = props.title;
        this._agent = props.agent;
        this._type = props.type;
        this._content = props.content;
        this._agentId = props.agentId || props.agent?.id;
        this._icon = props.icon;
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

    get agent(): Agent | undefined {
        return this._agent;
    }
    set agent(value: Agent | undefined) {
        this._agent = value;
        this._agentId = value?.id;
    }
    
    get agentId(): string | undefined {
        return this._agentId;
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
     get icon(): string | undefined {
        return this._icon;
    }
    public toJSON(): SectionProperties {
        return {
            id: this._id,
            title: this._title,
            agent: this._agent,
            agentId: this._agentId,
            type: this._type,
            content: this._content,
            icon: this._icon,
        };
    }
    public toStateObject(): SectionProperties {
        return this.toJSON();
    }
}
