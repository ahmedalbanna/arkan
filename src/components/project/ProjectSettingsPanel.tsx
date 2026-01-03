

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
import Image from 'next/image';
import { Label } from '../ui/label';
import { CustomSelect } from '../ui/CustomSelect';
import { useImageUpload } from '@/hooks/core/useImageUpload';

const settingsSchema = z.object({
  name: z.string().min(1, 'Project name is required.'),
  projectDescription: z.string().optional(),
  projectType: z.string().optional(),
  specialization: z.string().optional(),
  university: z.string().optional(),
  supervisor: z.string().optional(),
  course: z.string().optional(),
  educationalLevel: z.string().optional(),
  teamMembers: z.string().optional(), // Keep as string for form, convert on submit
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

const projectTypeOptions = ["Graduation Project", "Research Paper", "Business Proposal", "Software Documentation"];
const specializationOptions = ["Artificial Intelligence", "Web Development", "Data Science", "Cybersecurity", "Marketing"];
const educationalLevelOptions = ["Diploma", "Bachelor's Degree", "Master's Degree", "Doctorate"];

export function ProjectSettingsPanel() {
  const { project, updateProject } = useBuilderStore();
  const { toast } = useToast();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const { isUploading, handleFileUpload } = useImageUpload();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: '',
      projectDescription: '',
      projectType: '',
      specialization: '',
      university: '',
      supervisor: '',
      course: '',
      educationalLevel: '',
      teamMembers: '',
    }
  });

  useEffect(() => {
    if (project) {
      form.reset({
        name: project.name || '',
        projectDescription: project.projectDescription || '',
        projectType: project.projectType || '',
        specialization: project.specialization || '',
        university: project.university || '',
        supervisor: project.supervisor || '',
        course: project.course || '',
        educationalLevel: project.educationalLevel || '',
        teamMembers: project.teamMembers?.join(', ') || '',
      });
      setLogoPreview(project.logoUrl || null);
    }
  }, [project, form]);

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file, (dataUri) => {
        updateProject(p => {
          p.logoUrl = dataUri;
        });
        setLogoPreview(dataUri);
      });
    }
  };

  const handleBlur = () => {
    const data = form.getValues();
    const teamMembersArray = data.teamMembers?.split(',').map(name => name.trim()).filter(Boolean);
    updateProject(p => {
      Object.assign(p, { ...data, teamMembers: teamMembersArray });
    });
  };

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
                      disabled={isUploading}
                    />
                    {isUploading ? (
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
                  <FormItem><FormLabel>Project Name</FormLabel><FormControl><Input {...field} onBlur={handleBlur} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="projectDescription" render={({ field }) => (
                  <FormItem><FormLabel>Project Description</FormLabel><FormControl><Textarea {...field} rows={3} onBlur={handleBlur} /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="projectType" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Type</FormLabel>
                      <FormControl>
                        <CustomSelect
                          value={field.value || ''}
                          onChange={(value) => { field.onChange(value); handleBlur(); }}
                          options={projectTypeOptions}
                          placeholder="Select or type project type"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                   <FormField control={form.control} name="specialization" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Specialization</FormLabel>
                             <FormControl>
                                <CustomSelect
                                  value={field.value || ''}
                                  onChange={(value) => { field.onChange(value); handleBlur(); }}
                                  options={specializationOptions}
                                  placeholder="Select or type specialization"
                                />
                              </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="university" render={({ field }) => (
                        <FormItem><FormLabel>University</FormLabel><FormControl><Input {...field} onBlur={handleBlur} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="supervisor" render={({ field }) => (
                        <FormItem><FormLabel>Supervisor</FormLabel><FormControl><Input {...field} onBlur={handleBlur} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="course" render={({ field }) => (
                      <FormItem><FormLabel>Course</FormLabel><FormControl><Input {...field} onBlur={handleBlur} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={form.control} name="educationalLevel" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Educational Level</FormLabel>
                             <FormControl>
                                <CustomSelect
                                  value={field.value || ''}
                                  onChange={(value) => { field.onChange(value); handleBlur(); }}
                                  options={educationalLevelOptions}
                                  placeholder="Select or type level"
                                />
                              </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
                
                <div className="space-y-2">
                  <FormField control={form.control} name="teamMembers" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team Members</FormLabel>
                      <FormControl><Textarea {...field} rows={2} placeholder="Enter names, separated by commas..." onBlur={handleBlur} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

              </div>
            </ScrollArea>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
