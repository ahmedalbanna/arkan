# Performance Monitor - مراقب الأداء

## نظرة عامة

`PerformanceMonitor` هو مكون متقدم لمراقبة وتتبع أداء نظام الذكاء الاصطناعي المحسن. يوفر تتبعاً شاملاً للأداء وإنتاج تقارير مفصلة وتحليلات اتجاهات الأداء.

## الوظائف الرئيسية

### 1. مراقبة الجلسات
- بدء وإنهاء جلسات المراقبة
- تتبع أوقات التنفيذ للمراحل المختلفة
- تسجيل مقاييس الجودة والموارد
- تتبع الأخطاء والخطط الاحتياطية

### 2. تحليل الأداء
- حساب المتوسطات والإحصائيات
- تحليل اتجاهات الأداء
- تحديد المشاكل والأعطال
- إنتاج التوصيات

### 3. إنتاج التقارير
- تقارير شاملة للأداء
- إحصائيات سريعة
- تصدير البيانات
- تحليل الاتجاهات

### 4. إدارة البيانات
- مسح البيانات القديمة
- تصدير البيانات للتحليل الخارجي
- إحصائيات الاستخدام
- مراقبة الموارد

## API Reference

### PerformanceMonitor.startSession()

```typescript
/**
 * بدء جلسة مراقبة جديدة
 * @param config - تكوين الجلسة
 * @param config.taskType - نوع المهمة
 * @param config.domain - المجال أو التخصص
 * @param config.userInput - المدخل من المستخدم
 * @returns string - معرف الجلسة الفريد
 * @example
 * ```typescript
 * import { PerformanceMonitor } from '@/ai/core';
 *
 * const sessionId = PerformanceMonitor.startSession({
 *   taskType: 'generation',
 *   domain: 'business',
 *   userInput: "أنشئ خطة عمل لمشروع تقني"
 * });
 *
 * console.log(sessionId); // "perf_1234567890_abc123"
 * ```
 */
static startSession(config: {
  taskType: string;
  domain: string;
  userInput: string;
}): string
```

### PerformanceMonitor.endSession()

```typescript
/**
 * إنهاء جلسة المراقبة
 * @param sessionId - معرف الجلسة
 * @param success - هل نجحت الجلسة
 * @returns PerformanceSession | null - جلسة المراقبة المكتملة
 * @example
 * ```typescript
 * const session = PerformanceMonitor.endSession(sessionId, true);
 *
 * if (session) {
 *   console.log(`وقت التنفيذ: ${session.metrics.executionTime}ms`);
 *   console.log(`نقاط الجودة: ${session.metrics.qualityScore}`);
 *   console.log(`الحالة: ${session.status}`);
 * }
 * ```
 */
static endSession(sessionId: string, success: boolean = true): PerformanceSession | null
```

### PerformanceMonitor.recordPhaseTime()

```typescript
/**
 * تسجيل وقت مرحلة معينة
 * @param sessionId - معرف الجلسة
 * @param phase - المرحلة المراد تسجيلها
 * @param duration - مدة المرحلة بالميلي ثانية
 * @example
 * ```typescript
 * PerformanceMonitor.recordPhaseTime(sessionId, 'contextAnalysisTime', 1500);
 * PerformanceMonitor.recordPhaseTime(sessionId, 'modelSelectionTime', 200);
 * PerformanceMonitor.recordPhaseTime(sessionId, 'promptBuildingTime', 800);
 * PerformanceMonitor.recordPhaseTime(sessionId, 'generationTime', 5000);
 * PerformanceMonitor.recordPhaseTime(sessionId, 'qualityValidationTime', 1200);
 * ```
 */
static recordPhaseTime(
  sessionId: string,
  phase: keyof Pick<PerformanceMetrics,
    'contextAnalysisTime' | 'modelSelectionTime' | 'promptBuildingTime' |
    'generationTime' | 'qualityValidationTime' | 'iterativeImprovementTime'>,
  duration: number
): void
```

### PerformanceMonitor.recordQualityMetrics()

```typescript
/**
 * تسجيل مقاييس الجودة
 * @param sessionId - معرف الجلسة
 * @param metrics - مقاييس الجودة
 * @param metrics.qualityScore - نقاط الجودة الإجمالية
 * @param metrics.improvementIterations - عدد تكرارات التحسين (اختياري)
 * @param metrics.finalAccuracy - الدقة النهائية (اختياري)
 * @example
 * ```typescript
 * PerformanceMonitor.recordQualityMetrics(sessionId, {
 *   qualityScore: 85,
 *   improvementIterations: 3,
 *   finalAccuracy: 87
 * });
 * ```
 */
static recordQualityMetrics(
  sessionId: string,
  metrics: {
    qualityScore: number;
    improvementIterations?: number;
    finalAccuracy?: number;
  }
): void
```

