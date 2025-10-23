/**
 * Hook أساسي لإدارة التصدير
 */

import { useLocalization } from '@/context/LocalizationContext';
import { useToast } from '@/hooks/use-toast';
import { useCallback, useState } from 'react';
import type {
    ContentType,
    ExportFormat,
    ExportOptions,
    ExportProgress,
    ExportResult
} from '../types/export-types';

export interface ExportManagerOptions {
    onProgress?: (progress: ExportProgress) => void;
    onComplete?: (result: ExportResult) => void;
    onError?: (error: string) => void;
}

export interface ExportManagerResult {
    isExporting: boolean;
    progress: ExportProgress | null;
    exportContent: (content: any, options: ExportOptions) => Promise<ExportResult>;
    cancelExport: () => void;
    getSupportedFormats: (contentType: ContentType) => ExportFormat[];
    validateOptions: (options: ExportOptions) => boolean;
}

export function useExportManager(options: ExportManagerOptions = {}): ExportManagerResult {
    const { toast } = useToast();
    const { t } = useLocalization();
    const [isExporting, setIsExporting] = useState(false);
    const [progress, setProgress] = useState<ExportProgress | null>(null);
    const [abortController, setAbortController] = useState<AbortController | null>(null);

    const getSupportedFormats = useCallback((contentType: ContentType): ExportFormat[] => {
        const formatMap: Record<ContentType, ExportFormat[]> = {
            'proposal': ['pdf', 'docx', 'html'],
            'report': ['pdf', 'docx', 'html'],
            'presentation': ['pptx', 'pdf', 'html'],
            'diagram': ['pdf', 'png', 'svg'],
            'academic-solution': ['pdf', 'docx', 'html'],
            'project-plan': ['pdf', 'docx', 'html'],
            'document': ['pdf', 'docx', 'html', 'markdown'],
        };

        return formatMap[contentType] || ['pdf'];
    }, []);

    const validateOptions = useCallback((options: ExportOptions): boolean => {
        if (!options.format || !options.contentType) {
            return false;
        }

        const supportedFormats = getSupportedFormats(options.contentType);
        if (!supportedFormats.includes(options.format)) {
            return false;
        }

        return true;
    }, [getSupportedFormats]);

    const updateProgress = useCallback((stage: ExportProgress['stage'], progressValue: number, message: string) => {
        const newProgress: ExportProgress = {
            stage,
            progress: progressValue,
            message
        };
        setProgress(newProgress);
        options.onProgress?.(newProgress);
    }, [options]);

    const exportContent = useCallback(async (content: any, exportOptions: ExportOptions): Promise<ExportResult> => {
        if (isExporting) {
            return { success: false, error: 'Export already in progress' };
        }

        if (!validateOptions(exportOptions)) {
            return { success: false, error: 'Invalid export options' };
        }

        setIsExporting(true);
        setProgress(null);

        const controller = new AbortController();
        setAbortController(controller);

        try {
            updateProgress('preparing', 10, t('export.preparing') || 'Preparing export...');

            // محاكاة عملية التصدير
            await new Promise(resolve => setTimeout(resolve, 500));

            updateProgress('processing', 30, t('export.processing') || 'Processing content...');
            await new Promise(resolve => setTimeout(resolve, 1000));

            updateProgress('generating', 60, t('export.generating') || 'Generating file...');
            await new Promise(resolve => setTimeout(resolve, 1000));

            updateProgress('finalizing', 90, t('export.finalizing') || 'Finalizing...');
            await new Promise(resolve => setTimeout(resolve, 500));

            updateProgress('complete', 100, t('export.complete') || 'Export complete!');

            const result: ExportResult = {
                success: true,
                fileName: `${exportOptions.metadata?.title || 'export'}.${exportOptions.format}`,
                metadata: {
                    fileSize: 1024 * 1024, // 1MB محاكاة
                    pages: exportOptions.contentType === 'report' ? 10 : undefined,
                    slides: exportOptions.contentType === 'presentation' ? 15 : undefined,
                    sections: exportOptions.contentType === 'proposal' ? 5 : undefined,
                }
            };

            toast({
                title: t('export.success') || 'Export Successful',
                description: t('export.successDesc') || `File exported as ${exportOptions.format.toUpperCase()}`,
            });

            options.onComplete?.(result);
            return result;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

            toast({
                title: t('export.error') || 'Export Failed',
                description: errorMessage,
                variant: 'destructive'
            });

            options.onError?.(errorMessage);
            return { success: false, error: errorMessage };

        } finally {
            setIsExporting(false);
            setProgress(null);
            setAbortController(null);
        }
    }, [isExporting, toast, t, options, updateProgress, validateOptions]);

    const cancelExport = useCallback(() => {
        if (abortController) {
            abortController.abort();
            setIsExporting(false);
            setProgress(null);
            setAbortController(null);

            toast({
                title: t('export.cancelled') || 'Export Cancelled',
                description: t('export.cancelledDesc') || 'Export process has been cancelled',
            });
        }
    }, [abortController, toast, t]);

    return {
        isExporting,
        progress,
        exportContent,
        cancelExport,
        getSupportedFormats,
        validateOptions,
    };
}
