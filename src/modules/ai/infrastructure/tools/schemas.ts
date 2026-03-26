import { z } from "zod";

/**
 * Shared schemas for AI tools and flows
 */

export const GrammarIssueSchema = z.object({
  original: z.string(),
  replacement: z.string(),
  explanation: z.string(),
  category: z.enum(['grammar', 'spelling', 'punctuation', 'style', 'consistency']),
  severity: z.enum(['low', 'medium', 'high']),
});

export const CheckGrammarToolInputSchema = z.object({
  text: z.string(),
  language: z.string().optional(),
});

export const CheckGrammarToolOutputSchema = z.object({
  issues: z.array(GrammarIssueSchema),
  correctedText: z.string(),
  summary: z.string(),
});

export const AnalyzeToneToolInputSchema = z.object({
  text: z.string(),
});

export const AnalyzeToneToolOutputSchema = z.object({
  tone: z.string(),
  confidence: z.number(),
  characteristics: z.array(z.string()),
});

export const CheckReadabilityToolInputSchema = z.object({
  text: z.string(),
});

export const CheckReadabilityToolOutputSchema = z.object({
  score: z.number(),
  level: z.string(),
  suggestions: z.array(z.string()),
});

export const ImproveWordChoiceToolInputSchema = z.object({
  text: z.string(),
  focus: z.enum(['concise', 'formal', 'vivid', 'simple']).optional(),
  style: z.string().optional(),
});

export const ImproveWordChoiceToolOutputSchema = z.object({
  suggestions: z.array(z.object({
    original: z.string(),
    replacement: z.string(),
    context: z.string(),
  })),
});

export const AnalyzeDocumentStructureToolInputSchema = z.object({
  text: z.string(),
  documentType: z.enum(['academic', 'business', 'technical', 'creative', 'general']).optional(),
});

export const AnalyzeDocumentStructureToolOutputSchema = z.object({
  sections: z.array(z.object({
    title: z.string(),
    content: z.string(),
    quality: z.number(),
  })),
  missingElements: z.array(z.string()),
});

export const CheckLogicalFlowToolInputSchema = z.object({
  text: z.string(),
});

export const CheckLogicalFlowToolOutputSchema = z.object({
  flowScore: z.number(),
  transitions: z.array(z.object({
    from: z.string(),
    to: z.string(),
    quality: z.enum(['good', 'weak', 'missing']),
  })),
  suggestions: z.array(z.string()),
});

export const AnalyzeArgumentStructureToolInputSchema = z.object({
  text: z.string(),
});

export const AnalyzeArgumentStructureToolOutputSchema = z.object({
  claims: z.array(z.object({
    claim: z.string(),
    evidence: z.array(z.string()),
    strength: z.number(),
  })),
  weakPoints: z.array(z.string()),
});

export const ValidateCitationsToolInputSchema = z.object({
  text: z.string(),
  citationStyle: z.enum(['APA', 'MLA', 'Chicago', 'Harvard', 'IEEE']).optional(),
  style: z.enum(['APA', 'MLA', 'Chicago', 'Harvard', 'IEEE']).optional(),
});

export const ValidateCitationsToolOutputSchema = z.object({
  citations: z.array(z.object({
    text: z.string(),
    isValid: z.boolean(),
    issue: z.string().optional(),
  })),
});

export const CheckReferencesToolInputSchema = z.object({
  text: z.string(),
  citationStyle: z.enum(['APA', 'MLA', 'Chicago', 'Harvard', 'IEEE']).optional(),
  style: z.enum(['APA', 'MLA', 'Chicago', 'Harvard', 'IEEE']).optional(),
});

export const CheckReferencesToolOutputSchema = z.object({
  references: z.array(z.object({
    text: z.string(),
    format: z.string(),
    missingInfo: z.array(z.string()),
  })),
});

export const MatchCitationsToReferencesToolInputSchema = z.object({
  text: z.string(),
});

export const MatchCitationsToReferencesToolOutputSchema = z.object({
  matches: z.array(z.object({
    citation: z.string(),
    reference: z.string().optional(),
    found: z.boolean(),
  })),
});

export const AnalyzeDocumentQualityToolInputSchema = z.object({
  text: z.string(),
  checkGrammar: z.boolean().optional(),
  checkStructure: z.boolean().optional(),
  checkCitations: z.boolean().optional(),
  citationStyle: z.enum(['APA', 'MLA', 'Chicago', 'Harvard', 'IEEE']).optional(),
});

export const AnalyzeDocumentQualityToolOutputSchema = z.object({
  overallScore: z.number(),
  clarity: z.number(),
  coherence: z.number(),
  engagement: z.number(),
  feedback: z.array(z.string()),
});

// Flow specific schemas
export const AcademicLiteratureReviewInputSchema = z.object({
    topic: z.string().min(10),
    keywords: z.union([z.string(), z.array(z.string())]).optional(),
    citationStyle: z.enum(['APA', 'MLA', 'Chicago', 'Harvard', 'IEEE']).default('APA'),
    focusAreas: z.union([z.string(), z.array(z.string())]).optional(),
    minLength: z.number().min(500).default(800),
    includeGaps: z.boolean().default(true),
});

