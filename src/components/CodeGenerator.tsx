
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Loader2, Sparkles, Copy, Check, Tv, Camera, Expand, Download, X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';
import { ScrollArea } from './ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { useToast } from '@/hooks/use-toast';
import { useCodeState } from '@/context/CodeStateContext';

function GenerateButton() {
    const { isGenerating } = useCodeState();
    return (
        <Button type="submit" disabled={isGenerating} className="font-headline w-full">
            {isGenerating ? (
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
    const { state, prompt, setPrompt, handleGenerateCode } = useCodeState();
    const [srcDoc, setSrcDoc] = useState('');
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const { toast } = useToast();
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setSrcDoc(`
                <html>
                    <head>
                        <style>${state.css || ''}</style>
                    </head>
                    <body>
                        ${state.html || ''}
                        <script>${state.javascript || ''}<\/script>
                    </body>
                </html>
            `);
        }, 300);
        return () => clearTimeout(timeout);
    }, [state]);

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
                saveAs(blob as Blob, 'code-preview.png');
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
            zip.file("index.html", `<!DOCTYPE html>
<html>
<head>
    <title>Generated Component</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    ${state.html || ''}
    <script src="script.js"></script>
</body>
</html>`);
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

    const renderPreview = (isDialog: boolean) => (
         <div className={cn(
            "w-full rounded-md border bg-white overflow-hidden",
            !srcDoc && "flex items-center justify-center bg-muted",
            isDialog ? "h-full" : "h-[60vh]"
        )}>
            {srcDoc ? (
                <iframe
                    ref={isDialog ? null : iframeRef} // Only ref the main preview
                    srcDoc={srcDoc}
                    title="Live Preview"
                    width="100%"
                    height="100%"
                    className="border-0"
                    sandbox="allow-scripts"
                />
            ) : (
                <div className="text-center text-muted-foreground p-8">
                    <p>Your generated code preview will appear here.</p>
                </div>
            )}
        </div>
    );

    return (
        <form onSubmit={(e) => { e.preventDefault(); handleGenerateCode(); }}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-150px)]">
                {/* Left Column */}
                <div className="lg:col-span-3 space-y-6 overflow-y-auto pr-2">
                    {(state.html || state.css || state.javascript) && (
                        <Card>
                            <CardHeader className="flex-row items-center justify-between">
                                <CardTitle className="font-headline">Generated Code</CardTitle>
                                <Button variant="outline" size="sm" onClick={downloadZip} disabled={isDownloading}>
                                    {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                                    Download ZIP
                                </Button>
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

                {/* Center Column */}
                <div className="lg:col-span-6 overflow-y-auto pr-2">
                    <Card className="h-full">
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
                </div>

                {/* Right Column */}
                <div className="lg:col-span-3 space-y-6 overflow-y-auto pr-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">Generation Tools</CardTitle>
                            <CardDescription>Describe the UI component you want to create.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                name="prompt"
                                placeholder='A simple button that says "Click me!" and changes color when hovered.'
                                rows={8}
                                required
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                disabled={state.isGenerating}
                            />
                            {state?.error && (
                                <p className="text-sm font-medium text-destructive mt-2">{state.error}</p>
                            )}
                        </CardContent>
                        <CardFooter>
                            <GenerateButton />
                        </CardFooter>
                    </Card>
                </div>

                <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
                    <DialogContent className="max-w-full w-full h-full flex flex-col p-4">
                        <DialogHeader className="flex-row items-center justify-between border-b pb-2">
                            <DialogTitle>Expanded Preview</DialogTitle>
                        </DialogHeader>
                        <div className="flex-grow min-h-0">
                            {renderPreview(true)}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </form>
    );
}
