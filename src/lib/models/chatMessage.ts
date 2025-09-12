import { v4 as uuidv4 } from 'uuid';

// This interface is compatible with the one in useChatStore.ts
export interface ChatMessageProperties {
  id?: string; // Make ID optional, we can generate it
  senderId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: any; // Firebase uses server timestamps which can be objects
  isToolResponse?: boolean;
}

export class ChatMessage {
  public id: string;
  public senderId: string;
  public role: 'user' | 'assistant';
  public content: string;
  public timestamp: any;
  public isToolResponse: boolean;

  constructor(props: ChatMessageProperties) {
    this.id = props.id || uuidv4();
    this.senderId = props.senderId;
    this.role = props.role;
    this.content = props.content;
    this.timestamp = props.timestamp;
    this.isToolResponse = props.isToolResponse || false;
  }

  /**
   * Returns the date of the message, handling different timestamp formats.
   */
  public getMessageDate(): Date {
    // Handle Firebase server timestamp which might be an object
    if (typeof this.timestamp === 'object' && this.timestamp && 'seconds' in this.timestamp) {
      return new Date(this.timestamp.seconds * 1000);
    }
    // Handle ISO string or number timestamp
    return new Date(this.timestamp);
  }
}