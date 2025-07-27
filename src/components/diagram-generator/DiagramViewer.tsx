
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { Loader2, Download, Copy, Check, Share2, RefreshCw, PenSquare, Eye } from 'lucide-react';
import { saveAs } from 'file-saver';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { useLocalization } from '@/context/LocalizationContext';

interface DiagramViewerProps {
    title: string;
    imageUrl: string;
    plantUmlCode: string;
    isReadOnly?: boolean;
    isUpdating?: boolean;
    onCodeChange?: (newCode: string) => void;
    onUpdate?: () => void;
}

export default function DiagramViewer({
    title,
    imageUrl,
    plantUmlCode,
    isReadOnly = false,
    isUpdating = false,
    onCodeChange,
    onUpdate
}: DiagramViewerProps) {
    const { t } = useLocalization();
    const [isCopied, setIsCopied] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [viewMode, setViewMode] = useState<'image' | 'code'>('image');

    const handleCopy = () => {
        navigator.clipboard.writeText(plantUmlCode).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            saveAs(blob, `${title.replace(/\s+/g, '_')}.png`);
        } catch (error) {
            console.error('Download failed:', error);
        } finally {
            setIsDownloading(false);
        }
    };

    const ViewToolbar = () => (
        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background/70 rounded-md p-1">
             <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                         <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewMode('code')} aria-label="Edit Code">
                            <PenSquare className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Edit Code</p></TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleDownload} disabled={isDownloading} aria-label="Download Image">
                            {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>{t('builder.diagramGenerator.tooltips.download')}</p></TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );

    const EditToolbar = () => (
         <div className="flex items-center justify-end p-2 border-b">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                         <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewMode('image')} aria-label="View Image">
                            <Eye className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>View Image</p></TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy} type="button" aria-label="Copy Code">
                            {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>{isCopied ? t('builder.diagramGenerator.tooltips.copied') : t('builder.diagramGenerator.tooltips.copy')}</p></TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" asChild type="button" className="h-7 w-7">
                            <a href="https://www.planttext.com/" target="_blank" rel="noopener noreferrer" aria-label="Open PlantUML renderer">
                                <Share2 className="h-4 w-4" />
                            </a>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>{t('builder.diagramGenerator.tooltips.openRenderer')}</p></TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );

    return (
        <div className="min-h-[600px] w-full rounded-lg border flex flex-col">
            {viewMode === 'image' ? (
                <div className="flex-grow flex items-center justify-center p-6 relative group">
                    <Image
                        src={imageUrl}
                        alt={`Rendered ${title}`}
                        width={800}
                        height={600}
                        className="w-full h-auto object-contain"
                        unoptimized
                    />
                    <ViewToolbar />
                </div>
            ) : (
                <div className="flex h-full flex-col">
                    <EditToolbar />
                    <Textarea
                        readOnly={isReadOnly}
                        value={plantUmlCode}
                        onChange={(e) => onCodeChange?.(e.target.value)}
                        className="flex-grow p-4 bg-muted/30 text-left font-mono text-xs rounded-none border-0 h-full resize-none"
                        dir="ltr"
                    />
                     {onUpdate && (
                        <div className="p-2 border-t">
                            <Button
                                onClick={onUpdate}
                                className="w-full font-headline"
                                disabled={isUpdating}
                                >
                                {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                                {t('builder.diagramGenerator.updateDiagram')}
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
