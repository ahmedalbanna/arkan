

import type { ProjectProposal, DiagramType, SectionName, PresentationHistoryEntry, AnyProjectProposal, ProjectPlan } from '@/ai/schemas';
import type { User as FirebaseUser } from 'firebase/auth';
import type { PptxTemplateSchema, ProposalTemplateSchema, ReportGenerationTemplateSchema, PresentationGenerationTemplateSchema } from '@/ai/schemas/template-schemas';

import type { UploadedFile } from '@/components/admin/agent-editor/GenerateAgentView';
import { LucideIcon } from 'lucide-react';

export type {PricingPlan} from '@/components/price/PricingCard'

// src/lib/types.ts

import { z } from 'zod';
import type { IStylesOptions } from 'docx';
import { Paragraph, Table } from 'docx'; // Assuming these are needed for DocxObject

// --- Zod Schemas for DOCX Style Parts ---

// Helper for common run properties (IRunOptions)
const DocxRunPropertiesSchema = z.object({
  size: z.union([z.number(), z.string()]).optional(),
  bold: z.boolean().optional(),
  italics: z.boolean().optional(),
  color: z.string().optional(),
  font: z.union([z.string(), z.object({ name: z.string().optional() })]).optional(),
  // Add other IRunOptions properties as needed, or use .passthrough()
}).passthrough();

// Helper for common paragraph properties (Omit<IParagraphOptions, 'children'>)
const DocxParagraphPropertiesSchema = z.object({
  spacing: z.object({
    after: z.number().optional(),
    before: z.number().optional(),
    line: z.number().optional(),
  }).optional(),
  alignment: z.any().optional(), // AlignmentType is an enum, z.any() for simplicity
  indent: z.object({
    left: z.number().optional(),
    hanging: z.number().optional(),
  }).optional(),
  border: z.any().optional(), // Border properties are complex, z.any() for simplicity
  shading: z.object({
    type: z.any().optional(), // ShadingType enum
    fill: z.string().optional(),
  }).optional(),
  bidirectional: z.boolean().optional(),
  outlineLevel: z.number().optional(),
  // Add other IParagraphOptions properties as needed, or use .passthrough()
}).passthrough();

// Schema for IParagraphStyleOptions
const DocxParagraphStyleOptionsSchema = z.object({
  id: z.string(),
  name: z.string(),
  basedOn: z.string().optional(),
  next: z.string().optional(),
  quickFormat: z.boolean().optional(),
  run: DocxRunPropertiesSchema.optional(),
  paragraph: DocxParagraphPropertiesSchema.optional(),
  table: z.any().optional(), // Table properties are complex
  tableRow: z.any().optional(),
  tableCell: z.any().optional(),
  conditionalFormatting: z.any().optional(),
  // Add other IParagraphStyleOptions properties as needed, or use .passthrough()
}).passthrough();

// Schema for ICharacterStyleOptions
const DocxCharacterStyleOptionsSchema = z.object({
  id: z.string(),
  name: z.string(),
  basedOn: z.string().optional(),
  run: DocxRunPropertiesSchema.optional(),
  // Add other ICharacterStyleOptions properties as needed, or use .passthrough()
}).passthrough();

// Schema for IStylesOptions (main styles object)
export const DocxStyleOptionsSchema = z.object({
  default: z.object({
    document: z.object({
      run: DocxRunPropertiesSchema.optional(),
    }).optional(),
    heading1: DocxParagraphStyleOptionsSchema.optional(),
    heading2: DocxParagraphStyleOptionsSchema.optional(),
    heading3: DocxParagraphStyleOptionsSchema.optional(),
    heading4: DocxParagraphStyleOptionsSchema.optional(),
    heading5: DocxParagraphStyleOptionsSchema.optional(),
    heading6: DocxParagraphStyleOptionsSchema.optional(),
  }).optional(),
  paragraphStyles: z.array(DocxParagraphStyleOptionsSchema).optional(),
  characterStyles: z.array(DocxCharacterStyleOptionsSchema).optional(),
  // Add other IStylesOptions properties as needed, or use .passthrough()
}).passthrough();

