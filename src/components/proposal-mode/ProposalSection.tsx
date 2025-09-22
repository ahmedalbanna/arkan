
'use client';

import type { AnyProjectProposal } from '@/ai/schemas';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { markdownComponents } from '@/lib/markdown-styles';
import { useSectionLogic } from '@/hooks';
import { SectionName } from '@/ai/schemas';
import { SectionToolbar } from '../section/SectionToolbar';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { Wand2, ThumbsDown, Check } from 'lucide-react';
import { DiffPart } from '@/lib/diff';
import { cn } from '@/lib/utils';

// This is a simplified view for the diff, as the one in SectionView is not exported.
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

interface ProposalSectionProps {
    sectionKey: string; // Use string for general keys
    title: string;
    content: string; // The markdown content of the section
    onUpdate: (key: string, value: string) => void;
}

export const ProposalSection = ({ sectionKey, title, content, onUpdate }: ProposalSectionProps) => {
    // We can reuse the useSectionLogic hook here.
    // We cast sectionKey to SectionName for compatibility, though it might be a general key.
    const {
        aiSuggestion,
        diff,
        t,
        handleAcceptSuggestion,
        handleRejectSuggestion,
        processedContent,
        handleAiAction,
        handleReadAloud,
        isProcessingAi,
        ttsMutation,
        words,
        chars
    } = useSectionLogic(sectionKey as SectionName, content, onUpdate as any);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="font-semibold text-lg md:text-xl text-primary/90 font-headline">
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

            <div className="prose dark:prose-invert max-w-none text-sm md:text-base">
                <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>{processedContent}</ReactMarkdown>
            </div>

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
    );
};
