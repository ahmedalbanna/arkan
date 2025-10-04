// فهرس شامل لجميع الـ Hooks في المشروع
// منظم حسب الفئات والوظائف

// ===== النظام الأساسي - Core System =====
export * from '../core';

// ===== Enhanced Hooks - النظام المحسن =====
export * from './use-diagram-tools-enhanced';
export * from './use-export-enhanced';
export * from './use-presentation-tools-enhanced';
export * from './use-proposal-tools-enhanced';
export * from './use-report-tools-enhanced';
export * from './use-templates-enhanced';
export * from './use-writing-tools-enhanced';

// ===== UI/UX Hooks =====
export * from '../core/ui/use-ui-factory';

// ===== Zustand Stores =====
export * from './useAgentStore';
export * from './useAutosave';
export * from './useBuilderStore';
export * from './useChatStore';
export * from './useGenerationUIStore';
// Note: These stores are not modules, so they're commented out
// // Note: This store is not a module, so it's commented out
// export * from './usePresentationStore';
// export * from './useProposalGenerationStore';
// // Note: This store is not a module, so it's commented out
// export * from './useReportStore';

// ===== React Query Hooks =====
export * from './use-academic-solver';
export * from './use-academic-solver-store';
export * from './use-admin-dashboard';
export * from './use-agents';
export * from './use-analytics';
export * from './use-chat';
export * from './use-create-agent-dialog';
export * from './use-create-category-dialog';
export * from './use-create-project-dialog';
export * from './use-create-user-dialog';
export * from './use-diagram-viewer';
export * from './use-diagrams';
export * from './use-evaluation';
export * from './use-evaluation-result-viewer';
export * from './use-evaluation-tools';
export * from './use-features';
export * from './use-history';
export * from './use-notifications';
export * from './use-payment';
// Note: This is already exported from core, so it's commented out to avoid duplication
// export * from './use-presentation-template-manager';
export * from './use-project-plan';
export * from './use-projects';
export * from './use-teams';
export * from './use-transactions';
export * from './use-translation';
export * from './use-upload-project-logic';
export * from './use-user';
export * from './usePresentationTemplateManager';

// ===== Writing Tools Logic Hooks =====
export * from './use-ai-detector-logic';
export * from './use-citation-generator-logic';
export * from './use-document-writer-logic';
export * from './use-fact-checker-logic';
export * from './use-grammar-checker-logic';
export * from './use-humanizer-logic';
export * from './use-idea-generator-logic';
// Note: This is already exported from core, so it's commented out to avoid duplication
// export * from './use-paraphraser-logic';
export * from './use-plagiarism-checker-logic';
export * from './use-plant-uml-generator-logic';
export * from './use-presentation-outline-logic';
export * from './use-quiz-generator-logic';
export * from './use-session-plan-generator-logic';
export * from './use-summarizer-logic';
export * from './use-text-stylist-logic';
export * from './use-topic-explainer-logic';

// ===== Content Generators Logic Hooks =====
export * from './use-academic-solver-logic';
export * from './use-ai-researcher-logic';
export * from './use-presentation-generator-logic';
export * from './use-project-plan-generator';
export * from './use-proposal-generation-tools-logic';
export * from './use-proposal-mode-generator-logic';

// ===== Report Tools Logic Hooks =====
export * from './use-report-generation';
export * from './use-report-generation-logic';
// Note: This is already exported from core, so it's commented out to avoid duplication
// export * from './use-report-mode-generator';
export * from './use-report-results';

// ===== Diagram Tools Logic Hooks =====
export * from './use-diagram-generation-tools';
export * from './use-diagram-generator';
export * from './use-docx-styles';

// ===== Specialized Tools Logic Hooks =====
export * from './use-guideline-editor';
export * from './use-presentation-generation';
export * from './use-project-card-logic';
export * from './use-proposal-actions-logic';
export * from './use-task-card-logic';
export * from './use-team-card-logic';
export * from './use-translation-view-logic';

// ===== Utility Hooks =====
export * from './use-agent-editor';
export * from './use-context-selector';
export * from './use-debounce';
// Note: This is replaced by use-export-enhanced, so it's commented out to avoid duplication
// export * from './use-export';
export * from './use-mobile';
export * from './use-new-chat-dialog';
export * from './use-section-accordion-item-logic';
export * from './use-section-logic';
export * from './use-sections';
export * from './use-session-actions';
export * from './use-sound';
export * from './use-text-to-speech';
export * from './use-toast';
export * from './use-user-management-console';
export * from './use-writing-tools';
export * from './useChatInterface';
export * from './useDocxTemplateManager';
export * from './useExport';

// ===== Store Hooks =====
export * from './use-academic-solver';
export * from './use-academic-solver-store';
export * from './use-admin-dashboard';
export * from './use-analytics';
export * from './use-chat';
export * from './use-create-agent-dialog';
export * from './use-create-category-dialog';
export * from './use-create-project-dialog';
export * from './use-create-user-dialog';
export * from './use-diagram-viewer';
export * from './use-diagrams';
export * from './use-evaluation';
export * from './use-evaluation-result-viewer';
export * from './use-evaluation-tools';
export * from './use-features';
export * from './use-guideline-editor';
export * from './use-notifications';
export * from './use-payment';
export * from './use-presentation-generation';
// Note: This is already exported from core, so it's commented out to avoid duplication
// export * from './use-presentation-template-manager';
export * from './use-project-plan';
export * from './use-proposal-actions-logic';
export * from './use-proposal-generation';
export * from './use-sections';
export * from './use-team-card-logic';
export * from './use-translation';
export * from './use-translation-view-logic';
export * from './use-upload-project-logic';
export * from './useAutosave';
export * from './useBuilderStore';
export * from './useChatInterface';
// Note: This store is not a module, so it's commented out
// export * from './usePresentationStore';
export * from './use-report-mode-generator';
export * from './usePresentationTemplateManager';
// Note: This store is not a module, so it's commented out
// export * from './useReportStore';

