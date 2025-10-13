
'use client';

import type { DiagramType } from '@/ai/schemas';
import { AnimatedContainer } from '@/components/ui/animation';
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
        <AnimatedContainer animation="fade-in-up" delay={200}>
            <Card className="min-h-[600px] w-full flex flex-col backdrop-blur-md shadow-soft hover:shadow-glow transition-all duration-200">
                <CardContent className="flex-grow p-4 md:p-6">
                    <div className="flex h-full items-center justify-center relative group">
                        {viewMode === 'image' && diagramData.imageUrl && (
                            <AnimatedContainer animation="fade-in-up" delay={300}>
                                <Image
                                    src={diagramData.imageUrl}
                                    alt={`Rendered ${diagramTitle}`}
                                    width={800}
                                    height={600}
                                    className="w-full h-auto object-contain rounded-lg shadow-soft"
                                    unoptimized
                                />
                            </AnimatedContainer>
                        )}
                        {viewMode === 'image' && !diagramData.imageUrl && (
                            <AnimatedContainer animation="fade-in-up" delay={300}>
                                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                                    <div className="p-4 rounded-full bg-gradient-to-br from-muted to-muted-foreground mb-4 shadow-soft">
                                        <Eye className="w-8 h-8 text-white" />
                                    </div>
                                    <p>{t('builder.diagramGenerator.tooltips.noImage')}</p>
                                </div>
                            </AnimatedContainer>
                        )}
                        {viewMode === 'code' && (
                            <AnimatedContainer animation="fade-in-up" delay={300}>
                                <Textarea
                                    readOnly={isReadOnly || isProcessing}
                                    value={diagramData.plantUmlCode}
                                    onChange={(e) => onCodeChange?.(e.target.value)}
                                    className="h-full p-4 bg-gradient-to-r from-muted/30 to-primary/5 text-left font-mono text-xs rounded-md border shadow-soft hover:shadow-glow resize-none focus-visible:ring-1 transition-all duration-200"
                                    dir="ltr"
                                />
                            </AnimatedContainer>
                        )}
                        {viewMode === 'explanation' && (
                            <AnimatedContainer animation="fade-in-up" delay={300}>
                                <ScrollArea className="h-full w-full">
                                    <div className="prose dark:prose-invert max-w-none p-4 rounded-lg bg-gradient-to-r from-muted/30 to-primary/5 shadow-soft">
                                        {explainMutation.isPending ? (
                                            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                                                <Loader2 className="h-8 w-8 animate-spin mb-4" />
                                                <p>{t('builder.diagramGenerator.tooltips.explaining')}</p>
                                            </div>
                                        ) : diagramData.explanation ? (
                                            <ReactMarkdown components={markdownComponents}>{diagramData.explanation}</ReactMarkdown>
                                        ) : (
                                            <div className="text-center p-8 text-muted-foreground">
                                                <div className="p-4 rounded-full bg-gradient-to-br from-muted to-muted-foreground mb-4 shadow-soft mx-auto w-fit">
                                                    <FileText className="w-8 h-8 text-white" />
                                                </div>
                                                <p>{t('builder.diagramGenerator.tooltips.explanationPlaceholder')}</p>
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                            </AnimatedContainer>
                        )}
                    </div>
                </CardContent>
                <div className="flex items-center justify-between p-2 border-t bg-gradient-to-r from-background/90 to-primary/5 backdrop-blur-sm rounded-b-lg">
                    <div className="flex items-center gap-1">
                        <Button
                            variant={viewMode === 'image' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('image')}
                            className="hover:shadow-soft transition-all duration-200"
                        >
                            <Eye className="h-4 w-4 mr-2" /> {t('builder.diagramGenerator.view')}
                        </Button>
                        <Button
                            variant={viewMode === 'code' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('code')}
                            disabled={isProcessing}
                            className="hover:shadow-soft transition-all duration-200"
                        >
                            <PenSquare className="h-4 w-4 mr-2" /> {t('builder.diagramGenerator.edit')}
                        </Button>
                        <Button
                            variant={viewMode === 'explanation' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={handleExplainClick}
                            disabled={isProcessing}
                            className="hover:shadow-soft transition-all duration-200"
                        >
                            {explainMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
                            {t('builder.diagramGenerator.explain')}
                        </Button>
                    </div>
                    <div className="flex items-center gap-1">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 hover:shadow-soft transition-all duration-200"
                                        onClick={handleCopy}
                                        type="button"
                                        aria-label={t('builder.diagramGenerator.tooltips.copy')}
                                        disabled={isProcessing}
                                    >
                                        {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>{isCopied ? t('builder.diagramGenerator.tooltips.copied') : t('builder.diagramGenerator.tooltips.copy')}</p></TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 hover:shadow-soft transition-all duration-200"
                                        onClick={handleDownload}
                                        disabled={isProcessing}
                                        aria-label={t('builder.diagramGenerator.tooltips.download')}
                                    >
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
                                variant="gradient"
                                className="hover:shadow-glow transition-all duration-200"
                            >
                                {isUpdating ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <RefreshCw className="me-2 h-4 w-4" />}
                                {t('builder.diagramGenerator.updateDiagram')}
                            </Button>
                        )}
                    </div>
                </div>
            </Card>
        </AnimatedContainer>
    );
}
