

import { z } from 'zod';
import { DocxStyleOptionsSchema, PptxStyleOptionsSchema, AgentPromptSchema } from './schemas/template-schemas';
import { defaultAgentCategories } from '@/lib/agent-categories';

// Extract category IDs for use in Zod enum
const categoryIds = defaultAgentCategories.map(cat => cat.id) as [string, ...string[]];

// Generic Schemas
export const DiagramTypeSchema = z.enum([
  'use-case',
  'class',
  'sequence',
  'activity',
  'component',
  'archimate',
  'er'
]);
export type DiagramType = z.infer<typeof DiagramTypeSchema>;

export const SectionNameSchema = z.enum([
  'introduction',
  'literatureReview',
  'systemAnalysis',
  'designStrategy',
  'systemDesign',
  'systemProgramming',
  'systemTesting',
  'conclusion',
  'abstract',
  'acknowledgment',
  'trainingProgram',
  'technicalExperience',
  'recommendations',
  'references',
  'appendices'
]);
export type SectionName = z.infer<typeof SectionNameSchema>;


// academic-solver.ts
export const AcademicDocumentTypeSchema = z.enum(['exam', 'homework']);
export type AcademicDocumentType = z.infer<typeof AcademicDocumentTypeSchema>;

export const AnalyzedDocumentSchema = z.object({
  documentType: AcademicDocumentTypeSchema.describe('The type of document, either "exam" or "homework".'),
  subject: z.string().describe('The main subject of the document (e.g., "Physics", "History", "Algebra").'),
  title: z.string().describe('A concise title for the assignment (e.g., "Quantum Mechanics Final", "World War II Worksheet").'),
  structuredContent: z.string().describe('The original content, restructured and cleaned up in Markdown format for clarity and better processing.'),
  language: z.string().describe("The language of the document (e.g., 'English', 'Spanish', 'Arabic')."),
});
export type AnalyzedDocument = z.infer<typeof AnalyzedDocumentSchema>;

export const QuestionAnswerPairSchema = z.object({
  question: z.string().describe("The original question from the document."),
  solution: z.string().describe("A detailed, well-structured solution to the question, formatted in Markdown."),
});

export const SolvedDocumentSchema = z.object({
  solutions: z.array(QuestionAnswerPairSchema).describe("An array of question and solution pairs."),
});
export type SolvedDocument = z.infer<typeof SolvedDocumentSchema>;

export const AnalyzeDocumentInputSchema = z.object({
  documentType: AcademicDocumentTypeSchema,
  markdownContent: z.string().min(10, 'Markdown content is too short.'),
});
export type AnalyzeDocumentInput = z.infer<typeof AnalyzeDocumentInputSchema>;


export const SolveDocumentInputSchema = z.object({
  analyzedDocument: AnalyzedDocumentSchema,
  contextMarkdown: z.string().optional().describe("Additional context from a syllabus or textbook to help answer the questions accurately."),
});
export type SolveDocumentInput = z.infer<typeof SolveDocumentInputSchema>;

// agent-chat.ts
export const AgentChatInputSchema = z.object({
  agentId: z.string().describe("The ID of the agent to chat with."),
  message: z.string().describe("The user's message to the agent."),
});
export type AgentChatInput = z.infer<typeof AgentChatInputSchema>;

export const AgentChatOutputSchema = z.object({
  response: z.string().describe("The agent's text response."),
});
export type AgentChatOutput = z.infer<typeof AgentChatOutputSchema>;


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
    type: z.enum(['context', 'example', 'question', 'textbook', 'guidelines']),
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
export const ClaimStatusSchema = z.enum(['Verified', 'False', 'Inconclusive']);
export type ClaimStatus = z.infer<typeof ClaimStatusSchema>;

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
export const CitationStyleSchema = z.enum(['apa', 'mla', 'chicago', 'ieee']);
export type CitationStyle = z.infer<typeof CitationStyleSchema>;

