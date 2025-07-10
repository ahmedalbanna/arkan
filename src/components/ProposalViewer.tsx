
'use client';

import React, { useState, useEffect } from 'react';
import type { ProjectProposal } from '@/ai/schemas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pin, Briefcase, Users, ShieldAlert, BadgeEuro, Calendar, CheckCircle, Flag, Braces, Wand2, BookText, Maximize, PenLine, Loader2, MoreVertical, CheckSquare, Copy, Trash2, SpellCheck, X, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { manipulateText } from '@/ai/flows/manipulate-text';
import { useToast } from '@/hooks/use-toast';
import { markdownComponents } from '@/lib/markdown-components';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";


interface EditableFieldProps {
    value: string | number;
    path: string;
    onUpdate?: (path: string, value: any) => void;
    multiline?: boolean;
    type?: string;
    className?: string;
    readOnly?: boolean;
}

const EditableField: React.FC<EditableFieldProps> = ({ value, path, onUpdate, multiline = false, type = 'text', className = '', readOnly = false }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [currentValue, setCurrentValue] = useState(value);
    const [ast, setAst] = useState<object | null>(null);
    const [isAiPopoverOpen, setIsAiPopoverOpen] = useState(false);
    const [isProcessingAi, setIsProcessingAi] = useState(false);
    const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
    const { toast } = useToast();

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

    const handleAiAction = async (command: string) => {
        if (readOnly) return;
        setIsProcessingAi(true);
        setAiSuggestion(null);
        try {
            const result = await manipulateText({
                textToManipulate: String(currentValue),
                command: command,
            });
            setAiSuggestion(result.rewrittenText);
        } catch (error) {
            console.error("AI action failed:", error);
            toast({
                title: "AI Action Failed",
                description: "Could not modify the text. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsProcessingAi(false);
            setIsAiPopoverOpen(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(String(currentValue));
        toast({ title: "Copied to clipboard" });
    };

    const handleDelete = () => {
        if (readOnly) return;
        onUpdate?.(path, '');
        toast({ title: "Content cleared" });
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
                <p className="text-xs font-semibold text-accent-foreground mb-2">AI SUGGESTION</p>
                <div className="p-2 rounded bg-background max-h-60 overflow-y-auto">
                    <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>{aiSuggestion}</ReactMarkdown>
                </div>
                <div className="flex justify-end gap-2 mt-2">
                    <Button variant="ghost" size="sm" onClick={handleRejectSuggestion}>
                        <X className="mr-2 h-4 w-4" />
                        Reject
                    </Button>
                    <Button variant="secondary" size="sm" onClick={handleAcceptSuggestion}>
                        <Check className="mr-2 h-4 w-4" />
                        Accept
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
                                <p className="p-2 text-xs font-semibold text-muted-foreground">AI Actions</p>
                                <Button variant="ghost" className="justify-start" onClick={() => handleAiAction('Summarize this text concisely.')} disabled={isProcessingAi}>
                                    {isProcessingAi ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BookText className="mr-2 h-4 w-4" />}
                                    Summarize
                                </Button>
                                <Button variant="ghost" className="justify-start" onClick={() => handleAiAction('Expand on this topic, adding more detail.')} disabled={isProcessingAi}>
                                    <Maximize className="mr-2 h-4 w-4" /> Expand
                                </Button>
                                <Button variant="ghost" className="justify-start" onClick={() => handleAiAction('Rewrite this to sound more professional.')} disabled={isProcessingAi}>
                                    <PenLine className="mr-2 h-4 w-4" /> Rewrite
                                </Button>
                                <Button variant="ghost" className="justify-start" onClick={() => handleAiAction('Correct any grammar and spelling mistakes in this text. Do not change the meaning or style.')} disabled={isProcessingAi}>
                                    <SpellCheck className="mr-2 h-4 w-4" /> Check Grammar
                                </Button>

                                <p className="p-2 text-xs font-semibold text-muted-foreground pt-2 border-t mt-1">Markdown Tools</p>
                                
                                <Button variant="ghost" className="justify-start" onClick={handleCopy}>
                                    <Copy className="mr-2 h-4 w-4" /> Copy
                                </Button>

                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="ghost" className="justify-start" onClick={handleViewAst}>
                                            <Braces className="mr-2 h-4 w-4" /> View AST
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl">
                                        <DialogHeader>
                                            <DialogTitle>Markdown AST (JSON)</DialogTitle>
                                        </DialogHeader>
                                        <pre className="mt-2 h-[450px] w-full overflow-auto rounded-md bg-muted p-4">
                                            <code className="text-muted-foreground text-xs">
                                                {ast ? JSON.stringify(ast, null, 2) : 'Loading...'}
                                            </code>
                                        </pre>
                                    </DialogContent>
                                </Dialog>

                                <p className="p-2 text-xs font-semibold text-muted-foreground pt-2 border-t mt-1">Destructive</p>
                                <Button variant="ghost" className="justify-start text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleDelete}>
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
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
                            <CardTitle className="flex items-center gap-2 font-headline text-lg"><Pin className="h-5 w-5 text-primary" /> Objective</CardTitle>
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
                            <CardTitle className="flex items-center gap-2 font-headline text-lg"><Briefcase className="h-5 w-5 text-primary" /> Methodology</CardTitle>
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
                            <CardTitle className="flex items-center gap-2 font-headline text-lg"><Calendar className="h-5 w-5 text-primary" /> Timeline</CardTitle>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="p-6 pt-0 space-y-4">
                                <div className="flex items-center gap-2"><strong>Start Date:</strong> <EditableField value={proposal.timeline.startDate} path="timeline.startDate" onUpdate={onUpdate} type="date" readOnly={readOnly} /></div>
                                <div className="flex items-center gap-2"><strong>End Date:</strong> <span className="text-muted-foreground">{proposal.timeline.endDate}</span></div>
                                <h4 className="font-semibold">Phases:</h4>
                                <ul className="space-y-2 text-muted-foreground">
                                    {proposal.timeline.phases.map((phase, index) => (
                                        <li key={index} className="flex justify-between items-center gap-2">
                                            <EditableField value={phase.name} path={`timeline.phases.${index}.name`} onUpdate={onUpdate} readOnly={readOnly} />
                                            <div className="flex items-center gap-1">
                                                (<EditableField value={phase.durationWeeks} path={`timeline.phases.${index}.durationWeeks`} onUpdate={onUpdate} type="number" className="w-16 text-center" readOnly={readOnly} /> weeks)
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
                            <CardTitle className="flex items-center gap-2 font-headline text-lg"><BadgeEuro className="h-5 w-5 text-primary" /> Budget</CardTitle>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="p-6 pt-0">
                                <div className="mb-4 flex gap-2 items-center">
                                    <strong>Total:</strong>
                                    <span className="text-muted-foreground">{proposal.budget.totalAmount.toLocaleString()}</span>
                                    <EditableField value={proposal.budget.currency} path="budget.currency" onUpdate={onUpdate} className="w-20" readOnly={readOnly} />
                                </div>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Item</TableHead>
                                            <TableHead className="text-left">Cost</TableHead>
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
                            <CardTitle className="flex items-center gap-2 font-headline text-lg"><Flag className="h-5 w-5 text-primary" /> Expected Outcomes</CardTitle>
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
                            <CardTitle className="flex items-center gap-2 font-headline text-lg"><CheckCircle className="h-5 w-5 text-primary" /> Success Criteria & Evaluation</CardTitle>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="p-6 pt-0 space-y-4">
                                <h4 className="font-semibold">Criteria:</h4>
                                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                                    {proposal.success_criteria.map((criterion, index) => (
                                        <li key={index}><EditableField value={criterion} path={`success_criteria.${index}`} onUpdate={onUpdate} multiline readOnly={readOnly} /></li>
                                    ))}
                                </ul>
                                <h4 className="font-semibold pt-4 border-t">Evaluation Plan:</h4>
                                <EditableField value={proposal.evaluation} path="evaluation" onUpdate={onUpdate} multiline readOnly={readOnly} />
                            </div>
                        </AccordionContent>
                    </Card>
                </AccordionItem>

                <AccordionItem value="Stakeholders" className="border-b-0">
                    <Card>
                        <AccordionTrigger className="w-full text-left p-6 hover:no-underline">
                            <CardTitle className="flex items-center gap-2 font-headline text-lg"><Users className="h-5 w-5 text-primary" /> Stakeholders</CardTitle>
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
                            <CardTitle className="flex items-center gap-2 font-headline text-lg"><ShieldAlert className="h-5 w-5 text-primary" /> Risks & Mitigations</CardTitle>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="p-6 pt-0">
                                {proposal.risks.map((risk, index) => (
                                    <div key={index} className="mb-4 not-last:border-b not-last:pb-4">
                                        <div><strong>Risk:</strong> <EditableField value={risk.description} path={`risks.${index}.description`} onUpdate={onUpdate} multiline readOnly={readOnly} /></div>
                                        <div><strong>Mitigation:</strong> <EditableField value={risk.mitigation} path={`risks.${index}.mitigation`} onUpdate={onUpdate} multiline readOnly={readOnly} /></div>
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
