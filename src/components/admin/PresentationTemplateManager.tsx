
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { templateKeys, useUpdatePresentationTemplate } from '@/hooks/use-templates';
import { fetchPresentationTemplates, type PresentationGenerationTemplate } from '@/services/template-service';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Button } from '../ui/button';
import { Loader2, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { AGENTS } from '@/lib/agents';
import { Skeleton } from '../ui/skeleton';

const presentationTemplateSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  primaryAgentId: z.string().default('generate-presentation'),
  relevantReportSectionIds: z.array(z.string()).optional(),
});

type PresentationFormValues = z.infer<typeof presentationTemplateSchema>;

const reportAgents = AGENTS.filter(a => a.category === 'Report Generation');


function PresentationTemplateSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full mt-2" />
            </CardHeader>
            <CardContent className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </CardContent>
        </Card>
    )
}


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

export function PresentationTemplateManager() {
    const { firebaseUser } = useAuth();
    
    const { data: templates, isLoading, isError } = useQuery({
        queryKey: templateKeys.presentations(),
        queryFn: fetchPresentationTemplates,
        enabled: !!firebaseUser,
    });

    const mutation = useUpdatePresentationTemplate();

    const handleSave = async (data: PresentationFormValues) => {
        mutation.mutate({ templateId: data.id, data });
    };

    if (isLoading) return <PresentationTemplateSkeleton />;
    if (isError) return <div>Error loading templates.</div>;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Presentation Generation Templates</CardTitle>
                <CardDescription>
                   Configure the content structure for different types of presentations.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    {templates?.map(template => (
                        <AccordionItem value={template.id} key={template.id}>
                            <AccordionTrigger>{template.name}</AccordionTrigger>
                            <AccordionContent className="p-4 bg-muted/50 rounded-b-md">
                                <PresentationTemplateForm 
                                    template={template} 
                                    onSave={handleSave}
                                    isSaving={mutation.isPending && mutation.variables?.templateId === template.id}
                                />
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </CardContent>
        </Card>
    );
}
