/**
 * @fileOverview README Generator Flow
 * 
 * Specialized flow for generating professional README.md files
 * with badges, installation instructions, and usage examples.
 */

import { ai, getModel } from '@/ai/genkit';
import {
  ReadmeOutputSchema,
  DocumentTemplateTypeSchema,
} from '@/ai/schemas/project-documentation';
import {
  analyzeProjectStructureTool,
  extractDependenciesTool,
} from '@/ai/tools/project-analysis';
import {
  generateTableOfContentsTool,
  formatCodeExamplesTool,
} from '@/ai/tools/documentation-generation';
import { readmeGenerationPrompt } from '@/ai/prompts/project-documentation';

// ==================== INPUT/OUTPUT SCHEMAS ====================

const ReadmeGeneratorInputSchema = ai.z.object({
  projectPath: ai.z.string().describe('Path to the project directory'),
  projectName: ai.z.string().describe('Project name'),
  description: ai.z.string().describe('Project description'),
  template: DocumentTemplateTypeSchema.default('comprehensive').describe('README template style'),
  includeBadges: ai.z.boolean().default(true).describe('Include status badges'),
  includeInstallation: ai.z.boolean().default(true).describe('Include installation section'),
  includeUsageExamples: ai.z.boolean().default(true).describe('Include usage examples'),
  includeContributing: ai.z.boolean().default(true).describe('Include contributing guidelines'),
  includeLicense: ai.z.boolean().default(true).describe('Include license information'),
  licenseType: ai.z.string().default('MIT').describe('License type'),
  repositoryUrl: ai.z.string().optional().describe('GitHub/GitLab repository URL'),
  authorName: ai.z.string().optional().describe('Author or organization name'),
});

export const readmeGenerator = ai.defineFlow(
  {
    name: 'readmeGenerator',
    inputSchema: ReadmeGeneratorInputSchema,
    outputSchema: ReadmeOutputSchema,
  },
  async (input) => {
    const {
      projectPath,
      projectName,
      description,
      template,
      includeBadges,
      includeInstallation,
      includeUsageExamples,
      repositoryUrl,
      authorName,
      licenseType,
    } = input;

    console.log(`📝 Generating ${template} README for: ${projectName}`);

    // Step 1: Analyze project structure
    console.log('📊 Step 1/4: Analyzing project structure...');
    const projectStructure = await analyzeProjectStructureTool({
      projectPath,
      includeHidden: false,
      maxDepth: 3,
    });

    // Step 2: Extract dependencies
    console.log('📦 Step 2/4: Extracting dependencies...');
    const dependencies = await extractDependenciesTool({
      projectPath,
      analyzeOutdated: false,
      categorize: true,
    });

    // Step 3: Generate base README content
    console.log('✍️ Step 3/4: Generating README content...');
    
    const features = projectStructure.mainDirectories
      .map(dir => `${dir.name} - ${dir.purpose || 'Core functionality'}`)
      .slice(0, 5);

    const techStack = [
      ...dependencies.categories.ui,
      ...dependencies.categories.api,
      ...dependencies.categories.database,
    ].slice(0, 10);

    const readmePromptResult = await readmeGenerationPrompt({
      projectName,
      description,
      features,
      techStack,
      template: template === 'minimal' ? 'minimal' : template === 'comprehensive' ? 'comprehensive' : 'standard',
    });

    // Step 4: Enhance with code examples (if requested)
    let usageExamples = '';
    if (includeUsageExamples) {
      console.log('💻 Step 4/4: Formatting code examples...');
      
      // Find entry point for code example
      const entryPoint = projectStructure.entryPoints[0] || 'index.ts';
      
      const exampleCode = `import { ${projectName.replace(/[^a-zA-Z]/g, '')} } from '${projectName}';

// Initialize
const app = new ${projectName.replace(/[^a-zA-Z]/g, '')}();

// Basic usage
app.start();`;

      const formattedExample = await formatCodeExamplesTool({
        code: exampleCode,
        language: 'typescript',
        addComments: true,
        style: 'detailed',
      });

      usageExamples = formattedExample.formattedCode;
    }

    // Build comprehensive README
    const readmeContent = await ai.generate({
      model: await getModel('quality'),
      prompt: `Create a professional README.md for ${projectName}.

Base Content:
${readmePromptResult.text}

Project Details:
- Type: ${projectStructure.projectType}
- Total Files: ${projectStructure.totalFiles}
- Package Manager: ${dependencies.packageManager}
- Main Entry: ${projectStructure.entryPoints[0] || 'Not detected'}

${includeBadges ? `
Add badges at the top:
- Build status
- Version
- License (${licenseType})
- Dependencies status
${repositoryUrl ? `- Use repository: ${repositoryUrl}` : ''}
` : ''}

${includeInstallation ? `
Installation Section:
Show installation commands for ${dependencies.packageManager}:
\`\`\`bash
${dependencies.packageManager === 'npm' ? 'npm install' : dependencies.packageManager === 'yarn' ? 'yarn install' : dependencies.packageManager === 'pnpm' ? 'pnpm install' : 'npm install'} ${projectName.toLowerCase()}
\`\`\`
` : ''}

${includeUsageExamples && usageExamples ? `
Usage Examples:
Include this formatted example:
\`\`\`typescript
${usageExamples}
\`\`\`
` : ''}

Technology Stack to highlight:
${techStack.join(', ')}

${input.includeContributing ? `
Contributing Section:
- How to contribute
- Code style guidelines
- Pull request process
- Issue reporting
` : ''}

${input.includeLicense ? `
License:
${licenseType} License
${authorName ? `© ${new Date().getFullYear()} ${authorName}` : ''}
` : ''}

Create a well-structured, professional README that:
1. Uses clear markdown formatting
2. Has proper heading hierarchy
3. Includes a table of contents for comprehensive template
4. Uses code blocks with proper syntax highlighting
5. Has clear sections with emojis for visual appeal
6. Includes helpful links and references

Return as a complete markdown document.`,
    });

    // Generate table of contents (for comprehensive template)
    let tableOfContents = '';
    if (template === 'comprehensive') {
      const toc = await generateTableOfContentsTool({
        content: readmeContent.text,
        maxDepth: 3,
        style: 'bullets',
      });
      tableOfContents = toc.toc;
    }

    console.log('✅ README.md generated successfully!');

    return {
      title: projectName,
      badges: includeBadges ? [
        `![Build Status](https://img.shields.io/badge/build-passing-brightgreen)`,
        `![Version](https://img.shields.io/badge/version-1.0.0-blue)`,
        `![License](https://img.shields.io/badge/license-${licenseType}-green)`,
      ] : [],
      description,
      features,
      installation: includeInstallation ? `Using ${dependencies.packageManager}:

\`\`\`bash
${dependencies.packageManager} install ${projectName.toLowerCase()}
\`\`\`` : 'See documentation',
      usage: usageExamples || 'See examples directory',
      fullContent: tableOfContents ? 
        `# ${projectName}\n\n${tableOfContents}\n\n${readmeContent.text}` : 
        readmeContent.text,
    };
  }
);
