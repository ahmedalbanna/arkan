'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { File as FileIcon, LoaderCircle, Presentation } from 'lucide-react';
import { useState } from 'react';
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
import { convertMarkdownToPdf, convertMarkdownToPptx } from '@/lib/markdown-to-pptx-converter';
import { templates } from '@/lib/pptx-styles';
import { PptxStyleOptionsSchema } from '@/lib/template-schemas';
import type { PptxStyleOptions } from '@/lib/types';

const markdownToPptxSchema = z.object({
  markdown: z.string().min(10, 'Markdown content must be at least 10 characters long.'),
  fileName: z
    .string()
    .min(1, 'File name is required.')
    .regex(/^[a-zA-Z0-9_-]+$/, 'File name can only contain letters, numbers, underscores, and hyphens.'),
  template: z.enum(['modern', 'dark', 'professional']),
  isRtl: z.boolean().default(false),
  includeToc: z.boolean().default(false),
  useCustomTheme: z.boolean().default(false),
  customThemeJson: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.useCustomTheme) {
    if (!data.customThemeJson || data.customThemeJson.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['customThemeJson'],
        message: 'Custom theme JSON is required when "Use Custom Theme" is enabled.',
      });
      return;
    }
    try {
      const theme = JSON.parse(data.customThemeJson);
      PptxStyleOptionsSchema.parse(theme);
    } catch (e) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['customThemeJson'],
        message: e instanceof z.ZodError ? 'Custom theme JSON does not match the required schema.' : 'Invalid JSON format.',
      });
    }
  }
});

type MarkdownToPptxFormValues = z.infer<typeof markdownToPptxSchema>;

