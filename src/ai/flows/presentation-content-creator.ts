/**
 * @fileOverview Presentation Content Creator Flow
 *
 * Generates structured content for project presentations including
 * demos, pitches, technical reviews, and status updates.
 */

import { ai } from '@/ai/genkit';
import { presentationContentPrompt } from '@/ai/prompts/project-documentation';
import {
    PresentationContentSchema,
    PresentationTypeSchema,
} from '@/ai/schemas/project-documentation';
import {
    analyzeProjectStructureTool,
    extractDependenciesTool,
} from '@/ai/tools/project-analysis';
import {
    calculateProjectMetricsTool,
    generateArchitectureDiagramTool,
} from '@/ai/tools/reporting-and-metrics';

// ==================== INPUT/OUTPUT SCHEMAS ====================

const PresentationInputSchema = ai.z.object({
    projectPath: ai.z.string().describe('Path to the project'),
    projectName: ai.z.string().describe('Project name'),
    projectDescription: ai.z.string().describe('Brief project description'),
    presentationType: PresentationTypeSchema.describe('Type of presentation'),
    duration: ai.z.number().describe('Presentation duration in minutes'),
    audience: ai.z.string().describe('Target audience description'),
    keyPoints: ai.z.array(ai.z.string()).optional().describe('Key points to emphasize'),
    includeMetrics: ai.z.boolean().default(true).describe('Include project metrics'),
    includeDiagram: ai.z.boolean().default(true).describe('Include architecture diagram'),
    includeDemo: ai.z.boolean().default(false).describe('Include demo section'),
});

export const presentationContentCreator = ai.defineFlow(
    {
        name: 'presentationContentCreator',
        inputSchema: PresentationInputSchema,
        outputSchema: PresentationContentSchema,
    },
    async (input) => {
        const {
            projectPath,
            projectName,
            projectDescription,
            presentationType,
            duration,
            audience,
            keyPoints,
            includeMetrics,
            includeDiagram,
        } = input;

        console.log(`🎤 Creating ${presentationType} presentation for: ${projectName}`);
        console.log(`⏱️ Duration: ${duration} minutes | Audience: ${audience}`);

        // Step 1: Analyze project structure
        console.log('📊 Step 1/5: Analyzing project...');
        const projectStructure = await analyzeProjectStructureTool({
            projectPath,
            includeHidden: false,
            maxDepth: 3,
        });

        // Step 2: Extract dependencies for tech stack slide
        console.log('📦 Step 2/5: Extracting technology stack...');
        const dependencies = await extractDependenciesTool({
            projectPath,
            analyzeOutdated: false,
            categorize: true,
        });

        // Step 3: Calculate metrics (if requested)
        let metrics;
        if (includeMetrics) {
            console.log('📈 Step 3/5: Calculating project metrics...');
            metrics = await calculateProjectMetricsTool({
                projectPath,
                includeTestCoverage: true,
                includeQualityMetrics: false,
            });
        }

        // Step 4: Generate architecture diagram (if requested)
        let diagram;
        if (includeDiagram) {
            console.log('🏗️ Step 4/5: Creating architecture diagram...');
            diagram = await generateArchitectureDiagramTool({
                projectPath,
                diagramType: presentationType === 'technical_review' ? 'component' : 'flowchart',
                includeDetails: presentationType === 'technical_review',
                style: presentationType === 'pitch' ? 'simple' : 'detailed',
            });
        }

        // Step 5: Generate presentation content
        console.log('🎨 Step 5/5: Generating presentation content...');

        const presentationPromptResult = await presentationContentPrompt({
            projectName,
            presentationType,
            duration,
            audience,
            keyPoints,
        });

        // Enhance with project-specific data
        const enhancedPresentation = await ai.generate({
            model: 'ollama/gemma:2b',
            prompt: `Create detailed presentation slides for a ${presentationType} presentation.

Project: ${projectName}
Description: ${projectDescription}
Duration: ${duration} minutes
Audience: ${audience}

Base Structure:
${presentationPromptResult.text}

Project Details:
- Project Type: ${projectStructure.projectType}
- Total Files: ${projectStructure.totalFiles}
- Main Components: ${projectStructure.mainDirectories.length}
- Tech Stack: ${Object.keys(dependencies.categories).flatMap(cat => dependencies.categories[cat as keyof typeof dependencies.categories]).slice(0, 8).join(', ')}

${metrics ? `
Metrics to Highlight:
- Lines of Code: ${metrics.code.linesOfCode.toLocaleString()}
- Active Contributors: ${metrics.general.activeContributors}
- Project Age: ${metrics.general.projectAge}
- Recent Commits: ${metrics.activity.commitsLastMonth}
` : ''}

${diagram ? `
Architecture Diagram Available:
${diagram.description}

Include this in the architecture slide:
\`\`\`mermaid
${diagram.diagram}
\`\`\`
` : ''}

${keyPoints ? `
Key Points to Emphasize:
${keyPoints.map(p => `- ${p}`).join('\n')}
` : ''}

For each slide, provide:
1. Slide number and title
2. Content (concise bullet points)
3. Speaker notes (what to say - detailed)
4. Visual suggestion (what to show)

Guidelines:
- Keep slides visual and minimal text
- Allocate time appropriately (${(duration / 10).toFixed(1)} min per slide approx)
- Build narrative flow between slides
- End with strong call-to-action or takeaways
- ${presentationType === 'demo' ? 'Allocate 60% of time to live demo' : ''}
- ${presentationType === 'pitch' ? 'Focus on problem-solution-traction' : ''}
- ${presentationType === 'technical_review' ? 'Deep dive into architecture and design decisions' : ''}`,
            output: { schema: PresentationContentSchema },
        });

        const result = enhancedPresentation.output!;

        console.log(`✅ Generated ${result.slides.length} slides for ${duration}-minute presentation`);

        return result;
    }
);
