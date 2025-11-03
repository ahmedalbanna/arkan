
'use client';

import { exportReportAsDocx as exportReportUtil } from '@/lib/docx-exporter';
import { useState } from 'react';
import { toast } from './use-toast';

import { Project } from '@/lib/models';

export function useExport() {
    const [isExporting, setIsExporting] = useState(false);

    const exportReportDocx = async (project: Project, sectionsToInclude?: string[]) => {
        setIsExporting(true);
        try {
            const sectionsToExport = sectionsToInclude?.reduce((acc, key) => {
                const sectionData = project.sections?.[key];
                if (sectionData) {
                    acc[key] = sectionData;
                }
                return acc;
            }, {} as { [key: string]: { title: string; content: string } | undefined }) || project.sections;

            await exportReportUtil(sectionsToExport || {}, project.name || 'Untitled Report', sectionsToInclude);
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
