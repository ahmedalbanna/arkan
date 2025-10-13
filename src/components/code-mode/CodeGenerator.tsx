

'use client';

import type { Codebase, GenerateCodeOutput } from '@/ai/schemas';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AnimatedContainer } from '@/components/ui/animation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore, useToast } from '@/hooks';
import { cn } from '@/lib/utils';
import { useMutation } from '@tanstack/react-query';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import { Camera, Check, Code, Copy, Download, Expand, File, Folder, Loader2, Package, Sparkles, Tv } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

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
    <Card variant="glass" className="h-full flex flex-col backdrop-blur-md shadow-soft hover:shadow-glow transition-all duration-200">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-emerald-500/5">
        <div className="flex justify-between items-start" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
          <div>
            <CardTitle className="font-headline text-2xl text-primary">{t('builder.codeGenerator.codebaseGenerator.fileTreeView.title')}</CardTitle>
            <CardDescription>{t('builder.codeGenerator.codebaseGenerator.fileTreeView.description')}</CardDescription>
          </div>
          <Button onClick={handleDownload} disabled={isZipping} className="hover:shadow-glow transition-all duration-200" variant="gradient">
            {isZipping ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Download className="me-2 h-4 w-4" />}
            {t('builder.codeGenerator.codebaseGenerator.fileTreeView.downloadButton')}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden p-4 sm:p-6">
        <ScrollArea className="h-full border rounded-md bg-gradient-to-r from-background/50 to-primary/5 backdrop-blur-sm shadow-soft p-4">
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
      <ScrollArea className="h-full max-h-96 w-full rounded-md border bg-gradient-to-r from-background/50 to-primary/5 backdrop-blur-sm shadow-soft">
        <pre className="p-4 text-sm">
          <code>{code}</code>
        </pre>
      </ScrollArea>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-7 w-7 hover:shadow-soft transition-all duration-200"
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
      if (blob) {
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
          <AnimatedContainer animation="fade-in-up" delay={200}>
            <Card variant="glass" className="backdrop-blur-md shadow-soft hover:shadow-glow transition-all duration-200">
              <CardHeader className="bg-gradient-to-r from-blue-500/10 to-blue-600/10">
                <CardTitle className="font-headline">{t('builder.codeGenerator.componentGenerator.toolsTitle')}</CardTitle>
                <CardDescription>{t('builder.codeGenerator.componentGenerator.toolsDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <Textarea
                  name="prompt"
                  placeholder={t('builder.codeGenerator.componentGenerator.promptPlaceholder')}
                  rows={8}
                  required
                  value={prompt}
                  onChange={(e) => updateProject(p => p.setCodeGeneratorPrompt(e.target.value))}
                  disabled={mutation.isPending}
                  className="hover:shadow-soft transition-all duration-200"
                />
                {mutation.isError && (
                  <p className="text-sm font-medium text-destructive mt-2">{mutation.error.message}</p>
                )}
              </CardContent>
              <CardFooter className="bg-gradient-to-r from-muted/30 to-primary/5">
                <Button type="submit" disabled={mutation.isPending} className="font-headline w-full hover:shadow-glow transition-all duration-200" variant="gradient">
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
          </AnimatedContainer>
        </div>

        {/* Center Column */}
        <div className="lg:col-span-5 lg:overflow-y-auto lg:pr-2">
          <AnimatedContainer animation="fade-in-up" delay={300}>
            <Card variant="glass" className="h-full backdrop-blur-md shadow-soft hover:shadow-glow transition-all duration-200">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-purple-500/5">
                <div className="flex justify-between items-center">
                  <CardTitle className="font-headline flex items-center gap-2">
                    <div className="p-1 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 shadow-soft">
                      <Tv className="w-5 h-5 text-white" />
                    </div>
                    {t('builder.codeGenerator.componentGenerator.livePreview')}
                  </CardTitle>
                  {srcDoc && (
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={takeScreenshot} disabled={isCapturing} title={t('builder.codeGenerator.componentGenerator.tooltips.screenshot')} className="hover:shadow-soft transition-all duration-200">
                        {isCapturing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setIsExpanded(true)} title={t('builder.codeGenerator.componentGenerator.tooltips.expand')} className="hover:shadow-soft transition-all duration-200">
                        <Expand className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {renderPreview(false)}
              </CardContent>
            </Card>
          </AnimatedContainer>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-6 lg:overflow-y-auto lg:pr-2">
          {(html || css || javascript) && (
            <AnimatedContainer animation="fade-in-up" delay={400}>
              <Card variant="glass" className="backdrop-blur-md shadow-soft hover:shadow-glow transition-all duration-200">
                <CardHeader className="flex-row items-center justify-between bg-gradient-to-r from-primary/5 to-blue-500/5">
                  <CardTitle className="font-headline">{t('builder.codeGenerator.componentGenerator.generatedCode')}</CardTitle>
                  <Button variant="outline" size="sm" onClick={downloadZip} disabled={isDownloading} className="hover:shadow-soft transition-all duration-200">
                    {isDownloading ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Download className="me-2 h-4 w-4" />}
                    {t('builder.codeGenerator.componentGenerator.downloadZip')}
                  </Button>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <Tabs defaultValue="html" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-background/50 to-primary/5">
                      <TabsTrigger value="html" className="hover:shadow-soft transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-600 data-[state=active]:text-white">HTML</TabsTrigger>
                      <TabsTrigger value="css" className="hover:shadow-soft transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-600 data-[state=active]:text-white">CSS</TabsTrigger>
                      <TabsTrigger value="javascript" className="hover:shadow-soft transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-600 data-[state=active]:text-white">JS</TabsTrigger>
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
            </AnimatedContainer>
          )}
        </div>

        <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
          <DialogContent className="max-w-full w-full h-full flex flex-col p-4 backdrop-blur-md">
            <DialogHeader className="flex-row items-center justify-between border-b pb-2 bg-gradient-to-r from-primary/5 to-blue-500/5">
              <DialogTitle className="font-headline">{t('builder.codeGenerator.componentGenerator.expandedTitle')}</DialogTitle>
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
        <AnimatedContainer animation="fade-in-up" delay={200}>
          <Card variant="glass" className="backdrop-blur-md shadow-soft hover:shadow-glow transition-all duration-200">
            <CardHeader className="bg-gradient-to-r from-emerald-500/10 to-emerald-600/10">
              <CardTitle className="font-headline">{t('builder.codeGenerator.codebaseGenerator.cardTitle')}</CardTitle>
              <CardDescription>{t('builder.codeGenerator.codebaseGenerator.cardDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <Button onClick={handleGenerate} disabled={!proposal || mutation.isPending} className="w-full hover:shadow-glow transition-all duration-200" variant="gradient">
                {mutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Sparkles className="me-2 h-4 w-4" />}
                {t('builder.codeGenerator.codebaseGenerator.generateButton')}
              </Button>
            </CardContent>
          </Card>
        </AnimatedContainer>
      </div>
      <div className="lg:col-span-9 lg:overflow-y-auto lg:pr-2">
        {mutation.isPending && (
          <AnimatedContainer animation="fade-in-up" delay={300}>
            <Card variant="glass" className="flex items-center justify-center h-full min-h-[400px] backdrop-blur-md shadow-soft hover:shadow-glow transition-all duration-200">
              <div className="text-center text-muted-foreground p-8">
                <div className="p-4 rounded-full bg-gradient-to-br from-primary to-primary-600 mb-4 shadow-soft">
                  <Loader2 className="w-16 h-16 mx-auto animate-spin text-white" />
                </div>
                <h3 className="text-lg font-semibold font-headline">{t('builder.codeGenerator.codebaseGenerator.generatingStateTitle')}</h3>
                <p>{t('builder.codeGenerator.codebaseGenerator.generatingStateDesc')}</p>
              </div>
            </Card>
          </AnimatedContainer>
        )}
        {!mutation.isPending && codebase ? (
          <AnimatedContainer animation="fade-in-up" delay={400}>
            <FileTreeView codebase={codebase} />
          </AnimatedContainer>
        ) : (
          !mutation.isPending && (
            <AnimatedContainer animation="fade-in-up" delay={300}>
              <Card variant="glass" className="flex items-center justify-center h-full min-h-[400px] backdrop-blur-md shadow-soft hover:shadow-glow transition-all duration-200">
                <div className="text-center text-muted-foreground p-8">
                  <div className="p-4 rounded-full bg-gradient-to-br from-muted to-muted-foreground mb-4 shadow-soft">
                    <Package className="w-16 h-16 mx-auto text-white" />
                  </div>
                  <h3 className="text-lg font-semibold font-headline">{t('builder.codeGenerator.codebaseGenerator.emptyStateTitle')}</h3>
                  <p>{t('builder.codeGenerator.codebaseGenerator.emptyStateDesc')}</p>
                </div>
              </Card>
            </AnimatedContainer>
          )
        )}
      </div>
    </div>
  );
}


export default function CodeGenerator() {
  const { t } = useLocalization();
  return (
    <div className="relative h-full">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5 rounded-lg opacity-50 pointer-events-none"></div>
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl animate-float pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl animate-float pointer-events-none" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-purple-500/10 rounded-full blur-lg animate-float pointer-events-none" style={{ animationDelay: '4s' }}></div>

      <div className="relative z-10">
        <Tabs defaultValue="component" className="w-full">
          <AnimatedContainer animation="fade-in-up" delay={200}>
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-gradient-to-r from-background/50 to-primary/5 backdrop-blur-md shadow-soft">
              <TabsTrigger
                value="component"
                className="gap-2 transition-all duration-200 hover:shadow-soft hover:scale-105 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-600 data-[state=active]:text-white data-[state=active]:shadow-glow"
              >
                <Code className="h-4 w-4" />
                <span className="hidden sm:inline">{t('builder.codeGenerator.tabs.component')}</span>
                <span className="sm:hidden">Component</span>
              </TabsTrigger>
              <TabsTrigger
                value="codebase"
                className="gap-2 transition-all duration-200 hover:shadow-soft hover:scale-105 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-600 data-[state=active]:text-white data-[state=active]:shadow-glow"
              >
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">{t('builder.codeGenerator.tabs.codebase')}</span>
                <span className="sm:hidden">Codebase</span>
              </TabsTrigger>
            </TabsList>
          </AnimatedContainer>

          <TabsContent value="component" className="mt-4">
            <AnimatedContainer animation="fade-in-up" delay={400}>
              <ComponentGenerator />
            </AnimatedContainer>
          </TabsContent>
          <TabsContent value="codebase" className="mt-4">
            <AnimatedContainer animation="fade-in-up" delay={400}>
              <FullCodebaseGenerator />
            </AnimatedContainer>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
