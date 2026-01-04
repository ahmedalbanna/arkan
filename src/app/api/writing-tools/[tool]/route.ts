
'use server';

import { createApiResponse, handleApiError, withAuth } from '@/lib/utils/api-utils';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';

// Import all flows and schemas
import { aiResearcher } from '@/ai/flows/ai-researcher';
import { biasCheckText } from '@/ai/flows/bias-checker';
import { generateChapterContent } from '@/ai/flows/generate-chapter-content';
import { detectAiContent } from '@/ai/flows/detect-ai-content';
import { factCheckText } from '@/ai/flows/fact-checker';
import { retrieveFact } from '@/ai/flows/fact-retrieval';
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
import { AIResearcherInputSchema, BiasCheckInputSchema, ClarityAdvisorInputSchema, ConcisenessCheckerInputSchema, DetectAIInputSchema, FactCheckInputSchema, FactRetrievalInputSchema, GenerateCitationInputSchema, GeneratePlantUMLInputSchema, GenerateProjectBlueprintInputSchema, GenerateQuizInputSchema, GenerateTocInputSchema, GenerateUIDescriptionInputSchema, GrammarCheckInputSchema, HumanizeTextInputSchema, IdeaGenerationInputSchema, LiteratureReviewInputSchema, ManipulateTextInputSchema, ParaphraseInputSchema, PlagiarismCheckInputSchema, QuestionAnsweringInputSchema, ReadabilityEnhancerInputSchema, RewriteTextInputSchema, SentenceStructureCheckInputSchema, SolveAssignmentsInputSchema, StyleEditorInputSchema, SummarizeInputSchema, SummarizeTextWithRatioInputSchema, TopicExplainerInputSchema, TranslateTextInputSchema, WriteDocumentInputSchema, GenerateChapterInputSchema } from '@/ai/schemas';
import { z } from 'genkit';
import { configureUserAi } from '@/ai/genkit';
import { generateImage } from '@/ai/flows/generate-image';

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
  'generate-chapter': { flow: generateChapterContent, schema: GenerateChapterInputSchema, creditCost: 2 },
  'generate-project-from-full-prompt': { 
    flow: (data: { fullPrompt: string }, userApiKeys?: Record<string, string>) => {
      const ai = configureUserAi(userApiKeys);
      return ai.generate({ model: 'googleai/gemini-2.5-flash-lite', prompt: data.fullPrompt });
    },
    schema: z.object({ fullPrompt: z.string() }),
    creditCost: 5, // Higher cost for a full project build
  },
};

type ToolName = keyof typeof toolConfig;

function getSampleOutput(toolName: ToolName, input: any) {
  switch (toolName) {
    case 'paraphrase':
      return { paraphrasedText: `This is a hardcoded paraphrased version of the original text in a ${input.mode} style.` };
    case 'summarize':
      return { summary: `This is a hardcoded ${input.length} summary of the provided text.` };
    case 'humanize':
      return { humanizedText: "This is a sample humanized text, designed to sound natural and less like it was generated by an AI. It uses varied sentence structures and a more conversational tone." };
    case 'ai-detector':
      return { score: 42, analysis: "The text shows some signs of AI generation, like uniform sentence length, but also contains enough variation to be considered likely human-written. This is a sample response." };
    case 'grammar-checker':
      return {
        correctedText: input.text.replace(/eror/g, 'error').replace(/mistak/g, 'mistake'),
        corrections: [{ original: 'eror', corrected: 'error', explanation: 'Spelling mistake.', type: 'spelling' }],
        statistics: { total: 1, grammar: 0, spelling: 1, punctuation: 0 }
      };
    case 'quiz-generator':
      return { questions: [{ type: 'multiple-choice', question: 'What is the capital of France (Sample)?', options: ['Paris', 'London', 'Berlin', 'Madrid'], answer: 'Paris' }] };
    case 'fact-checker':
        return {
            claims: [{ statement: 'The sky is blue.', status: 'Verified', source: 'wikipedia.org', explanation: 'Based on Rayleigh scattering.' }],
            originalityScore: 95
        };
    case 'plagiarism-checker':
        return {
            originalityScore: 85,
            matches: [{ source: 'https://example.com/source-one', title: 'Example Source 1', summary: 'A small portion of the text about general concepts matches this source.', similarity: 15 }, { source: 'https://anotherexample.com/article', title: 'Another Article', summary: 'This article discusses a similar topic, leading to a minor overlap in phrasing.', similarity: 10 }]
        };
    case 'citation-generator':
        return { citations: [`Sample, A. (${new Date().getFullYear()}). Hardcoded citation example. Journal of Testing, 1(1), 1-10.`] };
    case 'ai-researcher':
        return {
            summary: "This is a sample research summary about '" + input.topic + "'.",
            keyPoints: ["Key Point 1", "Key Point 2"],
            sources: ["https://example.com/source1", "https://example.com/source2"]
        };
    case 'topic-explainer':
        return { explanation: `# Explanation of ${input.topic}\n\nThis is a hardcoded explanation. It breaks down the topic into simple terms.` };
    case 'generate-ideas':
        return { markdown: `## Idea 1\n\nThis is a great idea based on your specialization in ${input.specialization}.` };
    case 'write-document':
        return { documentContent: `# ${input.topic}\n\nThis is a sample document about your topic.` };
    case 'generate-plantuml':
        return { plantUmlCode: '@startuml\nactor User\nUser -> System: Hardcoded Test\n@enduml', explanation: 'This is a sample diagram.' };
    case 'solve-assignments':
        return { solutions: `## Question 1\n\nThis is the sample solution to the first question.` };
    case 'project-blueprint':
        return { blueprint: `# Project Blueprint for ${input.projectName}\n\nThis is a hardcoded project blueprint.` };
    case 'generate-ui-description':
        return { uiDescription: `## Home Page\n- **Purpose**: To welcome users.\n- **Elements**: Welcome message, login button.` };
    default:
      return { message: `This is a hardcoded test response for the '${toolName}' tool.` };
  }
}

export const POST = withAuth(async ({ request, user, params }) => {
  const toolName = (await params).tool as ToolName;

  const config = toolConfig[toolName];
  if (!config) {
    return handleApiError({ message: `Invalid tool: ${toolName}` }, 400);
  }

  const { schema } = config;

  try {
    const body = await request.json();
    const validation = schema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }
    
    // Hardcoded response for testing
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
    const result = getSampleOutput(toolName, validation.data);

    // This part is now effectively skipped for testing, but kept for when you switch back
    // const result = await flow(validation.data as any, user.apiKeys);
    // await deductCredit(user.id, creditCost);
    // await logGeneration({
    //   agentId: toolName,
    //   userId: user.id,
    //   input: validation.data,
    //   output: result,
    //   creditCost: creditCost,
    // });

    return createApiResponse(result, 200);

  } catch (error) {
    return handleApiError(error);
  }
});
