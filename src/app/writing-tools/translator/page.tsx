'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, _Controller } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Languages, Copy, Check } from 'lucide-react';
import { useWritingTool, useToast } from '@/hooks';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/lib/utils/markdown-styles';
import { ScrollArea } from '@/components/ui/scroll-area';

const languages = [
  { value: 'en', label: 'English' },
  { value: 'ar', label: 'Arabic' },
  { value: 'sp', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'ge', label: 'German' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ch', label: 'Chinese' },
  { value: 'ru', label: 'Russian' },
];

const translateSchema = z.object({
  text: z.string().min(1, 'Please enter some text to translate.'),
  targetLang: z.string().min(1, 'Please select a target language.'),
});

type TranslateFormValues = z.infer<typeof translateSchema>;

function TranslatorTool() {
  const { toast } = useToast();
  const [translatedText, setTranslatedText] = useState('');
  const [originalText, setOriginalText] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const mutation = useWritingTool('/api/writing-tools/translate-text', {
    onSuccess: (data: any) => {
      setTranslatedText(data.text);
      toast({ title: 'Translation Successful' });
    },
    onError: (error) => {
      toast({ title: 'Translation Failed', description: error.message, variant: 'destructive' });
    }
  });

  const form = useForm<TranslateFormValues>({
    resolver: zodResolver(translateSchema),
    defaultValues: {
      text: '',
      targetLang: 'ar',
    },
  });

  const onSubmit = (data: TranslateFormValues) => {
    setOriginalText(data.text);
    mutation.mutate(data);
  };

  const handleCopy = () => {
    if (!translatedText) return;
    navigator.clipboard.writeText(translatedText).then(() => {
      setIsCopied(true);
      toast({ title: 'Copied to clipboard!' });
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <Languages className="w-10 h-10" />
          AI Translator
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Translate text between various languages while preserving markdown formatting.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Translator</CardTitle>
          <CardDescription>Enter text, choose a language, and let the AI translate.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Text to Translate</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter your text or markdown here..." rows={8} {...field} disabled={mutation.isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="targetLang"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Language</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={mutation.isPending}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {languages.map(lang => (
                          <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={mutation.isPending} className="w-full">
                {mutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Languages className="me-2 h-4 w-4" />}
                Translate (1 Credit)
              </Button>
            </form>
          </Form>

          {(mutation.isPending || translatedText) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t">
              <div className="space-y-2">
                <h3 className="font-semibold text-muted-foreground">Original Text</h3>
                <ScrollArea className="h-64 rounded-md border p-4">
                  <div className="prose dark:prose-invert max-w-none text-sm"><ReactMarkdown components={markdownComponents}>{originalText}</ReactMarkdown></div>
                </ScrollArea>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-muted-foreground flex justify-between items-center">
                  <span>Translated Text</span>
                  <Button variant="ghost" size="icon" onClick={handleCopy}>
                    {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </h3>
                <ScrollArea className="h-64 rounded-md border p-4 bg-muted/30">
                  {mutation.isPending ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="prose dark:prose-invert max-w-none text-sm"><ReactMarkdown components={markdownComponents}>{translatedText}</ReactMarkdown></div>
                  )}
                </ScrollArea>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default TranslatorTool;
