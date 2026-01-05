'use server';

import { z } from 'zod';
import { requireUser } from './_utils/auth';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';

// Flows
import { paraphraseText } from '@/ai/flows/paraphrase-text';
import { summarizeText } from '@/ai/flows/summarize-text';
import { humanizeText } from '@/ai/flows/humanize-text';
import { detectAiContent } from '@/ai/flows/detect-ai-content';
import { grammarCheck } from '@/ai/flows/grammar-checker';
import { generateQuiz } from '@/ai/flows/generate-quiz';
import { factCheckText } from '@/ai/flows/fact-checker';
import { plagiarismCheck } from '@/ai/flows/plagiarism-checker';
import { generateCitation } from '@/ai/flows/generate-citation';
import { aiResearcher } from '@/ai/flows/ai-researcher';
import { literatureReviewGenerator as generateLiteratureReview } from '@/ai/flows/literature-review-generator';
import { answerQuestion } from '@/ai/flows/question-answering';
import { retrieveFact } from '@/ai/flows/fact-retrieval';
import { topicExplainer } from '@/ai/flows/topic-explainer';
import { generateIdeas } from '@/ai/flows/generate-ideas';
import { writeDocument } from '@/ai/flows/write-document';
import { generatePlantUML } from '@/ai/flows/generate-plantuml';
import { rewriteText } from '@/ai/flows/rewrite-to-markdown';
import { summarizeTextWithRatio } from '@/ai/flows/summarize-text';
import { styleEditor, readabilityEnhancer, concisenessChecker, clarityAdvisor } from '@/ai/flows/text-stylist';
import { manipulateText } from '@/ai/flows/manipulate-text';
import { generateToc } from '@/ai/flows/generate-toc';
import { translateText } from '@/ai/flows/translate-text';
import { sentenceStructureCheck } from '@/ai/flows/sentence-structure-checker';
import { solveAssignments } from '@/ai/flows/solve-assignments';
import { generateProjectBlueprint } from '@/ai/flows/generate-project-blueprint';
import { generateUiDescription } from '@/ai/flows/generate-ui-description';
import { generateChapterContent } from '@/ai/flows/generate-chapter-content';

// Schemas
import {
  ParaphraseInputSchema,
  SummarizeInputSchema,
  HumanizeTextInputSchema,
  DetectAIInputSchema,
  GrammarCheckInputSchema,
  GenerateQuizInputSchema,
  FactCheckInputSchema,
  PlagiarismCheckInputSchema,
  GenerateCitationInputSchema,
  AIResearcherInputSchema,
  LiteratureReviewInputSchema,
  QuestionAnsweringInputSchema,
  FactRetrievalInputSchema,
  TopicExplainerInputSchema,
  IdeaGenerationInputSchema,
  WriteDocumentInputSchema,
  GeneratePlantUMLInputSchema,
  RewriteTextInputSchema,
  SummarizeTextWithRatioInputSchema,
  StyleEditorInputSchema,
  ReadabilityEnhancerInputSchema,
  ConcisenessCheckerInputSchema,
  ClarityAdvisorInputSchema,
  ManipulateTextInputSchema,
  GenerateTocInputSchema,
  TranslateTextInputSchema,
  SentenceStructureCheckInputSchema,
  SolveAssignmentsInputSchema,
  GenerateProjectBlueprintInputSchema,
  GenerateUIDescriptionInputSchema,
  GenerateChapterInputSchema,
} from '@/ai/schemas';

