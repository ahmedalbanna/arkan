# اختبارات نظام Validation

## نظرة عامة

هذا المجلد يحتوي على اختبارات شاملة لنظام Validation الموحد، تغطي جميع الوظائف الأساسية، edge cases، اختبارات الأداء، والتكامل مع المكونات الأخرى.

## هيكل الاختبارات

```
__tests__/
├── setup.ts                    # إعدادات الاختبار المشتركة
├── jest.config.js             # تكوين Jest
├── unified-validator.test.ts   # اختبارات UnifiedValidator
├── error-formatter.test.ts     # اختبارات ValidationErrorFormatter
├── validators.test.ts          # اختبارات Validators المتخصصة
├── performance.test.ts         # اختبارات الأداء والتحميل
└── integration.test.ts         # اختبارات التكامل
```

## أنواع الاختبارات

### 1. اختبارات الوحدة (Unit Tests)

#### unified-validator.test.ts
- اختبارات التحقق من الصحة الأساسية
- اختبارات edge cases
- اختبارات خيارات التحقق من الصحة
- اختبارات التحقق الجزئي
- اختبارات التحويل
- اختبارات التكامل مع Error Handling
- اختبارات الأداء
- اختبارات إدارة الذاكرة
- اختبارات الاستعادة من الأخطاء
- اختبارات التكامل

#### error-formatter.test.ts
- اختبارات تنسيق الأخطاء
- اختبارات تنسيق التحذيرات
- اختبارات الرسائل العربية
- اختبارات ترجمة أسماء الحقول
- اختبارات mapping شدة الأخطاء
- اختبارات edge cases
- اختبارات الأداء

#### validators.test.ts
- اختبارات StringValidators
- اختبارات NumberValidators
- اختبارات DateValidators
- اختبارات BooleanValidators
- اختبارات ArrayValidators
- اختبارات ObjectValidators
- اختبارات UserValidators
- اختبارات BusinessValidators
- اختبارات ContentValidators
- اختبارات FileValidators
- اختبارات FormValidators
- اختبارات AdvancedValidators
- اختبارات edge cases والأداء

### 2. اختبارات الأداء (Performance Tests)

#### performance.test.ts
- اختبارات التحقق من الصحة الأساسية
- اختبارات التحقق من الصحة المعقدة
- اختبارات التحقق من الصحة المتزامنة
- اختبارات إدارة الذاكرة
- اختبارات الضغط
- اختبارات التحميل العالي

### 3. اختبارات التكامل (Integration Tests)

#### integration.test.ts
- اختبارات السيناريوهات الواقعية
- اختبارات التكامل مع Error Handling
- اختبارات تكامل النماذج
- اختبارات تكامل API
- اختبارات تكامل قاعدة البيانات
- اختبارات الاستعادة والاحتياطي
- اختبارات الأداء المتكاملة

## تشغيل الاختبارات

### تشغيل جميع الاختبارات
```bash
npm test
```

### تشغيل اختبارات محددة
```bash
# اختبارات الوحدة
npm test -- unified-validator.test.ts

# اختبارات الأداء
npm test -- performance.test.ts

# اختبارات التكامل
npm test -- integration.test.ts
```

### تشغيل اختبارات مع التغطية
```bash
npm test -- --coverage
```

### تشغيل اختبارات الأداء فقط
```bash
npm test -- --testNamePattern="Performance"
```

## إعدادات الاختبار

### تكوين Jest
- **testEnvironment**: node
- **testTimeout**: 30 seconds
- **maxWorkers**: 50%
- **coverageThreshold**: 80% عام، 90% لـ validation

### إعدادات الأداء
- **maxDuration**: 30 seconds
- **maxMemoryUsage**: 100MB
- **maxIterations**: 10,000

### إعدادات البيانات
- **maxStringLength**: 10,000
- **maxArrayLength**: 1,000
- **maxObjectDepth**: 10

## البيانات الواقعية للاختبار

### بيانات المستخدم
```typescript
const userRegistration = {
    name: 'أحمد محمد علي',
    email: 'ahmed.mohamed@example.com',
    password: 'StrongPassword123!',
    confirmPassword: 'StrongPassword123!',
    phone: '+966501234567',
    dateOfBirth: new Date('1990-01-01'),
    gender: 'male',
    country: 'SA',
    city: 'الرياض',
    termsAccepted: true,
    newsletterSubscription: false
};
```

### بيانات المنتج
```typescript
const product = {
    name: 'جهاز كمبيوتر محمول',
    description: 'جهاز كمبيوتر محمول عالي الأداء',
    price: 2500.99,
    currency: 'SAR',
    category: 'Electronics',
    subcategory: 'Laptops',
    brand: 'Dell',
    model: 'XPS 13',
    sku: 'DELL-XPS13-001',
    stock: 50,
    weight: 1.3,
    dimensions: {
        length: 30.5,
        width: 20.3,
        height: 1.5
    },
    images: [
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg'
    ],
    tags: ['laptop', 'dell', 'xps', 'premium'],
    specifications: {
        processor: 'Intel Core i7',
        memory: '16GB RAM',
        storage: '512GB SSD',
        display: '13.3 inch'
    },
    isActive: true,
    isFeatured: false,
    seoTitle: 'جهاز كمبيوتر محمول Dell XPS 13',
    seoDescription: 'جهاز كمبيوتر محمول عالي الأداء من Dell'
};
```

