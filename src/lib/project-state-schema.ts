

import { z } from 'zod';
import { ProjectProposalSchema, DiagramTypeSchema, SectionNameSchema, PresentationSlideSchema, ProjectPlanSchema, AcademicDocumentTypeSchema, AnalyzedDocumentSchema, SolvedDocumentSchema } from '@/ai/schemas';

const ReportSectionConfigSchema = z.object({
  sectionName: z.string(),
  agentId: z.string(),
  prompt: z.object({
    base: z.string(),
    guidelines: z.array(z.object({ text: z.string(), isDefault: z.boolean() })),
  }),
  contexts: z.array(z.any()),
  controlOutput: z.object({
     format: z.string().optional(),
     maxLength: z.number().optional(),
  }).optional(),
  dependencies: z.array(z.string()).optional(),
});

const PostProcessingStepSchema = z.object({
    type: z.string(),
    agentId: z.string().optional(),
    criteria: z.array(z.string()).optional(),
    format: z.string().optional(),
    template: z.string().optional(),
});

const FullReportModeConfigSchema = z.object({
  mode: z.literal("Full Report Mode"),
  reportTitle: z.string().optional(),
  language: z.string().optional(),
  version: z.string().optional(),
  author: z.object({
    name: z.string().optional(),
    id: z.string().optional(),
  }).optional(),
  metadata: z.object({
    creationDate: z.string().optional(),
    lastModifiedDate: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }).optional(),
  styling: z.object({
    template: z.string().optional(),
    colors: z.object({
      primary: z.string().optional(),
      background: z.string().optional(),
      accent: z.string().optional(),
    }).optional(),
    fonts: z.object({
       headline: z.string().optional(),
       body: z.string().optional(),
       code: z.string().optional(),
    }).optional(),
  }).optional(),
  sections: z.array(ReportSectionConfigSchema),
  postProcessing: z.array(PostProcessingStepSchema).optional(),
});


const LinkedAssetSchema = z.object({
    type: z.string(),
    assetId: z.string(),
    description: z.string().optional(),
});

const GeneratedProposalSectionSchema = z.object({
    sectionName: z.string(),
    generatedContent: z.string(),
    generationDetails: z.object({
        agentId: z.string().optional(),
        promptUsed: z.object({
            base: z.string().optional(),
            guidelines: z.array(z.object({ text: z.string(), isDefault: z.boolean() })).optional(),
        }).optional(),
        contextsUsed: z.array(z.any()).optional(),
        outputControl: z.object({
            format: z.string().optional(),
            maxLength: z.number().optional(),
        }).optional(),
    }).optional(),
    order: z.number().optional(),
    wordCount: z.number().optional(),
    linkedAssets: z.array(LinkedAssetSchema).optional(),
});

const PostProcessingStepResultSchema = z.object({
    type: z.string(),
    status: z.string(),
    result: z.any().optional(),
    errorMessage: z.string().nullable().optional(),
    timestamp: z.string().optional(),
});

const ProposalVersionHistorySchema = z.object({
    version: z.string(),
    timestamp: z.string(),
    notes: z.string().optional(),
    changes: z.array(z.string()).optional(),
});

const SavedProposalStateSchema = z.object({
    proposalTitle: z.string().optional(),
    language: z.string().optional(),
    status: z.string().optional(),
    errorMessage: z.string().nullable().optional(),
    generationMetadata: z.object({
        timestamp: z.string().optional(),
        templateUsed: z.string().optional(),
        modelVersion: z.string().optional(),
        totalCostCredits: z.number().optional(),
        durationSeconds: z.number().optional(),
    }).optional(),
    authorId: z.string().optional(),
    targetAudience: z.string().optional(),
    desiredTone: z.string().optional(),
    sections: z.array(GeneratedProposalSectionSchema).optional(),
    postProcessing: z.array(PostProcessingStepResultSchema).optional(),
    versionHistory: z.array(ProposalVersionHistorySchema).optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
});

// This schema is defined in a separate, server-only file to prevent circular dependencies
// that can occur when client and server modules import from the same files (e.g., types.ts and schemas.ts).
export const ProjectStateSchema = z.object({
    name: z.string().optional(),
    projectIdea: z.string().optional(),
    proposal: z.lazy(() => ProjectProposalSchema).nullable().optional(),
    reportConfig: FullReportModeConfigSchema.nullable().optional(),
    generatedProposalState: SavedProposalStateSchema.nullable().optional(),
    sections: z.record(SectionNameSchema, z.string()).optional(),
    translatedSections: z.record(SectionNameSchema, z.string()).optional(),
    evaluation: z.object({
        evaluationScore: z.number(),
        feedback: z.array(z.object({
            point: z.string(),
            status: z.enum(["Acceptable", "Weak", "Not Present"]),
            solution: z.string().optional(),
        })),
        summary: z.string(),
    }).nullable().optional(),
    diagrams: z.record(DiagramTypeSchema, z.object({
        plantUmlCode: z.string(),
        imageUrl: z.string(),
        explanation: z.string().optional(),
    })).optional(),
    presentation: z.object({ history: z.array(z.object({ id: z.string(), name: z.string(), slides: z.array(PresentationSlideSchema) })) }).optional(),
    codeGenerator: z.object({ prompt: z.string(), html: z.string(), css: z.string(), javascript: z.string(), codebase: z.object({ files: z.array(z.object({ path: z.string(), content: z.string() })) }).nullable() }).optional(),
    externalContext: z.array(z.object({
        fileName: z.string(),
        content: z.string(),
        type: z.enum(['context', 'example', 'question', 'textbook', 'guidelines']),
    })).nullable().optional(),
    teamId: z.string().nullable().optional(), // Add teamId to associate project with a team
    projectPlan: z.lazy(() => ProjectPlanSchema).nullable().optional(),
    academicSolver: z.object({
        stage: z.enum(["idle", "parsing", "analyzing", "readyToSolve", "solving", "solved"]),
        documentType: AcademicDocumentTypeSchema.nullable(),
        analyzedDocument: AnalyzedDocumentSchema.nullable(),
        solvedDocument: SolvedDocumentSchema.nullable(),
        questionDocuments: z.array(z.object({ fileName: z.string(), content: z.string() })),
        externalContext: z.array(z.object({ fileName: z.string(), content: z.string() })),
    }).optional(),
});
