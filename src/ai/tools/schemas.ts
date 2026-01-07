/**
 * @fileOverview Schemas for Professional Writing Tools
 * 
 * This file contains Zod schemas for input/output validation of all
 * professional writing tools used in Genkit.
 */

import { z } from 'zod';

// ============================================================================
// GRAMMAR & STYLE TOOLS SCHEMAS
// ============================================================================

export const CheckGrammarToolInputSchema = z.object({
  text: z.string().min(1, 'Text cannot be empty'),
  language: z.string().default('en').describe('Language code (e.g., en, ar)'),
});

export const GrammarIssueSchema = z.object({
  type: z.enum(['grammar', 'spelling', 'punctuation', 'capitalization']),
  message: z.string(),
  context: z.string(),
  suggestions: z.array(z.string()),
  severity: z.enum(['error', 'warning', 'info']),
  position: z.object({
    start: z.number(),
    end: z.number(),
  }).optional(),
});

export const CheckGrammarToolOutputSchema = z.object({
  issues: z.array(GrammarIssueSchema),
  totalIssues: z.number(),
  errorCount: z.number(),
  warningCount: z.number(),
  infoCount: z.number(),
});

export const AnalyzeToneToolInputSchema = z.object({
  text: z.string().min(1),
  targetTone: z.enum(['professional', 'casual', 'academic', 'persuasive', 'neutral']).optional(),
});

export const AnalyzeToneToolOutputSchema = z.object({
  detectedTone: z.string(),
  confidence: z.number().min(0).max(1),
  toneAttributes: z.array(z.string()),
  suggestions: z.array(z.string()).optional(),
  matchesTarget: z.boolean().optional(),
});

export const CheckReadabilityToolInputSchema = z.object({
  text: z.string().min(1),
});

export const CheckReadabilityToolOutputSchema = z.object({
  fleschReadingEase: z.number(),
  fleschKincaidGrade: z.number(),
  avgSentenceLength: z.number(),
  avgWordLength: z.number(),
  complexWords: z.number(),
  readabilityLevel: z.enum(['very_easy', 'easy', 'fairly_easy', 'standard', 'fairly_difficult', 'difficult', 'very_difficult']),
  suggestions: z.array(z.string()),
});

export const ImproveWordChoiceToolInputSchema = z.object({
  text: z.string().min(1),
  style: z.enum(['concise', 'formal', 'vivid', 'simple']).default('concise'),
});

export const ImproveWordChoiceToolOutputSchema = z.object({
  improvements: z.array(z.object({
    original: z.string(),
    suggestion: z.string(),
    reason: z.string(),
    position: z.object({
      start: z.number(),
      end: z.number(),
    }),
  })),
  totalSuggestions: z.number(),
});

// ============================================================================
// DOCUMENT STRUCTURE TOOLS SCHEMAS
// ============================================================================

export const AnalyzeDocumentStructureToolInputSchema = z.object({
  text: z.string().min(1),
  documentType: z.enum(['academic', 'business', 'technical', 'creative', 'general']).default('general'),
});

export const AnalyzeDocumentStructureToolOutputSchema = z.object({
  structure: z.object({
    headings: z.array(z.object({
      level: z.number(),
      text: z.string(),
      position: z.number(),
    })),
    paragraphs: z.number(),
    sections: z.number(),
  }),
  coherence: z.object({
    score: z.number().min(0).max(1),
    issues: z.array(z.string()),
    strengths: z.array(z.string()),
  }),
  transitions: z.object({
    count: z.number(),
    quality: z.enum(['excellent', 'good', 'fair', 'poor']),
    suggestions: z.array(z.string()),
  }),
  recommendations: z.array(z.string()),
});

export const CheckLogicalFlowToolInputSchema = z.object({
  text: z.string().min(1),
});

export const CheckLogicalFlowToolOutputSchema = z.object({
  flowScore: z.number().min(0).max(1),
  issues: z.array(z.object({
    type: z.enum(['missing_transition', 'weak_connection', 'topic_shift', 'repetition']),
    location: z.string(),
    suggestion: z.string(),
  })),
  recommendations: z.array(z.string()),
});

