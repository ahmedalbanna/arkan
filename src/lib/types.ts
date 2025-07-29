

import type { ProjectProposal, DiagramType, SectionName, PresentationHistoryEntry, ManipulateTextInput, ManipulateTextOutput, AnyProjectProposal } from '@/ai/schemas';
export type {
  ProjectProposal,
  DiagramType,
  SectionName,
  PresentationHistoryEntry,
  ManipulateTextInput,
  ManipulateTextOutput,
  AnyProjectProposal,
};
export type {
  HistoryEntry,
} from '@/hooks/use-history';
export type { LoginCredentials } from '@/hooks/use-user';
export type { UpdateAgentPayload, UpdateAgentVariables, CreateAgentVariables } from '@/hooks/use-agents';
export type { Feature, UpdateFeaturePayload, UpdateFeatureVariables } from '@/hooks/use-features';
export type { VerifyPaymentVariables } from '@/hooks/use-transactions';
export type { PricingPlan } from '@/components/PricingCard';
export type { SavedProject, ProjectState } from '@/services/project-service';
export type { Codebase } from '@/ai/flows/generate-codebase';

// Define TranslateTextOutput here since it is no longer in schemas.ts
export type { AcademicSolverState, ExternalContext as AcademicContextFile } from '@/hooks/useAcademicSolverStore';
export type { Team, TeamMember } from '@/lib/db/queries';
export type { TeamWithMembers } from '@/services/team-service';
export type { DocxTemplate, ProposalTemplate, ReportGenerationTemplate, PresentationGenerationTemplate } from '@/services/template-service';
export type { PptxTemplate, PptxStyleOptions } from './pptx-styles';
export type { UserProfile } from '@/lib/db/queries';
export type { ChatSession, ChatMessage, AgentChatSession } from '@/hooks/useChatStore';
export type { ExternalContext } from '@/hooks/useReportStore';
export type { TranslateVariables, TranslateTextOutput } from '@/ai/flows/translate-text';

export interface Notification {
  id: string;
  title: string;
  description: string;
  icon: 'credit-card' | 'bot' | 'file-text' | 'user-plus';
  isRead: boolean;
  createdAt: string;
  link?: string;
}
