
'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGuidelineEditor } from '@/hooks/use-guideline-editor';
import { markdownComponents } from '@/lib/markdown-styles';
import { Plus, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Textarea } from '../ui/textarea';

interface GuidelineEditorProps {
    itemKey: string;
    agentId: string;
    isAdmin: boolean | undefined;
}

export function GuidelineEditor({ itemKey, agentId, isAdmin }: GuidelineEditorProps) {
    const {
        t,
        agentsLoaded,
        agent,
        promptConfig,
        hasGuidelines,
        currentGuidelineState,
        customGuidelineInput,
        oneTimeInstruction,
        handleGuidelineToggle,
        setCustomGuidelineInputForItem,
        handleAddCustomGuidelineForItem,
        handleRemoveCustomGuidelineForItem,
        setOneTimeInstruction,
    } = useGuidelineEditor(itemKey, agentId);

    if (!agentsLoaded) {
        return <div>Loading guidelines...</div>;
    }

    if (!agent || !promptConfig) {
        return <div>Agent configuration not found.</div>;
    }

    return (
        <AnimatedContainer animation="fade-in-up" delay={200}>
            <div className="space-y-6">
                <AnimatedContainer animation="fade-in-up" delay={300}>
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold text-muted-foreground font-headline">{t('builder.reportGenerator.tool_prompt_label')}</Label>
                        <div className="p-3 rounded-md border bg-gradient-to-r from-muted/50 to-primary/5 backdrop-blur-sm shadow-soft">
                            <ReactMarkdown components={markdownComponents}>{promptConfig.base}</ReactMarkdown>
                        </div>
                    </div>
                </AnimatedContainer>

                <AnimatedContainer animation="fade-in-up" delay={400}>
                    <div className="space-y-2">
                        <Label htmlFor={`one-time-instructions-${itemKey}`} className="text-xs font-semibold text-muted-foreground font-headline">Instructions for this generation</Label>
                        <Textarea
                            id={`one-time-instructions-${itemKey}`}
                            placeholder="e.g., 'Focus on the financial benefits' or 'Keep the tone very formal.'"
                            value={oneTimeInstruction || ''}
                            onChange={(e) => setOneTimeInstruction(itemKey, e.target.value)}
                            rows={3}
                            className="hover:shadow-soft transition-all duration-200 resize-none"
                        />
                    </div>
                </AnimatedContainer>

                {hasGuidelines && (
                    <AnimatedContainer animation="fade-in-up" delay={500}>
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-muted-foreground font-headline">{t('builder.reportGenerator.guidelines')}</Label>
                            <div className="space-y-2 p-3 rounded-md border bg-gradient-to-r from-muted/50 to-primary/5 backdrop-blur-sm shadow-soft">
                                {promptConfig.guidelines!.map((guideline, index) => (
                                    <AnimatedContainer key={index} animation="fade-in-up" delay={100 + (index * 100)}>
                                        <div className="flex items-start gap-2 p-2 rounded-lg hover:bg-gradient-to-r hover:from-primary/5 hover:to-blue-500/5 transition-all duration-200">
                                            <Checkbox
                                                id={`guideline-${itemKey}-${index}`}
                                                checked={currentGuidelineState?.checked[index] ?? false}
                                                onCheckedChange={(checked) => handleGuidelineToggle(itemKey, index, !!checked)}
                                                className="hover:shadow-soft transition-all duration-200"
                                            />
                                            <Label htmlFor={`guideline-${itemKey}-${index}`} className="font-normal text-sm flex-1 cursor-pointer">
                                                <ReactMarkdown components={markdownComponents}>{guideline.text}</ReactMarkdown>
                                            </Label>
                                        </div>
                                    </AnimatedContainer>
                                ))}
                            </div>
                        </div>
                    </AnimatedContainer>
                )}

                <AnimatedContainer animation="fade-in-up" delay={600}>
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold text-muted-foreground font-headline">{t('builder.reportGenerator.customGuidelines')}</Label>
                        {currentGuidelineState?.custom.map((custom, index) => (
                            <AnimatedContainer key={index} animation="fade-in-up" delay={100 + (index * 100)}>
                                <div className="flex items-center gap-2 text-sm p-2 rounded-lg hover:bg-gradient-to-r hover:from-primary/5 hover:to-blue-500/5 transition-all duration-200">
                                    <span>- {custom}</span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-5 w-5 hover:shadow-soft transition-all duration-200"
                                        onClick={() => handleRemoveCustomGuidelineForItem(itemKey, index)}
                                    >
                                        <Trash2 className="h-3 w-3 text-destructive" />
                                    </Button>
                                </div>
                            </AnimatedContainer>
                        ))}
                        <div className="flex gap-2">
                            <Input
                                placeholder={t('builder.reportGenerator.addGuidelinePlaceholder')}
                                value={customGuidelineInput[itemKey] || ''}
                                onChange={(e) => setCustomGuidelineInputForItem(itemKey, e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomGuidelineForItem(itemKey))}
                                className="hover:shadow-soft transition-all duration-200"
                            />
                            <Button
                                type="button"
                                variant="gradient"
                                onClick={() => handleAddCustomGuidelineForItem(itemKey)}
                                className="hover:shadow-glow transition-all duration-200"
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </AnimatedContainer>
            </div>
        </AnimatedContainer>
    );
}
