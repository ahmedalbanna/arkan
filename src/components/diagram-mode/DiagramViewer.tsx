
'use client';

import type { DiagramType } from '@/ai/schemas';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useDiagramViewer } from '@/hooks';
import { markdownComponents } from '@/lib/markdown-styles';
import type { Diagram } from '@/lib/models/diagram';
import { Check, Copy, Download, Eye, FileText, Loader2, PenSquare, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface DiagramViewerProps {
    diagramKey: DiagramType;
    diagramData: Diagram;
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
    const [viewMode, setViewMode] = useState<'image' | 'code' | 'explanation'>('image');
    const {
        t,
        diagramTitle,
        isCopied,
        isDownloading,
        explainMutation,
        handleCopy,
        handleDownload,
        handleExplainClick,
    } = useDiagramViewer({ diagramKey, diagramData, onExplanationSave, setViewMode });

    const isProcessing = isUpdating || isDownloading || explainMutation.isPending;

    return (
        <Card className="min-h-[600px] w-full flex flex-col">
            <CardContent className="flex-grow p-4 md:p-6">
                <div className="flex h-full items-center justify-center relative group">
                    {viewMode === 'image' && diagramData.imageUrl && (
                        <Image
                            src={diagramData.imageUrl}
                            alt={`Rendered ${diagramTitle}`}
                            width={800}
                            height={600}
                            className="w-full h-auto object-contain"
                            unoptimized
                        />
                    )}
                    {viewMode === 'image' && !diagramData.imageUrl && (
                        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                            <p>{t('builder.diagramGenerator.tooltips.noImage')}</p>
                        </div>
                    )}
                    {viewMode === 'code' && (
                        <Textarea
                            readOnly={isReadOnly || isProcessing}
                            value={diagramData.plantUmlCode}
                            onChange={(e) => onCodeChange?.(e.target.value)}
                            className="h-full p-4 bg-muted/30 text-left font-mono text-xs rounded-md border-0 resize-none focus-visible:ring-1"
                            dir="ltr"
                        />
                    )}
                    {viewMode === 'explanation' && (
                        <ScrollArea className="h-full w-full">
                            <div className="prose dark:prose-invert max-w-none p-4">
                                {explainMutation.isPending ? (
                                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                                        <Loader2 className="h-8 w-8 animate-spin mb-4" />
                                        <p>{t('builder.diagramGenerator.tooltips.explaining')}</p>
                                    </div>
                                ) : diagramData.explanation ? (
                                    <ReactMarkdown components={markdownComponents}>{diagramData.explanation}</ReactMarkdown>
                                ) : (
                                    <div className="text-center p-8 text-muted-foreground">
                                        <p>{t('builder.diagramGenerator.tooltips.explanationPlaceholder')}</p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    )}
                </div>
            </CardContent>
            <div className="flex items-center justify-between p-2 border-t bg-background rounded-b-lg">
                <div className="flex items-center gap-1">
                    <Button variant={viewMode === 'image' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('image')}>
                        <Eye className="h-4 w-4 mr-2" /> {t('builder.diagramGenerator.view')}
                    </Button>
                    <Button variant={viewMode === 'code' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('code')} disabled={isProcessing}>
                        <PenSquare className="h-4 w-4 mr-2" /> {t('builder.diagramGenerator.edit')}
                    </Button>
                    <Button variant={viewMode === 'explanation' ? 'secondary' : 'ghost'} size="sm" onClick={handleExplainClick} disabled={isProcessing}>
                        {explainMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
                        {t('builder.diagramGenerator.explain')}
                    </Button>
                </div>
                <div className="flex items-center gap-1">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy} type="button" aria-label={t('builder.diagramGenerator.tooltips.copy')} disabled={isProcessing}>
                                    {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>{isCopied ? t('builder.diagramGenerator.tooltips.copied') : t('builder.diagramGenerator.tooltips.copy')}</p></TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDownload} disabled={isProcessing} aria-label={t('builder.diagramGenerator.tooltips.download')}>
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
                            disabled={isProcessing}
                        >
                            {isUpdating ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <RefreshCw className="me-2 h-4 w-4" />}
                            {t('builder.diagramGenerator.updateDiagram')}
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    );
}
