'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useBuilderStore } from '@/hooks';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { 
    documentTypeOptions, 
    specializationOptions, 
    educationalLevelOptions, 
    universityOptions, 
    citationStyleOptions 
} from './OptionConstants';

/**
 * ProjectSettingsHUD — High-fidelity metadata configuration for the document manifest.
 * Manages core identity and academic context parameters.
 */

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

export function ProjectSettingsHUD() {
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

  return (
    <div className="h-full flex flex-col space-y-6 pt-2 animate-in fade-in slide-in-from-right-2 duration-300">
      <div className="space-y-1 px-1">
        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">Metadata Manifest</h4>
        <p className="text-[9px] text-muted-foreground italic font-medium opacity-60 uppercase tracking-wider">
          Establish the core identity and academic parameters.
        </p>
      </div>

      <Form {...form}>
        <form className="flex-grow flex flex-col min-h-0">
          <ScrollArea className="flex-grow pr-4 -mr-4">
            <div className="space-y-8 pb-24 relative px-1">
              {/* Depth architectural line */}
              <div className="absolute left-[-1.25rem] top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-primary/5 to-transparent" />
              
              <div className="space-y-5">
                <FormField 
                  control={form.control} 
                  name="name" 
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Project Title</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          onBlur={handleBlur} 
                          placeholder="Untitled Project..."
                          className="h-10 text-[11px] bg-muted/5 border-primary/10 focus-visible:ring-primary/20 rounded-xl shadow-inner transition-all font-bold uppercase tracking-widest"
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
                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Neural Brief</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          rows={4} 
                          onBlur={handleBlur} 
                          className="min-h-[100px] text-[11px] bg-muted/5 border-primary/10 focus-visible:ring-primary/20 rounded-2xl shadow-inner transition-all resize-none p-4 leading-relaxed font-serif italic" 
                          placeholder="Describe the intellectual scope of this manifest..."
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
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">Academic Matrix</span>
                </div>

                <div className="grid gap-5">
                  <FormField
                    control={form.control}
                    name="projectType"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Document Vector</FormLabel>
                        <FormControl>
                          <CustomSelect
                            value={field.value || ''}
                            onChange={(value: string) => {
                              field.onChange(value);
                              handleBlur();
                            }}
                            options={documentTypeOptions}
                            placeholder="Select classification..."
                            className="h-10 text-[11px] bg-muted/5 border-primary/10 focus:ring-primary/20 rounded-xl"
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
                              <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Intellectual Field</FormLabel>
                              <FormControl>
                                  <CustomSelect
                                      value={field.value || ''}
                                      onChange={(value: string) => {
                                          field.onChange(value);
                                          handleBlur();
                                      }}
                                      options={specializationOptions}
                                      placeholder="Select specialization..."
                                      className="h-10 text-[11px] bg-muted/5 border-primary/10 focus:ring-primary/20 rounded-xl"
                                  />
                              </FormControl>
                              <FormMessage />
                          </FormItem>
                      )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="educationalLevel"
                        render={({ field }) => (
                            <FormItem className="space-y-1.5">
                                <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Level</FormLabel>
                                <FormControl>
                                    <CustomSelect
                                        value={field.value || ''}
                                        onChange={(value: string) => {
                                            field.onChange(value);
                                            handleBlur();
                                        }}
                                        options={educationalLevelOptions}
                                        placeholder="Target level..."
                                        className="h-10 text-[11px] bg-muted/5 border-primary/10 focus:ring-primary/20 rounded-xl"
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
                            <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Standard</FormLabel>
                            <FormControl>
                            <CustomSelect
                                value={field.value || ''}
                                onChange={(value: string) => {
                                field.onChange(value);
                                handleBlur();
                                }}
                                options={citationStyleOptions}
                                placeholder="Citation..."
                                className="h-10 text-[11px] bg-muted/5 border-primary/10 focus:ring-primary/20 rounded-xl"
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                  </div>
                  
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
                                      placeholder="Map institution..."
                                      className="h-10 text-[11px] bg-muted/5 border-primary/10 focus:ring-primary/20 rounded-xl"
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
