# دليل اختبار نظام تصدير DOCX
# DOCX Export System Testing Guide

---

## 🧪 خطة الاختبار | Test Plan

### الاختبارات الأساسية | Basic Tests

#### ✅ 1. اختبار تصدير مشروع كامل
**Test: Full Project Export**

```typescript
// الخطوات | Steps:
1. افتح مشروع موجود | Open existing project
2. اذهب إلى Export Dialog
3. اختر "Export Full Project"
4. اختر قالب Modern
5. فعّل "Include TOC" و "Page Numbers"
6. اضغط Export

// النتيجة المتوقعة | Expected Result:
✓ ملف DOCX يُحمّل بنجاح
✓ صفحة غلاف كاملة مع جميع المعلومات
✓ جدول محتويات بتنسيق احترافي
✓ أرقام صفحات في التذييل
✓ تنسيق نصوص احترافي
```

#### ✅ 2. اختبار القوالب الثلاثة
**Test: Three Templates**

```typescript
// قالب Modern
✓ خط Calibri
✓ ألوان زرقاء
✓ مظهر عصري

// قالب Classic
✓ خط Times New Roman
✓ ألوان أحادية
✓ مظهر كلاسيكي

// قالب Academic
✓ خط Garamond
✓ مسافات مضاعفة
✓ مظهر أكاديمي
```

#### ✅ 3. اختبار صفحة الغلاف
**Test: Cover Page**

```typescript
// اختبار مع شعار
Project with universityLogoUrl:
✓ الشعار يظهر في الأعلى
✓ محاذاة مركزية

// اختبار بدون شعار
Project without logo:
✓ العنوان في الأعلى
✓ لا أخطاء

// اختبار جميع الحقول
✓ اسم المشروع
✓ الوصف
✓ نوع المشروع
✓ التخصص
✓ أسماء الطلاب
✓ اسم المشرف
✓ اسم الجامعة
✓ المقرر
✓ المستوى الدراسي
✓ التاريخ والعام الدراسي
```

#### ✅ 4. اختبار المحتوى
**Test: Content Types**

```typescript
// العناوين | Headings
✓ H1 - كبير وملون
✓ H2 - متوسط
✓ H3-H5 - صغيرة بتدرج

// الفقرات | Paragraphs
✓ حجم 12pt
✓ تباعد 1.5
✓ محاذاة ضبط تلقائي

// القوائم | Lists
✓ قوائم مرقمة
✓ قوائم نقطية
✓ قوائم متداخلة

// الجداول | Tables
✓ رأس أزرق
✓ صفوف متناوبة
✓ حدود واضحة

// الكود | Code
✓ خط Consolas
✓ خلفية فاتحة
✓ حد أزرق يساري

// الاقتباسات | Quotes
✓ خلفية خفيفة
✓ حد جانبي
✓ هوامش أكبر
```

#### ✅ 5. اختبار اللغات
**Test: Languages**

```typescript
// محتوى عربي | Arabic Content
✓ التاريخ بالعربية
✓ "صفحة X من Y"
✓ "العام الدراسي"
✓ RTL support

// محتوى إنجليزي | English Content
✓ Date in English
✓ "Page X of Y"
✓ "Academic Year"
✓ LTR support

// محتوى مختلط | Mixed Content
✓ يعمل بدون مشاكل
✓ كل قسم بلغته
```

#### ✅ 6. اختبار معالجة الأخطاء
**Test: Error Handling**

```typescript
// مشروع فارغ | Empty Project
Input: project.content = []
Expected: Error message "Project has no content to export"

// ماركداون فارغ | Empty Markdown
Input: markdown = ""
Expected: Error message "Invalid markdown"

// مدخلات null | Null Input
Input: null
Expected: Error message "Input is required"

// محتوى تالف | Corrupted Content
Input: invalid content structure
Expected: Graceful degradation + error log
```

---

## 🎯 سيناريوهات اختبار متقدمة | Advanced Test Scenarios

### السيناريو 1: مشروع كبير
**Scenario 1: Large Project**

```
- 10+ فصول
- 50+ صفحة
- جداول كثيرة
- صور متعددة

النتيجة المتوقعة:
✓ التصدير ينجح
✓ TOC شامل
✓ لا بطء ملحوظ
✓ جميع العناصر تظهر
```

### السيناريو 2: محتوى معقد
**Scenario 2: Complex Content**

```
- معادلات رياضية
- كود بلغات متعددة
- جداول متداخلة
- قوائم معقدة

النتيجة المتوقعة:
✓ كل شيء يُعرض بشكل صحيح
✓ التنسيق محفوظ
✓ لا أخطاء
```

### السيناريو 3: محتوى محدد
**Scenario 3: Selected Content**

```
- اختيار 3 فصول من 10
- تصدير فقط ما تم اختياره

النتيجة المتوقعة:
✓ فقط الفصول المحددة تُصدّر
✓ TOC يعكس المحتوى المحدد
✓ الترقيم صحيح
```

---

## 📋 قائمة التحقق | Checklist

### قبل الاختبار | Before Testing
- [ ] تأكد من بناء المشروع بنجاح
- [ ] لا أخطاء TypeScript
- [ ] لا تحذيرات ESLint
- [ ] البيئة جاهزة

