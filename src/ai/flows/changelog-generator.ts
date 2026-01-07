/**
 * @fileOverview Changelog Generator Flow
 * 
 * Generates CHANGELOG.md files from git history following
 * the Keep a Changelog format.
 */

import { ai } from '@/ai/genkit';
import {
  ChangelogSchema,
} from '@/ai/schemas/project-documentation';
import {
  analyzeGitHistoryTool,
} from '@/ai/tools/reporting-and-metrics';
import { changelogPrompt } from '@/ai/prompts/project-documentation';
import { z } from 'zod';

// ==================== INPUT/OUTPUT SCHEMAS ====================

const ChangelogGeneratorInputSchema = z.object({
  projectPath: z.string().describe('Path to the git repository'),
  projectName: z.string().describe('Project name'),
  version: z.string().describe('Current version'),
  releaseDate: z.string().optional().describe('Release date (ISO format)'),
  includeUnreleased: z.boolean().default(true).describe('Include unreleased section'),
  limitCommits: z.number().default(100).describe('Number of commits to analyze'),
  groupByType: z.boolean().default(true).describe('Group changes by type (added, fixed, etc.)'),
  sinceVersion: z.string().optional().describe('Generate changelog since this version'),
});

export const changelogGenerator = ai.defineFlow(
  {
    name: 'changelogGenerator',
    inputSchema: ChangelogGeneratorInputSchema,
    outputSchema: ChangelogSchema,
  },
  async (input) => {
    const {
      projectPath,
      projectName,
      version,
      releaseDate,
      includeUnreleased,
      limitCommits,
      groupByType,
    } = input;

    console.log(`📋 Generating CHANGELOG.md for ${projectName} v${version}`);

    // Step 1: Analyze git history
    console.log('🔍 Step 1/2: Analyzing git history...');
    const gitHistory = await analyzeGitHistoryTool({
      projectPath,
      limitCommits,
      analyzeContributors: true,
    });

    // Step 2: Generate changelog using prompt
    console.log('📝 Step 2/2: Generating changelog...');
    
    const changelogPromptResult = await changelogPrompt({
      projectName,
      version,
      releaseDate: releaseDate || new Date().toISOString().split('T')[0],
      commits: gitHistory.recentCommits.map(c => ({
        hash: c.hash,
        message: c.message,
        author: c.author,
      })),
      includeUnreleased,
    });

    // Categorize commits intelligently
    const categorizeCommit = (message: string) => {
      const lowerMessage = message.toLowerCase();
      
      if (lowerMessage.match(/^feat|^add|^new|^implement/)) return 'added';
      if (lowerMessage.match(/^fix|^bug|^patch|^resolve/)) return 'fixed';
      if (lowerMessage.match(/^change|^update|^modify|^refactor/)) return 'changed';
      if (lowerMessage.match(/^remove|^delete/)) return 'removed';
      if (lowerMessage.match(/^deprecate/)) return 'deprecated';
      if (lowerMessage.match(/^security|^vuln/)) return 'security';
      
      return 'changed';
    };

    const categorizedChanges = {
      added: [] as string[],
      changed: [] as string[],
      deprecated: [] as string[],
      removed: [] as string[],
      fixed: [] as string[],
      security: [] as string[],
    };

    gitHistory.recentCommits.forEach(commit => {
      const category = categorizeCommit(commit.message);
      const formattedMessage = commit.message.charAt(0).toUpperCase() + commit.message.slice(1);
      categorizedChanges[category as keyof typeof categorizedChanges].push(formattedMessage);
    });

    // Generate structured changelog
    const structuredChangelog = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt: `Generate a CHANGELOG.md for ${projectName} following Keep a Changelog format.

Base Template:
${changelogPromptResult.text}

Categorized Changes:
${JSON.stringify(categorizedChanges, null, 2)}

Git Statistics:
- Total Commits: ${gitHistory.totalCommits}
- Contributors: ${gitHistory.contributors.length}
- Tags: ${gitHistory.tags.join(', ') || 'None'}
- Branches: ${gitHistory.branches.join(', ')}

Current Version: ${version}
Release Date: ${releaseDate || new Date().toISOString().split('T')[0]}

Create a professional CHANGELOG.md with:

1. Header with Keep a Changelog badge and Semantic Versioning reference

${includeUnreleased ? `
2. [Unreleased] section with:
   - Upcoming features
   - Work in progress
   - Planned changes
` : ''}

3. [${version}] - ${releaseDate || new Date().toISOString().split('T')[0]}

### Added
${categorizedChanges.added.length > 0 ? categorizedChanges.added.map(c => `- ${c}`).join('\n') : '- No new features'}

### Changed
${categorizedChanges.changed.length > 0 ? categorizedChanges.changed.map(c => `- ${c}`).join('\n') : '- No changes'}

### Deprecated
${categorizedChanges.deprecated.length > 0 ? categorizedChanges.deprecated.map(c => `- ${c}`).join('\n') : '- Nothing deprecated'}

### Removed
${categorizedChanges.removed.length > 0 ? categorizedChanges.removed.map(c => `- ${c}`).join('\n') : '- Nothing removed'}

### Fixed
${categorizedChanges.fixed.length > 0 ? categorizedChanges.fixed.map(c => `- ${c}`).join('\n') : '- No bug fixes'}

### Security
${categorizedChanges.security.length > 0 ? categorizedChanges.security.map(c => `- ${c}`).join('\n') : '- No security updates'}

${gitHistory.tags.length > 0 ? `
4. Previous versions (from tags):
${gitHistory.tags.slice(0, 5).map(tag => `
## [${tag}]
- Historical release
`).join('\n')}
` : ''}

Guidelines:
- Use past tense: "Added", "Fixed", "Changed"
- Be concise but descriptive
- Group related changes
- Link to issues/PRs where possible
- Most important changes first
- Remove empty sections

Return the complete CHANGELOG.md content.`,
      output: { schema: ChangelogSchema },
    });

    console.log('✅ CHANGELOG.md generated successfully!');

    return structuredChangelog.output!;
  }
);
