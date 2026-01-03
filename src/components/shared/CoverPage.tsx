
'use client';

import { Project } from '@/lib/models';
import { Landmark, UploadCloud, Frame } from 'lucide-react';
import Image from 'next/image';
import React, { useRef, useState } from 'react';
import ContentEditable from 'react-contenteditable';
import { useBuilderStore } from '@/hooks';
import { cn } from '@/lib/utils/cn';
import { useImageUpload } from '@/hooks/core/useImageUpload';
import { Loader2 } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';
import { Tooltip, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { TooltipContent } from '@radix-ui/react-tooltip';

interface CoverPageProps {
    project: Project | null;
}

const EditableField = ({ field, placeholder, className, isTextarea = false, project, handleContentChange }: { field: keyof Project, placeholder: string, className: string, isTextarea?: boolean, project: Project, handleContentChange: (field: keyof Project, value: string) => void }) => {
    const value = project[field] as string | string[] || '';
    const displayValue = Array.isArray(value) ? value.join(', ') : value;
    return (
        <ContentEditable
            html={displayValue}
            onBlur={(e) => handleContentChange(field, e.currentTarget.innerHTML)}
            data-placeholder={placeholder}
            className={cn("outline-none focus:bg-primary/5 focus:shadow-inner p-1 rounded-md empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground empty:before:opacity-60", className)}
            tagName={isTextarea ? 'div' : 'p'}
        />
    );
};

export const CoverPage: React.FC<CoverPageProps> = ({ project }) => {
    const { updateProject } = useBuilderStore();
    const { isUploading, handleFileUpload } = useImageUpload();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [frameStyle, setFrameStyle] = useState<'professional' | 'academic' | 'creative'>('professional');

    if (!project) return null;
    
    const currentDate = project.meta.updated ? new Date(project.meta.updated).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const handleContentChange = (field: keyof Project, value: string) => {
        const sanitizedValue = value.replace(/<br>/g, '\n').replace(/&nbsp;/g, ' ').replace(/<[^>]+>/g, '');
        updateProject(p => {
            if (field === 'teamMembers') {
                (p as any)[field] = sanitizedValue.split(',').map(s => s.trim());
            } else {
                (p as any)[field] = sanitizedValue;
            }
        });
    };
    
    const handleDateChange = (value: string) => {
         const sanitizedValue = value.replace(/<br>/g, '\n').replace(/&nbsp;/g, ' ').replace(/<[^>]+>/g, '');
         updateProject(p => {
             p.meta.updated = new Date(sanitizedValue).toISOString();
         });
    };

    const handleLogoPlaceholderClick = () => {
        fileInputRef.current?.click();
    };

    const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            handleFileUpload(file, (dataUri) => {
                updateProject(p => { 
                    p.logoUrl = dataUri;
                });
            });
        }
    };
    
    const frameClasses = {
        professional: 'border-primary/20',
        academic: 'border-double border-primary/50',
        creative: 'border-dashed border-accent'
    };

    return (
        <div className={cn("relative bg-background shadow-lg mx-auto my-4 w-full max-w-[210mm] h-[297mm] box-border overflow-hidden p-12 flex flex-col border-4", frameClasses[frameStyle])}>
            {frameStyle === 'professional' && (
              <>
                <div className="absolute -top-24 -left-24 w-72 h-72 bg-primary/5 rounded-full filter blur-3xl"></div>
                <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-accent/5 rounded-full filter blur-3xl"></div>
              </>
            )}
             {frameStyle === 'academic' && (
              <div className="absolute inset-0 border-8 border-primary/10 m-4"></div>
            )}
             {frameStyle === 'creative' && (
                 <>
                    <div className="absolute top-0 left-0 w-32 h-32 bg-accent/10 [clip-path:polygon(0_0,100%_0,0_100%)]"></div>
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/10 [clip-path:polygon(100%_100%,0_100%,100%_0)]"></div>
                 </>
            )}


            <header className="relative z-10 text-center flex flex-col items-center pt-8 pb-12 flex-shrink-0">
                 {project.logoUrl ? (
                    <div className="relative w-32 h-32 mb-6">
                        <Image src={project.logoUrl} alt="Project Logo" layout="fill" objectFit="contain" />
                    </div>
                ) : (
                    <div 
                        className="relative w-32 h-32 mb-6 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-muted-foreground cursor-pointer hover:border-primary hover:text-primary transition-colors"
                        onClick={handleLogoPlaceholderClick}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleLogoChange}
                            accept="image/png, image/jpeg, image/svg+xml"
                            className="hidden"
                            disabled={isUploading}
                        />
                        {isUploading ? (
                            <Loader2 className="w-8 h-8 animate-spin" />
                        ) : (
                           <>
                             <UploadCloud className="w-8 h-8 mb-2"/>
                             <span className="text-xs text-center">Upload Logo</span>
                           </>
                        )}
                    </div>
                )}
                <EditableField field="name" placeholder="Untitled Project" className="text-5xl font-bold font-headline text-primary leading-tight" project={project} handleContentChange={handleContentChange} />
                 <div className="inline-flex items-center gap-2 text-muted-foreground mt-4">
                    <Landmark className="w-5 h-5" />
                     <EditableField field="university" placeholder="University Name" className="font-semibold text-lg tracking-wider" project={project} handleContentChange={handleContentChange} />
                </div>
            </header>

            <main className="relative z-10 flex-grow flex items-center justify-center text-center">
                 <div className="max-w-2xl">
                    <EditableField
                        field="projectDescription"
                        placeholder="Project Description..."
                        className="text-2xl text-muted-foreground leading-relaxed italic"
                        isTextarea={true}
                        project={project}
                        handleContentChange={handleContentChange}
                    />
                    <div className="mt-8 flex justify-center gap-x-8 gap-y-2 text-lg">
                        <EditableField field="educationalLevel" placeholder="Educational Level" className="font-medium" project={project} handleContentChange={handleContentChange} />
                        <span className="text-muted-foreground">|</span>
                        <EditableField field="specialization" placeholder="Specialization" className="font-medium" project={project} handleContentChange={handleContentChange} />
                    </div>
                 </div>
            </main>

            <footer className="relative z-10 flex-shrink-0 pt-12">
                 <div className="text-center mb-8">
                    <h3 className="text-lg font-semibold text-muted-foreground">Submitted By</h3>
                    <EditableField field="teamMembers" placeholder="Team Members, separated by commas" className="text-xl font-medium" project={project} handleContentChange={handleContentChange} />
                </div>
                 <div className="flex justify-between items-end text-sm text-muted-foreground">
                    <div>
                        <EditableField field="supervisor" placeholder="Supervisor Name" className="font-bold" project={project} handleContentChange={handleContentChange} />
                        <EditableField field="course" placeholder="Course Name" className="" project={project} handleContentChange={handleContentChange} />
                    </div>
                    <ContentEditable
                        html={currentDate}
                        onBlur={(e) => handleDateChange(e.currentTarget.innerHTML)}
                        className="outline-none focus:bg-primary/5 focus:shadow-inner p-1 rounded-md"
                        tagName="p"
                    />
                 </div>
            </footer>

            <div className="absolute top-4 right-4 z-20">
                <TooltipProvider>
                    <ToggleGroup type="single" defaultValue="professional" value={frameStyle} onValueChange={(value) => value && setFrameStyle(value as any)}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <ToggleGroupItem value="professional" aria-label="Professional Frame"><Frame /></ToggleGroupItem>
                            </TooltipTrigger>
                            <TooltipContent><p>Professional</p></TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <ToggleGroupItem value="academic" aria-label="Academic Frame"><Frame /></ToggleGroupItem>
                            </TooltipTrigger>
                            <TooltipContent><p>Academic</p></TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <ToggleGroupItem value="creative" aria-label="Creative Frame"><Frame /></ToggleGroupItem>
                            </TooltipTrigger>
                            <TooltipContent><p>Creative</p></TooltipContent>
                        </Tooltip>
                    </ToggleGroup>
                </TooltipProvider>
            </div>
        </div>
    );
};
