# أمثلة على استخدام قواعد المستخدم

## نظرة عامة
هذا الملف يحتوي على أمثلة عملية لكيفية استخدام قواعد المستخدم مع وكيل Cursor في مشروع Arkan.

## أمثلة على أسلوب التواصل

### مثال 1: طلب إنشاء مكون
```
أنشئ مكون UserProfile مع تطبيق قواعد المستخدم:
- استخدم TypeScript interfaces للـ props
- أضف JSDoc للدوال العامة
- استخدم meaningful names
- اتبع أنماط التسمية المحددة
- أضف error handling شامل
```

**الرد المتوقع:**
```
## خلاصة سريعة
سأقوم بإنشاء مكون UserProfile مع تطبيق جميع قواعد المستخدم المحددة.

## التفاصيل التقنية
```typescript
/**
 * Props للمكون UserProfile
 */
interface UserProfileProps {
  /** بيانات المستخدم */
  user: User;
  /** دالة تحديث المستخدم */
  onUpdate: (user: User) => void;
  /** دالة حذف المستخدم */
  onDelete: (userId: string) => void;
  /** نوع العرض */
  variant?: 'card' | 'list';
  /** حالة التحميل */
  isLoading?: boolean;
}

/**
 * مكون عرض ملف المستخدم
 * @param props - خصائص المكون
 * @returns JSX.Element
 */
export const UserProfile: React.FC<UserProfileProps> = ({
  user,
  onUpdate,
  onDelete,
  variant = 'card',
  isLoading = false
}) => {
  // منطق المكون
  return (
    <div className="user-profile">
      {/* محتوى المكون */}
    </div>
  );
};
```

## البدائل
يمكن استخدام مكونات Radix UI أو إنشاء مكون مخصص.

## الخطوات التالية
1. إضافة اختبارات للمكون
2. إضافة التوثيق
3. تطبيق التصميم
```

### مثال 2: طلب إصلاح خطأ
```
أصلح الخطأ في مكون UserProfile مع تطبيق قواعد المستخدم
```

**الرد المتوقع:**
```
## خلاصة سريعة
تم تحديد الخطأ في مكون UserProfile وسأقوم بإصلاحه مع تطبيق قواعد المستخدم.

## سبب الخطأ
الخطأ يحدث بسبب عدم التحقق من وجود البيانات قبل عرضها.

## الحل
```typescript
// قبل الإصلاح
return (
  <div className="user-profile">
    <h1>{user.name}</h1>
    <p>{user.email}</p>
  </div>
);

// بعد الإصلاح
return (
  <div className="user-profile">
    {user ? (
      <>
        <h1>{user.name}</h1>
        <p>{user.email}</p>
      </>
    ) : (
      <div className="loading">جاري التحميل...</div>
    )}
  </div>
);
```

## كيفية منع تكرار الخطأ
1. إضافة التحقق من البيانات
2. إضافة error boundaries
3. إضافة loading states
4. كتابة اختبارات للحالات الحدية

## اختبار الإصلاح
```typescript
describe('UserProfile', () => {
  test('handles missing user data', () => {
    render(<UserProfile user={null} onUpdate={() => {}} onDelete={() => {}} />);
    expect(screen.getByText('جاري التحميل...')).toBeInTheDocument();
  });
});
```
```

## أمثلة على قواعد الترميز

### مثال 1: إنشاء Hook مخصص
```
أنشئ hook useUserData مع تطبيق قواعد الترميز
```

**الكود المتوقع:**
```typescript
/**
 * خيارات hook useUserData
 */
interface UseUserDataOptions {
  /** معرف المستخدم */
  userId: string;
  /** تحديث تلقائي للبيانات */
  autoRefresh?: boolean;
  /** فترة التحديث بالميلي ثانية */
  refreshInterval?: number;
}

/**
 * نتيجة hook useUserData
 */
interface UseUserDataResult {
  /** بيانات المستخدم */
  user: User | null;
  /** حالة التحميل */
  isLoading: boolean;
  /** خطأ إذا وقع */
  error: Error | null;
  /** دالة تحديث البيانات */
  refresh: () => void;
  /** دالة تحديث المستخدم */
  updateUser: (userData: Partial<User>) => Promise<void>;
}

/**
 * Hook لإدارة بيانات المستخدم
 * @param options - خيارات الـ hook
 * @returns UseUserDataResult
 * @example
 * ```typescript
 * const { user, isLoading, error, refresh } = useUserData({
 *   userId: '123',
 *   autoRefresh: true
 * });
 * ```
 */
export const useUserData = (options: UseUserDataOptions): UseUserDataResult => {
  // تنفيذ الـ hook
};
```

