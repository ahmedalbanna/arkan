/**
 * العميل الرئيسي للـ API - النسخة المحدثة
 *
 * هذا الملف يحتوي على العميل الرئيسي الموحد
 * مع جميع الخدمات المتاحة مع إصلاح مشكلة استخراج البيانات
 */

'use client';

import { API_ENDPOINTS } from '../../constants';
import { TypedSearchResponse } from '../../types/improved-types';
import { BaseApiClient } from './base-client';

// أنواع محلية للبيانات
interface AuthRequest {
    email: string;
    password: string;
}

interface AuthResponse {
    token: string;
    user: UserProfile;
    expiresIn: number;
}

interface ExportResponse {
    url: string;
    filename: string;
    size: number;
    expiresAt: Date;
}

interface FileUploadResponse {
    id: string;
    filename: string;
    url: string;
    size: number;
    type: string;
}

interface UserProfile {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * إعدادات عميل API
 */
export interface ApiClientConfig {
    baseUrl?: string;
    timeout?: number;
    retries?: number;
    retryDelay?: number;
}

// أنواع محسنة للبيانات
interface TransactionData {
    id: string;
    amount: number;
    type: 'credit' | 'debit';
    description: string;
    timestamp: Date;
    status: 'pending' | 'completed' | 'failed';
}

interface GrammarError {
    message: string;
    suggestion: string;
    position: { start: number; end: number };
    severity: 'error' | 'warning' | 'info';
}

interface FactSource {
    title: string;
    url: string;
    reliability: number;
    date: Date;
    excerpt: string;
}

interface ResearchSource {
    title: string;
    url: string;
    type: 'article' | 'book' | 'website' | 'paper';
    relevance: number;
    summary: string;
}

interface QuizQuestion {
    id: string;
    question: string;
    type: 'multiple_choice' | 'true_false' | 'short_answer';
    options?: string[];
    correctAnswer: string;
    explanation: string;
}

interface ProjectData {
    id: string;
    name: string;
    description?: string;
    type: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

interface ProposalData {
    id: string;
    title: string;
    content: string;
    status: string;
    createdAt: Date;
}

interface ReportData {
    id: string;
    title: string;
    content: string;
    type: string;
    status: string;
    createdAt: Date;
}

interface PlanData {
    id: string;
    title: string;
    content: string;
    status: string;
    createdAt: Date;
}

interface PresentationOutline {
    id: string;
    title: string;
    content: string;
    order: number;
}

interface PresentationSlide {
    id: string;
    title: string;
    content: string;
    type: string;
    order: number;
}

interface TeamData {
    id: string;
    name: string;
    description?: string;
    members: TeamMemberData[];
    createdAt: Date;
}

interface TeamMemberData {
    id: string;
    name: string;
    email: string;
    role: string;
    joinedAt: Date;
}

interface AgentData {
    id: string;
    name: string;
    description: string;
    category: string;
    status: string;
    createdAt: Date;
}

interface AgentCategoryData {
    id: string;
    name: string;
    description: string;
    agents: AgentData[];
}

interface ExportData {
    content: string;
    format: string;
    metadata?: Record<string, unknown>;
}

interface ExportOptions {
    includeImages?: boolean;
    includeCharts?: boolean;
    watermark?: string;
    password?: string;
}

interface PublicSettings {
    version: string;
    features: string[];
    limits: Record<string, number>;
}

interface FeatureData {
    id: string;
    name: string;
    description: string;
    enabled: boolean;
    category: string;
}

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
        return BaseApiClient.extractData<AuthResponse>(response);
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
        return BaseApiClient.extractData<AuthResponse>(response);
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
        return BaseApiClient.extractData<UserProfile>(response);
    }

