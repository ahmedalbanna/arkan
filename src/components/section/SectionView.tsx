

'use client';

import type { SectionName } from '@/ai/schemas';
import { useSectionLogic } from '@/hooks';
import { markdownComponents } from '@/lib/markdown-styles';
import { Check, ThumbsDown, Wand2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { DiffView } from '../shared/DiffView';
import RichTextEditor from '../ui/RichTextEditor';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';

interface SectionProps {
    sectionKey: SectionName;
    title: string;
    content: string | any; // The markdown content of the section, handling various types
    onUpdate: (key: SectionName, value: string) => void;
}

export const Section = ({ sectionKey, title, content, onUpdate }: SectionProps) => {
    const {
        aiSuggestion,
        diff,
        t,
        handleAcceptSuggestion,
        handleRejectSuggestion,
        handleAiAction,
        handleReadAloud,
        isProcessingAi,
        isReadingAloud,
        words,
        chars
    } = useSectionLogic(sectionKey, content, onUpdate);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="font-semibold text-lg md:text-xl text-primary/90 font-headline flex items-center gap-2">
                    {title}
                </h2>
                {/* The main toolbar is now handled by the BubbleMenu in the editor */}
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
                    onAiAction={handleAiAction}
                    onReadAloud={handleReadAloud}
                    isProcessingAi={isProcessingAi}
                    isReadingAloud={isReadingAloud}
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
