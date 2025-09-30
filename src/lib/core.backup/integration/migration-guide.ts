/**
 * دليل الهجرة
 *
 * هذا الملف يحتوي على دليل شامل للهجرة من النظام القديم إلى الجديد
 * مع أمثلة عملية وتوضيحات مفصلة
 */

/**
 * دليل هجرة API Utils
 */
export const ApiUtilsMigrationGuide = {
    /**
     * هجرة withAuth
     */
    withAuth: {
        old: `
// النظام القديم
import { withAuth } from '@/lib/core/api';

export const GET = withAuth(async (request, context) => {
  // منطق API
}, { requireAdmin: true });
    `,
        new: `
// النظام الجديد
import { createApiHandler } from '@/lib/core/api/handlers';

export const GET = createApiHandler(async (request, context) => {
  // منطق API
}, {
  requireAuth: true,
  authOptions: {
    requireAdmin: true,
  },
  logging: {
    logRequests: true,
    logResponses: true,
    logErrors: true,
    logPerformance: true,
  },
});
    `,
    },

    /**
     * هجرة handleApiError
     */
    handleApiError: {
        old: `
// النظام القديم
import { handleApiError } from '@/lib/core/api';

try {
  // منطق API
} catch (error) {
  return handleApiError(error, 400);
}
    `,
        new: `
// النظام الجديد
import { handleServerError } from '@/lib/core/error-handling';

try {
  // منطق API
} catch (error) {
  return handleServerError(error, 'API Handler', 400);
}
    `,
    },

    /**
     * هجرة createApiResponse
     */
    createApiResponse: {
        old: `
// النظام القديم
import { createApiResponse } from '@/lib/core/api';

return createApiResponse({ success: true, data }, 200);
    `,
        new: `
// النظام الجديد
import { NextResponse } from 'next/server';

return NextResponse.json({ success: true, data }, { status: 200 });
    `,
    },
};

/**
 * دليل هجرة Error Utils
 */
export const ErrorUtilsMigrationGuide = {
    /**
     * هجرة handleErrorUtility
     */
    handleErrorUtility: {
        old: `
// النظام القديم
import { handleErrorUtility } from '@/lib/errorUtils';

try {
  // منطق
} catch (error) {
  handleErrorUtility(error, 'Component Name');
}
    `,
        new: `
// النظام الجديد
import { handleClientError } from '@/lib/core/error-handling';

try {
  // منطق
} catch (error) {
  handleClientError(error, 'Component Name');
}
    `,
    },
};

/**
 * دليل هجرة Cache
 */
export const CacheMigrationGuide = {
    /**
     * هجرة getFromCache
     */
    getFromCache: {
        old: `
// النظام القديم
import { getFromCache } from '@/lib/cache';

const data = getFromCache<MyType>('my-key');
    `,
        new: `
// النظام الجديد
import { getFromCache } from '@/lib/core/cache';

const data = getFromCache<MyType>('my-key');
    `,
    },

    /**
     * هجرة saveToCache
     */
    saveToCache: {
        old: `
// النظام القديم
import { saveToCache } from '@/lib/cache';

saveToCache('my-key', data);
    `,
        new: `
// النظام الجديد
import { saveToCache } from '@/lib/core/cache';

saveToCache('my-key', data);
    `,
    },

    /**
     * هجرة generateCacheKey
     */
    generateCacheKey: {
        old: `
// النظام القديم
import { generateCacheKey } from '@/lib/cache';

const key = await generateCacheKey({ userId, type });
    `,
        new: `
// النظام الجديد
import { generateCacheKey } from '@/lib/core/cache';

const key = await generateCacheKey({ userId, type });
    `,
    },
};

/**
 * دليل هجرة Query Keys
 */
export const QueryKeysMigrationGuide = {
    /**
     * هجرة userKeys
     */
    userKeys: {
        old: `
// النظام القديم
import { userKeys } from '@/lib/query-keys';

const { data } = useQuery({
  queryKey: userKeys.profile(userId),
  queryFn: () => fetchUserProfile(userId),
});
    `,
        new: `
// النظام الجديد
import { userKeys } from '@/lib/core/query-keys';

const { data } = useQuery({
  queryKey: userKeys.profile(userId),
  queryFn: () => fetchUserProfile(userId),
});
    `,
    },
};

/**
 * دليل هجرة Services
 */
export const ServicesMigrationGuide = {
    /**
     * هجرة writingToolApi
     */
    writingToolApi: {
        old: `
// النظام القديم
import { writingToolApi } from '@/lib/services/writing-tools-service';

const result = await writingToolApi('paraphrase', {
  data: { text: 'Hello world' },
  token: 'user-token',
});
    `,
        new: `
// النظام الجديد
import { apiClient } from '@/lib/core/api';

const result = await apiClient.post('/writing-tools/paraphrase', {
  text: 'Hello world',
}, {
  headers: {
    'Authorization': 'Bearer user-token',
  },
});
    `,
    },
};

