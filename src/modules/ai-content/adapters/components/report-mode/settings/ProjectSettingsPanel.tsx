
'use client';

import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useBuilderStore } from '@/hooks';
import { Loader2, UploadCloud, Trash2, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { useImageUpload } from '@/modules/ai/adapters/hooks/useImageUpload';
import { LanguageSchema, BehaviorSchema, type Behavior, CitationStyleSchema, Tone } from '@/modules/ai-content/domain/entities/ControlTypes';
import { type ProjectProperties } from '@/modules/projects/domain/entities/Project';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

const settingsSchema = z.object({
  name: z.string().min(1, 'Project name is required.'),
  projectDescription: z.string().optional(),
  projectType: z.string().optional(),
  specialization: z.string().optional(),
  university: z.string().optional(),
  supervisor: z.string().optional(),
  course: z.string().optional(),
  educationalLevel: z.string().optional(),
  teamMembers: z.string().optional(),
  language: LanguageSchema.optional(),
  complexity: z.number().min(0).max(100).optional(),
  formality: z.number().min(0).max(100).optional(),
  tone: z.string().optional(),
  behaviors: z.array(BehaviorSchema).optional(),
  rules: z.array(z.string()).optional(),
  constraints: z.array(z.string()).optional(),
  citationStyle: z.string().optional(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

function TagInput({ label, value, onChange, placeholder }: { label: string; value: string[]; onChange: (value: string[]) => void; placeholder: string }) {
    const [inputValue, setInputValue] = useState('');

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            e.preventDefault();
            onChange([...value, inputValue.trim()]);
            setInputValue('');
        }
    };

    const handleRemove = (index: number) => {
        onChange(value.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-2">
            <Label className="text-sm font-semibold">{label}</Label>
            <div className="flex flex-wrap gap-2 rounded-lg border border-border/60 bg-muted/20 p-2 min-h-[44px]">
                {value.map((item, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1 px-2 py-1 text-xs">
                        {item}
                        <button onClick={() => handleRemove(index)} className="rounded-full hover:bg-muted-foreground/20">
                            <X className="h-3 w-3" />
                        </button>
                    </Badge>
                ))}
                <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="flex-1 border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto text-sm"
                />
            </div>
        </div>
    )
}

export default function ProjectSettingsPanel() {
  const { project, updateProject } = useBuilderStore();
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
      language: 'default',
      complexity: 50,
      formality: 70,
      tone: 'professional',
      behaviors: [],
      rules: [],
      constraints: [],
      citationStyle: 'APA7',
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
        teamMembers: Array.isArray(project.teamMembers) ? project.teamMembers.join(', ') : '',
        language: project.language || 'default',
        complexity: project.complexity ?? 50,
        formality: project.formality ?? 70,
        tone: project.tone || 'professional',
        behaviors: project.behaviors ? [...project.behaviors] : [],
        rules: project.rules ? [...project.rules] : [],
        constraints: project.constraints ? [...project.constraints] : [],
        citationStyle: project.citationStyle || 'APA7',
      });
      setLogoPreview(project.logoUrl || null);
    }
  }, [project, form]);

  const handleBlur = () => {
    const data = form.getValues();
    updateProject(p => {
      const updatePayload: Partial<ProjectProperties> = { ...(data as any) };
      if (data.teamMembers) {
        updatePayload.teamMembers = (data.teamMembers as unknown as string).split(',').map((name: string) => name.trim()).filter(Boolean);
      } else {
        updatePayload.teamMembers = [];
      }
      return p.with(updatePayload);
    });
  };

  const { fields: behaviors, append: appendBehavior, remove: removeBehavior } = useFieldArray({ control: form.control, name: "behaviors" });
  
  const documentTypeOptions = [
      { value: 'Graduation Project', label: 'Graduation Project' },
      { value: 'Research Paper', label: 'Research Paper' },
      { value: 'Analytical Essay', label: 'Analytical Essay' },
      { value: 'Argumentative Essay', label: 'Argumentative Essay' },
      { value: 'Literature Review', label: 'Literature Review' },
      { value: 'Case Study', label: 'Case Study' },
      { value: 'Lab Report', label: 'Lab Report' },
      { value: 'Research Proposal', label: 'Research Proposal' },
      { value: 'Thesis Statement', label: 'Thesis Statement' },
      { value: 'Dissertation Chapter', label: 'Dissertation Chapter' },
      { value: 'Term Paper', label: 'Term Paper' },
      { value: 'Critical Analysis', label: 'Critical Analysis' },
      { value: 'Book Review', label: 'Book Review' },
      { value: 'Article Summary', label: 'Article Summary' },
      { value: 'Annotated Bibliography', label: 'Annotated Bibliography' },
      { value: 'Position Paper', label: 'Position Paper' },
      { value: 'Reflection Paper', label: 'Reflection Paper' },
      { value: 'Technical Report', label: 'Technical Report' },
      { value: 'Business Proposal', label: 'Business Proposal' },
      { value: 'Software Documentation', label: 'Software Documentation' },
      { value: 'Creative Story', label: 'Creative Story' },
      { value: 'Blog Post', label: 'Blog Post' },
  ];
  
  const specializationOptions = [
      { value: 'Artificial Intelligence', label: 'Artificial Intelligence' },
      { value: 'Web Development', label: 'Web Development' },
      { value: 'Data Science', label: 'Data Science' },
      { value: 'Cybersecurity', label: 'Cybersecurity' },
      { value: 'Machine Learning', label: 'Machine Learning' },
      { value: 'Software Engineering', label: 'Software Engineering' },
      { value: 'Computer Science', label: 'Computer Science' },
      { value: 'Electrical Engineering', label: 'Electrical Engineering' },
      { value: 'Mechanical Engineering', label: 'Mechanical Engineering' },
      { value: 'Civil Engineering', label: 'Civil Engineering' },
      { value: 'Medicine', label: 'Medicine' },
      { value: 'Law', label: 'Law' },
      { value: 'Business Administration', label: 'Business Administration' },
      { value: 'Marketing', label: 'Marketing' },
      { value: 'Finance', label: 'Finance' },
      { value: 'Physics', label: 'Physics' },
      { value: 'Chemistry', label: 'Chemistry' },
      { value: 'Biology', label: 'Biology' },
      { value: 'Mathematics', label: 'Mathematics' },
      { value: 'Psychology', label: 'Psychology' },
      { value: 'Sociology', label: 'Sociology' },
      { value: 'Economics', label: 'Economics' },
      { value: 'Political Science', label: 'Political Science' },
      { value: 'History', label: 'History' },
      { value: 'Literature', label: 'Literature' },
      { value: 'Philosophy', label: 'Philosophy' },
      { value: 'Education', label: 'Education' },
      { value: 'Environmental Science', label: 'Environmental Science' },
      { value: 'Communication Studies', label: 'Communication Studies' },
      { value: 'Art & Design', label: 'Art & Design' },
      { value: 'Music', label: 'Music' },
      { value: 'Geography', label: 'Geography' },
      { value: 'Linguistics', label: 'Linguistics' },
  ];
  
  const educationalLevelOptions = [
      { value: 'High School', label: 'High School' },
      { value: 'Undergraduate (First Year)', label: 'Undergraduate (First Year)' },
      { value: 'Undergraduate (Second/Third Year)', label: 'Undergraduate (Second/Third Year)' },
      { value: 'Undergraduate (Final Year)', label: 'Undergraduate (Final Year)' },
      { value: "Master's", label: "Master's" },
      { value: 'Doctoral', label: 'Doctoral' },
      { value: 'Post-Doctoral', label: 'Post-Doctoral' },
      { value: 'Professional', label: 'Professional' },
  ];

  const universityOptions = [
      { value: "King Saud University", label: "King Saud University" },
      { value: "Umm Al-Qura University", label: "Umm Al-Qura University" },
      { value: "Islamic University of Madinah", label: "Islamic University of Madinah" },
      { value: "Imam Muhammad ibn Saud Islamic University", label: "Imam Muhammad ibn Saud Islamic University" },
      { value: "King Fahd University of Petroleum and Minerals", label: "King Fahd University of Petroleum and Minerals" }
  ];

  const citationStyleOptions = [
    { value: 'APA7', label: 'APA (7th Edition)' },
    { value: 'MLA9', label: 'MLA (9th Edition)' },
    { value: 'Chicago17', label: 'Chicago (17th Edition)' },
    { value: 'Harvard', label: 'Harvard' },
    { value: 'IEEE', label: 'IEEE' },
    { value: 'Vancouver', label: 'Vancouver' },
    { value: 'OSCOLA', label: 'OSCOLA (Legal)' },
    { value: 'AMA', label: 'AMA' },
    { value: 'ASA', label: 'ASA' },
    { value: 'Turabian', label: 'Turabian' },
  ];

  return (
    <Card className="h-full flex flex-col border-0 shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold tracking-tight">Project Settings</CardTitle>
        <CardDescription className="text-xs">
          Manage the metadata for your project. This information will automatically update the cover page.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <Form {...form}>
          <form className="space-y-4 h-full flex flex-col">
            <ScrollArea className="flex-grow pr-4 -mr-4">
              <div className="space-y-5">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel className="text-sm font-semibold">Project Name</FormLabel><FormControl><Input {...field} onBlur={handleBlur} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="projectDescription" render={({ field }) => (
                  <FormItem><FormLabel className="text-sm font-semibold">Project Description</FormLabel><FormControl><Textarea {...field} rows={3} onBlur={handleBlur} className="min-h-[120px]" /></FormControl><FormMessage /></FormItem>
                )} />
                
                <div className="grid gap-4 lg:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="projectType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold">Document Type</FormLabel>
                        <FormControl>
                          <CustomSelect
                            value={field.value || ''}
                            onChange={(value) => {
                              field.onChange(value);
                              handleBlur();
                            }}
                            options={documentTypeOptions}
                            placeholder="e.g., Graduation Project"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                      control={form.control}
                      name="specialization"
                      render={({ field }) => (
                          <FormItem>
                              <FormLabel className="text-sm font-semibold">Specialization</FormLabel>
                              <FormControl>
                                  <CustomSelect
                                      value={field.value || ''}
                                      onChange={(value) => {
                                          field.onChange(value);
                                          handleBlur();
                                      }}
                                      options={specializationOptions}
                                      placeholder="e.g., Artificial Intelligence, Web Development"
                                  />
                              </FormControl>
                              <FormMessage />
                          </FormItem>
                      )}
                  />

                  <FormField
                      control={form.control}
                      name="educationalLevel"
                      render={({ field }) => (
                          <FormItem>
                              <FormLabel className="text-sm font-semibold">Educational Level</FormLabel>
                              <FormControl>
                                  <CustomSelect
                                      value={field.value || ''}
                                      onChange={(value) => {
                                          field.onChange(value);
                                          handleBlur();
                                      }}
                                      options={educationalLevelOptions}
                                      placeholder="e.g., Bachelor's Degree, PhD"
                                  />
                              </FormControl>
                              <FormMessage />
                          </FormItem>
                      )}
                  />
                  
                  <FormField
                      control={form.control}
                      name="university"
                      render={({ field }) => (
                          <FormItem>
                              <FormLabel className="text-sm font-semibold">University</FormLabel>
                              <FormControl>
                                  <CustomSelect
                                      value={field.value || ''}
                                      onChange={(value) => {
                                          field.onChange(value);
                                          handleBlur();
                                      }}
                                      options={universityOptions}
                                      placeholder="e.g., King Saud University"
                                  />
                              </FormControl>
                              <FormMessage />
                          </FormItem>
                      )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="citationStyle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold">Citation Style</FormLabel>
                        <FormControl>
                          <CustomSelect
                            value={field.value || ''}
                            onChange={(value) => {
                              field.onChange(value);
                              handleBlur();
                            }}
                            options={citationStyleOptions}
                            placeholder="Select citation style..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Card className="border-border/60 bg-muted/10">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold tracking-tight">Global AI Settings</CardTitle>
                        <CardDescription className="text-xs">Set default behavior, language, and style controls for the entire report.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <FormField control={form.control} name="language" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-semibold">Language</FormLabel>
                            <Select onValueChange={(value) => { field.onChange(value); handleBlur(); }} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="default">Default</SelectItem>
                                    <SelectItem value="en">English</SelectItem>
                                    <SelectItem value="ar">Arabic</SelectItem>
                                    <SelectItem value="es">Spanish</SelectItem>
                                    <SelectItem value="fr">French</SelectItem>
                                    <SelectItem value="de">German</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )} />

                        <FormField control={form.control} name="complexity" render={({ field }) => (
                          <FormItem>
                            <div className="flex justify-between items-center"><FormLabel className="text-sm font-semibold">Complexity</FormLabel><Badge variant="outline">{field.value}%</Badge></div>
                            <FormControl>
                                <Slider value={[field.value ?? 50]} onValueChange={(v) => field.onChange(v[0])} onBlur={handleBlur} min={0} max={100} step={10} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        
                        <div className="space-y-3">
                            <Label className="text-sm font-semibold">Behaviors &amp; Personas</Label>
                            <div className="space-y-2">
                                {behaviors.map((item, index) => (
                                    <div key={item.id} className="flex items-center gap-2 rounded-md border border-border/60 p-2 bg-background">
                                        <Input
                                            {...form.register(`behaviors.${index}.name`)}
                                            onBlur={handleBlur}
                                            placeholder="e.g., 'Act as an expert academic writer'"
                                            className="flex-grow bg-background border-transparent focus-visible:ring-1 focus-visible:ring-ring"
                                        />
                                        <Controller
                                            control={form.control}
                                            name={`behaviors.${index}.type`}
                                            render={({ field }) => (
                                                <ToggleGroup
                                                    type="single"
                                                    value={field.value}
                                                    onValueChange={(value) => { if (value) { field.onChange(value); handleBlur(); } }}
                                                    className="shrink-0"
                                                    size="sm"
                                                >
                                                    <ToggleGroupItem value="persona">Persona</ToggleGroupItem>
                                                    <ToggleGroupItem value="behavior">Behavior</ToggleGroupItem>
                                                </ToggleGroup>
                                            )}
                                        />
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeBehavior(index)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <Button type="button" size="sm" variant="outline" className="w-full" onClick={() => appendBehavior({ name: '', type: 'behavior' })}>Add Behavior</Button>
                        </div>
                        
                        <FormField control={form.control} name="rules" render={({ field }) => (
                            <TagInput label="Mandatory Rules" placeholder="Add a rule and press Enter" value={field.value || []} onChange={(value) => { field.onChange(value); handleBlur(); }} />
                        )} />
                        
                        <FormField control={form.control} name="constraints" render={({ field }) => (
                             <TagInput label="Constraints / What to Avoid" placeholder="Add a constraint and press Enter" value={field.value || []} onChange={(value) => { field.onChange(value); handleBlur(); }} />
                        )} />
                    </CardContent>
                </Card>

              </div>
            </ScrollArea>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

  