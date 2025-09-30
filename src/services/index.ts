/**
 * خدمات النظام الموحدة - المنظمة حسب الوظيفة
 *
 * هذا الملف يحتوي على جميع الصادرات للخدمات المنظمة حسب الوظيفة
 */

// الخدمات المشتركة
export * from './shared';

// خدمات المصادقة
export * from './auth';

// خدمات المستخدمين
export * from './users';

// خدمات المشاريع
export * from './projects';

// خدمات الفرق
export * from './teams';

// خدمات الذكاء الاصطناعي
export * from './ai';

// خدمات الإدارة
export * from './admin';

// خدمات الدفع والمعاملات
export * from './payment';

// خدمات القوالب
export * from './templates';

// خدمات المحادثة
export * from './chat';

// خدمات التحليل والإحصائيات
export * from './analytics';

// خدمات المهام
export * from './tasks';

// الخدمات القديمة (سيتم إزالتها لاحقاً)
export * from './project-plan-service';
export * from './project-service';
export * from './team-service';
export * from './user-service';
