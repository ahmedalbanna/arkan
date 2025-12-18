
'use client';

import type { Tone, Language, OutputStyle } from './control-types';

export type ManipulationType = 'rewrite' | 'summarize' | 'style-editor' | 'readability-enhancer' | 'conciseness-checker' | 'clarity-advisor';

export type AnalysisType = 'custom-analysis' | 'question-answering' | 'fact-retrieval';

export interface GenerationControlState {
    formality: number;
    complexity: number;
    tone: Tone;
    language: Language;
    outputStyle: OutputStyle;
    wordCount: string;
    // Text manipulation
    manipulationType?: ManipulationType;
    rewriteStyle?: string;
    compressionRatio?: number;
    targetAudience?: string;
    targetLevel?: 'elementary' | 'middle-school' | 'high-school' | 'college' | 'graduate';
    targetReduction?: number;
    focusAreas?: string[];
    // Analysis
    analysisType?: AnalysisType;
    question?: string; // For question-answering
    factQuery?: string; // For fact-retrieval
}

export interface SectionContext {
    sections: Record<string, boolean>;
    externalContext: Record<string, boolean>;
    themes: Record<string, boolean>;
}


export type SectionType = 'analysis' | 'generation' | 'document-processing' | 'text-manipulation' | 'utilities';

export interface SectionProperties {
    id: string;
    title: string;
    type: SectionType;
    content: string;
    prompt: string;
    guidelines: string[];
    agentId: string | null;
    commandId: string | null;
    controls: GenerationControlState;
    context: SectionContext;
}

export const defaultControls: GenerationControlState = {
    formality: 50,
    complexity: 50,
    tone: 'professional',
    language: 'default',
    outputStyle: { heading: true, paragraph: true, list: false, table: false, code: false },
    wordCount: '',
    manipulationType: 'rewrite',
    rewriteStyle: 'Formal',
    compressionRatio: 50,
    targetAudience: '',
    targetLevel: undefined,
    targetReduction: 0,
    focusAreas: [],
    analysisType: 'custom-analysis',
    question: '',
    factQuery: '',
};

export const defaultContext: SectionContext = {
    sections: {},
    externalContext: {},
    themes: {},
};


export class Section {
    public id: string;
    public title: string;
    public type: SectionType;
    public content: string;
    public prompt: string;
    public guidelines: string[];
    public agentId: string | null;
    public commandId: string | null;
    public controls: GenerationControlState;
    public context: SectionContext;

    constructor(props: SectionProperties) {
        this.id = props.id;
        this.title = props.title;
        this.type = props.type || 'generation';
        this.content = props.content ?? '';
        this.prompt = props.prompt ?? 'You are a helpful assistant.';
        this.guidelines = props.guidelines ?? [];
        this.agentId = props.agentId || null;
        this.commandId = props.commandId || null;
        this.controls = { ...defaultControls, ...props.controls };
        this.context = { ...defaultContext, ...props.context };
    }

    public rename(newTitle: string): void {
        this.title = newTitle;
    }

    public updateContent(newContent: string): void {
        this.content = newContent;
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

    public clone(): Section {
        // Ensure a deep copy of nested objects
        return new Section(JSON.parse(JSON.stringify(this.toJSON())));
    }

    public toStateObject(): SectionProperties {
        return this.toJSON();
    }
}
