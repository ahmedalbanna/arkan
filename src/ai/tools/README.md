# Professional Writing Tools for Genkit

A comprehensive suite of AI-powered tools for professional writing analysis and improvement.

## Overview

This module provides 11 professional writing tools organized into 4 categories:

### 📝 Grammar & Style Tools (4 tools)

1. **checkGrammar** - Analyzes text for grammar, spelling, punctuation, and capitalization errors
2. **analyzeTone** - Detects writing tone and provides suggestions for achieving target tone
3. **checkReadability** - Calculates readability scores (Flesch Reading Ease, Flesch-Kincaid Grade Level)
4. **improveWordChoice** - Suggests better word choices based on desired style (concise, formal, vivid, simple)

### 📋 Document Structure Tools (3 tools)

5. **analyzeDocumentStructure** - Evaluates document organization, coherence, and transitions
6. **checkLogicalFlow** - Checks logical flow of ideas and identifies weak connections
7. **analyzeArgumentStructure** - Analyzes argument quality, thesis, evidence, and counterarguments

### 📚 Citation & Reference Tools (3 tools)

8. **validateCitations** - Validates in-text citations (APA, MLA, Chicago, Harvard, IEEE)
9. **checkReferences** - Checks reference list formatting and completeness
10. **matchCitationsToReferences** - Matches citations to references and identifies mismatches

### 🎯 Comprehensive Analysis (1 tool)

11. **analyzeDocumentQuality** - Complete document quality assessment combining all checks

---

## Usage

### Importing Tools

```typescript
import { professionalWritingTools } from '@/ai/tools';
// Or import specific tools
import { checkGrammarTool, analyzeToneTool } from '@/ai/tools';
```

### Using Tools in Prompts

Tools are automatically registered with Genkit and can be called by AI models:

```typescript
import { ai } from '@/ai/genkit';

const myPrompt = ai.definePrompt({
  name: 'myPrompt',
  tools: [professionalWritingTools.checkGrammar],
  prompt: `Analyze this text for grammar issues: {{text}}`,
});

const result = await myPrompt({ text: 'Your text here' });
```

### Using Tools Directly

You can also call tools directly:

```typescript
import { checkGrammarTool } from '@/ai/tools';

const result = await checkGrammarTool({
  text: 'Your text to analyze',
  language: 'en',
});

console.log(result.issues);
console.log(`Total issues: ${result.totalIssues}`);
```

---

## Tool Details

### Grammar & Style Tools

#### checkGrammar

**Input:**
- `text` (string, required) - Text to analyze
- `language` (string, optional, default: 'en') - Language code

**Output:**
- `issues` (array) - List of grammar issues with type, message, context, suggestions, severity, position
- `totalIssues` (number) - Total issues found
- `errorCount` (number) - Number of errors
- `warningCount` (number) - Number of warnings
- `infoCount` (number) - Number of info items

#### analyzeTone

**Input:**
- `text` (string, required) - Text to analyze
- `targetTone` (enum, optional) - Desired tone: 'professional', 'casual', 'academic', 'persuasive', 'neutral'

**Output:**
- `detectedTone` (string) - Detected tone description
- `confidence` (number) - Confidence level (0.0 to 1.0)
- `toneAttributes` (array) - Key tone characteristics
- `suggestions` (array) - Improvement suggestions
- `matchesTarget` (boolean) - Whether it matches target tone

#### checkReadability

**Input:**
- `text` (string, required) - Text to analyze

**Output:**
- `fleschReadingEase` (number) - Flesch Reading Ease score (0-100)
- `fleschKincaidGrade` (number) - Flesch-Kincaid Grade Level
- `avgSentenceLength` (number) - Average sentence length
- `avgWordLength` (number) - Average word length
- `complexWords` (number) - Number of complex words
- `readabilityLevel` (enum) - Classification from 'very_easy' to 'very_difficult'
- `suggestions` (array) - Improvement suggestions

#### improveWordChoice

**Input:**
- `text` (string, required) - Text to analyze
- `style` (enum, default: 'concise') - Desired style: 'concise', 'formal', 'vivid', 'simple'

**Output:**
- `improvements` (array) - List of word improvement suggestions with original, suggestion, reason, position
- `totalSuggestions` (number) - Total suggestions count

---

### Document Structure Tools

#### analyzeDocumentStructure

**Input:**
- `text` (string, required) - Document to analyze
- `documentType` (enum, default: 'general') - Type: 'academic', 'business', 'technical', 'creative', 'general'

**Output:**
- `structure` - Headings, paragraph count, section count
- `coherence` - Coherence score, issues, strengths
- `transitions` - Transition count, quality rating, suggestions
- `recommendations` - Actionable improvement recommendations

#### checkLogicalFlow

**Input:**
- `text` (string, required) - Text to analyze

**Output:**
- `flowScore` (number) - Overall flow quality (0.0 to 1.0)
- `issues` - List of flow issues (missing_transition, weak_connection, topic_shift, repetition)
- `recommendations` - Improvement suggestions

#### analyzeArgumentStructure

**Input:**
- `text` (string, required) - Text to analyze

**Output:**
- `hasThesis` (boolean) - Whether thesis is present
- `thesis` (string) - Extracted thesis statement
- `arguments` - List of claims with evidence and strength rating
- `counterarguments` - Counterarguments identified
- `conclusion` - Extracted conclusion
- `overallStrength` (enum) - 'strong', 'moderate', 'weak'
- `suggestions` - Improvement suggestions

