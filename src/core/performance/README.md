# نظام الأداء والتحسينات

## نظرة عامة

نظام الأداء والتحسينات هو نظام شامل ومتطور يوفر جميع الأدوات اللازمة لتحسين أداء التطبيق ومراقبة المقاييس المختلفة.

## الميزات الرئيسية

### 📊 تحليل الحزم
- **تحليل حجم الحزم**: قياس حجم الحزم المضغوطة وغير المضغوطة
- **تحليل الملفات**: تحديد أكبر الملفات والملفات المكررة
- **تحليل الاستيرادات**: فحص الاستيرادات غير المستخدمة
- **اقتراحات التحسين**: توصيات لتحسين حجم الحزمة

### ⚡ مراقبة الأداء
- **قياس المقاييس**: قياس FCP, LCP, FID, CLS
- **مراقبة الذاكرة**: تتبع استخدام الذاكرة
- **قياس الدوال**: قياس وقت تنفيذ الدوال
- **مراقبة الأخطاء**: تتبع الأخطاء والأداء

### 🚀 تحسين Cache
- **Cache ذكي**: نظام cache متقدم مع TTL
- **ضغط البيانات**: ضغط البيانات لتوفير المساحة
- **تشفير البيانات**: تشفير البيانات الحساسة
- **استراتيجيات الإزالة**: LRU, LFU, FIFO, TTL
- **إحصائيات مفصلة**: مقاييس شاملة للـ cache

### 🌐 تحسين API
- **Deduplication**: منع الطلبات المكررة
- **Batching**: تجميع الطلبات المتعددة
- **Retry Logic**: إعادة المحاولة الذكية
- **Timeout Management**: إدارة timeout
- **Performance Tracking**: تتبع أداء API

### 📈 Analytics وMonitoring
- **تتبع الأحداث**: تتبع جميع الأحداث المهمة
- **مقاييس المستخدم**: إحصائيات مفصلة لكل مستخدم
- **مقاييس التطبيق**: إحصائيات شاملة للتطبيق
- **تصدير البيانات**: تصدير البيانات للتحليل
- **تقارير مفصلة**: تقارير شاملة ومفصلة

## الاستخدام

### تحليل الحزم

```typescript
import { BundleAnalyzer } from '@/core/performance';

// تحليل مجموعة من الملفات
const files = [
  { name: 'app.js', size: 500000, content: '...' },
  { name: 'vendor.js', size: 800000, content: '...' },
];

const stats = BundleAnalyzer.analyzeBundle(files);
console.log('Bundle Size:', stats.totalSize);
console.log('Gzipped Size:', stats.gzippedSize);

// الحصول على اقتراحات التحسين
const suggestions = BundleAnalyzer.getOptimizationSuggestions(stats);
console.log('Suggestions:', suggestions);

// إنشاء تقرير مفصل
const report = BundleAnalyzer.generateReport(stats);
console.log(report);
```

### مراقبة الأداء

```typescript
import { PerformanceMonitor } from '@/core/performance';

// بدء المراقبة التلقائية
PerformanceMonitor.startAutoMonitoring();

// قياس دالة
const result = PerformanceMonitor.measureFunction('myFunction', () => {
  // منطق الدالة
  return 'result';
});

// قياس دالة غير متزامنة
const asyncResult = await PerformanceMonitor.measureAsyncFunction('myAsyncFunction', async () => {
  // منطق الدالة
  return 'async result';
});

// الحصول على المقاييس
const metrics = PerformanceMonitor.getMetrics();
console.log('Page Load Time:', metrics.pageLoadTime);
console.log('Memory Usage:', metrics.memoryUsage);
```

### تحسين Cache

```typescript
import { CacheOptimizer } from '@/core/performance';

// حفظ البيانات في cache
await CacheOptimizer.set('user:123', userData, {
  ttl: 3600000, // 1 ساعة
  compress: true,
  encrypt: true,
  encryptionKey: 'secret-key',
});

// الحصول على البيانات من cache
const userData = await CacheOptimizer.get('user:123');

// الحصول على إحصائيات cache
const stats = CacheOptimizer.getStats();
console.log('Hit Rate:', stats.hitRate);
console.log('Total Size:', stats.totalSize);

// تحسين cache
CacheOptimizer.optimize();
```

### تحسين API

```typescript
import { ApiOptimizer } from '@/core/performance';

// طلب API محسن
const data = await ApiOptimizer.request('/api/users', 'GET', null, null, {
  useCache: true,
  cacheTtl: 300000, // 5 دقائق
  useDeduplication: true,
  retryCount: 3,
});

// طلبات متعددة في batch
const results = await ApiOptimizer.batchRequest([
  { url: '/api/users/1' },
  { url: '/api/users/2' },
  { url: '/api/users/3' },
], {
  useBatching: true,
  batchDelay: 100,
  maxBatchSize: 10,
});

// الحصول على إحصائيات
const stats = ApiOptimizer.getStats();
console.log('Pending Requests:', stats.pendingRequests);
console.log('Active Batches:', stats.activeBatches);
```

### Analytics

