# دليل البدء السريع - Arkan

## نظرة عامة

هذا الدليل سيساعدك في إعداد بيئة التطوير لـ Arkan في أقل من 10 دقائق.

## المتطلبات الأساسية

### 1. البرمجيات المطلوبة
- **Node.js** 18.0.0 أو أحدث
- **npm** 9.0.0 أو أحدث (أو yarn)
- **Git** 2.30.0 أو أحدث
- **Firebase CLI** (للتطوير المحلي)

### 2. الحسابات المطلوبة
- حساب **Firebase** مع مشروع نشط
- حساب **OpenAI** (للميزات المتقدمة)
- حساب **GitHub** (للمساهمة)

## التثبيت خطوة بخطوة

### الخطوة 1: استنساخ المشروع

```bash
# استنساخ المستودع
git clone https://github.com/your-org/arkan.git
cd arkan

# التحقق من الإصدار
node --version  # يجب أن يكون 18.0.0 أو أحدث
npm --version   # يجب أن يكون 9.0.0 أو أحدث
```

### الخطوة 2: تثبيت التبعيات

```bash
# تثبيت جميع التبعيات
npm install

# التحقق من التثبيت
npm list --depth=0
```

### الخطوة 3: إعداد متغيرات البيئة

```bash
# نسخ ملف البيئة النموذجي
cp .env.example .env.local
```

قم بتحديث ملف `.env.local` بالقيم التالية:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# OpenAI Configuration (اختياري)
OPENAI_API_KEY=your_openai_api_key

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Arkan
```

### الخطوة 4: إعداد Firebase

```bash
# تثبيت Firebase CLI
npm install -g firebase-tools

# تسجيل الدخول إلى Firebase
firebase login

# ربط المشروع بـ Firebase
firebase use --add

# تشغيل المحاكيات المحلية
firebase emulators:start
```

### الخطوة 5: تشغيل التطبيق

```bash
# تشغيل خادم التطوير
npm run dev

# أو تشغيل مع مراقبة التغييرات
npm run dev -- --watch
```

افتح [http://localhost:3000](http://localhost:3000) في متصفحك.

## التحقق من التثبيت

### 1. اختبار الواجهة الأمامية
- ✅ الصفحة الرئيسية تحمل بنجاح
- ✅ يمكن التنقل بين الصفحات
- ✅ النماذج تعمل بشكل صحيح

### 2. اختبار قاعدة البيانات
```bash
# تشغيل اختبارات قاعدة البيانات
npm run test:db
```

### 3. اختبار API
```bash
# تشغيل اختبارات API
npm run test:api
```

## المشاكل الشائعة وحلولها

### مشكلة: خطأ في تثبيت التبعيات
```bash
# حل: مسح cache وإعادة التثبيت
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### مشكلة: خطأ في Firebase
```bash
# حل: إعادة تسجيل الدخول
firebase logout
firebase login
firebase use --add
```

### مشكلة: خطأ في متغيرات البيئة
- تأكد من أن ملف `.env.local` موجود في المجلد الجذر
- تأكد من أن جميع المتغيرات مملوءة بالقيم الصحيحة
- أعد تشغيل خادم التطوير بعد التحديث

### مشكلة: خطأ في المنافذ
```bash
# حل: استخدام منفذ مختلف
npm run dev -- --port 3001
```

## الخطوات التالية

### 1. استكشاف المشروع
- 📖 اقرأ [دليل المعمارية](ARCHITECTURE.md)
- 🧩 استكشف [مكتبة المكونات](COMPONENT_LIBRARY.md)
- 🔌 تعرف على [مرجع API](API_REFERENCE.md)

### 2. البدء في التطوير
- 👨‍💻 اتبع [دليل التطوير](DEVELOPMENT_GUIDE.md)
- 🧪 تعلم [اختبار التطبيق](guides/testing.md)
- 🚀 اكتشف [نشر التطبيق](DEPLOYMENT.md)

### 3. المساهمة
- 🤝 اقرأ [دليل المساهمة](CONTRIBUTING.md)
- 🐛 أبلغ عن الأخطاء في [GitHub Issues](https://github.com/your-org/arkan/issues)
- 💡 اقترح ميزات جديدة

## أدوات التطوير المفيدة

### 1. إضافات VS Code الموصى بها
- **ES7+ React/Redux/React-Native snippets**
- **TypeScript Importer**
- **Tailwind CSS IntelliSense**
- **Firebase**
- **GitLens**

### 2. أدوات سطر الأوامر
```bash
# مراقبة التغييرات في الملفات
npm run dev:watch

# تحليل الكود
npm run lint
npm run type-check

# تشغيل الاختبارات
npm run test
npm run test:watch
npm run test:coverage
```

### 3. أدوات التطوير المتقدمة
```bash
# تحليل الحزم
npm run analyze

# فحص الأمان
npm audit

# تحديث التبعيات
npm update
```

## الدعم والمساعدة

إذا واجهت أي مشاكل:

1. **تحقق من التوثيق**: ابحث في [دليل استكشاف الأخطاء](TROUBLESHOOTING.md)
2. **ابحث في Issues**: تحقق من [GitHub Issues](https://github.com/your-org/arkan/issues)
3. **اسأل المجتمع**: انضم إلى [Discord](https://discord.gg/arkan)
4. **أبلغ عن المشكلة**: أنشئ issue جديد

---

**مبروك!** 🎉 لقد نجحت في إعداد بيئة التطوير لـ Arkan. الآن يمكنك البدء في التطوير والمساهمة في المشروع.
