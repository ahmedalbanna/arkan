# 🎨 Flow Builder UI Improvements

## نظرة عامة

تم تحسين واجهة **Mapping** في Flow Builder بإضافة مكونات جديدة تجعل ربط المدخلات والمخرجات أسهل وأكثر وضوحاً مع دعم visual diagrams.

---

## ✨ المكونات الجديدة

### 1️⃣ MappingBuilder Component

**المسار:** `arkan/src/components/admin/flow-builder/MappingBuilder.tsx`

#### المميزات:
- ✅ **واجهة مرئية بدلاً من JSON فقط**
- ✅ **إضافة/حذف/تعديل Mappings بسهولة**
- ✅ **عرض مرئي للتدفق بين المصدر والهدف**
- ✅ **اقتراحات للمتغيرات المتاحة**
- ✅ **أمثلة مدمجة**
- ✅ **نسخ المتغيرات بنقرة واحدة**
- ✅ **التبديل بين Visual و JSON view**

#### واجهة الاستخدام:

```tsx
<MappingBuilder
  type="input"  // or "output"
  mappings={{ content: 'step-1.output', query: 'input.question' }}
  onChange={(mappings) => {
    // Handle mapping changes
  }}
  stepId="step-2"
  allSteps={[{ id: 'step-1', name: 'Generate' }]}
/>
```

#### المظهر:

```
┌─────────────────────────────────────────────────────────┐
│ Input Mapping                                    [JSON] │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │  Step Input      →       Context Variable          │ │
│ │  [content____]   →       [step-1.output_____]  [x] │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │  [query_____]    →       [input.question____]  [x] │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ [+ Add Mapping]                                         │
│                                                         │
│ Available Variables:                                    │
│ [input.*] [step-1.output] [step-1.*]                   │
│                                                         │
│ Examples:                                               │
│ content → step-1.output (Use output from previous)     │
│ query → input.question (Use flow input field)          │
└─────────────────────────────────────────────────────────┘
```

---

### 2️⃣ DataFlowDiagram Component

**المسار:** `arkan/src/components/admin/flow-builder/DataFlowDiagram.tsx`

#### المميزات:
- ✅ **رسم بياني لتدفق البيانات بين الخطوات**
- ✅ **إبراز الخطوة الحالية**
- ✅ **عرض Input/Output mappings على كل خطوة**
- ✅ **تبسيط تلقائي للـ flows الكبيرة**
- ✅ **أيقونات ملونة للتمييز بين الأنواع**

#### واجهة الاستخدام:

```tsx
<DataFlowDiagram
  steps={allSteps}
  currentStepId="step-2"
  highlightedVariable="content"
/>
```

#### المظهر:

```
┌─────────────────────────────────────────────────────┐
│ Data Flow                                  [Hide ▼] │
├─────────────────────────────────────────────────────┤
│                                                     │
│          ┌────────────────────┐                     │
│          │   📦 Flow Input    │                     │
│          │  Initial data      │                     │
│          └────────────────────┘                     │
│                    ↓                                │
│          ┌────────────────────┐                     │
│          │  ⚡ Step 1          │                     │
│          │  Generate Content  │                     │
│          │ ────────────────── │                     │
│          │ Out: [content]     │                     │
│          └────────────────────┘                     │
│                    ↓                                │
│          ┌────────────────────┐                     │
│          │  ⚡ Step 2  [•]     │ ← Current          │
│          │  Analyze Content   │                     │
│          │ ────────────────── │                     │
│          │ In: [content]      │                     │
│          │ Out: [analysis]    │                     │
│          └────────────────────┘                     │
│                    ↓                                │
│          ┌────────────────────┐                     │
│          │  🔶 Flow Output    │                     │
│          │   Final result     │                     │
│          └────────────────────┘                     │
│                                                     │
│ Legend: 📦 Input  ⚡ Step  📦 Variable  • Current   │
└─────────────────────────────────────────────────────┘
```

---

### 3️⃣ VariableBrowser Component

**المسار:** `arkan/src/components/admin/flow-builder/VariableBrowser.tsx`

