# دليل نظام Loading States المحسن

## نظرة عامة

نظام Loading States المحسن من Arkan يوفر تجربة مستخدم متميزة مع إدارة مركزية لحالات التحميل عبر التطبيق. يوفر النظام حلولاً شاملة للعمليات البطيئة مع رسوم متحركة محسنة وإدارة حالات متقدمة.

## المكونات الرئيسية

### 1. LoadingContext التقديري

```tsx
import { LoadingProvider, useLoading } from '@/context/LoadingContext';

function App() {
  return (
    <LoadingProvider
      autoCleanupDelay={30000} // تنظيف تلقائي بعد 30 ثانية
      enableNotifications={true}
    >
      <YourApp />
    </LoadingProvider>
  );
}
```

#### الاستخدام الأساسي

```tsx
function MyComponent() {
  const { setLoading, isLoading } = useLoading();

  const handleOperation = async () => {
    setLoading('operation-key', true);
    try {
      await someAsyncOperation();
    } finally {
      setLoading('operation-key', false);
    }
  };

  return (
    <button onClick={handleOperation} disabled={isLoading('operation-key')}>
      {isLoading('operation-key') ? 'جاري المعالجة...' : 'ابدأ العملية'}
    </button>
  );
}
```

#### الاستخدام المتقدم

```tsx
function AdvancedComponent() {
  const { setLoading } = useLoading();

  const handleAdvancedOperation = async () => {
    setLoading('advanced-op', {
      loading: true,
      message: 'جاري المعالجة المتقدمة...',
      progress: 0,
      variant: 'progress',
      cancellable: true,
      onCancel: () => {
        setLoading('advanced-op', false);
        // منطق الإلغاء
      }
    });
  };

  return <button onClick={handleAdvancedOperation}>عملية متقدمة</button>;
}
```

### 2. مكونات Loading المتقدمة

#### LoadingSpinner

```tsx
import { LoadingSpinner } from '@/components/ui/LoadingStates';

// استخدام أساسي
<LoadingSpinner />

// استخدام متقدم
<LoadingSpinner
  size="lg"
  color="success"
  speed="fast"
  showLabel
  label="جاري تحميل البيانات..."
/>
```

#### LoadingSkeleton

```tsx
import { LoadingSkeleton } from '@/components/ui/LoadingStates';

// هيكل محاكاة أساسي
<LoadingSkeleton lines={3} />

// هيكل محاكاة متقدم
<LoadingSkeleton
  lines={5}
  width="2/3"
  variant="rounded"
  height="lg"
/>
```

#### LoadingProgress

```tsx
import { LoadingProgress } from '@/components/ui/LoadingStates';

// شريط تقدم بسيط
<LoadingProgress value={75} />

// شريط تقدم متقدم
<LoadingProgress
  value={85}
  showPercentage
  variant="success"
  marker
/>
```

#### LoadingPulse

```tsx
import { LoadingPulse } from '@/components/ui/LoadingStates';

// نبضات بسيطة
<LoadingPulse count={3} />

// نبضات متقدمة
<LoadingPulse
  count={5}
  variant="bars"
  speed="fast"
/>
```

#### LoadingOverlay

```tsx
import { LoadingOverlay } from '@/components/ui/LoadingStates';

// Overlay كامل
<LoadingOverlay variant="fullscreen">
  <LoadingSpinner size="xl" showLabel label="جاري معالجة البيانات..." />
</LoadingOverlay>

// Overlay مرن
<LoadingOverlay
  variant="modal"
  opacity={0.8}
  closable
  onClose={() => console.log('تم الإغلاق')}
/>
```

#### LoadingIndicator شامل

```tsx
import { LoadingIndicator } from '@/components/ui/LoadingStates';

// يستخدم نوع تلقائي حسب الخصائص المحددة
<LoadingIndicator
  variant="progress"
  message="جاري المعالجة..."
  progress={60}
/>

// أنواع متعددة
const variants = ['spinner', 'skeleton', 'progress', 'pulse', 'overlay'];

variants.map(variant => (
  <LoadingIndicator key={variant} variant={variant} />
));
```

### 3. LoadingWrapper المتكامل

#### الاستخدام الأساسي

```tsx
import { LoadingWrapper } from '@/components/ui/LoadingWrapper';

function MyComponent() {
  return (
    <LoadingWrapper loadingKey="my-operation" variant="spinner">
      <div>المحتوى الحقيقي هنا</div>
    </LoadingWrapper>
  );
}
```

#### المكونات السريعة (Quick Components)

