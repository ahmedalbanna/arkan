
'use client';

import type { SectionName } from '@/ai/schemas';

import { ArrowDown, ArrowUp, Languages, Loader2, PlusCircle, Trash2, Volume2, Square, Copy, PlusSquare } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '../ui/button';

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useLocalization } from '@/context/LocalizationContext';
import dynamic from 'next/dynamic';
import { Input } from '../ui/input';
import { useAiActions, useBrowserSpeech, useToast } from '@/hooks';
import type { Editor } from '@tiptap/react';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip';
import { useBuilderStore } from '@/hooks';


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
    const { toast } = useToast();
    const { updateProject } = useBuilderStore();
    const [editor, setEditor] = useState<Editor | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    const words = useMemo(() => content?.split(/\s+/).filter(Boolean).length || 0, [content]);
    const chars = useMemo(() => content?.length || 0, [content]);

    const { handleAiAction } = useAiActions({
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
    
    function handleCopy() {
        if (!content) return;
        navigator.clipboard.writeText(content).then(() => {
            setIsCopied(true);
            toast({ title: 'Section content copied!' });
            setTimeout(() => setIsCopied(false), 2000);
        });
    }

    function handleDuplicate() {
        if (!chapterId || !sectionKey) return;
        updateProject(p => p.duplicateSection(sectionKey));
        toast({ title: 'Section Duplicated' });
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
                            <div className="flex items-center">
                                {/* AI Actions */}
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy}>
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                        </TooltipTrigger>
                                        <TooltipContent><p>Copy Content</p></TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleDuplicate}>
                                            <PlusSquare className="h-4 w-4" />
                                        </Button>
                                        </TooltipTrigger>
                                        <TooltipContent><p>Duplicate Section</p></TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleAiAction('translate', {})}>
                                            <Languages className="h-4 w-4" />
                                        </Button>
                                        </TooltipTrigger>
                                        <TooltipContent><p>Translate</p></TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleReadAloudClick}>
                                            {isSpeaking ? <Square className="h-4 w-4 text-red-500 fill-current" /> : <Volume2 className="h-4 w-4" />}
                                        </Button>
                                        </TooltipTrigger>
                                        <TooltipContent><p>{isSpeaking ? 'Stop Speaking' : t('builder.Section.tooltips.readAloud')}</p></TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>

                                <div className="h-6 w-px bg-border mx-1"></div>

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
