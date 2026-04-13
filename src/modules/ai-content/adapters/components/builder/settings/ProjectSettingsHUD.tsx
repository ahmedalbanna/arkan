'use client';

import { CustomSelect } from '@/components/ui/CustomSelect';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useBuilderStore } from '@/hooks';
import { cn } from '@/infrastructure/utils/cn';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  BookOpen,
  Building2,
  CheckCircle2,
  FileText,
  Globe,
  GraduationCap,
  Info,
  RotateCcw,
  Save,
  Settings2,
  Sparkles
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  citationStyleOptions,
  documentTypeOptions,
  educationalLevelOptions,
  specializationOptions,
  universityOptions
} from './OptionConstants';

/**
 * ProjectSettingsHUD — High-fidelity metadata configuration for the document manifest.
 * Manages core identity and academic context parameters.
 */

const settingsSchema = z.object({
  name: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  projectDescription: z.string().max(5000, 'Description must be less than 5000 characters').optional(),
  projectType: z.string().optional(),
  educationalLevel: z.string().optional(),
  specialization: z.string().optional(),
  university: z.string().optional(),
  citationStyle: z.string().optional(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

// Helper to get field icon
const getFieldIcon = (fieldName: string) => {
  const icons: Record<string, React.ReactNode> = {
    name: <FileText className="h-3.5 w-3.5" />,
    projectDescription: <Info className="h-3.5 w-3.5" />,
    projectType: <BookOpen className="h-3.5 w-3.5" />,
    educationalLevel: <GraduationCap className="h-3.5 w-3.5" />,
    specialization: <Sparkles className="h-3.5 w-3.5" />,
    university: <Building2 className="h-3.5 w-3.5" />,
    citationStyle: <Globe className="h-3.5 w-3.5" />,
  };
  return icons[fieldName] || <Settings2 className="h-3.5 w-3.5" />;
};

export function ProjectSettingsHUD() {
  const { project, updateProject } = useBuilderStore();
  const lastValuesRef = useRef<SettingsFormValues | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

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
    mode: 'onChange',
  });

  // Watch for changes to show dirty state
  const watchedValues = form.watch();
  useEffect(() => {
    const hasChanges = JSON.stringify(watchedValues) !== JSON.stringify(lastValuesRef.current);
    setIsDirty(hasChanges);
  }, [watchedValues]);

  // Form initialization
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
      setIsDirty(false);
    }
  }, [project, form]);

  // Cleanup timeout
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  // Save function with debouncing
  const saveSettings = useCallback(async (values: SettingsFormValues) => {
    if (!project || !updateProject) return;

    // Check if values actually changed
    const hasChanges = JSON.stringify(values) !== JSON.stringify(lastValuesRef.current);
    if (!hasChanges) return;

    setSaveStatus('saving');

    try {
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate save delay

      updateProject((p) => {
        if (!p) return p;
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
      setIsDirty(false);
      setSaveStatus('saved');

      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('[ProjectSettingsHUD] Persistence failure:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }, [project, updateProject]);

  // Auto-save on blur with debounce
  const handleFieldBlur = useCallback(() => {
    const values = form.getValues();
    saveSettings(values);
  }, [form, saveSettings]);

  // Manual save
  const handleManualSave = useCallback(() => {
    const values = form.getValues();
    saveSettings(values);
  }, [form, saveSettings]);

  // Reset form
  const handleReset = useCallback(() => {
    if (lastValuesRef.current) {
      form.reset(lastValuesRef.current);
      setIsDirty(false);
    }
  }, [form]);

  // Keyboard shortcuts
  useEffect(() => {

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (isDirty) {
          handleManualSave();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDirty, handleManualSave]);

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center space-y-4 opacity-40">
        <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 shadow-inner">
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

  const completedFields = Object.values(watchedValues).filter(v => v && String(v).trim().length > 0).length;
  const totalFields = Object.keys(settingsSchema.shape).length;

  return (
    <div className="h-full flex flex-col space-y-5 pt-2 animate-in fade-in slide-in-from-right-2 duration-300">
      {/* Header with Save Status */}
      <div className="space-y-1.5 px-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">Project Settings</h4>
            {(
              <Badge variant="outline" className="h-4 text-[7px] font-mono border-primary/20">
                {completedFields}/{totalFields} configured
              </Badge>
            )}
          </div>

          {/* Save Status Indicator */}
          {(
            <div className="flex items-center gap-2">
              {saveStatus === 'saving' && (
                <div className="flex items-center gap-1.5 text-[8px] text-amber-500">
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span>Saving...</span>
                </div>
              )}
              {saveStatus === 'saved' && (
                <div className="flex items-center gap-1.5 text-[8px] text-green-500 animate-in fade-in">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Saved</span>
                </div>
              )}
              {saveStatus === 'error' && (
                <div className="flex items-center gap-1.5 text-[8px] text-red-500 animate-in fade-in">
                  <AlertCircle className="h-3 w-3" />
                  <span>Save failed</span>
                </div>
              )}
              {isDirty && saveStatus === 'idle' && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleManualSave}
                        className="h-6 px-2 text-[8px] font-black uppercase tracking-wider gap-1 rounded-md"
                      >
                        <Save className="h-3 w-3" />
                        Save Changes
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-[8px]">
                      Save changes • Ctrl+S
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {isDirty && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleReset}
                        className="h-6 w-6 rounded-md text-muted-foreground/40 hover:text-primary"
                      >
                        <RotateCcw className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-[8px]">
                      Reset changes
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          )}
        </div>
        <p className="text-[9px] text-muted-foreground italic font-medium uppercase tracking-[0.2em] opacity-60">
          Configure project identity and academic context.
        </p>
      </div>

      <Form {...form}>
        <form className="flex-grow flex flex-col min-h-0">
          <ScrollArea className="flex-grow pr-3 -mr-3">
            <div className="space-y-6 pb-24 relative px-1">
              {/* Depth architectural line */}
              <div className="absolute left-[-1.25rem] top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-primary/5 to-transparent" />

              {/* Basic Information Section */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 group/header px-1">
                  <div className="h-4 w-1 bg-primary/40 rounded-full group-hover/header:h-6 transition-all duration-300" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">
                    Basic Information
                  </span>
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-1.5">
                          {getFieldIcon('name')}
                          Title <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            onBlur={handleFieldBlur}
                            placeholder="Project Title..."
                            className="h-10 text-[11px] bg-muted/5 border-primary/10 focus-visible:ring-primary/20 rounded-xl shadow-inner transition-all font-bold"
                            autoComplete="off"
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
                        <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-1.5">
                          {getFieldIcon('projectDescription')}
                          Description
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={4}
                            onBlur={handleFieldBlur}
                            className={cn(
                              "text-[11px] bg-muted/5 border-primary/10 focus-visible:ring-primary/20 rounded-xl shadow-inner transition-all resize-none p-4 leading-relaxed font-serif italic",
                              "min-h-[100px]"
                            )}
                            placeholder="Describe the scope of this project..."
                          />
                        </FormControl>
                        <FormMessage className="text-[10px] text-destructive italic font-medium" />
                        {field.value && field.value.length > 100 && (
                          <div className="text-[8px] text-muted-foreground/40 text-right">
                            {field.value.length} / 5000 characters
                          </div>
                        )}
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Academic Context Section */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 group/header px-1 pt-2">
                  <div className="h-4 w-1 bg-primary/40 rounded-full group-hover/header:h-6 transition-all duration-300" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">
                    Academic Context
                  </span>
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="projectType"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-1.5">
                          {getFieldIcon('projectType')}
                          Document Type
                        </FormLabel>
                        <FormControl>
                          <CustomSelect
                            value={field.value || ''}
                            onChange={(value: string) => {
                              field.onChange(value);
                              handleFieldBlur();
                            }}
                            options={documentTypeOptions}
                            placeholder="Select document type..."
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
                        <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-1.5">
                          {getFieldIcon('specialization')}
                          Specialization
                        </FormLabel>
                        <FormControl>
                          <CustomSelect
                            value={field.value || ''}
                            onChange={(value: string) => {
                              field.onChange(value);
                              handleFieldBlur();
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

                  <div className={cn(
                    "grid gap-4",
                    "grid-cols-2"
                  )}>
                    <FormField
                      control={form.control}
                      name="educationalLevel"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-1.5">
                            {getFieldIcon('educationalLevel')}
                            Educational Level
                          </FormLabel>
                          <FormControl>
                            <CustomSelect
                              value={field.value || ''}
                              onChange={(value: string) => {
                                field.onChange(value);
                                handleFieldBlur();
                              }}
                              options={educationalLevelOptions}
                              placeholder="Select level..."
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
                          <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-1.5">
                            {getFieldIcon('citationStyle')}
                            Citation Style
                          </FormLabel>
                          <FormControl>
                            <CustomSelect
                              value={field.value || ''}
                              onChange={(value: string) => {
                                field.onChange(value);
                                handleFieldBlur();
                              }}
                              options={citationStyleOptions}
                              placeholder="Select style..."
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
                        <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-1.5">
                          {getFieldIcon('university')}
                          University / Institution
                        </FormLabel>
                        <FormControl>
                          <CustomSelect
                            value={field.value || ''}
                            onChange={(value: string) => {
                              field.onChange(value);
                              handleFieldBlur();
                            }}
                            options={universityOptions}
                            placeholder="Select institution..."
                            className="h-10 text-[11px] bg-muted/5 border-primary/10 focus:ring-primary/20 rounded-xl"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Info Banner - Desktop */}
              {(
                <div className="p-4 rounded-xl border border-dashed border-primary/10 bg-primary/[0.02] text-center space-y-2 group/info hover:bg-primary/[0.04] transition-all">
                  <div className="flex justify-center mb-1">
                    <Sparkles className="h-4 w-4 text-primary/30 group-hover/info:scale-110 transition-transform" />
                  </div>
                  <p className="text-[8px] text-primary/40 italic leading-relaxed font-medium uppercase tracking-[0.2em] group-hover:text-primary/60 transition-colors px-4">
                    Changes are automatically saved when you leave each field. Press Ctrl+S to save manually.
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </form>
      </Form>

      {/* Footer Stats */}
      <div className="absolute bottom-0 left-0 right-0 px-5 py-2.5 border-t border-primary/10 bg-background/80 backdrop-blur-sm flex items-center justify-between text-[7px]">
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-primary/30" />
          <span className="font-black uppercase tracking-widest text-muted-foreground/40">
            Settings Matrix
          </span>
        </div>
        <div className="flex items-center gap-2">
          {(
            <span className="font-mono text-muted-foreground/20">
              {completedFields}/{totalFields} fields completed
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
