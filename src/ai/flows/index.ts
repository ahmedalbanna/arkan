
/**
 * Barrel for ai flows - Universal Flow Architecture
 *
 * This file exports the universal flow system that replaces 40+ individual flow files.
 * All flows now use a centralized prompt system and unified execution pattern.
 *
 * For backward compatibility, we export convenience functions that wrap executeFlow.
 */

// Core universal flow exports
export { flowRegistry, type FlowMetadata } from './flow-registry';
export { executeFlow, getAvailableFlows, getFlowMetadata } from './universal-flow';

// Type imports for all flows
import type {
    AiProofreadDocumentInput,
    AiProofreadDocumentOutput,
    AIResearcherInput,
    AIResearcherOutput,
    AnalyzeContextInput,
    AnalyzeContextOutput,
    BiasCheckInput,
    BiasCheckOutput,
    DetectAIInput,
    DetectAIOutput,
    FactCheckInput,
    FactCheckOutput,
    FactRetrievalInput,
    FactRetrievalOutput,
    GenerateAgentConfigInput,
    GenerateAgentConfigOutput,
    GenerateChapterInput,
    GenerateChapterOutput,
    GenerateCitationInput,
    GenerateCitationOutput,
    GeneratePlantUMLInput,
    GeneratePlantUMLOutput,
    GenerateProjectBlueprintInput,
    GenerateProjectBlueprintOutput,
    GenerateQuizInput,
    GenerateQuizOutput,
    GenerateSectionInput,
    GenerateSectionOutput,
    GenerateTextInput,
    GenerateTextOutput,
    GenerateTocInput,
    GenerateTocOutput,
    GenerateUIDescriptionInput,
    GenerateUIDescriptionOutput,
    GrammarCheckInput,
    GrammarCheckOutput,
    HumanizeTextInput,
    HumanizeTextOutput,
    IdeaGenerationInput,
    IdeaGenerationOutput,
    ImageToTextInput,
    ImageToTextOutput,
    ImproveMarkdownInput,
    ImproveMarkdownOutput,
    ManipulateTextInput,
    ManipulateTextOutput,
    ParaphraseInput,
    ParaphraseOutput,
    PlagiarismCheckInput,
    PlagiarismCheckOutput,
    QuestionAnsweringInput,
    QuestionAnsweringOutput,
    RewriteDocumentInput,
    RewriteDocumentOutput,
    RewriteToMarkdownInput,
    RewriteToMarkdownOutput,
    SentenceStructureCheckInput,
    SentenceStructureCheckOutput,
    SolveAssignmentsInput,
    SolveAssignmentsOutput,
    SummarizeDocumentInput,
    SummarizeDocumentOutput,
    SummarizeInput,
    SummarizeOutput,
    TopicExplainerInput,
    TopicExplainerOutput,
    TranslateTextInput,
    TranslateTextOutput,
    WriteDocumentInput,
    WriteDocumentOutput,
} from '@/ai/schemas';

import type {
    CreateLectureUnitInput,
    CreateLectureUnitOutput,
    GenerateSessionPlanInput,
    GenerateSessionPlanOutput,
    GenerateTheoreticalLectureInput,
    GenerateTheoreticalLectureOutput,
} from '@/ai/schemas/lecture-generator';

import { executeFlow } from './universal-flow';

// ============================================================================
// CONVENIENCE FUNCTIONS - Backward Compatible API
// ============================================================================
// These functions provide the same API as the old individual flows,
// but internally use the universal flow system.

// Text Manipulation
export async function summarizeText(input: SummarizeInput): Promise<SummarizeOutput> {
    return executeFlow<SummarizeInput, SummarizeOutput>('summarizeText', input);
}


export async function paraphraseText(input: ParaphraseInput): Promise<ParaphraseOutput> {
    return executeFlow<ParaphraseInput, ParaphraseOutput>('paraphraseText', input);
}

export async function translateText(input: TranslateTextInput): Promise<TranslateTextOutput> {
    return executeFlow<TranslateTextInput, TranslateTextOutput>('translateText', input);
}

export async function manipulateText(input: ManipulateTextInput): Promise<ManipulateTextOutput> {
    return executeFlow<ManipulateTextInput, ManipulateTextOutput>('manipulateText', input);
}

export async function humanizeText(input: HumanizeTextInput): Promise<HumanizeTextOutput> {
    return executeFlow<HumanizeTextInput, HumanizeTextOutput>('humanizeText', input);
}

// Quality Checking
export async function grammarCheck(input: GrammarCheckInput): Promise<GrammarCheckOutput> {
    return executeFlow<GrammarCheckInput, GrammarCheckOutput>('grammarCheck', input);
}

