/**
 * @fileOverview Project Documentation Generator Flow
 *
 * Comprehensive flow for generating complete project documentation packages
 * including README, API docs, user guide, and architecture diagrams.
 */

import { ai } from '@/ai/genkit';
import { readmeGenerationPrompt } from '@/ai/prompts/project-documentation';
import {
  ProjectDataSchema,
  ReadmeOutputSchema
} from '@/ai/schemas/project-documentation';
import {
  createUserGuideTool,
  generateAPIReferenceTool
} from '@/ai/tools/documentation-generation';
import {
  analyzeProjectStructureTool,
  extractDependenciesTool,
} from '@/ai/tools/project-analysis';
import {
  generateArchitectureDiagramTool,
} from '@/ai/tools/reporting-and-metrics';

// ==================== INPUT/OUTPUT SCHEMAS ====================

const ProjectDocumentationInputSchema = ProjectDataSchema.extend({
  projectPath: ai.z.string().describe('Path to the project directory'),
  includeREADME: ai.z.boolean().default(true).describe('Generate README.md'),
  includeAPIReference: ai.z.boolean().default(true).describe('Generate API documentation'),
  includeUserGuide: ai.z.boolean().default(true).describe('Generate user guide'),
  includeArchitecture: ai.z.boolean().default(true).describe('Generate architecture diagrams'),
  template: ai.z.enum(['minimal', 'standard', 'comprehensive']).default('standard'),
});

const ProjectDocumentationOutputSchema = ai.z.object({
  readme: ReadmeOutputSchema.optional(),
  apiDocumentation: ai.z.string().optional(),
  userGuide: ai.z.string().optional(),
  architectureDiagram: ai.z.string().optional(),
  projectStructure: ai.z.string(),
  dependencies: ai.z.string(),
  summary: ai.z.string(),
  fullDocumentationPackage: ai.z.string(),
});

// ==================== MAIN FLOW ====================

export const projectDocumentationGenerator = ai.defineFlow(
  {
    name: 'projectDocumentationGenerator',
    inputSchema: ProjectDocumentationInputSchema,
    outputSchema: ProjectDocumentationOutputSchema,
  },
  async (input) => {
    const {
      projectPath,
      includeREADME,
      includeAPIReference,
      includeUserGuide,
      includeArchitecture,
      template,
      projectName,
      projectDescription,
    } = input;

    console.log(`🚀 Starting documentation generation for: ${projectName}`);

    // Step 1: Analyze project structure
    console.log('📊 Step 1/5: Analyzing project structure...');
    const projectStructure = await analyzeProjectStructureTool({
      projectPath,
      includeHidden: false,
      maxDepth: 5,
    });

    // Step 2: Extract dependencies
    console.log('📦 Step 2/5: Extracting dependencies...');
    const dependencies = await extractDependenciesTool({
      projectPath,
      analyzeOutdated: false,
      categorize: true,
    });

    const results: any = {
      projectStructure: JSON.stringify(projectStructure, null, 2),
      dependencies: JSON.stringify(dependencies, null, 2),
    };

    // Step 3: Generate README (if requested)
    if (includeREADME) {
      console.log('📝 Step 3/5: Generating README.md...');

      const techStack = [
        ...dependencies.categories.ui,
        ...dependencies.categories.api,
        ...dependencies.categories.build,
      ].slice(0, 10);

      const readmeResult = await readmeGenerationPrompt({
        projectName,
        description: projectDescription,
        features: input.behaviors || [],
        techStack,
        template,
      });

      results.readme = {
        title: projectName,
        description: projectDescription,
        fullContent: readmeResult.text,
      };
    }

    // Step 4: Generate API Reference (if requested)
    if (includeAPIReference) {
      console.log('🔌 Step 4/5: Generating API documentation...');

      const apiDocs = await generateAPIReferenceTool({
        sourcePath: `${projectPath}/src`,
        format: 'markdown',
        includeExamples: true,
        language: input.programmingLanguage || 'typescript',
      });

      results.apiDocumentation = apiDocs.fullContent;
    }

    // Step 5: Generate User Guide (if requested)
    if (includeUserGuide) {
      console.log('📖 Step 5/5: Generating user guide...');

      const userGuide = await createUserGuideTool({
        projectPath,
        targetAudience: input.audienceLevel || 'Professional',
        includeScreenshots: true,
      });

      results.userGuide = userGuide.fullContent;
    }

    // Step 6: Generate Architecture Diagram (if requested)
    if (includeArchitecture) {
      console.log('🏗️ Generating architecture diagram...');

      const archDiagram = await generateArchitectureDiagramTool({
        projectPath,
        diagramType: input.diagramType || 'component',
        includeDetails: true,
        style: 'detailed',
      });

      results.architectureDiagram = archDiagram.diagram;
    }

    // Generate summary
    console.log('✅ Finalizing documentation package...');

    const summary = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt: `Create a brief summary of the generated documentation package for ${projectName}.

Project Description: ${projectDescription}
Components Generated:
${includeREADME ? '- ✅ README.md' : ''}
${includeAPIReference ? '- ✅ API Documentation' : ''}
${includeUserGuide ? '- ✅ User Guide' : ''}
${includeArchitecture ? '- ✅ Architecture Diagram' : ''}

Write a 2-3 sentence summary highlighting what was generated and its purpose.`,
    });

    results.summary = summary.text;

    // Create full documentation package markdown
    const packageParts: string[] = [];

    packageParts.push(`# ${projectName} - Complete Documentation Package\n`);
    packageParts.push(`Generated: ${new Date().toISOString()}\n`);
    packageParts.push(`---\n\n`);

    if (results.readme) {
      packageParts.push(`## README.md\n\n${results.readme.fullContent}\n\n---\n\n`);
    }

    if (results.apiDocumentation) {
      packageParts.push(`## API Documentation\n\n${results.apiDocumentation}\n\n---\n\n`);
    }

    if (results.userGuide) {
      packageParts.push(`## User Guide\n\n${results.userGuide}\n\n---\n\n`);
    }

    if (results.architectureDiagram) {
      packageParts.push(`## Architecture\n\n\`\`\`mermaid\n${results.architectureDiagram}\n\`\`\`\n\n---\n\n`);
    }

    packageParts.push(`## Project Structure\n\n\`\`\`json\n${results.projectStructure}\n\`\`\`\n\n`);
    packageParts.push(`## Dependencies\n\n\`\`\`json\n${results.dependencies}\n\`\`\`\n`);

    results.fullDocumentationPackage = packageParts.join('');

    console.log('🎉 Documentation generation complete!');

    return results;
  }
);
