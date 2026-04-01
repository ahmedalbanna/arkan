'use client';

import React, { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AnimatePresence, motion } from 'framer-motion';
import { useBuilderStore } from '@/hooks';
import { useImageUpload } from '@/modules/ai/adapters/hooks/useImageUpload';
import { type ProjectProperties } from '@/modules/projects/domain/entities/Project';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/infrastructure/utils/cn';
import Image from 'next/image';
import {
    X,
    UploadCloud,
    Loader2,
    BookOpen,
    Landmark,
    ChevronRight,
    Sparkles,
} from 'lucide-react';

// ── Schema (cover-page-relevant fields only) ──────────────────────────────────
const coverSchema = z.object({
    name: z.string().min(1, 'Title is required.'),
    projectDescription: z.string().optional(),
    projectType: z.string().optional(),
    specialization: z.string().optional(),
    educationalLevel: z.string().optional(),
    university: z.string().optional(),
    supervisor: z.string().optional(),
    course: z.string().optional(),
    teamMembers: z.string().optional(),
});
type CoverFormValues = z.infer<typeof coverSchema>;

// ── Option lists (same as ProjectSettingsPanel) ───────────────────────────────
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
    { value: 'King Saud University', label: 'King Saud University' },
    { value: 'Umm Al-Qura University', label: 'Umm Al-Qura University' },
    { value: 'Islamic University of Madinah', label: 'Islamic University of Madinah' },
    { value: 'Imam Muhammad ibn Saud Islamic University', label: 'Imam Muhammad ibn Saud Islamic University' },
    { value: 'King Fahd University of Petroleum and Minerals', label: 'King Fahd University of Petroleum and Minerals' },
];

// ── Props ──────────────────────────────────────────────────────────────────────
interface CoverPageSettingsPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

// ── Reusable micro-label ──────────────────────────────────────────────────────
const FieldLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <span className="text-[9px] font-black uppercase tracking-[0.25em] text-muted-foreground/50">
        {children}
    </span>
);