export async function biasCheckText(input: BiasCheckInput): Promise<BiasCheckOutput> {
    return executeFlow<BiasCheckInput, BiasCheckOutput>('biasCheck', input);
}

export async function detectAiContent(input: DetectAIInput): Promise<DetectAIOutput> {
    return executeFlow<DetectAIInput, DetectAIOutput>('detectAiContent', input);
}

export async function factCheckText(input: FactCheckInput): Promise<FactCheckOutput> {
    return executeFlow<FactCheckInput, FactCheckOutput>('factCheck', input);
}

export async function plagiarismCheck(input: PlagiarismCheckInput): Promise<PlagiarismCheckOutput> {
    return executeFlow<PlagiarismCheckInput, PlagiarismCheckOutput>('plagiarismCheck', input);
}

export async function sentenceStructureCheck(input: SentenceStructureCheckInput): Promise<SentenceStructureCheckOutput> {
    return executeFlow<SentenceStructureCheckInput, SentenceStructureCheckOutput>('sentenceStructureCheck', input);
}

// Document Generation
export async function generateText(input: GenerateTextInput, userApiKeys?: Record<string, string>): Promise<GenerateTextOutput> {
    return executeFlow<GenerateTextInput, GenerateTextOutput>('generateText', input, userApiKeys);
}

export async function writeDocument(input: WriteDocumentInput): Promise<WriteDocumentOutput> {
    return executeFlow<WriteDocumentInput, WriteDocumentOutput>('writeDocument', input);
}

export async function summarizeDocument(input: SummarizeDocumentInput): Promise<SummarizeDocumentOutput> {
    return executeFlow<SummarizeDocumentInput, SummarizeDocumentOutput>('summarizeDocument', input);
}

export async function rewriteDocumentToMarkdown(input: RewriteDocumentInput): Promise<RewriteDocumentOutput> {
    return executeFlow<RewriteDocumentInput, RewriteDocumentOutput>('rewriteDocumentToMarkdown', input);
}

export async function rewriteToMarkdown(input: RewriteToMarkdownInput): Promise<RewriteToMarkdownOutput> {
    return executeFlow<RewriteToMarkdownInput, RewriteToMarkdownOutput>('rewriteToMarkdown', input);
}

export async function improveReportMarkdown(input: ImproveMarkdownInput): Promise<ImproveMarkdownOutput> {
    return executeFlow<ImproveMarkdownInput, ImproveMarkdownOutput>('improveReportMarkdown', input);
}

export async function aiProofreadDocument(input: AiProofreadDocumentInput): Promise<AiProofreadDocumentOutput> {
    return executeFlow<AiProofreadDocumentInput, AiProofreadDocumentOutput>('aiProofreadDocument', input);
}
export async function concisenessChecker(input: any): Promise<any> {
    return executeFlow('concisenessChecker', input);
}
export async function clarityAdvisor(input: any): Promise<any> {
    return executeFlow('clarityAdvisor', input);
}
export async function readabilityEnhancer(input: any): Promise<any> {
    return executeFlow('readabilityEnhancer', input);
}
export async function rewriteText(input: any): Promise<any> {
    return executeFlow('rewriteText', input);
}
export async function styleEditor(input: any): Promise<any> {
    return executeFlow('styleEditor', input);
}
// Content Generation
export async function generateIdeas(input: IdeaGenerationInput): Promise<IdeaGenerationOutput> {
    return executeFlow<IdeaGenerationInput, IdeaGenerationOutput>('generateIdeas', input);
}

export async function generateQuiz(input: GenerateQuizInput): Promise<GenerateQuizOutput> {
    return executeFlow<GenerateQuizInput, GenerateQuizOutput>('generateQuiz', input);
}

export async function generateToc(input: GenerateTocInput): Promise<GenerateTocOutput> {
    return executeFlow<GenerateTocInput, GenerateTocOutput>('generateToc', input);
}

export async function generateCitation(input: GenerateCitationInput): Promise<GenerateCitationOutput> {
    return executeFlow<GenerateCitationInput, GenerateCitationOutput>('generateCitation', input);
}

export async function generateChapterContent(input: GenerateChapterInput): Promise<GenerateChapterOutput> {
    return executeFlow<GenerateChapterInput, GenerateChapterOutput>('generateChapterContent', input);
}

export async function generateProjectBlueprint(input: GenerateProjectBlueprintInput): Promise<GenerateProjectBlueprintOutput> {
    return executeFlow<GenerateProjectBlueprintInput, GenerateProjectBlueprintOutput>('generateProjectBlueprint', input);
}

export async function generateUiDescription(input: GenerateUIDescriptionInput): Promise<GenerateUIDescriptionOutput> {
    return executeFlow<GenerateUIDescriptionInput, GenerateUIDescriptionOutput>('generateUiDescription', input);
}

