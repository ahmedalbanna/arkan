

import type { ProjectProposal, DiagramType, SectionName, PresentationHistoryEntry, AnyProjectProposal } from '@/ai/schemas';
export type {
  ProjectProposal,
  DiagramType,
  SectionName,
  PresentationHistoryEntry,
  ManipulateTextInput,
  ManipulateTextOutput,
  AnyProjectProposal,
} from '@/ai/schemas';
export type { HistoryEntry } from '@/hooks/use-history';
export type { LoginCredentials, SignupCredentials } from '@/hooks/use-user';
export type { UpdateAgentPayload, UpdateAgentVariables, CreateAgentVariables, Agent } from '@/hooks/use-agents';
export type { Feature, UpdateFeaturePayload, UpdateFeatureVariables } from '@/lib/types';
export type { VerifyPaymentVariables } from '@/hooks/use-transactions';
export type { PricingPlan } from '@/components/PricingCard';
export type { SavedProject, ProjectState } from '@/services/project-service';
export type { Codebase } from '@/ai/flows/generate-codebase';
export type { AcademicSolverState, ExternalContext as AcademicContextFile } from '@/hooks/useAcademicSolverStore';
export type { Team, TeamMember } from '@/lib/db/queries';
export type { TeamWithMembers } from '@/services/team-service';
export type { DocxTemplate, ProposalTemplate, ReportGenerationTemplate, PresentationGenerationTemplate } from '@/services/template-service';
export type { PptxTemplate, PptxStyleOptions, PptxTemplateKey } from './pptx-styles';
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

export interface Feature {
    id: string;
    name: string;
    description: string;
    isEnabled: boolean;
}

export interface UpdateFeaturePayload {
    isEnabled: boolean;
}

export interface UpdateFeatureVariables {
    featureId: string;
    payload: UpdateFeaturePayload;
}