#### المميزات:
- ✅ **استعراض جميع المتغيرات المتاحة**
- ✅ **تصنيف حسب المصدر (Input, Steps, Context)**
- ✅ **بحث بالاسم أو المسار**
- ✅ **نسخ المسار بنقرة واحدة**
- ✅ **عرض شجري للمتغيرات المتداخلة**
- ✅ **معلومات إضافية عن كل متغير**

#### واجهة الاستخدام:

```tsx
<VariableBrowser
  steps={allSteps}
  currentStepId="step-2"
  flowInputSchema={flowConfig.inputSchema}
  onSelectVariable={(path) => console.log('Selected:', path)}
/>
```

#### المظهر:

```
┌──────────────────────────────────────────┐
│ Available Variables                      │
│ Click to copy variable path              │
├──────────────────────────────────────────┤
│ [Search variables...]                    │
├──────────────────────────────────────────┤
│                                          │
│ ▼ 📦 Flow Inputs          [Flow Input]  │
│   └─ topic                         [📋] │
│   └─ tone                          [📋] │
│                                          │
│ ▼ ⚡ Previous Steps                      │
│   ▼ Generate Content      [Step 1]      │
│     └─ output                      [📋] │
│     └─ result                      [📋] │
│   ▶ Analyze Content       [Step 2]      │
│                                          │
│ ▼ 📦 Context Variables                   │
│   └─ generatedContent     [Step 1] [📋] │
│   └─ contentLength        [Step 1] [📋] │
│                                          │
│ Quick Reference:                         │
│ → input.field      - Flow input          │
│ → step-1.output    - Step output         │
│ → variableName     - Context var         │
│                                          │
│ Legend: 📦 Input  ⚡ Step  📦 Context    │
└──────────────────────────────────────────┘
```

---

## 🔄 التحديثات على StepConfigPanel

**المسار:** `arkan/src/components/admin/flow-builder/StepConfigPanel.tsx`

### التحسينات:

#### 1. استبدال JSON Textarea بـ MappingBuilder

**قبل:**
```tsx
<Textarea
  value={JSON.stringify(editedStep.contextMapping?.input || {}, null, 2)}
  onChange={(e) => {
    // Parse JSON...
  }}
  placeholder='{"stepInput": "contextVariable"}'
  rows={4}
/>
```

**بعد:**
```tsx
<MappingBuilder
  type="input"
  mappings={editedStep.contextMapping?.input || {}}
  onChange={(mappings) => {
    setEditedStep((prev) => ({
      ...prev,
      contextMapping: { ...prev.contextMapping, input: mappings }
    }));
  }}
  stepId={editedStep.id}
  allSteps={allSteps}
/>
```

#### 2. إضافة Data Flow Diagram

```tsx
{/* Data Flow Visualization Toggle */}
<Button onClick={() => setShowDataFlow(!showDataFlow)}>
  <GitBranch className="w-4 h-4 mr-2" />
  {showDataFlow ? 'Hide' : 'Show'} Data Flow
</Button>

{/* Data Flow Diagram */}
{showDataFlow && (
  <DataFlowDiagram
    steps={allSteps}
    currentStepId={editedStep.id}
  />
)}
```

#### 3. تخطيط جديد: Side by Side

```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
  {/* Left: Variable Browser */}
  <div className="lg:col-span-1">
    <VariableBrowser {...props} />
  </div>

  {/* Right: Mapping Builders */}
  <div className="lg:col-span-2 space-y-4">
    <MappingBuilder type="input" {...props} />
    <MappingBuilder type="output" {...props} />
  </div>
</div>
```

---

## 📸 لقطات شاشة للواجهة الجديدة