export const GenerateCitationInputSchema = z.object({
  sourceText: z.string().describe('The source material to generate a citation for. This can be a URL, a block of text from an article, or a book title and author.'),
  style: CitationStyleSchema.describe('The citation style to use (e.g., APA, MLA).'),
});
export type GenerateCitationInput = z.infer<typeof GenerateCitationInputSchema>;

export const GenerateCitationOutputSchema = z.object({
  citation: z.string().describe('The formatted citation string.'),
});
export type GenerateCitationOutput = z.infer<typeof GenerateCitationOutputSchema>;

// generate-code.ts
export const GenerateCodeInputSchema = z.object({
  prompt: z.string().describe("A description of the UI component to be generated."),
});
export type GenerateCodeInput = z.infer<typeof GenerateCodeInputSchema>;

export const GenerateCodeOutputSchema = z.object({
  html: z.string().describe("The complete HTML code for the component. It should not include <html>, <head>, or <body> tags, only the component's structure."),
  css: z.string().describe("The complete CSS code to style the component. It should not include <style> tags."),
  javascript: z.string().describe("The JavaScript code for any interactivity. It should not include <script> tags. Use vanilla JS that can be run in the browser.").optional(),
});
export type GenerateCodeOutput = z.infer<typeof GenerateCodeOutputSchema>;


// generate-codebase.ts
export const GeneratedFileSchema = z.object({
  path: z.string().describe('The full path of the file, including directories and the file name (e.g., "src/app/page.tsx").'),
  content: z.string().describe('The complete source code or content for the file.'),
});

export const CodebaseSchema = z.object({
  files: z.array(GeneratedFileSchema).describe('An array of all the files that make up the codebase.'),
});
export type Codebase = z.infer<typeof CodebaseSchema>;

// Project Plan Schemas (also used in generate-codebase)
export const ProjectTaskSchema = z.object({
  title: z.string().describe('A concise title for the task or user story.'),
  description: z.string().describe('A detailed description of the task, explaining what needs to be done.'),
  acceptanceCriteria: z.array(z.string()).describe('A list of specific, measurable criteria that must be met for the task to be considered complete.'),
});
export type ProjectTask = z.infer<typeof ProjectTaskSchema>;

export const ProjectPhaseSchema = z.object({
  phaseName: z.string().describe('The name of the project phase (e.g., "Sprint 1: User Authentication", "Phase 2: UI/UX Design").'),
  tasks: z.array(ProjectTaskSchema).describe('An array of tasks to be completed within this phase.'),
});
export type ProjectPhase = z.infer<typeof ProjectPhaseSchema>;

export const ProjectPlanSchema = z.object({
  phases: z.array(ProjectPhaseSchema).describe('The full list of project phases, each containing a list of tasks.'),
});
export type ProjectPlan = z.infer<typeof ProjectPlanSchema>;


