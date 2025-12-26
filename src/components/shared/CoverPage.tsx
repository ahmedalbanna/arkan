

'use client';

import { Project } from '@/lib/models';
import { Landmark } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

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
    if (!project) return null;
    const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const teamMemberNames = project.teamMembers?.join(', ');

    return (
        <div className="relative bg-background shadow-lg mx-auto my-4 w-full max-w-[210mm] h-[297mm] box-border overflow-hidden p-12 flex flex-col">
            {/* Decorative elements */}
            <div className="absolute -top-24 -left-24 w-72 h-72 bg-primary/5 rounded-full filter blur-3xl"></div>
            <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-accent/5 rounded-full filter blur-3xl"></div>

            {/* Header */}
            <header className="relative z-10 text-center flex flex-col items-center pt-8 pb-12 flex-shrink-0">
                {project.logoUrl && (
                    <div className="relative w-32 h-32 mb-6">
                        <Image src={project.logoUrl} alt="Project Logo" layout="fill" objectFit="contain" />
                    </div>
                )}
                 <h1 className="text-5xl font-bold font-headline text-primary leading-tight">
                    {project.name || 'Untitled Project'}
                </h1>
                {project.university && (
                    <div className="inline-flex items-center gap-2 text-muted-foreground mt-4">
                        <Landmark className="w-5 h-5" />
                        <p className="font-semibold text-lg tracking-wider">{project.university}</p>
                    </div>
                )}
            </header>

            {/* Main Content (Centered) */}
            <main className="relative z-10 flex-grow flex items-center justify-center text-center">
                 <div className="max-w-2xl">
                    {project.projectDescription && (
                        <p className="text-2xl text-muted-foreground leading-relaxed italic">
                            &ldquo;{project.projectDescription}&rdquo;
                        </p>
                    )}
                    <div className="mt-8 flex justify-center gap-x-8 gap-y-2 text-lg">
                        {project.projectType && <span className="font-medium">{project.projectType}</span>}
                        {project.specialization && <span className="text-muted-foreground">|</span>}
                        {project.specialization && <span className="font-medium">{project.specialization}</span>}
                    </div>
                 </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 flex-shrink-0 pt-12">
                 {teamMemberNames && (
                    <div className="text-center mb-8">
                        <h3 className="text-lg font-semibold text-muted-foreground">Submitted By</h3>
                        <p className="text-xl font-medium">{teamMemberNames}</p>
                    </div>
                 )}
                 <div className="flex justify-between items-end text-sm text-muted-foreground">
                    <div>
                        <p className="font-bold">{project.supervisor || 'Supervisor Name'}</p>
                        <p>{project.course || 'Course Name'}</p>
                    </div>
                    <p>{currentDate}</p>
                 </div>
            </footer>
        </div>
    );
};
