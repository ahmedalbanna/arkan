
// This model is now based on the DynamicSection interface from useSectionStore.ts

export type SectionType = 'report' | 'diagram' | 'presentation';

export interface SectionProperties {
    id: string;
    title: string;
    icon: string;
    agentId: string;
    type: SectionType;
}

export class Section {
    public id: string;
    public title: string;
    public icon: string;
    public agentId: string;
    public type: SectionType;

    constructor(props: SectionProperties) {
        this.id = props.id;
        this.title = props.title;
        this.icon = props.icon;
        this.agentId = props.agentId;
        this.type = props.type;
    }

    /**
     * A placeholder method that might be used to trigger the associated agent.
     */
    public runAgent(): void {
        console.log(`Running agent ${this.agentId} for section ${this.title}`);
        // In a real app, this could trigger a mutation that runs the agent.
    }
}
