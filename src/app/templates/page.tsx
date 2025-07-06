import TemplateManager from '@/components/TemplateManager';
import { Palette } from 'lucide-react';

export default function TemplatesPage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <Palette className="w-10 h-10" />
          إدارة قوالب التصدير
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          اختر القالب الافتراضي لتصدير التقارير والمقترحات بصيغة DOCX.
        </p>
      </div>
      <TemplateManager />
    </div>
  );
}