### PerformanceMonitor.recordResourceUsage()

```typescript
/**
 * تسجيل استخدام الموارد
 * @param sessionId - معرف الجلسة
 * @param usage - استخدام الموارد
 * @param usage.tokensUsed - عدد الرموز المستخدمة (اختياري)
 * @param usage.modelSwitches - عدد تبديلات النماذج (اختياري)
 * @param usage.memoryUsage - استخدام الذاكرة بالميجابايت (اختياري)
 * @example
 * ```typescript
 * PerformanceMonitor.recordResourceUsage(sessionId, {
 *   tokensUsed: 1500,
 *   modelSwitches: 2,
 *   memoryUsage: 256
 * });
 * ```
 */
static recordResourceUsage(
  sessionId: string,
  usage: {
    tokensUsed?: number;
    modelSwitches?: number;
    memoryUsage?: number;
  }
): void
```

### PerformanceMonitor.generatePerformanceReport()

```typescript
/**
 * الحصول على تقرير الأداء الشامل
 * @param timeRange - نطاق الوقت (اختياري)
 * @param timeRange.start - تاريخ البداية
 * @param timeRange.end - تاريخ النهاية
 * @returns PerformanceReport - تقرير الأداء الشامل
 * @example
 * ```typescript
 * const report = PerformanceMonitor.generatePerformanceReport();
 *
 * console.log(`إجمالي الجلسات: ${report.totalSessions}`);
 * console.log(`متوسط وقت التنفيذ: ${report.averageExecutionTime}ms`);
 * console.log(`متوسط نقاط الجودة: ${report.averageQualityScore}`);
 * console.log(`معدل النجاح: ${report.successRate}%`);
 *
 * // تقرير لفترة محددة
 * const weeklyReport = PerformanceMonitor.generatePerformanceReport({
 *   start: new Date('2024-01-01'),
 *   end: new Date('2024-01-07')
 * });
 * ```
 */
static generatePerformanceReport(timeRange?: { start: Date; end: Date }): PerformanceReport
```

### PerformanceMonitor.getQuickStats()

```typescript
/**
 * الحصول على إحصائيات سريعة
 * @returns إحصائيات سريعة للأداء
 * @example
 * ```typescript
 * const stats = PerformanceMonitor.getQuickStats();
 *
 * console.log(`الجلسات النشطة: ${stats.activeSessions}`);
 * console.log(`الجلسات المكتملة: ${stats.completedSessions}`);
 * console.log(`متوسط الجودة اليوم: ${stats.avgQualityToday}`);
 * console.log(`متوسط وقت التنفيذ اليوم: ${stats.avgExecutionTimeToday}ms`);
 * ```
 */
static getQuickStats(): {
  activeSessions: number;
  completedSessions: number;
  avgQualityToday: number;
  avgExecutionTimeToday: number;
}
```

## أنواع البيانات

### PerformanceSession

```typescript
/**
 * جلسة مراقبة الأداء
 */
export interface PerformanceSession {
  /** معرف الجلسة الفريد */
  sessionId: string;

  /** وقت البداية */
  startTime: Date;

  /** وقت النهاية (اختياري) */
  endTime?: Date;

  /** نوع المهمة */
  taskType: string;

  /** المجال أو التخصص */
  domain: string;

  /** المدخل من المستخدم */
  userInput: string;

  /** مقاييس الأداء */
  metrics: PerformanceMetrics;

  /** تحليل السياق (اختياري) */
  contextAnalysis?: any;

  /** تكوين النموذج (اختياري) */
  modelConfig?: any;

  /** حالة الجلسة */
  status: 'running' | 'completed' | 'failed';

  /** الأخطاء المسجلة */
  errors: string[];
}
```

### PerformanceMetrics

