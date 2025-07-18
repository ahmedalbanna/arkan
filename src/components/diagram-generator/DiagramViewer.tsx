
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { Loader2, Download, Copy, Check, Share2, RefreshCw } from 'lucide-react';
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
    const hasChanges = onCodeChange && plantUmlCode !== (localStorage.getItem(`puml-${title}`) || '');


    const handleCopy = () => {
        navigator.clipboard.writeText(plantUmlCode).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            // We use the proxied URL for the download to leverage caching
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            saveAs(blob, `${title.replace(/ /g, '_')}.png`);
        } catch (error) {
            console.error('Download failed:', error);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="space-y-4">
            <Image
                src={imageUrl}
                alt={`Rendered ${title}`}
                width={800}
                height={600}
                className="w-full h-auto object-contain rounded-md border bg-white p-2"
                unoptimized // Since the image is from an external URL and can change, don't use Next.js image optimization
            />
            <div className="relative">
                <Textarea
                    readOnly={isReadOnly}
                    value={plantUmlCode}
                    onChange={(e) => onCodeChange?.(e.target.value)}
                    rows={10}
                    className="bg-muted p-4 rounded-md overflow-x-auto text-sm text-left font-mono"
                    dir="ltr"
                />
                <div className="absolute top-2 right-2 flex gap-2">
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
            </div>
             {onUpdate && (
                <Button
                    onClick={onUpdate}
                    className="font-headline"
                    disabled={isUpdating}
                    >
                    {isUpdating ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <RefreshCw className="ml-2 h-4 w-4" />}
                    {t('builder.diagramGenerator.updateDiagram')}
                </Button>
            )}
        </div>
    );
}
