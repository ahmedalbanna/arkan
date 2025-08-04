
import { z } from 'zod';
import { ProjectProposalSchema, DiagramTypeSchema, SectionNameSchema, PresentationSlideSchema, ProjectPlanSchema } from '@/ai/schemas';
import type { Codebase } from '@/ai/flows/generate-codebase';
import { AcademicDocumentTypeSchema, AnalyzedDocumentSchema, SolvedDocumentSchema } from '@/ai/flows/academic-solver.shared';

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


// This schema is defined in a separate, server-only file to prevent circular dependencies
// that can occur when client and server modules import from the same files (e.g., types.ts and schemas.ts).
export const ProjectStateSchema = z.object({
    name: z.string().optional(),
    projectIdea: z.string().optional(),
    proposal: z.lazy(() => ProjectProposalSchema).nullable(),
    reportConfig: FullReportModeConfigSchema.nullable().optional(),
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