```typescript
/**
 * مقاييس الأداء
 */
export interface PerformanceMetrics {
  /** وقت التنفيذ الإجمالي بالميلي ثانية */
  executionTime: number;

  /** وقت تحليل السياق */
  contextAnalysisTime: number;

  /** وقت اختيار النموذج */
  modelSelectionTime: number;

  /** وقت بناء المحفز */
  promptBuildingTime: number;

  /** وقت التوليد */
  generationTime: number;

  /** وقت التحقق من الجودة */
  qualityValidationTime: number;

  /** وقت التحسين التكراري (اختياري) */
  iterativeImprovementTime?: number;

  /** نقاط الجودة */
  qualityScore: number;

  /** عدد تكرارات التحسين */
  improvementIterations: number;

  /** الدقة النهائية */
  finalAccuracy: number;

  /** عدد الرموز المستخدمة */
  tokensUsed: number;

  /** عدد تبديلات النماذج */
  modelSwitches: number;

  /** استخدام الذاكرة بالميجابايت */
  memoryUsage: number;

  /** معدل النجاح */
  successRate: number;

  /** عدد الأخطاء */
  errorCount: number;

  /** هل تم استخدام الخطة الاحتياطية */
  fallbackUsed: boolean;
}
```

### PerformanceReport

```typescript
/**
 * تقرير الأداء الشامل
 */
export interface PerformanceReport {
  /** إجمالي الجلسات */
  totalSessions: number;

  /** متوسط وقت التنفيذ */
  averageExecutionTime: number;

  /** متوسط نقاط الجودة */
  averageQualityScore: number;

  /** معدل النجاح */
  successRate: number;

  /** الأخطاء الشائعة */
  mostCommonErrors: Array<{ error: string; count: number }>;

  /** اتجاهات الأداء */
  performanceTrends: Array<{ date: string; avgTime: number; avgQuality: number }>;

  /** إحصائيات استخدام النماذج */
  modelUsageStats: Array<{ model: string; usage: number; avgQuality: number }>;

  /** التوصيات */
  recommendations: string[];
}
```

## أمثلة الاستخدام

### 1. مراقبة جلسة أساسية

```typescript
import { PerformanceMonitor } from '@/ai/core';

// بدء الجلسة
const sessionId = PerformanceMonitor.startSession({
  taskType: 'generation',
  domain: 'business',
  userInput: "أنشئ خطة عمل لمشروع تقني"
});

// تسجيل أوقات المراحل
PerformanceMonitor.recordPhaseTime(sessionId, 'contextAnalysisTime', 1500);
PerformanceMonitor.recordPhaseTime(sessionId, 'modelSelectionTime', 200);
PerformanceMonitor.recordPhaseTime(sessionId, 'promptBuildingTime', 800);
PerformanceMonitor.recordPhaseTime(sessionId, 'generationTime', 5000);
PerformanceMonitor.recordPhaseTime(sessionId, 'qualityValidationTime', 1200);

// تسجيل مقاييس الجودة
PerformanceMonitor.recordQualityMetrics(sessionId, {
  qualityScore: 85,
  improvementIterations: 3,
  finalAccuracy: 87
});

// تسجيل استخدام الموارد
PerformanceMonitor.recordResourceUsage(sessionId, {
  tokensUsed: 1500,
  modelSwitches: 2,
  memoryUsage: 256
});

// إنهاء الجلسة
const session = PerformanceMonitor.endSession(sessionId, true);

if (session) {
  console.log(`وقت التنفيذ الإجمالي: ${session.metrics.executionTime}ms`);
  console.log(`نقاط الجودة: ${session.metrics.qualityScore}`);
  console.log(`عدد الرموز المستخدمة: ${session.metrics.tokensUsed}`);
}
```

### 2. مراقبة جلسة مع أخطاء

```typescript
const sessionId = PerformanceMonitor.startSession({
  taskType: 'analysis',
  domain: 'data_science',
  userInput: "حلل البيانات"
});

try {
  // تنفيذ المهمة
  PerformanceMonitor.recordPhaseTime(sessionId, 'contextAnalysisTime', 1000);
  PerformanceMonitor.recordPhaseTime(sessionId, 'generationTime', 3000);

  // تسجيل نجاح
  PerformanceMonitor.recordQualityMetrics(sessionId, {
    qualityScore: 90
  });

  PerformanceMonitor.endSession(sessionId, true);

} catch (error) {
  // تسجيل الخطأ
  PerformanceMonitor.recordError(sessionId, error.message);

  // استخدام الخطة الاحتياطية
  PerformanceMonitor.recordFallbackUsage(sessionId);

  // إنهاء الجلسة بالفشل
  PerformanceMonitor.endSession(sessionId, false);
}
```

### 3. الحصول على تقرير الأداء