    /**
     * تحديث ملف المستخدم الشخصي
     */
    async updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
        const response = await this.put<UserProfile>(`${API_ENDPOINTS.USERS.PROFILE}/${userId}`, data);
        return BaseApiClient.extractData<UserProfile>(response);
    }

    /**
     * الحصول على رصيد المستخدم
     */
    async getUserCredits(): Promise<{ credits: number }> {
        const response = await this.get<{ credits: number }>(API_ENDPOINTS.USERS.CREDITS);
        return BaseApiClient.extractData<{ credits: number }>(response);
    }

    /**
     * الحصول على معاملات المستخدم
     */
    async getUserTransactions(page = 1, limit = 10): Promise<TypedSearchResponse<TransactionData>> {
        const response = await this.get<TypedSearchResponse<TransactionData>>(
            `${API_ENDPOINTS.USERS.TRANSACTIONS}?page=${page}&limit=${limit}`
        );
        return BaseApiClient.extractData<TypedSearchResponse<TransactionData>>(response);
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
        return BaseApiClient.extractData<{ result: string }>(response);
    }

    /**
     * تلخيص النص
     */
    async summarizeText(text: string, length: string): Promise<{ result: string }> {
        const response = await this.post<{ result: string }>(API_ENDPOINTS.WRITING_TOOLS.SUMMARIZE, {
            text,
            length,
        });
        return BaseApiClient.extractData<{ result: string }>(response);
    }

    /**
     * فحص القواعد النحوية
     */
    async grammarCheck(text: string): Promise<{ result: string; errors: GrammarError[] }> {
        const response = await this.post<{ result: string; errors: GrammarError[] }>(API_ENDPOINTS.WRITING_TOOLS.GRAMMAR_CHECK, {
            text,
        });
        return BaseApiClient.extractData<{ result: string; errors: GrammarError[] }>(response);
    }

    /**
     * جعل النص أكثر إنسانية
     */
    async humanizeText(text: string): Promise<{ result: string }> {
        const response = await this.post<{ result: string }>(API_ENDPOINTS.WRITING_TOOLS.HUMANIZE, {
            text,
        });
        return BaseApiClient.extractData<{ result: string }>(response);
    }

    /**
     * كشف المحتوى المُولد بالذكاء الاصطناعي
     */
    async detectAI(text: string): Promise<{ isAI: boolean; confidence: number }> {
        const response = await this.post<{ isAI: boolean; confidence: number }>(API_ENDPOINTS.WRITING_TOOLS.DETECT_AI, {
            text,
        });
        return BaseApiClient.extractData<{ isAI: boolean; confidence: number }>(response);
    }

    /**
     * فحص الحقائق
     */
    async factCheck(text: string): Promise<{ result: string; sources: FactSource[] }> {
        const response = await this.post<{ result: string; sources: FactSource[] }>(API_ENDPOINTS.WRITING_TOOLS.FACT_CHECK, {
            text,
        });
        return BaseApiClient.extractData<{ result: string; sources: FactSource[] }>(response);
    }

    /**
     * فحص الانتحال
     */
    async plagiarismCheck(text: string): Promise<{ result: string; similarity: number }> {
        const response = await this.post<{ result: string; similarity: number }>(API_ENDPOINTS.WRITING_TOOLS.PLAGIARISM_CHECK, {
            text,
        });
        return BaseApiClient.extractData<{ result: string; similarity: number }>(response);
    }

    /**
     * باحث الذكاء الاصطناعي
     */
    async aiResearcher(topic: string): Promise<{ result: string; sources: ResearchSource[] }> {
        const response = await this.post<{ result: string; sources: ResearchSource[] }>(API_ENDPOINTS.WRITING_TOOLS.AI_RESEARCHER, {
            topic,
        });
        return BaseApiClient.extractData<{ result: string; sources: ResearchSource[] }>(response);
    }

    /**
     * شرح الموضوع
     */
    async topicExplainer(topic: string): Promise<{ result: string }> {
        const response = await this.post<{ result: string }>(API_ENDPOINTS.WRITING_TOOLS.TOPIC_EXPLAINER, {
            topic,
        });
        return BaseApiClient.extractData<{ result: string }>(response);
    }

    /**
     * إعادة كتابة النص
     */
    async rewriteText(text: string, style: string): Promise<{ result: string }> {
        const response = await this.post<{ result: string }>(API_ENDPOINTS.WRITING_TOOLS.REWRITE_TEXT, {
            text,
            style,
        });
        return BaseApiClient.extractData<{ result: string }>(response);
    }

    /**
     * تلخيص النص بنسبة
     */
    async summarizeWithRatio(text: string, ratio: number): Promise<{ result: string }> {
        const response = await this.post<{ result: string }>(API_ENDPOINTS.WRITING_TOOLS.SUMMARIZE_WITH_RATIO, {
            text,
            ratio,
        });
        return BaseApiClient.extractData<{ result: string }>(response);
    }

    /**
     * كتابة مستند
     */
    async writeDocument(prompt: string, type: string): Promise<{ result: string }> {
        const response = await this.post<{ result: string }>(API_ENDPOINTS.WRITING_TOOLS.WRITE_DOCUMENT, {
            prompt,
            type,
        });
        return BaseApiClient.extractData<{ result: string }>(response);
    }

    /**
     * توليد الأفكار
     */
    async generateIdeas(topic: string, count: number): Promise<{ ideas: string[] }> {
        const response = await this.post<{ ideas: string[] }>(API_ENDPOINTS.WRITING_TOOLS.IDEA_GENERATION, {
            topic,
            count,
        });
        return BaseApiClient.extractData<{ ideas: string[] }>(response);
    }

    /**
     * توليد اختبار
     */
    async generateQuiz(text: string, numQuestions: number, questionType: string): Promise<{ quiz: QuizQuestion[] }> {
        const response = await this.post<{ quiz: QuizQuestion[] }>(API_ENDPOINTS.WRITING_TOOLS.GENERATE_QUIZ, {
            text,
            numQuestions,
            questionType,
        });
        return BaseApiClient.extractData<{ quiz: QuizQuestion[] }>(response);
    }

    /**
     * توليد اقتباس
     */
    async generateCitation(sourceText: string, style: string): Promise<{ citation: string }> {
        const response = await this.post<{ citation: string }>(API_ENDPOINTS.WRITING_TOOLS.GENERATE_CITATION, {
            sourceText,
            style,
        });
        return BaseApiClient.extractData<{ citation: string }>(response);
    }

    /**
     * معالجة النص
     */
    async manipulateText(text: string, operation: string): Promise<{ result: string }> {
        const response = await this.post<{ result: string }>(API_ENDPOINTS.WRITING_TOOLS.MANIPULATE_TEXT, {
            text,
            operation,
        });
        return BaseApiClient.extractData<{ result: string }>(response);
    }

    // ==================== العروض التقديمية ====================

    /**
     * توليد مخطط العروض التقديمية
     */
    async generatePresentationOutline(topic: string, slides: number): Promise<{ outline: PresentationOutline[] }> {
        const response = await this.post<{ outline: PresentationOutline[] }>(API_ENDPOINTS.PRESENTATION.GENERATE_OUTLINE, {
            topic,
            slides,
        });
        return BaseApiClient.extractData<{ outline: PresentationOutline[] }>(response);
    }

    /**
     * توليد شرائح العروض التقديمية
     */
    async generateSlides(outline: PresentationOutline[], style: string): Promise<{ slides: PresentationSlide[] }> {
        const response = await this.post<{ slides: PresentationSlide[] }>(API_ENDPOINTS.PRESENTATION.GENERATE_SLIDES, {
            outline,
            style,
        });
        return BaseApiClient.extractData<{ slides: PresentationSlide[] }>(response);
    }

    /**
     * توليد PlantUML
     */
    async generatePlantUML(description: string, type: string): Promise<{ diagram: string }> {
        const response = await this.post<{ diagram: string }>(API_ENDPOINTS.PRESENTATION.GENERATE_PLANT_UML, {
            description,
            type,
        });
        return BaseApiClient.extractData<{ diagram: string }>(response);
    }

    // ==================== المشاريع ====================

    /**
     * إنشاء مشروع جديد
     */
    async createProject(data: ProjectData): Promise<{ project: ProjectData }> {
        const response = await this.post<{ project: ProjectData }>(API_ENDPOINTS.PROJECTS.CREATE, data);
        return BaseApiClient.extractData<{ project: ProjectData }>(response);
    }

    /**
     * الحصول على قائمة المشاريع
     */
    async getProjects(page = 1, limit = 10): Promise<TypedSearchResponse<ProjectData>> {
        const response = await this.get<TypedSearchResponse<ProjectData>>(
            `${API_ENDPOINTS.PROJECTS.LIST}?page=${page}&limit=${limit}`
        );
        return BaseApiClient.extractData<TypedSearchResponse<ProjectData>>(response);
    }

    /**
     * الحصول على مشروع محدد
     */
    async getProject(projectId: string): Promise<{ project: ProjectData }> {
        const response = await this.get<{ project: ProjectData }>(API_ENDPOINTS.PROJECTS.GET(projectId));
        return BaseApiClient.extractData<{ project: ProjectData }>(response);
    }

    /**
     * تحديث مشروع
     */
    async updateProject(projectId: string, data: Partial<ProjectData>): Promise<{ project: ProjectData }> {
        const response = await this.put<{ project: ProjectData }>(API_ENDPOINTS.PROJECTS.UPDATE(projectId), data);
        return BaseApiClient.extractData<{ project: ProjectData }>(response);
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
    async generateProposal(data: ProposalData): Promise<{ proposal: ProposalData }> {
        const response = await this.post<{ proposal: ProposalData }>(API_ENDPOINTS.PROJECTS.GENERATE_PROPOSAL, data);
        return BaseApiClient.extractData<{ proposal: ProposalData }>(response);
    }

    /**
     * توليد تقرير مشروع
     */
    async generateReport(projectId: string, type: string): Promise<{ report: ReportData }> {
        const response = await this.post<{ report: ReportData }>(API_ENDPOINTS.PROJECTS.GENERATE_REPORT, {
            projectId,
            type,
        });
        return BaseApiClient.extractData<{ report: ReportData }>(response);
    }

    /**
     * توليد خطة مشروع
     */
    async generatePlan(projectId: string): Promise<{ plan: PlanData }> {
        const response = await this.post<{ plan: PlanData }>(API_ENDPOINTS.PROJECTS.GENERATE_PLAN, {
            projectId,
        });
        return BaseApiClient.extractData<{ plan: PlanData }>(response);
    }

    // ==================== الفريق ====================

    /**
     * الحصول على قائمة الفرق
     */
    async getTeams(): Promise<{ teams: TeamData[] }> {
        const response = await this.get<{ teams: TeamData[] }>(API_ENDPOINTS.TEAM.LIST);
        return BaseApiClient.extractData<{ teams: TeamData[] }>(response);
    }

    /**
     * إنشاء فريق جديد
     */
    async createTeam(data: TeamData): Promise<{ team: TeamData }> {
        const response = await this.post<{ team: TeamData }>(API_ENDPOINTS.TEAM.CREATE, data);
        return BaseApiClient.extractData<{ team: TeamData }>(response);
    }

    /**
     * الحصول على فريق محدد
     */
    async getTeam(teamId: string): Promise<{ team: TeamData }> {
        const response = await this.get<{ team: TeamData }>(API_ENDPOINTS.TEAM.GET(teamId));
        return BaseApiClient.extractData<{ team: TeamData }>(response);
    }

    /**
     * تحديث فريق
     */
    async updateTeam(teamId: string, data: Partial<TeamData>): Promise<{ team: TeamData }> {
        const response = await this.put<{ team: TeamData }>(API_ENDPOINTS.TEAM.UPDATE(teamId), data);
        return BaseApiClient.extractData<{ team: TeamData }>(response);
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
    async getTeamMembers(teamId: string): Promise<{ members: TeamMemberData[] }> {
        const response = await this.get<{ members: TeamMemberData[] }>(API_ENDPOINTS.TEAM.MEMBERS(teamId));
        return BaseApiClient.extractData<{ members: TeamMemberData[] }>(response);
    }

    // ==================== الوكلاء ====================

    /**
     * الحصول على قائمة الوكلاء
     */
    async getAgents(): Promise<{ agents: AgentData[] }> {
        const response = await this.get<{ agents: AgentData[] }>(API_ENDPOINTS.AGENTS.LIST);
        return BaseApiClient.extractData<{ agents: AgentData[] }>(response);
    }

    /**
     * إنشاء وكيل جديد
     */
    async createAgent(data: AgentData): Promise<{ agent: AgentData }> {
        const response = await this.post<{ agent: AgentData }>(API_ENDPOINTS.AGENTS.CREATE, data);
        return BaseApiClient.extractData<{ agent: AgentData }>(response);
    }

    /**
     * الحصول على وكيل محدد
     */
    async getAgent(agentId: string): Promise<{ agent: AgentData }> {
        const response = await this.get<{ agent: AgentData }>(API_ENDPOINTS.AGENTS.GET(agentId));
        return BaseApiClient.extractData<{ agent: AgentData }>(response);
    }

    /**
     * تحديث وكيل
     */
    async updateAgent(agentId: string, data: Partial<AgentData>): Promise<{ agent: AgentData }> {
        const response = await this.put<{ agent: AgentData }>(API_ENDPOINTS.AGENTS.UPDATE(agentId), data);
        return BaseApiClient.extractData<{ agent: AgentData }>(response);
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
    async getAgentCategories(): Promise<{ categories: AgentCategoryData[] }> {
        const response = await this.get<{ categories: AgentCategoryData[] }>(API_ENDPOINTS.AGENTS.CATEGORIES);
        return BaseApiClient.extractData<{ categories: AgentCategoryData[] }>(response);
    }

    // ==================== التصدير ====================

    /**
     * تصدير إلى DOCX
     */
    async exportToDocx(data: ExportData, options: ExportOptions = {}): Promise<ExportResponse> {
        const response = await this.post<ExportResponse>(API_ENDPOINTS.EXPORT.DOCX, {
            data,
            format: 'docx',
            options,
        });
        return BaseApiClient.extractData<ExportResponse>(response);
    }

    /**
     * تصدير إلى PPTX
     */
    async exportToPptx(data: ExportData, options: ExportOptions = {}): Promise<ExportResponse> {
        const response = await this.post<ExportResponse>(API_ENDPOINTS.EXPORT.PPTX, {
            data,
            format: 'pptx',
            options,
        });
        return BaseApiClient.extractData<ExportResponse>(response);
    }

    /**
     * تصدير إلى PDF
     */
    async exportToPdf(data: ExportData, options: ExportOptions = {}): Promise<ExportResponse> {
        const response = await this.post<ExportResponse>(API_ENDPOINTS.EXPORT.PDF, {
            data,
            format: 'pdf',
            options,
        });
        return BaseApiClient.extractData<ExportResponse>(response);
    }

    /**
     * تصدير أكاديمي
     */
    async exportAcademic(data: ExportData, options: ExportOptions = {}): Promise<ExportResponse> {
        const response = await this.post<ExportResponse>(API_ENDPOINTS.EXPORT.ACADEMIC, {
            data,
            options,
        });
        return BaseApiClient.extractData<ExportResponse>(response);
    }

    // ==================== الملفات ====================

    /**
     * رفع ملف
     */
    async uploadFileToServer(file: File, folder?: string, onProgress?: (progress: number) => void): Promise<FileUploadResponse> {
        const url = folder ? `${API_ENDPOINTS.FILES.UPLOAD}?folder=${folder}` : API_ENDPOINTS.FILES.UPLOAD;
        const response = await super.uploadFile<FileUploadResponse>(
            url,
            file,
            onProgress
        );
        return BaseApiClient.extractData<FileUploadResponse>(response);
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
    async getPublicSettings(): Promise<{ settings: PublicSettings }> {
        const response = await this.get<{ settings: PublicSettings }>(API_ENDPOINTS.SETTINGS.PUBLIC);
        return BaseApiClient.extractData<{ settings: PublicSettings }>(response);
    }

    /**
     * الحصول على الميزات
     */
    async getFeatures(): Promise<{ features: FeatureData[] }> {
        const response = await this.get<{ features: FeatureData[] }>(API_ENDPOINTS.SETTINGS.FEATURES);
        return BaseApiClient.extractData<{ features: FeatureData[] }>(response);
    }

    // ==================== طرق HTTP إضافية ====================

    /**
     * PATCH request - تحديث جزئي
     */
    async patch<TInput = any, TOutput = any>(
        endpoint: string,
        data: TInput,
        options: {
            token?: string;
            headers?: Record<string, string>;
            timeout?: number;
        } = {}
    ): Promise<TOutput> {
        const response = await this.put<TOutput>(endpoint, data, options);
        return BaseApiClient.extractData<TOutput>(response);
    }

    /**
     * استدعاء API endpoint مخصص
     */
    async call<TInput = any, TOutput = any>(
        endpoint: string,
        options: {
            method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
            data?: TInput;
            token?: string;
            headers?: Record<string, string>;
            timeout?: number;
        } = {}
    ): Promise<TOutput> {
        const {
            method = 'GET',
            data,
            token,
            headers = {},
            timeout,
        } = options;

        // إعداد الرؤوس مع المصادقة
        const requestHeaders: Record<string, string> = { ...headers };
        if (token) {
            requestHeaders['Authorization'] = `Bearer ${token}`;
        }

        const requestOptions = {
            headers: requestHeaders,
            timeout,
        };

        let response: any;

        switch (method) {
            case 'GET':
                response = await this.get<TOutput>(endpoint, requestOptions);
                break;
            case 'POST':
                response = await this.post<TOutput>(endpoint, data!, requestOptions);
                break;
            case 'PUT':
                response = await this.put<TOutput>(endpoint, data!, requestOptions);
                break;
            case 'DELETE':
                response = await this.delete<TOutput>(endpoint, requestOptions);
                break;
            case 'PATCH':
                response = await this.patch<any>(endpoint, data!, requestOptions);
                break;
            default:
                throw new Error(`Unsupported HTTP method: ${method}`);
        }

        return BaseApiClient.extractData<TOutput>(response);
    }

}

/**
 * عميل API افتراضي
 */
export const apiClient = new ApiClient();

/**
 * عميل API للإدارة
 */
export const adminApiClient = new ApiClient();

/**
 * عميل API للعمليات العامة
 */
export const publicApiClient = new ApiClient();

