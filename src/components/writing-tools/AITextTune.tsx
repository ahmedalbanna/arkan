
'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useTextStylistLogic } from '@/hooks/writing-tools/use-text-stylist-logic';
import { markdownComponents } from '@/lib/utils/markdown-styles';
import { BookOpenText, Check, Copy, Loader2, Sparkles, Wand2 } from 'lucide-react';
import { Controller } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';
import { DiffView } from '../shared/DiffView';

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
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                                            <div className="prose dark:prose-invert max-w-none text-sm">
                                                <ReactMarkdown components={markdownComponents}>{processedText || t('writingTools.textStylist.processedTextPlaceholder')}</ReactMarkdown>
                                            </div>
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
