# Arkan - منصة الذكاء الاصطناعي لتوليد المستندات المهنية

## نظرة عامة

**Arkan** هي منصة شاملة مدعومة بالذكاء الاصطناعي لتوليد المستندات المهنية والعروض التقديمية والمحتوى الأكاديمي. تم بناؤها باستخدام Next.js 15 و Firebase لتوفير حل متكامل لإنشاء مستندات عالية الجودة.

## الميزات الرئيسية

### 🤖 توليد المستندات بالذكاء الاصطناعي
- **العروض التقديمية**: إنشاء عروض تقديمية احترافية من الأفكار البسيطة
- **التقارير التقنية**: توليد تقارير شاملة ومفصلة
- **المقترحات المهنية**: إنشاء مقترحات مشاريع احترافية
- **المحتوى الأكاديمي**: حل المشاكل والواجبات الأكاديمية

### 🎨 أدوات الكتابة المتقدمة
- **محسن النصوص**: تحسين جودة الكتابة والأسلوب
- **مدقق القواعد**: فحص شامل للنحو والإملاء
- **مولد الاقتباسات**: إنشاء اقتباسات أكاديمية صحيحة
- **كاشف الانتحال**: فحص أصالة المحتوى

### 📊 المخططات والرسوم البيانية
- **مخططات UML**: إنشاء مخططات تقنية متقدمة
- **الرسوم البيانية**: تصور البيانات والمعلومات
- **العروض التفاعلية**: عروض تقديمية ديناميكية

### 👥 التعاون الجماعي
- **إدارة الفرق**: تنظيم المشاريع الجماعية
- **مشاركة المستندات**: مشاركة آمنة للمحتوى
- **إدارة المستخدمين**: نظام صلاحيات متقدم

## البدء السريع

### المتطلبات الأساسية
- Node.js 18+
- npm أو yarn
- حساب Firebase

### التثبيت

```bash
# استنساخ المشروع
git clone https://github.com/your-org/arkan.git
cd arkan

# تثبيت التبعيات
npm install

# إعداد متغيرات البيئة
cp .env.example .env.local
# قم بتحديث ملف .env.local بقيم Firebase الخاصة بك

# تشغيل الخادم المحلي
npm run dev
```

### الوصول للتطبيق
افتح [http://localhost:3000](http://localhost:3000) في متصفحك.

## المعمارية

### التقنيات المستخدمة
- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Backend**: Firebase (Firestore, Auth, Functions)
- **AI**: Google Genkit, OpenAI GPT
- **State Management**: Zustand, React Query

### هيكل المشروع
```
src/
├── app/                 # صفحات التطبيق (App Router)
├── components/          # مكونات React قابلة لإعادة الاستخدام
├── hooks/              # Hooks مخصصة
├── lib/                # مكتبات مساعدة ونماذج البيانات
├── services/           # خدمات API
├── ai/                 # تكامل الذكاء الاصطناعي
└── core/               # الوظائف الأساسية
```

## الأدلة المتاحة

- 📖 [دليل البدء السريع](GETTING_STARTED.md)
- 🏗️ [دليل المعمارية](ARCHITECTURE.md)
- 👨‍💻 [دليل التطوير](DEVELOPMENT_GUIDE.md)
- 🔌 [مرجع API](API_REFERENCE.md)
- 🧩 [مكتبة المكونات](COMPONENT_LIBRARY.md)
- 🚀 [دليل النشر](DEPLOYMENT.md)
- 🤝 [دليل المساهمة](CONTRIBUTING.md)

## المساهمة

نرحب بمساهماتكم! يرجى قراءة [دليل المساهمة](CONTRIBUTING.md) للبدء.

### طرق المساهمة
- 🐛 الإبلاغ عن الأخطاء
- 💡 اقتراح ميزات جديدة
- 📝 تحسين التوثيق
- 🔧 إصلاح الأخطاء
- ✨ إضافة ميزات جديدة

## الترخيص

هذا المشروع مرخص تحت رخصة MIT - راجع ملف [LICENSE](LICENSE) للتفاصيل.

## الدعم

- 📧 البريد الإلكتروني: support@arkan.com
- 💬 Discord: [انضم إلى مجتمعنا](https://discord.gg/arkan)
- 📚 التوثيق: [docs.arkan.com](https://docs.arkan.com)
- 🐛 تتبع الأخطاء: [GitHub Issues](https://github.com/your-org/arkan/issues)

## الحالة

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/your-org/arkan/actions)
[![Coverage](https://img.shields.io/badge/coverage-85%25-green)](https://github.com/your-org/arkan/coverage)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-blue)](package.json)

---

**Arkan** - جعل إنشاء المستندات المهنية في متناول الجميع 🚀