export async function generateReportSection(input: GenerateSectionInput): Promise<GenerateSectionOutput> {
    return executeFlow<GenerateSectionInput, GenerateSectionOutput>('generateReportSection', input);
}

// Research & Analysis
export async function aiResearcher(input: AIResearcherInput): Promise<AIResearcherOutput> {
    return executeFlow<AIResearcherInput, AIResearcherOutput>('aiResearcher', input);
}

export async function retrieveFact(input: FactRetrievalInput): Promise<FactRetrievalOutput> {
    return executeFlow<FactRetrievalInput, FactRetrievalOutput>('factRetrieval', input);
}

export async function literatureReviewGenerator(input: any): Promise<any> {
    return executeFlow('literatureReviewGenerator', input);
}

export async function analyzeContext(input: AnalyzeContextInput): Promise<AnalyzeContextOutput> {
    return executeFlow<AnalyzeContextInput, AnalyzeContextOutput>('analyzeContext', input);
}

export async function topicExplainer(input: TopicExplainerInput): Promise<TopicExplainerOutput> {
    return executeFlow<TopicExplainerInput, TopicExplainerOutput>('topicExplainer', input);
}

export async function answerQuestion(input: QuestionAnsweringInput): Promise<QuestionAnsweringOutput> {
    return executeFlow<QuestionAnsweringInput, QuestionAnsweringOutput>('questionAnswering', input);
}

export async function solveAssignments(input: SolveAssignmentsInput): Promise<SolveAssignmentsOutput> {
    return executeFlow<SolveAssignmentsInput, SolveAssignmentsOutput>('solveAssignments', input);
}

// Lecture & Education
export async function generateTheoreticalLecture(input: GenerateTheoreticalLectureInput): Promise<GenerateTheoreticalLectureOutput> {
    return executeFlow<GenerateTheoreticalLectureInput, GenerateTheoreticalLectureOutput>('generateTheoreticalLecture', input);
}

export async function generateSessionPlan(input: GenerateSessionPlanInput): Promise<GenerateSessionPlanOutput> {
    return executeFlow<GenerateSessionPlanInput, GenerateSessionPlanOutput>('generateSessionPlan', input);
}

export async function createLectureUnit(input: CreateLectureUnitInput): Promise<CreateLectureUnitOutput> {
    // This is a composite flow that calls multiple flows
    const { lectureTopic, subTopics, professorNotes, sessionDuration, numActivities, targetAudience } = input;

    // Step 1: Generate theoretical lecture
    const theoreticalLecture = await generateTheoreticalLecture({
        lectureTopic,
        subTopics,
        professorNotes,
        targetAudience,
    });

    // Step 2: Generate session plan
    const practicalSession = await generateSessionPlan({
        chapterContent: theoreticalLecture.lectureContent,
        sessionDuration,
        numActivities,
        targetAudience,
    });

    return {
        theoreticalLecture,
        practicalSession,
    };
}

// Media & Diagrams
export async function imageToText(input: ImageToTextInput): Promise<ImageToTextOutput> {
    return executeFlow<ImageToTextInput, ImageToTextOutput>('imageToText', input);
}

export async function generatePlantUML(input: GeneratePlantUMLInput): Promise<GeneratePlantUMLOutput> {
    return executeFlow<GeneratePlantUMLInput, GeneratePlantUMLOutput>('generatePlantUML', input);
}

// Config & Utility
export async function generateAgentConfig(input: GenerateAgentConfigInput): Promise<GenerateAgentConfigOutput> {
    return executeFlow<GenerateAgentConfigInput, GenerateAgentConfigOutput>('generateAgentConfig', input);
}

// ============================================================================
// ADVANCED PROFESSIONAL WRITING FLOWS (with Tools Integration)
// ============================================================================

// These flows use professional writing tools for enhanced quality control

export async function academicLiteratureReview(input: {
  topic: string;
  keywords: string[];
  citationStyle: 'APA' | 'MLA' | 'Chicago' | 'Harvard' | 'IEEE';
  focusAreas?: string[];
  minLength?: number;
  includeGaps?: boolean;
}): Promise<{
  literatureReview: string;
  structure: any;
  citations: any;
  qualityMetrics: any;
  metadata: any;
}> {
  // Import the flow directly since it's not in the universal flow system
  const { academicLiteratureReviewFlow } = await import('./academic-literature-review');
  return academicLiteratureReviewFlow(input);
}

