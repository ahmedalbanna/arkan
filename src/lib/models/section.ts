'use client';

import type { DiagramType, ExternalContextType } from '@/ai/schemas';
import type { Language, OutputStyle, Tone } from './control-types';

export interface GenerationControlState {
    formality: number;
    complexity: number;
    tone: Tone;
    language: Language;
    outputStyle: OutputStyle;
    wordCount: string;
    diagramType: DiagramType;
    programmingLanguage?: string;
    tableCaption?: string;
    includedHeadings?: string[];
}

export interface SectionContext {
    sections: Record<string, ExternalContextType>;
    externalContext: Record<string, ExternalContextType>;
}

export type BehaviorType = 'behavior' | 'persona';

export interface Behavior {
    name: string;
    type: BehaviorType;
}

export type SectionType = 'report' | 'diagram' | 'presentation';

export interface SectionProperties {
    id: string;
    title: string;
    type: SectionType;
    content?: string;
    prompt?: string;
    system?: string;
    rules?: string[];
    guidelines?: string[];
    constraints?: string[];
    behaviors?: Behavior[];
    agentId?: string | null;
    commandId?: string | null;
    controls?: GenerationControlState;
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
    programmingLanguage: '',
    tableCaption: '',
    includedHeadings: [],
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
    public prompt: string;
    public system: string;
    public rules?: string[];
    public guidelines?: string[];
    public constraints?: string[];
    public behaviors?: Behavior[];
    public agentId?: string | null;
    public commandId?: string | null;
    public controls: GenerationControlState;
    public context: SectionContext;

    constructor(props: SectionProperties) {
        this.id = props.id;
        this.title = props.title;
        this.type = props.type;
        this.content = props.content ?? '';
        this.prompt = props.prompt ?? '';
        this.rules = props.rules ?? [];
        this.guidelines = props.guidelines ?? [];
        this.constraints = props.constraints ?? [];
        this.behaviors = props.behaviors ?? [];
        this.agentId = props.agentId || null;
        this.commandId = props.commandId || null;
        this.controls = { ...defaultControls, ...props.controls };
        this.context = { ...defaultContext, ...props.context };
        this.system = this.buildSystemPrompt();
    }

    private buildPromptSection(title: string, items?: string[]): string {
        if (!items || items.length === 0) return '';
        return `\n**${title}:**\n${items.map(item => `- ${item}`).join('\n')}`;
    }

    public buildActionPrompt(): string {
        const formalityMap: { [key: number]: string } = { 0: 'very informal and casual', 33: 'balanced and neutral', 67: 'formal and professional', 100: 'very formal and academic' };
        const complexityMap: { [key: number]: string } = { 0: 'very simple and easy to understand', 33: 'clear and straightforward', 67: 'detailed and technical', 100: 'highly complex and expert-level' };

        let instructions: string[] = [];
        const formality = this.controls.formality > 67 ? formalityMap[100] : this.controls.formality > 33 ? formalityMap[67] : this.controls.formality > 0 ? formalityMap[33] : formalityMap[0];
        instructions.push(`The formality should be ${formality}.`);

        const complexity = this.controls.complexity > 67 ? complexityMap[100] : this.controls.complexity > 33 ? complexityMap[67] : this.controls.complexity > 0 ? complexityMap[33] : complexityMap[0];
        instructions.push(`The complexity should be ${complexity}.`);

        if (this.controls.tone) instructions.push(`The tone should be ${this.controls.tone}.`);
        if (this.controls.wordCount) instructions.push(`Aim for a word count of approximately ${this.controls.wordCount} words.`);

        if (this.controls.outputStyle.diagram && this.controls.diagramType) {
            instructions.push(`The output must include a PlantUML diagram of type '${this.controls.diagramType}'.`);
        }
        if (this.controls.outputStyle.code && this.controls.programmingLanguage) {
            instructions.push(`The code blocks should be in ${this.controls.programmingLanguage}.`);
        }
        if (this.controls.outputStyle.table && this.controls.tableCaption) {
            instructions.push(`If a table is generated, it must have the caption: "${this.controls.tableCaption}".`);
        }
        if (this.controls.outputStyle.heading && this.controls.includedHeadings && this.controls.includedHeadings.length > 0) {
            instructions.push(`The heading should cover the following topics: ${this.controls.includedHeadings.join(', ')}.`);
        }

        if (this.controls.language && this.controls.language !== 'default') {
            instructions.push(`The output language must be ${this.controls.language}.`);
        }

        const enabledStyles = Object.entries(this.controls.outputStyle).filter(([, value]) => value).map(([key]) => key);
        if (enabledStyles.length > 0) instructions.push(`The output should primarily include the following elements: ${enabledStyles.join(', ')}.`);
        
        const additionalInstructions = `\n\n**Additional Instructions:**\n${instructions.join(' ')}`;

        return `${this.prompt}${additionalInstructions}`;
    }

    public buildSystemPrompt(): string {
        const basePersona = 'You are a helpful assistant.';
        const personas = this.behaviors?.filter(b => b.type === 'persona').map(b => b.name);
        const behaviors = this.behaviors?.filter(b => b.type === 'behavior').map(b => b.name);

        const personaSection = this.buildPromptSection('Personas to Adopt', personas);
        const behaviorSection = this.buildPromptSection('Behaviors to Follow', behaviors);
        const rulesSection = this.buildPromptSection('Mandatory Rules', this.rules);
        const guidelinesSection = this.buildPromptSection('Recommended Guidelines', this.guidelines);
        const constraintsSection = this.buildPromptSection('Constraints / What to Avoid', this.constraints);

        return `${basePersona}${personaSection}${behaviorSection}${rulesSection}${guidelinesSection}${constraintsSection}`.trim();
    }


    public toJSON(): SectionProperties {
        return {
            id: this.id,
            title: this.title,
            type: this.type,
            content: this.content,
            prompt: this.prompt,
            system: this.system,
            rules: this.rules,
            guidelines: this.guidelines,
            constraints: this.constraints,
            behaviors: this.behaviors,
            agentId: this.agentId,
            commandId: this.commandId,
            controls: this.controls,
            context: this.context,
        };
    }

    public with(props: Partial<Omit<SectionProperties, 'id'>>): Section {
        const newProps = { ...this.toJSON(), ...props, id: this.id };
        return new Section(newProps);
    }
}
