/**
 * خدمات النظام الموحدة - المنظمة حسب الوظيفة
 *
 * هذا الملف يحتوي على جميع الصادرات للخدمات المنظمة حسب الوظيفة
 */

// الخدمات المشتركة
export * from '@/services/shared';

// خدمات المصادقة
export * from '@/services/auth';

// خدمات المستخدمين
export * from '@/services/users';

// خدمات المشاريع
export * from '@/services/projects';

// خدمات الفرق
export * from '@/services/teams';

// خدمات الذكاء الاصطناعي
export * from '@/services/ai';

// خدمات الإدارة
export * from '@/services/admin';

// خدمات الدفع والمعاملات
export * from '@/services/payment';

// خدمات القوالب
export * from '@/services/templates';

// خدمات المحادثة
export * from '@/services/chat';

// خدمات التحليل والإحصائيات
export * from '@/services/analytics';


// الخدمات المفقودة التي تحتاجها hooks
export * from '@/services/project-plan-service';

// دوال مساعدة للخدمات المنظمة
export { fetchDashboardStats } from '@/services/admin/admin-service';
export { createAgentApi, createAgentCategoryApi, deleteAgentApi, fetchAgentApi, fetchAgentCategoriesApi, generateAgentConfigApi, updateAgentApi } from '@/services/admin/agent-service';
export { fetchFeaturesApi, updateFeatureApi } from '@/services/admin/feature-service';
export { fetchGenerationLogs } from '@/services/admin/generation-log-service';
export { createSection, deleteSection, fetchSections, updateSection } from '@/services/admin/section-service';
export { fetchPublicSettings } from '@/services/admin/settings-service';
export { fetchUserStats } from '@/services/analytics/analytics-service';
export { changePassword, loginWithEmail, logoutUser, resetPassword, signupUser } from '@/services/auth/auth-service';
export { agentChatApi, createConversationApi, deleteConversationApi, initiateSupportChat } from '@/services/chat/chat-service';
export { deductCredit } from '@/services/payment/credit-service';
export { submitPaymentProof } from '@/services/payment/payment-service';
export { fetchTransactionsForReport, fetchUserTransactions, getTransactions, verifyPayment } from '@/services/payment/transaction-service';
export { addContextToProjectApi, createProject, deleteProject, fetchProject, fetchProjects, updateProject } from '@/services/projects/project-service';
export { createTeam, deleteTeam, fetchTeam, fetchUserTeams, inviteMember, removeMember, updateMemberRole, updateTeam } from '@/services/teams/team-service';
export { createGenerativeTemplate, deletePptxTemplateApi, fetchDocxTemplatesApi, fetchPptxTemplatesApi, fetchPresentationTemplatesApi, fetchProposalTemplatesApi, fetchReportTemplatesApi, refreshTemplateImage, updateDocxTemplateApi, updatePptxTemplateApi, updatePresentationTemplateApi, updateProposalTemplateApi, updateReportTemplateApi, uploadPptxTemplateFileApi } from '@/services/templates/template-service';
export { createUserApi, deleteUserApi, fetchAdminsApi, fetchUserProfileApi, fetchUsersApi, sendPasswordResetEmailApi, updateUserApi } from '@/services/users/user-service';

// دوال مساعدة للخدمات القديمة
export { generateProjectPlanApi, summarizeProposalForPlanApi } from '@/services/project-plan-service';

// دوال مساعدة إضافية مطلوبة - مؤقتة
export const forgotPasswordService = async (email: string) => {
    console.log('Forgot password for:', email);
    return Promise.resolve();
};
export const loginWithGoogle = async (credentials: any) => {
    console.log('Login with Google:', credentials);
    return Promise.resolve();
};
export const purchaseCreditsApi = async (data: any) => {
    console.log('Purchase credits:', data);
    return Promise.resolve();
};
export const serviceLogoutUser = async (token: string) => {
    console.log('Logout user:', token);
    return Promise.resolve();
};
export const serviceSignupUser = async (credentials: any) => {
    console.log('Signup user:', credentials);
    return Promise.resolve();
};
export const subscribeToUserProfile = async (userId: string, callback: (user: any) => void) => {
    // مؤقت - يحتاج تنفيذ منفصل مع Firebase Realtime Database
    console.log('Subscribing to user profile:', userId);
    // محاكاة callback
    setTimeout(() => {
        callback({ id: userId, name: 'User', email: 'user@example.com' });
    }, 100);
    return () => console.log('Unsubscribed from user profile');
};
export const createUserService = async (data: any, token: string) => {
    console.log('Create user service:', data, token);
    return Promise.resolve();
};
export const saveDeviceToken = async (token: string, userId: string) => {
    // مؤقت - يحتاج تنفيذ منفصل
    console.log('Saving device token:', token, 'for user:', userId);
    return Promise.resolve();
};

