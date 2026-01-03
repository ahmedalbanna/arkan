
'use client';

import { Project } from '@/lib/models';
import { Landmark, UploadCloud } from 'lucide-react';
import Image from 'next/image';
import React, { useRef } from 'react';
import ContentEditable from 'react-contenteditable';
import { useBuilderStore } from '@/hooks';
import { cn } from '@/lib/utils/cn';
import { useImageUpload } from '@/hooks/core/useImageUpload';
import { Loader2 } from 'lucide-react';


interface CoverPageProps {
    project: Project | null;
}

const DetailRow: React.FC<{ label: string; value?: string | string[] }> = ({ label, value }) => {
    if (!value || (Array.isArray(value) && value.length === 0)) return null;
    const displayValue = Array.isArray(value) ? value.join(', ') : value;
    return (
        <div className="flex justify-between items-center text-lg">
            <p className="font-semibold text-muted-foreground">{label}:</p>
            <p className="font-medium">{displayValue}</p>
        </div>
    );
};

export const CoverPage: React.FC<CoverPageProps> = ({ project }) => {
    const { updateProject } = useBuilderStore();
    const { isUploading, handleFileUpload } = useImageUpload();
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const EditableField = ({ field, placeholder, className, isTextarea = false }: { field: keyof Project, placeholder: string, className: string, isTextarea?: boolean }) => {
        const value = project[field] as string | string[] || '';
        const displayValue = Array.isArray(value) ? value.join(', ') : value;
        return (
            <ContentEditable
                html={displayValue}
                onBlur={(e) => handleContentChange(field, e.target.innerHTML)}
                data-placeholder={placeholder}
                className={cn("outline-none focus:bg-primary/5 focus:shadow-inner p-1 rounded-md empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground empty:before:opacity-60", className)}
                tagName={isTextarea ? 'div' : 'p'}
            />
        );
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

    return (
        <div className="relative bg-background shadow-lg mx-auto my-4 w-full max-w-[210mm] h-[297mm] box-border overflow-hidden p-12 flex flex-col">
            {/* Decorative elements */}
            <div className="absolute -top-24 -left-24 w-72 h-72 bg-primary/5 rounded-full filter blur-3xl"></div>
            <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-accent/5 rounded-full filter blur-3xl"></div>

            {/* Header */}
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
                <EditableField field="name" placeholder="Untitled Project" className="text-5xl font-bold font-headline text-primary leading-tight" />
                 <div className="inline-flex items-center gap-2 text-muted-foreground mt-4">
                    <Landmark className="w-5 h-5" />
                     <EditableField field="university" placeholder="University Name" className="font-semibold text-lg tracking-wider" />
                </div>
            </header>

            {/* Main Content (Centered) */}
            <main className="relative z-10 flex-grow flex items-center justify-center text-center">
                 <div className="max-w-2xl">
                    <EditableField
                        field="projectDescription"
                        placeholder="Project Description..."
                        className="text-2xl text-muted-foreground leading-relaxed italic"
                        isTextarea={true}
                    />
                    <div className="mt-8 flex justify-center gap-x-8 gap-y-2 text-lg">
                        <EditableField field="projectType" placeholder="Project Type" className="font-medium" />
                        <span className="text-muted-foreground">|</span>
                        <EditableField field="specialization" placeholder="Specialization" className="font-medium" />
                    </div>
                 </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 flex-shrink-0 pt-12">
                 <div className="text-center mb-8">
                    <h3 className="text-lg font-semibold text-muted-foreground">Submitted By</h3>
                    <EditableField field="teamMembers" placeholder="Team Members, separated by commas" className="text-xl font-medium" />
                </div>
                 <div className="flex justify-between items-end text-sm text-muted-foreground">
                    <div>
                        <EditableField field="supervisor" placeholder="Supervisor Name" className="font-bold" />
                        <EditableField field="course" placeholder="Course Name" className="" />
                    </div>
                    <ContentEditable
                        html={currentDate}
                        onBlur={(e) => handleDateChange(e.target.innerHTML)}
                        className="outline-none focus:bg-primary/5 focus:shadow-inner p-1 rounded-md"
                        tagName="p"
                    />
                 </div>
            </footer>
        </div>
    );
};
