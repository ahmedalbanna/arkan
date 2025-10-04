# دليل استكشاف الأخطاء - Arkan

## نظرة عامة

هذا الدليل يساعدك في حل المشاكل الشائعة التي قد تواجهها أثناء التطوير أو استخدام Arkan.

## مشاكل التثبيت والإعداد

### 1. مشاكل Node.js

#### المشكلة: خطأ في إصدار Node.js
```
Error: Node.js version 16.x is not supported. Please upgrade to 18.x or later.
```

**الحل:**
```bash
# تحديث Node.js إلى الإصدار المطلوب
nvm install 18
nvm use 18

# أو استخدام npx
npx node@18 --version
```

#### المشكلة: خطأ في تثبيت التبعيات
```
npm ERR! peer dep missing: react@^18.0.0
```

**الحل:**
```bash
# مسح cache وإعادة التثبيت
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# أو استخدام yarn
yarn install
```

### 2. مشاكل Firebase

#### المشكلة: خطأ في إعداد Firebase
```
Firebase: No Firebase App '[DEFAULT]' has been created
```

**الحل:**
1. تأكد من وجود ملف `.env.local`:
```bash
cp .env.example .env.local
```

2. تأكد من صحة متغيرات البيئة:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
```

3. أعد تشغيل الخادم:
```bash
npm run dev
```

#### المشكلة: خطأ في Firebase CLI
```
Error: Command 'firebase' not found
```

**الحل:**
```bash
# تثبيت Firebase CLI
npm install -g firebase-tools

# تسجيل الدخول
firebase login

# ربط المشروع
firebase use --add
```

### 3. مشاكل المنافذ

#### المشكلة: المنفذ 3000 محجوز
```
Error: listen EADDRINUSE: address already in use :::3000
```

**الحل:**
```bash
# استخدام منفذ مختلف
npm run dev -- --port 3001

# أو إيقاف العملية التي تستخدم المنفذ
lsof -ti:3000 | xargs kill -9
```

## مشاكل التطوير

### 1. مشاكل TypeScript

#### المشكلة: خطأ في أنواع TypeScript
```
Type 'string' is not assignable to type 'number'
```

**الحل:**
```typescript
// ✅ صحيح: تحويل النوع
const numberValue = parseInt(stringValue);

// ✅ صحيح: استخدام أنواع صحيحة
interface User {
  id: string;
  age: number;
}

const user: User = {
  id: "123",
  age: 25
};
```

#### المشكلة: خطأ في استيراد المكونات
```
Module not found: Can't resolve '@/components/Button'
```

**الحل:**
1. تأكد من وجود ملف `tsconfig.json`:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

2. تأكد من وجود الملف:
```bash
ls src/components/Button.tsx
```

### 2. مشاكل React

#### المشكلة: خطأ في استخدام Hooks
```
React Hook "useState" is called conditionally
```

**الحل:**
```typescript
// ❌ خطأ: استخدام Hook شرطي
if (condition) {
  const [state, setState] = useState(initialValue);
}

// ✅ صحيح: استخدام Hook في المستوى الأعلى
const [state, setState] = useState(initialValue);
if (condition) {
  // استخدام state
}
```

#### المشكلة: خطأ في تحديث الحالة
```
Cannot read property 'map' of undefined
```

**الحل:**
```typescript
// ✅ صحيح: التحقق من وجود البيانات
const items = data?.items || [];

return (
  <div>
    {items.map(item => (
      <div key={item.id}>{item.name}</div>
    ))}
  </div>
);
```

### 3. مشاكل Tailwind CSS

#### المشكلة: الأنماط لا تظهر
```
Tailwind CSS classes not working
```

**الحل:**
1. تأكد من وجود ملف `tailwind.config.js`:
```javascript
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

2. تأكد من استيراد Tailwind في `globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## مشاكل الذكاء الاصطناعي

### 1. مشاكل Genkit

#### المشكلة: خطأ في تشغيل Genkit
```
Error: Genkit flow not found
```

**الحل:**
1. تأكد من وجود ملف `genkit.config.js`:
```javascript
module.exports = {
  flows: [
    './src/ai/flows/generateProposal.ts',
    './src/ai/flows/generateReport.ts',
  ],
};
```

2. تأكد من تسجيل التدفقات:
```typescript
// src/ai/genkit.ts
import { generateProposal } from './flows/generateProposal';