```typescript
// تقرير شامل
const report = PerformanceMonitor.generatePerformanceReport();

console.log(`إجمالي الجلسات: ${report.totalSessions}`);
console.log(`متوسط وقت التنفيذ: ${report.averageExecutionTime}ms`);
console.log(`متوسط نقاط الجودة: ${report.averageQualityScore}`);
console.log(`معدل النجاح: ${report.successRate}%`);

// الأخطاء الشائعة
console.log('الأخطاء الشائعة:');
report.mostCommonErrors.forEach((error, index) => {
  console.log(`${index + 1}. ${error.error}: ${error.count} مرة`);
});

// التوصيات
console.log('التوصيات:');
report.recommendations.forEach((recommendation, index) => {
  console.log(`${index + 1}. ${recommendation}`);
});
```

### 4. تقرير لفترة محددة

```typescript
// تقرير الأسبوع الماضي
const lastWeek = new Date();
lastWeek.setDate(lastWeek.getDate() - 7);

const weeklyReport = PerformanceMonitor.generatePerformanceReport({
  start: lastWeek,
  end: new Date()
});

console.log(`جلسات الأسبوع الماضي: ${weeklyReport.totalSessions}`);
console.log(`متوسط الجودة: ${weeklyReport.averageQualityScore}`);
```

### 5. إحصائيات سريعة

```typescript
const stats = PerformanceMonitor.getQuickStats();

console.log(`الجلسات النشطة: ${stats.activeSessions}`);
console.log(`الجلسات المكتملة: ${stats.completedSessions}`);
console.log(`متوسط الجودة اليوم: ${stats.avgQualityToday}`);
console.log(`متوسط وقت التنفيذ اليوم: ${stats.avgExecutionTimeToday}ms`);
```

## تحليل الاتجاهات

### 1. اتجاهات الأداء اليومية

```typescript
const report = PerformanceMonitor.generatePerformanceReport();

console.log('اتجاهات الأداء (آخر 7 أيام):');
report.performanceTrends.forEach(trend => {
  console.log(`${trend.date}: وقت متوسط ${trend.avgTime}ms، جودة ${trend.avgQuality}`);
});
```

### 2. إحصائيات استخدام النماذج

```typescript
console.log('إحصائيات استخدام النماذج:');
report.modelUsageStats.forEach(model => {
  console.log(`${model.model}: ${model.usage} استخدام، جودة ${model.avgQuality}`);
});
```

## إدارة البيانات

### 1. تصدير البيانات

```typescript
// تصدير بصيغة JSON
const jsonData = PerformanceMonitor.exportData('json');
console.log(jsonData);

// تصدير بصيغة CSV
const csvData = PerformanceMonitor.exportData('csv');
console.log(csvData);

// حفظ في ملف
import { writeFileSync } from 'fs';
writeFileSync('performance-data.json', jsonData);
writeFileSync('performance-data.csv', csvData);
```

### 2. مسح البيانات القديمة

```typescript
// مسح البيانات الأقدم من 30 يوم
const removedCount = PerformanceMonitor.clearOldData(30);
console.log(`تم حذف ${removedCount} جلسة قديمة`);

// مسح البيانات الأقدم من 7 أيام
const removedCount = PerformanceMonitor.clearOldData(7);
console.log(`تم حذف ${removedCount} جلسة قديمة`);
```

## أفضل الممارسات

### 1. مراقبة شاملة

```typescript
// ✅ جيد - مراقبة شاملة
const sessionId = PerformanceMonitor.startSession(config);

try {
  // تسجيل جميع المراحل
  PerformanceMonitor.recordPhaseTime(sessionId, 'contextAnalysisTime', contextTime);
  PerformanceMonitor.recordPhaseTime(sessionId, 'modelSelectionTime', modelTime);
  PerformanceMonitor.recordPhaseTime(sessionId, 'promptBuildingTime', promptTime);
  PerformanceMonitor.recordPhaseTime(sessionId, 'generationTime', generationTime);
  PerformanceMonitor.recordPhaseTime(sessionId, 'qualityValidationTime', validationTime);

  // تسجيل المقاييس
  PerformanceMonitor.recordQualityMetrics(sessionId, {
    qualityScore: 85,
    improvementIterations: 3
  });

  // تسجيل الموارد
  PerformanceMonitor.recordResourceUsage(sessionId, {
    tokensUsed: 1500,
    memoryUsage: 256
  });

  PerformanceMonitor.endSession(sessionId, true);

} catch (error) {
  PerformanceMonitor.recordError(sessionId, error.message);
  PerformanceMonitor.endSession(sessionId, false);
}

// ❌ سيء - مراقبة محدودة
const sessionId = PerformanceMonitor.startSession(config);
// تنفيذ المهمة بدون تسجيل
PerformanceMonitor.endSession(sessionId, true);
```

