/**
 * محول النظام القديم
 *
 * هذا الملف يحتوي على محولات للربط بين النظام الجديد والقديم
 * لضمان التوافق العكسي
 */

import { NextRequest, NextResponse } from 'next/server';
import { createApiHandler } from '../api/handlers/base-handler';
import { handleServerError } from '../error-handling';

/**
 * محول API Utils القديم
 */
export class LegacyApiUtilsAdapter {
    /**
     * محول withAuth القديم
     */
    static withAuth(
        handler: (request: NextRequest, context: { params: { [key: string]: string } }) => Promise<NextResponse | Response>,
        options: any = {}
    ) {
        return createApiHandler(handler, {
            requireAuth: true,
            authOptions: {
                requireAdmin: options.requireAdmin || false,
                requireSelf: options.requireSelf || false,
                allowedRoles: options.allowedRoles || [],
            },
            logging: {
                logRequests: true,
                logResponses: true,
                logErrors: true,
                logPerformance: true,
            },
        });
    }

    /**
     * محول handleApiError القديم
     */
    static handleApiError(error: any, defaultStatus = 500) {
        return handleServerError(error, 'Legacy API Error', defaultStatus);
    }

    /**
     * محول createApiResponse القديم
     */
    static createApiResponse(data: any, status: number) {
        return NextResponse.json(data, { status });
    }
}

/**
 * محول Error Utils القديم
 */
export class LegacyErrorUtilsAdapter {
    /**
     * محول handleErrorUtility القديم
     */
    static handleErrorUtility(error: any, context?: string) {
        // TODO: تنفيذ محول handleErrorUtility
        // يمكن استخدام handleClientError من النظام الجديد
        console.error('Legacy Error Utility:', { error, context });
    }
}

/**
 * محول Cache القديم
 */
export class LegacyCacheAdapter {
    /**
     * محول getFromCache القديم
     */
    static getFromCache<T>(key: string): T | null {
        // TODO: تنفيذ محول getFromCache
        // يمكن استخدام نظام cache الجديد
        try {
            const item = localStorage.getItem(`arkan-api-cache-${key}`);
            if (!item) return null;

            const parsed = JSON.parse(item);
            const now = Date.now();

            if (parsed.expiresAt && now > parsed.expiresAt) {
                localStorage.removeItem(`arkan-api-cache-${key}`);
                return null;
            }

            return parsed.data;
        } catch (error) {
            console.error('Legacy Cache Get Error:', error);
            return null;
        }
    }

    /**
     * محول saveToCache القديم
     */
    static saveToCache<T>(key: string, data: T) {
        // TODO: تنفيذ محول saveToCache
        // يمكن استخدام نظام cache الجديد
        try {
            const item = {
                data,
                expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
            };
            localStorage.setItem(`arkan-api-cache-${key}`, JSON.stringify(item));
        } catch (error) {
            console.error('Legacy Cache Save Error:', error);
        }
    }

    /**
     * محول generateCacheKey القديم
     */
    static async generateCacheKey(data: object): Promise<string> {
        // TODO: تنفيذ محول generateCacheKey
        // يمكن استخدام نظام crypto الجديد
        try {
            const jsonString = JSON.stringify(data);
            const encoder = new TextEncoder();
            const dataBuffer = encoder.encode(jsonString);
            const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        } catch (error) {
            console.error('Legacy Cache Key Generation Error:', error);
            return Math.random().toString(36).substring(2);
        }
    }
}

/**
 * محول Query Keys القديم
 */
export class LegacyQueryKeysAdapter {
    /**
     * محول userKeys القديم
     */
    static userKeys = {
        all: ['users'] as const,
        lists: () => [...LegacyQueryKeysAdapter.userKeys.all, 'list'] as const,
        list: (page: number) => [...LegacyQueryKeysAdapter.userKeys.lists(), { page }] as const,
        details: () => [...LegacyQueryKeysAdapter.userKeys.all, 'detail'] as const,
        profile: (userId: string) => [...LegacyQueryKeysAdapter.userKeys.details(), userId] as const,
        admins: () => [...LegacyQueryKeysAdapter.userKeys.all, 'admins'] as const,
    };