export const ProjectProposalSchema = z.object({
  category: z.string().describe("A relevant category for the project (e.g., 'Software Development', 'UI/UX Design', 'AI')."),
  title: z.string().describe("A clear and descriptive title for the project."),
  objective: z.string().describe("The main goal or objective of the project. What problem does it solve?"),
  methodology: z.string().describe("The approach and process to be followed (e.g., Agile, Waterfall). Describe the key phases."),
  expected_outcome: z.array(z.string()).describe("A list of tangible and measurable results expected from the project."),
  timeline: z.object({
    startDate: z.string().describe("The planned start date for the project in YYYY-MM-DD format. Base this on the current date."),
    endDate: z.string().describe("The planned end date for the project in YYYY-MM-DD format."),
    phases: z.array(z.object({
      name: z.string().describe("The name of the project phase (e.g., 'Discovery & Planning')."),
      durationWeeks: z.number().describe("The duration of the phase in weeks."),
    })).describe("An array of project phases with their names and durations."),
  }).describe("The project timeline, including start/end dates and phases."),
  budget: z.object({
    totalAmount: z.number().describe("The total estimated budget for the project."),
    currency: z.string().describe("The currency for the budget (e.g., 'USD')."),
    breakdown: z.array(z.object({
      item: z.string().describe("A specific item in the budget breakdown (e.g., 'Labor', 'Software Licensing')."),
      cost: z.number().describe("The estimated cost for this budget item."),
    })).describe("A detailed breakdown of the project budget."),
  }).describe("The estimated budget for the project."),
  stakeholders: z.array(z.object({
    name: z.string().describe("The name of the stakeholder or stakeholder group."),
    role: z.string().describe("The stakeholder's role in the project (e.g., 'Primary User', 'Sponsor')."),
    interest: z.string().describe("The stakeholder's interest or investment in the project."),
  })).describe("A list of key stakeholders involved in the project.").optional(),
  success_criteria: z.array(z.string()).describe("A list of measurable criteria that will define the project's success.").optional(),
  evaluation: z.string().describe("A description of how the project's success will be measured and assessed."),
  tags: z.array(z.string()).describe("A list of 3 to 5 relevant keywords or tags for the project (e.g., 'Productivity', 'eCommerce', 'AI').").optional(),
  risks: z.array(z.object({
    description: z.string().describe("A description of a potential risk to the project."),
    mitigation: z.string().describe("The strategy to mitigate this potential risk."),
  })).describe("A list of potential risks and their mitigation strategies."),
});
export type ProjectProposal = z.infer<typeof ProjectProposalSchema>;


export const GenerateCodebaseInputSchema = z.object({
  proposal: ProjectProposalSchema.describe('The project proposal to base the codebase on.'),
});

// generate-diagrams.ts
export const GenerateDiagramInputSchema = z.object({
  proposal: ProjectProposalSchema.optional(),
  projectPlan: ProjectPlanSchema.optional().nullable().describe("The detailed project plan with phases and tasks."),
  diagramToGenerate: DiagramTypeSchema.describe("The type of diagram to generate."),
  otherSections: z.record(SectionNameSchema, z.string()).optional().describe("A map of previously generated text sections to provide context."),
  otherDiagrams: z.record(DiagramTypeSchema, z.string()).optional().describe("A map of previously generated PlantUML diagrams to provide context."),
  externalContext: z.array(z.object({
      fileName: z.string(),
      content: z.string(),
  })).optional().describe("An array of external documents (text or data URIs) provided by the user."),
  guidelines: z.array(z.string()).optional().describe("A list of specific guidelines for the agent to follow."),
  instructionText: z.string().optional().describe("Additional instructions for generation (e.g., tone, formality)."),
});
export type GenerateDiagramInput = z.infer<typeof GenerateDiagramInputSchema>;

export const GenerateDiagramOutputSchema = z.object({
  plantUmlCode: z.string().describe("The complete PlantUML code for the diagram, starting with @startuml and ending with @enduml.")
});
export type GenerateDiagramOutput = z.infer<typeof GenerateDiagramOutputSchema>;


// generate-image.ts
export const GenerateImageInputSchema = z.object({
  prompt: z.string().describe("A text description of the image to be generated."),
});
export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;

export const GenerateImageOutputSchema = z.object({
  imageUrl: z.string().describe("The generated image as a Base64 data URI."),
});
export type GenerateImageOutput = z.infer<typeof GenerateImageOutputSchema>;

// generate-presentation-outline.ts
export const GeneratePresentationOutlineInputSchema = z.object({
  prompt: z.string().describe('The topic or prompt for the presentation.'),
  documentation: z.string().optional().describe('Optional documentation or context to base the outline on.'),
});
export type GeneratePresentationOutlineInput = z.infer<typeof GeneratePresentationOutlineInputSchema>;

type OutlineItem = {
  title: string;
  content: string;
  children?: OutlineItem[];
}

