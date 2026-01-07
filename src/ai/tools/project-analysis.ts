/**
 * @fileOverview Project Analysis Tools
 * 
 * Tools for analyzing project structure, dependencies, code complexity,
 * and other technical aspects of software projects.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import {
  ProjectStructureSchema,
  DependencyAnalysisSchema,
  CodeComplexitySchema,
  GitHistorySchema,
} from '@/ai/schemas/project-documentation';

// ==================== TOOL 1: Analyze Project Structure ====================

const AnalyzeProjectStructureInputSchema = z.object({
  projectPath: z.string().describe('Path to the project directory'),
  includeHidden: z.boolean().default(false).describe('Include hidden files and directories'),
  maxDepth: z.number().default(5).describe('Maximum directory depth to analyze'),
});

export const analyzeProjectStructureTool = ai.defineTool(
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
      model: 'googleai/gemini-2.0-flash-exp',
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

export const extractDependenciesTool = ai.defineTool(
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
      model: 'googleai/gemini-2.0-flash-exp',
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

export const analyzeCodeComplexityTool = ai.defineTool(
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
   - Maintainability index (0-100 scale)` : ''}
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
      model: 'googleai/gemini-2.0-flash-exp',
      prompt,
      output: { schema: CodeComplexitySchema },
    });

    return result.output!;
  }
);

// ==================== TOOL 4: Analyze Git History ====================

const AnalyzeGitHistoryInputSchema = z.object({
  projectPath: z.string().describe('Path to the git repository'),
  limitCommits: z.number().default(100).describe('Number of recent commits to analyze'),
  analyzeContributors: z.boolean().default(true).describe('Analyze contributor statistics'),
});

export const analyzeGitHistoryTool = ai.defineTool(
  {
    name: 'analyzeGitHistory',
    description: `Analyzes git repository history and contributor statistics.
    
    This tool examines commit history, contributor activity, branch structure,
    and provides insights into project development patterns.
    
    Use this when you need to:
    - Generate project reports
    - Create contributor acknowledgments
    - Analyze development activity
    - Generate changelogs`,
    inputSchema: AnalyzeGitHistoryInputSchema,
    outputSchema: GitHistorySchema,
  },
  async (input) => {
    const { projectPath, limitCommits, analyzeContributors } = input;

    const prompt = `Analyze git history for repository at: ${projectPath}

Instructions:
1. Count total commits
${analyzeContributors ? `2. Analyze contributors:
   - Name and email
   - Number of commits
   - Lines added and deleted
   - Sort by number of commits` : ''}
3. Calculate commit frequency (daily average, weekly, monthly)
4. List last ${limitCommits} commits with:
   - Hash (short)
   - Author
   - Date
   - Message
   - Files changed count
5. List all branches
6. List all tags/releases
7. Identify first and last commit dates

Return a JSON object matching the GitHistory schema with:
- totalCommits
- contributors (array of contributor objects with stats)
- commitFrequency (object with daily, weekly, monthly averages)
- recentCommits (array of commit objects, limited to ${limitCommits})
- branches (array of branch names)
- tags (array of tag names)
- firstCommit (ISO date string)
- lastCommit (ISO date string)`;

    const result = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt,
      output: { schema: GitHistorySchema },
    });

    return result.output!;
  }
);

// Export all project analysis tools
export const projectAnalysisTools = {
  analyzeProjectStructure: analyzeProjectStructureTool,
  extractDependencies: extractDependenciesTool,
  analyzeCodeComplexity: analyzeCodeComplexityTool,
  analyzeGitHistory: analyzeGitHistoryTool,
};
