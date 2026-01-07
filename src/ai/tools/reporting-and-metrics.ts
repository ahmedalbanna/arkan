/**
 * @fileOverview Reporting and Metrics Tools
 * 
 * Tools for calculating project metrics, analyzing git history,
 * generating status reports, and creating progress timelines.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import {
  ProjectMetricsSchema,
  ProjectReportSchema,
} from '@/ai/schemas/project-documentation';

// ==================== TOOL 9: Calculate Project Metrics ====================

const CalculateProjectMetricsInputSchema = z.object({
  projectPath: z.string().describe('Path to the project'),
  includeTestCoverage: z.boolean().default(false).describe('Calculate test coverage'),
  includeQualityMetrics: z.boolean().default(true).describe('Include code quality metrics'),
});

export const calculateProjectMetricsTool = ai.defineTool(
  {
    name: 'calculateProjectMetrics',
    description: `Calculates comprehensive project metrics including LOC, files, coverage, and quality.
    
    This tool provides a complete overview of project health with quantifiable metrics
    for reporting and tracking purposes.
    
    Use this when you need to:
    - Generate project status reports
    - Track project health
    - Create metrics dashboards
    - Report to stakeholders`,
    inputSchema: CalculateProjectMetricsInputSchema,
    outputSchema: ProjectMetricsSchema,
  },
  async (input) => {
    const { projectPath, includeTestCoverage, includeQualityMetrics } = input;

    const prompt = `Calculate comprehensive project metrics for: ${projectPath}

Instructions:
1. General Metrics:
   - Project age (time since first commit)
   - Last updated (last commit date)
   - Number of active contributors
   - Total commits

2. Code Metrics:
   - Total lines of code
   - Number of files
   ${includeTestCoverage ? '- Test coverage percentage (if test runner available)' : ''}
   - Documentation coverage (% of functions/classes with docs)

${includeQualityMetrics ? `3. Quality Metrics:
   - Maintainability index (0-100 scale, higher is better)
   - Technical debt estimate (hours or story points)
   - Code smells count (from static analysis)
   - Security issues count (from security scan)` : ''}

4. Activity Metrics:
   - Commits in last week
   - Commits in last month
   - Average commit size (lines changed)
   - Open merge/pull requests count

Return a JSON object matching the ProjectMetrics schema with all metrics organized into:
- general (projectAge, lastUpdated, activeContributors, totalCommits)
- code (linesOfCode, fileCount, testCoverage, documentationCoverage)
- quality (maintainabilityIndex, technicalDebt, codeSmells, securityIssues)
- activity (commitsLastWeek, commitsLastMonth, averageCommitSize, mergeRequestsOpen)`;

    const result = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt,
      output: { schema: ProjectMetricsSchema },
    });

    return result.output!;
  }
);

// ==================== TOOL 10: Generate Status Report ====================

const GenerateStatusReportInputSchema = z.object({
  projectPath: z.string().describe('Path to the project'),
  reportPeriod: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom']).describe('Reporting period'),
  startDate: z.string().optional().describe('Start date for custom period (ISO format)'),
  endDate: z.string().optional().describe('End date for custom period (ISO format)'),
  includeRecommendations: z.boolean().default(true).describe('Include improvement recommendations'),
});

export const generateStatusReportTool = ai.defineTool(
  {
    name: 'generateStatusReport',
    description: `Generates a comprehensive project status report for a given time period.
    
    This tool creates executive-ready reports with metrics, achievements,
    challenges, and recommendations.
    
    Use this when you need to:
    - Create periodic status updates
    - Report to stakeholders
    - Document progress
    - Plan improvements`,
    inputSchema: GenerateStatusReportInputSchema,
    outputSchema: ProjectReportSchema,
  },
  async (input) => {
    const { projectPath, reportPeriod, startDate, endDate, includeRecommendations } = input;

    const prompt = `Generate a project status report for: ${projectPath}

Report Period: ${reportPeriod}
${startDate && endDate ? `Custom Period: ${startDate} to ${endDate}` : ''}

Instructions:
1. Executive Summary:
   - Brief overview of project status
   - Key highlights and concerns
   - Overall health assessment

2. Metrics Dashboard:
   - Calculate all project metrics (LOC, commits, contributors, etc.)
   - Compare to previous period if applicable
   - Identify trends (improving/declining)

3. Achievements:
   - List major accomplishments in this period
   - Features completed
   - Bugs fixed
   - Milestones reached

4. Challenges:
   - Issues encountered
   - Blockers
   - Technical debt
   - Resource constraints

5. Roadmap:
   - Upcoming milestones with status (completed/in_progress/planned/delayed)
   - Due dates
   - Priority assignments

6. Team Activity:
   - Active team members
   - Individual contributions (commits, lines changed)
   - Collaboration patterns

${includeRecommendations ? `7. Recommendations:
   - Actionable improvement suggestions
   - Risk mitigation strategies
   - Process improvements
   - Technical recommendations` : ''}

Return a JSON object matching the ProjectReport schema with:
- reportTitle
- reportPeriod
- executiveSummary
- metrics (ProjectMetrics object)
- achievements (array of strings)
- challenges (array of strings)
- roadmap (array of milestone objects)
- teamActivity (object with activeMembers and contributions)
- recommendations (array of strings)
- fullContent (complete markdown report)`;

    const result = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt,
      output: { schema: ProjectReportSchema },
    });

    return result.output!;
  }
);

// ==================== TOOL 11: Create Progress Timeline ====================

const CreateProgressTimelineInputSchema = z.object({
  projectPath: z.string().describe('Path to the project'),
  format: z.enum(['mermaid', 'markdown', 'json']).default('mermaid').describe('Timeline output format'),
  granularity: z.enum(['daily', 'weekly', 'monthly']).default('weekly').describe('Timeline granularity'),
  maxEvents: z.number().default(50).describe('Maximum number of events to include'),
});

const ProgressTimelineSchema = z.object({
  timeline: z.string(),
  events: z.array(z.object({
    date: z.string(),
    type: z.enum(['commit', 'release', 'milestone', 'branch', 'merge', 'tag']),
    title: z.string(),
    description: z.string(),
    author: z.string().optional(),
  })),
  summary: z.string(),
});

export const createProgressTimelineTool = ai.defineTool(
  {
    name: 'createProgressTimeline',
    description: `Creates a visual timeline of project development progress.
    
    This tool generates chronological timelines showing commits, releases,
    milestones, and other significant events.
    
    Use this when you need to:
    - Visualize project history
    - Create progress presentations
    - Document project evolution
    - Show development velocity`,
    inputSchema: CreateProgressTimelineInputSchema,
    outputSchema: ProgressTimelineSchema,
  },
  async (input) => {
    const { projectPath, format, granularity, maxEvents } = input;

    const prompt = `Create a project progress timeline for: ${projectPath}

Format: ${format}
Granularity: ${granularity}
Maximum Events: ${maxEvents}

Instructions:
1. Analyze git history and identify significant events:
   - Major commits (features, fixes)
   - Releases and tags
   - Branch creations and merges
   - Milestones reached
   - Breaking changes

2. Group events by ${granularity} period

3. For each event, include:
   - Date (ISO format)
   - Type (commit/release/milestone/branch/merge/tag)
   - Title (brief, descriptive)
   - Description (what happened)
   - Author (if applicable)

4. Generate timeline in ${format} format:
   ${format === 'mermaid' ? '- Use Mermaid gantt or timeline syntax' : format === 'markdown' ? '- Use markdown list with dates' : '- Pure JSON structure'}

5. Write a summary highlighting:
   - Total time span
   - Major milestones
   - Development velocity
   - Key phases

Limit to ${maxEvents} most significant events.

Return a JSON object with:
- timeline (formatted timeline string)
- events (array of event objects)
- summary (text summary of project evolution)`;

    const result = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt,
      output: { schema: ProgressTimelineSchema },
    });

    return result.output!;
  }
);

// ==================== TOOL 12: Generate Architecture Diagram ====================

const GenerateArchitectureDiagramInputSchema = z.object({
  projectPath: z.string().describe('Path to the project'),
  diagramType: z.enum(['component', 'sequence', 'class', 'deployment', 'flowchart']).default('component').describe('Type of diagram'),
  includeDetails: z.boolean().default(true).describe('Include detailed annotations'),
  style: z.enum(['simple', 'detailed', 'technical']).default('detailed').describe('Diagram style'),
});

const ArchitectureDiagramSchema = z.object({
  diagram: z.string().describe('Mermaid diagram code'),
  description: z.string(),
  components: z.array(z.object({
    name: z.string(),
    type: z.string(),
    description: z.string(),
    dependencies: z.array(z.string()),
  })),
  designPatterns: z.array(z.string()).optional(),
});

export const generateArchitectureDiagramTool = ai.defineTool(
  {
    name: 'generateArchitectureDiagram',
    description: `Generates architecture diagrams in Mermaid format from project structure.
    
    This tool analyzes project architecture and creates visual diagrams
    showing components, relationships, and data flow.
    
    Use this when you need to:
    - Document system architecture
    - Create technical specifications
    - Explain system design
    - Onboard new developers`,
    inputSchema: GenerateArchitectureDiagramInputSchema,
    outputSchema: ArchitectureDiagramSchema,
  },
  async (input) => {
    const { projectPath, diagramType, includeDetails, style } = input;

    const prompt = `Generate an architecture diagram for project at: ${projectPath}

Diagram Type: ${diagramType}
Style: ${style}
Include Details: ${includeDetails}

Instructions:
1. Analyze project structure to identify:
   - Main components/modules
   - Data flow and dependencies
   - External services/APIs
   - Database connections
   - Frontend/backend separation

2. Create a Mermaid ${diagramType} diagram:
   ${diagramType === 'component' ? '- Show system components and their interactions' : ''}
   ${diagramType === 'sequence' ? '- Show typical user flow or API calls sequence' : ''}
   ${diagramType === 'class' ? '- Show main classes and their relationships' : ''}
   ${diagramType === 'deployment' ? '- Show deployment architecture (servers, containers, services)' : ''}
   ${diagramType === 'flowchart' ? '- Show business logic or process flow' : ''}

3. Style: ${style}
   ${style === 'simple' ? '- Minimal components, high-level only' : ''}
   ${style === 'detailed' ? '- Include major components and relationships' : ''}
   ${style === 'technical' ? '- Full technical detail with types, methods, protocols' : ''}

${includeDetails ? '4. Add annotations explaining key design decisions' : ''}

5. Document each component:
   - Name and type
   - Description
   - Dependencies on other components

6. Identify design patterns used (if any):
   - MVC, MVVM, Repository, Factory, etc.

Return a JSON object with:
- diagram (complete Mermaid diagram code as string)
- description (text explaining the architecture)
- components (array of component objects)
- designPatterns (array of pattern names, optional)`;

    const result = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt,
      output: { schema: ArchitectureDiagramSchema },
    });

    return result.output!;
  }
);

// Export all reporting and metrics tools
export const reportingAndMetricsTools = {
  calculateProjectMetrics: calculateProjectMetricsTool,
  generateStatusReport: generateStatusReportTool,
  createProgressTimeline: createProgressTimelineTool,
  generateArchitectureDiagram: generateArchitectureDiagramTool,
};
