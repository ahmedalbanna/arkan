/**
 * خدمات المصادقة
 *
 * هذا الملف يحتوي على جميع الصادرات لخدمات المصادقة
 */

// تصدير الدوال فقط، وليس كائنات الخدمة
export {
    changePassword, loginWithEmail, logoutUser,
    resetPassword, signupUser, type AuthResponse, type LoginCredentials, type ResetPasswordResponse, type SignupResponse
} from '@/services/auth/auth-service';

