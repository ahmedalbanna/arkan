'use client';

import { Palette, FileImage } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PptxTemplateManager from '@/components/PptxTemplateManager';
import { DocxTemplateManager } from '@/components/admin/templates/DocxTemplateManager';
import { useLocalization } from '@/context/LocalizationContext';


export default function DesignPage() {
    const { t } = useLocalization();

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <Palette className="w-10 h-10" />
          Design Studio
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
            Customize the look and feel of your exported documents and presentations.
        </p>
      </div>
      <Tabs defaultValue="docx" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="docx">
            <FileImage className="me-2 h-4 w-4" />
            DOCX Templates
          </TabsTrigger>
          <TabsTrigger value="pptx">
            <FileImage className="me-2 h-4 w-4" />
            PPTX Templates
          </TabsTrigger>
        </TabsList>
        <TabsContent value="docx" className="mt-6">
            <DocxTemplateManager />
        </TabsContent>
        <TabsContent value="pptx" className="mt-6">
            <PptxTemplateManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
