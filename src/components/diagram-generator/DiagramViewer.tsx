
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { Loader2, Download, Copy, Check, Share2, RefreshCw, PenSquare, Eye, Wand2, FileText } from 'lucide-react';
import { saveAs } from 'file-saver';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { useLocalization } from '@/context/LocalizationContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogTrigger } from '../ui/dialog';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/lib/markdown-components';
import { ScrollArea } from '../ui/scroll-area';

interface DiagramViewerProps {
    title: string;
    imageUrl: string;
    plantUmlCode: string;
    isReadOnly?: boolean;
    isUpdating?: boolean;
    onCodeChange?: (newCode: string) => void;
    onUpdate?: () => void;
}

async function explainDiagramApi(imageDataUri: string, token: string) {
    const response = await fetch('/api/explain-diagram', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ imageDataUri }),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to explain diagram');
    }
    return await response.json();
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
    const [explanation, setExplanation] = useState<string | null>(null);
    const [isExplaining, setIsExplaining] = useState(false);
    const { firebaseUser, refetchUser } = useAuth();
    

    const handleCopy = () => {
        navigator.clipboard.writeText(plantUmlCode).then(() => {
            setIsCopied(true);
            toast({title: "Copied!", description: "PlantUML code copied to clipboard."});
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
            toast({title: "Download Failed", variant: "destructive"});
        } finally {
            setIsDownloading(false);
        }
    };
    
    const handleExplain = async () => {
        if (!firebaseUser) {
            toast({ title: 'Authentication Required', variant: 'destructive' });
            return;
        }
        setIsExplaining(true);
        setExplanation(null);
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = async () => {
                const base64data = reader.result as string;
                const token = await firebaseUser.getIdToken();
                const result = await explainDiagramApi(base64data, token);
                setExplanation(result.explanation);
                refetchUser(); // Update credits
            };
        } catch (error: any) {
            toast({ title: 'Explanation Failed', description: error.message, variant: 'destructive' });
        } finally {
             setIsExplaining(false);
        }
    };


    const ViewToolbar = () => (
        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background/70 rounded-md p-1">
            <Dialog>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                             <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleExplain} disabled={isExplaining}>
                                    {isExplaining ? <Loader2 className="h-4 w-4 animate-spin"/> : <Wand2 className="h-4 w-4" />}
                                </Button>
                            </DialogTrigger>
                        </TooltipTrigger>
                        <TooltipContent><p>Explain Diagram</p></TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                 <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><FileText /> Diagram Explanation</DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="max-h-[60vh] pr-4">
                        <div className="prose dark:prose-invert max-w-none">
                            {explanation ? (
                                <ReactMarkdown components={markdownComponents}>{explanation}</ReactMarkdown>
                            ) : (
                                <p>No explanation available. Click "Explain Diagram" to generate one.</p>
                            )}
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>
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