### 2. تحليل النتائج بانتظام

```typescript
// ✅ جيد - تحليل منتظم
const report = PerformanceMonitor.generatePerformanceReport();

// تحقق من الأداء
if (report.averageExecutionTime > 10000) {
  console.warn('الأداء بطيء - فكر في التحسين');
}

if (report.averageQualityScore < 70) {
  console.warn('جودة المخرجات منخفضة - راجع النماذج');
}

if (report.successRate < 0.9) {
  console.warn('معدل النجاح منخفض - راجع معالجة الأخطاء');
}

// تطبيق التوصيات
report.recommendations.forEach(recommendation => {
  console.log(`توصية: ${recommendation}`);
});
```

### 3. إدارة البيانات

```typescript
// ✅ جيد - إدارة منتظمة للبيانات
// مسح البيانات القديمة أسبوعياً
const removedCount = PerformanceMonitor.clearOldData(30);
console.log(`تم حذف ${removedCount} جلسة قديمة`);

// تصدير البيانات للتحليل
const data = PerformanceMonitor.exportData('json');
// حفظ أو إرسال للتحليل الخارجي
```

## معالجة الأخطاء

### 1. أخطاء الجلسة

```typescript
try {
  const sessionId = PerformanceMonitor.startSession(config);
  // تنفيذ المهمة
  PerformanceMonitor.endSession(sessionId, true);
} catch (error) {
  console.error('خطأ في مراقبة الأداء:', error.message);
  // معالجة الخطأ
}
```

### 2. أخطاء التسجيل

```typescript
try {
  PerformanceMonitor.recordPhaseTime(sessionId, 'generationTime', 5000);
} catch (error) {
  console.error('خطأ في تسجيل وقت المرحلة:', error.message);
  // معالجة الخطأ
}
```

## الاختبار

### 1. اختبار المراقبة الأساسية

```typescript
import { PerformanceMonitor } from '@/ai/core';

describe('PerformanceMonitor', () => {
  test('should start and end session correctly', () => {
    const sessionId = PerformanceMonitor.startSession({
      taskType: 'generation',
      domain: 'business',
      userInput: 'test input'
    });

    expect(sessionId).toBeDefined();
    expect(sessionId).toMatch(/^perf_\d+_[a-z0-9]+$/);

    const session = PerformanceMonitor.endSession(sessionId, true);
    expect(session).toBeDefined();
    expect(session?.status).toBe('completed');
    expect(session?.metrics.executionTime).toBeGreaterThan(0);
  });

  test('should record phase times correctly', () => {
    const sessionId = PerformanceMonitor.startSession({
      taskType: 'generation',
      domain: 'business',
      userInput: 'test input'
    });

    PerformanceMonitor.recordPhaseTime(sessionId, 'generationTime', 5000);

    const session = PerformanceMonitor.endSession(sessionId, true);
    expect(session?.metrics.generationTime).toBe(5000);
  });
});
```

### 2. اختبار التقارير

```typescript
test('should generate performance report', () => {
  // إنشاء جلسات تجريبية
  const sessionId1 = PerformanceMonitor.startSession({
    taskType: 'generation',
    domain: 'business',
    userInput: 'test input 1'
  });

  PerformanceMonitor.recordQualityMetrics(sessionId1, { qualityScore: 85 });
  PerformanceMonitor.endSession(sessionId1, true);

  const sessionId2 = PerformanceMonitor.startSession({
    taskType: 'analysis',
    domain: 'data',
    userInput: 'test input 2'
  });

  PerformanceMonitor.recordQualityMetrics(sessionId2, { qualityScore: 90 });
  PerformanceMonitor.endSession(sessionId2, true);

  const report = PerformanceMonitor.generatePerformanceReport();

  expect(report.totalSessions).toBeGreaterThanOrEqual(2);
  expect(report.averageQualityScore).toBeGreaterThan(0);
  expect(report.successRate).toBeGreaterThan(0);
  expect(report.recommendations).toBeInstanceOf(Array);
});
```

## التطوير المستقبلي

### 1. تحسينات مقترحة
- دعم المراقبة المتوازية
- تحسين خوارزمية التحليل
- دعم التنبؤات
- تحليل الاتجاهات المتقدم

### 2. إضافة مكونات جديدة
- محلل الأداء المتقدم
- نظام التنبؤات
- محلل التكلفة
- نظام التوصيات الذكي

---

**آخر تحديث**: 2024
**الإصدار**: 1.0
**المكون**: Performance Monitor
