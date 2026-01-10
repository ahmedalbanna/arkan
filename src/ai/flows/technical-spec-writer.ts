/**
 * @fileOverview Technical Specification Writer Flow
 *
 * Generates detailed technical specification documents for
 * new features, system architecture, and design decisions.
 */

import { ai } from '@/ai/genkit';
import { technicalSpecPrompt } from '@/ai/prompts/project-documentation';
import {
    TechnicalSpecificationSchema,
} from '@/ai/schemas/project-documentation';
import {
    analyzeCodeComplexityTool,
    analyzeProjectStructureTool,
    extractDependenciesTool,
} from '@/ai/tools/project-analysis';
import {
    generateArchitectureDiagramTool,
} from '@/ai/tools/reporting-and-metrics';

// ==================== INPUT/OUTPUT SCHEMAS ====================

const TechnicalSpecInputSchema = ai.z.object({
    projectPath: ai.z.string().describe('Path to the project'),
    projectName: ai.z.string().describe('Project name'),
    projectType: ai.z.string().describe('Type of project (web app, API, library, etc.)'),
    featureName: ai.z.string().optional().describe('Specific feature to document'),
    architecture: ai.z.string().optional().describe('Architecture description'),
    components: ai.z.array(ai.z.string()).optional().describe('Main components to document'),
    dataModels: ai.z.string().optional().describe('Data models description'),
    securityRequirements: ai.z.array(ai.z.string()).optional().describe('Security requirements'),
    performanceGoals: ai.z.array(ai.z.string()).optional().describe('Performance goals'),
    includeArchitectureDiagram: ai.z.boolean().default(true).describe('Include architecture diagram'),
    includeCodeMetrics: ai.z.boolean().default(true).describe('Include code complexity metrics'),
    includeDataFlow: ai.z.boolean().default(true).describe('Include data flow diagrams'),
    targetAudience: ai.z.enum(['developers', 'architects', 'stakeholders']).default('developers'),
});