export function MarkdownToPptxTool() {
  const { toast } = useToast();
  const [isConverting, setIsConverting] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const form = useForm<MarkdownToPptxFormValues>({
    resolver: zodResolver(markdownToPptxSchema),
    defaultValues: {
      markdown: `# My Awesome Presentation: A Comprehensive Guide
This is the cover slide. The title and subtitle are automatically formatted.

---

# Slide 2: Basic Formatting
This slide demonstrates various inline markdown features.

- **Bolded text** for emphasis.
- *Italicized text* for highlighting.
- ~~Strikethrough text~~ for deletions.
- A link to Arkan's Website.
- Inline code like \`const x = 10;\` is also supported.

> Notes:
> This slide covers the fundamental text formatting options. Make sure to explain each one clearly.

---

# Slide 3: Lists and Nesting
You can create ordered and unordered lists.

1. First ordered list item.
2. Second ordered list item.
   - Nested unordered item.
   - Another nested item.
      1. Deeply nested ordered item.
3. Third ordered list item.

- Unordered list item.
- Another unordered list item.

---

# Slide 4: Block Elements
This slide shows how blockquotes and tables are rendered.

> Here is a blockquote. It's useful for highlighting important text or quotes from sources. It can span multiple lines and will be styled distinctively.

| Header 1      | Header 2      | Header 3      |
|---------------|---------------|---------------|
| Cell 1        | Cell 2        | Cell 3        |
| Cell 4        | Cell 5        | Cell 6        |
| *Formatted*   | **Content**   | \`Is Supported\`|

---

# Slide 5: Images & Code Blocks
An image can be placed on its own line to be centered.


\`\`\`javascript
// This is a javascript code block
function helloWorld() {
  console.log("Hello, PowerPoint!");
  // It preserves whitespace and syntax highlighting is handled by the theme.
}
\`\`\`

---

 # Slide 6: Footnotes & Speaker Notes
You can add footnotes to your text for citations or extra info.[^1] They will appear at the bottom of the slide. This is another reference.[^2]

[^1]: This is the first footnote. It provides more detail.
[^2]: This is the second footnote, demonstrating multiple references.


> Speaker Notes:
> Remember to explain what footnotes are and how they are useful in academic or detailed presentations.
> This is a multi- line speaker note.

---

# Slide 7: PlantUML Diagrams
You can embed PlantUML diagrams directly into your markdown.

\`\`\`plantuml
@startuml
!theme plain
skinparam linetype ortho

actor User
participant "Web App" as App
participant "API Server" as API
database "Database" as DB

User -> App: Clicks "Login"
App -> API: POST /api/login
API -> DB: Verify credentials
DB --> API: User data
API --> App: Auth Token
App --> User: Displays dashboard
@enduml
\`\`\`

---

# Slide 8: Content Overflow
This slide demonstrates how a very long paragraph will gracefully break across multiple slides, ensuring that the content remains readable and well-formatted. The layout engine automatically detects when the content exceeds the available space on a single slide and creates a new slide to continue the text. This process is seamless and preserves the context by repeating the slide title on the overflow slides. This is particularly useful for detailed explanations, long narratives, or extensive notes that cannot be condensed into a few bullet points. The system tries to break the text at a natural point, like between words, to maintain readability. This ensures that even large blocks of text are presented in a professional and easy-to-digest manner without manual intervention. This paragraph will continue to demonstrate this feature by being intentionally long. The layout engine automatically detects when the content exceeds the available space on a single slide and creates a new slide to continue the text. This process is seamless and preserves the context by repeating the slide title on the overflow slides. This is particularly useful for detailed explanations, long narratives, or extensive notes that cannot be condensed into a few bullet points. The system tries to break the text at a natural point, like between words, to maintain readability. This ensures that even large blocks of text are presented in a professional and easy-to-digest manner without manual intervention.`,
      fileName: 'presentation',
      template: 'modern',
      isRtl: false,
      includeToc: false,
      useCustomTheme: false,
      customThemeJson: JSON.stringify(templates.modern.styles, null, 2),
    },
  });

  const useCustomTheme = form.watch('useCustomTheme');

  const onSubmit = async (data: MarkdownToPptxFormValues) => {
    setIsConverting(true);
    try {
      let themeStyles: PptxStyleOptions;

      if (data.useCustomTheme && data.customThemeJson) {
        try {
          themeStyles = JSON.parse(data.customThemeJson);
        } catch (e) {
          toast({
            title: 'Invalid Custom Theme JSON',
            description: 'The provided JSON for the custom theme could not be parsed.',
            variant: 'destructive',
          });
          setIsConverting(false);
          return;
        }
      } else {
        themeStyles = templates[data.template].styles;
      }

      await convertMarkdownToPptx(data.markdown, data.fileName, {
        styles: themeStyles,
        title: data.fileName,
        isRtl: data.isRtl,
        includeToc: data.includeToc,
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

  const handleExportPdf = async () => {
    const data = form.getValues();
    const result = markdownToPptxSchema.safeParse(data);
    if (!result.success) {
      form.trigger();
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors before exporting.',
        variant: 'destructive',
      });
      return;
    }

    setIsExportingPdf(true);
    try {
      let themeStyles: PptxStyleOptions;

      if (data.useCustomTheme && data.customThemeJson) {
        try {
          themeStyles = JSON.parse(data.customThemeJson);
        } catch (e) {
          toast({
            title: 'Invalid Custom Theme JSON',
            description: 'The provided JSON for the custom theme could not be parsed.',
            variant: 'destructive',
          });
          setIsExportingPdf(false);
          return;
        }
      } else {
        themeStyles = templates[data.template].styles;
      }

      await convertMarkdownToPdf(data.markdown, data.fileName, { styles: themeStyles, title: data.fileName, isRtl: data.isRtl });
      toast({ title: 'Export Successful', description: `Your file ${data.fileName}.pdf has been downloaded.` });
    } catch (error) {
      console.error('Failed to convert markdown to pdf:', error);
      toast({ title: 'Export Failed', description: error instanceof Error ? error.message : String(error), variant: 'destructive' });
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <AnimatedContainer animation="fade-in-up" delay={200}>
      <Card className="shadow-soft hover:shadow-glow transition-all duration-200">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
          <CardTitle className="font-headline">Markdown to PowerPoint Converter</CardTitle>
          <CardDescription className="[&>code]:font-mono [&>code]:font-bold [&>code]:bg-gray-200 [&>code]:px-1 [&>code]:py-0.5 [&>code]:rounded">
            Easily convert your markdown documents into styled .pptx presentations. Use `---`, a top-level heading (`#`), or <code className="whitespace-nowrap">&lt;!-- slide-break --&gt;</code> to separate slides.
          </CardDescription>
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
                    placeholder="e.g., my-presentation"
                    disabled={isConverting}
                    className="hover:shadow-soft transition-all duration-200"
                  />
                  {form.formState.errors.fileName && (
                    <p className="text-sm text-destructive">{form.formState.errors.fileName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="template-select" className="font-headline">Presentation Template</Label>
                  <Select
                    onValueChange={(value: 'modern' | 'dark' | 'professional') => form.setValue('template', value)}
                    defaultValue={form.getValues('template')}
                    disabled={isConverting || useCustomTheme}
                  >
                    <SelectTrigger id="template-select" className="hover:shadow-soft transition-all duration-200">
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent className="backdrop-blur-md bg-gradient-to-r from-background/90 to-primary/5 border shadow-soft">
                      {Object.keys(templates).map((key) => (
                        <SelectItem key={key} value={key} className="hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-500/10">
                          {templates[key as keyof typeof templates].name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </AnimatedContainer>

            <AnimatedContainer animation="fade-in-up" delay={500}>
              <div className="space-y-4">
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
                        className="hover:shadow-soft transition-all duration-200"
                      />
                    )}
                  />
                  <Label htmlFor="isRtl" className="cursor-pointer font-headline">Enable Right-to-Left (RTL) text direction (for Arabic, Hebrew, etc.)</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Controller
                    name="includeToc"
                    control={form.control}
                    render={({ field }) => (
                      <Checkbox
                        id="includeToc"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isConverting}
                        className="hover:shadow-soft transition-all duration-200"
                      />
                    )}
                  />
                  <Label htmlFor="includeToc" className="cursor-pointer font-headline">Include Table of Contents slide</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Controller
                    name="useCustomTheme"
                    control={form.control}
                    render={({ field }) => (
                      <Checkbox
                        id="useCustomTheme"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isConverting}
                        className="hover:shadow-soft transition-all duration-200"
                      />
                    )}
                  />
                  <Label htmlFor="useCustomTheme" className="cursor-pointer font-headline">Use Custom Theme (JSON)</Label>
                </div>
              </div>
            </AnimatedContainer>

            {useCustomTheme && (
              <AnimatedContainer animation="fade-in-up" delay={600}>
                <div className="space-y-2">
                  <Label htmlFor="customThemeJson" className="font-headline">Custom Theme JSON</Label>
                  <Textarea id="customThemeJson" {...form.register('customThemeJson')} placeholder="Paste your PptxStyleOptions JSON here..." className="min-h-[150px] font-mono hover:shadow-soft transition-all duration-200" disabled={isConverting || isExportingPdf} />
                  {form.formState.errors.customThemeJson && <p className="text-sm text-destructive">{form.formState.errors.customThemeJson.message}</p>}
                </div>
              </AnimatedContainer>
            )}

            <AnimatedContainer animation="fade-in-up" delay={700}>
              <div className="flex flex-col md:flex-row gap-4">
                <Button type="submit" disabled={isConverting || isExportingPdf} className="w-full hover:shadow-glow transition-all duration-200" variant="gradient">
                  {isConverting ? <LoaderCircle className="me-2 h-4 w-4 animate-spin" /> : <Presentation className="me-2 h-4 w-4" />}
                  {isConverting ? 'Converting...' : 'Convert and Download .pptx'}
                </Button>
                <Button type="button" onClick={handleExportPdf} disabled={isConverting || isExportingPdf} className="w-full hover:shadow-soft transition-all duration-200" variant="secondary">
                  {isExportingPdf ? <LoaderCircle className="me-2 h-4 w-4 animate-spin" /> : <FileIcon className="me-2 h-4 w-4" />}
                  {isExportingPdf ? 'Exporting...' : 'Export as PDF'}
                </Button>
              </div>
            </AnimatedContainer>
          </form>
        </CardContent>
      </Card>
    </AnimatedContainer>
  );
}
