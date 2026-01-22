import { z } from 'zod';
import { BaseContextFileSchema, BaseControlsSchema, BaseExternalContextSchema, BaseGenerationSchema, BasePromptSchema, BaseTextInputSchema, BaseTopicInputSchema, BaseWebSearchSchema } from './base-schemas';
import {
    AcademicDocumentTypeSchema,
    AcademicSectionSchema,
    AcademicStyleSchema,
    BiasTypeSchema,
    CitationStyleSchema,
    ClaimStatusSchema,
    ConfidenceLevelSchema,
    DesignTypeSchema,
    DiagramTypeSchema,
    DirectQuestionTypeSchema,
    FeedbackStatusSchema,
    MultipleChoiceTypeSchema,
    ParaphraseModeSchema,
    ProjectComplexitySchema,
    QuestionTypeSchema,
    ResearchDepthSchema,
    ResearchMethodologySchema,
    SectionNameSchema,
    SentenceVarietySchema,
    SummarizeLengthSchema,
    TargetLanaguage,
    TargetReadingLevelSchema,
    TrueFalseAnswerSchema,
    TrueFalseTypeSchema,
} from './enums';


// ============================================================================
// INDIVIDUAL FLOW SCHEMAS (EXTENDING BASE SCHEMAS)
// ============================================================================

export const ParaphraseInputSchema = BaseTextInputSchema.extend({
    flow: z.literal('paraphrase'),
    mode: ParaphraseModeSchema.describe('The desired style of the paraphrased text.'),
    instruction: z.string().optional(), // Added for runtime prompt construction
}).merge(BaseControlsSchema);
export const ParaphraseOutputSchema = z.object({
    paraphrasedText: z.string().describe('The rewritten text, with original markdown formatting preserved.'),
});
export type ParaphraseInput = z.infer<typeof ParaphraseInputSchema>;
export type ParaphraseOutput = z.infer<typeof ParaphraseOutputSchema>;

export const SummarizeInputSchema = BaseTextInputSchema.extend({
    flow: z.literal('summarize'),
    length: SummarizeLengthSchema.describe('The desired length of the summary.'),
}).merge(BaseControlsSchema);
export const SummarizeOutputSchema = z.object({
    summary: z.string().describe('The generated summary of the original text.'),
});
export type SummarizeInput = z.infer<typeof SummarizeInputSchema>;
export type SummarizeOutput = z.infer<typeof SummarizeOutputSchema>;

// ai-proofread-document.ts
export const AiProofreadDocumentInputSchema = z.object({
    flow: z.literal('ai-proofread-document'),
    documentText: z
        .string()
        .describe('The text content of the document to be proofread.'),
    constraints: z
        .string()
        .optional()
        .describe(
            'Optional constraints to tailor the proofreading suggestions, such as specific style guidelines or target audience.'
        ),
});
export type AiProofreadDocumentInput = z.infer<typeof AiProofreadDocumentInputSchema>;

export const AiProofreadDocumentOutputSchema = z.object({
    proofreadDocument: z
        .string()
        .describe('The proofread document with suggested corrections.'),
});
export type AiProofreadDocumentOutput = z.infer<typeof AiProofreadDocumentOutputSchema>;

// ai-researcher.ts
export const AIResearcherInputSchema = BaseTopicInputSchema.extend({
    flow: z.literal('ai-researcher'),
    depth: ResearchDepthSchema.optional().describe('The depth of research to conduct.'),
});
export type AIResearcherInput = z.infer<typeof AIResearcherInputSchema>;

export const AIResearcherOutputSchema = z.object({
    summary: z.string().describe('A comprehensive summary of the research topic.'),
    keyPoints: z.array(z.string()).describe('A list of key points or facts about the topic.'),
    sources: z.array(z.string()).describe('A list of URLs for the sources used.'),
    methodology: z.string().optional().describe('A brief description of the research methodology used.'),
    findings: z.array(z.string()).optional().describe('Detailed findings from the research.'),
});
export type AIResearcherOutput = z.infer<typeof AIResearcherOutputSchema>;

// solve-assignments.ts
export const SolveAssignmentsInputSchema = BaseTextInputSchema.extend({
    flow: z.literal('solve-assignments'),
});
export type SolveAssignmentsInput = z.infer<typeof SolveAssignmentsInputSchema>;

export const SolveAssignmentsOutputSchema = z.object({
    solutions: z.string().describe('The comprehensive solutions to all identified questions and problems in markdown format.'),
});
export type SolveAssignmentsOutput = z.infer<typeof SolveAssignmentsOutputSchema>;

// generate-project-blueprint.ts
export const GenerateProjectBlueprintInputSchema = z.object({
    flow: z.literal('generate-project-blueprint'),
    projectName: z.string().describe('The name of the project/application to be developed.'),
    projectType: z.string().describe('Type of project (e.g., Web Application, Mobile App, E-commerce, Blog, Portfolio).'),
    description: z.string().describe('Detailed description of the project requirements and vision.'),
    targetAudience: z.string().describe('Description of the target users and audience for the project.'),
    complexity: ProjectComplexitySchema.describe('Project complexity level.'),
    features: z.string().describe('List of desired features and functionalities.'),
    techStack: z.string().optional().describe('Preferred technology stack or specific requirements.'),
    budget: z.string().optional().describe('Budget range or constraints.'),
    timeline: z.string().optional().describe('Project timeline or deadline requirements.'),
});
export type GenerateProjectBlueprintInput = z.infer<typeof GenerateProjectBlueprintInputSchema>;

export const GenerateProjectBlueprintOutputSchema = z.object({
    blueprint: z.string().describe('Comprehensive project blueprint in markdown format with architecture, features, timeline, and implementation details.'),
});
export type GenerateProjectBlueprintOutput = z.infer<typeof GenerateProjectBlueprintOutputSchema>;

// literature-review-generator.ts
export const LiteratureReviewInputSchema = BaseTopicInputSchema.extend({
    flow: z.literal('literature-review'),
    focusAreas: z.array(z.string()).optional().describe('Specific areas or themes to focus on in the review.'),
    numberOfSources: z.number().int().min(5).max(50).optional().describe('Desired number of sources to include (default: 10).'),
    timeRange: z.string().optional().describe('Time range for sources (e.g., "last 5 years", "2020-2024").'),
});
export type LiteratureReviewInput = z.infer<typeof LiteratureReviewInputSchema>;

export const LiteratureReviewOutputSchema = z.object({
    introduction: z.string().describe('An introduction to the literature review.'),
    mainBody: z.string().describe('The main body of the literature review, organized by themes or topics.'),
    conclusion: z.string().describe('A conclusion summarizing key findings and gaps in the literature.'),
    sources: z.array(z.object({
        title: z.string().describe('Title of the source.'),
        url: z.string().url().describe('URL of the source.'),
        summary: z.string().describe('Brief summary of the source.'),
        relevance: z.string().describe('Why this source is relevant to the topic.'),
    })).describe('An array of sources used in the literature review.'),
    gaps: z.array(z.string()).optional().describe('Identified gaps in the current literature.'),
});
export type LiteratureReviewOutput = z.infer<typeof LiteratureReviewOutputSchema>;

// question-answering.ts
export const QuestionAnsweringInputSchema = z
    .object({
        flow: z.literal('question-answering'),
        question: z.string().describe('The question to answer.'),
        context: z
            .string()
            .optional()
            .describe('Optional context text to base the answer on. If provided, answer based on this text.'),
    })
    .merge(BaseWebSearchSchema);
export type QuestionAnsweringInput = z.infer<typeof QuestionAnsweringInputSchema>;

export const QuestionAnsweringOutputSchema = z.object({
    answer: z.string().describe('A comprehensive answer to the question.'),
    confidence: ConfidenceLevelSchema.describe('Confidence level in the answer.'),
    sources: z.array(z.object({
        url: z.string().url().describe('URL of the source.'),
        title: z.string().optional().describe('Title of the source.'),
        relevance: z.string().optional().describe('Why this source is relevant.'),
    })).optional().describe('Sources used to answer the question.'),
    contextUsed: z.boolean().describe('Whether the provided context was used in the answer.'),
    additionalNotes: z.string().optional().describe('Any additional notes or caveats about the answer.'),
});
export type QuestionAnsweringOutput = z.infer<typeof QuestionAnsweringOutputSchema>;