const toolConfig = {
  paraphrase: { flow: paraphraseText, schema: ParaphraseInputSchema.pick({ text: true, mode: true }), creditCost: 1 },
  summarize: { flow: summarizeText, schema: SummarizeInputSchema.pick({ text: true, length: true }), creditCost: 1 },
  humanize: { flow: humanizeText, schema: HumanizeTextInputSchema.pick({ text: true }), creditCost: 1 },
  'ai-detector': { flow: detectAiContent, schema: DetectAIInputSchema.pick({ text: true }), creditCost: 1 },
  'grammar-checker': { flow: grammarCheck, schema: GrammarCheckInputSchema.pick({ text: true }), creditCost: 1 },
  'quiz-generator': { flow: generateQuiz, schema: GenerateQuizInputSchema.pick({ text: true, numQuestions: true, questionType: true }), creditCost: 1 },
  'fact-checker': { flow: factCheckText, schema: FactCheckInputSchema.pick({ text: true }), creditCost: 2 },
  'plagiarism-checker': { flow: plagiarismCheck, schema: PlagiarismCheckInputSchema.pick({ text: true }), creditCost: 2 },
  'citation-generator': { flow: generateCitation, schema: GenerateCitationInputSchema.pick({ sourceText: true, style: true }), creditCost: 1 },
  'ai-researcher': { flow: aiResearcher, schema: AIResearcherInputSchema.pick({ topic: true }).extend({ depth: z.any().optional() }), creditCost: 2 },
  'literature-review': { flow: generateLiteratureReview, schema: LiteratureReviewInputSchema, creditCost: 3 },
  'question-answering': { flow: answerQuestion, schema: QuestionAnsweringInputSchema.pick({ question: true, context: true, useWebSearch: true, maxSources: true }), creditCost: 1 },
  'fact-retrieval': { flow: retrieveFact, schema: FactRetrievalInputSchema.pick({ factQuery: true, useWebSearch: true, requireSource: true }), creditCost: 1 },
  'topic-explainer': { flow: topicExplainer, schema: TopicExplainerInputSchema.pick({ topic: true }), creditCost: 1 },
  'generate-ideas': { flow: generateIdeas, schema: IdeaGenerationInputSchema, creditCost: 1 },
  'write-document': { flow: writeDocument, schema: WriteDocumentInputSchema, creditCost: 3 },
  'generate-plantuml': { flow: generatePlantUML, schema: GeneratePlantUMLInputSchema, creditCost: 1 },
  'rewrite-text': { flow: rewriteText, schema: RewriteTextInputSchema, creditCost: 1 },
  'summarize-with-ratio': { flow: summarizeTextWithRatio, schema: SummarizeTextWithRatioInputSchema, creditCost: 1 },
  'style-editor': { flow: styleEditor, schema: StyleEditorInputSchema, creditCost: 1 },
  'readability-enhancer': { flow: readabilityEnhancer, schema: ReadabilityEnhancerInputSchema, creditCost: 1 },
  'conciseness-checker': { flow: concisenessChecker, schema: ConcisenessCheckerInputSchema, creditCost: 1 },
  'clarity-advisor': { flow: clarityAdvisor, schema: ClarityAdvisorInputSchema, creditCost: 1 },
  'manipulate-text': { flow: manipulateText, schema: ManipulateTextInputSchema, creditCost: 1 },
  'generate-toc': { flow: generateToc, schema: GenerateTocInputSchema, creditCost: 1 },
  'translate-text': { flow: translateText, schema: TranslateTextInputSchema, creditCost: 1 },
  'sentence-structure-checker': { flow: sentenceStructureCheck, schema: SentenceStructureCheckInputSchema, creditCost: 1 },
  'solve-assignments': { flow: solveAssignments, schema: SolveAssignmentsInputSchema, creditCost: 2 },
  'project-blueprint': { flow: generateProjectBlueprint, schema: GenerateProjectBlueprintInputSchema, creditCost: 3 },
  'generate-ui-description': { flow: generateUiDescription, schema: GenerateUIDescriptionInputSchema, creditCost: 2 },
  'generate-chapter': { flow: generateChapterContent, schema: GenerateChapterInputSchema, creditCost: 2 },
} as const;

export type ToolName = keyof typeof toolConfig;

export async function runWritingToolAction(tool: ToolName, data: unknown) {
  const user = await requireUser();
  const config = toolConfig[tool];
  if (!config) throw new Error(`Invalid tool: ${tool}`);
  const validation = config.schema.safeParse(data);
  if (!validation.success) {
    throw new Error('Validation failed');
  }
  const input = validation.data as any;
  const result = await (config.flow as any)(input);
  await deductCredit(user.id, config.creditCost);
  await logGeneration({ agentId: tool, userId: user.id, input, output: result, creditCost: config.creditCost });
  return result;
}
