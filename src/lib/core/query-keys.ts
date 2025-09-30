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
 * مفاتيح التحليلات
 */
export const analyticsKeys = {
    all: ['analytics'] as const,
    userStats: (userId: string) => [...analyticsKeys.all, 'userStats', userId] as const,
    dashboard: (userId: string) => [...analyticsKeys.all, 'dashboard', userId] as const,
    usage: (userId: string) => [...analyticsKeys.all, 'usage', userId] as const,
    performance: (userId: string) => [...analyticsKeys.all, 'performance', userId] as const,
    reports: (userId: string) => [...analyticsKeys.all, 'reports', userId] as const,
    report: (userId: string, reportId: string) => [...analyticsKeys.reports(userId), reportId] as const,
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
 * مفاتيح الوكلاء
 */
export const agentKeys = {
    all: ['agents'] as const,
    lists: () => [...agentKeys.all, 'list'] as const,
    list: (page?: number) => [...agentKeys.lists(), { page }] as const,
    details: () => [...agentKeys.all, 'detail'] as const,
    detail: (agentId: string) => [...agentKeys.details(), agentId] as const,
    categories: () => [...agentKeys.all, 'categories'] as const,
    category: (categoryId: string) => [...agentKeys.categories(), categoryId] as const,
    enabled: () => [...agentKeys.all, 'enabled'] as const,
    disabled: () => [...agentKeys.all, 'disabled'] as const,
    byCategory: (categoryId: string) => [...agentKeys.all, 'category', categoryId] as const,
};

/**
 * مفاتيح الفئات
 */
export const categoryKeys = {
    all: ['categories'] as const,
    lists: () => [...categoryKeys.all, 'list'] as const,
    list: (page?: number) => [...categoryKeys.lists(), { page }] as const,
    details: () => [...categoryKeys.all, 'detail'] as const,
    detail: (categoryId: string) => [...categoryKeys.details(), categoryId] as const,
};

/**
 * مفاتيح الميزات
 */
export const featureKeys = {
    all: ['features'] as const,
    lists: () => [...featureKeys.all, 'list'] as const,
    list: (page?: number) => [...featureKeys.lists(), { page }] as const,
    details: () => [...featureKeys.all, 'detail'] as const,
    detail: (featureId: string) => [...featureKeys.details(), featureId] as const,
    enabled: () => [...featureKeys.all, 'enabled'] as const,
    disabled: () => [...featureKeys.all, 'disabled'] as const,
};

/**
 * مفاتيح المشاريع
 */
export const projectKeys = {
    all: ['projects'] as const,
    lists: () => [...projectKeys.all, 'list'] as const,
    list: (page?: number) => [...projectKeys.lists(), { page }] as const,
    details: () => [...projectKeys.all, 'detail'] as const,
    detail: (projectId: string) => [...projectKeys.details(), projectId] as const,
    user: (userId: string) => [...projectKeys.all, 'user', userId] as const,
    team: (teamId: string) => [...projectKeys.all, 'team', teamId] as const,
    recent: (userId: string) => [...projectKeys.user(userId), 'recent'] as const,
};

/**
 * مفاتيح الفرق
 */
export const teamKeys = {
    all: ['teams'] as const,
    lists: () => [...teamKeys.all, 'list'] as const,
    list: (page?: number) => [...teamKeys.lists(), { page }] as const,
    details: () => [...teamKeys.all, 'detail'] as const,
    detail: (teamId: string) => [...teamKeys.details(), teamId] as const,
    user: (userId: string) => [...teamKeys.all, 'user', userId] as const,
    members: (teamId: string) => [...teamKeys.detail(teamId), 'members'] as const,
    invitations: (teamId: string) => [...teamKeys.detail(teamId), 'invitations'] as const,
};

/**
 * مفاتيح القوالب
 */
export const templateKeys = {
    all: ['templates'] as const,
    lists: () => [...templateKeys.all, 'list'] as const,
    list: (type?: string) => [...templateKeys.lists(), { type }] as const,
    details: () => [...templateKeys.all, 'detail'] as const,
    detail: (templateId: string) => [...templateKeys.details(), templateId] as const,
    docx: () => [...templateKeys.all, 'docx'] as const,
    pptx: () => [...templateKeys.all, 'pptx'] as const,
    proposal: () => [...templateKeys.all, 'proposal'] as const,
    report: () => [...templateKeys.all, 'report'] as const,
    presentation: () => [...templateKeys.all, 'presentation'] as const,
};

/**
 * مفاتيح الأقسام
 */
export const sectionKeys = {
    all: ['sections'] as const,
    lists: () => [...sectionKeys.all, 'list'] as const,
    list: (page?: number) => [...sectionKeys.lists(), { page }] as const,
    details: () => [...sectionKeys.all, 'detail'] as const,
    detail: (sectionId: string) => [...sectionKeys.details(), sectionId] as const,
    enabled: () => [...sectionKeys.all, 'enabled'] as const,
    disabled: () => [...sectionKeys.all, 'disabled'] as const,
};

/**
 * مفاتيح المعاملات
 */
export const transactionKeys = {
    all: ['transactions'] as const,
    lists: () => [...transactionKeys.all, 'list'] as const,
    list: (status?: string, page?: number) => [...transactionKeys.lists(), { status, page }] as const,
    details: () => [...transactionKeys.all, 'detail'] as const,
    detail: (transactionId: string) => [...transactionKeys.details(), transactionId] as const,
    user: (userId: string) => [...transactionKeys.all, 'user', userId] as const,
    pending: () => [...transactionKeys.all, 'pending'] as const,
    verified: () => [...transactionKeys.all, 'verified'] as const,
    rejected: () => [...transactionKeys.all, 'rejected'] as const,
    report: (startDate: string, endDate: string) => [...transactionKeys.all, 'report', { startDate, endDate }] as const,
};

/**
 * مفاتيح الإدارة
 */
export const adminKeys = {
    all: ['admin'] as const,
    dashboard: () => [...adminKeys.all, 'dashboard'] as const,
    dashboardStats: () => [...adminKeys.dashboard(), 'stats'] as const,
    users: () => [...adminKeys.all, 'users'] as const,
    agents: () => [...adminKeys.all, 'agents'] as const,
    features: () => [...adminKeys.all, 'features'] as const,
    sections: () => [...adminKeys.all, 'sections'] as const,
    transactions: () => [...adminKeys.all, 'transactions'] as const,
    templates: () => [...adminKeys.all, 'templates'] as const,
    generations: () => [...adminKeys.all, 'generations'] as const,
    settings: () => [...adminKeys.all, 'settings'] as const,
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