export const OutlineItemSchema: z.ZodSchema<OutlineItem> = z.object({
  title: z.string().describe('The title of the slide or section.'),
  content: z.string().describe('A brief description of the content for this item.'),
  children: z.array(z.lazy(() => OutlineItemSchema)).optional().describe('Sub-items for this outline entry.'),
});

export const GeneratePresentationOutlineOutputSchema = z.object({
  cover: z.object({
    title: z.string(),
  }),
  outline: z.array(OutlineItemSchema),
});
export type GeneratePresentationOutlineOutput = z.infer<typeof GeneratePresentationOutlineOutputSchema>;


// generate-presentation.ts
export const PresentationSlideSchema = z.object({
  title: z.string().describe('The title for this presentation slide.'),
  content: z.array(z.string()).describe('A list of bullet points for the main content of the slide. Each string is one bullet point.'),
  speakerNotes: z.string().describe('Detailed speaker notes for the presenter to elaborate on the slide content.'),
  layout: z.enum(['title_and_content', 'title_only', 'section_header', 'image_with_caption']).optional().describe("The suggested layout for the slide."),
});
export type PresentationSlide = z.infer<typeof PresentationSlideSchema>;

export const GeneratePresentationInputSchema = z.object({
  proposal: ProjectProposalSchema.nullable().optional().describe("An optional project proposal for high-level context."),
  projectPlan: ProjectPlanSchema.nullable().optional().describe("The project plan with phases and tasks."),
  guidelines: z.array(z.string()).optional(),
  sourceDocuments: z.array(z.object({
      fileName: z.string(),
      content: z.string(),
  })).min(1, "At least one source document is required.").describe("An array of source documents (text or data URIs) to be synthesized into a presentation."),
  templateId: z.string(), // The ID of the template which contains the primary agent and other config
  tone: z.string().optional().describe("The desired tone for the presentation (e.g., 'Professional', 'Casual')."),
  complexity: z.string().optional().describe("The desired complexity (e.g., 'High-level Summary', 'Detailed').")
});
export type GeneratePresentationInput = z.infer<typeof GeneratePresentationInputSchema>;

export const GeneratePresentationOutputSchema = z.object({
  slides: z.array(PresentationSlideSchema),
});
export type GeneratePresentationOutput = z.infer<typeof GeneratePresentationOutputSchema>;


// generate-project-plan.ts
export const GenerateProjectPlanInputSchema = z.object({
  projectDescription: z.string().describe("A description of the project idea, objectives, and goals."),
  keyDeliverables: z.string().describe("A summary of the key features and deliverables for the project."),
  numPhases: z.number().int().min(2).max(10).describe("The desired number of phases for the project plan.").optional(),
});
export type GenerateProjectPlanInput = z.infer<typeof GenerateProjectPlanInputSchema>;


// generate-proposal.ts
export const GenerateProposalInputSchema = z.object({
  projectIdea: z.string().describe('A short description of the project idea.'),
  prompt: z.string().describe('The base prompt to use for generating the proposal.'),
  guidelines: z.array(z.string()).optional().describe("A list of specific guidelines for the agent to follow."),
  externalContext: z.array(z.object({
      fileName: z.string(),
      content: z.string(),
  })).optional().describe("An array of external documents (text or data URIs) provided by the user."),
});

export type GenerateProposalInput = z.infer<typeof GenerateProposalInputSchema>;


