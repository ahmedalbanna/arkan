/**
 * نقاط نهاية API الموحدة
 *
 * هذا الملف يحتوي على جميع نقاط نهاية API في التطبيق
 * لضمان الاتساق وتجنب الأخطاء في كتابة URLs
 */

export const API_ENDPOINTS = {
    // أدوات الكتابة
    WRITING_TOOLS: {
        PARAPHRASE: '/api/writing-tools/paraphrase',
        SUMMARIZE: '/api/writing-tools/summarize',
        GRAMMAR_CHECK: '/api/writing-tools/grammar-check',
        HUMANIZE: '/api/writing-tools/humanize',
        DETECT_AI: '/api/writing-tools/detect-ai',
        FACT_CHECK: '/api/writing-tools/fact-check',
        PLAGIARISM_CHECK: '/api/writing-tools/plagiarism-check',
        AI_RESEARCHER: '/api/writing-tools/ai-researcher',
        TOPIC_EXPLAINER: '/api/writing-tools/topic-explainer',
        REWRITE_TEXT: '/api/writing-tools/rewrite-text',
        SUMMARIZE_WITH_RATIO: '/api/writing-tools/summarize-with-ratio',
        WRITE_DOCUMENT: '/api/writing-tools/write-document',
        IDEA_GENERATION: '/api/writing-tools/idea-generation',
        GENERATE_QUIZ: '/api/writing-tools/generate-quiz',
        GENERATE_CITATION: '/api/writing-tools/generate-citation',
        MANIPULATE_TEXT: '/api/writing-tools/manipulate-text',
    },

    // العروض التقديمية
    PRESENTATION: {
        GENERATE_OUTLINE: '/api/presentation/generate-outline',
        GENERATE_SLIDES: '/api/presentation/generate-slides',
        GENERATE_PLANT_UML: '/api/presentation/generate-plant-uml',
    },

    // المشاريع
    PROJECTS: {
        CREATE: '/api/projects',
        LIST: '/api/projects',
        GET: (id: string) => `/api/projects/${id}`,
        UPDATE: (id: string) => `/api/projects/${id}`,
        DELETE: (id: string) => `/api/projects/${id}`,
        GENERATE_PROPOSAL: '/api/projects/generate-proposal',
        GENERATE_REPORT: '/api/projects/generate-report',
        GENERATE_PLAN: '/api/projects/generate-plan',
    },

    // المستخدمين
    USERS: {
        PROFILE: '/api/users/profile',
        UPDATE_PROFILE: '/api/users/profile',
        CREDITS: '/api/users/credits',
        TRANSACTIONS: '/api/users/transactions',
    },

    // الفريق
    TEAM: {
        LIST: '/api/team',
        CREATE: '/api/team',
        GET: (id: string) => `/api/team/${id}`,
        UPDATE: (id: string) => `/api/team/${id}`,
        DELETE: (id: string) => `/api/team/${id}`,
        MEMBERS: (id: string) => `/api/team/${id}/members`,
    },

    // الوكلاء
    AGENTS: {
        LIST: '/api/agents',
        CREATE: '/api/agents',
        GET: (id: string) => `/api/agents/${id}`,
        UPDATE: (id: string) => `/api/agents/${id}`,
        DELETE: (id: string) => `/api/agents/${id}`,
        CATEGORIES: '/api/agents/categories',
    },

    // التصدير
    EXPORT: {
        DOCX: '/api/export/docx',
        PPTX: '/api/export/pptx',
        PDF: '/api/export/pdf',
        ACADEMIC: '/api/export/academic',
    },

    // المصادقة
    AUTH: {
        LOGIN: '/api/auth/login',
        REGISTER: '/api/auth/register',
        LOGOUT: '/api/auth/logout',
        REFRESH: '/api/auth/refresh',
        VERIFY_EMAIL: '/api/auth/verify-email',
        RESET_PASSWORD: '/api/auth/reset-password',
    },

    // الإعدادات
    SETTINGS: {
        PUBLIC: '/api/settings/public',
        FEATURES: '/api/settings/features',
    },

    // الملفات
    FILES: {
        UPLOAD: '/api/files/upload',
        DELETE: (id: string) => `/api/files/${id}`,
        PROXY_IMAGE: '/api/proxy-image',
    },
} as const;

/**
 * مساعد للحصول على نقطة نهاية API مع معاملات
 */
export const createEndpoint = (base: string, ...params: string[]): string => {
    return params.reduce((endpoint, param) => endpoint.replace(/:\w+/, param), base);
};

/**
 * مساعد للتحقق من صحة نقطة النهاية
 */
export const isValidEndpoint = (endpoint: string): boolean => {
    return Object.values(API_ENDPOINTS)
        .flatMap(Object.values)
        .some(ep => typeof ep === 'string' ? ep === endpoint : false);
};
