
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { Loader2, Download, Copy, Check, RefreshCw, PenSquare, Eye, Wand2, FileText } from 'lucide-react';
import { saveAs } from 'file-saver';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { useLocalization } from '@/context/LocalizationContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/lib/markdown-components';
import { ScrollArea } from '../ui/scroll-area';
import { Card, CardContent } from '../ui/card';
import type { DiagramData } from '@/hooks/useDiagramStore';
import type { DiagramType } from '@/ai/schemas';
import { useExplainDiagram } from '@/hooks/use-diagrams';


interface DiagramViewerProps {
    diagramKey: DiagramType;
    diagramData: DiagramData;
    isReadOnly?: boolean;
    isUpdating?: boolean;
    onCodeChange: (newCode: string) => void;
    onUpdate: () => void;
    onExplanationSave: (explanation: string) => void;
}

export default function DiagramViewer({
    diagramKey,
    diagramData,
    isReadOnly = false,
    isUpdating = false,
    onCodeChange,
    onUpdate,
    onExplanationSave,
}: DiagramViewerProps) {
    const { title: diagramTitle } = diagramConfig[diagramKey];
    const { t } = useLocalization();
    const [isCopied, setIsCopied] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [viewMode, setViewMode] = useState<'image' | 'code' | 'explanation'>('image');
    const { firebaseUser } = useAuth();
    
    const explainMutation = useExplainDiagram();

    const handleCopy = () => {
        navigator.clipboard.writeText(diagramData.plantUmlCode).then(() => {
            setIsCopied(true);
            toast({title: "Copied!", description: "PlantUML code copied to clipboard."});
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            const response = await fetch(diagramData.imageUrl);
            const blob = await response.blob();
            saveAs(blob, `${t(diagramTitle).replace(/\s+/g, '_')}.png`);
        } catch (error) {
            console.error('Download failed:', error);
            toast({title: "Download Failed", variant: "destructive"});
        } finally {
            setIsDownloading(false);
        }
    };

    const fetchExplanation = async () => {
        if (!firebaseUser) {
            toast({ title: 'Authentication Required', variant: 'destructive' });
            return;
        }
        try {
            const response = await fetch(diagramData.imageUrl);
            const blob = await response.blob();
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = async () => {
                const base64data = reader.result as string;
                explainMutation.mutate(base64data, {
                    onSuccess: (data) => {
                        onExplanationSave(data.explanation);
                    }
                });
            };
        } catch (error: any) {
            toast({ title: 'Explanation Failed', description: 'Could not prepare image for analysis.', variant: 'destructive' });
        }
    };
    
    // Auto-fetch explanation if view is switched and no explanation exists
    useEffect(() => {
        if (viewMode === 'explanation' && !diagramData.explanation && !explainMutation.isPending) {
            fetchExplanation();
        }
    }, [viewMode, diagramData.explanation]);

    return (
        <Card className="min-h-[600px] w-full flex flex-col">
            <CardContent className="flex-grow p-4 md:p-6">
                <div className="flex h-full items-center justify-center relative group">
                    {viewMode === 'image' && (
                        <Image
                            src={diagramData.imageUrl}
                            alt={`Rendered ${t(diagramTitle)}`}
                            width={800}
                            height={600}
                            className="w-full h-auto object-contain"
                            unoptimized
                        />
                    )}
                    {viewMode === 'code' && (
                        <Textarea
                            readOnly={isReadOnly || isUpdating}
                            value={diagramData.plantUmlCode}
                            onChange={(e) => onCodeChange?.(e.target.value)}
                            className="h-full p-4 bg-muted/30 text-left font-mono text-xs rounded-md border-0 resize-none focus-visible:ring-1"
                            dir="ltr"
                        />
                    )}
                    {viewMode === 'explanation' && (
                        <ScrollArea className="h-full w-full">
                             <div className="prose dark:prose-invert max-w-none p-4">
                                {explainMutation.isPending && !diagramData.explanation ? (
                                    <div className="text-center p-8 text-muted-foreground">
                                         <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                                         <p>The AI is analyzing the diagram...</p>
                                    </div>
                                ) : (
                                    <>
                                        <Button onClick={fetchExplanation} variant="outline" size="sm" className="float-right" disabled={explainMutation.isPending}>
                                            {explainMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <Wand2 className="h-4 w-4 mr-2" />}
                                            Regenerate
                                        </Button>
                                        <ReactMarkdown components={markdownComponents}>{diagramData.explanation || "No explanation available yet."}</ReactMarkdown>
                                    </>
                                )}
                            </div>
                        </ScrollArea>
                    )}
                </div>
            </CardContent>
             <div className="flex items-center justify-between p-2 border-t bg-background rounded-b-lg">
                <div className="flex items-center gap-1">
                    <Button variant={viewMode === 'image' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('image')}>
                        <Eye className="h-4 w-4 mr-2"/> View
                    </Button>
                    <Button variant={viewMode === 'code' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('code')}>
                        <PenSquare className="h-4 w-4 mr-2"/> Edit
                    </Button>
                    <Button variant={viewMode === 'explanation' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('explanation')} disabled={explainMutation.isPending && !diagramData.explanation}>
                         {explainMutation.isPending && viewMode !== 'explanation' ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <FileText className="h-4 w-4 mr-2"/>} Explain
                    </Button>
                </div>
                 <div className="flex items-center gap-1">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy} type="button" aria-label="Copy Code">
                                    {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>{isCopied ? t('builder.diagramGenerator.tooltips.copied') : t('builder.diagramGenerator.tooltips.copy')}</p></TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                     <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                 <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDownload} disabled={isDownloading} aria-label="Download Image">
                                    {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>{t('builder.diagramGenerator.tooltips.download')}</p></TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    {onUpdate && (
                         <Button
                            onClick={onUpdate}
                            size="sm"
                            disabled={isUpdating || isReadOnly}
                            >
                            {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                            Update Diagram
                        </Button>
                    )}
                 </div>
            </div>
        </Card>
    );
}