// generate-quiz.ts
export const GenerateQuizInputSchema = z.object({
  text: z.string().describe('The source text to generate the quiz from.'),
  numQuestions: z.number().int().min(1).max(10).describe('The number of questions to generate.'),
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

export const QuizQuestionSchema = z.object({
  question: z.string().describe("The question text."),
  options: z.array(z.string()).describe("An array of 4 possible answers (multiple choice)."),
  answer: z.string().describe("The correct answer from the options."),
});

export const GenerateQuizOutputSchema = z.object({
  questions: z.array(QuizQuestionSchema).describe("An array of quiz questions."),
});
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;


// generate-report-section.ts
export const AnyProjectProposalSchema = z.object({}).passthrough();
export type AnyProjectProposal = z.infer<typeof AnyProjectProposalSchema>;

export const GenerateSectionInputSchema = z.object({
  proposal: AnyProjectProposalSchema.optional().nullable(),
  projectPlan: ProjectPlanSchema.optional().nullable(),
  sectionToGenerate: SectionNameSchema,
  otherSections: z.object({}).passthrough().refine(obj => {
    return Object.keys(obj).every(key => SectionNameSchema.safeParse(key).success);
  }, "All keys must be a valid SectionName").optional().describe("A map of previously generated text sections to provide context. The key is the section name and the value is the markdown content."),
  otherDiagrams: z.object({}).passthrough().refine(obj => {
    return Object.keys(obj).every(key => DiagramTypeSchema.safeParse(key).success);
  }, "All keys must be a valid DiagramType").optional().describe("A map of previously generated PlantUML diagrams to provide context. The key is the diagram type and the value is the PlantUML code."),
  exampleFiles: z.array(z.object({ fileName: z.string(), content: z.string() })).optional().describe("An array of example documents to be used for style, tone, and structure."),
  contextFiles: z.array(z.object({ fileName: z.string(), content: z.string() })).optional().describe("An array of context documents to be used for factual information."),
  guidelines: z.array(z.string()).optional().describe("A list of specific guidelines for the agent to follow."),
  instructionText: z.string().optional().describe("Additional specific instructions for the generation, derived from user controls like tone and formality."),
}).refine(data => data.proposal || data.projectPlan || (data.contextFiles && data.contextFiles.length > 0) || (data.otherSections && Object.keys(data.otherSections).length > 0) || (data.otherDiagrams && Object.keys(data.otherDiagrams).length > 0) || (data.exampleFiles && data.exampleFiles.length > 0), {
    message: "A proposal, project plan, or external context is required to generate a report section.",
    path: ["proposal"], // You can associate the error with a specific path
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
  markdownContent: z.string().describe('The full report content in Markdown format.'),
  userPrompt: z.string().describe('Specific instructions from the user on how to improve the document.'),
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
export const ParaphraseModeSchema = z.enum(['standard', 'fluent', 'formal', 'creative', 'simplify']);
export type ParaphraseMode = z.infer<typeof ParaphraseModeSchema>;

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


// select-proposal-template.ts
export const SelectProposalTemplateInputSchema = z.object({
  projectIdea: z.string().describe('A short description of the project idea.'),
});

export const SelectProposalTemplateOutputSchema = z.object({
  templateId: z.enum(['default-software', 'agile-project', 'student-training-plan']).describe('The ID of the most appropriate proposal template.'),
});


// summarize-document.ts
export const SummarizeDocumentInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      'A document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // Explicitly using backticks here, because VS Code interprets " as a special character within a string.
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
  prompt: z.string().describe('The prompt to use for generating the summary.')
});
export type SummarizeProjectInput = z.infer<typeof SummarizeProjectInputSchema>;

export const SummarizeProjectOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the project.'),
  technologies: z.array(z.string()).describe('A list of technologies, frameworks, and libraries identified in the project description.'),
  progress: z.string().describe('Details on the summarization progress'),
});
export type SummarizeProjectOutput = z.infer<typeof SummarizeProjectOutputSchema>;

export const SummarizeFullProjectInputSchema = z.object({
  proposal: AnyProjectProposalSchema.describe("The full JSON of the project proposal."),
  reportMarkdown: z.string().describe("The concatenated markdown content of all generated report sections.")
});
export type SummarizeFullProjectInput = z.infer<typeof SummarizeFullProjectInputSchema>;

export const SummarizeFullProjectOutputSchema = z.object({
  summary: z.string().describe('A concise executive summary of the entire project.'),
});
export type SummarizeFullProjectOutput = z.infer<typeof SummarizeFullProjectOutputSchema>;


