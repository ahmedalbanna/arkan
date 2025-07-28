

import type { ProjectProposal, DiagramType, SectionName, PresentationHistoryEntry, ManipulateTextInput, ManipulateTextOutput, TranslateTextInput, TranslateTextOutput, AnyProjectProposal } from '@/ai/schemas';
export type {
  ProjectProposal,
  DiagramType,
  SectionName,
  PresentationHistoryEntry,
  ManipulateTextInput,
  ManipulateTextOutput,
  TranslateTextInput,
  TranslateTextOutput,
  AnyProjectProposal,
};
export type {
  HistoryEntry,
  useHistory,
} from '@/hooks/use-history';
export type { LoginCredentials } from '@/hooks/use-user';
export type { UpdateAgentPayload, UpdateAgentVariables, CreateAgentVariables } from '@/hooks/use-agents';
export type { Feature, UpdateFeaturePayload, UpdateFeatureVariables } from '@/hooks/use-features';
export type { VerifyPaymentVariables } from '@/hooks/use-transactions';
export type { PricingPlan } from '@/components/PricingCard';
export type { SavedProject, ProjectState } from '@/services/project-service';
export type { Codebase } from '@/ai/flows/generate-codebase';
export type { AgentData, Agent, AgentPrompt } from '@/lib/agents';

// Define TranslateTextOutput here since it is no longer in schemas.ts
export type { AcademicSolverState, ExternalContext } from '@/hooks/useAcademicSolverStore';
export type { Team, TeamMember, TeamWithMembers } from '@/services/team-service';
export type { DocxTemplate, ProposalTemplate, ReportGenerationTemplate, PresentationGenerationTemplate } from '@/services/template-service';
export type { PptxTemplate, PptxStyleOptions, PptxTemplateKey } from './pptx-styles';
