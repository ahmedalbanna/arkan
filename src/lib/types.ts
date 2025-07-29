
import type { ProjectProposal, DiagramType, SectionName, PresentationHistoryEntry, AnyProjectProposal } from '@/ai/schemas';
import type { User as FirebaseUser } from 'firebase/auth';

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
export type { UpdateAgentPayload, UpdateAgentVariables, CreateAgentVariables } from '@/hooks/use-agents';
export type { Agent, AgentData } from '@/lib/agents';
export type { VerifyPaymentVariables } from '@/hooks/use-transactions';
export type { PricingPlan } from '@/components/PricingCard';
export type { Codebase } from '@/ai/flows/generate-codebase';
export type { AcademicSolverState, ExternalContext as AcademicContextFile, AcademicSolverStage } from '@/hooks/useAcademicSolverStore';
export type { TeamWithMembers } from '@/services/team-service';
export type { Team, TeamMember, UserProfile, LoginCredentials } from '@/lib/db/queries';
export type { DocxTemplate, ProposalTemplate, ReportGenerationTemplate, PresentationGenerationTemplate } from '@/services/template-service';
export type { ChatSession, ChatMessage, AgentChatSession } from '@/hooks/useChatStore';
export type { ExternalContext } from '@/hooks/useReportStore';
export type { TranslateVariables, TranslateTextOutput } from '@/ai/flows/translate-text';
export type { SignupCredentials } from '@/components/SignupForm';
export type { ProjectState, SavedProject } from '@/services/project-service';

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


// --- PPTX Template Types ---
export type PptxTemplateKey = 'modern' | 'dark' | 'professional';

export interface PptxStyleOptions {
    background: { color: string };
    title: { fontFace: string; fontSize: number; bold: boolean; color: string; align: 'left' | 'center' | 'right' };
    body: { fontFace: string; fontSize: number; color: string; align: 'left' | 'center' | 'right' };
    bullet: { type: 'bullet' | 'number' };
}

export interface PptxTemplate {
    id: string;
    name: string;
    styles: PptxStyleOptions;
    description: string;
    imageUrl: string;
    dataAiHint: string;
}
