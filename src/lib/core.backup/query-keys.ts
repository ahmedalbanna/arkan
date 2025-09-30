/**
 * مفاتيح React Query موحدة
 *
 * هذا الملف يحتوي على جميع مفاتيح React Query
 * مع نظام تنظيم موحد
 */

/**
 * مفاتيح المستخدمين
 */
export const userKeys = {
    all: ['users'] as const,
    lists: () => [...userKeys.all, 'list'] as const,
    list: (page: number) => [...userKeys.lists(), { page }] as const,
    details: () => [...userKeys.all, 'detail'] as const,
    profile: (userId: string) => [...userKeys.details(), userId] as const,
    admins: () => [...userKeys.all, 'admins'] as const,
    admin: (adminId: string) => [...userKeys.admins(), adminId] as const,
    settings: (userId: string) => [...userKeys.details(), userId, 'settings'] as const,
    preferences: (userId: string) => [...userKeys.details(), userId, 'preferences'] as const,
};

/**
 * مفاتيح أدوات الكتابة
 */
export const writingKeys = {
    all: ['writing'] as const,
    tools: () => [...writingKeys.all, 'tools'] as const,
    tool: (toolName: string) => [...writingKeys.tools(), toolName] as const,
    generations: () => [...writingKeys.all, 'generations'] as const,
    generation: (id: string) => [...writingKeys.generations(), id] as const,
    userGenerations: (userId: string) => [...writingKeys.generations(), 'user', userId] as const,
    toolGenerations: (toolName: string) => [...writingKeys.generations(), 'tool', toolName] as const,
    recent: (userId: string) => [...writingKeys.generations(), 'recent', userId] as const,
};

/**
 * مفاتيح التصدير
 */
export const exportKeys = {
    all: ['export'] as const,
    templates: () => [...exportKeys.all, 'templates'] as const,
    template: (id: string) => [...exportKeys.templates(), id] as const,
    exports: () => [...exportKeys.all, 'exports'] as const,
    export: (id: string) => [...exportKeys.exports(), id] as const,
    userExports: (userId: string) => [...exportKeys.exports(), 'user', userId] as const,
    recent: (userId: string) => [...exportKeys.exports(), 'recent', userId] as const,
    downloads: (userId: string) => [...exportKeys.exports(), 'downloads', userId] as const,
};

/**
 * مفاتيح المصادقة
 */
export const authKeys = {
    all: ['auth'] as const,
    session: () => [...authKeys.all, 'session'] as const,
    profile: () => [...authKeys.all, 'profile'] as const,
    permissions: () => [...authKeys.all, 'permissions'] as const,
    roles: () => [...authKeys.all, 'roles'] as const,
    role: (roleId: string) => [...authKeys.roles(), roleId] as const,
};

/**
 * مفاتيح الإعدادات
 */
export const settingsKeys = {
    all: ['settings'] as const,
    app: () => [...settingsKeys.all, 'app'] as const,
    user: (userId: string) => [...settingsKeys.all, 'user', userId] as const,
    system: () => [...settingsKeys.all, 'system'] as const,
    features: () => [...settingsKeys.all, 'features'] as const,
    feature: (featureId: string) => [...settingsKeys.features(), featureId] as const,
};

/**
 * مفاتيح الملفات
 */
export const fileKeys = {
    all: ['files'] as const,
    uploads: () => [...fileKeys.all, 'uploads'] as const,
    upload: (id: string) => [...fileKeys.uploads(), id] as const,
    userUploads: (userId: string) => [...fileKeys.uploads(), 'user', userId] as const,
    recent: (userId: string) => [...fileKeys.uploads(), 'recent', userId] as const,
};

/**
 * مفاتيح الإشعارات
 */
export const notificationKeys = {
    all: ['notifications'] as const,
    user: (userId: string) => [...notificationKeys.all, 'user', userId] as const,
    unread: (userId: string) => [...notificationKeys.user(userId), 'unread'] as const,
    read: (userId: string) => [...notificationKeys.user(userId), 'read'] as const,
    allUser: (userId: string) => [...notificationKeys.user(userId), 'all'] as const,
};

