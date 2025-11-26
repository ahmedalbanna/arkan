

'use server';

import { z } from 'zod';
import { withAuth, handleApiError, createApiResponse } from '@/lib/utils/api-utils';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';

// Import all flows and schemas
import { paraphraseText } from '@/ai/flows/paraphrase-text';
import { ParaphraseInputSchema } from '@/ai/schemas';
import { summarizeText } from '@/ai/flows/summarize-text';
import { SummarizeInputSchema } from '@/ai/schemas';
import { humanizeText } from '@/ai/flows/humanize-text';
import { HumanizeTextInputSchema } from '@/ai/schemas';
import { detectAiContent } from '@/ai/flows/detect-ai-content';
import { DetectAIInputSchema } from '@/ai/schemas';
import { grammarCheck } from '@/ai/flows/grammar-checker';
import { GrammarCheckInputSchema } from '@/ai/schemas';
import { generateQuiz } from '@/ai/flows/generate-quiz';
import { GenerateQuizInputSchema } from '@/ai/schemas';
import { factCheckText } from '@/ai/flows/fact-checker';
import { FactCheckInputSchema } from '@/ai/schemas';
import { plagiarismCheck } from '@/ai/flows/plagiarism-checker';
import { PlagiarismCheckInputSchema } from '@/ai/schemas';
import { generateCitation } from '@/ai/flows/generate-citation';
import { GenerateCitationInputSchema } from '@/ai/schemas';
import { aiResearcher } from '@/ai/flows/ai-researcher';
import { AIResearcherInputSchema } from '@/ai/schemas';
import { generateLiteratureReview } from '@/ai/flows/literature-review-generator';
import { LiteratureReviewInputSchema } from '@/ai/schemas';
import { answerQuestion } from '@/ai/flows/question-answering';
import { QuestionAnsweringInputSchema } from '@/ai/schemas';
import { retrieveFact } from '@/ai/flows/fact-retrieval';
import { FactRetrievalInputSchema } from '@/ai/schemas';
import { topicExplainer } from '@/ai/flows/topic-explainer';
import { TopicExplainerInputSchema } from '@/ai/schemas';
import { generateIdeas } from '@/ai/flows/generate-ideas';
import { IdeaGenerationInputSchema } from '@/ai/schemas';
import { writeDocument } from '@/ai/flows/write-document';
import { WriteDocumentInputSchema } from '@/ai/schemas';
import { generatePlantUML } from '@/ai/flows/generate-plantuml';
import { GeneratePlantUMLInputSchema } from '@/ai/schemas';
import { rewriteText, summarizeTextWithRatio, styleEditor, readabilityEnhancer, concisenessChecker, clarityAdvisor } from '@/ai/flows/text-stylist';
import { RewriteTextInputSchema, SummarizeTextWithRatioInputSchema, StyleEditorInputSchema, ReadabilityEnhancerInputSchema, ConcisenessCheckerInputSchema, ClarityAdvisorInputSchema } from '@/ai/schemas';
import { manipulateText } from '@/ai/flows/manipulate-text';
import { ManipulateTextInputSchema } from '@/ai/schemas';
import { generateToc } from '@/ai/flows/generate-toc';
import { GenerateTocInputSchema } from '@/ai/schemas';
import { translateText } from '@/ai/flows/translate-text';
import { TranslateTextInputSchema } from '@/ai/schemas';
import { biasCheckText } from '@/ai/flows/bias-checker';
import { BiasCheckInputSchema } from '@/ai/schemas';
import { sentenceStructureCheck } from '@/ai/flows/sentence-structure-checker';
import { SentenceStructureCheckInputSchema } from '@/ai/schemas';
import { solveAssignments } from '@/ai/flows/solve-assignments';
import { SolveAssignmentsInputSchema } from '@/ai/schemas';
import { generateProjectBlueprint } from '@/ai/flows/generate-project-blueprint';
import { GenerateProjectBlueprintInputSchema } from '@/ai/schemas';
import { generateUiDescription } from '@/ai/flows/generate-ui-description';
import { GenerateUIDescriptionInputSchema } from '@/ai/schemas';

// Define a map for tool configurations
const toolConfig = {
  'paraphrase': { flow: paraphraseText, schema: ParaphraseInputSchema, creditCost: 1 },
  'summarize': { flow: summarizeText, schema: SummarizeInputSchema, creditCost: 1 },
  'humanize': { flow: humanizeText, schema: HumanizeTextInputSchema, creditCost: 1 },
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
  'bias-checker': { flow: biasCheckText, schema: BiasCheckInputSchema, creditCost: 1 },
  'sentence-structure-checker': { flow: sentenceStructureCheck, schema: SentenceStructureCheckInputSchema, creditCost: 1 },
  'solve-assignments': { flow: solveAssignments, schema: SolveAssignmentsInputSchema, creditCost: 2 },
  'project-blueprint': { flow: generateProjectBlueprint, schema: GenerateProjectBlueprintInputSchema, creditCost: 3 },
  'generate-ui-description': { flow: generateUiDescription, schema: GenerateUIDescriptionInputSchema, creditCost: 2 },
};

type ToolName = keyof typeof toolConfig;

export const POST = withAuth(async ({ request, user, params }) => {
  const toolName = params.tool as ToolName;

  const config = toolConfig[toolName];
  if (!config) {
    return handleApiError({ message: `Invalid tool: ${toolName}` }, 400);
  }

  const { flow, schema, creditCost } = config;

  try {
    const body = await request.json();
    const validation = schema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }

    const result = await flow(validation.data as any);

    await deductCredit(user.id, creditCost);

    await logGeneration({
      agentId: toolName,
      userId: user.id,
      input: validation.data,
      output: result,
      creditCost: creditCost,
    });

    return createApiResponse(result, 200);

  } catch (error) {
    return handleApiError(error);
  }
});
