
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { templateKeys, useUpdateReportTemplate, useCreateReportTemplate, useDeleteReportTemplate } from '@/hooks/use-templates';
import { type ReportGenerationTemplate } from '@/services/template-service';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Button } from '../ui/button';
import { Loader2, Save, PlusCircle, Trash2, Check, X, Search, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { useToast } from '@/hooks/use-toast';

import { Checkbox } from '../ui/checkbox';
import { Skeleton } from '../ui/skeleton';
import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogClose, DialogFooter } from '../ui/dialog';
import { handleErrorUtility } from '@/lib/errorUtils';
import { REPORT_GENERATION_TEMPLATES } from '@/lib/report-templates';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { useAgents } from '@/hooks/use-agents';
import { ScrollArea } from '../ui/scroll-area';
import { useLocalization } from '@/context/LocalizationContext';
import { Label } from '../ui/label';
import { AgentCategory } from '@/lib/types';

const reportTemplateSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    agentIds: z.array(z.string()).min(1, "At least one agent must be selected."),
});

type ReportFormValues = z.infer<typeof reportTemplateSchema>;

const createReportTemplateSchema = reportTemplateSchema.omit({ id: true }).extend({
    id: z.string().min(3, "ID must be at least 3 characters").regex(/^[a-z0-9-]+$/, "ID can only contain lowercase letters, numbers, and hyphens."),
});
type CreateReportFormValues = z.infer<typeof createReportTemplateSchema>;

function ReportTemplateForm({ template, onSave, isSaving, onDelete, isDeleting }: { template: ReportGenerationTemplate, onSave: (data: ReportFormValues) => void, isSaving: boolean, onDelete: () => void, isDeleting: boolean }) {
    const { agents } = useAgents();
    const reportAgents = useMemo(() =>
        (agents || []).filter(a => a.category === AgentCategory.ReportGeneration),
    [agents]);
    const form = useForm<ReportFormValues>({
        resolver: zodResolver(reportTemplateSchema),
        defaultValues: template,
    });

    const isDefaultTemplate = REPORT_GENERATION_TEMPLATES.some(t => t.id === template.id);

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
                    name="agentIds"
                    render={() => (
                        <FormItem>
                            <div className="mb-4">
                                <FormLabel className="text-base">Included Report Sections</FormLabel>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {reportAgents.map((agent) => (
                                    <FormField
                                        key={agent.id}
                                        control={form.control}
                                        name="agentIds"
                                        render={({ field }) => {
                                            return (
                                                <FormItem
                                                    key={agent.id}
                                                    className="flex flex-row items-start space-x-3 space-y-0"
                                                >
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={field.value?.includes(agent.id)}
                                                            onCheckedChange={(checked) => {
                                                                return checked
                                                                    ? field.onChange([...field.value, agent.id])
                                                                    : field.onChange(field.value?.filter((value) => value !== agent.id));
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormLabel className="font-normal">{agent.name}</FormLabel>
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

    const { toast } = useToast();
    const { agents, isLoaded } = useAgents();
    const createMutation = useCreateReportTemplate();

    const form = useForm<CreateReportFormValues>({
        resolver: zodResolver(createReportTemplateSchema),
        defaultValues: {
            id: '',
            name: '',
            description: '',
            agentIds: [],
        }
    });

    const selectedAgentIds = form.watch('agentIds');

    const reportGenerationAgents = useMemo(() =>
        (agents || []).filter(agent =>
            agent.category === AgentCategory.ReportGeneration &&
            agent.name.toLowerCase().includes(searchTerm.toLowerCase())
        ),
        [agents, searchTerm]);

    const handleCreate = (data: CreateReportFormValues) => {
 createMutation.mutate({ ...data, sectionIds: data.agentIds }, {
            onSuccess: () => {
                toast({ title: 'Success', description: 'New report template created.' });
                setIsOpen(false);
                form.reset();
            },
            onError: (error: any) => {
                handleErrorUtility(error, "Failed to create template.");
            }
        });
    }

    const selectedAgents = agents.filter(agent => selectedAgentIds?.includes(agent.id));
    const availableAgents = reportGenerationAgents.filter(agent => !selectedAgentIds?.includes(agent.id));

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="sm"><PlusCircle className="me-2 h-4 w-4" />{t('manageTemplates.createButton')}</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{t('manageTemplates.reportDialog.title')}</DialogTitle>
                    <DialogDescription>{t('manageTemplates.reportDialog.description')}</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleCreate)} className="space-y-4">
                        <FormField control={form.control} name="id" render={({ field }) => (
                            <FormItem><FormLabel>{t('manageTemplates.createDialog.idLabel')}</FormLabel><FormControl><Input {...field} placeholder={t('manageTemplates.reportDialog.idPlaceholder')} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>{t('manageTemplates.createDialog.nameLabel')}</FormLabel><FormControl><Input {...field} placeholder={t('manageTemplates.reportDialog.namePlaceholder')} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem><FormLabel>{t('manageTemplates.createDialog.descriptionLabel')}</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>
                        )} />

                        <FormField control={form.control} name="agentIds" render={({ field }) => (
                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <div className="space-y-2">
                                    <Label>{t('manageTemplates.reportDialog.selectedAgents')} ({selectedAgents.length})</Label>
                                    <ScrollArea className="h-48 border rounded-md p-2">
                                        {selectedAgents.map(agent => (
                                            <div key={agent.id} className="flex items-center justify-between p-1">
                                                <span>{agent.name}</span>
                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => field.onChange(field.value?.filter(id => id !== agent.id))}><X className="h-4 w-4" /></Button>
                                            </div>
                                        ))}
                                    </ScrollArea>
                                </div>
                                <div className="space-y-2">
                                    <Label>{t('manageTemplates.reportDialog.availableAgents')}</Label>
                                    <ScrollArea className="h-48 border rounded-md p-2">
                                        <div className="p-1"><Input placeholder="Search agents..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="h-8" /></div>
                                        {isLoaded && availableAgents.map(agent => (
                                            <div key={agent.id} className="flex items-center justify-between p-1">
                                                <span>{agent.name}</span>
                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => field.onChange([...(field.value || []), agent.id])}><Plus className="h-4 w-4" /></Button>
                                            </div>
                                        ))}
                                        {!isLoaded && <Loader2 className="mx-auto animate-spin" />}
                                    </ScrollArea>
                                </div>
                                <FormMessage className="col-span-2">{form.formState.errors.agentIds?.message}</FormMessage>
                            </div>
                        )} />

                        <DialogFooter>
                            <DialogClose asChild><Button type="button" variant="ghost">{t('manageTemplates.cancelButton')}</Button></DialogClose>
                            <Button type="submit" disabled={createMutation.isPending}>
                                {createMutation.isPending && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                                {t('manageTemplates.createButton')}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export function ReportTemplateManager() {
    const { firebaseUser } = useAuth();

    const { data: templates, isLoading, isError } = useQuery({
        queryKey: templateKeys.reports(),
        queryFn: async () => {
            if (!firebaseUser) return [];
            const { fetchReportTemplates } = await import('@/services/template-service');
            return fetchReportTemplates(await firebaseUser.getIdToken());
        },
        enabled: !!firebaseUser,
        meta: {
            onError: (error: Error) => {
                handleErrorUtility(error, "Failed to load report templates");
            },
        },
    });

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
                        Configure which report sections are included in the "Generate Full Report" option.
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
