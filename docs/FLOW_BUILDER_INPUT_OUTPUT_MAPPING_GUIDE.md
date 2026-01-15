# 📚 دليل ربط المدخلات والمخرجات في Flow Builder

## نظرة عامة

في **Flow Builder**، يمكنك ربط المدخلات والمخرجات بين الخطوات المختلفة باستخدام نظامين:

1. **Context Mapping** - نظام قديم (في `arkan/src/ai/dynamic-flow`)
2. **Input/Output Mapping** - نظام جديد (في SDK)

---

## 🎯 النظام الجديد: Input/Output Mapping (موصى به)

### البنية الأساسية

```typescript
interface FlowStep {
  id: string;
  type: StepType;
  name: string;
  
  // ✅ نظام Mapping الجديد
  inputMapping?: Record<string, string>;   // ربط متغيرات السياق → مدخلات الخطوة
  outputMapping?: Record<string, string>;  // ربط مخرجات الخطوة → متغيرات السياق
  
  config: StepConfig;
  inputSchema: Record<string, any>;
  outputSchema: Record<string, any>;
}
```

### 1️⃣ Input Mapping - ربط المدخلات

يربط المتغيرات من **السياق العام (Context)** إلى **مدخلات الخطوة**.

#### مثال:

```typescript
{
  id: 'step-2',
  name: 'Analyze Content',
  type: 'GENERATE',
  
  // 📥 Input Mapping
  inputMapping: {
    'content': 'step-1.output',           // من مخرجات الخطوة السابقة
    'userQuery': 'input.query',           // من مدخلات Flow الأساسية
    'tone': 'settings.defaultTone'        // من متغيرات السياق
  },
  
  config: {
    type: 'GENERATE',
    promptId: 'analyze-prompt',
    model: 'gemini-2.0-flash-exp'
  }
}
```

**كيف يعمل:**
- `'content': 'step-1.output'` → يأخذ قيمة `step-1.output` من السياق ويضعها في `content`
- `'userQuery': 'input.query'` → يأخذ قيمة `input.query` من مدخلات Flow
- `'tone': 'settings.defaultTone'` → يأخذ قيمة من متغير `settings.defaultTone`

### 2️⃣ Output Mapping - ربط المخرجات

يربط **مخرجات الخطوة** إلى **متغيرات السياق** لاستخدامها في الخطوات التالية.

#### مثال:

```typescript
{
  id: 'step-1',
  name: 'Generate Summary',
  type: 'GENERATE',
  
  // 📤 Output Mapping
  outputMapping: {
    'result': 'summary',                   // حفظ المخرج في متغير 'summary'
    'metadata.wordCount': 'summaryLength', // حفظ جزء من المخرج
    'metadata.language': 'detectedLang'
  },
  
  config: {
    type: 'GENERATE',
    promptId: 'summarize-prompt',
    model: 'gemini-2.0-flash-exp'
  }
}
```

**كيف يعمل:**
- `'result': 'summary'` → يحفظ `output.result` في متغير السياق `summary`
- `'metadata.wordCount': 'summaryLength'` → يحفظ قيمة متداخلة في متغير
- يمكن للخطوات التالية استخدام `summary` أو `summaryLength`

---

## 🔗 مثال متكامل: Flow من 3 خطوات

