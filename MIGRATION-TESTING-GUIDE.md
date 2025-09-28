# دليل اختبار الهجرة - المرحلة 4.1

## 🎯 **الهدف**
اختبار جميع routes المهاجرة للتأكد من عملها بشكل صحيح قبل التطبيق النهائي.

## 📋 **خطة الاختبار**

### **1. اختبارات الوحدة (Unit Tests)**

#### **Auth Routes**
```bash
# اختبار auth/session
curl -X POST http://localhost:3000/api/auth/session \
  -H "Content-Type: application/json" \
  -d '{"idToken": "test-token"}'

# اختبار auth/logout
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer test-token"

# اختبار auth/signup
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123", "name": "Test User"}'
```

#### **User Routes**
```bash
# اختبار users/[id] - GET
curl -X GET http://localhost:3000/api/users/test-user-123 \
  -H "Authorization: Bearer test-token"

# اختبار users/[id] - PUT
curl -X PUT http://localhost:3000/api/users/test-user-123 \
  -H "Authorization: Bearer test-token" \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Name", "bio": "Updated bio"}'

# اختبار users/[id] - DELETE (admin only)
curl -X DELETE http://localhost:3000/api/users/test-user-123 \
  -H "Authorization: Bearer admin-token"
```

#### **Writing Tools Routes**
```bash
# اختبار writing-tools/[tool] - POST
curl -X POST http://localhost:3000/api/writing-tools/paraphrase \
  -H "Authorization: Bearer test-token" \
  -H "Content-Type: application/json" \
  -d '{"text": "This is a test text.", "options": {}}'

# اختبار writing-tools/[tool] - GET
curl -X GET http://localhost:3000/api/writing-tools/paraphrase

# اختبار writing-tools/[tool] - OPTIONS
curl -X OPTIONS http://localhost:3000/api/writing-tools/paraphrase
```

#### **Admin Routes**
```bash
# اختبار admin/users - GET
curl -X GET http://localhost:3000/api/admin/users?limit=10 \
  -H "Authorization: Bearer admin-token"

# اختبار admin/users - POST
curl -X POST http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer admin-token" \
  -H "Content-Type: application/json" \
  -d '{"name": "New User", "email": "new@example.com", "password": "password123"}'

# اختبار admin/dashboard-stats - GET
curl -X GET http://localhost:3000/api/admin/dashboard-stats?period=30d \
  -H "Authorization: Bearer admin-token"
```

### **2. اختبارات الأداء (Performance Tests)**

#### **مقارنة الأداء**
```typescript
// اختبار سرعة الاستجابة
const startTime = performance.now();
const response = await fetch('/api/users/test-user-123');
const endTime = performance.now();
console.log(`Response time: ${endTime - startTime}ms`);
```

#### **اختبار الحمل (Load Testing)**
```bash
# اختبار 100 طلب متزامن
for i in {1..100}; do
  curl -X GET http://localhost:3000/api/users/test-user-123 \
    -H "Authorization: Bearer test-token" &
done
wait
```

### **3. اختبارات الأمان (Security Tests)**

#### **اختبار المصادقة**
```bash
# اختبار بدون token
curl -X GET http://localhost:3000/api/users/test-user-123

# اختبار مع token غير صحيح
curl -X GET http://localhost:3000/api/users/test-user-123 \
  -H "Authorization: Bearer invalid-token"

# اختبار مع token منتهي الصلاحية
curl -X GET http://localhost:3000/api/users/test-user-123 \
  -H "Authorization: Bearer expired-token"
```

#### **اختبار الصلاحيات**
```bash
# اختبار user يحاول الوصول لملف user آخر
curl -X GET http://localhost:3000/api/users/other-user-456 \
  -H "Authorization: Bearer test-user-token"

# اختبار user يحاول حذف user آخر
curl -X DELETE http://localhost:3000/api/users/other-user-456 \
  -H "Authorization: Bearer test-user-token"
```

### **4. اختبارات البيانات (Data Tests)**