// summarize-text.ts
export const SummarizeLengthSchema = z.enum(['short', 'medium', 'long']);
export type SummarizeLength = z.infer<typeof SummarizeLengthSchema>;

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

// translate-presentation.ts
export const PresentationHistoryEntrySchema = z.object({
  id: z.string(),
  name: z.string(),
  slides: z.array(PresentationSlideSchema),
});
export type PresentationHistoryEntry = z.infer<typeof PresentationHistoryEntrySchema>;

export const TranslatePresentationInputSchema = z.object({
  presentation: PresentationHistoryEntrySchema.describe('The presentation object to be translated.'),
  targetLang: z.string().describe('The target language (e.g., "English", "Arabic").'),
});
export type TranslatePresentationInput = z.infer<typeof TranslatePresentationInputSchema>;


// translate-proposal.ts
export const TranslateProposalInputSchema = z.object({
  proposal: ProjectProposalSchema.describe('The project proposal object to be translated.'),
  targetLang: z.string().describe('The target language (e.g., "English", "Arabic").'),
});
export type TranslateProposalInput = z.infer<typeof TranslateProposalInputSchema>;

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

// evaluate-and-select-context.ts
const ExternalContextTypeSchema = z.enum(['context', 'example', 'question', 'textbook', 'guidelines']);

export const ExternalContextSchema = z.object({
    fileName: z.string(),
    content: z.string(),
    type: ExternalContextTypeSchema
});
export type ExternalContext = z.infer<typeof ExternalContextSchema>;

export const EvaluateContextInputSchema = z.object({
  proposal: ProjectProposalSchema.optional().nullable().describe("The original project proposal."),
  projectPlan: ProjectPlanSchema.optional().nullable().describe("The detailed project plan with phases and tasks."),
  existingSections: z.object({}).passthrough().refine(obj => {
    return Object.keys(obj).every(key => SectionNameSchema.safeParse(key).success);
  }, "All keys must be a valid SectionName").optional().describe("A map of previously generated text sections."),
  existingDiagrams: z.object({}).passthrough().refine(obj => {
    return Object.keys(obj).every(key => DiagramTypeSchema.safeParse(key).success);
  }, "All keys must be a valid DiagramType").optional().describe("A map of previously generated PlantUML diagrams."),
  sectionsToGenerate: z.array(SectionNameSchema).describe("A list of the target sections that need to be generated."),
  externalContext: z.array(ExternalContextSchema).optional().describe("An array of external documents provided by the user, categorized as 'context' (for facts) or 'example' (for style)."),
});
export type EvaluateContextInput = z.infer<typeof EvaluateContextInputSchema>;


export const SectionGenerationConfigSchema = z.object({
  section: SectionNameSchema.describe("The target section to generate."),
  context: z.object({
    sections: z.array(SectionNameSchema).optional().describe("The keys of existing sections that are most relevant as context."),
    diagrams: z.array(DiagramTypeSchema).optional().describe("The keys of existing diagrams that are most relevant as context."),
  }).describe("The recommended context to use for generating this section."),
  guidelines: z.array(z.string()).describe("A list of the most relevant guidelines to follow. Can include existing guidelines or new ones."),
  instructions: z.object({
    tone: z.enum(['professional', 'academic', 'casual', 'persuasive', 'none']).describe("The recommended tone for the section."),
    formality: z.enum(['informal', 'balanced', 'very formal']).describe("The recommended formality level."),
  }).describe("Recommended instructions for tone and formality."),
});

export const EvaluateContextOutputSchema = z.object({
  configs: z.array(SectionGenerationConfigSchema).describe("An array of optimized configurations for each section to be generated."),
});
export type EvaluateContextOutput = z.infer<typeof EvaluateContextOutputSchema>;


