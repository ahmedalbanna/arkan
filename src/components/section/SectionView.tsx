
'use client';

import type { SectionName } from '@/ai/schemas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs } from '@/components/ui/tabs';
import { markdownComponents } from '@/lib/markdown-styles';
import { BookText, Brush, Check, GitCommitVertical, Maximize, SpellCheck, ThumbsDown, UserCheck, Wand2, X } from 'lucide-react';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useSectionLogic } from '@/hooks';
import { DiffPart } from '@/lib/diff';
import { cn } from '@/lib/utils';

interface SectionProps {
    sectionKey: SectionName;
    title: string;
    icon: React.ElementType; // Icon component for the section
    content: string; // The markdown content of the section
    onUpdate: (key: SectionName, value: string) => void;
}

const DiffView = ({ diff }: { diff: DiffPart[] }) => {
    return (
        <p className="whitespace-pre-wrap text-sm">
            {diff.map((part, index) => (
                <span key={index} className={cn({
                    'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 rounded-sm': part.type === 'added',
                    'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 line-through rounded-sm': part.type === 'removed',
                })}>
                    {part.value}
                </span>
            ))}
        </p>
    )
}

export const Section = ({ sectionKey, title, icon: Icon, content, onUpdate }: SectionProps) => {
    const {
        aiSuggestion,
        diff,
        t,
        handleAcceptSuggestion,
        handleRejectSuggestion,
        processedContent,
    } = useSectionLogic(sectionKey, content, onUpdate);

    return (
        <Tabs defaultValue="view">
            <div className="group relative space-y-4">
                <ScrollArea className="h-full">
                    <div className="prose dark:prose-invert max-w-none">
                        <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>{processedContent}</ReactMarkdown>
                    </div>
                </ScrollArea>

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
        </Tabs>
    );
};