### مثال 2: إنشاء خدمة API
```
أنشئ خدمة UserService مع تطبيق قواعد الترميز
```

**الكود المتوقع:**
```typescript
/**
 * خيارات إنشاء مستخدم جديد
 */
interface CreateUserOptions {
  /** بيانات المستخدم */
  userData: CreateUserData;
  /** خيارات إضافية */
  options?: {
    /** إرسال إيميل ترحيب */
    sendWelcomeEmail?: boolean;
    /** تفعيل الحساب */
    activateAccount?: boolean;
  };
}

/**
 * خدمة إدارة المستخدمين
 */
export class UserService {
  /**
   * إنشاء مستخدم جديد
   * @param options - خيارات إنشاء المستخدم
   * @returns Promise<User> - المستخدم المنشأ
   * @throws {ValidationError} عند فشل التحقق من صحة البيانات
   * @throws {NetworkError} عند فشل الاتصال
   * @example
   * ```typescript
   * const user = await UserService.createUser({
   *   userData: { name: 'أحمد', email: 'ahmed@example.com' },
   *   options: { sendWelcomeEmail: true }
   * });
   * ```
   */
  static async createUser(options: CreateUserOptions): Promise<User> {
    // تنفيذ الدالة
  }
}
```

## أمثلة على قواعد الذكاء الاصطناعي

### مثال 1: تطوير AI Flow
```
طور AI flow لإنشاء تقرير ذكي مع تطبيق قواعد الذكاء الاصطناعي
```

**الكود المتوقع:**
```typescript
/**
 * خيارات إنشاء التقرير الذكي
 */
interface IntelligentReportOptions {
  /** نوع التقرير */
  reportType: 'academic' | 'business' | 'technical';
  /** مستوى التفصيل */
  detailLevel: 'basic' | 'intermediate' | 'advanced';
  /** الجمهور المستهدف */
  targetAudience: string;
  /** السياق الإضافي */
  context?: string;
}

/**
 * تدفق إنشاء التقرير الذكي
 * يستخدم النظام الذكي المحسن لتحليل السياق واختيار النموذج المناسب
 */
export const intelligentReportFlow = defineFlow({
  name: 'intelligentReport',
  inputSchema: z.object({
    topic: z.string(),
    options: z.object({
      reportType: z.enum(['academic', 'business', 'technical']),
      detailLevel: z.enum(['basic', 'intermediate', 'advanced']),
      targetAudience: z.string(),
      context: z.string().optional()
    })
  }),
  outputSchema: z.object({
    report: z.string(),
    quality: z.number(),
    suggestions: z.array(z.string())
  })
}, async (input) => {
  // تحليل السياق الذكي
  const contextAnalysis = await analyzeContext(input);

  // اختيار النموذج التكيفي
  const model = await selectAdaptiveModel(contextAnalysis);

  // بناء المحفز الذكي
  const prompt = await buildIntelligentPrompt(input, contextAnalysis);

  // تنفيذ التدفق
  const result = await model.generate(prompt);

  // التحقق من الجودة
  const quality = await validateOutputQuality(result);

  return {
    report: result,
    quality,
    suggestions: await generateSuggestions(result, quality)
  };
});
```

## أمثلة على قواعد الأمان

### مثال 1: التحقق من صحة البيانات
```
أضف التحقق من صحة البيانات لمكون UserProfile
```

