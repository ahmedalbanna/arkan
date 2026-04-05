'use server';

import { ai, OLLAMA_MODELS, MODEL_BY_TASK } from '@/modules/ai/infrastructure/services/Genkit';
import { projectReportPrompt } from '@/modules/ai/infrastructure/prompts/project-documentation';
import {
    ProjectReportSchema,
    ReportPeriodSchema,
} from '@/modules/ai/domain/schemas/project-documentation';
import {
    analyzeGitHistoryTool,
    calculateProjectMetricsTool,
    createProgressTimelineTool,
    generateStatusReportTool,
} from '@/modules/ai/infrastructure/tools/reporting-and-metrics';
import { z } from 'zod';
import { Result } from '@/infrastructure/utils/result';
import { cleanAiOutput } from '@/infrastructure/utils/sanitizer';

/**
 * projectReportGenerator — High-fidelity document orchestration for project status reports.
 * Sequentially invokes analytical tools to synthesize achievements, metrics, and roadmap status.
 * 
 * DEFENSIVE MEASURES:
 * 1. Tool Resilience: Wraps multi-step tool invocations in try-catch containment.
 * 2. Schema Guard: Enforces strict input validation for reporting periods and pathing.
 * 3. Sanitization: Post-processes final report markdown to ensure stylistic purity.
 * 4. Observability: Structured logging for production lifecycle tracing.
 */

const ProjectReportInputSchema = z.object({
    projectPath: z.string().describe('Path to the project'),
    projectName: z.string().describe('Project name'),
    reportPeriod: ReportPeriodSchema.describe('Reporting period'),
    startDate: z.string().optional().describe('Start date (ISO format) for custom period'),
    endDate: z.string().optional().describe('End date (ISO format) for custom period'),
    includeMetrics: z.boolean().default(true).describe('Include detailed metrics'),
    includeTimeline: z.boolean().default(true).describe('Include progress timeline'),
    includeGitStats: z.boolean().default(true).describe('Include git history analysis'),
    targetAudience: z.enum(['technical', 'executive', 'stakeholders']).default('stakeholders'),
    format: z.enum(['markdown', 'html', 'json']).default('markdown'),
});

type ProjectReportInput = z.infer<typeof ProjectReportInputSchema>;
type ProjectReportOutput = z.infer<typeof ProjectReportSchema>;

const projectReportGeneratorFlow = ai.defineFlow(
    {
        name: 'projectReportGenerator',
        inputSchema: ProjectReportInputSchema,
        outputSchema: ProjectReportSchema,
    },
    async (input: ProjectReportInput) => {
        const {
            projectPath,
            projectName,
            reportPeriod,
            includeMetrics,
            includeTimeline,
            includeGitStats,
            targetAudience,
        } = input;

        console.log(`[Flow:ReportGen] Initializing ${reportPeriod} synthesis for: ${projectName}`);

        // Step 1: Calculate project metrics — Guarded Execution
        let metrics;
        if (includeMetrics) {
            try {
                metrics = await calculateProjectMetricsTool({
                    projectPath,
                    includeTestCoverage: true,
                    includeQualityMetrics: true,
                });
            } catch (e) {
                console.warn(`[Flow:ReportGen] Metrics tool failure:`, e);
            }
        }

        // Step 2: Analyze git history — Guarded Execution
        let gitHistory;
        if (includeGitStats) {
            try {
                gitHistory = await analyzeGitHistoryTool({
                    projectPath,
                    limitCommits: 100,
                    analyzeContributors: true,
                });
            } catch (e) {
                console.warn(`[Flow:ReportGen] Git analysis tool failure:`, e);
            }
        }

        // Step 3: Create progress timeline — Guarded Execution
        let timeline;
        if (includeTimeline) {
            try {
                timeline = await createProgressTimelineTool({
                    projectPath,
                    format: 'mermaid',
                    granularity: reportPeriod === 'daily' ? 'daily' : reportPeriod === 'weekly' ? 'weekly' : 'monthly',
                    maxEvents: 30,
                });
            } catch (e) {
                console.warn(`[Flow:ReportGen] Timeline tool failure:`, e);
            }
        }

        // Step 4: Generate status report metadata
        let statusReport = { executiveSummary: 'System report status pending.' };
        try {
            statusReport = await generateStatusReportTool({
                projectPath,
                reportPeriod,
                startDate: input.startDate,
                endDate: input.endDate,
                includeRecommendations: true,
            });
        } catch (e) {
            console.warn(`[Flow:ReportGen] Status report tool failure:`, e);
        }

        // Step 5: Document Synthesis — Neural Integration
        const reportData = {
            projectName,
            reportPeriod,
            metrics: metrics ? {
                commits: metrics.activity?.commitsLastMonth || 0,
                contributors: metrics.general?.activeContributors || 0,
                linesOfCode: metrics.code?.linesOfCode || 0,
                filesChanged: 0,
            } : undefined,
            achievements: gitHistory ? [
                `${gitHistory.totalCommits || 0} commits identified`,
                `${gitHistory.contributors?.length || 0} active nodes`,
                ...(Array.isArray(gitHistory.recentCommits) ? gitHistory.recentCommits.slice(0, 5).map((c: any) => c.message) : []),
            ] : undefined,
            targetAudience,
        };

        const reportPromptResult = await projectReportPrompt(reportData);

        const fullReport = await ai.generate({
            model: MODEL_BY_TASK.ACADEMIC, // High-quality reasoning model
            prompt: `Create a comprehensive ${reportPeriod} project report for ${projectName}.

Target Audience: ${targetAudience}

Base Report:
${reportPromptResult.text}

Additional Context:
${statusReport.executiveSummary}

Metrics:
${metrics ? JSON.stringify(metrics, null, 2) : 'Not available'}

Git Statistics:
${gitHistory ? `
- Total Commits: ${gitHistory.totalCommits}
- Contributors: ${gitHistory.contributors?.length}
- Recent Activity: ${gitHistory.recentCommits?.length} commits analyzed
` : 'Not available'}

${timeline ? `
Timeline:
${timeline.summary}
` : ''}

Create a well-structured report with:
1. Executive Summary (health status, key highlights)
2. Detailed Metrics (with trends)
3. Major Achievements
4. Current Challenges
5. Team Activity
6. Roadmap Status
7. Recommendations

Format: Markdown with tables and visual indicators (✅ ⚠️ ❌ 📈 📉)`,
            output: { schema: ProjectReportSchema },
        });

        if (!fullReport.output) {
            throw new Error('Neural core failed to synthesize final report manifest.');
        }

        // Final spectral cleanup pass
        const finalReport = fullReport.output;
        if (finalReport.content) {
            finalReport.content = cleanAiOutput(finalReport.content);
        }

        console.log(`[Flow:ReportGen] Synthesis finalized for: ${projectName}`);
        return finalReport;
    }
);

export async function projectReportGenerator(input: ProjectReportInput): Promise<Result<ProjectReportOutput, Error>> {
    // Schema guard at the boundary
    const validation = ProjectReportInputSchema.safeParse(input);
    if (!validation.success) {
        return Result.fail(new Error(`Invalid report parameters: ${validation.error.message}`));
    }

    try {
        const result = await projectReportGeneratorFlow(validation.data);
        return Result.ok(result);
    } catch (error) {
        console.error('[Flow:ReportGen] Orchestration pipeline failure:', error);
        return Result.fail(error instanceof Error ? error : new Error('Unknown report generation failure'));
    }
}
