
'use client';

import { useActionState, useState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { handleGenerateCode, type CodeGenerationState } from '@/app/generate-code/actions';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Loader2, Sparkles, Copy, Check, Tv, Camera, Expand } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';
import { ScrollArea } from './ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';


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


export default function CodeGenerator() {
    const initialState: CodeGenerationState = {};
    const [state, formAction] = useActionState(handleGenerateCode, initialState);
    const [srcDoc, setSrcDoc] = useState('');
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        if (state.html || state.css || state.javascript) {
            const timeout = setTimeout(() => {
                setSrcDoc(`
                    <html>
                        <head>
                            <style>${state.css || ''}</style>
                        </head>
                        <body>${state.html || ''}</body>
                        <script>${state.javascript || ''}<\/script>
                    </html>
                `);
            }, 300);
            return () => clearTimeout(timeout);
        }
    }, [state.html, state.css, state.javascript]);


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
        } finally {
            setIsCapturing(false);
        }
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
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

                {(state.html || state.css || state.javascript) && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">Generated Code</CardTitle>
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

            <div className="lg:sticky top-24 self-start">
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
