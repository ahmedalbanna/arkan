

/**
 * @fileOverview Citation and Reference Tools for Professional Writing
 *
 * These tools validate citations, check references, and ensure proper
 * citation formatting according to various academic styles.
 */

import { ai } from '@/ai/genkit';
import {
  CheckReferencesToolInputSchema,
  CheckReferencesToolOutputSchema,
  MatchCitationsToReferencesToolInputSchema,
  MatchCitationsToReferencesToolOutputSchema,
  ValidateCitationsToolInputSchema,
  ValidateCitationsToolOutputSchema,
  type CheckReferencesToolInput,
  type CheckReferencesToolOutput,
  type MatchCitationsToReferencesToolInput,
  type MatchCitationsToReferencesToolOutput,
  type ValidateCitationsToolInput,
  type ValidateCitationsToolOutput,
} from './schemas';

/**
 * Citation Validator Tool
 * Validates in-text citations according to specified citation style.
 */
export const validateCitationsTool = ai.defineTool(
  {
    name: 'validateCitations',
    description: 'Validates in-text citations according to the specified citation style (APA, MLA, Chicago, Harvard, IEEE). Identifies formatting errors and provides corrections.',
    inputSchema: ValidateCitationsToolInputSchema,
    outputSchema: ValidateCitationsToolOutputSchema,
  },
  async (input: ValidateCitationsToolInput): Promise<ValidateCitationsToolOutput> => {
    const styleGuidelines = {
      APA: `APA (7th edition) in-text citation format:
- Author-date: (Smith, 2020)
- Multiple authors: (Smith & Jones, 2020) or (Smith et al., 2020) for 3+ authors
- Direct quote: (Smith, 2020, p. 15)
- Multiple works: (Jones, 2019; Smith, 2020)`,
      MLA: `MLA (9th edition) in-text citation format:
- Author-page: (Smith 15)
- Multiple authors: (Smith and Jones 20) or (Smith et al. 25)
- No author: ("Article Title" 10)
- Multiple works: (Jones 5; Smith 10)`,
      Chicago: `Chicago (17th edition) in-text citation format:
- Author-date: (Smith 2020, 15)
- Multiple authors: (Smith and Jones 2020) or (Smith et al. 2020)
- Also uses footnotes/endnotes with full citations`,
      Harvard: `Harvard in-text citation format:
- Author-date: (Smith 2020)
- Multiple authors: (Smith and Jones 2020) or (Smith et al. 2020)
- Direct quote: (Smith 2020, p. 15)`,
      IEEE: `IEEE in-text citation format:
- Numbered: [1], [2], [3]
- Multiple: [1]-[3] or [1, 5, 7]
- References numbered in order of appearance`,
    };

    const prompt = ai.definePrompt({
      name: 'citationValidatorPrompt',
      input: { schema: ValidateCitationsToolInputSchema },
      output: { schema: ValidateCitationsToolOutputSchema },
      model: 'googleai/gemini-2.0-flash-lite',
      prompt: `You are an expert in academic citation formats. Validate all in-text citations in the following text according to ${input.citationStyle} style.

Text to analyze:
{{text}}

Citation Style: {{citationStyle}}
Guidelines:
${styleGuidelines[input.citationStyle]}

For each citation found:
1. Extract the citation text
2. Identify the type (in-text, footnote, endnote)
3. Determine the position in the text
4. Validate if it follows the citation style correctly
5. List any issues found (e.g., "Missing year", "Incorrect punctuation", "Wrong format for multiple authors")

Provide:
- Total citations found
- Valid citations count
- Invalid citations count
- Overall suggestions for improvement

Be thorough and identify all citations, including those that may be incomplete or incorrectly formatted.`,
    });

    const { output } = await prompt(input);

    if (!output) {
      throw new Error('Failed to validate citations');
    }

    return output;
  }
);

/**
 * Reference List Checker Tool
 * Validates reference list formatting according to specified citation style.
 */
