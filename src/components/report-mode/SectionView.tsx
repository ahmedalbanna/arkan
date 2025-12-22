
'use client';

import type { SectionName } from '@/ai/schemas';

import { ArrowDown, ArrowUp, BookText, Brush, Languages, List, ListOrdered, Loader2, PlusCircle, Quote, Sparkles, Strikethrough, Table, Trash2, Volume2, Square } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { Button } from '../ui/button';

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useLocalization } from '@/context/LocalizationContext';
import dynamic from 'next/dynamic';
import { Input } from '../ui/input';
import { useAiActions, useBrowserSpeech } from '@/hooks';
import type { Editor } from '@tiptap/react';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';


const RichTextEditor = dynamic(() => import('@/components/report-mode/RichTextEditor'), { ssr: false });

interface SectionProps {
    chapterId: string;
    sectionIndex: number;
    sectionKey: SectionName;
    title: string;
    content: string;
    onUpdate: (key: SectionName, value: string) => void;
    onTitleChange: (key: SectionName, newTitle: string) => void;
    onAddSection: (chapterId: string, index: number) => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    onDelete: () => void;
    isFirst: boolean;
    isLast: boolean;
}

export const SectionView = ({ chapterId, sectionIndex, sectionKey, title, content, onUpdate, onTitleChange, onAddSection, onMoveUp, onMoveDown, onDelete, isFirst, isLast }: SectionProps) => {
    const { t } = useLocalization();
    const [editor, setEditor] = useState<Editor | null>(null);

    const words = useMemo(() => content?.split(/\s+/).filter(Boolean).length || 0, [content]);
    const chars = useMemo(() => content?.length || 0, [content]);

    const { activeAiAction, isProcessing, handleAiAction, rewriteStyles } = useAiActions({
        editor,
        onTextUpdate: (newText, from, to) => {
            if (!editor) return;
            editor.chain().focus().insertContentAt({ from, to }, newText).run();
        },
        onWholeUpdate: (newText) => {
            onUpdate(sectionKey, newText);
        },
    });

    const { speak, stop, isSpeaking } = useBrowserSpeech();

    function handleReadAloudClick() {
        if (!editor) return;
        if (isSpeaking) {
          stop();
        } else {
          const { from, to } = editor.state.selection;
          const textToRead = editor.state.doc.textBetween(from, to) || editor.getText();
          speak(textToRead);
        }
      }

    return (
        <div className="space-y-4">
            <div className="group relative flex flex-col gap-2">
                { sectionKey && (
                    <>
                        <div className="flex items-center gap-2">
                            <Input
                                value={title}
                                onChange={(e) => onTitleChange(sectionKey, e.target.value)}
                                className="font-semibold text-lg md:text-xl text-primary/90 font-headline border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto"
                            />
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                                 {/* AI Actions */}
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleAiAction('summarize')} disabled={isProcessing}>
                                            {activeAiAction === 'summarize' ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookText className="h-4 w-4" />}
                                        </Button>
                                        </TooltipTrigger>
                                        <TooltipContent><p>{t('builder.Section.aiActions.summarize')}</p></TooltipContent>
                                    </Tooltip>
                                    <DropdownMenu>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-7 w-7" disabled={isProcessing}>
                                                    {activeAiAction === 'rewrite' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brush className="h-4 w-4" />}
                                                </Button>
                                                </DropdownMenuTrigger>
                                            </TooltipTrigger>
                                            <TooltipContent><p>{t('builder.Section.aiActions.rewrite')}</p></TooltipContent>
                                        </Tooltip>
                                        <DropdownMenuContent>
                                            {rewriteStyles.map(({ label, style }) => (
                                            <DropdownMenuItem key={style} onSelect={() => handleAiAction('rewrite', { style })} disabled={isProcessing}>
                                                {label}
                                            </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleReadAloudClick}>
                                            {isSpeaking ? <Square className="h-4 w-4 text-red-500 fill-current" /> : <Volume2 className="h-4 w-4" />}
                                        </Button>
                                        </TooltipTrigger>
                                        <TooltipContent><p>{isSpeaking ? 'Stop' : t('builder.Section.tooltips.readAloud')}</p></TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>

                                {/* Structural Actions */}
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
                    </>
                )}
                 <div className="absolute -bottom-4 left-0 right-0 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-full h-px bg-primary/20"></div>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute h-8 w-8 rounded-full bg-background hover:bg-muted"
                      onClick={() => onAddSection(chapterId, sectionIndex + 1)}
                    >
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
};
