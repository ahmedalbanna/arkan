
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { templateKeys, useUpdateReportTemplate, useCreateReportTemplate } from '@/hooks/use-templates';
import { type ReportGenerationTemplate } from '@/services/template-service';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Button } from '../ui/button';
import { Loader2, Save, PlusCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { AGENTS } from '@/lib/agents';
import { Checkbox } from '../ui/checkbox';
import { Skeleton } from '../ui/skeleton';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogClose } from '../ui/dialog';
import { handleErrorUtility } from '@/lib/errorUtils';


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


function ReportTemplateForm({ template, onSave, isSaving }: { template: ReportGenerationTemplate, onSave: (data: ReportFormValues) => void, isSaving: boolean }) {
    const form = useForm<ReportFormValues>({
        resolver: zodResolver(reportTemplateSchema),
        defaultValues: template,
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
                 <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Template Name</FormLabel>
                        <FormControl><Input {...field} disabled={isSaving} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                 <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl><Textarea {...field} disabled={isSaving} rows={2} /></FormControl>
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
                <div className="flex justify-end">
                    <Button type="submit" disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Changes
                    </Button>
                </div>
            </form>
        </Form>
    );
}

function CreateReportTemplateDialog() {
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
        }
    });

     const handleSave = (data: CreateReportFormValues) => {
        createMutation.mutate(data, {
            onSuccess: () => {
                toast({ title: 'Success', description: 'New report template created.' });
                setIsOpen(false);
                form.reset();
            },
             onError: (error: any) => {
                 if (error.errors) {
                    for (const key in error.errors) {
                        form.setError(key as keyof CreateReportFormValues, { message: error.errors[key][0] });
                    }
                } else {
                    toast({ title: 'Error', description: error.message, variant: 'destructive' });
                }
            }
        });
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="sm"><PlusCircle className="mr-2 h-4 w-4" />Create New</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Report Template</DialogTitle>
                    <DialogDescription>
                        Define a new template for generating reports.
                    </DialogDescription>
                </DialogHeader>
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
                         <FormField control={form.control} name="id" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Template ID</FormLabel>
                                <FormControl><Input {...field} placeholder="e.g., quarterly-review" disabled={createMutation.isPending} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                         <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Template Name</FormLabel>
                                <FormControl><Input {...field} placeholder="e.g., Quarterly Review" disabled={createMutation.isPending} /></FormControl>
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
                            name="agentIds"
                            render={() => (
                                <FormItem>
                                    <FormLabel className="text-base">Included Report Sections</FormLabel>
                                    <div className="grid grid-cols-2 gap-4">
                                        {reportAgents.map((agent) => (
                                            <FormField key={agent.id} control={form.control} name="agentIds"
                                                render={({ field }) => (
                                                    <FormItem key={agent.id} className="flex flex-row items-start space-x-3 space-y-0">
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={field.value?.includes(agent.id)}
                                                                onCheckedChange={(checked) => (
                                                                    checked
                                                                        ? field.onChange([...field.value, agent.id])
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
                        <div className="flex justify-end gap-2">
                            <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                            <Button type="submit" disabled={createMutation.isPending}>
                                {createMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Create
                            </Button>
                        </div>
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

    const handleSave = (data: ReportFormValues) => {
        updateMutation.mutate({ templateId: data.id, data });
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
                    {templates?.map(template => (
                        <AccordionItem value={template.id} key={template.id}>
                            <AccordionTrigger>{template.name}</AccordionTrigger>
                            <AccordionContent className="p-4 bg-muted/50 rounded-b-md">
                                <ReportTemplateForm 
                                    template={template} 
                                    onSave={handleSave}
                                    isSaving={updateMutation.isPending && updateMutation.variables?.templateId === template.id}
                                />
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </CardContent>
        </Card>
    );
}
