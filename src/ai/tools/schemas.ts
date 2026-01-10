
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
    text: z.string().min(100, "Please enter at least 100 characters for a comprehensive analysis."),
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

// ============================================================================
// ADVANCED FLOW SCHEMAS
// ============================================================================

export const AcademicLiteratureReviewInputSchema = z.object({
    topic: z.string().min(10, 'Topic must be at least 10 characters').describe('The research topic for the literature review'),
    keywords: z.union([z.string(), z.array(z.string())]).transform(val => typeof val === 'string' ? val.split(',').map(k => k.trim()).filter(Boolean) : val).refine(val => val.length > 0, { message: 'At least one keyword is required.' }),
    citationStyle: z.enum(['APA', 'MLA', 'Chicago', 'Harvard', 'IEEE']).default('APA').describe('Citation style to use'),
    focusAreas: z.union([z.string(), z.array(z.string())]).optional().transform(val => typeof val === 'string' ? val.split(',').map(k => k.trim()).filter(Boolean) : val),
    minLength: z.number().min(500).default(800).describe('Minimum word count for the review'),
    includeGaps: z.boolean().default(true).describe('Whether to identify research gaps'),
});

export const AcademicLiteratureReviewOutputSchema = z.object({
    literatureReview: z.string().describe('The complete literature review text'),
    structure: z.object({
        introduction: z.string(),
        mainBody: z.string(),
        researchGaps: z.string().optional(),
        conclusion: z.string(),
    }).describe('Structured sections of the review'),
    citations: z.object({
        totalCitations: z.number(),
        validCitations: z.number(),
        citationIssues: z.array(z.string()),
    }).describe('Citation validation results'),
    qualityMetrics: z.object({
        argumentStrength: z.enum(['strong', 'moderate', 'weak']),
        logicalFlowScore: z.number().min(0).max(1),
        recommendations: z.array(z.string()),
    }).describe('Quality assessment metrics'),
    metadata: z.object({
        wordCount: z.number(),
        citationCount: z.number(),
        keyThemes: z.array(z.string()),
    }),
});

export const AcademicPaperQualityCheckerInputSchema = z.object({
    documentText: z.string().min(100, 'Document must be at least 100 characters'),
    references: z.string().optional().describe('The reference list/bibliography section'),
    citationStyle: z.enum(['APA', 'MLA', 'Chicago', 'Harvard', 'IEEE']).default('APA'),
    documentType: z.enum(['research_paper', 'thesis', 'dissertation', 'essay', 'review_article']).default('research_paper'),
    checkGrammar: z.boolean().default(true),
    checkCitations: z.boolean().default(true),
    checkStructure: z.boolean().default(true),
    checkReadability: z.boolean().default(true),
});