```typescript
const flowConfig: FlowConfiguration = {
  id: 'content-analysis-flow',
  name: 'Content Analysis Flow',
  description: 'Analyze and improve content',
  
  steps: [
    // 🔹 الخطوة 1: توليد محتوى أولي
    {
      id: 'step-1',
      name: 'Generate Initial Content',
      type: 'GENERATE',
      
      inputMapping: {
        'topic': 'input.topic',        // من مدخلات Flow
        'tone': 'input.tone'
      },
      
      outputMapping: {
        '': 'initialContent',          // حفظ كل المخرج
        'wordCount': 'contentLength'
      },
      
      config: {
        type: 'GENERATE',
        promptId: 'generate-content',
        model: 'gemini-2.0-flash-exp'
      }
    },
    
    // 🔹 الخطوة 2: تحليل المحتوى
    {
      id: 'step-2',
      name: 'Analyze Content',
      type: 'GENERATE',
      
      inputMapping: {
        'content': 'initialContent',    // من مخرجات step-1
        'targetLength': 'input.maxWords'
      },
      
      outputMapping: {
        'analysis': 'contentAnalysis',
        'suggestions': 'improvements',
        'score': 'qualityScore'
      },
      
      config: {
        type: 'GENERATE',
        promptId: 'analyze-content',
        model: 'gemini-2.0-flash-exp'
      }
    },
    
    // 🔹 الخطوة 3: تحسين المحتوى
    {
      id: 'step-3',
      name: 'Improve Content',
      type: 'GENERATE',
      
      inputMapping: {
        'originalContent': 'initialContent',  // من step-1
        'suggestions': 'improvements',        // من step-2
        'score': 'qualityScore'               // من step-2
      },
      
      outputMapping: {
        'improvedContent': 'finalContent',
        'changes': 'changesList'
      },
      
      config: {
        type: 'GENERATE',
        promptId: 'improve-content',
        model: 'gemini-2.0-flash-exp'
      }
    }
  ],
  
  // 🎯 مخرجات Flow النهائية
  outputMapping: {
    'finalContent': 'result',
    'changesList': 'improvements',
    'qualityScore': 'score'
  }
}
```

---

## 🔄 النظام القديم: Context Mapping

### البنية الأساسية

```typescript
interface FlowStep {
  // ... الحقول الأخرى
  
  contextMapping?: {
    input?: Record<string, string>;   // ربط السياق → مدخلات
    output?: Record<string, string>;  // ربط مخرجات → السياق
  };
}
```

### مثال:

```typescript
{
  id: 'step-1',
  name: 'Generate Content',
  type: 'prompt',
  
  config: {
    prompt: 'Write about {{input.topic}}',
    model: 'gemini-2.0-flash-exp'
  },
  
  // Context Mapping (النظام القديم)
  contextMapping: {
    output: {
      '': 'content',                    // حفظ كل المخرج في 'content'
      'metadata.tokens': 'tokenCount'   // حفظ جزء من المخرج
    }
  }
}
```

---

## 📝 في واجهة Flow Builder

### تكوين الخطوة (Configure Step)

عند فتح **Configure Step** modal، ستجد تبويب **Mapping** يحتوي على:

#### 1. Input Mapping

```json
{
  "stepInput": "contextVariable"
}
```

**أمثلة:**
```json
{
  "topic": "input.topic",
  "previousResult": "step-1.output",
  "userSettings": "context.settings"
}
```

#### 2. Output Mapping

```json
{
  "stepOutput": "contextVariable"
}
```

**أمثلة:**
```json
{
  "result": "generatedContent",
  "metadata.score": "qualityScore",
  "summary": "contentSummary"
}
```

---

## 🎨 في واجهة المستخدم

### الكود الحالي في `StepConfigPanel.tsx`

```tsx
{/* تبويب Mapping */}
<TabsContent value="mapping" className="space-y-4">
  
  {/* 📥 Input Mapping */}
  <Card className="p-4 space-y-4">
    <h3 className="font-semibold">Input Mapping</h3>
    <p className="text-sm text-muted-foreground">
      Map context variables to step inputs
    </p>
    <Textarea
      value={JSON.stringify(editedStep.contextMapping?.input || {}, null, 2)}
      onChange={(e) => {
        try {
          const mapping = JSON.parse(e.target.value);
          setEditedStep((prev) => ({
            ...prev,
            contextMapping: {
              ...prev.contextMapping,
              input: mapping,
            },
          }));
        } catch (err) {
          // Invalid JSON
        }
      }}
      placeholder='{"stepInput": "contextVariable"}'
      rows={4}
      className="font-mono text-sm"
    />
  </Card>

  {/* 📤 Output Mapping */}
  <Card className="p-4 space-y-4">
    <h3 className="font-semibold">Output Mapping</h3>
    <p className="text-sm text-muted-foreground">
      Map step outputs to context variables
    </p>
    <Textarea
      value={JSON.stringify(editedStep.contextMapping?.output || {}, null, 2)}
      onChange={(e) => {
        try {
          const mapping = JSON.parse(e.target.value);
          setEditedStep((prev) => ({
            ...prev,
            contextMapping: {
              ...prev.contextMapping,
              output: mapping,
            },
          }));
        } catch (err) {
          // Invalid JSON
        }
      }}
      placeholder='{"stepOutput": "contextVariable"}'
      rows={4}
      className="font-mono text-sm"
    />
  </Card>
  
</TabsContent>
```

