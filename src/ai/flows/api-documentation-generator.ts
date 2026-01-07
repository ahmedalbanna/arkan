/**
 * @fileOverview API Documentation Generator Flow
 * 
 * Generates comprehensive API reference documentation from source code
 * with examples, authentication details, and error handling.
 */

import { ai } from '@/ai/genkit';
import {
  ApiDocumentationSchema,
  CitationStyleSchema,
} from '@/ai/schemas/project-documentation';
import {
  generateAPIReferenceTool,
  formatCodeExamplesTool,
} from '@/ai/tools/documentation-generation';
import { analyzeProjectStructureTool } from '@/ai/tools/project-analysis';
import { apiDocumentationPrompt } from '@/ai/prompts/project-documentation';

// ==================== INPUT/OUTPUT SCHEMAS ====================

const ApiDocGeneratorInputSchema = ai.z.object({
  projectPath: ai.z.string().describe('Path to the project'),
  sourcePath: ai.z.string().default('src/api').describe('Path to API source files'),
  apiName: ai.z.string().describe('API name'),
  apiVersion: ai.z.string().default('1.0.0').describe('API version'),
  baseUrl: ai.z.string().optional().describe('API base URL'),
  format: ai.z.enum(['rest', 'graphql', 'grpc']).default('rest').describe('API format'),
  outputFormat: ai.z.enum(['markdown', 'openapi', 'html']).default('markdown').describe('Output format'),
  includeExamples: ai.z.boolean().default(true).describe('Include code examples'),
  includeAuthentication: ai.z.boolean().default(true).describe('Document authentication'),
  language: ai.z.string().default('typescript').describe('Programming language'),
  authMethod: ai.z.string().optional().describe('Authentication method (JWT, OAuth, API Key, etc.)'),
});

export const apiDocumentationGenerator = ai.defineFlow(
  {
    name: 'apiDocumentationGenerator',
    inputSchema: ApiDocGeneratorInputSchema,
    outputSchema: ApiDocumentationSchema,
  },
  async (input) => {
    const {
      projectPath,
      sourcePath,
      apiName,
      apiVersion,
      baseUrl,
      format,
      outputFormat,
      includeExamples,
      language,
      authMethod,
    } = input;

    console.log(`📚 Generating ${format.toUpperCase()} API documentation for: ${apiName} v${apiVersion}`);

    // Step 1: Analyze project structure to find API files
    console.log('📊 Step 1/4: Analyzing API structure...');
    const projectStructure = await analyzeProjectStructureTool({
      projectPath: `${projectPath}/${sourcePath}`,
      includeHidden: false,
      maxDepth: 4,
    });

    // Step 2: Generate base API reference
    console.log('🔌 Step 2/4: Generating API reference...');
    const apiReference = await generateAPIReferenceTool({
      sourcePath: `${projectPath}/${sourcePath}`,
      format: outputFormat,
      includeExamples,
      language,
    });

    // Step 3: Generate API documentation prompt
    console.log('📝 Step 3/4: Enhancing with structured documentation...');
    
    const apiPromptResult = await apiDocumentationPrompt({
      apiName,
      apiVersion,
      baseUrl,
      format,
      authMethod,
      endpoints: apiReference.endpoints.map(e => ({
        method: e.method,
        path: e.path,
        description: e.description,
      })),
    });

    // Step 4: Generate code examples for common use cases
    let enhancedExamples: string[] = [];
    if (includeExamples) {
      console.log('💻 Step 4/4: Generating code examples...');
      
      const exampleEndpoint = apiReference.endpoints[0];
      if (exampleEndpoint) {
        const exampleCode = `// ${exampleEndpoint.method} ${exampleEndpoint.path}
const response = await fetch('${baseUrl || 'https://api.example.com'}${exampleEndpoint.path}', {
  method: '${exampleEndpoint.method}',
  headers: {
    'Content-Type': 'application/json',
    ${authMethod ? `'Authorization': 'Bearer YOUR_TOKEN'` : ''}
  },
  ${exampleEndpoint.method !== 'GET' ? `body: JSON.stringify({
    // Request body
  })` : ''}
});

const data = await response.json();
console.log(data);`;

        const formatted = await formatCodeExamplesTool({
          code: exampleCode,
          language: 'javascript',
          addComments: true,
          style: 'tutorial',
        });

        enhancedExamples.push(formatted.formattedCode);
      }
    }

    // Combine all documentation
    const finalDoc = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt: `Create comprehensive API documentation for ${apiName} v${apiVersion}.

Base Documentation:
${apiPromptResult.text}

API Reference Data:
${JSON.stringify(apiReference, null, 2)}

Project Structure:
- API Files: ${projectStructure.totalFiles}
- Endpoints Detected: ${apiReference.endpoints.length}

${enhancedExamples.length > 0 ? `
Code Examples:
${enhancedExamples.map(ex => '```javascript\n' + ex + '\n```').join('\n\n')}
` : ''}

Create a complete API documentation with:

1. **Overview**
   - What the API does
   - Key features
   - Base URL: ${baseUrl || 'To be configured'}

2. **Getting Started**
   - Prerequisites
   - Authentication setup
   - First API call example

3. **Authentication**
   ${authMethod ? `- Method: ${authMethod}` : '- API Key / OAuth / JWT'}
   - How to authenticate
   - Security best practices

4. **Endpoints Reference**
   For each endpoint (${apiReference.endpoints.length} total):
   - HTTP Method and Path
   - Description
   - Parameters (path, query, body)
   - Request example
   - Response format
   - Status codes
   - Error responses

5. **Error Handling**
   - Error response format
   - Common error codes
   - Troubleshooting

6. **Rate Limiting**
   - Request limits
   - Headers
   - Handling rate limits

7. **Code Examples**
   - JavaScript/TypeScript
   - cURL commands
   - Common use cases

8. **Changelog**
   - Current version: ${apiVersion}
   - Recent changes
   - Deprecations

Format as clean markdown with proper code blocks and examples.`,
      output: { schema: ApiDocumentationSchema },
    });

    console.log(`✅ API documentation generated with ${apiReference.endpoints.length} endpoints!`);

    return finalDoc.output!;
  }
);
