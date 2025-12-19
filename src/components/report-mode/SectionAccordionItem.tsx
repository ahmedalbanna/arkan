
'use client';

import { AccordionContent, AccordionTrigger } from '@/components/ui/accordion';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore } from '@/hooks';
import type { Section, SectionType } from '@/lib/models';
import { GripVertical, Link as LinkIcon, Loader2, SlidersHorizontal, Sparkles, StickyNote, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Input } from '../ui/input';
import { ContextSelector } from './SectionContextSelector';
import { SectionGenerationControls } from './SectionGenerationControls';
import { GuidelineEditor } from './SectionGuidelineEditor';
import { useSectionGenerator } from '@/hooks/report-mode/use-section-generator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';


export function SectionAccordionItem({
    itemKey,
    section,
    handleProps,
    index,
    chapterIndex,
    onDelete,
}: {
    itemKey: string,
    section: Section,
    handleProps?: any,
    index: number,
    chapterIndex: number,
    onDelete: () => void;
}) {
    const { t } = useLocalization();
    const { updateProject } = useBuilderStore();
    const { onGenerate, isGenerating, isAnythingGenerating, hasCredits } = useSectionGenerator();

    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState(section.title);

    const form = useForm();

    useEffect(() => {
        setEditedTitle(section.title);
    }, [section.title]);

    function handleTitleSave() {
        if (editedTitle.trim() && editedTitle !== section.title) {
            updateProject(p => p.updateSectionTitle(section.id, editedTitle.trim()));
        }
        setIsEditing(false);
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') {
            handleTitleSave();
        } else if (e.key === 'Escape') {
            setEditedTitle(section.title);
            setIsEditing(false);
        }
    }

    const handleSectionTypeChange = (newType: SectionType) => {
        updateProject(p => {
            const sec = p.getSection(itemKey);
            if (sec) {
                sec.type = newType;
            }
        });
    };

    const canGenerate = hasCredits && !isAnythingGenerating;

    function handleGenerateClick(e: React.MouseEvent) {
        e.stopPropagation();
        if (canGenerate) {
            onGenerate(section.id);
        }
    }

    const sectionTypes: { value: SectionType, label: string }[] = [
        { value: 'generation', label: 'AI Generation' },
        { value: 'utilities', label: 'Utilities' },
    ];


    return (
        <div className="bg-background border rounded-lg">
            <div className="flex items-center px-4 py-2">
                <AccordionTrigger className="flex-1 hover:no-underline py-0">
                    <div className="flex items-center gap-2 flex-1 min-w-0" onDoubleClick={() => setIsEditing(true)}>
                        {handleProps && (
                            <div {...handleProps} className="p-1 cursor-grab touch-none -ml-2 flex items-center gap-1 text-muted-foreground">
                                <span className="text-xs w-8 text-left">{chapterIndex + 1}.{index + 1}</span>
                                <GripVertical className="h-5 w-5" />
                            </div>
                        )}
                        {isGenerating && <Loader2 className="h-4 w-4 animate-spin" />}
                        {isEditing ? (
                            <Input
                                value={editedTitle}
                                onChange={(e) => setEditedTitle(e.target.value)}
                                onBlur={handleTitleSave}
                                onKeyDown={handleKeyDown}
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                                className="font-medium border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto bg-transparent"
                            />
                        ) : (
                            <span className="font-medium p-0 h-auto truncate">
                                {section.title}
                            </span>
                        )}
                    </div>
                </AccordionTrigger>
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
                                Are you sure you want to delete the section "{section.title}"? This cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={onDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
            <AccordionContent>
                <FormProvider {...form}>
                    <div className="border-t">
                        <div className="p-4 space-y-2">
                             <Label>Section Type</Label>
                             <Select onValueChange={(value) => handleSectionTypeChange(value as SectionType)} value={section.type || 'generation'}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a section type..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {sectionTypes?.map(s => (
                                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Tabs defaultValue="controls" className="w-full">
                            <div className="px-4">
                                <TooltipProvider>
                                    <TabsList className="grid w-full grid-cols-3">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <TabsTrigger value="controls"><SlidersHorizontal className="h-4 w-4" /></TabsTrigger>
                                            </TooltipTrigger>
                                            <TooltipContent><p>{t('builder.reportGenerator.tool_tab_controls')}</p></TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <TabsTrigger value="prompt"><StickyNote className="h-4 w-4" /></TabsTrigger>
                                            </TooltipTrigger>
                                            <TooltipContent><p>{t('builder.reportGenerator.tool_tab_prompt')}</p></TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <TabsTrigger value="context"><LinkIcon className="h-4 w-4" /></TabsTrigger>
                                            </TooltipTrigger>
                                            <TooltipContent><p>{t('builder.reportGenerator.tool_tab_context')}</p></TooltipContent>
                                        </Tooltip>
                                    </TabsList>
                                </TooltipProvider>
                            </div>
                            <div className="px-4">
                                <TabsContent value="controls" className="py-4">
                                    <SectionGenerationControls section={section} />
                                </TabsContent>
                                <TabsContent value="prompt" className="py-4">
                                    <GuidelineEditor itemKey={itemKey} />
                                </TabsContent>
                                <TabsContent value="context" className="py-4">
                                    <ContextSelector itemKey={itemKey} />
                                </TabsContent>
                            </div>
                        </Tabs>
                        <div className="p-4 border-t">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            onClick={handleGenerateClick}
                                            disabled={!canGenerate}
                                            className='w-full'
                                        >
                                            {isGenerating ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Sparkles className="me-2 h-4 w-4" />}
                                            {t('builder.reportGenerator.generateButton')}
                                        </Button>
                                    </TooltipTrigger>
                                    {!canGenerate && (
                                        <TooltipContent>
                                            <p>{isAnythingGenerating ? "Another generation is in progress." : "Insufficient credits."}</p>
                                        </TooltipContent>
                                    )}
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>
                </FormProvider>
            </AccordionContent>
        </div>
    );
}
