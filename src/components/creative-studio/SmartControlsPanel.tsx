/**
 * Smart Controls Panel - Dynamic controls based on step type
 * لوحة التحكم الذكية - عناصر تحكم ديناميكية حسب نوع الخطوة
 */

'use client';

import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GenerationStep, ToneOption, StyleOption, PerspectiveOption } from '@/lib/models/creative-content-config';
import { useCreativeStudio } from '@/hooks/creative-studio/use-creative-studio';

interface SmartControlsPanelProps {
  step: GenerationStep;
  disabled?: boolean;
}

export function SmartControlsPanel({ step, disabled }: SmartControlsPanelProps) {
  const { updateStepConfig } = useCreativeStudio();

  const toneOptions: { value: ToneOption; label: string }[] = [
    { value: 'dramatic', label: 'درامي' },
    { value: 'comedic', label: 'كوميدي' },
    { value: 'serious', label: 'جاد' },
    { value: 'lighthearted', label: 'خفيف' },
    { value: 'dark', label: 'مظلم' },
    { value: 'inspirational', label: 'ملهم' },
    { value: 'mysterious', label: 'غامض' },
    { value: 'romantic', label: 'رومانسي' },
    { value: 'suspenseful', label: 'مشوق' },
    { value: 'melancholic', label: 'حزين' },
  ];

  const styleOptions: { value: StyleOption; label: string }[] = [
    { value: 'descriptive', label: 'وصفي' },
    { value: 'minimalist', label: 'بسيط' },
    { value: 'poetic', label: 'شعري' },
    { value: 'journalistic', label: 'صحفي' },
    { value: 'academic', label: 'أكاديمي' },
    { value: 'conversational', label: 'حواري' },
    { value: 'literary', label: 'أدبي' },
  ];

  const perspectiveOptions: { value: PerspectiveOption; label: string }[] = [
    { value: 'first-person', label: 'المتكلم (أنا)' },
    { value: 'second-person', label: 'المخاطب (أنت)' },
    { value: 'third-person-limited', label: 'الغائب المحدود (هو/هي)' },
    { value: 'third-person-omniscient', label: 'الغائب العليم' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>عناصر التحكم</CardTitle>
        <CardDescription>تحكم في كيفية توليد المحتوى</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tone Selection */}
        <div className="space-y-2">
          <Label htmlFor="tone">النبرة</Label>
          <Select
            disabled={disabled}
            value={step.config.tone}
            onValueChange={(value) => updateStepConfig(step.id, { tone: value as ToneOption })}
          >
            <SelectTrigger id="tone">
              <SelectValue placeholder="اختر النبرة..." />
            </SelectTrigger>
            <SelectContent>
              {toneOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Style Selection */}
        <div className="space-y-2">
          <Label htmlFor="style">الأسلوب</Label>
          <Select
            disabled={disabled}
            value={step.config.style}
            onValueChange={(value) => updateStepConfig(step.id, { style: value as StyleOption })}
          >
            <SelectTrigger id="style">
              <SelectValue placeholder="اختر الأسلوب..." />
            </SelectTrigger>
            <SelectContent>
              {styleOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Perspective (for narrative content) */}
        {(step.type === 'chapter' || step.type === 'scene') && (
          <div className="space-y-2">
            <Label htmlFor="perspective">منظور السرد</Label>
            <Select
              disabled={disabled}
              value={step.config.perspective}
              onValueChange={(value) => updateStepConfig(step.id, { perspective: value as PerspectiveOption })}
            >
              <SelectTrigger id="perspective">
                <SelectValue placeholder="اختر المنظور..." />
              </SelectTrigger>
              <SelectContent>
                {perspectiveOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Length Control */}
        {step.config.length && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>الطول المستهدف</Label>
              <span className="text-sm text-muted-foreground">
                {step.config.length.target} {step.config.length.unit === 'words' ? 'كلمة' : 'حرف'}
              </span>
            </div>
            <Slider
              disabled={disabled}
              value={[step.config.length.target]}
              min={step.config.length.min}
              max={step.config.length.max}
              step={50}
              onValueChange={([value]) => 
                updateStepConfig(step.id, { 
                  length: { ...step.config.length!, target: value } 
                })
              }
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{step.config.length.min}</span>
              <span>{step.config.length.max}</span>
            </div>
          </div>
        )}

        {/* Custom Instructions */}
        <div className="space-y-2">
          <Label htmlFor="instructions">تعليمات إضافية (اختياري)</Label>
          <Textarea
            id="instructions"
            disabled={disabled}
            placeholder="أضف أي تعليمات إضافية لتوجيه عملية التوليد..."
            rows={3}
            value={step.config.customInstructions || ''}
            onChange={(e) => updateStepConfig(step.id, { customInstructions: e.target.value })}
          />
        </div>

        {/* RAG Toggle */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-0.5">
            <Label htmlFor="rag">استخدام المستندات المرجعية</Label>
            <p className="text-xs text-muted-foreground">
              استخدم المستندات المحملة كمرجع
            </p>
          </div>
          <Switch
            id="rag"
            disabled={disabled}
            checked={step.config.useRAG}
            onCheckedChange={(checked) => updateStepConfig(step.id, { useRAG: checked })}
          />
        </div>
      </CardContent>
    </Card>
  );
}
