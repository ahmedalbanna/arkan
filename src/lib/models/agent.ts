
import { z } from "zod";

// Zod schema for creating an agent
export const CreateAgentSchema = z.object({
  id: z.string().min(3, "ID must be at least 3 characters").regex(/^[a-z0-9-]+$/, "ID can only contain lowercase letters, numbers, and hyphens."),
  name: z.string().min(1, 'Agent name is required.'),
  description: z.string().min(1, 'Agent description is required.'),
  category: z.string().min(1, 'Category is required.'),
  prompt: z.string().min(10, 'Prompt is required.'),
  guidelines: z.array(z.string()).optional(),
  isEnabled: z.boolean().default(true),
  author: z.string().default('Custom'),
  version: z.string().default('1.0'),
});

// Zod schema for updating an agent (all fields optional)
export const UpdateAgentSchema = CreateAgentSchema.omit({ id: true }).partial();


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