### التخطيط الكامل

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Configure Step                                                    [X]    │
├──────────────────────────────────────────────────────────────────────────┤
│ [Basic] [Prompt] [Model] [Mapping] [Advanced]                           │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ [Show Data Flow ▼]                                                       │
│                                                                          │
│ ┌────────────────────────────────────────────────────────────────────┐  │
│ │                        Data Flow Diagram                           │  │
│ │  Flow Input → Step 1 → [Step 2] → Step 3 → Flow Output           │  │
│ └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│ ┌──────────────────┬─────────────────────────────────────────────────┐  │
│ │ Variable Browser │           Mapping Configuration                │  │
│ │                  │                                                 │  │
│ │ 📦 Flow Inputs   │  Input Mapping                         [JSON]  │  │
│ │ └─ topic         │  ┌────────────────────────────────────────┐    │  │
│ │ └─ tone          │  │ content → step-1.output            [x] │    │  │
│ │                  │  └────────────────────────────────────────┘    │  │
│ │ ⚡ Previous Steps │  [+ Add Mapping]                               │  │
│ │ ▶ Step 1         │                                                 │  │
│ │                  │  Output Mapping                        [JSON]  │  │
│ │ 📦 Context Vars  │  ┌────────────────────────────────────────┐    │  │
│ │ └─ content       │  │ result → analyzedContent           [x] │    │  │
│ │                  │  └────────────────────────────────────────┘    │  │
│ │ [Search...]      │  [+ Add Mapping]                               │  │
│ └──────────────────┴─────────────────────────────────────────────────┘  │
│                                                                          │
│                                            [Cancel] [Save Changes]      │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 ميزات التحسينات

### 1. سهولة الاستخدام
- ❌ **قبل:** كتابة JSON يدوياً مع احتمال الأخطاء
- ✅ **بعد:** واجهة مرئية مع التحقق التلقائي

### 2. الاكتشاف
- ❌ **قبل:** يجب معرفة أسماء المتغيرات المتاحة
- ✅ **بعد:** استعراض جميع المتغيرات مع البحث

### 3. الفهم
- ❌ **قبل:** صعوبة فهم تدفق البيانات بين الخطوات
- ✅ **بعد:** رسم بياني واضح للتدفق الكامل

### 4. الإنتاجية
- ❌ **قبل:** نسخ/لصق المتغيرات يدوياً
- ✅ **بعد:** نقرة واحدة للنسخ + اقتراحات ذكية

### 5. تجنب الأخطاء
- ❌ **قبل:** أخطاء JSON + أخطاء في أسماء المتغيرات
- ✅ **بعد:** التحقق التلقائي + عرض الأخطاء

---

## 📝 أمثلة على الاستخدام

### مثال 1: إعداد Input Mapping بسيط

**الخطوات:**
1. افتح Configure Step للخطوة المطلوبة
2. اذهب إلى تبويب **Mapping**
3. في قسم **Variable Browser**، ابحث عن المتغير المطلوب
4. انقر على المتغير لنسخه
5. في **Input Mapping**، انقر **Add Mapping**
6. الصق اسم المتغير في حقل **Context Variable**
7. احفظ التغييرات

### مثال 2: استخدام Data Flow Diagram

**الخطوات:**
1. افتح Configure Step
2. اذهب إلى **Mapping**
3. انقر **Show Data Flow**
4. شاهد الرسم البياني لفهم تدفق البيانات
5. لاحظ الخطوة الحالية مميزة
6. اضبط Mappings بناءً على الفهم

### مثال 3: استعراض المتغيرات المتاحة

**الخطوات:**
1. في **Variable Browser**، وسّع **Previous Steps**
2. شاهد جميع مخرجات الخطوات السابقة
3. استخدم البحث للعثور على متغير معين
4. انقر على أي متغير لنسخ مساره
5. استخدم المسار في Input/Output Mapping

---

## 🔧 التكامل مع الكود الموجود

### التحديثات المطلوبة

#### 1. FlowBuilderCanvas.tsx

```tsx
<StepConfigPanel
  step={selectedNode.data.step}
  onUpdate={handleUpdate}
  onClose={handleClose}
  // ✅ إضافة هذه الـ props
  allSteps={nodes.map((node) => node.data.step)}
  flowConfig={flowConfig}
/>
```

#### 2. استيراد المكونات الجديدة

```tsx
import { MappingBuilder } from './MappingBuilder';
import { DataFlowDiagram } from './DataFlowDiagram';
import { VariableBrowser } from './VariableBrowser';
```

---

## 🎨 التصميم والألوان

### نظام الألوان

