'use client';

import React from 'react';
import { Project } from '@/modules/projects/domain/entities/Project';
import { Chapter } from '@/modules/ai-content/domain/entities/Chapter';
import { Section } from '@/modules/ai-content/domain/entities/Section';
import MarkdownEditor from './MarkdownEditor';
import { MarkdownViewer } from '@/components/shared/MarkdownViewer';

interface DocumentProps {
    project: Project;
    viewMode: 'edit' | 'preview';
    onMarkdownChange: (newMarkdown: string) => void;
}

export const Document = ({ project, viewMode, onMarkdownChange }: DocumentProps) => {
    return (
        <div className="pb-32">
            {viewMode === 'edit' ? (
                <MarkdownEditor
                    content={project.fullMarkdownContent}
                    onChange={onMarkdownChange}
                    onDebouncedChange={onMarkdownChange}
                />
            ) : (
                <div className="space-y-12">
                    {project.content.map((item, index) => {
                        if (item instanceof Chapter) {
                            return (
                                <div key={item.id} id={`item-${item.id}`} className="space-y-8 scroll-mt-24">
                                    <div className="border-b border-primary/10 pb-4">
                                        <h2 className="text-2xl font-black font-headline uppercase tracking-tight text-primary flex items-center gap-3">
                                            <span className="text-xs opacity-40 tabular-nums">0{index + 1}</span>
                                            {item.title}
                                        </h2>
                                    </div>
                                    <div className="space-y-8 pl-4 border-l-2 border-primary/5 ml-2">
                                        {item.sections.map((section, sIndex) => (
                                            <div key={section.id} id={`item-${section.id}`} className="space-y-4 scroll-mt-24">
                                                <h3 className="text-lg font-bold font-headline flex items-center gap-2">
                                                    <span className="text-[10px] opacity-40 tabular-nums">{index + 1}.{sIndex + 1}</span>
                                                    {section.title}
                                                </h3>
                                                <MarkdownViewer content={section.content} noScroll />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        }

                        if (item instanceof Section) {
                            return (
                                <div key={item.id} id={`item-${item.id}`} className="space-y-4 scroll-mt-24">
                                    <h3 className="text-lg font-bold font-headline flex items-center gap-2">
                                        <span className="text-[10px] opacity-40 tabular-nums">{index + 1}</span>
                                        {item.title}
                                    </h3>
                                    <MarkdownViewer content={item.content} noScroll />
                                </div>
                            );
                        }

                        return null;
                    })}
                </div>
            )}
        </div>
    );
};
