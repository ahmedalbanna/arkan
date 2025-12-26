
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useBuilderStore } from '@/hooks';
import { Save } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useEffect } from 'react';

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

export function ProjectSettingsPanel() {
  const { project, updateProject, setHasUnsavedChanges } = useBuilderStore();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: '',
      projectDescription: '',
      projectType: '',
      specialization: '',
      studentName: '',
      studentId: '',
      country: '',
      city: '',
      university: '',
      supervisor: '',
      course: '',
      teamMembers: '',
    }
  });

  // Effect to reset the form whenever the project from the store changes
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
    }
  }, [project, form]);


  const onSubmit = (data: SettingsFormValues) => {
    updateProject(p => p
        .with({
            ...data,
            teamMembers: data.teamMembers ? data.teamMembers.split(',').map(s => s.trim()).filter(Boolean) : [],
        })
        // After updating metadata, regenerate the cover page markdown
        .generateCoverPageMarkdown()
    );
    setHasUnsavedChanges(true); // Mark as having changes to trigger autosave
  };

  // Automatically submit the form on any change to update the cover page in real-time
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
              {/* The save button is no longer necessary as changes are saved on edit */}
            </form>
          </Form>
      </CardContent>
    </Card>
  );
}
