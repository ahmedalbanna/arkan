/**
 * نظام المصادقة الموحد
 *
 * هذا الملف يحتوي على جميع مكونات نظام المصادقة الموحد
 * بما في ذلك الخدمة والـ hooks والأدوات
 */

// Auth Service
export * from './auth-service';

// Auth Hooks
export * from './auth-hooks';

// Auth Utils
export * from './auth-utils';

// Types
export type {
    AuthResult, ChangePasswordData, ConfirmResetPasswordData, LoginCredentials,
    RegisterCredentials, ResetPasswordData, UpdateProfileData
} from './auth-service';

export type { AuthState } from './auth-hooks';

export type { ExtendedUser, PermissionCheckResult } from './auth-utils';

export { UserPermission, UserRole } from './auth-utils';

