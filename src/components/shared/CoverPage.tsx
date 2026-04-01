
'use client';

import { useBuilderStore } from '@/hooks';
import { cn } from '@/infrastructure/utils/cn';
import { useImageUpload } from '@/modules/ai/adapters/hooks/useImageUpload';
import { Project, type ProjectProperties } from '@/modules/projects/domain/entities/Project';
import { Book, Brush, Building, Landmark, Loader2, UploadCloud } from 'lucide-react';
import Image from 'next/image';
import React, { useCallback, useMemo, useRef } from 'react';
import ContentEditable, { ContentEditableEvent } from 'react-contenteditable';
import { Badge } from '../ui/badge';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface CoverPageProps {
    project: Project | null;
}

const EditableField: React.FC<{
    html: string;
    onBlur: (e: React.FocusEvent<HTMLDivElement>) => void;
    onChange: (e: ContentEditableEvent) => void;
    placeholder: string;
    className: string;
    tagName?: 'p' | 'div' | 'h1';
    autoComplete?: string;
    name?: string;
}> = ({ html, onBlur, onChange, placeholder, className, tagName = 'p', autoComplete, name }) => {
    return (
        <div className="relative" role="textbox" aria-label={placeholder}>
            <ContentEditable
                html={html}
                onBlur={onBlur}
                onChange={onChange}
                data-placeholder={placeholder}
                className={cn(
                    "outline-none focus:bg-primary/5 focus:shadow-inner p-1 rounded-md",
                    "empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground empty:before:opacity-50",
                    className
                )}
                tagName={tagName}
            />
            {/* Hidden input sibling for browser autocomplete */}
            {autoComplete && (
                <input
                    type="text"
                    name={name ?? autoComplete}
                    autoComplete={autoComplete}
                    defaultValue={html.replace(/<[^>]+>/g, '')}
                    tabIndex={-1}
                    aria-hidden="true"
                    className="sr-only"
                />
            )}
        </div>
    );
};

