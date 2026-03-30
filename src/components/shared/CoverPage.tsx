
'use client';

import { useBuilderStore } from '@/hooks';
import { cn } from '@/infrastructure/utils/cn';
import { useImageUpload } from '@/modules/ai/adapters/hooks/useImageUpload';
import { Project, type ProjectProperties } from '@/modules/projects/domain/entities/Project';
import { Book, Brush, Building, Landmark, Loader2, UploadCloud } from 'lucide-react';
import Image from 'next/image';
import React, { useRef } from 'react';
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
}> = ({ html, onBlur, onChange, placeholder, className, tagName = 'p' }) => {
    return (
        <ContentEditable
            html={html}
            onBlur={onBlur}
            onChange={onChange}
            data-placeholder={placeholder}
            className={cn("outline-none focus:bg-primary/5 focus:shadow-inner p-1 rounded-md empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground empty:before:opacity-60", className)}
            tagName={tagName}
        />
    );
};

export const CoverPage: React.FC<CoverPageProps> = ({ project }) => {
    const { updateProject } = useBuilderStore();
    const { isUploading: isMainLogoUploading, handleFileUpload: handleMainLogoUpload } = useImageUpload();
    const { isUploading: isUniLogoUploading, handleFileUpload: handleUniLogoUpload } = useImageUpload();
    const mainLogoInputRef = useRef<HTMLInputElement>(null);
    const uniLogoInputRef = useRef<HTMLInputElement>(null);

    if (!project) return null;

    const currentDate = project.meta.updated ? new Date(project.meta.updated).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const handleContentChange = (field: keyof Project, value: string) => {
        const sanitizedValue = value.replace(/<br>/g, '\n').replace(/&nbsp;/g, ' ').replace(/<[^>]+>/g, '');
        updateProject(p => {
            const props: Partial<Project> = {};
            if (field === 'teamMembers') {
                (props as any)[field] = sanitizedValue.split(',').map(s => s.trim()).filter(Boolean);
            } else {
                (props as any)[field] = sanitizedValue;
            }
            return p.withProps(props as Partial<ProjectProperties>);
        });
    };

    const handleDateChange = (value: string) => {
        const sanitizedValue = value.replace(/<br>/g, '\n').replace(/&nbsp;/g, ' ').replace(/<[^>]+>/g, '');
        updateProject(p => {
            return p.withProps({ meta: { ...p.meta, updated: new Date(sanitizedValue).toISOString() } });
        });
    };

    const handleMainLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            handleMainLogoUpload(file, (dataUri) => {
                updateProject(p => p.withProps({ logoUrl: dataUri }));
            });
        }
    };

    const handleUniLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            handleUniLogoUpload(file, (dataUri) => {
                updateProject(p => p.withProps({ universityLogoUrl: dataUri }));
            });
        }
    };

    const getFrameStyle = () => {
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
    };

    const frameStyle = getFrameStyle();

    const frameClasses = {
        professional: 'border-primary/10 shadow-[inset_0_0_100px_rgba(0,0,0,0.02)]',
        academic: 'border-double border-primary/20 ring-1 ring-primary/10 ring-offset-8',
        creative: 'border-dashed border-accent/20 [background-image:radial-gradient(var(--accent)_0.5px,transparent_0.5px)] [background-size:16px_16px]'
    };

    return (
        <div className={cn("mx-auto my-8 w-full max-w-[210mm] min-h-[297mm] h-[297mm] relative bg-background shadow-2xl box-border overflow-hidden p-16 flex flex-col border-[12px] transition-all duration-700 ease-in-out", frameClasses[frameStyle])}>
            {/* Subtle Canvas Backgrounds */}
            {frameStyle === 'professional' && (
                <>
                    <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/[0.03] rounded-full filter blur-3xl animate-pulse"></div>
                    <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-accent/[0.03] rounded-full filter blur-3xl animate-pulse delay-700"></div>
                </>
            )}
            {frameStyle === 'academic' && (
                <div className="absolute inset-4 border-[0.5px] border-primary/10 pointer-events-none"></div>
            )}
            {frameStyle === 'creative' && (
                <>
                    <div className="absolute top-0 left-0 w-48 h-48 bg-accent/[0.02] [clip-path:polygon(0_0,100%_0,0_100%)]"></div>
                    <div className="absolute bottom-0 right-0 w-48 h-48 bg-primary/[0.02] [clip-path:polygon(100%_100%,0_100%,100%_0)]"></div>
                </>
            )}

            {/* Style HUD Toggler */}
            <div className="absolute top-6 right-6 z-20 opacity-50 group-hover:opacity-100 transition-opacity duration-500">
                <TooltipProvider>
                    <ToggleGroup
                        type="single"
                        defaultValue={project.projectType}
                        onValueChange={(value) => { if (value) handleContentChange('projectType', value) }}
                        className="bg-background/80 border border-white/20 rounded-xl p-1 backdrop-blur-xl shadow-2xl"
                    >
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <ToggleGroupItem value="Business Proposal" className="rounded-lg h-9 w-9 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                                    <Building className="h-4.5 w-4.5" />
                                </ToggleGroupItem>
                            </TooltipTrigger>
                            <TooltipContent side="left"><p className="text-[10px] font-bold uppercase tracking-widest">Professional</p></TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <ToggleGroupItem value="Research Paper" className="rounded-lg h-9 w-9 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                                    <Book className="h-4.5 w-4.5" />
                                </ToggleGroupItem>
                            </TooltipTrigger>
                            <TooltipContent side="left"><p className="text-[10px] font-bold uppercase tracking-widest">Academic</p></TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <ToggleGroupItem value="Creative" className="rounded-lg h-9 w-9 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                                    <Brush className="h-4.5 w-4.5" />
                                </ToggleGroupItem>
                            </TooltipTrigger>
                            <TooltipContent side="left"><p className="text-[10px] font-bold uppercase tracking-widest">Creative</p></TooltipContent>
                        </Tooltip>
                    </ToggleGroup>
                </TooltipProvider>
            </div>

            <header className="relative z-10 text-center flex flex-col items-center pt-8 pb-12 flex-shrink-0">
                {/* Premium Logo Container */}
                <div className="group/logo relative mb-10 transition-transform duration-500 hover:scale-105">
                    {project.logoUrl ? (
                        <div className="relative w-40 h-40 cursor-pointer shadow-xl rounded-2xl bg-white p-4 ring-1 ring-black/5" onClick={() => mainLogoInputRef.current?.click()}>
                            <input type="file" ref={mainLogoInputRef} onChange={handleMainLogoChange} accept="image/png, image/jpeg, image/svg+xml" className="hidden" disabled={isMainLogoUploading} />
                            <Image src={project.logoUrl} alt="Project Logo" layout="fill" objectFit="contain" className="p-4" />
                        </div>
                    ) : (
                        <div
                            className="relative w-40 h-40 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-muted-foreground cursor-pointer hover:border-primary hover:bg-primary/[0.02] transition-all duration-300"
                            onClick={() => mainLogoInputRef.current?.click()}
                        >
                            <input type="file" ref={mainLogoInputRef} onChange={handleMainLogoChange} accept="image/png, image/jpeg, image/svg+xml" className="hidden" disabled={isMainLogoUploading} />
                            {isMainLogoUploading ? (
                                <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
                            ) : (
                                <>
                                    <UploadCloud className="w-10 h-10 mb-3 opacity-20 group-hover/logo:opacity-100 group-hover/logo:text-primary transition-opacity" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Brand Identity</span>
                                </>
                            )}
                        </div>
                    )}
                </div>

                <EditableField tagName="h1" html={project.name || ''} onChange={() => { }} onBlur={(e) => handleContentChange('name', e.currentTarget.innerHTML)} placeholder="UNTITLED PROJECT" className="text-6xl font-bold font-headline text-foreground tracking-tighter leading-[0.9] max-w-3xl" />

                <div className="inline-flex items-center gap-3 mt-8 bg-muted/5 px-4 py-2 rounded-full border border-border/40">
                    {project.universityLogoUrl ? (
                        <div className="relative w-6 h-6 flex-shrink-0 cursor-pointer" onClick={() => uniLogoInputRef.current?.click()}>
                            <input type="file" ref={uniLogoInputRef} onChange={handleUniLogoChange} accept="image/png, image/jpeg, image/svg+xml" className="hidden" disabled={isUniLogoUploading} />
                            <Image src={project.universityLogoUrl} alt="University Logo" layout="fill" objectFit="contain" />
                        </div>
                    ) : (
                        <div
                            className="relative w-6 h-6 flex-shrink-0 border border-dashed rounded-full flex items-center justify-center cursor-pointer hover:border-primary text-muted-foreground/30 hover:text-primary transition-colors"
                            onClick={() => uniLogoInputRef.current?.click()}
                        >
                            <input type="file" ref={uniLogoInputRef} onChange={handleUniLogoChange} accept="image/png, image/jpeg, image/svg+xml" className="hidden" disabled={isUniLogoUploading} />
                            {isUniLogoUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Landmark className="w-3.5 h-3.5" />}
                        </div>
                    )}
                    <EditableField html={project.university || ''} onChange={() => { }} onBlur={(e) => handleContentChange('university', e.currentTarget.innerHTML)} placeholder="Institution Name" className="font-bold text-[11px] uppercase tracking-[0.2em] text-muted-foreground" />
                </div>
            </header>

            <main className="relative z-10 flex-grow flex items-center justify-center text-center px-12">
                <div className="max-w-3xl space-y-4">
                    <div className="h-px w-12 bg-primary/20 mx-auto" />
                    <EditableField
                        html={project.projectDescription || ''}
                        onChange={() => { }}
                        onBlur={(e) => handleContentChange('projectDescription', e.currentTarget.innerHTML)}
                        placeholder="Enter a sophisticated project abstract..."
                        className="text-2xl text-muted-foreground leading-relaxed italic font-serif"
                        tagName="div"
                    />
                    <div className="h-px w-12 bg-primary/20 mx-auto" />
                </div>
            </main>

            <footer className="relative z-10 flex-shrink-0 pt-16">
                <div className="text-center mb-12 space-y-6">
                    <div className="space-y-1">
                        <EditableField html={project.educationalLevel || ''} onChange={() => { }} onBlur={(e) => handleContentChange('educationalLevel', e.currentTarget.innerHTML)} placeholder="Educational Level" className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60" />
                        <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/40 italic">In Pursuance Of</div>
                        <EditableField html={project.specialization || ''} onChange={() => { }} onBlur={(e) => handleContentChange('specialization', e.currentTarget.innerHTML)} placeholder="Domain Specialization" className="text-2xl font-bold tracking-tight" />
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/40">Production Team</h3>
                        <EditableField html={Array.isArray(project.teamMembers) ? project.teamMembers.join(', ') : ''} onChange={() => { }} onBlur={(e) => handleContentChange('teamMembers', e.currentTarget.innerHTML)} placeholder="Lead Researcher, Team Members" className="text-xl font-bold tracking-tight text-foreground/80" />
                    </div>
                </div>

                <div className="flex justify-between items-end border-t border-border/40 pt-8 mt-auto">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 group/edit">
                            <EditableField html={project.supervisor || ''} onChange={() => { }} onBlur={(e) => handleContentChange('supervisor', e.currentTarget.innerHTML)} placeholder="Chief Supervisor" className="font-bold text-xs uppercase tracking-wider" />
                            <Badge variant="outline" className="h-4 text-[8px] uppercase tracking-tighter opacity-0 group-hover/edit:opacity-100 transition-opacity">Advisor</Badge>
                        </div>
                        <EditableField html={project.course || ''} onChange={() => { }} onBlur={(e) => handleContentChange('course', e.currentTarget.innerHTML)} placeholder="Academic Course / Module" className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest" />
                    </div>

                    <div className="text-right">
                        <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 mb-1">Issue Date</div>
                        <ContentEditable
                            html={currentDate}
                            onChange={() => { }}
                            onBlur={(e) => handleDateChange(e.currentTarget.innerHTML)}
                            className="outline-none focus:bg-primary/5 focus:shadow-inner p-1 rounded-md text-[11px] font-bold uppercase tracking-widest text-foreground/60"
                            tagName="p"
                        />
                    </div>
                </div>
            </footer>
        </div>
    );
};
