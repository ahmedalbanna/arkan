
'use client';

import { exportReportAsDocx as exportReportUtil } from '@/lib/docx-exporter';
import { useState } from 'react';
import { toast } from './use-toast';

import { Project, Section } from '@/lib/models';

export function useExport() {
    const [isExporting, setIsExporting] = useState(false);

    const exportReportDocx = async (project: Project, sectionsToInclude?: string[]) => {
        setIsExporting(true);
        try {
            // Filter the project's sections based on the sectionsToInclude array.
            const sectionsToExport = sectionsToInclude
                ? project.sections?.filter(section => sectionsToInclude.includes(section.id))
                : project.sections;
                
            await exportReportUtil(sectionsToExport || [], project.name || 'Untitled Report');
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
