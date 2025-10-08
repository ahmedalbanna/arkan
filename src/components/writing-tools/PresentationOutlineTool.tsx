
'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWritingTool } from '@/hooks/use-writing-tools';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, Copy, Check, ChevronDown, ChevronRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ScrollArea } from '../ui/scroll-area';
import { GeneratePresentationOutlineOutput } from '@/ai/schemas';
import { Textarea } from '../ui/textarea';
import { useLocalization } from '@/context/LocalizationContext';

const formSchema = z.object({
  prompt: z.string().min(5, 'Please enter a topic with at least 5 characters.'),
  documentation: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const OutlineItem = ({ item, level = 0 }: { item: GeneratePresentationOutlineOutput['outline-solid'][0], level?: number }) => {
    const [isOpen, setIsOpen] = useState(true);
    const hasChildren = item.children && item.children.length > 0;

    return (
        <div style={{ paddingLeft: `${level * 1.5}rem`}}>
            <div className="flex items-center gap-2 py-1">
                {hasChildren ? (
                    <button onClick={() => setIsOpen(!isOpen)} className="p-1 -ml-1">
                        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                ) : <div className="w-6 h-6"/>}
                <h4 className="font-semibold">{item.title}</h4>
            </div>
            {isOpen && (
                <div className="text-sm text-muted-foreground pl-8 border-l-2 ml-3">
                    <p className="py-1">{item.content}</p>
                    {hasChildren && item.children?.map((child, index) => <OutlineItem key={index} item={child} level={level + 1} />)}
                </div>
            )}
        </div>
    )
}

export function PresentationOutlineTool() {
  const { t } = useLocalization();
  const [isCopied, setIsCopied] = useState(false);
  const [generatedOutline, setGeneratedOutline] = useState<GeneratePresentationOutlineOutput | null>(null);

  const mutation = useWritingTool('/api/generate/presentation-outline', {
    onSuccess: (data: any) => {
        setGeneratedOutline(data);
        toast({ title: "Outline Generated!", description: "Review the outline-solid and choose a template to proceed."});
    },
    onError: (error) => {
        toast({ title: "Outline Generation Failed", description: error.message, variant: "destructive" });
    }
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { prompt: '' },
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  const handleCopy = () => {
    if (!generatedOutline) return;
    const textToCopy = `${generatedOutline.cover.title}\n\n` + generatedOutline.outline.map(item => `${item.title}\n${item.content}`).join('\n\n');
    navigator.clipboard.writeText(textToCopy).then(() => {
      setIsCopied(true);
      toast({ title: 'Copied to clipboard!' });
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('writingTools.presentationOutline.cardTitle')}</CardTitle>
        <CardDescription>{t('writingTools.presentationOutline.cardDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="topic">{t('writingTools.presentationOutline.topicLabel')}</Label>
            <Input
              id="topic"
              {...form.register('prompt')}
              placeholder={t('writingTools.presentationOutline.topicPlaceholder')}
              disabled={mutation.isPending}
            />
            {form.formState.errors.prompt && <p className="text-sm text-destructive">{form.formState.errors.prompt.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="documentation">{t('writingTools.presentationOutline.documentationLabel')}</Label>
            <Textarea
              id="documentation"
              {...form.register('documentation')}
              rows={8}
              placeholder={t('writingTools.presentationOutline.documentationPlaceholder')}
              disabled={mutation.isPending}
            />
          </div>

          <Button type="submit" disabled={mutation.isPending} className="w-full">
            {mutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Sparkles className="me-2 h-4 w-4" />}
            {t('writingTools.presentationOutline.generateButton')}
          </Button>
        </form>

        {(mutation.isPending || generatedOutline) && (
          <div className="space-y-2 pt-6 border-t">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-muted-foreground">{t('writingTools.presentationOutline.generatedOutline')}</h3>
              {generatedOutline && (
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
              ) : generatedOutline && (
                <div className="space-y-4">
                    <h3 className="text-lg font-bold">{generatedOutline.cover.title}</h3>
                    <div className="space-y-2">
                        {generatedOutline.outline.map((item, index) => <OutlineItem key={index} item={item} />)}
                    </div>
                </div>
              )}
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