```typescript
import { Analytics } from '@/core/performance';

// تعيين معرف المستخدم
Analytics.setUserId('user-123');

// تتبع عرض الصفحة
Analytics.trackPageView('/dashboard', {
  category: 'navigation',
  section: 'main',
});

// تتبع إجراء المستخدم
Analytics.trackUserAction('button_click', {
  button: 'save',
  form: 'user-profile',
});

// تتبع استدعاء API
Analytics.trackApiCall('/api/users', 'GET', 150, true, 200);

// تتبع خطأ
Analytics.trackError(new Error('Something went wrong'), 'user-action');

// تتبع أداء
Analytics.trackPerformance('page_load_time', 1200);

// تتبع حدث مخصص
Analytics.trackCustom('feature_used', {
  feature: 'export',
  format: 'pdf',
});

// الحصول على مقاييس المستخدم
const userMetrics = Analytics.getUserMetrics('user-123');
console.log('User Actions:', userMetrics?.actions);

// الحصول على مقاييس التطبيق
const appMetrics = Analytics.getAppMetrics();
console.log('Active Users:', appMetrics.activeUsers);
console.log('Error Rate:', appMetrics.errorRate);
```

## التكامل مع النظام الأساسي

### في API Routes

```typescript
import { ApiOptimizer, PerformanceMonitor } from '@/core/performance';

export async function GET(request: NextRequest) {
  const startTime = performance.now();

  try {
    // استخدام API Optimizer
    const data = await ApiOptimizer.request('/api/external-service', 'GET');

    // تسجيل الأداء
    PerformanceMonitor.measureApiCall(
      '/api/external-service',
      'GET',
      startTime,
      performance.now(),
      true
    );

    return NextResponse.json(data);
  } catch (error) {
    PerformanceMonitor.measureApiCall(
      '/api/external-service',
      'GET',
      startTime,
      performance.now(),
      false
    );

    throw error;
  }
}
```

### في React Components

```typescript
import { Analytics, PerformanceMonitor } from '@/core/performance';

function MyComponent() {
  useEffect(() => {
    // تتبع عرض الصفحة
    Analytics.trackPageView('/my-page');

    // قياس وقت تحميل المكون
    PerformanceMonitor.measureFunction('component-mount', () => {
      // منطق تحميل المكون
    });
  }, []);

  const handleClick = () => {
    // تتبع إجراء المستخدم
    Analytics.trackUserAction('button_click', {
      component: 'MyComponent',
      button: 'submit',
    });
  };

  return <button onClick={handleClick}>Click me</button>;
}
```

## الإعدادات

### متغيرات البيئة

```env
# تفعيل/إلغاء تفعيل Analytics
NEXT_PUBLIC_ANALYTICS_ENABLED=true

# URL خدمة التحليلات
NEXT_PUBLIC_ANALYTICS_URL=https://analytics.example.com

# مفتاح API للتحليلات
NEXT_PUBLIC_ANALYTICS_API_KEY=your-api-key

# تفعيل/إلغاء تفعيل مراقبة الأداء
NEXT_PUBLIC_PERFORMANCE_MONITORING_ENABLED=true

# URL خدمة مراقبة الأداء
NEXT_PUBLIC_PERFORMANCE_MONITORING_URL=https://monitoring.example.com
```

### إعدادات Cache

```typescript
// إعدادات Cache الافتراضية
const cacheConfig = {
  ttl: 24 * 60 * 60 * 1000, // 24 ساعة
  maxSize: 100 * 1024 * 1024, // 100MB
  compress: true,
  encrypt: false,
  evictionPolicy: 'lru',
};
```

## المراقبة والتحليل

### لوحة التحكم

```typescript
// الحصول على جميع المقاييس
const performanceMetrics = PerformanceMonitor.getMetrics();
const cacheStats = CacheOptimizer.getStats();
const apiStats = ApiOptimizer.getStats();
const appMetrics = Analytics.getAppMetrics();

// إنشاء تقرير شامل
const report = {
  performance: performanceMetrics,
  cache: cacheStats,
  api: apiStats,
  analytics: appMetrics,
  timestamp: new Date().toISOString(),
};

console.log('Comprehensive Report:', report);
```

### تصدير البيانات

```typescript
// تصدير جميع البيانات
const allData = {
  performance: PerformanceMonitor.exportData(),
  cache: CacheOptimizer.exportCache(),
  api: ApiOptimizer.exportData(),
  analytics: Analytics.exportData(),
};

// حفظ البيانات
localStorage.setItem('performance-data', JSON.stringify(allData));
```

## أفضل الممارسات

### 1. تحسين الحزم
- استخدم dynamic imports للكود غير الضروري
- قم بإزالة الكود غير المستخدم
- استخدم tree shaking
- قم بتحسين الصور والأصول

### 2. تحسين Cache
- استخدم TTL مناسب للبيانات
- قم بضغط البيانات الكبيرة
- استخدم استراتيجية إزالة مناسبة
- راقب إحصائيات cache بانتظام

### 3. تحسين API
- استخدم deduplication للطلبات المكررة
- استخدم batching للطلبات المتعددة
- قم بإعداد retry logic مناسب
- راقب أداء API بانتظام

### 4. تحسين Analytics
- تتبع الأحداث المهمة فقط
- استخدم خصائص مفيدة
- راقب مقاييس المستخدم
- قم بتحليل البيانات بانتظام

## الدعم والمساهمة

للحصول على الدعم أو الإبلاغ عن مشاكل، يرجى فتح issue في المستودع أو التواصل مع فريق التطوير.

---

**ملاحظة**: هذا النظام مصمم ليكون مرناً وقابلاً للتوسع. يمكن تخصيصه وتطويره حسب احتياجات المشروع.
