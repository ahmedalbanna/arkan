
'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useTextStylistLogic } from '@/modules/ai/adapters/hooks/writing-tools/use-text-stylist-logic';
import { markdownComponents } from '@/modules/ai-content/adapters/components/report-mode/markdown-styles';
import { BookOpenText, Check, Copy, Edit3, Eye, Lightbulb, Loader2, Scissors, Sparkles, Wand2 } from 'lucide-react';
import { Controller } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';
import { DiffView } from '@/components/shared/DiffView';

function ResultDetails({ result }: { result: any }) {
    if (!result) return null;
    // Heuristics: show output fields in nice format
    return (
        <div className="space-y-2 mt-2">
            {/* Readability/clarity/conciseness scores */}
            {typeof result.readabilityScore === 'number' && (
                <Badge variant="outline">Readability Score: {result.readabilityScore}/100</Badge>
            )}
            {typeof result.clarityScore === 'number' && (
                <Badge variant="outline">Clarity Score: {result.clarityScore}/100</Badge>
            )}
            {/* Word count reduction stats */}
            {typeof result.reductionPercentage === 'number' && (
                <Badge variant="outline">
                    Reduction: {result.reductionPercentage}% ({result.originalWordCount}→{result.newWordCount} words)
                </Badge>
            )}
            {/* Improvements/suggestions lists */}
            {result.improvements?.length > 0 && (
                <div>
                    <Separator className="my-2" />
                    <Label>Improvements</Label>
                    <ul className="list-disc pl-6 mt-1">
                        {result.improvements.map((imp: string, i: number) => (
                            <li key={i}>{imp}</li>
                        ))}
                    </ul>
                </div>
            )}
            {result.suggestions?.length > 0 && (
                <div>
                    <Separator className="my-2" />
                    <Label>Suggestions</Label>
                    <ul className="list-disc pl-6 mt-1">
                        {result.suggestions.map((s: any, i: number) => (
                            <li key={i}>
                                <b>{s.issue}</b>: {s.suggestion} {s.location && <span>({s.location})</span>}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

const styles = [
    "Informal", "Friendly", "Simple", "Formal", "Professional", "Narrative",
    "Descriptive", "Expository", "Argumentative", "Persuasive", "Creative",
    "Technical", "Academic", "Journalistic", "Poetic", "Satirical", "Humorous"
];

export function AITextTune() {
    const {
        t,
        form,
        rewriteMutation,
        summarizeMutation,
        styleEditorMutation,
        readabilityMutation,
        concisenessMutation,
        clarityMutation,
        isProcessing,
        originalText,
        processedText,
        diff,
        isCopied,
        compressionRatio,
        setCompressionRatio,
        activeView,
        setActiveView,
        onSubmitRewrite,
        onSubmitSummarize,
        onSubmitStyleEditor,
        onSubmitReadability,
        onSubmitConciseness,
        onSubmitClarity,
        handleCopy,
    } = useTextStylistLogic();

    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="p-6">
                    <form className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="input-text" className="text-lg font-semibold">{t('writingTools.textStylist.yourTextLabel')}</Label>
                            <Textarea
                                id="input-text"
                                {...form.register('text')}
                                rows={8}
                                placeholder="Enter your text here..."
                                className="mt-2"
                                disabled={isProcessing}
                            />
                            {form.formState.errors.text && <p className="text-sm text-destructive mt-1">{form.formState.errors.text.message}</p>}
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('writingTools.textStylist.aiToolsTitle')}</CardTitle>
                    <CardDescription>{t('writingTools.textStylist.aiToolsDescription')}</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <form onSubmit={form.handleSubmit(onSubmitRewrite)} className="space-y-4">
                        <h3 className="font-semibold flex items-center gap-2"><Wand2 className="h-5 w-5" /> {t('writingTools.textStylist.rewriteTitle')}</h3>
                        <div className="space-y-2">
                            <Label htmlFor="style-select">{t('writingTools.textStylist.styleLabel')}</Label>
                            <Controller
                                name="style"
                                control={form.control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isProcessing}>
                                        <SelectTrigger id="style-select">
                                            <SelectValue placeholder={t('writingTools.textStylist.stylePlaceholder')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="None">{t('writingTools.textStylist.styleNone')}</SelectItem>
                                            {styles.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                        <Button type="submit" disabled={isProcessing} className="w-full">
                            {rewriteMutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Sparkles className="me-2 h-4 w-4" />}
                            {t('writingTools.textStylist.rewriteButton')}
                        </Button>
                    </form>

                    <form onSubmit={form.handleSubmit(onSubmitSummarize)} className="space-y-4">
                        <h3 className="font-semibold flex items-center gap-2"><BookOpenText className="h-5 w-5" /> {t('writingTools.textStylist.summarizeTitle')}</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Label>{t('writingTools.textStylist.compressionRatioLabel')}</Label>
                                <Badge variant="outline">{compressionRatio}%</Badge>
                            </div>
                            <Slider
                                value={[compressionRatio]}
                                onValueChange={(val) => setCompressionRatio(val[0])}
                                min={10} max={90} step={5}
                                disabled={isProcessing}
                            />
                        </div>
                        <Button type="submit" disabled={isProcessing} className="w-full">
                            {summarizeMutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Sparkles className="me-2 h-4 w-4" />}
                            {t('writingTools.textStylist.summarizeButton')}
                        </Button>
                    </form>

                    <form onSubmit={form.handleSubmit(onSubmitStyleEditor)} className="space-y-4">
                        <h3 className="font-semibold flex items-center gap-2"><Edit3 className="h-5 w-5" /> Style Editor</h3>
                        <div className="space-y-2">
                            <Label htmlFor="target-audience">Target Audience (Optional)</Label>
                            <Controller
                                name="targetAudience"
                                control={form.control}
                                render={({ field }) => (
                                    <Input
                                        id="target-audience"
                                        {...field}
                                        placeholder="e.g., general public, academics"
                                        disabled={isProcessing}
                                    />
                                )}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tone">Tone (Optional)</Label>
                            <Controller
                                name="tone"
                                control={form.control}
                                render={({ field }) => (
                                    <Input
                                        id="tone"
                                        {...field}
                                        placeholder="e.g., professional, casual"
                                        disabled={isProcessing}
                                    />
                                )}
                            />
                        </div>
                        <Button type="submit" disabled={isProcessing} className="w-full">
                            {styleEditorMutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Sparkles className="me-2 h-4 w-4" />}
                            Improve Style
                        </Button>
                    </form>

                    <form onSubmit={form.handleSubmit(onSubmitReadability)} className="space-y-4">
                        <h3 className="font-semibold flex items-center gap-2"><Eye className="h-5 w-5" /> Readability Enhancer</h3>
                        <div className="space-y-2">
                            <Label htmlFor="target-level">Target Reading Level (Optional)</Label>
                            <Controller
                                name="targetLevel"
                                control={form.control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value} disabled={isProcessing}>
                                        <SelectTrigger id="target-level">
                                            <SelectValue placeholder="Select reading level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="elementary">Elementary</SelectItem>
                                            <SelectItem value="middle-school">Middle School</SelectItem>
                                            <SelectItem value="high-school">High School</SelectItem>
                                            <SelectItem value="college">College</SelectItem>
                                            <SelectItem value="graduate">Graduate</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                        <Button type="submit" disabled={isProcessing} className="w-full">
                            {readabilityMutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Sparkles className="me-2 h-4 w-4" />}
                            Enhance Readability
                        </Button>
                    </form>

                    <form onSubmit={form.handleSubmit(onSubmitConciseness)} className="space-y-4">
                        <h3 className="font-semibold flex items-center gap-2"><Scissors className="h-5 w-5" /> Conciseness Checker</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Label>Target Reduction (Optional)</Label>
                                <Badge variant="outline">{form.watch('targetReduction') || 0}%</Badge>
                            </div>
                            <Controller
                                name="targetReduction"
                                control={form.control}
                                render={({ field }) => (
                                    <Slider
                                        value={[field.value || 0]}
                                        onValueChange={(val) => field.onChange(val[0])}
                                        min={0} max={50} step={5}
                                        disabled={isProcessing}
                                    />
                                )}
                            />
                        </div>
                        <Button type="submit" disabled={isProcessing} className="w-full">
                            {concisenessMutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Sparkles className="me-2 h-4 w-4" />}
                            Make Concise
                        </Button>
                    </form>

                    <form onSubmit={form.handleSubmit(onSubmitClarity)} className="space-y-4">
                        <h3 className="font-semibold flex items-center gap-2"><Lightbulb className="h-5 w-5" /> Clarity Advisor</h3>
                        <div className="space-y-2">
                            <Label htmlFor="focus-areas">Focus Areas (Optional)</Label>
                            <Controller
                                name="focusAreas"
                                control={form.control}
                                render={({ field }) => (
                                    <Input
                                        id="focus-areas"
                                        value={field.value?.join(', ') || ''}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            field.onChange(value ? value.split(',').map(s => s.trim()).filter(s => s) : []);
                                        }}
                                        placeholder="e.g., sentence structure, word choice"
                                        disabled={isProcessing}
                                    />
                                )}
                            />
                            <p className="text-xs text-muted-foreground">Separate multiple areas with commas</p>
                        </div>
                        <Button type="submit" disabled={isProcessing} className="w-full">
                            {clarityMutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Sparkles className="me-2 h-4 w-4" />}
                            Improve Clarity
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {(isProcessing || processedText || originalText) && (
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>{t('writingTools.textStylist.comparisonTitle')}</CardTitle>
                                <CardDescription>{t('writingTools.textStylist.comparisonDescription')}</CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                {diff && (
                                    <Tabs value={activeView} onValueChange={(value) => setActiveView(value as any)}>
                                        <TabsList>
                                            <TabsTrigger value="side-by-side">{t('writingTools.textStylist.sideBySideTab')}</TabsTrigger>
                                            <TabsTrigger value="diff">{t('writingTools.textStylist.diffTab')}</TabsTrigger>
                                        </TabsList>
                                    </Tabs>
                                )}
                                <Button variant="ghost" size="icon" onClick={handleCopy} disabled={!processedText}>
                                    {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {activeView === 'side-by-side' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="input-text">{t('writingTools.textStylist.originalTextLabel')}</Label>
                                    <ScrollArea className="h-72 rounded-md border p-4 bg-background">
                                        <div className="prose dark:prose-invert max-w-none text-sm">
                                            <ReactMarkdown components={markdownComponents}>{originalText || t('writingTools.textStylist.originalTextPlaceholder')}</ReactMarkdown>
                                        </div>
                                    </ScrollArea>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="output-text">{t('writingTools.textStylist.processedTextLabel')}</Label>
                                    <ScrollArea className="h-72 rounded-md border p-4 bg-muted/30">
                                        {isProcessing ? (
                                            <div className="flex items-center justify-center h-full">
                                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                            </div>
                                        ) : (
                                            <>
                                                <div className="prose dark:prose-invert max-w-none text-sm">
                                                    {/* Try to parse structured output for smart rendering */}
                                                    {typeof processedText === 'string' ? (
                                                        <ReactMarkdown components={markdownComponents}>{processedText || t('writingTools.textStylist.processedTextPlaceholder')}</ReactMarkdown>
                                                    ) : processedText && processedText.rewrittenText ? (
                                                        <ReactMarkdown components={markdownComponents}>{processedText.rewrittenText}</ReactMarkdown>
                                                    ) : processedText && processedText.editedText ? (
                                                        <ReactMarkdown components={markdownComponents}>{processedText.editedText}</ReactMarkdown>
                                                    ) : processedText && processedText.enhancedText ? (
                                                        <ReactMarkdown components={markdownComponents}>{processedText.enhancedText}</ReactMarkdown>
                                                    ) : processedText && processedText.conciseText ? (
                                                        <ReactMarkdown components={markdownComponents}>{processedText.conciseText}</ReactMarkdown>
                                                    ) : processedText && processedText.improvedText ? (
                                                        <ReactMarkdown components={markdownComponents}>{processedText.improvedText}</ReactMarkdown>
                                                    ) : null}
                                                </div>
                                                {/* Render details/metadata contextually */}
                                                <ResultDetails result={processedText} />
                                            </>
                                        )}
                                    </ScrollArea>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Label>{t('writingTools.textStylist.changesLabel')}</Label>
                                <ScrollArea className="h-72 rounded-md border p-4 bg-muted/30">
                                    {isProcessing ? (
                                        <div className="flex items-center justify-center h-full">
                                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                        </div>
                                    ) : (
                                        <div className="prose dark:prose-invert max-w-none text-sm whitespace-pre-wrap">
                                            {diff && <DiffView diff={diff} />}
                                        </div>
                                    )}
                                </ScrollArea>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
