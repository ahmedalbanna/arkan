
'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWriteDocument } from '@/hooks/use-writing-tools';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, Copy, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ScrollArea } from '../ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/lib/markdown-components';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const formSchema = z.object({
  topic: z.string().min(5, 'Please enter a topic with at least 5 characters.'),
  documentType: z.string().min(1, 'Please select a document type.'),
  knowledge: z.string().optional(),
  tableOfContents: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function DocumentWriterTool() {
  const mutation = useWriteDocument();
  const [isCopied, setIsCopied] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { topic: '', documentType: 'essay', knowledge: '', tableOfContents: '' },
  });

  const onSubmit = (data: FormValues) => {
    const submissionData = {
        ...data,
        tableOfContents: data.tableOfContents ? data.tableOfContents.split('\n').filter(line => line.trim() !== '') : undefined,
    };
    mutation.mutate(submissionData, {
      onSuccess: (result) => {
        setGeneratedContent(result.documentContent);
        toast({ title: 'Document generated successfully!' });
      },
      onError: (error) => {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      },
    });
  };

  const handleCopy = () => {
    if (!generatedContent) return;
    navigator.clipboard.writeText(generatedContent).then(() => {
      setIsCopied(true);
      toast({ title: 'Copied to clipboard!' });
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const docTypes = ['Essay', 'Blog Post', 'Formal Report', 'Technical Article', 'Creative Story'];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Writer</CardTitle>
        <CardDescription>Provide a topic and let the AI generate a complete document for you.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                {...form.register('topic')}
                placeholder="e.g., The Future of Renewable Energy"
                disabled={mutation.isPending}
              />
              {form.formState.errors.topic && <p className="text-sm text-destructive">{form.formState.errors.topic.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="document-type">Document Type</Label>
              <Controller
                name="documentType"
                control={form.control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger id="document-type">
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      {docTypes.map(type => <SelectItem key={type} value={type.toLowerCase()}>{type}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="knowledge">Knowledge & Instructions (Optional)</Label>
            <Textarea
              id="knowledge"
              {...form.register('knowledge')}
              rows={3}
              placeholder="e.g., Keep the tone formal and include a section on challenges."
              disabled={mutation.isPending}
            />
          </div>
           <div className="space-y-2">
            <Label htmlFor="toc">Table of Contents (Optional)</Label>
            <Textarea
              id="toc"
              {...form.register('tableOfContents')}
              rows={5}
              placeholder="Enter one heading per line to define the document structure."
              disabled={mutation.isPending}
            />
          </div>
          <Button type="submit" disabled={mutation.isPending} className="w-full">
            {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Write Document (3 Credits)
          </Button>
        </form>

        {(mutation.isPending || generatedContent) && (
          <div className="space-y-2 pt-6 border-t">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-muted-foreground">Generated Document</h3>
              {generatedContent && (
                <Button variant="ghost" size="icon" onClick={handleCopy}>
                  {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              )}
            </div>
            <ScrollArea className="h-[70vh] rounded-md border p-4 bg-muted/30">
              {mutation.isPending ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="prose dark:prose-invert max-w-none">
                  <ReactMarkdown components={markdownComponents}>{generatedContent}</ReactMarkdown>
                </div>
              )}
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
