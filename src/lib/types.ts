
import { type ProjectState as FullProjectState } from './project-state-schema';
import type {
  ProjectProposal,
  DiagramType,
  SectionName,
  PresentationHistoryEntry,
} from './schemas';
export type {
  ProjectProposal,
  DiagramType,
  SectionName,
  PresentationHistoryEntry,
};
export type {
  HistoryEntry,
  useHistory,
} from '@/hooks/use-history';
export type { LoginCredentials } from '@/hooks/use-user';
export type { UpdateAgentPayload, UpdateAgentVariables, CreateAgentVariables } from '@/hooks/use-agents';
export type { Feature, UpdateFeaturePayload, UpdateFeatureVariables } from '@/hooks/use-features';
export type { VerifyPaymentVariables } from '@/hooks/use-transactions';
export type { TranslateTextOutput } from '@/ai/schemas';
export type { PricingPlan } from '@/components/PricingCard';
export type { SavedProject } from '@/services/project-service';

// This re-exports the Zod-inferred type for use on the client
export type ProjectState = FullProjectState;
export type TranslateVariables = {
    text: string;
    targetLang: 'en' | 'ar';
};
export type { HomeworkHistoryEntry } from '@/services/homework-service';
export type { AgentData, Agent } from '@/lib/agents';