export const AcademicPaperQualityCheckerOutputSchema = z.object({
    overallScore: z.number().min(0).max(100).describe('Overall quality score'),
    qualityLevel: z.enum(['excellent', 'good', 'fair', 'needs_improvement', 'poor']),

    scores: z.object({
        grammar: z.number().min(0).max(100).optional(),
        citations: z.number().min(0).max(100).optional(),
        structure: z.number().min(0).max(100).optional(),
        readability: z.number().min(0).max(100).optional(),
        argument: z.number().min(0).max(100).optional(),
    }),

    detailedAnalysis: z.object({
        grammarAnalysis: z.object({
            totalIssues: z.number(),
            errorCount: z.number(),
            warningCount: z.number(),
            topIssues: z.array(z.string()),
        }).optional(),

        citationAnalysis: z.object({
            totalCitations: z.number(),
            validCitations: z.number(),
            invalidCitations: z.number(),
            citationIssues: z.array(z.string()),
            referenceIssues: z.array(z.string()).optional(),
            mismatches: z.object({
                citedButNotInReferences: z.array(z.string()),
                inReferencesButNotCited: z.array(z.string()),
            }).optional(),
        }).optional(),

        structureAnalysis: z.object({
            coherenceScore: z.number(),
            transitionQuality: z.string(),
            organizationIssues: z.array(z.string()),
            argumentStrength: z.string(),
        }).optional(),

        readabilityAnalysis: z.object({
            fleschScore: z.number(),
            gradeLevel: z.number(),
            readabilityLevel: z.string(),
            suggestions: z.array(z.string()),
        }).optional(),
    }),

    recommendations: z.object({
        critical: z.array(z.string()).describe('Must fix before submission'),
        important: z.array(z.string()).describe('Should fix for better quality'),
        optional: z.array(z.string()).describe('Nice to have improvements'),
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
    topic: z.string().min(10, 'Topic must be at least 10 characters'),
    purpose: z.string().describe('The purpose/goal of the document'),
    targetAudience: z.string().describe('Who will read this document'),
    keyPoints: z.union([z.string(), z.array(z.string())]).transform(val => typeof val === 'string' ? val.split('\n').map(k => k.trim()).filter(Boolean) : val).refine(val => val.length > 0, { message: 'At least one key point is required.' }),
    tone: z.enum(['professional', 'persuasive', 'neutral', 'authoritative']).default('professional'),
    length: z.enum(['short', 'medium', 'long']).default('medium').describe('short: 500-1000 words, medium: 1000-2000, long: 2000+'),
    includeExecutiveSummary: z.boolean().default(true),
    includeRecommendations: z.boolean().default(true),
    additionalContext: z.string().optional().describe('Any additional context or requirements'),
});

export const ProfessionalDocumentWriterOutputSchema = z.object({
    document: z.string().describe('The complete professional document'),
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
        structureScore: z.number().min(0).max(100),
        flowScore: z.number().min(0).max(100),
        toneAlignment: z.number().min(0).max(1).describe('How well the tone matches target'),
        wordCount: z.number(),
    }),
    improvements: z.object({
        applied: z.array(z.string()).describe('Improvements that were applied'),
        suggestions: z.array(z.string()).describe('Additional suggestions for manual review'),
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
export type AcademicLiteratureReviewInput = z.infer<typeof AcademicLiteratureReviewInputSchema>;
export type AcademicLiteratureReviewOutput = z.infer<typeof AcademicLiteratureReviewOutputSchema>;
export type AcademicPaperQualityCheckerInput = z.infer<typeof AcademicPaperQualityCheckerInputSchema>;
export type AcademicPaperQualityCheckerOutput = z.infer<typeof AcademicPaperQualityCheckerOutputSchema>;
export type ProfessionalDocumentWriterInput = z.infer<typeof ProfessionalDocumentWriterInputSchema>;
export type ProfessionalDocumentWriterOutput = z.infer<typeof ProfessionalDocumentWriterOutputSchema>;

// ============================================================================
// GOOGLE SEARCH TOOLS SCHEMAS
// ============================================================================

export const GoogleSearchToolInputSchema = z.object({
    query: z.string().min(1, 'Search query cannot be empty'),
    searchType: z.enum(['web', 'images', 'maps', 'shopping', 'news']).default('web').describe('Type of Google search to perform'),
    maxResults: z.number().min(1).max(20).default(10).describe('Maximum number of results to return'),
    language: z.string().default('en').describe('Language code for search results (e.g., en, ar)'),
    country: z.string().optional().describe('Country code for localized results (e.g., US, SA)'),
    safeSearch: z.boolean().default(true).describe('Enable safe search filtering'),
});

export const SearchResultSchema = z.object({
    title: z.string(),
    url: z.string(),
    snippet: z.string(),
    displayUrl: z.string().optional(),
    position: z.number().optional(),
});

export const ImageResultSchema = z.object({
    title: z.string(),
    url: z.string(),
    thumbnailUrl: z.string(),
    imageUrl: z.string(),
    width: z.number().optional(),
    height: z.number().optional(),
    source: z.string().optional(),
});

export const MapResultSchema = z.object({
    name: z.string(),
    address: z.string(),
    rating: z.number().optional(),
    reviewCount: z.number().optional(),
    url: z.string(),
    phone: z.string().optional(),
    website: z.string().optional(),
    category: z.string().optional(),
});

export const ShoppingResultSchema = z.object({
    title: z.string(),
    price: z.string(),
    currency: z.string().optional(),
    url: z.string(),
    merchant: z.string(),
    imageUrl: z.string().optional(),
    rating: z.number().optional(),
    reviewCount: z.number().optional(),
});

export const NewsResultSchema = z.object({
    title: z.string(),
    url: z.string(),
    snippet: z.string(),
    source: z.string(),
    publishedDate: z.string().optional(),
    imageUrl: z.string().optional(),
});

export const GoogleSearchToolOutputSchema = z.object({
    searchType: z.enum(['web', 'images', 'maps', 'shopping', 'news']),
    query: z.string(),
    totalResults: z.number(),
    results: z.array(z.union([
        SearchResultSchema,
        ImageResultSchema,
        MapResultSchema,
        ShoppingResultSchema,
        NewsResultSchema,
    ])),
    searchTime: z.number().optional().describe('Search execution time in milliseconds'),
    relatedSearches: z.array(z.string()).optional(),
});

export type GoogleSearchToolInput = z.infer<typeof GoogleSearchToolInputSchema>;
export type GoogleSearchToolOutput = z.infer<typeof GoogleSearchToolOutputSchema>;
export type SearchResult = z.infer<typeof SearchResultSchema>;
export type ImageResult = z.infer<typeof ImageResultSchema>;
export type MapResult = z.infer<typeof MapResultSchema>;
export type ShoppingResult = z.infer<typeof ShoppingResultSchema>;
export type NewsResult = z.infer<typeof NewsResultSchema>;

/**
 * @fileOverview Schemas for Professional Writing Tools
 *
 * This file contains Zod schemas for input/output validation of all
 * professional writing tools used in Genkit.
 */


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
    text: z.string().min(100, "Please enter at least 100 characters for a comprehensive analysis."),
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

// ============================================================================
// ADVANCED FLOW SCHEMAS
// ============================================================================

export const AcademicLiteratureReviewInputSchema = z.object({
    topic: z.string().min(10, 'Topic must be at least 10 characters').describe('The research topic for the literature review'),
    keywords: z.union([z.string(), z.array(z.string())]).transform(val => typeof val === 'string' ? val.split(',').map(k => k.trim()).filter(Boolean) : val).refine(val => val.length > 0, { message: 'At least one keyword is required.' }),
    citationStyle: z.enum(['APA', 'MLA', 'Chicago', 'Harvard', 'IEEE']).default('APA').describe('Citation style to use'),
    focusAreas: z.union([z.string(), z.array(z.string())]).optional().transform(val => typeof val === 'string' ? val.split(',').map(k => k.trim()).filter(Boolean) : val),
    minLength: z.number().min(500).default(800).describe('Minimum word count for the review'),
    includeGaps: z.boolean().default(true).describe('Whether to identify research gaps'),
});

export const AcademicLiteratureReviewOutputSchema = z.object({
    literatureReview: z.string().describe('The complete literature review text'),
    structure: z.object({
        introduction: z.string(),
        mainBody: z.string(),
        researchGaps: z.string().optional(),
        conclusion: z.string(),
    }).describe('Structured sections of the review'),
    citations: z.object({
        totalCitations: z.number(),
        validCitations: z.number(),
        citationIssues: z.array(z.string()),
    }).describe('Citation validation results'),
    qualityMetrics: z.object({
        argumentStrength: z.enum(['strong', 'moderate', 'weak']),
        logicalFlowScore: z.number().min(0).max(1),
        recommendations: z.array(z.string()),
    }).describe('Quality assessment metrics'),
    metadata: z.object({
        wordCount: z.number(),
        citationCount: z.number(),
        keyThemes: z.array(z.string()),
    }),
});

export const AcademicPaperQualityCheckerInputSchema = z.object({
    documentText: z.string().min(100, 'Document must be at least 100 characters'),
    references: z.string().optional().describe('The reference list/bibliography section'),
    citationStyle: z.enum(['APA', 'MLA', 'Chicago', 'Harvard', 'IEEE']).default('APA'),
    documentType: z.enum(['research_paper', 'thesis', 'dissertation', 'essay', 'review_article']).default('research_paper'),
    checkGrammar: z.boolean().default(true),
    checkCitations: z.boolean().default(true),
    checkStructure: z.boolean().default(true),
    checkReadability: z.boolean().default(true),
});

export const AcademicPaperQualityCheckerOutputSchema = z.object({
    overallScore: z.number().min(0).max(100).describe('Overall quality score'),
    qualityLevel: z.enum(['excellent', 'good', 'fair', 'needs_improvement', 'poor']),

    scores: z.object({
        grammar: z.number().min(0).max(100).optional(),
        citations: z.number().min(0).max(100).optional(),
        structure: z.number().min(0).max(100).optional(),
        readability: z.number().min(0).max(100).optional(),
        argument: z.number().min(0).max(100).optional(),
    }),

    detailedAnalysis: z.object({
        grammarAnalysis: z.object({
            totalIssues: z.number(),
            errorCount: z.number(),
            warningCount: z.number(),
            topIssues: z.array(z.string()),
        }).optional(),

        citationAnalysis: z.object({
            totalCitations: z.number(),
            validCitations: z.number(),
            invalidCitations: z.number(),
            citationIssues: z.array(z.string()),
            referenceIssues: z.array(z.string()).optional(),
            mismatches: z.object({
                citedButNotInReferences: z.array(z.string()),
                inReferencesButNotCited: z.array(z.string()),
            }).optional(),
        }).optional(),

        structureAnalysis: z.object({
            coherenceScore: z.number(),
            transitionQuality: z.string(),
            organizationIssues: z.array(z.string()),
            argumentStrength: z.string(),
        }).optional(),

        readabilityAnalysis: z.object({
            fleschScore: z.number(),
            gradeLevel: z.number(),
            readabilityLevel: z.string(),
            suggestions: z.array(z.string()),
        }).optional(),
    }),

    recommendations: z.object({
        critical: z.array(z.string()).describe('Must fix before submission'),
        important: z.array(z.string()).describe('Should fix for better quality'),
        optional: z.array(z.string()).describe('Nice to have improvements'),
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
    topic: z.string().min(10, 'Topic must be at least 10 characters'),
    purpose: z.string().describe('The purpose/goal of the document'),
    targetAudience: z.string().describe('Who will read this document'),
    keyPoints: z.union([z.string(), z.array(z.string())]).transform(val => typeof val === 'string' ? val.split('\n').map(k => k.trim()).filter(Boolean) : val).refine(val => val.length > 0, { message: 'At least one key point is required.' }),
    tone: z.enum(['professional', 'persuasive', 'neutral', 'authoritative']).default('professional'),
    length: z.enum(['short', 'medium', 'long']).default('medium').describe('short: 500-1000 words, medium: 1000-2000, long: 2000+'),
    includeExecutiveSummary: z.boolean().default(true),
    includeRecommendations: z.boolean().default(true),
    additionalContext: z.string().optional().describe('Any additional context or requirements'),
});

export const ProfessionalDocumentWriterOutputSchema = z.object({
    document: z.string().describe('The complete professional document'),
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
        structureScore: z.number().min(0).max(100),
        flowScore: z.number().min(0).max(100),
        toneAlignment: z.number().min(0).max(1).describe('How well the tone matches target'),
        wordCount: z.number(),
    }),
    improvements: z.object({
        applied: z.array(z.string()).describe('Improvements that were applied'),
        suggestions: z.array(z.string()).describe('Additional suggestions for manual review'),
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
export type AcademicLiteratureReviewInput = z.infer<typeof AcademicLiteratureReviewInputSchema>;
export type AcademicLiteratureReviewOutput = z.infer<typeof AcademicLiteratureReviewOutputSchema>;
export type AcademicPaperQualityCheckerInput = z.infer<typeof AcademicPaperQualityCheckerInputSchema>;
export type AcademicPaperQualityCheckerOutput = z.infer<typeof AcademicPaperQualityCheckerOutputSchema>;
export type ProfessionalDocumentWriterInput = z.infer<typeof ProfessionalDocumentWriterInputSchema>;
export type ProfessionalDocumentWriterOutput = z.infer<typeof ProfessionalDocumentWriterOutputSchema>;

// ============================================================================
// GOOGLE SEARCH TOOLS SCHEMAS
// ============================================================================

export const GoogleSearchToolInputSchema = z.object({
    query: z.string().min(1, 'Search query cannot be empty'),
    searchType: z.enum(['web', 'images', 'maps', 'shopping', 'news']).default('web').describe('Type of Google search to perform'),
    maxResults: z.number().min(1).max(20).default(10).describe('Maximum number of results to return'),
    language: z.string().default('en').describe('Language code for search results (e.g., en, ar)'),
    country: z.string().optional().describe('Country code for localized results (e.g., US, SA)'),
    safeSearch: z.boolean().default(true).describe('Enable safe search filtering'),
});

export const SearchResultSchema = z.object({
    title: z.string(),
    url: z.string(),
    snippet: z.string(),
    displayUrl: z.string().optional(),
    position: z.number().optional(),
});

export const ImageResultSchema = z.object({
    title: z.string(),
    url: z.string(),
    thumbnailUrl: z.string(),
    imageUrl: z.string(),
    width: z.number().optional(),
    height: z.number().optional(),
    source: z.string().optional(),
});

export const MapResultSchema = z.object({
    name: z.string(),
    address: z.string(),
    rating: z.number().optional(),
    reviewCount: z.number().optional(),
    url: z.string(),
    phone: z.string().optional(),
    website: z.string().optional(),
    category: z.string().optional(),
});

export const ShoppingResultSchema = z.object({
    title: z.string(),
    price: z.string(),
    currency: z.string().optional(),
    url: z.string(),
    merchant: z.string(),
    imageUrl: z.string().optional(),
    rating: z.number().optional(),
    reviewCount: z.number().optional(),
});

export const NewsResultSchema = z.object({
    title: z.string(),
    url: z.string(),
    snippet: z.string(),
    source: z.string(),
    publishedDate: z.string().optional(),
    imageUrl: z.string().optional(),
});

export const GoogleSearchToolOutputSchema = z.object({
    searchType: z.enum(['web', 'images', 'maps', 'shopping', 'news']),
    query: z.string(),
    totalResults: z.number(),
    results: z.array(z.union([
        SearchResultSchema,
        ImageResultSchema,
        MapResultSchema,
        ShoppingResultSchema,
        NewsResultSchema,
    ])),
    searchTime: z.number().optional().describe('Search execution time in milliseconds'),
    relatedSearches: z.array(z.string()).optional(),
});

export type GoogleSearchToolInput = z.infer<typeof GoogleSearchToolInputSchema>;
export type GoogleSearchToolOutput = z.infer<typeof GoogleSearchToolOutputSchema>;
export type SearchResult = z.infer<typeof SearchResultSchema>;
export type ImageResult = z.infer<typeof ImageResultSchema>;
export type MapResult = z.infer<typeof MapResultSchema>;
export type ShoppingResult = z.infer<typeof ShoppingResultSchema>;
export type NewsResult = z.infer<typeof NewsResultSchema>;