export const technicalSpecificationWriter = ai.defineFlow(
    {
        name: 'technicalSpecificationWriter',
        inputSchema: TechnicalSpecInputSchema,
        outputSchema: TechnicalSpecificationSchema,
    },
    async (input) => {
        const {
            projectPath,
            projectName,
            projectType,
            featureName,
            includeArchitectureDiagram,
            includeCodeMetrics,
            targetAudience,
        } = input;

        console.log(`📐 Generating technical specification for: ${featureName || projectName}`);

        // Step 1: Analyze project structure
        console.log('📊 Step 1/5: Analyzing project structure...');
        const projectStructure = await analyzeProjectStructureTool({
            projectPath,
            includeHidden: false,
            maxDepth: 5,
        });

        // Step 2: Extract dependencies for tech stack
        console.log('📦 Step 2/5: Extracting technology stack...');
        const dependencies = await extractDependenciesTool({
            projectPath,
            analyzeOutdated: false,
            categorize: true,
        });

        // Step 3: Analyze code complexity (if requested)
        let codeMetrics;
        if (includeCodeMetrics) {
            console.log('📈 Step 3/5: Analyzing code complexity...');
            codeMetrics = await analyzeCodeComplexityTool({
                projectPath,
                filePatterns: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
                includeMetrics: true,
            });
        }

        // Step 4: Generate architecture diagram (if requested)
        let architectureDiagram;
        if (includeArchitectureDiagram) {
            console.log('🏗️ Step 4/5: Generating architecture diagram...');
            architectureDiagram = await generateArchitectureDiagramTool({
                projectPath,
                diagramType: 'component',
                includeDetails: true,
                style: 'technical',
            });
        }

        // Step 5: Generate technical specification
        console.log('📝 Step 5/5: Generating technical specification...');

        const techSpecPromptResult = await technicalSpecPrompt({
            projectName: featureName || projectName,
            projectType,
            architecture: input.architecture,
            components: input.components,
            dataModels: input.dataModels,
            securityRequirements: input.securityRequirements,
            performanceGoals: input.performanceGoals,
        });

        // Generate comprehensive technical specification
        const finalSpec = await ai.generate({
            model: 'ollama/gemma:2b',
            prompt: `Create a comprehensive technical specification document.

Target Audience: ${targetAudience}

Base Specification:
${techSpecPromptResult.text}

Project Context:
- Name: ${projectName}
- Type: ${projectType}
${featureName ? `- Feature: ${featureName}` : ''}

Project Structure:
- Type: ${projectStructure.projectType}
- Total Files: ${projectStructure.totalFiles}
- Main Components: ${projectStructure.mainDirectories.length}
- Entry Points: ${projectStructure.entryPoints.join(', ')}

Technology Stack:
Frontend: ${dependencies.categories.ui.join(', ') || 'N/A'}
Backend/API: ${dependencies.categories.api.join(', ') || 'N/A'}
Database: ${dependencies.categories.database.join(', ') || 'N/A'}
Testing: ${dependencies.categories.testing.join(', ') || 'N/A'}
Build Tools: ${dependencies.categories.build.join(', ') || 'N/A'}

${codeMetrics ? `
Code Metrics:
- Lines of Code: ${codeMetrics.linesOfCode.toLocaleString()}
- Total Files: ${codeMetrics.fileCount}
- Average Lines per File: ${codeMetrics.averageLinesPerFile.toFixed(0)}
- Maintainability Index: ${codeMetrics.maintainabilityIndex || 'N/A'}
- Code/Comment Ratio: ${((codeMetrics.codeLines / (codeMetrics.codeLines + codeMetrics.commentLines)) * 100).toFixed(1)}%
` : ''}

${architectureDiagram ? `
System Architecture:
${architectureDiagram.description}

Architecture Diagram (Mermaid):
\`\`\`mermaid
${architectureDiagram.diagram}
\`\`\`

Components Identified:
${architectureDiagram.components.map(c => `- ${c.name} (${c.type}): ${c.description}`).join('\n')}

Design Patterns:
${architectureDiagram.designPatterns?.join(', ') || 'Not specified'}
` : ''}

Create a detailed technical specification with:

## 1. Executive Summary
- Overview of ${featureName || projectName}
- Key objectives
- Scope and boundaries
- Success criteria

## 2. System Architecture
- High-level architecture
- Component diagram
- Design patterns used
- Architectural decisions and rationale

## 3. Component Design
For each major component:
- Purpose and responsibilities
- Interfaces and APIs
- Dependencies
- Technology choices
- Implementation details

## 4. Data Architecture
- Data models and schemas
- Database design
- Data flow diagrams
- Caching strategy
- Data validation rules

## 5. API Design
- Endpoints specification
- Request/response formats
- Authentication/authorization
- Error handling
- Rate limiting

## 6. Security Considerations
- Authentication mechanisms
- Authorization strategies
- Data encryption
- Input validation
- Security best practices
- Threat model

## 7. Performance Requirements
- Response time targets
- Throughput requirements
- Scalability considerations
- Load testing strategy
- Performance optimization techniques

## 8. Quality Attributes
- Maintainability
- Testability
- Reliability
- Scalability
- Extensibility

## 9. Technology Stack
- Languages and frameworks
- Libraries and dependencies
- Development tools
- Infrastructure

## 10. Deployment Strategy
- Deployment architecture
- CI/CD pipeline
- Environment configurations
- Monitoring and logging
- Rollback procedures

## 11. Testing Strategy
- Unit testing approach
- Integration testing
- End-to-end testing
- Performance testing
- Security testing

## 12. Appendices
- Glossary
- References
- Code examples
- Configuration samples

Format: Professional technical documentation with proper headings, diagrams, and code examples.
Style: ${targetAudience === 'developers' ? 'Technical and detailed' : targetAudience === 'architects' ? 'Architecture-focused with design decisions' : 'High-level with business context'}`,
            output: { schema: TechnicalSpecificationSchema },
        });

        console.log('✅ Technical specification generated successfully!');

        return finalSpec.output!;
    }
);
