
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { templateKeys, useUpdateReportTemplate, useCreateReportTemplate, useDeleteReportTemplate } from '@/hooks/use-templates';
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
import { useAgents, useAgentCategories } from '@/hooks/use-agents';
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


const reportAgents = AGENTS.filter(a => a.category === 'report-generation');


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
                 <FormField
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

function CreateTeamDialog() {
    const { t } = useLocalization();
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const { toast } = useToast();
    const { agents, isLoaded } = useAgents();
    const createMutation = useCreateReportTemplate();

    const reportGenerationAgents = useMemo(() =>
        (agents || []).filter(agent =>
            agent.name.toLowerCase().includes(searchTerm.toLowerCase())
        ),
    [agents, searchTerm]);

    const handleSelectAgent = (agentId: string) => {
        setSelectedAgentIds(prev =>
            prev.includes(agentId)
                ? prev.filter(id => id !== agentId)
                : [...prev, agentId]
        );
    };

    const handleCreate = () => {
        const data = {
            id: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
            name,
            description,
            agentIds: selectedAgentIds,
        };

        const validation = createReportTemplateSchema.safeParse(data);
        if (!validation.success) {
            toast({
                title: 'Validation Error',
                description: validation.error.errors.map(e => e.message).join('\n'),
                variant: 'destructive',
            });
            return;
        }

        createMutation.mutate(validation.data, {
            onSuccess: () => {
                toast({ title: t('manageTemplates.createSuccessToast.title'), description: t('manageTemplates.createSuccessToast.reportDesc') });
                setIsOpen(false);
                setName('');
                setDescription('');
                setSelectedAgentIds([]);
            },
            onError: (error: any) => {
                handleErrorUtility(error, "Failed to create template.");
            }
        });
    }

    const selectedAgents = agents.filter(agent => selectedAgentIds.includes(agent.id));
    const availableAgents = reportGenerationAgents.filter(agent => !selectedAgentIds.includes(agent.id));

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
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="team-name">{t('manageTemplates.createDialog.nameLabel')}</Label>
                        <Input id="team-name" placeholder={t('manageTemplates.reportDialog.namePlaceholder')} value={name} onChange={e => setName(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="team-description">{t('manageTemplates.createDialog.descriptionLabel')}</Label>
                        <Textarea id="team-description" placeholder={t('manageTemplates.reportDialog.descriptionPlaceholder')} value={description} onChange={e => setDescription(e.target.value)} rows={2} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>{t('manageTemplates.reportDialog.includedAgentsLabel')} ({selectedAgents.length})</Label>
                            <ScrollArea className="h-48 border rounded-md p-2">
                               {selectedAgents.map(agent => (
                                   <div key={agent.id} className="flex items-center justify-between p-1">
                                       <span>{agent.name}</span>
                                       <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleSelectAgent(agent.id)}><X className="h-4 w-4"/></Button>
                                   </div>
                               ))}
                            </ScrollArea>
                        </div>
                         <div className="space-y-2">
                            <Label>{t('manageTemplates.reportDialog.availableAgentsLabel')}</Label>
                            <ScrollArea className="h-48 border rounded-md p-2">
                                <div className="p-1"><Input placeholder={t('manageTemplates.reportDialog.searchPlaceholder')} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="h-8"/></div>
                                {isLoaded && availableAgents.map(agent => (
                                     <div key={agent.id} className="flex items-center justify-between p-1">
                                       <span>{agent.name}</span>
                                       <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleSelectAgent(agent.id)}><Plus className="h-4 w-4"/></Button>
                                   </div>
                                ))}
                                {!isLoaded && <Loader2 className="mx-auto animate-spin" />}
                            </ScrollArea>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="ghost">{t('manageTemplates.cancelButton')}</Button></DialogClose>
                    <Button onClick={handleCreate} disabled={createMutation.isPending || !name || selectedAgentIds.length === 0}>
                        {createMutation.isPending && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                        {t('manageTemplates.createButton')}
                    </Button>
                </DialogFooter>
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
                    <CardTitle>{t('manageTemplates.reportTitle')}</CardTitle>
                    <CardDescription>
                        {t('manageTemplates.reportDescription')}
                    </CardDescription>
                </div>
                 <CreateTeamDialog />
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
