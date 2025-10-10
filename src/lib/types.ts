
// This file is now primarily for re-exporting types from the model files.
// It helps to have a single point of import for many parts of the app,
// but the source of truth for each type is now its respective model file.

export type { AgentCategory, AgentCategoryDetails, AgentGuideline, AgentKnowledgeSource, AgentPrompt, AgentProperties } from '@/lib/models/agent';
export type { DiagramProperties } from '@/lib/models/diagram';
export type { DocxTemplate, DocxTemplateProperties } from '@/lib/models/docxTemplate';
export type { GeneratableDocumentProperties, GenerationStatus } from '@/lib/models/generatableDocument';
export type { PptxTemplate, PptxTemplateProperties } from '@/lib/models/pptxTemplate';
export type { AcademicSolverStage, AcademicSolverState, ContextFileType, FullReportModeConfig, GeneratedProposalSection, LinkedAsset, PostProcessingStep, PostProcessingStepResult, ProjectProperties, ProjectState, ProposalVersionHistory, ReportSectionConfig, SavedProject, SavedProposalState } from '@/lib/models/project';
export type { ReportTemplateProperties } from '@/lib/models/reportTemplate';
export type { Section, SectionProperties, SectionType } from '@/lib/models/section';
export type { Team, TeamProperties, TeamWithMembers } from '@/lib/models/team';
export type { TransactionProperties } from '@/lib/models/transaction';
export type { TeamMember, UserProfile, UserProperties, UserRole } from '@/lib/models/user';

// AI Schema re-exports - still useful to have a central point for these
export type {
  AnyProjectProposal, DiagramType, ManipulateTextInput,
  ManipulateTextOutput, PresentationHistoryEntry, ProjectProposal, SectionName
} from '@/ai/schemas';

// Re-export from template-schemas

// Specific, non-model types can still live here
export type FontOptions = {
  default?: string;
  rtl?: string;
  code?: string;
};

export type OrientationDirective = {
  _type: 'directive';
  name: 'orientation';
  value: 'portrait' | 'landscape';
};

import { Paragraph, Table } from 'docx';
export type DocxObject = Paragraph | Table | OrientationDirective;

export interface HeaderFooterContent {
  default?: (Paragraph | Table)[];
  first?: (Paragraph | Table)[];
}

export interface ConversionOptions {
  styles?: import('docx').IStylesOptions;
  customStyles?: Record<string, unknown>;
  paper?: {
    size?: { width: number; height: number };
    margins?: { top: number; right: number; bottom: number; left: number };
    orientation?: 'portrait' | 'landscape';
  };
  header?: HeaderFooterContent;
  footer?: HeaderFooterContent;
  coverPageMarkdown?: string;
  watermark?: string;
  pageNumbers?: boolean;
  isRtl?: boolean;
  fonts?: FontOptions;
  includeToc?: boolean;
}

export interface PptxStyleOptions {
  theme?: string;
  colors?: Record<string, string>;
  fonts?: Record<string, string>;
  layouts?: Record<string, unknown>;
  animations?: Record<string, unknown>;
}

export interface DocxStyleOptions {
  fonts?: Record<string, string>;
  colors?: Record<string, string>;
  spacing?: Record<string, number>;
  margins?: Record<string, number>;
  headers?: Record<string, unknown>;
  footers?: Record<string, unknown>;
}

// Misc types from various hooks/services
export type { Codebase, GenerateAgentConfigOutput, RewriteTextOutput, TranslateTextOutput, TranslateVariables } from '@/ai/schemas';
export type { SignupCredentials } from '@/components/auth/SignupForm';
export type { CreateAgentVariables, Feature, UpdateAgentVariables, UpdateFeatureVariables } from '@/hooks';
export type { HistoryEntry } from '@/hooks/use-history';
export type { Notification } from '@/hooks/use-notifications';
export type { DiffPart } from '@/lib/diff';
export type { ProjectPlan } from '@/lib/models/plan';
export interface LoginCredentials {
  email: string;
  password: string;
}
export type PptxTemplateKey = 'modern' | 'dark' | 'professional' | string;
export type DocxTemplateKey = 'modern' | 'classic' | 'academic' | string;

export interface StartGenerationPayload {
  featureId: string;
  inputContent: string | object;
}

export type TaskadeJobStatus = 'idle' | 'pending' | 'completed' | 'failed';

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

export interface VerifyPaymentVariables {
  transactionId: string;
  userId: string;
  creditsToGrant: number;
  status: 'verified' | 'rejected';
  adminNotes?: string;
}

export type TransactionStatus = 'pending' | 'verified' | 'rejected';

