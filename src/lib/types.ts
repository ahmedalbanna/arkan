// This file is now primarily for re-exporting types from the model files.
// It helps to have a single point of import for many parts of the app,
// but the source of truth for each type is now its respective model file.

export type { UserRole, UserProfile, TeamMember, UserProperties } from '@/lib/models/user';
export type { Team, TeamWithMembers, TeamProperties } from '@/lib/models/team';
export type { ProjectState, SavedProject, FullReportModeConfig, ReportSectionConfig, PostProcessingStep, LinkedAsset, GeneratedProposalSection, PostProcessingStepResult, ProposalVersionHistory, SavedProposalState, ContextFileType, ProjectProperties } from '@/lib/models/project';
export type { Agent, AgentPrompt, AgentCategory, AgentCategoryDetails, AgentGuideline, AgentKnowledgeSource, AgentProperties } from '@/lib/models/agent';
export type { TransactionProperties } from '@/lib/models/transaction';
export type { DocxTemplate, DocxTemplateProperties } from '@/lib/models/docxTemplate';
export type { PptxTemplate, PptxTemplateProperties } from '@/lib/models/pptxTemplate';
export type { ProposalTemplate, ProposalTemplateProperties } from '@/lib/models/proposalTemplate';
export type { ReportGenerationTemplate, ReportTemplateProperties } from '@/lib/models/reportTemplate';
export type { PresentationGenerationTemplate, PresentationTemplateProperties } from '@/lib/models/presentationTemplate';
export type { DiagramProperties } from '@/lib/models/diagram';
export type { GenerationStatus, GeneratableDocumentProperties } from '@/lib/models/generatableDocument';
export type { Section, SectionType, SectionProperties } from '@/lib/models/section';

// AI Schema re-exports - still useful to have a central point for these
export type {
  AnyProjectProposal, DiagramType, ManipulateTextInput,
  ManipulateTextOutput, PresentationHistoryEntry, ProjectPlan, ProjectProposal, SectionName
} from '@/ai/schemas';

// Re-export from template-schemas
export type { DocxStyleOptions, PptxStyleOptions } from '@/ai/schemas/template-schemas';

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
  customStyles?: any;
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

// Misc types from various hooks/services
export type { CreateAgentVariables, UpdateAgentVariables } from '@/hooks';
export type { HistoryEntry } from '@/hooks/use-history';
export type { Codebase } from '@/ai/schemas';
export type { GenerateAgentConfigOutput, RewriteTextOutput, TranslateTextOutput, TranslateVariables } from '@/ai/schemas';
export type { SignupCredentials } from '@/components/auth/SignupForm';
export type { Feature, UpdateFeatureVariables } from '@/hooks';
export type { Notification } from '@/hooks/use-notifications';
export type { DiffPart } from '@/lib/diff';
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

export interface TransactionData {
  id: string; // Firestore document ID
  userId: string;
  planId: string;
  planName: string;
  credits: number;
  price: number;
  userName: string;
  userEmail: string;
  status: TransactionStatus;
  proofUrl: string;
  createdAt: string; // ISO string
  adminNotes?: string;
  verifiedAt?: string; // ISO string
  verifiedBy?: string; // Admin user ID
}