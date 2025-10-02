/**
 * مكونات المخططات الذكية - نقطة دخول موحدة
 */

// المكونات الأساسية
export { DiagramGenerator } from './DiagramGenerator';
export { DiagramLibrary } from './DiagramLibrary';
export { DiagramPreview } from './DiagramPreview';
export { DiagramTypeSelector } from './DiagramTypeSelector';

// الأنواع والواجهات
export type {
    DiagramCategory, DiagramComplexity, DiagramGenerationOptions, DiagramResult, DiagramStyle, DiagramType
} from '@/services/intelligent-diagram-service';

export type {
    DiagramFilter, DiagramGeneratorState,
    DiagramLibraryState,
    DiagramStatsState, SavedDiagram, UseDiagramGeneratorConfig
} from '@/hooks/use-intelligent-diagrams';

