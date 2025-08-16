

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { templateKeys, useUpdateReportTemplate, useCreateReportTemplate, useDeleteReportTemplate } from '@/hooks/use-templates';
import { type ReportGenerationTemplate } from '@/services/template-service';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Button } from '../ui/button';
import { Loader2, Save, PlusCircle, Trash2, Check, X, Search, Plus } from 'lucide-react';
import { useForm, ControllerRenderProps } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { AGENTS, AgentCategory } from '@/lib/agents';
import { Checkbox } from '../ui/checkbox';
import { Skeleton } from '../ui/skeleton';
import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogClose, DialogFooter } from '../ui/dialog';
import { handleErrorUtility } from '@/lib/errorUtils';
import { REPORT_GENERATION_TEMPLATES } from '@/lib/report-generation-templates';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { useAgents } from '@/hooks/use-agents';
import { ScrollArea } from '../ui/scroll-area';
import { useLocalization } from '@/context/LocalizationContext';
import { Label } from '../ui/label';
import React from 'react';


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


const reportAgents = AGENTS.filter(a => a.category === AgentCategory.ReportGeneration);


function ReportTemplateForm({ template, onSave, isSaving, onDelete, isDeleting }: { template: ReportGenerationTemplate, onSave: (data: ReportFormValues) => void, isSaving: boolean, onDelete: () => void, isDeleting: boolean }) {
    const {t} = useLocalization();
    const form = useForm<ReportFormValues>({
        resolver: zodResolver(reportTemplateSchema),
        defaultValues: template,
    });
    
    const isDefaultTemplate = REPORT_GENERATION_TEMPLATES.some(t => t.id === template.id);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
                 <FormField control={form.control} name="name" render={({ field }: { field: ControllerRenderProps<ReportFormValues, "name"> }) => (
                    <FormItem>
                        <FormLabel>{t('manageTemplates.proposalDialog.nameLabel')}</FormLabel>
                        <FormControl><Input {...field} disabled={isSaving || isDeleting} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                 <FormField control={form.control} name="description" render={({ field }: { field: ControllerRenderProps<ReportFormValues, "description"> }) => (
                    <FormItem>
                        <FormLabel>{t('manageTemplates.proposalDialog.descriptionLabel')}</FormLabel>
                        <FormControl><Textarea {...field} disabled={isSaving || isDeleting} rows={2} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                 <FormField // Outer FormField for the group
                    control={form.control}
                    name="agentIds"
                    render={() => (
                        <FormItem>
                            <div className="mb-4">
                                <FormLabel className="text-base">{t('manageTemplates.reportDialog.includedAgentsLabel')}</FormLabel>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {reportAgents.map((agent) => (
                                    <FormField
                                        key={agent.id}
                                        control={form.control}
                                        name="agentIds"
                                    render={({ field }: { field: ControllerRenderProps<ReportFormValues, "agentIds"> }) => {
                                            return (
                                                <FormItem
                                                    key={agent.id}
                                                    className="flex flex-row items-start space-x-3 space-y-0"
                                                >
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={field.value?.includes(agent.id)}
                                                            onCheckedChange={(checked: boolean) => {
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
                                    {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                    {t('manageTemplates.deleteDialog.deleteButton')}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>{t('manageTemplates.deleteDialog.title')}</AlertDialogTitle>
                                <AlertDialogDescription>{t('manageTemplates.deleteDialog.description').replace('{templateName}', template.name)}</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>{t('manageTemplates.cancelButton')}</AlertDialogCancel>
                                <AlertDialogAction onClick={onDelete}>{t('manageTemplates.deleteDialog.deleteButton')}</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                    <Button type="submit" disabled={isSaving || isDeleting}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        {t('manageTemplates.proposalDialog.saveButton')}
                    </Button>
                </div>
            </form>
        </Form>
    );
}

function CreateTemplateDialog() {
    const { t } = useLocalization();
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();
    const { agents, isLoaded } = useAgents();
    const createMutation = useCreateReportTemplate();

     const form = useForm<CreateReportFormValues>({
        resolver: zodResolver(createReportTemplateSchema),
        defaultValues: { name: '', description: '', agentIds: [] },
    });
    
    const selectedAgentIds = form.watch('agentIds');

    const reportGenerationAgents = useMemo(() => 
        (agents || []).filter(agent => 
            agent.category === AgentCategory.ReportGeneration
        ), 
    [agents]);

    const handleCreate = (data: CreateReportFormValues) => {
        const id = data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        if (!id) {
            toast({ title: 'Invalid Name', description: 'Template name must contain valid characters.', variant: 'destructive' });
            return;
        }

        createMutation.mutate({ ...data, id }, {
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

    
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="sm"><PlusCircle className="mr-2 h-4 w-4" />{t('manageTemplates.createButton')}</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{t('manageTemplates.reportDialog.title')}</DialogTitle>
                    <DialogDescription>{t('manageTemplates.reportDialog.description')}</DialogDescription>
                </DialogHeader>
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleCreate)} className="space-y-4">
                       <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('manageTemplates.createDialog.nameLabel')}</FormLabel>
                                    <FormControl><Input {...field} placeholder={t('manageTemplates.reportDialog.namePlaceholder')} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('manageTemplates.createDialog.descriptionLabel')}</FormLabel>
                                    <FormControl><Textarea {...field} placeholder={t('manageTemplates.reportDialog.idPlaceholder')} rows={2} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="agentIds"
                            render={() => (
                                <FormItem>
                                    <FormLabel className="text-base">{t('manageTemplates.reportDialog.includedAgentsLabel')}</FormLabel>
                                    <div className="grid grid-cols-2 gap-4">
                                        {reportGenerationAgents.map((agent) => (
                                            <FormField key={agent.id} control={form.control} name="agentIds"
                                                render={({ field }) => (
                                                    <FormItem key={agent.id} className="flex flex-row items-start space-x-3 space-y-0">
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={field.value?.includes(agent.id)}
                                                                onCheckedChange={(checked) => (
                                                                    checked
                                                                        ? field.onChange([...(field.value || []), agent.id])
                                                                        : field.onChange(field.value?.filter((value) => value !== agent.id))
                                                                )}
                                                            />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">{agent.name}</FormLabel>
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
                            <DialogClose asChild><Button type="button" variant="ghost">{t('manageTemplates.cancelButton')}</Button></DialogClose>
                            <Button type="submit" disabled={createMutation.isPending || !form.formState.isValid}>
                                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
    const { t } = useLocalization();
    const { firebaseUser } = useAuth();
    
    const { data: templates, isLoading, isError } = useQuery({
        queryKey: templateKeys.reports(),
        queryFn: async () => {
            if (!firebaseUser) return [];
            const { fetchReportTemplates } = await import('@/services/template-service');
            return fetchReportTemplates();
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
                    <CardTitle>{t('manageTemplates.reportTitle')}</CardTitle>
                    <CardDescription>
                        {t('manageTemplates.reportDescription')}
                    </CardDescription>
                </div>
                 <CreateTemplateDialog />
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    {templates?.map(template => {
                        return (
                        <AccordionItem value={template.id} key={template.id}>
                            <AccordionTrigger>{t(template.name)}</AccordionTrigger>
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
                    )})}
                </Accordion>
            </CardContent>
        </Card>
    );
}