export async function academicPaperQualityChecker(input: {
  documentText: string;
  references?: string;
  citationStyle: 'APA' | 'MLA' | 'Chicago' | 'Harvard' | 'IEEE';
  documentType: 'research_paper' | 'thesis' | 'dissertation' | 'essay' | 'review_article';
  checkGrammar?: boolean;
  checkCitations?: boolean;
  checkStructure?: boolean;
  checkReadability?: boolean;
}): Promise<{
  overallScore: number;
  qualityLevel: string;
  scores: any;
  detailedAnalysis: any;
  recommendations: any;
  summary: any;
}> {
  // Import the flow directly since it's not in the universal flow system
  const { academicPaperQualityCheckerFlow } = await import('./academic-paper-quality-checker');
  return academicPaperQualityCheckerFlow(input);
}

export async function professionalDocumentWriter(input: {
  documentType: 'business_report' | 'proposal' | 'white_paper' | 'case_study' | 'executive_summary';
  topic: string;
  purpose: string;
  targetAudience: string;
  keyPoints: string[];
  tone: 'professional' | 'persuasive' | 'neutral' | 'authoritative';
  length: 'short' | 'medium' | 'long';
  includeExecutiveSummary?: boolean;
  includeRecommendations?: boolean;
  additionalContext?: string;
}): Promise<{
  document: string;
  structure: any;
  qualityMetrics: any;
  improvements: any;
}> {
  // Import the flow directly since it's not in the universal flow system
  const { professionalDocumentWriterFlow } = await import('./professional-document-writer');
  return professionalDocumentWriterFlow(input);
}

// Deprecated/Empty exports for backward compatibility
export async function generateImage(input: any): Promise<any> {
    throw new Error('generateImage has been removed. Please use an alternative image generation service.');
}

// Text Stylist functions (legacy - these were multiple functions in one file)
export { summarizeText as summarizeTextWithRatio } from './index';

// Re-export types
export type {
    AiProofreadDocumentInput,
    AiProofreadDocumentOutput,
    AIResearcherInput,
    AIResearcherOutput,
    AnalyzeContextInput,
    AnalyzeContextOutput,
    BiasCheckInput,
    BiasCheckOutput, CreateLectureUnitInput,
    CreateLectureUnitOutput, DetectAIInput,
    DetectAIOutput,
    FactCheckInput,
    FactCheckOutput,
    FactRetrievalInput,
    FactRetrievalOutput,
    GenerateAgentConfigInput,
    GenerateAgentConfigOutput,
    GenerateChapterInput,
    GenerateChapterOutput,
    GenerateCitationInput,
    GenerateCitationOutput,
    GeneratePlantUMLInput,
    GeneratePlantUMLOutput,
    GenerateProjectBlueprintInput,
    GenerateProjectBlueprintOutput,
    GenerateQuizInput,
    GenerateQuizOutput,
    GenerateSectionInput,
    GenerateSectionOutput, GenerateSessionPlanInput,
    GenerateSessionPlanOutput, GenerateTextInput,
    GenerateTextOutput, GenerateTheoreticalLectureInput,
    GenerateTheoreticalLectureOutput, GenerateTocInput,
    GenerateTocOutput,
    GenerateUIDescriptionInput,
    GenerateUIDescriptionOutput,
    GrammarCheckInput,
    GrammarCheckOutput,
    HumanizeTextInput,
    HumanizeTextOutput,
    IdeaGenerationInput,
    IdeaGenerationOutput,
    ImageToTextInput,
    ImageToTextOutput,
    ImproveMarkdownInput,
    ImproveMarkdownOutput,
    ManipulateTextInput,
    ManipulateTextOutput,
    ParaphraseInput,
    ParaphraseOutput,
    PlagiarismCheckInput,
    PlagiarismCheckOutput,
    QuestionAnsweringInput,
    QuestionAnsweringOutput,
    RewriteDocumentInput,
    RewriteDocumentOutput,
    RewriteToMarkdownInput,
    RewriteToMarkdownOutput,
    SentenceStructureCheckInput,
    SentenceStructureCheckOutput,
    SolveAssignmentsInput,
    SolveAssignmentsOutput, SummarizeDocumentInput,
    SummarizeDocumentOutput, SummarizeInput,
    SummarizeOutput, TopicExplainerInput,
    TopicExplainerOutput,
    TranslateTextInput,
    TranslateTextOutput,
    WriteDocumentInput,
    WriteDocumentOutput
};

// ==================== PROJECT DOCUMENTATION FLOWS ====================
export { projectDocumentationGenerator } from './project-documentation-generator';
export { projectReportGenerator } from './project-report-generator';
export { presentationContentCreator } from './presentation-content-creator';
export { readmeGenerator } from './readme-generator';
export { apiDocumentationGenerator } from './api-documentation-generator';
export { changelogGenerator } from './changelog-generator';
export { technicalSpecificationWriter } from './technical-spec-writer';

