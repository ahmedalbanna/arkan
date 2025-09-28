# أدوات تحليل المشروع

هذا المجلد يحتوي على مجموعة شاملة من أدوات تحليل مشروع TypeScript باستخدام أدوات مفتوحة المصدر.

## 📋 السكريبتات المتاحة

### 1. `analyze-ts-dependencies.sh`
**تحليل تبعيات TypeScript باستخدام ts-dependency-graph**

- ينشئ مخططات تفاعلية لتبعيات TypeScript
- يدعم عدة صيغ: SVG, PNG, PDF, JSON
- يحلل نقاط دخول متعددة بأعماق مختلفة
- ينشئ تقرير HTML شامل

**الميزات:**
- مخططات SVG قابلة للتكبير
- تحليل متعدد المستويات (عمق 1-3)
- تقارير HTML تفاعلية
- بيانات JSON للتحليل البرمجي

### 2. `analyze-madge-dependencies.sh`
**تحليل التبعيات باستخدام Madge**

- يحلل التبعيات الدائرية
- يكتشف التبعيات الخارجية
- يجد الملفات غير المستخدمة
- ينشئ مخططات دائرية وتقليدية

**الميزات:**
- كشف التبعيات الدائرية
- تحليل التبعيات الخارجية
- مخططات دائرية تفاعلية
- تقارير تحذيرية للتبعيات المشكلة

### 3. `generate-typedoc-docs.sh`
**إنشاء وثائق API باستخدام TypeDoc**

- ينشئ وثائق API تفاعلية
- يدعم عدة صيغ: HTML, Markdown, JSON
- يحلل جميع الفئات والواجهات
- ينشئ مخططات التوريث

**الميزات:**
- وثائق HTML تفاعلية
- وثائق Markdown قابلة للتعديل
- بيانات JSON للبرمجة
- مخططات التوريث والعلاقات

### 4. `comprehensive-project-analyzer.sh`
**تحليل شامل للمشروع**

- يجمع جميع أدوات التحليل
- ينشئ تقرير شامل موحد
- يحلل هيكل المشروع
- يجمع النتائج في مكان واحد

**الميزات:**
- تحليل شامل لجميع الجوانب
- تقرير موحد لجميع النتائج
- إحصائيات مفصلة
- توصيات للتحسين

### 5. `create-visualizations.sh`
**إنشاء مخططات متعددة الصيغ**

- ينشئ مخططات بصيغ متعددة
- يدعم SVG, PNG, PDF, JPG, WebP
- ينشئ مخططات تفاعلية
- يوفر واجهة ويب متقدمة

**الميزات:**
- مخططات بصيغ متعددة
- واجهة تفاعلية متقدمة
- فلترة وترتيب المخططات
- تحميل بصيغ مختلفة

### 6. `run-all-analysis.sh` / `run-all-analysis.bat` / `run-all-analysis.ps1`
**السكريبت الرئيسي لتشغيل جميع الأدوات**

- واجهة تفاعلية سهلة الاستخدام
- يدعم Linux, macOS, Windows
- فحص المتطلبات تلقائياً
- عرض النتائج والروابط

**الميزات:**
- واجهة قائمة تفاعلية
- فحص المتطلبات التلقائي
- عرض النتائج والروابط
- دعم متعدد المنصات

## 🚀 كيفية الاستخدام

### التثبيت المطلوب

```bash
# تثبيت الأدوات المطلوبة
npm install -g ts-dependency-graph madge typedoc

# تثبيت Graphviz (حسب نظام التشغيل)
# Ubuntu/Debian:
sudo apt-get install graphviz

# macOS:
brew install graphviz

# Windows:
choco install graphviz

# تثبيت ImageMagick (لتحويل الصور)
# Ubuntu/Debian:
sudo apt-get install imagemagick

# macOS:
brew install imagemagick

# Windows:
choco install imagemagick
```

### تشغيل السكريبتات

#### الطريقة السهلة (موصى بها)

