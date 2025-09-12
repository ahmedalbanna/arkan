
// Based on RawChatMessage in useChatStore.ts
export interface ChatMessageProperties {
  id: string;
  senderId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: any; // Firebase server timestamp is an object
  isToolResponse?: boolean;
}

export class ChatMessage implements ChatMessageProperties {
  public id: string;
  public senderId: string;
  public role: 'user' | 'assistant';
  public content: string;
  public timestamp: any;
  public isToolResponse?: boolean;

  constructor(props: ChatMessageProperties) {
    this.id = props.id;
    this.senderId = props.senderId;
    this.role = props.role;
    this.content = props.content;
    this.timestamp = props.timestamp;
    this.isToolResponse = props.isToolResponse;
  }

  /**
   * Returns the timestamp as a Date object.
   */
  get date(): Date {
    // Firebase Realtime DB timestamp is milliseconds since epoch
    return new Date(this.timestamp);
  }
}
