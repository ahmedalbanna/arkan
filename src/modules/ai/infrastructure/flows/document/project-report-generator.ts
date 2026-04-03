/**
 * @fileOverview Project Report Generator Flow
 *
 * Generates comprehensive project status reports with metrics,
 * achievements, challenges, and recommendations.
 */

import { ai, OLLAMA_MODELS } from '@/modules/ai/infrastructure/services/Genkit';
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
import {z} from 'zod';
// ==================== INPUT/OUTPUT SCHEMAS ====================

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

export const projectReportGenerator = ai.defineFlow(
    {
        name: 'projectReportGenerator',
        inputSchema: ProjectReportInputSchema,
        outputSchema: ProjectReportSchema,
    },
    async (input: z.infer<typeof ProjectReportInputSchema>) => {
        const {
            projectPath,
            projectName,
            reportPeriod,
            includeMetrics,
            includeTimeline,
            includeGitStats,
            targetAudience,
        } = input;

        console.log(`📊 Generating ${reportPeriod} report for: ${projectName}`);

        // Step 1: Calculate project metrics
        let metrics;
        if (includeMetrics) {
            console.log('📈 Step 1/4: Calculating project metrics...');
            metrics = await calculateProjectMetricsTool({
                projectPath,
                includeTestCoverage: true,
                includeQualityMetrics: true,
            });
        }

        // Step 2: Analyze git history
        let gitHistory;
        if (includeGitStats) {
            console.log('🔍 Step 2/4: Analyzing git history...');
            gitHistory = await analyzeGitHistoryTool({
                projectPath,
                limitCommits: 100,
                analyzeContributors: true,
            });
        }

        // Step 3: Create progress timeline
        let timeline;
        if (includeTimeline) {
            console.log('📅 Step 3/4: Creating progress timeline...');
            timeline = await createProgressTimelineTool({
                projectPath,
                format: 'mermaid',
                granularity: reportPeriod === 'daily' ? 'daily' : reportPeriod === 'weekly' ? 'weekly' : 'monthly',
                maxEvents: 30,
            });
        }

        // Step 4: Generate comprehensive report
        console.log('📝 Step 4/4: Generating comprehensive report...');

        const reportData = {
            projectName,
            reportPeriod,
            metrics: metrics ? {
                commits: metrics.activity.commitsLastMonth,
                contributors: metrics.general.activeContributors,
                linesOfCode: metrics.code.linesOfCode,
                filesChanged: 0, // Will be calculated from git history
            } : undefined,
            achievements: gitHistory ? [
                `${gitHistory.totalCommits} commits made`,
                `${gitHistory.contributors.length} active contributors`,
                ...gitHistory.recentCommits.slice(0, 5).map((c: any) => c.message),
            ] : undefined,
            targetAudience,
        };

        const reportPromptResult = await projectReportPrompt(reportData);

        // Use the status report tool for additional insights
        const statusReport = await generateStatusReportTool({
            projectPath,
            reportPeriod,
            startDate: input.startDate,
            endDate: input.endDate,
            includeRecommendations: true,
        });

        // Combine all information
        const fullReport = await ai.generate({
            model: OLLAMA_MODELS.LLAMA3_8B,
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
- Contributors: ${gitHistory.contributors.length}
- Recent Activity: ${gitHistory.recentCommits.length} commits analyzed
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

        console.log('✅ Report generation complete!');

        return fullReport.output!;
    }
);