// evaluate-report.ts
export const EvaluateReportInputSchema = z.object({
  proposal: ProjectProposalSchema.describe("The original project proposal.").optional().nullable(),
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

// explain-diagram.ts
export const ExplainDiagramInputSchema = z.object({
  imageDataUri: z.string().describe("An image of a diagram, encoded as a data URI that must include a MIME type and use Base64 encoding."),
});
export type ExplainDiagramInput = z.infer<typeof ExplainDiagramInputSchema>;

export const ExplainDiagramOutputSchema = z.object({
  explanation: z.string().describe('A detailed explanation of the diagram, formatted as markdown.'),
});
export type ExplainDiagramOutput = z.infer<typeof ExplainDiagramOutputSchema>;


// API Schemas
export const ApiAnalyzeSchema = z.object({
  documentType: AcademicDocumentTypeSchema,
  markdown: z.string().min(20, 'Markdown content is too short.'),
});

export const ApiSolveSchema = z.object({
  analyzedDocument: AnalyzedDocumentSchema,
  contextMarkdown: z.string().optional(),
});

export const ApiUpdateAgentSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  prompt: z.union([z.string().min(10), AgentPromptSchema]).optional(),
  isEnabled: z.boolean().optional(),
  category: z.string().optional(),
});

export const ApiTranslatePresentationSchema = z.object({
  presentation: PresentationHistoryEntrySchema,
  targetLang: z.string(),
});

export const ApiTranslateProposalSchema = z.object({
  proposal: ProjectProposalSchema,
  targetLang: z.string(),
});

export const ApiTranslateTextSchema = z.object({
  text: z.string(),
  targetLang: z.string(),
});

const ReportSectionConfigSchema = z.object({
  sectionName: z.string(),
  agentId: z.string(),
  prompt: z.object({
    base: z.string(),
    guidelines: z.array(z.object({ text: z.string(), isDefault: z.boolean() })),
  }),
  contexts: z.array(z.any()),
  controlOutput: z.object({
     format: z.string().optional(),
     maxLength: z.number().optional(),
  }).optional(),
  dependencies: z.array(z.string()).optional(),
});

const PostProcessingStepSchema = z.object({
    type: z.string(),
    agentId: z.string().optional(),
    criteria: z.array(z.string()).optional(),
    format: z.string().optional(),
    template: z.string().optional(),
});

const FullReportModeConfigSchema = z.object({
  mode: z.literal("Full Report Mode"),
  reportTitle: z.string().optional(),
  language: z.string().optional(),
  version: z.string().optional(),
  author: z.object({
    name: z.string().optional(),
    id: z.string().optional(),
  }).optional(),
  metadata: z.object({
    creationDate: z.string().optional(),
    lastModifiedDate: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }).optional(),
  styling: z.object({
    template: z.string().optional(),
    colors: z.object({
      primary: z.string().optional(),
      background: z.string().optional(),
      accent: z.string().optional(),
    }).optional(),
    fonts: z.object({
       headline: z.string().optional(),
       body: z.string().optional(),
       code: z.string().optional(),
    }).optional(),
  }).optional(),
  sections: z.array(ReportSectionConfigSchema),
  postProcessing: z.array(PostProcessingStepSchema).optional(),
});


const LinkedAssetSchema = z.object({
    type: z.string(),
    assetId: z.string(),
    description: z.string().optional(),
});

const GeneratedProposalSectionSchema = z.object({
    sectionName: z.string(),
    generatedContent: z.string(),
    generationDetails: z.object({
        agentId: z.string().optional(),
        promptUsed: z.object({
            base: z.string().optional(),
            guidelines: z.array(z.object({ text: z.string(), isDefault: z.boolean() })).optional(),
        }).optional(),
        contextsUsed: z.array(z.any()).optional(),
        outputControl: z.object({
            format: z.string().optional(),
            maxLength: z.number().optional(),
        }).optional(),
    }).optional(),
    order: z.number().optional(),
    wordCount: z.number().optional(),
    linkedAssets: z.array(LinkedAssetSchema).optional(),
});

