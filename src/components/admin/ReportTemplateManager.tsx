
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { templateKeys } from '@/hooks/use-templates';
import { fetchReportTemplates, updateReportTemplate, type ReportGenerationTemplate } from '@/services/template-service';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
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
import { AGENTS } from '@/lib/agents';
import { Checkbox } from '../ui/checkbox';

const reportTemplateSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  agentIds: z.array(z.string()).min(1, "At least one agent must be selected."),
});

type ReportFormValues = z.infer<typeof reportTemplateSchema>;

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

export function ReportTemplateManager() {
    const { firebaseUser } = useAuth();
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const { data: templates, isLoading, isError } = useQuery({
        queryKey: templateKeys.reports(),
        queryFn: fetchReportTemplates,
        enabled: !!firebaseUser,
    });

    const mutation = useMutation({
        mutationFn: (variables: { template: ReportFormValues, token: string }) => updateReportTemplate(variables.template.id, variables.template, variables.token),
        onSuccess: (updatedTemplate) => {
            queryClient.invalidateQueries({ queryKey: templateKeys.reports() });
            toast({ title: 'Success', description: `Template "${updatedTemplate.name}" updated successfully.`});
        },
        onError: (error: Error) => {
             toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    });

    const handleSave = async (data: ReportFormValues) => {
        if (!firebaseUser) return;
        const token = await firebaseUser.getIdToken();
        mutation.mutate({ template: data, token });
    };

    if (isLoading) return <div><Loader2 className="animate-spin" /> Loading templates...</div>;
    if (isError) return <div>Error loading templates.</div>;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Report Generation Templates</CardTitle>
                <CardDescription>
                   Configure which report sections are included in the "Generate Full Report" option.
                </CardDescription>
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
