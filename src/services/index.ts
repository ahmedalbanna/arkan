/**
 * خدمات النظام الموحدة - المنظمة حسب الوظيفة
 *
 * هذا الملف يحتوي على جميع الصادرات للخدمات المنظمة حسب الوظيفة
 */

// الخدمات المشتركة
export * from '@/services/shared';

// خدمات المصادقة
export * from '@/services/auth';

// خدمات المستخدمين
export * from '@/services/users';

// خدمات المشاريع
export * from '@/services/projects';

// خدمات الفرق
export * from '@/services/teams';

// خدمات الذكاء الاصطناعي
export * from '@/services/ai';

// خدمات الإدارة
export * from '@/services/admin';

// خدمات الدفع والمعاملات
export * from '@/services/payment';

// خدمات القوالب
export * from '@/services/templates';

// خدمات المحادثة
export * from '@/services/chat';

// خدمات التحليل والإحصائيات
export * from '@/services/analytics';

// خدمات المهام
export * from '@/services/tasks';

// الخدمات القديمة (سيتم إزالتها لاحقاً)
export * from '@/services/project-plan-service';
export * from '@/services/project-service';
export * from '@/services/team-service';
export * from '@/services/user-service';

