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
import { useCreateDocxTemplate, useCreatePptxTemplate, useCreateReportTemplate, useUpdateDocxTemplate, useUpdatePptxTemplate, useUpdateReportTemplate } from '@/hooks';
import { ReportTemplate, DocxTemplate, PptxTemplate } from '@/lib/models';

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
});

type FormValues = z.infer<typeof formSchema>;

export function TemplateFormDialog({ isOpen, onOpenChange, template, templateType }: TemplateFormDialogProps) {
    const createDocxMutation = useCreateDocxTemplate();
    const updateDocxMutation = useUpdateDocxTemplate();
    const createPptxMutation = useCreatePptxTemplate();
    const updatePptxMutation = useUpdatePptxTemplate();
    const createReportMutation = useCreateReportTemplate();
    const updateReportMutation = useUpdateReportTemplate();

    const isPending = createDocxMutation.isPending || updateDocxMutation.isPending ||
                      createPptxMutation.isPending || updatePptxMutation.isPending ||
                      createReportMutation.isPending || updateReportMutation.isPending;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
    });

    useEffect(() => {
        if (isOpen) {
            form.reset(template ? {
                id: template.id,
                name: template.name,
                description: template.description,
            } : {
                id: '',
                name: '',
                description: '',
            });
        }
    }, [isOpen, template, form]);

    const onSubmit = (data: FormValues) => {
        const mutationOptions = {
            onSuccess: () => onOpenChange(false),
        };
        
        if (template) { // Update
            if (templateType === 'docx') updateDocxMutation.mutate({ key: template.id, styles: data }, mutationOptions);
            if (templateType === 'pptx') updatePptxMutation.mutate({ key: template.id, styles: data }, mutationOptions);
            if (templateType === 'report') updateReportMutation.mutate({ templateId: template.id, data }, mutationOptions);
        } else { // Create
            if (templateType === 'docx') createDocxMutation.mutate(data, mutationOptions);
            if (templateType === 'pptx') createPptxMutation.mutate(data, mutationOptions);
            if (templateType === 'report') createReportMutation.mutate(data as any, mutationOptions);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{template ? 'Edit Template' : 'Create New Template'}</DialogTitle>
                    <DialogDescription>
                        {template ? `Editing ${template.name}` : `Create a new ${templateType} template.`}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <FormField control={form.control} name="id" render={({ field }) => (
                            <FormItem><FormLabel>ID</FormLabel><FormControl><Input {...field} disabled={!!template} placeholder="e.g., custom-modern-dark" /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} placeholder="e.g., Custom Dark Theme" /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} placeholder="A short description of the template" /></FormControl><FormMessage /></FormItem>
                        )} />

                        <DialogFooter>
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
