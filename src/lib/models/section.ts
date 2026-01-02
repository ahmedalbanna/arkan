
'use client';

import { v4 as uuidv4 } from 'uuid';
import {
  Behavior,
  BehaviorSchema,
  defaultControls,
  GenerationControlState,
  GenerationControlStateSchema,
  SectionContext,
  SectionContextSchema,
  SectionType,
  SectionTypeSchema,
} from './control-types';
import { z } from 'zod';
import type { Project } from './project';
import { PromptBuilder } from '../prompt-builder';

export const SectionPropertiesSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  type: SectionTypeSchema,
  content: z.string().optional(),
  prompt: z.string().optional(),
  rules: z.array(z.string()).optional(),
  guidelines: z.array(z.string()).optional(),
  constraints: z.array(z.string()).optional(),
  behaviors: z.array(BehaviorSchema).optional(),
  controls: GenerationControlStateSchema.partial().optional(),
  context: SectionContextSchema.partial().optional(),
  metadata: z.record(z.any()).optional(),
});


export interface SectionProperties {
  id?: string;
  title: string;
  type: SectionType;
  content?: string;
  prompt?: string;
  rules?: string[];
  guidelines?: string[];
  constraints?: string[];
  behaviors?: Behavior[];
  controls?: Partial<GenerationControlState>;
  context?: Partial<SectionContext>;
  metadata?: Record<string, any>;
}

export class Section {
  public readonly id: string;
  public readonly title: string;
  public readonly type: SectionType;
  public readonly content: string;
  public readonly prompt: string;
  public readonly rules: readonly string[];
  public readonly guidelines: readonly string[];
  public readonly constraints: readonly string[];
  public readonly behaviors: readonly Behavior[];
  public readonly controls: GenerationControlState;
  public readonly context: SectionContext;
  public readonly metadata: Readonly<Record<string, any>>;

  constructor(props: SectionProperties) {
    this.id = props.id || uuidv4();
    this.title = props.title;
    this.type = props.type;
    this.content = props.content ?? '';
    this.prompt = props.prompt ?? '';
    this.rules = props.rules ?? [];
    this.guidelines = props.guidelines ?? [];
    this.constraints = props.constraints ?? [];
    this.behaviors = props.behaviors ?? [];
    this.metadata = props.metadata ?? {};

    this.controls = {
      ...defaultControls,
      ...props.controls,
      outputStyle: {
        ...defaultControls.outputStyle,
        ...(props.controls?.outputStyle || {}),
      },
    };

    this.context = {
      sections: props.context?.sections ?? {},
      externalContext: props.context?.externalContext ?? {},
    };
  }

  public with(props: Partial<SectionProperties>): Section {
    return new Section({ ...this.toStateObject(), ...props });
  }

  public buildSystemPrompt(): string {
    const personas = this.behaviors.filter(b => b.type === 'persona').map(b => b.name);
    const behaviorInstructions = this.behaviors.filter(b => b.type === 'behavior').map(b => b.name);

    let systemPrompt = 'You are an advanced AI assistant tailored for academic and technical writing.';

    if (personas.length > 0) {
      systemPrompt += `\n\n**ROLE / PERSONA:**\nAdopt the persona of: ${personas.join(', ')}. Write with the authority, vocabulary, and perspective of this role.`;
    }

    if (this.controls.tone) {
      systemPrompt += `\nMaintain a **${this.controls.tone}** tone throughout.`;
    }

    const allRules = [
      ...this.rules,
      ...behaviorInstructions,
      this.controls.language !== 'default' ? `Output must be in ${this.controls.language}.` : null,
    ].filter(Boolean) as string[];

    if (allRules.length > 0) {
      systemPrompt += `\n\n**MANDATORY RULES:**\n${allRules.map(r => `- ${r}`).join('\n')}`;
    }

    if (this.guidelines.length > 0) {
        systemPrompt += `\n\n**GUIDELINES (Follow these recommendations):**\n${this.guidelines.map(g => `- ${g}`).join('\n')}`;
    }

    if (this.constraints.length > 0) {
      systemPrompt += `\n\n**CONSTRAINTS (DO NOT DO):**\n${this.constraints.map(c => `- ${c}`).join('\n')}`;
    }

    // Output Format Specifics
    if (this.type === 'diagram') {
      systemPrompt += `\n\nOutput ONLY valid PlantUML code inside \`\`\`plantuml blocks. Do not add conversational text.`;
    } else if (this.type === 'code') {
      systemPrompt += `\n\nFocus on producing high-quality, documented code snippets.`;
    }

    return systemPrompt;
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
    
    if (this.controls.outputStyle.includeCitations && this.controls.citationStyle) {
        instructions.push(`Use ${this.controls.citationStyle} citation style.`);
    }

    const enabledStyles = Object.entries(this.controls.outputStyle).filter(([key, value]) => value && key !== 'includeCitations').map(([key]) => key);
    if (enabledStyles.length > 0) instructions.push(`The output should primarily include the following elements: ${enabledStyles.join(', ')}.`);
    
    const additionalInstructions = `\n\n**Additional Instructions:**\n${instructions.join(' ')}`;

    return `${this.prompt}${additionalInstructions}`;
  }

  public getContextAsRecord(project: Project): Record<string, string> {
      if (!this.context?.sections) return {};
      const contextRecord: Record<string, string> = {};
      for (const sectionId of Object.keys(this.context.sections)) {
          const section = project.getSection(sectionId);
          if (section?.content) {
              contextRecord[section.title] = section.content;
          }
      }
      return contextRecord;
  }

  public getExternalContextAsArray(project: Project): { fileName: string; content: string; type: string }[] {
      if (!this.context?.externalContext) return [];
      const externalContextArray = [];
      for (const fileId of Object.keys(this.context.externalContext)) {
          const file = project.externalContext?.find(f => f.id === fileId);
          if (file) {
              externalContextArray.push({
                  fileName: file.fileName,
                  content: file.content,
                  type: this.context.externalContext[fileId]!,
              });
          }
      }
      return externalContextArray;
  }

  public toStateObject(): SectionProperties {
    return {
      id: this.id,
      title: this.title,
      type: this.type,
      content: this.content,
      prompt: this.prompt,
      rules: [...this.rules],
      guidelines: [...this.guidelines],
      constraints: [...this.constraints],
      behaviors: [...this.behaviors],
      controls: this.controls,
      context: this.context,
      metadata: this.metadata,
    };
  }

  public toJSON(): SectionProperties {
    return this.toStateObject();
  }
}