/**
 * دليل هجرة Context
 */
export const ContextMigrationGuide = {
    /**
     * هجرة AuthContext
     */
    AuthContext: {
        old: `
// النظام القديم
import { useAuth } from '@/context/AuthContext';

const { user, login, logout } = useAuth();
    `,
        new: `
// النظام الجديد
import { useAuth } from '@/lib/core/auth';

const { user, login, logout } = useAuth();
    `,
    },

    /**
     * هجرة LocalizationContext
     */
    LocalizationContext: {
        old: `
// النظام القديم
import { useLocalization } from '@/context/LocalizationContext';

const { locale, setLocale, t } = useLocalization();
    `,
        new: `
// النظام الجديد
import { useLocalization } from '@/lib/core/localization';

const { locale, setLocale, t } = useLocalization();
    `,
    },
};

/**
 * دليل هجرة Utils
 */
export const UtilsMigrationGuide = {
    /**
     * هجرة cn
     */
    cn: {
        old: `
// النظام القديم
import { cn } from '@/lib/utils';

const className = cn('base-class', condition && 'conditional-class');
    `,
        new: `
// النظام الجديد
import { cn } from '@/lib/core/utils';

const className = cn('base-class', condition && 'conditional-class');
    `,
    },

    /**
     * هجرة generateRandomPassword
     */
    generateRandomPassword: {
        old: `
// النظام القديم
import { generateRandomPassword } from '@/lib/utils';

const password = generateRandomPassword(12);
    `,
        new: `
// النظام الجديد
import { generateRandomPassword } from '@/lib/core/utils';

const password = generateRandomPassword(12);
    `,
    },

    /**
     * هجرة arrayBufferToBase64
     */
    arrayBufferToBase64: {
        old: `
// النظام القديم
import { arrayBufferToBase64 } from '@/lib/utils';

const base64 = arrayBufferToBase64(buffer);
    `,
        new: `
// النظام الجديد
import { arrayBufferToBase64 } from '@/lib/core/utils';

const base64 = arrayBufferToBase64(buffer);
    `,
    },
};

/**
 * دليل هجرة شامل
 */
export const ComprehensiveMigrationGuide = {
    /**
     * خطوات الهجرة
     */
    steps: [
        '1. إنشاء نسخة احتياطية من المشروع',
        '2. تثبيت النظام الجديد',
        '3. تحديث imports الأساسية',
        '4. هجرة API routes واحدة تلو الأخرى',
        '5. هجرة components واحدة تلو الأخرى',
        '6. اختبار كل مكون بعد الهجرة',
        '7. إزالة الكود القديم',
        '8. تنظيف imports غير المستخدمة',
    ],

    /**
     * نصائح الهجرة
     */
    tips: [
        'استخدم TypeScript للتحقق من الأخطاء',
        'اختبر كل مكون بعد الهجرة',
        'احتفظ بالكود القديم مؤقتاً للرجوع إليه',
        'استخدم git branches للهجرة التدريجية',
        'وثق التغييرات في commit messages',
    ],

    /**
     * مشاكل شائعة وحلولها
     */
    commonIssues: [
        {
            problem: 'خطأ في imports',
            solution: 'تأكد من تحديث جميع imports إلى المسارات الجديدة',
        },
        {
            problem: 'خطأ في types',
            solution: 'تأكد من استيراد types من النظام الجديد',
        },
        {
            problem: 'خطأ في API calls',
            solution: 'تأكد من استخدام API client الجديد',
        },
        {
            problem: 'خطأ في error handling',
            solution: 'تأكد من استخدام error handling الجديد',
        },
    ],
};

/**
 * دليل الاختبار
 */
export const TestingGuide = {
    /**
     * اختبار API routes
     */
    apiRoutes: `
// اختبار API route
import { GET } from '@/app/api/users/[id]/route';
import { NextRequest } from 'next/server';

describe('User API Route', () => {
  it('should return user data', async () => {
    const request = new NextRequest('http://localhost:3000/api/users/123');
    const response = await GET(request, { params: { id: '123' } });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
  });
});
  `,

    /**
     * اختبار Components
     */
    components: `
// اختبار Component
import { render, screen } from '@testing-library/react';
import { UserProfile } from '@/components/UserProfile';

describe('UserProfile Component', () => {
  it('should render user information', () => {
    render(<UserProfile user={mockUser} />);

    expect(screen.getByText(mockUser.name)).toBeInTheDocument();
    expect(screen.getByText(mockUser.email)).toBeInTheDocument();
  });
});
  `,

    /**
     * اختبار Hooks
     */
    hooks: `
// اختبار Hook
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '@/lib/core/auth';

describe('useAuth Hook', () => {
  it('should handle login', async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      const response = await result.current.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(response.success).toBe(true);
    });
  });
});
  `,
};