```tsx
import { QuickLoadingWrap } from '@/components/ui/LoadingWrapper';

// لحصول البيانات
<QuickLoadingWrap.Data loadingKey="fetch-data">
  <DataList />
</QuickLoadingWrap.Data>

// للعمليات البطيئة
<QuickLoadingWrap.Processing loadingKey="slow-operation">
  <ExpensiveComponent />
</QuickLoadingWrap.Processing>

// للأزرار
<QuickLoadingWrap.Button loadingKey="button-action">
  <Button>النقر هنا</Button>
</QuickLoadingWrap.Button>

// للرفع والتحميل
<QuickLoadingWrap.Upload loadingKey="file-upload" progress={50}>
  <FileUploader />
</QuickLoadingWrap.Upload>
```

### 4. Hooks المتخصصة

#### useAsyncOperation

```tsx
import { useAsyncOperation } from '@/hooks/useLoadingFor';

function AsyncComponent() {
  const { execute, isLoading } = useAsyncOperation('async-op', {
    loadingMessage: 'جاري التنفيذ...',
    successMessage: 'تم بنجاح!',
    errorMessage: 'فشل التنفيذ',
    timeout: 10000,
    hasCancelOption: true,
    onSuccess: (result) => console.log('نجح:', result),
    onError: (error) => console.error('خطأ:', error),
  });

  const handleAsyncTask = () => {
    execute(async () => {
      await fetchData();
      return 'نتيجة العملية';
    });
  };

  return (
    <button onClick={handleAsyncTask} disabled={isLoading}>
      {isLoading ? 'جاري التنفيذ...' : 'ابدأ المهمة'}
    </button>
  );
}
```

#### useFileOperation

```tsx
import { useFileOperation } from '@/hooks/useLoadingFor';

function FileComponent() {
  const { uploadFile, isLoading } = useFileOperation('file-op', {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    acceptedTypes: ['image/png', 'image/jpeg', 'application/pdf'],
    loadingMessage: 'جاري رفع الملف...',
    onSuccess: (file, content) => console.log('تم رفع الملف:', file.name),
  });

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      uploadFile(file);
    }
  };

  return (
    <LoadingWrapper loadingKey="file-op" variant="progress">
      <input type="file" onChange={handleFileUpload} disabled={isLoading} />
    </LoadingWrapper>
  );
}
```

#### useProgressOperation

```tsx
import { useProgressOperation } from '@/hooks/useLoadingFor';

function ProgressComponent() {
  const { executeWithProgress, currentProgress } = useProgressOperation('progress-op');

  const handleProgressTask = () => {
    executeWithProgress(async (progress) => {
      // مرحلة أولى - 25%
      await longTask();
      progress(25, 'تم إكمال المرحلة الأولى');

      // مرحلة ثانية - 50%
      await anotherLongTask();
      progress(50, 'تم إكمال المرحلة الثانية');

      // مرحلة ثالثة - 75%
      await finalTask();
      progress(75, 'اقتربت النهاية');

      // انهاء - 100%
      await cleanupTask();
      progress(100, 'تم الانتهاء بنجاح');

      return 'نتيجة العملية';
    });
  };

  return (
    <LoadingWrapper loadingKey="progress-op" variant="progress">
      <div>
        <button onClick={handleProgressTask}>ابدأ المهمة الطويلة</button>
        <p>التقدم الحالي: {currentProgress}%</p>
      </div>
    </LoadingWrapper>
  );
}
```

#### useBatchOperation

```tsx
import { useBatchOperation } from '@/hooks/useLoadingFor';

function BatchComponent() {
  const { executeBatch, completed, isLoading } = useBatchOperation('batch-op', {
    concurrency: 3, // عدد العمليات المتوازية
    timeout: 30000, // مهلة زمنية إجمالية
    onBatchProgress: (completed, total) => {
      console.log(`تم إكمال ${completed} من ${total}`);
    },
  });

  const items = ['item1', 'item2', 'item3', 'item4', 'item5'];

  const handleBatchProcessing = () => {
    executeBatch(items, async (item, index) => {
      // محاكاة عملية بطيئة لكل عنصر
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(`تم معالجة ${item} (${index + 1})`);
      return `processed-${item}`;
    });
  };

  return (
    <LoadingWrapper loadingKey="batch-op" variant="progress">
      <div>
        <button onClick={handleBatchProcessing} disabled={isLoading}>
          {isLoading ? `معالجة... ${completed}/${items.length}` : 'ابدأ المعالجة المجمعة'}
        </button>
      </div>
    </LoadingWrapper>
  );
}
```

## المعايير والأفضل Practices

### 1. اختيار نوع Loading المناسب

```tsx
// للتحميل السريع (أقل من ثانيتين)
<LoadingSpinner size="sm" />

// للعمليات المعقدة
<LoadingProgress value={progress} showPercentage />

// للمحتوى القادم
<LoadingSkeleton lines={3} />

// للأزرار
<QuickLoadingWrap.Button loadingKey="button-action">
  <Button>النقر</Button>
</QuickLoadingWrap.Button>

// للصفحات الكاملة
<LoadingOverlay variant="fullscreen" />
```

### 2. إدارة حالة التحميل بشكل صحيح