const PostProcessingStepResultSchema = z.object({
    type: z.string(),
    status: z.string(),
    result: z.any().optional(),
    errorMessage: z.string().nullable().optional(),
    timestamp: z.string().optional(),
});

const ProposalVersionHistorySchema = z.object({
    version: z.string(),
    timestamp: z.string(),
    notes: z.string().optional(),
    changes: z.array(z.string()).optional(),
});

const SavedProposalStateSchema = z.object({
    proposalTitle: z.string().optional(),
    language: z.string().optional(),
    status: z.string().optional(),
    errorMessage: z.string().nullable().optional(),
    generationMetadata: z.object({
        timestamp: z.string().optional(),
        templateUsed: z.string().optional(),
        modelVersion: z.string().optional(),
        totalCostCredits: z.number().optional(),
        durationSeconds: z.number().optional(),
    }).optional(),
    authorId: z.string().optional(),
    targetAudience: z.string().optional(),
    desiredTone: z.string().optional(),
    sections: z.array(GeneratedProposalSectionSchema).optional(),
    postProcessing: z.array(PostProcessingStepResultSchema).optional(),
    versionHistory: z.array(ProposalVersionHistorySchema).optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
});

const academicSolverContextFileSchema = z.object({
  fileName: z.string(),
  content: z.string(),
  type: z.enum(['context', 'example', 'question', 'textbook', 'guidelines']),
});

export const ProjectStateSchema = z.object({
    name: z.string().optional(),
    projectIdea: z.string().optional(),
    proposal: z.lazy(() => ProjectProposalSchema).nullable(),
    reportConfig: FullReportModeConfigSchema.nullable().optional(),
    generatedProposalState: SavedProposalStateSchema.nullable().optional(),
    sections: z.record(SectionNameSchema, z.string()).optional(),
    translatedSections: z.record(SectionNameSchema, z.string()).optional(),
    evaluation: z.object({
        evaluationScore: z.number(),
        feedback: z.array(z.object({
            point: z.string(),
            status: z.enum(["Acceptable", "Weak", "Not Present"]),
            solution: z.string().optional(),
        })),
        summary: z.string(),
    }).nullable().optional(),
    diagrams: z.record(DiagramTypeSchema, z.object({
        plantUmlCode: z.string(),
        imageUrl: z.string(),
        explanation: z.string().optional(),
    })).optional(),
    presentation: z.object({ history: z.array(z.object({ id: z.string(), name: z.string(), slides: z.array(PresentationSlideSchema) })) }).optional(),
    codeGenerator: z.object({ prompt: z.string(), html: z.string(), css: z.string(), javascript: z.string(), codebase: z.object({ files: z.array(z.object({ path: z.string(), content: z.string() })) }).nullable() }).optional(),
    externalContext: z.array(academicSolverContextFileSchema).nullable().optional(),
    teamId: z.string().nullable().optional(), // Add teamId to associate project with a team
    projectPlan: z.lazy(() => ProjectPlanSchema).nullable().optional(),
    academicSolver: z.object({
        stage: z.enum(["idle", "parsing", "analyzing", "readyToSolve", "solving", "solved"]),
        documentType: AcademicDocumentTypeSchema.nullable(),
        analyzedDocument: AnalyzedDocumentSchema.nullable(),
        solvedDocument: SolvedDocumentSchema.nullable(),
        questionDocuments: z.array(academicSolverContextFileSchema),
        externalContext: z.array(academicSolverContextFileSchema),
    }).optional(),
});

export const ApiGeneratePresentationSchema = z.object({
  proposal: z.lazy(() => ProjectProposalSchema).nullable().optional(),
  projectPlan: z.lazy(() => ProjectPlanSchema).nullable().optional(),
  guidelines: z.array(z.string()).optional(),
  sourceDocuments: z.array(z.object({
    fileName: z.string(),
    content: z.string(),
  })).min(1, "At least one source document is required."),
  templateId: z.string(),
  tone: z.string().optional(),
  complexity: z.string().optional(),
});

    
