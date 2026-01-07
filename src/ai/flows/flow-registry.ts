/**
 * @fileOverview Flow Registry - Metadata mapping for all AI flows
 *
 * This registry connects flow names to their:
 * - Prompt keys (from prompts/index.ts)
 * - Input/Output schemas (from schemas/flows.ts)
 * - Pre/Post processors (for data transformation)
 */

import {
  // Schemas
  AiProofreadDocumentInputSchema,
  AiProofreadDocumentOutputSchema,
  AIResearcherInputSchema,
  AIResearcherOutputSchema,
  AnalyzeContextInputSchema,
  AnalyzeContextOutputSchema,
  BiasCheckInputSchema,
  BiasCheckOutputSchema,
  DetectAIInputSchema,
  DetectAIOutputSchema,
  FactCheckInputSchema,
  FactCheckOutputSchema,
  FactRetrievalInputSchema,
  FactRetrievalOutputSchema,
  GenerateAgentConfigInputSchema,
  GenerateAgentConfigOutputSchema,
  GenerateChapterInputSchema,
  GenerateChapterOutputSchema,
  GenerateCitationInputSchema,
  GenerateCitationOutputSchema,
  GeneratePlantUMLInputSchema,
  GeneratePlantUMLOutputSchema,
  GenerateProjectBlueprintInputSchema,
  GenerateProjectBlueprintOutputSchema,
  GenerateQuizInputSchema,
  GenerateQuizOutputSchema,
  GenerateSectionInputSchema,
  GenerateSectionOutputSchema,
  GenerateTextInputSchema,
  GenerateTextOutputSchema,
  GenerateTocInputSchema,
  GenerateTocOutputSchema,
  GenerateUIDescriptionInputSchema,
  GenerateUIDescriptionOutputSchema,
  GrammarCheckInputSchema,
  GrammarCheckOutputSchema,
  HumanizeTextInputSchema,
  HumanizeTextOutputSchema,
  IdeaGenerationInputSchema,
  IdeaGenerationOutputSchema,
  ImageToTextInputSchema,
  ImageToTextOutputSchema,
  ImproveMarkdownInputSchema,
  ImproveMarkdownOutputSchema,
  LiteratureReviewInputSchema,
  LiteratureReviewOutputSchema,
  ManipulateTextInputSchema,
  ManipulateTextOutputSchema,
  ParaphraseInputSchema,
  ParaphraseOutputSchema,
  PlagiarismCheckInputSchema,
  PlagiarismCheckOutputSchema,
  QuestionAnsweringInputSchema,
  QuestionAnsweringOutputSchema,
  RewriteDocumentInputSchema,
  RewriteDocumentOutputSchema,
  RewriteToMarkdownInputSchema,
  RewriteToMarkdownOutputSchema,
  SentenceStructureCheckInputSchema,
  SentenceStructureCheckOutputSchema,
  SolveAssignmentsInputSchema,
  SolveAssignmentsOutputSchema,
  SummarizeDocumentInputSchema,
  SummarizeDocumentOutputSchema,
  SummarizeInputSchema,
  SummarizeOutputSchema,
  TopicExplainerInputSchema,
  TopicExplainerOutputSchema,
  TranslateTextInputSchema,
  TranslateTextOutputSchema,
  WriteDocumentInputSchema,
  WriteDocumentOutputSchema,
} from '@/ai/schemas';
import {
  GenerateSessionPlanInputSchema,
  GenerateSessionPlanOutputSchema,
  GenerateTheoreticalLectureInputSchema,
  GenerateTheoreticalLectureOutputSchema,
} from '@/ai/schemas/lecture-generator';

import { z } from 'zod';
import {
  AcademicLiteratureReviewInputSchema,
  AcademicLiteratureReviewOutputSchema,
  AcademicPaperQualityCheckerInputSchema,
  AcademicPaperQualityCheckerOutputSchema,
  ProfessionalDocumentWriterInputSchema,
  ProfessionalDocumentWriterOutputSchema
} from '@/ai/tools/schemas';

/**
 * Flow metadata structure
 */
export interface FlowMetadata {
  flowName: string;
  promptKey: string;
  inputSchema: z.ZodSchema;
  outputSchema: z.ZodSchema;
  preProcessor?: (input: any) => any;
  postProcessor?: (output: any) => any;
}

// Helper functions for common transformations
const lengthDescriptions: Record<string, string> = {
  short: 'a single, concise paragraph.',
  medium: 'a few paragraphs, capturing the main points and key supporting details.',
  long: 'a detailed summary, covering all significant topics and arguments.',
};

