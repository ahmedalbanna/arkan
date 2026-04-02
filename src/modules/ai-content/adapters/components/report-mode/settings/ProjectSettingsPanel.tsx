'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useBuilderStore } from '@/hooks';
import { useEffect } from 'react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CustomSelect } from '@/components/ui/CustomSelect';

const settingsSchema = z.object({
  name: z.string().min(1, 'Title is required'),
  projectDescription: z.string().optional(),
  projectType: z.string().optional(),
  educationalLevel: z.string().optional(),
  specialization: z.string().optional(),
  university: z.string().optional(),
  citationStyle: z.string().optional(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function ProjectSettingsPanel() {
  const { project, updateProject } = useBuilderStore();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: project?.name || '',
      projectDescription: project?.projectDescription || '',
      projectType: project?.projectType || '',
      educationalLevel: project?.educationalLevel || '',
      specialization: project?.specialization || '',
      university: project?.university || '',
      citationStyle: project?.citationStyle || '',
    },
  });

  useEffect(() => {
    if (project) {
      form.reset({
        name: project.name || '',
        projectDescription: project.projectDescription || '',
        projectType: project.projectType || '',
        educationalLevel: project.educationalLevel || '',
        specialization: project.specialization || '',
        university: project.university || '',
        citationStyle: project.citationStyle || '',
      });
    }
  }, [project, form]);

  const handleBlur = () => {
    const values = form.getValues();
    updateProject((p) => {
      return p.withProps({
        ...values,
      });
    });
  };

  const documentTypeOptions = [
    { value: 'report', label: 'Report' },
    { value: 'essay', label: 'Essay' },
    { value: 'research-paper', label: 'Research Paper' },
    { value: 'thesis', label: 'Thesis' },
    { value: 'dissertation', label: 'Dissertation' },
    { value: 'case-study', label: 'Case Study' },
    { value: 'literature-review', label: 'Literature Review' },
    { value: 'business-plan', label: 'Business Plan' },
    { value: 'project-proposal', label: 'Project Proposal' },
    { value: 'reflection-paper', label: 'Reflection Paper' },
    { value: 'lab-report', label: 'Lab Report' },
    { value: 'annotated-bibliography', label: 'Annotated Bibliography' },
    { value: 'other', label: 'Other' },
  ];

  const specializationOptions = [
    { value: 'computer-science', label: 'Computer Science' },
    { value: 'business-administration', label: 'Business Administration' },
    { value: 'medicine', label: 'Medicine' },
    { value: 'law', label: 'Law' },
    { value: 'engineering', label: 'Engineering' },
    { value: 'psychology', label: 'Psychology' },
    { value: 'education', label: 'Education' },
    { value: 'economics', label: 'Economics' },
    { value: 'political-science', label: 'Political Science' },
    { value: 'sociology', label: 'Sociology' },
    { value: 'biology', label: 'Biology' },
    { value: 'chemistry', label: 'Chemistry' },
    { value: 'physics', label: 'Physics' },
    { value: 'mathematics', label: 'Mathematics' },
    { value: 'history', label: 'History' },
    { value: 'philosophy', label: 'Philosophy' },
    { value: 'linguistics', label: 'Linguistics' },
    { value: 'literature', label: 'Literature' },
    { value: 'art-history', label: 'Art History' },
    { value: 'music', label: 'Music' },
    { value: 'architecture', label: 'Architecture' },
    { value: 'environmental-science', label: 'Environmental Science' },
    { value: 'nursing', label: 'Nursing' },
    { value: 'public-health', label: 'Public Health' },
    { value: 'journalism', label: 'Journalism' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'finance', label: 'Finance' },
    { value: 'accounting', label: 'Accounting' },
    { value: 'international-relations', label: 'International Relations' },
    { value: 'anthropology', label: 'Anthropology' },
    { value: 'geography', label: 'Geography' },
    { value: 'geology', label: 'Geology' },
    { value: 'astronomy', label: 'Physics' },
    { value: 'religious-studies', label: 'Religious Studies' },
    { value: 'social-work', label: 'Social Work' },
    { value: 'criminology', label: 'Criminology' },
    { value: 'other', label: 'Other' },
  ];

  const educationalLevelOptions = [
    { value: 'high-school', label: 'High School' },
    { value: 'undergraduate', label: 'Undergraduate' },
    { value: 'postgraduate', label: 'Postgraduate' },
    { value: 'phd', label: 'PhD' },
    { value: 'professional', label: 'Professional' },
    { value: 'other', label: 'Other' },
  ];

  const universityOptions = [
    { value: 'king-saud-university', label: 'King Saud University' },
    { value: 'king-abdulaziz-university', label: 'King Abdulaziz University' },
    { value: 'king-fahd-university', label: 'King Fahd University' },
    { value: 'other', label: 'Other' },
  ];

  const citationStyleOptions = [
    { value: 'apa', label: 'APA' },
    { value: 'mla', label: 'MLA' },
    { value: 'chicago', label: 'Chicago' },
    { value: 'harvard', label: 'Harvard' },
    { value: 'vancouver', label: 'Vancouver' },
    { value: 'ieee', label: 'IEEE' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div className="h-full flex flex-col space-y-6 pt-2 animate-in fade-in slide-in-from-right-2 duration-300">
      <div className="space-y-1">
        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">Project Details</h4>
        <p className="text-[9px] text-muted-foreground italic font-medium opacity-60 uppercase tracking-wider">
          Configure the main metadata for your document.
        </p>
      </div>

      <Form {...form}>
        <form className="flex-grow flex flex-col min-h-0">
          <ScrollArea className="flex-grow pr-4 -mr-4">
            <div className="space-y-6 pb-24 relative">
              <div className="absolute left-[-1.25rem] top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-primary/5 to-transparent" />
              
              <div className="space-y-5">
                <FormField 
                  control={form.control} 
                  name="name" 
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Title</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          onBlur={handleBlur} 
                          placeholder="Enter project title..."
                          className="h-9 text-[11px] bg-muted/5 border-primary/10 focus-visible:ring-primary/20 rounded-xl shadow-inner transition-all"
                        />
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )} 
                />

                <FormField 
                  control={form.control} 
                  name="projectDescription" 
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          rows={3} 
                          onBlur={handleBlur} 
                          className="min-h-[80px] text-[11px] bg-muted/5 border-primary/10 focus-visible:ring-primary/20 rounded-xl shadow-inner transition-all resize-none p-3 leading-relaxed font-serif italic" 
                          placeholder="Briefly describe your project's scope..."
                        />
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )} 
                />
              </div>

              <div className="space-y-5">
                <div className="flex items-center gap-3 group/header">
                    <div className="h-4 w-1 bg-primary/40 rounded-full group-hover:h-6 transition-all duration-300" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">Academic Context</span>
                </div>

                <div className="grid gap-4">
                  <FormField
                    control={form.control}
                    name="projectType"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Document Type</FormLabel>
                        <FormControl>
                          <CustomSelect
                            value={field.value || ''}
                            onChange={(value: string) => {
                              field.onChange(value);
                              handleBlur();
                            }}
                            options={documentTypeOptions}
                            placeholder="Select type..."
                            className="h-9 text-[11px] bg-muted/5 border-primary/10 focus:ring-primary/20 rounded-xl"
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
                          <FormItem className="space-y-1.5">
                              <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Field of Study</FormLabel>
                              <FormControl>
                                  <CustomSelect
                                      value={field.value || ''}
                                      onChange={(value: string) => {
                                          field.onChange(value);
                                          handleBlur();
                                      }}
                                      options={specializationOptions}
                                      placeholder="Select field..."
                                      className="h-9 text-[11px] bg-muted/5 border-primary/10 focus:ring-primary/20 rounded-xl"
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
                          <FormItem className="space-y-1.5">
                              <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Education Level</FormLabel>
                              <FormControl>
                                  <CustomSelect
                                      value={field.value || ''}
                                      onChange={(value: string) => {
                                          field.onChange(value);
                                          handleBlur();
                                      }}
                                      options={educationalLevelOptions}
                                      placeholder="Select level..."
                                      className="h-9 text-[11px] bg-muted/5 border-primary/10 focus:ring-primary/20 rounded-xl"
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
                          <FormItem className="space-y-1.5">
                              <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Institution</FormLabel>
                              <FormControl>
                                  <CustomSelect
                                      value={field.value || ''}
                                      onChange={(value: string) => {
                                          field.onChange(value);
                                          handleBlur();
                                      }}
                                      options={universityOptions}
                                      placeholder="Select institution..."
                                      className="h-9 text-[11px] bg-muted/5 border-primary/10 focus:ring-primary/20 rounded-xl"
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
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Citation Style</FormLabel>
                        <FormControl>
                          <CustomSelect
                            value={field.value || ''}
                            onChange={(value: string) => {
                              field.onChange(value);
                              handleBlur();
                            }}
                            options={citationStyleOptions}
                            placeholder="Select style..."
                            className="h-9 text-[11px] bg-muted/5 border-primary/10 focus:ring-primary/20 rounded-xl"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </ScrollArea>
        </form>
      </Form>
    </div>
  );
}
