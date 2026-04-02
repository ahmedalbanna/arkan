/**
 * Model Mapping for AI Flows
 * 
 * This file defines which Ollama model should be used for each AI flow
 * based on the task requirements and model capabilities.
 * 
 * Categories:
 * - CONVERSION: Text transformation, translation, summarization (Gemma 2B)
 * - TEXT_GENERATION: Creative writing, paraphrasing (Gemma 2B)
 * - REPORTS: Documentation, TOC generation (Phi-3 Mini)
 * - ANALYSIS: Grammar, bias, fact checking (Phi-3 Mini)
 * - STRUCTURED: JSON output, PlantUML, citations (Phi-3 Mini)
 * - ACADEMIC: Research, literature reviews (Llama 3 8B with RAG)
 */

import { MODEL_BY_TASK } from '../../domain/constants/AiModels';

export const FLOW_MODEL_MAPPING = {
  // 🔄 Conversion & Processing - Gemma 2B (Fast, efficient)
  'rewrite-to-markdown': MODEL_BY_TASK.CONVERSION,
  'rewrite-document-to-markdown': MODEL_BY_TASK.CONVERSION,
  'translate-text': MODEL_BY_TASK.CONVERSION,
  'summarize-document': MODEL_BY_TASK.CONVERSION,
  'summarize-text': MODEL_BY_TASK.CONVERSION,
  'image-to-text': MODEL_BY_TASK.CONVERSION,
  
  // ✍️ Text Generation & Writing - Gemma 2B (Creative, fast)
  'generate-text': MODEL_BY_TASK.TEXT_GENERATION,
  'paraphrase-text': MODEL_BY_TASK.TEXT_GENERATION,
  'humanize-text': MODEL_BY_TASK.TEXT_GENERATION,
  'manipulate-text': MODEL_BY_TASK.TEXT_GENERATION,
  'text-stylist': MODEL_BY_TASK.TEXT_GENERATION,
  'write-document': MODEL_BY_TASK.TEXT_GENERATION,
  'ai-proofread-document': MODEL_BY_TASK.TEXT_GENERATION,
  'generate-ideas': MODEL_BY_TASK.TEXT_GENERATION,
  'topic-explainer': MODEL_BY_TASK.TEXT_GENERATION,
  
  // 📊 Reports & Documentation - Phi-3 Mini (Structured output)
  'improve-report-markdown': MODEL_BY_TASK.REPORTS,
  'generate-toc': MODEL_BY_TASK.REPORTS,
  'generate-chapter-content': MODEL_BY_TASK.REPORTS,
  'generate-chapter-content-rag': MODEL_BY_TASK.REPORTS,
  'generate-report-section': MODEL_BY_TASK.REPORTS,
  'generate-section': MODEL_BY_TASK.REPORTS,
  'generate-report-section-rag': MODEL_BY_TASK.REPORTS,
  'project-documentation-generator': MODEL_BY_TASK.REPORTS,
  'professional-document-writer': MODEL_BY_TASK.REPORTS,
  'technical-spec-writer': MODEL_BY_TASK.REPORTS,
  'generate-session-plan': MODEL_BY_TASK.REPORTS,
  'create-lecture-unit': MODEL_BY_TASK.REPORTS,
  'generate-theoretical-lecture': MODEL_BY_TASK.REPORTS,
  'presentation-content-creator': MODEL_BY_TASK.REPORTS,
  
  // ✅ Checking & Analysis - Phi-3 Mini (Strong reasoning)
  'grammar-checker': MODEL_BY_TASK.ANALYSIS,
  'sentence-structure-checker': MODEL_BY_TASK.ANALYSIS,
  'bias-checker': MODEL_BY_TASK.ANALYSIS,
  'fact-checker': MODEL_BY_TASK.ANALYSIS,
  'detect-ai-content': MODEL_BY_TASK.ANALYSIS,
  'plagiarism-checker': MODEL_BY_TASK.ANALYSIS,
  'academic-paper-quality-checker': MODEL_BY_TASK.ANALYSIS,
  'analyze-context': MODEL_BY_TASK.ANALYSIS,
  
  // 🎯 Specific Structured Tasks - Phi-3 Mini (Precise formatting)
  'generate-citation': MODEL_BY_TASK.STRUCTURED,
  'generate-plantuml': MODEL_BY_TASK.STRUCTURED,
  'generate-ui-description': MODEL_BY_TASK.STRUCTURED,
  'generate-quiz': MODEL_BY_TASK.STRUCTURED,
  'generate-project-blueprint': MODEL_BY_TASK.STRUCTURED,
  'generate-agent-config': MODEL_BY_TASK.STRUCTURED,
  'question-answering': MODEL_BY_TASK.STRUCTURED,
  
  // 🎓 Academic & Research - Llama 3 8B (High quality, use with RAG)
  'academic-literature-review': MODEL_BY_TASK.ACADEMIC,
  'ai-researcher': MODEL_BY_TASK.ACADEMIC,
  'literature-review-generator': MODEL_BY_TASK.ACADEMIC,
  'graduation-project-generator': MODEL_BY_TASK.ACADEMIC,
  'project-report-generator': MODEL_BY_TASK.ACADEMIC,
  'fact-retrieval': MODEL_BY_TASK.ACADEMIC,
  'solve-assignments': MODEL_BY_TASK.ACADEMIC,
  'run-agent-flow': MODEL_BY_TASK.ACADEMIC, // May need dynamic model selection
} as const;

/**
 * Get the recommended model for a specific flow
 */
export function getModelForFlow(flowName: string): string {
  return FLOW_MODEL_MAPPING[flowName as keyof typeof FLOW_MODEL_MAPPING] || MODEL_BY_TASK.TEXT_GENERATION;
}

/**
 * Flow categories for batch updates
 */
export const FLOWS_BY_CATEGORY = {
  conversion: [
    'rewrite-to-markdown',
    'rewrite-document-to-markdown',
    'translate-text',
    'summarize-document',
    'summarize-text',
    'image-to-text',
  ],
  textGeneration: [
    'generate-text',
    'paraphrase-text',
    'humanize-text',
    'manipulate-text',
    'text-stylist',
    'write-document',
    'ai-proofread-document',
    'generate-ideas',
    'topic-explainer',
  ],
  reports: [
    'improve-report-markdown',
    'generate-toc',
    'generate-chapter-content',
    'generate-chapter-content-rag',
    'generate-report-section',
    'generate-section',
    'generate-report-section-rag',
    'project-documentation-generator',
    'professional-document-writer',
    'technical-spec-writer',
    'generate-session-plan',
    'create-lecture-unit',
    'generate-theoretical-lecture',
    'presentation-content-creator',
  ],
  analysis: [
    'grammar-checker',
    'sentence-structure-checker',
    'bias-checker',
    'fact-checker',
    'detect-ai-content',
    'plagiarism-checker',
    'academic-paper-quality-checker',
    'analyze-context',
  ],
  structured: [
    'generate-citation',
    'generate-plantuml',
    'generate-ui-description',
    'generate-quiz',
    'generate-project-blueprint',
    'generate-agent-config',
    'question-answering',
  ],
  academic: [
    'academic-literature-review',
    'ai-researcher',
    'literature-review-generator',
    'graduation-project-generator',
    'project-report-generator',
    'fact-retrieval',
    'solve-assignments',
    'run-agent-flow',
  ],
} as const;
