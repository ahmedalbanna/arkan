
'use client';

import React, { useState, useEffect } from 'react';
import type { ProjectProposal, ManipulateTextOutput } from '@/ai/schemas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pin, Briefcase, Users, ShieldAlert, BadgeEuro, Calendar, CheckCircle, Flag, Braces, Wand2, BookText, Maximize, PenLine, Loader2, MoreVertical, CheckSquare, Copy, Trash2, SpellCheck, X, Check, FilePenLine, Languages } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { useToast } from '@/hooks/use-toast';
import { markdownComponents } from '@/lib/markdown-components';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useAuth } from '@/context/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { useLocalization } from '@/context/LocalizationContext';
import { useTranslate } from '@/hooks/use-translation';


interface EditableFieldProps {
    value: string | number;
    path: string;
    onUpdate?: (path: string, value: any) => void;
    multiline?: boolean;
    type?: string;
    className?: string;
    readOnly?: boolean;
}

export const EditableField: React.FC<EditableFieldProps> = ({ value, path, onUpdate, multiline = false, type = 'text', className = '', readOnly = false }) => {
    const { t } = useLocalization();
    const [isEditing, setIsEditing] = useState(false);
    const [currentValue, setCurrentValue] = useState(value);
    const [ast, setAst] = useState<object | null>(null);
    const [isAiPopoverOpen, setIsAiPopoverOpen] = useState(false);
    const { toast } = useToast();
    const { firebaseUser } = useAuth();
    const queryClient = useQueryClient();
    const { locale } = useLocalization();
    const translateMutation = useTranslate();
    
    const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

    const isProcessingAi = translateMutation.isPending;


    useEffect(() => {
        if (!isEditing && aiSuggestion === null) {
            setCurrentValue(value);
        }
    }, [value, isEditing, aiSuggestion]);

    const handleSave = () => {
        if (readOnly) return;
        if (currentValue !== value) {
            onUpdate?.(path, currentValue);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (readOnly) return;
        if (e.key === 'Enter' && !multiline) {
            handleSave();
        }
        if (e.key === 'Escape') {
            setCurrentValue(value);
            setIsEditing(false);
        }
    };

    const handleViewAst = () => {
        const tree = unified().use(remarkParse).parse(String(currentValue));
        setAst(tree);
    };

    const handleTranslate = async () => {
        if (readOnly || !firebaseUser) return;
        
        translateMutation.mutate({ 
            text: String(currentValue),
            targetLang: locale === 'en' ? 'ar' : 'en' 
        }, {
            onSuccess: (data) => {
                setAiSuggestion(data.translatedText);
                toast({ title: t('builder.editableSection.toasts.translateSuccess') });
            },
            onError: (error) => {
                const isCreditError = error.message.toLowerCase().includes('credit');
                toast({ 
                    title: t('builder.editableSection.toasts.translateFailed'), 
                    description: isCreditError ? t('builder.toasts.insufficientCredits') : error.message,
                    variant: 'destructive' 
                });
            },
            onSettled: () => setIsAiPopoverOpen(false),
        });
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(String(currentValue));
        toast({ title: t('builder.proposalViewer.toasts.copied') });
    };

    const handleDelete = () => {
        if (readOnly) return;
        onUpdate?.(path, '');
        toast({ title: t('builder.proposalViewer.toasts.cleared') });
    };

    const handleAcceptSuggestion = () => {
        if (readOnly) return;
        if (aiSuggestion !== null) {
            onUpdate?.(path, aiSuggestion);
        }
        setAiSuggestion(null);
    };

    const handleRejectSuggestion = () => {
        setAiSuggestion(null);
    };


    if (aiSuggestion !== null && !readOnly) {
        return (
            <div className="p-2 -m-2 rounded-md border-2 border-dashed border-accent bg-accent/10 my-2">
                <p className="text-xs font-semibold text-accent-foreground mb-2">{t('builder.proposalViewer.aiSuggestion')}</p>
                <div className="p-2 rounded bg-background max-h-60 overflow-y-auto">
                    <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>{aiSuggestion}</ReactMarkdown>
                </div>
                <div className="flex justify-end gap-2 mt-2">
                    <Button variant="ghost" size="sm" onClick={handleRejectSuggestion}>
                        <X className="mr-2 h-4 w-4" />
                        {t('builder.proposalViewer.reject')}
                    </Button>
                    <Button variant="secondary" size="sm" onClick={handleAcceptSuggestion}>
                        <Check className="mr-2 h-4 w-4" />
                        {t('builder.proposalViewer.accept')}
                    </Button>
                </div>
            </div>
        );
    }

    if (isEditing && !readOnly) {
        if (multiline) {
            return (
                <Textarea
                    value={String(currentValue)}
                    onChange={(e) => setCurrentValue(e.target.value)}
                    onBlur={handleSave}
                    autoFocus
                    className="bg-background/80"
                    rows={5}
                />
            );
        }
        return (
            <Input
                type={type}
                value={String(currentValue)}
                onChange={(e) => setCurrentValue(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                autoFocus
                className="bg-background/80"
            />
        );
    }

    return (
        <div
            onDoubleClick={() => !readOnly && setIsEditing(true)}
            className={`group min-h-[2.5rem] p-2 -m-2 rounded-md relative ${className} ${!readOnly ? 'hover:bg-muted/50 cursor-pointer' : ''}`}
        >
            {multiline ? <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>{String(value)}</ReactMarkdown> : <div>{String(value)}</div>}

            {!readOnly && multiline && (
                <div className="absolute top-1 right-1 flex items-center gap-1 opacity-0 group-hover:opacity-100">
                    <Popover open={isAiPopoverOpen} onOpenChange={setIsAiPopoverOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-56 p-2">
                            <div className="grid gap-1">
                                <p className="p-2 text-xs font-semibold text-muted-foreground">{t('builder.proposalViewer.aiActions.title')}</p>
                                <Button variant="ghost" className="justify-start" onClick={handleTranslate} disabled={isProcessingAi}>
                                    {isProcessingAi ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Languages className="mr-2 h-4 w-4" />}
                                    {t('builder.proposalViewer.aiActions.translate')}
                                </Button>

                                <p className="p-2 text-xs font-semibold text-muted-foreground pt-2 border-t mt-1">{t('builder.proposalViewer.markdownTools.title')}</p>
                                
                                <Button variant="ghost" className="justify-start" onClick={handleCopy}>
                                    <Copy className="mr-2 h-4 w-4" /> {t('builder.proposalViewer.markdownTools.copy')}
                                </Button>

                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="ghost" className="justify-start" onClick={handleViewAst}>
                                            <Braces className="mr-2 h-4 w-4" /> {t('builder.proposalViewer.markdownTools.viewAst')}
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl">
                                        <DialogHeader>
                                            <DialogTitle>{t('builder.proposalViewer.markdownTools.astTitle')}</DialogTitle>
                                        </DialogHeader>
                                        <pre className="mt-2 h-[450px] w-full overflow-auto rounded-md bg-muted p-4">
                                            <code className="text-muted-foreground text-xs">
                                                {ast ? JSON.stringify(ast, null, 2) : 'Loading...'}
                                            </code>
                                        </pre>
                                    </DialogContent>
                                </Dialog>

                                <p className="p-2 text-xs font-semibold text-muted-foreground pt-2 border-t mt-1">{t('builder.proposalViewer.destructive.title')}</p>
                                <Button variant="ghost" className="justify-start text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleDelete}>
                                    <Trash2 className="mr-2 h-4 w-4" /> {t('builder.proposalViewer.destructive.delete')}
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            )}
        </div>
    );
};


export default function ProposalViewer({ proposal, onUpdate, readOnly = false }: { proposal: ProjectProposal; onUpdate?: (path: string, value: any) => void; readOnly?: boolean; }) {
    const { t } = useLocalization();
    if (!proposal) return null;

    const defaultOpen = ["Objective", "Methodology"];

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="w-fit mb-2">
                        <EditableField value={proposal.category} path="category" onUpdate={onUpdate} readOnly={readOnly} />
                    </div>
                    <CardTitle className="font-headline text-2xl text-primary">
                        <EditableField value={proposal.title} path="title" onUpdate={onUpdate} readOnly={readOnly} />
                    </CardTitle>
                </CardHeader>
            </Card>

            <Accordion type="multiple" className="w-full space-y-6" defaultValue={defaultOpen}>
                <AccordionItem value="Objective" className="border-b-0">
                    <Card>
                        <AccordionTrigger className="w-full text-left p-6 hover:no-underline">
                            <CardTitle className="flex items-center gap-2 font-headline text-lg"><Pin className="h-5 w-5 text-primary" /> {t('builder.proposalViewer.objective')}</CardTitle>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="p-6 pt-0">
                                <EditableField value={proposal.objective} path="objective" onUpdate={onUpdate} multiline readOnly={readOnly} />
                            </div>
                        </AccordionContent>
                    </Card>
                </AccordionItem>

                <AccordionItem value="Methodology" className="border-b-0">
                    <Card>
                        <AccordionTrigger className="w-full text-left p-6 hover:no-underline">
                            <CardTitle className="flex items-center gap-2 font-headline text-lg"><Briefcase className="h-5 w-5 text-primary" /> {t('builder.proposalViewer.methodology')}</CardTitle>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="p-6 pt-0">
                                <EditableField value={proposal.methodology} path="methodology" onUpdate={onUpdate} multiline readOnly={readOnly} />
                            </div>
                        </AccordionContent>
                    </Card>
                </AccordionItem>

                <AccordionItem value="Timeline" className="border-b-0">
                    <Card>
                        <AccordionTrigger className="w-full text-left p-6 hover:no-underline">
                            <CardTitle className="flex items-center gap-2 font-headline text-lg"><Calendar className="h-5 w-5 text-primary" /> {t('builder.proposalViewer.timeline')}</CardTitle>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="p-6 pt-0 space-y-4">
                                <div className="flex items-center gap-2"><strong>{t('builder.proposalViewer.startDate')}</strong> <EditableField value={proposal.timeline.startDate} path="timeline.startDate" onUpdate={onUpdate} type="date" readOnly={readOnly} /></div>
                                <div className="flex items-center gap-2"><strong>{t('builder.proposalViewer.endDate')}</strong> <span className="text-muted-foreground">{proposal.timeline.endDate}</span></div>
                                <h4 className="font-semibold">{t('builder.proposalViewer.phases')}</h4>
                                <ul className="space-y-2 text-muted-foreground">
                                    {proposal.timeline.phases.map((phase, index) => (
                                        <li key={index} className="flex justify-between items-center gap-2">
                                            <EditableField value={phase.name} path={`timeline.phases.${index}.name`} onUpdate={onUpdate} readOnly={readOnly} />
                                            <div className="flex items-center gap-1">
                                                (<EditableField value={phase.durationWeeks} path={`timeline.phases.${index}.durationWeeks`} onUpdate={onUpdate} type="number" className="w-16 text-center" readOnly={readOnly} /> {t('builder.proposalViewer.weeks')})
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </AccordionContent>
                    </Card>
                </AccordionItem>

                <AccordionItem value="Budget" className="border-b-0">
                    <Card>
                        <AccordionTrigger className="w-full text-left p-6 hover:no-underline">
                            <CardTitle className="flex items-center gap-2 font-headline text-lg"><BadgeEuro className="h-5 w-5 text-primary" /> {t('builder.proposalViewer.budget')}</CardTitle>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="p-6 pt-0">
                                <div className="mb-4 flex gap-2 items-center">
                                    <strong>{t('builder.proposalViewer.total')}</strong>
                                    <span className="text-muted-foreground">{proposal.budget.totalAmount.toLocaleString()}</span>
                                    <EditableField value={proposal.budget.currency} path="budget.currency" onUpdate={onUpdate} className="w-20" readOnly={readOnly} />
                                </div>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>{t('builder.proposalViewer.item')}</TableHead>
                                            <TableHead className="text-left">{t('builder.proposalViewer.cost')}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {proposal.budget.breakdown.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell><EditableField value={item.item} path={`budget.breakdown.${index}.item`} onUpdate={onUpdate} readOnly={readOnly} /></TableCell>
                                                <TableCell className="text-left"><EditableField value={item.cost} path={`budget.breakdown.${index}.cost`} onUpdate={onUpdate} type="number" readOnly={readOnly} /></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </AccordionContent>
                    </Card>
                </AccordionItem>

                <AccordionItem value="Outcomes" className="border-b-0">
                    <Card>
                        <AccordionTrigger className="w-full text-left p-6 hover:no-underline">
                            <CardTitle className="flex items-center gap-2 font-headline text-lg"><Flag className="h-5 w-5 text-primary" /> {t('builder.proposalViewer.outcomes')}</CardTitle>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="p-6 pt-0">
                                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                                    {proposal.expected_outcome.map((outcome, index) => (
                                        <li key={index}><EditableField value={outcome} path={`expected_outcome.${index}`} onUpdate={onUpdate} multiline readOnly={readOnly} /></li>
                                    ))}
                                </ul>
                            </div>
                        </AccordionContent>
                    </Card>
                </AccordionItem>

                <AccordionItem value="Success" className="border-b-0">
                    <Card>
                        <AccordionTrigger className="w-full text-left p-6 hover:no-underline">
                            <CardTitle className="flex items-center gap-2 font-headline text-lg"><CheckCircle className="h-5 w-5 text-primary" /> {t('builder.proposalViewer.successCriteria')}</CardTitle>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="p-6 pt-0 space-y-4">
                                <h4 className="font-semibold">{t('builder.proposalViewer.criteria')}</h4>
                                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                                    {proposal.success_criteria.map((criterion, index) => (
                                        <li key={index}><EditableField value={criterion} path={`success_criteria.${index}`} onUpdate={onUpdate} multiline readOnly={readOnly} /></li>
                                    ))}
                                </ul>
                                <h4 className="font-semibold pt-4 border-t">{t('builder.proposalViewer.evaluationPlan')}</h4>
                                <EditableField value={proposal.evaluation} path="evaluation" onUpdate={onUpdate} multiline readOnly={readOnly} />
                            </div>
                        </AccordionContent>
                    </Card>
                </AccordionItem>

                <AccordionItem value="Stakeholders" className="border-b-0">
                    <Card>
                        <AccordionTrigger className="w-full text-left p-6 hover:no-underline">
                            <CardTitle className="flex items-center gap-2 font-headline text-lg"><Users className="h-5 w-5 text-primary" /> {t('builder.proposalViewer.stakeholders')}</CardTitle>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="p-6 pt-0">
                                {proposal.stakeholders.map((stakeholder, index) => (
                                    <div key={index} className="mb-4 not-last:border-b not-last:pb-4">
                                        <div className="font-bold"><EditableField value={stakeholder.name} path={`stakeholders.${index}.name`} onUpdate={onUpdate} readOnly={readOnly} /></div>
                                        <div className="text-sm"><EditableField value={stakeholder.role} path={`stakeholders.${index}.role`} onUpdate={onUpdate} readOnly={readOnly} /></div>
                                        <EditableField value={stakeholder.interest} path={`stakeholders.${index}.interest`} onUpdate={onUpdate} multiline readOnly={readOnly} />
                                    </div>
                                ))}
                            </div>
                        </AccordionContent>
                    </Card>
                </AccordionItem>

                <AccordionItem value="Risks" className="border-b-0">
                    <Card>
                        <AccordionTrigger className="w-full text-left p-6 hover:no-underline">
                            <CardTitle className="flex items-center gap-2 font-headline text-lg"><ShieldAlert className="h-5 w-5 text-primary" /> {t('builder.proposalViewer.risks')}</CardTitle>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="p-6 pt-0">
                                {proposal.risks.map((risk, index) => (
                                    <div key={index} className="mb-4 not-last:border-b not-last:pb-4">
                                        <div><strong>{t('builder.proposalViewer.risk')}</strong> <EditableField value={risk.description} path={`risks.${index}.description`} onUpdate={onUpdate} multiline readOnly={readOnly} /></div>
                                        <div><strong>{t('builder.proposalViewer.mitigation')}</strong> <EditableField value={risk.mitigation} path={`risks.${index}.mitigation`} onUpdate={onUpdate} multiline readOnly={readOnly} /></div>
                                    </div>
                                ))}
                            </div>
                        </AccordionContent>
                    </Card>
                </AccordionItem>
            </Accordion>
        </div>
    );
}
