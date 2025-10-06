/**
 * خدمات المشاريع
 *
 * هذا الملف يحتوي على جميع الصادرات لخدمات المشاريع
 */

export * from '@/services/projects/project-service';

// ✅ إضافة تصدير الأنواع المطلوبة
export type { ProjectState, SavedProject } from '@/lib/models/project';

