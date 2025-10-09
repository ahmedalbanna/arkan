

'use client';

import type { AnyProjectProposal, PresentationHistoryEntry, ProjectPlan } from '@/ai/schemas';
import type { DocxTemplateSchema, PptxTemplateSchema, PresentationGenerationTemplateSchema, ProposalTemplateSchema, ReportGenerationTemplateSchema } from '@/ai/schemas/template-schemas';
import { LucideIcon } from 'lucide-react';
import { z } from 'zod';


export type {
  AnyProjectProposal, DiagramType, ManipulateTextInput,
  ManipulateTextOutput, PresentationHistoryEntry, ProjectPlan, ProjectProposal, SectionName
} from '@/ai/schemas';

export type { CreateAgentVariables, UpdateAgentPayload, UpdateAgentVariables } from '@/hooks/use-agents';
export type { HistoryEntry } from '@/hooks/use-history';

export type { Codebase, GenerateAgentConfigOutput, RewriteTextOutput, TranslateTextOutput, TranslateVariables } from '@/ai/schemas';
export type { PricingPlan } from '@/components/PricingCard';
export type { SignupCredentials } from '@/components/SignupForm';
export type { GenerateProposalBody } from '@/hooks/use-proposal-generation';
export type { VerifyPaymentVariables } from '@/hooks/use-transactions';
export type { AcademicSolverStage, AcademicSolverState } from '@/hooks/useAcademicSolverStore';
export type { AgentChatSession, ChatMessage, ChatSession } from '@/hooks/useChatStore';
export type { Team, TeamMember, UserProfile } from '@/lib/db/queries';
export type { DiffPart } from '@/lib/diff';
export type { TeamWithMembers } from '@/services/team-service';

// Re-exporting generated Template types from Zod schemas
export type DocxTemplate = z.infer<typeof DocxTemplateSchema>;
export type DocxTemplatesRecord = Record<string, DocxTemplate>;
export type PptxTemplate = z.infer<typeof PptxTemplateSchema> & { templateUrl?: string };
export type ProposalTemplate = z.infer<typeof ProposalTemplateSchema>;
export type ReportGenerationTemplate = z.infer<typeof ReportGenerationTemplateSchema>;
export type PresentationGenerationTemplate = z.infer<typeof PresentationGenerationTemplateSchema>;
export type PptxStyleOptions = z.infer<typeof PptxTemplateSchema>['styles'];

export enum AgentCategory {
  ContentGeneration = 'content-generation',
  ProposalGeneration = 'proposal-generation',
  ReportGeneration = 'report-generation',
  DiagramGeneration = 'diagram-generation',
  PresentationGeneration = 'presentation-generation',
  CodeGeneration = 'code-generation',
  Marketing = 'marketing',
  Legal = 'legal',
  AdminTools = 'admin-tools',
  AgentManagement = 'agent-management',
}

export interface AgentCategoryDetails {
  name: string;
  icon: LucideIcon;
  description: string;
  pageUrl: string;
}

export interface AgentGuideline {
  text: string;
  isDefault: boolean;
}

export interface AgentKnowledgeSource {
  name: string;
  type: 'file' | 'text' | 'web';
  content: string; // content, data URI, or URL
}

export interface AgentPrompt {
  base: string;
  guidelines?: AgentGuideline[];
  jsonStructure?: any;
  defaultContext?: ('proposal' | 'projectPlan' | string)[]; // Array of agent IDs or keywords
}

export interface AgentData {
  id: string;
  name: string;
  description: string;
  category: AgentCategory | string;
  pageUrl: string;
  isEnabled: boolean;
  prompt: AgentPrompt | string; // Can be simple string or complex object
  toolIds?: string[];
  knowledge?: AgentKnowledgeSource[];
  introduction?: string;
  placeholder?: string;
  conversationStarters?: { value: string }[];
  tone?: string;
  language?: string;
  model?: string;
  isDefault?: boolean;
}

export interface Agent extends AgentData {
  icon: LucideIcon;
}
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

export interface LoginCredentials {
  email: string;
  password: string;
}

// --- PPTX Template Types ---
export type PptxTemplateKey = 'modern' | 'dark' | 'professional' | string;

export type TemplateKey = 'modern' | 'classic' | 'academic' | string;


// --- Full Report Mode Configuration Interfaces ---

