
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useBuilderStore, useToast } from '@/hooks';
import { Loader2, UploadCloud } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { projectKeys } from '@/lib/query-keys';

const settingsSchema = z.object({
  name: z.string().min(1, 'Project name is required.'),
  projectDescription: z.string().optional(),
  projectType: z.string().optional(),
  specialization: z.string().optional(),
  studentName: z.string().optional(),
  studentId: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  university: z.string().optional(),
  supervisor: z.string().optional(),
  course: z.string().optional(),
  teamMembers: z.string().optional(), // Will be handled as a comma-separated string
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

async function uploadLogoApi(variables: { projectId: string; file: File; token: string }) {
    const formData = new FormData();
    formData.append('file', variables.file);

    const response = await fetch(`/api/project/${variables.projectId}/upload-logo`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${variables.token}` },
        body: formData,
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload logo.');
    }
    return response.json();
}

export function ProjectSettingsPanel() {
  const { project, updateProject, setHasUnsavedChanges } = useBuilderStore();
  const { firebaseUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: '', projectDescription: '', projectType: '', specialization: '',
      studentName: '', studentId: '', country: '', city: '',
      university: '', supervisor: '', course: '', teamMembers: '',
    }
  });

  useEffect(() => {
    if (project) {
        form.reset({
            name: project.name || '',
            projectDescription: project.projectDescription || '',
            projectType: project.projectType || '',
            specialization: project.specialization || '',
            studentName: project.studentName || '',
            studentId: project.studentId || '',
            country: project.country || '',
            city: project.city || '',
            university: project.university || '',
            supervisor: project.supervisor || '',
            course: project.course || '',
            teamMembers: project.teamMembers?.join(', ') || '',
        });
        if (project.logoUrl) {
            setLogoPreview(project.logoUrl);
        } else {
            setLogoPreview(null);
        }
    }
  }, [project, form]);

  const logoUploadMutation = useMutation({
    mutationFn: uploadLogoApi,
    onSuccess: (data) => {
        updateProject(p => p.with({ logoUrl: data.logoUrl }).generateCoverPageMarkdown());
        setHasUnsavedChanges(true);
        toast({ title: 'Logo Uploaded', description: 'Your project logo has been updated.' });
        queryClient.invalidateQueries({ queryKey: projectKeys.detail(project?.id || '') });
    },
    onError: (error: Error) => {
        toast({ title: 'Upload Failed', description: error.message, variant: 'destructive' });
    }
  });

  const handleLogoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && project && firebaseUser) {
        setLogoPreview(URL.createObjectURL(file));
        const token = await firebaseUser.getIdToken();
        logoUploadMutation.mutate({ projectId: project.id, file, token });
    }
  };

  const onSubmit = (data: SettingsFormValues) => {
    updateProject(p => p
        .with({
            ...data,
            teamMembers: data.teamMembers ? data.teamMembers.split(',').map(s => s.trim()).filter(Boolean) : [],
        })
        .generateCoverPageMarkdown()
    );
    setHasUnsavedChanges(true);
  };

  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
        if(type === 'change') {
            form.handleSubmit(onSubmit)();
        }
    });
    return () => subscription.unsubscribe();
  }, [form, onSubmit]);

  return (
    <Card className="h-full flex flex-col border-0 shadow-none">
      <CardHeader>
        <CardTitle>Project Settings</CardTitle>
        <CardDescription>
            Manage the metadata for your project. This information will automatically update the cover page.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
          <Form {...form}>
            <form className="space-y-4 h-full flex flex-col">
              <ScrollArea className="flex-grow pr-4 -mr-4">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Project Logo</Label>
                        <div className="relative flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary">
                            <input
                                type="file"
                                accept="image/png, image/jpeg, image/svg+xml"
                                onChange={handleLogoChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                disabled={logoUploadMutation.isPending}
                            />
                            {logoUploadMutation.isPending ? (
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            ) : logoPreview ? (
                                <Image src={logoPreview} alt="Logo preview" layout="fill" objectFit="contain" className="p-2" />
                            ) : (
                                <div className="text-center text-muted-foreground">
                                    <UploadCloud className="w-8 h-8 mx-auto" />
                                    <p className="text-sm mt-1">Click to upload or drag & drop</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Project Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="projectDescription" render={({ field }) => (
                    <FormItem><FormLabel>Project Description</FormLabel><FormControl><Textarea {...field} rows={3} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="projectType" render={({ field }) => (
                            <FormItem><FormLabel>Project Type</FormLabel><FormControl><Input {...field} placeholder="e.g., Graduation Project, Research Paper" /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="specialization" render={({ field }) => (
                            <FormItem><FormLabel>Specialization</FormLabel><FormControl><Input {...field} placeholder="e.g., Artificial Intelligence" /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="studentName" render={({ field }) => (
                        <FormItem><FormLabel>Student Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="studentId" render={({ field }) => (
                        <FormItem><FormLabel>Student ID</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="country" render={({ field }) => (
                            <FormItem><FormLabel>Country</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="city" render={({ field }) => (
                            <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                    <FormField control={form.control} name="university" render={({ field }) => (
                    <FormItem><FormLabel>University</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="supervisor" render={({ field }) => (
                        <FormItem><FormLabel>Supervisor</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="course" render={({ field }) => (
                        <FormItem><FormLabel>Course</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    </div>
                    <FormField control={form.control} name="teamMembers" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Team Members</FormLabel>
                        <FormControl><Input {...field} placeholder="Separate names with commas" /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )} />
                </div>
              </ScrollArea>
            </form>
          </Form>
      </CardContent>
    </Card>
  );
}
