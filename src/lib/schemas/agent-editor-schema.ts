import { z } from 'zod';

export const agentKnowledgeSourceSchema = z.object({
    name: z.string(),
    type: z.enum(['file', 'text', 'web']),
    content: z.string(),
});

export const agentGuidelineSchema = z.object({
  text: z.string().min(1, "Guideline text cannot be empty."),
  isDefault: z.boolean(),
});

export const agentPromptSchema = z.object({
  base: z.string().min(10, "Base prompt must be at least 10 characters."),
  guidelines: z.array(agentGuidelineSchema).optional(),
  jsonStructure: z.any().optional(),
  defaultContext: z.array(z.string()).optional(),
});

export const agentEditorSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  category: z.string().optional(), // Changed to string for dynamic categories
  prompt: z.union([
    z.string().min(10, "Prompt must be at least 10 characters"),
    agentPromptSchema
  ]).optional(),
  introduction: z.string().max(500).optional(),
  placeholder: z.string().optional(),
  conversationStarters: z.array(z.object({ value: z.string() })).optional(),
  tone: z.string().optional(),
  language: z.string().optional(),
  model: z.string().optional(),
  toolIds: z.array(z.string()).optional(),
  knowledge: z.array(agentKnowledgeSourceSchema).optional(),
  isEnabled: z.boolean().optional(),
  icon: z.string().optional(),
});

export type AgentEditorFormValues = z.infer<typeof agentEditorSchema>;
