
'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { markdownComponents } from '@/lib/markdown-components';
import { exportMarkdownAsDocx } from '@/lib/docx-exporter';
import { FileDown, Loader2, Wand2, Check, ThumbsDown, Sparkles } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Label } from './ui/label';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { getAuthenticatedToken } from '@/lib/authUtils';
import { useLocalization } from '@/context/LocalizationContext';

async function improveMarkdownApi(variables: { markdownContent: string, userPrompt: string, token: string }): Promise<{ improvedMarkdown: string }> {
    const response = await fetch('/api/improve-markdown', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${variables.token}`,
        },
        body: JSON.stringify({ markdownContent: variables.markdownContent, userPrompt: variables.userPrompt }),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to improve markdown');
    }
    return response.json();
}


export function MarkdownDisplay() {
  const { t } = useLocalization();
  const [markdown, setMarkdown] = useState(`# Sample Markdown

## This is a heading

Paste your **Markdown** text on the left to see the styled output on the right.

-   Supports lists
-   And other standard elements

| Syntax      | Description |
| ----------- | ----------- |
| Header      | Title       |
| Paragraph   | Text        |

\`\`\`javascript
function helloWorld() {
  console.log("Hello, world!");
}
\`\`\`
`);
  const [isExporting, setIsExporting] = useState(false);
  const [userPrompt, setUserPrompt] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const { firebaseUser, refetchUser } = useAuth();

  const handleExport = async () => {
    setIsExporting(true);
    await exportMarkdownAsDocx(markdown, "markdown-export");
    setIsExporting(false);
  };

  const improveMutation = useMutation({
      mutationFn: improveMarkdownApi,
      onSuccess: (data) => {
          setAiSuggestion(data.improvedMarkdown);
          toast({ title: t('markdownDisplay.toasts.suggestionReadyTitle'), description: t('markdownDisplay.toasts.suggestionReadyDesc')});
          refetchUser();
      },
      onError: (error: Error) => {
          toast({ title: t('markdownDisplay.toasts.assistantFailedTitle'), description: error.message, variant: "destructive" });
      }
  });

  const handleImproveMarkdown = async () => {
    if (!markdown.trim() || !userPrompt.trim()) {
        toast({ title: t('markdownDisplay.toasts.missingInputTitle'), description: t('markdownDisplay.toasts.missingInputDesc'), variant: "destructive"});
        return;
    }
    const token = await getAuthenticatedToken(firebaseUser);
    improveMutation.mutate({ markdownContent: markdown, userPrompt, token });
  };

  const handleAcceptSuggestion = () => {
    if (aiSuggestion !== null) {
        setMarkdown(aiSuggestion);
        setAiSuggestion(null);
        toast({ title: t('markdownDisplay.toasts.suggestionAcceptedTitle'), description: t('markdownDisplay.toasts.suggestionAcceptedDesc')});
    }
  };


  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
            <Tabs defaultValue="input">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="input">{t('markdownDisplay.inputTab')}</TabsTrigger>
                    <TabsTrigger value="assistant">{t('markdownDisplay.assistantTab')}</TabsTrigger>
                </TabsList>
                <TabsContent value="input">
                    <Card>
                        <CardContent className="pt-6">
                            <Textarea
                            value={markdown}
                            onChange={(e) => setMarkdown(e.target.value)}
                            placeholder={t('markdownDisplay.placeholder')}
                            className="h-[60vh] resize-none"
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="assistant">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Wand2 className="h-5 w-5"/> {t('markdownDisplay.assistantTab')}</CardTitle>
                             <CardDescription>{t('markdownDisplay.aiAssistantDesc')}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="ai-prompt">{t('markdownDisplay.aiInstructionsLabel')}</Label>
                                <Textarea
                                    id="ai-prompt"
                                    placeholder={t('markdownDisplay.aiInstructionsPlaceholder')}
                                    value={userPrompt}
                                    onChange={(e) => setUserPrompt(e.target.value)}
                                    rows={5}
                                    disabled={improveMutation.isPending}
                                />
                            </div>
                            <Button onClick={handleImproveMarkdown} disabled={improveMutation.isPending}>
                                {improveMutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin"/> : <Sparkles className="me-2 h-4 w-4"/>}
                                {t('markdownDisplay.improveButton')}
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
        <div>
           <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle>{t('markdownDisplay.previewTitle')}</CardTitle>
                <CardDescription>
                    {aiSuggestion ? t('markdownDisplay.aiSuggestionReadyDesc') : t('markdownDisplay.renderedOutputDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                 {aiSuggestion ? (
                    <div className="space-y-4">
                        <ScrollArea className="h-[50vh] rounded-md border p-4 bg-muted/50">
                            <div className="prose dark:prose-invert max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                                {aiSuggestion}
                                </ReactMarkdown>
                            </div>
                        </ScrollArea>
                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" onClick={() => setAiSuggestion(null)}><ThumbsDown className="me-2 h-4 w-4"/> {t('markdownDisplay.rejectButton')}</Button>
                            <Button onClick={handleAcceptSuggestion}><Check className="me-2 h-4 w-4"/> {t('markdownDisplay.acceptButton')}</Button>
                        </div>
                    </div>
                 ) : (
                    <ScrollArea className="h-[60vh] rounded-md border p-4">
                        <div className="prose dark:prose-invert max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                            {markdown}
                            </ReactMarkdown>
                        </div>
                    </ScrollArea>
                 )}
              </CardContent>
              <CardFooter>
                 <Button onClick={handleExport} disabled={isExporting || !markdown}>
                  {isExporting ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <FileDown className="me-2 h-4 w-4" />}
                  {t('markdownDisplay.exportButton')}
                </Button>
              </CardFooter>
            </Card>
        </div>
    </div>
  );
}
