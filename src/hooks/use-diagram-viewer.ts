

'use client';

import { useState, useEffect } from 'react';
import { saveAs } from 'file-saver';
import { toast } from '@/hooks';
import { useLocalization } from '@/context/LocalizationContext';
import type { DiagramType } from '@/ai/schemas';
import type { DiagramData } from '@/lib/types';
import { useSections } from './use-sections';

interface DiagramViewerProps {
    diagramKey: DiagramType;
    diagramData: DiagramData;
}

export const useDiagramViewer = ({
    diagramKey,
    diagramData,
}: DiagramViewerProps) => {
    const { t } = useLocalization();
    const [isCopied, setIsCopied] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [viewMode, setViewMode] = useState<'image' | 'code' | 'explanation'>('image');

    const { data: sectionConfigs } = useSections();
    const diagramConfig = sectionConfigs?.find(s => s.id === diagramKey);
    const diagramTitle = diagramConfig ? t(diagramConfig.title) : 'Diagram';

    // Automatically switch to explanation view when it becomes available
    useEffect(() => {
        if (diagramData?.explanation && viewMode !== 'explanation') {
            setViewMode('explanation');
        }
    }, [diagramData?.explanation, viewMode]);

    const handleCopy = () => {
        if (!diagramData?.plantUmlCode) return;
        navigator.clipboard.writeText(diagramData.plantUmlCode).then(() => {
            setIsCopied(true);
            toast({ title: "Copied!", description: "PlantUML code copied to clipboard." });
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    const handleDownload = async () => {
        if (!diagramData?.imageUrl) return;
        setIsDownloading(true);
        try {
            const response = await fetch(diagramData.imageUrl);
            const blob = await response.blob();
            saveAs(blob, `${diagramTitle.replace(/\s+/g, '_')}.png`);
        } catch (error) {
            console.error('Download failed:', error);
            toast({ title: "Download Failed", variant: "destructive" });
        } finally {
            setIsDownloading(false);
        }
    };

    // This function now just toggles the view. The explanation is assumed to be present.
    const handleViewExplanation = () => {
        if (diagramData.explanation) {
            setViewMode('explanation');
        } else {
            toast({ title: "No Explanation Available", description: "The explanation for this diagram has not been generated yet.", variant: "default" });
        }
    }

    return {
        t,
        diagramTitle,
        isCopied,
        isDownloading,
        viewMode,
        setViewMode,
        handleCopy,
        handleDownload,
        handleViewExplanation,
    };
};