export interface FullReportModeConfig {
  mode: "Full Report Mode";
  reportTitle?: string;
  language?: string;
  version?: string;
  author?: {
    name?: string;
    id?: string;
  };
  metadata?: {
    creationDate?: string;
    lastModifiedDate?: string;
    tags?: string[];
  };
  styling?: {
    template?: string;
    colors?: {
      primary?: string;
      background?: string;
      accent?: string;
    };
    fonts?: {
      headline?: string;
      body?: string;
      code?: string;
    };
  };
  sections: ReportSectionConfig[];
  postProcessing?: PostProcessingStep[];
}

export interface ReportSectionConfig {
  sectionName: string;
  agentId: string;
  prompt: {
    base: string;
    guidelines: { text: string; isDefault: boolean; }[];
  };
  contexts: any[];
  controlOutput?: {
    format?: string;
    maxLength?: number;
  };
  dependencies?: string[];
}

export interface PostProcessingStep {
  type: string;
  agentId?: string;
  criteria?: string[];
  format?: string;
  template?: string;
}

// --- Proposal Mode Configuration Interfaces ---

export interface LinkedAsset {
  type: string; // e.g., "diagram", "report-section", "image"
  assetId: string; // The ID of the linked asset
  description?: string; // Optional description of the asset
}
export interface GeneratedProposalSection {
  sectionName: string;
  generatedContent: string;
  generationDetails?: { // Optional details about how this section was generated
    agentId?: string;
    promptUsed?: {
      base?: string;
      guidelines?: { text: string; isDefault: boolean; }[];
    };
    contextsUsed?: any[]; // Summary or list of contexts
    outputControl?: {
      format?: string;
      maxLength?: number;
    };
  };
  order?: number; // Optional display order
  wordCount?: number; // Optional word count
  linkedAssets?: LinkedAsset[]; // Optional references to other assets
}

export interface PostProcessingStepResult {
  type: string; // e.g., "evaluation", "compilation"
  status: string; // Status of this specific step (e.g., "completed", "failed")
  result?: any; // The outcome of the step (e.g., evaluation score, compilation URL)
  errorMessage?: string | null; // Error if the step failed
  timestamp?: string; // When this step completed
}

export interface ProposalVersionHistory {
  version: string;
  timestamp: string;
  notes?: string;
  changes?: string[]; // Brief description of what changed in this version
}

export interface SavedProposalState {
  proposalTitle?: string;
  language?: string;
  status?: string;
  errorMessage?: string | null;
  generationMetadata?: {
    timestamp?: string;
    templateUsed?: string;
    modelVersion?: string;
    totalCostCredits?: number;
    durationSeconds?: number;
  };
  authorId?: string; // Link to the user who initiated generation
  targetAudience?: string; // Intended audience
  desiredTone?: string; // Intended tone
  sections?: GeneratedProposalSection[]; // Array of generated sections
  postProcessing?: PostProcessingStepResult[]; // Results of post-processing steps
  versionHistory?: ProposalVersionHistory[]; // History of generation versions
  createdAt?: string;
  updatedAt?: string;
}


// --- Main Project State ---

export interface ProjectState {
  name?: string | undefined;
  projectIdea?: string | undefined;
  proposal: AnyProjectProposal | null;
  reportConfig?: FullReportModeConfig | null;
  generatedProposalState?: SavedProposalState | null; // Added field
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
  evaluation?: import("@/ai/schemas").EvaluateReportOutput | null | undefined;
  diagrams?: {
    "useCase"?: import("@/hooks/useDiagramStore").DiagramData | undefined;
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
  projectPlan: ProjectPlan | null;
}
export interface SavedProject extends ProjectState {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface StartGenerationPayload {
  featureId: string;
  inputContent: string | object;
}

export type TaskadeJobStatus = 'idle' | 'pending' | 'completed' | 'failed';

// App Settings Types
export interface BankAccount {
  bankName: string;
  accountHolder: string;
  currencies: {
    YER?: { iban?: string };
    SAR?: { iban?: string };
    USD?: { iban?: string };
  }
}

export interface AppSettings {
  newUserCredits: number;
  bankAccounts: BankAccount[];
}

export type ContextFileType = 'context' | 'example' | 'question' | 'textbook' | 'guidelines';

export interface AcademicContextFile {
    fileName: string;
    content: string;
    type: ContextFileType;
}
