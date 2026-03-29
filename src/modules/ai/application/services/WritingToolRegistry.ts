import { injectable } from "tsyringe";
import {
    paraphraseText, summarizeText, humanizeText, detectAiContent, factCheckText,
    retrieveFact, generateChapterContent, generateImage, generateReportSection,
    imageToText, rewriteDocumentToMarkdown, generateCitation, generateIdeas,
    generatePlantUML, generateProjectBlueprint, generateQuiz, generateToc,
    generateUiDescription, grammarCheck, generateLiteratureReview,
    manipulateText, plagiarismCheck, answerQuestion,
    sentenceStructureCheck, solveAssignments, textStyleTune,
    topicExplainer, translateText, writeDocument, aiResearcher,
    biasCheckText, generateSessionPlan, createLectureUnit, generateTheoreticalLecture,
    rewriteText, summarizeTextWithRatio, readabilityEnhancer, concisenessChecker, clarityAdvisor
} from "@/modules/ai/infrastructure/flows";
import {
    ParaphraseInputSchema, SummarizeInputSchema, HumanizeTextInputSchema,
    DetectAIInputSchema, FactCheckInputSchema, FactRetrievalInputSchema,
    GenerateChapterInputSchema, GenerateImageInputSchema,
    GenerateSectionInputSchema, ImageToTextInputSchema,
    RewriteToMarkdownInputSchema, GenerateCitationInputSchema,
    IdeaGenerationInputSchema, GeneratePlantUMLInputSchema,
    GenerateProjectBlueprintInputSchema, GenerateQuizInputSchema,
    GenerateTocInputSchema, GenerateUIDescriptionInputSchema,
    GrammarCheckInputSchema, LiteratureReviewInputSchema,
    ManipulateTextInputSchema, PlagiarismCheckInputSchema,
    QuestionAnsweringInputSchema, SentenceStructureCheckInputSchema,
    SolveAssignmentsInputSchema, StyleEditorInputSchema as TextStylistInputSchema,
    TopicExplainerInputSchema, TranslateTextInputSchema,
    WriteDocumentInputSchema, AIResearcherInputSchema,
    BiasCheckInputSchema, GenerateSessionPlanInputSchema, CreateLectureUnitInputSchema, GenerateTheoreticalLectureInputSchema,
    RewriteTextInputSchema, SummarizeTextWithRatioInputSchema, ReadabilityEnhancerInputSchema,
    ConcisenessCheckerInputSchema, ClarityAdvisorInputSchema
} from "@/modules/ai/domain/schemas";

export interface ToolConfig {
    flow: any;
    schema: any;
    creditCost: number;
    isFreeForGuests?: boolean;
}

