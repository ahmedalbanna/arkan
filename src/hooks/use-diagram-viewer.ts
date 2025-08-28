'use client';

import { useState } from 'react';
import { saveAs } from 'file-saver';
import { toast } from '@/hooks';
import { useLocalization } from '@/context/LocalizationContext';
import { useSectionStore } from '@/hooks';
import { useExplainDiagram } from '@/hooks';
import type { DiagramData } from '@/hooks';
import type { DiagramType } from '@/ai/schemas';

interface DiagramViewerProps {
    diagramKey: DiagramType;
    diagramData: DiagramData;
    onExplanationSave: (explanation: string) => void;
}

export const useDiagramViewer = ({
    diagramKey,
    diagramData,
    onExplanationSave,
}: DiagramViewerProps) => {
    const { diagramSections } = useSectionStore();
    const diagramConfig = diagramSections[diagramKey];
    const diagramTitleKey = diagramConfig?.title || diagramKey;
    const { t } = useLocalization();
    const diagramTitle = t(diagramTitleKey);
    const [isCopied, setIsCopied] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [viewMode, setViewMode] = useState<'image' | 'code' | 'explanation'>('image');

    const explainMutation = useExplainDiagram();

    const handleCopy = () => {
        navigator.clipboard.writeText(diagramData.plantUmlCode).then(() => {
            setIsCopied(true);
            toast({ title: "Copied!", description: "PlantUML code copied to clipboard." });
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    const handleDownload = async () => {
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

        if (!diagramData.explanation && !explainMutation.isPending) {
            fetch(diagramData.imageUrl)
                .then(res => res.blob())
                .then(blob => {
                    const reader = new FileReader();
                    reader.readAsDataURL(blob);
                    reader.onloadend = async () => {
                        const base64data = reader.result as string;
                        explainMutation.mutate(base64data, {
                            onSuccess: (data) => {
                                onExplanationSave(data.explanation);
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
    };
};
