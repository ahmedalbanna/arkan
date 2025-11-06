
'use client';

import type { SectionName } from '@/ai/schemas';
import { useSectionLogic } from '@/hooks';
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Wand2, ThumbsDown, Check, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
import { DiffView } from '../shared/DiffView';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/lib/utils/markdown-styles';
import dynamic from 'next/dynamic';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


const RichTextEditor = dynamic(() => import('@/components/report-mode/RichTextEditor'), { ssr: false });

interface SectionProps {
    chapterTitle?: string;
    sectionKey: SectionName;
    title: string;
    content: string; // The markdown content of the section
    onUpdate: (key: SectionName, value: string) => void;
    onTitleChange: (key: SectionName, newTitle: string) => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    onDelete: () => void;
    isFirst: boolean;
    isLast: boolean;
}

export const SectionView = ({ chapterTitle, sectionKey, title, content, onUpdate, onTitleChange, onMoveUp, onMoveDown, onDelete, isFirst, isLast }: SectionProps) => {
    const {
        t,
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
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                    <Trash2 className="h-4 w-4 text-destructive/70" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Section?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to delete the section "{title}"? This cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={onDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
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
                />
            </div>
        </div>
    );
};