#### **اختبار التحقق من البيانات**
```bash
# اختبار بيانات غير صحيحة
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "invalid-email", "password": "123", "name": ""}'

# اختبار بيانات مفقودة
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{}'
```

#### **اختبار الحدود**
```bash
# اختبار نص طويل جداً
curl -X POST http://localhost:3000/api/writing-tools/paraphrase \
  -H "Authorization: Bearer test-token" \
  -H "Content-Type: application/json" \
  -d '{"text": "' + 'a'.repeat(100000) + '"}'
```

## 🧪 **أدوات الاختبار**

### **1. اختبار تلقائي**
```bash
# تشغيل اختبارات الهجرة
npm run migration:test

# تشغيل جميع الاختبارات
npm run test

# تشغيل اختبارات الأداء
npm run test:performance
```

### **2. اختبار يدوي**
```bash
# تشغيل الخادم
npm run dev

# اختبار routes في المتصفح
# http://localhost:3000/api/auth/session
# http://localhost:3000/api/users/test-user-123
# http://localhost:3000/api/writing-tools/paraphrase
```

### **3. اختبار API**
```bash
# استخدام Postman أو Insomnia
# استيراد collection من ملفات الاختبار
```

## 📊 **معايير النجاح**

### **1. اختبارات الوحدة**
- ✅ جميع routes تستجيب بنجاح
- ✅ رموز الحالة HTTP صحيحة
- ✅ البيانات المُرجعة صحيحة
- ✅ معالجة الأخطاء تعمل

### **2. اختبارات الأداء**
- ✅ وقت الاستجابة < 500ms
- ✅ تحسن الأداء بنسبة 20%+
- ✅ استهلاك الذاكرة محسن
- ✅ معدل الأخطاء < 1%

### **3. اختبارات الأمان**
- ✅ المصادقة تعمل بشكل صحيح
- ✅ الصلاحيات محمية
- ✅ البيانات الحساسة محمية
- ✅ Rate limiting يعمل

### **4. اختبارات البيانات**
- ✅ التحقق من البيانات يعمل
- ✅ معالجة الأخطاء صحيحة
- ✅ الحدود محترمة
- ✅ البيانات محفوظة بشكل صحيح

## 🚨 **خطة الطوارئ**

### **في حالة فشل الاختبارات:**

1. **توقف فوري** عن التطبيق
2. **استعادة النسخ الاحتياطية**
   ```bash
   npm run migration:restore
   ```
3. **تحليل الأخطاء** وتحديد السبب
4. **إصلاح المشاكل** في الملفات المهاجرة
5. **إعادة الاختبار** بعد الإصلاح

### **في حالة نجاح الاختبارات:**

1. **تطبيق الهجرة**
   ```bash
   npm run migration:apply
   ```
2. **اختبار نهائي** في بيئة الإنتاج
3. **مراقبة الأداء** لمدة 24 ساعة
4. **توثيق النتائج** والتحسينات

## 📝 **تقرير الاختبار**

### **نموذج تقرير الاختبار:**
```markdown
# تقرير اختبار الهجرة - [التاريخ]

## النتائج العامة
- ✅ اختبارات الوحدة: X/X نجح
- ✅ اختبارات الأداء: تحسن X%
- ✅ اختبارات الأمان: X/X نجح
- ✅ اختبارات البيانات: X/X نجح

## المشاكل المكتشفة
- [قائمة المشاكل إن وجدت]

## التحسينات المقترحة
- [قائمة التحسينات]

## التوصية
- [موافقة/رفض] التطبيق
```

## 🔄 **الخطوات التالية**

بعد نجاح الاختبارات:

1. **تطبيق الهجرة** باستخدام السكريبت
2. **مراقبة الأداء** في الإنتاج
3. **هجرة routes إضافية** حسب الحاجة
4. **تحسينات مستمرة** بناءً على النتائج

---

**ملاحظة**: هذا الدليل يتم تحديثه مع تقدم الاختبارات واكتشاف مشاكل جديدة.