export const flows = [
  generateProposal,
];
```

#### المشكلة: خطأ في API Key
```
Error: OpenAI API key not found
```

**الحل:**
1. تأكد من وجود API Key في `.env.local`:
```env
OPENAI_API_KEY=your_openai_api_key
```

2. تأكد من صحة API Key:
```bash
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/models
```

### 2. مشاكل AI Flows

#### المشكلة: خطأ في توليد المحتوى
```
Error: AI generation failed
```

**الحل:**
1. تحقق من صحة المدخلات:
```typescript
// التحقق من صحة البيانات
const isValid = ProposalInputSchema.safeParse(input);
if (!isValid.success) {
  throw new Error('Invalid input data');
}
```

2. تحقق من اتصال الإنترنت:
```bash
ping api.openai.com
```

## مشاكل قاعدة البيانات

### 1. مشاكل Firestore

#### المشكلة: خطأ في الاتصال بقاعدة البيانات
```
Error: Firestore connection failed
```

**الحل:**
1. تأكد من إعدادات Firebase:
```typescript
// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
```

2. تأكد من قواعد الأمان:
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

#### المشكلة: خطأ في الصلاحيات
```
Error: Permission denied
```

**الحل:**
1. تحقق من تسجيل الدخول:
```typescript
const { user } = useAuth();
if (!user) {
  // إعادة توجيه إلى صفحة تسجيل الدخول
  router.push('/login');
}
```

2. تحقق من قواعد الأمان:
```javascript
// firestore.rules
match /users/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

## مشاكل الأداء

### 1. مشاكل التحميل البطيء

#### المشكلة: الصفحة تحمل ببطء
```
Page loading slowly
```

**الحل:**
1. استخدام تحميل كسول:
```typescript
const LazyComponent = lazy(() => import('./HeavyComponent'));

<Suspense fallback={<LoadingSpinner />}>
  <LazyComponent />
</Suspense>
```

2. تحسين الصور:
```typescript
import Image from 'next/image';

<Image
  src="/image.jpg"
  alt="Description"
  width={400}
  height={300}
  priority={false}
  placeholder="blur"
/>
```

### 2. مشاكل الذاكرة

#### المشكلة: استهلاك ذاكرة عالي
```
High memory usage
```

**الحل:**
1. تنظيف الـ event listeners:
```typescript
useEffect(() => {
  const handleResize = () => {
    // منطق التغيير
  };

  window.addEventListener('resize', handleResize);

  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);
```

2. استخدام useMemo و useCallback:
```typescript
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(a, b);
}, [a, b]);

const handleClick = useCallback(() => {
  // منطق النقر
}, []);
```

## مشاكل النشر

### 1. مشاكل Build

#### المشكلة: خطأ في البناء
```
Build failed
```

**الحل:**
1. تحقق من الأخطاء:
```bash
npm run build
```

2. تحقق من TypeScript:
```bash
npm run typecheck
```

3. تحقق من ESLint:
```bash
npm run lint
```

#### المشكلة: خطأ في متغيرات البيئة
```
Environment variables not found
```

**الحل:**
1. تأكد من وجود متغيرات البيئة في الإنتاج
2. استخدم `NEXT_PUBLIC_` للمتغيرات العامة:
```env
NEXT_PUBLIC_API_URL=https://api.example.com
```

### 2. مشاكل Firebase Hosting

#### المشكلة: خطأ في النشر
```
Firebase deploy failed
```

**الحل:**
1. تحقق من إعدادات Firebase:
```bash
firebase projects:list
firebase use --add
```

2. تحقق من ملف `firebase.json`:
```json
{
  "hosting": {
    "public": "out",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ]
  }
}
```

## الحصول على المساعدة

### 1. البحث في التوثيق
- اقرأ [دليل البدء السريع](GETTING_STARTED.md)
- راجع [دليل التطوير](DEVELOPMENT_GUIDE.md)
- استكشف [دليل المعمارية](ARCHITECTURE.md)

### 2. البحث في Issues
- تحقق من [GitHub Issues](https://github.com/your-org/arkan/issues)
- ابحث عن مشاكل مشابهة
- أنشئ issue جديد إذا لم تجد الحل

### 3. طلب المساعدة
- انضم إلى [Discord](https://discord.gg/arkan)
- اسأل في قناة #help
- شارك تفاصيل المشكلة والأخطاء

### 4. الإبلاغ عن الأخطاء
عند الإبلاغ عن خطأ، تأكد من تضمين:
- وصف المشكلة
- خطوات إعادة الإنتاج
- رسائل الخطأ الكاملة
- معلومات النظام (OS, Node.js version, etc.)
- لقطات الشاشة إن أمكن

## الخلاصة

هذا الدليل يغطي المشاكل الشائعة وحلولها. إذا لم تجد الحل لمشكلتك:

1. **ابحث في التوثيق** أولاً
2. **تحقق من Issues** على GitHub
3. **اسأل المجتمع** على Discord
4. **أبلغ عن المشكلة** إذا كانت جديدة

تذكر أن معظم المشاكل لها حلول بسيطة، والبحث الصحيح يوفر الوقت والجهد.
