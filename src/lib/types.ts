
export * from './models/agent';
export * from './models/chat';
export * from './models/diagram';
export * from './models/project';
export * from './models/section';
export * from './models/team';
export * from './models/transaction';
export * from './models/user';
export * from './models/template';
export * from './models/docxTemplate';
export * from './models/pptxTemplate';
export * from './models/reportTemplate';
export * from './word-converter/types';

export interface HistoryEntry {
  id: string;
  createdAt: string;
  type: 'proposal' | 'diagram' | 'section' | 'project' | 'presentation'; // Added 'project' and 'presentation'
  title: string; // e.g., "Project Proposal" or "Use Case Diagram"
  data: any;
}


export interface Notification {
  id: string;
  title: string;
  description: string;
  icon: 'credit-card' | 'bot' | 'file-text' | 'user-plus' | string; // Allow for more icons
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export interface PricingPlan {
    id: string;
    name: string;
    price: number;
    credits: number;
    features: string[];
    isPopular?: boolean;
}

export type TTSInput = {
    text: string;
}

export type TTSOutput = {
    audioDataUri: string;
}
