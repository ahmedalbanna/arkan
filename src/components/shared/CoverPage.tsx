
'use client';

import { Project } from '@/lib/models';
import { Landmark, UploadCloud, Frame, Loader2 } from 'lucide-react';
import Image from 'next/image';
import React, { useRef, useState } from 'react';
import ContentEditable from 'react-contenteditable';
import { useBuilderStore } from '@/hooks';
import { cn } from '@/lib/utils/cn';
import { useImageUpload } from '@/hooks/core/useImageUpload';

interface CoverPageProps {
    project: Project | null;
}

const EditableField: React.FC<{
  html: string;
  onBlur: (e: React.FocusEvent<HTMLDivElement>) => void;
  placeholder: string;
  className: string;
  tagName?: 'p' | 'div';
}> = ({ html, onBlur, placeholder, className, tagName = 'p' }) => {
    return (
        <ContentEditable
            html={html}
            onBlur={onBlur}
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
            Object.assign(p, props);
        });
    };
    
    const handleDateChange = (value: string) => {
         const sanitizedValue = value.replace(/<br>/g, '\n').replace(/&nbsp;/g, ' ').replace(/<[^>]+>/g, '');
         updateProject(p => {
             p.meta.updated = new Date(sanitizedValue).toISOString();
         });
    };
    
    const handleMainLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            handleMainLogoUpload(file, (dataUri) => {
                updateProject(p => { p.logoUrl = dataUri; });
            });
        }
    };
    
    const handleUniLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            handleUniLogoUpload(file, (dataUri) => {
                updateProject(p => { p.universityLogoUrl = dataUri; });
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
                    <div className="relative w-32 h-32 mb-6 cursor-pointer" onClick={() => mainLogoInputRef.current?.click()}>
                         <input type="file" ref={mainLogoInputRef} onChange={handleMainLogoChange} accept="image/png, image/jpeg, image/svg+xml" className="hidden" disabled={isMainLogoUploading} />
                        <Image src={project.logoUrl} alt="Project Logo" layout="fill" objectFit="contain" />
                    </div>
                ) : (
                    <div 
                        className="relative w-32 h-32 mb-6 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-muted-foreground cursor-pointer hover:border-primary hover:text-primary transition-colors"
                        onClick={() => mainLogoInputRef.current?.click()}
                    >
                        <input type="file" ref={mainLogoInputRef} onChange={handleMainLogoChange} accept="image/png, image/jpeg, image/svg+xml" className="hidden" disabled={isMainLogoUploading} />
                        {isMainLogoUploading ? (
                            <Loader2 className="w-8 h-8 animate-spin" />
                        ) : (
                           <>
                             <UploadCloud className="w-8 h-8 mb-2"/>
                             <span className="text-xs text-center">Upload Logo</span>
                           </>
                        )}
                    </div>
                )}
                <EditableField html={project.name} onBlur={(e) => handleContentChange('name', e.currentTarget.innerHTML)} placeholder="Untitled Project" className="text-5xl font-bold font-headline text-primary leading-tight" />
                 <div className="inline-flex items-center gap-2 text-muted-foreground mt-4">
                    {project.universityLogoUrl ? (
                        <div className="relative w-8 h-8 flex-shrink-0 cursor-pointer" onClick={() => uniLogoInputRef.current?.click()}>
                            <input type="file" ref={uniLogoInputRef} onChange={handleUniLogoChange} accept="image/png, image/jpeg, image/svg+xml" className="hidden" disabled={isUniLogoUploading} />
                            <Image src={project.universityLogoUrl} alt="University Logo" layout="fill" objectFit="contain" />
                        </div>
                    ) : (
                        <div className="relative w-8 h-8 flex-shrink-0 border-2 border-dashed rounded-md flex items-center justify-center cursor-pointer hover:border-primary" onClick={() => uniLogoInputRef.current?.click()}>
                             <input type="file" ref={uniLogoInputRef} onChange={handleUniLogoChange} accept="image/png, image/jpeg, image/svg+xml" className="hidden" disabled={isUniLogoUploading} />
                            {isUniLogoUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Landmark className="w-5 h-5 text-muted-foreground/50" />}
                        </div>
                    )}
                     <EditableField html={project.university || ''} onBlur={(e) => handleContentChange('university', e.currentTarget.innerHTML)} placeholder="University Name" className="font-semibold text-lg tracking-wider" />
                </div>
            </header>

            <main className="relative z-10 flex-grow flex items-center justify-center text-center">
                 <div className="max-w-2xl">
                    <EditableField
                        html={project.projectDescription || ''}
                        onBlur={(e) => handleContentChange('projectDescription', e.currentTarget.innerHTML)}
                        placeholder="Project Description..."
                        className="text-2xl text-muted-foreground leading-relaxed italic"
                        tagName="div"
                    />
                    <div className="mt-8 flex justify-center gap-x-8 gap-y-2 text-lg">
                        <EditableField html={project.educationalLevel || ''} onBlur={(e) => handleContentChange('educationalLevel', e.currentTarget.innerHTML)} placeholder="Educational Level" className="font-medium" />
                        <span className="text-muted-foreground">|</span>
                        <EditableField html={project.specialization || ''} onBlur={(e) => handleContentChange('specialization', e.currentTarget.innerHTML)} placeholder="Specialization" className="font-medium" />
                    </div>
                 </div>
            </main>

            <footer className="relative z-10 flex-shrink-0 pt-12">
                 <div className="text-center mb-8">
                    <h3 className="text-lg font-semibold text-muted-foreground">Submitted By</h3>
                    <EditableField html={Array.isArray(project.teamMembers) ? project.teamMembers.join(', ') : ''} onBlur={(e) => handleContentChange('teamMembers', e.currentTarget.innerHTML)} placeholder="Team Members, separated by commas" className="text-xl font-medium" />
                </div>
                 <div className="flex justify-between items-end text-sm text-muted-foreground">
                    <div>
                        <EditableField html={project.supervisor || ''} onBlur={(e) => handleContentChange('supervisor', e.currentTarget.innerHTML)} placeholder="Supervisor Name" className="font-bold" />
                        <EditableField html={project.course || ''} onBlur={(e) => handleContentChange('course', e.currentTarget.innerHTML)} placeholder="Course Name" className="" />
                    </div>
                    <ContentEditable
                        html={currentDate}
                        onBlur={(e) => handleDateChange(e.currentTarget.innerHTML)}
                        className="outline-none focus:bg-primary/5 focus:shadow-inner p-1 rounded-md"
                        tagName="p"
                    />
                 </div>
            </footer>
        </div>
    );
};
