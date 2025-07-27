'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Loader2, Sparkles, Tv, Check } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { GenerateUIOutput } from '@/ai/flows/generate-ui';
import { useLocalization } from '@/context/LocalizationContext';

async function generateUI(variables: { prompt: string; token: string }): Promise<GenerateUIOutput> {
    const response = await fetch('/api/generate-ui', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${variables.token}`,
        },
        body: JSON.stringify({ prompt: variables.prompt }),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate UI');
    }
    return response.json();
}

function CodeDisplay({ code, language }: { code: string; language: string; }) {
    const [isCopied, setIsCopied] = useState(false);
    const { t } = useLocalization();

    const handleCopy = () => {
        navigator.clipboard.writeText(code).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    return (
        <div className="relative">
             <div className="h-full max-h-96 w-full rounded-md border bg-muted p-4">
                <pre className="text-sm overflow-x-auto">
                    <code>{code}</code>
                </pre>
            </div>
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7"
                onClick={handleCopy}
            >
                {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>}
            </Button>
        </div>
    );
}

export default function UIAgent() {
    const { t } = useLocalization();
    const [prompt, setPrompt] = useState('A modern login form with email and password fields, a "Forgot Password" link, and a prominent login button. It should be centered on the page.');
    const [html, setHtml] = useState('');
    const [css, setCss] = useState('');
    const [srcDoc, setSrcDoc] = useState('');
    
    const { firebaseUser, refetchUser } = useAuth();
    const { toast } = useToast();

    const mutation = useMutation({
        mutationFn: generateUI,
        onSuccess: (data) => {
            setHtml(data.html);
            setCss(data.css);
            refetchUser();
            toast({ title: "UI Generated Successfully!" });
        },
        onError: (error: Error) => {
            toast({ title: "UI Generation Failed", description: error.message, variant: "destructive" });
        }
    });

    useEffect(() => {
        const timeout = setTimeout(() => {
            setSrcDoc(`
                <html>
                    <head>
                        <style>${css || ''}</style>
                    </head>
                    <body>
                        ${html || ''}
                    </body>
                </html>
            `);
        }, 300);
        return () => clearTimeout(timeout);
    }, [html, css]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firebaseUser) {
            toast({ title: "Authentication Required", description: "You must be logged in to generate UI.", variant: "destructive" });
            return;
        }
        const token = await firebaseUser.getIdToken();
        mutation.mutate({ prompt, token });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:h-[calc(100vh-250px)]">
                {/* Left Column: Tools & Prompt */}
                <div className="lg:col-span-3 space-y-6 lg:overflow-y-auto lg:pr-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">UI Generation Tools</CardTitle>
                            <CardDescription>Describe the UI component you want the AI to build.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                name="prompt"
                                placeholder="e.g., A responsive card component with an image, title, and description."
                                rows={8}
                                required
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                disabled={mutation.isPending}
                            />
                            {mutation.isError && (
                                <p className="text-sm font-medium text-destructive mt-2">{mutation.error.message}</p>
                            )}
                        </CardContent>
                        <CardFooter>
                           <Button type="submit" disabled={mutation.isPending} className="font-headline w-full">
                                {mutation.isPending ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Sparkles className="mr-2 h-4 w-4" />
                                )}
                                Generate UI
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
                
                {/* Right Column: Preview & Code */}
                <div className="lg:col-span-9 lg:overflow-y-auto lg:pr-2">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle className="font-headline flex items-center gap-2">
                                <Tv className="w-6 h-6" />
                                Live Preview & Code
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                             <Tabs defaultValue="preview" className="w-full">
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="preview">Preview</TabsTrigger>
                                    <TabsTrigger value="html">HTML</TabsTrigger>
                                    <TabsTrigger value="css">CSS</TabsTrigger>
                                </TabsList>
                                <TabsContent value="preview" className="mt-4">
                                     <div className="w-full h-[50vh] rounded-md border bg-white overflow-hidden">
                                        <iframe
                                            srcDoc={srcDoc}
                                            title="Live Preview"
                                            width="100%"
                                            height="100%"
                                            className="border-0"
                                            sandbox="allow-scripts"
                                        />
                                    </div>
                                </TabsContent>
                                <TabsContent value="html" className="mt-4">
                                    <CodeDisplay code={html || '<!-- HTML will appear here -->'} language="html" />
                                </TabsContent>
                                <TabsContent value="css" className="mt-4">
                                    <CodeDisplay code={css || '/* CSS will appear here */'} language="css" />
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </form>
    );
}
