/**
 * @fileOverview Project Analysis Tools
 * 
 * Tools for analyzing project structure, dependencies, and code complexity
 * of software projects.
 */

import { getModel } from '@/ai/genkit';
import type { Genkit } from 'genkit';
import { z } from 'zod';
import {
  ProjectStructureSchema,
  DependencyAnalysisSchema,
  CodeComplexitySchema,
} from '@/ai/schemas/project-documentation';

// ==================== TOOL 1: Analyze Project Structure ====================

const AnalyzeProjectStructureInputSchema = z.object({
  projectPath: z.string().describe('Path to the project directory'),
  includeHidden: z.boolean().default(false).describe('Include hidden files and directories'),
  maxDepth: z.number().default(5).describe('Maximum directory depth to analyze'),
});

/**
 * Factory function to create project analysis tools
 * @param ai - The Genkit AI instance
 * @returns Object containing all project analysis tools
 */
export function createProjectAnalysisTools(ai: Genkit) {
  const analyzeProjectStructureTool = ai.defineTool(
  {
    name: 'analyzeProjectStructure',
    description: `Analyzes the file and directory structure of a project. 
    
    This tool examines the project's organization, identifies key directories and files,
    counts files by extension, and determines the project type based on structure patterns.
    
    Use this when you need to:
    - Understand project organization
    - Generate README.md structure sections
    - Create architecture documentation
    - Identify entry points and configuration files`,
    inputSchema: AnalyzeProjectStructureInputSchema,
    outputSchema: ProjectStructureSchema,
  },
  async (input) => {
    const { projectPath, includeHidden, maxDepth } = input;

    // This is a prompt-based tool that uses AI to analyze project structure
    const prompt = `Analyze the project structure at path: ${projectPath}

Instructions:
1. List all directories and their purposes (e.g., src/, tests/, docs/)
2. Count files by extension (.ts, .js, .tsx, .json, etc.)
3. Identify entry points (index.ts, main.ts, app.ts, etc.)
4. Find configuration files (package.json, tsconfig.json, etc.)
5. Determine project type based on structure patterns
6. Provide a summary of main directories with file counts

${includeHidden ? 'Include hidden files and directories (.git, .env, etc.)' : 'Exclude hidden files and directories'}
Maximum analysis depth: ${maxDepth} levels

Return a JSON object matching the ProjectStructure schema with:
- rootPath
- totalFiles
- totalDirectories
- filesByExtension (object with extension as key, count as value)
- mainDirectories (array of {name, path, fileCount, purpose})
- entryPoints (array of file paths)
- configFiles (array of file paths)
- projectType (one of: web_application, mobile_app, library, api, cli_tool, desktop_app, microservice, monorepo, other)`;

    const result = await ai.generate({
      model: await getModel('quality'),
      prompt,
      output: { schema: ProjectStructureSchema },
    });

    return result.output!;
  }
);

// ==================== TOOL 2: Extract Dependencies ====================

const ExtractDependenciesInputSchema = z.object({
  projectPath: z.string().describe('Path to the project directory'),
  analyzeOutdated: z.boolean().default(false).describe('Check for outdated dependencies'),
  categorize: z.boolean().default(true).describe('Categorize dependencies by purpose'),
});

  const extractDependenciesTool = ai.defineTool(
  {
    name: 'extractDependencies',
    description: `Extracts and analyzes project dependencies from package.json or similar files.
    
    This tool reads dependency files and categorizes dependencies by purpose
    (UI frameworks, testing tools, build tools, databases, APIs, etc.).
    
    Use this when you need to:
    - Document technology stack
    - Create dependency lists for README
    - Analyze project dependencies
    - Generate technical specifications`,
    inputSchema: ExtractDependenciesInputSchema,
    outputSchema: DependencyAnalysisSchema,
  },
  async (input) => {
    const { projectPath, analyzeOutdated, categorize } = input;

    const prompt = `Extract and analyze dependencies from the project at: ${projectPath}

Instructions:
1. Read package.json or equivalent dependency file
2. Extract dependencies, devDependencies, and peerDependencies
3. Count total dependencies
${analyzeOutdated ? '4. Check for outdated dependencies and list them with current vs latest versions' : ''}
${categorize ? `5. Categorize dependencies into:
   - ui: UI frameworks and component libraries (React, Vue, Tailwind, etc.)
   - testing: Testing frameworks and tools (Jest, Vitest, Cypress, etc.)
   - build: Build tools and bundlers (Webpack, Vite, Rollup, etc.)
   - database: Database clients and ORMs (Prisma, Mongoose, etc.)
   - api: API clients and tools (Axios, tRPC, GraphQL, etc.)
   - other: Everything else` : ''}

Return a JSON object matching the DependencyAnalysis schema with:
- packageManager (npm, yarn, pnpm, bun, or unknown)
- dependencies (object with package names as keys, versions as values)
- devDependencies (object)
- peerDependencies (object, optional)
- totalDependencies (number)
- outdatedDependencies (array, optional if analyzeOutdated is true)
- categories (object with arrays of package names)`;

    const result = await ai.generate({
      model: await getModel('quality'),
      prompt,
      output: { schema: DependencyAnalysisSchema },
    });

    return result.output!;
  }
);

// ==================== TOOL 3: Analyze Code Complexity ====================

const AnalyzeCodeComplexityInputSchema = z.object({
  projectPath: z.string().describe('Path to the project directory'),
  filePatterns: z.array(z.string()).default(['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx']).describe('File patterns to analyze'),
  includeMetrics: z.boolean().default(true).describe('Include advanced metrics (cyclomatic, halstead)'),
});

  const analyzeCodeComplexityTool = ai.defineTool(
  {
    name: 'analyzeCodeComplexity',
    description: `Analyzes code complexity metrics for the project.
    
    This tool calculates various code metrics including lines of code,
    cyclomatic complexity, cognitive complexity, and maintainability index.
    
    Use this when you need to:
    - Report on code quality
    - Identify complex files needing refactoring
    - Generate project metrics
    - Create technical debt reports`,
    inputSchema: AnalyzeCodeComplexityInputSchema,
    outputSchema: CodeComplexitySchema,
  },
  async (input) => {
    const { projectPath, filePatterns, includeMetrics } = input;

    const prompt = `Analyze code complexity for project at: ${projectPath}

File patterns to analyze: ${filePatterns.join(', ')}

Instructions:
1. Count total lines of code (LOC)
2. Separate into code lines, comment lines, and blank lines
3. Count total files
4. Calculate average lines per file
${includeMetrics ? `5. Calculate complexity metrics:
   - Cyclomatic complexity (number of decision points)
   - Cognitive complexity (how hard code is to understand)
   - Halstead metrics (volume, difficulty, effort)
   - Maintainability index (0-100 scale, higher is better)` : ''}
6. List top 10 most complex files with their metrics

Return a JSON object matching the CodeComplexity schema with:
- linesOfCode (total)
- codeLines (actual code)
- commentLines (comments)
- blankLines (empty lines)
- fileCount (number of files analyzed)
- averageLinesPerFile
- complexity (object with cyclomatic, cognitive, halstead if includeMetrics)
- fileComplexity (array of {file, lines, complexity} for top complex files)
- maintainabilityIndex (0-100, optional)`;

    const result = await ai.generate({
      model: await getModel('quality'),
      prompt,
      output: { schema: CodeComplexitySchema },
    });

    return result.output!;
  }
);

  // Return all tools
  return {
    analyzeProjectStructure: analyzeProjectStructureTool,
    extractDependencies: extractDependenciesTool,
    analyzeCodeComplexity: analyzeCodeComplexityTool,
  };
}

// Export individual tools for backward compatibility
export let analyzeProjectStructureTool: ReturnType<typeof createProjectAnalysisTools>['analyzeProjectStructure'];
export let extractDependenciesTool: ReturnType<typeof createProjectAnalysisTools>['extractDependencies'];
export let analyzeCodeComplexityTool: ReturnType<typeof createProjectAnalysisTools>['analyzeCodeComplexity'];
export let projectAnalysisTools: ReturnType<typeof createProjectAnalysisTools>;