@injectable()
export class WritingToolRegistry {
    private toolConfig: Record<string, ToolConfig> = {
        'paraphrase': { flow: paraphraseText, schema: ParaphraseInputSchema, creditCost: 1, isFreeForGuests: true },
        'summarize': { flow: summarizeText, schema: SummarizeInputSchema, creditCost: 1, isFreeForGuests: true },
        'humanize': { flow: humanizeText, schema: HumanizeTextInputSchema, creditCost: 1, isFreeForGuests: true },
        'ai-detector': { flow: detectAiContent, schema: DetectAIInputSchema, creditCost: 1, isFreeForGuests: true },
        'fact-checker': { flow: factCheckText, schema: FactCheckInputSchema, creditCost: 1, isFreeForGuests: true },
        'fact-retrieval': { flow: retrieveFact, schema: FactRetrievalInputSchema, creditCost: 1, isFreeForGuests: true },
        'generate-chapter-content': { flow: generateChapterContent, schema: GenerateChapterInputSchema, creditCost: 2 },
        'generate-image': { flow: generateImage, schema: GenerateImageInputSchema, creditCost: 5 },
        'generate-report-section': { flow: generateReportSection, schema: GenerateSectionInputSchema, creditCost: 2 },
        'image-to-text': { flow: imageToText, schema: ImageToTextInputSchema, creditCost: 2 },
        'rewrite-document-to-markdown': { flow: rewriteDocumentToMarkdown, schema: RewriteToMarkdownInputSchema, creditCost: 1 },
        'generate-citation': { flow: generateCitation, schema: GenerateCitationInputSchema, creditCost: 1, isFreeForGuests: true },
        'generate-ideas': { flow: generateIdeas, schema: IdeaGenerationInputSchema, creditCost: 1, isFreeForGuests: true },
        'generate-plant-uml': { flow: generatePlantUML, schema: GeneratePlantUMLInputSchema, creditCost: 2 },
        'generate-project-blueprint': { flow: generateProjectBlueprint, schema: GenerateProjectBlueprintInputSchema, creditCost: 3 },
        'generate-quiz': { flow: generateQuiz, schema: GenerateQuizInputSchema, creditCost: 2 },
        'generate-toc': { flow: generateToc, schema: GenerateTocInputSchema, creditCost: 1, isFreeForGuests: true },
        'generate-ui-description': { flow: generateUiDescription, schema: GenerateUIDescriptionInputSchema, creditCost: 2 },
        'grammar-checker': { flow: grammarCheck, schema: GrammarCheckInputSchema, creditCost: 1, isFreeForGuests: true },
        'literature-review-generator': { flow: generateLiteratureReview, schema: LiteratureReviewInputSchema, creditCost: 3 },
        'manipulate-text': { flow: manipulateText, schema: ManipulateTextInputSchema, creditCost: 1, isFreeForGuests: true },
        'paraphraser': { flow: paraphraseText, schema: ParaphraseInputSchema, creditCost: 1, isFreeForGuests: true },
        'plagiarism-checker': { flow: plagiarismCheck, schema: PlagiarismCheckInputSchema, creditCost: 2 },
        'question-answering': { flow: answerQuestion, schema: QuestionAnsweringInputSchema, creditCost: 1, isFreeForGuests: true },
        'sentence-structure-checker': { flow: sentenceStructureCheck, schema: SentenceStructureCheckInputSchema, creditCost: 1, isFreeForGuests: true },
        'solve-assignments': { flow: solveAssignments, schema: SolveAssignmentsInputSchema, creditCost: 2 },
        'summarizer': { flow: summarizeText, schema: SummarizeInputSchema, creditCost: 1, isFreeForGuests: true },
        'text-stylist': { flow: textStyleTune, schema: TextStylistInputSchema, creditCost: 1, isFreeForGuests: true },
        'rewrite-text': { flow: rewriteText, schema: RewriteTextInputSchema, creditCost: 1, isFreeForGuests: true },
        'summarize-ratio': { flow: summarizeTextWithRatio, schema: SummarizeTextWithRatioInputSchema, creditCost: 1, isFreeForGuests: true },
        'readability-enhancer': { flow: readabilityEnhancer, schema: ReadabilityEnhancerInputSchema, creditCost: 1, isFreeForGuests: true },
        'conciseness-checker': { flow: concisenessChecker, schema: ConcisenessCheckerInputSchema, creditCost: 1, isFreeForGuests: true },
        'clarity-advisor': { flow: clarityAdvisor, schema: ClarityAdvisorInputSchema, creditCost: 1, isFreeForGuests: true },
        'topic-explainer': { flow: topicExplainer, schema: TopicExplainerInputSchema, creditCost: 1, isFreeForGuests: true },
        'translator': { flow: translateText, schema: TranslateTextInputSchema, creditCost: 1, isFreeForGuests: true },
        'write-document': { flow: writeDocument, schema: WriteDocumentInputSchema, creditCost: 2 },
        'ai-researcher': { flow: aiResearcher, schema: AIResearcherInputSchema, creditCost: 3 },
        'bias-checker': { flow: biasCheckText, schema: BiasCheckInputSchema, creditCost: 1, isFreeForGuests: true },
        'generate-session-plan': { flow: generateSessionPlan, schema: GenerateSessionPlanInputSchema, creditCost: 2 },
        'lecture-generator': { flow: createLectureUnit, schema: CreateLectureUnitInputSchema, creditCost: 3 },
        'theoretical-lecture': { flow: generateTheoreticalLecture, schema: GenerateTheoreticalLectureInputSchema, creditCost: 2 }
    };

    getTool(name: string): ToolConfig | undefined {
        return this.toolConfig[name];
    }

    getAllTools(): string[] {
        return Object.keys(this.toolConfig);
    }
}
