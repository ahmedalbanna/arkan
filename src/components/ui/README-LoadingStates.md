# نظام Loading States المحسن لـ Arkan

## نظرة سريعة

نظام Loading States شامل يوفر تجربة مستخدم متميزة مع إدارة حالات تحميل متقدمة عبر التطبيق.

## البدء السريع

```tsx
import { LoadingProvider, LoadingWrapper } from '@/components/ui';

function App() {
  return (
    <LoadingProvider>
      <LoadingWrapper loadingKey="data-fetch" variant="skeleton">
        <DataComponent />
      </LoadingWrapper>
    </LoadingProvider>
  );
}
```

## المكونات الرئيسية

### LoadingProvider
مزود Context مركزي لإدارة جميع حالات التحميل.

### LoadingWrapper
مكون wrapper ذكي للتكامل مع LoadingContext:

```tsx
<LoadingWrapper loadingKey="operation" variant="spinner">
  <YourComponent />
</LoadingWrapper>
```

### QuickLoadingWrap
مكونات سريعة جاهزة للاستخدام:

```tsx
// للحصول على البيانات
<QuickLoadingWrap.Data loadingKey="fetch-data">
  <DataList />
</QuickLoadingWrap.Data>

// للعمليات المعقدة
<QuickLoadingWrap.Processing loadingKey="heavy-operation">
  <ExpensiveComponent />
</QuickLoadingWrap.Processing>
```

## Types الأساسية

- `LoadingSpinner` - دوارات متحركة
- `LoadingSkeleton` - هياكل محاكاة
- `LoadingProgress` - أشرطة تقدم
- `LoadingPulse` - آثار نبضية
- `LoadingOverlay` - طبقات تغطية

## Hooks المتخصصة

### useAsyncOperation
للعمليات غير المتزامنة:

```tsx
const { execute } = useAsyncOperation('save-data', {
  successMessage: 'تم الحفظ!',
  errorMessage: 'فشل الحفظ',
});
```

### useFileOperation
لرفع الملفات:

```tsx
const { uploadFile } = useFileOperation('upload', {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  acceptedTypes: ['image/png'],
});
```

### useProgressOperation
للعمليات متعددة المراحل:

```tsx
const { executeWithProgress } = useProgressOperation('batch-job');

executeWithProgress(async (progress) => {
  progress(25, 'المرحلة 1');
  await firstStep();

  progress(75, 'المرحلة 2');
  await secondStep();

  progress(100, 'انتهى!');
});
```

## الامثلة العملية

راجع `src/components/examples/AIResearcherToolEnhanced.tsx` لأمثلة تطبيقية شاملة.

## التوثيق الكامل

انظر `docs/loading-states-system-guide.md` للدليل الكامل.

---

## الاستخدام المتقدم

### التخصيص
```tsx
<LoadingWrapper
  loadingKey="custom"
  variant="progress"
  size="lg"
  color="success"
  delay={300}
  message="معالجة متخصصة..."
/>
```

### إدارة الأنواع المتعددة
```tsx
const ActiveLoading = () => {
  const { activeOperations, hasActiveOperations } = useLoading();
  return hasActiveOperations ? (
    <div>عمليات نشطة: {activeOperations.join(', ')}</div>
  ) : null;
};
```

هذا النظام يولد تجربة مستخدم عتالية ويحسن قابلية الصيانة للمطورين!
