

'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, Copy, Check, Tv, Camera, Expand, Download, X, Package, Code, File, Folder } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { useToast } from '@/hooks';
import { useAuth } from '@/context/AuthContext';
import { useMutation } from '@tanstack/react-query';
import type { GenerateCodeOutput } from '@/ai/schemas';
import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore } from '@/hooks';
import type { Codebase } from '@/ai/schemas';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// --- Start of inlined FileTreeView component logic ---

// Helper function to build a tree structure from file paths
const buildFileTree = (files: { path: string; content: string }[]) => {
  const tree: any = {};
  files.forEach(file => {
    const parts = file.path.split('/');
    let current = tree;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) {
        current[part] = file.content;
      } else {
        current[part] = current[part] || {};
        current = current[part];
      }
    }
  });
  return tree;
};

// Recursive component to render the tree
const Tree = ({ data, level = 0 }: { data: any; level?: number }) => {
  return (
    <div style={{ paddingLeft: `${level * 1}rem` }}>
      {Object.entries(data).map(([name, content]) => (
        <div key={name}>
          {typeof content === 'string' ? (
            <div className="flex items-center gap-2 p-1 text-sm">
              <File className="h-4 w-4 shrink-0" />
              <span>{name}</span>
            </div>
          ) : (
            <Accordion type="single" collapsible>
              <AccordionItem value={name} className="border-none">
                <AccordionTrigger className="p-1 hover:no-underline [&[data-state=open]>svg]:rotate-90">
                  <div className="flex items-center gap-2">
                    <Folder className="h-4 w-4" />
                    <span className="font-semibold">{name}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <Tree data={content} level={level + 1} />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </div>
      ))}
    </div>
  );
};

function FileTreeView({ codebase }: { codebase: Codebase }) {
  const [isZipping, setIsZipping] = useState(false);
  const { t, locale } = useLocalization();
  const { toast } = useToast();
  const fileTree = buildFileTree(codebase.files);

  const handleDownload = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      codebase.files.forEach(file => {
        zip.file(file.path, file.content);
      });
      const blob = await zip.generateAsync({ type: 'blob' });
      saveAs(blob, 'generated-codebase.zip');
    } catch (error) {
      console.error('Error creating ZIP file:', error);
      toast({
        title: t('builder.codeGenerator.codebaseGenerator.toasts.zipFailed'),
        description: t('builder.codeGenerator.codebaseGenerator.toasts.zipFailedDesc'),
        variant: 'destructive',
      });
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            <div>
                <CardTitle className="font-headline text-2xl text-primary">{t('builder.codeGenerator.codebaseGenerator.fileTreeView.title')}</CardTitle>
                <CardDescription>{t('builder.codeGenerator.codebaseGenerator.fileTreeView.description')}</CardDescription>
            </div>
            <Button onClick={handleDownload} disabled={isZipping}>
                {isZipping ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Download className="me-2 h-4 w-4" />}
                {t('builder.codeGenerator.codebaseGenerator.fileTreeView.downloadButton')}
            </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <ScrollArea className="h-full border rounded-md p-4">
            <Tree data={fileTree} />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// --- End of inlined FileTreeView component logic ---


async function generateCodeApi(variables: { prompt: string; token: string }): Promise<GenerateCodeOutput> {
    const response = await fetch('/api/generate/code', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${variables.token}`,
        },
        body: JSON.stringify({ prompt: variables.prompt }),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate code');
    }
    return response.json();
}

async function generateCodebaseApi(variables: { proposal: any; token: string }): Promise<Codebase> {
  const response = await fetch('/api/generate/codebase', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${variables.token}`,
    },
    body: JSON.stringify({ proposal: variables.proposal }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to generate codebase');
  }
  return response.json();
}

function CodeDisplay({ code, language }: { code: string; language: string; }) {
    const [isCopied, setIsCopied] = useState(false);
    const { t, locale } = useLocalization();
    const handleCopy = () => {
        navigator.clipboard.writeText(code).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    return (
      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start" dir={locale === 'ar' ? 'rtl' : 'ltr'}>

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

function ComponentGenerator() {
    const { t, locale } = useLocalization();
    const { project, updateProject } = useBuilderStore();

    const codeGeneratorState = project?.codeGenerator;
    const { prompt = '', html = '', css = '', javascript = '' } = codeGeneratorState || {};

    const { firebaseUser, refetchUser } = useAuth();
    const [srcDoc, setSrcDoc] = useState('');
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const { toast } = useToast();
    const [isExpanded, setIsExpanded] = useState(false);

    const mutation = useMutation({
        mutationFn: generateCodeApi,
        onSuccess: (data) => {
            updateProject(p => p.setGeneratedCode(data));
            refetchUser(); // Invalidate user query to update credits
            toast({ title: t('builder.codeGenerator.componentGenerator.toasts.success') });
        },
        onError: (error: Error) => {
            toast({ title: t('builder.codeGenerator.componentGenerator.toasts.failed'), description: error.message, variant: "destructive" });
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
                        <script>${javascript || ''}<\/script>
                    </body>
                </html>
            `);
        }, 300);
        return () => clearTimeout(timeout);
    }, [html, css, javascript]);

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
                title: t('builder.codeGenerator.componentGenerator.toasts.screenshotFailed'),
                description: t('builder.codeGenerator.componentGenerator.toasts.screenshotFailedDesc'),
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
    ${html || ''}
    <script src="script.js"></script>
</body>
</html>`);
            zip.file("style.css", css || "");
            zip.file("script.js", javascript || "");

            const blob = await zip.generateAsync({ type: "blob" });
            saveAs(blob, "generated-code.zip");

        } catch (error) {
            console.error("ZIP download failed:", error);
            toast({
                title: t('builder.codeGenerator.componentGenerator.toasts.zipFailed'),
                description: t('builder.codeGenerator.componentGenerator.toasts.zipFailedDesc'),
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
            isDialog ? "h-full" : "h-[60vh] lg:h-full"
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
                    <p>{t('builder.codeGenerator.componentGenerator.emptyPreview')}</p>
                </div>
            )}
        </div>
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firebaseUser) {
            toast({ title: t('builder.toasts.authError'), description: t('builder.codeGenerator.componentGenerator.toasts.authError'), variant: "destructive" });
            return;
        }
        const token = await firebaseUser.getIdToken();
        mutation.mutate({ prompt, token });
    };

    return (
        <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                {/* Left Column */}
                <div className="lg:col-span-3 space-y-6 lg:overflow-y-auto lg:pr-2">
                     <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">{t('builder.codeGenerator.componentGenerator.toolsTitle')}</CardTitle>
                            <CardDescription>{t('builder.codeGenerator.componentGenerator.toolsDesc')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                name="prompt"
                                placeholder={t('builder.codeGenerator.componentGenerator.promptPlaceholder')}
                                rows={8}
                                required
                                value={prompt}
                                onChange={(e) => updateProject(p => p.setCodeGeneratorPrompt(e.target.value))}
                                disabled={mutation.isPending}
                            />
                            {mutation.isError && (
                                <p className="text-sm font-medium text-destructive mt-2">{mutation.error.message}</p>
                            )}
                        </CardContent>
                        <CardFooter>
                           <Button type="submit" disabled={mutation.isPending} className="font-headline w-full">
                                {mutation.isPending ? (
                                    <>
                                        <Loader2 className="me-2 h-4 w-4 animate-spin" />
                                        {t('builder.codeGenerator.componentGenerator.generateButtonLoading')}
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="me-2 h-4 w-4" />
                                        {t('builder.codeGenerator.componentGenerator.generateButton')}
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                {/* Center Column */}
                <div className="lg:col-span-5 lg:overflow-y-auto lg:pr-2">
                    <Card className="h-full">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="font-headline flex items-center gap-2">
                                    <Tv className="w-6 h-6" />
                                    {t('builder.codeGenerator.componentGenerator.livePreview')}
                                </CardTitle>
                                {srcDoc && (
                                    <div className="flex items-center gap-1">
                                        <Button variant="ghost" size="icon" onClick={takeScreenshot} disabled={isCapturing} title={t('builder.codeGenerator.componentGenerator.tooltips.screenshot')}>
                                            {isCapturing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => setIsExpanded(true)} title={t('builder.codeGenerator.componentGenerator.tooltips.expand')}>
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
                <div className="lg:col-span-4 space-y-6 lg:overflow-y-auto lg:pr-2">
                    {(html || css || javascript) && (
                        <Card>
                            <CardHeader className="flex-row items-center justify-between">
                                <CardTitle className="font-headline">{t('builder.codeGenerator.componentGenerator.generatedCode')}</CardTitle>
                                <Button variant="outline" size="sm" onClick={downloadZip} disabled={isDownloading}>
                                    {isDownloading ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Download className="me-2 h-4 w-4" />}
                                    {t('builder.codeGenerator.componentGenerator.downloadZip')}
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
                                        <CodeDisplay code={html || ''} language="html" />
                                    </TabsContent>
                                    <TabsContent value="css" className="mt-4">
                                        <CodeDisplay code={css || ''} language="css" />
                                    </TabsContent>
                                    <TabsContent value="javascript" className="mt-4">
                                        <CodeDisplay code={javascript || t('builder.codeGenerator.componentGenerator.noJs')} language="javascript" />
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
                    <DialogContent className="max-w-full w-full h-full flex flex-col p-4">
                        <DialogHeader className="flex-row items-center justify-between border-b pb-2">
                            <DialogTitle>{t('builder.codeGenerator.componentGenerator.expandedTitle')}</DialogTitle>
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


function FullCodebaseGenerator() {
  const { t, locale } = useLocalization();
  const { toast } = useToast();
  const { firebaseUser, refetchUser } = useAuth();
  const { project, updateProject } = useBuilderStore();
  const codebase = project?.codebase;
  const proposal = project?.proposal;
  
  const mutation = useMutation({
    mutationFn: generateCodebaseApi,
    onSuccess: (data) => {
      updateProject(p => p.setCodebase(data));
      refetchUser(); // To update credits
      toast({
        title: t('builder.codeGenerator.codebaseGenerator.toasts.successTitle'),
        description: t('builder.codeGenerator.codebaseGenerator.toasts.successDesc'),
      });
    },
    onError: (error: Error) => {
      toast({ title: t('builder.codeGenerator.toasts.failed'), description: error.message, variant: 'destructive' });
    },
  });

  const handleGenerate = () => {
    if (!proposal || !firebaseUser) {
      toast({
        title: t('builder.codeGenerator.codebaseGenerator.toasts.noProposal'),
        description: t('builder.codeGenerator.codebaseGenerator.toasts.noProposalDesc'),
        variant: 'destructive',
      });
      return;
    }
    const token = firebaseUser.getIdToken();
    token.then(t => mutation.mutate({ proposal, token: t }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="lg:col-span-3 space-y-6 lg:overflow-y-auto lg:pr-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('builder.codeGenerator.codebaseGenerator.cardTitle')}</CardTitle>
            <CardDescription>{t('builder.codeGenerator.codebaseGenerator.cardDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleGenerate} disabled={!proposal || mutation.isPending} className="w-full">
              {mutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Sparkles className="me-2 h-4 w-4" />}
              {t('builder.codeGenerator.codebaseGenerator.generateButton')}
            </Button>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-9 lg:overflow-y-auto lg:pr-2">
        {mutation.isPending && (
          <Card className="flex items-center justify-center h-full min-h-[400px]">
            <div className="text-center text-muted-foreground p-8">
              <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-semibold">{t('builder.codeGenerator.codebaseGenerator.generatingStateTitle')}</h3>
              <p>{t('builder.codeGenerator.codebaseGenerator.generatingStateDesc')}</p>
            </div>
          </Card>
        )}
        {!mutation.isPending && codebase ? (
          <FileTreeView codebase={codebase} />
        ) : (
          !mutation.isPending && (
            <Card className="flex items-center justify-center h-full min-h-[400px]">
              <div className="text-center text-muted-foreground p-8">
                <Package className="w-16 h-16 mx-auto mb-4" />
                <h3 className="text-lg font-semibold">{t('builder.codeGenerator.codebaseGenerator.emptyStateTitle')}</h3>
                <p>{t('builder.codeGenerator.codebaseGenerator.emptyStateDesc')}</p>
              </div>
            </Card>
          )
        )}
      </div>
    </div>
  );
}


export default function CodeGenerator() {
    const { t } = useLocalization();
    return (
        <Tabs defaultValue="component" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="component" className="gap-2"><Code className="h-4 w-4" /> {t('builder.codeGenerator.tabs.component')}</TabsTrigger>
                <TabsTrigger value="codebase" className="gap-2"><Package className="h-4 w-4" /> {t('builder.codeGenerator.tabs.codebase')}</TabsTrigger>
            </TabsList>
            <TabsContent value="component" className="mt-4">
                <ComponentGenerator />
            </TabsContent>
            <TabsContent value="codebase" className="mt-4">
                <FullCodebaseGenerator />
            </TabsContent>
        </Tabs>
    );
}
