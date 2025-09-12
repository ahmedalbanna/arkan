import { Agent, type AgentProperties } from './agent';

// This interface is compatible with the ChatSession from useChatStore.ts
export interface ChatProperties {
  id: string;
  title: string;
  lastMessage: string;
  lastMessageTimestamp: string;
  participantIds: string[];
  participantNames: Record<string, string>;
  isSupportChat?: boolean;
  agent?: AgentProperties; // The raw agent data from the store
}

export class Chat {
  public id: string;
  public title: string;
  public lastMessage: string;
  public lastMessageTimestamp: string;
  public participantIds: string[];
  public participantNames: Record<string, string>;
  public isSupportChat: boolean;
  public agent?: Agent; // Will hold an Agent class instance

  constructor(props: ChatProperties) {
    this.id = props.id;
    this.title = props.title;
    this.lastMessage = props.lastMessage;
    this.lastMessageTimestamp = props.lastMessageTimestamp;
    this.participantIds = props.participantIds || [];
    this.participantNames = props.participantNames || {};
    this.isSupportChat = props.isSupportChat || false;

    // If raw agent data is provided, instantiate the Agent class
    if (props.agent) {
      this.agent = new Agent(props.agent);
    }
  }

  /**
   * Returns a formatted string for the last message timestamp for display.
   * e.g., "5 minutes ago", "Yesterday", "10/23/2024"
   */
  public getFormattedTimestamp(): string {
    if (!this.lastMessageTimestamp) return '';
    const now = new Date();
    const lastUpdate = new Date(this.lastMessageTimestamp);
    const diffSeconds = (now.getTime() - lastUpdate.getTime()) / 1000;
    const diffDays = Math.floor(diffSeconds / 86400);

    if (isNaN(diffDays)) return '';

    if (diffDays > 1) {
      return lastUpdate.toLocaleDateString();
    }
    if (diffDays === 1) {
      return 'Yesterday';
    }
    if (diffSeconds < 60) {
      return 'Just now';
    }
    if (diffSeconds < 3600) {
      return `${Math.floor(diffSeconds / 60)} minutes ago`;
    }
    return `${Math.floor(diffSeconds / 3600)} hours ago`;
  }
}