/**
 * أدوات المصادقة
 *
 * هذا الملف يحتوي على أدوات مساعدة للمصادقة
 * مثل التحقق من الصلاحيات والجلسات
 */

import { User } from 'firebase/auth';
import { handleClientError } from '../error-handling';

/**
 * أدوار المستخدمين
 */
export enum UserRole {
    USER = 'user',
    ADMIN = 'admin',
    MODERATOR = 'moderator',
    GUEST = 'guest',
}

/**
 * صلاحيات المستخدمين
 */
export enum UserPermission {
    READ = 'read',
    WRITE = 'write',
    DELETE = 'delete',
    MANAGE = 'manage',
    ADMIN = 'admin',
}

/**
 * بيانات المستخدم الموسعة
 */
export interface ExtendedUser extends User {
    role?: UserRole;
    permissions?: UserPermission[];
    profile?: {
        firstName?: string;
        lastName?: string;
        bio?: string;
        avatar?: string;
        preferences?: Record<string, any>;
    };
}

/**
 * نتيجة التحقق من الصلاحيات
 */
export interface PermissionCheckResult {
    hasPermission: boolean;
    reason?: string;
    requiredRole?: UserRole;
    requiredPermission?: UserPermission;
}

/**
 * أدوات المصادقة
 */
export class AuthUtils {
    /**
     * التحقق من وجود المستخدم
     */
    static hasUser(user: User | null): boolean {
        return !!user;
    }

    /**
     * التحقق من تسجيل الدخول
     */
    static isLoggedIn(user: User | null): boolean {
        return !!user && !!user.uid;
    }

    /**
     * التحقق من تأكيد البريد الإلكتروني
     */
    static isEmailVerified(user: User | null): boolean {
        return !!user && user.emailVerified;
    }

    /**
     * التحقق من الدور
     */
    static hasRole(user: ExtendedUser | null, role: UserRole): boolean {
        if (!user) return false;
        return user.role === role;
    }

    /**
     * التحقق من الصلاحيات
     */
    static hasPermission(user: ExtendedUser | null, permission: UserPermission): boolean {
        if (!user) return false;
        if (!user.permissions) return false;
        return user.permissions.includes(permission);
    }

    /**
     * التحقق من الصلاحيات المتعددة
     */
    static hasAnyPermission(user: ExtendedUser | null, permissions: UserPermission[]): boolean {
        if (!user) return false;
        if (!user.permissions) return false;
        return permissions.some(permission => user.permissions!.includes(permission));
    }

    /**
     * التحقق من جميع الصلاحيات
     */
    static hasAllPermissions(user: ExtendedUser | null, permissions: UserPermission[]): boolean {
        if (!user) return false;
        if (!user.permissions) return false;
        return permissions.every(permission => user.permissions!.includes(permission));
    }

    /**
     * التحقق من الصلاحيات مع التفاصيل
     */
    static checkPermission(
        user: ExtendedUser | null,
        permission: UserPermission,
        requiredRole?: UserRole
    ): PermissionCheckResult {
        if (!user) {
            return {
                hasPermission: false,
                reason: 'User not logged in',
            };
        }

        if (requiredRole && !this.hasRole(user, requiredRole)) {
            return {
                hasPermission: false,
                reason: 'Insufficient role',
                requiredRole,
            };
        }

        if (!this.hasPermission(user, permission)) {
            return {
                hasPermission: false,
                reason: 'Insufficient permissions',
                requiredPermission: permission,
            };
        }

        return {
            hasPermission: true,
        };
    }

    /**
     * الحصول على الدور المطلوب للصلاحية
     */
    static getRequiredRole(permission: UserPermission): UserRole {
        switch (permission) {
            case UserPermission.READ:
                return UserRole.USER;
            case UserPermission.WRITE:
                return UserRole.USER;
            case UserPermission.DELETE:
                return UserRole.MODERATOR;
            case UserPermission.MANAGE:
                return UserRole.ADMIN;
            case UserPermission.ADMIN:
                return UserRole.ADMIN;
            default:
                return UserRole.USER;
        }
    }

