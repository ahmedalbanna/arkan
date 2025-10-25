
'use client';

import { exportReportAsDocx as exportReportUtil } from '@/lib/docx-exporter';
import { useState } from 'react';
import { toast } from './use-toast';

import { Project } from '@/lib/models/project';

export function useExport() {
    const [isExporting, setIsExporting] = useState(false);

    const exportReportDocx = async (project: Project, translatedTitles: { [key in string]?: string; }, sectionsToInclude?: string[]) => {
        setIsExporting(true);
        try {
            const sectionsToExport = sectionsToInclude?.reduce((acc, key) => {
                const content = project.getSectionContent(key as any);
                if (content) {
                    acc[key as any] = content;
                }
                return acc;
            }, {} as { [key in string]?: string }) || project.sections;

            await exportReportUtil(sectionsToExport || {}, project.diagrams || {}, project.name || 'Untitled Report', translatedTitles, sectionsToInclude);
            toast({ title: 'Export Successful', description: 'Report exported as DOCX.' });
        } catch (error) {
            console.error(error);
            toast({ title: 'Export Failed', description: 'Could not generate the DOCX file.', variant: 'destructive' });
        } finally {
            setIsExporting(false);
        }
    };

    return {
        isExporting,
        exportReportDocx,
    };
}