export const checkReferencesTool = ai.defineTool(
  {
    name: 'checkReferences',
    description: 'Validates reference list or bibliography formatting according to the specified citation style. Checks for completeness, consistency, and proper formatting.',
    inputSchema: CheckReferencesToolInputSchema,
    outputSchema: CheckReferencesToolOutputSchema,
  },
  async (input: CheckReferencesToolInput): Promise<CheckReferencesToolOutput> => {
    const styleGuidelines = {
      APA: `APA (7th edition) reference format:
- Books: Author, A. A. (Year). Title of work. Publisher.
- Journal: Author, A. A. (Year). Title of article. Journal Name, volume(issue), pages. DOI
- Website: Author, A. A. (Year, Month Day). Title. Site Name. URL
- Alphabetical order by author last name
- Hanging indent`,
      MLA: `MLA (9th edition) reference format:
- Books: Author Last, First. Title of Book. Publisher, Year.
- Journal: Author Last, First. "Article Title." Journal Name, vol. #, no. #, Year, pp. #-#.
- Website: Author Last, First. "Page Title." Website Name, Day Month Year, URL.
- Alphabetical order by author last name
- Hanging indent`,
      Chicago: `Chicago (17th edition) bibliography format:
- Books: Last, First. Title of Book. Place: Publisher, Year.
- Journal: Last, First. "Article Title." Journal Name volume, no. issue (Year): pages.
- Website: Last, First. "Page Title." Website Name. Month Day, Year. URL.
- Alphabetical order by author last name`,
      Harvard: `Harvard reference format:
- Books: Author, A. (Year) Title of Book. Place: Publisher.
- Journal: Author, A. (Year) 'Article title', Journal Name, vol.(no.), pp. pages.
- Website: Author, A. (Year) 'Page title', Website Name. Available at: URL (Accessed: date).
- Alphabetical order by author last name`,
      IEEE: `IEEE reference format:
- Books: [#] A. Author, Title of Book. Place: Publisher, Year.
- Journal: [#] A. Author, "Article title," Journal Name, vol. #, no. #, pp. pages, Month Year.
- Website: [#] A. Author. "Page title." Website Name. URL (accessed Month Day, Year).
- Numbered in order of citation appearance`,
    };

    const prompt = ai.definePrompt({
      name: 'referenceCheckerPrompt',
      input: { schema: CheckReferencesToolInputSchema },
      output: { schema: CheckReferencesToolOutputSchema },
      model: 'googleai/gemini-2.0-flash-lite',
      prompt: `You are an expert in academic reference formatting. Check the following reference list for proper formatting according to ${input.citationStyle} style.

Reference list to analyze:
{{references}}

Citation Style: {{citationStyle}}
Guidelines:
${styleGuidelines[input.citationStyle]}

For each reference:
1. Extract the reference text
2. Validate if it follows the citation style correctly
3. List any issues (e.g., "Missing publisher", "Incorrect date format", "Wrong punctuation")
4. Provide suggestions for correction

Also check for:
- Overall formatting consistency
- Proper alphabetization (if applicable)
- Hanging indents (mention if needed)
- Completeness of information

Provide:
- Total references count
- Valid references count
- Invalid references count
- General formatting issues
- Recommendations for improvement`,
    });

    const { output } = await prompt(input);

    if (!output) {
      throw new Error('Failed to check references');
    }

    return output;
  }
);

/**
 * Citation-Reference Matcher Tool
 * Matches in-text citations with reference list entries and identifies mismatches.
 */
export const matchCitationsToReferencesTool = ai.defineTool(
  {
    name: 'matchCitationsToReferences',
    description: 'Matches in-text citations with reference list entries. Identifies citations without corresponding references and references that are not cited.',
    inputSchema: MatchCitationsToReferencesToolInputSchema,
    outputSchema: MatchCitationsToReferencesToolOutputSchema,
  },
  async (input: MatchCitationsToReferencesToolInput): Promise<MatchCitationsToReferencesToolOutput> => {
    const prompt = ai.definePrompt({
      name: 'citationReferenceMatcherPrompt',
      input: { schema: MatchCitationsToReferencesToolInputSchema },
      output: { schema: MatchCitationsToReferencesToolOutputSchema },
      model: 'googleai/gemini-2.0-flash-lite',
      prompt: `You are an expert in academic citation analysis. Match in-text citations with reference list entries and identify any mismatches.

Document text:
{{documentText}}

Reference list:
{{references}}

Citation Style: {{citationStyle}}

Task:
1. Extract all in-text citations from the document
2. Extract all entries from the reference list
3. Match each citation to its corresponding reference entry
4. Identify citations that have no matching reference (cited but not in references)
5. Identify references that are not cited in the text (in references but not cited)

Provide:
- List of citations without matching references (include the citation text)
- List of references without matching citations (include the author/year or reference number)
- Count of matched citations
- Count of unmatched citations
- Count of unmatched references
- Recommendations for fixing mismatches

Be thorough in identifying author names, years, and reference numbers across different citation formats.`,
    });

    const { output } = await prompt(input);

    if (!output) {
      throw new Error('Failed to match citations to references');
    }

    return output;
  }
);

// Export all tools
export const citationsAndReferencesTools = {
  validateCitations: validateCitationsTool,
  checkReferences: checkReferencesTool,
  matchCitationsToReferences: matchCitationsToReferencesTool,
};
