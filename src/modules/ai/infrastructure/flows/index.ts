// Academic & Research Flows
export * from './academic/academic-literature-review';
export * from './academic/academic-paper-quality-checker';
export { aiResearcher } from './academic/ai-researcher';
export * from './academic/create-lecture-unit';
export { generateCitation } from './academic/generate-citation';
export { generateQuiz } from './academic/generate-quiz';
export * from './academic/generate-theoretical-lecture';
export { generateLiteratureReview } from './academic/literature-review-generator';
export { solveAssignments } from './academic/solve-assignments';

// Writing & Editing Flows
export { generateText } from './writing/generate-text';
export { grammarCheck } from './writing/grammar-checker';
export { humanizeText } from './writing/humanize-text';
export { manipulateText } from './writing/manipulate-text';
export { paraphraseText } from './writing/paraphrase-text';
export * from './writing/professional-document-writer';
export { textStyleTune } from './writing/text-stylist';
export { translateText } from './writing/translate-text';
export { writeDocument } from './writing/write-document';

// Media & Visual Flows
export { generateImage } from './media/generate-image';
export { generatePlantUML } from './media/generate-plantuml';
export { imageToText } from './media/image-to-text';

// Analysis & Evaluation Flows
export * from './analysis/ai-proofread-document';
export * from './analysis/analyze-context';
export * from './analysis/bias-checker';
export * from './analysis/detect-ai-content';
export { factCheckText } from './analysis/fact-checker';
export { retrieveFact } from './analysis/fact-retrieval';
export { plagiarismCheck } from './analysis/plagiarism-checker';
export { sentenceStructureCheck } from './analysis/sentence-structure-checker';

// Document & Report Flows
export { generateToc } from './document/generate-toc';
export * from './document/improve-report-markdown';
export * from './document/project-documentation-generator';
export * from './document/project-report-generator';
export * from './document/rewrite-document-to-markdown';
export { rewriteToMarkdown } from './document/rewrite-to-markdown';
export { summarizeDocument } from './document/summarize-document';
export { summarizeText } from './document/summarize-text';
export * from './document/technical-spec-writer';

// Generation & Strategy Flows
export * from './generation/generate-agent-config';
export { generateChapterContent } from './generation/generate-chapter-content';
export * from './generation/generate-chapter-content-rag';
export { generateIdeas } from './generation/generate-ideas';
export { generateProjectBlueprint } from './generation/generate-project-blueprint';
export { generateReportSection } from './generation/generate-report-section';
export * from './generation/generate-report-section-rag';
export * from './generation/generate-session-plan';
export { generateUiDescription } from './generation/generate-ui-description';
export * from './generation/graduation-project-generator';
export * from './generation/presentation-content-creator';
export * from './generation/project-consultant';
export * from './generation/question-answering';
export { runAgentFlow } from './generation/run-agent-flow';
export { topicExplainer } from './generation/topic-explainer';
export { answerQuestion } from './generation/question-answering';