    /**
     * محول writingKeys القديم
     */
    static writingKeys = {
        all: ['writing'] as const,
        tools: () => [...LegacyQueryKeysAdapter.writingKeys.all, 'tools'] as const,
        tool: (toolName: string) => [...LegacyQueryKeysAdapter.writingKeys.tools(), toolName] as const,
        generations: () => [...LegacyQueryKeysAdapter.writingKeys.all, 'generations'] as const,
        generation: (id: string) => [...LegacyQueryKeysAdapter.writingKeys.generations(), id] as const,
    };

    /**
     * محول exportKeys القديم
     */
    static exportKeys = {
        all: ['export'] as const,
        templates: () => [...LegacyQueryKeysAdapter.exportKeys.all, 'templates'] as const,
        template: (id: string) => [...LegacyQueryKeysAdapter.exportKeys.templates(), id] as const,
        exports: () => [...LegacyQueryKeysAdapter.exportKeys.all, 'exports'] as const,
        export: (id: string) => [...LegacyQueryKeysAdapter.exportKeys.exports(), id] as const,
    };
}

/**
 * محول Services القديم
 */
export class LegacyServicesAdapter {
    /**
     * محول writingToolApi القديم
     */
    static async writingToolApi<TRequest, TResponse>(
        endpoint: string,
        variables: { data: TRequest; token: string }
    ): Promise<TResponse> {
        // TODO: تنفيذ محول writingToolApi
        // يمكن استخدام API client الجديد
        try {
            const response = await fetch(`/api/writing-tools/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${variables.token}`,
                },
                body: JSON.stringify(variables.data),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Legacy Writing Tool API Error:', error);
            throw error;
        }
    }
}

/**
 * محول Context القديم
 */
export class LegacyContextAdapter {
    /**
     * محول AuthContext القديم
     */
    static createAuthContext() {
        // TODO: تنفيذ محول AuthContext
        // يمكن استخدام useAuth hook الجديد
        return {
            user: null,
            loading: false,
            error: null,
            isLoggedIn: false,
            login: async () => ({ success: false, error: 'Not implemented' }),
            logout: async () => ({ success: false, error: 'Not implemented' }),
            register: async () => ({ success: false, error: 'Not implemented' }),
        };
    }

    /**
     * محول LocalizationContext القديم
     */
    static createLocalizationContext() {
        // TODO: تنفيذ محول LocalizationContext
        // يمكن استخدام نظام localization الجديد
        return {
            locale: 'en',
            setLocale: () => { },
            t: (key: string) => key,
        };
    }
}

/**
 * محول Utils القديم
 */
export class LegacyUtilsAdapter {
    /**
     * محول cn القديم
     */
    static cn(...inputs: any[]) {
        // TODO: تنفيذ محول cn
        // يمكن استخدام string-utils الجديد
        return inputs.filter(Boolean).join(' ');
    }

    /**
     * محول generateRandomPassword القديم
     */
    static generateRandomPassword(length: number): string {
        // TODO: تنفيذ محول generateRandomPassword
        // يمكن استخدام crypto-utils الجديد
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';
        for (let i = 0; i < length; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    }

    /**
     * محول arrayBufferToBase64 القديم
     */
    static arrayBufferToBase64(buffer: ArrayBuffer): string {
        // TODO: تنفيذ محول arrayBufferToBase64
        // يمكن استخدام file-utils الجديد
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    /**
     * محول processPlantUml القديم
     */
    static processPlantUml(markdown: string): string {
        // TODO: تنفيذ محول processPlantUml
        // يمكن استخدام utils الجديد
        return markdown.replace(/```plantuml\n([\s\S]*?)\n```/g, (match, code) => {
            const encoded = btoa(code);
            return `![PlantUML Diagram](http://www.plantuml.com/plantuml/png/${encoded})`;
        });
    }

    /**
     * محول getProxiedImageBuffer القديم
     */
    static async getProxiedImageBuffer(imageUrl: string): Promise<any> {
        // TODO: تنفيذ محول getProxiedImageBuffer
        // يمكن استخدام file-utils الجديد
        try {
            const response = await fetch(`/api/proxy-image?url=${encodeURIComponent(imageUrl)}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Legacy Proxied Image Buffer Error:', error);
            return null;
        }
    }
}
