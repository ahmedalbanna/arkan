
// New, simplified Agent structure for Firestore
export interface AgentProperties {
  id: string;
  name: string;
  description: string;
  category: string;
  prompt: string;
  guidelines?: string[];
  isEnabled: boolean;
  author: string;
  version: string;
  createdAt?: string;
  updatedAt?: string;
}

// Add the missing Command type
export interface Command {
    id: string;
    name: string;
    prompt: string;
}

export class Agent {
    public readonly id: string;
    public readonly name: string;
    public readonly description: string;
    public readonly category: string;
    public readonly prompt: string;
    public readonly guidelines: string[];
    public readonly isEnabled: boolean;
    public readonly author: string;
    public readonly version: string;
    public readonly createdAt?: string;
    public readonly updatedAt?: string;

    constructor(props: AgentProperties) {
        this.id = props.id;
        this.name = props.name;
        this.description = props.description;
        this.category = props.category;
        this.prompt = props.prompt;
        this.guidelines = props.guidelines || [];
        this.isEnabled = props.isEnabled;
        this.author = props.author;
        this.version = props.version;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
    }

    public isActive(): boolean {
        return this.isEnabled;
    }

    public toStateObject(): AgentProperties {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            category: this.category,
            prompt: this.prompt,
            guidelines: [...this.guidelines],
            isEnabled: this.isEnabled,
            author: this.author,
            version: this.version,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
}
