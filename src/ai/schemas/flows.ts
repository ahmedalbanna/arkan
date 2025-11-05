

import { z } from 'zod';
import {
    CitationStyleSchema,
    ClaimStatusSchema,
    DiagramTypeSchema,
    ExternalContextTypeSchema,
    ParaphraseModeSchema,
    QuestionTypeSchema,
    SectionNameSchema,
    SummarizeLengthSchema
} from './enums';

// ai-proofread-document.ts
export const AiProofreadDocumentInputSchema = z.object({
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
export const AIResearcherInputSchema = z.object({
    topic: z.string().describe('The research topic.'),
});
export type AIResearcherInput = z.infer<typeof AIResearcherInputSchema>;

export const AIResearcherOutputSchema = z.object({
    summary: z.string().describe('A comprehensive summary of the research topic.'),
    keyPoints: z.array(z.string()).describe('A list of key points or facts about the topic.'),
    sources: z.array(z.string()).describe('A list of URLs for the sources used.'),
});
export type AIResearcherOutput = z.infer<typeof AIResearcherOutputSchema>;

// analyze-context.ts
export const AnalyzeContextInputSchema = z.object({
    prompt: z.string().describe("The user's question or instruction for what to extract or analyze from the context files."),
    contextFiles: z.array(z.object({
        fileName: z.string(),
        content: z.string(),
        type: ExternalContextTypeSchema,
    })).describe("An array of context files (text, images, PDFs as data URIs) to be analyzed."),
});
export type AnalyzeContextInput = z.infer<typeof AnalyzeContextInputSchema>;

export const AnalyzeContextOutputSchema = z.object({
    schema: z.string().describe("A Zod schema string that defines the structure of the output data. This schema should be dynamically generated based on the user's prompt."),
    data: z.any().describe("The structured data, conforming to the generated schema, extracted and synthesized from the context files based on the user's prompt."),
});
export type AnalyzeContextOutput = z.infer<typeof AnalyzeContextOutputSchema>;

// detect-ai-content.ts
export const DetectAIInputSchema = z.object({
    text: z.string().describe('The text to be analyzed for AI content probability.'),
});
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

export const FactCheckInputSchema = z.object({
    text: z.string().describe('The text containing claims to be fact-checked.'),
});
export type FactCheckInput = z.infer<typeof FactCheckInputSchema>;

export const FactCheckOutputSchema = z.object({
    claims: z.array(ClaimSchema).describe("An array of identified claims and their verification details."),
    originalityScore: z.number().min(0).max(100).describe("An overall score from 0 to 100 representing the factual accuracy and originality of the text, where 100 is completely accurate.")
});
export type FactCheckOutput = z.infer<typeof FactCheckOutputSchema>;

// generate-agent-config.ts
export const GenerateAgentConfigInputSchema = z.object({
    prompt: z.string().describe("The user's description of the agent to create."),
    includeJsonOutput: z.boolean().optional().describe("Whether to include a sample JSON output structure in the agent's prompt."),
    contextFiles: z.array(z.object({
        name: z.string(),
        type: z.string(),
        content: z.string(), // data URI
    })).optional().describe("An array of contextual documents (text, images) to inform the agent's creation."),
});

export const GenerateAgentConfigOutputSchema = z.object({
    name: z.string().describe("A short, descriptive name for the new agent."),
    description: z.string().describe("A concise, one-sentence description of the agent's purpose."),
    instructions: z.string().describe("The base prompt or primary instruction for the agent. This should be a clear, concise paragraph explaining the agent's purpose and core function."),
    guidelines: z.string().describe("A newline-separated list of 3-5 specific, actionable guidelines for the agent to follow. Each guideline should start with '- '."),
    jsonStructure: z.any().optional().describe("If the user requested JSON output, provide a sample JSON object structure that the agent should return. It should be a simple but relevant example based on the user's prompt and any provided context. Otherwise, this field should be omitted."),
});
export type GenerateAgentConfigOutput = z.infer<typeof GenerateAgentConfigOutputSchema>;


// generate-citation.ts
export const GenerateCitationInputSchema = z.object({
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
export const GenerateDiagramInputSchema = z.object({
    diagramToGenerate: DiagramTypeSchema.describe("The type of diagram to generate."),
    otherSections: z.record(SectionNameSchema, z.string()).optional().describe("A map of previously generated text sections to provide context."),
    otherDiagrams: z.record(DiagramTypeSchema, z.string()).optional().describe("A map of previously generated PlantUML diagrams to provide context."),
    externalContext: z.array(z.object({
        fileName: z.string(),
        content: z.string(),
        type: ExternalContextTypeSchema,
    })).optional().describe("An array of external documents (text or data URIs) provided by the user."),
    guidelines: z.array(z.string()).optional().describe("A list of specific guidelines for the agent to follow."),
    instructionText: z.string().optional().describe("Additional instructions for generation (e.g., tone, formality)."),
});
export type GenerateDiagramInput = z.infer<typeof GenerateDiagramInputSchema>;

export const GenerateDiagramOutputSchema = z.object({
    plantUmlCode: z.string().describe("The complete PlantUML code for the diagram, starting with @startuml and ending with @enduml."),
    explanation: z.string().describe("A detailed explanation of the generated diagram, formatted in markdown."),
});
export type GenerateDiagramOutput = z.infer<typeof GenerateDiagramOutputSchema>;

// generate-plantuml.ts
export const GeneratePlantUMLInputSchema = z.object({
    description: z.string().describe("A detailed text description of the diagram to be generated."),
    diagramType: DiagramTypeSchema.describe("The type of PlantUML diagram to generate."),
});
export type GeneratePlantUMLInput = z.infer<typeof GeneratePlantUMLInputSchema>;

// We can reuse the output schema from generate-diagrams
export const GeneratePlantUMLOutputSchema = GenerateDiagramOutputSchema;
export type GeneratePlantUMLOutput = z.infer<typeof GeneratePlantUMLOutputSchema>;


// generate-image.ts
export const GenerateImageInputSchema = z.object({
    prompt: z.string().describe("A text description of the image to be generated."),
});
export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;

export const GenerateImageOutputSchema = z.object({
    imageUrl: z.string().describe("The generated image as a Base64 data URI."),
});
export type GenerateImageOutput = z.infer<typeof GenerateImageOutputSchema>;

// generate-ideas.ts
export const IdeaSchema = z.object({
    title: z.string().describe('A catchy and descriptive title for the idea.'),
    description: z.string().describe('A brief, one-paragraph description of the idea, explaining the concept and its potential.'),
});

export const IdeaGenerationInputSchema = z.object({
    specialization: z.string().describe('The user\'s field of expertise or specialization (e.g., "Web Development", "Marketing", "Biotechnology").'),
    domain: z.string().optional().describe('The specific industry or domain of interest (e.g., "E-commerce", "Healthcare", "Education").'),
    region: z.string().optional().describe('The geographical region or country to target (e.g., "Southeast Asia", "Germany").'),
    circumstances: z.string().optional().describe('Any specific circumstances, trends, or constraints (e.g., "post-pandemic recovery", "rising inflation", "remote work transition").'),
    additionalContext: z.string().optional().describe('Any other relevant information or detailed context provided by the user.'),
});
export type IdeaGenerationInput = z.infer<typeof IdeaGenerationInputSchema>;

export const IdeaGenerationOutputSchema = z.object({
    ideas: z.array(IdeaSchema).describe('A list of generated ideas, each with a title and description.'),
});
export type IdeaGenerationOutput = z.infer<typeof IdeaGenerationOutputSchema>;

// generate-quiz.ts
const MultipleChoiceQuestionSchema = z.object({
    type: z.enum(['multiple-choice']),
    question: z.string().describe("The question text."),
    options: z.array(z.string()).length(4).describe("An array of 4 possible answers."),
    answer: z.string().describe("The correct answer from the options."),
});

const TrueFalseQuestionSchema = z.object({
    type: z.enum(['true-false']),
    question: z.string().describe("The statement to be evaluated."),
    options: z.array(z.string()).length(2).describe("The options: an array containing 'True' and 'False'."),
    answer: z.enum(['True', 'False']).describe("The correct answer, either 'True' or 'False'."),
});

const DirectQuestionSchema = z.object({
    type: z.enum(['direct-question']),
    question: z.string().describe("The open-ended question."),
    answer: z.string().describe("A concise, ideal answer to the question."),
});

export const QuizQuestionSchema = z.discriminatedUnion('type', [
    MultipleChoiceQuestionSchema,
    TrueFalseQuestionSchema,
    DirectQuestionSchema,
]);

export const GenerateQuizInputSchema = z.object({
    text: z.string().describe('The source text to generate the quiz from.'),
    numQuestions: z.number().int().min(1).max(20).describe('The number of questions to generate.'),
    questionType: QuestionTypeSchema.describe('The type of questions to generate.'),
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

export const GenerateQuizOutputSchema = z.object({
    questions: z.array(QuizQuestionSchema).describe("An array of quiz questions of the specified type."),
});
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;

// generate-report-section.ts
export const GenerateSectionInputSchema = z.object({
    sectionToGenerate: SectionNameSchema,
    // The agent prompt is now the main prompt for the section
    prompt: z.string().min(10, 'Prompt must be at least 10 characters.'),
    otherSections: z.record(z.string(), z.string()).optional().describe("A map of previously generated text sections and other textual context (like the proposal or plan). The key is the item's name and the value is the markdown/JSON content."),
    externalContext: z.array(z.object({
        fileName: z.string(),
        content: z.string(),
        type: ExternalContextTypeSchema,
    })).optional().describe("An array of external documents to be used for style, tone, and structure."),
    guidelines: z.array(z.string()).optional().describe("A list of specific guidelines for the agent to follow."),
    instructionText: z.string().optional().describe("Additional specific instructions for the generation, derived from user controls like tone and formality."),
}).refine(data => (data.otherSections && Object.keys(data.otherSections).length > 0) || (data.externalContext && data.externalContext.length > 0) || data.prompt, {
    message: "Some context (like a proposal, other sections, or context files) is required to generate a report section.",
    path: ["otherSections"], // Associate error with a path
});


export type GenerateSectionInput = z.infer<typeof GenerateSectionInputSchema>;

export const GenerateSectionOutputSchema = z.object({
    sectionName: SectionNameSchema.describe("The name of the section that was generated. This must match the 'sectionToGenerate' from the input."),
    content: z.string().describe("The generated markdown content for the specified section."),
});
export type GenerateSectionOutput = z.infer<typeof GenerateSectionOutputSchema>;

// generate-text.ts
export const GenerateTextInputSchema = z.object({
    prompt: z
        .string()
        .describe('The prompt to generate text from.'),
});
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
});

export const GrammarCheckInputSchema = z.object({
    text: z.string().describe('The text to be checked for grammar and spelling mistakes.'),
});
export type GrammarCheckInput = z.infer<typeof GrammarCheckInputSchema>;

export const GrammarCheckOutputSchema = z.object({
    correctedText: z.string().describe("The full text with all corrections applied, preserving original markdown."),
    corrections: z.array(CorrectionSchema).describe("A list of the specific corrections made."),
});
export type GrammarCheckOutput = z.infer<typeof GrammarCheckOutputSchema>;


// humanize-text.ts
export const HumanizeTextInputSchema = z.object({
    text: z.string().describe('The AI-generated text to be humanized.'),
});
export type HumanizeTextInput = z.infer<typeof HumanizeTextInputSchema>;

export const HumanizeTextOutputSchema = z.object({
    humanizedText: z.string().describe('The rewritten text, which sounds more natural and less robotic.'),
});
export type HumanizeTextOutput = z.infer<typeof HumanizeTextOutputSchema>;


// image-to-text.ts
export const ImageToTextInputSchema = z.object({
    imageDataUri: z.string().describe("An image file encoded as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:image/...;base64,<encoded_data>'."),
});
export type ImageToTextInput = z.infer<typeof ImageToTextInputSchema>;

export const ImageToTextOutputSchema = z.object({
    text: z.string().describe('The extracted text content from the image, formatted as markdown.'),
});
export type ImageToTextOutput = z.infer<typeof ImageToTextOutputSchema>;


// improve-report-markdown.ts
export const ImproveMarkdownInputSchema = z.object({
    markdownContent: z.string().min(20, 'Markdown content is too short.'),
    userPrompt: z.string().min(10, 'Instructions for the AI must be at least 10 characters.'),
});
export type ImproveMarkdownInput = z.infer<typeof ImproveMarkdownInputSchema>;

export const ImproveMarkdownOutputSchema = z.object({
    improvedMarkdown: z.string().describe('The improved and reformatted Markdown content.'),
});
export type ImproveMarkdownOutput = z.infer<typeof ImproveMarkdownOutputSchema>;


// manipulate-text.ts
export const ManipulateTextInputSchema = z.object({
    textToManipulate: z.string().describe('The original text to be modified.'),
    command: z.string().describe('The instruction for how to modify the text (e.g., "summarize", "expand on this topic", "rewrite this to be more formal").'),
});
export type ManipulateTextInput = z.infer<typeof ManipulateTextInputSchema>;

export const ManipulateTextOutputSchema = z.object({
    rewrittenText: z.string().describe('The resulting text after applying the command.'),
});
export type ManipulateTextOutput = z.infer<typeof ManipulateTextOutputSchema>;

// paraphrase-text.ts
export const ParaphraseInputSchema = z.object({
    text: z.string().describe('The text to be paraphrased.'),
    mode: ParaphraseModeSchema.describe('The desired style of the paraphrased text.'),
});
export type ParaphraseInput = z.infer<typeof ParaphraseInputSchema>;


export const ParaphraseOutputSchema = z.object({
    paraphrasedText: z.string().describe('The rewritten text, with original markdown formatting preserved.'),
});
export type ParaphraseOutput = z.infer<typeof ParaphraseOutputSchema>;


// plagiarism-checker.ts
export const MatchedSourceSchema = z.object({
    source: z.string().describe("The full, real URL of the source where the similar text was found. This must be a complete and valid URL (e.g., https://www.example.com/article)."),
    title: z.string().describe("The title of the webpage or article found at the source URL."),
    summary: z.string().describe("A brief summary of the content from the source that is similar to the user's text."),
    similarity: z.number().min(0).max(100).describe("A percentage score (0-100) indicating how similar the provided text is to the found source."),
});

export const PlagiarismCheckInputSchema = z.object({
    text: z.string().describe('The text to be checked for plagiarism.'),
});
export type PlagiarismCheckInput = z.infer<typeof PlagiarismCheckInputSchema>;

export const PlagiarismCheckOutputSchema = z.object({
    originalityScore: z.number().min(0).max(100).describe("An overall score from 0 to 100 representing how original the text is, where 100 is completely unique."),
    matches: z.array(MatchedSourceSchema).describe("An array of potential sources that contain similar text."),
});
export type PlagiarismCheckOutput = z.infer<typeof PlagiarismCheckOutputSchema>;


// rewrite-document-to-markdown.ts
export const RewriteDocumentInputSchema = z.object({
    pdfDataUri: z.string().describe("A PDF file encoded as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:application/pdf;base64,<encoded_data>'."),
});
export type RewriteDocumentInput = z.infer<typeof RewriteDocumentInputSchema>;

export const RewriteDocumentOutputSchema = z.object({
    markdown: z.string().describe('The rewritten content, formatted as clean, well-structured markdown.'),
});
export type RewriteDocumentOutput = z.infer<typeof RewriteDocumentOutputSchema>;


// rewrite-to-markdown.ts
export const RewriteToMarkdownInputSchema = z.object({
    rawText: z.string().describe('The raw, unstructured text extracted from a document.'),
});
export type RewriteToMarkdownInput = z.infer<typeof RewriteToMarkdownInputSchema>;

export const RewriteToMarkdownOutputSchema = z.object({
    markdown: z.string().describe('The rewritten content, formatted as clean, well-structured markdown.'),
});
export type RewriteToMarkdownOutput = z.infer<typeof RewriteToMarkdownOutputSchema>;


// summarize-document.ts
export const SummarizeDocumentInputSchema = z.object({
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


// summarize-text.ts
export const SummarizeInputSchema = z.object({
    text: z.string().describe('The text to be summarized.'),
    length: SummarizeLengthSchema.describe('The desired length of the summary.'),
});
export type SummarizeInput = z.infer<typeof SummarizeInputSchema>;


export const SummarizeOutputSchema = z.object({
    summary: z.string().describe('The generated summary of the original text.'),
});
export type SummarizeOutput = z.infer<typeof SummarizeOutputSchema>;


// text-stylist.ts
export const RewriteTextInputSchema = z.object({
    text: z.string().describe('The text to be rewritten.'),
    style: z.string().describe('The target style for the rewritten text (e.g., Formal, Creative, Simple).'),
});
export type RewriteTextInput = z.infer<typeof RewriteTextInputSchema>;


export const RewriteTextOutputSchema = z.object({
    rewrittenText: z.string().describe('The text rewritten in the specified style.'),
});
export type RewriteTextOutput = z.infer<typeof RewriteTextOutputSchema>;

export const SummarizeTextWithRatioInputSchema = z.object({
    text: z.string().describe('The text to be summarized.'),
    ratio: z.number().min(10).max(90).describe('The desired compression ratio (10% - 90%). 10% is a very short summary, 90% is almost the original length.'),
});
export type SummarizeTextWithRatioInput = z.infer<typeof SummarizeTextWithRatioInputSchema>;

export const SummarizeTextWithRatioOutputSchema = z.object({
    summarizedText: z.string().describe('The generated summary of the original text.'),
});
export type SummarizeTextWithRatioOutput = z.infer<typeof SummarizeTextWithRatioOutputSchema>;


// topic-explainer.ts
export const TopicExplainerInputSchema = z.object({
    topic: z.string().describe('The complex topic to be explained.'),
});
export type TopicExplainerInput = z.infer<typeof TopicExplainerInputSchema>;

export const TopicExplainerOutputSchema = z.object({
    explanation: z.string().describe('A simple, easy-to-understand explanation of the topic, formatted as markdown.'),
});
export type TopicExplainerOutput = z.infer<typeof TopicExplainerOutputSchema>;

// translate-text.ts
export const TranslateTextInputSchema = z.object({
    text: z.string().describe('The text to be translated.'),
    targetLang: z.string().describe('The target language (e.g., "English", "Arabic").'),
});
export type TranslateVariables = z.infer<typeof TranslateTextInputSchema>;
export type TranslateTextInput = z.infer<typeof TranslateTextInputSchema>;

export const TranslateTextOutputSchema = z.object({
    translatedText: z.string().describe('The resulting translated text, with original markdown formatting preserved.'),
});
export type TranslateTextOutput = z.infer<typeof TranslateTextOutputSchema>;


// write-document.ts
export const WriteDocumentInputSchema = z.object({
    topic: z.string().describe('The topic or title of the document to be written.'),
    documentType: z.string().describe('The type of document to generate (e.g., "Blog Post", "Formal Report", "Essay", "Technical Article").'),
    knowledge: z.string().optional().describe('Any specific knowledge, context, or instructions for the document.'),
    tableOfContents: z.array(z.string()).optional().describe("An optional list of headings to be used as the document's structure."),
});
export type WriteDocumentInput = z.infer<typeof WriteDocumentInputSchema>;

export const WriteDocumentOutputSchema = z.object({
    documentContent: z.string().describe('The fully generated document content, formatted as markdown.'),
});
export type WriteDocumentOutput = z.infer<typeof WriteDocumentOutputSchema>;

// evaluate-report.ts
export const EvaluateReportInputSchema = z.object({
    reportSections: z.record(SectionNameSchema, z.string()).describe("A map of all generated report sections."),
    diagrams: z.record(DiagramTypeSchema, z.string()).optional().describe("A map of all generated PlantUML diagrams.").nullable(),
    acceptanceCriteria: z.array(z.string()).describe("A list of acceptance criteria to evaluate the report against.").nullable().optional(),
});
export type EvaluateReportInput = z.infer<typeof EvaluateReportInputSchema>;

export const FeedbackItemSchema = z.object({
    point: z.string().describe("A specific feedback point related to one of the acceptance criteria."),
    status: z.enum(["Acceptable", "Weak", "Not Present"]).describe("The status of the report regarding this feedback point."),
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
    projectDescription: z.string().min(10, 'Project idea must be at least 10 characters.'),
});
export type GenerateTocInput = z.infer<typeof GenerateTocInputSchema>;

export const GenerateTocOutputSchema = z.object({
    tableOfContents: z.array(z.string()).describe('A list of suggested section titles for the table of contents.'),
});
export type GenerateTocOutput = z.infer<typeof GenerateTocOutputSchema>;