export const AcademicLiteratureReviewOutputSchema = z.object({
    literatureReview: z.string(),
    structure: z.object({
        introduction: z.string(),
        mainBody: z.string(),
        researchGaps: z.string().optional(),
        conclusion: z.string(),
    }),
    citations: z.object({
        totalCitations: z.number(),
        validCitations: z.number(),
        citationIssues: z.array(z.string()),
    }),
    qualityMetrics: z.object({
        argumentStrength: z.enum(['strong', 'moderate', 'weak']),
        logicalFlowScore: z.number().min(0).max(1),
        recommendations: z.array(z.string()),
    }),
    metadata: z.object({
        wordCount: z.number(),
        citationCount: z.number(),
        keyThemes: z.array(z.string()),
    }),
});

export const AcademicPaperQualityCheckerInputSchema = z.object({
    documentText: z.string().min(100),
    references: z.string().optional(),
    citationStyle: z.enum(['APA', 'MLA', 'Chicago', 'Harvard', 'IEEE']).default('APA'),
    documentType: z.enum(['research_paper', 'thesis', 'dissertation', 'essay', 'review_article']).default('research_paper'),
    checkGrammar: z.boolean().default(true),
    checkCitations: z.boolean().default(true),
    checkStructure: z.boolean().default(true),
    checkReadability: z.boolean().default(true),
});

export const AcademicPaperQualityCheckerOutputSchema = z.object({
    overallScore: z.number().min(0).max(100),
    qualityLevel: z.enum(['excellent', 'good', 'fair', 'needs_improvement', 'poor']),
    scores: z.object({
        grammar: z.number().optional(),
        citations: z.number().optional(),
        structure: z.number().optional(),
        readability: z.number().optional(),
        argument: z.number().optional(),
    }),
    detailedAnalysis: z.object({
        structureAnalysis: z.object({
            coherenceScore: z.number(),
            transitionQuality: z.string(),
            organizationIssues: z.array(z.string()),
            argumentStrength: z.string(),
        }).optional(),
    }),
    recommendations: z.object({
        critical: z.array(z.string()),
        important: z.array(z.string()),
        optional: z.array(z.string()),
    }),
    summary: z.object({
        strengths: z.array(z.string()),
        weaknesses: z.array(z.string()),
        readinessLevel: z.enum(['ready_to_submit', 'minor_revisions', 'major_revisions', 'needs_rewrite']),
        estimatedRevisionTime: z.string(),
    }),
});

export const ProfessionalDocumentWriterInputSchema = z.object({
    documentType: z.enum(['business_report', 'proposal', 'white_paper', 'case_study', 'executive_summary']),
    topic: z.string().min(10),
    purpose: z.string(),
    targetAudience: z.string(),
    keyPoints: z.union([z.string(), z.array(z.string())]),
    tone: z.enum(['professional', 'persuasive', 'neutral', 'authoritative']).default('professional'),
    length: z.enum(['short', 'medium', 'long']).default('medium'),
    includeExecutiveSummary: z.boolean().default(true),
    includeRecommendations: z.boolean().default(true),
    additionalContext: z.string().optional(),
});

export const ProfessionalDocumentWriterOutputSchema = z.object({
    document: z.string(),
    structure: z.object({
        executiveSummary: z.string().optional(),
        introduction: z.string(),
        mainSections: z.array(z.object({
            title: z.string(),
            content: z.string(),
        })),
        recommendations: z.string().optional(),
        conclusion: z.string(),
    }),
    qualityMetrics: z.object({
        structureScore: z.number(),
        flowScore: z.number(),
        toneAlignment: z.number(),
        wordCount: z.number(),
    }),
    improvements: z.object({
        applied: z.array(z.string()),
        suggestions: z.array(z.string()),
    }),
});

// Tool-specific input/output components
export const ApiDocumentationSchema = z.object({
    projectPath: z.string().optional(),
    sourcePath: z.string().optional(),
    format: z.string().optional(),
    targetAudience: z.string().optional(),
    language: z.string().optional(),
    includeExamples: z.boolean().optional(),
    includeScreenshots: z.boolean().optional(),
    endpoints: z.array(z.object({
        path: z.string().optional(),
        method: z.string(),
        description: z.string(),
    })).optional(),
});

export const CodeComplexitySchema = z.object({
    projectPath: z.string().optional(),
    filePatterns: z.array(z.string()).optional(),
    includeMetrics: z.boolean().optional(),
    cyclomaticComplexity: z.number().optional(),
    maintainabilityIndex: z.number().optional(),
});

export const DependencyAnalysisSchema = z.object({
    projectPath: z.string().optional(),
    analyzeOutdated: z.boolean().optional(),
    categorize: z.boolean().optional(),
    dependencies: z.array(z.string()).optional(),
});

export const ProjectStructureSchema = z.object({
    projectPath: z.string().optional(),
    includeHidden: z.boolean().optional(),
    maxDepth: z.number().optional(),
    files: z.array(z.string()).optional(),
});