---

## 🔍 استخدام Template Variables

يمكنك استخدام متغيرات في Prompts باستخدام `{{variableName}}`:

### أمثلة:

```typescript
{
  config: {
    prompt: `
      Topic: {{input.topic}}
      Previous Summary: {{step-1.output}}
      User Feedback: {{userFeedback}}
      
      Generate improved content based on the above.
    `,
    model: 'gemini-2.0-flash-exp'
  }
}
```

### أنواع المتغيرات المدعومة:

1. **Input Variables**: `{{input.fieldName}}`
   ```
   {{input.topic}}
   {{input.tone}}
   {{input.maxWords}}
   ```

2. **Step Output**: `{{step-id.output}}`
   ```
   {{step-1.output}}
   {{step-2.result}}
   {{step-3.summary}}
   ```

3. **Context Variables**: `{{variableName}}`
   ```
   {{generatedContent}}
   {{qualityScore}}
   {{userSettings}}
   ```

4. **Nested Paths**: `{{object.nested.value}}`
   ```
   {{step-1.metadata.wordCount}}
   {{input.settings.tone}}
   {{analysis.scores.readability}}
   ```

---

## ⚙️ كيفية عمل النظام داخلياً

### في Context Manager (`context-manager.ts`)

```typescript
// 1️⃣ حفظ نتائج الخطوة مع Output Mapping
async updateStepResult(
  context: ExecutionContext,
  step: FlowStep,
  result: StepResult
): Promise<void> {
  // حفظ نتيجة الخطوة
  context.stepResults.set(step.id, result);

  // 📤 تطبيق Output Mapping
  if (step.contextMapping?.output && result.output) {
    for (const [outputPath, contextVar] of Object.entries(step.contextMapping.output)) {
      const value = this.extractValue(result.output, outputPath);
      context.variables.set(contextVar, value);  // حفظ في السياق
    }
  }
}

// 2️⃣ الحصول على متغير من السياق
getVariable(context: ExecutionContext, name: string): any {
  // التحقق من المتغيرات المباشرة
  if (context.variables.has(name)) {
    return context.variables.get(name);
  }

  // التحقق من input.fieldName
  if (name.startsWith('input.')) {
    const path = name.substring(6);
    return this.extractValue(context.input, path);
  }

  // التحقق من stepId.output
  if (name.includes('.')) {
    const [stepId, ...pathParts] = name.split('.');
    const stepResult = context.stepResults.get(stepId);
    if (stepResult?.output) {
      return this.extractValue(stepResult.output, pathParts.join('.'));
    }
  }

  return undefined;
}
```

---

## 🎯 أمثلة شائعة للاستخدام

### مثال 1: RAG Flow

```typescript
{
  steps: [
    // الخطوة 1: البحث في المستندات
    {
      id: 'search',
      type: 'RETRIEVE',
      inputMapping: {
        'query': 'input.question'
      },
      outputMapping: {
        'documents': 'retrievedDocs',
        'sources': 'docSources'
      }
    },
    
    // الخطوة 2: توليد الإجابة
    {
      id: 'generate',
      type: 'GENERATE',
      inputMapping: {
        'context': 'retrievedDocs',
        'question': 'input.question'
      },
      outputMapping: {
        'answer': 'finalAnswer'
      }
    },
    
    // الخطوة 3: تنسيق المخرج
    {
      id: 'format',
      type: 'FORMAT',
      inputMapping: {
        'answer': 'finalAnswer',
        'sources': 'docSources'
      },
      outputMapping: {
        'formatted': 'result'
      }
    }
  ]
}
```