**الكود المتوقع:**
```typescript
import { z } from 'zod';

/**
 * مخطط التحقق من صحة بيانات المستخدم
 */
const UserSchema = z.object({
  id: z.string().uuid('معرف المستخدم غير صحيح'),
  name: z.string().min(2, 'الاسم يجب أن يكون على الأقل حرفين'),
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  age: z.number().min(18, 'العمر يجب أن يكون 18 أو أكثر').optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'رقم الهاتف غير صحيح').optional()
});

/**
 * مكون UserProfile مع التحقق من صحة البيانات
 */
export const UserProfile: React.FC<UserProfileProps> = ({ user, onUpdate }) => {
  const handleUpdate = async (userData: unknown) => {
    try {
      // التحقق من صحة البيانات
      const validatedData = UserSchema.parse(userData);

      // تحديث المستخدم
      await onUpdate(validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        // معالجة أخطاء التحقق
        console.error('خطأ في التحقق من صحة البيانات:', error.errors);
      }
    }
  };

  return (
    <div className="user-profile">
      {/* محتوى المكون */}
    </div>
  );
};
```

## أمثلة على قواعد الأداء

### مثال 1: تحسين الأداء
```
حسن أداء مكون UserProfile مع تطبيق قواعد الأداء
```

**الكود المتوقع:**
```typescript
import React, { memo, useMemo, useCallback } from 'react';

/**
 * مكون UserProfile محسن للأداء
 */
export const UserProfile = memo<UserProfileProps>(({
  user,
  onUpdate,
  onDelete,
  variant = 'card',
  isLoading = false
}) => {
  // تحسين الدوال باستخدام useCallback
  const handleUpdate = useCallback((userData: Partial<User>) => {
    onUpdate({ ...user, ...userData });
  }, [user, onUpdate]);

  const handleDelete = useCallback(() => {
    onDelete(user.id);
  }, [user.id, onDelete]);

  // تحسين الحسابات باستخدام useMemo
  const userDisplayName = useMemo(() => {
    return user ? `${user.firstName} ${user.lastName}` : '';
  }, [user]);

  const userInitials = useMemo(() => {
    if (!user) return '';
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  }, [user]);

  // تحسين التصميم باستخدام useMemo
  const containerClasses = useMemo(() => {
    const baseClasses = 'user-profile';
    const variantClasses = variant === 'card' ? 'user-profile--card' : 'user-profile--list';
    const loadingClasses = isLoading ? 'user-profile--loading' : '';

    return `${baseClasses} ${variantClasses} ${loadingClasses}`.trim();
  }, [variant, isLoading]);

  if (isLoading) {
    return <UserProfileSkeleton />;
  }

  return (
    <div className={containerClasses}>
      {/* محتوى المكون المحسن */}
    </div>
  );
});

UserProfile.displayName = 'UserProfile';
```

## أمثلة على قواعد الاختبار

### مثال 1: اختبارات شاملة
```
اكتب اختبارات شاملة لمكون UserProfile
```

**الكود المتوقع:**
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserProfile } from '../UserProfile';

describe('UserProfile', () => {
  const mockUser = {
    id: '1',
    firstName: 'أحمد',
    lastName: 'محمد',
    email: 'ahmed@example.com'
  };

  const mockOnUpdate = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders user information correctly', () => {
      render(
        <UserProfile
          user={mockUser}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('أحمد محمد')).toBeInTheDocument();
      expect(screen.getByText('ahmed@example.com')).toBeInTheDocument();
    });

    test('renders loading state when isLoading is true', () => {
      render(
        <UserProfile
          user={mockUser}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          isLoading={true}
        />
      );

      expect(screen.getByTestId('user-profile-skeleton')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    test('calls onUpdate when edit button is clicked', async () => {
      render(
        <UserProfile
          user={mockUser}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      const editButton = screen.getByRole('button', { name: /تعديل/i });
      fireEvent.click(editButton);

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith(mockUser);
      });
    });

    test('calls onDelete when delete button is clicked', async () => {
      render(
        <UserProfile
          user={mockUser}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      const deleteButton = screen.getByRole('button', { name: /حذف/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(mockOnDelete).toHaveBeenCalledWith(mockUser.id);
      });
    });
  });

  describe('Error Handling', () => {
    test('handles missing user data gracefully', () => {
      render(
        <UserProfile
          user={null}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('لا توجد بيانات مستخدم')).toBeInTheDocument();
    });
  });
});
```

## الخلاصة

هذه الأمثلة توضح كيفية تطبيق قواعد المستخدم في الممارسة العملية. استخدمها كمرجع عند العمل مع وكيل Cursor في مشروع Arkan.
