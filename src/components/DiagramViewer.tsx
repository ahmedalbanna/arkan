
'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import Image from 'next/image';
import { Loader2, Download, Copy, Check, Share2 } from 'lucide-react';
import { saveAs } from 'file-saver';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface DiagramViewerProps {
    title: string;
    imageUrl: string;
    plantUmlCode: string;
    isReadOnly?: boolean;
    onCodeChange?: (newCode: string) => void;
}

export default function DiagramViewer({
    title,
    imageUrl,
    plantUmlCode,
    isReadOnly = false,
    onCodeChange,
}: DiagramViewerProps) {
    const [isCopied, setIsCopied] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

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
                            <TooltipContent><p>Download Image</p></TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy} type="button" aria-label="Copy Code">
                                    {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>{isCopied ? 'Copied!' : 'Copy Code'}</p></TooltipContent>
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
                            <TooltipContent><p>Open Online Renderer</p></TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>
        </div>
    );
}