const styleDescriptions: Record<string, string> = {
  standard: 'Provide a balanced rewrite that improves clarity while retaining the original meaning.',
  fluent: 'Rewrite the text to sound more natural and fluent, as if written by a native speaker.',
  formal: 'Rewrite the text using a more formal, academic, and professional tone.',
  creative: 'Rewrite the text in a more creative and engaging style, using vivid language.',
  simplify: 'Rewrite the text to be simpler and easier to understand for a general audience.',
};

/**
 * Central registry of all AI flows
 */
export const flowRegistry: Record<string, FlowMetadata> = {
  // ============================================================================
  // TEXT MANIPULATION FLOWS
  // ============================================================================

  summarizeText: {
    flowName: 'summarizeText',
    promptKey: 'summarize',
    inputSchema: SummarizeInputSchema,
    outputSchema: SummarizeOutputSchema,
    preProcessor: (input) => ({
      ...input,
      instruction: lengthDescriptions[input.length] || lengthDescriptions.medium,
    }),
    postProcessor: (output) => ({
      ...output,
      summary: output.summary.replace(/---/g, '').trim(),
    }),
  },

  paraphraseText: {
    flowName: 'paraphraseText',
    promptKey: 'paraphrase',
    inputSchema: ParaphraseInputSchema,
    outputSchema: ParaphraseOutputSchema,
    preProcessor: (input) => ({
      ...input,
      instruction: styleDescriptions[input.mode] || styleDescriptions.standard,
    }),
    postProcessor: (output) => ({
      ...output,
      paraphrasedText: output.paraphrasedText.replace(/---/g, '').trim(),
    }),
  },

  translateText: {
    flowName: 'translateText',
    promptKey: 'translate',
    inputSchema: TranslateTextInputSchema,
    outputSchema: TranslateTextOutputSchema,
    postProcessor: (output) => ({
      ...output,
      translatedText: output.translatedText.replace(/---/g, '').trim(),
    }),
  },

  manipulateText: {
    flowName: 'manipulateText',
    promptKey: 'manipulate',
    inputSchema: ManipulateTextInputSchema,
    outputSchema: ManipulateTextOutputSchema,
  },

  humanizeText: {
    flowName: 'humanizeText',
    promptKey: 'humanize',
    inputSchema: HumanizeTextInputSchema,
    outputSchema: HumanizeTextOutputSchema,
  },

  // ============================================================================
  // QUALITY CHECKING FLOWS
  // ============================================================================

  grammarCheck: {
    flowName: 'grammarCheck',
    promptKey: 'grammar',
    inputSchema: GrammarCheckInputSchema,
    outputSchema: GrammarCheckOutputSchema,
    postProcessor: (output) => {
      // Calculate statistics if not provided by the model
      if (!output.statistics && output.corrections) {
        const stats = {
          total: output.corrections.length,
          grammar: output.corrections.filter((c: any) => c.type === 'grammar').length,
          spelling: output.corrections.filter((c: any) => c.type === 'spelling').length,
          punctuation: output.corrections.filter((c: any) => c.type === 'punctuation').length,
        };
        return { ...output, statistics: stats };
      }
      return output;
    },
  },

  biasCheck: {
    flowName: 'biasCheck',
    promptKey: 'biasCheck',
    inputSchema: BiasCheckInputSchema,
    outputSchema: BiasCheckOutputSchema,
  },

  detectAiContent: {
    flowName: 'detectAiContent',
    promptKey: 'detectAi',
    inputSchema: DetectAIInputSchema,
    outputSchema: DetectAIOutputSchema,
  },

  factCheck: {
    flowName: 'factCheck',
    promptKey: 'factCheck',
    inputSchema: FactCheckInputSchema,
    outputSchema: FactCheckOutputSchema,
  },

  plagiarismCheck: {
    flowName: 'plagiarismCheck',
    promptKey: 'plagiarism',
    inputSchema: PlagiarismCheckInputSchema,
    outputSchema: PlagiarismCheckOutputSchema,
  },

  sentenceStructureCheck: {
    flowName: 'sentenceStructureCheck',
    promptKey: 'sentenceStructure',
    inputSchema: SentenceStructureCheckInputSchema,
    outputSchema: SentenceStructureCheckOutputSchema,
  },

  // ============================================================================
  // DOCUMENT GENERATION FLOWS
  // ============================================================================

  generateText: {
    flowName: 'generateText',
    promptKey: 'generateText',
    inputSchema: GenerateTextInputSchema,
    outputSchema: GenerateTextOutputSchema,
  },

  writeDocument: {
    flowName: 'writeDocument',
    promptKey: 'universityMaterial', // Default to university material
    inputSchema: WriteDocumentInputSchema,
    outputSchema: WriteDocumentOutputSchema,
    preProcessor: (input) => {
      // Choose prompt based on document type
      return input;
    },
    postProcessor: (output) => ({
      ...output,
      documentContent: output.documentContent.replace(/---/g, '').trim(),
    }),
  },

  summarizeDocument: {
    flowName: 'summarizeDocument',
    promptKey: 'summarize', // Uses same prompt as summarizeText
    inputSchema: SummarizeDocumentInputSchema,
    outputSchema: SummarizeDocumentOutputSchema,
  },

  rewriteDocumentToMarkdown: {
    flowName: 'rewriteDocumentToMarkdown',
    promptKey: 'rewriteDoc',
    inputSchema: RewriteDocumentInputSchema,
    outputSchema: RewriteDocumentOutputSchema,
  },

  rewriteToMarkdown: {
    flowName: 'rewriteToMarkdown',
    promptKey: 'rewriteToMd',
    inputSchema: RewriteToMarkdownInputSchema,
    outputSchema: RewriteToMarkdownOutputSchema,
  },

  improveReportMarkdown: {
    flowName: 'improveReportMarkdown',
    promptKey: 'improveMarkdown',
    inputSchema: ImproveMarkdownInputSchema,
    outputSchema: ImproveMarkdownOutputSchema,
  },

  aiProofreadDocument: {
    flowName: 'aiProofreadDocument',
    promptKey: 'proofread',
    inputSchema: AiProofreadDocumentInputSchema,
    outputSchema: AiProofreadDocumentOutputSchema,
  },
  clarityAdvisor: {
    flowName: 'clarityAdvisor',
    promptKey: 'clarityAdvisor',
    inputSchema: ManipulateTextInputSchema,
    outputSchema: ManipulateTextOutputSchema,
  },
  concisenessChecker: {
    flowName: 'concisenessChecker',
    promptKey: 'concisenessChecker',
    inputSchema: ManipulateTextInputSchema,
    outputSchema: ManipulateTextOutputSchema,
  },
  readabilityEnhancer: {
    flowName: 'readabilityEnhancer',
    promptKey: 'readabilityEnhancer',
    inputSchema: ManipulateTextInputSchema,
    outputSchema: ManipulateTextOutputSchema,
  },
  rewriteText: {
    flowName: 'rewriteText',
    promptKey: 'rewriteText',
    inputSchema: ManipulateTextInputSchema,
    outputSchema: ManipulateTextOutputSchema,
  },
  styleEditor: {
    flowName: 'styleEditor',
    promptKey: 'styleEditor',
    inputSchema: ManipulateTextInputSchema,
    outputSchema: ManipulateTextOutputSchema,
  },

  // ============================================================================
  // CONTENT GENERATION FLOWS
  // ============================================================================

  generateIdeas: {
    flowName: 'generateIdeas',
    promptKey: 'ideas',
    inputSchema: IdeaGenerationInputSchema,
    outputSchema: IdeaGenerationOutputSchema,
  },

  generateQuiz: {
    flowName: 'generateQuiz',
    promptKey: 'multipleChoice', // Default, will be switched in preProcessor
    inputSchema: GenerateQuizInputSchema,
    outputSchema: GenerateQuizOutputSchema,
    preProcessor: (input) => {
      // Return input with marker for which prompt to use
      return { ...input, _promptType: input.questionType };
    },
  },

  generateToc: {
    flowName: 'generateToc',
    promptKey: 'generateToc',
    inputSchema: GenerateTocInputSchema,
    outputSchema: GenerateTocOutputSchema,
  },

  generateCitation: {
    flowName: 'generateCitation',
    promptKey: 'citation',
    inputSchema: GenerateCitationInputSchema,
    outputSchema: GenerateCitationOutputSchema,
  },

  generateChapterContent: {
    flowName: 'generateChapterContent',
    promptKey: 'chapterContent',
    inputSchema: GenerateChapterInputSchema,
    outputSchema: GenerateChapterOutputSchema,
  },

  generateProjectBlueprint: {
    flowName: 'generateProjectBlueprint',
    promptKey: 'generateProjectBlueprint',
    inputSchema: GenerateProjectBlueprintInputSchema,
    outputSchema: GenerateProjectBlueprintOutputSchema,
  },

  generateUiDescription: {
    flowName: 'generateUiDescription',
    promptKey: 'generateUiDescription',
    inputSchema: GenerateUIDescriptionInputSchema,
    outputSchema: GenerateUIDescriptionOutputSchema,
  },

  generateReportSection: {
    flowName: 'generateReportSection',
    promptKey: 'default', // This flow uses dynamic system prompt
    inputSchema: GenerateSectionInputSchema,
    outputSchema: GenerateSectionOutputSchema,
  },

  // ============================================================================
  // RESEARCH & ANALYSIS FLOWS
  // ============================================================================

  aiResearcher: {
    flowName: 'aiResearcher',
    promptKey: 'researcher',
    inputSchema: AIResearcherInputSchema,
    outputSchema: AIResearcherOutputSchema,
  },

  factRetrieval: {
    flowName: 'factRetrieval',
    promptKey: 'factRetrieval',
    inputSchema: FactRetrievalInputSchema,
    outputSchema: FactRetrievalOutputSchema,
  },

  literatureReviewGenerator: {
    flowName: 'literatureReviewGenerator',
    promptKey: 'literatureReview',
    inputSchema: LiteratureReviewInputSchema,
    outputSchema: LiteratureReviewOutputSchema,
  },

  analyzeContext: {
    flowName: 'analyzeContext',
    promptKey: 'analyzeContext',
    inputSchema: AnalyzeContextInputSchema,
    outputSchema: AnalyzeContextOutputSchema,
  },

  topicExplainer: {
    flowName: 'topicExplainer',
    promptKey: 'explainTopic',
    inputSchema: TopicExplainerInputSchema,
    outputSchema: TopicExplainerOutputSchema,
    postProcessor: (output) => ({
      ...output,
      explanation: output.explanation.replace(/---/g, '').trim(),
    }),
  },

  questionAnswering: {
    flowName: 'questionAnswering',
    promptKey: 'questionAnswering',
    inputSchema: QuestionAnsweringInputSchema,
    outputSchema: QuestionAnsweringOutputSchema,
  },

  solveAssignments: {
    flowName: 'solveAssignments',
    promptKey: 'solveAssignments',
    inputSchema: SolveAssignmentsInputSchema,
    outputSchema: SolveAssignmentsOutputSchema,
  },

  // ============================================================================
  // LECTURE & EDUCATION FLOWS
  // ============================================================================

  generateTheoreticalLecture: {
    flowName: 'generateTheoreticalLecture',
    promptKey: 'generateTheoreticalLecture',
    inputSchema: GenerateTheoreticalLectureInputSchema,
    outputSchema: GenerateTheoreticalLectureOutputSchema,
  },

  generateSessionPlan: {
    flowName: 'generateSessionPlan',
    promptKey: 'generateSessionPlan',
    inputSchema: GenerateSessionPlanInputSchema,
    outputSchema: GenerateSessionPlanOutputSchema,
  },

  // ============================================================================
  // MEDIA & DIAGRAM FLOWS
  // ============================================================================

  imageToText: {
    flowName: 'imageToText',
    promptKey: 'imageToText',
    inputSchema: ImageToTextInputSchema,
    outputSchema: ImageToTextOutputSchema,
  },

  generatePlantUML: {
    flowName: 'generatePlantUML',
    promptKey: 'usecase', // Default, will be switched based on diagramType
    inputSchema: GeneratePlantUMLInputSchema,
    outputSchema: GeneratePlantUMLOutputSchema,
    preProcessor: (input) => {
      // Return input with marker for which diagram prompt to use
      return { ...input, _diagramPromptKey: input.diagramType };
    },
  },

  // ============================================================================
  // CONFIG & UTILITY FLOWS
  // ============================================================================

  generateAgentConfig: {
    flowName: 'generateAgentConfig',
    promptKey: 'agentConfig',
    inputSchema: GenerateAgentConfigInputSchema,
    outputSchema: GenerateAgentConfigOutputSchema,
  },

  // ============================================================================
  // ADVANCED PROFESSIONAL WRITING FLOWS (with Tools integration)
  // ============================================================================

  academicLiteratureReview: {
    flowName: 'academicLiteratureReview',
    promptKey: 'literatureReview', // Uses existing prompt but with tools
    inputSchema: AcademicLiteratureReviewInputSchema,
    outputSchema: AcademicLiteratureReviewOutputSchema,
  },

  academicPaperQualityChecker: {
    flowName: 'academicPaperQualityChecker',
    promptKey: 'default', // Uses multiple tools, not a single prompt
    inputSchema: AcademicPaperQualityCheckerInputSchema,
    outputSchema: AcademicPaperQualityCheckerOutputSchema,
  },

  professionalDocumentWriter: {
    flowName: 'professionalDocumentWriter',
    promptKey: 'default', // Uses multiple prompts and tools
    inputSchema: ProfessionalDocumentWriterInputSchema,
    outputSchema: ProfessionalDocumentWriterOutputSchema,
  },
};
