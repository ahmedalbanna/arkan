
'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { usePresentationTemplateManager } from '@/hooks/use-presentation-template-manager';
import { PptxTemplate } from '@/lib/models/pptxTemplate';
import { Loader2, RefreshCw, Trash2, Upload } from 'lucide-react';

function StyleEditor({ templateKey, styles, handleStyleChange, handleSave, isSaving }: {
    templateKey: string;
    styles: any;
    handleStyleChange: (templateKey: string, path: string, value: any) => void;
    handleSave: (templateKey: string) => void;
    isSaving: boolean;
}) {
    const renderStyleInput = (path: string, value: any) => {
        const currentPath = `${path}`;
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            return (
                <div key={path} className="pl-4 border-l">
                    <p className="font-semibold capitalize text-sm">{path.split('.').pop()}</p>
                    {Object.entries(value).map(([key, val]) => renderStyleInput(`${path}.${key}`, val))}
                </div>
            );
        }

        let inputType = 'text';
        if (typeof value === 'number') inputType = 'number';
        if (typeof value === 'boolean') inputType = 'checkbox';

        return (
            <div key={path} className="flex items-center gap-2 mb-2">
                <label htmlFor={currentPath} className="text-sm min-w-[120px] truncate">{path.split('.').pop()}</label>
                <Input
                    id={currentPath}
                    type={inputType}
                    checked={typeof value === 'boolean' ? value : undefined}
                    value={typeof value !== 'boolean' ? String(value) : undefined}
                    onChange={(e) => {
                        const targetValue = inputType === 'checkbox' ? e.target.checked : inputType === 'number' ? parseFloat(e.target.value) : e.target.value;
                        handleStyleChange(templateKey, currentPath, targetValue);
                    }}
                    className="h-8"
                />
            </div>
        );
    };

    return (
        <div className="space-y-4">
            {Object.entries(styles).map(([key, value]) => renderStyleInput(key, value))}
            <div className="flex justify-end">
                <Button onClick={() => handleSave(templateKey)} disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Save Styles
                </Button>
            </div>
        </div>
    );
}

export function PresentationTemplateManager() {
    const {
        templates,
        isLoaded,
        isSaving,
        deleteMutation,
        refreshImageMutation,
        uploadTemplateFile,
        handleStyleChange,
        handleSave,
        handleDelete,
        handleRefreshImage,
        handleFileChange,
    } = usePresentationTemplateManager();

    if (!isLoaded) return <Skeleton className="h-48 w-full" />

    return (
        <Card>
            <CardHeader>
                <CardTitle>Presentation Style Templates</CardTitle>
                <CardDescription>Customize the visual styles for different presentation templates.</CardDescription>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    {Object.values(templates).map((template: PptxTemplate) => {
                        const templateKey = template.id;
                        const isDeleting = deleteMutation.isPending && deleteMutation.variables === templateKey;
                        const isRefreshing = refreshImageMutation.isPending && refreshImageMutation.variables?.templateId === templateKey;
                        const isUploading = uploadTemplateFile.isPending && uploadTemplateFile.variables?.templateId === templateKey;

                        return (
                            <AccordionItem value={templateKey} key={templateKey}>
                                <AccordionTrigger>{template.name}</AccordionTrigger>
                                <AccordionContent className="p-4 bg-muted/50 rounded-b-md space-y-6">
                                    <div>
                                        <h4 className="font-semibold mb-2">Template Actions</h4>
                                        <div className="flex gap-2 flex-wrap">
                                            <Button size="sm" variant="destructive" onClick={() => handleDelete(templateKey)} disabled={isDeleting}>
                                                {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />} Delete Template
                                            </Button>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    id={`file-upload-${templateKey}`}
                                                    type="file"
                                                    className="hidden"
                                                    onChange={(e) => handleFileChange(e, templateKey)}
                                                    accept=".pptx"
                                                />
                                                <label htmlFor={`file-upload-${templateKey}`} className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 px-3 cursor-pointer">
                                                    {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />} Upload .pptx
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold mb-2">Preview Image</h4>
                                        <div className="flex items-center gap-2">
                                            <img src={template.imageUrl} alt={`${template.name} preview`} className="w-48 h-auto rounded border" />
                                            <Button size="sm" onClick={() => handleRefreshImage(templateKey, 'A slide for a presentation about business analytics')} disabled={isRefreshing}>
                                                {isRefreshing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />} Refresh Image
                                            </Button>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold mb-2">Style Editor</h4>
                                        <StyleEditor
                                            templateKey={templateKey}
                                            styles={template.styles}
                                            handleStyleChange={handleStyleChange}
                                            handleSave={handleSave}
                                            isSaving={isSaving}
                                        />
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        );
                    })}
                </Accordion>
            </CardContent>
        </Card>
    );
}
