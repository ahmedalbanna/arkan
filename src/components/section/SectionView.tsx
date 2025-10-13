

'use client';

import type { SectionName } from '@/ai/schemas';
import { AnimatedContainer } from '@/components/ui/animation';
import { Badge } from '@/components/ui/badge';
import { useSectionLogic } from '@/hooks';
import { markdownComponents } from '@/lib/markdown-styles';
import { Check, FileText, ThumbsDown, Wand2 } from 'lucide-react';
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
        <AnimatedContainer animation="fade-in-up" delay={200}>
            <div className="space-y-6">
                <AnimatedContainer animation="fade-in-up" delay={300}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-600 shadow-soft">
                                <FileText className="h-5 w-5 text-white" />
                            </div>
                            <h2 className="font-semibold text-lg md:text-xl text-primary/90 font-headline">
                                {title}
                            </h2>
                        </div>
                        <Badge variant="secondary" className="shadow-soft">
                            {words} {t('builder.Section.words')} • {chars} {t('builder.Section.characters')}
                        </Badge>
                    </div>
                </AnimatedContainer>

                <AnimatedContainer animation="fade-in-up" delay={400}>
                    <div className="group relative space-y-4">
                        <div className="rounded-lg border bg-gradient-to-r from-background/50 to-primary/5 backdrop-blur-sm shadow-soft hover:shadow-glow transition-all duration-200">
                            <RichTextEditor
                                content={content}
                                onChange={(newMarkdown) => onUpdate(sectionKey, newMarkdown)}
                                onAiAction={handleAiAction}
                                onReadAloud={handleReadAloud}
                                isProcessingAi={isProcessingAi}
                                isReadingAloud={isReadingAloud}
                            />
                        </div>

                        {aiSuggestion && (
                            <AnimatedContainer animation="fade-in-up" delay={500}>
                                <Card className="border-accent bg-gradient-to-r from-accent/5 to-primary/5 backdrop-blur-sm shadow-soft hover:shadow-glow transition-all duration-200">
                                    <CardHeader className="bg-gradient-to-r from-accent/10 to-primary/10">
                                        <CardTitle className="text-lg flex items-center gap-2 font-headline">
                                            <div className="p-1 rounded-md bg-gradient-to-br from-accent to-accent-600">
                                                <Wand2 className="h-4 w-4 text-white" />
                                            </div>
                                            {t('builder.Section.aiSuggestion')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="prose dark:prose-invert max-w-none text-sm p-4 bg-gradient-to-r from-muted/30 to-primary/5 rounded-md max-h-60 overflow-y-auto">
                                        {diff ? (
                                            <DiffView diff={diff} />
                                        ) : (
                                            <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
                                                {aiSuggestion}
                                            </ReactMarkdown>
                                        )}
                                    </CardContent>
                                    <CardFooter className="flex justify-end gap-2 pt-4 bg-gradient-to-r from-muted/20 to-primary/5">
                                        <Button
                                            variant="ghost"
                                            onClick={handleRejectSuggestion}
                                            className="hover:shadow-soft transition-all duration-200"
                                        >
                                            <ThumbsDown className="me-2 h-4 w-4" /> {t('builder.Section.reject')}
                                        </Button>
                                        <Button
                                            onClick={handleAcceptSuggestion}
                                            variant="gradient"
                                            className="hover:shadow-glow transition-all duration-200"
                                        >
                                            <Check className="me-2 h-4 w-4" /> {t('builder.Section.accept')}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </AnimatedContainer>
                        )}
                    </div>
                </AnimatedContainer>
            </div>
        </AnimatedContainer>
    );
};
