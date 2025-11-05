import { Agent, AgentProperties } from './agent';
export type SectionType = 'report' | 'diagram' | 'presentation';

export interface SectionProperties {
    id: string;
    title: string;
    agent?: AgentProperties; // Now stores the plain object properties
    type: SectionType;
    content?: string;
    agentId?: string;
}

export class Section {
    private _id: string;
    private _title: string;
    private _agent?: Agent;
    private _type: SectionType;
    private _content?: string;
    private _agentId?: string;

    constructor(props: SectionProperties) {
        this._id = props.id;
        this._title = props.title;
        // If agent properties are provided, create an Agent instance
        this._agent = props.agent ? new Agent(props.agent) : undefined;
        this._type = props.type;
        this._content = props.content ?? '';
        // Ensure agentId is consistent
        this._agentId = props.agentId || this._agent?.id;
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
    set content(value: string | undefined) {
        this._content = value;
    }

    public toJSON(): SectionProperties {
        return {
            id: this._id,
            title: this._title,
            // Serialize the agent by calling its toJSON method
            agent: this._agent?.toJSON(),
            agentId: this._agentId,
            type: this._type,
            content: this._content,
        };
    }

    public toStateObject(): SectionProperties {
        return this.toJSON();
    }
}