// fact-retrieval.ts
export const FactRetrievalInputSchema = z.object({
    flow: z.literal('fact-retrieval'),
    factQuery: z.string().describe('The specific fact or information to retrieve (e.g., "population of Japan", "date of first moon landing").'),
    useWebSearch: z.boolean().optional().default(true).describe('Whether to search the web for the fact.'),
    requireSource: z.boolean().optional().default(true).describe('Whether to require a source for the fact.'),
});
export type FactRetrievalInput = z.infer<typeof FactRetrievalInputSchema>;

export const FactRetrievalOutputSchema = z.object({
    fact: z.string().describe('The retrieved fact or information.'),
    source: z.string().url().optional().describe('URL of the source for this fact.'),
    sourceTitle: z.string().optional().describe('Title of the source.'),
    lastVerified: z.string().optional().describe('When this fact was last verified or the date of the source.'),
    confidence: z.enum(['high', 'medium', 'low']).describe('Confidence level in the accuracy of the fact.'),
    relatedFacts: z.array(z.string()).optional().describe('Related facts that might be of interest.'),
});
export type FactRetrievalOutput = z.infer<typeof FactRetrievalOutputSchema>;

// analyze-context.ts
export const AnalyzeContextInputSchema = BasePromptSchema.extend({
    flow: z.literal('analyze-context'),
    contextFiles: z.array(BaseContextFileSchema).describe(
        'An array of context files (text, images, PDFs as data URIs) to be analyzed.'
    ),
});
export type AnalyzeContextInput = z.infer<typeof AnalyzeContextInputSchema>;

export const AnalyzeContextOutputSchema = z.object({
    schema: z.string().describe("A Zod schema string that defines the structure of the output data. This schema should be dynamically generated based on the user's prompt."),
    data: z.any().describe("The structured data, conforming to the generated schema, extracted and synthesized from the context files based on the user's prompt."),
});
export type AnalyzeContextOutput = z.infer<typeof AnalyzeContextOutputSchema>;

// bias-checker.ts
export const BiasCheckInputSchema = BaseTextInputSchema.extend({
    flow: z.literal('bias-checker'),
}).merge(BaseControlsSchema);
export type BiasCheckInput = z.infer<typeof BiasCheckInputSchema>;

export const BiasIssueSchema = z.object({
    phrase: z.string().describe('The potentially biased phrase or sentence.'),
    explanation: z.string().describe('An explanation of why the phrase might be considered biased.'),
    suggestion: z.string().describe('A more inclusive alternative.'),
    biasType: BiasTypeSchema.describe('The type of bias identified.'),
});
export type BiasIssue = z.infer<typeof BiasIssueSchema>;

export const BiasCheckOutputSchema = z.object({
    issues: z.array(BiasIssueSchema).describe('An array of identified bias issues.'),
    overallAssessment: z.string().describe('A brief, overall assessment of the text\'s inclusivity.'),
    inclusivityScore: z.number().min(0).max(100).describe('A score from 0 to 100 representing the inclusivity of the text, where 100 is completely inclusive.'),
});
export type BiasCheckOutput = z.infer<typeof BiasCheckOutputSchema>;

// sentence-structure-checker.ts
export const SentenceStructureCheckInputSchema = BaseTextInputSchema.extend({
    flow: z.literal('sentence-structure-checker'),
}).merge(BaseControlsSchema);
export type SentenceStructureCheckInput = z.infer<typeof SentenceStructureCheckInputSchema>;

export const SentenceStructureIssueSchema = z.object({
    sentence: z.string().describe('The problematic sentence.'),
    issue: z.string().describe('A brief description of the issue (e.g., "Too long", "Too short/choppy", "Complex").'),
    suggestion: z.string().describe('A suggestion for how to improve or rewrite the sentence.'),
});
export type SentenceStructureIssue = z.infer<typeof SentenceStructureIssueSchema>;

export const SentenceStructureCheckOutputSchema = z.object({
    statistics: z.object({
        sentenceCount: z.number().describe('Total number of sentences.'),
        averageSentenceLength: z.number().describe('Average number of words per sentence.'),
        shortestSentence: z.number().describe('Length of the shortest sentence in words.'),
        longestSentence: z.number().describe('Length of the longest sentence in words.'),
    }).describe('Basic statistics about the text.'),
    varietyAssessment: z.object({
        lengthVariety: SentenceVarietySchema.describe('Assessment of sentence length variation.'),
        structureVariety: SentenceVarietySchema.describe('Assessment of sentence structure variation (simple, compound, complex).'),
    }).describe('Analysis of sentence variety.'),
    issues: z.array(SentenceStructureIssueSchema).describe('An array of identified issues with specific sentences.'),
    overallAssessment: z.string().describe('A brief, overall assessment of the sentence structure.'),
});
export type SentenceStructureCheckOutput = z.infer<typeof SentenceStructureCheckOutputSchema>;

// detect-ai-content.ts
export const DetectAIInputSchema = BaseTextInputSchema.extend({
    flow: z.literal('detect-ai-content'),
}).merge(BaseControlsSchema);
export type DetectAIInput = z.infer<typeof DetectAIInputSchema>;

export const DetectAIOutputSchema = z.object({
    score: z.number().min(0).max(100).describe('The probability score (0-100) that the text was written by an AI.'),
    analysis: z.string().describe('A brief analysis explaining the reasoning behind the score.'),
});
export type DetectAIOutput = z.infer<typeof DetectAIOutputSchema>;


// fact-checker.ts
export const ClaimSchema = z.object({
    statement: z.string().describe("The specific claim extracted from the text."),
    status: ClaimStatusSchema.describe("The verification status of the claim."),
    source: z.string().describe("The URL of the most reliable source found to verify the claim."),
    explanation: z.string().describe("A brief explanation of why the claim was given its status, based on the source.")
});

export const FactCheckInputSchema = BaseTextInputSchema.extend({
    flow: z.literal('fact-checker'),
});
export type FactCheckInput = z.infer<typeof FactCheckInputSchema>;

export const FactCheckOutputSchema = z.object({
    claims: z.array(ClaimSchema).describe("An array of identified claims and their verification details."),
    originalityScore: z.number().min(0).max(100).describe("An overall score from 0 to 100 representing the factual accuracy and originality of the text, where 100 is completely accurate.")
});
export type FactCheckOutput = z.infer<typeof FactCheckOutputSchema>;

// generate-agent-config.ts
export const GenerateAgentConfigInputSchema = BasePromptSchema.extend({
    flow: z.literal('generate-agent-config'),
    includeJsonOutput: z.boolean().optional().describe(
        "Whether to include a sample JSON output structure in the agent's prompt."
    ),
    contextFiles: z
        .array(BaseContextFileSchema)
        .optional()
        .describe("An array of contextual documents (text, images) to inform the agent's creation."),
});

export const GenerateAgentConfigOutputSchema = z.object({
    name: z.string().describe("A short, descriptive name for the new agent."),
    description: z.string().describe("A concise, one-sentence description of the agent's purpose."),
    instructions: z.string().describe("The base prompt or primary instruction for the agent. This should be a clear, concise paragraph explaining the agent's purpose and core function."),
    guidelines: z.string().describe("A newline-separated list of 3-5 specific, actionable guidelines for the agent to follow. Each guideline should start with '- '."),
    jsonStructure: z.any().optional().describe("If the user requested JSON output, provide a sample JSON object structure that the agent should return. It should be a simple but relevant example based on the user's prompt and any provided context. Otherwise, this field should be omitted."),
});
export type GenerateAgentConfigOutput = z.infer<typeof GenerateAgentConfigOutputSchema>;
export type GenerateAgentConfigInput = z.infer<typeof GenerateAgentConfigInputSchema>;


// generate-citation.ts
export const GenerateCitationInputSchema = z.object({
    flow: z.literal('generate-citation'),
    sourceText: z.string().describe('The source material to generate a citation for. This can be a URL, a block of text from an article, or a book title and author.'),
    style: CitationStyleSchema.describe('The citation style to use (e.g., APA, MLA).'),
});
export type GenerateCitationInput = z.infer<typeof GenerateCitationInputSchema>;

export const GenerateCitationOutputSchema = z.object({
    citations: z.array(z.string().describe('A single formatted citation string.'))
        .describe('An array of formatted citation strings, one for each source found in the input.'),
});
export type GenerateCitationOutput = z.infer<typeof GenerateCitationOutputSchema>;

