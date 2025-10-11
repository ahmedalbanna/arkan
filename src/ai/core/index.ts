/**
 * النظام الأساسي المحسن للذكاء الاصطناعي
 * يوفر واجهة موحدة للوصول لجميع مكونات النظام الذكي
 */

import {
    AdaptiveModelSelector,
    type ModelConfig,
    type ModelSelectionCriteria
} from './adaptive-model-selector';
import { AIErrorHandler, type AIErrorContext, type AIErrorRecoveryStrategy } from './ai-error-handler';
import { ContextAnalyzer, type ContextAnalysisResult } from './context-analyzer';
import { ContextOrganizer, type ContextItem, type ContextPriority, type ContextType, type KnowledgeLevel, type OrganizedContext } from './context-organizer';
import { FlowIntegrationManager, type SpecializedFlowConfig, type SpecializedFlowResult } from './flow-integration-manager';
import {
    IntelligentPromptBuilder, type PromptBuildingConfig, type PromptTemplate
} from './intelligent-prompt-builder';
import {
    IterativeImprovementEngine, type ImprovementConfig, type ImprovementIteration,
    type ImprovementSession
} from './iterative-improvement-engine';
import {
    OutputQualityValidator, type QualityIssue, type QualityMetrics, type ValidationResult
} from './output-quality-validator';
import {
    PerformanceMonitor, type PerformanceMetrics,
    type PerformanceReport,
    type PerformanceSession
} from './performance-monitor';
import { type QuickHelperResult } from './quick-helpers';
import { SpecializedQuickHelpers } from './specialized-quick-helpers';
import { UnifiedFlowInterface, type FlowType, type UnifiedFlowConfig, type UnifiedFlowResult } from './unified-flow-interface';

// إعادة تصدير جميع المكونات الأساسية
export {
    AdaptiveModelSelector, AIErrorHandler, ContextAnalyzer, ContextOrganizer, FlowIntegrationManager, IntelligentPromptBuilder, IterativeImprovementEngine, OutputQualityValidator, PerformanceMonitor, SpecializedQuickHelpers, UnifiedFlowInterface, type AIErrorContext, type AIErrorRecoveryStrategy, type ContextAnalysisResult, type ContextItem, type ContextPriority, type ContextType, type FlowType, type ImprovementConfig, type ImprovementIteration, type ImprovementSession, type KnowledgeLevel, type ModelConfig, type ModelSelectionCriteria, type OrganizedContext, type PerformanceMetrics, type PerformanceReport,
    type PerformanceSession, type PromptBuildingConfig, type PromptTemplate, type QualityIssue,
    type QualityMetrics, type QuickHelperResult, type SpecializedFlowConfig, type SpecializedFlowResult, type UnifiedFlowConfig,
    type UnifiedFlowResult, type ValidationResult
};

// تصدير النظام الجديد للتدفقات المصنفة
export * from '../flows';
export { FlowRegistry, UnifiedFlows } from '../flows';
export type { FlowCategory } from '../flows';
export { IntelligentAISystem } from './intelligent-ai-system';
export { QuickAIHelpers } from './quick-helpers';

