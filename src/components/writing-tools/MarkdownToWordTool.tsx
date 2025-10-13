'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useState, type ComponentPropsWithoutRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { AnimatedContainer } from '@/components/ui/animation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { templates, type DocxTemplateKey } from '@/lib/docx-styles';
import { convertMarkdownToWord } from '@/lib/markdown-to-word-converter';
import dynamic from 'next/dynamic';

// Dynamically import FileWord to avoid SSR issues with lucide-react icons
const FileWord = dynamic<ComponentPropsWithoutRef<typeof Loader2>>(() => import('lucide-react').then((mod) => mod.FileText), { ssr: false });

const markdownToWordSchema = z.object({
  markdown: z.string().min(10, 'Markdown content must be at least 10 characters long.'),
  fileName: z.string().min(1, 'File name is required.').regex(/^[a-zA-Z0-9_-]+$/, 'File name can only contain letters, numbers, underscores, and hyphens.'),
  template: z.enum(['modern', 'classic', 'academic']),
  pageNumbers: z.boolean().default(true),
  addCoverPage: z.boolean().default(false),
  coverPageMarkdown: z.string().optional(),
  isRtl: z.boolean().default(false),
});

type MarkdownToWordFormValues = z.infer<typeof markdownToWordSchema>;

export function MarkdownToWordTool() {
  const { toast } = useToast();
  const [isConverting, setIsConverting] = useState(false);

  const form = useForm<MarkdownToWordFormValues>({
    resolver: zodResolver(markdownToWordSchema),
    defaultValues: {
      markdown: '# Hello World\n\nThis is a sample markdown document.\n\n![A placeholder image](https://picsum.photos/id/237/500/300)\n<!-- caption: A cute dog. -->\n\n## A Subheading\n\nAnd a paragraph with **bold** and *italic* text.\n\n<!-- orientation: landscape -->\n\n### A Wide Table on a Landscape Page\n\n<!-- caption: This table shows important data. -->\n| Header 1 | Header 2 | Header 3 | Header 4 | Header 5 | Header 6 |\n|---|---|---|---|---|---|\n| Data 1 | Data 2 | Data 3 | Data 4 | Data 5 | Data 6 |\n\n<!-- orientation: portrait -->\n\nBack to portrait.',
      fileName: 'document',
      template: 'modern',
      pageNumbers: true,
      addCoverPage: false,
      coverPageMarkdown: '# My Document Title\n\nBy John Doe\n\n{currentDate}',
      isRtl: false,
    },
  });

  const addCoverPage = form.watch('addCoverPage');

  const onSubmit = async (data: MarkdownToWordFormValues) => {
    setIsConverting(true);
    try {
      await convertMarkdownToWord(data.markdown, data.fileName, {
        styles: templates[data.template as DocxTemplateKey].styles as any, // Cast to any to bypass Zod type inference issues
        pageNumbers: data.pageNumbers,
        coverPageMarkdown: data.addCoverPage ? data.coverPageMarkdown : undefined,
        isRtl: data.isRtl,
      });
      toast({
        title: "Conversion Successful",
        description: `Your file ${data.fileName}.docx has been downloaded.`,
      });
    } catch (error) {
      console.error('Failed to convert markdown to word:', error);
      toast({
        title: "Conversion Failed",
        description: error instanceof Error ? error.message : String(error),
        variant: 'destructive',
      });
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <AnimatedContainer animation="fade-in-up" delay={200}>
      <Card className="shadow-soft hover:shadow-glow transition-all duration-200">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
          <CardTitle className="font-headline">Markdown to Word Converter</CardTitle>
          <CardDescription>Easily convert your markdown documents into styled .docx files, with support for different page orientations.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <AnimatedContainer animation="fade-in-up" delay={300}>
              <div className="space-y-2">
                <Label htmlFor="markdown-input" className="font-headline">Markdown Content</Label>
                <Textarea
                  id="markdown-input"
                  {...form.register('markdown')}
                  placeholder="Enter your markdown here..."
                  className="min-h-[300px] font-mono hover:shadow-soft transition-all duration-200"
                  disabled={isConverting}
                />
                {form.formState.errors.markdown && (
                  <p className="text-sm text-destructive">{form.formState.errors.markdown.message}</p>
                )}
              </div>
            </AnimatedContainer>

            <AnimatedContainer animation="fade-in-up" delay={400}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fileName-input" className="font-headline">File Name</Label>
                  <Input
                    id="fileName-input"
                    {...form.register('fileName')}
                    placeholder="e.g., my-report"
                    disabled={isConverting}
                    className="hover:shadow-soft transition-all duration-200"
                  />
                  {form.formState.errors.fileName && (
                    <p className="text-sm text-destructive">{form.formState.errors.fileName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="template-select" className="font-headline">Document Template</Label>
                  <Select
                    onValueChange={(value: DocxTemplateKey) => form.setValue('template', value as any)}
                    defaultValue={form.getValues('template')}
                    disabled={isConverting}
                  >
                    <SelectTrigger id="template-select" className="hover:shadow-soft transition-all duration-200">
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent className="backdrop-blur-md bg-gradient-to-r from-background/90 to-primary/5 border shadow-soft">
                      {Object.keys(templates).map((key) => (
                        <SelectItem key={key} value={key} className="hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-500/10">
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </AnimatedContainer>

            <AnimatedContainer animation="fade-in-up" delay={500}>
              <div className="space-y-4 pt-2">
                <div className="flex items-center space-x-2">
                  <Controller
                    name="addCoverPage"
                    control={form.control}
                    render={({ field }) => (
                      <Checkbox
                        id="addCoverPage"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isConverting}
                        className="hover:shadow-soft transition-all duration-200"
                      />
                    )}
                  />
                  <Label htmlFor="addCoverPage" className="cursor-pointer font-headline">
                    Add a cover page
                  </Label>
                </div>
                {addCoverPage && (
                  <div className="space-y-2 pl-6 border-s-2 ms-3">
                    <Label htmlFor="cover-page-markdown-input" className="font-headline">Cover Page Markdown</Label>
                    <Textarea id="cover-page-markdown-input" {...form.register('coverPageMarkdown')} placeholder="Enter markdown for your cover page..." className="min-h-[150px] font-mono hover:shadow-soft transition-all duration-200" disabled={isConverting} />
                  </div>
                )}
              </div>
            </AnimatedContainer>

            <AnimatedContainer animation="fade-in-up" delay={600}>
              <div className="flex items-center space-x-2 pt-2">
                <Controller
                  name="pageNumbers"
                  control={form.control}
                  render={({ field }) => (
                    <Checkbox
                      id="pageNumbers"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isConverting}
                      className="hover:shadow-soft transition-all duration-200"
                    />
                  )}
                />
                <Label htmlFor="pageNumbers" className="cursor-pointer font-headline">
                  Add page numbers to footer
                </Label>
              </div>
            </AnimatedContainer>

            <AnimatedContainer animation="fade-in-up" delay={700}>
              <div className="flex items-center space-x-2 pt-2">
                <Controller
                  name="isRtl"
                  control={form.control}
                  render={({ field }) => (
                    <Checkbox
                      id="isRtl"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isConverting}
                      className="hover:shadow-soft transition-all duration-200"
                    />
                  )}
                />
                <Label htmlFor="isRtl" className="cursor-pointer font-headline">Enable Right-to-Left (RTL) text direction (for Arabic, Hebrew, etc.)</Label>
              </div>
            </AnimatedContainer>

            <AnimatedContainer animation="fade-in-up" delay={800}>
              <Button type="submit" disabled={isConverting} className="w-full hover:shadow-glow transition-all duration-200" variant="gradient">
                {isConverting ? (
                  <Loader2 className="me-2 h-4 w-4 animate-spin" />
                ) : (
                  <FileWord className="me-2 h-4 w-4" />
                )}
                {isConverting ? 'Converting...' : 'Convert and Download .docx'}
              </Button>
            </AnimatedContainer>
          </form>
        </CardContent>
      </Card>
    </AnimatedContainer>
  );
}