// generate-diagrams.ts
export const GenerateDiagramInputSchema = z
    .object({
        flow: z.literal('generate-diagram'),
        diagramToGenerate: DiagramTypeSchema.describe('The type of diagram to generate.'),
        otherSections: z
            .record(SectionNameSchema, z.string())
            .optional()
            .describe('A map of previously generated text sections to provide context.'),
        otherDiagrams: z
            .record(DiagramTypeSchema, z.string())
            .optional()
            .describe('A map of previously generated PlantUML diagrams to provide context.'),
    })
    .merge(BaseGenerationSchema);
export type GenerateDiagramInput = z.infer<typeof GenerateDiagramInputSchema>;

export const GenerateDiagramOutputSchema = z.object({
    plantUmlCode: z.string().describe("The complete PlantUML code for the diagram, starting with @startuml and ending with @enduml."),
    explanation: z.string().describe("A detailed explanation of the generated diagram, formatted in markdown."),
});
export type GenerateDiagramOutput = z.infer<typeof GenerateDiagramOutputSchema>;

// generate-plantuml.ts
export const GeneratePlantUMLInputSchema = z.object({
    flow: z.literal('generate-plantuml'),
    description: z.string().describe("A detailed text description of the diagram to be generated."),
    diagramType: DiagramTypeSchema.describe("The type of PlantUML diagram to generate."),
});
export type GeneratePlantUMLInput = z.infer<typeof GeneratePlantUMLInputSchema>;

// We can reuse the output schema from generate-diagrams
export const GeneratePlantUMLOutputSchema = GenerateDiagramOutputSchema;
export type GeneratePlantUMLOutput = z.infer<typeof GeneratePlantUMLOutputSchema>;


// generate-image.ts
export const GenerateImageInputSchema = BasePromptSchema.extend({
    flow: z.literal('generate-image'),
});
export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;

export const GenerateImageOutputSchema = z.object({
    imageUrl: z.string().describe("The generated image as a Base64 data URI."),
});
export type GenerateImageOutput = z.infer<typeof GenerateImageOutputSchema>;

// generate-ideas.ts
export const IdeaGenerationInputSchema = z
    .object({
        flow: z.literal('generate-ideas'),
        specialization: z
            .string()
            .describe(
                'The user\'s field of expertise or specialization (e.g., "Web Development", "Marketing", "Biotechnology").',
            ),
        domain: z
            .string()
            .optional()
            .describe('The specific industry or domain of interest (e.g., "E-commerce", "Healthcare", "Education").'),
        region: z
            .string()
            .optional()
            .describe('The geographical region or country to target (e.g., "Southeast Asia", "Germany").'),
        circumstances: z
            .string()
            .optional()
            .describe(
                'Any specific circumstances, trends, or constraints (e.g., "post-pandemic recovery", "rising inflation", "remote work transition").',
            ),
        additionalContext: z
            .string()
            .optional()
            .describe('Any other relevant information or detailed context provided by the user.'),
    })
    .merge(BaseControlsSchema);
export type IdeaGenerationInput = z.infer<typeof IdeaGenerationInputSchema>;

export const IdeaGenerationOutputSchema = z.object({
    markdown: z.string().describe('A markdown formatted string of generated ideas, each with a title and description.'),
});
export type IdeaGenerationOutput = z.infer<typeof IdeaGenerationOutputSchema>;


// generate-quiz.ts
const MultipleChoiceQuestionSchema = z.object({
    type: MultipleChoiceTypeSchema,
    question: z.string().describe("The question text."),
    options: z.array(z.string()).length(4).describe("An array of 4 possible answers."),
    answer: z.string().describe("The correct answer from the options."),
});

const TrueFalseQuestionSchema = z.object({
    type: TrueFalseTypeSchema,
    question: z.string().describe("The statement to be evaluated."),
    options: z.array(z.string()).length(2).describe("The options: an array containing 'True' and 'False'."),
    answer: TrueFalseAnswerSchema.describe("The correct answer, either 'True' or 'False'."),
});

const DirectQuestionSchema = z.object({
    type: DirectQuestionTypeSchema,
    question: z.string().describe("The open-ended question."),
    answer: z.string().describe("A concise, ideal answer to the question."),
});

export const QuizQuestionSchema = z.discriminatedUnion('type', [
    MultipleChoiceQuestionSchema,
    TrueFalseQuestionSchema,
    DirectQuestionSchema,
]);

