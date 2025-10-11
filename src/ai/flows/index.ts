/**
 * الفهرس الرئيسي لتدفقات الذكاء الاصطناعي
 * نقطة دخول موحدة لجميع التدفقات المصنفة
 */

// تصدير النظام الموحد
export { UnifiedFlows } from './unified';

// تصدير جميع التدفقات المصنفة
export * from './academic';
export * from './analysis';
export * from './content-generation';
export * from './document-processing';
export * from './text-processing';
export * from './visual';

// تصدير التدفقات الخاصة
export { generateProposalSection } from './generate-proposal-section';
export { intelligentReportWorkflow } from './intelligent-report-workflow';

// تصدير النظام الأساسي
export * from './registry';
