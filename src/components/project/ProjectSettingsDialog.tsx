
'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useBuilderStore } from '@/hooks';
import { Loader2, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

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

interface ProjectSettingsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectSettingsDialog({ isOpen, onOpenChange }: ProjectSettingsDialogProps) {
  const { project, updateProject } = useBuilderStore();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    values: {
      name: project?.name || '',
      projectDescription: project?.projectDescription || '',
      projectType: project?.projectType || '',
      specialization: project?.specialization || '',
      studentName: project?.studentName || '',
      studentId: project?.studentId || '',
      country: project?.country || '',
      city: project?.city || '',
      university: project?.university || '',
      supervisor: project?.supervisor || '',
      course: project?.course || '',
      teamMembers: project?.teamMembers?.join(', ') || '',
    },
  });

  const onSubmit = (data: SettingsFormValues) => {
    updateProject(p => p.with({
      ...data,
      teamMembers: data.teamMembers ? data.teamMembers.split(',').map(s => s.trim()).filter(Boolean) : [],
    }));
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Project Settings</DialogTitle>
          <DialogDescription>
            Manage the metadata and general information for your project.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto px-1 py-4">
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
             <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" /> Save Settings
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

