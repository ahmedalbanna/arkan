# API Documentation - Proposal Section Generation

## Overview
هذا الدليل يوضح كيفية استخدام API endpoints لنظام توليد أقسام المقترحات الذكية.

## Base URL
```
/api/generate/proposal-section
```

## Endpoints

### 1. Generate Section
**POST** `/api/generate/proposal-section`

توليد قسم جديد من المقترح باستخدام الذكاء الاصطناعي.

#### Request Body
```json
{
  "type": "executive_summary",
  "projectContext": {
    "title": "عنوان المشروع",
    "description": "وصف المشروع",
    "objectives": ["الهدف الأول", "الهدف الثاني"]
  },
  "style": {
    "tone": "professional",
    "length": "moderate",
    "format": "structured",
    "language": "ar"
  },
  "intelligentSettings": {
    "enableContextAnalysis": true,
    "enableIterativeImprovement": true,
    "enablePerformanceMonitoring": true
  }
}
```

#### Response
```json
{
  "content": "المحتوى المولد...",
  "metadata": {
    "wordCount": 350,
    "readingTime": 2,
    "qualityScore": 85
  }
}
```

### 2. Get Statistics
**GET** `/api/generate/proposal-section/stats`

الحصول على إحصائيات أقسام المقترح.

#### Response
```json
{
  "totalGenerated": 1247,
  "byType": {
    "executive_summary": 156,
    "objectives": 142
  },
  "averageQuality": 84.7,
  "averageWordCount": 387,
  "mostUsedTypes": ["executive_summary", "objectives"],
  "averageGenerationTime": 2847
}
```

### 3. Validate Section
**POST** `/api/generate/proposal-section/validate`

التحقق من صحة وجودة محتوى قسم.

#### Request Body
```json
{
  "type": "executive_summary",
  "content": "المحتوى المراد التحقق منه..."
}
```

#### Response
```json
{
  "isValid": true,
  "score": 85,
  "issues": ["المحتوى قصير نسبياً"],
  "suggestions": ["أضف المزيد من التفاصيل"]
}
```

### 4. Improve Section
**POST** `/api/generate/proposal-section/improve`

تحسين محتوى قسم موجود.

#### Request Body
```json
{
  "type": "executive_summary",
  "content": "المحتوى الحالي...",
  "improvementAreas": ["clarity", "detail", "structure"]
}
```

#### Response
```json
{
  "improvedContent": "المحتوى المحسن...",
  "improvements": ["تم إضافة عنوان رئيسي", "تم تحسين الهيكل"],
  "qualityScore": 92
}
```

### 5. Get Templates
**GET** `/api/generate/proposal-section/templates`

الحصول على القوالب الجاهزة.

#### Query Parameters
- `type` (optional): نوع القسم المطلوب

#### Response
```json
[
  {
    "type": "executive_summary",
    "title": "قالب الملخص التنفيذي المهني",
    "template": "# الملخص التنفيذي\n\n...",
    "description": "قالب شامل للملخص التنفيذي"
  }
]
```

## Error Handling

جميع الـ endpoints تعيد أخطاء بالتنسيق التالي:

```json
{
  "error": "وصف الخطأ",
  "message": "تفاصيل إضافية",
  "details": [] // في حالة أخطاء التحقق
}
```

### Status Codes
- `200`: نجح الطلب
- `400`: بيانات غير صحيحة
- `404`: المورد غير موجود
- `500`: خطأ في الخادم

## Rate Limiting
- الحد الأقصى: 100 طلب في الدقيقة لكل IP
- الحد الأقصى للتوليد: 10 طلبات في الدقيقة

## Authentication
حالياً لا يتطلب الـ API مصادقة، لكن يُنصح بإضافة API keys في الإنتاج.

## Examples

### JavaScript/TypeScript
```typescript
// توليد قسم جديد
const response = await fetch('/api/generate/proposal-section', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    type: 'executive_summary',
    projectContext: {
      title: 'مشروع تطوير تطبيق جوال',
      description: 'تطبيق للتجارة الإلكترونية'
    }
  })
});

const result = await response.json();
console.log(result.content);
```

### cURL
```bash
# الحصول على الإحصائيات
curl -X GET "http://localhost:3000/api/generate/proposal-section/stats"

# توليد قسم جديد
curl -X POST "http://localhost:3000/api/generate/proposal-section" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "executive_summary",
    "projectContext": {
      "title": "مشروع تجريبي"
    }
  }'
```

## Support
للدعم والاستفسارات، يرجى مراجعة الوثائق الكاملة أو التواصل مع فريق التطوير.
