# 🚀 دليل تحسين الأداء المتقدم

## نظرة عامة

تم تطوير نظام شامل لتحسين الأداء في `src/core` يتضمن:

- **Code Splitting الذكي** - تحميل ديناميكي للمكونات
- **Memory Management** - إدارة ذكية للذاكرة
- **Performance Monitoring** - مراقبة شاملة للأداء
- **Bundle Optimization** - تحسين حجم الحزم

## 🧩 Code Splitting الذكي

### الميزات الرئيسية

- **Lazy Loading** مع retry logic
- **Preloading** و **Prefetching**
- **Caching** للمكونات المحملة
- **Error Boundaries** مخصصة
- **Loading States** محسنة

### الاستخدام الأساسي

```typescript
import { createLazyComponent } from '@/core';

// إنشاء lazy component
const HeavyComponent = createLazyComponent(
  () => import('./HeavyComponent'),
  'HeavyComponent',
  {
    preload: true,      // تحميل مسبق
    prefetch: true,     // جلب مسبق
    cache: true,        // حفظ في الذاكرة
    retryCount: 3,      // عدد المحاولات
    timeout: 10000      // مهلة زمنية
  }
);

// استخدام المكون
function App() {
  return (
    <div>
      <HeavyComponent />
    </div>
  );
}
```

### Dynamic Module Loading

```typescript
import { DynamicModuleLoader } from '@/core';

// تحميل module ديناميكياً
const loadChartLibrary = async () => {
  const chartModule = await DynamicModuleLoader.loadModule(
    '@/lib/chart-library',
    { cache: true, retry: 3 }
  );
  return chartModule;
};

// تحميل مسبق لعدة modules
DynamicModuleLoader.preloadModules([
  '@/lib/chart-library',
  '@/lib/math-utils',
  '@/lib/date-helpers'
]);
```

## 💾 Memory Management

### الميزات الرئيسية

- **Smart Caching** مع TTL
- **Automatic Cleanup** للعناصر القديمة
- **Memory Monitoring** في الوقت الفعلي
- **Warning System** للاستخدام العالي
- **Emergency Cleanup** عند الخطر

### الاستخدام الأساسي

```typescript
import { MemoryManager } from '@/core';

// تهيئة النظام
MemoryManager.initialize({
  maxCacheSize: 50 * 1024 * 1024, // 50MB
  maxEntries: 1000,
  cleanupInterval: 30000, // 30 seconds
  warningThreshold: 0.7,  // 70%
  criticalThreshold: 0.9  // 90%
});

// حفظ البيانات
MemoryManager.set('user-data', userData, 300000); // 5 minutes TTL

// استرجاع البيانات
const userData = MemoryManager.get('user-data');

// التحقق من الوجود
if (MemoryManager.has('user-data')) {
  // البيانات موجودة
}

// الحصول على الإحصائيات
const stats = MemoryManager.getMemoryStats();
console.log(`Memory usage: ${stats.percentage * 100}%`);
```

### React Hook للذاكرة

```typescript
import { useMemoryOptimization } from '@/core';

function MyComponent() {
  const memoryStats = useMemoryOptimization('MyComponent');

  return (
    <div>
      <p>Memory usage: {memoryStats?.percentage * 100}%</p>
    </div>
  );
}
```

## ⚡ Performance Monitoring

### الميزات الرئيسية

- **Real-time Tracking** للأداء
- **Core Web Vitals** monitoring
- **Component Performance** tracking
- **Hook Performance** tracking
- **Network Performance** tracking
- **Automatic Reporting** مع توصيات

### الاستخدام الأساسي

