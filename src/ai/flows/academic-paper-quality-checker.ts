

/**
 * @fileOverview Academic Paper Quality Checker Flow
 *
 * This flow provides comprehensive quality assessment for academic papers,
 * using multiple professional writing tools in a coordinated manner.
 *
 * Flow Architecture:
 * 1. Parse document into sections
 * 2. Run parallel quality checks (grammar, structure, citations, readability)
 * 3. Generate improvement recommendations
 * 4. Provide prioritized action items
 * 5. Return comprehensive quality report
 */

import { ai } from '@/ai/genkit';
import {
    analyzeArgumentStructureTool,
    analyzeDocumentStructureTool,
    checkGrammarTool,
    checkLogicalFlowTool,
    checkReadabilityTool,
    checkReferencesTool,
    matchCitationsToReferencesTool,
    validateCitationsTool,
} from '@/ai/tools';
import { z } from 'zod';
import { AcademicPaperQualityCheckerInputSchema, AcademicPaperQualityCheckerOutputSchema } from '../tools/schemas';

export type AcademicPaperQualityCheckerInput = z.infer<typeof AcademicPaperQualityCheckerInputSchema>;
export type AcademicPaperQualityCheckerOutput = z.infer<typeof AcademicPaperQualityCheckerOutputSchema>;

/**
 * Academic Paper Quality Checker Flow
 *
 * Provides comprehensive quality assessment using multiple AI tools in parallel
 */
