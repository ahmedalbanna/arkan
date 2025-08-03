
'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Accordion } from '@/components/ui/accordion';
import { StyleEditor } from './StyleEditor';
import { Button } from '../ui/button';
import { useDocxStyles } from '@/hooks/use-docx-styles';
import { Loader2, Save } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';

export function DesignStudio() {
    const { templates, activeTemplateKey, setActiveTemplateKey, saveChanges, isSaving } = useDocxStyles();
    
    const handleSave = () => {
        if(activeTemplateKey) {
            saveChanges(activeTemplateKey);
        }
    }

    if (!templates) {
        return <div className="p-4"><Loader2 className="animate-spin" /></div>
    }

    return (
        <div className="h-full flex flex-col">
            <CardHeader>
                <CardTitle>Design Studio</CardTitle>
                <CardDescription>Customize the look and feel of your exported DOCX documents.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto p-4">
                 <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="template-selector">Active Template</Label>
                        <Select value={activeTemplateKey} onValueChange={setActiveTemplateKey}>
                            <SelectTrigger id="template-selector">
                                <SelectValue placeholder="Select a template..." />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.values(templates).map((template) => (
                                    <SelectItem key={`${template.id}-${template.name}`} value={template.id}>{template.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Accordion type="multiple" className="w-full" defaultValue={['general', 'heading1']}>
                        <StyleEditor heading="General Document Styles" styleKey="document" />
                        <StyleEditor heading="Heading 1" styleKey="heading1" />
                        <StyleEditor heading="Heading 2" styleKey="heading2" />
                        <StyleEditor heading="Heading 3" styleKey="heading3" />
                    </Accordion>
                 </div>
            </CardContent>
             <CardFooter className="border-t pt-6">
                <Button onClick={handleSave} disabled={isSaving} className="w-full">
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />}
                    Save Template
                </Button>
            </CardFooter>
        </div>
    );
}