```bash
# Linux/macOS:
./scripts/run-all-analysis.sh

# Windows (Command Prompt):
scripts\run-all-analysis.bat

# Windows (PowerShell):
.\scripts\run-all-analysis.ps1
```

#### الطريقة المتقدمة

```bash
# جعل السكريبتات قابلة للتنفيذ (Linux/macOS)
chmod +x scripts/*.sh

# تشغيل تحليل شامل (موصى به)
./scripts/comprehensive-project-analyzer.sh

# أو تشغيل كل سكريبت منفصل
./scripts/analyze-ts-dependencies.sh
./scripts/analyze-madge-dependencies.sh
./scripts/generate-typedoc-docs.sh
./scripts/create-visualizations.sh
```

## 📊 النتائج

### مجلدات الإخراج

- `docs/analysis/ts-dependencies/` - نتائج ts-dependency-graph
- `docs/analysis/madge-dependencies/` - نتائج Madge
- `docs/typedoc/` - وثائق TypeDoc
- `docs/analysis/comprehensive/` - التحليل الشامل
- `docs/visualizations/` - المخططات المتعددة

### أنواع الملفات

- **HTML**: تقارير تفاعلية
- **SVG**: مخططات قابلة للتكبير
- **PNG**: مخططات عالية الجودة
- **PDF**: مخططات للطباعة
- **JSON**: بيانات للتحليل البرمجي
- **Markdown**: وثائق قابلة للتعديل

## 🔧 التخصيص

### تعديل نقاط الدخول

يمكن تعديل نقاط الدخول في كل سكريبت:

```bash
# في analyze-ts-dependencies.sh
START_POINTS=("src/app/page.tsx" "src/app/layout.tsx" "src/ai/genkit.ts")

# في analyze-madge-dependencies.sh
ENTRY_POINTS=("src/app/page.tsx" "src/app/layout.tsx" "src/ai/genkit.ts")
```

### تعديل إعدادات المشروع

```bash
# في جميع السكريبتات
PROJECT_NAME="Arkan Project"
SOURCE_DIR="src"
OUTPUT_DIR="docs/analysis/..."
```

## 📈 التوصيات

### للاستخدام اليومي
1. استخدم `comprehensive-project-analyzer.sh` للحصول على تحليل شامل
2. راجع التبعيات الدائرية في تقرير Madge
3. استخدم وثائق TypeDoc لفهم API

### للعروض التقديمية
1. استخدم `create-visualizations.sh` لإنشاء مخططات متعددة
2. استخدم المخططات PDF للطباعة
3. استخدم المخططات PNG للعرض

### للتحليل المتقدم
1. استخدم بيانات JSON للتحليل البرمجي
2. راجع ملفات السجلات للأخطاء
3. استخدم المخططات SVG للتحليل التفصيلي

## 🐛 استكشاف الأخطاء

### مشاكل شائعة

1. **أداة غير مثبتة**
   ```bash
   # تحقق من تثبيت الأداة
   which ts-dependency-graph
   which madge
   which typedoc
   ```

2. **Graphviz غير مثبت**
   ```bash
   # تحقق من تثبيت Graphviz
   which dot
   ```

3. **صلاحيات التنفيذ**
   ```bash
   # جعل السكريبتات قابلة للتنفيذ
   chmod +x scripts/*.sh
   ```

### سجلات الأخطاء

جميع السكريبتات تحفظ سجلات في:
- `docs/analysis/comprehensive/logs/`

## 📝 ملاحظات

- جميع السكريبتات تدعم اللغة العربية
- النتائج محفوظة في مجلد `docs/`
- يمكن تشغيل السكريبتات بشكل منفصل أو مجتمعة
- جميع المخططات قابلة للتخصيص

## 🤝 المساهمة

لإضافة أدوات جديدة أو تحسين الموجودة:

1. أنشئ سكريبت جديد في مجلد `scripts/`
2. اتبع نفس نمط السكريبتات الموجودة
3. أضف التوثيق في هذا الملف
4. اختبر السكريبت على مشروعك

---

*تم إنشاء هذه الأدوات لمشروع Arkan - فريق التطوير*
