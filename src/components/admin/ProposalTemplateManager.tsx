
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { templateKeys, useUpdateProposalTemplate, useCreateProposalTemplate } from '@/hooks/use-templates';
import { fetchProposalTemplates, type ProposalTemplate } from '@/services/template-service';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Button } from '../ui/button';
import { Loader2, Save, PlusCircle } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogClose } from '../ui/dialog';
import { useState } from 'react';

const proposalTemplateSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    prompt: z.string().min(1, "Prompt is required"),
    guidelines: z.array(z.string()).optional(),
});

type ProposalFormValues = z.infer<typeof proposalTemplateSchema>;

const createProposalTemplateSchema = proposalTemplateSchema.omit({ id: true }).extend({
    id: z.string().min(3, "ID must be at least 3 characters").regex(/^[a-z0-9-]+$/, "ID can only contain lowercase letters, numbers, and hyphens."),
});
type CreateProposalFormValues = z.infer<typeof createProposalTemplateSchema>;


function ProposalTemplateForm({ template, onSave, isSaving }: { template: ProposalTemplate, onSave: (data: ProposalFormValues) => void, isSaving: boolean }) {
    const form = useForm<ProposalFormValues>({
        resolver: zodResolver(proposalTemplateSchema),
        defaultValues: {
            ...template,
            guidelines: template.guidelines || [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "guidelines",
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
                 <FormField control={form.control} name="prompt" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Base Prompt</FormLabel>
                        <FormControl><Textarea {...field} disabled={isSaving} rows={8} className="font-mono text-xs" /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                 <div>
                    <FormLabel>Guidelines</FormLabel>
                    <div className="space-y-2 mt-2">
                        {fields.map((field, index) => (
                            <div key={field.id} className="flex items-center gap-2">
                                <FormField control={form.control} name={`guidelines.${index}`} render={({ field }) => (
                                    <Input {...field} disabled={isSaving} />
                                )} />
                                <Button type="button" variant="destructive" size="sm" onClick={() => remove(index)}>Remove</Button>
                            </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={() => append("")}>Add Guideline</Button>
                    </div>
                </div>

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
        name: "guidelines",
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
                                        <FormField control={form.control} name={`guidelines.${index}`} render={({ field }) => (
                                            <Input {...field} disabled={createMutation.isPending} />
                                        )} />
                                        <Button type="button" variant="destructive" size="sm" onClick={() => remove(index)}>Remove</Button>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" size="sm" onClick={() => append("")}>Add Guideline</Button>
                            </div>
                        </div>

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


export function ProposalTemplateManager() {
    const { firebaseUser } = useAuth();
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const { data: templates, isLoading, isError } = useQuery({
        queryKey: templateKeys.proposals(),
        queryFn: fetchProposalTemplates,
        enabled: !!firebaseUser,
    });

    const updateMutation = useUpdateProposalTemplate();

    const handleSave = async (data: ProposalFormValues) => {
        updateMutation.mutate({ templateId: data.id, data });
    };

    if (isLoading) return <Skeleton className="h-48 w-full" />;
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
                    {templates?.map(template => (
                        <AccordionItem value={template.id} key={template.id}>
                            <AccordionTrigger>{template.name}</AccordionTrigger>
                            <AccordionContent className="p-4 bg-muted/50 rounded-b-md">
                                <ProposalTemplateForm 
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
