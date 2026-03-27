'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocalization } from '@/context/LocalizationContext';
import { useTemplates } from '@/hooks';
import { Loader2, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TemplateCard } from './TemplateCard';
import { useState } from 'react';
import { TemplateFormDialog } from './TemplateFormDialog';
import { PptxTemplate } from '@/modules/templates/domain/entities/PptxTemplate';
import { DocxTemplate } from '@/modules/templates/domain/entities/DocxTemplate';
import { ReportTemplate } from '@/modules/templates/domain/entities/ReportTemplate';

type TemplateType = 'docx' | 'pptx' | 'report';
type TemplateData = DocxTemplate | PptxTemplate | ReportTemplate;

const DocxTemplateManager = ({ onEdit }: { onEdit: (template: TemplateData) => void }) => {
    const { data: templates, isLoading } = useTemplates('docx');
    if(isLoading) return <Loader2 className="animate-spin" />;
    const templatesList = Array.isArray(templates) ? templates : Object.values(templates || {});
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templatesList.map((template: any) => (
                <TemplateCard key={template.id} template={new DocxTemplate(template)} onEdit={() => onEdit(new DocxTemplate(template))} templateType="docx" />
            ))}
        </div>
    );
};

const PptxTemplateManager = ({ onEdit }: { onEdit: (template: TemplateData) => void }) => {
    const { data: templates, isLoading } = useTemplates('pptx');
    if(isLoading) return <Loader2 className="animate-spin" />;
    const templatesList = Array.isArray(templates) ? templates : Object.values(templates || {});
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templatesList.map((template: any) => (
                <TemplateCard key={template.id} template={new PptxTemplate(template)} onEdit={() => onEdit(new PptxTemplate(template))} templateType="pptx" />
            ))}
        </div>
    );
};

const ReportTemplateManager = ({ onEdit }: { onEdit: (template: TemplateData) => void }) => {
    const { data: templates, isLoading } = useTemplates('report');
    if(isLoading) return <Loader2 className="animate-spin" />;
    const templatesList = Array.isArray(templates) ? templates : [];
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templatesList.map((template: any) => (
                <TemplateCard key={template.id} template={new ReportTemplate(template)} onEdit={() => onEdit(new ReportTemplate(template))} templateType="report" />
            ))}
        </div>
    );
};


import { Badge } from '@/components/ui/badge';
import { FileText, Presentation, FileCode, Plus } from 'lucide-react';
import { cn } from '@/infrastructure/utils/cn';
import { Card, CardContent } from '@/components/ui/card';

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

    const getActiveTab = () => {
        if (typeof document === 'undefined') return 'docx';
        return document.querySelector<HTMLButtonElement>('[data-state="active"][data-value]')?.dataset.value as TemplateType || 'docx';
    };

    return (
        <Card className="border-none shadow-2xl shadow-primary/5 bg-card overflow-hidden rounded-[32px] animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="px-8 py-6 border-b bg-muted/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
                        Style Architecture Console
                    </h3>
                </div>
                <Button 
                    size="sm"
                    className="font-bold h-9 gap-2 shadow-lg shadow-primary/20 rounded-xl"
                    onClick={() => handleCreate(getActiveTab())}
                >
                    <Plus className="h-4 w-4" />
                    Create Template
                </Button>
            </header>

            <TemplateFormDialog
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                template={editingTemplate}
                templateType={templateType}
            />

            <CardContent className="p-8 md:p-10">
                <Tabs defaultValue="docx" className="w-full">
                    <div className="flex justify-center mb-10">
                        <TabsList className="h-11 rounded-xl bg-muted/30 p-1 gap-1 min-w-[450px]">
                            <TabsTrigger value="docx" data-value="docx" className="flex-1 gap-2 text-[10px] font-bold uppercase tracking-wider data-[state=active]:bg-background data-[state=active]:text-primary transition-all">
                                <FileText className="h-3.5 w-3.5" />
                                {t('manageTemplates.docxTemplates')}
                            </TabsTrigger>
                            <TabsTrigger value="pptx" data-value="pptx" className="flex-1 gap-2 text-[10px] font-bold uppercase tracking-wider data-[state=active]:bg-background data-[state=active]:text-primary transition-all">
                                <Presentation className="h-3.5 w-3.5" />
                                {t('manageTemplates.pptxTemplates')}
                            </TabsTrigger>
                            <TabsTrigger value="report" data-value="report" className="flex-1 gap-2 text-[10px] font-bold uppercase tracking-wider data-[state=active]:bg-background data-[state=active]:text-primary transition-all">
                                <FileCode className="h-3.5 w-3.5" />
                                {t('manageTemplates.reportTemplates')}
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="rounded-2xl border bg-background overflow-hidden shadow-sm shadow-black/[0.02] bg-[#f8fafc] dark:bg-black/20 shadow-inner p-8">
                        <TabsContent value="docx" className="m-0 focus-visible:ring-0 animate-in fade-in duration-500">
                            <DocxTemplateManager onEdit={handleEdit} />
                        </TabsContent>
                        <TabsContent value="pptx" className="m-0 focus-visible:ring-0 animate-in fade-in duration-500">
                            <PptxTemplateManager onEdit={handleEdit} />
                        </TabsContent>
                        <TabsContent value="report" className="m-0 focus-visible:ring-0 animate-in fade-in duration-500">
                            <ReportTemplateManager onEdit={handleEdit} />
                        </TabsContent>
                    </div>
                </Tabs>
            </CardContent>

            <footer className="px-8 py-4 border-t bg-muted/5 flex items-center justify-between">
                <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-widest">
                    Arkan Style Engine • Assets Node V1.0
                </p>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="h-4 text-[8px] uppercase tracking-tighter text-muted-foreground/60 border-border/60">
                        Theme Repository Synchronized
                    </Badge>
                </div>
            </footer>
        </Card>
    );
}
