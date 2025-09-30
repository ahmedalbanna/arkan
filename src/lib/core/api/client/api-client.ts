/**
 * العميل الرئيسي للـ API
 *
 * هذا الملف يحتوي على العميل الرئيسي الموحد
 * مع جميع الخدمات المتاحة
 */

'use client';

import { API_ENDPOINTS } from '../../constants';
import {
    AuthRequest,
    AuthResponse,
    ExportResponse,
    FileUploadResponse,
    SearchResponse,
    UserProfile
} from '../../types';
import { BaseApiClient } from './base-client';

/**
 * العميل الرئيسي للـ API
 */
export class ApiClient extends BaseApiClient {
    // ==================== المصادقة ====================

    /**
     * تسجيل الدخول
     */
    async login(credentials: AuthRequest): Promise<AuthResponse> {
        const response = await this.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);
        return response.data;
    }

    /**
     * تسجيل الخروج
     */
    async logout(): Promise<void> {
        await this.post(API_ENDPOINTS.AUTH.LOGOUT);
    }

    /**
     * تحديث الرمز المميز
     */
    async refreshToken(): Promise<AuthResponse> {
        const response = await this.post<AuthResponse>(API_ENDPOINTS.AUTH.REFRESH);
        return response.data;
    }

    /**
     * التحقق من البريد الإلكتروني
     */
    async verifyEmail(token: string): Promise<void> {
        await this.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, { token });
    }

    /**
     * إعادة تعيين كلمة المرور
     */
    async resetPassword(email: string): Promise<void> {
        await this.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { email });
    }

    // ==================== المستخدمين ====================

    /**
     * الحصول على ملف المستخدم الشخصي
     */
    async getUserProfile(userId?: string): Promise<UserProfile> {
        const url = userId ? API_ENDPOINTS.USERS.PROFILE.replace(':id', userId) : API_ENDPOINTS.USERS.PROFILE;
        const response = await this.get<UserProfile>(url);
        return response.data;
    }

    /**
     * تحديث ملف المستخدم الشخصي
     */
    async updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
        const response = await this.put<UserProfile>(`${API_ENDPOINTS.USERS.PROFILE}/${userId}`, data);
        return response.data;
    }

    /**
     * الحصول على رصيد المستخدم
     */
    async getUserCredits(): Promise<{ credits: number }> {
        const response = await this.get<{ credits: number }>(API_ENDPOINTS.USERS.CREDITS);
        return response.data;
    }

    /**
     * الحصول على معاملات المستخدم
     */
    async getUserTransactions(page = 1, limit = 10): Promise<SearchResponse<any>> {
        const response = await this.get<SearchResponse<any>>(
            `${API_ENDPOINTS.USERS.TRANSACTIONS}?page=${page}&limit=${limit}`
        );
        return response.data;
    }

    // ==================== أدوات الكتابة ====================

    /**
     * إعادة صياغة النص
     */
    async paraphraseText(text: string, mode: string): Promise<{ result: string }> {
        const response = await this.post<{ result: string }>(API_ENDPOINTS.WRITING_TOOLS.PARAPHRASE, {
            text,
            mode,
        });
        return response.data;
    }

    /**
     * تلخيص النص
     */
    async summarizeText(text: string, length: string): Promise<{ result: string }> {
        const response = await this.post<{ result: string }>(API_ENDPOINTS.WRITING_TOOLS.SUMMARIZE, {
            text,
            length,
        });
        return response.data;
    }

    /**
     * فحص القواعد النحوية
     */
    async grammarCheck(text: string): Promise<{ result: string; errors: any[] }> {
        const response = await this.post<{ result: string; errors: any[] }>(API_ENDPOINTS.WRITING_TOOLS.GRAMMAR_CHECK, {
            text,
        });
        return response.data;
    }

    /**
     * جعل النص أكثر إنسانية
     */
    async humanizeText(text: string): Promise<{ result: string }> {
        const response = await this.post<{ result: string }>(API_ENDPOINTS.WRITING_TOOLS.HUMANIZE, {
            text,
        });
        return response.data;
    }

    /**
     * كشف المحتوى المُولد بالذكاء الاصطناعي
     */
    async detectAI(text: string): Promise<{ isAI: boolean; confidence: number }> {
        const response = await this.post<{ isAI: boolean; confidence: number }>(API_ENDPOINTS.WRITING_TOOLS.DETECT_AI, {
            text,
        });
        return response.data;
    }

    /**
     * فحص الحقائق
     */
    async factCheck(text: string): Promise<{ result: string; sources: any[] }> {
        const response = await this.post<{ result: string; sources: any[] }>(API_ENDPOINTS.WRITING_TOOLS.FACT_CHECK, {
            text,
        });
        return response.data;
    }

    /**
     * فحص الانتحال
     */
    async plagiarismCheck(text: string): Promise<{ result: string; similarity: number }> {
        const response = await this.post<{ result: string; similarity: number }>(API_ENDPOINTS.WRITING_TOOLS.PLAGIARISM_CHECK, {
            text,
        });
        return response.data;
    }

    /**
     * باحث الذكاء الاصطناعي
     */
    async aiResearcher(topic: string): Promise<{ result: string; sources: any[] }> {
        const response = await this.post<{ result: string; sources: any[] }>(API_ENDPOINTS.WRITING_TOOLS.AI_RESEARCHER, {
            topic,
        });
        return response.data;
    }

    /**
     * شرح الموضوع
     */
    async topicExplainer(topic: string): Promise<{ result: string }> {
        const response = await this.post<{ result: string }>(API_ENDPOINTS.WRITING_TOOLS.TOPIC_EXPLAINER, {
            topic,
        });
        return response.data;
    }

    /**
     * إعادة كتابة النص
     */
    async rewriteText(text: string, style: string): Promise<{ result: string }> {
        const response = await this.post<{ result: string }>(API_ENDPOINTS.WRITING_TOOLS.REWRITE_TEXT, {
            text,
            style,
        });
        return response.data;
    }

    /**
     * تلخيص النص بنسبة
     */
    async summarizeWithRatio(text: string, ratio: number): Promise<{ result: string }> {
        const response = await this.post<{ result: string }>(API_ENDPOINTS.WRITING_TOOLS.SUMMARIZE_WITH_RATIO, {
            text,
            ratio,
        });
        return response.data;
    }

    /**
     * كتابة مستند
     */
    async writeDocument(prompt: string, type: string): Promise<{ result: string }> {
        const response = await this.post<{ result: string }>(API_ENDPOINTS.WRITING_TOOLS.WRITE_DOCUMENT, {
            prompt,
            type,
        });
        return response.data;
    }

    /**
     * توليد الأفكار
     */
    async generateIdeas(topic: string, count: number): Promise<{ ideas: string[] }> {
        const response = await this.post<{ ideas: string[] }>(API_ENDPOINTS.WRITING_TOOLS.IDEA_GENERATION, {
            topic,
            count,
        });
        return response.data;
    }

    /**
     * توليد اختبار
     */
    async generateQuiz(text: string, numQuestions: number, questionType: string): Promise<{ quiz: any[] }> {
        const response = await this.post<{ quiz: any[] }>(API_ENDPOINTS.WRITING_TOOLS.GENERATE_QUIZ, {
            text,
            numQuestions,
            questionType,
        });
        return response.data;
    }

    /**
     * توليد اقتباس
     */
    async generateCitation(sourceText: string, style: string): Promise<{ citation: string }> {
        const response = await this.post<{ citation: string }>(API_ENDPOINTS.WRITING_TOOLS.GENERATE_CITATION, {
            sourceText,
            style,
        });
        return response.data;
    }

    /**
     * معالجة النص
     */
    async manipulateText(text: string, operation: string): Promise<{ result: string }> {
        const response = await this.post<{ result: string }>(API_ENDPOINTS.WRITING_TOOLS.MANIPULATE_TEXT, {
            text,
            operation,
        });
        return response.data;
    }

    // ==================== العروض التقديمية ====================

    /**
     * توليد مخطط العروض التقديمية
     */
    async generatePresentationOutline(topic: string, slides: number): Promise<{ outline: any[] }> {
        const response = await this.post<{ outline: any[] }>(API_ENDPOINTS.PRESENTATION.GENERATE_OUTLINE, {
            topic,
            slides,
        });
        return response.data;
    }

    /**
     * توليد شرائح العروض التقديمية
     */
    async generateSlides(outline: any[], style: string): Promise<{ slides: any[] }> {
        const response = await this.post<{ slides: any[] }>(API_ENDPOINTS.PRESENTATION.GENERATE_SLIDES, {
            outline,
            style,
        });
        return response.data;
    }

    /**
     * توليد PlantUML
     */
    async generatePlantUML(description: string, type: string): Promise<{ diagram: string }> {
        const response = await this.post<{ diagram: string }>(API_ENDPOINTS.PRESENTATION.GENERATE_PLANT_UML, {
            description,
            type,
        });
        return response.data;
    }

    // ==================== المشاريع ====================

    /**
     * إنشاء مشروع جديد
     */
    async createProject(data: any): Promise<{ project: any }> {
        const response = await this.post<{ project: any }>(API_ENDPOINTS.PROJECTS.CREATE, data);
        return response.data;
    }

    /**
     * الحصول على قائمة المشاريع
     */
    async getProjects(page = 1, limit = 10): Promise<SearchResponse<any>> {
        const response = await this.get<SearchResponse<any>>(
            `${API_ENDPOINTS.PROJECTS.LIST}?page=${page}&limit=${limit}`
        );
        return response.data;
    }

    /**
     * الحصول على مشروع محدد
     */
    async getProject(projectId: string): Promise<{ project: any }> {
        const response = await this.get<{ project: any }>(API_ENDPOINTS.PROJECTS.GET(projectId));
        return response.data;
    }

    /**
     * تحديث مشروع
     */
    async updateProject(projectId: string, data: any): Promise<{ project: any }> {
        const response = await this.put<{ project: any }>(API_ENDPOINTS.PROJECTS.UPDATE(projectId), data);
        return response.data;
    }

    /**
     * حذف مشروع
     */
    async deleteProject(projectId: string): Promise<void> {
        await this.delete(API_ENDPOINTS.PROJECTS.DELETE(projectId));
    }

    /**
     * توليد مقترح مشروع
     */
    async generateProposal(data: any): Promise<{ proposal: any }> {
        const response = await this.post<{ proposal: any }>(API_ENDPOINTS.PROJECTS.GENERATE_PROPOSAL, data);
        return response.data;
    }

    /**
     * توليد تقرير مشروع
     */
    async generateReport(projectId: string, type: string): Promise<{ report: any }> {
        const response = await this.post<{ report: any }>(API_ENDPOINTS.PROJECTS.GENERATE_REPORT, {
            projectId,
            type,
        });
        return response.data;
    }

    /**
     * توليد خطة مشروع
     */
    async generatePlan(projectId: string): Promise<{ plan: any }> {
        const response = await this.post<{ plan: any }>(API_ENDPOINTS.PROJECTS.GENERATE_PLAN, {
            projectId,
        });
        return response.data;
    }

    // ==================== الفريق ====================

    /**
     * الحصول على قائمة الفرق
     */
    async getTeams(): Promise<{ teams: any[] }> {
        const response = await this.get<{ teams: any[] }>(API_ENDPOINTS.TEAM.LIST);
        return response.data;
    }

    /**
     * إنشاء فريق جديد
     */
    async createTeam(data: any): Promise<{ team: any }> {
        const response = await this.post<{ team: any }>(API_ENDPOINTS.TEAM.CREATE, data);
        return response.data;
    }

    /**
     * الحصول على فريق محدد
     */
    async getTeam(teamId: string): Promise<{ team: any }> {
        const response = await this.get<{ team: any }>(API_ENDPOINTS.TEAM.GET(teamId));
        return response.data;
    }

    /**
     * تحديث فريق
     */
    async updateTeam(teamId: string, data: any): Promise<{ team: any }> {
        const response = await this.put<{ team: any }>(API_ENDPOINTS.TEAM.UPDATE(teamId), data);
        return response.data;
    }

    /**
     * حذف فريق
     */
    async deleteTeam(teamId: string): Promise<void> {
        await this.delete(API_ENDPOINTS.TEAM.DELETE(teamId));
    }

    /**
     * الحصول على أعضاء الفريق
     */
    async getTeamMembers(teamId: string): Promise<{ members: any[] }> {
        const response = await this.get<{ members: any[] }>(API_ENDPOINTS.TEAM.MEMBERS(teamId));
        return response.data;
    }

    // ==================== الوكلاء ====================

    /**
     * الحصول على قائمة الوكلاء
     */
    async getAgents(): Promise<{ agents: any[] }> {
        const response = await this.get<{ agents: any[] }>(API_ENDPOINTS.AGENTS.LIST);
        return response.data;
    }

    /**
     * إنشاء وكيل جديد
     */
    async createAgent(data: any): Promise<{ agent: any }> {
        const response = await this.post<{ agent: any }>(API_ENDPOINTS.AGENTS.CREATE, data);
        return response.data;
    }

    /**
     * الحصول على وكيل محدد
     */
    async getAgent(agentId: string): Promise<{ agent: any }> {
        const response = await this.get<{ agent: any }>(API_ENDPOINTS.AGENTS.GET(agentId));
        return response.data;
    }

    /**
     * تحديث وكيل
     */
    async updateAgent(agentId: string, data: any): Promise<{ agent: any }> {
        const response = await this.put<{ agent: any }>(API_ENDPOINTS.AGENTS.UPDATE(agentId), data);
        return response.data;
    }

    /**
     * حذف وكيل
     */
    async deleteAgent(agentId: string): Promise<void> {
        await this.delete(API_ENDPOINTS.AGENTS.DELETE(agentId));
    }

    /**
     * الحصول على فئات الوكلاء
     */
    async getAgentCategories(): Promise<{ categories: any[] }> {
        const response = await this.get<{ categories: any[] }>(API_ENDPOINTS.AGENTS.CATEGORIES);
        return response.data;
    }

    // ==================== التصدير ====================

    /**
     * تصدير إلى DOCX
     */
    async exportToDocx(data: any, options: any = {}): Promise<ExportResponse> {
        const response = await this.post<ExportResponse>(API_ENDPOINTS.EXPORT.DOCX, {
            data,
            format: 'docx',
            options,
        });
        return response.data;
    }

    /**
     * تصدير إلى PPTX
     */
    async exportToPptx(data: any, options: any = {}): Promise<ExportResponse> {
        const response = await this.post<ExportResponse>(API_ENDPOINTS.EXPORT.PPTX, {
            data,
            format: 'pptx',
            options,
        });
        return response.data;
    }

    /**
     * تصدير إلى PDF
     */
    async exportToPdf(data: any, options: any = {}): Promise<ExportResponse> {
        const response = await this.post<ExportResponse>(API_ENDPOINTS.EXPORT.PDF, {
            data,
            format: 'pdf',
            options,
        });
        return response.data;
    }

    /**
     * تصدير أكاديمي
     */
    async exportAcademic(data: any, options: any = {}): Promise<ExportResponse> {
        const response = await this.post<ExportResponse>(API_ENDPOINTS.EXPORT.ACADEMIC, {
            data,
            options,
        });
        return response.data;
    }

    // ==================== الملفات ====================

    /**
     * رفع ملف
     */
    async uploadFile(file: File, folder?: string, onProgress?: (progress: number) => void): Promise<FileUploadResponse> {
        const response = await super.uploadFile<FileUploadResponse>(
            API_ENDPOINTS.FILES.UPLOAD,
            file,
            onProgress
        );
        return response.data;
    }

    /**
     * حذف ملف
     */
    async deleteFile(fileId: string): Promise<void> {
        await this.delete(API_ENDPOINTS.FILES.DELETE(fileId));
    }

    /**
     * تحميل ملف
     */
    async downloadFile(fileId: string, filename?: string): Promise<void> {
        await this.downloadFile(`${API_ENDPOINTS.FILES.DELETE(fileId)}?download=true`, filename);
    }

    // ==================== الإعدادات ====================

    /**
     * الحصول على الإعدادات العامة
     */
    async getPublicSettings(): Promise<{ settings: any }> {
        const response = await this.get<{ settings: any }>(API_ENDPOINTS.SETTINGS.PUBLIC);
        return response.data;
    }

    /**
     * الحصول على الميزات
     */
    async getFeatures(): Promise<{ features: any[] }> {
        const response = await this.get<{ features: any[] }>(API_ENDPOINTS.SETTINGS.FEATURES);
        return response.data;
    }
}
