'use client';

import type { SectionName } from '@/ai/schemas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useSectionLogic } from '@/hooks';
import { Check, ThumbsDown, Wand2 } from 'lucide-react';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import RichTextEditor from '../ui/RichTextEditor';
import { markdownComponents } from '@/lib/markdown-styles';
import { DiffView } from '../shared/DiffView';
import { SectionToolbar } from './SectionToolbar';

interface SectionProps {
    sectionKey: SectionName;
    title: string;
    icon: React.ElementType; // Icon component for the section
    content: string; // The markdown content of the section
    onUpdate: (key: SectionName, value: string) => void;
}

export const Section = ({ sectionKey, title, icon: Icon, content, onUpdate }: SectionProps) => {
    const {
        aiSuggestion,
        diff,
        t,
        handleAcceptSuggestion,
        handleRejectSuggestion,
        handleAiAction,
        handleReadAloud,
        isProcessingAi,
        ttsMutation,
        words,
        chars
    } = useSectionLogic(sectionKey, content, onUpdate);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                 <h2 className="font-semibold text-lg md:text-xl text-primary/90 font-headline flex items-center gap-2">
                    <Icon className="w-5 h-5"/>
                    {title}
                </h2>
                 <SectionToolbar
                    isProcessingAi={isProcessingAi}
                    onAiAction={handleAiAction}
                    onReadAloud={handleReadAloud}
                    isReadingAloud={ttsMutation.isPending}
                />
            </div>
            <div className="space-y-1 text-xs text-muted-foreground">
                <span>{words} {t('builder.Section.words')}</span>
                <span className="mx-2">|</span>
                <span>{chars} {t('builder.Section.characters')}</span>
            </div>
            <div className="group relative space-y-4 mt-4">
                <RichTextEditor
                    content={content} // Pass the original content
                    onChange={(newMarkdown) => onUpdate(sectionKey, newMarkdown)}
                />

                {aiSuggestion && (
                    <Card className="mt-4 border-accent">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Wand2 className="h-5 w-5 text-accent" /> {t('builder.Section.aiSuggestion')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="prose dark:prose-invert max-w-none text-sm p-4 bg-muted/50 rounded-md max-h-60 overflow-y-auto">
                            {diff ? (
                                <DiffView diff={diff} />
                            ) : (
                                <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
                                    {aiSuggestion}
                                </ReactMarkdown>
                            )}
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2 pt-4">
                            <Button variant="ghost" onClick={handleRejectSuggestion}>
                                <ThumbsDown className="me-2 h-4 w-4" /> {t('builder.Section.reject')}
                            </Button>
                            <Button onClick={handleAcceptSuggestion}>
                                <Check className="me-2 h-4 w-4" /> {t('builder.Section.accept')}
                            </Button>
                        </CardFooter>
                    </Card>
                )}
            </div>
        </div>
    );
};
