
// New, simplified Agent structure for Firestore
export interface AgentProperties {
  id: string;
  name: string;
  description: string;
  category: string;
  prompt: string;
  guidelines?: string[];
  isEnabled: boolean;
  author: string;
  version: string;
  createdAt?: string;
  updatedAt?: string;
}

// Add the missing Command type
export interface Command {
    id: string;
    name: string;
    prompt: string;
}