    /**
     * الحصول على الصلاحيات المطلوبة للدور
     */
    static getPermissionsForRole(role: UserRole): UserPermission[] {
        switch (role) {
            case UserRole.GUEST:
                return [];
            case UserRole.USER:
                return [UserPermission.READ, UserPermission.WRITE];
            case UserRole.MODERATOR:
                return [UserPermission.READ, UserPermission.WRITE, UserPermission.DELETE];
            case UserRole.ADMIN:
                return Object.values(UserPermission);
            default:
                return [];
        }
    }

    /**
     * التحقق من صحة الجلسة
     */
    static isSessionValid(user: User | null): boolean {
        if (!user) return false;

        // التحقق من وجود UID
        if (!user.uid) return false;

        // التحقق من صحة البريد الإلكتروني
        if (!user.email) return false;

        // التحقق من تأكيد البريد الإلكتروني
        if (!user.emailVerified) return false;

        return true;
    }

    /**
     * الحصول على بيانات المستخدم الأساسية
     */
    static getUserBasicInfo(user: User | null): {
        uid: string | null;
        email: string | null;
        displayName: string | null;
        photoURL: string | null;
        emailVerified: boolean;
    } | null {
        if (!user) return null;

        return {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified,
        };
    }

    /**
     * الحصول على بيانات المستخدم الموسعة
     */
    static getExtendedUserInfo(user: ExtendedUser | null): {
        uid: string | null;
        email: string | null;
        displayName: string | null;
        photoURL: string | null;
        emailVerified: boolean;
        role: UserRole | null;
        permissions: UserPermission[];
        profile: any;
    } | null {
        if (!user) return null;

        return {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified,
            role: user.role || UserRole.USER,
            permissions: user.permissions || [],
            profile: user.profile || {},
        };
    }

    /**
     * التحقق من صحة البيانات
     */
    static validateUserData(data: any): {
        isValid: boolean;
        errors: string[];
    } {
        const errors: string[] = [];

        if (!data.email) {
            errors.push('Email is required');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            errors.push('Invalid email format');
        }

        if (!data.password) {
            errors.push('Password is required');
        } else if (data.password.length < 6) {
            errors.push('Password must be at least 6 characters');
        }

        if (data.confirmPassword && data.password !== data.confirmPassword) {
            errors.push('Passwords do not match');
        }

        if (!data.firstName) {
            errors.push('First name is required');
        }

        if (!data.lastName) {
            errors.push('Last name is required');
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    }

    /**
     * تشفير البيانات الحساسة
     */
    static encryptSensitiveData(data: string): string {
        // TODO: تنفيذ تشفير البيانات
        // يمكن استخدام crypto-js أو مكتبة تشفير أخرى
        return btoa(data); // Base64 encoding مؤقت
    }

    /**
     * فك تشفير البيانات الحساسة
     */
    static decryptSensitiveData(encryptedData: string): string {
        // TODO: تنفيذ فك تشفير البيانات
        try {
            return atob(encryptedData); // Base64 decoding مؤقت
        } catch (error) {
            const errorResult = handleClientError(error, { context: 'Decrypt Sensitive Data' });
            console.error('Decrypt Sensitive Data Error:', errorResult.message);
            return '';
        }
    }

    /**
     * إنشاء رمز جلسة
     */
    static generateSessionToken(): string {
        const timestamp = Date.now().toString();
        const random = Math.random().toString(36).substring(2);
        return `${timestamp}-${random}`;
    }

    /**
     * التحقق من صحة رمز الجلسة
     */
    static validateSessionToken(token: string): boolean {
        if (!token) return false;

        const parts = token.split('-');
        if (parts.length !== 2) return false;

        const timestamp = parseInt(parts[0]);
        const now = Date.now();

        // التحقق من أن الرمز لم ينته صلاحيته (24 ساعة)
        const maxAge = 24 * 60 * 60 * 1000;
        return (now - timestamp) < maxAge;
    }
}