export const GitHistorySchema = z.object({
    projectPath: z.string().optional(),
    limitCommits: z.number().optional(),
    analyzeContributors: z.boolean().optional(),
    commits: z.array(z.any()).optional(),
});

export const ProjectMetricsSchema = z.object({
    projectPath: z.string().optional(),
    includeTestCoverage: z.boolean().optional(),
    includeQualityMetrics: z.boolean().optional(),
    totalLines: z.number().optional(),
});

export const ProjectReportSchema = z.object({
    projectPath: z.string().optional(),
    reportPeriod: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    format: z.string().optional(),
    granularity: z.string().optional(),
    diagramType: z.string().optional(),
    includeDetails: z.boolean().optional(),
    includeRecommendations: z.boolean().optional(),
    maxEvents: z.number().optional(),
    style: z.string().optional(),
    summary: z.string().optional(),
});

export const GeneratedPromptSchema = z.object({
    prompt: z.string(),
});

export const ProjectDataSchema = z.object({
    name: z.string(),
});

// Type definitions
export type ToolOutput = any;
export type GrammarIssue = z.infer<typeof GrammarIssueSchema>;
export type CheckGrammarToolInput = z.infer<typeof CheckGrammarToolInputSchema>;
export type CheckGrammarToolOutput = z.infer<typeof CheckGrammarToolOutputSchema>;
export type AnalyzeToneToolInput = z.infer<typeof AnalyzeToneToolInputSchema>;
export type AnalyzeToneToolOutput = z.infer<typeof AnalyzeToneToolOutputSchema>;
export type CheckReadabilityToolInput = z.infer<typeof CheckReadabilityToolInputSchema>;
export type CheckReadabilityToolOutput = z.infer<typeof CheckReadabilityToolOutputSchema>;
export type ImproveWordChoiceToolInput = z.infer<typeof ImproveWordChoiceToolInputSchema>;
export type ImproveWordChoiceToolOutput = z.infer<typeof ImproveWordChoiceToolOutputSchema>;
export type AnalyzeDocumentStructureToolInput = z.infer<typeof AnalyzeDocumentStructureToolInputSchema>;
export type AnalyzeDocumentStructureToolOutput = z.infer<typeof AnalyzeDocumentStructureToolOutputSchema>;
export type CheckLogicalFlowToolInput = z.infer<typeof CheckLogicalFlowToolInputSchema>;
export type CheckLogicalFlowToolOutput = z.infer<typeof CheckLogicalFlowToolOutputSchema>;
export type AnalyzeArgumentStructureToolInput = z.infer<typeof AnalyzeArgumentStructureToolInputSchema>;
export type AnalyzeArgumentStructureToolOutput = z.infer<typeof AnalyzeArgumentStructureToolOutputSchema>;
export type ValidateCitationsToolInput = z.infer<typeof ValidateCitationsToolInputSchema>;
export type ValidateCitationsToolOutput = z.infer<typeof ValidateCitationsToolOutputSchema>;
export type CheckReferencesToolInput = z.infer<typeof CheckReferencesToolInputSchema>;
export type CheckReferencesToolOutput = z.infer<typeof CheckReferencesToolOutputSchema>;
export type MatchCitationsToReferencesToolInput = z.infer<typeof MatchCitationsToReferencesToolInputSchema>;
export type MatchCitationsToReferencesToolOutput = z.infer<typeof MatchCitationsToReferencesToolOutputSchema>;
export type AnalyzeDocumentQualityToolInput = z.infer<typeof AnalyzeDocumentQualityToolInputSchema>;
export type AnalyzeDocumentQualityToolOutput = z.infer<typeof AnalyzeDocumentQualityToolOutputSchema>;
export type AcademicLiteratureReviewInput = z.infer<typeof AcademicLiteratureReviewInputSchema>;
export type AcademicLiteratureReviewOutput = z.infer<typeof AcademicLiteratureReviewOutputSchema>;
export type AcademicPaperQualityCheckerInput = z.infer<typeof AcademicPaperQualityCheckerInputSchema>;
export type AcademicPaperQualityCheckerOutput = z.infer<typeof AcademicPaperQualityCheckerOutputSchema>;
export type ProfessionalDocumentWriterInput = z.infer<typeof ProfessionalDocumentWriterInputSchema>;
export type ProfessionalDocumentWriterOutput = z.infer<typeof ProfessionalDocumentWriterOutputSchema>;
export type ApiDocumentation = z.infer<typeof ApiDocumentationSchema>;
export type CodeComplexity = z.infer<typeof CodeComplexitySchema>;
export type DependencyAnalysis = z.infer<typeof DependencyAnalysisSchema>;
export type ProjectStructure = z.infer<typeof ProjectStructureSchema>;
export type GitHistory = z.infer<typeof GitHistorySchema>;
export type ProjectMetrics = z.infer<typeof ProjectMetricsSchema>;
export type ProjectReport = z.infer<typeof ProjectReportSchema>;
export type GeneratedPrompt = z.infer<typeof GeneratedPromptSchema>;
export type ProjectData = z.infer<typeof ProjectDataSchema>;