---

### Citation & Reference Tools

#### validateCitations

**Input:**
- `text` (string, required) - Document text
- `citationStyle` (enum, default: 'APA') - Style: 'APA', 'MLA', 'Chicago', 'Harvard', 'IEEE'

**Output:**
- `citations` - List of citations with validation results
- `totalCitations` (number) - Total citations found
- `validCitations` (number) - Valid citations count
- `invalidCitations` (number) - Invalid citations count
- `suggestions` - Improvement suggestions

#### checkReferences

**Input:**
- `references` (string, required) - Reference list text
- `citationStyle` (enum, default: 'APA') - Citation style

**Output:**
- `references` - List of references with validation results
- `totalReferences` (number) - Total references count
- `validReferences` (number) - Valid references count
- `invalidReferences` (number) - Invalid references count
- `formattingIssues` - General formatting problems
- `recommendations` - Improvement suggestions

#### matchCitationsToReferences

**Input:**
- `documentText` (string, required) - Full document text
- `references` (string, required) - Reference list
- `citationStyle` (enum, default: 'APA') - Citation style

**Output:**
- `citedButNotInReferences` - Citations without matching references
- `inReferencesButNotCited` - References not cited in text
- `matchedCitations` (number) - Successfully matched count
- `unmatchedCitations` (number) - Unmatched citations count
- `unmatchedReferences` (number) - Unmatched references count
- `recommendations` - Improvement suggestions

---

### Comprehensive Analysis

#### analyzeDocumentQuality

**Input:**
- `text` (string, required) - Document to analyze
- `documentType` (enum, default: 'general') - Document type
- `checkGrammar` (boolean, default: true) - Include grammar analysis
- `checkStructure` (boolean, default: true) - Include structure analysis
- `checkCitations` (boolean, default: false) - Include citation analysis
- `citationStyle` (enum, optional) - Citation style if checking citations

**Output:**
- `overallScore` (number) - Overall quality score (0-100)
- `grammarScore` (number) - Grammar score (0-100, if enabled)
- `structureScore` (number) - Structure score (0-100, if enabled)
- `citationScore` (number) - Citation score (0-100, if enabled)
- `readabilityScore` (number) - Readability score (0-100)
- `summary` - Strengths, weaknesses, priority improvements
- `detailedAnalysis` - Detailed analysis for each enabled check

---

## Integration with AI Flows

Tools are automatically available to AI prompts defined with Genkit. The AI model can choose to call these tools when appropriate:

```typescript
const enhancedWritingPrompt = ai.definePrompt({
  name: 'enhancedWriting',
  tools: Object.values(professionalWritingTools),
  prompt: `You are a professional writing assistant. Help improve the following text:

{{text}}

Use the available tools to analyze and provide comprehensive feedback.`,
});
```

---

## Architecture

```
tools/
├── schemas.ts                      # Zod schemas for all tools
├── grammar-and-style.ts            # Grammar & style tools
├── document-structure.ts           # Document structure tools
├── citations-and-references.ts     # Citation & reference tools
├── comprehensive-analysis.ts       # Comprehensive analysis tool
├── index.ts                        # Tool exports and registry
└── README.md                       # This file
```

---

## Benefits

✅ **AI-Powered**: Uses Google Gemini models for intelligent analysis  
✅ **Type-Safe**: Full TypeScript support with Zod validation  
✅ **Comprehensive**: Covers all aspects of professional writing  
✅ **Flexible**: Use standalone or integrate with AI flows  
✅ **Standards-Compliant**: Supports major citation styles  
✅ **Actionable**: Provides specific, actionable feedback  

---

## Examples

### Example 1: Grammar Check

```typescript
import { checkGrammarTool } from '@/ai/tools';

const result = await checkGrammarTool({
  text: 'This is a sentance with some erors.',
  language: 'en',
});

// result.issues will contain:
// [
//   {
//     type: 'spelling',
//     message: 'Misspelled word',
//     context: 'This is a sentance with',
//     suggestions: ['sentence'],
//     severity: 'error'
//   },
//   {
//     type: 'spelling',
//     message: 'Misspelled word',
//     context: 'with some erors',
//     suggestions: ['errors'],
//     severity: 'error'
//   }
// ]
```

### Example 2: Document Quality Analysis

```typescript
import { analyzeDocumentQualityTool } from '@/ai/tools';

const result = await analyzeDocumentQualityTool({
  text: 'Your full document text here...',
  documentType: 'academic',
  checkGrammar: true,
  checkStructure: true,
  checkCitations: true,
  citationStyle: 'APA',
});

console.log(`Overall Score: ${result.overallScore}/100`);
console.log(`Strengths:`, result.summary.strengths);
console.log(`Top Priority Improvements:`, result.summary.priority_improvements);
```

### Example 3: Citation Validation

```typescript
import { validateCitationsTool } from '@/ai/tools';

const result = await validateCitationsTool({
  text: 'According to Smith (2020), research shows...',
  citationStyle: 'APA',
});

console.log(`Valid Citations: ${result.validCitations}/${result.totalCitations}`);
```

---

## Future Enhancements

- [ ] Support for more languages
- [ ] Plagiarism detection integration
- [ ] Style guide compliance checking
- [ ] Custom writing rules
- [ ] Batch document processing
- [ ] Export analysis reports

---

## Support

For issues, questions, or contributions, please refer to the main project documentation.