- 🔵 **Blue** (`border-blue-500`) - Flow Inputs
- 🟣 **Purple** (`border-purple-500`) - Steps
- 🟢 **Green** (`border-green-500`) - Context Variables
- 🟠 **Orange** (`border-orange-500`) - Flow Output
- 🔴 **Primary** (`border-primary`) - Current/Selected

### الأيقونات

- 📦 `Database` - Flow Input
- ⚡ `Zap` - Step
- 📦 `Box` - Variable
- 🔶 `CircleDot` - Output
- 🔀 `GitBranch` - Data Flow
- → `ArrowRight` - Direction
- 📋 `Copy` - Copy Action
- ✓ `Check` - Copied Confirmation

---

## ⚡ الأداء

### التحسينات

1. **Memoization:**
   ```tsx
   const variables = useMemo(() => {
     // Build variable tree
   }, [steps, currentStepIndex, flowInputSchema]);
   ```

2. **Lazy Loading:**
   - Data Flow Diagram يظهر فقط عند الطلب
   - Variable Browser يتم تحميله مرة واحدة

3. **Optimized Re-renders:**
   - استخدام `useCallback` للـ handlers
   - State management محسّن

---

## 🐛 معالجة الأخطاء

### 1. JSON غير صالح

**المشكلة:** المستخدم يكتب JSON خاطئ في الـ textarea القديمة

**الحل:** MappingBuilder يتحقق تلقائياً ويمنع الأخطاء

### 2. متغيرات غير موجودة

**المشكلة:** استخدام متغير من خطوة غير موجودة

**الحل:** Variable Browser يعرض فقط المتغيرات المتاحة

### 3. Circular Dependencies

**المشكلة:** خطوة تحاول استخدام مخرجاتها الخاصة

**الحل:** Data Flow Diagram يوضح التدفق ويمنع الحلقات

---

## 📚 الوثائق الإضافية

- **دليل الاستخدام:** `FLOW_BUILDER_INPUT_OUTPUT_MAPPING_GUIDE.md`
- **أمثلة:** `arkan/src/ai/dynamic-flow/example.ts`
- **API Docs:** `arkan/docs/API_DOCUMENTATION.md`

---

## ✅ قائمة التحقق

### للمطورين

- [x] إنشاء MappingBuilder component
- [x] إنشاء DataFlowDiagram component
- [x] إنشاء VariableBrowser component
- [x] تحديث StepConfigPanel
- [x] تحديث FlowBuilderCanvas
- [x] إضافة الوثائق
- [ ] إضافة Unit Tests
- [ ] إضافة Integration Tests
- [ ] تحديث Storybook

### للمستخدمين

- [ ] قراءة الدليل الجديد
- [ ] تجربة MappingBuilder
- [ ] استخدام Data Flow Diagram
- [ ] استعراض Variable Browser
- [ ] إنشاء flow جديد بالواجهة المحسّنة

---

## 🚀 الخطوات التالية

### المميزات المستقبلية

1. **Auto-Suggest:** اقتراح mappings بناءً على الأنماط الشائعة
2. **Validation:** التحقق من صحة المسارات في الوقت الفعلي
3. **Templates:** قوالب جاهزة للـ mappings الشائعة
4. **Drag & Drop:** سحب وإفلات المتغيرات
5. **Visual Connections:** خطوط توضيحية بين المتغيرات
6. **Export/Import:** تصدير واستيراد configurations
7. **Version History:** تتبع التغييرات
8. **Collaborative Editing:** تعديل متعدد المستخدمين

---

## 💡 نصائح للاستخدام

### Tip 1: استخدم Data Flow أولاً
قبل إعداد Mappings، افتح Data Flow Diagram لفهم البنية العامة

### Tip 2: استعرض المتغيرات
تحقق من Variable Browser قبل كتابة أي مسار يدوياً

### Tip 3: استخدم الأمثلة
راجع الأمثلة المدمجة في كل مكون للإلهام

### Tip 4: ابدأ بسيط
ابدأ بـ mapping واحد وزد تدريجياً

### Tip 5: احفظ بشكل متكرر
احفظ عملك بانتظام لتجنب فقدان التغييرات

---

تم إنشاء هذا الملف بواسطة Rovo Dev 🤖
التاريخ: 2026-01-14
