
import PptxTemplateManager from '@/components/PptxTemplateManager';
import { FileImage } from 'lucide-react';

export default function ManagePptxTemplatesPage() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <FileImage className="w-10 h-10" />
          Manage Presentation Templates
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Customize the appearance of exported PPTX presentations.
        </p>
      </div>
      <PptxTemplateManager />
    </div>
  );
}
