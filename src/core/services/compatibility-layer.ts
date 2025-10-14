/**
 * طبقة التوافق للانتقال التدريجي من النظام القديم إلى الجديد
 *
 * هذه الطبقة تسمح بالاستخدام التدريجي للنظام الجديد مع الحفاظ على النظام القديم
 */

import { adminService } from './admin-service';
import { aiService } from './ai-service';
import { analyticsService } from './analytics-service';
import { authService } from './auth-service';
import { chatService } from './chat-service';
import { paymentService } from './payment-service';
import { projectService } from './project-service';
import { teamService } from './team-service';

// أنواع البيانات للتوافق مع النظام القديم
export interface LegacyAuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: 'user' | 'admin';
  };
  token: string;
  expiresAt: string;
}

export interface LegacyUserProfile {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  credits: number;
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
}

export interface LegacyUserListResponse {
  users: LegacyUserProfile[];
  hasNextPage: boolean;
  lastVisibleId: string | null;
}

// طبقة التوافق للمصادقة
export const legacyAuthService = {
  // تسجيل الدخول بالبريد الإلكتروني
  async loginWithEmail(credentials: { email: string; password: string }) {
    const result = await authService.login(credentials);

    if (result.success) {
      return {
        success: true,
        data: result.data as LegacyAuthResponse
      };
    }

    return {
      success: false,
      error: result.error
    };
  },

  // تسجيل الدخول مع Google
  async loginWithGoogle(credentials: any) {
    const result = await authService.loginWithGoogle(credentials);

    if (result.success) {
      return {
        success: true,
        data: result.data as LegacyAuthResponse
      };
    }

    return {
      success: false,
      error: result.error
    };
  },

  // تسجيل مستخدم جديد
  async serviceSignupUser(credentials: any) {
    const result = await authService.signup(credentials);

    if (result.success) {
      return {
        success: true,
        data: result.data
      };
    }

    return {
      success: false,
      error: result.error
    };
  },

  // تسجيل الخروج
  async serviceLogoutUser(token: string) {
    const result = await authService.logout(token);

    if (result.success) {
      return {
        success: true,
        data: result.data
      };
    }

    return {
      success: false,
      error: result.error
    };
  },

  // نسيان كلمة المرور
  async forgotPasswordService(email: string) {
    const result = await authService.forgotPassword(email);

    if (result.success) {
      return {
        success: true,
        data: result.data
      };
    }

    return {
      success: false,
      error: result.error
    };
  },

  // إرسال إعادة تعيين كلمة المرور
  async sendPasswordResetEmailApi(userId: string, token: string) {
    const result = await authService.sendPasswordResetEmail(userId, token);

    if (result.success) {
      return {
        success: true,
        data: result.data
      };
    }

    return {
      success: false,
      error: result.error
    };
  },

  // شراء ائتمانات
  async purchaseCreditsApi(data: any, token: string) {
    const result = await authService.purchaseCredits(data, token);

    if (result.success) {
      return {
        success: true,
        data: result.data
      };
    }

    return {
      success: false,
      error: result.error
    };
  },

  // الاشتراك في تحديثات الملف الشخصي
  async subscribeToUserProfile(userId: string, callback: (user: any) => void) {
    return authService.subscribeToUserProfile(userId, callback);
  }
};