export const AnalyzeArgumentStructureToolInputSchema = z.object({
  text: z.string().min(1),
});

export const AnalyzeArgumentStructureToolOutputSchema = z.object({
  hasThesis: z.boolean(),
  thesis: z.string().optional(),
  arguments: z.array(z.object({
    claim: z.string(),
    evidence: z.array(z.string()),
    strength: z.enum(['strong', 'moderate', 'weak']),
  })),
  counterarguments: z.array(z.string()),
  conclusion: z.string().optional(),
  overallStrength: z.enum(['strong', 'moderate', 'weak']),
  suggestions: z.array(z.string()),
});

// ============================================================================
// CITATION & REFERENCE TOOLS SCHEMAS
// ============================================================================

export const ValidateCitationsToolInputSchema = z.object({
  text: z.string().min(1),
  citationStyle: z.enum(['APA', 'MLA', 'Chicago', 'Harvard', 'IEEE']).default('APA'),
});

export const ValidateCitationsToolOutputSchema = z.object({
  citations: z.array(z.object({
    text: z.string(),
    type: z.enum(['in-text', 'footnote', 'endnote']),
    position: z.number(),
    isValid: z.boolean(),
    issues: z.array(z.string()),
  })),
  totalCitations: z.number(),
  validCitations: z.number(),
  invalidCitations: z.number(),
  suggestions: z.array(z.string()),
});

export const CheckReferencesToolInputSchema = z.object({
  references: z.string().min(1).describe('The reference list/bibliography section'),
  citationStyle: z.enum(['APA', 'MLA', 'Chicago', 'Harvard', 'IEEE']).default('APA'),
});

export const CheckReferencesToolOutputSchema = z.object({
  references: z.array(z.object({
    text: z.string(),
    isValid: z.boolean(),
    issues: z.array(z.string()),
    suggestions: z.array(z.string()),
  })),
  totalReferences: z.number(),
  validReferences: z.number(),
  invalidReferences: z.number(),
  formattingIssues: z.array(z.string()),
  recommendations: z.array(z.string()),
});

export const MatchCitationsToReferencesToolInputSchema = z.object({
  documentText: z.string().min(1),
  references: z.string().min(1),
  citationStyle: z.enum(['APA', 'MLA', 'Chicago', 'Harvard', 'IEEE']).default('APA'),
});

export const MatchCitationsToReferencesToolOutputSchema = z.object({
  citedButNotInReferences: z.array(z.string()),
  inReferencesButNotCited: z.array(z.string()),
  matchedCitations: z.number(),
  unmatchedCitations: z.number(),
  unmatchedReferences: z.number(),
  recommendations: z.array(z.string()),
});

// ============================================================================
// COMPREHENSIVE ANALYSIS TOOL SCHEMAS
// ============================================================================

export const AnalyzeDocumentQualityToolInputSchema = z.object({
  text: z.string().min(1),
  documentType: z.enum(['academic', 'business', 'technical', 'creative', 'general']).default('general'),
  checkGrammar: z.boolean().default(true),
  checkStructure: z.boolean().default(true),
  checkCitations: z.boolean().default(false),
  citationStyle: z.enum(['APA', 'MLA', 'Chicago', 'Harvard', 'IEEE']).optional(),
});

export const AnalyzeDocumentQualityToolOutputSchema = z.object({
  overallScore: z.number().min(0).max(100),
  grammarScore: z.number().min(0).max(100).optional(),
  structureScore: z.number().min(0).max(100).optional(),
  citationScore: z.number().min(0).max(100).optional(),
  readabilityScore: z.number().min(0).max(100).optional(),
  summary: z.object({
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    priority_improvements: z.array(z.string()),
  }),
  detailedAnalysis: z.object({
    grammar: z.any().optional(),
    structure: z.any().optional(),
    citations: z.any().optional(),
    readability: z.any().optional(),
  }),
});

// Type exports
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
