'use client';

import { useCreateReportTemplate, useDeleteReportTemplate, useReportTemplates, useUpdateReportTemplate } from '@/hooks';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useLocalization } from '@/context/LocalizationContext';
import { useSections } from '@/hooks';
import { useMemo, useState } from 'react';
import { Loader2, PlusCircle, Trash2, Save, Search } from 'lucide-react';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { toast } from '@/hooks';
import { Skeleton } from '@/components/ui/skeleton';
import { ReportTemplate } from '@/lib/models/reportTemplate';
import { useDebounce } from '@/hooks/use-debounce';

const reportTemplateSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    sectionIds: z.array(z.string()).min(1, "At least one section must be selected"),
});

type ReportFormValues = z.infer<typeof reportTemplateSchema>;

const createReportTemplateSchema = reportTemplateSchema.omit({ id: true }).extend({
    id: z.string().min(3, "ID must be at least 3 characters").regex(/^[a-z0-9-]+$/, "ID can only contain lowercase letters, numbers, and hyphens."),
});
type CreateReportFormValues = z.infer<typeof createReportTemplateSchema>;


function ReportTemplateForm({ template, onSave, isSaving, onDelete, isDeleting }: { template: ReportTemplate, onSave: (data: ReportFormValues) => void, isSaving: boolean, onDelete: () => void, isDeleting: boolean }) {
    const { t } = useLocalization();
    const { data: sections } = useSections();
    const reportSections = useMemo(() => sections?.filter(s => s.type === 'report') || [], [sections]);

    const form = useForm<ReportFormValues>({
        resolver: zodResolver(reportTemplateSchema),
        defaultValues: { ...template },
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
                    name="sectionIds"
                    render={() => (
                        <FormItem>
                            <div className="mb-4">
                                <FormLabel className="text-base">Included Sections</FormLabel>
                                <p className="text-sm text-muted-foreground">Select the report sections to include in this template.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {reportSections.map((section) => (
                                    <FormField
                                        key={section.id}
                                        control={form.control}
                                        name="sectionIds"
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

function CreateReportTemplateDialog() {
    const { t } = useLocalization();
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const createMutation = useCreateReportTemplate();
    const { data: sections } = useSections();
    const allReportSections = useMemo(() => sections?.filter(s => s.type === 'report') || [], [sections]);

    const filteredSections = useMemo(() =>
        allReportSections.filter(section =>
            section.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        ),
        [allReportSections, debouncedSearchTerm]
    );

    const form = useForm<CreateReportFormValues>({
        resolver: zodResolver(createReportTemplateSchema),
        defaultValues: {
            id: '',
            name: '',
            description: '',
            sectionIds: [],
        },
    });

    const handleSave = (data: CreateReportFormValues) => {
        createMutation.mutate(data, {
            onSuccess: () => {
                toast({ title: 'Success', description: 'New report template created.' });
                setIsOpen(false);
                form.reset();
            },
            onError: (error: any) => {
                // The useCreate... hook handles the toast
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="sm"><PlusCircle className="me-2 h-4 w-4" />Create New</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Create New Report Template</DialogTitle>
                    <DialogDescription>
                        Choose which agents you want to include in this template for group interactions.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
                        <FormField control={form.control} name="id" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Template ID</FormLabel>
                                <FormControl><Input {...field} placeholder="e.g., tech-report" disabled={createMutation.isPending} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Template Name</FormLabel>
                                <FormControl><Input {...field} placeholder="e.g., Technical Software Report" disabled={createMutation.isPending} /></FormControl>
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
                            name="sectionIds"
                            render={() => (
                                <FormItem>
                                    <FormLabel className="text-base">Included Sections</FormLabel>
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search sections..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-8 mb-2"
                                        />
                                    </div>
                                    <div className="max-h-48 overflow-y-auto border p-4 rounded-md grid grid-cols-2 gap-4">
                                        {filteredSections.map((section) => (
                                            <FormField
                                                key={section.id}
                                                control={form.control}
                                                name="sectionIds"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
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
    );
}

export function ReportTemplateManager() {
    const { t } = useLocalization();
    const { data: templates, isLoading, isError } = useReportTemplates();

    const updateMutation = useUpdateReportTemplate();
    const deleteMutation = useDeleteReportTemplate();

    const handleSave = (data: ReportFormValues) => {
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
                    <CardTitle>Report Generation Templates</CardTitle>
                    <CardDescription>
                        Configure which report sections are included in the 'Generate Full Report' option.
                    </CardDescription>
                </div>
                <CreateReportTemplateDialog />
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    {templates?.map(template => {
                        return (
                            <AccordionItem value={template.id} key={template.id}>
                                <AccordionTrigger>{template.name}</AccordionTrigger>
                                <AccordionContent className="p-4 bg-muted/50 rounded-b-md">
                                    <ReportTemplateForm
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
