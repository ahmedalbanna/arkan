import type { LucideIcon } from 'lucide-react';

// --- Types moved from types.ts ---

export enum AgentCategory {
  ContentGeneration = 'content-generation',
  ProposalGeneration = 'proposal-generation',
  ReportGeneration = 'report-generation',
  DiagramGeneration = 'diagram-generation',
  PresentationGeneration = 'presentation-generation',
  CodeGeneration = 'code-generation',
  Marketing = 'marketing',
  Legal = 'legal',
  AdminTools = 'admin-tools',
  AgentManagement = 'agent-management',
}

export interface AgentCategoryDetails {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
  pageUrl: string;
}

export interface AgentGuideline {
  text: string;
  isDefault: boolean;
}

export interface AgentKnowledgeSource {
  name: string;
  type: 'file' | 'text' | 'web';
  content: string; // content, data URI, or URL
}

export interface AgentPrompt {
  base: string;
  guidelines?: AgentGuideline[];
}

// --- End of moved types ---

// This interface is now compatible with the one in `types.ts`
export interface AgentProperties {
  id: string;
  name: string;
  description: string;
  category: AgentCategory | string;
  pageUrl: string;
  isEnabled: boolean;
  prompt: AgentPrompt | string;
  toolIds?: string[];
  knowledge?: AgentKnowledgeSource[];
  introduction?: string;
  placeholder?: string;
  conversationStarters?: { value: string }[];
  tone?: string;
  language?: string;
  model?: string;
  isDefault?: boolean;
}

export class Agent {
  // private backing fields
  private _id: string;
  private _name: string;
  private _description: string;
  private _category: AgentCategory | string;
  private _pageUrl: string;
  private _isEnabled: boolean;
  private _prompt: AgentPrompt | string;
  private _toolIds?: string[];
  private _knowledge?: AgentKnowledgeSource[];
  private _introduction?: string;
  private _placeholder?: string;
  private _conversationStarters?: { value: string }[];
  private _tone?: string;
  private _language?: string;
  private _model?: string;
  private _isDefault?: boolean;

  constructor(props: AgentProperties) {
    this._id = props.id;
    this._name = props.name;
    this._description = props.description;
    this._category = props.category;
    this._pageUrl = props.pageUrl;
    this._isEnabled = props.isEnabled;
    this._prompt = props.prompt;
    this._toolIds = props.toolIds;
    this._knowledge = props.knowledge;
    this._introduction = props.introduction;
    this._placeholder = props.placeholder;
    this._conversationStarters = props.conversationStarters;
    this._tone = props.tone;
    this._language = props.language;
    this._model = props.model;
    this._isDefault = props.isDefault;
  }

  // Getters and setters for all attributes

  public get id(): string {
    return this._id;
  }
  public set id(value: string) {
    this._id = value;
  }

  public get name(): string {
    return this._name;
  }
  public set name(value: string) {
    this._name = value;
  }

  public get description(): string {
    return this._description;
  }
  public set description(value: string) {
    this._description = value;
  }

  public get category(): AgentCategory | string {
    return this._category;
  }
  public set category(value: AgentCategory | string) {
    this._category = value;
  }

  public get pageUrl(): string {
    return this._pageUrl;
  }
  public set pageUrl(value: string) {
    this._pageUrl = value;
  }

  public get isEnabled(): boolean {
    return this._isEnabled;
  }
  public set isEnabled(value: boolean) {
    this._isEnabled = value;
  }

  public get prompt(): AgentPrompt | string {
    return this._prompt;
  }
  public set prompt(value: AgentPrompt | string) {
    this._prompt = value;
  }

  public get toolIds(): string[] | undefined {
    return this._toolIds;
  }
  public set toolIds(value: string[] | undefined) {
    this._toolIds = value;
  }

  public get knowledge(): AgentKnowledgeSource[] | undefined {
    return this._knowledge;
  }
  public set knowledge(value: AgentKnowledgeSource[] | undefined) {
    this._knowledge = value;
  }

  public get introduction(): string | undefined {
    return this._introduction;
  }
  public set introduction(value: string | undefined) {
    this._introduction = value;
  }

  public get placeholder(): string | undefined {
    return this._placeholder;
  }
  public set placeholder(value: string | undefined) {
    this._placeholder = value;
  }

  public get conversationStarters(): { value: string }[] | undefined {
    return this._conversationStarters;
  }
  public set conversationStarters(value: { value: string }[] | undefined) {
    this._conversationStarters = value;
  }

  public get tone(): string | undefined {
    return this._tone;
  }
  public set tone(value: string | undefined) {
    this._tone = value;
  }

  public get language(): string | undefined {
    return this._language;
  }
  public set language(value: string | undefined) {
    this._language = value;
  }

  public get model(): string | undefined {
    return this._model;
  }
  public set model(value: string | undefined) {
    this._model = value;
  }

  public get isDefault(): boolean | undefined {
    return this._isDefault;
  }
  public set isDefault(value: boolean | undefined) {
    this._isDefault = value;
  }

  public toJSON(): AgentProperties {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      category: this.category,
      pageUrl: this.pageUrl,
      isEnabled: this.isEnabled,
      prompt: this.prompt,
      toolIds: this.toolIds,
      knowledge: this.knowledge,
      introduction: this.introduction,
      placeholder: this.placeholder,
      conversationStarters: this.conversationStarters,
      tone: this.tone,
      language: this.language,
      model: this.model,
      isDefault: this.isDefault,
    };
  }
  public toStateObject(): AgentProperties {
    return this.toJSON();
  }

  /**
   * Updates the agent's prompt.
   * @param newPrompt The new prompt.
   */
  public updatePrompt(newPrompt: AgentPrompt | string): void {
    this.prompt = newPrompt;
    // In a real app, this would trigger a mutation via a hook
  }

  /**
   * A placeholder for the agent's primary execution logic.
   * @param context Any relevant context or input for the task.
   */
  public async execute(context: any): Promise<any> {
    const goal = typeof this.prompt === 'string' ? this.prompt : this.prompt.base;
    console.log(`Agent ${this.name} is executing its goal: ${goal}`);
    // In a real implementation, this would involve complex logic,
    // possibly calling an AI service with its prompt and the context.
    return { success: true, result: "Task completed successfully." };
  }

  /**
   * Toggles the enabled state of the agent.
   */
  public toggleEnabled(): void {
    this.isEnabled = !this.isEnabled;
    // In a real app, this would trigger a mutation
  }
}
