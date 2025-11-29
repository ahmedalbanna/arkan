
'use client';

import type { SectionName } from '@/ai/schemas';

import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { Button } from '../ui/button';

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useLocalization } from '@/context/LocalizationContext';
import dynamic from 'next/dynamic';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { useBuilderStore } from '@/hooks';


const RichTextEditor = dynamic(() => import('@/components/report-mode/RichTextEditor'), { ssr: false });

interface SectionProps {
    chapterId?: string; // Add chapterId to identify which chapter to update
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

export const SectionView = ({ chapterId, chapterTitle, sectionKey, title, content, onUpdate, onTitleChange, onMoveUp, onMoveDown, onDelete, isFirst, isLast }: SectionProps) => {
    const { t } = useLocalization();
    const { updateProject } = useBuilderStore();
    const [editedChapterTitle, setEditedChapterTitle] = useState(chapterTitle || '');

    const words = useMemo(() => content?.split(/\s+/).filter(Boolean).length || 0, [content]);
    const chars = useMemo(() => content?.length || 0, [content]);

    useEffect(() => {
        setEditedChapterTitle(chapterTitle || '');
    }, [chapterTitle]);

    const handleChapterTitleSave = () => {
        if (chapterId && editedChapterTitle.trim() && editedChapterTitle !== chapterTitle) {
            updateProject(p => {
                const chap = p.getChapter(chapterId);
                if (chap) {
                    chap.title = editedChapterTitle.trim();
                }
            });
        }
    };

    const handleChapterTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === 'Escape') {
            e.currentTarget.blur(); // This will trigger onBlur to save
        }
    };

    return (
        <div className="space-y-4">
            <div className="group relative flex flex-col gap-2">
                {chapterTitle !== undefined && (
                     <Input
                        value={editedChapterTitle}
                        onChange={(e) => setEditedChapterTitle(e.target.value)}
                        onBlur={handleChapterTitleSave}
                        onKeyDown={handleChapterTitleKeyDown}
                        className="w-fit font-semibold border-0 focus-visible:ring-1 focus-visible:ring-offset-0 p-1 h-auto bg-muted text-sm text-muted-foreground"
                    />
                )}
                <div className="flex items-center gap-2">
                    <Input
                        value={title}
                        onChange={(e) => onTitleChange(sectionKey, e.target.value)}
                        className="font-semibold text-lg md:text-xl text-primary/90 font-headline border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto"
                    />
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                        <Button variant="ghost" size="icon" onClick={onMoveUp} disabled={isFirst} className="h-7 w-7">
                            <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={onMoveDown} disabled={isLast} className="h-7 w-7">
                            <ArrowDown className="h-4 w-4" />
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
                    key={sectionKey}
                    content={content}
                    onChange={(newMarkdown) => onUpdate(sectionKey, newMarkdown)}
                />
            </div>
        </div>
    );
};
