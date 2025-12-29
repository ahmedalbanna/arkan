

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

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


function CustomSelect({
  value,
  onChange,
  options = [], // Add default empty array
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  options?: string[];
  placeholder: string;
}) {
  const [isCustom, setIsCustom] = useState(() => value && !(options || []).includes(value));

  useEffect(() => {
    if (value && !(options || []).includes(value)) {
      setIsCustom(true);
    } else {
      setIsCustom(false);
    }
  }, [value, options]);

  const handleSelectChange = (newValue: string) => {
    if (newValue === 'custom') {
      setIsCustom(true);
      onChange(''); // Clear the value when switching to custom input
    } else {
      setIsCustom(false);
      onChange(newValue);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  if (isCustom) {
    return (
      <Input
        value={value}
        onChange={handleInputChange}
        placeholder={`Enter custom ${placeholder.toLowerCase()}...`}
        onBlur={(e) => { if (!e.target.value) setIsCustom(false); }}
      />
    );
  }

  return (
    <Select value={value} onValueChange={handleSelectChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map(option => (
          <SelectItem key={option} value={option}>{option}</SelectItem>
        ))}
        <SelectItem value="custom">Custom...</SelectItem>
      </SelectContent>
    </Select>
  );
}

export function ProjectSettingsPanel() {
  const { project, updateProject, setHasUnsavedChanges } = useBuilderStore();
  const { toast } = useToast();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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
      if (project.logoUrl) {
        setLogoPreview(project.logoUrl);
      } else {
        setLogoPreview(null);
      }
    }
  }, [project, form]);

  const handleLogoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUri = e.target?.result as string;
        updateProject(p => p.with({ logoUrl: dataUri }).generateCoverPageMarkdown());
        setLogoPreview(dataUri);
        setHasUnsavedChanges(true);
        toast({ title: 'Logo Updated', description: 'Your project logo has been updated locally.' });
        setIsUploading(false);
      };
      reader.onerror = () => {
        toast({ title: 'Upload Failed', description: 'Could not read the image file.', variant: 'destructive' });
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: SettingsFormValues) => {
    const teamMembersArray = data.teamMembers?.split(',').map(name => name.trim()).filter(Boolean);
    updateProject(p =>
      p.with({ ...data, teamMembers: teamMembersArray }).generateCoverPageMarkdown()
    );
    setHasUnsavedChanges(true);
  };

  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (type === 'change') {
        // Use a timeout to batch updates and avoid excessive re-renders
        const timer = setTimeout(() => form.handleSubmit(onSubmit)(), 100);
        return () => clearTimeout(timer);
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
                  <FormItem><FormLabel>Project Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="projectDescription" render={({ field }) => (
                  <FormItem><FormLabel>Project Description</FormLabel><FormControl><Textarea {...field} rows={3} /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="projectType" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Type</FormLabel>
                      <FormControl>
                        <CustomSelect
                          value={field.value || ''}
                          onChange={field.onChange}
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
                          onChange={field.onChange}
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
                        <FormItem><FormLabel>University</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="supervisor" render={({ field }) => (
                        <FormItem><FormLabel>Supervisor</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="course" render={({ field }) => (
                      <FormItem><FormLabel>Course</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={form.control} name="educationalLevel" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Educational Level</FormLabel>
                             <FormControl>
                                <CustomSelect
                                  value={field.value || ''}
                                  onChange={field.onChange}
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
                      <FormControl><Textarea {...field} rows={2} placeholder="Enter names, separated by commas..." /></FormControl>
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