```typescript
import { PerformanceTracker } from '@/core';

// تهيئة النظام
PerformanceTracker.initialize({
  enableTracking: true,
  slowThreshold: 100, // 100ms
  memoryThreshold: 10 * 1024 * 1024, // 10MB
  reportInterval: 60000, // 1 minute
  maxHistorySize: 1000
});

// تتبع الوظائف
const result = PerformanceTracker.trackFunctionPerformance(
  'expensive-calculation',
  () => {
    // وظيفة معقدة
    return complexCalculation();
  },
  { context: 'user-action' }
);

// تتبع الوظائف غير المتزامنة
const asyncResult = await PerformanceTracker.trackAsyncFunctionPerformance(
  'api-call',
  async () => {
    return await fetch('/api/data');
  }
);
```

### React Hook للأداء

```typescript
import { usePerformanceTracking } from '@/core';

function MyComponent() {
  const performanceStats = usePerformanceTracking('MyComponent');

  return (
    <div>
      <p>Render time: {performanceStats?.renderTime}ms</p>
      <p>Render count: {performanceStats?.renderCount}</p>
    </div>
  );
}
```

## 📦 Bundle Optimization

### الميزات الرئيسية

- **Chunk Size Analysis** تحليل حجم الحزم
- **Critical Chunks** identification
- **Performance Recommendations** توصيات الأداء
- **Import Optimization** تحسين الاستيراد

### الاستخدام الأساسي

```typescript
import { BundleOptimizer } from '@/core';

// تسجيل حجم الحزمة
BundleOptimizer.registerChunkSize('main-chunk', 500000); // 500KB

// تحليل الحزم
const analysis = BundleOptimizer.getChunkAnalysis();
console.log('Total bundle size:', analysis.totalSize);
console.log('Critical chunks:', analysis.criticalChunks);
console.log('Recommendations:', analysis.recommendations);

// تحسين الـ imports
const optimizedImports = BundleOptimizer.optimizeImports([
  'import * as utils from "./utils"',
  'import { Component } from "./components"'
]);
```

## 🔧 التكوين المتقدم

### تهيئة النظام الكامل

```typescript
import {
  MemoryManager,
  PerformanceTracker,
  BundleOptimizer
} from '@/core';

// تهيئة إدارة الذاكرة
MemoryManager.initialize({
  maxCacheSize: 100 * 1024 * 1024, // 100MB
  maxEntries: 2000,
  cleanupInterval: 60000, // 1 minute
  warningThreshold: 0.8,  // 80%
  criticalThreshold: 0.95 // 95%
});

// تهيئة مراقبة الأداء
PerformanceTracker.initialize({
  enableTracking: process.env.NODE_ENV === 'development',
  slowThreshold: 50, // 50ms
  memoryThreshold: 20 * 1024 * 1024, // 20MB
  reportInterval: 30000, // 30 seconds
  maxHistorySize: 500
});

// إضافة مستمعين للتقارير
PerformanceTracker.addReportListener((report) => {
  console.log('Performance Report:', report);
  // إرسال للخادم أو خدمة التحليلات
});
```

### مراقبة الأداء في التطوير

```typescript
// في وضع التطوير، يتم طباعة التقارير تلقائياً
if (process.env.NODE_ENV === 'development') {
  PerformanceTracker.addReportListener((report) => {
    console.group('🚀 Performance Report');
    console.log('📊 Metrics:', report.metrics.length);
    console.log('🧩 Components:', report.components.length);
    console.log('🪝 Hooks:', report.hooks.length);
    console.log('💾 Memory:', `${Math.round(report.memory.percentage * 100)}%`);

    if (report.recommendations.length > 0) {
      console.log('💡 Recommendations:');
      report.recommendations.forEach(rec => console.log(`  - ${rec}`));
    }

    console.groupEnd();
  });
}
```

## 📊 المراقبة والإحصائيات

### إحصائيات الذاكرة

```typescript
const memoryStats = MemoryManager.getMemoryStats();
// {
//   used: 25165824,      // البايتات المستخدمة
//   total: 52428800,     // الحد الأقصى
//   limit: 2147483648,   // حد المتصفح
//   percentage: 0.48,    // النسبة المئوية
//   timestamp: 1640995200000
// }

const cacheStats = MemoryManager.getCacheStats();
// {
//   size: 25165824,      // حجم الـ cache
//   entries: 150,        // عدد العناصر
//   hitRate: 0.85,      // معدل النجاح
//   averageSize: 167772, // متوسط الحجم
//   oldestEntry: 1640995000000,
//   mostAccessed: 'user-preferences'
// }
```