```tsx
// ❌ خطأ - عدم تنظيف الحالة
const BadExample = () => {
  useEffect(() => {
    setLoading('operation', true);
    someAsyncOperation();
    // نسيان إيقاف التحميل!
  }, []);
};

// ✅ صحيح - تنظيف تلقائي
const GoodExample = () => {
  useEffect(() => {
    const run = async () => {
      setLoading('operation', true);
      try {
        await someAsyncOperation();
      } finally {
        setLoading('operation', false);
      }
    };
    run();
  }, []);
};

// ✅ الأفضل - استخدام hooks متخصصة
const BestExample = () => {
  const { execute } = useAsyncOperation('operation');
  useEffect(() => {
    execute(async () => {
      return await someAsyncOperation();
    });
  }, [execute]);
};
```

### 3. رسائل المستخدم المحسنة

```tsx
// رسائل واضحة ومفيدة
setLoading('save-document', {
  loading: true,
  message: 'جاري حفظ المستند على السحابة...',
  variant: 'progress',
});

setLoading('ai-processing', {
  loading: true,
  message: 'يقوم الذكاء الاصطناعي بتحليل المحتوى...',
  cancellable: true,
});
```

### 4. التعامل مع الأخطاء

```tsx
const { execute } = useAsyncOperation('risky-operation', {
  errorMessage: 'حدث خطأ في العملية. يرجى المحاولة مرة أخرى.',
  onError: (error) => {
    // تسجيل الخطأ للمطورين
    console.error('خطأ في العملية:', error);

    // إرسال تقرير خطأ
    errorReporting.captureException(error);
  },
  // إعادة المحاولة التلقائية
  retryCount: 3,
});
```

## التكامل مع الأنظمة الموجودة

### تحديث مكون موجود

```tsx
// قبل التحديث
const OldComponent = () => {
  const [loading, setLoading] = useState(false);

  return (
    <div>
      {loading && <div>جاري التحميل...</div>}
      <button onClick={() => setLoading(true)}>
        بدء العملية
      </button>
    </div>
  );
};

// بعد التحديث
const NewComponent = () => {
  const { execute } = useAsyncOperation('component-operation');

  return (
    <LoadingWrapper loadingKey="component-operation" variant="spinner">
      <button onClick={() => execute(async () => {
        await someOperation();
        return 'complete';
      })}>
        بدء العملية
      </button>
    </LoadingWrapper>
  );
};
```

### التكامل مع React Query

```tsx
import { useQuery } from '@tanstack/react-query';

const IntegratedComponent = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['data'],
    queryFn: fetchData,
  });

  return (
    <LoadingWrapper
      loadingKey="react-query-data"
      loading={isLoading}
      variant="skeleton"
      fallback={<DataSkeleton />}
    >
      <DataComponent data={data} />
    </LoadingWrapper>
  );
};
```

## استكشاف الأخطاء وحلها

### مشاكل شائعة

1. **لا يظهر Loading**
   ```tsx
   // تحقق من صحة المفتاح
   <LoadingWrapper loadingKey="exact-key-match" />
   ```

2. **Loading لا يختفي**
   ```tsx
   // تأكد من استدعاء stop()
   try {
     await operation();
   } finally {
     setLoading('key', false);
   }
   ```

3. **مشاكل الأداء**
   ```tsx
   // استخدم delay لتجنب فليفيش
   <LoadingWrapper delay={500} loadingKey="key" />
   ```

### أدوات التصحيح

```tsx
// إضافة تسجيل للتطوير
const { activeOperations, hasActiveOperations } = useLoading();
console.log('عمليات نشطة:', activeOperations);
console.log('هل هناك عمليات:', hasActiveOperations);
```

## أمثلة تطبيقية متقدمة

### نظام تحميل ذكي للصفحة

```tsx
const SmartPageLoader = () => {
  return (
    <LoadingProvider>
      <QuickLoadingWrap.Data loadingKey="page-data">
        <QuickLoadingWrap.Processing loadingKey="page-processing">
          <ExpensivePageComponent />
        </QuickLoadingWrap.Processing>
      </QuickLoadingWrap.Data>
    </LoadingProvider>
  );
};
```

### نظام رفع ملفات متقدم

```tsx
const AdvancedFileUpload = () => {
  const { uploadFile, isLoading } = useFileOperation('uploads');

  const handleMultipleUploads = async (files: File[]) => {
    const uploadPromises = files.map(file => uploadFile(file));
    await Promise.allSettled(uploadPromises);
  };

  return (
    <div>
      <QuickLoadingWrap.Upload
        loadingKey="uploads"
        variant="progress"
      >
        <input
          type="file"
          multiple
          onChange={e => handleMultipleUploads(Array.from(e.target.files))}
        />
      </QuickLoadingWrap.Upload>

      <LoadingWrapper loadingKey="uploads" variant="overlay">
        <div>تم رفع الملفات</div>
      </LoadingWrapper>
    </div>
  );
};
```
