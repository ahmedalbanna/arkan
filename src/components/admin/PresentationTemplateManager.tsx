
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { templateKeys, useUpdatePresentationTemplate, useCreatePresentationTemplate, useDeletePresentationTemplate } from '@/hooks/use-templates';
import { type PresentationGenerationTemplate } from '@/services/template-service';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Button } from '../ui/button';
import { Loader2, Save, PlusCircle, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { AGENTS } from '@/lib/agents';
import { Skeleton } from '../ui/skeleton';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogClose, DialogFooter } from '../ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { PRESENTATION_GENERATION_TEMPLATES } from '@/lib/presentation-generation-templates';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';

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


const reportAgents = AGENTS.filter(a => a.category === 'Report Generation');


function PresentationTemplateForm({ template, onSave, isSaving }: { template: PresentationGenerationTemplate, onSave: (data: PresentationFormValues) => void, isSaving: boolean }) {
    const form = useForm<PresentationFormValues>({
        resolver: zodResolver(presentationTemplateSchema),
        defaultValues: {
            ...template,
            relevantReportSectionIds: template.relevantReportSectionIds || [],
        },
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
                    name="relevantReportSectionIds"
                    render={() => (
                        <FormItem>
                            <div className="mb-4">
                                <FormLabel className="text-base">Relevant Report Sections</FormLabel>
                                <p className="text-sm text-muted-foreground">Select which report sections are most relevant for this presentation type.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {reportAgents.map((agent) => (
                                    <FormField
                                        key={agent.id}
                                        control={form.control}
                                        name="relevantReportSectionIds"
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

function CreatePresentationTemplateDialog() {
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();
    const createMutation = useCreatePresentationTemplate();
    
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
                 if (error.errors) {
                    for (const key in error.errors) {
                        form.setError(key as keyof CreatePresentationFormValues, { message: error.errors[key][0] });
                    }
                } else {
                    toast({ title: 'Error', description: error.message, variant: 'destructive' });
                }
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="sm"><PlusCircle className="mr-2 h-4 w-4" />Create New</Button>
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
                                        {reportAgents.map((agent) => (
                                            <FormField key={agent.id} control={form.control} name="relevantReportSectionIds"
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
                            <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                            <Button type="submit" disabled={createMutation.isPending}>
                                {createMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
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
    const { firebaseUser } = useAuth();
    
    const { data: templates, isLoading, isError } = useQuery({
        queryKey: templateKeys.presentations(),
        queryFn: async () => {
            if (!firebaseUser) return [];
            const { fetchPresentationTemplates } = await import('@/services/template-service');
            return fetchPresentationTemplates();
        },
        enabled: !!firebaseUser,
    });

    const updateMutation = useUpdatePresentationTemplate();
    const deleteMutation = useDeletePresentationTemplate();

    const handleSave = async (data: PresentationFormValues) => {
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
                        const isDefault = PRESENTATION_GENERATION_TEMPLATES.some(t => t.id === template.id);
                        return (
                        <AccordionItem value={template.id} key={template.id}>
                            <div className="flex items-center justify-between">
                                <AccordionTrigger className="flex-1">{template.name}</AccordionTrigger>
                                {!isDefault && (
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                             <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                                                {deleteMutation.isPending && deleteMutation.variables === template.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>This action cannot be undone. This will permanently delete the "{template.name}" template.</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(template.id)}>Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                )}
                            </div>
                            <AccordionContent className="p-4 bg-muted/50 rounded-b-md">
                                <PresentationTemplateForm 
                                    template={template} 
                                    onSave={handleSave}
                                    isSaving={updateMutation.isPending && updateMutation.variables?.templateId === template.id}
                                />
                            </AccordionContent>
                        </AccordionItem>
                    )})}
                </Accordion>
            </CardContent>
        </Card>
    );
}