export const GenerateQuizInputSchema = BaseTextInputSchema.extend({
    flow: z.literal('generate-quiz'),
    numQuestions: z.number().int().min(1).max(20).describe('The number of questions to generate.'),
    questionType: QuestionTypeSchema.describe('The type of questions to generate.'),
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

export const GenerateQuizOutputSchema = z.object({
    questions: z.array(QuizQuestionSchema).describe("An array of quiz questions of the specified type."),
});
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;

// generate-report-section.ts
export const GenerateSectionInputSchema = z
    .object({
        sectionToGenerate: SectionNameSchema,
        prompt: z.string().min(10, 'Prompt must be at least 10 characters.'),
        otherSections: z
            .record(z.string(), z.string())
            .optional()
            .describe(
                "A map of previously generated text sections and other textual context (like the proposal or plan). The key is the item's name and the value is the markdown/JSON content.",
            ),
        instructionText: z.string().optional().describe('A dynamically generated instruction string based on UI controls.'),
    })
    .merge(BaseExternalContextSchema)
    .merge(BaseControlsSchema);


export type GenerateSectionInput = z.infer<typeof GenerateSectionInputSchema>;

export const GenerateSectionOutputSchema = z.object({
    sectionName: SectionNameSchema.describe("The name of the section that was generated. This must match the 'sectionToGenerate' from the input."),
    content: z.string().describe("The generated markdown content for the specified section."),
});
export type GenerateSectionOutput = z.infer<typeof GenerateSectionOutputSchema>;

// generate-chapter-content.ts
const SectionInstructionSchema = z.object({
    title: z.string().describe("The title of the section."),
    prompt: z.string().optional().describe("The base prompt for generating this section."),
    guidelines: z.array(z.string()).optional().describe("Specific guidelines for this section."),
    instructionText: z.string().optional().describe("Dynamically generated instructions from UI controls."),
    context: z.string().optional().describe("All contextual information (from other sections, files, etc.) to be used for generating this section.")
});

export const GenerateChapterInputSchema = z.object({
    flow: z.literal('generate-chapter'),
    chapterTitle: z.string().describe("The main title of the chapter to be generated."),
    sectionInstructions: z.array(SectionInstructionSchema).describe("An ordered array of instructions for each section within the chapter."),
});
export type GenerateChapterInput = z.infer<typeof GenerateChapterInputSchema>;

export const GenerateChapterOutputSchema = z.object({
    markdownContent: z.string().describe("The complete markdown content for the entire chapter, with each section formatted with a level 2 heading (##)."),
});
export type GenerateChapterOutput = z.infer<typeof GenerateChapterOutputSchema>;


// generate-text.ts
export const GenerateTextInputSchema = BaseTextInputSchema.extend({
    flow: z.literal('generate-text'),
}).merge(BaseControlsSchema);
export type GenerateTextInput = z.infer<typeof GenerateTextInputSchema>;

export const GenerateTextOutputSchema = z.object({
    generatedText: z
        .string()
        .describe('The generated text.'),
});
export type GenerateTextOutput = z.infer<typeof GenerateTextOutputSchema>;


// grammar-checker.ts
export const CorrectionSchema = z.object({
    original: z.string().describe("The original incorrect phrase or word."),
    corrected: z.string().describe("The corrected version of the phrase or word."),
    explanation: z.string().describe("A brief, clear explanation of why the correction was made."),
    type: z.enum(['grammar', 'spelling', 'punctuation']).describe("The type of correction: 'grammar' for grammatical errors, 'spelling' for misspellings, 'punctuation' for punctuation issues."),
});

export const GrammarCheckInputSchema = BaseTextInputSchema.extend({
    flow: z.literal('grammar-checker'),
}).merge(BaseControlsSchema);
export type GrammarCheckInput = z.infer<typeof GrammarCheckInputSchema>;

export const GrammarCheckOutputSchema = z.object({
    correctedText: z.string().describe("The full text with all corrections applied, preserving original markdown."),
    corrections: z.array(CorrectionSchema).describe("A list of the specific corrections made."),
    statistics: z.object({
        total: z.number().describe("Total number of corrections made."),
        grammar: z.number().describe("Number of grammar corrections."),
        spelling: z.number().describe("Number of spelling corrections."),
        punctuation: z.number().describe("Number of punctuation corrections."),
    }).optional().describe("Summary statistics of corrections by type."),
});
export type GrammarCheckOutput = z.infer<typeof GrammarCheckOutputSchema>;


// humanize-text.ts
export const HumanizeTextInputSchema = BaseTextInputSchema.extend({
    flow: z.literal('humanize-text'),
}).merge(BaseControlsSchema);
export type HumanizeTextInput = z.infer<typeof HumanizeTextInputSchema>;

export const HumanizeTextOutputSchema = z.object({
    humanizedText: z.string().describe('The rewritten text, which sounds more natural and less robotic.'),
});
export type HumanizeTextOutput = z.infer<typeof HumanizeTextOutputSchema>;


// image-to-text.ts
export const ImageToTextInputSchema = z.object({
    flow: z.literal('image-to-text'),
    imageDataUri: z.string().describe("An image file encoded as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:image/...;base64,<encoded_data>'."),
});
export type ImageToTextInput = z.infer<typeof ImageToTextInputSchema>;

export const ImageToTextOutputSchema = z.object({
    text: z.string().describe('The extracted text content from the image, formatted as markdown.'),
});
export type ImageToTextOutput = z.infer<typeof ImageToTextOutputSchema>;


// improve-report-markdown.ts
export const ImproveMarkdownInputSchema = z
    .object({
        flow: z.literal('improve-report-markdown'),
        markdownContent: z.string().min(20, 'Markdown content is too short.'),
        userPrompt: z.string().min(10, 'Instructions for the AI must be at least 10 characters.'),
    })
    .merge(BaseControlsSchema);
export type ImproveMarkdownInput = z.infer<typeof ImproveMarkdownInputSchema>;

export const ImproveMarkdownOutputSchema = z.object({
    improvedMarkdown: z.string().describe('The improved and reformatted Markdown content.'),
});
export type ImproveMarkdownOutput = z.infer<typeof ImproveMarkdownOutputSchema>;


// manipulate-text.ts
export const ManipulateTextInputSchema = z
    .object({
        flow: z.literal('manipulate-text'),
        textToManipulate: z.string().describe('The original text to be modified.'),
        command: z.string().describe(
            'The instruction for how to modify the text (e.g., "summarize", "expand on this topic", "rewrite this to be more formal").',
        ),
    })
    .merge(BaseControlsSchema);
export type ManipulateTextInput = z.infer<typeof ManipulateTextInputSchema>;

export const ManipulateTextOutputSchema = z.object({
    manipulatedText: z.string().describe('The resulting text after applying the command.'),
});
export type ManipulateTextOutput = z.infer<typeof ManipulateTextOutputSchema>;




// plagiarism-checker.ts
export const MatchedSourceSchema = z.object({
    source: z.string().describe("The full, real URL of the source where the similar text was found. This must be a complete and valid URL (e.g., https://www.example.com/article)."),
    title: z.string().describe("The title of the webpage or article found at the source URL."),
    summary: z.string().describe("A brief summary of the content from the source that is similar to the user's text."),
    similarity: z.number().min(0).max(100).describe("A percentage score (0-100) indicating how similar the provided text is to the found source."),
});

export const PlagiarismCheckInputSchema = BaseTextInputSchema.extend({
    flow: z.literal('plagiarism-checker'),
}).merge(BaseControlsSchema);
export type PlagiarismCheckInput = z.infer<typeof PlagiarismCheckInputSchema>;

export const PlagiarismCheckOutputSchema = z.object({
    originalityScore: z.number().min(0).max(100).describe("An overall score from 0 to 100 representing how original the text is, where 100 is completely unique."),
    matches: z.array(MatchedSourceSchema).describe("An array of potential sources that contain similar text."),
});
export type PlagiarismCheckOutput = z.infer<typeof PlagiarismCheckOutputSchema>;


// rewrite-document-to-markdown.ts
export const RewriteDocumentInputSchema = z.object({
    flow: z.literal('rewrite-document-to-markdown'),
    pdfDataUri: z.string().describe("A PDF file encoded as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:application/pdf;base64,<encoded_data>'."),
});
export type RewriteDocumentInput = z.infer<typeof RewriteDocumentInputSchema>;

export const RewriteDocumentOutputSchema = z.object({
    markdown: z.string().describe('The rewritten content, formatted as clean, well-structured markdown.'),
});
export type RewriteDocumentOutput = z.infer<typeof RewriteDocumentOutputSchema>;


// rewrite-to-markdown.ts
export const RewriteToMarkdownInputSchema = z.object({
    flow: z.literal('rewrite-to-markdown'),
    rawText: z.string().describe('The raw, unstructured text extracted from a document.'),
});
export type RewriteToMarkdownInput = z.infer<typeof RewriteToMarkdownInputSchema>;

export const RewriteToMarkdownOutputSchema = z.object({
    markdown: z.string().describe('The rewritten content, formatted as clean, well-structured markdown.'),
});
export type RewriteToMarkdownOutput = z.infer<typeof RewriteToMarkdownOutputSchema>;


// summarize-document.ts
export const SummarizeDocumentInputSchema = z.object({
    flow: z.literal('summarize-document'),
    documentDataUri: z
        .string()
        .describe(
            'A document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
        ),
});
export type SummarizeDocumentInput = z.infer<typeof SummarizeDocumentInputSchema>;

export const SummarizeDocumentOutputSchema = z.object({
    summary: z.string().describe('A concise summary of the document.'),
});
export type SummarizeDocumentOutput = z.infer<typeof SummarizeDocumentOutputSchema>;


// summarize-project.ts
export const SummarizeProjectInputSchema = z.object({
    flow: z.literal('summarize-project'),
    projectDescription: z
        .string()
        .describe('The detailed description of the project that needs to be summarized.'),
});
export type SummarizeProjectInput = z.infer<typeof SummarizeProjectInputSchema>;

export const SummarizeProjectOutputSchema = z.object({
    summary: z.string().describe('A concise summary of the project.'),
    technologies: z.array(z.string()).describe('A list of technologies, frameworks, and libraries identified in the project description.'),
    progress: z.string().describe('Details on the summarization progress'),
});
export type SummarizeProjectOutput = z.infer<typeof SummarizeProjectOutputSchema>;


// text-stylist.ts
export const RewriteTextInputSchema = BaseTextInputSchema.extend({
    flow: z.literal('rewrite-text'),
    style: z.string().describe('The target style for the rewritten text (e.g., Formal, Creative, Simple).'),
})
    .merge(BaseControlsSchema);
export type RewriteTextInput = z.infer<typeof RewriteTextInputSchema>;


export const RewriteTextOutputSchema = z.object({
    rewrittenText: z.string().describe('The text rewritten in the specified style.'),
});
export type RewriteTextOutput = z.infer<typeof RewriteTextOutputSchema>;

export const SummarizeTextWithRatioInputSchema = BaseTextInputSchema.extend({
    flow: z.literal('summarize-with-ratio'),
    ratio: z.number().min(10).max(90).describe('The desired compression ratio (10% - 90%). 10% is a very short summary, 90% is almost the original length.'),
});
export type SummarizeTextWithRatioInput = z.infer<typeof SummarizeTextWithRatioInputSchema>;

export const SummarizeTextWithRatioOutputSchema = z.object({
    summarizedText: z.string().describe('The generated summary of the original text.'),
});
export type SummarizeTextWithRatioOutput = z.infer<typeof SummarizeTextWithRatioOutputSchema>;

// Style Editor
export const StyleEditorInputSchema = BaseTextInputSchema.extend({
    flow: z.literal('style-editor'),
})
    .merge(BaseControlsSchema);
export type StyleEditorInput = z.infer<typeof StyleEditorInputSchema>;

export const StyleEditorOutputSchema = z.object({
    editedText: z.string().describe('The text with improved style, maintaining the original meaning.'),
    improvements: z.array(z.string()).optional().describe('A list of style improvements made to the text.'),
});
export type StyleEditorOutput = z.infer<typeof StyleEditorOutputSchema>;

// Readability Enhancer
export const ReadabilityEnhancerInputSchema = BaseTextInputSchema.extend({
    flow: z.literal('readability-enhancer'),
    targetLevel: TargetReadingLevelSchema.optional().describe('The target reading level.'),
})
    .merge(BaseControlsSchema);
export type ReadabilityEnhancerInput = z.infer<typeof ReadabilityEnhancerInputSchema>;

export const ReadabilityEnhancerOutputSchema = z.object({
    enhancedText: z.string().describe('The text enhanced for better readability.'),
    readabilityScore: z.number().min(0).max(100).optional().describe('A readability score (0-100) for the enhanced text.'),
    improvements: z.array(z.string()).optional().describe('A list of readability improvements made.'),
});
export type ReadabilityEnhancerOutput = z.infer<typeof ReadabilityEnhancerOutputSchema>;

// Conciseness Checker
export const ConcisenessCheckerInputSchema = BaseTextInputSchema.extend({
    flow: z.literal('conciseness-checker'),
    targetReduction: z
        .number()
        .min(0)
        .max(50)
        .optional()
        .describe('Target percentage reduction in word count (0-50%).'),
})
    .merge(BaseControlsSchema);
export type ConcisenessCheckerInput = z.infer<typeof ConcisenessCheckerInputSchema>;

export const ConcisenessCheckerOutputSchema = z.object({
    conciseText: z.string().describe('The text made more concise while preserving meaning.'),
    originalWordCount: z.number().optional().describe('The original word count.'),
    newWordCount: z.number().optional().describe('The new word count after making it concise.'),
    reductionPercentage: z.number().optional().describe('The percentage reduction in word count.'),
    improvements: z.array(z.string()).optional().describe('A list of conciseness improvements made.'),
});
export type ConcisenessCheckerOutput = z.infer<typeof ConcisenessCheckerOutputSchema>;

// Clarity Advisor
export const ClarityAdvisorInputSchema = BaseTextInputSchema.extend({
    flow: z.literal('clarity-advisor'),
    focusAreas: z
        .array(z.string())
        .optional()
        .describe('Specific areas to focus on (e.g., "sentence structure", "word choice", "logical flow").'),
})
    .merge(BaseControlsSchema);
export type ClarityAdvisorInput = z.infer<typeof ClarityAdvisorInputSchema>;

export const ClarityAdvisorOutputSchema = z.object({
    improvedText: z.string().describe('The text improved for clarity.'),
    clarityScore: z.number().min(0).max(100).optional().describe('A clarity score (0-100) for the improved text.'),
    suggestions: z.array(z.object({
        issue: z.string().describe('The clarity issue identified.'),
        suggestion: z.string().describe('A suggestion for improvement.'),
        location: z.string().optional().describe('The location or context of the issue in the text.'),
    })).optional().describe('A list of clarity suggestions and improvements.'),
});
export type ClarityAdvisorOutput = z.infer<typeof ClarityAdvisorOutputSchema>;


// topic-explainer.ts
export const TopicExplainerInputSchema = BaseTopicInputSchema.extend({
    flow: z.literal('topic-explainer'),
});
export type TopicExplainerInput = z.infer<typeof TopicExplainerInputSchema>;

export const TopicExplainerOutputSchema = z.object({
    explanation: z.string().describe('A simple, easy-to-understand explanation of the topic, formatted as markdown.'),
});
export type TopicExplainerOutput = z.infer<typeof TopicExplainerOutputSchema>;

// translate-text.ts
export const TranslateTextInputSchema = BaseTextInputSchema.extend({
    flow: z.literal('translate-text'),
    targetLang: TargetLanaguage.describe('The target language (e.g., "English", "Arabic").'),
})
    .merge(BaseControlsSchema);
export type TranslateTextInput = z.infer<typeof TranslateTextInputSchema>;

export const TranslateTextOutputSchema = z.object({
    translatedText: z.string().describe('The resulting translated text, with original markdown formatting preserved.'),
});
export type TranslateTextOutput = z.infer<typeof TranslateTextOutputSchema>;


// write-document.ts
export const WriteDocumentInputSchema = z
    .object({
        flow: z.literal('write-document'),
        topic: z.string().describe('The topic or title of the document to be written.'),
        documentType: z
            .string()
            .describe('The type of document to generate (e.g., "Blog Post", "Formal Report", "Essay", "Technical Article").'),
        knowledge: z
            .string()
            .optional()
            .describe('Any specific knowledge, context, or instructions for the document.'),
        tableOfContents: z
            .array(z.string())
            .optional()
            .describe("An optional list of headings to be used as the document's structure."),
    })
    .merge(BaseControlsSchema);
export type WriteDocumentInput = z.infer<typeof WriteDocumentInputSchema>;

export const WriteDocumentOutputSchema = z.object({
    document: z.string().describe('The fully generated document content, formatted as markdown.'),
});
export type WriteDocumentOutput = z.infer<typeof WriteDocumentOutputSchema>;

// evaluate-report.ts
export const EvaluateReportInputSchema = z.object({
    flow: z.literal('evaluate-report'),
    reportSections: z.record(SectionNameSchema, z.string()).describe("A map of all generated report sections."),
    diagrams: z.record(DiagramTypeSchema, z.string()).optional().describe("A map of all generated PlantUML diagrams.").nullable(),
    acceptanceCriteria: z.array(z.string()).describe("A list of acceptance criteria to evaluate the report against.").nullable().optional(),
});
export type EvaluateReportInput = z.infer<typeof EvaluateReportInputSchema>;

export const FeedbackItemSchema = z.object({
    point: z.string().describe("A specific feedback point related to one of the acceptance criteria."),
    status: FeedbackStatusSchema.describe("The status of the report regarding this feedback point."),
    sectionKey: SectionNameSchema.optional().describe("The specific section key (e.g., 'introduction', 'systemDesign') this feedback point applies to. This is crucial for applying automated fixes."),
    solution: z.string().optional().describe("A suggested prompt for an AI agent to fix the issue if status is 'Weak' or 'Not Present'. This prompt should be a clear, actionable command."),
});

export const AIContentAnalysisSchema = z.object({
    sectionName: z.string(),
    aiContentScore: z.number().min(0).max(100),
    analysis: z.string(),
});

export const EvaluateReportOutputSchema = z.object({
    evaluationScore: z.number().min(0).max(100).describe("A numerical score from 0 to 100 representing the report's quality against the criteria."),
    feedback: z.array(FeedbackItemSchema).describe("A list of specific feedback points, including praise for met criteria and suggestions for areas of improvement, each with a status."),
    summary: z.string().describe("A concise summary of the overall evaluation."),
    aiContentAnalysis: z.array(AIContentAnalysisSchema).optional().describe("An analysis of each section for AI-generated content probability."),
});
export type EvaluateReportOutput = z.infer<typeof EvaluateReportOutputSchema>;

// generate-toc.ts
export const GenerateTocInputSchema = z.object({
    flow: z.literal('generate-toc'),
    projectDescription: z.string().min(10, 'Project idea must be at least 10 characters.'),
});
export type GenerateTocInput = z.infer<typeof GenerateTocInputSchema>;

const TocSectionSchema = z.object({
    title: z.string(),
    sections: z.array(z.string()),
});

export const GenerateTocOutputSchema = z.object({
    tableOfContents: z.array(TocSectionSchema).describe('A list of suggested chapters, each with a title and a list of section titles.'),
});
export type GenerateTocOutput = z.infer<typeof GenerateTocOutputSchema>;


// generate-ui-description.ts
export const GenerateUIDescriptionInputSchema = z.object({
    flow: z.literal('generate-ui-description'),
    projectFeatures: z.string().min(20, 'Please provide more details about the project features.'),
    designType: DesignTypeSchema,
});
export type GenerateUIDescriptionInput = z.infer<typeof GenerateUIDescriptionInputSchema>;


export const GenerateUIDescriptionOutputSchema = z.object({
    uiDescription: z.string().describe('The generated UI/UX workflow description in markdown format.'),
});
export type GenerateUIDescriptionOutput = z.infer<typeof GenerateUIDescriptionOutputSchema>;

// ============================================================================
// ACADEMIC WRITING FLOWS (17 TYPES)
// ============================================================================

// 1. Research Paper - ورقة بحثية
export const ResearchPaperInputSchema = z.object({
    flow: z.literal('research-paper'),
    topic: z.string().min(5).describe('البحث موضوع'),
    researchQuestion: z.string().min(10).describe('السؤال البحثي الرئيسي'),
    methodology: ResearchMethodologySchema.describe('المنهجية البحثية'),
    keywords: z.array(z.string()).min(3).max(10).describe('الكلمات المفتاحية'),
    citationStyle: AcademicStyleSchema.default('apa').describe('نمط الاستشهاد'),
    targetLength: z.number().min(3000).max(15000).default(5000).describe('الطول المستهدف بالكلمات'),
    includeAbstract: z.boolean().default(true),
    includeLiteratureReview: z.boolean().default(true),
    targetAudience: z.string().optional().describe('الجمهور المستهدف'),
});
export const ResearchPaperOutputSchema = z.object({
    title: z.string(),
    abstract: z.string().optional(),
    introduction: z.string(),
    literatureReview: z.string().optional(),
    methodology: z.string(),
    results: z.string(),
    discussion: z.string(),
    conclusion: z.string(),
    references: z.array(z.string()),
    fullDocument: z.string().describe('الوثيقة الكاملة بصيغة markdown'),
});
export type ResearchPaperInput = z.infer<typeof ResearchPaperInputSchema>;
export type ResearchPaperOutput = z.infer<typeof ResearchPaperOutputSchema>;

// 2. Analytical Essay - مقال تحليلي
export const AnalyticalEssayInputSchema = z.object({
    flow: z.literal('analytical-essay'),
    topic: z.string().min(5).describe('الموضوع المراد تحليله'),
    mainArgument: z.string().min(20).describe('الحجة الرئيسية'),
    keyComponents: z.array(z.string()).min(2).max(8).describe('المكونات الأساسية للتحليل'),
    targetLength: z.number().min(800).max(5000).default(1500).describe('الطول المستهدف'),
    citationStyle: AcademicStyleSchema.default('mla').describe('نمط الاستشهاد'),
    analysisDepth: z.enum(['surface', 'moderate', 'deep']).default('moderate'),
});
export const AnalyticalEssayOutputSchema = z.object({
    title: z.string(),
    introduction: z.string(),
    thesisStatement: z.string(),
    bodyParagraphs: z.array(z.object({
        topic: z.string(),
        analysis: z.string(),
        evidence: z.string(),
    })),
    conclusion: z.string(),
    fullEssay: z.string().describe('المقال الكامل بصيغة markdown'),
});
export type AnalyticalEssayInput = z.infer<typeof AnalyticalEssayInputSchema>;
export type AnalyticalEssayOutput = z.infer<typeof AnalyticalEssayOutputSchema>;

// 3. Argumentative Essay - مقال جدلي
export const ArgumentativeEssayInputSchema = z.object({
    flow: z.literal('argumentative-essay'),
    topic: z.string().min(5).describe('الموضوع الجدلي'),
    position: z.string().min(20).describe('الموقف الذي تدافع عنه'),
    mainArguments: z.array(z.string()).min(3).max(6).describe('الحجج الرئيسية'),
    counterarguments: z.array(z.string()).min(1).max(4).describe('الحجج المضادة'),
    evidence: z.array(z.string()).optional().describe('الأدلة الداعمة'),
    targetLength: z.number().min(1000).max(5000).default(2000),
    citationStyle: AcademicStyleSchema.default('apa'),
    includeRebuttal: z.boolean().default(true).describe('تضمين الرد على الحجج المضادة'),
});
export const ArgumentativeEssayOutputSchema = z.object({
    title: z.string(),
    introduction: z.string(),
    thesisStatement: z.string(),
    arguments: z.array(z.object({
        claim: z.string(),
        evidence: z.string(),
        reasoning: z.string(),
    })),
    counterargumentsSection: z.string().optional(),
    rebuttal: z.string().optional(),
    conclusion: z.string(),
    fullEssay: z.string().describe('المقال الكامل بصيغة markdown'),
});
export type ArgumentativeEssayInput = z.infer<typeof ArgumentativeEssayInputSchema>;
export type ArgumentativeEssayOutput = z.infer<typeof ArgumentativeEssayOutputSchema>;

// 4. Literature Review - مراجعة أدبيات (already exists as LiteratureReviewInputSchema)
// We'll create a more comprehensive version
export const ComprehensiveLiteratureReviewInputSchema = z.object({
    flow: z.literal('comprehensive-literature-review'),
    topic: z.string().min(5).describe('موضوع المراجعة الأدبية'),
    researchQuestions: z.array(z.string()).min(1).max(5).describe('الأسئلة البحثية'),
    keywords: z.array(z.string()).min(3).max(15),
    timeframe: z.string().optional().describe('الإطار الزمني للأدبيات (مثال: 2015-2024)'),
    minimumSources: z.number().min(10).max(100).default(20),
    citationStyle: AcademicStyleSchema.default('apa'),
    includeGapAnalysis: z.boolean().default(true),
    includeThematicAnalysis: z.boolean().default(true),
});
export const ComprehensiveLiteratureReviewOutputSchema = z.object({
    introduction: z.string(),
    thematicReview: z.array(z.object({
        theme: z.string(),
        summary: z.string(),
        sources: z.array(z.string()),
    })),
    gapAnalysis: z.string().optional(),
    conclusion: z.string(),
    references: z.array(z.string()),
    fullReview: z.string().describe('المراجعة الكاملة بصيغة markdown'),
});
export type ComprehensiveLiteratureReviewInput = z.infer<typeof ComprehensiveLiteratureReviewInputSchema>;
export type ComprehensiveLiteratureReviewOutput = z.infer<typeof ComprehensiveLiteratureReviewOutputSchema>;

// 5. Case Study - دراسة حالة
export const CaseStudyInputSchema = z.object({
    flow: z.literal('case-study'),
    caseTitle: z.string().min(5).describe('عنوان الحالة'),
    background: z.string().min(50).describe('خلفية الحالة'),
    problem: z.string().min(30).describe('المشكلة أو التحدي'),
    methodology: z.string().min(30).describe('منهجية الدراسة'),
    dataCollectionMethods: z.array(z.string()).optional(),
    targetLength: z.number().min(1500).max(8000).default(3000),
    includeRecommendations: z.boolean().default(true),
    citationStyle: AcademicStyleSchema.default('harvard'),
});
export const CaseStudyOutputSchema = z.object({
    title: z.string(),
    abstract: z.string(),
    introduction: z.string(),
    caseDescription: z.string(),
    analysis: z.string(),
    findings: z.array(z.string()),
    discussion: z.string(),
    recommendations: z.array(z.string()).optional(),
    conclusion: z.string(),
    references: z.array(z.string()),
    fullCaseStudy: z.string().describe('دراسة الحالة الكاملة بصيغة markdown'),
});
export type CaseStudyInput = z.infer<typeof CaseStudyInputSchema>;
export type CaseStudyOutput = z.infer<typeof CaseStudyOutputSchema>;

// 6. Lab Report - تقرير مختبر
export const LabReportInputSchema = z.object({
    flow: z.literal('lab-report'),
    experimentTitle: z.string().min(5).describe('عنوان التجربة'),
    objective: z.string().min(20).describe('الهدف من التجربة'),
    hypothesis: z.string().min(20).describe('الفرضية'),
    materials: z.array(z.string()).min(3).describe('المواد والأدوات المستخدمة'),
    procedure: z.array(z.string()).min(3).describe('خطوات التجربة'),
    observations: z.string().min(50).describe('الملاحظات والبيانات'),
    results: z.string().min(50).describe('النتائج'),
    includeDiscussion: z.boolean().default(true),
    citationStyle: AcademicStyleSchema.default('ieee'),
});
export const LabReportOutputSchema = z.object({
    title: z.string(),
    abstract: z.string(),
    introduction: z.string(),
    materialsAndMethods: z.string(),
    results: z.string(),
    discussion: z.string().optional(),
    conclusion: z.string(),
    references: z.array(z.string()),
    fullReport: z.string().describe('التقرير الكامل بصيغة markdown'),
});
export type LabReportInput = z.infer<typeof LabReportInputSchema>;
export type LabReportOutput = z.infer<typeof LabReportOutputSchema>;

// 7. Research Proposal - مقترح بحثي
export const ResearchProposalInputSchema = z.object({
    flow: z.literal('research-proposal'),
    researchTitle: z.string().min(10).describe('عنوان البحث المقترح'),
    researchProblem: z.string().min(50).describe('مشكلة البحث'),
    researchQuestions: z.array(z.string()).min(1).max(5),
    objectives: z.array(z.string()).min(2).max(6),
    methodology: ResearchMethodologySchema,
    significance: z.string().min(50).describe('أهمية البحث'),
    expectedOutcomes: z.array(z.string()).min(2),
    timeline: z.string().optional().describe('الجدول الزمني'),
    budget: z.string().optional().describe('الميزانية المقترحة'),
    citationStyle: AcademicStyleSchema.default('apa'),
});
export const ResearchProposalOutputSchema = z.object({
    title: z.string(),
    abstract: z.string(),
    introduction: z.string(),
    literatureReview: z.string(),
    researchDesign: z.string(),
    methodology: z.string(),
    expectedResults: z.string(),
    significance: z.string(),
    timeline: z.string().optional(),
    budget: z.string().optional(),
    references: z.array(z.string()),
    fullProposal: z.string().describe('المقترح الكامل بصيغة markdown'),
});
export type ResearchProposalInput = z.infer<typeof ResearchProposalInputSchema>;
export type ResearchProposalOutput = z.infer<typeof ResearchProposalOutputSchema>;

// 8. Thesis Statement - أطروحة مركزية
export const ThesisStatementInputSchema = z.object({
    flow: z.literal('thesis-statement'),
    topic: z.string().min(5).describe('الموضوع'),
    position: z.string().min(20).describe('الموقف أو الرأي'),
    mainPoints: z.array(z.string()).min(2).max(4).describe('النقاط الرئيسية'),
    documentType: AcademicDocumentTypeSchema.describe('نوع الوثيقة'),
    includeRationale: z.boolean().default(true).describe('تضمين التبرير'),
});
export const ThesisStatementOutputSchema = z.object({
    thesisStatement: z.string().describe('الأطروحة المركزية'),
    refinedVersions: z.array(z.string()).describe('نسخ محسنة بديلة'),
    rationale: z.string().optional().describe('التبرير والشرح'),
    strengths: z.array(z.string()),
    suggestedImprovements: z.array(z.string()).optional(),
});
export type ThesisStatementInput = z.infer<typeof ThesisStatementInputSchema>;
export type ThesisStatementOutput = z.infer<typeof ThesisStatementOutputSchema>;

// 9. Dissertation Chapter - فصل أطروحة
export const DissertationChapterInputSchema = z.object({
    flow: z.literal('dissertation-chapter'),
    chapterType: AcademicSectionSchema.describe('نوع الفصل'),
    researchTopic: z.string().min(10).describe('موضوع البحث'),
    chapterTitle: z.string().min(5).describe('عنوان الفصل'),
    mainPoints: z.array(z.string()).min(3).max(10),
    previousChaptersSummary: z.string().optional().describe('ملخص الفصول السابقة'),
    targetLength: z.number().min(3000).max(15000).default(5000),
    citationStyle: AcademicStyleSchema.default('apa'),
    academicLevel: z.enum(['masters', 'phd']).default('masters'),
});
export const DissertationChapterOutputSchema = z.object({
    chapterTitle: z.string(),
    introduction: z.string(),
    mainContent: z.string(),
    subSections: z.array(z.object({
        title: z.string(),
        content: z.string(),
    })),
    conclusion: z.string(),
    transitions: z.object({
        fromPrevious: z.string(),
        toNext: z.string(),
    }),
    references: z.array(z.string()),
    fullChapter: z.string().describe('الفصل الكامل بصيغة markdown'),
});
export type DissertationChapterInput = z.infer<typeof DissertationChapterInputSchema>;
export type DissertationChapterOutput = z.infer<typeof DissertationChapterOutputSchema>;

// 10. Term Paper - بحث فصلي
export const TermPaperInputSchema = z.object({
    flow: z.literal('term-paper'),
    courseName: z.string().min(3).describe('اسم المقرر'),
    topic: z.string().min(5).describe('موضوع البحث'),
    thesisStatement: z.string().min(20).describe('الأطروحة المركزية'),
    mainArguments: z.array(z.string()).min(3).max(6),
    requiredSources: z.number().min(5).max(30).default(10),
    targetLength: z.number().min(2000).max(8000).default(3000),
    citationStyle: AcademicStyleSchema.default('mla'),
    includeAnnotatedBibliography: z.boolean().default(false),
});
export const TermPaperOutputSchema = z.object({
    title: z.string(),
    abstract: z.string(),
    introduction: z.string(),
    bodyContent: z.string(),
    conclusion: z.string(),
    references: z.array(z.string()),
    annotatedBibliography: z.array(z.object({
        citation: z.string(),
        annotation: z.string(),
    })).optional(),
    fullPaper: z.string().describe('البحث الكامل بصيغة markdown'),
});
export type TermPaperInput = z.infer<typeof TermPaperInputSchema>;
export type TermPaperOutput = z.infer<typeof TermPaperOutputSchema>;

// 11. Critical Analysis - تحليل نقدي
export const CriticalAnalysisInputSchema = z.object({
    flow: z.literal('critical-analysis'),
    workTitle: z.string().min(3).describe('عنوان العمل المراد تحليله'),
    workType: z.enum(['book', 'article', 'research-paper', 'theory', 'artwork', 'film']),
    author: z.string().min(2).describe('المؤلف'),
    mainThesis: z.string().min(20).describe('الأطروحة الرئيسية للعمل'),
    evaluationCriteria: z.array(z.string()).min(3).max(8).describe('معايير التقييم'),
    targetLength: z.number().min(1000).max(5000).default(2000),
    citationStyle: AcademicStyleSchema.default('chicago'),
});
export const CriticalAnalysisOutputSchema = z.object({
    title: z.string(),
    introduction: z.string(),
    summary: z.string().describe('ملخص العمل'),
    strengthsAnalysis: z.string(),
    weaknessesAnalysis: z.string(),
    methodologyEvaluation: z.string(),
    contributionToField: z.string(),
    conclusion: z.string(),
    references: z.array(z.string()),
    fullAnalysis: z.string().describe('التحليل الكامل بصيغة markdown'),
});
export type CriticalAnalysisInput = z.infer<typeof CriticalAnalysisInputSchema>;
export type CriticalAnalysisOutput = z.infer<typeof CriticalAnalysisOutputSchema>;

// 12. Book Review - مراجعة كتاب
export const BookReviewInputSchema = z.object({
    flow: z.literal('book-review'),
    bookTitle: z.string().min(2).describe('عنوان الكتاب'),
    author: z.string().min(2).describe('المؤلف'),
    publicationYear: z.number().min(1900).max(2030),
    genre: z.string().describe('النوع أو المجال'),
    mainThemes: z.array(z.string()).min(2).max(6),
    targetAudience: z.string().describe('الجمهور المستهدف للمراجعة'),
    reviewLength: z.number().min(500).max(3000).default(1000),
    includeRating: z.boolean().default(true),
    citationStyle: AcademicStyleSchema.default('mla'),
});
export const BookReviewOutputSchema = z.object({
    title: z.string(),
    bibliographicInfo: z.string(),
    introduction: z.string(),
    summary: z.string(),
    criticalEvaluation: z.string(),
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    recommendation: z.string(),
    rating: z.number().min(1).max(5).optional(),
    fullReview: z.string().describe('المراجعة الكاملة بصيغة markdown'),
});
export type BookReviewInput = z.infer<typeof BookReviewInputSchema>;
export type BookReviewOutput = z.infer<typeof BookReviewOutputSchema>;

// 13. Article Summary - ملخص مقال
export const ArticleSummaryInputSchema = z.object({
    flow: z.literal('article-summary'),
    articleTitle: z.string().min(3).describe('عنوان المقال'),
    author: z.string().min(2).describe('المؤلف'),
    articleText: z.string().min(100).optional().describe('نص المقال (إذا كان متوفراً)'),
    articleUrl: z.string().url().optional().describe('رابط المقال'),
    summaryLength: z.enum(['brief', 'moderate', 'detailed']).default('moderate'),
    includeKeyFindings: z.boolean().default(true),
    includeMethodology: z.boolean().default(true),
    citationStyle: AcademicStyleSchema.default('apa'),
});
export const ArticleSummaryOutputSchema = z.object({
    title: z.string(),
    bibliographicInfo: z.string(),
    mainArgument: z.string(),
    methodology: z.string().optional(),
    keyFindings: z.array(z.string()).optional(),
    conclusion: z.string(),
    significance: z.string(),
    fullSummary: z.string().describe('الملخص الكامل بصيغة markdown'),
});
export type ArticleSummaryInput = z.infer<typeof ArticleSummaryInputSchema>;
export type ArticleSummaryOutput = z.infer<typeof ArticleSummaryOutputSchema>;

// 14. Annotated Bibliography - ببليوغرافيا مشروحة
export const AnnotatedBibliographyInputSchema = z.object({
    flow: z.literal('annotated-bibliography'),
    researchTopic: z.string().min(5).describe('موضوع البحث'),
    sources: z.array(z.object({
        title: z.string(),
        author: z.string(),
        year: z.number(),
        type: z.enum(['book', 'journal-article', 'website', 'conference-paper', 'thesis']),
        url: z.string().optional(),
    })).min(5).max(50).describe('المصادر المراد شرحها'),
    annotationLength: z.enum(['brief', 'moderate', 'detailed']).default('moderate'),
    citationStyle: AcademicStyleSchema.default('apa'),
    includeEvaluation: z.boolean().default(true),
});
export const AnnotatedBibliographyOutputSchema = z.object({
    introduction: z.string(),
    annotations: z.array(z.object({
        citation: z.string(),
        summary: z.string(),
        evaluation: z.string().optional(),
        relevance: z.string(),
    })),
    fullBibliography: z.string().describe('الببليوغرافيا المشروحة الكاملة بصيغة markdown'),
});
export type AnnotatedBibliographyInput = z.infer<typeof AnnotatedBibliographyInputSchema>;
export type AnnotatedBibliographyOutput = z.infer<typeof AnnotatedBibliographyOutputSchema>;

// 15. Position Paper - ورقة موقف
export const PositionPaperInputSchema = z.object({
    flow: z.literal('position-paper'),
    issue: z.string().min(10).describe('القضية أو الموضوع'),
    organizationOrEntity: z.string().min(2).describe('الجهة أو المنظمة'),
    position: z.string().min(30).describe('الموقف الرسمي'),
    supportingArguments: z.array(z.string()).min(3).max(8),
    evidence: z.array(z.string()).min(2).describe('الأدلة الداعمة'),
    counterpositions: z.array(z.string()).optional().describe('المواقف المعارضة'),
    targetAudience: z.string().describe('الجمهور المستهدف'),
    targetLength: z.number().min(1000).max(5000).default(2000),
    citationStyle: AcademicStyleSchema.default('chicago'),
});
export const PositionPaperOutputSchema = z.object({
    title: z.string(),
    executiveSummary: z.string(),
    introduction: z.string(),
    backgroundContext: z.string(),
    positionStatement: z.string(),
    justification: z.string(),
    addressingCounterarguments: z.string().optional(),
    recommendations: z.array(z.string()),
    conclusion: z.string(),
    references: z.array(z.string()),
    fullPaper: z.string().describe('ورقة الموقف الكاملة بصيغة markdown'),
});
export type PositionPaperInput = z.infer<typeof PositionPaperInputSchema>;
export type PositionPaperOutput = z.infer<typeof PositionPaperOutputSchema>;

// 16. Reflection Paper - ورقة تأملية
export const ReflectionPaperInputSchema = z.object({
    flow: z.literal('reflection-paper'),
    experience: z.string().min(50).describe('التجربة أو الموضوع المراد التأمل فيه'),
    courseOrContext: z.string().optional().describe('المقرر أو السياق'),
    keyLearnings: z.array(z.string()).min(2).max(8).describe('التعلمات الرئيسية'),
    personalInsights: z.array(z.string()).min(2).max(8).describe('الأفكار الشخصية'),
    futureApplications: z.array(z.string()).optional().describe('التطبيقات المستقبلية'),
    targetLength: z.number().min(500).max(3000).default(1000),
    reflectionDepth: z.enum(['surface', 'moderate', 'deep']).default('moderate'),
});
export const ReflectionPaperOutputSchema = z.object({
    title: z.string(),
    introduction: z.string(),
    experienceDescription: z.string(),
    personalReflection: z.string(),
    analysis: z.string(),
    lessonsLearned: z.array(z.string()),
    futureImplications: z.string(),
    conclusion: z.string(),
    fullPaper: z.string().describe('الورقة التأملية الكاملة بصيغة markdown'),
});
export type ReflectionPaperInput = z.infer<typeof ReflectionPaperInputSchema>;
export type ReflectionPaperOutput = z.infer<typeof ReflectionPaperOutputSchema>;

// 17. Technical Report - تقرير فني
export const TechnicalReportInputSchema = z.object({
    flow: z.literal('technical-report'),
    projectTitle: z.string().min(5).describe('عنوان المشروع'),
    projectType: z.enum(['software', 'hardware', 'engineering', 'research', 'analysis']),
    objective: z.string().min(30).describe('الهدف'),
    methodology: z.string().min(50).describe('المنهجية'),
    technicalDetails: z.array(z.string()).min(3).describe('التفاصيل الفنية'),
    results: z.string().min(50).describe('النتائج'),
    includeDiagrams: z.boolean().default(true),
    includeCodeExamples: z.boolean().default(false),
    targetAudience: z.enum(['technical', 'non-technical', 'mixed']).default('technical'),
    targetLength: z.number().min(2000).max(10000).default(4000),
    citationStyle: AcademicStyleSchema.default('ieee'),
});
export const TechnicalReportOutputSchema = z.object({
    title: z.string(),
    abstract: z.string(),
    introduction: z.string(),
    background: z.string(),
    methodology: z.string(),
    technicalSpecifications: z.string(),
    implementation: z.string(),
    results: z.string(),
    discussion: z.string(),
    recommendations: z.array(z.string()),
    conclusion: z.string(),
    references: z.array(z.string()),
    appendices: z.array(z.object({
        title: z.string(),
        content: z.string(),
    })).optional(),
    fullReport: z.string().describe('التقرير الفني الكامل بصيغة markdown'),
});
export type TechnicalReportInput = z.infer<typeof TechnicalReportInputSchema>;
export type TechnicalReportOutput = z.infer<typeof TechnicalReportOutputSchema>;

// Define a union type for all possible inputs
export const AIFlowInputSchema = z.union([
    ParaphraseInputSchema,
    SummarizeInputSchema,
    AiProofreadDocumentInputSchema,
    AIResearcherInputSchema,
    SolveAssignmentsInputSchema,
    GenerateProjectBlueprintInputSchema,
    LiteratureReviewInputSchema,
    QuestionAnsweringInputSchema,
    FactRetrievalInputSchema,
    AnalyzeContextInputSchema,
    BiasCheckInputSchema,
    SentenceStructureCheckInputSchema,
    DetectAIInputSchema,
    FactCheckInputSchema,
    GenerateAgentConfigInputSchema,
    GenerateCitationInputSchema,
    GenerateDiagramInputSchema,
    GeneratePlantUMLInputSchema,
    GenerateImageInputSchema,
    IdeaGenerationInputSchema,
    GenerateQuizInputSchema,
    GenerateSectionInputSchema,
    GenerateTextInputSchema,
    GrammarCheckInputSchema,
    HumanizeTextInputSchema,
    ImageToTextInputSchema,
    ImproveMarkdownInputSchema,
    ManipulateTextInputSchema,
    PlagiarismCheckInputSchema,
    RewriteDocumentInputSchema,
    RewriteToMarkdownInputSchema,
    SummarizeDocumentInputSchema,
    SummarizeProjectInputSchema,
    RewriteTextInputSchema,
    SummarizeTextWithRatioInputSchema,
    StyleEditorInputSchema,
    ReadabilityEnhancerInputSchema,
    ConcisenessCheckerInputSchema,
    ClarityAdvisorInputSchema,
    TopicExplainerInputSchema,
    TranslateTextInputSchema,
    WriteDocumentInputSchema,
    EvaluateReportInputSchema,
    GenerateTocInputSchema,
    GenerateUIDescriptionInputSchema,
    ResearchPaperInputSchema,
    AnalyticalEssayInputSchema,
    ArgumentativeEssayInputSchema,
    ComprehensiveLiteratureReviewInputSchema,
    CaseStudyInputSchema,
    LabReportInputSchema,
    ResearchProposalInputSchema,
    ThesisStatementInputSchema,
    DissertationChapterInputSchema,
    TermPaperInputSchema,
    CriticalAnalysisInputSchema,
    BookReviewInputSchema,
    ArticleSummaryInputSchema,
    AnnotatedBibliographyInputSchema,
    PositionPaperInputSchema,
    ReflectionPaperInputSchema,
    TechnicalReportInputSchema,
]);

export type AIFlowInput = z.infer<typeof AIFlowInputSchema>;
