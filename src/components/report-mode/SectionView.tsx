
'use client';

import type { SectionName } from '@/ai/schemas';
import { useSectionLogic } from '@/hooks';
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Wand2, ThumbsDown, Check, ArrowUp, ArrowDown } from 'lucide-react';
import { DiffView } from '../shared/DiffView';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/lib/utils/markdown-styles';
import dynamic from 'next/dynamic';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';

const RichTextEditor = dynamic(() => import('@/components/ui/RichTextEditor'), { ssr: false });

interface SectionProps {
    chapterTitle?: string;
    sectionKey: SectionName;
    title: string;
    content: string; // The markdown content of the section
    onUpdate: (key: SectionName, value: string) => void;
    onTitleChange: (key: SectionName, newTitle: string) => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    isFirst: boolean;
    isLast: boolean;
}

export const SectionView = ({ chapterTitle, sectionKey, title, content, onUpdate, onTitleChange, onMoveUp, onMoveDown, isFirst, isLast }: SectionProps) => {
    const {
        aiSuggestion,
        diff,
        t,
        handleSuggestion,
        handleAcceptSuggestion,
        handleRejectSuggestion,
        words,
        chars,
    } = useSectionLogic(sectionKey, content, onUpdate);

    return (
        <div className="space-y-4">
            <div className="group relative flex flex-col gap-2">
                 {chapterTitle && <Badge variant="secondary" className="w-fit">{chapterTitle}</Badge>}
                <div className="flex items-center gap-2">
                    <Input
                        value={title}
                        onChange={(e) => onTitleChange(sectionKey, e.target.value)}
                        className="font-semibold text-lg md:text-xl text-primary/90 font-headline border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto"
                    />
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                        <Button variant="ghost" size="icon" onClick={onMoveUp} disabled={isFirst} className="h-7 w-7">
                            <ArrowUp className="h-4 w-4"/>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={onMoveDown} disabled={isLast} className="h-7 w-7">
                             <ArrowDown className="h-4 w-4"/>
                        </Button>
                    </div>
                </div>
            </div>
            <div className="space-y-1 text-xs text-muted-foreground">
                <span>{words} {t('builder.Section.words')}</span>
                <span className="mx-2">|</span>
                <span>{chars} {t('builder.Section.characters')}</span>
            </div>

            <div className="group relative space-y-4 mt-4">
                <RichTextEditor
                    content={content}
                    onChange={(newMarkdown) => onUpdate(sectionKey, newMarkdown)}
                    onAiSuggestion={handleSuggestion}
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
                                <ReactMarkdown components={markdownComponents}>
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
