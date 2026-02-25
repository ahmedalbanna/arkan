'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocalization } from '@/context/LocalizationContext';
import { useDocxStyles, usePptxStyles, useReportTemplates } from '@/hooks';
import { Loader2, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TemplateCard } from './TemplateCard';
import { useState } from 'react';
import { TemplateFormDialog } from './TemplateFormDialog';
import { PptxTemplate } from '@/modules/templates/domain/entities/PptxTemplate';
import { DocxTemplate } from '@/modules/templates/domain/entities/DocxTemplate';
import { ReportTemplate } from '@/lib/models';

type TemplateType = 'docx' | 'pptx' | 'report';
type TemplateData = DocxTemplate | PptxTemplate | ReportTemplate;

const DocxTemplateManager = ({ onEdit }: { onEdit: (template: TemplateData) => void }) => {
    const { templates, isLoading } = useDocxStyles();
    if(isLoading) return <Loader2 className="animate-spin" />;
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(templates).map(template => (
                <TemplateCard key={template.id} template={new DocxTemplate(template)} onEdit={() => onEdit(new DocxTemplate(template))} templateType="docx" />
            ))}
        </div>
    );
};

const PptxTemplateManager = ({ onEdit }: { onEdit: (template: TemplateData) => void }) => {
    const { templates, isLoading } = usePptxStyles();
    if(isLoading) return <Loader2 className="animate-spin" />;
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(templates).map(template => (
                <TemplateCard key={template.id} template={new PptxTemplate(template)} onEdit={() => onEdit(new PptxTemplate(template))} templateType="pptx" />
            ))}
        </div>
    );
};

const ReportTemplateManager = ({ onEdit }: { onEdit: (template: TemplateData) => void }) => {
    const { data: templates, isLoading } = useReportTemplates();
    if(isLoading) return <Loader2 className="animate-spin" />;
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates?.map(template => (
                <TemplateCard key={template.id} template={new ReportTemplate(template)} onEdit={() => onEdit(new ReportTemplate(template))} templateType="report" />
            ))}
        </div>
    );
};


export function TemplateManagementConsole() {
    const { t } = useLocalization();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<TemplateData | null>(null);
    const [templateType, setTemplateType] = useState<TemplateType>('docx');

    const handleCreate = (type: TemplateType) => {
        setEditingTemplate(null);
        setTemplateType(type);
        setIsDialogOpen(true);
    };

    const handleEdit = (template: TemplateData) => {
        setEditingTemplate(template);
        if (template instanceof DocxTemplate) setTemplateType('docx');
        if (template instanceof PptxTemplate) setTemplateType('pptx');
        if (template instanceof ReportTemplate) setTemplateType('report');
        setIsDialogOpen(true);
    };

    return (
        <>
            <TemplateFormDialog
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                template={editingTemplate}
                templateType={templateType}
            />
            <Tabs defaultValue="docx" className="w-full">
                <div className="flex justify-between items-center mb-6">
                    <TabsList className="grid grid-cols-3">
                        <TabsTrigger value="docx">{t('manageTemplates.docxTemplates')}</TabsTrigger>
                        <TabsTrigger value="pptx">{t('manageTemplates.pptxTemplates')}</TabsTrigger>
                        <TabsTrigger value="report">{t('manageTemplates.reportTemplates')}</TabsTrigger>
                    </TabsList>
                    <Button onClick={() => handleCreate(document.querySelector<HTMLButtonElement>('[data-state="active"]')?.dataset.value as TemplateType || 'docx')}><PlusCircle className="mr-2 h-4 w-4"/> Create New Template</Button>
                </div>
                <TabsContent value="docx">
                    <DocxTemplateManager onEdit={handleEdit} />
                </TabsContent>
                <TabsContent value="pptx">
                    <PptxTemplateManager onEdit={handleEdit} />
                </TabsContent>
                <TabsContent value="report">
                    <ReportTemplateManager onEdit={handleEdit} />
                </TabsContent>
          </Tabs>
        </>
    );
}