// طبقة التوافق لإدارة المستخدمين
export const legacyUserService = {
  // الحصول على قائمة المستخدمين
  async fetchUsersApi(token: string, params?: { limit?: number; lastVisibleId?: string }) {
    const result = await adminService.getUsers(token, {
      limit: params?.limit,
      lastVisibleId: params?.lastVisibleId
    });

    if (result.success) {
      return {
        success: true,
        data: result.data as LegacyUserListResponse
      };
    }

    return {
      success: false,
      error: result.error
    };
  },

  // الحصول على ملف المستخدم الشخصي
  async fetchUserProfileApi(userId: string, token: string) {
    const result = await adminService.getUser(userId, token);

    if (result.success) {
      return {
        success: true,
        data: result.data as LegacyUserProfile
      };
    }

    return {
      success: false,
      error: result.error
    };
  },

  // الحصول على قائمة المديرين
  async fetchAdminsApi() {
    const result = await authService.getAdmins();

    if (result.success) {
      return {
        success: true,
        data: result.data as LegacyUserProfile[]
      };
    }

    return {
      success: false,
      error: result.error
    };
  },

  // إنشاء مستخدم جديد
  async createUserApi(data: any, token: string) {
    const result = await adminService.createUser(data, token);

    if (result.success) {
      return {
        success: true,
        data: result.data
      };
    }

    return {
      success: false,
      error: result.error
    };
  },

  // تحديث مستخدم
  async updateUserApi(userId: string, data: any, token: string) {
    const result = await adminService.updateUser(userId, data, token);

    if (result.success) {
      return {
        success: true,
        data: result.data
      };
    }

    return {
      success: false,
      error: result.error
    };
  },

  // حذف مستخدم
  async deleteUserApi(userId: string, token: string) {
    const result = await adminService.deleteUser(userId, token);

    if (result.success) {
      return {
        success: true,
        data: result.data
      };
    }

    return {
      success: false,
      error: result.error
    };
  },

  // إعادة تعيين كلمة مرور المستخدم
  async resetUserPasswordApi(userId: string, token: string) {
    const result = await adminService.resetUserPassword(userId, token);

    if (result.success) {
      return {
        success: true,
        data: result.data
      };
    }

    return {
      success: false,
      error: result.error
    };
  },

  // تحديث ائتمانات المستخدم
  async updateUserCreditsApi(userId: string, credits: number, token: string) {
    const result = await adminService.updateUserCredits(userId, credits, token);

    if (result.success) {
      return {
        success: true,
        data: result.data
      };
    }

    return {
      success: false,
      error: result.error
    };
  },

  // تفعيل/إلغاء تفعيل مستخدم
  async toggleUserStatusApi(userId: string, isActive: boolean, token: string) {
    const result = await adminService.toggleUserStatus(userId, isActive, token);

    if (result.success) {
      return {
        success: true,
        data: result.data
      };
    }

    return {
      success: false,
      error: result.error
    };
  }
};

// طبقة التوافق للذكاء الاصطناعي
export const legacyAIService = {
  // أدوات الكتابة
  async writingToolApi(endpoint: string, options: { data: any; token: string }) {
    const toolName = endpoint.split('/').pop();

    if (!toolName) {
      return {
        success: false,
        error: 'Invalid tool endpoint'
      };
    }

    let result;

    switch (toolName) {
      case 'improve':
        result = await aiService.improveText(options.data, options.token);
        break;
      case 'summarize':
        result = await aiService.summarizeText(options.data, options.token);
        break;
      case 'paraphrase':
        result = await aiService.paraphraseText(options.data, options.token);
        break;
      case 'ai-detector':
        result = await aiService.detectAIContent(options.data, options.token);
        break;
      case 'fact-check':
        result = await aiService.factCheck(options.data, options.token);
        break;
      case 'plagiarism-check':
        result = await aiService.plagiarismCheck(options.data, options.token);
        break;
      case 'ai-researcher':
        result = await aiService.aiResearcher(options.data, options.token);
        break;
      case 'topic-explainer':
        result = await aiService.topicExplainer(options.data, options.token);
        break;
      default:
        return {
          success: false,
          error: `Unknown tool: ${toolName}`
        };
    }

    if (result.success) {
      return {
        success: true,
        data: result.data
      };
    }

    return {
      success: false,
      error: result.error
    };
  }
};

// طبقة التوافق للتحليلات
export const legacyAnalyticsService = {
  // الحصول على إحصائيات المستخدم
  async fetchUserStats(token: string) {
    const result = await analyticsService.getUserStats(token);

    if (result.success) {
      return {
        success: true,
        data: result.data
      };
    }

    return {
      success: false,
      error: result.error
    };
  }
};