export const CoverPage: React.FC<CoverPageProps> = ({ project }) => {
    const { updateProject } = useBuilderStore();
    const { isUploading: isMainLogoUploading, handleFileUpload: handleMainLogoUpload } = useImageUpload();
    const { isUploading: isUniLogoUploading, handleFileUpload: handleUniLogoUpload } = useImageUpload();
    const mainLogoInputRef = useRef<HTMLInputElement>(null);
    const uniLogoInputRef = useRef<HTMLInputElement>(null);

    if (!project) return null;

    // ── Memoized derived values ──────────────────────────────────────────────
    const currentDate = useMemo(
        () =>
            project.meta.updated
                ? new Date(project.meta.updated).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        [project.meta.updated]
    );

    const frameStyle = useMemo(() => {
        switch (project.projectType) {
            case 'Graduation Project':
            case 'Research Paper':
                return 'academic';
            case 'Business Proposal':
            case 'Software Documentation':
                return 'professional';
            default:
                return 'creative';
        }
    }, [project.projectType]);

    // Team members as array for pill rendering
    const teamMembersList = useMemo(
        () =>
            Array.isArray(project.teamMembers)
                ? project.teamMembers.filter(Boolean)
                : (project.teamMembers as string | undefined)?.split(',').map((s: string) => s.trim()).filter(Boolean) ?? [],
        [project.teamMembers]
    );

    // ── Memoized handlers ────────────────────────────────────────────────────
    const handleContentChange = useCallback(
        (field: keyof Project, value: string) => {
            const sanitizedValue = value.replace(/<br>/g, '\n').replace(/&nbsp;/g, ' ').replace(/<[^>]+>/g, '');
            updateProject(p => {
                const props: Partial<Project> = {};
                if (field === 'teamMembers') {
                    (props as any)[field] = sanitizedValue.split(',').map((s: string) => s.trim()).filter(Boolean);
                } else {
                    (props as any)[field] = sanitizedValue;
                }
                return p.withProps(props as Partial<ProjectProperties>);
            });
        },
        [updateProject]
    );

    const handleDateChange = useCallback(
        (value: string) => {
            const sanitizedValue = value.replace(/<br>/g, '\n').replace(/&nbsp;/g, ' ').replace(/<[^>]+>/g, '');
            updateProject(p =>
                p.withProps({ meta: { ...p.meta, updated: new Date(sanitizedValue).toISOString() } })
            );
        },
        [updateProject]
    );

    const handleMainLogoChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (file) {
                handleMainLogoUpload(file, (dataUri) => {
                    updateProject(p => p.withProps({ logoUrl: dataUri }));
                });
            }
        },
        [handleMainLogoUpload, updateProject]
    );

    const handleUniLogoChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (file) {
                handleUniLogoUpload(file, (dataUri) => {
                    updateProject(p => p.withProps({ universityLogoUrl: dataUri }));
                });
            }
        },
        [handleUniLogoUpload, updateProject]
    );

    // ── Frame styling map ────────────────────────────────────────────────────
    const frameClasses = {
        professional: 'border-primary/10 shadow-[inset_0_0_100px_rgba(0,0,0,0.02)]',
        academic: 'border-double border-primary/20 ring-1 ring-primary/10 ring-offset-8',
        creative: 'border-dashed border-accent/20 [background-image:radial-gradient(var(--accent)_0.5px,transparent_0.5px)] [background-size:16px_16px]',
    };

    const frameLabel: Record<string, string> = {
        professional: 'Professional',
        academic: 'Academic',
        creative: 'Creative',
    };

    return (
        <div
            className={cn(
                "group mx-auto my-8 w-full max-w-[210mm] min-h-[297mm] h-[297mm] relative bg-background",
                "shadow-[0_0_80px_-20px_rgba(0,0,0,0.15),0_0_40px_-10px_rgba(0,0,0,0.05)]",
                "box-border overflow-hidden p-14 flex flex-col border-[12px] transition-all duration-700 ease-in-out",
                frameClasses[frameStyle]
            )}
        >
            {/* ── Technical Crop Marks (matching A4Page) ─────────────────── */}
            <div className="absolute top-4 left-4 w-6 h-px bg-primary/10" />
            <div className="absolute top-4 left-4 w-px h-6 bg-primary/10" />
            <div className="absolute top-4 right-4 w-6 h-px bg-primary/10" />
            <div className="absolute top-4 right-4 w-px h-6 bg-primary/10" />
            <div className="absolute bottom-4 left-4 w-6 h-px bg-primary/10" />
            <div className="absolute bottom-4 left-4 w-px h-6 bg-primary/10" />
            <div className="absolute bottom-4 right-4 w-6 h-px bg-primary/10" />
            <div className="absolute bottom-4 right-4 w-px h-6 bg-primary/10" />

            {/* ── Premium Lighting Gradient ──────────────────────────────── */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/[0.02] via-transparent to-black/[0.01] dark:from-white/[0.01] dark:to-transparent" />

            {/* ── Frame-specific Canvas Backgrounds ─────────────────────── */}
            {frameStyle === 'professional' && (
                <>
                    <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/[0.03] rounded-full filter blur-3xl animate-pulse" />
                    <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-accent/[0.03] rounded-full filter blur-3xl animate-pulse delay-700" />
                </>
            )}
            {frameStyle === 'academic' && (
                <div className="absolute inset-4 border-[0.5px] border-primary/10 pointer-events-none" />
            )}
            {frameStyle === 'creative' && (
                <>
                    <div className="absolute top-0 left-0 w-48 h-48 bg-accent/[0.02] [clip-path:polygon(0_0,100%_0,0_100%)]" />
                    <div className="absolute bottom-0 right-0 w-48 h-48 bg-primary/[0.02] [clip-path:polygon(100%_100%,0_100%,100%_0)]" />
                </>
            )}

            {/* ── Frame Style HUD (top-right) ────────────────────────────── */}
            <div
                className="absolute top-6 right-6 z-20 opacity-50 hover:opacity-100 transition-opacity duration-500"
                aria-label="Select frame style"
            >
                <div className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 text-center mb-1 select-none">Frame</div>
                <TooltipProvider>
                    <ToggleGroup
                        type="single"
                        defaultValue={project.projectType}
                        onValueChange={(value) => { if (value) handleContentChange('projectType', value); }}
                        className="bg-background/80 border border-white/20 rounded-xl p-1 backdrop-blur-xl shadow-2xl"
                    >
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <ToggleGroupItem
                                    value="Business Proposal"
                                    aria-label="Professional frame style"
                                    className="rounded-lg h-8 w-8 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                                >
                                    <Building className="h-4 w-4" />
                                </ToggleGroupItem>
                            </TooltipTrigger>
                            <TooltipContent side="left">
                                <p className="text-[10px] font-bold uppercase tracking-widest">Professional</p>
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <ToggleGroupItem
                                    value="Research Paper"
                                    aria-label="Academic frame style"
                                    className="rounded-lg h-8 w-8 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                                >
                                    <Book className="h-4 w-4" />
                                </ToggleGroupItem>
                            </TooltipTrigger>
                            <TooltipContent side="left">
                                <p className="text-[10px] font-bold uppercase tracking-widest">Academic</p>
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <ToggleGroupItem
                                    value="Creative"
                                    aria-label="Creative frame style"
                                    className="rounded-lg h-8 w-8 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                                >
                                    <Brush className="h-4 w-4" />
                                </ToggleGroupItem>
                            </TooltipTrigger>
                            <TooltipContent side="left">
                                <p className="text-[10px] font-bold uppercase tracking-widest">Creative</p>
                            </TooltipContent>
                        </Tooltip>
                    </ToggleGroup>
                </TooltipProvider>
            </div>

            {/* ══════════════════════════════════════════════════════════════
                HEADER ZONE — Logo · Title · Institution
            ══════════════════════════════════════════════════════════════ */}
            <header className="relative z-10 text-center flex flex-col items-center pt-4 pb-8 flex-shrink-0">

                {/* Main Logo Upload Zone */}
                <div
                    className="group/logo relative mb-8 transition-transform duration-500 hover:scale-105"
                    aria-label="Upload project logo"
                >
                    {project.logoUrl ? (
                        <div
                            className="relative w-36 h-36 cursor-pointer shadow-xl rounded-2xl bg-white p-3 ring-1 ring-black/5 hover:ring-primary/30 transition-all duration-300"
                            onClick={() => mainLogoInputRef.current?.click()}
                            role="button"
                            tabIndex={0}
                            aria-label="Change project logo"
                            onKeyDown={(e) => e.key === 'Enter' && mainLogoInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                ref={mainLogoInputRef}
                                onChange={handleMainLogoChange}
                                accept="image/png, image/jpeg, image/svg+xml"
                                className="hidden"
                                disabled={isMainLogoUploading}
                                aria-label="Project logo file input"
                            />
                            <Image src={project.logoUrl} alt="Project Logo" layout="fill" objectFit="contain" className="p-3" />
                        </div>
                    ) : (
                        <div
                            className="relative w-36 h-36 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-muted-foreground cursor-pointer hover:border-primary hover:bg-primary/[0.02] transition-all duration-300"
                            onClick={() => mainLogoInputRef.current?.click()}
                            role="button"
                            tabIndex={0}
                            aria-label="Upload project logo"
                            onKeyDown={(e) => e.key === 'Enter' && mainLogoInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                ref={mainLogoInputRef}
                                onChange={handleMainLogoChange}
                                accept="image/png, image/jpeg, image/svg+xml"
                                className="hidden"
                                disabled={isMainLogoUploading}
                                aria-label="Project logo file input"
                            />
                            {isMainLogoUploading ? (
                                <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
                            ) : (
                                <>
                                    <UploadCloud className="w-9 h-9 mb-2 opacity-20 group-hover/logo:opacity-80 group-hover/logo:text-primary transition-opacity duration-300" />
                                    <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Brand Identity</span>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Project Title */}
                <EditableField
                    tagName="h1"
                    html={project.name || ''}
                    onChange={() => {}}
                    onBlur={(e) => handleContentChange('name', e.currentTarget.innerHTML)}
                    placeholder="UNTITLED PROJECT"
                    className="text-5xl font-bold font-headline text-foreground tracking-tighter leading-[0.9] max-w-xs"
                    autoComplete="off"
                    name="project-name"
                />

                {/* Gradient accent line under title */}
                <div className="h-1 w-12 bg-gradient-to-r from-primary via-primary/60 to-transparent rounded-full mt-3 mb-5 transition-all duration-700 group-hover:w-24" />

                {/* Horizontal rule */}
                <div className="w-full h-px bg-gradient-to-r from-transparent via-border/60 to-transparent mb-5" />

                {/* Institution Row */}
                <div className="inline-flex items-center gap-2.5 bg-muted/5 px-4 py-2 rounded-full border border-border/40">
                    {project.universityLogoUrl ? (
                        <div
                            className="relative w-5 h-5 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => uniLogoInputRef.current?.click()}
                            role="button"
                            tabIndex={0}
                            aria-label="Change university logo"
                            onKeyDown={(e) => e.key === 'Enter' && uniLogoInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                ref={uniLogoInputRef}
                                onChange={handleUniLogoChange}
                                accept="image/png, image/jpeg, image/svg+xml"
                                className="hidden"
                                disabled={isUniLogoUploading}
                                aria-label="University logo file input"
                            />
                            <Image src={project.universityLogoUrl} alt="University Logo" layout="fill" objectFit="contain" />
                        </div>
                    ) : (
                        <div
                            className="relative w-5 h-5 flex-shrink-0 border border-dashed rounded-full flex items-center justify-center cursor-pointer hover:border-primary text-muted-foreground/30 hover:text-primary transition-colors"
                            onClick={() => uniLogoInputRef.current?.click()}
                            role="button"
                            tabIndex={0}
                            aria-label="Upload university logo"
                            onKeyDown={(e) => e.key === 'Enter' && uniLogoInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                ref={uniLogoInputRef}
                                onChange={handleUniLogoChange}
                                accept="image/png, image/jpeg, image/svg+xml"
                                className="hidden"
                                disabled={isUniLogoUploading}
                                aria-label="University logo file input"
                            />
                            {isUniLogoUploading
                                ? <Loader2 className="w-3 h-3 animate-spin" />
                                : <Landmark className="w-3 h-3" />}
                        </div>
                    )}
                    <EditableField
                        html={project.university || ''}
                        onChange={() => {}}
                        onBlur={(e) => handleContentChange('university', e.currentTarget.innerHTML)}
                        placeholder="Institution Name"
                        className="font-bold text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
                        autoComplete="organization"
                        name="university"
                    />
                </div>
            </header>

            {/* ══════════════════════════════════════════════════════════════
                BODY ZONE — Project Abstract (document abstract style)
            ══════════════════════════════════════════════════════════════ */}
            <main className="relative z-10 flex-grow flex items-center justify-center px-6">
                <div className="w-full max-w-lg">
                    {/* Decorative top line */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/30" />
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />
                    </div>

                    {/* Abstract block with left border accent */}
                    <div className="relative pl-5 border-l-2 border-primary/20">
                        <div className="text-[9px] font-black uppercase tracking-[0.35em] text-primary/40 mb-2 select-none">Abstract</div>
                        <EditableField
                            html={project.projectDescription || ''}
                            onChange={() => {}}
                            onBlur={(e) => handleContentChange('projectDescription', e.currentTarget.innerHTML)}
                            placeholder="Enter a sophisticated project abstract..."
                            className="text-[13px] text-muted-foreground leading-[1.75] italic font-serif"
                            tagName="div"
                            autoComplete="off"
                            name="project-description"
                        />
                    </div>

                    {/* Decorative bottom line */}
                    <div className="flex items-center gap-3 mt-4">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/30" />
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />
                    </div>
                </div>
            </main>

            {/* ══════════════════════════════════════════════════════════════
                FOOTER ZONE — Team · Specialization · Supervisor · Date
            ══════════════════════════════════════════════════════════════ */}
            <footer className="relative z-10 flex-shrink-0 pt-6">

                {/* Mid-section: educational level + specialization + team */}
                <div className="text-center mb-6 space-y-4">
                    {/* Educational level & specialization */}
                    <div className="space-y-0.5">
                        <EditableField
                            html={project.educationalLevel || ''}
                            onChange={() => {}}
                            onBlur={(e) => handleContentChange('educationalLevel', e.currentTarget.innerHTML)}
                            placeholder="Educational Level"
                            className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60"
                            autoComplete="off"
                            name="educational-level"
                        />
                        <div className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary/30 italic select-none">In Pursuance Of</div>
                        <EditableField
                            html={project.specialization || ''}
                            onChange={() => {}}
                            onBlur={(e) => handleContentChange('specialization', e.currentTarget.innerHTML)}
                            placeholder="Domain Specialization"
                            className="text-lg font-bold tracking-tight"
                            autoComplete="off"
                            name="specialization"
                        />
                    </div>

                    {/* Team members — pill badges in preview, comma-joined editable field */}
                    <div className="space-y-2">
                        <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 select-none">Production Team</h3>

                        {/* Pill badges rendered from stored array */}
                        {teamMembersList.length > 0 && (
                            <div className="flex flex-wrap justify-center gap-1.5 mb-1">
                                {teamMembersList.map((member, i) => (
                                    <Badge
                                        key={i}
                                        variant="secondary"
                                        className="text-[10px] font-bold tracking-wide px-2.5 py-0.5 rounded-full bg-muted/40 border border-border/30"
                                    >
                                        {member}
                                    </Badge>
                                ))}
                            </div>
                        )}

                        {/* Editable comma-separated field (stores the comma-separated value) */}
                        <EditableField
                            html={Array.isArray(project.teamMembers) ? project.teamMembers.join(', ') : ''}
                            onChange={() => {}}
                            onBlur={(e) => handleContentChange('teamMembers', e.currentTarget.innerHTML)}
                            placeholder="Lead Researcher, Team Members"
                            className="text-[11px] font-medium tracking-wide text-foreground/50 focus:text-foreground transition-colors"
                            autoComplete="off"
                            name="team-members"
                        />
                    </div>
                </div>

                {/* Bottom border row: supervisor (left) | date (right) */}
                <div className="flex justify-between items-end border-t border-border/40 pt-5">
                    {/* Left column — supervisor & course */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 group/edit">
                            <EditableField
                                html={project.supervisor || ''}
                                onChange={() => {}}
                                onBlur={(e) => handleContentChange('supervisor', e.currentTarget.innerHTML)}
                                placeholder="Chief Supervisor"
                                className="font-bold text-[11px] uppercase tracking-wider"
                                autoComplete="name"
                                name="supervisor"
                            />
                            <Badge
                                variant="outline"
                                className="h-4 text-[8px] uppercase tracking-tighter opacity-0 group-hover/edit:opacity-100 transition-opacity"
                            >
                                Advisor
                            </Badge>
                        </div>
                        <EditableField
                            html={project.course || ''}
                            onChange={() => {}}
                            onBlur={(e) => handleContentChange('course', e.currentTarget.innerHTML)}
                            placeholder="Academic Course / Module"
                            className="text-[9px] font-medium text-muted-foreground uppercase tracking-widest"
                            autoComplete="off"
                            name="course"
                        />
                    </div>

                    {/* Right column — date */}
                    <div className="text-right">
                        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mb-1 select-none">
                            Issue Date
                        </div>
                        <ContentEditable
                            html={currentDate}
                            onChange={() => {}}
                            onBlur={(e) => handleDateChange(e.currentTarget.innerHTML)}
                            className="outline-none focus:bg-primary/5 focus:shadow-inner p-1 rounded-md text-[10px] font-bold uppercase tracking-widest text-foreground/60"
                            tagName="p"
                        />
                    </div>
                </div>

                {/* Cosmetic project-type watermark badge */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none select-none">
                    <span className="text-[7px] font-black uppercase tracking-[0.4em] text-muted-foreground/20">
                        {frameLabel[frameStyle]}
                    </span>
                </div>
            </footer>
        </div>
    );
};
