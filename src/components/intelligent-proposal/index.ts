/**
 * مكونات أقسام المقترح الذكية - نقطة دخول موحدة
 */

// المكونات الأساسية
export { ProposalSectionGenerator } from './ProposalSectionGenerator';
export { ProposalSectionPreview } from './ProposalSectionPreview';
export { ProposalSectionTypeSelector } from './ProposalSectionTypeSelector';
export { ProposalTemplateSelector } from './ProposalTemplateSelector';

// الأنواع والواجهات
export type {
    CompleteProposalGenerationOptions,
    CompleteProposalResult, ProposalComplexity, ProposalSectionCategory, ProposalSectionFilter, ProposalSectionGenerationOptions,
    ProposalSectionResult, ProposalSectionStats, ProposalSectionType, ProposalStyle
} from '@/services/intelligent-proposal-service';

export type {
    CompleteProposalGeneratorState, ProposalSectionGeneratorState, ProposalSectionLibraryState,
    ProposalStatsState,
    UseProposalSectionGeneratorConfig
} from '@/hooks/use-intelligent-proposal';