// ── Component ─────────────────────────────────────────────────────────────────
export const CoverPageSettingsPanel: React.FC<CoverPageSettingsPanelProps> = ({ isOpen, onClose }) => {
    const { project, updateProject } = useBuilderStore();
    const { isUploading: isMainLogoUploading, handleFileUpload: handleMainLogoUpload } = useImageUpload();
    const { isUploading: isUniLogoUploading, handleFileUpload: handleUniLogoUpload } = useImageUpload();
    const mainLogoInputRef = useRef<HTMLInputElement>(null);
    const uniLogoInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<CoverFormValues>({
        resolver: zodResolver(coverSchema),
        defaultValues: {
            name: '',
            projectDescription: '',
            projectType: '',
            specialization: '',
            educationalLevel: '',
            university: '',
            supervisor: '',
            course: '',
            teamMembers: '',
        },
    });

    // Sync from store → form whenever project changes
    useEffect(() => {
        if (project) {
            form.reset({
                name: project.name || '',
                projectDescription: project.projectDescription || '',
                projectType: project.projectType || '',
                specialization: project.specialization || '',
                educationalLevel: project.educationalLevel || '',
                university: project.university || '',
                supervisor: project.supervisor || '',
                course: project.course || '',
                teamMembers: Array.isArray(project.teamMembers)
                    ? project.teamMembers.join(', ')
                    : '',
            });
        }
    }, [project, form]);

    // Auto-save on blur (same pattern as ProjectSettingsPanel)
    const handleBlur = () => {
        const data = form.getValues();
        updateProject(p => {
            const payload: Partial<ProjectProperties> = { ...(data as any) };
            payload.teamMembers = (data.teamMembers ?? '')
                .split(',')
                .map((s: string) => s.trim())
                .filter(Boolean);
            return p.withProps(payload);
        });
    };

    // Logo handlers
    const handleMainLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleMainLogoUpload(file, (dataUri) => {
                updateProject(p => p.withProps({ logoUrl: dataUri }));
            });
        }
    };

    const handleUniLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleUniLogoUpload(file, (dataUri) => {
                updateProject(p => p.withProps({ universityLogoUrl: dataUri }));
            });
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="cover-settings-panel"
                    initial={{ opacity: 0, x: 24, scale: 0.97 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 24, scale: 0.97 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    className={cn(
                        // Floating glassmorphism panel anchored top-right of canvas
                        "absolute top-14 right-4 z-40 w-80",
                        "bg-background/80 backdrop-blur-2xl",
                        "border border-primary/10 rounded-2xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.18)]",
                        "flex flex-col overflow-hidden"
                    )}
                    style={{ maxHeight: 'calc(100% - 5rem)' }}
                >
                    {/* ── Panel Header ─────────────────────────────────────── */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-primary/8 bg-muted/20 flex-shrink-0">
                        <div className="flex items-center gap-2.5">
                            {/* Live pulse */}
                            <div className="relative flex-shrink-0">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-primary/30 animate-ping" />
                            </div>
                            <BookOpen className="h-3.5 w-3.5 text-primary/60" />
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-[0.25em] text-foreground/80">
                                    Cover Configuration
                                </div>
                                <div className="text-[8px] font-medium uppercase tracking-widest text-muted-foreground/40">
                                    Auto-saves on field blur
                                </div>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
                            onClick={onClose}
                            aria-label="Close cover settings"
                        >
                            <X className="h-3.5 w-3.5" />
                        </Button>
                    </div>

                    {/* ── Scrollable Body ──────────────────────────────────── */}
                    <ScrollArea className="flex-1 min-h-0">
                        <div className="p-4 space-y-5">

                            {/* §1 — LOGOS ──────────────────────────────────── */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-0.5 bg-primary/40 rounded-full" />
                                    <FieldLabel>Brand Assets</FieldLabel>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    {/* Main Logo */}
                                    <div className="space-y-1.5">
                                        <FieldLabel>Project Logo</FieldLabel>
                                        <div
                                            className={cn(
                                                "relative h-20 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group/logo",
                                                "hover:border-primary hover:bg-primary/[0.02]",
                                                project?.logoUrl ? "border-primary/20 bg-muted/5" : "border-border/40"
                                            )}
                                            onClick={() => mainLogoInputRef.current?.click()}
                                            role="button"
                                            tabIndex={0}
                                            aria-label="Upload project logo"
                                            onKeyDown={(e) => e.key === 'Enter' && mainLogoInputRef.current?.click()}
                                        >
                                            <input
                                                ref={mainLogoInputRef}
                                                type="file"
                                                accept="image/png,image/jpeg,image/svg+xml"
                                                className="hidden"
                                                onChange={handleMainLogoChange}
                                                disabled={isMainLogoUploading}
                                                aria-label="Project logo file input"
                                            />
                                            {isMainLogoUploading ? (
                                                <Loader2 className="h-5 w-5 animate-spin text-primary/40" />
                                            ) : project?.logoUrl ? (
                                                <>
                                                    <Image src={project.logoUrl} alt="Project Logo" layout="fill" objectFit="contain" className="p-2 rounded-xl" />
                                                    <div className="absolute inset-0 bg-background/60 opacity-0 group-hover/logo:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                                                        <UploadCloud className="h-5 w-5 text-primary" />
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <UploadCloud className="h-5 w-5 text-muted-foreground/20 group-hover/logo:text-primary transition-colors mb-1" />
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/30">Upload</span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* University Logo */}
                                    <div className="space-y-1.5">
                                        <FieldLabel>Institution Logo</FieldLabel>
                                        <div
                                            className={cn(
                                                "relative h-20 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group/uni",
                                                "hover:border-primary hover:bg-primary/[0.02]",
                                                project?.universityLogoUrl ? "border-primary/20 bg-muted/5" : "border-border/40"
                                            )}
                                            onClick={() => uniLogoInputRef.current?.click()}
                                            role="button"
                                            tabIndex={0}
                                            aria-label="Upload university logo"
                                            onKeyDown={(e) => e.key === 'Enter' && uniLogoInputRef.current?.click()}
                                        >
                                            <input
                                                ref={uniLogoInputRef}
                                                type="file"
                                                accept="image/png,image/jpeg,image/svg+xml"
                                                className="hidden"
                                                onChange={handleUniLogoChange}
                                                disabled={isUniLogoUploading}
                                                aria-label="University logo file input"
                                            />
                                            {isUniLogoUploading ? (
                                                <Loader2 className="h-5 w-5 animate-spin text-primary/40" />
                                            ) : project?.universityLogoUrl ? (
                                                <>
                                                    <Image src={project.universityLogoUrl} alt="University Logo" layout="fill" objectFit="contain" className="p-2 rounded-xl" />
                                                    <div className="absolute inset-0 bg-background/60 opacity-0 group-hover/uni:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                                                        <UploadCloud className="h-5 w-5 text-primary" />
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <Landmark className="h-5 w-5 text-muted-foreground/20 group-hover/uni:text-primary transition-colors mb-1" />
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/30">Upload</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Separator className="opacity-30" />

                            {/* §2 — IDENTITY ───────────────────────────────── */}
                            <Form {...form}>
                                <form className="space-y-5">

                                    {/* Title */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <div className="h-3 w-0.5 bg-primary/40 rounded-full" />
                                            <FieldLabel>Document Identity</FieldLabel>
                                        </div>
                                        <div className="space-y-3">
                                            <FormField
                                                control={form.control}
                                                name="name"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-1">
                                                        <FormLabel className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/50">Title</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                onBlur={handleBlur}
                                                                placeholder="Project title..."
                                                                className="h-8 text-[11px] bg-muted/5 border-primary/10 focus-visible:ring-primary/20 rounded-xl shadow-inner"
                                                            />
                                                        </FormControl>
                                                        <FormMessage className="text-[9px]" />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="projectDescription"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-1">
                                                        <FormLabel className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/50">Abstract</FormLabel>
                                                        <FormControl>
                                                            <Textarea
                                                                {...field}
                                                                rows={3}
                                                                onBlur={handleBlur}
                                                                placeholder="Brief project abstract..."
                                                                className="min-h-[72px] text-[11px] bg-muted/5 border-primary/10 focus-visible:ring-primary/20 rounded-xl shadow-inner resize-none p-3 leading-relaxed font-serif italic"
                                                            />
                                                        </FormControl>
                                                        <FormMessage className="text-[9px]" />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <Separator className="opacity-30" />

                                    {/* Academic Matrix */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <div className="h-3 w-0.5 bg-primary/40 rounded-full" />
                                            <FieldLabel>Academic Matrix</FieldLabel>
                                        </div>
                                        <div className="space-y-3">

                                            <FormField
                                                control={form.control}
                                                name="projectType"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-1">
                                                        <FormLabel className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/50">Document Type</FormLabel>
                                                        <FormControl>
                                                            <CustomSelect
                                                                value={field.value || ''}
                                                                onChange={(value) => { field.onChange(value); handleBlur(); }}
                                                                options={documentTypeOptions}
                                                                placeholder="Select type..."
                                                                className="h-8 text-[11px] bg-muted/5 border-primary/10 focus:ring-primary/20 rounded-xl"
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
                                                    <FormItem className="space-y-1">
                                                        <FormLabel className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/50">Specialization</FormLabel>
                                                        <FormControl>
                                                            <CustomSelect
                                                                value={field.value || ''}
                                                                onChange={(value) => { field.onChange(value); handleBlur(); }}
                                                                options={specializationOptions}
                                                                placeholder="Select domain..."
                                                                className="h-8 text-[11px] bg-muted/5 border-primary/10 focus:ring-primary/20 rounded-xl"
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
                                                    <FormItem className="space-y-1">
                                                        <FormLabel className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/50">Academic Level</FormLabel>
                                                        <FormControl>
                                                            <CustomSelect
                                                                value={field.value || ''}
                                                                onChange={(value) => { field.onChange(value); handleBlur(); }}
                                                                options={educationalLevelOptions}
                                                                placeholder="Select level..."
                                                                className="h-8 text-[11px] bg-muted/5 border-primary/10 focus:ring-primary/20 rounded-xl"
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
                                                    <FormItem className="space-y-1">
                                                        <FormLabel className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/50">Institution</FormLabel>
                                                        <FormControl>
                                                            <CustomSelect
                                                                value={field.value || ''}
                                                                onChange={(value) => { field.onChange(value); handleBlur(); }}
                                                                options={universityOptions}
                                                                placeholder="Select institution..."
                                                                className="h-8 text-[11px] bg-muted/5 border-primary/10 focus:ring-primary/20 rounded-xl"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <Separator className="opacity-30" />

                                    {/* Personnel */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <div className="h-3 w-0.5 bg-primary/40 rounded-full" />
                                            <FieldLabel>Personnel</FieldLabel>
                                        </div>
                                        <div className="space-y-3">

                                            <FormField
                                                control={form.control}
                                                name="supervisor"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-1">
                                                        <FormLabel className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/50">Supervisor</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                onBlur={handleBlur}
                                                                placeholder="Chief supervisor name..."
                                                                autoComplete="name"
                                                                className="h-8 text-[11px] bg-muted/5 border-primary/10 focus-visible:ring-primary/20 rounded-xl shadow-inner"
                                                            />
                                                        </FormControl>
                                                        <FormMessage className="text-[9px]" />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="course"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-1">
                                                        <FormLabel className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/50">Course / Module</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                onBlur={handleBlur}
                                                                placeholder="Academic course or module..."
                                                                className="h-8 text-[11px] bg-muted/5 border-primary/10 focus-visible:ring-primary/20 rounded-xl shadow-inner"
                                                            />
                                                        </FormControl>
                                                        <FormMessage className="text-[9px]" />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="teamMembers"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-1">
                                                        <FormLabel className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/50">Team Members</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                onBlur={handleBlur}
                                                                placeholder="Alice, Bob, Carol..."
                                                                className="h-8 text-[11px] bg-muted/5 border-primary/10 focus-visible:ring-primary/20 rounded-xl shadow-inner"
                                                            />
                                                        </FormControl>
                                                        <p className="text-[8px] text-muted-foreground/40 font-medium tracking-wide">Comma-separated names</p>
                                                        <FormMessage className="text-[9px]" />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    {/* Bottom breathing room */}
                                    <div className="h-2" />
                                </form>
                            </Form>
                        </div>
                    </ScrollArea>

                    {/* ── Footer hint ──────────────────────────────────────── */}
                    <div className="flex-shrink-0 px-4 py-2.5 border-t border-primary/8 bg-muted/10 flex items-center gap-2">
                        <Sparkles className="h-3 w-3 text-primary/30 flex-shrink-0" />
                        <p className="text-[8px] font-medium uppercase tracking-widest text-muted-foreground/30">
                            Changes reflect live on the cover page
                        </p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
