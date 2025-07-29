
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { templateKeys, useUpdateProposalTemplate, useCreateProposalTemplate, useDeleteProposalTemplate } from '@/hooks/use-templates';
import { fetchProposalTemplates, type ProposalTemplate } from '@/services/template-service';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../ui/accordion';
import { Button } from '../../ui/button';
import { Loader2, Save, PlusCircle, Trash2 } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../ui/form';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../../ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogClose, DialogFooter } from '../../ui/dialog';
import { useState } from 'react';
import { PROPOSAL_TEMPLATES } from '@/lib/proposal-templates';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../ui/alert-dialog';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';

const ReactJson = dynamic(() => import('@microlink/react-json-view'), { ssr: false });


const proposalTemplateSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    prompt: z.string().min(1, "Prompt is required"),
    guidelines: z.array(z.string()).optional(),
    jsonStructure: z.any().optional(),
});

type ProposalFormValues = z.infer<typeof proposalTemplateSchema>;

const createProposalTemplateSchema = proposalTemplateSchema.omit({ id: true }).extend({
    id: z.string().min(3, "ID must be at least 3 characters").regex(/^[a-z0-9-]+$/, "ID can only contain lowercase letters, numbers, and hyphens."),
});
type CreateProposalFormValues = z.infer<typeof createProposalTemplateSchema>;


function ProposalTemplateForm({ template, onSave, isSaving, onDelete, isDeleting }: { template: ProposalTemplate, onSave: (data: ProposalFormValues) => void, isSaving: boolean, onDelete: () => void, isDeleting: boolean }) {
    const { resolvedTheme } = useTheme();
    const form = useForm<ProposalFormValues>({
        resolver: zodResolver(proposalTemplateSchema),
        defaultValues: {
            ...template,
            guidelines: template.guidelines || [],
            jsonStructure: template.jsonStructure || {},
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "guidelines" as never,
    });

    const isDefaultTemplate = PROPOSAL_TEMPLATES.some(t => t.id === template.id);

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
                 <FormField control={form.control} name="prompt" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Base Prompt</FormLabel>
                        <FormControl><Textarea {...field} disabled={isSaving || isDeleting} rows={8} className="font-mono text-xs" /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                 <div>
                    <FormLabel>Guidelines</FormLabel>
                    <div className="space-y-2 mt-2">
                        {fields.map((field, index) => (
                            <div key={field.id} className="flex items-center gap-2">
                                <FormField control={form.control} name={`guidelines.${index}` as any} render={({ field }) => (
                                    <Input {...field} disabled={isSaving || isDeleting} />
                                )} />
                                <Button type="button" variant="destructive" size="sm" onClick={() => remove(index)} disabled={isSaving || isDeleting}>Remove</Button>
                            </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={() => append("")} disabled={isSaving || isDeleting}>Add Guideline</Button>
                    </div>
                </div>
                 <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="json-structure">
                        <AccordionTrigger>JSON Structure</AccordionTrigger>
                        <AccordionContent>
                             <div className="p-2 border rounded-md bg-background">
                                 <ReactJson 
                                    src={template.jsonStructure || {}} 
                                    theme={resolvedTheme === 'dark' ? 'monokai' : 'rjv-default'}
                                    displayDataTypes={false}
                                    name={false}
                                    collapsed={2}
                                />
                             </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>


                <div className="flex justify-end gap-2">
                     {!isDefaultTemplate && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" type="button" disabled={isSaving || isDeleting}>
                                    {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
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
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Changes
                    </Button>
                </div>
            </form>
        </Form>
    );
}

function CreateProposalTemplateDialog() {
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();
    const createMutation = useCreateProposalTemplate();

    const form = useForm<CreateProposalFormValues>({
        resolver: zodResolver(createProposalTemplateSchema),
        defaultValues: {
            id: '',
            name: '',
            description: '',
            prompt: '',
            guidelines: [],
        }
    });

     const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "guidelines" as never,
    });

    const handleSave = (data: CreateProposalFormValues) => {
        createMutation.mutate(data, {
            onSuccess: () => {
                toast({ title: 'Success', description: 'New proposal template created.' });
                setIsOpen(false);
                form.reset();
            },
            onError: (error: any) => {
                 if (error.errors) {
                    // Set form errors from server validation
                    for (const key in error.errors) {
                        form.setError(key as keyof CreateProposalFormValues, { message: error.errors[key][0] });
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
                    <DialogTitle>Create Proposal Template</DialogTitle>
                    <DialogDescription>
                        Define a new template for generating project proposals.
                    </DialogDescription>
                </DialogHeader>
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
                        <FormField control={form.control} name="id" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Template ID</FormLabel>
                                <FormControl><Input {...field} placeholder="e.g., my-custom-template" disabled={createMutation.isPending} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Template Name</FormLabel>
                                <FormControl><Input {...field} placeholder="e.g., My Custom Template" disabled={createMutation.isPending} /></FormControl>
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
                        <FormField control={form.control} name="prompt" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Base Prompt</FormLabel>
                                <FormControl><Textarea {...field} disabled={createMutation.isPending} rows={5} className="font-mono text-xs" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                         <div>
                            <FormLabel>Guidelines</FormLabel>
                            <div className="space-y-2 mt-2">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex items-center gap-2">
                                        <FormField control={form.control} name={`guidelines.${index}` as any} render={({ field }) => (
                                            <Input {...field} disabled={createMutation.isPending} />
                                        )} />
                                        <Button type="button" variant="destructive" size="sm" onClick={() => remove(index)}>Remove</Button>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" size="sm" onClick={() => append("")}>Add Guideline</Button>
                            </div>
                        </div>

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


export function ProposalTemplateManager() {
    const { firebaseUser } = useAuth();
    const { toast } = useToast();

    const { data: templates, isLoading, isError } = useQuery({
        queryKey: templateKeys.proposals(),
        queryFn: fetchProposalTemplates,
        enabled: !!firebaseUser,
    });

    const updateMutation = useUpdateProposalTemplate();
    const deleteMutation = useDeleteProposalTemplate();

    const handleSave = async (data: ProposalFormValues) => {
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
                    <CardTitle>Proposal Generation Templates</CardTitle>
                    <CardDescription>
                        Configure the templates used for generating project proposals. These settings control the prompts and guidelines provided to the AI.
                    </CardDescription>
                </div>
                <CreateProposalTemplateDialog />
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    {templates?.map(template => {
                        return (
                        <AccordionItem value={template.id} key={template.id}>
                           <div className="flex items-center justify-between">
                                <AccordionTrigger className="flex-1">{template.name}</AccordionTrigger>
                            </div>
                            <AccordionContent className="p-4 bg-muted/50 rounded-b-md">
                                <ProposalTemplateForm 
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
