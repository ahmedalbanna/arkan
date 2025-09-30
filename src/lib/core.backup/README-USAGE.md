# دليل الاستخدام الصحيح للنظام الأساسي

## 🚨 **مشكلة شائعة وحلها**

إذا واجهت أخطاء مثل:
```
Module not found: Can't resolve 'fs'
Module not found: Can't resolve 'child_process'
Module not found: Can't resolve 'net'
```

هذا يعني أنك تحاول استخدام مكتبات server-side في العميل.

## ✅ **الحل الصحيح**

### 1. **للعميل (Client-side)**
```typescript
// ✅ صحيح - للعميل
import { PerformanceMonitor, Analytics } from '@/lib/core/client';

// أو
import { PerformanceMonitor, Analytics } from '@/lib/core';
```

### 2. **للخادم (Server-side)**
```typescript
// ✅ صحيح - للخادم
import { adminAuth, adminFirestore } from '@/lib/core/server';

// أو
import { adminAuth, adminFirestore } from '@/lib/core';
```

### 3. **في API Routes**
```typescript
// ✅ صحيح - في API routes
import { adminAuth, adminFirestore } from '@/lib/core/server';
import { handleServerError } from '@/lib/core/server';

export async function GET() {
  try {
    // استخدام Firebase Admin
    const users = await adminFirestore.collection('users').get();
    return Response.json(users);
  } catch (error) {
    return handleServerError(error);
  }
}
```

### 4. **في React Components**
```typescript
// ✅ صحيح - في React components
import { PerformanceMonitor, Analytics } from '@/lib/core/client';

export default function MyComponent() {
  useEffect(() => {
    // استخدام العميل
    Analytics.trackPageView('/my-page');
    PerformanceMonitor.startAutoMonitoring();
  }, []);

  return <div>My Component</div>;
}
```

## 🔧 **إعدادات Next.js**

تأكد من وجود `next.config.js`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      'firebase-admin',
      '@google-cloud/storage',
      'google-auth-library',
      // ... مكتبات أخرى
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        // ... إعدادات أخرى
      };
    }
    return config;
  },
};

module.exports = nextConfig;
```

## 📁 **هيكل الملفات**

```
src/lib/core/
├── client/           # للعميل فقط
│   └── index.ts
├── server/           # للخادم فقط
│   └── index.ts
├── firebase/
│   ├── client-init.ts    # Firebase للعميل
│   └── server-init.ts    # Firebase للخادم
├── performance/      # نظام الأداء
├── auth/            # نظام المصادقة
├── api/             # نظام API
└── index.ts         # الملف الرئيسي
```

## 🚫 **ما يجب تجنبه**

```typescript
// ❌ خطأ - لا تستخدم server-side في العميل
import { adminAuth } from '@/lib/core/server';
// في React component

// ❌ خطأ - لا تستخدم client-side في server
import { PerformanceMonitor } from '@/lib/core/client';
// في API route
```

## ✅ **أمثلة صحيحة**

### **في صفحة React:**
```typescript
'use client';

import { PerformanceIntegration } from '@/lib/core/client';

export default function HomePage() {
  useEffect(() => {
    PerformanceIntegration.initialize({
      analyticsEnabled: true,
      performanceMonitoringEnabled: true,
    });
  }, []);

  return <div>Home Page</div>;
}
```

### **في API Route:**
```typescript
import { adminAuth, adminFirestore } from '@/lib/core/server';

export async function GET() {
  try {
    const users = await adminFirestore.collection('users').get();
    return Response.json(users.docs.map(doc => doc.data()));
  } catch (error) {
    return Response.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
```

### **في Server Component:**
```typescript
import { adminFirestore } from '@/lib/core/server';

export default async function ServerComponent() {
  const users = await adminFirestore.collection('users').get();

  return (
    <div>
      {users.docs.map(doc => (
        <div key={doc.id}>{doc.data().name}</div>
      ))}
    </div>
  );
}
```

## 🔍 **استكشاف الأخطاء**

### **1. تحقق من الاستيراد:**
```typescript
// تأكد من استخدام المسار الصحيح
import { ... } from '@/lib/core/client';  // للعميل
import { ... } from '@/lib/core/server';  // للخادم
```

### **2. تحقق من البيئة:**
```typescript
// تحقق من البيئة قبل الاستخدام
if (typeof window !== 'undefined') {
  // كود العميل
} else {
  // كود الخادم
}
```

### **3. تحقق من Next.js Config:**
تأكد من وجود `next.config.js` مع الإعدادات الصحيحة.

## 📞 **الدعم**

إذا واجهت مشاكل:
1. تحقق من هذا الدليل
2. تأكد من استخدام المسار الصحيح
3. تحقق من إعدادات Next.js
4. راجع console للأخطاء

---

**ملاحظة**: هذا النظام مصمم ليكون آمناً وسريعاً. اتبع هذه الإرشادات للحصول على أفضل النتائج.
