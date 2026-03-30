import { z } from 'zod';
import { defaultControls, type GenerationControlState } from './ControlTypes';

export const SectionStatusSchema = z.enum(['pending', 'in_progress', 'completed', 'failed']);
export type SectionStatus = z.infer<typeof SectionStatusSchema>;

export const SectionTypeSchema = z.enum(['report', 'diagram', 'presentation', 'code', 'math']);
export type SectionType = z.infer<typeof SectionTypeSchema>;

export const SectionContextSchema = z.object({
  sections: z.record(z.string(), z.string()).optional(),
  externalContext: z.record(z.string(), z.string()).optional(),
});
export type SectionContext = z.infer<typeof SectionContextSchema>;

export const SectionPropertiesSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: SectionTypeSchema.optional(),
  content: z.string().optional(),
  status: SectionStatusSchema.optional(),
  progress: z.number().optional(),
  aiOutput: z.any().optional(),
  lastUpdated: z.string().optional(),
  with: z.array(z.string()).optional(),
  controls: z.any().optional(), // Use any for raw data, cast to GenerationControlState in class
  prompt: z.string().optional(),
  rules: z.array(z.string()).optional(),
  guidelines: z.array(z.string()).optional(),
  constraints: z.array(z.string()).optional(),
  behaviors: z.array(z.string()).optional(),
  context: SectionContextSchema.optional(),
});

export interface SectionProperties extends Omit<z.infer<typeof SectionPropertiesSchema>, 'with' | 'rules' | 'guidelines' | 'constraints' | 'behaviors'> {
    readonly id: string;
    readonly title: string;
    readonly with?: readonly string[];
    readonly rules?: readonly string[];
    readonly guidelines?: readonly string[];
    readonly constraints?: readonly string[];
    readonly behaviors?: readonly string[];
}

export class Section {
  public readonly id: string;
  public readonly title: string;
  public readonly type: SectionType;
  public readonly content: string;
  public readonly status: SectionStatus;
  public readonly progress: number;
  public readonly aiOutput: any;
  public readonly lastUpdated: string;
  public readonly with: readonly string[];
  public readonly controls: GenerationControlState;
  public readonly prompt: string;
  public readonly rules: readonly string[];
  public readonly guidelines: readonly string[];
  public readonly constraints: readonly string[];
  public readonly behaviors: readonly string[];
  public readonly context?: SectionContext;

  constructor(props: SectionProperties) {
    this.id = props.id;
    this.title = props.title;
    this.type = props.type || 'report';
    this.content = props.content || '';
    this.status = props.status || 'pending';
    this.progress = props.progress || 0;
    this.aiOutput = props.aiOutput || null;
    this.lastUpdated = props.lastUpdated || new Date().toISOString();
    this.with = props.with || [];
    this.controls = props.controls || { ...defaultControls };
    this.prompt = props.prompt || '';
    this.rules = props.rules || [];
    this.guidelines = props.guidelines || [];
    this.constraints = props.constraints || [];
    this.behaviors = props.behaviors || [];
    this.context = props.context;
  }

  public withProps(props: Partial<SectionProperties>): Section {
    return new Section({
      id: this.id,
      title: props.title ?? this.title,
      type: props.type ?? this.type,
      content: props.content ?? this.content,
      status: props.status ?? this.status,
      progress: props.progress ?? this.progress,
      aiOutput: props.aiOutput ?? this.aiOutput,
      lastUpdated: props.lastUpdated ?? this.lastUpdated,
      with: props.with ? [...props.with] : [...this.with],
      controls: props.controls ?? this.controls,
      prompt: props.prompt ?? this.prompt,
      rules: props.rules ? [...props.rules] : [...this.rules],
      guidelines: props.guidelines ? [...props.guidelines] : [...this.guidelines],
      constraints: props.constraints ? [...props.constraints] : [...this.constraints],
      behaviors: props.behaviors ? [...props.behaviors] : [...this.behaviors],
      context: props.context ?? this.context,
    });
  }

  public buildSystemPrompt(): string {
    const parts: string[] = [];
    if (this.rules.length) parts.push(`Rules:\n${this.rules.map(r => `- ${r}`).join('\n')}`);
    if (this.guidelines.length) parts.push(`Guidelines:\n${this.guidelines.map(g => `- ${g}`).join('\n')}`);
    if (this.constraints.length) parts.push(`Constraints:\n${this.constraints.map(c => `- ${c}`).join('\n')}`);
    if (this.behaviors.length) parts.push(`Behaviors:\n${this.behaviors.map(b => `- ${b}`).join('\n')}`);
    return parts.join('\n\n');
  }

  public buildActionPrompt(): string {
    const controlLines = Object.entries(this.controls || {})
      .map(([key, value]) => `- ${key}: ${JSON.stringify(value)}`)
      .join('\n');
    const promptLines = [this.prompt, controlLines].filter(Boolean).join('\n');
    return promptLines || `Generate content for section: ${this.title}`;
  }

  public toProperties(): SectionProperties {
    return {
      id: this.id,
      title: this.title,
      type: this.type,
      content: this.content,
      status: this.status,
      progress: this.progress,
      aiOutput: this.aiOutput,
      lastUpdated: this.lastUpdated,
      with: [...this.with],
      controls: { ...this.controls },
      prompt: this.prompt,
      rules: [...this.rules],
      guidelines: [...this.guidelines],
      constraints: [...this.constraints],
      behaviors: [...this.behaviors],
      context: this.context ? { ...this.context } : undefined,
    };
  }

  public toJSON(): SectionProperties {
    return this.toProperties();
  }
}
