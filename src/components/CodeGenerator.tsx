
'use client';

import { useActionState, useState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { handleGenerateCode, type CodeGenerationState } from '@/app/generate-code/actions';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Loader2, Sparkles, Copy, Check, Tv, Camera, Expand, Download, History, X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';
import { ScrollArea } from './ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { useToast } from '@/hooks/use-toast';

function GenerateButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} className="font-headline">
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                </>
            ) : (
                <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Code
                </>
            )}
        </Button>
    );
}

function CodeDisplay({ code, language }: { code: string; language: string; }) {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    return (
        <div className="relative">
             <ScrollArea className="h-full max-h-96 w-full rounded-md border">
                <pre className="p-4 text-sm">
                    <code>{code}</code>
                </pre>
            </ScrollArea>
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7"
                onClick={handleCopy}
            >
                {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
        </div>
    );
}

const HISTORY_KEY = 'arkan-code-gen-history';
const MAX_HISTORY = 5;

export default function CodeGenerator() {
    const initialState: CodeGenerationState = {};
    const [state, formAction] = useActionState(handleGenerateCode, initialState);
    const [srcDoc, setSrcDoc] = useState('');
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const { toast } = useToast();
    const [history, setHistory] = useState<CodeGenerationState[]>([]);

    useEffect(() => {
        try {
            const storedHistory = localStorage.getItem(HISTORY_KEY);
            if (storedHistory) {
                setHistory(JSON.parse(storedHistory));
            }
        } catch (error) {
            console.error('Failed to load history from localStorage', error);
        }
    }, []);

    useEffect(() => {
        if (state.html || state.css || state.javascript) {
            const timeout = setTimeout(() => {
                setSrcDoc(`
                    <html>
                        <head>
                            <style>${state.css || ''}</style>
                            <script>${state.javascript || ''}<\/script>
                        </head>
                        <body>${state.html || ''}</body>
                    </html>
                `);

                // Update history
                if (state.prompt) {
                     setHistory(prev => {
                        const newHistory = [state, ...prev.filter(h => h.prompt !== state.prompt)].slice(0, MAX_HISTORY);
                        try {
                           localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
                        } catch (error) {
                           console.error('Failed to save history to localStorage', error);
                        }
                        return newHistory;
                    });
                }
            }, 300);
            return () => clearTimeout(timeout);
        }
    }, [state.html, state.css, state.javascript, state.prompt]);

    const takeScreenshot = async () => {
        if (!iframeRef.current?.contentWindow) return;
        setIsCapturing(true);

        try {
            const canvas = await html2canvas(iframeRef.current.contentWindow.document.body, {
                useCORS: true,
                allowTaint: true,
                scale: window.devicePixelRatio,
            });
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            if(blob) {
                saveAs(blob, 'code-preview.png');
            }
        } catch (error) {
            console.error("Screenshot failed:", error);
            toast({
                title: "Screenshot Failed",
                description: "There was an error capturing the preview.",
                variant: "destructive"
            })
        } finally {
            setIsCapturing(false);
        }
    }

    const downloadZip = async () => {
        setIsDownloading(true);
        try {
            const zip = new JSZip();
            zip.file("index.html", state.html || "");
            zip.file("style.css", state.css || "");
            zip.file("script.js", state.javascript || "");

            const blob = await zip.generateAsync({ type: "blob" });
            saveAs(blob, "generated-code.zip");

        } catch (error) {
            console.error("ZIP download failed:", error);
            toast({
                title: "Download Failed",
                description: "There was an error creating the ZIP file.",
                variant: "destructive"
            })
        } finally {
            setIsDownloading(false);
        }
    }
    
    const restoreFromHistory = (historyItem: CodeGenerationState) => {
        const fakeState: CodeGenerationState = { ...historyItem };
        const fakeAction = (s: CodeGenerationState, f: FormData) => Promise.resolve(s);
        const form = document.createElement('form');
        const formData = new FormData(form);
        formData.set('prompt', historyItem.prompt || '');
        
        // This is a way to trigger the state update logic without a real form action
        formAction(formData);
    }
    
    const clearHistory = () => {
        setHistory([]);
        localStorage.removeItem(HISTORY_KEY);
        toast({ title: "History Cleared" });
    }

    const renderPreview = (isDialog: boolean) => (
         <div className={cn(
            "w-full rounded-md border bg-white overflow-hidden",
            !srcDoc && "flex items-center justify-center bg-muted",
            isDialog ? "h-[80vh]" : "aspect-video"
        )}>
            {srcDoc ? (
                <iframe
                    ref={isDialog ? null : iframeRef} // Only ref the main preview
                    srcDoc={srcDoc}
                    title="Live Preview"
                    width="100%"
                    height="100%"
                    className="border-0"
                />
            ) : (
                <div className="text-center text-muted-foreground p-8">
                    <p>Your generated code preview will appear here.</p>
                </div>
            )}
        </div>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 space-y-6">
                <Card>
                    <form action={formAction}>
                        <CardHeader>
                            <CardTitle className="font-headline">Describe your UI</CardTitle>
                            <CardDescription>
                                Be descriptive for the best results. For example: "A login form with email and password fields, and a submit button".
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                name="prompt"
                                placeholder='A simple button that says "Click me!" and changes color when hovered.'
                                rows={8}
                                required
                            />
                            {state?.error && (
                                <p className="text-sm font-medium text-destructive mt-2">{state.error}</p>
                            )}
                        </CardContent>
                        <CardFooter>
                            <GenerateButton />
                        </CardFooter>
                    </form>
                </Card>

                {history.length > 0 && (
                     <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="font-headline flex items-center gap-2">
                                    <History className="w-5 h-5" />
                                    History
                                </CardTitle>
                                <Button variant="ghost" size="sm" onClick={clearHistory}>
                                    <X className="mr-1 h-4 w-4" /> Clear
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-48 w-full">
                                <div className="space-y-2">
                                    {history.map((item, index) => (
                                        <button key={index} onClick={() => restoreFromHistory(item)} className="w-full text-left p-2 rounded-md hover:bg-muted text-sm text-muted-foreground truncate">
                                            {item.prompt}
                                        </button>
                                    ))}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                )}

                {(state.html || state.css || state.javascript) && (
                    <Card>
                        <CardHeader>
                             <div className="flex justify-between items-center">
                                <CardTitle className="font-headline">Generated Code</CardTitle>
                                <Button variant="outline" size="sm" onClick={downloadZip} disabled={isDownloading}>
                                    {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                                    Download ZIP
                                </Button>
                             </div>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="html" className="w-full">
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="html">HTML</TabsTrigger>
                                    <TabsTrigger value="css">CSS</TabsTrigger>
                                    <TabsTrigger value="javascript">JS</TabsTrigger>
                                </TabsList>
                                <TabsContent value="html" className="mt-4">
                                    <CodeDisplay code={state.html || ''} language="html" />
                                </TabsContent>
                                <TabsContent value="css" className="mt-4">
                                    <CodeDisplay code={state.css || ''} language="css" />
                                </TabsContent>
                                <TabsContent value="javascript" className="mt-4">
                                    <CodeDisplay code={state.javascript || '// No JavaScript generated'} language="javascript" />
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                )}
            </div>

            <div className="lg:col-span-2 lg:sticky top-24 self-start">
                 <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle className="font-headline flex items-center gap-2">
                                <Tv className="w-6 h-6" />
                                Live Preview
                            </CardTitle>
                            {srcDoc && (
                                <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon" onClick={takeScreenshot} disabled={isCapturing} title="Take Screenshot">
                                        {isCapturing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => setIsExpanded(true)} title="Expand Preview">
                                        <Expand className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                       {renderPreview(false)}
                    </CardContent>
                </Card>
                <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
                    <DialogContent className="max-w-7xl h-[90vh] flex flex-col p-4">
                        <DialogHeader className="flex-row items-center justify-between border-b pb-2">
                            <DialogTitle>Expanded Preview</DialogTitle>
                        </DialogHeader>
                        <div className="flex-grow">
                             {renderPreview(true)}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
