

import type { DiagramType } from '@/ai/schemas';
import type { Tone, Language, OutputStyle } from './control-types';

export interface GenerationControlState {
    formality: number;
    complexity: number;
    tone: Tone;
    language: Language;
    outputStyle: OutputStyle;
    wordCount: string;
    diagramType: DiagramType;
}

export interface SectionContext {
    sections: Record<string, boolean>;
    externalContext: Record<string, boolean>;
}


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
    // Generation controls are now part of the section
    controls?: GenerationControlState;
    // Context selection is now part of the section
    context?: SectionContext;

}

export const defaultControls: GenerationControlState = {
    formality: 50,
    complexity: 50,
    tone: 'professional',
    language: 'default',
    outputStyle: { heading: true, paragraph: true, list: false, table: false, code: false, diagram: false },
    wordCount: '',
    diagramType: 'useCase',
};

export const defaultContext: SectionContext = {
    sections: {},
    externalContext: {},
};


export class Section {
    public id: string;
    public title: string;
    public type: SectionType;
    public content?: string;
    public prompt?: string;
    public guidelines?: string[];
    public agentId?: string | null;
    public commandId?: string | null;
    public controls: GenerationControlState;
    public context: SectionContext;



    constructor(props: SectionProperties) {
        this.id = props.id;
        this.title = props.title;
        this.type = props.type;
        this.content = props.content ?? '';
        this.prompt = props.prompt ?? 'You are a helpful assistant.';
        this.guidelines = props.guidelines ?? [];
        this.agentId = props.agentId || null;
        this.commandId = props.commandId || null;
        this.controls = { ...defaultControls, ...props.controls };
        this.context = { ...defaultContext, ...props.context };

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
            controls: this.controls,
            context: this.context,

        };
    }

    public toStateObject(): SectionProperties {
        return this.toJSON();
    }
}
