'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircle, Presentation } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { convertMarkdownToPptx } from '@/lib/markdown-to-pptx-converter';
import { templates } from '@/lib/pptx-styles';

const markdownToPptxSchema = z.object({
  markdown: z.string().min(10, 'Markdown content must be at least 10 characters long.'),
  fileName: z
    .string()
    .min(1, 'File name is required.')
    .regex(/^[a-zA-Z0-9_-]+$/, 'File name can only contain letters, numbers, underscores, and hyphens.'),
  template: z.enum(['modern', 'dark', 'professional']),
  isRtl: z.boolean().default(false),
});

type MarkdownToPptxFormValues = z.infer<typeof markdownToPptxSchema>;

export function MarkdownToPptxTool() {
  const { toast } = useToast();
  const [isConverting, setIsConverting] = useState(false);

  const form = useForm<MarkdownToPptxFormValues>({
    resolver: zodResolver(markdownToPptxSchema),
    defaultValues: {
      markdown: `# Slide 1: Introduction

This slide demonstrates various markdown features.

- **Bolded** list item
- *Italicized* list item
- A link to Google

---

# Slide 2: Image and Code

An image can be placed on its own line to be centered.

!A cute dog

\`\`\`javascript
function helloWorld() {
  console.log("Hello, PowerPoint!");
}
\`\`\`

---

# Slide 3: Table and Blockquote

> Here is a blockquote. It's useful for highlighting important text or quotes from sources.

| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |
`,
      fileName: 'presentation',
      template: 'modern',
      isRtl: false,
    },
  });

  const onSubmit = async (data: MarkdownToPptxFormValues) => {
    setIsConverting(true);
    try {
      await convertMarkdownToPptx(data.markdown, data.fileName, {
        styles: templates[data.template].styles,
        title: data.fileName,
        isRtl: data.isRtl,
      });
      toast({
        title: 'Conversion Successful',
        description: `Your file ${data.fileName}.pptx has been downloaded.`,
      });
    } catch (error) {
      console.error('Failed to convert markdown to pptx:', error);
      toast({
        title: 'Conversion Failed',
        description: error instanceof Error ? error.message : String(error),
        variant: 'destructive',
      });
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Markdown to PowerPoint Converter</CardTitle>
        <CardDescription>
          Easily convert your markdown documents into styled .pptx presentations. Use `---` or a top-level heading (`#`) to separate slides.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="markdown-input">Markdown Content</Label>
            <Textarea
              id="markdown-input"
              {...form.register('markdown')}
              placeholder="Enter your markdown here..."
              className="min-h-[300px] font-mono"
              disabled={isConverting}
            />
            {form.formState.errors.markdown && (
              <p className="text-sm text-destructive">{form.formState.errors.markdown.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fileName-input">File Name</Label>
              <Input
                id="fileName-input"
                {...form.register('fileName')}
                placeholder="e.g., my-presentation"
                disabled={isConverting}
              />
              {form.formState.errors.fileName && (
                <p className="text-sm text-destructive">{form.formState.errors.fileName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-select">Presentation Template</Label>
              <Select
                onValueChange={(value: 'modern' | 'dark' | 'professional') => form.setValue('template', value)}
                defaultValue={form.getValues('template')}
                disabled={isConverting}
              >
                <SelectTrigger id="template-select">
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(templates).map((key) => (
                    <SelectItem value={key} key={key}>
                      {templates[key as keyof typeof templates].name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Controller
              name="isRtl"
              control={form.control}
              render={({ field }) => (
                <Checkbox
                  id="isRtl"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isConverting}
                />
              )}
            />
            <Label htmlFor="isRtl" className="cursor-pointer">Enable Right-to-Left (RTL) text direction (for Arabic, Hebrew, etc.)</Label>
          </div>

          <Button type="submit" disabled={isConverting} className="w-full">
            {isConverting ? (
              <LoaderCircle className="me-2 h-4 w-4 animate-spin" />
            ) : (
              <Presentation className="me-2 h-4 w-4" />
            )}
            {isConverting ? 'Converting...' : 'Convert and Download .pptx'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
