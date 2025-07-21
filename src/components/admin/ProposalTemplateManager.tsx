
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { templateKeys } from '@/hooks/use-templates';
import { fetchProposalTemplates, updateProposalTemplate, type ProposalTemplate } from '@/services/template-service';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Button } from '../ui/button';
import { Loader2, Save } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { useToast } from '@/hooks/use-toast';

const proposalTemplateSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    prompt: z.string().min(1, "Prompt is required"),
    guidelines: z.array(z.string()).optional(),
});

type ProposalFormValues = z.infer<typeof proposalTemplateSchema>;

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

export function ProposalTemplateManager() {
    const { firebaseUser } = useAuth();
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const { data: templates, isLoading, isError } = useQuery({
        queryKey: templateKeys.proposals(),
        queryFn: fetchProposalTemplates,
        enabled: !!firebaseUser,
    });

    const mutation = useMutation({
        mutationFn: (variables: { template: ProposalFormValues, token: string }) => updateProposalTemplate(variables.template.id, variables.template, variables.token),
        onSuccess: (updatedTemplate) => {
            queryClient.invalidateQueries({ queryKey: templateKeys.proposals() });
            toast({ title: 'Success', description: `Template "${updatedTemplate.name}" updated successfully.`});
        },
        onError: (error: Error) => {
             toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    });

    const handleSave = async (data: ProposalFormValues) => {
        if (!firebaseUser) return;
        const token = await firebaseUser.getIdToken();
        mutation.mutate({ template: data, token });
    };

    if (isLoading) return <div><Loader2 className="animate-spin" /> Loading templates...</div>;
    if (isError) return <div>Error loading templates.</div>;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Proposal Generation Templates</CardTitle>
                <CardDescription>
                    Configure the templates used for generating project proposals. These settings control the prompts and guidelines provided to the AI.
                </CardDescription>
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
                                    isSaving={mutation.isPending && mutation.variables?.template.id === template.id}
                                />
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </CardContent>
        </Card>
    );
}
