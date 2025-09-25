'use client';

import type { AnyProjectProposal } from '@/ai/schemas';
import { Button } from '@/components/ui/button';
import { SectionToolbar } from '../section/SectionToolbar';
import RichTextEditor from '../ui/RichTextEditor';
import { Card, CardFooter, CardHeader, CardTitle, CardContent } from '../ui/card';
import { useSectionLogic } from '@/hooks';
import type { SectionName } from '@/ai/schemas';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { markdownComponents } from '@/lib/markdown-styles';
import { DiffView } from '../shared/DiffView';
import { Wand2, ThumbsDown, Check } from 'lucide-react';

interface ProposalSectionProps {
    sectionKey: string; // Use string for general keys
    title: string;
    content: string; // The markdown content of the section
    onUpdate: (key: string, value: string) => void;
}

export const ProposalSection = ({ sectionKey, title, content, onUpdate }: ProposalSectionProps) => {
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
    );
};
