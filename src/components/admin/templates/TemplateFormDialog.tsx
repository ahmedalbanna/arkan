'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save } from 'lucide-react';
import { useSaveTemplate } from '@/hooks';
import { ReportTemplate, DocxTemplate, PptxTemplate } from '@/lib/types';
import { useToast } from '@/hooks';

type TemplateData = DocxTemplate | PptxTemplate | ReportTemplate;
type TemplateType = 'docx' | 'pptx' | 'report';

interface TemplateFormDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    template: TemplateData | null;
    templateType: TemplateType;
}

const formSchema = z.object({
  id: z.string().min(3).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  stylesJson: z.string().optional(),
  contentJson: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function TemplateFormDialog({ isOpen, onOpenChange, template, templateType }: TemplateFormDialogProps) {
    const { toast } = useToast();
    const saveTemplateMutation = useSaveTemplate(templateType);
    const isPending = saveTemplateMutation.isPending;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
    });

    useEffect(() => {
        if (isOpen) {
            form.reset({
                id: template?.id || '',
                name: template?.name || '',
                description: template?.description || '',
                stylesJson: (template && 'styles' in template) ? JSON.stringify((template as DocxTemplate | PptxTemplate).styles, null, 2) : '',
                contentJson: (template && 'content' in template) ? JSON.stringify((template as ReportTemplate).content, null, 2) : '',
            });
        }
    }, [isOpen, template, form]);

    const onSubmit = (data: FormValues) => {
        const mutationOptions = {
            onSuccess: () => onOpenChange(false),
        };

        try {
            const styles = data.stylesJson ? JSON.parse(data.stylesJson) : {};
            const content = data.contentJson ? JSON.parse(data.contentJson) : [];
            const payload = { 
                ...data, 
                styles: (templateType === 'docx' || templateType === 'pptx') ? styles : undefined,
                content: templateType === 'report' ? content : undefined
            };
            
            saveTemplateMutation.mutate({ id: data.id, data: payload }, mutationOptions);
        } catch (e) {
            toast({ title: "Invalid JSON", description: "The JSON is not valid.", variant: 'destructive' });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>{template ? 'Edit Template' : 'Create New Template'}</DialogTitle>
                    <DialogDescription>
                        {template ? `Editing ${template.name}` : `Create a new ${templateType} template.`}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
                        <FormField control={form.control} name="id" render={({ field }) => (
                            <FormItem><FormLabel>ID</FormLabel><FormControl><Input {...field} disabled={!!template} placeholder="e.g., custom-modern-dark" /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} placeholder="e.g., Custom Dark Theme" /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} placeholder="A short description of the template" /></FormControl><FormMessage /></FormItem>
                        )} />
                        
                        {(templateType === 'docx' || templateType === 'pptx') && (
                            <FormField control={form.control} name="stylesJson" render={({ field }) => (
                                <FormItem><FormLabel>Styles (JSON)</FormLabel><FormControl><Textarea {...field} rows={15} className="font-mono text-xs" /></FormControl><FormMessage /></FormItem>
                            )} />
                        )}

                        {templateType === 'report' && (
                             <FormField control={form.control} name="contentJson" render={({ field }) => (
                                <FormItem><FormLabel>Content Structure (JSON)</FormLabel><FormControl><Textarea {...field} rows={15} className="font-mono text-xs" /></FormControl><FormMessage /></FormItem>
                            )} />
                        )}

                        <DialogFooter className="sticky bottom-0 bg-background py-4">
                            <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
                            <Button type="submit" disabled={isPending}>
                                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                {template ? 'Save Changes' : 'Create Template'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
