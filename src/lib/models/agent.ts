import type { LucideIcon } from 'lucide-react';
// Note: Adjust the import path based on your project's structure if needed.
import type { AgentCategory, AgentKnowledgeSource, AgentPrompt } from '../types';

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
  icon?: LucideIcon;
  iconComponent?: LucideIcon;
}

export class Agent {
  public id: string;
  public name: string;
  public description: string;
  public category: AgentCategory | string;
  public pageUrl: string;
  public isEnabled: boolean;
  public prompt: AgentPrompt | string;
  public toolIds?: string[];
  public knowledge?: AgentKnowledgeSource[];
  public introduction?: string;
  public placeholder?: string;
  public conversationStarters?: { value: string }[];
  public tone?: string;
  public language?: string;
  public model?: string;
  public isDefault?: boolean;
  public icon?: LucideIcon;
  public iconComponent?: LucideIcon;

  constructor(props: AgentProperties) {
    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.category = props.category;
    this.pageUrl = props.pageUrl;
    this.isEnabled = props.isEnabled;
    this.prompt = props.prompt;
    this.toolIds = props.toolIds;
    this.knowledge = props.knowledge;
    this.introduction = props.introduction;
    this.placeholder = props.placeholder;
    this.conversationStarters = props.conversationStarters;
    this.tone = props.tone;
    this.language = props.language;
    this.model = props.model;
    this.isDefault = props.isDefault;
    this.icon = props.icon;
    this.iconComponent = props.iconComponent;
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
