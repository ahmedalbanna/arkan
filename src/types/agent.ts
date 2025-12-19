

// New, simplified Agent structure for Firestore
export interface AgentProperties {
  id: string;
  name: string;
  description: string;
  category: string;
  type: 'document' | 'presentation' | 'universal'; // Added to filter agents by section type
  prompt: string;
  guidelines?: string[];
  isEnabled?: boolean;
  author?: string;
  version?: string;
  createdAt?: string;
  updatedAt?: string;
}
