
'use client';

import { useCreatePresentationTemplate, useDeletePresentationTemplate, usePresentationTemplates, useUpdatePresentationTemplate } from '@/hooks/data/use-templates';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, PlusCircle, Save, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocalization } from '@/context/LocalizationContext';
import { toast, useSections } from '@/hooks';
import { PresentationTemplate } from '@/lib/models/presentationTemplate';
import { useMemo, useState } from 'react';


const presentationTemplateSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    primaryAgentId: z.string().default('generate-presentation'),
    relevantReportSectionIds: z.array(z.string()).optional(),
});

type PresentationFormValues = z.infer<typeof presentationTemplateSchema>;

const createPresentationTemplateSchema = presentationTemplateSchema.omit({ id: true }).extend({
    id: z.string().min(3, "ID must be at least 3 characters").regex(/^[a-z0-9-]+$/, "ID can only contain lowercase letters, numbers, and hyphens."),
});
type CreatePresentationFormValues = z.infer<typeof createPresentationTemplateSchema>;



function PresentationTemplateForm({ template, onSave, isSaving, onDelete, isDeleting }: { template: PresentationTemplate, onSave: (data: PresentationFormValues) => void, isSaving: boolean, onDelete: () => void, isDeleting: boolean }) {
    const { t } = useLocalization();
    const { data: sections } = useSections();
    const reportSections = useMemo(() => (sections || []).filter(s => s.type === 'report'), [sections]);
    const form = useForm<PresentationFormValues>({
        resolver: zodResolver(presentationTemplateSchema),
        defaultValues: {
            ...template,
            relevantReportSectionIds: template.relevantReportSectionIds || [],
        },
    });

    const isDefaultTemplate = template.isDefault;

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Template Name</FormLabel>
                        <FormControl><Input {...field} disabled={isSaving || isDeleting} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl><Textarea {...field} disabled={isSaving || isDeleting} rows={2} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField
                    control={form.control}
                    name="relevantReportSectionIds"
                    render={() => (
                        <FormItem>
                            <div className="mb-4">
                                <FormLabel className="text-base">Relevant Report Sections</FormLabel>
                                <p className="text-sm text-muted-foreground">Select which report sections are most relevant for this presentation type.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {reportSections.map((section) => (
                                    <FormField
                                        key={section.id}
                                        control={form.control}
                                        name="relevantReportSectionIds"
                                        render={({ field }) => {
                                            return (
                                                <FormItem
                                                    key={section.id}
                                                    className="flex flex-row items-start space-x-3 space-y-0"
                                                >
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={field.value?.includes(section.id)}
                                                            onCheckedChange={(checked) => {
                                                                return checked
                                                                    ? field.onChange([...(field.value || []), section.id])
                                                                    : field.onChange(field.value?.filter((value) => value !== section.id));
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormLabel className="font-normal">{section.title}</FormLabel>
                                                </FormItem>
                                            );
                                        }}
                                    />
                                ))}
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex justify-end gap-2">
                    {!isDefaultTemplate && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" type="button" disabled={isSaving || isDeleting}>
                                    {isDeleting ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Trash2 className="me-2 h-4 w-4" />}
                                    Delete
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>This action cannot be undone. This will permanently delete the "{template.name}" template.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                    <Button type="submit" disabled={isSaving || isDeleting}>
                        {isSaving ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Save className="me-2 h-4 w-4" />}
                        Save Changes
                    </Button>
                </div>
            </form>
        </Form>
    );
}

function CreatePresentationTemplateDialog() {
    const { t } = useLocalization();
    const [isOpen, setIsOpen] = useState(false);
    const createMutation = useCreatePresentationTemplate();
    const { data: sections } = useSections();
    const reportSections = useMemo(() => (sections || []).filter(s => s.type === 'report'), [sections]);
    const form = useForm<CreatePresentationFormValues>({
        resolver: zodResolver(createPresentationTemplateSchema),
        defaultValues: {
            id: '',
            name: '',
            description: '',
            relevantReportSectionIds: [],
        },
    });


    const handleSave = (data: CreatePresentationFormValues) => {
        createMutation.mutate(data, {
            onSuccess: () => {
                toast({ title: 'Success', description: 'New presentation template created.' });
                setIsOpen(false);
                form.reset();
            },
            onError: (error: any) => {
                // Error handling is now in the hook
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="sm"><PlusCircle className="me-2 h-4 w-4" />Create New</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Presentation Template</DialogTitle>
                    <DialogDescription>
                        Define a new template for generating presentations.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
                        <FormField control={form.control} name="id" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Template ID</FormLabel>
                                <FormControl><Input {...field} placeholder="e.g., weekly-update" disabled={createMutation.isPending} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Template Name</FormLabel>
                                <FormControl><Input {...field} placeholder="e.g., Weekly Update" disabled={createMutation.isPending} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl><Textarea {...field} disabled={createMutation.isPending} rows={2} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField
                            control={form.control}
                            name="relevantReportSectionIds"
                            render={() => (
                                <FormItem>
                                    <FormLabel className="text-base">Relevant Report Sections</FormLabel>
                                    <div className="grid grid-cols-2 gap-4">
                                        {reportSections.map((section) => (
                                            <FormField key={section.id} control={form.control} name="relevantReportSectionIds"
                                                render={({ field }) => (
                                                    <FormItem key={section.id} className="flex flex-row items-start space-x-3 space-y-0">
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={field.value?.includes(section.id)}
                                                                onCheckedChange={(checked) => (
                                                                    checked
                                                                        ? field.onChange([...(field.value || []), section.id])
                                                                        : field.onChange(field.value?.filter((value) => value !== section.id))
                                                                )}
                                                            />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">{section.title}</FormLabel>
                                                    </FormItem>
                                                )}
                                            />
                                        ))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                            <Button type="submit" disabled={createMutation.isPending}>
                                {createMutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Save className="me-2 h-4 w-4" />}
                                Create
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}


export function PresentationTemplateManager() {
    const { t } = useLocalization();
    const { data: templates, isLoading, isError } = usePresentationTemplates();

    const updateMutation = useUpdatePresentationTemplate();
    const deleteMutation = useDeletePresentationTemplate();

    const handleSave = (data: PresentationFormValues) => {
        updateMutation.mutate({ templateId: data.id, data });
    };

    const handleDelete = (templateId: string) => {
        deleteMutation.mutate(templateId);
    };

    if (isLoading) return <Skeleton className="h-48 w-full" />
    if (isError) return <div>Error loading templates.</div>;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Presentation Generation Templates</CardTitle>
                    <CardDescription>
                        Configure the content structure for different types of presentations.
                    </CardDescription>
                </div>
                <CreatePresentationTemplateDialog />
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    {templates?.map(template => {
                        return (
                            <AccordionItem value={template.id} key={template.id}>
                                <AccordionTrigger>{template.name}</AccordionTrigger>
                                <AccordionContent className="p-4 bg-muted/50 rounded-b-md">
                                    <PresentationTemplateForm
                                        template={template}
                                        onSave={handleSave}
                                        isSaving={updateMutation.isPending && updateMutation.variables?.templateId === template.id}
                                        onDelete={() => handleDelete(template.id)}
                                        isDeleting={deleteMutation.isPending && deleteMutation.variables === template.id}
                                    />
                                </AccordionContent>
                            </AccordionItem>
                        )
                    })}
                </Accordion>
            </CardContent>
        </Card>
    );
}