export const academicPaperQualityCheckerFlow = ai.defineFlow(
    {
        name: 'academicPaperQualityChecker',
        inputSchema: AcademicPaperQualityCheckerInputSchema,
        outputSchema: AcademicPaperQualityCheckerOutputSchema,
    },
    async (input) => {
        const { documentText, references, citationStyle, checkGrammar, checkCitations, checkStructure, checkReadability } = input;

        console.log('Starting comprehensive quality check...');

        // Initialize results object
        const results: any = {
            grammarAnalysis: null,
            citationAnalysis: null,
            structureAnalysis: null,
            readabilityAnalysis: null,
            argumentAnalysis: null,
            flowAnalysis: null,
        };

        // ========================================================================
        // PARALLEL QUALITY CHECKS
        // Execute all enabled checks in parallel for efficiency
        // ========================================================================

        const checks = [];

        // Grammar Check
        if (checkGrammar) {
            checks.push(
                checkGrammarTool({ text: documentText, language: 'en' })
                    .then(result => { results.grammarAnalysis = result; })
                    .catch(err => console.error('Grammar check failed:', err))
            );
        }

        // Readability Check
        if (checkReadability) {
            checks.push(
                checkReadabilityTool({ text: documentText })
                    .then(result => { results.readabilityAnalysis = result; })
                    .catch(err => console.error('Readability check failed:', err))
            );
        }

        // Structure Checks
        if (checkStructure) {
            checks.push(
                analyzeDocumentStructureTool({ text: documentText, documentType: 'academic' })
                    .then(result => { results.structureAnalysis = result; })
                    .catch(err => console.error('Structure analysis failed:', err))
            );

            checks.push(
                analyzeArgumentStructureTool({ text: documentText })
                    .then(result => { results.argumentAnalysis = result; })
                    .catch(err => console.error('Argument analysis failed:', err))
            );

            checks.push(
                checkLogicalFlowTool({ text: documentText })
                    .then(result => { results.flowAnalysis = result; })
                    .catch(err => console.error('Flow check failed:', err))
            );
        }

        // Citation Checks
        if (checkCitations) {
            checks.push(
                validateCitationsTool({ text: documentText, citationStyle })
                    .then(result => { results.citationValidation = result; })
                    .catch(err => console.error('Citation validation failed:', err))
            );

            if (references) {
                checks.push(
                    checkReferencesTool({ references, citationStyle })
                        .then(result => { results.referenceCheck = result; })
                        .catch(err => console.error('Reference check failed:', err))
                );

                checks.push(
                    matchCitationsToReferencesTool({ documentText, references, citationStyle })
                        .then(result => { results.citationMatching = result; })
                        .catch(err => console.error('Citation matching failed:', err))
                );
            }
        }

        // Wait for all checks to complete
        await Promise.all(checks);

        console.log('All quality checks completed. Analyzing results...');

        // ========================================================================
        // CALCULATE SCORES
        // ========================================================================

        const scores: any = {};

        // Grammar Score
        if (results.grammarAnalysis) {
            const maxErrors = 50; // Assume max 50 errors for 100-point scale
            const errorPenalty = Math.min(results.grammarAnalysis.totalIssues / maxErrors, 1);
            scores.grammar = Math.round((1 - errorPenalty) * 100);
        }

        // Citation Score
        if (results.citationValidation) {
            const validRatio = results.citationValidation.totalCitations > 0
                ? results.citationValidation.validCitations / results.citationValidation.totalCitations
                : 1;
            scores.citations = Math.round(validRatio * 100);
        }

        // Structure Score
        if (results.structureAnalysis && results.flowAnalysis) {
            const coherenceScore = results.structureAnalysis.coherence.score * 50;
            const flowScore = results.flowAnalysis.flowScore * 50;
            scores.structure = Math.round(coherenceScore + flowScore);
        }

        // Readability Score
        if (results.readabilityAnalysis) {
            // Flesch score already on 0-100 scale
            scores.readability = Math.round(results.readabilityAnalysis.fleschReadingEase);
        }

        // Argument Score
        if (results.argumentAnalysis) {
            const strengthMap: { [key: string]: number } = { strong: 90, moderate: 70, weak: 50 };
            const strength = results.argumentAnalysis.overallStrength as string;
            scores.argument = strengthMap[strength] || 60;
        }

        // Overall Score (weighted average)
        const enabledScores = Object.values(scores).filter((s): s is number => typeof s === 'number');
        const overallScore = enabledScores.length > 0
            ? Math.round(enabledScores.reduce((a, b) => a + b, 0) / enabledScores.length)
            : 0;

        // ========================================================================
        // CATEGORIZE RECOMMENDATIONS
        // ========================================================================

        const critical: string[] = [];
        const important: string[] = [];
        const optional: string[] = [];

        // Grammar issues
        if (results.grammarAnalysis?.errorCount > 10) {
            critical.push(`Fix ${results.grammarAnalysis.errorCount} grammar errors before submission`);
        } else if (results.grammarAnalysis?.errorCount > 0) {
            important.push(`Address ${results.grammarAnalysis.errorCount} grammar errors`);
        }

        // Citation issues
        if (results.citationValidation?.invalidCitations > 0) {
            critical.push(`Fix ${results.citationValidation.invalidCitations} invalid citations`);
        }

        if (results.citationMatching?.unmatchedCitations > 0) {
            important.push(`Add ${results.citationMatching.unmatchedCitations} missing references`);
        }

        // Structure issues
        if (results.structureAnalysis?.coherence.score < 0.6) {
            critical.push('Improve document coherence and organization');
        }

        if (results.argumentAnalysis?.overallStrength === 'weak') {
            important.push('Strengthen arguments with more evidence and clearer reasoning');
        }

        if (results.flowAnalysis?.flowScore < 0.7) {
            important.push('Improve logical flow and transitions between sections');
        }

        // Readability suggestions
        if (results.readabilityAnalysis?.fleschReadingEase < 30) {
            optional.push('Simplify sentence structure for better readability');
        }

        // ========================================================================
        // GENERATE SUMMARY
        // ========================================================================

        const strengths: string[] = [];
        const weaknesses: string[] = [];

        if (scores.grammar >= 80) strengths.push('Excellent grammar and spelling');
        else if (scores.grammar < 60) weaknesses.push('Multiple grammar and spelling errors');

        if (scores.citations >= 80) strengths.push('Proper citation formatting');
        else if (scores.citations < 60) weaknesses.push('Citation formatting issues');

        if (scores.structure >= 75) strengths.push('Well-organized structure');
        else if (scores.structure < 60) weaknesses.push('Weak document organization');

        if (scores.argument >= 80) strengths.push('Strong argumentation');
        else if (scores.argument < 70) weaknesses.push('Arguments need strengthening');

        // Determine readiness level
        let readinessLevel: 'ready_to_submit' | 'minor_revisions' | 'major_revisions' | 'needs_rewrite';
        let estimatedRevisionTime: string;

        if (overallScore >= 85 && critical.length === 0) {
            readinessLevel = 'ready_to_submit';
            estimatedRevisionTime = '0-1 hours (final proofread)';
        } else if (overallScore >= 75 && critical.length <= 2) {
            readinessLevel = 'minor_revisions';
            estimatedRevisionTime = '2-4 hours';
        } else if (overallScore >= 60) {
            readinessLevel = 'major_revisions';
            estimatedRevisionTime = '1-2 days';
        } else {
            readinessLevel = 'needs_rewrite';
            estimatedRevisionTime = '3-7 days';
        }

        // Determine quality level
        let qualityLevel: 'excellent' | 'good' | 'fair' | 'needs_improvement' | 'poor';
        if (overallScore >= 90) qualityLevel = 'excellent';
        else if (overallScore >= 80) qualityLevel = 'good';
        else if (overallScore >= 70) qualityLevel = 'fair';
        else if (overallScore >= 60) qualityLevel = 'needs_improvement';
        else qualityLevel = 'poor';

        // ========================================================================
        // RETURN COMPREHENSIVE REPORT
        // ========================================================================

        return {
            overallScore,
            qualityLevel,
            scores,
            detailedAnalysis: {
                grammarAnalysis: results.grammarAnalysis ? {
                    totalIssues: results.grammarAnalysis.totalIssues,
                    errorCount: results.grammarAnalysis.errorCount,
                    warningCount: results.grammarAnalysis.warningCount,
                    topIssues: results.grammarAnalysis.issues
                        .filter((i: any) => i.severity === 'error')
                        .slice(0, 5)
                        .map((i: any) => i.message),
                } : undefined,
                citationAnalysis: results.citationValidation ? {
                    totalCitations: results.citationValidation.totalCitations,
                    validCitations: results.citationValidation.validCitations,
                    invalidCitations: results.citationValidation.invalidCitations,
                    citationIssues: results.citationValidation.suggestions,
                    referenceIssues: results.referenceCheck?.recommendations,
                    mismatches: results.citationMatching ? {
                        citedButNotInReferences: results.citationMatching.citedButNotInReferences,
                        inReferencesButNotCited: results.citationMatching.inReferencesButNotCited,
                    } : undefined,
                } : undefined,
                structureAnalysis: results.structureAnalysis ? {
                    coherenceScore: results.structureAnalysis.coherence.score,
                    transitionQuality: results.structureAnalysis.transitions.quality,
                    organizationIssues: results.structureAnalysis.coherence.issues,
                    argumentStrength: results.argumentAnalysis?.overallStrength || 'unknown',
                } : undefined,
                readabilityAnalysis: results.readabilityAnalysis ? {
                    fleschScore: results.readabilityAnalysis.fleschReadingEase,
                    gradeLevel: results.readabilityAnalysis.fleschKincaidGrade,
                    readabilityLevel: results.readabilityAnalysis.readabilityLevel,
                    suggestions: results.readabilityAnalysis.suggestions,
                } : undefined,
            },
            recommendations: {
                critical,
                important,
                optional,
            },
            summary: {
                strengths,
                weaknesses,
                readinessLevel,
                estimatedRevisionTime,
            },
        };
    }
);