### أثناء الاختبار | During Testing
- [ ] اختبر كل قالب (Modern, Classic, Academic)
- [ ] اختبر مع وبدون TOC
- [ ] اختبر مع وبدون Page Numbers
- [ ] اختبر محتوى عربي
- [ ] اختبر محتوى إنجليزي
- [ ] اختبر محتوى مختلط
- [ ] اختبر صفحة غلاف كاملة
- [ ] اختبر صفحة غلاف جزئية
- [ ] اختبر مشروع كبير
- [ ] اختبر مشروع صغير
- [ ] اختبر معالجة الأخطاء

### بعد الاختبار | After Testing
- [ ] افتح ملفات DOCX في Microsoft Word
- [ ] افتح ملفات DOCX في Google Docs
- [ ] تحقق من التنسيق
- [ ] تحقق من الروابط في TOC
- [ ] تحقق من أرقام الصفحات
- [ ] سجل أي مشاكل

---

## 🐛 المشاكل الشائعة وحلولها | Common Issues & Solutions

### المشكلة 1: الخطوط لا تظهر
**Problem: Fonts not displaying**

```
الأعراض | Symptoms:
- الخطوط تظهر بديلة
- التنسيق مختلف

الحل | Solution:
- تأكد من تثبيت الخطوط:
  • Calibri (Modern)
  • Times New Roman (Classic)
  • Garamond (Academic)
  • Consolas (Code)
```

### المشكلة 2: صفحة الغلاف فارغة
**Problem: Empty Cover Page**

```
الأعراض | Symptoms:
- صفحة غلاف بيضاء

الحل | Solution:
- تحقق من:
  • project.name موجود
  • project.university موجود
  • معلومات أساسية متوفرة
```

### المشكلة 3: TOC لا يعمل
**Problem: TOC not working**

```
الأعراض | Symptoms:
- TOC فارغ أو لا يظهر

الحل | Solution:
- في Word: Right-click TOC → Update Field
- تحقق من وجود عناوين (H1-H5)
```

### المشكلة 4: أخطاء في التصدير
**Problem: Export Errors**

```
الأعراض | Symptoms:
- رسائل خطأ

الحل | Solution:
1. تحقق من console للتفاصيل
2. تأكد من صحة البيانات
3. جرب قالب آخر
4. تحقق من اتصال الإنترنت (للصور)
```

---

## 📊 نموذج تقرير اختبار | Test Report Template

```markdown
## تقرير اختبار DOCX Export
**التاريخ:** ___________
**المُختبِر:** ___________

### الاختبارات الأساسية
- [ ] تصدير مشروع كامل: ✅ نجح / ❌ فشل
- [ ] قالب Modern: ✅ / ❌
- [ ] قالب Classic: ✅ / ❌
- [ ] قالب Academic: ✅ / ❌
- [ ] صفحة الغلاف: ✅ / ❌
- [ ] جدول المحتويات: ✅ / ❌
- [ ] ترقيم الصفحات: ✅ / ❌
- [ ] محتوى عربي: ✅ / ❌
- [ ] محتوى إنجليزي: ✅ / ❌

### الجودة
- التنسيق: ⭐⭐⭐⭐⭐ (1-5)
- سهولة الاستخدام: ⭐⭐⭐⭐⭐
- الاستقرار: ⭐⭐⭐⭐⭐
- المظهر الاحترافي: ⭐⭐⭐⭐⭐

### المشاكل المكتشفة
1. ___________
2. ___________

### التوصيات
1. ___________
2. ___________

### الخلاصة
✅ جاهز للإنتاج
⚠️ يحتاج تحسينات بسيطة
❌ يحتاج عمل إضافي
```

---

## 🚀 بدء الاختبار | Start Testing

### الأمر السريع | Quick Command

```bash
# تشغيل المشروع
cd /teamspace/studios/this_studio/arkan
npm run dev

# في متصفح آخر
# افتح: http://localhost:9002
# اذهب إلى: Projects → Your Project → Export
```

### الاختبار اليدوي | Manual Testing

1. **إنشاء مشروع اختبار:**
   - اسم: "مشروع اختبار التصدير"
   - محتوى: 3-5 فصول
   - صور وجداول
   - كود واقتباسات

2. **تصدير بكل قالب:**
   - Modern → test-modern.docx
   - Classic → test-classic.docx
   - Academic → test-academic.docx

3. **فتح في Word/Google Docs:**
   - تحقق من التنسيق
   - اختبر الروابط
   - تحقق من الأرقام

4. **سجل النتائج:**
   - استخدم نموذج التقرير أعلاه

---

## 📝 ملاحظات إضافية | Additional Notes

### التوافق | Compatibility
- ✅ Microsoft Word 2016+
- ✅ Microsoft Word Online
- ✅ Google Docs
- ✅ LibreOffice Writer
- ⚠️ قد تختلف بعض التنسيقات في برامج مختلفة

### الأداء | Performance
- مشاريع صغيرة (<10 صفحات): < 2 ثانية
- مشاريع متوسطة (10-50 صفحة): 2-5 ثواني
- مشاريع كبيرة (50+ صفحة): 5-10 ثواني

### حجم الملفات | File Size
- نص فقط: ~50KB
- مع صور: يعتمد على حجم الصور
- متوسط: 100-500KB

---

## ✅ الخلاصة | Conclusion

النظام جاهز للاختبار الشامل!
اتبع هذا الدليل لضمان جودة التصدير.

**حظاً موفقاً! Good Luck Testing! 🎉**

---

**آخر تحديث:** 2026-01-17
