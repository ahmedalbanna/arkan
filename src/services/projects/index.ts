/**
 * خدمات المشاريع
 *
 * هذا الملف يحتوي على جميع الصادرات لخدمات المشاريع
 */

export { addContextToProjectApi, createProject, deleteProject, fetchProject, fetchProjects, updateProject, type AddContextData, type CreateProjectData, type UpdateProjectData } from '@/services/projects/project-service';

// ✅ إضافة تصدير الأنواع المطلوبة
export type { ProjectState, SavedProject } from '@/lib/models/project';

