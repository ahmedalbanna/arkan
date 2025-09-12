'use client';

import { useState } from 'react';
import { saveAs } from 'file-saver';
import { toast } from '@/hooks';
import { useLocalization } from '@/context/LocalizationContext';
import { useExplainDiagram } from '@/hooks';
import type { DiagramType } from '@/ai/schemas';
import { useBuilderStore } from '@/hooks'; // NEW: Central store
import type { DiagramData } from '@/lib/types';


interface DiagramViewerProps {
    diagramKey: DiagramType;
    diagramTitle: string; 
    diagramData: DiagramData;
}

export const useDiagramViewer = ({
    diagramKey,
    diagramTitle,
    diagramData,
}: DiagramViewerProps) => {
    const { t } = useLocalization();
    const [isCopied, setIsCopied] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [viewMode, setViewMode] = useState<'image' | 'code' | 'explanation'>('image');

    const { project, setProject } = useBuilderStore(); // NEW: Get project and setProject

    const explainMutation = useExplainDiagram();

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

    const handleExplainClick = () => {
        setViewMode('explanation');

        if (!diagramData?.explanation && !explainMutation.isPending) {
            if (!diagramData?.imageUrl) return;
            fetch(diagramData.imageUrl)
                .then(res => res.blob())
                .then(blob => {
                    const reader = new FileReader();
                    reader.readAsDataURL(blob);
                    reader.onloadend = async () => {
                        const base64data = reader.result as string;
                        explainMutation.mutate(base64data, {
                            onSuccess: (data) => {
                                if (!project) return;
                                project.setDiagramExplanation(diagramKey, data.explanation);
                                setProject(project); 
                                toast({ title: t('builder.diagramGenerator.tooltips.explanationReady') });
                            },
                            onError: (error) => {
                                toast({ title: t('builder.diagramGenerator.tooltips.explanationFailed'), description: error.message, variant: "destructive" });
                                setViewMode('image');
                            }
                        });
                    };
                });
        }
    };

    return {
        t,
        diagramTitle,
        isCopied,
        isDownloading,
        viewMode,
        setViewMode,
        explainMutation,
        handleCopy,
        handleDownload,
        handleExplainClick,
        diagramData, 
    };
};
