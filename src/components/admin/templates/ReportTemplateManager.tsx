
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { templateKeys, useUpdateReportTemplate, useCreateReportTemplate, useDeleteReportTemplate, useReportTemplates } from '@/hooks/use-templates';
import { type ReportGenerationTemplate } from '@/services/template-service';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Loader2, Save, PlusCircle, Trash2, Check, X, Search, Plus } from 'lucide-react';
import { useForm, ControllerRenderProps } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { AGENTS } from '@/lib/agents';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { handleErrorUtility } from '@/lib/errorUtils';
import { REPORT_GENERATION_TEMPLATES } from '@/lib/report-generation-templates';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAgents } from '@/hooks/use-agents';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLocalization } from '@/context/LocalizationContext';
import { Label } from '@/components/ui/label';
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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


const reportAgents = AGENTS.filter(a => a.category === 'Report Generation');


function ReportTemplateForm({ template, onSave, isSaving, onDelete, isDeleting }: { template: ReportGenerationTemplate, onSave: (data: ReportFormValues) => void, isSaving: boolean, onDelete: () => void, isDeleting: boolean }) {
    const {t} = useLocalization();
    const { agents, isLoaded } = useAgents();
    const [searchTerm, setSearchTerm] = useState('');

    const form = useForm<ReportFormValues>({
        resolver: zodResolver(reportTemplateSchema),
        defaultValues: template,
    });

    const isDefaultTemplate = REPORT_GENERATION_TEMPLATES.some(t => t.id === template.id);
    const selectedAgentIds = form.watch('agentIds') || [];

    const handleSelectAgent = (agentId: string, isSelected: boolean) => {
        const currentIds = form.getValues('agentIds');
        if (isSelected) {
            form.setValue('agentIds', currentIds.filter(id => id !== agentId));
        } else {
            form.setValue('agentIds', [...currentIds, agentId]);
        }
    };

    const selectedAgents = useMemo(() =>
        (agents || []).filter(agent => selectedAgentIds.includes(agent.id)),
    [agents, selectedAgentIds]);

    const availableAgents = useMemo(() =>
        (agents || []).filter(agent =>
            agent.category === 'Report Generation' &&
            !selectedAgentIds.includes(agent.id) &&
            agent.name.toLowerCase().includes(searchTerm.toLowerCase())
        ),
    [agents, selectedAgentIds, searchTerm]);


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
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>{t('manageTemplates.reportDialog.includedAgentsLabel')} ({selectedAgents.length})</Label>
                        <ScrollArea className="h-48 rounded-md border p-2">
                            {selectedAgents.map(agent => (
                                <div key={agent.id} className="flex items-center justify-between p-1 text-sm">
                                    <span>{agent.name}</span>
                                    <Button type="button" size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleSelectAgent(agent.id, true)}>
                                        <X className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                        </ScrollArea>
                    </div>
                    <div className="space-y-2">
                         <Label>{t('manageTemplates.reportDialog.availableAgentsLabel')}</Label>
                         <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder={t('manageTemplates.reportDialog.searchPlaceholder')} className="pl-8 h-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                         </div>
                         <ScrollArea className="h-40 rounded-md border p-2">
                              {availableAgents.map(agent => (
                                <div key={agent.id} className="flex items-center justify-between p-1 text-sm">
                                    <span className="truncate">{agent.name}</span>
                                    <Button type="button" size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleSelectAgent(agent.id, false)}>
                                        <Plus className="h-4 w-4 text-green-600" />
                                    </Button>
                                </div>
                            ))}
                         </ScrollArea>
                    </div>
                 </div>
                 <FormMessage>{form.formState.errors.agentIds?.message}</FormMessage>

                <div className="flex justify-end gap-2">
                     {!isDefaultTemplate && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" type="button" disabled={isSaving || isDeleting}>
                                    {isDeleting ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Trash2 className="me-2 h-4 w-4" />}
                                    {t('manageTemplates.proposalDialog.deleteButton')}
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
                        {isSaving ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Save className="me-2 h-4 w-4" />}
                        {t('manageTemplates.proposalDialog.saveButton')}
                    </Button>
                </div>
            </form>
        </Form>
    );
}

function CreateReportTemplateDialog() {
    const { t } = useLocalization();
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();
    const createMutation = useCreateReportTemplate();
    
    const form = useForm<CreateReportFormValues>({
        resolver: zodResolver(createReportTemplateSchema),
        defaultValues: {
            id: '',
            name: '',
            description: '',
            agentIds: [],
        },
    });

    const handleSave = (data: CreateReportFormValues) => {
        createMutation.mutate(data, {
            onSuccess: () => {
                toast({ title: t('manageTemplates.createSuccessToast.title'), description: t('manageTemplates.createSuccessToast.reportDesc') });
                setIsOpen(false);
                form.reset();
            },
            onError: (error: any) => {
                if (error.errors) {
                    for (const key in error.errors) {
                        form.setError(key as keyof CreateReportFormValues, { message: error.errors[key][0] });
                    }
                } else {
                    handleErrorUtility(error, "Failed to create template.");
                }
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="sm"><PlusCircle className="me-2 h-4 w-4" />{t('manageTemplates.createButton')}</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('manageTemplates.reportDialog.title')}</DialogTitle>
                    <DialogDescription>{t('manageTemplates.reportDialog.description')}</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
                        <FormField control={form.control} name="id" render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('manageTemplates.createDialog.idLabel')}</FormLabel>
                                <FormControl><Input {...field} placeholder={t('manageTemplates.reportDialog.idPlaceholder')} disabled={createMutation.isPending} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('manageTemplates.createDialog.nameLabel')}</FormLabel>
                                <FormControl><Input {...field} placeholder={t('manageTemplates.reportDialog.namePlaceholder')} disabled={createMutation.isPending} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('manageTemplates.createDialog.descriptionLabel')}</FormLabel>
                                <FormControl><Textarea {...field} placeholder={t('manageTemplates.reportDialog.descriptionPlaceholder')} rows={2} disabled={createMutation.isPending} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField
                            control={form.control}
                            name="agentIds"
                            render={() => (
                                <FormItem>
                                    <FormLabel className="text-base">{t('manageTemplates.reportDialog.includedAgentsLabel')}</FormLabel>
                                    <ScrollArea className="h-48 w-full rounded-md border p-4">
                                        {reportAgents.map((agent) => (
                                            <FormField
                                                key={agent.id}
                                                control={form.control}
                                                name="agentIds"
                                                render={({ field }) => {
                                                    return (
                                                        <FormItem key={agent.id} className="flex flex-row items-center space-x-3 space-y-0 mb-2">
                                                            <FormControl>
                                                                <Checkbox
                                                                    checked={field.value?.includes(agent.id)}
                                                                    onCheckedChange={(checked) => {
                                                                        return checked
                                                                            ? field.onChange([...(field.value || []), agent.id])
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
                                    </ScrollArea>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <DialogFooter>
                            <DialogClose asChild><Button type="button" variant="secondary">{t('manageTemplates.cancelButton')}</Button></DialogClose>
                            <Button type="submit" disabled={createMutation.isPending}>
                                {createMutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Save className="me-2 h-4 w-4" />}
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
    if (isError) return <div>{t('team.errorLoading')}</div>;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>{t('manageTemplates.reportTitle')}</CardTitle>
                    <CardDescription>
                        {t('manageTemplates.reportDescription')}
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
                    )})}
                </Accordion>
            </CardContent>
        </Card>
    );
}
