'use client';

import React, { useEffect, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useBuilderStore } from '@/hooks';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { AlertCircle, Settings2 } from 'lucide-react';
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
 * 
 * DEFENSIVE MEASURES:
 * 1. Existence Guards: Checks for project and updateProject presence.
 * 2. Atomic Updates: Selectively updates project properties to avoid data corruption.
 * 3. Change Detection: Minimizes store updates by verifying values changed.
 * 4. Error Containment: Wraps complex persistence logic in try-catch.
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
  const lastValuesRef = useRef<SettingsFormValues | null>(null);

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

  // 1. FORM INTEGRITY — Safe initialization/reset
  useEffect(() => {
    if (project) {
      const initialValues = {
        name: project.name || '',
        projectDescription: project.projectDescription || '',
        projectType: project.projectType || '',
        educationalLevel: project.educationalLevel || '',
        specialization: project.specialization || '',
        university: project.university || '',
        citationStyle: project.citationStyle || '',
      };
      form.reset(initialValues);
      lastValuesRef.current = initialValues;
    }
  }, [project, form]);

  // 2. ATOMIC MAPPING & PERSISTENCE — Defensive update logic
  const handleBlur = useCallback(() => {
    if (!project || !updateProject) return;

    const values = form.getValues();
    
    // Performance Optimization: Check if values actually changed
    const hasChanges = JSON.stringify(values) !== JSON.stringify(lastValuesRef.current);
    if (!hasChanges) return;

    try {
      updateProject((p) => {
        if (!p) return p;
        
        // Selective atomic mapping to preserve domain integrity
        return p.withProps({
          name: values.name,
          projectDescription: values.projectDescription,
          projectType: values.projectType,
          educationalLevel: values.educationalLevel,
          specialization: values.specialization,
          university: values.university,
          citationStyle: values.citationStyle,
        });
      });
      lastValuesRef.current = values;
    } catch (error) {
      console.error('[ProjectSettingsHUD] Persistence failure:', error);
    }
  }, [project, updateProject, form]);

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center space-y-4 opacity-40">
        <div className="p-5 rounded-[24px] bg-primary/5 border border-primary/10 shadow-inner">
          <Settings2 className="h-8 w-8 text-primary/40" />
        </div>
        <div className="space-y-1.5 px-6">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Manifest Offline</p>
          <p className="text-[11px] font-medium leading-relaxed italic text-muted-foreground/60 max-w-[200px]">
            Initialize or load a project to configure technical metadata.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-6 pt-2 animate-in fade-in slide-in-from-right-2 duration-300">
      <div className="space-y-1 px-1">
        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">Project Settings</h4>
        <p className="text-[9px] text-muted-foreground italic font-medium uppercase tracking-[0.2em] opacity-60">
          Configure project identity and academic context.
        </p>
      </div>

      <Form {...form}>
        <form className="flex-grow flex flex-col min-h-0">
          <ScrollArea className="flex-grow pr-4 -mr-4">
            <div className="space-y-8 pb-24 relative px-1">
              {/* Depth architectural line */}
              <div className="absolute left-[-1.25rem] top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-primary/5 to-transparent" />
              
              <div className="space-y-6">
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
                          placeholder="Project Title..."
                          className="h-10 text-[11px] bg-muted/5 border-primary/10 focus-visible:ring-primary/20 rounded-xl shadow-inner transition-all font-bold"
                        />
                      </FormControl>
                      <FormMessage className="text-[10px] text-destructive italic font-medium" />
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
                          rows={4} 
                          onBlur={handleBlur} 
                          className="min-h-[120px] text-[11px] bg-muted/5 border-primary/10 focus-visible:ring-primary/20 rounded-2xl shadow-inner transition-all resize-none p-4 leading-relaxed font-serif italic" 
                          placeholder="Describe the scope of this project..."
                        />
                      </FormControl>
                      <FormMessage className="text-[10px] text-destructive italic font-medium" />
                    </FormItem>
                  )} 
                />
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 group/header px-1">
                    <div className="h-4 w-1 bg-primary/40 rounded-full group-hover:h-6 transition-all duration-300 shadow-[0_0_8px_rgba(var(--primary),0.3)]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">Academic Context</span>
                </div>

                <div className="grid gap-6">
                  <FormField
                    control={form.control}
                    name="projectType"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Document Type</FormLabel>
                        <FormControl>
                          <CustomSelect
                            value={field.value || ''}
                            onChange={(value: string) => {
                              field.onChange(value);
                              handleBlur();
                            }}
                            options={documentTypeOptions}
                            placeholder="Select type..."
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
                              <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Specialization</FormLabel>
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
                                <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Educational Level</FormLabel>
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
                            <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Citation Style</FormLabel>
                            <FormControl>
                            <CustomSelect
                                value={field.value || ''}
                                onChange={(value: string) => {
                                  field.onChange(value);
                                  handleBlur();
                                }}
                                options={citationStyleOptions}
                                placeholder="Citation style..."
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
                              <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">University / Institution</FormLabel>
                              <FormControl>
                                  <CustomSelect
                                      value={field.value || ''}
                                      onChange={(value: string) => {
                                          field.onChange(value);
                                          handleBlur();
                                      }}
                                      options={universityOptions}
                                      placeholder="Institution name..."
                                      className="h-10 text-[11px] bg-muted/5 border-primary/10 focus:ring-primary/20 rounded-xl"
                                  />
                              </FormControl>
                              <FormMessage />
                          </FormItem>
                      )}
                  />
                </div>
              </div>

              {/* Tactical Status Layer */}
              <div className="p-5 rounded-[24px] border border-dashed border-primary/10 bg-primary/[0.02] text-center space-y-2 group/info hover:bg-primary/[0.04] transition-all">
                <div className="flex justify-center mb-1">
                  <AlertCircle className="h-4 w-4 text-primary/30 group-hover/info:scale-110 transition-transform" />
                </div>
                <p className="text-[9px] text-primary/40 italic leading-relaxed font-medium uppercase tracking-[0.2em] group-hover:text-primary/60 transition-colors px-4">
                  Metadata changes are automatically synced to the project manifest on input blur or selection change.
                </p>
              </div>
            </div>
          </ScrollArea>
        </form>
      </Form>

      {/* Stable Version Footer */}
      <div className="absolute bottom-0 left-0 right-0 px-6 py-3 border-t border-primary/10 bg-background/40 backdrop-blur-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-primary/30" />
              <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40">Settings Matrix</span>
          </div>
          <span className="text-[8px] font-bold text-muted-foreground/20 tabular-nums">v1.2.0-STABLE</span>
      </div>
    </div>
  );
}
