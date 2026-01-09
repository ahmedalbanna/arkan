/**
 * @fileOverview Documentation Generation Tools
 * 
 * Tools for generating various types of documentation including
 * API references, user guides, code examples, and table of contents.
 */

import { getModel } from '@/ai/genkit';
import type { Genkit } from 'genkit';
import { z } from 'genkit';
import {
  ApiDocumentationSchema,
  ReadmeOutputSchema,
} from '@/ai/schemas/project-documentation';

// ==================== TOOL 5: Generate API Reference ====================

const GenerateAPIReferenceInputSchema = z.object({
  sourcePath: z.string().describe('Path to API source files'),
  format: z.enum(['markdown', 'openapi', 'html']).default('markdown').describe('Output format'),
  includeExamples: z.boolean().default(true).describe('Include usage examples'),
  language: z.string().default('typescript').describe('Programming language'),
});

/**
 * Factory function to create documentation generation tools
 * @param ai - The Genkit AI instance
 * @returns Object containing all documentation generation tools
 */
export function createDocumentationGenerationTools(ai: Genkit) {
  const generateAPIReferenceTool = ai.defineTool(
  {
    name: 'generateAPIReference',
    description: `Generates comprehensive API reference documentation from source code.
    
    This tool analyzes API endpoints, functions, classes, and methods to create
    complete reference documentation with parameters, return types, and examples.
    
    Use this when you need to:
    - Document REST APIs
    - Create function/method references
    - Generate OpenAPI specifications
    - Build developer documentation`,
    inputSchema: GenerateAPIReferenceInputSchema,
    outputSchema: ApiDocumentationSchema,
  },
  async (input) => {
    const { sourcePath, format, includeExamples, language } = input;

    const prompt = `Generate API reference documentation from source code at: ${sourcePath}

Language: ${language}
Output Format: ${format}
Include Examples: ${includeExamples}

Instructions:
1. Analyze all exported functions, classes, and API endpoints
2. Extract documentation from comments (JSDoc, TSDoc, etc.)
3. For each API endpoint/function, document:
   - HTTP method and path (for REST APIs)
   - Description and purpose
   - Parameters (name, type, required/optional, description)
   - Response types and status codes
   - Error handling
${includeExamples ? '   - Usage examples with sample requests/responses' : ''}
4. Group endpoints by resource or module
5. Include authentication requirements if applicable
6. Add rate limiting information if applicable

Return a JSON object matching the ApiDocumentation schema with:
- title (API name)
- version (API version)
- baseUrl (base URL for API, optional)
- authentication (auth method description, optional)
- endpoints (array of endpoint objects with method, path, description, parameters, responses, example)
- fullContent (complete markdown documentation)`;

    const result = await ai.generate({
      model: await getModel('quality'),
      prompt,
      output: { schema: ApiDocumentationSchema },
    });

    return result.output!;
  }
);

// ==================== TOOL 6: Create User Guide ====================

const CreateUserGuideInputSchema = z.object({
  projectPath: z.string().describe('Path to the project'),
  targetAudience: z.string().default('end-users').describe('Target audience for the guide'),
  includeScreenshots: z.boolean().default(false).describe('Include placeholder text for screenshots'),
  sections: z.array(z.string()).optional().describe('Specific sections to include'),
});

const UserGuideOutputSchema = z.object({
  title: z.string(),
  introduction: z.string(),
  gettingStarted: z.string(),
  features: z.array(z.object({
    title: z.string(),
    description: z.string(),
    steps: z.array(z.string()),
    screenshotPlaceholder: z.string().optional(),
  })),
  troubleshooting: z.array(z.object({
    problem: z.string(),
    solution: z.string(),
  })),
  faq: z.array(z.object({
    question: z.string(),
    answer: z.string(),
  })),
  fullContent: z.string(),
});

  const createUserGuideTool = ai.defineTool(
  {
    name: 'createUserGuide',
    description: `Creates user-friendly guide documentation for end-users or developers.
    
    This tool generates step-by-step guides with clear instructions,
    troubleshooting sections, and FAQs tailored to the target audience.
    
    Use this when you need to:
    - Create end-user documentation
    - Build onboarding guides
    - Document workflows
    - Create training materials`,
    inputSchema: CreateUserGuideInputSchema,
    outputSchema: UserGuideOutputSchema,
  },
  async (input) => {
    const { projectPath, targetAudience, includeScreenshots, sections } = input;

    const prompt = `Create a comprehensive user guide for the project at: ${projectPath}

Target Audience: ${targetAudience}
${includeScreenshots ? 'Include placeholders for screenshots at relevant steps' : ''}
${sections ? `Focus on these sections: ${sections.join(', ')}` : 'Include all standard sections'}

Instructions:
1. Write a clear introduction explaining what the software does
2. Create a "Getting Started" section with installation/setup steps
3. Document key features with step-by-step instructions:
   - Feature name
   - Description
   - Numbered steps to use the feature
   ${includeScreenshots ? '- Screenshot placeholders (e.g., "[Screenshot: Dashboard view]")' : ''}
4. Add a troubleshooting section with common problems and solutions
5. Include an FAQ section with anticipated questions
6. Use simple, clear language appropriate for ${targetAudience}
7. Add tips and best practices where relevant

Return a JSON object with:
- title
- introduction
- gettingStarted (markdown text)
- features (array of feature objects)
- troubleshooting (array of problem/solution pairs)
- faq (array of question/answer pairs)
- fullContent (complete markdown guide)`;

    const result = await ai.generate({
      model: await getModel('quality'),
      prompt,
      output: { schema: UserGuideOutputSchema },
    });

    return result.output!;
  }
);

// ==================== TOOL 7: Format Code Examples ====================

const FormatCodeExamplesInputSchema = z.object({
  code: z.string().describe('Raw code to format'),
  language: z.string().describe('Programming language'),
  addComments: z.boolean().default(true).describe('Add explanatory comments'),
  style: z.enum(['minimal', 'detailed', 'tutorial']).default('detailed').describe('Example style'),
});

const FormattedCodeSchema = z.object({
  formattedCode: z.string(),
  explanation: z.string(),
  highlights: z.array(z.string()),
  bestPractices: z.array(z.string()).optional(),
});

  const formatCodeExamplesTool = ai.defineTool(
  {
    name: 'formatCodeExamples',
    description: `Formats and enhances code examples with comments and explanations.
    
    This tool takes raw code and transforms it into well-documented examples
    suitable for tutorials, documentation, or blog posts.
    
    Use this when you need to:
    - Document code examples
    - Create tutorials
    - Explain code functionality
    - Add inline documentation`,
    inputSchema: FormatCodeExamplesInputSchema,
    outputSchema: FormattedCodeSchema,
  },
  async (input) => {
    const { code, language, addComments, style } = input;

    const prompt = `Format and enhance this ${language} code example:

\`\`\`${language}
${code}
\`\`\`

Style: ${style}
Add Comments: ${addComments}

Instructions:
1. Format the code with proper indentation and spacing
${addComments ? '2. Add inline comments explaining key parts' : ''}
3. Write a brief explanation of what the code does
4. Highlight important concepts or patterns used
5. ${style === 'tutorial' ? 'Break down the code step-by-step for beginners' : style === 'detailed' ? 'Provide comprehensive explanations' : 'Keep it concise'}
6. If applicable, mention best practices demonstrated

Return a JSON object with:
- formattedCode (cleaned and commented code)
- explanation (what the code does)
- highlights (array of key concepts)
- bestPractices (array of best practices, optional)`;

    const result = await ai.generate({
      model: await getModel('quality'),
      prompt,
      output: { schema: FormattedCodeSchema },
    });

    return result.output!;
  }
);

// ==================== TOOL 8: Generate Table of Contents ====================

const GenerateTOCInputSchema = z.object({
  content: z.string().describe('Markdown content to generate TOC for'),
  maxDepth: z.number().default(3).describe('Maximum heading depth to include'),
  style: z.enum(['bullets', 'numbered', 'tree']).default('bullets').describe('TOC style'),
});

const TableOfContentsSchema = z.object({
  toc: z.string(),
  structure: z.array(z.object({
    level: z.number(),
    title: z.string(),
    anchor: z.string(),
  })),
});

  const generateTableOfContentsTool = ai.defineTool(
  {
    name: 'generateTableOfContents',
    description: `Generates a table of contents from markdown content.
    
    This tool parses markdown headings and creates a navigable table of contents
    with anchor links.
    
    Use this when you need to:
    - Create documentation navigation
    - Generate README TOC
    - Build document structure
    - Improve document accessibility`,
    inputSchema: GenerateTOCInputSchema,
    outputSchema: TableOfContentsSchema,
  },
  async (input) => {
    const { content, maxDepth, style } = input;

    const prompt = `Generate a table of contents from this markdown content:

${content.substring(0, 5000)}${content.length > 5000 ? '\n...(content truncated)' : ''}

Maximum Depth: ${maxDepth} (only include h1-h${maxDepth})
Style: ${style}

Instructions:
1. Extract all headings (# heading syntax) up to depth ${maxDepth}
2. Create anchor links (lowercase, spaces to dashes, special chars removed)
3. Format as ${style === 'bullets' ? 'bullet list' : style === 'numbered' ? 'numbered list' : 'tree structure'}
4. Indent sub-headings appropriately
5. Include clickable links to each section

Return a JSON object with:
- toc (formatted table of contents as markdown string)
- structure (array of heading objects with level, title, anchor)`;

    const result = await ai.generate({
      model: await getModel('quality'),
      prompt,
      output: { schema: TableOfContentsSchema },
    });

    return result.output!;
  }
);

  // Return all tools
  return {
    generateAPIReference: generateAPIReferenceTool,
    createUserGuide: createUserGuideTool,
    formatCodeExamples: formatCodeExamplesTool,
    generateTableOfContents: generateTableOfContentsTool,
  };
}

// Export individual tools for backward compatibility
export let generateAPIReferenceTool: ReturnType<typeof createDocumentationGenerationTools>['generateAPIReference'];
export let createUserGuideTool: ReturnType<typeof createDocumentationGenerationTools>['createUserGuide'];
export let formatCodeExamplesTool: ReturnType<typeof createDocumentationGenerationTools>['formatCodeExamples'];
export let generateTableOfContentsTool: ReturnType<typeof createDocumentationGenerationTools>['generateTableOfContents'];
export let documentationGenerationTools: ReturnType<typeof createDocumentationGenerationTools>;
