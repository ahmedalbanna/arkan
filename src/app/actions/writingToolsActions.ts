
'use server';

import { writeDocument } from '@/ai/flows';
import { requireUser } from './_utils/auth';
import { logGeneration } from './analyticsActions';
import { deductCredit } from './userActions';

// Flows
import { aiResearcher, answerQuestion, clarityAdvisor, concisenessChecker, detectAiContent, factCheckText, generateChapterContent, generateCitation, generateIdeas, generateImage, literatureReviewGenerator as generateLiteratureReview, generatePlantUML, generateProjectBlueprint, generateQuiz, generateToc, generateUiDescription, grammarCheck, humanizeText, manipulateText, paraphraseText, plagiarismCheck, readabilityEnhancer, retrieveFact, rewriteText, sentenceStructureCheck, solveAssignments, styleEditor, summarizeText, summarizeTextWithRatio, topicExplainer, translateText } from '@/ai/flows';


// Schemas
import {
  AIResearcherInputSchema,
  ClarityAdvisorInputSchema,
  ConcisenessCheckerInputSchema,
  DetectAIInputSchema,
  FactCheckInputSchema,
  FactRetrievalInputSchema,
  GenerateChapterInputSchema,
  GenerateCitationInputSchema,
  GenerateImageInputSchema,
  GeneratePlantUMLInputSchema,
  GenerateProjectBlueprintInputSchema,
  GenerateQuizInputSchema,
  GenerateTocInputSchema,
  GenerateUIDescriptionInputSchema,
  GrammarCheckInputSchema,
  HumanizeTextInputSchema,
  IdeaGenerationInputSchema,
  LiteratureReviewInputSchema,
  ManipulateTextInputSchema,
  ParaphraseInputSchema,
  PlagiarismCheckInputSchema,
  QuestionAnsweringInputSchema,
  ReadabilityEnhancerInputSchema,
  RewriteTextInputSchema,
  SentenceStructureCheckInputSchema,
  SolveAssignmentsInputSchema,
  StyleEditorInputSchema,
  SummarizeInputSchema,
  SummarizeTextWithRatioInputSchema,
  TopicExplainerInputSchema,
  TranslateTextInputSchema,
  WriteDocumentInputSchema,
} from '@/ai/schemas';

const toolConfig = {
  paraphrase: { flow: paraphraseText, schema: ParaphraseInputSchema, creditCost: 1 },
  summarize: { flow: summarizeText, schema: SummarizeInputSchema, creditCost: 1 },
  humanize: { flow: humanizeText, schema: HumanizeTextInputSchema, creditCost: 1 },
  'ai-detector': { flow: detectAiContent, schema: DetectAIInputSchema, creditCost: 1 },
  'grammar-checker': { flow: grammarCheck, schema: GrammarCheckInputSchema, creditCost: 1 },
  'quiz-generator': { flow: generateQuiz, schema: GenerateQuizInputSchema, creditCost: 1 },
  'fact-checker': { flow: factCheckText, schema: FactCheckInputSchema, creditCost: 2 },
  'plagiarism-checker': { flow: plagiarismCheck, schema: PlagiarismCheckInputSchema, creditCost: 2 },
  'citation-generator': { flow: generateCitation, schema: GenerateCitationInputSchema, creditCost: 1 },
  'ai-researcher': { flow: aiResearcher, schema: AIResearcherInputSchema, creditCost: 2 },
  'literature-review': { flow: generateLiteratureReview, schema: LiteratureReviewInputSchema, creditCost: 3 },
  'question-answering': { flow: answerQuestion, schema: QuestionAnsweringInputSchema, creditCost: 1 },
  'fact-retrieval': { flow: retrieveFact, schema: FactRetrievalInputSchema, creditCost: 1 },
  'topic-explainer': { flow: topicExplainer, schema: TopicExplainerInputSchema, creditCost: 1 },
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
  'generate-image': { flow: generateImage, schema: GenerateImageInputSchema, creditCost: 5 },
} as const;

export type ToolName = keyof typeof toolConfig;

export async function runWritingToolAction(tool: ToolName, data: unknown) {
  const user = await requireUser();
  const config = toolConfig[tool];
  if (!config) throw new Error(`Invalid tool: ${tool}`);

  // The 'flow' property needs to be added for Zod validation to work with discriminated unions
  const dataWithFlow = { ...(data as object), flow: tool };

  const validation = config.schema.safeParse(dataWithFlow);
  if (!validation.success) {
    // Re-throw Zod's formatted error for better debugging
    throw validation.error;
  }

  const input = validation.data as any;

  await deductCredit(user.id, config.creditCost);

  const result = await (config.flow as any)(input);

  await logGeneration({
    agentId: tool,
    userId: user.id,
    input,
    // Truncate image data for logging
    output: tool === 'generate-image' ? { imageUrl: 'data:image/...;base64,...[TRUNCATED]' } : result,
    creditCost: config.creditCost
  });

  return result;
}