// --- Zod Schema for CustomStyles ---
// CustomStyles properties are Omit<IParagraphOptions, 'children'>
export const CustomStylesSchema = z.object({
  codeBlock: DocxParagraphPropertiesSchema.optional(),
  imageParagraph: DocxParagraphPropertiesSchema.optional(),
});

// --- Zod Schema for DocxTemplate ---
export const DocxTemplateSchema = z.object({ // Replace with BaseTemplateSchema.extend if you have it
  id: z.string(),
  name: z.string(),
  description: z.string(),
  styles: DocxStyleOptionsSchema, // Now uses the comprehensive style schema
  customStyles: CustomStylesSchema, // Added custom styles schema
  imageUrl: z.string().url(),
  dataAiHint: z.string(),
});

// --- Inferred Types ---
export type CustomStyles = z.infer<typeof CustomStylesSchema>;
export type DocxTemplate = z.infer<typeof DocxTemplateSchema>;

// Other types from previous turn
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

export type DocxObject = Paragraph | Table | OrientationDirective; // Assuming Paragraph and Table are imported from docx

export interface HeaderFooterContent {
  default?: (Paragraph | Table)[];
  first?: (Paragraph | Table)[];
}

export interface ConversionOptions {
  styles?: IStylesOptions; // This will now be validated by DocxStyleOptionsSchema
  customStyles?: CustomStyles; // This will now be validated by CustomStylesSchema
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
}
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
export type { UpdateAgentPayload, UpdateAgentVariables, CreateAgentVariables } from '@/hooks';

export type { VerifyPaymentVariables } from '@/hooks';

export type { Codebase } from '@/ai/schemas';
export type { AcademicSolverState, ExternalContext as AcademicContextFile, AcademicSolverStage } from '@/hooks';
export type { TeamWithMembers } from '@/services';

export type { ChatSession, ChatMessage, AgentChatSession } from '@/hooks';
export type { ExternalContext, ContextFileType } from '@/hooks';
export type { TranslateVariables, TranslateTextOutput } from '@/ai/schemas';
export type { SignupCredentials } from '@/components/auth/SignupForm';
export type { GenerateProposalBody } from '@/hooks';
export type { RewriteTextOutput } from '@/ai/schemas';
export type { DiffPart } from '@/lib/diff';
export type { GenerateAgentConfigOutput } from '@/ai/schemas';

// Re-exporting generated Template types from Zod schemas

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


export interface Agent{

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
  icon?: LucideIcon;
  iconComponent?: LucideIcon;
}
export type { Notification } from '@/hooks/use-notifications';
export type { Feature, UpdateFeatureVariables } from "@/hooks";



export type UserRole = 'user' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  credits: number;
  role: UserRole;
  createdAt: string; // Storing as ISO string
  updatedAt: string; // Storing as ISO string
  teams?: string[]; // Array of team IDs
  bio?: string;
  profilePictureUrl?: string;
  hasCompletedOnboarding?: boolean;
}

export interface Team {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
}

export interface TeamMember {
  userId: string;
  teamId: string;
  role: 'owner' | 'member';
  joinedAt: string;
  // Denormalized fields for efficiency
  name: string;
  email: string;
  profilePictureUrl?: string;
}

export interface TransactionData {
  id: string; // Firestore document ID
  userId: string;
  planId: string;
  planName: string;
  credits: number;
  price: number;
  userName: string;
  userEmail: string;
  status: 'pending' | 'verified' | 'rejected';
  proofUrl: string;
  createdAt: string;
  adminNotes?: string;
  verifiedAt?: string;
  verifiedBy?: string;
}


export interface LoginCredentials {
  email: string;
  password: string;
}

// --- PPTX Template Types ---
export type {PptxTemplateKey} from '@/lib/pptx-styles';

export type DocxTemplateKey = 'modern' | 'classic' | 'academic' | string;


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
        "useCase"?: import("@/hooks").DiagramData | undefined;
        class?: import("@/hooks").DiagramData | undefined;
        sequence?: import("@/hooks").DiagramData | undefined;
        activity?: import("@/hooks").DiagramData | undefined;
        component?: import("@/hooks").DiagramData | undefined;
        archimate?: import("@/hooks").DiagramData | undefined;
        er?: import("@/hooks").DiagramData | undefined;
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