### بيانات طلب AI
```typescript
const aiRequest = {
    prompt: 'اكتب مقالاً عن الذكاء الاصطناعي وتطبيقاته في الطب',
    model: 'gemini-pro',
    temperature: 0.7,
    maxTokens: 2000,
    topP: 0.9,
    frequencyPenalty: 0.1,
    presencePenalty: 0.1,
    context: [
        'الذكاء الاصطناعي',
        'الطب',
        'التشخيص الطبي',
        'العلاج الشخصي'
    ],
    userPreferences: {
        language: 'ar',
        tone: 'professional',
        length: 'medium',
        style: 'academic'
    },
    metadata: {
        userId: 'user123',
        sessionId: 'session456',
        requestId: 'req789',
        timestamp: new Date(),
        source: 'web-app'
    }
};
```

## اختبارات Edge Cases

### القيم الفارغة
- `null` values
- `undefined` values
- Empty strings
- Empty objects
- Empty arrays

### البيانات الكبيرة
- Large strings (1MB+)
- Deeply nested objects
- Large arrays (10,000+ items)
- Complex schemas

### البيانات الخاصة
- Unicode characters
- Special characters
- Circular references
- Invalid types

## اختبارات الأداء

### حدود الأداء
- **maxValidationTime**: 1 second
- **maxMemoryUsage**: 50MB
- **maxConcurrentValidations**: 100

### اختبارات الضغط
- High-frequency validations
- Large dataset processing
- Concurrent operations
- Memory stress tests

## اختبارات التكامل

### تكامل Error Handling
- EnhancedErrorHandler integration
- ErrorMonitoringService integration
- Error recovery mechanisms
- Fallback strategies

### تكامل النماذج
- Multi-step form validation
- Conditional field validation
- Real-time validation
- Form state management

### تكامل API
- Request validation
- Response validation
- Error handling
- Performance monitoring

## إعدادات Mock

### EnhancedErrorHandler
```typescript
const mockEnhancedErrorHandler = {
    handleWithRetry: jest.fn().mockResolvedValue({
        success: true,
        error: null
    })
};
```

### ErrorMonitoringService
```typescript
const mockErrorMonitoringService = {
    getInstance: jest.fn().mockReturnValue({
        logError: jest.fn(),
        logWarning: jest.fn(),
        logInfo: jest.fn()
    })
};
```

## دوال مساعدة

### إنشاء بيانات اختبار
```typescript
const testData = testHelpers.generateTestData('user', 100);
```

### قياس الأداء
```typescript
const performance = await testHelpers.measurePerformance(
    () => validateData(schema, data),
    1000
);
```

### إنشاء أخطاء اختبار
```typescript
const error = testHelpers.createTestError('validation');
const warning = testHelpers.createTestWarning('empty_field');
```

## التغطية المستهدفة

### التغطية العامة
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

### تغطية Validation
- **Branches**: 90%
- **Functions**: 90%
- **Lines**: 90%
- **Statements**: 90%

## أفضل الممارسات

### كتابة الاختبارات
1. استخدام أسماء وصفية للاختبارات
2. تجميع الاختبارات المتعلقة
3. اختبار edge cases
4. اختبار السيناريوهات السلبية
5. استخدام بيانات واقعية

### إدارة الأداء
1. مراقبة استخدام الذاكرة
2. اختبار الأداء بانتظام
3. تحسين الاختبارات البطيئة
4. استخدام اختبارات متوازية

### إدارة الأخطاء
1. اختبار جميع مسارات الأخطاء
2. اختبار آليات الاستعادة
3. اختبار الرسائل المخصصة
4. اختبار التكامل مع أنظمة المراقبة

## استكشاف الأخطاء

### مشاكل الأداء
- زيادة timeout للاختبارات
- تقليل عدد التكرارات
- تحسين استخدام الذاكرة
- استخدام اختبارات متوازية

### مشاكل التكامل
- التحقق من إعدادات Mock
- مراجعة dependencies
- اختبار الاتصالات الخارجية
- التحقق من إعدادات البيئة

### مشاكل التغطية
- إضافة اختبارات للحالات المفقودة
- اختبار edge cases
- اختبار مسارات الأخطاء
- اختبار السيناريوهات المتقدمة

## التطوير المستمر

### إضافة اختبارات جديدة
1. تحديد الوظيفة المراد اختبارها
2. كتابة اختبارات الوحدة
3. إضافة اختبارات التكامل
4. اختبار الأداء
5. تحديث التوثيق

### تحسين الاختبارات الموجودة
1. مراجعة التغطية
2. تحسين الأداء
3. إضافة edge cases
4. تحسين البيانات الواقعية
5. تحديث Mock configurations

---

**ملاحظة**: هذه الاختبارات مصممة لضمان جودة وموثوقية نظام Validation. يُنصح بتشغيلها بانتظام أثناء التطوير وقبل النشر.
