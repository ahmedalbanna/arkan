
import type { ProjectProposal, DiagramType, SectionName, PresentationHistoryEntry, AnyProjectProposal, ProjectPlan } from '@/ai/schemas';
import type { User as FirebaseUser } from 'firebase/auth';
import type { GenerateAgentConfigOutput } from '@/ai/flows/generate-agent-config';

export type {
  ProjectProposal,
  DiagramType,
  SectionName,
  PresentationHistoryEntry,
  ManipulateTextInput,
  ManipulateTextOutput,
  AnyProjectProposal,
  ProjectPlan,
} from '@/ai/schemas';

export type { HistoryEntry } from '@/hooks/use-history';
export type { UpdateAgentPayload, UpdateAgentVariables, CreateAgentVariables } from '@/hooks/use-agents';
export type { Agent, AgentData, AgentPrompt } from '@/lib/agents';
export type { VerifyPaymentVariables } from '@/hooks/use-transactions';
export type { PricingPlan } from '@/components/PricingCard';
export type { Codebase } from '@/ai/flows/generate-codebase';
export type { AcademicSolverState, ExternalContext as AcademicContextFile, AcademicSolverStage } from '@/hooks/useAcademicSolverStore';
export type { TeamWithMembers } from '@/services/team-service';
export type { Team, TeamMember, UserProfile } from '@/lib/db/queries';
export type { DocxTemplate, ProposalTemplate, ReportGenerationTemplate, PresentationGenerationTemplate } from '@/services/template-service';
export type { ChatSession, ChatMessage, AgentChatSession } from '@/hooks/useChatStore';
export type { ExternalContext, ContextFileType } from '@/hooks/useReportStore';
export type { TranslateVariables, TranslateTextOutput } from '@/ai/flows/translate-text';
export type { SignupCredentials } from '@/components/SignupForm';
export type { GenerateProposalBody } from '@/hooks/use-proposal-generation';


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

export interface ProjectState {
    name?: string | undefined;
    projectIdea?: string | undefined;
    proposal: AnyProjectProposal | null;
    sections?: {
        introduction?: string | undefined;
        literatureReview?: string | undefined;
        systemAnalysis?: string | undefined;
        designStrategy?: string | undefined;
        systemDesign?: string | undefined;
        systemProgramming?: string | undefined;
        systemTesting?: string | undefined;
        conclusion?: string | undefined;
        abstract?: string | undefined;
        acknowledgment?: string | undefined;
        trainingProgram?: string | undefined;
        technicalExperience?: string | undefined;
        recommendations?: string | undefined;
        references?: string | undefined;
        appendices?: string | undefined;
    } | undefined;
    translatedSections?: {
        introduction?: string | undefined;
        literatureReview?: string | undefined;
        systemAnalysis?: string | undefined;
        designStrategy?: string | undefined;
        systemDesign?: string | undefined;
        systemProgramming?: string | undefined;
        systemTesting?: string | undefined;
        conclusion?: string | undefined;
        abstract?: string | undefined;
        acknowledgment?: string | undefined;
        trainingProgram?: string | undefined;
        technicalExperience?: string | undefined;
        recommendations?: string | undefined;
        references?: string | undefined;
        appendices?: string | undefined;
    } | undefined;
    evaluation?: import("@/ai/flows/evaluate-report").EvaluateReportOutput | null | undefined;
    diagrams?: {
        "use-case"?: import("@/hooks/useDiagramStore").DiagramData | undefined;
        class?: import("@/hooks/useDiagramStore").DiagramData | undefined;
        sequence?: import("@/hooks/useDiagramStore").DiagramData | undefined;
        activity?: import("@/hooks/useDiagramStore").DiagramData | undefined;
        component?: import("@/hooks/useDiagramStore").DiagramData | undefined;
        archimate?: import("@/hooks/useDiagramStore").DiagramData | undefined;
        er?: import("@/hooks/useDiagramStore").DiagramData | undefined;
    } | undefined;
    presentation?: {
        history: PresentationHistoryEntry[];
    } | undefined;
    codeGenerator?: any;
    academicSolver?: any;
    codebase?: any;
    externalContext?: any[] | undefined;
    teamId?: string | null | undefined;
    projectPlan: import("@/ai/schemas").ProjectPlan | null;
}
export interface SavedProject extends ProjectState {
    id: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
}