/**
 * مفاتيح الإحصائيات
 */
export const statsKeys = {
    all: ['stats'] as const,
    user: (userId: string) => [...statsKeys.all, 'user', userId] as const,
    app: () => [...statsKeys.all, 'app'] as const,
    writing: () => [...statsKeys.all, 'writing'] as const,
    export: () => [...statsKeys.all, 'export'] as const,
    usage: (userId: string) => [...statsKeys.user(userId), 'usage'] as const,
    performance: () => [...statsKeys.all, 'performance'] as const,
};

/**
 * مفاتيح البحث
 */
export const searchKeys = {
    all: ['search'] as const,
    users: (query: string) => [...searchKeys.all, 'users', query] as const,
    content: (query: string) => [...searchKeys.all, 'content', query] as const,
    files: (query: string) => [...searchKeys.all, 'files', query] as const,
    global: (query: string) => [...searchKeys.all, 'global', query] as const,
};

/**
 * مفاتيح التخزين المؤقت
 */
export const cacheKeys = {
    all: ['cache'] as const,
    user: (userId: string) => [...cacheKeys.all, 'user', userId] as const,
    app: () => [...cacheKeys.all, 'app'] as const,
    temp: () => [...cacheKeys.all, 'temp'] as const,
    persistent: () => [...cacheKeys.all, 'persistent'] as const,
};

/**
 * مفاتيح API
 */
export const apiKeys = {
    all: ['api'] as const,
    health: () => [...apiKeys.all, 'health'] as const,
    status: () => [...apiKeys.all, 'status'] as const,
    version: () => [...apiKeys.all, 'version'] as const,
    endpoints: () => [...apiKeys.all, 'endpoints'] as const,
};

/**
 * مفاتيح النظام
 */
export const systemKeys = {
    all: ['system'] as const,
    info: () => [...systemKeys.all, 'info'] as const,
    config: () => [...systemKeys.all, 'config'] as const,
    logs: () => [...systemKeys.all, 'logs'] as const,
    errors: () => [...systemKeys.all, 'errors'] as const,
    performance: () => [...systemKeys.all, 'performance'] as const,
};

/**
 * مفاتيح مخصصة
 */
export const customKeys = {
    all: ['custom'] as const,
    user: (userId: string, key: string) => [...customKeys.all, 'user', userId, key] as const,
    app: (key: string) => [...customKeys.all, 'app', key] as const,
    global: (key: string) => [...customKeys.all, 'global', key] as const,
};

/**
 * إنشاء مفتاح مخصص
 */
export function createCustomKey(parts: (string | number)[]): readonly string[] {
    return parts.map(String);
}

/**
 * إنشاء مفتاح مع معاملات
 */
export function createKeyWithParams(baseKey: readonly string[], params: Record<string, any>): readonly string[] {
    return [...baseKey, JSON.stringify(params)];
}

/**
 * إنشاء مفتاح مع فلاتر
 */
export function createKeyWithFilters(baseKey: readonly string[], filters: Record<string, any>): readonly string[] {
    return [...baseKey, 'filters', JSON.stringify(filters)];
}

/**
 * إنشاء مفتاح مع ترتيب
 */
export function createKeyWithSort(baseKey: readonly string[], sort: { field: string; direction: 'asc' | 'desc' }): readonly string[] {
    return [...baseKey, 'sort', JSON.stringify(sort)];
}

/**
 * إنشاء مفتاح مع صفحة
 */
export function createKeyWithPagination(baseKey: readonly string[], page: number, limit: number): readonly string[] {
    return [...baseKey, 'pagination', JSON.stringify({ page, limit })];
}

/**
 * إنشاء مفتاح مع نطاق زمني
 */
export function createKeyWithTimeRange(baseKey: readonly string[], startDate: string, endDate: string): readonly string[] {
    return [...baseKey, 'timeRange', JSON.stringify({ startDate, endDate })];
}
