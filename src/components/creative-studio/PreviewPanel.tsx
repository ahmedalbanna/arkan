/**
 * Preview Panel - Full content preview
 * لوحة المعاينة - معاينة المحتوى الكامل
 */

'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Copy, FileText, Check } from 'lucide-react';
import { CreativeContentConfig } from '@/lib/models/creative-content-config';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface PreviewPanelProps {
  project: CreativeContentConfig;
}

export function PreviewPanel({ project }: PreviewPanelProps) {
  const [isCopied, setIsCopied] = useState(false);

  // Combine all completed steps
  const combinedContent = project.generationSteps
    .filter(step => step.status === 'completed' && step.result)
    .map(step => {
      const title = `## ${step.title}\n\n`;
      const content = step.result?.content || '';
      return title + content;
    })
    .join('\n\n---\n\n');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(combinedContent);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export content');
  };

  if (!combinedContent) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <FileText className="h-16 w-16 mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">
            لم يتم توليد أي محتوى بعد
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Actions Bar */}
      <div className="border-b p-4 flex items-center justify-between bg-background/95 backdrop-blur">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {isCopied ? (
              <>
                <Check className="ml-2 h-4 w-4 text-green-500" />
                تم النسخ
              </>
            ) : (
              <>
                <Copy className="ml-2 h-4 w-4" />
                نسخ
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="ml-2 h-4 w-4" />
            تصدير
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          {project.generationSteps.filter(s => s.status === 'completed').length} خطوة مكتملة
        </div>
      </div>

      {/* Content Preview */}
      <ScrollArea className="flex-1">
        <div className="container max-w-4xl mx-auto p-8">
          <Card>
            <CardContent className="p-8">
              {/* Project Header */}
              <div className="mb-8 pb-6 border-b">
                <h1 className="text-3xl font-bold mb-2">
                  {project.metadata.title}
                </h1>
                {project.metadata.author && (
                  <p className="text-lg text-muted-foreground">
                    بقلم: {project.metadata.author}
                  </p>
                )}
                {project.metadata.genre && (
                  <p className="text-sm text-muted-foreground mt-1">
                    النوع: {project.metadata.genre}
                  </p>
                )}
              </div>

              {/* Combined Content */}
              <div className="prose dark:prose-invert prose-lg max-w-none">
                <ReactMarkdown>{combinedContent}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}
