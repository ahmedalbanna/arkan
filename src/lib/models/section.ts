'use client';

import {
    GenerationControlState,
    defaultControls
} from '@/ai/schemas/generation-state';
import type { SectionContext } from './context';

export type SectionType = 'document' | 'presentation';

export interface SectionProperties {
    id: string;
    title: string;
    type: SectionType;
    content: string;
    prompt: string;
    guidelines: string[];
    agentId: string | null;
    commandId: string | null; // This is now deprecated but kept for safety
    controls: GenerationControlState;
    context: SectionContext;
}

export const defaultContext: SectionContext = {
    sections: {},
    externalContext: {},
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
        this.type = props.type || 'document';
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
