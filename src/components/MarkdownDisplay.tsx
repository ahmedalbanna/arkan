
'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { markdownComponents } from '@/lib/markdown-components';
import { exportMarkdownAsDocx } from '@/lib/docx-exporter';
import { FileDown, Loader2, Wand2, Check, ThumbsDown } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Label } from './ui/label';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { getAuthenticatedToken } from '@/lib/authUtils';

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
          toast({ title: "AI Suggestion Ready", description: "The AI has finished improving your document."});
          refetchUser();
      },
      onError: (error: Error) => {
          toast({ title: "AI Assistant Failed", description: error.message, variant: "destructive" });
      }
  });

  const handleImproveMarkdown = async () => {
    if (!markdown.trim() || !userPrompt.trim()) {
        toast({ title: "Missing Input", description: "Please provide both the Markdown content and instructions for the AI.", variant: "destructive"});
        return;
    }
    const token = await getAuthenticatedToken(firebaseUser);
    improveMutation.mutate({ markdownContent: markdown, userPrompt, token });
  };
  
  const handleAcceptSuggestion = () => {
    if (aiSuggestion !== null) {
        setMarkdown(aiSuggestion);
        setAiSuggestion(null);
        toast({ title: "Suggestion Accepted", description: "The document has been updated with the AI's improvements."});
    }
  };


  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
            <Tabs defaultValue="input">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="input">Markdown Input</TabsTrigger>
                    <TabsTrigger value="assistant">AI Assistant</TabsTrigger>
                </TabsList>
                <TabsContent value="input">
                    <Card>
                        <CardContent className="pt-6">
                            <Textarea
                            value={markdown}
                            onChange={(e) => setMarkdown(e.target.value)}
                            placeholder="Paste your Markdown here..."
                            className="h-[60vh] resize-none"
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="assistant">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Wand2 className="h-5 w-5"/> AI Assistant</CardTitle>
                             <CardDescription>Provide instructions for the AI to format, organize, or improve your report.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="ai-prompt">Your Instructions</Label>
                                <Textarea
                                    id="ai-prompt"
                                    placeholder="e.g., 'Please format this as a formal report. Add a concluding paragraph and ensure all headings are consistent.'"
                                    value={userPrompt}
                                    onChange={(e) => setUserPrompt(e.target.value)}
                                    rows={5}
                                    disabled={improveMutation.isPending}
                                />
                            </div>
                            <Button onClick={handleImproveMarkdown} disabled={improveMutation.isPending}>
                                {improveMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4"/>}
                                Improve with AI
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
        <div>
           <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle>Live Preview</CardTitle>
                <CardDescription>
                    {aiSuggestion ? 'An AI suggestion is ready for your review.' : 'The rendered output of your Markdown.'}
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
                            <Button variant="ghost" onClick={() => setAiSuggestion(null)}><ThumbsDown className="mr-2 h-4 w-4"/> Reject</Button>
                            <Button onClick={handleAcceptSuggestion}><Check className="mr-2 h-4 w-4"/> Accept Suggestion</Button>
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
                  {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
                  Export as DOCX
                </Button>
              </CardFooter>
            </Card>
        </div>
    </div>
  );
}