### إحصائيات الأداء

```typescript
const performanceStats = PerformanceTracker.getPerformanceStats();
// {
//   totalMetrics: 1250,
//   slowComponents: 3,
//   slowHooks: 7,
//   averageRenderTime: 45.2,
//   memoryUsage: 0.48,
//   recommendations: [
//     'Consider optimizing 3 slow components',
//     'Consider optimizing 7 slow hooks',
//     'High memory usage detected, consider reducing cache size'
//   ]
// }
```

## 🎯 أفضل الممارسات

### 1. استخدام Lazy Loading بحكمة

```typescript
// ✅ جيد - للمكونات الثقيلة
const HeavyChart = createLazyComponent(
  () => import('./HeavyChart'),
  'HeavyChart',
  { preload: true }
);

// ❌ سيء - للمكونات البسيطة
const SimpleButton = createLazyComponent(
  () => import('./SimpleButton'),
  'SimpleButton'
);
```

### 2. إدارة الذاكرة بفعالية

```typescript
// ✅ جيد - تحديد TTL مناسب
MemoryManager.set('user-data', data, 300000); // 5 minutes

// ✅ جيد - تنظيف دوري
useEffect(() => {
  const interval = setInterval(() => {
    MemoryManager.performCleanup();
  }, 60000); // كل دقيقة

  return () => clearInterval(interval);
}, []);

// ❌ سيء - عدم تحديد TTL
MemoryManager.set('temp-data', data); // قد يبقى للأبد
```

### 3. مراقبة الأداء المستمرة

```typescript
// ✅ جيد - تتبع الوظائف المهمة
const result = PerformanceTracker.trackFunctionPerformance(
  'critical-calculation',
  criticalFunction
);

// ✅ جيد - مراقبة الـ hooks
const hookStats = usePerformanceTracking('ExpensiveHook');

// ❌ سيء - تتبع كل شيء
PerformanceTracker.trackFunctionPerformance('simple-addition', () => 1 + 1);
```

## 🚨 استكشاف الأخطاء

### مشاكل الذاكرة

```typescript
// التحقق من استخدام الذاكرة
const stats = MemoryManager.getMemoryStats();
if (stats.percentage > 0.9) {
  console.warn('High memory usage detected!');
  MemoryManager.clear(); // تنظيف طارئ
}

// مراقبة الـ cache
const cacheStats = MemoryManager.getCacheStats();
if (cacheStats.hitRate < 0.5) {
  console.warn('Low cache hit rate:', cacheStats.hitRate);
}
```

### مشاكل الأداء

```typescript
// التحقق من المكونات البطيئة
const perfStats = PerformanceTracker.getPerformanceStats();
if (perfStats.slowComponents > 5) {
  console.warn('Too many slow components detected!');
}

// مراقبة الـ hooks البطيئة
if (perfStats.slowHooks > 10) {
  console.warn('Too many slow hooks detected!');
}
```

## 📈 النتائج المتوقعة

باستخدام هذا النظام، يمكنك توقع:

- **تحسين الأداء بنسبة 40-60%**
- **تقليل Bundle Size بنسبة 30%**
- **تحسين تجربة المستخدم بشكل ملحوظ**
- **مراقبة شاملة للأداء والأخطاء**
- **إدارة ذكية للذاكرة**

## 🔗 روابط مفيدة

- [مثال شامل للاستخدام](./examples/use-performance-optimization-example.ts)
- [نظام التصدير والقوالب](./EXPORT_TEMPLATE_SYSTEM.md)
- [دليل الـ Hooks المحسنة](./hooks/README.md)
