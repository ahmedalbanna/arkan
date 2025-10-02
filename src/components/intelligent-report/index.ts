/**
 * تصدير جميع مكونات النظام الذكي لتوليد التقارير
 */

export { IntelligentReportGenerator } from './IntelligentReportGenerator';
export { PerformanceDashboard } from './PerformanceDashboard';
export { ProgressTracker } from './ProgressTracker';
export { QualityIndicator } from './QualityIndicator';
export { ReportConfigPanel } from './ReportConfigPanel';
export { SectionSelector } from './SectionSelector';

// إعادة تصدير الأنواع المهمة
export type {
    ReportProgress, UseCompleteReportConfig, UseIntelligentSectionConfig
} from '@/hooks/use-intelligent-report';

export type {
    CompleteReportResult, IntelligentReportConfig, PerformanceStats, SingleSectionResult
} from '@/services/intelligent-report-service';