### مثال 2: Content Enhancement Flow

```typescript
{
  steps: [
    // توليد → مراجعة → تحسين
    {
      id: 'generate',
      outputMapping: { '': 'draft' }
    },
    {
      id: 'review',
      inputMapping: { 'content': 'draft' },
      outputMapping: { 'feedback': 'suggestions' }
    },
    {
      id: 'improve',
      inputMapping: { 
        'original': 'draft',
        'feedback': 'suggestions'
      },
      outputMapping: { '': 'finalContent' }
    }
  ]
}
```

### مثال 3: Conditional Flow

```typescript
{
  steps: [
    {
      id: 'check-quality',
      outputMapping: { 'score': 'qualityScore' }
    },
    {
      id: 'improve-if-needed',
      condition: 'qualityScore < 0.7',  // تنفذ فقط إذا كانت الجودة منخفضة
      inputMapping: { 'content': 'draft' },
      outputMapping: { '': 'finalContent' }
    }
  ]
}
```

---

## ✅ أفضل الممارسات

### 1. تسمية المتغيرات بوضوح
```typescript
// ❌ سيء
outputMapping: { '': 'x', 'data': 'y' }

// ✅ جيد
outputMapping: { 
  'generatedText': 'articleContent',
  'metadata.wordCount': 'contentLength'
}
```

### 2. استخدام Nested Paths
```typescript
// يمكنك الوصول إلى قيم متداخلة
inputMapping: {
  'score': 'step-1.analysis.quality.score',
  'feedback': 'step-1.analysis.suggestions[0]'
}
```

### 3. Empty String للمخرج الكامل
```typescript
// '' يعني "كل المخرج"
outputMapping: {
  '': 'fullResult'
}
```

### 4. توثيق Mappings المعقدة
```typescript
{
  id: 'complex-step',
  name: 'Complex Processing',
  description: `
    Input Mapping:
    - content: من step-1
    - settings: من input
    
    Output Mapping:
    - result: النتيجة النهائية
    - metadata: معلومات إضافية
  `,
  inputMapping: { /* ... */ },
  outputMapping: { /* ... */ }
}
```

---

## 🐛 استكشاف الأخطاء

### مشكلة: المتغير غير موجود

```typescript
// ❌ خطأ
inputMapping: {
  'content': 'step-999.output'  // الخطوة غير موجودة
}

// ✅ حل: تحقق من ID الخطوة
inputMapping: {
  'content': 'step-1.output'
}
```

### مشكلة: Path غير صحيح

```typescript
// ❌ خطأ
inputMapping: {
  'data': 'step-1.result.nested.value'  // Path غير موجود
}

// ✅ حل: تحقق من بنية المخرج
// استخدم ExecutionTraceViewer لرؤية المخرجات الفعلية
```

### مشكلة: JSON غير صالح في UI

```json
// ❌ خطأ
{
  content: step-1.output  // يجب استخدام علامات اقتباس
}

// ✅ صحيح
{
  "content": "step-1.output"
}
```

---

## 🚀 الخطوات التالية

1. **جرب الأمثلة** في Flow Builder Demo
2. **استخدم ExecutionTraceViewer** لمراقبة تدفق البيانات
3. **راجع الأمثلة** في `arkan/src/ai/dynamic-flow/example.ts`
4. **اقرأ الوثائق** في `dynamic-flows-sdk/README.md`

---

## 📚 موارد إضافية

- **Flow Builder Demo**: `/demo/flow-builder`
- **API Documentation**: `arkan/docs/API_DOCUMENTATION.md`
- **Dynamic Flows Guide**: `arkan/DYNAMIC_FLOWS_EXPANDED_PLAN.md`
- **Examples**: `arkan/src/ai/dynamic-flow/example.ts`

---

تم إنشاء هذا الدليل بواسطة Rovo Dev 🤖
