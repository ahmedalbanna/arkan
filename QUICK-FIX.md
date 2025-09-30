# 🚀 حل سريع لمشكلة Firebase

## المشكلة
```
Module not found: Can't resolve 'fs'
Module not found: Can't resolve 'child_process'
Module not found: Can't resolve 'net'
```

## ✅ الحل

### 1. **تأكد من وجود `next.config.js`**
```bash
# تأكد من وجود الملف
ls next.config.js
```

### 2. **أعد تشغيل الخادم**
```bash
# أوقف الخادم (Ctrl+C)
# ثم أعد تشغيله
npm run dev
```

### 3. **استخدم الاستيراد الصحيح**

#### للعميل (React Components):
```typescript
// ✅ صحيح
import { PerformanceMonitor, Analytics } from '@/core/client';
```

#### للخادم (API Routes):
```typescript
// ✅ صحيح
import { adminAuth, adminFirestore } from '@/core/server';
```

## 🔧 إذا لم يعمل

### 1. **امسح cache**
```bash
rm -rf .next
npm run dev
```

### 2. **تأكد من المتغيرات**
```bash
# تأكد من وجود .env.local
cat .env.local
```

### 3. **تحقق من الإعدادات**
```bash
# تأكد من وجود next.config.js
cat next.config.js
```

## 📞 إذا استمرت المشكلة

1. تأكد من استخدام المسار الصحيح
2. تحقق من console للأخطاء
3. راجع `src/lib/core/README-USAGE.md`

---

**ملاحظة**: هذا الحل يحل مشكلة Firebase Admin SDK في العميل.
