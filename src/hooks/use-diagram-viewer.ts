
'use client';

import { useState, useEffect } from 'react';
import { saveAs } from 'file-saver';
import { toast } from '@/hooks';
import { useLocalization } from '@/context/LocalizationContext';
import type { DiagramType } from '@/ai/schemas';
import type { Diagram } from '@/lib/models/diagram';
import { useSections } from './use-sections';
import { useExplainDiagram } from './use-diagrams'; // Import the mutation hook
import { getProxiedImageBuffer, arrayBufferToBase64 } from '@/lib/utils';


interface DiagramViewerProps {
    diagramKey: DiagramType;
    diagramData: Diagram;
    onExplanationSave: (explanation: string) => void;
    setViewMode: (mode: 'image' | 'code' | 'explanation') => void;
}

export const useDiagramViewer = ({
    diagramKey,
    diagramData,
    onExplanationSave,
    setViewMode,
}: DiagramViewerProps) => {
    const { t } = useLocalization();
    const [isCopied, setIsCopied] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    const { data: sectionConfigs } = useSections();
    const diagramConfig = sectionConfigs?.find(s => s.id === diagramKey);
    const diagramTitle = diagramConfig ? t(diagramConfig.title) : 'Diagram';
    
    const explainMutation = useExplainDiagram(diagramKey, {
        onSuccess: (data) => {
            onExplanationSave(data.explanation);
            toast({ title: t('builder.diagramGenerator.tooltips.explanationReady')});
        },
        onError: (error) => {
            toast({ title: t('builder.diagramGenerator.tooltips.explanationFailed'), description: error.message, variant: 'destructive'});
        }
    });

    const handleCopy = () => {
        if (!diagramData?.plantUmlCode) return;
        navigator.clipboard.writeText(diagramData.plantUmlCode).then(() => {
            setIsCopied(true);
            toast({ title: t('builder.diagramGenerator.tooltips.copied') });
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    const handleDownload = async () => {
        if (!diagramData?.imageUrl) return;
        setIsDownloading(true);
        try {
            // Use the proxied URL to fetch the image data
            const proxiedImage = await getProxiedImageBuffer(diagramData.imageUrl);
            if(proxiedImage) {
                const blob = new Blob([proxiedImage.buffer], { type: proxiedImage.contentType });
                saveAs(blob, `${diagramTitle.replace(/\s+/g, '_')}.png`);
            } else {
                 throw new Error("Failed to fetch image data.");
            }
        } catch (error) {
            console.error('Download failed:', error);
            toast({ title: "Download Failed", variant: "destructive" });
        } finally {
            setIsDownloading(false);
        }
    };
    
    const handleExplainClick = async () => {
        setViewMode('explanation');
        if (diagramData?.explanation || explainMutation.isPending) {
            return;
        }
        
        toast({
            title: 'Generating Explanation',
            description: 'The AI is analyzing the diagram. This may take a moment.',
        });

        try {
            const imageBuffer = await getProxiedImageBuffer(diagramData.imageUrl);
            if (!imageBuffer) {
                throw new Error("Could not fetch diagram image for analysis.");
            }
            const dataUri = `data:${imageBuffer.contentType};base64,${arrayBufferToBase64(imageBuffer.buffer)}`;
            
            explainMutation.mutate({
                imageDataUri: dataUri,
                prompt: `Explain this ${diagramTitle}. Describe its purpose, components, and relationships.`
            });
        } catch (error: any) {
            toast({ title: "Explanation Failed", description: error.message, variant: 'destructive' });
        }
    };

    return {
        t,
        diagramTitle,
        isCopied,
        isDownloading,
        explainMutation,
        handleCopy,
        handleDownload,
        handleExplainClick,
    };
};
