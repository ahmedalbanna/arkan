'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useBuilderStore } from '@/hooks';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
    documentTypeOptions, 
    specializationOptions, 
    educationalLevelOptions, 
    universityOptions 
} from './OptionConstants';
import { FileText, User, GraduationCap, School, Briefcase, FileSignature } from 'lucide-react';

/**
 * CoverPageHUD — Technical configuration for the document's visual signature.
 * Synchronizes with global project metadata while allowing layout-specific overrides.
 */

const coverSchema = z.object({
    name: z.string().min(1, 'Title is required'),
    projectType: z.string().optional(),
    educationalLevel: z.string().optional(),
    specialization: z.string().optional(),
    university: z.string().optional(),
    supervisor: z.string().optional(),
    course: z.string().optional(),
});

type CoverFormValues = z.infer<typeof coverSchema>;

export function CoverPageHUD() {
    const { project, updateProject } = useBuilderStore();

    const form = useForm<CoverFormValues>({
        resolver: zodResolver(coverSchema),
        defaultValues: {
            name: project?.name || '',
            projectType: project?.projectType || '',
            educationalLevel: project?.educationalLevel || '',
            specialization: project?.specialization || '',
            university: project?.university || '',
            supervisor: project?.supervisor || '',
            course: project?.course || '',
        },
    });

    useEffect(() => {
        if (project) {
            form.reset({
                name: project.name || '',
                projectType: project.projectType || '',
                educationalLevel: project.educationalLevel || '',
                specialization: project.specialization || '',
                university: project.university || '',
                supervisor: project.supervisor || '',
                course: project.course || '',
            });
        }
    }, [project, form]);

    const handleBlur = () => {
        const values = form.getValues();
        updateProject((p) => p.withProps({ ...values }));
    };

    if (!project) return null;

    return (
        <div className="h-full flex flex-col pt-2 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-1 mb-6 px-1">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70 flex items-center gap-2.5">
                    <FileSignature className="h-3.5 w-3.5" />
                    Cover Manifest
                </h4>
                <p className="text-[9px] text-muted-foreground italic font-medium opacity-60 uppercase tracking-wider">
                    Configure the visual signature and academic branding.
                </p>
            </div>

            <ScrollArea className="flex-1 pr-4 -mr-4">
                <Form {...form}>
                    <form className="space-y-8 pb-24 relative px-1">
                        {/* Depth architectural line */}
                        <div className="absolute left-[-1.25rem] top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-primary/5 to-transparent" />

                        <div className="space-y-5">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="space-y-1.5">
                                        <div className="flex items-center gap-2 px-1">
                                            <FileText className="h-3 w-3 text-primary/40" />
                                            <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Manifest Title</FormLabel>
                                        </div>
                                        <FormControl>
                                            <Input 
                                                {...field} 
                                                onBlur={handleBlur} 
                                                className="h-10 text-[11px] bg-muted/5 border-primary/10 focus-visible:ring-primary/20 rounded-xl font-bold uppercase tracking-widest"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="projectType"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Vector</FormLabel>
                                            <FormControl>
                                                <CustomSelect
                                                    value={field.value || ''}
                                                    onChange={(v) => { field.onChange(v); handleBlur(); }}
                                                    options={documentTypeOptions}
                                                    placeholder="Type..."
                                                    className="h-9 text-[11px] bg-muted/5 border-primary/10 rounded-xl"
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="educationalLevel"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Degree</FormLabel>
                                            <FormControl>
                                                <CustomSelect
                                                    value={field.value || ''}
                                                    onChange={(v) => { field.onChange(v); handleBlur(); }}
                                                    options={educationalLevelOptions}
                                                    placeholder="Level..."
                                                    className="h-9 text-[11px] bg-muted/5 border-primary/10 rounded-xl"
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <Separator className="bg-gradient-to-r from-primary/20 via-primary/5 to-transparent h-px" />

                        <div className="space-y-5">
                            <div className="flex items-center gap-3 group/header">
                                <div className="h-4 w-1 bg-primary/40 rounded-full group-hover:h-6 transition-all duration-300" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">Organization Matrix</span>
                            </div>

                            <FormField
                                control={form.control}
                                name="university"
                                render={({ field }) => (
                                    <FormItem className="space-y-1.5">
                                        <div className="flex items-center gap-2 px-1">
                                            <School className="h-3 w-3 text-primary/40" />
                                            <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Institution</FormLabel>
                                        </div>
                                        <FormControl>
                                            <CustomSelect
                                                value={field.value || ''}
                                                onChange={(v) => { field.onChange(v); handleBlur(); }}
                                                options={universityOptions}
                                                placeholder="Map organization..."
                                                className="h-10 text-[11px] bg-muted/5 border-primary/10 rounded-xl"
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="specialization"
                                render={({ field }) => (
                                    <FormItem className="space-y-1.5">
                                        <div className="flex items-center gap-2 px-1">
                                            <GraduationCap className="h-3 w-3 text-primary/40" />
                                            <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Field Logic</FormLabel>
                                        </div>
                                        <FormControl>
                                            <CustomSelect
                                                value={field.value || ''}
                                                onChange={(v) => { field.onChange(v); handleBlur(); }}
                                                options={specializationOptions}
                                                placeholder="Select field..."
                                                className="h-10 text-[11px] bg-muted/5 border-primary/10 rounded-xl"
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Separator className="bg-gradient-to-r from-primary/20 via-primary/5 to-transparent h-px" />

                        <div className="space-y-5">
                            <div className="flex items-center gap-3 group/header">
                                <div className="h-4 w-1 bg-primary/40 rounded-full group-hover:h-6 transition-all duration-300" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">Authority Group</span>
                            </div>

                            <div className="grid gap-5">
                                <FormField
                                    control={form.control}
                                    name="supervisor"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <div className="flex items-center gap-2 px-1">
                                                <User className="h-3 w-3 text-primary/40" />
                                                <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Primary Supervisor</FormLabel>
                                            </div>
                                            <FormControl>
                                                <Input 
                                                    {...field} 
                                                    onBlur={handleBlur} 
                                                    placeholder="Enter lead name..." 
                                                    className="h-10 text-[11px] bg-muted/5 border-primary/10 rounded-xl font-medium px-4 shadow-inner"
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="course"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <div className="flex items-center gap-2 px-1">
                                                <Briefcase className="h-3 w-3 text-primary/40" />
                                                <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Course Reference</FormLabel>
                                            </div>
                                            <FormControl>
                                                <Input 
                                                    {...field} 
                                                    onBlur={handleBlur} 
                                                    placeholder="e.g., AI-402 Advanced Architecture" 
                                                    className="h-10 text-[11px] bg-muted/5 border-primary/10 rounded-xl font-medium px-4 shadow-inner"
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="p-5 rounded-[24px] border border-dashed border-primary/10 bg-primary/[0.02] text-center space-y-2 group/info hover:bg-primary/[0.04] transition-all">
                            <p className="text-[9px] text-primary/40 italic leading-relaxed font-medium uppercase tracking-wider group-hover:text-primary/60 transition-colors px-4">
                                Cover Manifest data is synchronized with the global project metadata.
                            </p>
                        </div>
                    </form>
                </Form>
            </ScrollArea>
        </div>
    );
}
