import { type RawChatMessage as ChatMessageType } from '@/hooks';
import { Agent, type AgentProperties } from './agent';

// Based on RawChatSession in useChatStore.ts
export interface ChatProperties {
  id: string;
  title: string;
  lastMessage: string;
  lastMessageTimestamp: any; // Can be a string or a Firebase ServerValue
  participantIds: string[];
  participantNames: Record<string, string>;
  isSupportChat?: boolean;
  agent?: AgentProperties; // Raw agent data from DB
  messages: ChatMessageType[];
  createdAt: any;
  updatedAt: any;
}

export class Chat implements ChatProperties {
  public id: string;
  public title: string;
  public lastMessage: string;
  public lastMessageTimestamp: any;
  public participantIds: string[];
  public participantNames: Record<string, string>;
  public isSupportChat?: boolean;
  public agent?: Agent; // Agent class instance
  public messages: ChatMessageType[];
  public createdAt: any;
  public updatedAt: any;
  constructor(props: ChatProperties) {
    this.id = props.id;
    this.title = props.title;
    this.lastMessage = props.lastMessage;
    this.lastMessageTimestamp = props.lastMessageTimestamp;
    this.participantIds = props.participantIds;
    this.participantNames = props.participantNames;
    this.isSupportChat = props.isSupportChat;
    this.messages = props.messages;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    // Instantiate the Agent class if agent data exists
    if (props.agent) {
      this.agent = new Agent(props.agent);
    }
  }

  /**
   * Returns the last message timestamp as a Date object.
   */
  get lastMessageDate(): Date {
    return new Date(this.lastMessageTimestamp);
  }
}