// طبقة التوافق للمدفوعات
export const legacyPaymentService = {
  // التحقق من الدفع
  async verifyPaymentApi(variables: any, token: string) {
    const result = await paymentService.verifyPayment(variables, token);

    if (result.success) {
      return {
        success: true,
        data: result.data
      };
    }

    return {
      success: false,
      error: result.error
    };
  },

  // الحصول على معاملات المستخدم
  async fetchUserTransactionsApi(token: string) {
    const result = await paymentService.getUserTransactions(token);

    if (result.success) {
      return {
        success: true,
        data: result.data
      };
    }

    return {
      success: false,
      error: result.error
    };
  },

  // الحصول على المعاملات
  async getTransactionsApi(params: any) {
    const result = await paymentService.getTransactions(params, params.token);

    if (result.success) {
      return {
        success: true,
        data: result.data
      };
    }

    return {
      success: false,
      error: result.error
    };
  }
};

// طبقة التوافق للفرق
export const legacyTeamService = {
  // إنشاء فريق
  async createTeamApi(data: { name: string }, token: string) {
    const result = await teamService.createTeam(data, token);

    if (result.success) {
      return {
        success: true,
        data: result.data
      };
    }

    return {
      success: false,
      error: result.error
    };
  },

  // دعوة عضو
  async inviteMemberApi(data: { teamId: string; email: string }, token: string) {
    const result = await teamService.inviteMember(data.teamId, {
      email: data.email,
      role: 'member'
    }, token);

    if (result.success) {
      return {
        success: true,
        data: result.data
      };
    }

    return {
      success: false,
      error: result.error
    };
  }
};

// طبقة التوافق للمشاريع
export const legacyProjectService = {
  // الحصول على المشاريع
  async fetchProjectsApi(token: string) {
    const result = await projectService.getProjects(token);

    if (result.success) {
      return {
        success: true,
        data: result.data
      };
    }

    return {
      success: false,
      error: result.error
    };
  }
};

// طبقة التوافق للدردشة
export const legacyChatService = {
  // إنشاء محادثة
  async createConversationApi(data: any, token: string) {
    const result = await chatService.createConversation(data, token);

    if (result.success) {
      return {
        success: true,
        data: result.data
      };
    }

    return {
      success: false,
      error: result.error
    };
  }
};

// طبقة التوافق للأقسام
export const legacySectionService = {
  // الحصول على الأقسام
  async fetchSectionsApi(token: string) {
    const result = await adminService.getSections(token);

    if (result.success) {
      return {
        success: true,
        data: result.data
      };
    }

    return {
      success: false,
      error: result.error
    };
  },

  // إنشاء قسم
  async createSectionApi(data: any, token: string) {
    const result = await adminService.createSection(data, token);

    if (result.success) {
      return {
        success: true,
        data: result.data
      };
    }

    return {
      success: false,
      error: result.error
    };
  },

  // تحديث قسم
  async updateSectionApi(sectionId: string, data: any, token: string) {
    const result = await adminService.updateSection(sectionId, data, token);

    if (result.success) {
      return {
        success: true,
        data: result.data
      };
    }

    return {
      success: false,
      error: result.error
    };
  },

  // حذف قسم
  async deleteSectionApi(sectionId: string, token: string) {
    const result = await adminService.deleteSection(sectionId, token);

    if (result.success) {
      return {
        success: true,
        data: result.data
      };
    }

    return {
      success: false,
      error: result.error
    };
  }
};

// تصدير جميع خدمات التوافق
export const legacyServices = {
  auth: legacyAuthService,
  user: legacyUserService,
  ai: legacyAIService,
  analytics: legacyAnalyticsService,
  payment: legacyPaymentService,
  team: legacyTeamService,
  project: legacyProjectService,
  chat: legacyChatService,
  section: legacySectionService
};
