
'use server';

import { createApiResponse, handleApiError, withAuth } from '@/lib/utils/api-utils';

// Import all flows and schemas
import { aiResearcher } from '@/ai/flows/ai-researcher';
import { biasCheckText } from '@/ai/flows/bias-checker';
import { detectAiContent } from '@/ai/flows/detect-ai-content';
import { factCheckText } from '@/ai/flows/fact-checker';
import { retrieveFact } from '@/ai/flows/fact-retrieval';
import { generateChapterContent } from '@/ai/flows/generate-chapter-content';
import { generateCitation } from '@/ai/flows/generate-citation';
import { generateIdeas } from '@/ai/flows/generate-ideas';
import { generatePlantUML } from '@/ai/flows/generate-plantuml';
import { generateProjectBlueprint } from '@/ai/flows/generate-project-blueprint';
import { generateQuiz } from '@/ai/flows/generate-quiz';
import { generateToc } from '@/ai/flows/generate-toc';
import { generateUiDescription } from '@/ai/flows/generate-ui-description';
import { grammarCheck } from '@/ai/flows/grammar-checker';
import { humanizeText } from '@/ai/flows/humanize-text';
import { generateLiteratureReview } from '@/ai/flows/literature-review-generator';
import { manipulateText } from '@/ai/flows/manipulate-text';
import { paraphraseText } from '@/ai/flows/paraphrase-text';
import { plagiarismCheck } from '@/ai/flows/plagiarism-checker';
import { answerQuestion } from '@/ai/flows/question-answering';
import { sentenceStructureCheck } from '@/ai/flows/sentence-structure-checker';
import { solveAssignments } from '@/ai/flows/solve-assignments';
import { summarizeText } from '@/ai/flows/summarize-text';
import { clarityAdvisor, concisenessChecker, readabilityEnhancer, rewriteText, styleEditor, summarizeTextWithRatio } from '@/ai/flows/text-stylist';
import { topicExplainer } from '@/ai/flows/topic-explainer';
import { translateText } from '@/ai/flows/translate-text';
import { writeDocument } from '@/ai/flows/write-document';
import { AIResearcherInputSchema, BiasCheckInputSchema, ClarityAdvisorInputSchema, ConcisenessCheckerInputSchema, DetectAIInputSchema, FactCheckInputSchema, FactRetrievalInputSchema, GenerateChapterInputSchema, GenerateCitationInputSchema, GeneratePlantUMLInputSchema, GenerateProjectBlueprintInputSchema, GenerateQuizInputSchema, GenerateTocInputSchema, GenerateUIDescriptionInputSchema, GrammarCheckInputSchema, HumanizeTextInputSchema, IdeaGenerationInputSchema, LiteratureReviewInputSchema, ManipulateTextInputSchema, ParaphraseInputSchema, PlagiarismCheckInputSchema, QuestionAnsweringInputSchema, ReadabilityEnhancerInputSchema, RewriteTextInputSchema, SentenceStructureCheckInputSchema, SolveAssignmentsInputSchema, StyleEditorInputSchema, SummarizeInputSchema, SummarizeTextWithRatioInputSchema, TopicExplainerInputSchema, TranslateTextInputSchema, WriteDocumentInputSchema } from '@/ai/schemas';

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
  'generate-chapter': { flow: generateChapterContent, schema: GenerateChapterInputSchema, creditCost: 2 }, // Added new flow
};

type ToolName = keyof typeof toolConfig;

import { container } from '@/infrastructure/di/container';
import { AiController } from '@/modules/ai/adapters/controllers/AiController';

export const POST = withAuth(async ({ request, user, params }) => {
  const toolName = (await params).tool as ToolName;

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

    const controller = container.resolve(AiController);
    const result = await controller.runTool<any, any>({
        userId: user.id,
        toolName,
        input: validation.data as any,
        flow: flow as any,
        creditCost
    });

    return createApiResponse(result, 200);

  } catch (error) {
    return handleApiError(error);
  }
});
